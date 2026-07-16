import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'
import { useLexi } from '../contexts/LexiContext.jsx'
import { LexiNavFox } from './LexiWidget.jsx'

export default function Navbar() {
  const { lang, setLang, t, isRTL } = useLang()
  const { greeting } = useLexi()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [activeLink, setActiveLink] = useState(null)
  const [menuRendered, setMenuRendered] = useState(false) // Fix #10: smooth mount/unmount
  const location  = useLocation()
  const navigate  = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  // Fix #9 & #10: lock body scroll while menu open; keep menu mounted briefly for exit animation
  useEffect(() => {
    if (menuOpen) {
      setMenuRendered(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      const t = setTimeout(() => setMenuRendered(false), 280)
      return () => clearTimeout(t)
    }
  }, [menuOpen])

  const links = [
    { to: '/',           label: t('nav_home') },
    { to: '/assessment', label: t('nav_assessment') },
    { to: '/blog',       label: t('nav_blog') },
    { to: '/about',      label: t('nav_about') },
    { to: '/contact',    label: t('nav_contact') },
  ]

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
  // The whole test-taking flow (choosing, taking, and reviewing a test) lives
  // on these two routes without ever changing the URL, so this is also how
  // App.jsx decides whether to hide the Footer.
  const isTestPage = location.pathname === '/assessment' || location.pathname === '/hr-practice'

  // Navigate to top of page with animation
  const handleNav = (e, to) => {
    e.preventDefault()
    setActiveLink(to)
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
        // True glassmorphism - reflects content behind
        background: scrolled
          ? 'rgba(6,10,22,0.75)'
          : 'rgba(6,10,22,0.45)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: scrolled
          ? '1px solid rgba(56,189,248,0.12)'
          : '1px solid rgba(255,255,255,0.05)',
        transition: 'background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
        padding: '0 1.5rem',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns:'320px 1fr auto', alignItems: 'center', height: 66, paddingLeft: '1.25rem', paddingRight: '1.25rem', gap: '0' }}>

          {/* Logo */}
          {/* Logo + Lexi badge side by side on the left */}
<div
  className="logo-container"
  style={{
    display:'flex',
    alignItems:'center',
    gap:10,
  }}
>            <Link to="/" onClick={(e) => handleNav(e, '/')} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width:50, height:50, borderRadius:10, overflow:'hidden', flexShrink:0, background:'#000000', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <img src="/logo2.png" alt="EnglishACE" style={{ height:'110%', marginTop:'-3%' }} onError={(e)=>{e.target.style.display='none'}}/>
              </div>
              <div>
                <div style={{ color:'#fff', fontWeight:800, fontSize:'1rem', letterSpacing:'-0.01em', lineHeight:1.1 }}>
                  English<span style={{ color:'#38bdf8' }}>ACE</span>
                </div>
                <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.6rem', letterSpacing:'0.14em', textTransform:'uppercase' }}>
                  AI English Platform
                </div>
              </div>
            </Link>

            {/* Lexi mini badge — sits next to the site name, mirrored for RTL so it never overlaps the nav controls */}
  {location.pathname === '/' && (
  <div
    className="hide-mobile"
    style={{
      display: 'flex',
  visibility: location.pathname === '/' ? 'visible' : 'hidden',
      alignItems: 'center',
      gap: 5,
      background: 'linear-gradient(135deg,rgba(14,165,233,.12),rgba(99,102,241,.1))',
      border: '1px solid rgba(56,189,248,.3)',
      borderRadius: 22,
      padding: '6px 12px',
      marginLeft: 15,
      maxWidth: 250
    }}
  >
    <LexiNavFox />
    <span
      dir="ltr"
      style={{
        color: '#93c5fd',
        fontSize: '0.72rem',
        fontWeight: 700,
        lineHeight: 1.3,
        maxWidth: 240
      }}
    >
      {greeting.text}
    </span>
  </div>
)}            </div>
          {/* Desktop Links */}
<div
  className="nav-desktop"
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.6rem',
    marginLeft: lang === 'ar' ? '150px' : '-150px',
  }}
