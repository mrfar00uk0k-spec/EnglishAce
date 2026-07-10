import React, { useState, useEffect } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import { useLexi } from '../../contexts/LexiContext.jsx'
import { LexiAnalyzing } from '../../components/LexiWidget.jsx'
import AssessmentFeedback from '../../components/AssessmentFeedback.jsx'
import { fetchWritingPrompt, friendlyError } from '../../utils/questionsApi.js'
import { IconPencil, IconRefresh } from '../../components/Icons.jsx'

// ── localStorage helpers ───────────────────────────────────────────
const ATTEMPT_KEY = 'englishace_writing_attempts'
const RECENT_KEY  = 'englishace_writing_recent'

function getAttemptCount() {
  try { return Number(localStorage.getItem(ATTEMPT_KEY) || 0) } catch { return 0 }
}
function getRecentKeys() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function recordAttempt(promptKey) {
  try {
    localStorage.setItem(ATTEMPT_KEY, String(getAttemptCount() + 1))
    const updated = [promptKey, ...getRecentKeys()].slice(0, 5)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }
}

// ── API ────────────────────────────────────────────────────────────
async function submitWriting(question, text) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode:       'writing',
      question:   question.trim(),
      transcript: text.trim(),   // backend expects "transcript" field
    }),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'API_ERROR')
  if (!data.result || typeof data.result !== 'object') throw new Error('Invalid API response')
  return data.result
}

// ── Sanitise result coming from backend ───────────────────────────
// Ensures every field the UI reads is the correct type.
function sanitiseResult(r) {
  const toNum   = (v, fb = 0) => { const n = Number(v); return Number.isFinite(n) ? Math.round(Math.max(0, Math.min(100, n))) : fb }
  const toArr = (v) => {
    if (!Array.isArray(v)) {
      if (typeof v === 'string' && v.trim()) return [v.trim()]
      return []
    }
    return v.map(i => {
      if (typeof i === 'string') return i.trim()
      if (typeof i === 'object' && i !== null) {
        // Handle {original, corrected, reason} or {error, correction} shapes
        const o = i.original || i.error || i.wrong || ''
        const c = i.corrected || i.correction || i.correct || ''
        const r = i.reason || i.explanation || ''
        if (o && c) return `${o} → ${c}${r ? ' (' + r + ')' : ''}`
        return Object.values(i).filter(Boolean).join(' — ')
      }
      return String(i).trim()
    }).filter(Boolean)
  }
  const toStr   = (v) => (typeof v === 'string' ? v.trim() : '')

  const grammar       = toNum(r.grammar_score)
  const vocabulary    = toNum(r.vocabulary_score)
  const structure     = toNum(r.structure_score)
  const clarity       = toNum(r.clarity_score)
  const coherence     = toNum(r.coherence_score)
  const task_response = toNum(r.task_response_score)

  // Derive overall only when backend omitted the field (null/undefined), not when it legitimately sent 0
  let overall = (r.overall_score == null) ? null : toNum(r.overall_score)
  if (overall === null) {
    const sum = grammar + vocabulary + structure + clarity + coherence + task_response
    overall = sum > 0 ? Math.round(sum / 6) : 0
  }

  return {
    grammar_score:       grammar,
    vocabulary_score:    vocabulary,
    structure_score:     structure,
    clarity_score:       clarity,
    coherence_score:     coherence,
    task_response_score: task_response,
    overall_score:       overall,
    level:               toStr(r.level) || 'A1',
    strengths:           toArr(r.strengths),
    weaknesses:          toArr(r.weaknesses),
    mistakes:            toArr(r.mistakes),
    corrected_answer:    toStr(r.corrected_answer),
    tips:                toArr(r.tips),
  }
}

