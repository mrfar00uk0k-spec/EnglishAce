import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { ICON_MAP, IconSparkle } from './Icons.jsx'

// ─────────────────────────────────────────────────────────────────────────────
// CSS INJECTION (runs once)
// ─────────────────────────────────────────────────────────────────────────────
let _afCSSInjected = false
function injectAFCSS() {
  if (_afCSSInjected || typeof document === 'undefined') return
  _afCSSInjected = true
  const s = document.createElement('style')
  s.setAttribute('data-af', '1')
  s.textContent = `
    @keyframes afRevealUp {
      from { opacity:0; transform:translateY(26px) scale(0.97); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
    @keyframes afCursor { 50% { opacity:0; } }
    @keyframes afBarFill { from { width:0 !important; } }
    @keyframes afScorePop {
      0%   { transform:scale(0.6); opacity:0; }
      60%  { transform:scale(1.06); }
      100% { transform:scale(1); opacity:1; }
    }
    .af-card {
      transition: transform 220ms cubic-bezier(0.22,1,0.36,1),
                  box-shadow 220ms ease,
                  border-color 220ms ease;
    }
    .af-card:hover {
      transform:translateY(-4px) !important;
      box-shadow:0 18px 48px rgba(0,0,0,0.5) !important;
      border-color:rgba(255,255,255,0.14) !important;
    }
    .af-btn {
      transition: transform 200ms cubic-bezier(0.22,1,0.36,1),
                  box-shadow 200ms ease,
                  background 200ms ease;
    }
    .af-btn:hover  { transform:scale(1.03) translateY(-2px); }
    .af-btn:active { transform:scale(0.97); }
    .af-icon-btn {
      transition: background 150ms ease, transform 150ms ease;
    }
    .af-icon-btn:hover  { transform:scale(1.08); }
    .af-icon-btn:active { transform:scale(0.94); }
    @media (hover:none) {
      .af-card:hover { transform:none !important; box-shadow:none !important; }
    }
    @media (prefers-reduced-motion:reduce) {
      .af-reveal  { opacity:1 !important; animation:none !important; transform:none !important; }
      .af-bar     { animation:none !important; }
      .af-card, .af-btn, .af-icon-btn { transition:none !important; }
    }
  `
  document.head.appendChild(s)
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
// Fix #5 & #6: CEFR descriptions differ per test type
const CEFR_LABELS = {
  A1: { label:'Beginner',           color:'#f87171' },
  A2: { label:'Elementary',         color:'#fb923c' },
  B1: { label:'Intermediate',       color:'#f59e0b' },
  B2: { label:'Upper Intermediate', color:'#22d3ee' },
  'Mid B2':  { label:'Upper Intermediate (Mid)',  color:'#22d3ee' },
  'High B2': { label:'Upper Intermediate (High)', color:'#38bdf8' },
  'Upper B2': { label:'Upper Intermediate', color:'#38bdf8' },
  C1: { label:'Advanced',           color:'#34d399' },
  C2: { label:'Mastery',            color:'#a78bfa' },
}

const CEFR_DESCS = {
  speaking: {
    A1: 'You are beginning to speak English. Focus on short sentences and basic vocabulary.',
    A2: 'You can speak about everyday topics with simple phrases. Work on fluency and confidence.',
    B1: 'You can handle most familiar conversations. Reduce hesitation and expand vocabulary.',
    B2: 'You speak with good fluency and accuracy. Refine pronunciation and idiomatic expression.',
    'Mid B2': 'You speak with good fluency and generally accurate grammar. Refine pronunciation and idiomatic expression to move toward a higher B2.',
    'High B2': 'You speak fluently with strong accuracy and range, close to advanced level. Polish nuanced expression and less common vocabulary.',
    C1: 'You speak fluently and spontaneously. Polish nuanced expression and advanced vocabulary.',
    C2: 'You speak with near-native precision. Focus on cultural nuances and specialised discourse.',
  },
  writing: {
    A1: 'You are beginning to write in English. Focus on basic sentences and common words.',
    A2: 'You can write short simple texts. Work on grammar accuracy and sentence variety.',
    B1: 'You write clear texts on familiar topics. Improve paragraph structure and coherence.',
    B2: 'You write with good clarity and detail. Focus on argumentation, style, and vocabulary.',
    C1: 'You write fluently with well-structured ideas. Refine advanced syntax and formal register.',
    C2: 'You write with precision and sophistication. Engage with complex argumentation and tone.',
  },
  reading: {
    A1: 'You can understand simple words and short sentences. Build vocabulary through daily reading.',
    A2: 'You understand short everyday texts. Practice reading simple articles to build comprehension.',
    B1: 'You understand the main points of familiar texts. Work on skimming and detail-finding.',
    B2: 'You read complex texts with good understanding. Focus on inference and implicit meaning.',
    C1: 'You read demanding texts including implicit meaning. Engage with academic writing.',
    C2: 'You read with full comprehension and nuance. Explore literature and specialised content.',
  },
  listening: {
    A1: 'You can understand slow, clear speech on familiar topics. Practice with basic audio daily.',
    A2: 'You follow simple conversations spoken clearly. Listen to learner-level podcasts.',
    B1: 'You follow the main points of clear standard speech. Practice with news and discussions.',
    B2: 'You understand extended speech and complex ideas. Engage with native-speed podcasts.',
    C1: 'You understand complex speech and idioms. Engage with specialised audio content.',
    C2: 'You understand all forms of spoken language with ease. Listen to academic debates.',
  },
  grammar: {
    A1: 'You use basic structures. Start with core verb tenses and simple sentence patterns.',
    A2: 'You use simple tenses and basic connectors. Practice past tense and common prepositions.',
    B1: 'You use a range of tenses with some errors. Focus on conditionals and modal verbs.',
    B2: 'You use grammar accurately with occasional slips. Refine passive voice and advanced structures.',
    C1: 'You command complex structures with flexibility. Focus on subtle distinctions and rare forms.',
    C2: 'You use grammar with full accuracy and stylistic range. Explore register-specific structures.',
  },
  vocabulary: {
    A1: 'You know basic everyday words. Build vocabulary with 5 new words daily.',
    A2: 'You use simple vocabulary for familiar topics. Study high-frequency words systematically.',
    B1: 'You have a reasonable vocabulary range. Expand with thematic word lists and collocations.',
    B2: 'You use varied vocabulary with good range. Focus on idiomatic expressions and nuance.',
    C1: 'You use a broad vocabulary with precision. Study advanced collocations and formal language.',
    C2: 'You have near-native vocabulary breadth. Explore specialised terminology and subtle connotations.',
  },
  hr: {
    A1: 'You can answer basic interview questions. Practice common HR questions with structured answers.',
    A2: 'You answer simple interview questions. Work on introducing yourself clearly and professionally.',
    B1: 'You handle most interview questions adequately. Improve using the STAR method.',
    B2: 'You perform well in interviews. Refine conciseness, impact statements, and professional register.',
    'Mid B2': 'You perform well in interviews with good structure. Refine conciseness and impact statements to move toward a higher B2.',
    'High B2': 'You interview confidently with strong professional language, close to advanced level. Polish storytelling and leadership language.',
    C1: 'You interview fluently and professionally. Polish storytelling, leadership language, and tone.',
    C2: 'You interview with authority and sophistication. Focus on strategic vision and executive presence.',
  },
}

function getCEFRMeta(level, assessmentType) {
  const base  = CEFR_LABELS[level] || CEFR_LABELS['B1']
  const descs = CEFR_DESCS[assessmentType] || CEFR_DESCS.speaking
  return { ...base, desc: descs[level] || descs['B1'] }
}

// Extract just the compact CEFR letter (e.g. 'B2') from a detailed level string
// like 'High B2' / 'Mid B2', for space-constrained UI (small fixed-size badges).
function getBaseLevelLetter(level) {
  if (!level) return 'B1'
  const match = String(level).match(/[ABC][12]/)
  return match ? match[0] : level
}

// Keep for any legacy references
const CEFR_META = CEFR_LABELS

const DELAYS = {
  score:    0,
  cefr:     320,
  skills:   580,
  extra:    840,   // transcript / MCQ review
  strengths:1080,
  weaknesses:1320,
  mistakes: 1560,
  answer:   1800,
  tips:     2040,
  resources:2280,
  buttons:  2500,
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function scoreColor(v) {
  if (v == null) return '#64748b'
  if (v >= 90) return '#38bdf8'
  if (v >= 75) return '#60a5fa'
  if (v >= 60) return '#22d3ee'
  if (v >= 40) return '#f59e0b'
  return '#f87171'
}

function perfLabel(score) {
  if (score >= 90) return 'Outstanding Performance'
  if (score >= 80) return 'Excellent Performance'
  if (score >= 70) return 'Very Good Performance'
  if (score >= 60) return 'Good Performance'
  if (score >= 45) return 'Fair Performance'
  return 'Needs Improvement'
}

function computeLevel(score) {
  if (score >= 95) return 'C1'
  if (score >= 85) return 'High B2'
  if (score >= 75) return 'Mid B2'
  if (score >= 65) return 'B1'
  if (score >= 50) return 'A2'
  return 'A1'
}

function parseMistake(m) {
  if (typeof m !== 'string') return { original: String(m), corrected: '', explanation: '' }
  const arrowIdx = m.indexOf(' → ')
  if (arrowIdx > -1) {
    const original = m.slice(0, arrowIdx).trim()
    const rest     = m.slice(arrowIdx + 3).trim()
    const parenMatch = rest.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
    if (parenMatch) {
      return { original, corrected: parenMatch[1].trim(), explanation: parenMatch[2].trim() }
    }
    return { original, corrected: rest, explanation: '' }
  }
  return { original: m, corrected: '', explanation: '' }
}

function genericTips(score, assessmentType, weaknesses = [], mistakes = []) {
  const tips = []

  // Build tips directly from the user's actual weaknesses/mistakes text when we have it,
  // instead of falling back to generic score-tier copy.
  const combinedText = [...(weaknesses || []), ...(mistakes || [])].join(' ').toLowerCase()

  if (/tense|verb form|past|present|future/.test(combinedText)) {
    tips.push('Review the specific verb tense mistakes above, then write 5 of your own sentences using that tense correctly.')
  }
  if (/article|a\/an\/the|preposition/.test(combinedText)) {
    tips.push('Go back over each article/preposition correction above — these are quick to fix with focused daily practice.')
  }
  if (/pronunciation|th-sound|stress|silent|vowel/.test(combinedText)) {
    tips.push('Practise the specific sounds and words flagged above out loud, several times, in front of a mirror or recording yourself.')
  }
  if (/vocabulary|word choice|lexical/.test(combinedText)) {
    tips.push('Learn the corrected word choices above in full example sentences, not just as isolated translations.')
  }
  if (/structure|coherence|organi[sz]ation|paragraph/.test(combinedText)) {
    tips.push('Rewrite your answer above using the corrected structure as a template for your next attempt.')
  }
  if (/fluency|hesitat|pause|filler/.test(combinedText)) {
    tips.push('Practise speaking for 60-90 seconds without stopping on a topic you know well, to reduce hesitation.')
  }

  if (tips.length > 0) return tips.slice(0, 3)

  // No specific weaknesses detected — fall back to score-tier, test-type-relevant advice.
  if (score >= 80) {
    const advanced = {
      speaking:   'Keep pushing your fluency with more advanced topics and idiomatic expressions.',
      writing:    'Try more complex sentence structures and a wider range of academic vocabulary.',
      grammar:    'Challenge yourself with more nuanced grammar structures (conditionals, passive voice, reported speech).',
      vocabulary: 'Expand into more specialised or academic vocabulary sets.',
      listening:  'Practise with faster, more natural native-speed audio to sharpen your ear further.',
      reading:    'Move on to more complex texts with denser vocabulary and longer passages.',
      hr:         'Refine your answers further with more specific, quantified achievements.',
    }
    return [
      "You're performing at an excellent level — keep building on it.",
      advanced[assessmentType] || advanced.speaking,
      'Consider taking IELTS or TOEFL to certify your proficiency at this level.',
    ]
  }
  if (score >= 60) return [
    'Review your mistakes carefully and practice similar exercises every day.',
    'Watch English content with English subtitles for 30 minutes daily.',
    'Use spaced repetition to lock in what you\'ve learned.',
  ]
  return [
    'Focus on building a strong foundation with structured daily practice.',
    'Practice with EnglishAce every day — consistency is your fastest path forward.',
    'Revisit the basics of this skill step by step rather than jumping ahead.',
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// SOUND (Web Audio API — no external files, minimal volume)
// ─────────────────────────────────────────────────────────────────────────────
let _audioCtx = null
function getAudioCtx() {
  if (!_audioCtx && typeof window !== 'undefined') {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)() } catch(_) {}
  }
  return _audioCtx
}

function playTone(freq, dur, vol = 0.06, type = 'sine') {
  try {
    const ctx = getAudioCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + dur)
  } catch(_) {}
}

const Sounds = {
  sectionReveal: () => playTone(880, 0.12, 0.04),
  scoreComplete: () => { playTone(660, 0.15, 0.07); setTimeout(() => playTone(880, 0.2, 0.06), 100) },
  copy:          () => playTone(1200, 0.08, 0.05),
  expand:        () => playTone(700, 0.1, 0.04),
  next:          () => { playTone(550, 0.1, 0.06); setTimeout(() => playTone(700, 0.15, 0.06), 80) },
}

// ─────────────────────────────────────────────────────────────────────────────
// HAPTIC
// ─────────────────────────────────────────────────────────────────────────────
function haptic(pattern = 10) {
  try { navigator.vibrate?.(pattern) } catch(_) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fn = (e) => setReduced(e.matches)
    mq.addEventListener?.('change', fn)
    return () => mq.removeEventListener?.('change', fn)
  }, [])
  return reduced
}

