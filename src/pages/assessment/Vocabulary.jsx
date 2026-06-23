import React, { useState, useMemo } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import { vocabularyQuestions, getTestQuestions } from '../../data/content.js'
import { IconVocabulary } from '../../components/TestIcons.jsx'

export default function Vocabulary({ onFinish, isSingle }) {
  const { t, lang } = useLang()
  const isAr = lang === 'ar'
  const questions = useMemo(() => getTestQuestions(vocabularyQuestions, 5), [])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [phase, setPhase] = useState('quiz')
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const q = questions[current]
  const isLast = current === questions.length - 1
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

  if (phase === 'results') {
    const correct = questions.filter((q, i) => answers[i] === q.answer).length
    const score = Math.round((correct / questions.length) * 100)
    const sc = score >= 70 ? '#22d3ee' : score >= 50 ? '#f59e0b' : '#f87171'
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem', animation: 'pageIn 0.4s ease' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(236,72,153,0.12)', border:'2px solid rgba(236,72,153,0.35)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <IconVocabulary size={30} color="#ec4899" />
            </div>
          </div>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'clamp(1.5rem,3vw,2rem)', marginBottom:8 }}>{t('vocab_score')}</h2>
          <div style={{ fontSize:'4rem', fontWeight:900, color:sc, fontFamily:'Playfair Display,serif', lineHeight:1 }}>{score}</div>
          <div style={{ color:'rgba(255,255,255,0.35)', marginBottom:'0.5rem' }}>/100 · {correct}/{questions.length} {isAr ? 'صحيحة' : 'correct'}</div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'2rem' }}>
          {questions.map((q, i) => {
            const userAns = answers[i]
            const isCorrect = userAns === q.answer
            return (
              <div key={i} style={{ background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border:`1px solid ${isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius:12, padding:'0.9rem 1rem' }}>
                <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:4 }}>
                  <span style={{ fontSize:'0.9rem' }}>{isCorrect ? '✓' : '✗'}</span>
                  <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.88rem', lineHeight:1.5 }}>{q.question}</span>
                </div>
                {!isCorrect && (
                  <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', marginTop:4, paddingLeft:20 }}>
                    {isAr ? 'إجابتك:' : 'Your answer:'} <span style={{ color:'#f87171' }}>{q.options[userAns] || (isAr ? 'لم تجب' : 'no answer')}</span>
                    {' · '}{isAr ? 'الصحيح:' : 'Correct:'} <span style={{ color:'#6ee7b7' }}>{q.options[q.answer]}</span>
                    {q.explanation && <div style={{ marginTop:4, color:'rgba(255,255,255,0.4)', fontStyle:'italic' }}>{q.explanation}</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ textAlign:'center' }}>
          <button onClick={() => onFinish(score)} style={{ background:'linear-gradient(135deg,#ec4899,#db2777)', color:'#fff', border:'none', borderRadius:12, padding:'13px 32px', fontSize:'0.95rem', fontWeight:700, cursor:'pointer' }}>
            {isSingle ? (lang==='ar'?'عرض نتيجتي':'View My Results') : t('vocab_continue')} →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign:'center', marginBottom:'2rem' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(236,72,153,0.1)', border:'1px solid rgba(236,72,153,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
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
        <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:4, height:6 }}>
          <div style={{ width:`${((current) / questions.length) * 100}%`, height:'100%', background:'linear-gradient(90deg,#ec4899,#db2777)', borderRadius:4, transition:'width 0.4s ease' }}/>
        </div>
      </div>

      <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(236,72,153,0.2)', borderRadius:16, padding:'1.75rem', marginBottom:'1.25rem' }}>
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
              {showFeedback && isCorrect && <span style={{ marginLeft:'auto' }}>✓</span>}
              {showFeedback && isSelected && !isCorrect && <span style={{ marginLeft:'auto' }}>✗</span>}
            </button>
          )
        })}
      </div>

      {showFeedback && q.explanation && (
        <div style={{ background:'rgba(236,72,153,0.06)', border:'1px solid rgba(236,72,153,0.18)', borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1.25rem' }}>
          <span style={{ color:'#f9a8d4', fontSize:'0.8rem', fontWeight:700 }}>💡 </span>
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
