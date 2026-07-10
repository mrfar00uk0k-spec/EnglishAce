import React, { useEffect, useState, memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'
import { LexiResultsBanner } from '../components/LexiWidget.jsx'
import { useLexi } from '../contexts/LexiContext.jsx'
import { TestIconMap, TestColorMap } from '../components/TestIcons.jsx'
import { saveLastResult, clearSession } from '../utils/session.js'
import { IconLightbulb, IconTarget, IconTrophy, IconCheckCircle } from '../components/Icons.jsx'

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
let _resCssInjected = false
function injectResCSS() {
  if (_resCssInjected || typeof document === 'undefined') return
  _resCssInjected = true
  const s = document.createElement('style')
  s.textContent = `
    @keyframes resRevealUp {
      from { opacity:0; transform:translateY(28px) scale(0.97); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
    @keyframes resBarFill { from { width:0 !important; } }
    @keyframes resScorePop {
      0%   { opacity:0; transform:scale(0.6); }
      65%  { transform:scale(1.07); }
      100% { opacity:1; transform:scale(1); }
    }
    .res-card {
      transition: transform 220ms cubic-bezier(0.22,1,0.36,1),
                  box-shadow 220ms ease, border-color 220ms ease;
    }
    .res-card:hover {
      transform:translateY(-4px) !important;
      box-shadow:0 18px 48px rgba(0,0,0,0.5) !important;
      border-color:rgba(255,255,255,0.13) !important;
    }
    .res-btn {
      transition: transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease;
    }
    .res-btn:hover  { transform:scale(1.03) translateY(-2px); }
    .res-btn:active { transform:scale(0.97); }
    @media (hover:none) { .res-card:hover { transform:none !important; } }
    @media (prefers-reduced-motion:reduce) {
      .res-reveal { opacity:1 !important; animation:none !important; transform:none !important; }
      .res-bar    { animation:none !important; }
      .res-card, .res-btn { transition:none !important; }
    }
    @media print {
      @page { size: A4; margin: 14mm; }
      html, body { background:#fff !important; }
      .no-print { display:none !important; }
      .print-view { display:block !important; }
    }
    .print-view { display:none; }
    @media (max-width:600px) {
      .res-bars-grid { grid-template-columns:1fr !important; }
      .res-tips-grid { grid-template-columns:1fr !important; }
      .res-actions   { flex-direction:column !important; align-items:stretch !important; }
      .cert-score-row { flex-direction:column !important; align-items:flex-start !important; gap:1.25rem !important; }
      .cert-divider   { display:none !important; }
    }
    @media (max-width:480px) {
      .print-cert { padding:1.5rem !important; }
      .cert-score-number { font-size:3.6rem !important; }
    }
  `
  document.head.appendChild(s)
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────
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
  B2:{ label:'Upper Intermediate',labelAr:'فوق المتوسط',     color:'#22d3ee', desc:'You communicate with good accuracy and confidence.',          descAr:'تتحدث وتكتب بدقة جيدة.' },
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

function scoreColor(v) {
  if (v >= 85) return '#34d399'
  if (v >= 70) return '#22d3ee'
  if (v >= 55) return '#f59e0b'
  if (v >= 40) return '#fb923c'
  return '#f87171'
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1800, delay = 300) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf, start = null, timer
    const anim = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(anim)
    }
    timer = setTimeout(() => { raf = requestAnimationFrame(anim) }, delay)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf) }
  }, [target, duration, delay])
  return val
}

