import React from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'

export default function Footer() {
  const { t } = useLang()
  return (
    <footer style={{ background: 'rgb(4,8,18)', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '3.5rem 1.5rem 2rem', color: 'rgba(255,255,255,0.48)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
              <div style={{ width:60, height:60, borderRadius:8, overflow:'hidden', flexShrink:0, background:'#000000', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src="/logo2.png" alt="EnglishAce" style={{ width:'60px', height:'60px', objectFit:'cover', objectPosition:'center 30%', marginTop:'auto', }}
                onError={e => {
                  e.target.parentElement.style.background = 'linear-gradient(135deg,#2563eb,#0ea5e9)'
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML += '<span style="font-size:15px;font-weight:900;color:#fff">HR</span>'
                }}
              />
            </div>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>English <span style={{ color: '#38bdf8' }}>ACE</span></span>
            </div>
            <p style={{ fontSize: '0.84rem', lineHeight: 1.72 }}>{t('footer_desc')}</p>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t('footer_links')}</h4>
            {[['/',t('nav_home')],['/assessment',t('nav_assessment')],['/blog',t('nav_blog')],['/about',t('nav_about')],['/contact',t('nav_contact')]].map(([to,label]) => (
              <Link key={to} to={to} className="link-hover" style={{ display:'block', color:'rgba(255,255,255,0.42)', padding:'3px 0', fontSize:'0.84rem' }}>{label}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t('footer_legal')}</h4>
            {[['/privacy',t('nav_privacy')],['/terms',t('nav_terms')]].map(([to,label]) => (
              <Link key={to} to={to} className="link-hover" style={{ display:'block', color:'rgba(255,255,255,0.42)', padding:'3px 0', fontSize:'0.84rem' }}>{label}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Contact</h4>
            <a href="mailto:mr.far0.0uk.@gmail.com" style={{ display:'block', color:'rgba(255,255,255,0.42)', fontSize:'0.84rem', marginBottom:4 }}>mr.far0.0uk.@gmail.com</a>
            <a href="https://wa.me/201272253531" target="_blank" rel="noreferrer" style={{ display:'block', color:'rgba(255,255,255,0.42)', fontSize:'0.84rem' }}>+20 127 225 3531</a>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: '0.81rem' }}>© {new Date().getFullYear()} EnglishAce. {t('footer_rights')}</p>
          <p style={{ fontSize: '0.81rem' }}>Built for English learners worldwide ♥</p>
        </div>
      </div>
    </footer>
  )
}
