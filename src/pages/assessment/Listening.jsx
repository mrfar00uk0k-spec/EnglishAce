import React, { useState, useEffect, useRef } from 'react'
import { useLang } from '../../contexts/LangContext.jsx'
import AssessmentFeedback from '../../components/AssessmentFeedback.jsx'
import { fetchListeningQuestions, friendlyError } from '../../utils/questionsApi.js'
import { IconEar, IconSpeakerOn, IconSpeakerPlaying, IconCheckCircle, IconLock, IconClock, IconRefresh } from '../../components/Icons.jsx'

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

const SECTION_TIME = 120 // 2 minutes for whole section

export default function Listening({ onFinish, isSingle }) {
  const { t, lang } = useLang()
  const isAr = lang === 'ar'

  const [questions, setQuestions] = useState(null)
  const [loadError, setLoadError] = useState('')

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

  // Fetch questions from backend
  useEffect(() => {
    let cancelled = false
    fetchListeningQuestions(3)
      .then(qs => { if (!cancelled) setQuestions(qs) })
      .catch(err => { if (!cancelled) setLoadError(friendlyError(err, lang)) })
    return () => { cancelled = true }
  }, [])

  // load voices early
  useEffect(() => { window.speechSynthesis?.getVoices() }, [])

  // Section timer — only runs once questions are loaded
  useEffect(() => {
    if (!questions) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setFinished(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [questions])

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

  const handleRetryLoad = () => {
    setLoadError('')
    setQuestions(null)
    fetchListeningQuestions(3)
      .then(qs => setQuestions(qs))
      .catch(err => setLoadError(friendlyError(err, lang)))
  }

  const fmtTime = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  // ── LOADING STATE ──────────────────────────────────────────────────────────
  if (!questions && !loadError) {
    return (
      <div style={{ maxWidth:700, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <div style={{ width:40, height:40, margin:'0 auto 1rem', border:'3px solid rgba(139,92,246,0.2)', borderTopColor:'#8b5cf6', borderRadius:'50%', animation:'lspin 0.8s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.88rem' }}>{isAr ? 'جارٍ تحميل الأسئلة…' : 'Loading questions…'}</p>
        <style>{`@keyframes lspin { to { transform:rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── ERROR STATE ─────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div style={{ maxWidth:500, margin:'0 auto', padding:'4rem 1.5rem', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.95rem', marginBottom:'1.25rem' }}>{loadError}</p>
        <button onClick={handleRetryLoad} style={{ background:'linear-gradient(135deg,#8b5cf6,#7c3aed)', color:'#fff', border:'none', borderRadius:11, padding:'11px 28px', fontSize:'0.92rem', fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
          <IconRefresh size={15} color="#fff" /> {isAr ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    )
  }

  // ── FINISHED SCREEN ────────────────────────────────────────────
  if (finished) {
    const avg = results.length > 0 ? Math.round(totalScore / results.length) : 0
    const getListeningStrengths = (sc) => {
      if (sc >= 80) return ['Strong ability to catch details in spoken English', 'Excellent auditory discrimination skills', 'Good at processing information in real-time']
      if (sc >= 60) return ['Good general listening comprehension', 'Able to follow the main ideas of spoken sentences']
      if (sc >= 40) return ['You understood some of the spoken content', 'Persistence in attempting all questions']
      return ['You completed the listening test']
    }
    const getListeningWeaknesses = (sc) => {
      if (sc >= 80) return sc === 100 ? [] : ['Some fast speech or reduced forms may still be challenging']
      if (sc >= 60) return ['Spelling accuracy when transcribing needs improvement', 'Practice with native-speed audio daily']
      if (sc >= 40) return ['Listening comprehension needs regular practice', 'Focus on common vocabulary in spoken English', 'Try dictation exercises with BBC Learning English']
      return ['Listening comprehension needs significant development', 'Start with slow, clear audio and gradually increase speed', 'Practice every day — even 10 minutes makes a difference']
    }

    const reviewItems = results.map((r, i) => ({
      question:      `Listen & Write — Sentence ${i + 1}`,
      userAnswer:    r.userAnswer || '(empty)',
      correctAnswer: r.question,
      isCorrect:     r.score >= 75,
      score:         r.score,
    }))

    return (
      <div style={{ maxWidth:700, margin:'0 auto', padding:'0 0 2rem' }}>
        <AssessmentFeedback
          assessmentType="listening"
          overallScore={avg}
          reviewItems={reviewItems}
          onNext={() => onFinish(avg)}
          isSingle={isSingle}
          lang={lang}
          nextLabel={lang === 'ar' ? 'متابعة →' : 'Continue →'}
        />
      </div>
    )
  }

  // ── QUESTION SCREEN ────────────────────────────────────────────
  const q = questions[qIdx]
  const progress = (qIdx / questions.length) * 100
  const timeColor = timeLeft < 30 ? '#f87171' : timeLeft < 60 ? '#f59e0b' : '#22d3ee'

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <style>{`
        ul, ol, li { list-style: none !important; padding-left: 0 !important; }
        ul::before, ol::before, li::before { display: none !important; content: none !important; }
      `}</style>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: '0.4rem', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <IconEar size={22} color="#8b5cf6" /> {t('listen_title')}
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
          transition: 'color 0.5s', display:'inline-flex', alignItems:'center', gap:5,
        }}><IconClock size={13} color={timeColor} /> {fmtTime(timeLeft)}</span>
      </div>
      <div style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', borderRadius: 4, height: 5, marginBottom: '1.75rem' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#8b5cf6,#06b6d4)', borderRadius: 4, transition: 'width 0.5s' }}/>
      </div>

      {/* Audio card */}
      <div style={{
        background: hasPlayed ? 'rgba(16,185,129,0.07)' : 'rgba(139,92,246,0.1)',
        border: `1px solid ${hasPlayed ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}`,
        borderRadius: 18, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem',
        transition: 'all 0.4s',
      }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom: '0.9rem', animation: playing ? 'float 0.8s ease-in-out infinite' : 'none' }}>
          {playing
            ? <IconSpeakerPlaying size={40} color="#c4b5fd" />
            : hasPlayed
              ? <IconCheckCircle size={38} color="#6ee7b7" />
              : <IconSpeakerOn size={40} color="#c4b5fd" />}
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
            display:'inline-flex', alignItems:'center', gap:8,
          }}
        >
          {playing
            ? <><IconSpeakerPlaying size={15} color="#fff" /> Playing...</>
            : hasPlayed
              ? <><IconLock size={14} color="rgba(255,255,255,0.4)" /> Played (no replay)</>
              : <>▶ {t('listen_play')}</>}
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
            width: '100%', background:'rgba(255,255,255,0.06)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border: `1px solid ${hasPlayed && !submitted ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.12)'}`,
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
          <div style={{ background:'rgba(16,185,129,0.09)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', border: '1px solid rgba(16,185,129,0.28)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '0.82rem', marginBottom: 4, display:'flex', alignItems:'center', gap:6 }}>
              <IconCheckCircle size={14} color="#6ee7b7" /> Correct Answer
            </div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{q.sentence}</p>
          </div>

          {/* Score */}
          {(() => {
            const sc = scoreAnswer(userAnswer, q.sentence)
            const good = sc >= 75
            return (
              <div style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', marginBottom: 6 }}>
                  Your answer: <em style={{ color: 'rgba(255,255,255,0.85)' }}>{userAnswer || '(empty)'}</em>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', borderRadius: 4, height: 7, flex: 1 }}>
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
