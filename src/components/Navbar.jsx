import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'
import { useLexi } from '../contexts/LexiContext.jsx'
import { LexiNavFox } from './LexiWidget.jsx'

export default function Navbar() {
  const { lang, setLang, t } = useLang()
  const { greeting } = useLexi()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [activeLink, setActiveLink] = useState(null)
  const location  = useLocation()
  const navigate  = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const links = [
    { to: '/',           label: t('nav_home') },
    { to: '/assessment', label: t('nav_assessment') },
    { to: '/blog',       label: t('nav_blog') },
    { to: '/about',      label: t('nav_about') },
    { to: '/contact',    label: t('nav_contact') },
  ]

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

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
      <nav style={{
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
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', height: 66, paddingLeft: '1.25rem', paddingRight: '1.25rem', gap: '0' }}>

          {/* Logo */}
          {/* Logo + Lexi badge side by side on the left */}
<div
  style={{
    marginLeft: window.innerWidth <= 768 ? '-20px' : '-95px',
    display:'flex',
    alignItems:'center',
    gap:10
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

            {/* Lexi mini badge — left of navbar, next to site name */}
         {location.pathname === '/' && (
  <div
    className="hide-mobile"
    style={{
      position: 'absolute',
      left: '200px',
      top: '50%',
      transform: 'translateY(-50%)',

      display:'flex',
      alignItems:'center',
      gap:5,

      background:'linear-gradient(135deg,rgba(14,165,233,0.12),rgba(99,102,241,0.1))',
      border:'1px solid rgba(56,189,248,0.3)',
      borderRadius:22,
      padding:'6px 14px 6px 6px',
      maxWidth:270,
      zIndex:10
    }}
  >
    <LexiNavFox />
    <span
      style={{
        color:'#93c5fd',
        fontSize:'0.72rem',
        fontWeight:700,
        lineHeight:1.3,
        maxWidth:240
      }}
    >
      {greeting.text}
    </span>
  </div>
)}
            </div>
          {/* Desktop Links */}
          <div className="nav-desktop" style={{ marginLeft: '50px',display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.6rem' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', borderRadius: 8, padding: '5px 14px',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
              transition: 'all 0.25s', letterSpacing: '0.02em',
            }}>{lang === 'en' ? 'عربي' : 'EN'}</button>

            <a href="/assessment" onClick={(e) => handleNav(e, '/assessment')}
              className="nav-cta btn-primary"
              style={{
                background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
                color: '#fff', borderRadius: 10, padding: '8px 18px',
                fontSize: '0.87rem', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(37,99,235,0.45)',
              }}>{t('nav_start')} →</a>

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

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            background: 'rgba(6,10,22,0.97)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            padding: '1rem 1.5rem 1.75rem',
            animation: 'pageIn 0.25s ease',
          }}>
            {links.map(l => (
              <a key={l.to} href={l.to} onClick={(e) => handleNav(e, l.to)} style={{
                display: 'block',
                color: isActive(l.to) ? '#38bdf8' : 'rgba(255,255,255,0.8)',
                padding: '0.8rem 0', fontSize: '1rem', fontWeight: 500,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                transition: 'color 0.2s',
              }}>{l.label}</a>
            ))}
            <a href="/assessment" onClick={(e) => handleNav(e, '/assessment')} style={{
              display: 'block', marginTop: '1rem',
              background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
              color: '#fff', borderRadius: 10, padding: '13px',
              textAlign: 'center', fontWeight: 700, fontSize: '0.95rem',
            }}>{t('nav_start')} →</a>
          </div>
        )}
      </nav>

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
