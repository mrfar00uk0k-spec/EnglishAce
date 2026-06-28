import React, { useState, useEffect } from 'react'
import { useLexi } from '../contexts/LexiContext.jsx'
import { THINKING_MESSAGES } from './LexiTipEngine.js'

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const LEXI_CSS = `
@keyframes lxFloat     { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(1deg)} }
@keyframes lxThink     { 0%,100%{transform:rotate(0deg) translateY(0)} 30%{transform:rotate(-9deg) translateY(-4px)} 70%{transform:rotate(8deg) translateY(-3px)} }
@keyframes lxCelebrate { 0%,100%{transform:translateY(0) scale(1) rotate(0deg)} 15%{transform:translateY(-18px) scale(1.07) rotate(-4deg)} 35%{transform:translateY(-8px) scale(1.03) rotate(3deg)} 55%{transform:translateY(-22px) scale(1.09) rotate(-3deg)} 75%{transform:translateY(-6px) scale(1.02) rotate(2deg)} 90%{transform:translateY(-12px) scale(1.04)} }
@keyframes lxPlayful   { 0%,100%{transform:rotate(0deg) scale(1)} 25%{transform:rotate(-11deg) scale(1.05)} 55%{transform:rotate(13deg) scale(1.06)} 80%{transform:rotate(-6deg) scale(1.02)} }
@keyframes lxAnalyze   { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-4px) scale(1.02)} }
@keyframes lxConcern   { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-5px) rotate(-4deg)} }
@keyframes lxScan      { 0%{top:-5%;opacity:0} 10%{opacity:0.7} 90%{opacity:0.7} 100%{top:105%;opacity:0} }
@keyframes lxSpark     { 0%,100%{opacity:0;transform:scale(0) translate(0,0)} 40%{opacity:1;transform:scale(1.2) translate(var(--tx),var(--ty))} 70%{opacity:0.5;transform:scale(0.9) translate(var(--tx2),var(--ty2))} }
@keyframes lxSlideUp   { from{opacity:0;transform:translateY(18px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes lxDot       { 0%,80%,100%{transform:translateY(0);opacity:0.38} 40%{transform:translateY(-9px);opacity:1} }
@keyframes lxBtnPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0),0 8px 24px rgba(0,0,0,0.5)} 50%{box-shadow:0 0 0 9px rgba(37,99,235,0.22),0 8px 24px rgba(0,0,0,0.5)} }
@keyframes lxNotif     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.8);opacity:0.5} }
@keyframes lxFadeIn    { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
@keyframes lxNavPop    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
@keyframes lxGlow      { 0%,100%{opacity:0.5} 50%{opacity:1} }
.lv-panel::-webkit-scrollbar{width:3px}
.lv-panel::-webkit-scrollbar-thumb{background:rgba(37,99,235,0.4);border-radius:3px}
`

