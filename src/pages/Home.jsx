import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'
import { blogArticles } from '../data/blogArticles.js'
import AdBanner from '../components/AdBanner.jsx'
import GlowCard from '../components/GlowCard.jsx'
import { IconSparkle, IconTrophy } from '../components/Icons.jsx'
import FloatingCard from '../components/FloatingCard.jsx'
import { IconSpeaking, IconWriting, IconGrammar, IconVocabulary, IconListening, IconReading, IconHR, TestColorMap } from '../components/TestIcons.jsx'

// ── Fix #16: More phrases, equal intervals, different colors ──────────────────
const ROTATE_COLORS = [
  '#60a5fa', '#a78bfa', '#34d399', '#f59e0b',
  '#06b6d4', '#f472b6', '#fb923c', '#818cf8',
  '#4ade80', '#38bdf8', '#e879f9', '#fbbf24',
]

const welcomeEN = [
  'Know your exact English level in minutes',
  'Speak confidently in interviews and meetings',
  'Master pronunciation with AI feedback',
  'Identify your grammar gaps instantly',
  'Boost your IELTS and TOEFL score',
  'Write like a native English speaker',
  'Understand spoken English at full speed',
  'Expand your professional vocabulary',
  'Get personalized AI coaching 24/7',
  'Track your progress test by test',
  'Ace any English job interview',
  'Sound natural, clear, and confident',
  'Test your English level with AI',
  'Get an instant AI-powered English certificate',
  'Train smarter. Write better. Speak with confidence.',
]

const welcomeAR = [
  'اختبر مستوى إنجليزيتك بالذكاء الاصطناعي',
  'احصل على شهادة مستوى الإنجليزية فوراً',
  'اعرف مستواك الحقيقي في دقائق',
  'تدرّب بذكاء… واتكلم بثقة',
  'حسّن نطقك مع تحليل الذكاء الاصطناعي',
  'اكتشف أخطاءك النحوية فوراً',
]

const INTERVAL_MS = 3000 // Fix: equal interval for every phrase

