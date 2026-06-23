import React, { createContext, useContext, useState } from 'react'
import { translations } from '../data/content.js'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')
  const t = (key) => translations[lang][key] || key
  const isRTL = lang === 'ar'
  return (
    <LangContext.Provider value={{ lang, setLang, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
