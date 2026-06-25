import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import { useLexi } from '../../contexts/LexiContext.jsx'
import { LexiAnalyzing, LexiFeedbackHeader } from '../../components/LexiWidget.jsx'
import { hrQuestions } from '../../data/content.js'

const MAX_RECORD_SECS = 120

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

async function uploadAudioForTranscript(audioBlob) {
  const formData = new FormData()
  const ext = audioBlob.type.includes('ogg') ? 'ogg'
    : audioBlob.type.includes('mp4') ? 'mp4' : 'webm'
  formData.append('audio', audioBlob, `hr-recording.${ext}`)
  const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Transcription failed')
  return (data.transcript || '').trim()
}

async function evaluateWithAI(question, transcript) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'hr', question, transcript }),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Evaluation failed')
  if (!data.result || typeof data.result !== 'object') throw new Error('Invalid API response')
  return data.result
}

// ─────────────────────────────────────────────────────────────────────────────
// SpeechRecognition — live display + fallback transcript
// ─────────────────────────────────────────────────────────────────────────────

function buildSRFallback(onPartialUpdate, onFinalToken) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return null
  const rec = new SR()
  rec.continuous = true
  rec.interimResults = true
  rec.lang = 'en-US'
  rec.maxAlternatives = 1
  let finalText = ''
  let stopped = false

  rec.onresult = (e) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        finalText += e.results[i][0].transcript + ' '
        onFinalToken(finalText)
      } else {
        interim = e.results[i][0].transcript
      }
    }
    onPartialUpdate(finalText + interim)
  }
  rec.onend = () => { if (!stopped) { try { rec.start() } catch (_) {} } }
  rec.onerror = (e) => { if (e.error === 'no-speech' || e.error === 'aborted') return; console.warn('[HR SR]', e.error) }

  return {
    start: () => { stopped = false; try { rec.start() } catch (_) {} },
    stop:  () => { stopped = true;  try { rec.stop()  } catch (_) {} },
    getText: () => finalText.trim(),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sanitise result — guarantee correct types for every field
// ─────────────────────────────────────────────────────────────────────────────

function sanitiseHRResult(r) {
  const toNum = (v) => { const n = Number(v); return Number.isFinite(n) ? Math.round(Math.max(0, Math.min(100, n))) : 0 }
  const toArr = (v) => {
    if (!Array.isArray(v)) {
      if (typeof v === 'string' && v.trim()) return [v.trim()]
      return []
    }
    return v.map(i => {
      if (typeof i === 'string') return i.trim()
      if (typeof i === 'object' && i !== null) {
        const o = i.original || i.error || i.wrong || ''
        const corr = i.corrected || i.correction || i.correct || ''
        const r = i.reason || i.explanation || ''
        if (o && corr) return `${o} → ${corr}${r ? ' (' + r + ')' : ''}`
        return Object.values(i).filter(Boolean).join(' — ')
      }
      return String(i).trim()
    }).filter(Boolean)
  }
  const toStr = (v) => typeof v === 'string' ? v.trim() : ''

  const prof  = toNum(r.professionalism_score)
  const flu   = toNum(r.fluency_score)
  const gram  = toNum(r.grammar_score)
  const vocab = toNum(r.vocabulary_score)
  const conf  = toNum(r.confidence_score)
  const comm  = toNum(r.communication_score)
  let overall = toNum(r.overall_score)
  if (overall === 0 && (prof + flu + gram + vocab + conf + comm) > 0) {
    overall = Math.round((prof + flu + gram + vocab + conf + comm) / 6)
  }

  // Filter fake "lack of detail" mistakes
  const rawMistakes = toArr(r.mistakes)
  const mistakes = rawMistakes.filter(m => {
    const low = m.toLowerCase()
    return !low.includes('too short') && !low.includes('lack of detail') &&
           !low.includes('not enough') && !low.includes('insufficient') &&
           !low.includes('more detail')
  })

  return {
    professionalism_score: prof,
    fluency_score:         flu,
    grammar_score:         gram,
    vocabulary_score:      vocab,
    confidence_score:      conf,
    communication_score:   comm,
    overall_score:         overall,
    level:                 toStr(r.level) || 'A1',
    strengths:             toArr(r.strengths),
    weaknesses:            toArr(r.weaknesses),
    mistakes,
    corrected_answer:      toStr(r.corrected_answer),
    tips:                  toArr(r.tips),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function HRInterview({ onFinish }) {
  const { t } = useLang()
  const { showLexi } = useLexi()

  const [qIndex,      setQIndex]     = useState(0)
  const [phase,       setPhase]      = useState('ready')
  const [countdown,   setCountdown]  = useState(3)
  const [recordSecs,  setRecordSecs] = useState(0)
  const [liveText,    setLiveText]   = useState('')
  const [feedback,    setFeedback]   = useState(null)
  const [allScores,   setAllScores]  = useState([])
  const [errMsg,      setErrMsg]     = useState('')
  const [isReady,     setIsReady]    = useState(false)

  const isStoppedRef   = useRef(false)
  const isSubmittedRef = useRef(false)
  const srTextRef      = useRef('')
  const srRef          = useRef(null)
  const mediaStreamRef = useRef(null)
  const mediaRecRef    = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef       = useRef(null)
  const readyTimerRef  = useRef(null)
  const autoStopRef    = useRef(null)

  useEffect(() => () => cleanupAll(), [])

  function cleanupAll() {
    if (timerRef.current)     { clearInterval(timerRef.current);   timerRef.current = null }
    if (readyTimerRef.current){ clearTimeout(readyTimerRef.current); readyTimerRef.current = null }
    if (autoStopRef.current)  { clearTimeout(autoStopRef.current);  autoStopRef.current = null }
    if (srRef.current)        { srRef.current.stop(); srRef.current = null }
    if (mediaRecRef.current && mediaRecRef.current.state !== 'inactive') {
      try { mediaRecRef.current.stop() } catch (_) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
  }

  // ── Countdown ───────────────────────────────────────────────────────────
  const startCountdown = () => {
    setPhase('countdown')
    setCountdown(3)
    let c = 3
    const id = setInterval(() => {
      c--; setCountdown(c)
      if (c <= 0) { clearInterval(id); startRecording() }
    }, 1000)
  }

  // ── Start recording ─────────────────────────────────────────────────────
  const startRecording = async () => {
    isStoppedRef.current   = false
    isSubmittedRef.current = false
    audioChunksRef.current = []
    srTextRef.current      = ''
    setLiveText(''); setRecordSecs(0); setIsReady(false); setPhase('recording')

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (e) {
      setErrMsg('Microphone access denied. Please allow microphone and try again.')
      setPhase('error')
      return
    }
    mediaStreamRef.current = stream

    // MediaRecorder (primary audio source for Whisper)
    let mimeType = 'audio/webm'
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : ''
    }
    try {
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.start(250)
      mediaRecRef.current = mr
    } catch (e) {
      console.warn('[HR MediaRecorder] failed:', e.message)
    }

    // SpeechRecognition — live display + fallback
   const sr = buildSRFallback(
  (partial) => setLiveText(partial),
  () => {}
)

// للعرض فقط
if (sr) {
  sr.start()
  srRef.current = sr
}

    // Timers
    timerRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000)
    readyTimerRef.current = setTimeout(() => setIsReady(true), 1500)
    autoStopRef.current = setTimeout(() => {
      if (!isStoppedRef.current) handleStop()
    }, MAX_RECORD_SECS * 1000)
  }

  // ── Stop & transcribe & evaluate ────────────────────────────────────────
  const handleStop = useCallback(async () => {
    if (isStoppedRef.current) return
    isStoppedRef.current = true

    if (timerRef.current)     { clearInterval(timerRef.current);  timerRef.current = null }
    if (readyTimerRef.current){ clearTimeout(readyTimerRef.current); readyTimerRef.current = null }
    if (autoStopRef.current)  { clearTimeout(autoStopRef.current);  autoStopRef.current = null }
    if (srRef.current)        { srRef.current.stop(); srRef.current = null }

    setPhase('transcribing')

    // Collect audio blob
    let audioBlob = null
    const mr = mediaRecRef.current
    if (mr && mr.state !== 'inactive') {
      audioBlob = await new Promise((resolve) => {
        mr.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' })
          resolve(blob.size > 0 ? blob : null)
        }
        try { mr.stop() } catch (_) { resolve(null) }
      })
    } else if (audioChunksRef.current.length > 0) {
      audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }

    if (isSubmittedRef.current) return
    isSubmittedRef.current = true

    // Transcription — Whisper primary, SR fallback
    let transcript = ''
    if (audioBlob && audioBlob.size > 1000) {
      try {
        transcript = await uploadAudioForTranscript(audioBlob)
        console.log(`[HR] Whisper transcript (${transcript.split(' ').length} words)`)
      } catch (e) {
        console.warn('[HR] Whisper failed, using SR fallback:', e.message)
      }
    }
    if (!transcript || transcript.length < 3) {
  throw new Error('Could not transcribe audio')
}

    // Evaluate
    setPhase('analyzing')
    try {
      const raw    = await evaluateWithAI(hrQuestions[qIndex], transcript)
      const result = sanitiseHRResult(raw)
      setFeedback(result)
      setAllScores(prev => [...prev, result.overall_score])
      setPhase('feedback')
      showLexi({ type: 'hr', overall: result.overall_score, level: result.level, strengths: result.strengths, weaknesses: result.weaknesses, mistakes: result.mistakes, tips: result.tips })
    } catch (e) {
      console.error('[HR] AI error:', e.message)
      setErrMsg(e.message || 'AI service unavailable.')
      setPhase('unavailable')
    }
  }, [qIndex])

  // ── Next question ────────────────────────────────────────────────────────
  const nextQuestion = () => {
    setFeedback(null); setLiveText(''); setIsReady(false); setErrMsg('')
    const nextIdx = qIndex + 1
    if (nextIdx < hrQuestions.length) {
      setQIndex(nextIdx)
      setPhase('ready')
    } else {
      const avg = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0
      onFinish(avg)
    }
  }

  const progress   = (qIndex / hrQuestions.length) * 100
  const scoreColor = v => v >= 70 ? '#22d3ee' : v >= 50 ? '#f59e0b' : '#f87171'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, fontFamily: 'Playfair Display,serif', marginBottom: '0.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {t('hr_title')}
          </span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>{t('hr_subtitle')}</p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
          <span>{t('hr_question')} {qIndex + 1} {t('hr_of')} {hrQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 6 }}>
          <div style={{ width: progress + '%', height: '100%', background: 'linear-gradient(90deg,#2563eb,#0ea5e9)', borderRadius: 4, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* Question card */}
      <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 16, padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ color: '#93c5fd', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Practice Question</div>
        <p style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{hrQuestions[qIndex]}</p>
      </div>

      {/* READY */}
      {phase === 'ready' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            💡 {t('hr_tip')}
          </p>
          <button onClick={startCountdown} style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,99,235,0.4)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            </svg>
            {t('hr_record')}
          </button>
        </div>
      )}

      {/* COUNTDOWN */}
      {phase === 'countdown' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>{t('hr_countdown')}</p>
          <div style={{ width: 100, height: 100, borderRadius: '50%', margin: '0 auto', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800, color: '#fff' }}>
            {countdown}
          </div>
        </div>
      )}

      {/* RECORDING */}
      {phase === 'recording' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem', background: 'rgba(37,99,235,0.2)', border: '3px solid #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'recPulse 1.2s ease-in-out infinite' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
            </svg>
          </div>
          <div style={{ color: isReady ? '#60a5fa' : '#f59e0b', fontWeight: 700, marginBottom: 4 }}>
            {isReady ? '● ' + t('hr_listening') : '⏳ Warming up...'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {Math.floor(recordSecs / 60).toString().padStart(2, '0')}:{(recordSecs % 60).toString().padStart(2, '0')}
            <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 6 }}>/ {Math.floor(MAX_RECORD_SECS / 60).toString().padStart(2, '0')}:{(MAX_RECORD_SECS % 60).toString().padStart(2, '0')}</span>
          
          
          </div>

          {/* Waveform */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '0.75rem 0' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ width: 4, borderRadius: 2, background: isReady ? '#2563eb' : '#f59e0b', animation: isReady ? `wave 1s ease-in-out ${i * 0.08}s infinite alternate` : 'none', height: isReady ? 20 : 6, transition: 'height 0.3s' }} />
            ))}
          </div>
          <button
  onClick={handleStop}
  disabled={!isReady}
  style={{
    background: 'linear-gradient(135deg,#dc2626,#ef4444)',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(239,68,68,0.35)'
  }}