// ── Component ──────────────────────────────────────────────────────
export default function Writing({ onFinish, isSingle }) {
  const { t, lang } = useLang()
  const { showLexi } = useLexi()
  const [prompt, setPrompt]     = useState(null)
  const [promptError, setPromptError] = useState('')
  const [text,      setText]    = useState('')
  const [phase,     setPhase]   = useState('writing')
  const [feedback,  setFeedback]= useState(null)
  const [errMsg,    setErrMsg]  = useState('')

  useEffect(() => {
    let cancelled = false
    fetchWritingPrompt(getAttemptCount(), getRecentKeys())
      .then(p => { if (!cancelled) setPrompt(p) })
      .catch(err => { if (!cancelled) setPromptError(friendlyError(err, lang)) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0
  const [pasteWarning, setPasteWarning] = useState(false)

  // Fix #8: Prevent paste
  const handlePaste = (e) => {
    e.preventDefault()
    setPasteWarning(true)
    setTimeout(() => setPasteWarning(false), 3500)
  }

  const handleSubmit = async () => {
    if (wordCount === 0) return
    setPhase('analyzing')
    setErrMsg('')
    try {
      const raw    = await submitWriting(prompt.en, text)
      const result = sanitiseResult(raw)
      setFeedback(result)
      recordAttempt(prompt.key)
      setPhase('feedback')
      showLexi({ type: 'writing', overall: result.overall_score, level: result.level, strengths: result.strengths, weaknesses: result.weaknesses, mistakes: result.mistakes, tips: result.tips })
    } catch (e) {
      console.error('[Writing] evaluation error:', e.message)
      setErrMsg(e.message || 'AI service unavailable.')
      setPhase('unavailable')
    }
  }

  const sc = v => v >= 70 ? '#22d3ee' : v >= 50 ? '#f59e0b' : '#f87171'

  // ── LOADING / ERROR GATE — prompt must be available before rendering ───────
  if (!prompt && !promptError) {
    return (
      <div style={{ maxWidth:700, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <div style={{ width:40, height:40, margin:'0 auto 1rem', border:'3px solid rgba(16,185,129,0.2)', borderTopColor:'#10b981', borderRadius:'50%', animation:'wspin 0.8s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.88rem' }}>{lang === 'ar' ? 'جارٍ تحميل الموضوع…' : 'Loading prompt…'}</p>
        <style>{`@keyframes wspin { to { transform:rotate(360deg) } }`}</style>
      </div>
    )
  }
  if (promptError) {
    return (
      <div style={{ maxWidth:500, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.95rem', marginBottom:'1.25rem' }}>{promptError}</p>
        <button onClick={() => { setPromptError(''); fetchWritingPrompt(getAttemptCount(), getRecentKeys()).then(setPrompt).catch(e => setPromptError(friendlyError(e, lang))) }} style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:11, padding:'11px 28px', fontSize:'0.92rem', fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
          <IconRefresh size={15} color="#fff" /> {lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, fontFamily: 'Playfair Display,serif', marginBottom: '0.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <IconPencil size={22} color="#10b981" />
            {t('writing_title')}
          </span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>{t('writing_subtitle')}</p>
      </div>

      {/* Prompt card */}
      <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.14),rgba(37,99,235,0.08))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>{t('writing_prompt')}</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', fontFamily: 'Playfair Display,serif' }}>{prompt.title || ''}</h2>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>{lang === 'ar' ? prompt.ar : prompt.en}</p>
      </div>

      {/* WRITING */}
      {phase === 'writing' && (
        <div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onPaste={handlePaste}
            onDrop={e => { e.preventDefault(); setPasteWarning(true); setTimeout(()=>setPasteWarning(false),3500) }}
            placeholder={t('writing_placeholder')}
            rows={10}
            style={{ width: '100%', background:'rgba(255,255,255,0.04)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '1rem', color: '#fff', fontSize: '0.95rem', lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
          {pasteWarning && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', marginTop:8, color:'#fca5a5', fontSize:'0.83rem' }}>
              ⚠️ Pasting is disabled. Please type your answer to get accurate results.
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>{wordCount} {t('writing_words')}</span>
            <button
              onClick={handleSubmit}
              disabled={wordCount < 5}
              style={{ background: wordCount >= 5 ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(16,185,129,0.25)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: '0.95rem', fontWeight: 700, cursor: wordCount >= 5 ? 'pointer' : 'not-allowed', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <IconPencil size={15} color="currentColor" />
              {t('writing_submit')}
            </button>
          </div>
        </div>
      )}

      {/* ANALYZING */}
      {phase === 'analyzing' && (
        <LexiAnalyzing message="Analyzing your English writing quality..." />
      )}

      {/* UNAVAILABLE */}
      {phase === 'unavailable' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ background:'rgba(239,68,68,0.1)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '2rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{t('writing_unavailable')}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{errMsg || 'Check your Groq API key and try again.'}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setPhase('writing')} style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
            <button onClick={() => onFinish(0)} style={{ background:'rgba(37,99,235,0.3)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', color: '#fff', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Skip →</button>
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {phase === 'feedback' && feedback && (
        <AssessmentFeedback
          assessmentType="writing"
          overallScore={feedback.overall_score}
          level={feedback.level}
          grammarScore={feedback.grammar_score}
          vocabularyScore={feedback.vocabulary_score}
          structureScore={feedback.structure_score}
          clarityScore={feedback.clarity_score}
          coherenceScore={feedback.coherence_score}
          taskResponseScore={feedback.task_response_score}
          strengths={feedback.strengths || []}
          weaknesses={feedback.weaknesses || []}
          mistakes={feedback.mistakes || []}
          correctedAnswer={feedback.corrected_answer}
          tips={feedback.tips || []}
          onNext={() => onFinish(feedback.overall_score || 0)}
          isSingle={isSingle}
          lang={lang}
          nextLabel={t('writing_next') + ' →'}
        />
      )}
    </div>
  )
}