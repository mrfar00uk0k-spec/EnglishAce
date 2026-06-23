import React, { useState, useEffect, useRef } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import { listeningQuestions } from '../../data/content.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function speakSentence(text) {
  return new Promise((res) => {
    if (!window.speechSynthesis) { res(); return }
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'
    utt.rate = 0.88
    utt.pitch = 1
    // prefer a natural voice
    const voices = window.speechSynthesis.getVoices()
    const enVoice = voices.find(v => v.lang === 'en-US' && v.localService) ||
                    voices.find(v => v.lang.startsWith('en'))
    if (enVoice) utt.voice = enVoice
    utt.onend = res
    utt.onerror = res
    window.speechSynthesis.speak(utt)
  })
}

// Accurate scoring: normalize, then compare word by word
function scoreAnswer(userAns, correct) {
  const norm = s => s.toLowerCase()
    .replace(/[^\w\s]/g, '')   // remove punctuation
    .replace(/\s+/g, ' ')
    .trim()

  const u = norm(userAns)
  const c = norm(correct)

  // Exact match → 100
  if (u === c) return 100

  const uWords = u.split(' ').filter(Boolean)
  const cWords = c.split(' ').filter(Boolean)

  // Count matching words (order-aware)
  let matches = 0
  const used = new Array(uWords.length).fill(false)
  cWords.forEach(cw => {
    const idx = uWords.findIndex((uw, i) => !used[i] && uw === cw)
    if (idx !== -1) { matches++; used[idx] = true }
  })

  const precision = matches / uWords.length   // how much of user answer is correct
  const recall    = matches / cWords.length   // how much of correct answer was covered
  const f1 = cWords.length === 0 ? 0 : 2 * (precision * recall) / (precision + recall + 0.0001)

  return Math.round(f1 * 100)
}

const TOTAL_QUESTIONS = 3
const SECTION_TIME = 120 // 2 minutes for whole section

