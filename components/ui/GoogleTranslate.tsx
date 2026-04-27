'use client'
import { useEffect, useState } from 'react'

// Langues disponibles avec leur code Google Translate
const LANGS = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'en', label: 'English',   flag: '🇺🇸' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
  { code: 'ht', label: 'Kreyòl',    flag: '🇭🇹' },
  { code: 'zh-CN', label: '中文',   flag: '🇨🇳' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ar', label: 'العربية',   flag: '🇸🇦' },
]

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate: {
        TranslateElement: new (options: object, elementId: string) => void
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __googTranslateReady?: boolean
  }
}

export default function GoogleTranslate() {
  const [open, setOpen]         = useState(false)
  const [current, setCurrent]   = useState('fr')
  const [ready, setReady]       = useState(false)

  // Injecter le script Google Translate une seule fois
  useEffect(() => {
    if (document.getElementById('gt-script')) { setReady(true); return }

    window.googleTranslateElementInit = () => {
      new window.google!.translate.TranslateElement(
        {
          pageLanguage: 'fr',
          includedLanguages: 'fr,en,es,ht,zh-CN,pt,ar',
          layout: 0, // SIMPLE layout — caché visuellement
          autoDisplay: false,
        },
        'google_translate_element'
      )
      setReady(true)
    }

    const script = document.createElement('script')
    script.id  = 'gt-script'
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Appliquer la langue choisie via le cookie Google Translate
  const applyLang = (langCode: string) => {
    setCurrent(langCode)
    setOpen(false)

    if (langCode === 'fr') {
      // Revenir au français = supprimer le cookie de traduction
      const iframe = document.querySelector<HTMLIFrameElement>('.goog-te-banner-frame')
      if (iframe) {
        const restore = iframe.contentDocument?.querySelector<HTMLElement>('.restore')
        restore?.click()
      }
      // Méthode alternative via cookie
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;'
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=.' + window.location.hostname
      window.location.reload()
      return
    }

    // Définir le cookie googtrans
    const cookieValue = `/fr/${langCode}`
    document.cookie = `googtrans=${cookieValue}; path=/`
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname}`

    // Trouver et cliquer sur l'option de langue dans le widget caché
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo')
    if (select) {
      select.value = langCode
      select.dispatchEvent(new Event('change'))
    } else {
      // Fallback : recharger la page avec le cookie défini
      window.location.reload()
    }
  }

  const currentLang = LANGS.find(l => l.code === current) || LANGS[0]

  return (
    <>
      {/* Widget Google Translate caché — nécessaire pour le moteur */}
      <div id="google_translate_element" style={{ display: 'none', position: 'absolute', visibility: 'hidden' }} />

      {/* Notre bouton personnalisé */}
      <div style={{ position: 'relative', zIndex: 300 }}>
        <button
          onClick={() => setOpen(v => !v)}
          title="Changer de langue / Change language"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 50,
            border: '1.5px solid #e2e8f0', background: 'white',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: '#374151', transition: 'all 0.18s',
            boxShadow: open ? '0 4px 16px rgba(0,0,0,0.1)' : 'none',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1641C8'; e.currentTarget.style.color = '#1641C8' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}
        >
          <span style={{ fontSize: 17 }}>{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.label}</span>
          <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: 9, opacity: 0.5 }} />
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: 'white', borderRadius: 16,
            border: '1px solid #e2e8f0',
            boxShadow: '0 16px 48px rgba(15,23,42,0.14)',
            padding: 8, minWidth: 170,
            animation: 'toastUp 0.16s ease both',
            zIndex: 9999,
          }}>
            <div style={{ padding: '4px 12px 8px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
              Langue / Language
            </div>
            {LANGS.map(lang => (
              <button
                key={lang.code}
                onClick={() => applyLang(lang.code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 14px', borderRadius: 10,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: lang.code === current ? '#eff6ff' : 'transparent',
                  color: lang.code === current ? '#1641C8' : '#374151',
                  fontWeight: lang.code === current ? 700 : 500,
                  fontSize: 14, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (lang.code !== current) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (lang.code !== current) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 18 }}>{lang.flag}</span>
                <span>{lang.label}</span>
                {lang.code === current && (
                  <i className="fa-solid fa-check" style={{ marginLeft: 'auto', fontSize: 11, color: '#1641C8' }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CSS pour masquer la barre Google Translate du haut */}
      <style>{`
        body { top: 0 !important; }
        .goog-te-banner-frame { display: none !important; }
        .goog-te-balloon-frame { display: none !important; }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { display: none !important; }
        #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
        .VIpgJd-ZVi9od-ORHb { display: none !important; }
        .VIpgJd-yAWNEb-VIpgJd-fmcmS { background: none !important; box-shadow: none !important; }
        /* Empêche le saut de page causé par la barre GT */
        iframe.goog-te-banner-frame { display: none !important; }
        .skiptranslate { display: none !important; }
      `}</style>
    </>
  )
}