// Animated welcome with smooth fade + color change
function AnimatedWelcome({ phrases, colors }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % phrases.length)
        setVisible(true)
      }, 350)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [phrases])

  return (
    <div style={{
      fontSize: 'clamp(0.9rem,2vw,1.15rem)',
      fontWeight: 700,
      marginBottom: '0.8rem',
      letterSpacing: '0.01em',
      minHeight: '1.8em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{
        color: colors[index % colors.length],
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease, color 0s',
        display: 'inline-block',
        textShadow: `0 0 20px ${colors[index % colors.length]}40`,
      }}>{phrases[index]}</span>
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

  const phrases = lang === 'ar' ? welcomeAR : welcomeEN

  useReveal()

  useEffect(() => {
    const id = setInterval(() => setActivePreview(p => (p + 1) % previewSections.length), 3500)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ background: 'rgb(6,10,22)', color: '#fff', minHeight: '100vh' }}>

      {/* ───── HERO ───── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'calc(68px + 2rem) 1.5rem 4rem',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        {/* Orbs */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'#2563eb', filter:'blur(120px)', opacity:0.07, top:-200, left:-100 }}/>
          <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'#8b5cf6', filter:'blur(100px)', opacity:0.08, bottom:-100, right:-50 }}/>
          <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'#06b6d4', filter:'blur(80px)', opacity:0.06, top:'35%', left:'60%' }}/>
        </div>

        <div style={{ position:'relative', zIndex:1, maxWidth:820, width:'100%' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.25)', borderRadius:100, padding:'6px 18px', fontSize:'0.8rem', fontWeight:700, color:'#60a5fa', marginBottom:'1.5rem', letterSpacing:'0.04em' }}>
            ✦ AI-Powered English Assessment
          </div>

          <h1 style={{ fontSize:'clamp(2.2rem,6vw,4rem)', fontWeight:900, letterSpacing:'-1.5px', lineHeight:1.08, marginBottom:'0.8rem', fontFamily:'Playfair Display, serif' }}>
            Test Your English Level<br/>
            <span style={{ background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Like a Pro</span>
          </h1>

          {/* Fix #16: Rotating text with equal intervals + colors */}
          <AnimatedWelcome phrases={phrases} colors={ROTATE_COLORS} />

          <p style={{ color:'rgba(255,255,255,0.52)', fontSize:'clamp(0.9rem,2vw,1.05rem)', maxWidth:560, margin:'0 auto 2.5rem', lineHeight:1.75 }}>
            {t('hero_sub')}
          </p>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, flexWrap:'wrap' }}>
            <Link to="/assessment" style={{
              background:'linear-gradient(135deg,#2563eb,#0ea5e9)',
              color:'#fff', borderRadius:13, padding:'15px 36px',
              fontSize:'1.02rem', fontWeight:800, display:'inline-flex',
              alignItems:'center', gap:8, textDecoration:'none',
              boxShadow:'0 8px 28px rgba(37,99,235,0.4)',
              transition:'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 36px rgba(37,99,235,0.5)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 8px 28px rgba(37,99,235,0.4)'}}
            >
              {t('hero_cta')} →
            </Link>
            <a href="#tests" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.8)', borderRadius:13, padding:'14px 28px', fontSize:'1rem', fontWeight:600, textDecoration:'none', transition:'background 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ───── TEST CARDS ───── */}
      <section id="tests" className="reveal" style={{ padding:'4rem 1.5rem', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <h2 style={{ fontSize:'clamp(1.7rem,4vw,2.5rem)', fontWeight:800, fontFamily:'Playfair Display, serif', marginBottom:'0.6rem' }}>{t('tests_title') || 'Choose Your Test'}</h2>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.93rem' }}>{t('tests_sub') || 'AI-powered analysis across all 6 English skills'}</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:'1rem', marginBottom:'1rem' }}>
          {[
            { key:'speaking',   Icon:IconSpeaking,   color:'#8b5cf6', label:'Speaking',   time:'~5 min',  route:'/assessment?test=speaking'  },
            { key:'writing',    Icon:IconWriting,    color:'#10b981', label:'Writing',    time:'~10 min', route:'/assessment?test=writing'   },
            { key:'grammar',    Icon:IconGrammar,    color:'#f59e0b', label:'Grammar',    time:'~8 min',  route:'/assessment?test=grammar'   },
            { key:'vocabulary', Icon:IconVocabulary, color:'#ec4899', label:'Vocabulary', time:'~6 min',  route:'/assessment?test=vocabulary'},
            { key:'listening',  Icon:IconListening,  color:'#0ea5e9', label:'Listening',  time:'~8 min',  route:'/assessment?test=listening' },
            { key:'reading',    Icon:IconReading,    color:'#f97316', label:'Reading',    time:'~10 min', route:'/assessment?test=reading'   },
          ].map(({ key, Icon, color, label, time, route }) => (
            <Link key={key} to={route} style={{
              background:'rgba(255,255,255,0.035)', border:`1px solid ${color}18`,
              borderRadius:18, padding:'1.5rem 1.25rem',
              textDecoration:'none', color:'inherit',
              display:'flex', flexDirection:'column', gap:10,
              transition:'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=`0 16px 40px rgba(0,0,0,0.4)`;e.currentTarget.style.borderColor=`${color}40`}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';e.currentTarget.style.borderColor=`${color}18`}}
            >
              <div style={{ width:48, height:48, borderRadius:13, background:`${color}18`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={24} color={color} />
              </div>
              <div style={{ fontWeight:700, fontSize:'1rem' }}>{label}</div>
              <div style={{ color:'rgba(255,255,255,0.38)', fontSize:'0.78rem' }}>⏱ {time}</div>
            </Link>
          ))}
        </div>

        {/* HR Bonus */}
        <Link to="/hr-practice" style={{
          background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.2)',
          borderRadius:18, padding:'1.25rem 1.5rem',
          textDecoration:'none', color:'inherit',
          display:'flex', alignItems:'center', gap:16,
          transition:'transform 0.25s, border-color 0.25s',
        }}
          onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='rgba(124,58,237,0.4)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='rgba(124,58,237,0.2)'}}
        >
          <div style={{ width:48, height:48, borderRadius:13, background:'rgba(124,58,237,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <IconHR size={24} color="#a78bfa" />
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:3 }}>
              HR Interview Practice
              <span style={{ marginLeft:10, background:'rgba(245,158,11,0.15)', color:'#f59e0b', fontSize:'0.68rem', fontWeight:700, borderRadius:100, padding:'2px 9px', verticalAlign:'middle' }}>BONUS</span>
            </div>
            <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.83rem' }}>Practice real HR interview questions with full AI feedback</div>
          </div>
          <div style={{ marginLeft:'auto', color:'rgba(255,255,255,0.3)', fontSize:'1.2rem', flexShrink:0 }}>→</div>
        </Link>
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
              <GlowCard key={f.key} borderRadius={18} className="card-hover" style={{ background:'rgba(255,255,255,0.035)', border:'1px solid ' + f.color + '18', padding:'2rem 1.5rem', animationDelay: f.delay }}>
                <div style={{ width:52, height:52, borderRadius:14, background:`${f.color}18`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.2rem', boxShadow:`0 0 24px ${f.color}20`, transition:'box-shadow 0.3s, transform 0.3s' }}>
                  <f.Icon size={26} color={f.color} />
                </div>
                <h3 style={{ color:'#fff', fontWeight:700, fontSize:'1rem', marginBottom:'0.6rem' }}>{t(`${f.key}_title`)}</h3>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.86rem', lineHeight:1.72 }}>{t(`${f.key}_desc`)}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───── WHY US ───── */}
      <section className="reveal" style={{ padding:'4rem 1.5rem' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem', alignItems:'center' }} className="why-inner">
          <div className="reveal-left">
            <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.3rem)', fontWeight:800, fontFamily:'Playfair Display, serif', marginBottom:'1.5rem' }}>{t('why_title')}</h2>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:'0.85rem' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#0ea5e9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.66rem', fontWeight:900, flexShrink:0, marginTop:2, boxShadow:'0 0 12px rgba(37,99,235,0.4)' }}>✓</div>
                <span style={{ color:'rgba(255,255,255,0.76)', fontSize:'0.93rem' }}>{t(`why${i}`)}</span>
              </div>
            ))}
          </div>
          <div className="reveal-right" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(56,189,248,0.15)', borderRadius:22, padding:'2.5rem', textAlign:'center', boxShadow:'0 0 60px rgba(37,99,235,0.1)' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'0.75rem', animation:'float 5s ease-in-out infinite' }}>
              <div style={{ width:70, height:70, borderRadius:'50%', background:'rgba(56,189,248,0.12)', border:'1px solid rgba(56,189,248,0.28)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <IconTrophy size={32} color="#38bdf8" />
              </div>
            </div>
            <div style={{ fontSize:'4rem', fontWeight:900, color:'#38bdf8', fontFamily:'Playfair Display, serif', lineHeight:1 }}>94%</div>
            <div style={{ color:'rgba(255,255,255,0.5)', marginTop:8, marginBottom:'1.5rem', fontSize:'0.92rem' }}>Candidate Satisfaction Rate</div>
            <Link to="/assessment" className="btn-primary hero-cta-btn" style={{ background:'linear-gradient(135deg,#2563eb,#0ea5e9)', color:'#fff', borderRadius:11, fontWeight:800, display:'inline-block' }}>
              {t('hero_cta')}
            </Link>
          </div>
        </div>
        <style>{`
          @media(max-width:700px){.why-inner{grid-template-columns:1fr !important}}
          .hero-cta-btn { padding:12px 28px; font-size:0.93rem; }
          @media(max-width:768px){ .hero-cta-btn { padding:10px 20px; font-size:0.8rem; } }
        `}</style>
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
            <Link to="/blog" className="link-hover" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.75)', borderRadius:10, padding:'9px 20px', fontSize:'0.86rem', fontWeight:600 }}>View All →</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))', gap:'1.25rem' }}>
            {blogArticles.slice(0,3).map(a => (
              <GlowCard key={a.id} borderRadius={16} className="card-hover" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', overflow:'hidden', display:'block' }}>
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
            <div key={i} style={{ border:'1px solid rgba(255,255,255,0.09)', borderRadius:13, marginBottom:'0.65rem', overflow:'hidden', transition:'border-color 0.3s, box-shadow 0.3s', boxShadow: openFaq === i ? '0 0 0 1px rgba(56,189,248,0.2)' : 'none', borderColor: openFaq === i ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.09)' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width:'100%', background: openFaq === i ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.03)', border:'none', cursor:'pointer', color:'#fff', padding:'1.1rem 1.25rem', textAlign:'left', fontSize:'0.93rem', fontWeight:600, display:'flex', justifyContent:'space-between', alignItems:'center', transition:'background 0.25s' }}>
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
      <section className="reveal" style={{ padding:'5rem 1.5rem', textAlign:'center', background:'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(14,165,233,0.07))', borderTop:'1px solid rgba(37,99,235,0.18)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(37,99,235,0.1) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem', animation:'float 4s ease-in-out infinite' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 style={{ fontSize:'clamp(1.7rem,4vw,2.7rem)', fontWeight:900, fontFamily:'Playfair Display, serif', marginBottom:'1rem' }}>Know your English level today</h2>
          <p style={{ color:'rgba(255,255,255,0.52)', marginBottom:'2rem', fontSize:'1rem' }}>AI-powered testing across speaking, writing, listening & reading — free, instant, bilingual</p>
          <Link to="/assessment" className="btn-primary" style={{ background:'linear-gradient(135deg,#2563eb,#0ea5e9)', color:'#fff', borderRadius:13, padding:'16px 40px', fontSize:'1.05rem', fontWeight:800, display:'inline-block', boxShadow:'0 8px 30px rgba(37,99,235,0.5)' }}>{t('hero_cta')} →</Link>
        </div>
      </section>
    </div>
  )
}