export default function Listening({ onFinish, isSingle }) {
  const { t, lang } = useLang()

  const [questions] = useState(() => {
    const easy = listeningQuestions.filter(q => q.difficulty === 'easy')
    const med  = listeningQuestions.filter(q => q.difficulty === 'medium')
    return [...shuffle(easy).slice(0, 2), ...shuffle(med).slice(0, 1)]
  })

  const [qIdx, setQIdx]           = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitted, setSubmitted]  = useState(false)
  const [results, setResults]      = useState([])
  const [totalScore, setTotalScore] = useState(0)
  const [playing, setPlaying]      = useState(false)
  const [hasPlayed, setHasPlayed]  = useState(false)  // played once → no replay
  const [finished, setFinished]    = useState(false)
  const [timeLeft, setTimeLeft]    = useState(SECTION_TIME)
  const timerRef = useRef(null)

  // load voices early
  useEffect(() => { window.speechSynthesis.getVoices() }, [])

  // Section timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setFinished(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const play = async () => {
    if (hasPlayed || playing) return   // ONE play only
    setPlaying(true)
    await speakSentence(questions[qIdx].sentence)
    setPlaying(false)
    setHasPlayed(true)
  }

  const submit = () => {
    const s = scoreAnswer(userAnswer, questions[qIdx].sentence)
    const result = { question: questions[qIdx].sentence, userAnswer, score: s }
    const newResults = [...results, result]
    const newTotal   = totalScore + s
    setResults(newResults)
    setTotalScore(newTotal)
    setSubmitted(true)
  }

  const next = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(q => q + 1)
      setUserAnswer('')
      setSubmitted(false)
      setHasPlayed(false)
    } else {
      clearInterval(timerRef.current)
      setFinished(true)
    }
  }

  const fmtTime = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  // ── FINISHED SCREEN ────────────────────────────────────────────
  if (finished) {
    const avg = results.length > 0 ? Math.round(totalScore / results.length) : 0
    const col  = avg >= 80 ? '#22d3ee' : avg >= 60 ? '#f59e0b' : '#f87171'
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>
            👂 Listening Complete!
          </h1>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: col, margin: '1rem 0' }}>
            {avg}<span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.35)' }}>/100</span>
          </div>
        </div>

        {results.map((r, i) => {
          const sc = r.score
          const good = sc >= 75
          return (
            <div key={i} style={{
              background: good ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
              border: `1px solid ${good ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              borderRadius: 14, padding: '1.1rem 1.25rem', marginBottom: '0.75rem',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: 4 }}>Question {i+1}</div>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: 4 }}>✅ {r.question}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.87rem', marginBottom: 6 }}>
                Your answer: <em style={{ color: 'rgba(255,255,255,0.8)' }}>{r.userAnswer || '(empty)'}</em>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 6, flex: 1 }}>
                  <div style={{ width: `${sc}%`, height: '100%', background: good ? '#22d3ee' : '#f87171', borderRadius: 4, transition: 'width 1s' }}/>
                </div>
                <span style={{ color: good ? '#22d3ee' : '#f87171', fontWeight: 800, fontSize: '0.9rem', minWidth: 40 }}>{sc}/100</span>
              </div>
            </div>
          )
        })}

        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <button onClick={() => onFinish(avg)} className="btn-primary" style={{
            background: 'linear-gradient(135deg,#2563eb,#0ea5e9)', color: '#fff',
            border: 'none', borderRadius: 12, padding: '13px 34px',
            fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
          }}>Continue to Reading →</button>
        </div>
      </div>
    )
  }

  // ── QUESTION SCREEN ────────────────────────────────────────────
  const q = questions[qIdx]
  const progress = (qIdx / questions.length) * 100
  const timeColor = timeLeft < 30 ? '#f87171' : timeLeft < 60 ? '#f59e0b' : '#22d3ee'

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '0.4rem' }}>
          👂 {t('listen_title')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>{t('listen_subtitle')}</p>
      </div>

      {/* Timer + Progress row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' }}>
          {t('listen_question')} {qIdx + 1} / {questions.length}
        </span>
        <span style={{
          color: timeColor, fontWeight: 700, fontSize: '0.88rem',
          background: `${timeColor}15`, borderRadius: 6, padding: '3px 10px',
          transition: 'color 0.5s',
        }}>⏱ {fmtTime(timeLeft)}</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 5, marginBottom: '1.75rem' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#8b5cf6,#06b6d4)', borderRadius: 4, transition: 'width 0.5s' }}/>
      </div>

      {/* Audio card */}
      <div style={{
        background: hasPlayed ? 'rgba(16,185,129,0.07)' : 'rgba(139,92,246,0.1)',
        border: `1px solid ${hasPlayed ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}`,
        borderRadius: 18, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem',
        transition: 'all 0.4s',
      }}>
        <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem', animation: playing ? 'float 0.8s ease-in-out infinite' : 'none' }}>
          {playing ? '🔊' : hasPlayed ? '✅' : '🔊'}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginBottom: '1.1rem' }}>
          {playing
            ? 'Playing audio... listen carefully'
            : hasPlayed
              ? 'Audio played once. Now type what you heard.'
              : 'Click play. You can only listen once.'}
        </p>
        <button
          onClick={play}
          disabled={hasPlayed || playing}
          style={{
            background: hasPlayed ? 'rgba(255,255,255,0.08)' : playing ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
            color: hasPlayed ? 'rgba(255,255,255,0.4)' : '#fff',
            border: 'none', borderRadius: 12, padding: '11px 28px',
            fontSize: '0.93rem', fontWeight: 700,
            cursor: hasPlayed || playing ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s',
          }}
        >
          {playing ? '🔊 Playing...' : hasPlayed ? '🔒 Played (no replay)' : `▶ ${t('listen_play')}`}
        </button>
      </div>

      {/* Answer input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
          Type exactly what you heard:
        </label>
        <input
          type="text"
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !submitted && hasPlayed && userAnswer.trim()) submit() }}
          disabled={submitted || !hasPlayed}
          placeholder={hasPlayed ? t('listen_type') : 'Listen to the audio first...'}
          autoComplete="off"
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${hasPlayed && !submitted ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 10, padding: '13px 16px', color: '#fff', fontSize: '0.95rem',
            outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.25s',
          }}
        />
      </div>

      {/* Submit / Result */}
      {!submitted ? (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={submit}
            disabled={!hasPlayed || !userAnswer.trim()}
            className={hasPlayed && userAnswer.trim() ? 'btn-primary' : ''}
            style={{
              background: hasPlayed && userAnswer.trim() ? 'linear-gradient(135deg,#2563eb,#0ea5e9)' : 'rgba(255,255,255,0.08)',
              color: '#fff', border: 'none', borderRadius: 12, padding: '12px 30px',
              fontSize: '0.93rem', fontWeight: 700,
              cursor: hasPlayed && userAnswer.trim() ? 'pointer' : 'not-allowed',
            }}
          >{t('listen_submit')}</button>
        </div>
      ) : (
        <div>
          {/* Correct answer */}
          <div style={{ background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.28)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>✅ Correct Answer</div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{q.sentence}</p>
          </div>

          {/* Score */}
          {(() => {
            const sc = scoreAnswer(userAnswer, q.sentence)
            const good = sc >= 75
            return (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', marginBottom: 6 }}>
                  Your answer: <em style={{ color: 'rgba(255,255,255,0.85)' }}>{userAnswer || '(empty)'}</em>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 7, flex: 1 }}>
                    <div style={{ width: `${sc}%`, height: '100%', background: good ? '#22d3ee' : '#f87171', borderRadius: 4, transition: 'width 1s' }}/>
                  </div>
                  <span style={{ color: good ? '#22d3ee' : '#f87171', fontWeight: 800 }}>{sc}/100</span>
                </div>
              </div>
            )
          })()}

          <div style={{ textAlign: 'center' }}>
            <button onClick={next} className="btn-primary" style={{
              background: 'linear-gradient(135deg,#2563eb,#0ea5e9)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '12px 30px',
              fontSize: '0.93rem', fontWeight: 700, cursor: 'pointer',
            }}>
              {qIdx < questions.length - 1 ? `${t('listen_next')} →` : isSingle ? (lang === 'ar' ? 'عرض نتيجتي' : 'View My Results') : `${t('listen_finish')} →`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
