import React, { useState, useEffect } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import { IconVocabulary } from '../../components/TestIcons.jsx'
import { IconLightbulb, IconCheckCircle, IconXCircle, IconRefresh } from '../../components/Icons.jsx'
import AssessmentFeedback from '../../components/AssessmentFeedback.jsx'
import { fetchVocabularyQuestions, friendlyError } from '../../utils/questionsApi.js'

export default function Vocabulary({ onFinish, isSingle }) {
  const { t, lang } = useLang()
  const isAr = lang === 'ar'

  const [questions, setQuestions] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [phase, setPhase] = useState('quiz')
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchVocabularyQuestions(5)
      .then(qs => { if (!cancelled) setQuestions(qs) })
      .catch(err => { if (!cancelled) setLoadError(friendlyError(err, lang)) })
    return () => { cancelled = true }
  }, [])

  const q = questions?.[current]
  const isLast = questions ? current === questions.length - 1 : false
  const optionLabels = ['a','b','c','d']

  const handleSelect = (opt) => {
    if (showFeedback) return
    setSelected(opt)
    setShowFeedback(true)
    setAnswers(prev => ({ ...prev, [current]: opt }))
  }

  const handleNext = () => {
    setSelected(null)
    setShowFeedback(false)
    if (isLast) setPhase('results')
    else setCurrent(c => c + 1)
  }

  const handleRetryLoad = () => {
    setLoadError('')
    setQuestions(null)
    fetchVocabularyQuestions(5)
      .then(qs => setQuestions(qs))
      .catch(err => setLoadError(friendlyError(err, lang)))
  }

  // ── LOADING STATE ──────────────────────────────────────────────────────────
  if (!questions && !loadError) {
    return (
      <div style={{ maxWidth:700, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <div style={{ width:40, height:40, margin:'0 auto 1rem', border:'3px solid rgba(236,72,153,0.2)', borderTopColor:'#ec4899', borderRadius:'50%', animation:'vspin 0.8s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.88rem' }}>{isAr ? 'جارٍ تحميل الأسئلة…' : 'Loading questions…'}</p>
        <style>{`@keyframes vspin { to { transform:rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── ERROR STATE ─────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div style={{ maxWidth:500, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.95rem', marginBottom:'1.25rem' }}>{loadError}</p>
        <button onClick={handleRetryLoad} style={{ background:'linear-gradient(135deg,#ec4899,#db2777)', color:'#fff', border:'none', borderRadius:11, padding:'11px 28px', fontSize:'0.92rem', fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
          <IconRefresh size={15} color="#fff" /> {isAr ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    )
  }

  if (phase === 'results') {
    const correct = questions.filter((q, i) => answers[i] === q.answer).length
    const score = Math.round((correct / questions.length) * 100)

    const reviewItems = questions.map((q, i) => ({
      question:      q.question,
      userAnswer:    q.options[answers[i]] || (isAr ? 'لم تجب' : '—'),
      correctAnswer: q.options[q.answer],
      isCorrect:     answers[i] === q.answer,
      explanation:   q.explanation || '',
    }))

    return (
      <div style={{ maxWidth:700, margin:'0 auto', padding:'0 0 2rem' }}>
        <AssessmentFeedback
          assessmentType="vocabulary"
          overallScore={score}
          reviewItems={reviewItems}
          onNext={() => onFinish(score)}
          isSingle={isSingle}
          lang={lang}
          nextLabel={t('vocab_continue') + ' →'}
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign:'center', marginBottom:'2rem' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(236,72,153,0.1)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(236,72,153,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <IconVocabulary size={26} color="#ec4899" />
          </div>
        </div>
        <h1 style={{ fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:800, fontFamily:'Playfair Display,serif', marginBottom:4 }}>{t('vocab_title')}</h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.88rem' }}>{t('vocab_subtitle')}</p>
      </div>

      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'rgba(255,255,255,0.45)', marginBottom:6 }}>
          <span>{t('vocab_question')} {current + 1} {t('vocab_of')} {questions.length}</span>
          <span>{Math.round(((current) / questions.length) * 100)}%</span>
        </div>
        <div style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', borderRadius:4, height:6 }}>
          <div style={{ width:`${((current) / questions.length) * 100}%`, height:'100%', background:'linear-gradient(90deg,#ec4899,#db2777)', borderRadius:4, transition:'width 0.4s ease' }}/>
        </div>
      </div>

      <div style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(236,72,153,0.2)', borderRadius:16, padding:'1.75rem', marginBottom:'1.25rem' }}>
        <p style={{ fontSize:'1.05rem', fontWeight:600, lineHeight:1.7, color:'#fff' }}>{q.question}</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem', marginBottom:'1.5rem' }}>
        {optionLabels.map(opt => {
          const isCorrect = opt === q.answer
          const isSelected = selected === opt
          let bg = 'rgba(255,255,255,0.04)'
          let border = '1px solid rgba(255,255,255,0.1)'
          let color = 'rgba(255,255,255,0.8)'
          if (showFeedback) {
            if (isCorrect) { bg = 'rgba(16,185,129,0.12)'; border = '1px solid rgba(16,185,129,0.45)'; color = '#6ee7b7' }
            else if (isSelected) { bg = 'rgba(239,68,68,0.1)'; border = '1px solid rgba(239,68,68,0.4)'; color = '#fca5a5' }
          } else if (isSelected) {
            bg = 'rgba(236,72,153,0.1)'; border = '1px solid rgba(236,72,153,0.4)'; color = '#f9a8d4'
          }
          return (
            <button key={opt} onClick={() => handleSelect(opt)} style={{ background:bg, border, borderRadius:11, padding:'12px 16px', color, fontSize:'0.92rem', textAlign:'left', cursor: showFeedback ? 'default' : 'pointer', display:'flex', gap:12, alignItems:'center', transition:'all 0.2s', fontFamily:'inherit' }}>
              <span style={{ fontWeight:700, width:22, flexShrink:0, color: showFeedback && isCorrect ? '#6ee7b7' : showFeedback && isSelected ? '#fca5a5' : 'rgba(255,255,255,0.35)' }}>{opt.toUpperCase()}.</span>
              {q.options[opt]}
              {showFeedback && isCorrect && <span style={{ marginLeft:'auto', display:'flex' }}><IconCheckCircle size={15} color="#6ee7b7" /></span>}
              {showFeedback && isSelected && !isCorrect && <span style={{ marginLeft:'auto', display:'flex' }}><IconXCircle size={15} color="#fca5a5" /></span>}
            </button>
          )
        })}
      </div>

      {showFeedback && q.explanation && (
        <div style={{ background:'rgba(236,72,153,0.06)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(236,72,153,0.18)', borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1.25rem', display:'flex', gap:9, alignItems:'flex-start' }}>
          <IconLightbulb size={16} color="#f9a8d4" />
          <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.85rem' }}>{q.explanation}</span>
        </div>
      )}

      {showFeedback && (
        <div style={{ textAlign:'center' }}>
          <button onClick={handleNext} style={{ background: isLast ? 'linear-gradient(135deg,#ec4899,#db2777)' : 'rgba(255,255,255,0.1)', color:'#fff', border: isLast ? 'none' : '1px solid rgba(255,255,255,0.2)', borderRadius:11, padding:'11px 28px', fontSize:'0.92rem', fontWeight:700, cursor:'pointer' }}>
            {isLast ? (isSingle ? (lang==='ar'?'عرض نتيجتي':'View My Results') : t('vocab_submit')) : t('vocab_next') + ' →'}
          </button>
        </div>
      )}
    </div>
  )
}
