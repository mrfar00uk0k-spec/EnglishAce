import React from 'react';
import { useLang } from '../contexts/LangContext.jsx';
import { IconCheckCircle } from '../components/Icons.jsx';

const sections = [
  {
    title: 'Information We Collect',
    content: `EnglishAce is designed with your privacy as the top priority. We collect minimal information necessary to provide our assessment services.

We do NOT collect or store: your voice recordings, your spoken answers, your name or personal details, your assessment scores, or any identifying information.

All assessment data is processed temporarily in your browser session and is deleted when you close the tab. We have no access to your microphone recordings after processing.`
  },
  {
    title: 'How We Use Information',
    content: `The only technical information we may collect includes:
- Anonymous usage analytics (page views, feature usage) via privacy-friendly tools
- Browser type and device type for compatibility purposes
- Approximate geographic region (country level only) for service optimization

This information is aggregated and never linked to individual users.`
  },
  {
    title: 'AI Processing',
    content: `When you use the AI-powered features (HR Interview, Speaking Assessment), your transcribed speech is sent to our AI provider (Anthropic) for evaluation. This processing is done in real-time and the text is not stored beyond the immediate API call. We use Anthropic's privacy-compliant API under their standard data processing terms.`
  },
  {
    title: 'Cookies',
    content: `We use only essential cookies required for the website to function, including your language preference (Arabic/English). We do not use tracking cookies, advertising cookies, or third-party analytics cookies that can identify you personally.`
  },
  {
    title: 'Third-Party Services',
    content: `Our website may display Google Ads. Google has its own privacy policy that governs how it collects and uses data for advertising purposes. We recommend reviewing Google's Privacy Policy at policies.google.com. We use Google Fonts for typography, which may log font requests.`
  },
  {
    title: 'Data Retention',
    content: `Since we do not store personal assessment data, there is nothing to delete. Your assessment results exist only in your browser's memory during your session. When you close or refresh the page, all results are permanently gone from our systems.`
  },
  {
    title: 'Your Rights',
    content: `You have the right to: access information about what data we hold (answer: none), request deletion (nothing to delete), opt out of analytics (use a browser with tracking protection), and contact us with privacy concerns at privacy@englishace.io.`
  },
  {
    title: 'Contact Us',
    content: `For privacy-related questions, contact us at: privacy@englishace.io\n\nLast updated: January 2025`
  }
];

export default function Privacy() {
  const { t } = useLang();
  return (
    <div style={{ paddingTop: 68, background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '0.75rem' }}>
          {t('nav_privacy')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '3rem', fontSize: '0.9rem' }}>
          Effective Date: January 1, 2025 · EnglishAce Platform
        </p>
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2.5rem', display:'flex', gap:10, alignItems:'flex-start' }}>
          <IconCheckCircle size={16} color="#6ee7b7" />
          <p style={{ color: '#6ee7b7', fontWeight: 600, fontSize: '0.9rem', margin:0 }}>
            Summary: EnglishAce does not store your voice, recordings, or assessment results. All AI processing is done in real-time and not retained.
          </p>
        </div>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem' }}>
              {i + 1}. {s.title}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.68)', lineHeight: 1.85, fontSize: '0.93rem', whiteSpace: 'pre-line' }}>{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
