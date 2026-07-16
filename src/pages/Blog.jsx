import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext.jsx';
import { blogArticles } from '../data/blogArticles.js';
import AdBanner from '../components/AdBanner.jsx'
import GlowCard from '../components/GlowCard.jsx';
import { ICON_MAP, IconSparkle, IconCalendar, IconClock } from '../components/Icons.jsx';

const CATEGORIES = ['All', 'Grammar', 'Speaking', 'Writing', 'Listening', 'Vocabulary', 'Career'];

// SEO for the blog index page
function useBlogSEO(lang) {
  useEffect(() => {
    const title = lang === 'ar' ? 'مدونة EnglishAce — دروس ونصائح لتعلم الإنجليزية' : 'EnglishAce Blog — English Learning Tips & Grammar Guides'
    const desc = lang === 'ar'
      ? 'مقالات مجانية تشرح قواعد اللغة الإنجليزية بالتفصيل مع أمثلة، ونصائح للتحدث والكتابة والاستماع.'
      : 'Free, detailed articles explaining English grammar rules with examples, plus tips for speaking, writing, and listening.'
    document.title = title
    const setMeta = (attr, key, value) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
      el.setAttribute('content', value)
    }
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:type', 'website')
    return () => { document.title = 'EnglishAce' }
  }, [lang])
}

function ArticleThumb({ article, size = 'normal' }) {
  const [imgFailed, setImgFailed] = useState(false)
  const Icon = ICON_MAP[article.iconKey] || IconSparkle
  const h = size === 'large' ? 180 : 140
  const showImage = article.image && !imgFailed
  return (
    <div style={{
      height: h, background: `linear-gradient(135deg, ${article.color}22, rgba(6,10,22,0.5))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {showImage ? (
        <>
          <img
            src={article.image}
            alt={article.title}
            onError={() => setImgFailed(true)}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
          />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(6,10,22,0.5), rgba(6,10,22,0.05))' }} />
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 70% at 50% 40%, ${article.color}16, transparent 70%)` }} />
          <div style={{ width: size === 'large' ? 64 : 52, height: size === 'large' ? 64 : 52, borderRadius: 16, background: `${article.color}18`, border: `1px solid ${article.color}38`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={size === 'large' ? 28 : 22} color={article.color} />
          </div>
        </>
      )}
    </div>
  )
}

export default function Blog() {
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState('All');
  useBlogSEO(lang)

  const filtered = activeCategory === 'All'
    ? blogArticles
    : blogArticles.filter(a => a.category === activeCategory);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div style={{ background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 68 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '0.75rem' }}>
          {lang === 'ar' ? 'المدونة' : 'The Blog'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', maxWidth: 560, margin: '0 auto' }}>
          {lang === 'ar'
            ? 'شروحات قواعد تفصيلية، ونصائح عملية لتحسين إنجليزيتك في العمل والحياة اليومية.'
            : 'Detailed grammar explanations and practical tips to improve your English at work and in everyday life.'}
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <AdBanner position="top" />

        {/* Category filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem', justifyContent: 'center' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? 'linear-gradient(135deg,#2563eb,#0ea5e9)' : 'rgba(255,255,255,0.05)',
                color: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.6)',
                border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 100, padding: '7px 18px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >{cat}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No articles in this category yet.</p>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <Link to={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '2.5rem' }}>
                <GlowCard style={{ overflow: 'hidden', borderRadius: 20 }}>
                  <div className="featured-article-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <ArticleThumb article={featured} size="large" />
                    <div style={{ padding: '1.75rem' }}>
                      <span style={{ background: `${featured.color}22`, color: featured.color, borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {lang === 'ar' ? featured.categoryAr : featured.category}
                      </span>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.75rem 0 0.6rem', fontFamily: 'Playfair Display, serif', lineHeight: 1.35 }}>
                        {lang === 'ar' ? featured.titleAr : featured.title}
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1rem' }}>
                        {lang === 'ar' ? featured.previewAr : featured.preview}
                      </p>
                      <div style={{ display: 'flex', gap: 14, color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:5 }}><IconCalendar size={12} color="rgba(255,255,255,0.35)" /> {featured.date}</span>
                        <span style={{ display:'flex', alignItems:'center', gap:5 }}><IconClock size={12} color="rgba(255,255,255,0.35)" /> {featured.readTime}</span>
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </Link>
            )}

            <AdBanner />

            {/* Grid of remaining articles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
              {rest.map(a => (
                <Link key={a.id} to={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
                    transition: 'transform 0.25s, border-color 0.25s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    <ArticleThumb article={a} />
                    <div style={{ padding: '1.1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: a.color, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                        {lang === 'ar' ? a.categoryAr : a.category}
                      </span>
                      <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.4, marginBottom: '0.5rem', flex: 1 }}>
                        {lang === 'ar' ? a.titleAr : a.title}
                      </h3>
                      <div style={{ display: 'flex', gap: 12, color: 'rgba(255,255,255,0.35)', fontSize: '0.74rem', marginTop: 'auto' }}>
                        <span>{a.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <AdBanner />
      </div>

      <style>{`
        @media (max-width: 700px) {
          .featured-article-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
