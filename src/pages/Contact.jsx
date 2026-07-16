import React from 'react'
import { useLang } from '../contexts/LangContext.jsx'
import AdBanner from '../components/AdBanner.jsx'
import GlowCard from '../components/GlowCard.jsx'

// Real WhatsApp SVG logo
function WhatsAppIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#25D366"/>
      <path d="M35.18 12.81A15.85 15.85 0 0 0 24.04 8C15.24 8 8.07 15.16 8.07 23.96c0 2.8.73 5.53 2.13 7.95L8 40l8.28-2.17a15.94 15.94 0 0 0 7.76 1.98h.01c8.79 0 15.95-7.16 15.95-15.96 0-4.26-1.66-8.27-4.82-11.04z" fill="#25D366"/>
      <path d="M24.04 37.11h-.01a13.23 13.23 0 0 1-6.74-1.84l-.48-.29-5 1.31 1.34-4.88-.31-.5a13.19 13.19 0 0 1-2.03-7.05c0-7.29 5.94-13.22 13.24-13.22 3.54 0 6.86 1.38 9.36 3.88a13.16 13.16 0 0 1 3.88 9.36c-.01 7.3-5.94 13.23-13.25 13.23z" fill="white"/>
      <path d="M31.12 27.07c-.39-.2-2.31-1.14-2.67-1.27-.36-.13-.62-.2-.88.19-.26.39-1 1.27-1.23 1.53-.23.26-.46.29-.85.1-.39-.2-1.65-.61-3.14-1.94-1.16-1.04-1.94-2.32-2.17-2.71-.23-.39-.02-.6.17-.79.17-.18.39-.46.58-.69.2-.23.26-.39.39-.65.13-.26.06-.49-.03-.69-.1-.2-.88-2.12-1.2-2.9-.32-.76-.64-.66-.88-.67-.23-.01-.49-.01-.75-.01s-.69.1-1.05.49c-.36.39-1.37 1.34-1.37 3.26s1.4 3.78 1.6 4.04c.19.26 2.75 4.2 6.67 5.89.93.4 1.66.64 2.22.82.94.3 1.79.26 2.46.16.75-.11 2.31-.94 2.64-1.85.33-.92.33-1.7.23-1.86-.1-.16-.36-.26-.75-.46z" fill="#25D366"/>
    </svg>
  )
}

// Real Instagram SVG logo
function InstagramIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig1" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F58529"/>
          <stop offset="0.5" stopColor="#DD2A7B"/>
          <stop offset="1" stopColor="#8134AF"/>
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig1)"/>
      <circle cx="12" cy="12" r="3.8" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="17.2" cy="6.8" r="1" fill="white"/>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="white" strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

// Email icon
function EmailIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="rgba(37,99,235,0.8)"/>
      <path d="M4 8l8 5 8-5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="4" y="7" width="16" height="11" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

// Clock icon
function ClockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="rgba(100,116,139,0.6)"/>
      <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5" fill="none"/>
      <path d="M12 8v4l2.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function Contact() {
  const { t } = useLang()

  const contacts = [
    {
      IconComp: EmailIcon,
      label: 'Email',
      val: 'support@englishace.io',
      href: 'mailto:support@englishace.io',
      color: '#38bdf8',
    },
    {
      IconComp: WhatsAppIcon,
      label: 'WhatsApp',
      val: '+1 (000) 000-0000',
      href: 'https://wa.me/10000000000',
      color: '#25D366',
    },
    {
      IconComp: InstagramIcon,
      label: 'Instagram',
      val: '@yourbrand',
      href: 'https://www.instagram.com/yourbrand',
      color: '#DD2A7B',
    },
    {
      IconComp: ClockIcon,
      label: 'Hours',
      val: 'Mon–Fri, 9am–6pm (EET)',
      href: null,
      color: '#94a3b8',
    },
  ]

  return (
    <div style={{ background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 68 }}>
      <AdBanner position="top" />

      <section style={{
        padding: '5rem 1.5rem 3rem', textAlign: 'center',
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.13) 0%, transparent 70%)',
      }}>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '0.75rem' }}>
          {t('contact_title')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 460, margin: '0 auto', lineHeight: 1.78 }}>
          {t('contact_subtitle')}
        </p>
      </section>

      <section style={{ padding: '1rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontWeight: 800, fontSize: '1.65rem',
            fontFamily: 'Playfair Display, serif',
            marginBottom: '0.6rem', color: '#fff',
          }}>
            {t('contact_get_in_touch')}
          </h2>
          <div style={{ width: 46, height: 3, borderRadius: 2, background: 'linear-gradient(90deg,#2563eb,#38bdf8)', margin: '0 auto 2.25rem' }} />

          <div className="contact-cards-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem', textAlign: 'left',
          }}>
            {contacts.map(c => (
              <GlowCard key={c.label} borderRadius={16} className="card-hover" style={{
                background: 'rgba(255,255,255,0.035)',
                border: `1px solid ${c.color}22`,
              }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '1.1rem 1.25rem' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: `${c.color}18`, border: `1px solid ${c.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <c.IconComp />
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.72rem', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                      {c.label}
                    </div>
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noreferrer" style={{
                        color: c.color, fontSize: '0.94rem', fontWeight: 700,
                        textDecoration: 'none', transition: 'opacity 0.2s',
                      }}
                        onMouseOver={e => e.target.style.opacity = '0.75'}
                        onMouseOut={e => e.target.style.opacity = '1'}
                      >{c.val}</a>
                    ) : (
                      <div style={{ color: '#fff', fontSize: '0.93rem', fontWeight: 500 }}>{c.val}</div>
                    )}
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:680px){.contact-cards-grid{grid-template-columns:1fr !important}}`}</style>
      </section>
    </div>
  )
}