>
  End Recording
</button>
</div>
)}
      {/* TRANSCRIBING */}
      {phase === 'transcribing' && (
        <LexiAnalyzing message="Processing your recording..." />
      )}

      {/* ANALYZING */}
      {phase === 'analyzing' && (
        <LexiAnalyzing message="Evaluating your interview answer..." />
      )}

      {/* UNAVAILABLE */}
      {phase === 'unavailable' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>{t('hr_error')}</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>{errMsg || 'Check your API key and try again.'}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { isStoppedRef.current = false; isSubmittedRef.current = false; audioChunksRef.current = []; srTextRef.current = ''; setPhase('ready') }} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
            <button onClick={nextQuestion} style={{ background: 'rgba(37,99,235,0.3)', color: '#fff', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Skip →</button>
          </div>
        </div>
      )}

      {/* ERROR (mic denied) */}
      {phase === 'error' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#fca5a5', fontWeight: 600 }}>⚠️ {errMsg}</p>
          </div>
          <button onClick={() => { setErrMsg(''); setPhase('ready') }} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
        </div>
      )}

      {/* FEEDBACK */}
      {phase === 'feedback' && feedback && (
        <div style={{ animation: 'pageIn 0.4s ease' }}>
          <LexiFeedbackHeader testType="hr" />

          {/* Score grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(125px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              ['Professionalism', feedback.professionalism_score],
              ['Fluency',         feedback.fluency_score],
              ['Grammar',         feedback.grammar_score],
              ['Vocabulary',      feedback.vocabulary_score],
              ['Confidence',      feedback.confidence_score],
              ['Communication',   feedback.communication_score],
            ].map(([label, val]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: scoreColor(val || 0) }}>{val ?? 0}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: 2 }}>{label}</div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 3, height: 4, marginTop: 8 }}>
                  <div style={{ width: (val || 0) + '%', height: '100%', background: scoreColor(val || 0), borderRadius: 3, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Overall + level */}
          <div style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.18),rgba(14,165,233,0.12))', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 14, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 2 }}>Overall Score</div>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: scoreColor(feedback.overall_score || 0), fontFamily: 'Playfair Display,serif' }}>
                {feedback.overall_score ?? 0}<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.35)' }}>/100</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 4 }}>English Level</div>
              <div style={{ background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(37,99,235,0.5)', borderRadius: 10, padding: '8px 18px', fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                {feedback.level || 'N/A'}
              </div>
            </div>
          </div>

          {feedback.strengths?.length > 0 && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>✅ Strengths</div>
              {feedback.strengths.map((s, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>• {s}</div>)}
            </div>
          )}

          {feedback.weaknesses?.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>📝 Areas to Improve</div>
              {feedback.weaknesses.map((w, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>• {w}</div>)}
            </div>
          )}

          {feedback.mistakes?.length > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#fcd34d', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>⚠️ Language Mistakes</div>
              {feedback.mistakes.map((m, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>• {m}</div>)}
            </div>
          )}

          {feedback.corrected_answer && (
            <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.22)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>✅ Professional Example Answer</div>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>{feedback.corrected_answer}</p>
            </div>
          )}

          {feedback.tips?.length > 0 && (
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>💡 Tips</div>
              {feedback.tips.map((tip, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>{i + 1}. {tip}</div>)}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button onClick={nextQuestion} style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 32px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}>
              {qIndex < hrQuestions.length - 1 ? t('hr_next') + ' →' : t('hr_finish') + ' →'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wave { from { height: 6px } to { height: 28px } }
        @keyframes recPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4) } 50% { box-shadow: 0 0 0 16px rgba(37,99,235,0) } }
      `}</style>
    </div>
  )
}