>            {links.map(l => (
              <a
                key={l.to}
                href={l.to}
                onClick={(e) => handleNav(e, l.to)}
                style={{
                  color: isActive(l.to) ? '#38bdf8' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.88rem', fontWeight: 500,
                  position: 'relative', paddingBottom: 3,
                  transition: 'color 0.25s',
                  cursor: 'pointer',
                  opacity: activeLink === l.to ? 0.5 : 1,
                }}
              >
                {l.label}
                {isActive(l.to) && (
                  <span style={{
                    position: 'absolute', bottom: -2, left: 0, right: 0,
                    height: 2, borderRadius: 2,
                    background: 'linear-gradient(90deg, #2563eb, #38bdf8)',
                    animation: 'slideIn 0.3s ease',
                  }}/>
                )}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', borderRadius: 8, padding: '5px 14px',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
              transition: 'all 0.25s', letterSpacing: '0.02em',
            }}>{lang === 'en' ? 'عربي' : 'EN'}</button>

            {!isTestPage && (
              <a href="/assessment" onClick={(e) => handleNav(e, '/assessment')}
                className="nav-cta btn-primary"
                style={{
                  background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
                  color: '#fff', borderRadius: 10, padding: '8px 18px',
                  fontSize: '0.87rem', fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(37,99,235,0.45)',
                }}>{t('nav_start')} →</a>
            )}

            {/* Burger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="burger" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, display: 'flex', flexDirection: 'column', gap: 5,
            }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: 'block', width: 22, height: 2,
                  background: '#fff', borderRadius: 2,
                  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                  transform: menuOpen
                    ? (i===0 ? 'rotate(45deg) translate(5px,5px)' : i===2 ? 'rotate(-45deg) translate(5px,-5px)' : 'scaleX(0)')
                    : '',
                  opacity: menuOpen && i===1 ? 0 : 1,
                }}/>
              ))}
            </button>
          </div>
        </div>

      </nav>

      {/* Fix #13: Redesigned mobile menu — full-screen right-side drawer */}
      {menuRendered && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            className="no-print"
            style={{
              position: 'fixed', inset: 0, zIndex: 998,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(3px)',
              opacity: menuOpen ? 1 : 0,
              transition: 'opacity 0.32s ease',
            }}
          />
          <div
            className="no-print"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 999,
              width: 'min(320px, 84vw)',
              background: 'linear-gradient(165deg, rgba(9,14,30,0.99), rgba(6,10,22,0.99))',
              backdropFilter: 'blur(22px)',
              borderLeft: '1px solid rgba(56,189,248,0.14)',
              boxShadow: '-24px 0 60px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column',
              transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.36s cubic-bezier(0.16,1,0.3,1)',
              overflowY: 'auto',
            }}
          >
            {/* Drawer header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.4rem 1.4rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src="/logo2.png" alt="EnglishACE" style={{ height: '110%' }} onError={(e) => { e.target.style.display = 'none' }} />
                </div>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
                  English<span style={{ color: '#38bdf8' }}>ACE</span>
                </span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s, transform 0.2s',
                  transform: menuOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}
              >✕</button>
            </div>

            {/* Nav items */}
            <div style={{ padding: '0.6rem 1rem', flex: 1 }}>
              {links.map((l, i) => (
                <a key={l.to} href={l.to} onClick={(e) => handleNav(e, l.to)} style={{
                  display: 'flex', alignItems: 'center',
                  color: isActive(l.to) ? '#38bdf8' : 'rgba(255,255,255,0.82)',
                  background: isActive(l.to) ? 'rgba(56,189,248,0.08)' : 'transparent',
                  padding: '0.95rem 0.9rem', fontSize: '1.02rem', fontWeight: 600,
                  borderRadius: 12, marginBottom: 4,
                  transition: 'opacity 0.32s, transform 0.32s, background 0.2s',
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateX(0)' : 'translateX(24px)',
                  transitionDelay: menuOpen ? `${0.08 + i * 0.05}s` : '0s',
                }}>{l.label}</a>
              ))}
            </div>

            {/* Bottom actions */}
            <div style={{ padding: '1rem 1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} style={{
                width: '100%', background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.14)', color: '#fff',
                borderRadius: 10, padding: '11px', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 700, marginBottom: 10,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.32s, transform 0.32s',
                transitionDelay: menuOpen ? `${0.08 + links.length * 0.05}s` : '0s',
              }}>{lang === 'en' ? 'عربي' : 'EN'}</button>

              {!isTestPage && (
                <a href="/assessment" onClick={(e) => handleNav(e, '/assessment')} style={{
                  display: 'block', textAlign: 'center',
                  background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
                  color: '#fff', borderRadius: 10, padding: '13px',
                  fontWeight: 700, fontSize: '0.95rem',
                  boxShadow: '0 4px 18px rgba(37,99,235,0.4)',
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'opacity 0.32s, transform 0.32s',
                  transitionDelay: menuOpen ? `${0.13 + links.length * 0.05}s` : '0s',
                }}>{t('nav_start')} →</a>
              )}
            </div>
          </div>
        </>
      )}

     <style>{`
  .nav-cta { display: none !important; }
  .burger  { display: flex !important; }

  .hide-mobile {
    display: flex;
  }

  @media (max-width: 768px) {
    .hide-mobile {
      display: none !important;
    }
  }

  @media (min-width: 900px) {
    .nav-cta    { display: inline-block !important; }
    .nav-desktop{ display: flex !important; }
    .burger     { display: none !important; }
  }
  .logo-container {
  margin-left: -95px;
}

@media (max-width: 768px) {
  .logo-container {
    margin-left: -20px !important;
  }
}

  @media (max-width: 899px) {
    .nav-desktop { display: none !important; }
  }
`}</style>
    </>
  )
}
