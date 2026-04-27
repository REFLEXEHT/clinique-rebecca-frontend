'use client'
/**
 * TranslationContext — Fournit la langue courante à toute l'application
 * et déclenche la traduction IA sur chaque changement de page.
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { translatePage, getCurrentLang, type Lang } from '@/lib/translator'
import { usePathname } from 'next/navigation'

interface TranslationContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  translating: boolean
}

const TranslationContext = createContext<TranslationContextType>({
  lang: 'fr',
  setLang: () => {},
  translating: false,
})

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState]   = useState<Lang>('fr')
  const [translating, setTranslating] = useState(false)
  const pathname = usePathname()

  // Initialiser avec la langue sauvegardée
  useEffect(() => {
    const saved = getCurrentLang()
    setLangState(saved)
  }, [])

  // Retarder légèrement après chaque changement de page pour laisser
  // React finir le rendu avant de scanner le DOM
  useEffect(() => {
    if (lang === 'fr') return
    const timer = setTimeout(() => {
      setTranslating(true)
      translatePage(lang).finally(() => setTranslating(false))
    }, 350)
    return () => clearTimeout(timer)
  }, [lang, pathname])

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    if (newLang === 'fr') {
      translatePage('fr')
      return
    }
    setTranslating(true)
    translatePage(newLang).finally(() => setTranslating(false))
  }, [])

  return (
    <TranslationContext.Provider value={{ lang, setLang, translating }}>
      {children}
      {/* Indicateur de chargement discret pendant la traduction */}
      {translating && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15,23,42,0.88)', color: 'white',
          padding: '8px 18px', borderRadius: 50, fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8, zIndex: 9999,
          backdropFilter: 'blur(8px)', pointerEvents: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            animation: 'spin 0.7s linear infinite',
          }} />
          Traduction en cours…
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </TranslationContext.Provider>
  )
}

export const useTranslation = () => useContext(TranslationContext)
