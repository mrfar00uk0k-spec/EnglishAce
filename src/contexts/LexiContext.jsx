import React, { createContext, useContext, useState, useCallback } from 'react'
import { getRandomTip, getNextGreeting } from '../components/LexiTipEngine.js'

const LexiCtx = createContext(null)

function buildMessage({ type = '', overall = 0, level = 'A1', strengths = [], weaknesses = [], mistakes = [], tips = [] }) {
  const score = Number(overall) || 0
  const greeting =
    score >= 80 ? "Outstanding! 🌟 You're doing amazing!"
    : score >= 65 ? "Great work! 🦊 Keep it up!"
    : score >= 50 ? "Good effort! 💪 You're improving!"
    : score >= 30 ? "Nice try! 🦊 Let's work on this together."
    : "Every attempt counts! 💪 Let's improve together."

  const typeLabel = { speaking:'your speaking', writing:'your writing', hr:'your interview', grammar:'your grammar', vocabulary:'your vocabulary', results:'your full test' }[type] || 'your test'

  return {
    greeting,
    typeLabel,
    topStrength:  strengths.find(s => s?.trim()) || null,
    topMistakes:  mistakes.filter(m => m?.trim()).slice(0, 2),
    topTip:       tips.find(t => t?.trim()) || getRandomTip(type),
    topWeakness:  weaknesses.find(w => w?.trim()) || null,
    score,
    level,
    type,
  }
}

export function LexiProvider({ children }) {
  const [visible,  setVisible]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [message,  setMessage]  = useState(null)
  const [hasNew,   setHasNew]   = useState(false)
  const [greeting] = useState(() => getNextGreeting())
  const [dailyTip] = useState(() => getRandomTip())

  const showLexi = useCallback((data) => {
    setMessage(buildMessage(data))
    setVisible(true)
    setExpanded(true)
    setHasNew(true)
  }, [])

  const hideLexi    = useCallback(() => setExpanded(false), [])
  const dismissLexi = useCallback(() => { setExpanded(false); setVisible(false) }, [])
  const toggleLexi  = useCallback(() => { setExpanded(e => !e); setHasNew(false) }, [])
  const clearNew    = useCallback(() => setHasNew(false), [])

  return (
    <LexiCtx.Provider value={{ visible, expanded, message, hasNew, greeting, dailyTip, showLexi, hideLexi, dismissLexi, toggleLexi, clearNew }}>
      {children}
    </LexiCtx.Provider>
  )
}

export function useLexi() {
  const ctx = useContext(LexiCtx)
  if (!ctx) return {
    visible: false, expanded: false, message: null, hasNew: false,
    greeting: { text: "Welcome! 🦊", mood: 'friendly' },
    dailyTip: '',
    showLexi: () => {}, hideLexi: () => {}, dismissLexi: () => {},
    toggleLexi: () => {}, clearNew: () => {},
  }
  return ctx
}
