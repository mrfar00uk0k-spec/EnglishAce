import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext.jsx';
import { blogArticles } from '../data/blogArticles.js';
import AdBanner from '../components/AdBanner.jsx'
import { ICON_MAP, IconSparkle, IconCalendar, IconClock, IconBookOpen } from '../components/Icons.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// SEO — updates document head tags for this specific article.
// This is a client-side SPA, so this runs after mount; it still helps modern
// crawlers (which execute JS) and gives correct tags for social sharing tools
// that re-fetch the page, plus a correct browser tab title for users.
// ─────────────────────────────────────────────────────────────────────────────
function useArticleSEO(article, lang) {
  useEffect(() => {
    if (!article) return
    const title = lang === 'ar' ? article.titleAr : article.title
    const desc  = lang === 'ar' ? article.previewAr : article.preview
    const fullTitle = `${title} | EnglishAce Blog`

    document.title = fullTitle

    const setMeta = (attr, key, value) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
    }

    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:type', 'article')
    setMeta('property', 'og:url', window.location.href)
    setMeta('name', 'twitter:card', 'summary')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', window.location.href)

    // JSON-LD structured data (Article schema) — helps search engines
    // understand this is a published educational article
    let ld = document.getElementById('article-jsonld')
    if (!ld) {
      ld = document.createElement('script')
      ld.type = 'application/ld+json'
      ld.id = 'article-jsonld'
      document.head.appendChild(ld)
    }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: desc,
      datePublished: article.date,
      author: { '@type': 'Organization', name: 'EnglishAce' },
      publisher: { '@type': 'Organization', name: 'EnglishAce' },
      mainEntityOfPage: window.location.href,
      articleSection: article.category,
    })

    return () => {
      document.title = 'EnglishAce'
    }
  }, [article, lang])
}

