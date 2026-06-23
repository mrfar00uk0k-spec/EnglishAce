import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'
import { blogArticles, hrQuestions } from '../data/content.js'
import AdBanner from '../components/AdBanner.jsx'
import GlowCard from '../components/GlowCard.jsx'
import FloatingCard from '../components/FloatingCard.jsx'
import { IconSpeaking, IconWriting, IconGrammar, IconVocabulary, IconListening, IconReading, IconHR, TestColorMap } from '../components/TestIcons.jsx'

const welcomeEN = [
  'Test your English level with AI — speaking, writing, listening & reading',
  'Get an instant AI-powered English level certificate',
  'Know your exact English level in minutes',
  'Train smarter. Write better. Speak with confidence.',
  'Get professional AI feedback on your English instantly',
]
const welcomeAR = [
  'اختبر مستوى إنجليزيتك بالذكاء الاصطناعي',
  'احصل على شهادة مستوى الإنجليزية فوراً',
  'اعرف مستواك الحقيقي في دقائق',
  'تدرّب بذكاء… واتكلم بثقة',
]

// Animated welcome with fade transition
function AnimatedWelcome({ msg }) {
  const [displayed, setDisplayed] = React.useState(msg)
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    setVisible(false)
    const t1 = setTimeout(() => { setDisplayed(msg); setVisible(true) }, 350)
    return () => clearTimeout(t1)
  }, [msg])

  return (
    <div style={{
      fontSize: 'clamp(0.9rem,2vw,1.1rem)', color: '#38bdf8',
      fontWeight: 700, marginBottom: '0.8rem', letterSpacing: '0.01em',
      minHeight: '1.6em', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        display: 'inline-block',
      }}>{displayed}</span>
    </div>
  )
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) }
      })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

// Animated counter
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        let start = 0
        const dur = 1600
        const step = 16
        const inc = to / (dur / step)
        const id = setInterval(() => {
          start += inc
          if (start >= to) { setVal(to); clearInterval(id) }
          else setVal(Math.floor(start))
        }, step)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val}{suffix}</span>
}

const features = [
  { key: 'feat1', Icon: IconWriting,    color: '#10b981', delay: '0s' },
  { key: 'feat2', Icon: IconSpeaking,   color: '#8b5cf6', delay: '0.1s' },
  { key: 'feat3', Icon: IconListening,  color: '#0ea5e9', delay: '0.2s' },
  { key: 'feat4', Icon: IconReading,    color: '#f97316', delay: '0.3s' },
]
const faqs = [1,2,3,4,5]

// Sample questions preview
const previewSections = [
  { key:'speaking',   label:'Speaking Test',   Icon: IconSpeaking,   color: '#8b5cf6', route:'/assessment?test=speaking',   questions:['Talk about a challenge you overcame.','Describe your ideal work environment.','What motivates you to learn English?'] },
  { key:'writing',    label:'Writing Test',    Icon: IconWriting,    color: '#10b981', route:'/assessment?test=writing',    questions:['Write about remote work pros & cons.','Describe a memorable experience.','Discuss social media impact on society.'] },
  { key:'grammar',    label:'Grammar Test',    Icon: IconGrammar,    color: '#f59e0b', route:'/assessment?test=grammar',    questions:['She _____ to the gym every morning.','By the time we arrived, the film _____ started.','If I _____ you, I would apologise immediately.'] },
  { key:'vocabulary', label:'Vocabulary Test', Icon: IconVocabulary, color: '#ec4899', route:'/assessment?test=vocabulary', questions:['The word "exhausted" is closest in meaning to...','To "negotiate" means to...','The opposite of "temporary" is...'] },
  { key:'listening',  label:'Listening Test',  Icon: IconListening,  color: '#0ea5e9', route:'/assessment?test=listening',  questions:['I will call you later.','The meeting starts at nine.','She works in customer service.'] },
  { key:'reading',    label:'Reading Test',    Icon: IconReading,    color: '#f97316', route:'/assessment?test=reading',    questions:['Read a professional English passage.','Answer 4 comprehension questions.','Get a detailed accuracy score.'] },
]

