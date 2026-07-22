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
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', height: 66, paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>

          {/* Logo + Lexi badge — pinned to the visual "start" edge (left in
              LTR, right in RTL), and mirrors internally with the language
              too, same as before the badge existed. Absolutely positioned
              so its width (which changes with the badge's text) never
              affects where the nav links below end up. */}
          <div
            className="logo-container"
            style={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              ...(isRTL ? { right: 0 } : { left: 0 }),
              display:'flex',
              alignItems:'center',
              gap:10,
            }}
          >
            <Link to="/" onClick={(e) => handleNav(e, '/')} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
              <div className="navbar-logo-img" style={{ width:50, height:50, borderRadius:10, overflow:'hidden', flexShrink:0, background:'#000000', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <img src="/logo2.png" alt="EnglishACE" style={{ height:'110%', marginTop:'-3%' }} onError={(e)=>{e.target.style.display='none'}}/>
              </div>
              <div>
                <div style={{ color:'#fff', fontWeight:800, fontSize:'1rem', letterSpacing:'-0.01em', lineHeight:1.1 }}>
                  English<span style={{ color:'#38bdf8' }}>ACE</span>
                </div>
                <div className="navbar-subtitle" style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.6rem', letterSpacing:'0.14em', textTransform:'uppercase' }}>
                  AI English Platform
                </div>
              </div>
            </Link>

            {/* Lexi mini badge — mirrors to the logo's other side for RTL, same as EN */}
         {location.pathname === '/' && (
  <div
    className="hide-mobile"
    style={{
      display:'flex',
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems:'center',
      gap:5,

      background:'linear-gradient(135deg,rgba(14,165,233,0.12),rgba(99,102,241,0.1))',
      border:'1px solid rgba(56,189,248,0.3)',
      borderRadius:22,
      padding: isRTL ? '6px 6px 6px 14px' : '6px 14px 6px 6px',
      maxWidth:165,
      minWidth:0,
    }}
  >
    <LexiNavFox />
    <span
      dir="ltr"
      style={{
        color:'#93c5fd',
        fontSize:'0.72rem',
        fontWeight:700,
        lineHeight:1.3,
        maxWidth:115,
      }}
    >
      {greeting.text}
    </span>
  </div>
)}
            </div>
          {/* Desktop Links — truly centered on the bar itself, independent of
              how wide the logo/badge or the right-side controls are */}
          <div className="nav-desktop" style={{
            position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', alignItems: 'center', gap: '1.6rem', whiteSpace: 'nowrap',
          }}>
            {links.map(l => (
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

          <div style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            ...(isRTL ? { left: 0 } : { right: 0 }),
            display: 'flex', alignItems: 'center', gap: 10,
          }} className="navbar-right-zone">
            <button className="navbar-lang-btn" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', borderRadius: 8, padding: '5px 14px',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
              transition: 'all 0.25s', letterSpacing: '0.02em',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>{lang === 'en' ? 'عربي' : 'EN'}</button>

            {!isTestPage && (
              <a href="/assessment" onClick={(e) => handleNav(e, '/assessment')}
                className="nav-cta btn-primary"
                style={{
                  background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
                  color: '#fff', borderRadius: 10, padding: '8px 18px',
                  fontSize: '0.87rem', fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(37,99,235,0.45)',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>{t('nav_start')} →</a>
            )}

            {/* Burger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="burger" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, display: 'flex', flexDirection: 'column', gap: 5,
              flexShrink: 0,
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

  /* The greeting badge only fits without crowding the nav links once the
     grid (max-width 1200px) has room to spare — empirically that needs a
     viewport of ~1245px+, so 1350px is used here for a safe margin. */
  @media (max-width: 1350px) {
    .hide-mobile {
      display: none !important;
    }
  }

  @media (min-width: 900px) {
    .nav-cta    { display: inline-block !important; }
    .nav-desktop{ display: flex !important; }
    .burger     { display: none !important; }
  }

  @media (max-width: 899px) {
    .nav-desktop { display: none !important; }
  }

  /* On narrow phones, the logo block and the language/burger controls sit
     at opposite edges with no shared container to shrink them — so on very
     small screens they can run into each other. Compacting the least
     essential parts (tagline, icon size, button padding) keeps real headroom
     on every common phone width instead of chasing one exact breakpoint. */
  @media (max-width: 480px) {
    .navbar-subtitle { display: none !important; }
    .navbar-logo-img { width: 38px !important; height: 38px !important; }
    .navbar-lang-btn { padding: 5px 10px !important; font-size: 0.78rem !important; }
    .navbar-right-zone { gap: 6px !important; }
    .logo-container { gap: 6px !important; }
  }
`}</style>
    </>
  )
}
