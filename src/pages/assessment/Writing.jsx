import React, { useState } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import { useLexi } from '../../contexts/LexiContext.jsx'
import { LexiAnalyzing, LexiFeedbackHeader } from '../../components/LexiWidget.jsx'
import { getNextWritingPrompt } from '../../data/content.js'

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
  const [prompt]   = useState(() => getNextWritingPrompt(getAttemptCount(), getRecentKeys()))
  const [text,      setText]    = useState('')
  const [phase,     setPhase]   = useState('writing')
  const [feedback,  setFeedback]= useState(null)
  const [errMsg,    setErrMsg]  = useState('')

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0

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

  const tierBadge = {
    easy:   { label: lang === 'ar' ? 'سهل'   : 'Easy',   color: '#34d399' },
    medium: { label: lang === 'ar' ? 'متوسط' : 'Medium', color: '#f59e0b' },
    hard:   { label: lang === 'ar' ? 'صعب'   : 'Hard',   color: '#f87171' },
  }[prompt.tier] || { label: 'Easy', color: '#34d399' }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, fontFamily: 'Playfair Display,serif', marginBottom: '0.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {t('writing_title')}
          </span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>{t('writing_subtitle')}</p>
      </div>

      {/* Prompt card */}
      <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.14),rgba(37,99,235,0.08))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('writing_prompt')}</div>
          <span style={{ background: tierBadge.color + '22', color: tierBadge.color, border: '1px solid ' + tierBadge.color + '55', borderRadius: 8, padding: '3px 12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tierBadge.label}</span>
        </div>
        <p style={{ fontSize: '1.08rem', fontWeight: 600, lineHeight: 1.65 }}>{lang === 'ar' ? prompt.ar : prompt.en}</p>
      </div>

      {/* WRITING */}
      {phase === 'writing' && (
        <div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t('writing_placeholder')}
            rows={10}
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '1rem', color: '#fff', fontSize: '0.95rem', lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>{wordCount} {t('writing_words')}</span>
            <button
              onClick={handleSubmit} disabled={text.trim().split(/\s+/).filter(Boolean).length < 5}
              disabled={wordCount === 0}
              style={{ background: wordCount > 0 ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(16,185,129,0.25)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: '0.95rem', fontWeight: 700, cursor: wordCount > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
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
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '2rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{t('writing_unavailable')}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{errMsg || 'Check your Groq API key and try again.'}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setPhase('writing')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
            <button onClick={() => onFinish(0)} style={{ background: 'rgba(37,99,235,0.3)', color: '#fff', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Skip →</button>
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {phase === 'feedback' && feedback && (
        <div style={{ animation: 'pageIn 0.4s ease' }}>
          <LexiFeedbackHeader testType="writing" />

          {/* Score cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              ['Grammar',       feedback.grammar_score],
              ['Vocabulary',    feedback.vocabulary_score],
              ['Structure',     feedback.structure_score],
              ['Clarity',       feedback.clarity_score],
              ['Coherence',     feedback.coherence_score],
              ['Task Response', feedback.task_response_score],
            ].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '0.9rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: sc(v || 0) }}>{v ?? 0}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Overall + level */}
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Overall</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: sc(feedback.overall_score || 0), fontFamily: 'Playfair Display,serif' }}>
                {feedback.overall_score ?? 0}<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.35)' }}>/100</span>
              </div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 4 }}>Level</div>
              <div style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.5)', borderRadius: 10, padding: '6px 16px', fontSize: '1.3rem', fontWeight: 800, color: '#6ee7b7' }}>
                {feedback.level || 'N/A'}
              </div>
            </div>
          </div>

          {/* Strengths */}
          {feedback.strengths.length > 0 && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>✅ Strengths</div>
              {feedback.strengths.map((s, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>• {s}</div>)}
            </div>
          )}

          {/* Weaknesses */}
          {feedback.weaknesses.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>📝 Areas to Improve</div>
              {feedback.weaknesses.map((w, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>• {w}</div>)}
            </div>
          )}

          {/* Mistakes — only shown if the AI found real ones */}
          {feedback.mistakes.length > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#fcd34d', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>⚠️ Language Mistakes</div>
              {feedback.mistakes.map((m, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>• {m}</div>)}
            </div>
          )}

          {/* Corrected answer */}
          {feedback.corrected_answer && (
            <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>✅ Improved Version</div>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>{feedback.corrected_answer}</p>
            </div>
          )}

          {/* Tips */}
          {feedback.tips.length > 0 && (
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>💡 Tips</div>
              {feedback.tips.map((tip, i) => <div key={i} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 3 }}>{i + 1}. {tip}</div>)}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => onFinish(feedback.overall_score || 0)}
              style={{ background: 'linear-gradient(135deg,#2563eb,#0ea5e9)', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 32px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {isSingle ? (lang === 'ar' ? 'عرض نتيجتي' : 'View My Results') : t('writing_next')} →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
