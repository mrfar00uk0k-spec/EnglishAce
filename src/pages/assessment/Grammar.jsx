import React, { useState, useEffect } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import { IconGrammar } from '../../components/TestIcons.jsx'
import { IconLightbulb, IconCheckCircle, IconXCircle, IconRefresh } from '../../components/Icons.jsx'
import AssessmentFeedback from '../../components/AssessmentFeedback.jsx'
import { fetchGrammarQuestions, friendlyError } from '../../utils/questionsApi.js'

export default function Grammar({ onFinish, isSingle }) {
  const { t, lang } = useLang()
  const isAr = lang === 'ar'

  const [questions, setQuestions] = useState(null)   // null = loading
  const [loadError, setLoadError] = useState('')
  const [current, setCurrent]         = useState(0)
  const [answers, setAnswers]         = useState({})
  const [phase, setPhase]             = useState('quiz')
  const [selected, setSelected]       = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchGrammarQuestions(5)
      .then(qs => { if (!cancelled) setQuestions(qs) })
      .catch(err => { if (!cancelled) setLoadError(friendlyError(err, lang)) })
    return () => { cancelled = true }
  }, [])

  const q = questions?.[current]
  const isLast = questions ? current === questions.length - 1 : false
  const opts = ['a','b','c','d']

  const handleSelect = (opt) => {
    if (showFeedback) return
    setSelected(opt)
    setShowFeedback(true)
    setAnswers(prev => ({ ...prev, [current]: opt }))
  }

  const handleNext = () => {
    setSelected(null); setShowFeedback(false)
    if (isLast) setPhase('results')
    else setCurrent(c => c + 1)
  }

  const handleRetryLoad = () => {
    setLoadError('')
    setQuestions(null)
    fetchGrammarQuestions(5)
      .then(qs => setQuestions(qs))
      .catch(err => setLoadError(friendlyError(err, lang)))
  }

  // ── LOADING STATE ──────────────────────────────────────────────────────────
  if (!questions && !loadError) {
    return (
      <div style={{ maxWidth:700, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <div style={{ width:40, height:40, margin:'0 auto 1rem', border:'3px solid rgba(245,158,11,0.2)', borderTopColor:'#f59e0b', borderRadius:'50%', animation:'gspin 0.8s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.88rem' }}>{isAr ? 'جارٍ تحميل الأسئلة…' : 'Loading questions…'}</p>
        <style>{`@keyframes gspin { to { transform:rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── ERROR STATE ─────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div style={{ maxWidth:500, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.95rem', marginBottom:'1.25rem' }}>{loadError}</p>
        <button onClick={handleRetryLoad} style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#fff', border:'none', borderRadius:11, padding:'11px 28px', fontSize:'0.92rem', fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
          <IconRefresh size={15} color="#fff" /> {isAr ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    )
  }

  if (phase === 'results') {
    const correct = questions.filter((q,i) => answers[i] === q.answer).length
    const score   = Math.round((correct / questions.length) * 100)

    const reviewItems = questions.map((q, i) => ({
      question:      q.question,
      userAnswer:    q.options[answers[i]] || (isAr ? 'لا إجابة' : '—'),
      correctAnswer: q.options[q.answer],
      isCorrect:     answers[i] === q.answer,
      explanation:   q.explanation || '',
    }))

    return (
      <div style={{ maxWidth:700, margin:'0 auto', padding:'0 0 2rem' }}>
        <AssessmentFeedback
          assessmentType="grammar"
          overallScore={score}
          reviewItems={reviewItems}
          onNext={() => onFinish(score)}
          isSingle={isSingle}
          lang={lang}
          nextLabel={t('grammar_continue') + ' →'}
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'2rem 1.5rem' }}>
      <div style={{ textAlign:'center', marginBottom:'2rem' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(245,158,11,0.1)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(245,158,11,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <IconGrammar size={26} color="#f59e0b" />
          </div>
        </div>
        <h1 style={{ fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:800, fontFamily:'Playfair Display,serif', marginBottom:4 }}>{t('grammar_title')}</h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.88rem' }}>{t('grammar_subtitle')}</p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'rgba(255,255,255,0.45)', marginBottom:6 }}>
          <span>{t('grammar_question')} {current+1} {t('grammar_of')} {questions.length}</span>
          <span>{Math.round((current/questions.length)*100)}%</span>
        </div>
        <div style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', borderRadius:4, height:6 }}>
          <div style={{ width:`${(current/questions.length)*100}%`, height:'100%', background:'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius:4, transition:'width 0.4s ease' }}/>
        </div>
      </div>



      {/* Question */}
      <div style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:16, padding:'1.75rem', marginBottom:'1.25rem' }}>
        <p style={{ fontSize:'1.05rem', fontWeight:600, lineHeight:1.7, color:'#fff', margin:0 }}>{q.question}</p>
      </div>

      {/* Options */}
      <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem', marginBottom:'1.5rem' }}>
        {opts.map(opt => {
          const isCorrect = opt === q.answer, isSel = selected === opt
          let bg='rgba(255,255,255,0.04)', border='1px solid rgba(255,255,255,0.1)', color='rgba(255,255,255,0.8)'
          if (showFeedback) {
            if (isCorrect) { bg='rgba(16,185,129,0.12)'; border='1px solid rgba(16,185,129,0.45)'; color='#6ee7b7' }
            else if (isSel) { bg='rgba(239,68,68,0.1)'; border='1px solid rgba(239,68,68,0.4)'; color='#fca5a5' }
          } else if (isSel) { bg='rgba(245,158,11,0.1)'; border='1px solid rgba(245,158,11,0.4)'; color='#fcd34d' }
          return (
            <button key={opt} onClick={() => handleSelect(opt)} disabled={showFeedback} style={{ background:bg, border, borderRadius:11, padding:'12px 16px', color, fontSize:'0.92rem', textAlign:'left', cursor:showFeedback?'default':'pointer', display:'flex', gap:12, alignItems:'center', transition:'all 0.2s', fontFamily:'inherit', width:'100%' }}>
              <span style={{ fontWeight:700, width:22, flexShrink:0, color: showFeedback&&isCorrect?'#6ee7b7':showFeedback&&isSel?'#fca5a5':'rgba(255,255,255,0.3)' }}>{opt.toUpperCase()}.</span>
              <span style={{ flex:1, textAlign:'left' }}>{q.options[opt]}</span>
              {showFeedback && isCorrect && <IconCheckCircle size={15} color="#6ee7b7" />}
              {showFeedback && isSel && !isCorrect && <IconXCircle size={15} color="#fca5a5" />}
            </button>
          )
        })}
      </div>

      {showFeedback && q.explanation && (
        <div style={{ background:'rgba(245,158,11,0.07)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1.25rem', display:'flex', gap:9, alignItems:'flex-start' }}>
          <IconLightbulb size={16} color="#fcd34d" />
          <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.85rem' }}>{q.explanation}</span>
        </div>
      )}

      {showFeedback && (
        <div style={{ textAlign:'center' }}>
          <button onClick={handleNext} style={{ background:isLast?'linear-gradient(135deg,#f59e0b,#d97706)':'rgba(255,255,255,0.1)', color:'#fff', border:isLast?'none':'1px solid rgba(255,255,255,0.2)', borderRadius:11, padding:'11px 28px', fontSize:'0.92rem', fontWeight:700, cursor:'pointer' }}>
            {isLast ? (isSingle ? (isAr?'عرض نتيجتي':'View My Results') : t('grammar_submit')) : t('grammar_next')+' →'}
          </button>
        </div>
      )}
    </div>
  )
}