function useCountUp(target, duration = 1600, startDelay = 300) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf, start = null, t
    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(animate)
      else Sounds.scoreComplete()
    }
    t = setTimeout(() => { raf = requestAnimationFrame(animate) }, startDelay)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [target, duration, startDelay])
  return val
}

function useTypewriter(text, speed = 22, startDelay = 0, enabled = true) {
  const [displayed, setDisplayed] = useState(enabled ? '' : (text || ''))
  const [done, setDone] = useState(!enabled || !text)

  useEffect(() => {
    if (!enabled || !text) { setDisplayed(text || ''); setDone(true); return }
    let idx = 0
    let timer = null
    let delayTimer = null

    const typeNext = () => {
      const ch = text[idx]
      idx++
      setDisplayed(text.slice(0, idx))
      if (idx >= text.length) { setDone(true); return }
      let d = speed
      if (ch === '.') d = speed * 5
      else if (ch === ',') d = speed * 2.5
      else if (ch === '!' || ch === '?') d = speed * 4
      timer = setTimeout(typeNext, d)
    }

    delayTimer = setTimeout(typeNext, startDelay)
    return () => { clearTimeout(timer); clearTimeout(delayTimer) }
  }, [text, speed, startDelay, enabled])

  return { displayed, done }
}

function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'; utt.rate = 0.9; utt.pitch = 1
    const voices = window.speechSynthesis.getVoices()
    const v = voices.find(v => v.lang === 'en-US' && v.localService)
           || voices.find(v => v.lang === 'en-US')
           || voices.find(v => v.lang.startsWith('en'))
    if (v) utt.voice = v
    utt.onstart = () => setSpeaking(true)
    utt.onend   = () => setSpeaking(false)
    utt.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  const toggle = useCallback((text) => {
    if (speaking) stop()
    else speak(text)
  }, [speaking, speak, stop])

  useEffect(() => () => { window.speechSynthesis?.cancel() }, [])

  return { speaking, supported, toggle, stop }
}

