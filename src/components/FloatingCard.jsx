import React from 'react'
import { IconSpeaking, IconWriting, IconGrammar, IconVocabulary, IconListening, IconReading } from './TestIcons.jsx'

const sections = [
  { Icon: IconSpeaking,   color: '#8b5cf6', title: 'Speaking Test',    desc: 'Speak freely about a topic — no time limit. AI analyses fluency, grammar, and pronunciation.' },
  { Icon: IconWriting,    color: '#10b981', title: 'Writing Test',     desc: 'Write a response to a prompt. AI gives detailed grammar, vocabulary, and structure feedback.' },
  { Icon: IconGrammar,    color: '#f59e0b', title: 'Grammar Test',     desc: '10 multiple-choice questions covering tense, sentence structure, articles, and prepositions.' },
  { Icon: IconVocabulary, color: '#ec4899', title: 'Vocabulary Test',  desc: '10 questions testing word meaning, context usage, synonyms, and fill-in-the-blank sentences.' },
  { Icon: IconListening,  color: '#0ea5e9', title: 'Listening Test',   desc: '3 audio clips — type exactly what you hear. Tests accuracy and listening comprehension.' },
  { Icon: IconReading,    color: '#f97316', title: 'Reading Test',     desc: 'A passage followed by 4 comprehension questions. Tests reading accuracy and understanding.' },
]

export default function FloatingCard() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(10,16,30,0.99))',
      border: '1px solid rgba(99,102,241,0.22)',
      borderRadius: 20,
      padding: '1.75rem 1.5rem',
      animation: 'slowFloat 6s ease-in-out infinite',
      boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
      maxWidth: 380,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'rgba(99,102,241,0.10)', pointerEvents:'none' }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          English Test Overview
        </span>
      </div>

      {sections.map((s, i) => (
        <div key={s.title} style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          marginBottom: i < sections.length - 1 ? '1rem' : 0,
          paddingBottom: i < sections.length - 1 ? '1rem' : 0,
          borderBottom: i < sections.length - 1 ? '1px solid rgba(255,255,255,0.045)' : 'none',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: s.color + '18',
            border: '1px solid ' + s.color + '35',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px ' + s.color + '18',
          }}>
            <s.Icon size={18} color={s.color} />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.86rem', marginBottom: 2 }}>{s.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.44)', fontSize: '0.75rem', lineHeight: 1.55 }}>{s.desc}</div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slowFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
      `}</style>
    </div>
  )
}