// Cover banner — real photo when available, with an icon+gradient fallback
// if the image fails to load (network issue, broken URL, etc.)
function ArticleCover({ article }) {
  const [imgFailed, setImgFailed] = useState(false)
  const Icon = ICON_MAP[article.iconKey] || IconSparkle
  const c = article.color
  const showImage = article.image && !imgFailed

  return (
    <div style={{
      position: 'relative', height: 260, overflow: 'hidden',
      background: `linear-gradient(135deg, ${c}22 0%, rgb(6,10,22) 75%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {showImage ? (
        <img
          src={article.image}
          alt={article.title}
          onError={() => setImgFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 60% at 50% 40%, ${c}18, transparent 70%)` }} />
          <div style={{ width: 96, height: 96, borderRadius: 24, background: `${c}18`, border: `1.5px solid ${c}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Icon size={44} color={c} />
          </div>
        </>
      )}
      <div style={{ position: 'absolute', inset: 0, background: showImage ? 'linear-gradient(to top, rgb(6,10,22) 8%, rgba(6,10,22,0.15) 55%, rgba(6,10,22,0.35) 100%)' : 'linear-gradient(to top, rgb(6,10,22) 5%, transparent 60%)' }} />
    </div>
  )
}

export default function BlogArticle() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const article = blogArticles.find(a => a.slug === slug);

  useArticleSEO(article, lang)

  if (!article) {
    return (
      <div style={{ background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 120, textAlign: 'center' }}>
        <h2>Article not found</h2>
        <Link to="/blog" style={{ color: '#38bdf8' }}>← Back to Blog</Link>
      </div>
    );
  }

  const related = blogArticles.filter(a => a.id !== article.id && a.category === article.category).slice(0, 2);
  const others = blogArticles.filter(a => a.id !== article.id).slice(0, 2);
  const relatedList = related.length ? related : others;

  // Render markdown-lite: ##, paragraphs, **bold**, tables, - lists
  const renderContent = (text) => {
    const lines = text.split('\n')
    const out = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i]

      if (line.startsWith('## ')) {
        out.push(<h2 key={i} style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '2rem', marginBottom: '0.75rem', fontFamily: 'Playfair Display, serif' }}>{line.replace('## ', '')}</h2>);
        i++; continue;
      }

      // Markdown table block: | col | col |
      if (line.trim().startsWith('|')) {
        const tableLines = []
        while (i < lines.length && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; }
        const rows = tableLines.filter(l => !/^\|[\s-:|]+\|$/.test(l.trim())).map(l =>
          l.trim().slice(1, -1).split('|').map(c => c.trim())
        )
        const [header, ...body] = rows
        out.push(
          <div key={`t${i}`} style={{ overflowX: 'auto', margin: '1.25rem 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr>{header.map((h, hi) => <th key={hi} style={{ textAlign: 'left', color: '#93c5fd', fontWeight: 700, padding: '8px 12px', borderBottom: '2px solid rgba(56,189,248,0.25)' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {row.map((cell, ci) => <td key={ci} style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.75)' }}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        continue;
      }

      if (line.startsWith('**') && line.endsWith('**') && line.length > 3) {
        out.push(<p key={i} style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.75 }}>{line.replace(/\*\*/g, '')}</p>);
        i++; continue;
      }
      if (line.startsWith('- ')) {
        out.push(<li key={i} style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '0.4rem', lineHeight: 1.7, marginLeft: '1.5rem' }}>{line.replace('- ', '')}</li>);
        i++; continue;
      }
      if (line.trim() === '') { out.push(<br key={i} />); i++; continue; }

      const parts = line.split(/\*\*(.*?)\*\*/g);
      out.push(
        <p key={i} style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.85, marginBottom: '0.75rem', fontSize: '0.97rem' }}>
          {parts.map((part, pi) => pi % 2 === 1 ? <strong key={pi} style={{ color: '#fff' }}>{part}</strong> : part)}
        </p>
      );
      i++;
    }
    return out;
  };

  return (
    <div style={{ background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 68 }}>
      <AdBanner position="top" />

      <ArticleCover article={article} />

      {/* Article Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {/* Meta */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1rem' }}>
            <Link to="/blog" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.85rem' }}>← Blog</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span style={{
              background: `${article.color}22`, color: article.color,
              borderRadius: 6, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 600,
            }}>{lang === 'ar' ? article.categoryAr : article.category}</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800,
            fontFamily: 'Playfair Display, serif', lineHeight: 1.25, marginBottom: '1rem',
          }}>{lang === 'ar' ? article.titleAr : article.title}</h1>
          <div style={{ display: 'flex', gap: 16, color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><IconCalendar size={13} color="rgba(255,255,255,0.4)" /> {article.date}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><IconClock size={13} color="rgba(255,255,255,0.4)" /> {article.readTime}</span>
          </div>
        </div>

        <AdBanner />

        {/* Content */}
        <article style={{ marginTop: '2rem' }}>
          {renderContent(lang === 'ar' ? article.contentAr : article.content)}
        </article>

        <AdBanner />

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(14,165,233,0.1))',
          border: '1px solid rgba(37,99,235,0.3)', borderRadius: 16, padding: '1.75rem',
          textAlign: 'center', margin: '2rem 0',
        }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif' }}>
            {lang === 'ar' ? 'مستعد تتدرب؟' : 'Ready to practice?'}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {lang === 'ar' ? 'اعمل اختبار EnglishAce المجاني واحصل على تقييم فوري بالذكاء الاصطناعي.' : 'Take our free EnglishAce assessment and get AI-powered feedback on your English.'}
          </p>
          <Link to="/assessment" style={{
            background: 'linear-gradient(135deg,#2563eb,#0ea5e9)', color: '#fff',
            textDecoration: 'none', borderRadius: 10, padding: '11px 28px',
            fontWeight: 700, fontSize: '0.95rem', display: 'inline-block',
          }}>{t('hero_cta')} →</Link>
        </div>

        {/* Related */}
        {relatedList.length > 0 && (
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconBookOpen size={16} color="rgba(255,255,255,0.6)" /> {t('related')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: '1rem' }}>
              {relatedList.map(a => {
                const RIcon = ICON_MAP[a.iconKey] || IconSparkle
                return (
                  <Link key={a.id} to={`/blog/${a.slug}`} style={{
                    textDecoration: 'none', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', display: 'block',
                  }}>
                    <div style={{ height: 100, background: `linear-gradient(135deg, ${a.color}22, rgba(6,10,22,0.4))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RIcon size={30} color={a.color} />
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.4, marginBottom: '0.4rem' }}>
                        {lang === 'ar' ? a.titleAr : a.title}
                      </h4>
                      <span style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600 }}>{t('blog_read_more')} →</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
