import React from 'react';
import { useLang } from '../contexts/LangContext.jsx';

const sections = [
  {
    title: 'Acceptance of Terms',
    content: `By accessing and using EnglishAce ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.

These terms apply to all visitors, users, and others who access or use the Platform.`
  },
  {
    title: 'Description of Service',
    content: `EnglishAce provides an AI-powered English language and interview skills assessment platform. Our services include:
- HR Interview simulation with AI evaluation
- Speaking assessment with pronunciation and fluency scoring  
- Listening comprehension tests
- Reading comprehension exercises
- Bilingual interface (Arabic and English)
- Educational blog content

The platform is provided free of charge for individual use.`
  },
  {
    title: 'Acceptable Use',
    content: `You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree NOT to:
- Use the Platform in any way that violates applicable local or international laws
- Attempt to gain unauthorized access to any part of the Platform
- Use automated scripts, bots, or scrapers to access the Platform
- Attempt to reverse engineer or extract our AI models or proprietary content
- Use the Platform for commercial resale purposes without written permission
- Impersonate any person or entity or misrepresent your affiliation`
  },
  {
    title: 'Intellectual Property',
    content: `The Platform, including all content, features, functionality, design, and code, is owned by EnglishAce and is protected by copyright, trademark, and other intellectual property laws.

You may not copy, modify, create derivative works from, publicly display, or exploit any part of our Platform without our express written permission.

Blog articles and educational content are copyright EnglishAce. You may share links to articles but may not reproduce the full text without permission.`
  },
  {
    title: 'AI Evaluation Disclaimer',
    content: `Our AI-powered evaluations are provided for educational and practice purposes only. While we strive for accuracy, AI assessments have inherent limitations and may not reflect the evaluation criteria of specific employers.

Assessment results should not be used as the sole basis for employment decisions. We make no guarantees that achieving a specific score will result in job placement or acceptance.

The AI evaluation is a practice tool to help you improve, not an official certification.`
  },
  {
    title: 'Microphone and Browser Permissions',
    content: `Certain features require microphone access. By granting microphone permission, you consent to audio processing within your browser session for assessment purposes. Audio is processed locally and via our AI provider for evaluation. We do not store recordings.

You can revoke microphone permissions at any time through your browser settings.`
  },
  {
    title: 'Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, EnglishAce shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use or inability to use the Platform.`
  },
  {
    title: 'Changes to Terms',
    content: `We reserve the right to modify these Terms at any time. We will provide notice of significant changes by updating the date at the top of this page. Your continued use of the Platform after changes constitutes acceptance of the new Terms.`
  },
  {
    title: 'Contact',
    content: `Questions about these Terms? Contact us at: legal@englishace.io\n\nLast updated: January 2025`
  }
];

export default function Terms() {
  const { t } = useLang();
  return (
    <div style={{ paddingTop: 68, background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 68 }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '0.75rem' }}>
          {t('nav_terms')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '3rem', fontSize: '0.9rem' }}>
          Effective Date: January 1, 2025 · EnglishAce Platform
        </p>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '2rem' }}>
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
