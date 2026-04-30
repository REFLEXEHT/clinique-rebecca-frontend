'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Lang, t as translate } from '@/lib/i18n'

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'fr', setLang: () => {}, t: (k) => k
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('clinique_lang') as Lang
    if (saved && ['fr','ht','en','es','zh'].includes(saved)) setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('clinique_lang', l)
    // Update HTML lang attribute
    document.documentElement.lang = l
  }

  const t = (key: string) => translate(lang, key)

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