let _css = false
function injectCSS() {
  if (_css || typeof document === 'undefined') return
  const s = document.createElement('style')
  s.setAttribute('data-lv', '1')
  s.textContent = LEXI_CSS
  document.head.appendChild(s)
  _css = true
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE CONFIG — animation + filter + overlay per emotional state
// ─────────────────────────────────────────────────────────────────────────────
const STATE_CONFIG = {
  idle: {
    anim:   'none',
    filter: 'brightness(1) saturate(1) drop-shadow(0 6px 18px rgba(37,99,235,0.45))',
  },
  advising: {
    anim:   'none',
    filter: 'brightness(1.05) saturate(1.05) drop-shadow(0 6px 18px rgba(37,99,235,0.45))',
  },
  thinking: {
    anim:   'lxThink 3.5s ease-in-out infinite',
    filter: 'brightness(0.93) saturate(0.88) drop-shadow(0 4px 12px rgba(37,99,235,0.3))',
  },
  celebrating: {
    anim:   'lxCelebrate 1.1s ease-in-out 5',
    filter: 'brightness(1.18) saturate(1.35) drop-shadow(0 0 22px rgba(56,189,248,0.7))',
  },
  playful: {
    anim:   'lxPlayful 2s ease-in-out infinite',
    filter: 'brightness(1.1) saturate(1.15) hue-rotate(-5deg) drop-shadow(0 6px 16px rgba(37,99,235,0.5))',
  },
  analyzing: {
    anim:   'lxAnalyze 3.5s ease-in-out infinite',
    filter: 'brightness(0.88) saturate(0.82) contrast(1.06) drop-shadow(0 4px 12px rgba(37,99,235,0.3))',
  },
  concerned: {
    anim:   'lxConcern 2.5s ease-in-out infinite',
    filter: 'brightness(0.82) saturate(0.68) sepia(0.18) drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
  },
}

const STATE_PHRASES = {
  idle:        ["Hi! I'm Lexi, your AI English coach! 🦊", "Ready to improve your English today?", "Let's discover your real English level!"],
  thinking:    ["Hmm... analyzing your answer carefully...", "Checking your sentence structure...", "Looking for vocabulary patterns...", "Comparing with CEFR standards..."],
  celebrating: ["Excellent work! You're amazing! 🎉", "I'm so proud of your progress! 🌟", "Outstanding! Keep it up!", "You nailed it! 🦊✨"],
  playful:     ["Don't worry, mistakes help us learn! 😄", "Practice makes perfect — let's go!", "You've totally got this! 😉"],
  analyzing:   ["Processing your answer...", "Running deep analysis...", "Evaluating your performance...", "Almost done!"],
  concerned:   ["Let's work on this together.", "Every mistake is a lesson.", "Don't give up — you're closer than you think."],
}

// ─────────────────────────────────────────────────────────────────────────────
// Lexi Image Component — uses the real character image with CSS state effects
// ─────────────────────────────────────────────────────────────────────────────
function LexiCharacter({ state = 'idle', size = 180, faceOnly = false }) {
  injectCSS()
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.idle

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: faceOnly ? size : Math.round(size * 1.35),
      flexShrink: 0,
      display: 'inline-block',
    }}>
      {/* Main character image */}
      <img
        src="/lexi.png"
        alt="Lexi"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: faceOnly ? '50% 12%' : '50% 8%',
          borderRadius: faceOnly ? '50%' : '16px',
          display: 'block',
          animation: cfg.anim,
          filter: cfg.filter,
          transformOrigin: 'center bottom',
          transition: 'filter 0.5s ease',
        }}
      />

      {/* THINKING — bubble overlay */}
      {state === 'thinking' && (
        <div style={{ position:'absolute', top:-8, right:-8, pointerEvents:'none' }}>
          <div style={{ background:'rgba(30,58,138,0.9)', border:'1.5px solid rgba(96,165,250,0.6)', borderRadius:12, padding:'4px 8px', fontSize:'0.68rem', color:'#93c5fd', fontWeight:700, backdropFilter:'blur(4px)', whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(0,0,0,0.4)' }}>
            🤔 Thinking...
          </div>
          <div style={{ position:'absolute', bottom:-6, left:12, width:0, height:0, borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:'7px solid rgba(30,58,138,0.9)' }}/>
        </div>
      )}

      {/* CELEBRATING — sparkle ring */}
      {state === 'celebrating' && (
        <div style={{ position:'absolute', inset:-8, pointerEvents:'none' }}>
          {['✨','⭐','🌟','💫','✨'].map((e, i) => (
            <div key={i} style={{
              position:'absolute',
              fontSize: i % 2 === 0 ? '1rem' : '0.8rem',
              animation: `lxFloat ${0.8 + i * 0.15}s ${i * 0.12}s ease-in-out infinite`,
              top: `${['-10%','-8%','85%','88%','40%'][i]}`,
              left: `${['-8%','88%','-10%','88%','-15%'][i]}`,
            }}>{e}</div>
          ))}
        </div>
      )}

      {/* PLAYFUL — wink badge */}
      {state === 'playful' && (
        <div style={{ position:'absolute', bottom:-4, right:-4, background:'rgba(37,99,235,0.9)', borderRadius:'50%', width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', border:'2px solid rgba(147,197,253,0.5)', boxShadow:'0 4px 10px rgba(0,0,0,0.4)' }}>
          😄
        </div>
      )}

      {/* ANALYZING — scan line */}
      {state === 'analyzing' && (
        <div style={{ position:'absolute', inset:0, borderRadius:16, overflow:'hidden', pointerEvents:'none' }}>
          <div style={{
            position:'absolute', left:0, right:0, height:2,
            background:'linear-gradient(90deg,transparent,rgba(56,189,248,0.7),transparent)',
            animation:'lxScan 2s linear infinite',
          }}/>
          <div style={{ position:'absolute', inset:0, border:'1.5px solid rgba(56,189,248,0.25)', borderRadius:16 }}/>
        </div>
      )}

      {/* CONCERNED — worried badge */}
      {state === 'concerned' && (
        <div style={{ position:'absolute', top:-4, right:-4, background:'rgba(30,27,75,0.92)', borderRadius:'50%', width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', border:'2px solid rgba(148,163,184,0.4)' }}>
          😟
        </div>
      )}

      {/* Glow ring under image when active */}
      <div style={{
        position:'absolute', bottom:-6, left:'50%', transform:'translateX(-50%)',
        width:'70%', height:12,
        background:'radial-gradient(ellipse, rgba(37,99,235,0.45) 0%, transparent 70%)',
        animation:'lxGlow 2.5s ease-in-out infinite',
        pointerEvents:'none',
      }}/>
    </div>
  )
}

// helper
function sc(v) { return v >= 70 ? '#38bdf8' : v >= 50 ? '#818cf8' : '#f472b6' }

// ─────────────────────────────────────────────────────────────────────────────
// Score → emotion image
// ─────────────────────────────────────────────────────────────────────────────
function getLexiEmotion(score) {
  const n = Number(score) || 0
  if (n >= 80) return '/lexi-surprised.png'
  if (n >= 65) return '/lexi-confident.png'
  if (n >= 45) return '/lexi-pumped.png'
  if (n >= 25) return '/lexi-thinking.png'
  return '/lexi-sad.png'
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT: Floating Widget
// ─────────────────────────────────────────────────────────────────────────────
export default function LexiWidget() {
  injectCSS()
  const { visible, expanded, message, hasNew, toggleLexi, clearNew, dismissLexi } = useLexi()
  useEffect(() => { if (expanded) clearNew() }, [expanded, clearNew])
  if (!visible) return null

  const foxState = message?.score >= 65 ? 'celebrating' : message?.score >= 40 ? 'idle' : 'concerned'

  return (
    <div style={{ position:'fixed', bottom:20, right:20, zIndex:9990, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10, fontFamily:'DM Sans,system-ui,sans-serif' }}>

      {/* ── Expanded Panel ── */}
      {expanded && message && (
        <div className="lv-panel" style={{
          width: 320, maxHeight: 520, overflowY: 'auto', overflowX: 'hidden',
          background: 'linear-gradient(160deg,#08101e 0%,#040810 100%)',
          border: '1px solid rgba(37,99,235,0.3)',
          borderRadius: 20,
          boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(56,189,248,0.04)',
          animation: 'lxSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,rgba(37,99,235,0.18),rgba(14,165,233,0.1))',
            borderBottom: '1px solid rgba(37,99,235,0.15)',
            padding: '1rem 1rem 0',
            display: 'flex', alignItems: 'flex-end', gap: 12,
          }}>
            {/* Emotion image based on score */}
            <div style={{ width:100, height:126, flexShrink:0, borderRadius:14, overflow:'hidden', border:'2px solid rgba(37,99,235,0.3)', boxShadow:'0 0 18px rgba(37,99,235,0.2)', background:'rgba(15,28,60,0.8)' }}>
              <img
                src={message.score > 0 ? getLexiEmotion(message.score) : '/lexi.png'}
                alt="Lexi"
                style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'50% 8%', display:'block' }}
              />
            </div>
            <div style={{ flex:1, paddingBottom:12 }}>
              <div style={{ color:'#93c5fd', fontWeight:800, fontSize:'0.95rem', marginBottom:2 }}>Lexi 🦊</div>
              <div style={{ color:'rgba(255,255,255,0.42)', fontSize:'0.72rem', marginBottom:6 }}>AI English Coach</div>
              <p style={{ color:'#fff', fontWeight:700, fontSize:'0.88rem', margin:0, lineHeight:1.5 }}>{message.greeting}</p>
            </div>
            <button onClick={dismissLexi} style={{ alignSelf:'flex-start', marginTop:4, background:'rgba(255,255,255,0.07)', border:'none', color:'rgba(255,255,255,0.4)', borderRadius:7, width:24, height:24, cursor:'pointer', fontSize:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ padding:'0.9rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'0.75rem' }}>
              <span style={{ fontSize:'2.1rem', fontWeight:900, color:sc(message.score), fontFamily:'Playfair Display,serif', lineHeight:1 }}>{message.score}</span>
              <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.8rem' }}>/100</span>
              {message.level && <span style={{ background:sc(message.score)+'18', border:'1px solid '+sc(message.score)+'40', color:sc(message.score), borderRadius:20, padding:'2px 10px', fontSize:'0.7rem', fontWeight:700 }}>{message.level}</span>}
            </div>
            {message.topStrength && (
              <div style={{ background:'rgba(56,189,248,0.07)', border:'1px solid rgba(56,189,248,0.18)', borderRadius:11, padding:'0.7rem 0.85rem', marginBottom:'0.65rem', animation:'lxFadeIn 0.4s ease' }}>
                <div style={{ color:'#7dd3fc', fontWeight:700, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>✅ Lexi noticed</div>
                <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.83rem', margin:0, lineHeight:1.5 }}>{message.topStrength}</p>
              </div>
            )}
            {message.topMistakes?.length > 0 && (
              <div style={{ background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:11, padding:'0.7rem 0.85rem', marginBottom:'0.65rem', animation:'lxFadeIn 0.5s ease' }}>
                <div style={{ color:'#a5b4fc', fontWeight:700, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>⚡ Lexi's Fix</div>
                {message.topMistakes.map((m,i) => (
                  <div key={i} style={{ color:'rgba(255,255,255,0.78)', fontSize:'0.8rem', lineHeight:1.5, paddingLeft:8, borderLeft:'2px solid rgba(99,102,241,0.4)', marginBottom: i < message.topMistakes.length-1 ? 4 : 0 }}>{m}</div>
                ))}
              </div>
            )}
            {message.topTip && (
              <div style={{ background:'rgba(37,99,235,0.07)', border:'1px solid rgba(37,99,235,0.18)', borderRadius:11, padding:'0.7rem 0.85rem', marginBottom:'0.75rem', animation:'lxFadeIn 0.6s ease' }}>
                <div style={{ color:'#60a5fa', fontWeight:700, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>💡 Tip</div>
                <p style={{ color:'rgba(255,255,255,0.78)', fontSize:'0.82rem', margin:0, lineHeight:1.5 }}>{message.topTip}</p>
              </div>
            )}
            <p style={{ color:'rgba(255,255,255,0.15)', fontSize:'0.7rem', textAlign:'right', margin:0 }}>— Lexi 🦊</p>
          </div>
        </div>
      )}

      {/* ── Floating Button ── */}
      <button
        onClick={toggleLexi}
        title="Lexi — AI English Coach"
        style={{
          width: 70, height: 70, borderRadius: '50%',
          background: 'linear-gradient(135deg,#0f1e3d,#0a1628)',
          border: '2.5px solid rgba(37,99,235,0.55)',
          cursor: 'pointer', padding: 0, overflow: 'hidden',
          position: 'relative',
          animation: hasNew ? 'lxBtnPulse 1.8s ease-in-out infinite' : 'none',
          boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
          transition: 'border-color 0.3s, transform 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='scale(1.08)'; e.currentTarget.style.borderColor='rgba(96,165,250,0.9)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.borderColor='rgba(37,99,235,0.55)' }}
      >
        <img
          src="/lexi.png"
          alt="Lexi"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: '50% 12%',
            animation: 'none',
            filter: 'brightness(1) saturate(1) drop-shadow(0 0 8px rgba(37,99,235,0.5))',
          }}
        />
        {hasNew && !expanded && (
          <span style={{ position:'absolute', top:2, right:2, width:11, height:11, borderRadius:'50%', background:'#60a5fa', border:'2px solid #050810', animation:'lxNotif 1.2s ease-in-out infinite', display:'block', zIndex:1 }}/>
        )}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: LexiNavFox — tiny circular image for navbar
// ─────────────────────────────────────────────────────────────────────────────
export function LexiNavFox() {
  injectCSS()
  return (
    <div style={{ width:34, height:34, borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(96,165,250,0.6)', flexShrink:0, animation:'lxNavPop 3.5s ease-in-out infinite', boxShadow:'0 0 10px rgba(37,99,235,0.3)' }}>
      <img src="/lexi.png" alt="Lexi" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'50% 12%' }}/>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: LexiAnalyzing
// ─────────────────────────────────────────────────────────────────────────────
export function LexiAnalyzing() {
  injectCSS()
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % STATE_PHRASES.analyzing.length), 2400)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ textAlign:'center', padding:'2.5rem 1.5rem' }}>
      <LexiCharacter state="analyzing" size={200} />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, margin:'0.75rem 0 0.5rem' }}>
        <span style={{ color:'#60a5fa', fontWeight:800, fontSize:'1.05rem' }}>Lexi</span>
        <span>🦊</span>
        <span style={{ color:'rgba(255,255,255,0.38)', fontSize:'0.8rem' }}>is analyzing</span>
      </div>
      <p style={{ color:'rgba(255,255,255,0.82)', fontWeight:600, fontSize:'0.93rem', marginBottom:'1rem', minHeight:'1.5em' }}>
        {STATE_PHRASES.analyzing[idx]}
      </p>
      <div style={{ display:'flex', justifyContent:'center', gap:7 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#60a5fa)', animation:`lxDot 1.2s ${i*0.2}s ease-in-out infinite` }}/>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: LexiFeedbackHeader
// ─────────────────────────────────────────────────────────────────────────────
export function LexiFeedbackHeader({ testType = 'speaking' }) {
  injectCSS()
  const labels = { speaking:'Speaking', writing:'Writing', hr:'Interview', grammar:'Grammar', vocabulary:'Vocabulary', listening:'Listening', reading:'Reading' }
  const msgs = {
    speaking:   "I listened carefully to your answer.",
    writing:    "I reviewed your response in detail.",
    hr:         "I evaluated your interview answer professionally.",
    grammar:    "I checked every grammar answer.",
    vocabulary: "I reviewed your vocabulary choices.",
    listening:  "I checked your listening answers.",
    reading:    "I reviewed your comprehension responses.",
  }
  return (
    <div style={{
      background: 'linear-gradient(135deg,rgba(37,99,235,0.1),rgba(14,165,233,0.07))',
      border: '1px solid rgba(37,99,235,0.25)',
      borderRadius: 18,
      padding: '0.75rem 1.25rem 0.75rem 0.75rem',
      marginBottom: '1.5rem',
      animation: 'lxSlideUp 0.35s cubic-bezier(0.22,1,0.36,1)',
      display: 'flex', alignItems: 'flex-end', gap: 10,
    }}>
      <LexiCharacter state="idle" size={110} />
      <div style={{ paddingBottom: 6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
          <span style={{ color:'#60a5fa', fontWeight:800, fontSize:'1rem' }}>Lexi 🦊</span>
          <span style={{ background:'rgba(37,99,235,0.2)', color:'#93c5fd', border:'1px solid rgba(37,99,235,0.35)', borderRadius:6, padding:'1px 8px', fontSize:'0.68rem', fontWeight:700 }}>AI Coach</span>
        </div>
        <div style={{ color:'#e0f2fe', fontWeight:700, fontSize:'0.92rem', marginBottom:3 }}>{labels[testType]} Evaluation</div>
        <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.78rem' }}>{msgs[testType]}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: LexiHomeGreeting (stub — handled in Navbar)
// ─────────────────────────────────────────────────────────────────────────────
export function LexiHomeGreeting() { return null }

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: LexiResultsBanner
// ─────────────────────────────────────────────────────────────────────────────
export function LexiResultsBanner({ score = 0, level = 'A1' }) {
  injectCSS()
  const n = Number(score) || 0
  const foxState = n >= 65 ? 'celebrating' : n >= 40 ? 'idle' : 'concerned'
  const msg =
    n >= 80 ? `Outstanding! 🌟 Your ${level} level shows real mastery. I'm genuinely impressed!`
    : n >= 65 ? `Excellent work! 🦊 You've reached ${level} level. Keep building on these skills!`
    : n >= 50 ? `Good effort! Your ${level} results show solid progress. Let's keep going.`
    : n >= 30 ? `You're progressing at ${level} level. Every session brings you closer! 💪`
    : `Every attempt is growth! 🦊 I'm here to guide you all the way up.`

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 16,
      background: 'linear-gradient(135deg,rgba(37,99,235,0.1),rgba(14,165,233,0.07))',
      border: '1px solid rgba(37,99,235,0.22)',
      borderRadius: 18,
      padding: '0.75rem 1.5rem 0.75rem 0.75rem',
      marginBottom: '1.75rem',
      animation: 'lxSlideUp 0.4s cubic-bezier(0.22,1,0.36,1)',
      flexWrap: 'wrap',
    }}>
      <LexiCharacter state={foxState} size={130} />
      <div style={{ flex:1, minWidth:160, paddingBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <span style={{ color:'#60a5fa', fontWeight:800, fontSize:'1rem' }}>Lexi 🦊</span>
          <span style={{ color:'rgba(255,255,255,0.22)', fontSize:'0.75rem' }}>says:</span>
        </div>
        <p style={{ color:'rgba(255,255,255,0.9)', fontSize:'0.93rem', fontWeight:600, lineHeight:1.6, margin:0 }}>{msg}</p>
        <p style={{ color:'rgba(255,255,255,0.18)', fontSize:'0.7rem', margin:'6px 0 0', textAlign:'right' }}>— Lexi 🦊</p>
      </div>
    </div>
  )
}


