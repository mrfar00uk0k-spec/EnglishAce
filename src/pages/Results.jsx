import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'
import { LexiResultsBanner } from '../components/LexiWidget.jsx'
import { useLexi } from '../contexts/LexiContext.jsx'
import { TestIconMap, TestColorMap } from '../components/TestIcons.jsx'

// ── helpers ──────────────────────────────────────────────────────────
function getLevel(score) {
  if (score >= 85) return 'C1'
  if (score >= 70) return 'B2'
  if (score >= 55) return 'B1'
  if (score >= 40) return 'A2'
  return 'A1'
}
const levelMeta = {
  A1:{ label:'Beginner',          labelAr:'مبتدئ',           color:'#f87171', desc:'You are just starting your English journey.',     descAr:'أنت في بداية رحلة اللغة الإنجليزية.' },
  A2:{ label:'Elementary',        labelAr:'أساسي',           color:'#fb923c', desc:'You can handle simple everyday communication.',   descAr:'يمكنك التواصل في المواقف اليومية البسيطة.' },
  B1:{ label:'Intermediate',      labelAr:'متوسط',           color:'#f59e0b', desc:'You can communicate in most familiar situations.', descAr:'تتواصل في معظم المواقف المألوفة.' },
  B2:{ label:'Upper Intermediate',labelAr:'فوق المتوسط',     color:'#22d3ee', desc:'You speak and write with good accuracy.',          descAr:'تتحدث وتكتب بدقة جيدة.' },
  C1:{ label:'Advanced',          labelAr:'متقدم',           color:'#34d399', desc:'You use English fluently and flexibly.',           descAr:'تستخدم اللغة بطلاقة ومرونة عالية.' },
}
function getTips(score, isAr) {
  if (isAr) {
    if (score >= 75) return ['تدرّب على المفردات المتقدمة يومياً','اعمل على التعابير الاصطلاحية','فكّر في اختبار IELTS أو TOEFL']
    if (score >= 55) return ['حاكِ المتحدثين الأصليين 20 دقيقة يومياً','شاهد مسلسلات إنجليزية بترجمة إنجليزية','تدرّب على الكتابة يومياً']
    return ['ابدأ بالبودكاست البسيط يومياً','تعلّم 10 كلمات جديدة كل يوم','استخدم EnglishAce يومياً']
  }
  if (score >= 75) return ['Study advanced vocabulary and idioms daily','Consider taking IELTS or TOEFL','Keep writing in English every day']
  if (score >= 55) return ['Shadow native speakers 20 min/day','Watch English series with English subtitles','Write short paragraphs daily and review mistakes']
  return ['Listen to simple English podcasts daily','Learn 10 new words every day','Use EnglishAce daily to practice all 4 skills']
}
function getRecommendation(score, level, isAr) {
  if (isAr) {
    if (score >= 75) return `ممتاز! مستواك ${level} يُظهر كفاءة عالية. أنت جاهز للتواصل بالإنجليزية في البيئات المهنية بثقة.`
    if (score >= 55) return `تقدم جيد! مستواك ${level} يُظهر أساساً متيناً. مع تدريب يومي منتظم لمدة 4–6 أسابيع، ستصل لمستوى احترافي ممتاز.`
    return `أنت في مستوى ${level}. نوصي بـ 2–3 أشهر من التدريب المنتظم. استخدم EnglishAce يومياً وركّز على جميع المهارات.`
  }
  if (score >= 75) return `Excellent! Your ${level} level shows strong English proficiency. You are ready to communicate confidently in professional settings.`
  if (score >= 55) return `Good progress! Your ${level} level shows a solid foundation. With 4–6 weeks of daily practice, you will reach a strong professional level.`
  return `You are at ${level} level. We recommend 2–3 months of structured practice. Use EnglishAce daily and focus on all six skills.`
}

// Animated counter
function AnimatedScore({ target, color, size = '4rem' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / 40)
    const id = setInterval(() => {
      start = Math.min(start + step, target)
      setVal(start)
      if (start >= target) clearInterval(id)
    }, 25)
    return () => clearInterval(id)
  }, [target])
  return <span style={{ fontSize: size, fontWeight: 900, color, fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>{val}</span>
}

function CircleScore({ score, color, size = 120 }) {
  const r = 44, circ = 2 * Math.PI * r
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setPct(score), 100)
    return () => clearTimeout(t)
  }, [score])
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
        strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)' }}
      />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
        style={{ fill: color, fontSize: 20, fontWeight: 900, fontFamily: 'Playfair Display, serif' }}>
        {score}
      </text>
    </svg>
  )
}

