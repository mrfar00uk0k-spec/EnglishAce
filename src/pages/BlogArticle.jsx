import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext.jsx';
import { blogArticles } from '../data/content.js';
import AdBanner from '../components/AdBanner.jsx'
import GlowCard from '../components/GlowCard.jsx';

export default function BlogArticle() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const article = blogArticles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div style={{ paddingTop: 68, background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 120, textAlign: 'center' }}>
        <h2>Article not found</h2>
        <Link to="/blog" style={{ color: '#38bdf8' }}>← Back to Blog</Link>
      </div>
    );
  }

  const related = blogArticles.filter(a => a.id !== article.id && a.category === article.category).slice(0, 2);
  const others = blogArticles.filter(a => a.id !== article.id).slice(0, 2);
  const relatedList = related.length ? related : others;

  // Render markdown-lite: ##, paragraphs, **bold**
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '2rem', marginBottom: '0.75rem', fontFamily: 'Playfair Display, serif' }}>{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.75 }}>{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '0.4rem', lineHeight: 1.7, marginLeft: '1.5rem' }}>{line.replace('- ', '')}</li>;
      }
      if (line.trim() === '') return <br key={i} />;
      // Inline bold
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.85, marginBottom: '0.75rem', fontSize: '0.97rem' }}>
          {parts.map((part, pi) => pi % 2 === 1 ? <strong key={pi} style={{ color: '#fff' }}>{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div style={{ background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 68 }}>
      <AdBanner position="top" />

      {/* Hero image */}
      <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
        <img src={article.image} alt={lang === 'ar' ? article.titleAr : article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgb(6,10,22) 30%, transparent 80%)' }} />
      </div>

      {/* Article Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {/* Meta */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1rem' }}>
            <Link to="/blog" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.85rem' }}>← Blog</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span style={{
              background: 'rgba(37,99,235,0.2)', color: '#93c5fd',
              borderRadius: 6, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 600,
            }}>{lang === 'ar' ? article.categoryAr : article.category}</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800,
            fontFamily: 'Playfair Display, serif', lineHeight: 1.25, marginBottom: '1rem',
          }}>{lang === 'ar' ? article.titleAr : article.title}</h1>
          <div style={{ display: 'flex', gap: 16, color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <span>📅 {article.date}</span>
            <span>⏱️ {article.readTime}</span>
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
            Ready to practice?
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Take our free EnglishAce and get AI-powered feedback on your English.
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
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', color: 'rgba(255,255,255,0.8)' }}>
              📚 {t('related')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: '1rem' }}>
              {relatedList.map(a => (
                <Link key={a.id} to={`/blog/${a.slug}`} style={{
                  textDecoration: 'none', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', display: 'block',
                }}>
                  <img src={a.image} alt={lang === 'ar' ? a.titleAr : a.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  <div style={{ padding: '1rem' }}>
                    <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.4, marginBottom: '0.4rem' }}>
                      {lang === 'ar' ? a.titleAr : a.title}
                    </h4>
                    <span style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600 }}>{t('blog_read_more')} →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
