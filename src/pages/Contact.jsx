import React, { useState } from 'react'
import { useLang } from '../contexts/LangContext.jsx'
import AdBanner from '../components/AdBanner.jsx'

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
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 1200)
  }

  const contacts = [
    {
      IconComp: EmailIcon,
      label: 'Email',
      val: 'mr.far0.0uk.@gmail.com',
      href: 'mailto:mr.far0.0uk.@gmail.com',
    },
    {
      IconComp: WhatsAppIcon,
      label: 'WhatsApp',
      val: '01272253531',
      href: 'https://wa.me/201272253531',
    },
    {
      IconComp: InstagramIcon,
      label: 'Instagram',
      val: '@farooukeldeen',
      href: 'https://www.instagram.com/farooukeldeen?igsh=MTdmZnM1MDMwcm5rNA%3D%3D&utm_source=qr',
    },
    {
      IconComp: ClockIcon,
      label: 'Hours',
      val: 'Mon–Fri, 9am–6pm (EET)',
      href: null,
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
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '2.5rem', alignItems: 'start',
        }}>
          {/* Contact Info */}
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.85)' }}>
              Get In Touch
            </h2>
            {contacts.map(c => (
              <div key={c.label} className="card-hover" style={{
                display: 'flex', gap: 14, alignItems: 'center',
                marginBottom: '0.9rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '1rem 1.25rem',
              }}>
                <div style={{ flexShrink: 0 }}>
                  <c.IconComp />
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.72rem', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                    {c.label}
                  </div>
                  {c.href ? (
                    <a href={c.href} target="_blank" rel="noreferrer" style={{
                      color: '#38bdf8', fontSize: '0.93rem', fontWeight: 600,
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
            ))}
          </div>

          {/* Form */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 18, padding: '2rem',
          }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem', animation: 'float 3s ease-in-out infinite' }}>✅</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{t('contact_sent')}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem' }}>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {[
                  { key: 'name', label: t('contact_name'), type: 'text', ph: 'Your full name' },
                  { key: 'email', label: t('contact_email'), type: 'email', ph: 'you@example.com' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: '1.1rem' }}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.84rem', marginBottom: 6, fontWeight: 600 }}>{f.label}</label>
                    <input type={f.type} required placeholder={f.ph}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                        padding: '11px 14px', color: '#fff', fontSize: '0.92rem',
                        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                    />
                  </div>
                ))}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.84rem', marginBottom: 6, fontWeight: 600 }}>{t('contact_message')}</label>
                  <textarea required rows={5} placeholder="Write your message here..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                      padding: '11px 14px', color: '#fff', fontSize: '0.92rem',
                      outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary" style={{
                  width: '100%',
                  background: loading ? 'rgba(37,99,235,0.4)' : 'linear-gradient(135deg,#2563eb,#0ea5e9)',
                  color: '#fff', border: 'none', borderRadius: 11,
                  padding: '13px', fontSize: '0.95rem', fontWeight: 700,
                  cursor: loading ? 'default' : 'pointer',
                }}>
                  {loading ? 'Sending...' : t('contact_send')}
                </button>
              </form>
            )}
          </div>
        </div>
        <style>{`@media(max-width:680px){section > div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr !important}}`}</style>
      </section>
    </div>
  )
}
