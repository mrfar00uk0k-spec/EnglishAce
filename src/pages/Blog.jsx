import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext.jsx';
import { blogArticles } from '../data/content.js';
import AdBanner from '../components/AdBanner.jsx'
import GlowCard from '../components/GlowCard.jsx';

const categories = ['All', 'Speaking', 'Writing', 'Grammar', 'Listening', 'Vocabulary'];

export default function Blog() {
  const { t, lang } = useLang();
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? blogArticles : blogArticles.filter(a => a.category === active);

  return (
    <div style={{ paddingTop: 68, background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 68 }}>
      <AdBanner position="top" />

      {/* Hero */}
      <section style={{
        padding: '4rem 2rem 3rem', textAlign: 'center',
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)',
      }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '0.75rem' }}>
          {t('blog_page_title')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
          {t('blog_page_subtitle')}
        </p>
      </section>

      {/* Categories */}
      <section style={{ padding: '0 2rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2rem' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActive(cat)} style={{
                background: active === cat ? 'linear-gradient(135deg,#2563eb,#0ea5e9)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${active === cat ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
                color: '#fff', borderRadius: 100, padding: '6px 18px',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              }}>{cat === 'All' ? t('blog_all') : cat}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1.5rem' }}>
            {filtered.map(a => (
              <Link key={a.id} to={`/blog/${a.slug}`} className="card-hover" style={{
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18, overflow: 'hidden', display: 'block',
              }}>
                <img src={a.image} alt={lang === 'ar' ? a.titleAr : a.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                <div style={{ padding: '1.4rem' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'rgba(37,99,235,0.2)', color: '#93c5fd',
                      borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600,
                    }}>{lang === 'ar' ? a.categoryAr : a.category}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', alignSelf: 'center' }}>{a.readTime}</span>
                  </div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.4, marginBottom: '0.6rem' }}>
                    {lang === 'ar' ? a.titleAr : a.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.65, marginBottom: '1rem' }}>
                    {lang === 'ar' ? a.previewAr : a.preview}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>{a.date}</span>
                    <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>{t('blog_read_more')} →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AdBanner />
    </div>
  );
}
