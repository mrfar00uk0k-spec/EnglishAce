import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import { useLexi } from '../../contexts/LexiContext.jsx'
import { LexiAnalyzing } from '../../components/LexiWidget.jsx'
import AssessmentFeedback from '../../components/AssessmentFeedback.jsx'
import { saveSession, loadSession, clearSession } from '../../utils/session.js'
import { fetchSpeakingTopics, friendlyError } from '../../utils/questionsApi.js'
import { useAudioLevels } from '../../utils/useAudioLevels.js'
import { IconLightbulb } from '../../components/Icons.jsx'

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
  const { showLexi, resetLexi } = useLexi()

  // Restore an in-progress feedback session if the page was accidentally refreshed
  const saved = loadSession('speaking')

  const [topic, setTopic] = useState(saved?.topic || null)
  const [topicError, setTopicError] = useState('')
  const [phase, setPhase] = useState(saved?.feedback ? 'feedback' : 'ready') // ready|countdown|recording|transcribing|analyzing|feedback|unavailable
  const [countdown, setCountdown] = useState(3)
  const [timer, setTimer] = useState(0)
  const [feedback, setFeedback] = useState(saved?.feedback || null)
  const [isReady, setIsReady] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  // Distinguishes "you didn't say anything" from a genuine mic/browser/AI
  // failure, so the heading shown actually matches what happened (see render).
  const [isNoSpeechErr, setIsNoSpeechErr] = useState(false)
  const [transcript, setTranscript] = useState(saved?.transcript || '')

  // Fix: clear any previous test's Lexi message when entering a fresh attempt
  useEffect(() => {
    if (!saved?.feedback) resetLexi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch a topic from the backend unless we're resuming a saved session
  useEffect(() => {
    if (topic) return
    let cancelled = false
    fetchSpeakingTopics(1)
      .then(list => { if (!cancelled) setTopic(list[0]) })
      .catch(err => { if (!cancelled) setTopicError(friendlyError(err, lang)) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isStoppedRef = useRef(false)
  const isSubmittedRef = useRef(false)
  const mediaStreamRef = useRef(null)
  const mediaRecRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const readyTimerRef = useRef(null)
  // Holds the in-flight getUserMedia() promise, requested the moment the
  // countdown begins (see startCountdown) rather than after it finishes —
  // otherwise, on a first-ever visit, the browser's permission prompt itself
  // can silently eat the first words of the answer before capture starts.
  const micStreamPromiseRef = useRef(null)
  // State mirror of mediaStreamRef.current — refs alone don't trigger re-renders,
  // so this lets the real-time waveform hook react when recording starts/stops.
  const [activeStream, setActiveStream] = useState(null)
  // Real-time waveform driven by the user's actual voice (replaces the old fake CSS animation)
  const audioLevels = useAudioLevels(activeStream, 12)

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
      setActiveStream(null)
    }
  }

  const startCountdown = () => {
    setPhase('countdown')
    setCountdown(3)
    setErrMsg('')
    setIsNoSpeechErr(false)

    // Request microphone access now, while the countdown plays, so the
    // permission prompt (first-time visitors) is handled during the "get
    // ready" beat rather than eating into the recording itself.
    micStreamPromiseRef.current = navigator.mediaDevices.getUserMedia({ audio: true })

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
      // Reuses the promise kicked off when the countdown began; falls back to
      // a fresh request if this was somehow reached without it (defensive).
      stream = await (micStreamPromiseRef.current || navigator.mediaDevices.getUserMedia({ audio: true }))
    } catch (e) {
      setIsNoSpeechErr(false)
      setErrMsg('Microphone access denied. Please allow microphone and try again.')
      setPhase('unavailable')
      return
    } finally {
      micStreamPromiseRef.current = null
    }

    mediaStreamRef.current = stream
    setActiveStream(stream)

    if (!window.MediaRecorder) {
      setIsNoSpeechErr(false)
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
      setIsNoSpeechErr(false)
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
      setActiveStream(null)
    }

    if (isSubmittedRef.current) return
    isSubmittedRef.current = true

const hasRealAudio = audioBlob &&
  audioBlob.size > 2500 &&
  audioChunksRef.current.length >= 4

if (!hasRealAudio) {
  setIsNoSpeechErr(true)
  setErrMsg('No speech detected. Please try speaking clearly into your microphone.')
  setPhase('unavailable')
  return
}

    try {
      const spokenText = await uploadAudioForTranscript(audioBlob)
      if (!spokenText || spokenText.trim().split(/\s+/).filter(Boolean).length < 3) {
        setIsNoSpeechErr(true)
        setErrMsg('Transcription was too short. Please speak a little longer and try again.')
        setPhase('unavailable')
        return
      }

      setTranscript(spokenText)
      setPhase('analyzing')

      const topicContext = `${topic.en}: ${topic.prompt}`
      const result = await evaluateWithAI(topicContext, spokenText)

      setFeedback(result)
      saveSession('speaking', { feedback: result, transcript: spokenText, topic })
      setPhase('feedback')

      if (result.off_topic) {
        // Off-topic: no score, no Lexi.
        return
      }

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
      setIsNoSpeechErr(false)
      setErrMsg(e.message || 'AI service unavailable.')
      setPhase('unavailable')
    }
  }, [showLexi, topic])

  const sc = v => v >= 70 ? '#22d3ee' : v >= 50 ? '#f59e0b' : '#f87171'

  // ── LOADING / ERROR GATE — topic must be available before rendering ────────
  if (!topic && !topicError) {
    return (
      <div style={{ maxWidth:700, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <div style={{ width:40, height:40, margin:'0 auto 1rem', border:'3px solid rgba(139,92,246,0.2)', borderTopColor:'#8b5cf6', borderRadius:'50%', animation:'spspin 0.8s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.88rem' }}>{lang === 'ar' ? 'جارٍ تحميل الموضوع…' : 'Loading topic…'}</p>
        <style>{`@keyframes spspin { to { transform:rotate(360deg) } }`}</style>
      </div>
    )
  }
  if (topicError) {
    return (
      <div style={{ maxWidth:500, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.95rem', marginBottom:'1.25rem' }}>{topicError}</p>
        <button onClick={() => { setTopicError(''); fetchSpeakingTopics(1).then(l => setTopic(l[0])).catch(e => setTopicError(friendlyError(e, lang))) }} style={{ background:'linear-gradient(135deg,#8b5cf6,#7c3aed)', color:'#fff', border:'none', borderRadius:11, padding:'11px 28px', fontSize:'0.92rem', fontWeight:700, cursor:'pointer' }}>
          {lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    )
  }

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
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginBottom: '1.5rem', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
            <IconLightbulb size={14} color="rgba(255,255,255,0.5)" /> Take a moment to think, then click to start speaking.
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
          <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem', background:'rgba(124,58,237,0.2)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border: '3px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'speakPulse 1.2s ease-in-out infinite' }}>
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

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 4, margin: '0.75rem 0', height: 36 }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const level = audioLevels[i] || 0
              // Minimum height keeps bars visibly present even during silence/warm-up;
              // maximum gives the bars real room to swing for a livelier, more sensitive feel.
              const barHeight = isReady ? Math.max(6, 6 + level * 30) : 6
              return (
                <div
                  key={i}
                  style={{
                    width: 4,
                    borderRadius: 2,
                    background: isReady ? '#8b5cf6' : '#f59e0b',
                    height: barHeight,
                    transition: 'height 0.06s ease-out',
                  }}
                />
              )
            })}
          </div>

          <div style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', borderRadius: 12, padding: '1rem', margin: '0.75rem 0 1.25rem', minHeight: 55, textAlign: 'left', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.6, maxHeight: 120, overflowY: 'auto' }}>
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
          <div style={{
            background: isNoSpeechErr ? 'rgba(56,189,248,0.08)' : 'rgba(239,68,68,0.1)',
            backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)',
            border: isNoSpeechErr ? '1px solid rgba(56,189,248,0.28)' : '1px solid rgba(239,68,68,0.3)',
            borderRadius: 14, padding: '2rem', marginBottom: '1.5rem',
          }}>
            <p style={{ color: isNoSpeechErr ? '#7dd3fc' : '#fca5a5', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
              {isNoSpeechErr ? t('speak_no_speech_heading') : t('speak_unavailable')}
            </p>
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
                setIsNoSpeechErr(false)
                setFeedback(null)
                setPhase('ready')
              }}
              style={{
                background:'rgba(255,255,255,0.1)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', color: '#fff',
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
                background:'rgba(37,99,235,0.3)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', color: '#fff',
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

      {phase === 'feedback' && feedback && feedback.off_topic && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '2.5rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.4rem', marginBottom: '1rem' }}>🎯</div>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem' }}>
            Off-topic answer
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
            {feedback.off_topic_reason || 'Your answer does not address the given topic. Please try again and speak directly about the topic shown.'}
          </p>
          <button
            onClick={() => { setFeedback(null); setPhase('ready'); setTranscript(''); clearSession('speaking') }}
            style={{
              background: 'linear-gradient(135deg,#2563eb,#0ea5e9)', color: '#fff', border: 'none',
              borderRadius: 12, padding: '13px 30px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            }}
          >
            Try Again →
          </button>
        </div>
      )}

      {phase === 'feedback' && feedback && !feedback.off_topic && (
        <div>
        <AssessmentFeedback
          assessmentType="speaking"
          overallScore={feedback.overall_score}
          level={feedback.level}
          grammarScore={feedback.grammar_score}
          vocabularyScore={feedback.vocabulary_score}
          fluencyScore={feedback.fluency_score}
          pronunciationScore={feedback.pronunciation_score}
          communicationScore={feedback.communication_score}
          confidenceScore={feedback.confidence_score}
          professionalismScore={feedback.professionalism_score}
          strengths={feedback.strengths || []}
          weaknesses={feedback.weaknesses || []}
          mistakes={feedback.mistakes || []}
          pronunciationNotes={feedback.pronunciation_notes || []}
          correctedAnswer={feedback.corrected_answer}
          tips={feedback.tips || []}
          transcript={transcript}
          onNext={() => { clearSession('speaking'); onFinish(feedback.overall_score || 0) }}
          isSingle={isSingle}
          lang={lang}
          nextLabel={t('speak_next') + ' →'}
        />
        </div>
      )}

      <style>{`
        @keyframes wave { from { height: 6px } to { height: 28px } }
        @keyframes speakPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.4) } 50% { box-shadow: 0 0 0 16px rgba(139,92,246,0) } }
      `}</style>
    </div>
  )
}
