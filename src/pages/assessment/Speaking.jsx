import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import { useLexi } from '../../contexts/LexiContext.jsx'
import { LexiAnalyzing, LexiFeedbackHeader } from '../../components/LexiWidget.jsx'
import { speakingTopics } from '../../data/content.js'

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

async function uploadAudioForTranscript(audioBlob) {
  const formData = new FormData()
  const ext = audioBlob.type.includes('ogg')
    ? 'ogg'
    : audioBlob.type.includes('mp4')
      ? 'mp4'
      : 'webm'

  formData.append('audio', audioBlob, `recording.${ext}`)

  const res = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Transcription failed')
  return (data.transcript || '').trim()
}

async function evaluateWithAI(topic, transcript) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'speaking', question: topic, transcript }),
  })

  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Evaluation failed')
  return data.result
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Speaking({ onFinish, isSingle }) {
  const { t, lang } = useLang()
  const { showLexi } = useLexi()

  const [topic] = useState(() =>
    speakingTopics[Math.floor(Math.random() * speakingTopics.length)]
  )
  const [phase, setPhase] = useState('ready') // ready|countdown|recording|transcribing|analyzing|feedback|unavailable
  const [countdown, setCountdown] = useState(3)
  const [timer, setTimer] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [transcript, setTranscript] = useState('')

  const isStoppedRef = useRef(false)
  const isSubmittedRef = useRef(false)
  const mediaStreamRef = useRef(null)
  const mediaRecRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const readyTimerRef = useRef(null)

  useEffect(() => {
    return () => cleanupAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function cleanupAll() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (readyTimerRef.current) {
      clearTimeout(readyTimerRef.current)
      readyTimerRef.current = null
    }
    if (mediaRecRef.current && mediaRecRef.current.state !== 'inactive') {
      try { mediaRecRef.current.stop() } catch (_) {}
    }
    mediaRecRef.current = null

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
  }

  const startCountdown = () => {
    setPhase('countdown')
    setCountdown(3)

    let c = 3
    const id = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) {
        clearInterval(id)
        startRecording()
      }
    }, 1000)
  }

  const startRecording = async () => {
    isStoppedRef.current = false
    isSubmittedRef.current = false
    audioChunksRef.current = []
    setTranscript('')
    setErrMsg('')
    setLiveReset()

    setTimer(0)
    setIsReady(false)
    setPhase('recording')

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (e) {
      setErrMsg('Microphone access denied. Please allow microphone and try again.')
      setPhase('unavailable')
      return
    }

    mediaStreamRef.current = stream

    if (!window.MediaRecorder) {
      setErrMsg('Recording is not supported in this browser.')
      setPhase('unavailable')
      return
    }

    let mimeType = 'audio/webm'
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg'
      else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4'
      else mimeType = ''
    }

    try {
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      mr.start(250)
      mediaRecRef.current = mr
    } catch (e) {
      console.warn('[MediaRecorder] failed to start:', e.message)
      setErrMsg('Recording could not start. Please try again.')
      setPhase('unavailable')
      return
    }

    timerRef.current = setInterval(() => setTimer(s => s + 1), 1000)
    readyTimerRef.current = setTimeout(() => setIsReady(true), 1500)
  }

  const setLiveReset = () => {
    // intentionally empty placeholder for future live transcript UI
  }

  const handleStop = useCallback(async () => {
    if (isStoppedRef.current) return
    isStoppedRef.current = true

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (readyTimerRef.current) {
      clearTimeout(readyTimerRef.current)
      readyTimerRef.current = null
    }

    setPhase('transcribing')

    let audioBlob = null
    const mr = mediaRecRef.current

    try {
      if (mr && mr.state !== 'inactive') {
        audioBlob = await new Promise((resolve) => {
          mr.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' })
            resolve(blob.size > 0 ? blob : null)
          }
          try {
            mr.stop()
          } catch (_) {
            resolve(null)
          }
        })
      } else if (audioChunksRef.current.length > 0) {
        audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      }
    } catch (_) {
      audioBlob = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }

    if (isSubmittedRef.current) return
    isSubmittedRef.current = true

const hasRealAudio = audioBlob &&
  audioBlob.size > 1500 &&
  audioChunksRef.current.length >= 4

if (!hasRealAudio) {
  setErrMsg('No speech detected. Please try speaking clearly into your microphone.')
  setPhase('unavailable')
  return
}

    try {
      const spokenText = await uploadAudioForTranscript(audioBlob)
      if (!spokenText || spokenText.trim().split(/\s+/).filter(Boolean).length < 3) {
        setErrMsg('Transcription was too short. Please speak a little longer and try again.')
        setPhase('unavailable')
        return
      }

      setTranscript(spokenText)
      setPhase('analyzing')

      const topicContext = `${topic.en}: ${topic.prompt}`
      const result = await evaluateWithAI(topicContext, spokenText)

      setFeedback(result)
      setPhase('feedback')

      showLexi({
        type: 'speaking',
        overall: result.overall_score,
        level: result.level,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        mistakes: result.mistakes,
        tips: result.tips,
      })
    } catch (e) {
      console.error('[Speaking] AI/transcription error:', e.message)
      setErrMsg(e.message || 'AI service unavailable.')
      setPhase('unavailable')
    }
  }, [showLexi, topic])

  const sc = v => v >= 70 ? '#22d3ee' : v >= 50 ? '#f59e0b' : '#f87171'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, fontFamily: 'Playfair Display,serif', marginBottom: '0.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            {t('speak_title')}
          </span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>{t('speak_subtitle')}</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(37,99,235,0.1))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, padding: '1.75rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#c4b5fd', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('speak_topic')}</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>{lang === 'ar' ? topic.ar : topic.en}</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.65 }}>{topic.prompt}</p>
      </div>

      {phase === 'ready' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            💡 Take a moment to think, then click to start speaking.
          </p>
          <button
            onClick={startCountdown}
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(124,58,237,0.4)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 8, verticalAlign: 'middle' }}>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            </svg>
            {t('speak_record')}
          </button>
        </div>
      )}

      {phase === 'countdown' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>Get ready...</p>
          <div style={{ width: 100, height: 100, borderRadius: '50%', margin: '0 auto', background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800, color: '#fff' }}>
            {countdown}
          </div>
        </div>
      )}

      {phase === 'recording' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem', background: 'rgba(124,58,237,0.2)', border: '3px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'speakPulse 1.2s ease-in-out infinite' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
            </svg>
          </div>
          <div style={{ color: isReady ? '#a78bfa' : '#f59e0b', fontWeight: 700, marginBottom: 4 }}>
            {isReady ? '● Recording...' : '⏳ Warming up...'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '0.75rem 0' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  borderRadius: 2,
                  background: isReady ? '#8b5cf6' : '#f59e0b',
                  animation: isReady ? `wave 1s ease-in-out ${i * 0.08}s infinite alternate` : 'none',
                  height: isReady ? 20 : 6,
                  transition: 'height 0.3s',
                }}
              />
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem', margin: '0.75rem 0 1.25rem', minHeight: 55, textAlign: 'left', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.6, maxHeight: 120, overflowY: 'auto' }}>
            Your speech is being recorded now. The transcript will appear after you stop.
          </div>

          <button
            onClick={handleStop}
            disabled={!isReady}
            style={{
              background: isReady ? '#7c3aed' : 'rgba(124,58,237,0.3)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isReady ? 'pointer' : 'not-allowed',
              transition: 'all 0.4s',
            }}
          >
            {isReady ? '⏹ ' + t('speak_stop') : '⏳ Getting ready...'}
          </button>
        </div>
      )}

      {phase === 'transcribing' && (
        <LexiAnalyzing message="Transcribing your recording..." />
      )}

      {phase === 'analyzing' && (
        <LexiAnalyzing message="Analyzing your English speaking quality..." />
      )}

      {phase === 'unavailable' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '2rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{t('speak_unavailable')}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{errMsg || 'Check your microphone permissions and API key.'}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => {
                cleanupAll()
                isStoppedRef.current = false
                isSubmittedRef.current = false
                audioChunksRef.current = []
                setTranscript('')
                setErrMsg('')
                setFeedback(null)
                setPhase('ready')
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10,
                padding: '10px 24px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => onFinish(0)}
              style={{
                background: 'rgba(37,99,235,0.3)',
                color: '#fff',
                border: '1px solid rgba(37,99,235,0.4)',
                borderRadius: 10,
                padding: '10px 24px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Skip →
            </button>
          </div>
        </div>
      )}

      {phase === 'feedback' && feedback && (
        <div style={{ animation: 'pageIn 0.4s ease' }}>
          <LexiFeedbackHeader testType="speaking" />

          {transcript && (
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>Transcript</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                {transcript}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              ['Professionalism', feedback.professionalism_score],
              ['Fluency', feedback.fluency_score],
              ['Grammar', feedback.grammar_score],
              ['Vocabulary', feedback.vocabulary_score],
              ['Confidence', feedback.confidence_score],
              ['Communication', feedback.communication_score],
            ].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '0.9rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: sc(v || 0) }}>{v ?? 0}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Overall</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: sc(feedback.overall_score || 0), fontFamily: 'Playfair Display,serif' }}>
                {feedback.overall_score ?? 0}<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.35)' }}>/100</span>
              </div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 4 }}>Level</div>
              <div style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.5)', borderRadius: 10, padding: '6px 16px', fontSize: '1.3rem', fontWeight: 800, color: '#c4b5fd' }}>
                {feedback.level || 'N/A'}
              </div>
            </div>
          </div>

          {feedback.strengths?.length > 0 && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>✅ Strengths</div>
              {feedback.strengths.map((s, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>• {s}</div>)}
            </div>
          )}

          {feedback.weaknesses?.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>📝 Areas to Improve</div>
              {feedback.weaknesses.map((w, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>• {w}</div>)}
            </div>
          )}

          {feedback.mistakes?.length > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#fcd34d', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>⚠️ Mistakes</div>
              {feedback.mistakes.map((m, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>• {m}</div>)}
            </div>
          )}

          {feedback.corrected_answer && (
            <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>✅ Better Version</div>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', lineHeight: 1.65, fontStyle: 'italic' }}>{feedback.corrected_answer}</p>
            </div>
          )}

          {feedback.tips?.length > 0 && (
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>💡 Tips</div>
              {feedback.tips.map((tip, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>{i + 1}. {tip}</div>)}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => onFinish(feedback.overall_score || 0)}
              style={{
                background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '13px 32px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isSingle ? (lang === 'ar' ? 'عرض نتيجتي' : 'View My Results') : t('speak_next')} →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wave { from { height: 6px } to { height: 28px } }
        @keyframes speakPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.4) } 50% { box-shadow: 0 0 0 16px rgba(139,92,246,0) } }
      `}</style>
    </div>
  )
}
