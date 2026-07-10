import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'
import { useLexi } from '../contexts/LexiContext.jsx'
import { LexiNavFox } from './LexiWidget.jsx'

export default function Navbar() {
  const { lang, setLang, t } = useLang()
  const { greeting } = useLexi()
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [activeLink,setActiveLink]= useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fix #9: Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  // Fix #9: Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { to: '/',           label: t('nav_home') },
    { to: '/assessment', label: t('nav_assessment') },
    { to: '/blog',       label: t('nav_blog') },
    { to: '/about',      label: t('nav_about') },
    { to: '/contact',    label: t('nav_contact') },
  ]

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const handleNav = (e, to) => {
    e.preventDefault()
    setActiveLink(to)
    setMenuOpen(false)
    setTimeout(() => {
      navigate(to)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setActiveLink(null)
    }, 120)
  }

  return (
    <>
      <nav className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(6,10,22,0.92)' : 'rgba(6,10,22,0.7)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: scrolled ? '1px solid rgba(56,189,248,0.12)' : '1px solid rgba(255,255,255,0.05)',
        transition: 'background 0.4s ease, border-color 0.4s ease',
        padding: '0 1.25rem',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center',
          height: 66, gap: 0,
        }}>

          {/* Logo */}
          <Link to="/" onClick={(e) => handleNav(e, '/')} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            textDecoration: 'none', flexShrink: 0,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo2.png" alt="EnglishACE" style={{ height: '110%', marginTop: '-3%' }} onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                English<span style={{ color: '#38bdf8' }}>ACE</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                AI English Platform
              </div>
            </div>
          </Link>

          {/* Lexi badge — desktop only */}
          {location.pathname === '/' && (
            <div className="lexi-badge" style={{
              display: 'flex', alignItems: 'center', gap: 5, marginLeft: 16,
              background: 'linear-gradient(135deg,rgba(14,165,233,0.12),rgba(99,102,241,0.1))',
              border: '1px solid rgba(56,189,248,0.3)',
              borderRadius: 22, padding: '5px 12px 5px 5px',
              maxWidth: 260,
            }}>
              <LexiNavFox />
              <span style={{ color: '#93c5fd', fontSize: '0.7rem', fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {greeting.text}
              </span>
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Desktop Nav Links */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', marginRight: 16 }}>
            {links.map(l => (
              <a key={l.to} href={l.to} onClick={(e) => handleNav(e, l.to)} style={{
                color: isActive(l.to) ? '#38bdf8' : 'rgba(255,255,255,0.7)',
                fontSize: '0.87rem', fontWeight: 500,
                position: 'relative', paddingBottom: 3,
                transition: 'color 0.25s', cursor: 'pointer',
                opacity: activeLink === l.to ? 0.5 : 1,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                {l.label}
                {isActive(l.to) && (
                  <span style={{
                    position: 'absolute', bottom: -2, left: 0, right: 0,
                    height: 2, borderRadius: 2,
                    background: 'linear-gradient(90deg,#2563eb,#38bdf8)',
                    animation: 'slideIn 0.3s ease',
                  }} />
                )}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', borderRadius: 8, padding: '5px 13px',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
              transition: 'all 0.25s', whiteSpace: 'nowrap',
            }}>{lang === 'en' ? 'عربي' : 'EN'}</button>

            <a href="/assessment" onClick={(e) => handleNav(e, '/assessment')}
              className="nav-cta"
              style={{
                background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
                color: '#fff', borderRadius: 10, padding: '8px 18px',
                fontSize: '0.87rem', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(37,99,235,0.4)', whiteSpace: 'nowrap',
              }}>{t('nav_start')} →</a>

            {/* Fix #9 & #10: Smoother hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="burger"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 5, borderRadius: 8 }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: 'block', width: 22, height: 2,
                  background: '#fff', borderRadius: 2,
                  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                  transform: menuOpen
                    ? (i === 0 ? 'rotate(45deg) translate(5px,5px)' : i === 2 ? 'rotate(-45deg) translate(5px,-5px)' : 'scaleX(0)')
                    : '',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Fix #9 & #10: Mobile menu — slide-in drawer with overlay */}
      {/* Overlay */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer — Fix #10: redesigned, smoother, cleaner */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        zIndex: 999,
        width: 'min(300px, 82vw)',
        background: 'linear-gradient(160deg, rgba(8,14,32,0.98) 0%, rgba(10,18,38,0.98) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(56,189,248,0.12)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Drawer Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0,
          background: 'rgba(8,14,32,0.9)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo2.png" alt="EnglishACE" style={{ height: '110%' }} onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.1 }}>
                English<span style={{ color: '#38bdf8' }}>ACE</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                AI English Platform
              </div>
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', fontSize: '1rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#fca5a5' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          >✕</button>
        </div>

        {/* Nav Items — staggered animation */}
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {links.map((l, i) => (
            <a key={l.to} href={l.to} onClick={(e) => handleNav(e, l.to)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 22px',
                color: isActive(l.to) ? '#38bdf8' : 'rgba(255,255,255,0.78)',
                fontWeight: isActive(l.to) ? 700 : 500,
                fontSize: '1rem', textDecoration: 'none',
                borderLeft: isActive(l.to) ? '3px solid #38bdf8' : '3px solid transparent',
                background: isActive(l.to) ? 'rgba(56,189,248,0.06)' : 'transparent',
                transition: 'all 0.2s',
                animation: menuOpen ? `drawerItem 0.35s ease ${i * 0.05 + 0.05}s both` : 'none',
              }}
              onMouseEnter={e => { if (!isActive(l.to)) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff' } }}
              onMouseLeave={e => { if (!isActive(l.to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.78)' } }}
            >
              <span style={{ fontSize: '1.1rem' }}>
                {l.to === '/' ? '🏠' : l.to === '/assessment' ? '📝' : l.to === '/blog' ? '📰' : l.to === '/about' ? 'ℹ️' : '📬'}
              </span>
              {l.label}
            </a>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '10px 20px' }} />
          <a href="/hr-practice" onClick={(e) => handleNav(e, '/hr-practice')}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 22px',
              color: 'rgba(255,255,255,0.78)', fontWeight: 500,
              fontSize: '1rem', textDecoration: 'none',
              borderLeft: '3px solid transparent',
              transition: 'all 0.2s',
              animation: menuOpen ? `drawerItem 0.35s ease 0.35s both` : 'none',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>👤</span>
            HR Interview
            <span style={{ marginLeft: 6, background: 'rgba(245,158,11,0.18)', color: '#f59e0b', fontSize: '0.65rem', fontWeight: 700, borderRadius: 100, padding: '1px 7px' }}>BONUS</span>
          </a>
        </nav>

        {/* Footer actions */}
        <div style={{ padding: '18px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => { setLang(lang === 'en' ? 'ar' : 'en') }} style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', borderRadius: 10, padding: '11px', cursor: 'pointer',
            fontSize: '0.9rem', fontWeight: 700, width: '100%',
          }}>{lang === 'en' ? 'عربي 🌐' : 'English 🌐'}</button>
          <a href="/assessment" onClick={(e) => handleNav(e, '/assessment')} style={{
            display: 'block', textAlign: 'center',
            background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
            color: '#fff', borderRadius: 10, padding: '13px',
            fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
          }}>{t('nav_start')} →</a>
        </div>
      </div>

      <style>{`
        /* Fix #9: Responsive nav */
        .nav-cta      { display: none !important; }
        .burger       { display: flex !important; }
        .nav-desktop  { display: none !important; }
        .lexi-badge   { display: none !important; }

        @media (min-width: 900px) {
          .nav-cta     { display: inline-block !important; }
          .nav-desktop { display: flex !important; }
          .burger      { display: none !important; }
          .lexi-badge  { display: flex !important; }
        }

        /* Fix #10: Drawer item animation */
        @keyframes drawerItem {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideIn {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </>
  )
}