const SECTION_META = {
  speaking:   { key:'speaking',   Icon: TestIconMap.speaking,   color:'#8b5cf6', label:'Speaking',   labelAr:'التحدث' },
  writing:    { key:'writing',    Icon: TestIconMap.writing,    color:'#10b981', label:'Writing',    labelAr:'الكتابة' },
  grammar:    { key:'grammar',    Icon: TestIconMap.grammar,    color:'#f59e0b', label:'Grammar',    labelAr:'القواعد' },
  vocabulary: { key:'vocabulary', Icon: TestIconMap.vocabulary, color:'#ec4899', label:'Vocabulary', labelAr:'المفردات' },
  listening:  { key:'listening',  Icon: TestIconMap.listening,  color:'#0ea5e9', label:'Listening',  labelAr:'الاستماع' },
  reading:    { key:'reading',    Icon: TestIconMap.reading,    color:'#f97316', label:'Reading',    labelAr:'القراءة' },
}

export default function Results({ scores, onRetake, singleTest }) {
  const { t, lang } = useLang()
  const { showLexi } = useLexi()
  const isAr = lang === 'ar'

  const completed = Object.entries(scores).filter(([,v]) => v !== null && v !== undefined)
  const scoreVals = completed.map(([,v]) => v)
  const total     = scoreVals.length ? Math.round(scoreVals.reduce((a,b)=>a+b,0)/scoreVals.length) : 0
  const level     = getLevel(total)
  const meta      = levelMeta[level]
  const totalColor = meta.color
  const tips      = getTips(total, isAr)
  const rec       = getRecommendation(total, level, isAr)
  const today     = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })

  // Trigger Lexi once after results load
  React.useEffect(() => {
    if (total > 0) {
      showLexi({
        type:     'results',
        overall:  total,
        level,
        strengths:  [],
        weaknesses: [],
        mistakes:   [],
        tips:       getTips(total, false),
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const completedSections = completed.map(([k]) => SECTION_META[k]).filter(Boolean)

  return (
    <div style={{ background:'rgb(6,10,22)', color:'#fff', minHeight:'100vh', paddingBottom:'4rem', paddingTop: 68 }}>

      {/* ── TOP HERO BANNER ── */}
      <div style={{
        background:`radial-gradient(ellipse 80% 60% at 50% 0%, ${totalColor}18 0%, transparent 70%)`,
        borderBottom:'1px solid rgba(255,255,255,0.07)',
        padding:'3rem 1.5rem 2.5rem',
        textAlign:'center',
      }}>
        {/* Level badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:totalColor+'18', border:`1px solid ${totalColor}40`, borderRadius:100, padding:'6px 18px', marginBottom:'1.5rem' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:totalColor, boxShadow:`0 0 8px ${totalColor}` }}/>
          <span style={{ color:totalColor, fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            {isAr ? meta.labelAr : meta.label}
          </span>
        </div>

        <h1 style={{ fontSize:'clamp(1.8rem,5vw,2.8rem)', fontWeight:900, fontFamily:'Playfair Display,serif', marginBottom:'0.5rem' }}>
          {isAr ? 'نتائج اختبار الإنجليزية' : 'Your English Test Results'}
        </h1>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.9rem', marginBottom:'2.5rem' }}>
          {isAr ? meta.descAr : meta.desc} · {today}
        </p>

        {/* Big score circle */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'2rem' }}>
          <div style={{ position:'relative', display:'inline-block' }}>
            <CircleScore score={total} color={totalColor} size={160} />
            <div style={{ position:'absolute', bottom:-8, left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', fontWeight:600 }}>
              {isAr ? 'النتيجة الإجمالية' : 'Overall Score'}
            </div>
          </div>
        </div>

        {/* Per-section mini scores */}
        {completedSections.length > 0 && (
          <div style={{ display:'flex', justifyContent:'center', gap:'1rem', flexWrap:'wrap', maxWidth:700, margin:'0 auto' }} className="results-mini-cards">
            {completedSections.map(s => {
              const val = scores[s.key]
              const c = val >= 70 ? s.color : val >= 50 ? '#f59e0b' : '#f87171'
              return (
                <div key={s.key} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${s.color}30`, borderRadius:14, padding:'0.9rem 1.2rem', textAlign:'center', minWidth:90 }}>
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:6 }}>
                    <s.Icon size={18} color={s.color} />
                  </div>
                  <div style={{ fontSize:'1.5rem', fontWeight:900, color:c, fontFamily:'Playfair Display,serif' }}>{val}</div>
                  <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.68rem', marginTop:2 }}>{isAr ? s.labelAr : s.label}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'0 1.5rem' }}>

        <LexiResultsBanner score={total} level={level} />

      {/* ── SCORE BARS ── */}
        {completedSections.length > 1 && (
          <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'1.75rem', marginTop:'2rem', marginBottom:'1.25rem' }}>
            <h3 style={{ fontWeight:700, fontSize:'0.85rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1.25rem' }}>
              {isAr ? 'تفاصيل النتائج' : 'Score Breakdown'}
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 2.5rem' }} className="score-bars-grid">
              {completedSections.map(s => {
                const val = scores[s.key]
                return (
                  <div key={s.key} style={{ marginBottom:'1rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.85rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <s.Icon size={13} color={s.color} />
                        <span style={{ color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{isAr ? s.labelAr : s.label}</span>
                      </div>
                      <span style={{ color:s.color, fontWeight:800 }}>{val}/100</span>
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:5, height:7, overflow:'hidden' }}>
                      <div style={{ width:`${val}%`, height:'100%', background:s.color, borderRadius:5, transition:'width 1.5s cubic-bezier(0.22,1,0.36,1)' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── TIPS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem', marginTop:'1.25rem' }} className="tips-grid">
          <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.18)', borderRadius:16, padding:'1.25rem' }}>
            <div style={{ color:'#6ee7b7', fontWeight:700, fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.85rem' }}>
              {isAr ? '💡 نصائح للتحسين' : '💡 Improvement Tips'}
            </div>
            {tips.map((tip,i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                <span style={{ color:'#6ee7b7', fontWeight:700, flexShrink:0, fontSize:'0.82rem' }}>{i+1}.</span>
                <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.85rem', lineHeight:1.6 }}>{tip}</span>
              </div>
            ))}
          </div>

          <div style={{ background:'linear-gradient(135deg,rgba(37,99,235,0.08),rgba(139,92,246,0.06))', border:'1px solid rgba(99,102,241,0.18)', borderRadius:16, padding:'1.25rem' }}>
            <div style={{ color:'#a5b4fc', fontWeight:700, fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.85rem' }}>
              {isAr ? '🎯 التوصية' : '🎯 Recommendation'}
            </div>
            <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'0.88rem', lineHeight:1.75, margin:0 }}>{rec}</p>
          </div>
        </div>

        {/* ── CERTIFICATE CARD (printable) ── */}
        <div className="print-card" style={{
          background:'linear-gradient(135deg,#0d1b3e 0%,#0a1628 60%,#0d1b3e 100%)',
          border:`1px solid ${totalColor}30`, borderRadius:20,
          padding:'2rem', marginBottom:'2rem',
          boxShadow:`0 0 40px ${totalColor}12, 0 24px 60px rgba(0,0,0,0.5)`,
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute',top:-50,right:-50,width:200,height:200,borderRadius:'50%',background:`${totalColor}08`,pointerEvents:'none' }}/>
          <div style={{ position:'absolute',bottom:-30,left:-30,width:150,height:150,borderRadius:'50%',background:'rgba(37,99,235,0.05)',pointerEvents:'none' }}/>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1.5rem', position:'relative' }}>
            <div>
              <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>
                {isAr ? 'شهادة EnglishAce' : 'EnglishAce Certificate'}
              </div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.78rem', marginBottom:4 }}>{isAr ? 'النتيجة الإجمالية' : 'Overall Score'}</div>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:'5.5rem', fontWeight:900, lineHeight:1, color:totalColor }}>{total}</div>
              <div style={{ color:'rgba(255,255,255,0.25)', fontSize:'1rem' }}>/100</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>{isAr ? 'المستوى' : 'Level'}</div>
              <div style={{ background:`${totalColor}18`, border:`2px solid ${totalColor}`, borderRadius:14, padding:'1rem 1.5rem', boxShadow:`0 0 24px ${totalColor}25` }}>
                <div style={{ fontSize:'2.5rem', fontWeight:900, color:totalColor, fontFamily:'Playfair Display,serif' }}>{level}</div>
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.75rem', marginTop:3 }}>{isAr ? meta.labelAr : meta.label}</div>
              </div>
              <div style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.68rem', marginTop:6 }}>{today}</div>
            </div>
          </div>

          <div style={{ marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
            <div style={{ color:'rgba(255,255,255,0.15)', fontSize:'0.68rem', letterSpacing:'0.15em', textTransform:'uppercase' }}>
              englishace.io · Powered by AI
            </div>
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
          <button onClick={() => window.print()} style={{
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)',
            color:'#fff', borderRadius:10, padding:'11px 22px', fontSize:'0.9rem', fontWeight:600, cursor:'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{marginRight:7,verticalAlign:'middle'}}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            {t('results_print')}
          </button>

          <button onClick={onRetake} style={{
            background:`linear-gradient(135deg,${totalColor},${totalColor}bb)`,
            color:'#fff', border:'none', borderRadius:10, padding:'11px 22px', fontSize:'0.9rem', fontWeight:700, cursor:'pointer',
            boxShadow:`0 4px 18px ${totalColor}35`,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{marginRight:7,verticalAlign:'middle'}}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
            {t('results_retake')}
          </button>

          <Link to="/blog" style={{
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)',
            color:'rgba(255,255,255,0.7)', borderRadius:10, padding:'11px 22px', fontSize:'0.9rem', fontWeight:600, display:'inline-flex', alignItems:'center', gap:6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            {isAr ? 'مقالات التحسين' : 'Study Tips'}
          </Link>
        </div>
      </div>

      {/* Print + mobile CSS */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html,body { background:#070d1f !important; color:#fff !important; margin:0; padding:0; }
          nav,footer,button,a[href] { display:none !important; }
          .print-card { page-break-inside:avoid; box-shadow:none !important; }
        }
        @media (max-width:600px) {
          .score-bars-grid { grid-template-columns: 1fr !important; }
          .tips-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
