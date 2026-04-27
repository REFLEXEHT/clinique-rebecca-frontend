'use client'
import { useState, useRef, useEffect } from 'react'
import { LANGS, type Lang } from '@/lib/translator'
import { useTranslation } from '@/context/TranslationContext'

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const { lang, setLang, translating } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGS.find(l => l.code === lang) || LANGS[0]

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 300 }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Changer de langue / Change language"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px', borderRadius: 50,
          border: '1.5px solid #e2e8f0', background: 'white',
          cursor: translating ? 'wait' : 'pointer',
          fontSize: 13, fontWeight: 600, color: '#374151',
          transition: 'all 0.18s', whiteSpace: 'nowrap',
          opacity: translating ? 0.75 : 1,
        }}
        onMouseEnter={e => { if (!translating) { e.currentTarget.style.borderColor = '#1641C8'; e.currentTarget.style.color = '#1641C8' }}}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}
      >
        {translating ? (
          <>
            <span style={{ fontSize: 17 }}>{current.flag}</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>…</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 17 }}>{current.flag}</span>
            <span className="hidden sm:inline">{current.label}</span>
            <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: 9, opacity: 0.5 }} />
          </>
        )}
      </button>

      {open && !translating && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'white', borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 16px 48px rgba(15,23,42,0.14)',
          padding: 8, minWidth: 190, zIndex: 9999,
          animation: 'toastUp 0.16s ease both',
        }}>
          {/* En-tête du menu */}
          <div style={{ padding: '4px 14px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
              Langue / Language
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Traduit par IA · Précision médicale
            </div>
          </div>

          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as Lang); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 14px', borderRadius: 10,
                border: 'none', cursor: 'pointer', textAlign: 'left',
                background: l.code === lang ? '#eff6ff' : 'transparent',
                color: l.code === lang ? '#1641C8' : '#374151',
                fontWeight: l.code === lang ? 700 : 500,
                fontSize: 14, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = '#f8fafc' }}
              onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{l.flag}</span>
              <span style={{ flex: 1 }}>{l.label}</span>
              {l.code === lang && (
                <i className="fa-solid fa-check" style={{ fontSize: 11, color: '#1641C8' }} />
              )}
            </button>
          ))}

          {/* Note bas de menu */}
          <div style={{ padding: '10px 14px 4px', borderTop: '1px solid #f1f5f9', marginTop: 6 }}>
            <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 9 }} />
              Traduction médicale par Claude AI
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