// ─────────────────────────────────────────────────────────────────────────────
// REVEAL WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function RevealSection({ delay = 0, rm, children }) {
  return (
    <div
      className="af-reveal"
      style={{
        opacity: rm ? 1 : 0,
        animation: rm ? 'none' : `afRevealUp 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms forwards`,
      }}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE SVG ICONS
// ─────────────────────────────────────────────────────────────────────────────
const I = ({ d, size = 16, color = 'currentColor', sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d.map((p, i) => p.startsWith('C') ? <circle key={i} {...Object.fromEntries(p.slice(1).split(',').reduce((a,v,i,ar) => { if (i%2===0)a.push([ar[i],ar[i+1]]); return a },[[],[]]))} /> : <path key={i} d={p}/>)}
  </svg>
)

const IconGrammar = ({size=16,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
)
const IconVocabulary = ({size=16,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
)
const IconFluency = ({size=16,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
)
const IconComm = ({size=16,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
)
const IconConfidence = ({size=16,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
)
const IconProf = ({size=16,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
)
const IconStructure = ({size=16,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
)
const IconClarity = ({size=16,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
)
const IconCoherence = ({size=16,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
)
const IconTask = ({size=16,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
)
const IconCopy = ({size=15,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
)
const IconExpand = ({size=15,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
)
const IconCollapse = ({size=15,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>
)
const IconPlay = ({size=15,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
)
const IconStop = ({size=15,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
)
const IconCheck = ({size=14,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
)
const IconYouTube = ({size=14}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#f87171"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
)

const SKILL_MAP = {
  grammar:         { label:'Grammar',        Icon: IconGrammar,    color:'#f59e0b' },
  vocabulary:      { label:'Vocabulary',     Icon: IconVocabulary, color:'#ec4899' },
  fluency:         { label:'Fluency',        Icon: IconFluency,    color:'#8b5cf6' },
  pronunciation:   { label:'Pronunciation',  Icon: IconFluency,    color:'#06b6d4' },
  communication:   { label:'Communication', Icon: IconComm,       color:'#10b981' },
  confidence:      { label:'Confidence',     Icon: IconConfidence, color:'#f97316' },
  professionalism: { label:'Professionalism',Icon: IconProf,       color:'#2563eb' },
  structure:       { label:'Structure',      Icon: IconStructure,  color:'#0ea5e9' },
  clarity:         { label:'Clarity',        Icon: IconClarity,    color:'#22d3ee' },
  coherence:       { label:'Coherence',      Icon: IconCoherence,  color:'#818cf8' },
  taskResponse:    { label:'Task Response',  Icon: IconTask,       color:'#34d399' },
}

function skillStatus(v) {
  if (v >= 90) return 'Outstanding'
  if (v >= 80) return 'Excellent'
  if (v >= 70) return 'Very Good'
  if (v >= 60) return 'Good'
  if (v >= 45) return 'Fair'
  return 'Needs Work'
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORE RING
// ─────────────────────────────────────────────────────────────────────────────
const ScoreRing = memo(function ScoreRing({ score, color, size = 170, rm }) {
  const r = 56
  const circ = 2 * Math.PI * r
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), rm ? 0 : 150)
    return () => clearTimeout(t)
  }, [rm])
  const offset = animated ? circ * (1 - score / 100) : circ
  return (
    <svg width={size} height={size} viewBox="0 0 130 130">
      <defs>
        <filter id="af-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
      <circle
        cx="65" cy="65" r={r}
        fill="none" stroke={color} strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 65 65)"
        filter="url(#af-glow)"
        style={{ transition: rm ? 'none' : 'stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)' }}
      />
    </svg>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// SKILL CARD
// ─────────────────────────────────────────────────────────────────────────────
const SkillCard = memo(function SkillCard({ skillKey, score, delay, rm }) {
  const cfg = SKILL_MAP[skillKey]
  if (!cfg || score == null) return null
  const { label, Icon, color } = cfg
  const sc = scoreColor(score)
  return (
    <div
      className="af-card"
      style={{
        background:'rgba(255,255,255,0.035)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        padding: '1.1rem 1.1rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={14} color={color}/>
        </div>
        <span style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.75rem', fontWeight:600, letterSpacing:'0.04em' }}>{label}</span>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
        <span style={{ fontSize:'2.2rem', fontWeight:900, color:sc, lineHeight:1, fontFamily:'inherit' }}>{score}</span>
        <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.8rem' }}>/100</span>
      </div>
      <div>
        <div style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', borderRadius:4, height:5, overflow:'hidden', marginBottom:5 }}>
          <div
            className="af-bar"
            style={{
              width: `${score}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${color}aa, ${color})`,
              borderRadius: 4,
              animation: rm ? 'none' : `afBarFill 1s cubic-bezier(0.22,1,0.36,1) ${delay + 200}ms both`,
            }}
          />
        </div>
        <span style={{ color: sc, fontSize:'0.7rem', fontWeight:700 }}>{skillStatus(score)}</span>
      </div>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// STRENGTH CARD
// ─────────────────────────────────────────────────────────────────────────────
const StrengthCard = memo(function StrengthCard({ text, idx, delay, rm }) {
  const { displayed, done } = useTypewriter(text, 18, delay + idx * 150, !rm)
  return (
    <div
      className="af-card"
      style={{
        background:'rgba(16,185,129,0.05)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: 16,
        padding: '1rem 1.1rem',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <div style={{ width:26, height:26, borderRadius:8, background:'rgba(16,185,129,0.2)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
        <IconCheck size={13} color="#6ee7b7"/>
      </div>
      <p style={{ color:'rgba(255,255,255,0.82)', fontSize:'0.88rem', lineHeight:1.7, margin:0 }}>
        {rm ? text : displayed}
        {!rm && !done && <span style={{ color:'#38bdf8', animation:'afCursor 1s step-end infinite' }}>|</span>}
      </p>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// WEAKNESS CARD
// ─────────────────────────────────────────────────────────────────────────────
const WeaknessCard = memo(function WeaknessCard({ text, idx, delay, rm }) {
  const { displayed, done } = useTypewriter(text, 18, delay + idx * 150, !rm)
  return (
    <div
      className="af-card"
      style={{
        background:'rgba(245,158,11,0.05)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border: '1px solid rgba(245,158,11,0.14)',
        borderRadius: 16,
        padding: '1rem 1.1rem',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <div style={{ width:26, height:26, borderRadius:8, background:'rgba(245,158,11,0.18)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(245,158,11,0.28)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, fontSize:'0.8rem' }}>
        ↗
      </div>
      <p style={{ color:'rgba(255,255,255,0.82)', fontSize:'0.88rem', lineHeight:1.7, margin:0 }}>
        {rm ? text : displayed}
        {!rm && !done && <span style={{ color:'#38bdf8', animation:'afCursor 1s step-end infinite' }}>|</span>}
      </p>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// MISTAKE CARD
// ─────────────────────────────────────────────────────────────────────────────
const MistakeCard = memo(function MistakeCard({ raw, idx, delay, rm }) {
  const { original, corrected, explanation } = parseMistake(raw)
  const { displayed: expDisplayed, done: expDone } = useTypewriter(explanation, 20, delay + idx * 120, !rm && !!explanation)

  return (
    <div
      className="af-card"
      style={{
        background:'rgba(255,255,255,0.03)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '1.1rem 1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Wrong */}
      <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
        <span style={{ color:'#f87171', fontSize:'0.68rem', fontWeight:700, padding:'2px 7px', background:'rgba(248,113,113,0.12)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(248,113,113,0.22)', borderRadius:5, flexShrink:0, marginTop:2 }}>✗</span>
        <span style={{ color:'rgba(248,113,113,0.85)', fontSize:'0.88rem', lineHeight:1.6 }}>{original}</span>
      </div>

      {/* Correct */}
      {corrected && (
        <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
          <span style={{ color:'#6ee7b7', fontSize:'0.68rem', fontWeight:700, padding:'2px 7px', background:'rgba(110,231,183,0.1)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(110,231,183,0.22)', borderRadius:5, flexShrink:0, marginTop:2 }}>✓</span>
          <span style={{ color:'rgba(110,231,183,0.9)', fontSize:'0.88rem', lineHeight:1.6, fontWeight:500 }}>{corrected}</span>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <p style={{ color:'rgba(255,255,255,0.42)', fontSize:'0.8rem', lineHeight:1.65, margin:'4px 0 0 36px', fontStyle:'italic' }}>
          {rm ? explanation : expDisplayed}
          {!rm && !expDone && <span style={{ color:'#38bdf8', animation:'afCursor 1s step-end infinite' }}>|</span>}
        </p>
      )}
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL ANSWER CARD
// ─────────────────────────────────────────────────────────────────────────────
const ProfessionalAnswerCard = memo(function ProfessionalAnswerCard({ text, delay, rm }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const { speaking, supported, toggle, stop } = useSpeech()
  const { displayed, done } = useTypewriter(text, 16, delay, !rm)
  const shownText = rm ? text : displayed

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      Sounds.copy()
      haptic(15)
      setTimeout(() => setCopied(false), 2000)
    } catch(_) {}
  }, [text])

  const handleListen = useCallback(() => {
    toggle(text)
    haptic(10)
  }, [toggle, text])

  const handleExpand = useCallback(() => {
    setExpanded(e => !e)
    Sounds.expand()
    haptic(8)
  }, [])

  const shouldClamp = !expanded && text && text.length > 350

  return (
    <div
      className="af-card"
      style={{ background:'rgba(37,99,235,0.05)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(37,99,235,0.15)', borderRadius:20, padding:'1.4rem', overflow:'hidden' }}
    >
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:'#93c5fd', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>✦ Professional Answer</span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {/* Copy */}
          <button
            className="af-icon-btn"
            onClick={handleCopy}
            title="Copy answer"
            style={{ background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', border:`1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius:9, padding:'6px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, color: copied ? '#6ee7b7' : 'rgba(255,255,255,0.55)', fontSize:'0.72rem', fontWeight:600 }}
          >
            <IconCopy size={13} color={copied ? '#6ee7b7' : 'rgba(255,255,255,0.55)'}/>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {/* Listen */}
          {supported && (
            <button
              className="af-icon-btn"
              onClick={handleListen}
              title={speaking ? 'Stop' : 'Listen'}
              style={{ background: speaking ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.06)', border:`1px solid ${speaking ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius:9, padding:'6px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, color: speaking ? '#93c5fd' : 'rgba(255,255,255,0.55)', fontSize:'0.72rem', fontWeight:600 }}
            >
              {speaking ? <IconStop size={12} color="#93c5fd"/> : <IconPlay size={12} color="rgba(255,255,255,0.55)"/>}
              {speaking ? 'Stop' : 'Listen'}
            </button>
          )}
          {/* Expand */}
          {text && text.length > 350 && (
            <button
              className="af-icon-btn"
              onClick={handleExpand}
              title={expanded ? 'Collapse' : 'Expand'}
              style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, padding:'6px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.55)', fontSize:'0.72rem', fontWeight:600 }}
            >
              {expanded ? <IconCollapse size={13} color="rgba(255,255,255,0.55)"/> : <IconExpand size={13} color="rgba(255,255,255,0.55)"/>}
              {expanded ? 'Less' : 'More'}
            </button>
          )}
        </div>
      </div>

      {/* Body text */}
      <div style={{ position:'relative' }}>
        <p
          style={{
            color:'rgba(255,255,255,0.82)',
            fontSize:'0.93rem',
            lineHeight:1.85,
            margin:0,
            overflow:'hidden',
            maxHeight: shouldClamp ? '6.5em' : 'none',
            transition:'max-height 0.4s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {shownText}
          {!rm && !done && <span style={{ color:'#38bdf8', animation:'afCursor 1s step-end infinite' }}>|</span>}
        </p>
        {shouldClamp && (
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:40, background:'linear-gradient(transparent, rgba(6,10,22,0.95))'}}/>
        )}
      </div>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// TIP CARD
// ─────────────────────────────────────────────────────────────────────────────
const TipCard = memo(function TipCard({ text, idx, delay, rm }) {
  const { displayed, done } = useTypewriter(text, 20, delay + idx * 180, !rm)
  return (
    <div
      className="af-card"
      style={{ background:'rgba(99,102,241,0.04)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(99,102,241,0.12)', borderRadius:16, padding:'1rem 1.1rem', display:'flex', gap:12, alignItems:'flex-start' }}
    >
      <div style={{ width:26, height:26, borderRadius:8, background:'rgba(99,102,241,0.18)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(99,102,241,0.28)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, color:'#a5b4fc', fontSize:'0.8rem', fontWeight:800 }}>{idx + 1}</div>
      <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.88rem', lineHeight:1.7, margin:0 }}>
        {rm ? text : displayed}
        {!rm && !done && <span style={{ color:'#38bdf8', animation:'afCursor 1s step-end infinite' }}>|</span>}
      </p>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCE CARD
// ─────────────────────────────────────────────────────────────────────────────
const ResourceCard = memo(function ResourceCard({ resource, delay, rm }) {
  const { channel, title, description, url, duration, reason, color, icon, thumbnail } = resource
  const IconComp = ICON_MAP[icon] || IconSparkle
  const [imgErr, setImgErr] = React.useState(false)

  const handleOpen = () => {
    haptic(10)
    Sounds.next()
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div
      className="af-card"
      style={{ background:'rgba(255,255,255,0.03)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, overflow:'hidden' }}
    >
      {/* Fix #1: Real YouTube thumbnail */}
      {thumbnail && !imgErr ? (
        <div style={{ position:'relative', width:'100%', aspectRatio:'16/9', overflow:'hidden', background:'rgba(0,0,0,0.3)', flexShrink:0 }}>
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            onError={() => setImgErr(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          />
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.2)' }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
          </div>
          <div style={{ position:'absolute', bottom:6, right:8, background:'rgba(0,0,0,0.75)', color:'#fff', fontSize:'0.68rem', fontWeight:700, padding:'2px 6px', borderRadius:4 }}>{duration}</div>
        </div>
      ) : (
        <div style={{ background:`linear-gradient(135deg, ${color}18, ${color}08)`, borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'1rem', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:10, background:`${color}22`, border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <IconComp size={19} color={color} />
          </div>
          <div>
            <div style={{ color:color, fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>{channel}</div>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.68rem' }}>{duration}</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding:'0.9rem 1rem' }}>
        <div style={{ color:color, fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>📺 {channel}</div>
        <h4 style={{ color:'rgba(255,255,255,0.9)', fontSize:'0.9rem', fontWeight:700, lineHeight:1.45, margin:'0 0 6px' }}>{title}</h4>
        <p style={{ color:'rgba(255,255,255,0.42)', fontSize:'0.78rem', lineHeight:1.6, margin:'0 0 10px' }}>{description}</p>
        <div style={{ background:`${color}0d`, border:`1px solid ${color}22`, borderRadius:8, padding:'6px 10px', marginBottom:12 }}>
          <span style={{ color:color, fontSize:'0.72rem', fontWeight:600 }}>Why this? </span>
          <span style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.72rem' }}>{reason}</span>
        </div>
        <button
          className="af-btn"
          onClick={handleOpen}
          style={{ background:`linear-gradient(135deg,#f87171,#ef4444)`, color:'#fff', border:'none', borderRadius:10, padding:'8px 16px', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:7, width:'100%', justifyContent:'center' }}
        >
          <IconYouTube size={14}/>
          Watch on YouTube
        </button>
      </div>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// MCQ REVIEW CARD
// ─────────────────────────────────────────────────────────────────────────────
const MCQReviewCard = memo(function MCQReviewCard({ item, idx }) {
  const { question, userAnswer, correctAnswer, isCorrect, explanation, score } = item
  const hasScore = score != null

  return (
    <div
      className="af-card"
      style={{
        background: isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
        border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)'}`,
        borderRadius: 16,
        padding: '1rem 1.1rem',
      }}
    >
      <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom: (!isCorrect || explanation) ? 8 : 0 }}>
        <span style={{ fontSize:'0.85rem', flexShrink:0, marginTop:1 }}>{isCorrect ? '✓' : '✗'}</span>
        <span style={{ color:'rgba(255,255,255,0.82)', fontSize:'0.88rem', lineHeight:1.55, fontWeight:isCorrect ? 400 : 500 }}>
          {question}
        </span>
        {hasScore && (
          <span style={{ marginLeft:'auto', color: score >= 75 ? '#22d3ee' : '#f87171', fontWeight:800, fontSize:'0.85rem', flexShrink:0 }}>{score}%</span>
        )}
      </div>
      {!isCorrect && (
        <div style={{ paddingLeft:26 }}>
          {userAnswer && (
            <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.45)', marginBottom:3 }}>
              Your answer: <span style={{ color:'#f87171' }}>{userAnswer}</span>
            </div>
          )}
          {correctAnswer && (
            <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.45)', marginBottom: explanation ? 3 : 0 }}>
              Correct: <span style={{ color:'#6ee7b7', fontWeight:600 }}>{correctAnswer}</span>
            </div>
          )}
          {explanation && (
            <div style={{ fontSize:'0.76rem', color:'rgba(255,255,255,0.35)', fontStyle:'italic', marginTop:4, lineHeight:1.6 }}>{explanation}</div>
          )}
        </div>
      )}
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADING
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeading({ children }) {
  return (
    <h3 style={{ color:'rgba(255,255,255,0.38)', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'0.9rem' }}>
      {children}
    </h3>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AssessmentFeedback({
  // Assessment identity
  assessmentType = 'speaking',

  // Core scores
  overallScore,
  level,

  // Skill scores (all optional)
  grammarScore,
  vocabularyScore,
  fluencyScore,
  pronunciationScore,
  communicationScore,
  confidenceScore,
  professionalismScore,
  structureScore,
  clarityScore,
  coherenceScore,
  taskResponseScore,

  // AI feedback
  strengths           = [],
  weaknesses          = [],
  mistakes            = [],
  corrections         = [],
  pronunciationNotes  = [],
  correctedAnswer,
  tips                = [],

  // MCQ review (Grammar/Vocab/Listening/Reading)
  reviewItems  = [],

  // Speaking transcript
  transcript,

  // Navigation
  onNext,
  isLastQuestion = false,
  questionNumber,
  totalQuestions,
  isSingle = false,
  lang = 'en',
  nextLabel,
}) {
  injectAFCSS()
  const rm = useReducedMotion()

  // Resolve level
  const resolvedLevel = level || computeLevel(overallScore || 0)
  const cefrMeta = getCEFRMeta(resolvedLevel, assessmentType)
  const color = scoreColor(overallScore || 0)

  // Count up
  const displayedScore = useCountUp(overallScore || 0, 1600, 100)

  // Build skill rows
  const skills = [
    ['grammar',         grammarScore],
    ['vocabulary',      vocabularyScore],
    ['fluency',         fluencyScore],
    ['pronunciation',   pronunciationScore],
    ['communication',   communicationScore],
    ['confidence',      confidenceScore],
    ['professionalism', professionalismScore],
    ['structure',       structureScore],
    ['clarity',         clarityScore],
    ['coherence',       coherenceScore],
    ['taskResponse',    taskResponseScore],
  ].filter(([, v]) => v != null && v > 0)

  // Tips (AI or generic)
  const finalTips = tips.length > 0 ? tips : genericTips(overallScore || 0, assessmentType, weaknesses, mistakes)

  // Button label
  const btnLabel = (() => {
    if (isSingle) return lang === 'ar' ? 'عرض نتيجتي ←' : 'View My Results →'
    if (nextLabel) return nextLabel
    if (isLastQuestion) return lang === 'ar' ? 'عرض النتائج ←' : 'View Results →'
    return lang === 'ar' ? 'السؤال التالي ←' : 'Next Question →'
  })()

  const handleNext = useCallback(() => {
    Sounds.next()
    haptic([10, 30, 10])
    onNext?.()
  }, [onNext])

  // Section sound on section reveal
  useEffect(() => {
    const timers = [DELAYS.cefr, DELAYS.skills, DELAYS.strengths].map(d =>
      setTimeout(() => Sounds.sectionReveal(), d)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'0.5rem 0 3rem' }}>

      {/* ── HERO SCORE ─────────────────────────────────────────────── */}
      <RevealSection delay={DELAYS.score} rm={rm}>
        <div style={{ textAlign:'center', padding:'2rem 1rem 1.5rem', position:'relative' }}>
          {/* Progress label */}
          {questionNumber != null && totalQuestions != null && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.05)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:100, padding:'4px 14px', marginBottom:'1.5rem' }}>
              <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.72rem' }}>Question {questionNumber} of {totalQuestions}</span>
            </div>
          )}

          {/* Ring + number — Fix #11: number reliably centered ON the ring */}
          <div style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem' }}>
            <ScoreRing score={overallScore || 0} color={color} size={170} rm={rm}/>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', pointerEvents:'none' }}>
              <div style={{
                fontSize:'3.2rem',
                fontWeight:900,
                color,
                lineHeight:1,
                animation: rm ? 'none' : 'afScorePop 0.6s cubic-bezier(0.22,1,0.36,1) 200ms both',
              }}>
                {displayedScore}
              </div>
              <div style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.78rem', marginTop:3 }}>/100</div>
            </div>
          </div>

          {/* Level badge */}
          <div style={{ marginBottom:'0.6rem' }}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:7,
              background:`${color}14`, border:`1px solid ${color}35`,
              color, borderRadius:100, padding:'5px 18px',
              fontSize:'0.85rem', fontWeight:800, letterSpacing:'0.04em',
            }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}`, display:'inline-block', flexShrink:0 }}/>
              {resolvedLevel} — {cefrMeta.label}
            </span>
          </div>

          {/* Perf label */}
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem', fontWeight:500 }}>
            {perfLabel(overallScore || 0)}
          </p>
        </div>
      </RevealSection>

      {/* ── CEFR CARD ──────────────────────────────────────────────── */}
      <RevealSection delay={DELAYS.cefr} rm={rm}>
        <div style={{ padding:'0 1.5rem', marginBottom:'1.5rem' }}>
          <div
            className="af-card"
            style={{ background:'rgba(255,255,255,0.03)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:'1.1rem 1.3rem', display:'flex', alignItems:'center', gap:16 }}
          >
            <div style={{ width:48, height:48, borderRadius:12, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:'1.4rem', fontWeight:900, color }}>{getBaseLevelLetter(resolvedLevel)}</span>
            </div>
            <div>
              <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>CEFR Level</div>
              <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.88rem', lineHeight:1.6, margin:0 }}>{cefrMeta.desc}</p>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── SKILL CARDS ────────────────────────────────────────────── */}
      {skills.length > 0 && (
        <RevealSection delay={DELAYS.skills} rm={rm}>
          <div style={{ padding:'0 1.5rem', marginBottom:'1.5rem' }}>
            <SectionHeading>Skill Breakdown</SectionHeading>
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(155px, 1fr))',
              gap:'0.65rem',
            }}>
              {skills.map(([key, val]) => (
                <SkillCard key={key} skillKey={key} score={val} delay={DELAYS.skills} rm={rm}/>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* ── TRANSCRIPT (Speaking) ──────────────────────────────────── */}
      {transcript && (
        <RevealSection delay={DELAYS.extra} rm={rm}>
          <div style={{ padding:'0 1.5rem', marginBottom:'1.5rem' }}>
            <SectionHeading>Your Transcript</SectionHeading>
            <div
              className="af-card"
              style={{ background:'rgba(255,255,255,0.03)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'1.1rem 1.2rem' }}
            >
              <p style={{ color:'rgba(255,255,255,0.68)', fontSize:'0.9rem', lineHeight:1.75, margin:0, fontStyle:'italic' }}>"{transcript}"</p>
            </div>
          </div>
        </RevealSection>
      )}

      {/* ── MCQ REVIEW ─────────────────────────────────────────────── */}
      {reviewItems.length > 0 && (
        <RevealSection delay={DELAYS.extra} rm={rm}>
          <div style={{ padding:'0 1.5rem', marginBottom:'1.5rem' }}>
            <SectionHeading>Question Review</SectionHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
              {reviewItems.map((item, i) => (
                <MCQReviewCard key={i} item={item} idx={i}/>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* ── STRENGTHS ──────────────────────────────────────────────── */}
      {strengths.length > 0 && (
        <RevealSection delay={DELAYS.strengths} rm={rm}>
          <div style={{ padding:'0 1.5rem', marginBottom:'1.5rem' }}>
            <SectionHeading>What You Did Well</SectionHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
              {strengths.map((s, i) => (
                <StrengthCard key={i} text={s} idx={i} delay={DELAYS.strengths} rm={rm}/>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* ── WEAKNESSES ─────────────────────────────────────────────── */}
      {weaknesses.length > 0 && (
        <RevealSection delay={DELAYS.weaknesses} rm={rm}>
          <div style={{ padding:'0 1.5rem', marginBottom:'1.5rem' }}>
            <SectionHeading>Areas to Improve</SectionHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
              {weaknesses.map((w, i) => (
                <WeaknessCard key={i} text={w} idx={i} delay={DELAYS.weaknesses} rm={rm}/>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* ── GRAMMAR MISTAKES ───────────────────────────────────────── */}
      {mistakes.length > 0 && (
        <RevealSection delay={DELAYS.mistakes} rm={rm}>
          <div style={{ padding:'0 1.5rem', marginBottom:'1.5rem' }}>
            <SectionHeading>Corrections</SectionHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
              {mistakes.map((m, i) => (
                <MistakeCard key={i} raw={m} idx={i} delay={DELAYS.mistakes} rm={rm}/>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* ── PRONUNCIATION NOTES (Speaking Fix #2E) ─────────────────── */}
      {pronunciationNotes.length > 0 && (
        <RevealSection delay={DELAYS.mistakes + 120} rm={rm}>
          <div style={{ padding:'0 1.5rem', marginBottom:'1.5rem' }}>
            <SectionHeading>Pronunciation Notes</SectionHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {pronunciationNotes.map((note, i) => (
                <div key={i} className="af-card" style={{ background:'rgba(14,165,233,0.05)', border:'1px solid rgba(14,165,233,0.15)', borderRadius:12, padding:'0.85rem 1rem', fontSize:'0.85rem' }}>
                  <span style={{ color:'#38bdf8', fontFamily:'monospace', marginRight:6 }}>🔊</span>
                  <span style={{ color:'rgba(255,255,255,0.75)' }}>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* ── CORRECTIONS (HR Fix #3, #14) ─────────────────────────────── */}
      {corrections.length > 0 && (
        <RevealSection delay={DELAYS.mistakes + 180} rm={rm}>
          <div style={{ padding:'0 1.5rem', marginBottom:'1.5rem' }}>
            <SectionHeading>Corrections & Improvements</SectionHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
              {corrections.map((c, i) => {
                const isStr      = typeof c === 'string'
                const category   = isStr ? '' : (c.category || '')
                const issue      = isStr ? c  : (c.issue || '')
                const improvement= isStr ? '' : (c.improvement || '')
                const example    = isStr ? '' : (c.example || '')
                return (
                  <div key={i} className="af-card" style={{ background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:13, padding:'1rem 1.1rem' }}>
                    {category && (
                      <span style={{ display:'inline-block', background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:100, padding:'2px 9px', fontSize:'0.68rem', fontWeight:700, color:'#f59e0b', marginBottom:7 }}>
                        {category}
                      </span>
                    )}
                    {issue && <div style={{ color:'rgba(255,255,255,0.85)', fontSize:'0.87rem', fontWeight:600, marginBottom:4 }}>{issue}</div>}
                    {improvement && <div style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.83rem', marginBottom: example ? 6 : 0 }}>{improvement}</div>}
                    {example && (
                      <div style={{ background:'rgba(6,182,212,0.07)', border:'1px solid rgba(6,182,212,0.15)', borderRadius:8, padding:'5px 9px', color:'#67e8f9', fontSize:'0.78rem', fontStyle:'italic' }}>
                        "{example}"
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </RevealSection>
      )}

      {/* ── PROFESSIONAL ANSWER ────────────────────────────────────── */}
      {correctedAnswer && (
        <RevealSection delay={DELAYS.answer} rm={rm}>
          <div style={{ padding:'0 1.5rem', marginBottom:'1.5rem' }}>
            <SectionHeading>Model Answer</SectionHeading>
            <ProfessionalAnswerCard text={correctedAnswer} delay={DELAYS.answer + 200} rm={rm}/>
          </div>
        </RevealSection>
      )}

      {/* ── TIPS ───────────────────────────────────────────────────── */}
      {finalTips.length > 0 && (
        <RevealSection delay={DELAYS.tips} rm={rm}>
          <div style={{ padding:'0 1.5rem', marginBottom:'1.5rem' }}>
            <SectionHeading>Personalized Tips</SectionHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
              {finalTips.map((tip, i) => (
                <TipCard key={i} text={tip} idx={i} delay={DELAYS.tips} rm={rm}/>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* ── ACTION BUTTON ──────────────────────────────────────────── */}
      <RevealSection delay={DELAYS.buttons} rm={rm}>
        <div style={{ padding:'0 1.5rem', textAlign:'center' }}>
          <button
            className="af-btn"
            onClick={handleNext}
            style={{
              background:'linear-gradient(135deg,#1d4ed8,#2563eb)',
              color:'#fff', border:'none', borderRadius:14,
              padding:'14px 38px', fontSize:'1rem', fontWeight:700,
              cursor:'pointer', boxShadow:'0 6px 24px rgba(37,99,235,0.45)',
              letterSpacing:'0.02em',
            }}
          >
            {btnLabel}
          </button>
        </div>
      </RevealSection>

      {/* Responsive styles */}
      <style>{`
        @media (max-width:600px) {
          .af-reveal > div { padding-left:1rem !important; padding-right:1rem !important; }
        }
      `}</style>
    </div>
  )
}