// ─────────────────────────────────────────────────────────────────────────────
// CIRCLE SCORE (SVG)
// ─────────────────────────────────────────────────────────────────────────────
const CircleScore = memo(function CircleScore({ score, color, size = 180 }) {
  const r = 62, circ = 2 * Math.PI * r
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t) }, [])

  return (
    <svg width={size} height={size} viewBox="0 0 140 140">
      <defs>
        <filter id="res-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
      <circle
        cx="70" cy="70" r={r}
        fill="none" stroke={color} strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={animated ? circ * (1 - score / 100) : circ}
        transform="rotate(-90 70 70)"
        filter="url(#res-glow)"
        style={{ transition:'stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1)' }}
      />
      <text x="70" y="68" textAnchor="middle" style={{ fill:color, fontSize:28, fontWeight:900, fontFamily:'inherit' }}>
        {score}
      </text>
      <text x="70" y="86" textAnchor="middle" style={{ fill:'rgba(255,255,255,0.3)', fontSize:10, fontFamily:'inherit' }}>
        /100
      </text>
    </svg>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// REVEAL WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function Reveal({ delay = 0, children }) {
  return (
    <div
      className="res-reveal"
      style={{ opacity:0, animation:`resRevealUp 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms forwards` }}
    >
      {children}
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <h3 style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'0.85rem', display:'flex', alignItems:'center', gap:6 }}>
      {children}
    </h3>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION META
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_META = {
  speaking:   { key:'speaking',   color:'#8b5cf6', label:'Speaking',   labelAr:'التحدث' },
  writing:    { key:'writing',    color:'#10b981', label:'Writing',    labelAr:'الكتابة' },
  grammar:    { key:'grammar',    color:'#f59e0b', label:'Grammar',    labelAr:'القواعد' },
  vocabulary: { key:'vocabulary', color:'#ec4899', label:'Vocabulary', labelAr:'المفردات' },
  listening:  { key:'listening',  color:'#0ea5e9', label:'Listening',  labelAr:'الاستماع' },
  reading:    { key:'reading',    color:'#f97316', label:'Reading',    labelAr:'القراءة' },
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function Results({ scores, onRetake, singleTest }) {
  injectResCSS()
  const { t, lang } = useLang()
  const { showLexi } = useLexi()
  const isAr = lang === 'ar'

  const completed  = Object.entries(scores).filter(([,v]) => v != null)
  const scoreVals  = completed.map(([,v]) => v)
  const total      = scoreVals.length ? Math.round(scoreVals.reduce((a,b) => a+b, 0) / scoreVals.length) : 0
  const level      = getLevel(total)
  const meta       = levelMeta[level]
  const totalColor = meta.color
  const tips       = getTips(total, isAr)
  const rec        = getRecommendation(total, level, isAr)
  const today      = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })

  const displayedScore = useCountUp(total, 1800, 400)

  // Results appears via a state swap inside Assessment.jsx, not a route change,
  // so the app-level <ScrollToTop/> (which only watches the URL) never fires
  // here. Without this, the page keeps whatever scroll position the long
  // feedback screen was at, so it opens mid-page instead of at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    if (total > 0) {
      showLexi({ type:'results', overall:total, level, strengths:[], weaknesses:[], mistakes:[], tips:getTips(total, false) })

      // MEMORY: persist this as the "last result" (durable, shown on next visit)
      saveLastResult({ overall: total, level, scores })
      // The assessment is complete — the in-progress "resume" session is no longer needed
      clearSession('suite')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const completedSections = completed.map(([k]) => SECTION_META[k]).filter(Boolean)

  const handlePrint  = useCallback(() => window.print(), [])
  const handleRetake = useCallback(() => onRetake(), [onRetake])

  return (
    <>
    <div className="no-print" style={{ background:'rgb(6,10,22)', color:'#fff', minHeight:'100vh', paddingBottom:'5rem', paddingTop:68 }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div style={{
        background:`radial-gradient(ellipse 90% 55% at 50% 0%, ${totalColor}16 0%, transparent 70%)`,
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        padding:'3.5rem 1.5rem 3rem',
        textAlign:'center',
        position:'relative',
        overflow:'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 50% 100%, ${totalColor}08, transparent 60%)`, pointerEvents:'none' }}/>

        {/* Level badge */}
        <Reveal delay={0}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:`${totalColor}14`, border:`1px solid ${totalColor}35`, borderRadius:100, padding:'5px 18px', marginBottom:'1.5rem' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:totalColor, boxShadow:`0 0 8px ${totalColor}`, display:'inline-block', flexShrink:0 }}/>
            <span style={{ color:totalColor, fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              {level} — {isAr ? meta.labelAr : meta.label}
            </span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 style={{ fontSize:'clamp(1.6rem,4vw,2.4rem)', fontWeight:900, fontFamily:'inherit', marginBottom:'0.4rem', letterSpacing:'-0.02em' }}>
            {isAr ? 'نتائج اختبار الإنجليزية' : 'Your English Results'}
          </h1>
          <p style={{ color:'rgba(255,255,255,0.38)', fontSize:'0.88rem', marginBottom:'2.5rem' }}>
            {isAr ? meta.descAr : meta.desc} · {today}
          </p>
        </Reveal>

        {/* Big circle */}
        <Reveal delay={250}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'2rem', position:'relative' }}>
            <div style={{ position:'relative', display:'inline-block' }}>
              <CircleScore score={displayedScore} color={totalColor} size={180}/>
              <div style={{ position:'absolute', bottom:-10, left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', color:'rgba(255,255,255,0.32)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                {isAr ? 'النتيجة الإجمالية' : 'Overall Score'}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Section mini cards */}
        {completedSections.length > 0 && (
          <Reveal delay={500}>
            <div style={{ display:'flex', justifyContent:'center', gap:'0.6rem', flexWrap:'wrap', maxWidth:720, margin:'0 auto' }}>
              {completedSections.map(s => {
                const val = scores[s.key]
                const c = scoreColor(val)
                return (
                  <div
                    key={s.key}
                    className="res-card"
                    style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:`1px solid ${s.color}28`, borderRadius:14, padding:'0.8rem 1rem', textAlign:'center', minWidth:80 }}
                  >
                    <div style={{ display:'flex', justifyContent:'center', marginBottom:5 }}>
                      {(() => { const Ic = TestIconMap[s.key]; return Ic ? <Ic size={16} color={s.color}/> : null })()}
                    </div>
                    <div style={{ fontSize:'1.45rem', fontWeight:900, color:c }}>{val}</div>
                    <div style={{ color:'rgba(255,255,255,0.38)', fontSize:'0.65rem', marginTop:2, fontWeight:600 }}>
                      {isAr ? s.labelAr : s.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </Reveal>
        )}
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'0 1.5rem' }}>

        {/* Lexi banner */}
        <div style={{ marginTop:'2rem' }}>
          <LexiResultsBanner score={total} level={level}/>
        </div>

        {/* ── SCORE BARS ──────────────────────────────────────────── */}
        {completedSections.length > 1 && (
          <Reveal delay={700}>
            <div
              className="res-card"
              style={{ background:'rgba(255,255,255,0.025)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(255,255,255,0.065)', borderRadius:20, padding:'1.75rem', marginBottom:'1.25rem' }}
            >
              <SectionHeading>{isAr ? 'تفاصيل النتائج' : 'Score Breakdown'}</SectionHeading>
              <div className="res-bars-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 2.5rem' }}>
                {completedSections.map(s => {
                  const val = scores[s.key]
                  return (
                    <div key={s.key} style={{ marginBottom:'1rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.85rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          {(() => { const Ic = TestIconMap[s.key]; return Ic ? <Ic size={13} color={s.color}/> : null })()}
                          <span style={{ color:'rgba(255,255,255,0.68)', fontWeight:600 }}>{isAr ? s.labelAr : s.label}</span>
                        </div>
                        <span style={{ color:s.color, fontWeight:800 }}>{val}/100</span>
                      </div>
                      <div style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', borderRadius:5, height:6, overflow:'hidden' }}>
                        <div
                          className="res-bar"
                          style={{
                            width:`${val}%`, height:'100%',
                            background:`linear-gradient(90deg,${s.color}80,${s.color})`,
                            borderRadius:5,
                            animation:`resBarFill 1.2s cubic-bezier(0.22,1,0.36,1) 800ms both`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Reveal>
        )}

        {/* ── TIPS + RECOMMENDATION ───────────────────────────────── */}
        <Reveal delay={950}>
          <div className="res-tips-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem' }}>
            {/* Tips */}
            <div className="res-card" style={{ background:'rgba(16,185,129,0.04)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(16,185,129,0.14)', borderRadius:18, padding:'1.25rem' }}>
              <SectionHeading><IconLightbulb size={11} color="rgba(255,255,255,0.35)" /> {isAr ? 'نصائح للتحسين' : 'Improvement Tips'}</SectionHeading>
              {tips.map((tip, i) => (
                <div key={i} style={{ display:'flex', gap:9, marginBottom:9 }}>
                  <span style={{ color:'#6ee7b7', fontWeight:800, flexShrink:0, fontSize:'0.8rem', marginTop:1 }}>{i+1}.</span>
                  <span style={{ color:'rgba(255,255,255,0.68)', fontSize:'0.85rem', lineHeight:1.65 }}>{tip}</span>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="res-card" style={{ background:'linear-gradient(135deg,rgba(37,99,235,0.06),rgba(139,92,246,0.04))', border:'1px solid rgba(99,102,241,0.14)', borderRadius:18, padding:'1.25rem' }}>
              <SectionHeading><IconTarget size={11} color="rgba(255,255,255,0.35)" /> {isAr ? 'التوصية' : 'Recommendation'}</SectionHeading>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.87rem', lineHeight:1.8, margin:0 }}>{rec}</p>
            </div>
          </div>
        </Reveal>

        {/* ── CERTIFICATE ─────────────────────────────────────────── */}
        <Reveal delay={1200}>
          <div
            className="print-cert res-card"
            style={{
              background:'linear-gradient(135deg,#0d1b3e 0%,#050d1e 55%,#0d1b3e 100%)',
              border:`1px solid ${totalColor}30`, borderRadius:24,
              padding:'2.25rem', marginBottom:'2rem',
              boxShadow:`0 0 60px ${totalColor}12, 0 30px 80px rgba(0,0,0,0.55)`,
              position:'relative', overflow:'hidden',
            }}
          >
            {/* Safe, fully-contained ambient glow — no clipping artifacts */}
            <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 70% 60% at 80% -10%, ${totalColor}14, transparent 60%)`, pointerEvents:'none' }}/>
            <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 50% 50% at 0% 110%, rgba(37,99,235,0.10), transparent 65%)`, pointerEvents:'none' }}/>

            {/* Top accent strip */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${totalColor}, transparent)`, opacity:0.7 }}/>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem', position:'relative', zIndex:1, flexWrap:'wrap', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <div style={{ width:26, height:26, borderRadius:8, background:`${totalColor}18`, border:`1px solid ${totalColor}40`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <IconTrophy size={14} color={totalColor} />
                </div>
                <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em' }}>
                  {isAr ? 'شهادة EnglishAce' : 'EnglishAce Certificate'}
                </span>
              </div>
              <span style={{ color:'rgba(255,255,255,0.24)', fontSize:'0.72rem' }}>{today}</span>
            </div>

            <div className="cert-score-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1.5rem', position:'relative', zIndex:1 }}>
              <div>
                <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.78rem', marginBottom:6 }}>
                  {isAr ? 'النتيجة الإجمالية' : 'Overall Score'}
                </div>
                <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                  <span className="cert-score-number" style={{ fontFamily:'inherit', fontSize:'5rem', fontWeight:900, lineHeight:1, color:totalColor, letterSpacing:'-0.04em' }}>
                    {total}
                  </span>
                  <span style={{ color:'rgba(255,255,255,0.22)', fontSize:'1.1rem', fontWeight:600 }}>/100</span>
                </div>
              </div>

              <div className="cert-divider" style={{ width:1, alignSelf:'stretch', background:'rgba(255,255,255,0.08)', minHeight:80 }}/>

              <div style={{ textAlign:'center', flexShrink:0 }}>
                <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>
                  {isAr ? 'المستوى' : 'CEFR Level'}
                </div>
                <div style={{ background:`${totalColor}14`, border:`1.5px solid ${totalColor}70`, borderRadius:16, padding:'0.9rem 1.6rem', boxShadow:`0 0 24px ${totalColor}20` }}>
                  <div style={{ fontSize:'2.2rem', fontWeight:900, color:totalColor, lineHeight:1 }}>{level}</div>
                  <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', marginTop:4 }}>{isAr ? meta.labelAr : meta.label}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop:'1.75rem', paddingTop:'1.25rem', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, position:'relative', zIndex:1 }}>
              <IconCheckCircle size={11} color="rgba(255,255,255,0.2)" />
              <span style={{ color:'rgba(255,255,255,0.18)', fontSize:'0.64rem', letterSpacing:'0.15em', textTransform:'uppercase' }}>
                {window.location.hostname} · Powered by AI
              </span>
            </div>
          </div>
        </Reveal>

        {/* ── ACTIONS ─────────────────────────────────────────────── */}
        <Reveal delay={1400}>
          <div className="res-actions" style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
            <button
              className="res-btn"
              onClick={handlePrint}
              style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.75)', borderRadius:12, padding:'12px 22px', fontSize:'0.88rem', fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:7 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              {t('results_print')}
            </button>

            <button
              className="res-btn"
              onClick={handleRetake}
              style={{ background:`linear-gradient(135deg,${totalColor},${totalColor}bb)`, color:'#fff', border:'none', borderRadius:12, padding:'12px 22px', fontSize:'0.88rem', fontWeight:700, cursor:'pointer', boxShadow:`0 4px 20px ${totalColor}35`, display:'inline-flex', alignItems:'center', gap:7 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
              {t('results_retake')}
            </button>

            <Link
              to="/blog"
              style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.62)', borderRadius:12, padding:'12px 22px', fontSize:'0.88rem', fontWeight:600, display:'inline-flex', alignItems:'center', gap:7, textDecoration:'none' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              {isAr ? 'مقالات التحسين' : 'Study Tips'}
            </Link>
          </div>
        </Reveal>

      </div>
    </div>

    {/* ══════════════════════════════════════════════════════════════════════
        PRINT VIEW — a dedicated, single-page A4 layout. Hidden on screen,
        shown only inside @media print. Everything above (.no-print) is
        hidden when printing, so this is the ONLY thing that reaches paper.
    ══════════════════════════════════════════════════════════════════════ */}
    <div className="print-view" style={{
      width: '100%', background:'#fff', color:'#0f172a',
      fontFamily: 'DM Sans, system-ui, sans-serif', padding: '4mm',
      boxSizing: 'border-box',
    }}>
      {/* Header: logo + brand */}
      <div style={{ display:'flex', alignItems:'center', gap:12, borderBottom:'2px solid #0f172a', paddingBottom:12, marginBottom:18 }}>
        <img src="/logo2.png" alt="EnglishAce" style={{ width:44, height:44, objectFit:'contain' }} />
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:900, fontSize:'1.3rem', letterSpacing:'-0.02em' }}>EnglishAce</div>
          <div style={{ fontSize:'0.72rem', color:'#64748b', letterSpacing:'0.06em', textTransform:'uppercase' }}>AI English Proficiency Report</div>
        </div>
        <div style={{ textAlign:'right', fontSize:'0.78rem', color:'#64748b' }}>{today}</div>
      </div>

      {/* Score + Level side by side */}
      <div style={{ display:'flex', gap:20, marginBottom:20, pageBreakInside:'avoid' }}>
        <div style={{ flex:1, border:'1px solid #e2e8f0', borderRadius:10, padding:'16px 20px' }}>
          <div style={{ fontSize:'0.7rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Overall Score</div>
          <div style={{ fontSize:'2.6rem', fontWeight:900, lineHeight:1, color:'#0f172a' }}>
            {total}<span style={{ fontSize:'1.1rem', color:'#94a3b8', fontWeight:600 }}>/100</span>
          </div>
        </div>
        <div style={{ flex:1, border:'1px solid #e2e8f0', borderRadius:10, padding:'16px 20px' }}>
          <div style={{ fontSize:'0.7rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>CEFR Level</div>
          <div style={{ fontSize:'2rem', fontWeight:900, lineHeight:1, marginBottom:4 }}>{level}</div>
          <div style={{ fontSize:'0.82rem', color:'#475569' }}>{meta.label}</div>
        </div>
      </div>

      {/* Score breakdown table */}
      {completedSections.length > 0 && (
        <div style={{ marginBottom:20, pageBreakInside:'avoid' }}>
          <div style={{ fontSize:'0.72rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10, fontWeight:700 }}>Score Breakdown</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <tbody>
              {completedSections.map((s, i) => (
                <tr key={s.key} style={{ borderBottom: i < completedSections.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding:'8px 4px', fontSize:'0.88rem', color:'#334155', fontWeight:600 }}>{s.label}</td>
                  <td style={{ padding:'8px 4px', width:'55%' }}>
                    <div style={{ background:'#f1f5f9', borderRadius:4, height:8, overflow:'hidden' }}>
                      <div style={{ width:`${scores[s.key]}%`, height:'100%', background:s.color, borderRadius:4 }} />
                    </div>
                  </td>
                  <td style={{ padding:'8px 4px', textAlign:'right', fontWeight:800, fontSize:'0.9rem', color:'#0f172a' }}>{scores[s.key]}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recommendation */}
      <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'14px 18px', marginBottom:20, pageBreakInside:'avoid' }}>
        <div style={{ fontSize:'0.7rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6, fontWeight:700 }}>Recommendation</div>
        <p style={{ fontSize:'0.85rem', color:'#334155', lineHeight:1.6, margin:0 }}>{rec}</p>
      </div>

      {/* Footer */}
      <div style={{ borderTop:'1px solid #e2e8f0', paddingTop:10, display:'flex', justifyContent:'space-between', fontSize:'0.68rem', color:'#94a3b8' }}>
        <span>Generated by EnglishAce — AI-Powered English Assessment</span>
        <span>{typeof window !== "undefined" ? window.location.hostname : "englishace.io"}</span>
      </div>
    </div>
    </>
  )
}
