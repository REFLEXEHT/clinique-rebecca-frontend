'use client'
// GoogleTranslate.tsx
// BUG CORRIGÉ : l'injection dynamique du script Google Translate dans
// document.head causait "HierarchyRequestError: appendChild - Only one
// element on document allowed" car React tentait aussi d'écrire dans le head.
// 
// SOLUTION : le script est maintenant déclaré dans app/layout.tsx (Server Component).
// Ce composant ne fait plus que contrôler la langue via cookies + le widget caché.
import { useEffect, useState } from 'react'

const LANGS = [
  { code: 'fr',    label: 'Français',   flag: '🇫🇷' },
  { code: 'en',    label: 'English',    flag: '🇺🇸' },
  { code: 'es',    label: 'Español',    flag: '🇪🇸' },
  { code: 'ht',    label: 'Kreyòl',     flag: '🇭🇹' },
  { code: 'zh-CN', label: '中文',        flag: '🇨🇳' },
  { code: 'pt',    label: 'Português',  flag: '🇧🇷' },
  { code: 'ar',    label: 'العربية',    flag: '🇸🇦' },
]

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: { translate: { TranslateElement: new (o: object, id: string) => void } }
  }
}

export default function GoogleTranslate() {
  const [open, setOpen]       = useState(false)
  const [current, setCurrent] = useState('fr')
  const [ready, setReady]     = useState(false)

  useEffect(() => {
    // Le script est chargé via app/layout.tsx - on attend juste qu'il soit prêt
    if (document.getElementById('google_translate_element')) {
      window.googleTranslateElementInit = () => {
        try {
          new window.google!.translate.TranslateElement(
            { pageLanguage: 'fr', includedLanguages: 'fr,en,es,ht,zh-CN,pt,ar', layout: 0, autoDisplay: false },
            'google_translate_element'
          )
        } catch {}
        setReady(true)
      }
    }
    // Attendre que le script externe se charge
    const check = setInterval(() => {
      if (window.google?.translate) { setReady(true); clearInterval(check) }
    }, 300)
    const timeout = setTimeout(() => { clearInterval(check); setReady(true) }, 5000)
    return () => { clearInterval(check); clearTimeout(timeout) }
  }, [])

  const applyLang = (langCode: string) => {
    setCurrent(langCode)
    setOpen(false)
    if (langCode === 'fr') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;'
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=.' + window.location.hostname
      window.location.reload()
      return
    }
    const cookieValue = `/fr/${langCode}`
    document.cookie = `googtrans=${cookieValue}; path=/`
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname}`
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo')
    if (select) { select.value = langCode; select.dispatchEvent(new Event('change')) }
    else window.location.reload()
  }

  const currentLang = LANGS.find(l => l.code === current) || LANGS[0]

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none', position: 'absolute', visibility: 'hidden' }} />
      <div style={{ position: 'relative', zIndex: 300 }}>
        <button
          onClick={() => setOpen(v => !v)}
          title="Changer de langue"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 50, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', transition: 'all 0.18s', whiteSpace: 'nowrap' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1641C8'; e.currentTarget.style.color = '#1641C8' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}
        >
          <span style={{ fontSize: 17 }}>{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.label}</span>
          <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: 9, opacity: 0.5 }} />
        </button>
        {open && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 16px 48px rgba(15,23,42,0.14)', padding: 8, minWidth: 170, zIndex: 9999 }}>
            <div style={{ padding: '4px 12px 8px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Langue / Language</div>
            {LANGS.map(lang => (
              <button key={lang.code} onClick={() => applyLang(lang.code)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', background: lang.code === current ? '#eff6ff' : 'transparent', color: lang.code === current ? '#1641C8' : '#374151', fontWeight: lang.code === current ? 700 : 500, fontSize: 14 }}>
                <span style={{ fontSize: 18 }}>{lang.flag}</span>
                <span>{lang.label}</span>
                {lang.code === current && <i className="fa-solid fa-check" style={{ marginLeft: 'auto', fontSize: 11, color: '#1641C8' }} />}
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`
        body { top: 0 !important; }
        .goog-te-banner-frame, .goog-te-balloon-frame, .goog-logo-link,
        .goog-te-gadget, #goog-gt-tt, .VIpgJd-ZVi9od-ORHb,
        iframe.goog-te-banner-frame, .skiptranslate { display: none !important; }
      `}</style>
    </>
  )
}
