import React, { useState, useEffect, useRef } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import AssessmentFeedback from '../../components/AssessmentFeedback.jsx'
import { fetchReadingPassages, friendlyError } from '../../utils/questionsApi.js'
import { IconBookOpen, IconDocument, IconClock, IconRefresh } from '../../components/Icons.jsx'

function fmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return m + ':' + sec
}

export default function Reading({ onFinish, isSingle }) {
  const { t, lang } = useLang()
  const isAr = lang === 'ar'

  const [passage, setPassage] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const timerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetchReadingPassages(1)
      .then(list => { if (!cancelled) setPassage(list[0]) })
      .catch(err => { if (!cancelled) setLoadError(friendlyError(err, lang)) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!passage || submitted) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [submitted, passage])

  // When the timer hits zero, auto-submit so the result (scored over all questions) is shown.
  useEffect(() => {
    if (timeLeft === 0 && passage && !submitted) setSubmitted(true)
  }, [timeLeft, passage, submitted])

  const handleRetryLoad = () => {
    setLoadError('')
    setPassage(null)
    fetchReadingPassages(1)
      .then(list => setPassage(list[0]))
      .catch(err => setLoadError(friendlyError(err, lang)))
  }

  // ── LOADING STATE ──────────────────────────────────────────────────────────
  if (!passage && !loadError) {
    return (
      <div style={{ maxWidth:700, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <div style={{ width:40, height:40, margin:'0 auto 1rem', border:'3px solid rgba(16,185,129,0.2)', borderTopColor:'#10b981', borderRadius:'50%', animation:'rspin 0.8s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.88rem' }}>{isAr ? 'جارٍ تحميل النص…' : 'Loading passage…'}</p>
        <style>{`@keyframes rspin { to { transform:rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── ERROR STATE ─────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div style={{ maxWidth:500, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.95rem', marginBottom:'1.25rem' }}>{loadError}</p>
        <button onClick={handleRetryLoad} style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:11, padding:'11px 28px', fontSize:'0.92rem', fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
          <IconRefresh size={15} color="#fff" /> {isAr ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    )
  }

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
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <IconBookOpen size={22} color="#34d399" /> {t('read_title')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>{t('read_subtitle')}</p>
        {!submitted && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
            <span style={{
              color: timeColor, fontWeight: 700, fontSize: '0.9rem',
              background: timeColor + '18', borderRadius: 8, padding: '4px 14px',
              transition: 'color 0.5s', display:'inline-flex', alignItems:'center', gap:6,
            }}>
              <IconClock size={14} color={timeColor} /> {fmtTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Passage — always stays visible, before AND after submission */}
      <div style={{ background:'rgba(16,185,129,0.07)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background:'rgba(16,185,129,0.2)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconDocument size={16} color="#6ee7b7" />
          </div>
          <div>
            <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('read_passage')} — {passage.category}</div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{passage.title}</h2>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: 1.8 }}>{passage.text}</p>
      </div>

      {/* Questions — only shown BEFORE submission. Once submitted, this block
          is replaced entirely by the AssessmentFeedback review below. */}
      {!submitted && (
        <div>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>{t('read_questions')}</h3>
          {passage.questions.map((q, qi) => (
            <div key={qi} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '1.25rem', marginBottom: '1rem',
            }}>
              <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.9rem' }}>{qi + 1}. {q.q}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.5rem' }}>
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))} style={{
                    background: answers[qi] === oi ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.06)',
                    border: '1px solid ' + (answers[qi] === oi ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.12)'),
                    color: '#fff', borderRadius: 9, padding: '9px 14px', textAlign: 'left',
                    fontSize: '0.88rem', cursor: 'pointer',
                    fontWeight: answers[qi] === oi ? 600 : 400, transition: 'all 0.2s',
                  }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button onClick={submit} disabled={Object.keys(answers).length < passage.questions.length} style={{
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
        </div>
      )}

      {/* Result — replaces the questions block entirely after submission */}
      {submitted && (() => {
        const reviewItems = passage.questions.map((q, qi) => ({
          question:      q.q,
          userAnswer:    q.options[answers[qi]] || '—',
          correctAnswer: q.options[q.answer],
          isCorrect:     answers[qi] === q.answer,
        }))
        return (
          <AssessmentFeedback
            assessmentType="reading"
            overallScore={score}
            reviewItems={reviewItems}
            onNext={() => onFinish(score)}
            isSingle={isSingle}
            lang={lang}
            nextLabel={lang === 'ar' ? 'عرض نتائجي →' : 'View Results →'}
          />
        )
      })()}
    </div>
  )
}
