import React, { useState, useEffect, useRef } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import { readingPassages } from '../../data/content.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function fmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return m + ':' + sec
}

export default function Reading({ onFinish, isSingle }) {
  const { t, lang } = useLang()
  const [passage] = useState(() => shuffle(readingPassages)[0])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const timerRef = useRef(null)

  useEffect(() => {
    if (submitted) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [submitted])

  const timeColor = timeLeft < 60 ? '#f87171' : timeLeft < 120 ? '#f59e0b' : '#22d3ee'

  const score = submitted ? (() => {
    let correct = 0
    passage.questions.forEach((q, i) => { if (answers[i] === q.answer) correct++ })
    return Math.round((correct / passage.questions.length) * 100)
  })() : 0

  const submit = () => setSubmitted(true)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>
          📖 {t('read_title')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>{t('read_subtitle')}</p>
        {!submitted && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
            <span style={{
              color: timeColor, fontWeight: 700, fontSize: '0.9rem',
              background: timeColor + '18', borderRadius: 8, padding: '4px 14px',
              transition: 'color 0.5s',
            }}>
              ⏱ {fmtTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Passage */}
      <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📄</div>
          <div>
            <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('read_passage')} — {passage.category}</div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{passage.title}</h2>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: 1.8 }}>{passage.text}</p>
      </div>

      {/* Questions */}
      <div>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>📝 {t('read_questions')}</h3>
        {passage.questions.map((q, qi) => (
          <div key={qi} style={{
            background: submitted && answers[qi] === q.answer ? 'rgba(16,185,129,0.08)' : submitted ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
            border: '1px solid ' + (submitted && answers[qi] === q.answer ? 'rgba(16,185,129,0.3)' : submitted ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'),
            borderRadius: 14, padding: '1.25rem', marginBottom: '1rem',
          }}>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.9rem' }}>{qi + 1}. {q.q}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.5rem' }}>
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))} style={{
                  background: submitted && oi === q.answer ? 'rgba(16,185,129,0.25)' : submitted && answers[qi] === oi && oi !== q.answer ? 'rgba(239,68,68,0.25)' : answers[qi] === oi ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.06)',
                  border: '1px solid ' + (submitted && oi === q.answer ? 'rgba(16,185,129,0.5)' : submitted && answers[qi] === oi && oi !== q.answer ? 'rgba(239,68,68,0.5)' : answers[qi] === oi ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.12)'),
                  color: '#fff', borderRadius: 9, padding: '9px 14px', textAlign: 'left',
                  fontSize: '0.88rem', cursor: submitted ? 'default' : 'pointer',
                  fontWeight: answers[qi] === oi ? 600 : 400, transition: 'all 0.2s',
                }}>
                  {submitted && oi === q.answer ? '✅ ' : submitted && answers[qi] === oi && oi !== q.answer ? '❌ ' : ''}{opt}
                </button>
              ))}
            </div>
            {submitted && answers[qi] !== q.answer && (
              <p style={{ color: '#6ee7b7', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                ✅ Correct: <strong>{q.options[q.answer]}</strong>
              </p>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={submit} disabled={Object.keys(answers).length < passage.questions.length} className={Object.keys(answers).length >= passage.questions.length ? 'btn-primary' : ''} style={{
            background: Object.keys(answers).length >= passage.questions.length ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.1)',
            color: '#fff', border: 'none', borderRadius: 12, padding: '13px 32px',
            fontSize: '0.95rem', fontWeight: 700,
            cursor: Object.keys(answers).length >= passage.questions.length ? 'pointer' : 'default',
          }}>{t('read_submit')}</button>
          {Object.keys(answers).length < passage.questions.length && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginTop: 8 }}>
              Answer all {passage.questions.length} questions to submit.
            </p>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem', display: 'inline-block' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: 4 }}>Your Reading Score</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: score >= 70 ? '#22d3ee' : score >= 50 ? '#f59e0b' : '#f87171' }}>
              {score}<span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.4)' }}>/100</span>
            </div>
          </div>
          <br />
          <button onClick={() => onFinish(score)} className="btn-primary" style={{
            background: 'linear-gradient(135deg,#2563eb,#0ea5e9)', color: '#fff', border: 'none',
            borderRadius: 12, padding: '13px 32px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
          }}>{ isSingle ? (lang === 'ar' ? 'عرض نتيجتي' : 'View My Results') : 'View Your Results'} →</button>
        </div>
      )}
    </div>
  )
}
