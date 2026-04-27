'use client'
import { useState, useEffect, useCallback } from 'react'
import { Lang, getLang, t as translate, T } from './i18n'

export function useLang() {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    setLangState(getLang())
    // Listen for storage changes (when setLang is called in another tab)
    const handler = () => setLangState(getLang())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    return translate(key, lang, vars)
  }, [lang])

  return { lang, t }
}