export default function Home() {
  const { t, lang } = useLang()
  const [openFaq, setOpenFaq] = useState(null)
  const [activePreview, setActivePreview] = useState(0)
  const welcomeMsg = lang === 'ar'
    ? welcomeAR[Math.floor(Math.random() * welcomeAR.length)]
    : welcomeEN[Math.floor(Math.random() * welcomeEN.length)]

  useReveal()

  // Auto-rotate preview
  useEffect(() => {
    const id = setInterval(() => setActivePreview(p => (p + 1) % previewSections.length), 3000)
    return () => clearInterval(id)
  }, [])

  // stats removed

  return (
    <div style={{ background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff' }}>



      <AdBanner position="top" />

      {/* ───── HERO ───── */}
      <section className="hero-grid" style={{
        minHeight: '94vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '7rem 1.5rem 5rem',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Radial glow overlays */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 75% 55% at 50% 0%, rgba(37,99,235,0.22) 0%, transparent 65%), radial-gradient(ellipse 40% 30% at 80% 80%, rgba(14,165,233,0.12) 0%, transparent 60%)',
        }}/>

        {/* Floating orbs */}
        {[
          {s:300,top:'5%',left:'-10%',c:'rgba(37,99,235,0.08)',d:'9s'},
          {s:220,top:'65%',right:'-8%',c:'rgba(14,165,233,0.07)',d:'12s'},
          {s:160,top:'35%',right:'8%',c:'rgba(139,92,246,0.06)',d:'15s'},
          {s:100,top:'70%',left:'12%',c:'rgba(56,189,248,0.05)',d:'7s'},
        ].map((b,i) => (
          <div key={i} style={{
            position:'absolute', width:b.s, height:b.s, borderRadius:'50%',
            background:b.c, top:b.top, left:b.left, right:b.right,
            animation:`float ${b.d} ease-in-out infinite`,
            pointerEvents:'none', filter:'blur(1px)',
          }}/>
        ))}

        <div style={{ position:'relative', maxWidth:820, margin:'0 auto' }}>
          {/* Welcome badge */}
          <div style={{
            display:'inline-block',
            background:'rgba(37,99,235,0.18)',
            border:'1px solid rgba(56,189,248,0.35)',
            borderRadius:100, padding:'7px 22px',
            fontSize:'0.83rem', color:'#93c5fd',
            marginBottom:'1.25rem', letterSpacing:'0.04em', fontWeight:700,
            animation:'float 5s ease-in-out infinite',
          }}>✨ AI-Powered English Testing Platform</div>

          {/* Animated welcome line */}
          <AnimatedWelcome msg={welcomeMsg} />

          {/* Main headline */}
          <h1 style={{
            fontSize:'clamp(2.4rem,6.5vw,4.2rem)',
            fontWeight:900, lineHeight:1.08,
            fontFamily:'Playfair Display, serif',
            marginBottom:'1.5rem',
            background:'linear-gradient(135deg, #ffffff 30%, #93c5fd 65%, #38bdf8)',
            backgroundSize:'200% 200%',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            animation:'gradientMove 5s ease infinite',
          }}>{t('hero_title')}</h1>

          <p style={{
            fontSize:'1.05rem', color:'rgba(255,255,255,0.62)',
            lineHeight:1.82, maxWidth:560, margin:'0 auto 2.5rem',
          }}>{t('hero_subtitle')}</p>

          {/* CTA Buttons */}
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/assessment" className="btn-primary" style={{
              background:'linear-gradient(135deg,#2563eb,#0ea5e9)',
              color:'#fff', borderRadius:13, padding:'16px 36px',
              fontSize:'1.02rem', fontWeight:800,
              boxShadow:'0 8px 28px rgba(37,99,235,0.5)',
              display:'inline-block',
            }}>{t('hero_cta')} →</Link>
            <Link to="/blog" style={{
              background:'rgba(255,255,255,0.07)',
              border:'1px solid rgba(255,255,255,0.14)',
              color:'rgba(255,255,255,0.85)', borderRadius:13,
              padding:'16px 28px', fontSize:'1rem', fontWeight:600,
              display:'inline-block', transition:'all 0.25s',
            }}>Learn More</Link>
          </div>

          {/* Sections flow pill */}
          <div style={{
            marginTop:'3.5rem',
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.09)',
            borderRadius:16, padding:'1.1rem 2rem',
            display:'inline-flex', gap:'1.75rem',
            flexWrap:'wrap', justifyContent:'center',
            backdropFilter:'blur(10px)',
          }}>
            {[
              { label:'Speaking',   Icon: IconSpeaking,   color:'#8b5cf6', route:'/assessment?test=speaking' },
              { label:'Writing',    Icon: IconWriting,    color:'#10b981', route:'/assessment?test=writing' },
              { label:'Grammar',    Icon: IconGrammar,    color:'#f59e0b', route:'/assessment?test=grammar' },
              { label:'Vocabulary', Icon: IconVocabulary, color:'#ec4899', route:'/assessment?test=vocabulary' },
              { label:'Listening',  Icon: IconListening,  color:'#0ea5e9', route:'/assessment?test=listening' },
              { label:'Reading',    Icon: IconReading,    color:'#f97316', route:'/assessment?test=reading' },
            ].map((s,i) => (
              <Link key={s.label} to={s.route} style={{ display:'flex', alignItems:'center', gap:6, animation:`slideIn 0.4s ${i*0.08}s both`, textDecoration:'none', padding:'4px 10px', borderRadius:20, transition:'background 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=s.color+'22'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <s.Icon size={13} color={s.color} />
                <span style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.83rem', fontWeight:500 }}>{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── QUESTIONS PREVIEW ───── */}
      <section className="reveal" style={{ padding:'3rem 1.5rem 4rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <h2 style={{ fontSize:'clamp(1.7rem,4vw,2.5rem)', fontWeight:800, fontFamily:'Playfair Display, serif', marginBottom:'0.65rem' }}>
              What's Inside Your English Test?
            </h2>
            <p style={{ color:'rgba(255,255,255,0.48)', fontSize:'0.93rem' }}>
              {lang === 'ar' ? 'اطلع على نماذج الأسئلة في كل قسم — اضغط على أي قسم لتبدأه مباشرة' : 'Browse sample questions from each section — click a card to start that test directly'}
            </p>
          </div>

          {/* Outer grid: left=tabs+preview, right=FloatingCard */}
          <div style={{
  display:'grid',
  gridTemplateColumns:'1fr 360px',
  gap:'2.5rem'
}} className="preview-outer-resp">

            {/* LEFT: tabs + preview card */}
            <div style={{ display:'grid', gridTemplateColumns:'170px 1fr', gap:'1.25rem', alignItems:'start' }} className="preview-inner-resp">

              {/* Tab buttons */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                {previewSections.map((sec,i) => (
                  <div key={sec.label} style={{ position:'relative' }}>
                    <button onClick={() => setActivePreview(i)} style={{
                      background: activePreview === i ? sec.color+'22' : 'rgba(255,255,255,0.03)',
                      border: '1px solid ' + (activePreview === i ? sec.color+'55' : 'rgba(255,255,255,0.08)'),
                      borderRadius:12, padding:'0.85rem 1.1rem',
                      display:'flex', alignItems:'center', gap:10, cursor:'pointer',
                      transition:'all 0.3s ease', width:'100%',
                      transform: activePreview === i ? 'translateX(4px)' : 'translateX(0)',
                    }}>
                      <sec.Icon size={14} color={activePreview === i ? sec.color : 'rgba(255,255,255,0.35)'} />
                      <Link to={sec.route} onClick={e => e.stopPropagation()} style={{
                        color: activePreview === i ? '#fff' : 'rgba(255,255,255,0.55)',
                        fontWeight:600, fontSize:'0.88rem', textDecoration:'none', flex:1, textAlign:'left',
                      }}>{sec.label}</Link>
                      {activePreview === i && <span style={{ color:sec.color, fontSize:'0.8rem' }}>→</span>}
                    </button>
                  </div>
                ))}
              </div>

              {/* Preview card */}
              <div key={activePreview} style={{
                background:'rgba(255,255,255,0.04)',
                border:'1px solid ' + previewSections[activePreview].color + '30',
                borderRadius:18, padding:'1.75rem',
                animation:'popIn 0.35s ease',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.5rem' }}>
                  <div style={{
                    width:46, height:46, borderRadius:12,
                    background: previewSections[activePreview].color + '20',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem',
                  }}>
                    {React.createElement(previewSections[activePreview].Icon, { size:22, color: previewSections[activePreview].color })}
                  </div>
                  <div>
                    <div style={{ color: previewSections[activePreview].color, fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>Section</div>
                    <div style={{ color:'#fff', fontWeight:700, fontSize:'1.05rem' }}>{previewSections[activePreview].label}</div>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  {previewSections[activePreview].questions.map((q,i) => (
                    <div key={i} style={{
                      background:'rgba(255,255,255,0.05)', borderRadius:10,
                      padding:'0.85rem 1.1rem', display:'flex', alignItems:'center', gap:10,
                      borderLeft:'3px solid ' + previewSections[activePreview].color,
                    }}>
                      <span style={{ color: previewSections[activePreview].color, fontWeight:800, fontSize:'0.85rem', minWidth:20 }}>{i+1}.</span>
                      <span style={{ color:'rgba(255,255,255,0.82)', fontSize:'0.92rem' }}>{q}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:'1.25rem' }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                    <Link to={previewSections[activePreview].route} className="btn-primary" style={{
                      background:'linear-gradient(135deg,' + previewSections[activePreview].color + ',' + previewSections[activePreview].color + 'cc)',
                      color:'#fff', borderRadius:10, padding:'10px 22px',
                      fontSize:'0.88rem', fontWeight:700, display:'inline-block',
                    }}>Start This Test →</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: FloatingCard */}
            <div className="reveal-right" style={{ display:'flex', justifyContent:'center', alignItems:'flex-start' }}>
              <FloatingCard />
            </div>

          </div>
          <style>{`
            @media(max-width:960px){
              .preview-outer-resp { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </section>

      {/* ───── HR INTERVIEW PRACTICE (BONUS — below preview) ───── */}
      <section className="reveal" style={{ padding:'2.5rem 1.5rem 3.5rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{
            background:'linear-gradient(135deg,rgba(37,99,235,0.1),rgba(139,92,246,0.07))',
            border:'1px solid rgba(37,99,235,0.22)', borderRadius:22, padding:'2.5rem',
            display:'grid', gridTemplateColumns:'1fr auto', gap:'2.5rem', alignItems:'center',
          }} className="hr-bonus-grid">
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'0.9rem' }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'rgba(37,99,235,0.18)', border:'1px solid rgba(37,99,235,0.35)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <IconHR size={22} color="#2563eb" />
                </div>
                <span style={{ background:'rgba(37,99,235,0.2)', color:'#93c5fd', border:'1px solid rgba(37,99,235,0.4)', borderRadius:8, padding:'3px 12px', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  {lang === 'ar' ? 'تدريب إضافي اختياري' : 'Optional Bonus Practice'}
                </span>
              </div>
              <h3 style={{ fontSize:'clamp(1.3rem,3vw,1.8rem)', fontWeight:800, fontFamily:'Playfair Display, serif', marginBottom:'0.75rem' }}>
                {lang === 'ar' ? 'تدريب مقابلة HR' : 'HR Interview Practice'}
              </h3>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.92rem', lineHeight:1.75, marginBottom:'1.5rem', maxWidth:560 }}>
                {lang === 'ar'
                  ? 'تدرّب على أسئلة المقابلات الوظيفية الحقيقية بالصوت مع تقييم فوري من الذكاء الاصطناعي. هذا لا يُحسب ضمن نتيجة اختبار الإنجليزية.'
                  : 'Practice real job interview questions by voice with instant AI feedback. This does not count toward your English test score — it\'s a separate practice area for career prep.'
                }
              </p>
              <div style={{ display:'flex', gap:'0.65rem', flexWrap:'wrap', marginBottom:'1.75rem' }}>
                {hrQuestions.slice(0,3).map((q,i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, padding:'7px 14px', fontSize:'0.82rem', color:'rgba(255,255,255,0.65)' }}>
                    "{q}"
                  </div>
                ))}
              </div>
              <Link to="/hr-practice" style={{
                background:'linear-gradient(135deg,#2563eb,#3b82f6)',
                color:'#fff', borderRadius:12, padding:'12px 28px',
                fontSize:'0.92rem', fontWeight:700, display:'inline-block',
                boxShadow:'0 4px 18px rgba(37,99,235,0.35)',
              }}>
                {lang === 'ar' ? 'جرّب تدريب HR ←' : 'Try HR Practice →'}
              </Link>
            </div>
            <div style={{ textAlign:'center', minWidth:120 }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(37,99,235,0.15)', border:'2px solid rgba(37,99,235,0.35)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', animation:'float 5s ease-in-out infinite' }}>
                <IconHR size={38} color="#2563eb" />
              </div>
              <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.78rem', fontWeight:600 }}>
                {lang === 'ar' ? 'مجاني ١٠٠٪' : '100% Free'}
              </div>
            </div>
          </div>
          <style>{`@media(max-width:640px){.hr-bonus-grid{grid-template-columns:1fr !important}}`}</style>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section className="reveal" style={{ padding:'3rem 1.5rem 4rem', background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <AdBanner />
        <div style={{ maxWidth:1100, margin:'2rem auto 0' }}>
          <div style={{ textAlign:'center', marginBottom:'2.75rem' }}>
            <h2 style={{ fontSize:'clamp(1.7rem,4vw,2.5rem)', fontWeight:800, fontFamily:'Playfair Display, serif', marginBottom:'0.65rem' }}>{t('features_title')}</h2>
            <p style={{ color:'rgba(255,255,255,0.48)', fontSize:'0.93rem' }}>{t('features_sub')}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.25rem' }}>
            {features.map(f => (
              <GlowCard key={f.key} borderRadius={18} className="card-hover" style={{
                background:'rgba(255,255,255,0.035)',
                border:'1px solid ' + f.color + '18',
                padding:'2rem 1.5rem',
                animationDelay: f.delay,
              }}>
                <div style={{
                  width:52, height:52, borderRadius:14,
                  background:`${f.color}18`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  marginBottom:'1.2rem',
                  boxShadow:`0 0 24px ${f.color}20`,
                  transition:'box-shadow 0.3s, transform 0.3s',
                }}><f.Icon size={26} color={f.color} /></div>
                <h3 style={{ color:'#fff', fontWeight:700, fontSize:'1rem', marginBottom:'0.6rem' }}>{t(`${f.key}_title`)}</h3>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.86rem', lineHeight:1.72 }}>{t(`${f.key}_desc`)}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───── WHY US ───── */}
      <section className="reveal" style={{ padding:'4rem 1.5rem' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem', alignItems:'center' }}>
          <div className="reveal-left">
            <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.3rem)', fontWeight:800, fontFamily:'Playfair Display, serif', marginBottom:'1.5rem' }}>{t('why_title')}</h2>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:'0.85rem' }}>
                <div style={{
                  width:22, height:22, borderRadius:'50%',
                  background:'linear-gradient(135deg,#2563eb,#0ea5e9)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.66rem', fontWeight:900, flexShrink:0, marginTop:2,
                  boxShadow:'0 0 12px rgba(37,99,235,0.4)',
                }}>✓</div>
                <span style={{ color:'rgba(255,255,255,0.76)', fontSize:'0.93rem' }}>{t(`why${i}`)}</span>
              </div>
            ))}
          </div>
          <div className="reveal-right" style={{
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(56,189,248,0.15)',
            borderRadius:22, padding:'2.5rem', textAlign:'center',
            boxShadow:'0 0 60px rgba(37,99,235,0.1)',
          }}>
            <div style={{ fontSize:'4rem', marginBottom:'0.75rem', animation:'float 5s ease-in-out infinite' }}>🏆</div>
            <div style={{ fontSize:'4rem', fontWeight:900, color:'#38bdf8', fontFamily:'Playfair Display, serif', lineHeight:1 }}>
              94%
            </div>
            <div style={{ color:'rgba(255,255,255,0.5)', marginTop:8, marginBottom:'1.5rem', fontSize:'0.92rem' }}>Candidate Satisfaction Rate</div>
            <Link to="/assessment" className="btn-primary" style={{
              background:'linear-gradient(135deg,#2563eb,#0ea5e9)',
              color:'#fff', borderRadius:11, padding:'12px 28px',
              fontWeight:800, fontSize:'0.93rem', display:'inline-block',
            }}>{t('hero_cta')}</Link>
          </div>
        </div>
        <style>{`@media(max-width:700px){.why-inner{grid-template-columns:1fr !important}}`}</style>
      </section>

      {/* ───── BLOG PREVIEW ───── */}
      <section className="reveal" style={{ padding:'3rem 1.5rem 4rem', background:'rgba(0,0,0,0.15)' }}>
        <AdBanner />
        <div style={{ maxWidth:1100, margin:'2rem auto 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:12 }}>
            <div>
              <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.1rem)', fontWeight:800, fontFamily:'Playfair Display, serif' }}>{t('blog_title')}</h2>
              <p style={{ color:'rgba(255,255,255,0.4)', marginTop:5, fontSize:'0.87rem' }}>{t('blog_sub')}</p>
            </div>
            <Link to="/blog" className="link-hover" style={{
              background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
              color:'rgba(255,255,255,0.75)', borderRadius:10, padding:'9px 20px', fontSize:'0.86rem', fontWeight:600,
            }}>View All →</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))', gap:'1.25rem' }}>
            {blogArticles.slice(0,3).map(a => (
              <GlowCard key={a.id} borderRadius={16} className="card-hover" style={{
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                overflow:'hidden', display:'block',
              }}>
              <Link to={`/blog/${a.slug}`} style={{ display:'block', textDecoration:'none', color:'inherit' }}>
                <div style={{ overflow:'hidden', height:165 }}>
                  <img src={a.image} alt={a.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s ease' }}
                    onMouseOver={e=>e.target.style.transform='scale(1.06)'}
                    onMouseOut={e=>e.target.style.transform='scale(1)'}
                  />
                </div>
                <div style={{ padding:'1.25rem' }}>
                  <span style={{ background:'rgba(37,99,235,0.2)', color:'#93c5fd', borderRadius:6, padding:'3px 10px', fontSize:'0.73rem', fontWeight:700 }}>
                    {lang === 'ar' ? a.categoryAr : a.category}
                  </span>
                  <h3 style={{ color:'#fff', fontWeight:700, fontSize:'0.95rem', margin:'0.65rem 0 0.5rem', lineHeight:1.45 }}>
                    {lang === 'ar' ? a.titleAr : a.title}
                  </h3>
                  <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.83rem', lineHeight:1.65 }}>{lang === 'ar' ? a.previewAr : a.preview}</p>
                  <div style={{ color:'#38bdf8', fontSize:'0.83rem', fontWeight:700, marginTop:'0.75rem' }}>{t('blog_read_more')} →</div>
                </div>
              </Link>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="reveal" style={{ padding:'4rem 1.5rem 5rem' }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <h2 style={{ textAlign:'center', fontSize:'clamp(1.7rem,3.5vw,2.3rem)', fontWeight:800, fontFamily:'Playfair Display, serif', marginBottom:'2.5rem' }}>{t('faq_title')}</h2>
          {faqs.map(i => (
            <div key={i} style={{
              border:'1px solid rgba(255,255,255,0.09)', borderRadius:13,
              marginBottom:'0.65rem', overflow:'hidden',
              transition:'border-color 0.3s, box-shadow 0.3s',
              boxShadow: openFaq === i ? '0 0 0 1px rgba(56,189,248,0.2)' : 'none',
              borderColor: openFaq === i ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.09)',
            }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width:'100%', background: openFaq === i ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.03)',
                border:'none', cursor:'pointer', color:'#fff', padding:'1.1rem 1.25rem',
                textAlign:'left', fontSize:'0.93rem', fontWeight:600,
                display:'flex', justifyContent:'space-between', alignItems:'center',
                transition:'background 0.25s',
              }}>
                {t(`faq${i}_q`)}
                <span style={{ transform: openFaq===i ? 'rotate(180deg)' : '', transition:'transform 0.3s', color:'#38bdf8', marginLeft:12, flexShrink:0 }}>▼</span>
              </button>
              {openFaq === i && (
                <div style={{ padding:'0 1.25rem 1.1rem', color:'rgba(255,255,255,0.6)', fontSize:'0.9rem', lineHeight:1.78, animation:'pageIn 0.2s ease' }}>
                  {t(`faq${i}_a`)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>



      {/* ───── FINAL CTA ───── */}
      <section className="reveal" style={{
        padding:'5rem 1.5rem', textAlign:'center',
        background:'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(14,165,233,0.07))',
        borderTop:'1px solid rgba(37,99,235,0.18)',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(37,99,235,0.1) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem', animation:'float 4s ease-in-out infinite' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 style={{ fontSize:'clamp(1.7rem,4vw,2.7rem)', fontWeight:900, fontFamily:'Playfair Display, serif', marginBottom:'1rem' }}>Know your English level today</h2>
          <p style={{ color:'rgba(255,255,255,0.52)', marginBottom:'2rem', fontSize:'1rem' }}>AI-powered testing across speaking, writing, listening & reading — free, instant, bilingual</p>
          <Link to="/assessment" className="btn-primary" style={{
            background:'linear-gradient(135deg,#2563eb,#0ea5e9)',
            color:'#fff', borderRadius:13, padding:'16px 40px',
            fontSize:'1.05rem', fontWeight:800, display:'inline-block',
            boxShadow:'0 8px 30px rgba(37,99,235,0.5)',
          }}>{t('hero_cta')} →</Link>
        </div>
      </section>
    </div>
  )
}
