import React from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'
import GlowCard from '../components/GlowCard.jsx'

// ── Hardcoded developer photo — change this path to update the image ──────────
// Place your photo as public/farouk.jpg and update the path below
const DEVELOPER_PHOTO = '/farouk.jpg'   // ← change this path to use your photo

export default function About() {
  const { t } = useLang()

  return (
    <div style={{ background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 68 }}>

      {/* Hero */}
      <section style={{
        padding: '5rem 1.5rem 3rem', textAlign: 'center',
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.14) 0%, transparent 70%)',
      }}>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '0.75rem' }}>
          {t('about_title')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.52)', maxWidth: 540, margin: '0 auto', fontSize: '1rem', lineHeight: 1.78 }}>
          {t('about_subtitle')}
        </p>
      </section>

      {/* Mission */}
      <section style={{ padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '1rem', textAlign: 'center' }}>{t('about_mission')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.88, fontSize: '0.97rem', textAlign: 'center', marginBottom: '1rem' }}>{t('about_mission_text')}</p>
          <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.88, fontSize: '0.97rem', textAlign: 'center' }}>
            Our platform combines advanced AI language models with real English testing scenarios — speaking, writing, grammar, vocabulary, listening, and reading — to give learners the most complete and accurate proficiency evaluation available online.
          </p>
        </div>
      </section>

      {/* Developer card */}
      <section style={{ padding: '2rem 1.5rem 3rem', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '2rem' }}>{t('about_team')}</h2>
          <Link to="/contact" style={{ display: 'block', textDecoration: 'none' }}>
            <GlowCard borderRadius={20} style={{
              background: 'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(14,165,233,0.08))',
              border: '1px solid rgba(56,189,248,0.2)',
              padding: '2.5rem 2rem', textAlign: 'center',
              boxShadow: '0 0 40px rgba(37,99,235,0.1)',
              cursor: 'pointer',
            }}>
              {/* Fixed developer photo — no upload for users */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <div style={{
                  width: 96, height: 96, borderRadius: '50%',
                  border: '3px solid rgba(56,189,248,0.45)',
                  overflow: 'hidden',
                  boxShadow: '0 0 24px rgba(56,189,248,0.25)',
                  background: 'linear-gradient(135deg,rgba(37,99,235,0.25),rgba(14,165,233,0.2))',
                  flexShrink: 0,
                }}>
                  <img
                    src={DEVELOPER_PHOTO}
                    alt="Farouk El-Deen"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    onError={(e) => {
                      // Fallback SVG avatar if photo not found
                      e.target.style.display = 'none'
                      e.target.parentNode.innerHTML = `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="padding:20px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
                    }}
                  />
                </div>
              </div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', marginBottom: 6 }}>Farouk El-Deen</div>
              <div style={{ color: '#38bdf8', fontSize: '0.88rem', fontWeight: 600, marginBottom: 10 }}>Founder & Platform Director</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                Click to get in touch
              </div>
            </GlowCard>
          </Link>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '1.5rem', textAlign: 'center' }}>Our Values</h2>
          {[
            { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>), color:'#0ea5e9', title:'Accuracy First', desc:'Our AI evaluations are based on real linguistic research and validated against professional English proficiency standards.' },
            { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>), color:'#10b981', title:'Accessibility', desc:'We believe every learner deserves free access to professional English testing tools regardless of location or budget.' },
            { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>), color:'#8b5cf6', title:'Privacy Respected', desc:'No data is stored on our servers. Your voice, writing, and answers stay in your browser session only.' },
            { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>), color:'#f59e0b', title:'Continuous Improvement', desc:'We update our question banks, AI models, and UX regularly based on user feedback and the latest language teaching research.' },
          ].map(v => (
            <GlowCard key={v.title} borderRadius={14} style={{ display:'flex', gap:'1rem', alignItems:'flex-start', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', padding:'1.25rem', marginBottom:'1rem' }}>
              <div style={{ width:42, height:42, borderRadius:11, background:v.color+'18', border:'1px solid '+v.color+'30', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{v.icon}</div>
              <div>
                <div style={{ color:'#fff', fontWeight:700, marginBottom:4 }}>{v.title}</div>
                <div style={{ color:'rgba(255,255,255,0.52)', fontSize:'0.88rem', lineHeight:1.7 }}>{v.desc}</div>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'3rem 1.5rem 5rem', textAlign:'center' }}>
        <div style={{ display:'inline-flex', gap:14, flexWrap:'wrap', justifyContent:'center' }}>
          <Link to="/contact" style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', borderRadius:12, padding:'13px 28px', fontWeight:700, fontSize:'0.95rem', display:'inline-block' }}>{t('about_contact_cta')}</Link>
          <Link to="/assessment" style={{ background:'linear-gradient(135deg,#2563eb,#0ea5e9)', color:'#fff', borderRadius:12, padding:'13px 28px', fontWeight:700, fontSize:'0.95rem', display:'inline-block' }}>{t('hero_cta')} →</Link>
        </div>
      </section>
    </div>
  )
}
