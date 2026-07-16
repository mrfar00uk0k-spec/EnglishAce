import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'
import HRInterview from './assessment/HRInterview.jsx'
import { IconMic, IconRefresh } from '../components/Icons.jsx'

export default function HRPractice() {
  const { t, lang } = useLang()
  const [done, setDone] = useState(false)
  const [finalScore, setFinalScore] = useState(null)
  const isAr = lang === 'ar'

  if (done) {
    return (
      <div style={{ background:'rgb(6,10,22)', minHeight:'100vh', color:'#fff', paddingTop:82 }}>
        <div style={{ maxWidth:600, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem', animation:'float 4s ease-in-out infinite' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(56,189,248,0.12)', border:'1px solid rgba(56,189,248,0.28)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <IconMic size={36} color="#38bdf8" />
            </div>
          </div>
          <h1 style={{ fontSize:'clamp(1.6rem,4vw,2.2rem)', fontWeight:800, fontFamily:'Playfair Display, serif', marginBottom:'0.75rem' }}>
            {isAr ? 'انتهى التدريب!' : 'Practice Complete!'}
          </h1>
          <div style={{ fontSize:'3.5rem', fontWeight:900, color:'#38bdf8', fontFamily:'Playfair Display, serif', marginBottom:'0.25rem' }}>{finalScore}</div>
          <div style={{ color:'rgba(255,255,255,0.4)', marginBottom:'2rem' }}>/100</div>
          <p style={{ color:'rgba(255,255,255,0.55)', marginBottom:'2rem', lineHeight:1.7 }}>
            {isAr
              ? 'هذا التدريب لا يُحسب ضمن نتيجة اختبار الإنجليزية. للحصول على شهادة مستوى الإنجليزية، ابدأ الاختبار الكامل.'
              : 'This practice does not count toward your English test score. For your official English level certificate, take the full English test.'
            }
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => { setDone(false); setFinalScore(null) }} style={{ background:'rgba(255,255,255,0.08)', color:'#fff', border:'1px solid rgba(255,255,255,0.18)', borderRadius:10, padding:'11px 24px', cursor:'pointer', fontWeight:600, display:'inline-flex', alignItems:'center', gap:8 }}>
              <IconRefresh size={14} color="#fff" /> {isAr ? 'أعد التدريب' : 'Practice Again'}
            </button>
            <Link to="/assessment" style={{ background:'linear-gradient(135deg,#2563eb,#0ea5e9)', color:'#fff', borderRadius:10, padding:'11px 24px', fontWeight:700, display:'inline-block', boxShadow:'0 4px 18px rgba(37,99,235,0.4)' }}>
              {isAr ? 'اختبار الإنجليزية الكامل ←' : 'Take Full English Test →'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background:'rgb(6,10,22)', minHeight:'100vh', color:'#fff', paddingTop:82 }}>
      {/* Header banner */}
      <div style={{ background:'rgba(37,99,235,0.08)', borderBottom:'1px solid rgba(37,99,235,0.18)', padding:'0.85rem 1.5rem', textAlign:'center' }}>
        <span style={{ color:'#93c5fd', fontSize:'0.85rem', fontWeight:600, display:'inline-flex', alignItems:'center', gap:6 }}>
          <IconMic size={13} color="#93c5fd" /> {isAr ? 'تدريب إضافي اختياري — لا يُحسب ضمن اختبار الإنجليزية' : 'Optional Bonus Practice — does not count toward your English test score'}
          {' · '}
          <Link to="/assessment" style={{ color:'#38bdf8', fontWeight:700 }}>
            {isAr ? 'اذهب للاختبار الكامل ←' : 'Take the Full English Test →'}
          </Link>
        </span>
      </div>
      <HRInterview onFinish={(score) => { setFinalScore(score); setDone(true) }} />
    </div>
  )
}
