'use client'
import React from 'react'
// components/layout/Navbar.tsx — Navigation responsive avec menu mobile
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LangContext'
import { LOGO_SRC } from '@/lib/images'

const SERVICES = [
  { label: 'Clinique Externe',   icon: 'fa-stethoscope',    href: '/services/clinique-externe' },
  { label: 'Laboratoire',        icon: 'fa-flask-vial',     href: '/services/laboratoire'      },
  { label: 'Pharmacie',          icon: 'fa-pills',          href: '/services/pharmacie'        },
  { label: 'Dentisterie',        icon: 'fa-tooth',          href: '/services/dentisterie'      },
  { label: 'Physiothérapie',     icon: 'fa-person-walking', href: '/services/physiotherapie'   },
  { label: 'Optométrie',         icon: 'fa-glasses',        href: '/services/optometrie'       },
  { label: 'Maternité',          icon: 'fa-baby',           href: '/services/maternite'        },
  { label: 'Salle SOP',          icon: 'fa-scalpel',        href: '/services/salle-sop'        },
  { label: 'Gestes Médicaux',    icon: 'fa-syringe',        href: '/services/gestes-medicaux'  },
  { label: 'Hospitalisation',    icon: 'fa-bed-pulse',      href: '/services/hospitalisation'  },
]

const SPECIALITES = [
  { label: 'Chirurgie générale', icon: 'fa-scalpel', slug: 'chirurgie' },
  { label: 'Neurochirurgie', icon: 'fa-brain', slug: 'neurochirurgie' },
  { label: 'Neurologie', icon: 'fa-brain', slug: 'neurologie' },
  { label: 'Orthopédie', icon: 'fa-bone', slug: 'orthopedie' },
  { label: 'Pédiatrie', icon: 'fa-child', slug: 'pediatrie' },
  { label: 'Dermatologie', icon: 'fa-hand-dots', slug: 'dermatologie' },
  { label: 'Urologie', icon: 'fa-kidneys', slug: 'urologie' },
  { label: 'ORL', icon: 'fa-ear-listen', slug: 'orl' },
  { label: 'Gynécologie', icon: 'fa-venus', slug: 'gynecologie' },
  { label: 'Chirurgie pédiatrique', icon: 'fa-child-reaching', slug: 'chir-ped' },
  { label: 'Médecine interne', icon: 'fa-heart-pulse', slug: 'medecine-interne' },
  { label: 'Ophtalmologie', icon: 'fa-eye', slug: 'ophtalmologie' },
]

interface NavbarProps {
  onRdvClick?: () => void
  variant?: 'public' | 'admin' | 'medecin' | 'patient'
}


// ── Sélecteur de langue ─────────────────────────────────────────────────
const LANGS = [
  { code: 'fr', label: 'FR', full: 'Français',         flag: '🇫🇷' },
  { code: 'ht', label: 'HT', full: 'Kreyòl Ayisyen',   flag: '🇭🇹' },
  { code: 'en', label: 'EN', full: 'English',           flag: '🇬🇧' },
  { code: 'es', label: 'ES', full: 'Español',           flag: '🇪🇸' },
  { code: 'zh', label: '中文', full: '中文 (Chinese)',   flag: '🇨🇳' },
]

function LangSelector() {
  const { lang, setLang, t } = useLang()
  const [open, setOpen] = useState(false)
  const current = LANGS.find(l => l.code === lang) || LANGS[0]

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: '1px solid #e2e8f0',
          borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: '#374151'
        }}
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <i className="fa-solid fa-chevron-down" style={{ fontSize: 9, color: '#94a3b8' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: 'white', borderRadius: 12, border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 200, minWidth: 160, overflow: 'hidden'
        }}>
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as any); setOpen(false) }}
              style={{
                width: '100%', padding: '10px 16px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
                background: lang === l.code ? '#eff6ff' : 'white',
                color: lang === l.code ? '#1641C8' : '#374151',
                fontWeight: lang === l.code ? 700 : 400,
                borderBottom: '1px solid #f1f5f9', textAlign: 'left' as const,
              }}
            >
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{l.label}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{l.full}</div>
              </div>
              {lang === l.code && <span style={{ marginLeft: 'auto', color: '#1641C8' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar({ onRdvClick, variant = 'public' }: NavbarProps) {
  const [scrolled,   setScrolled]   = useState(false)
  const [hidden,     setHidden]     = useState(false)
  const lastScrollY = React.useRef(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { lang, t } = useLang()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      // Hide on scroll down (past 120px), show on scroll up
      if (y > 120) {
        setHidden(y > lastScrollY.current + 8)
      } else {
        setHidden(false)
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Ferme le menu mobile si on clique en dehors
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.mobile-nav-content')) setMobileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  const getDashboardHref = () => {
    if (!user) return '/login'
    const routes: Record<string, string> = {
      admin: '/admin/dashboard',
      medecin: '/medecin/dashboard',
      patient: '/patient/dashboard',
      caissier: '/caissier',
      labo: '/labo',
      pharmacie: '/pharmacie',
    }
    return routes[user.role] || '/login'
  }

  const navLogo = (
    <Link href="/" className="flex items-center flex-shrink-0" onClick={() => setMobileOpen(false)}>
      <img
        src={LOGO_SRC}
        alt="Clinique de la Rebecca"
        className="h-[52px] w-auto object-contain"
        onError={(e) => {
          const t = e.target as HTMLImageElement
          t.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='48' viewBox='0 0 180 48'%3E%3Crect width='36' height='36' x='0' y='6' rx='8' fill='%231641C8'/%3E%3Crect x='14' y='10' width='8' height='28' rx='3' fill='white'/%3E%3Crect x='6' y='18' width='24' height='8' rx='3' fill='rgba(255,255,255,0.7)'/%3E%3Ctext x='44' y='22' font-family='Inter' font-size='11' font-weight='700' fill='%23475569'%3ECLINIQUE DE LA%3C/text%3E%3Ctext x='44' y='38' font-family='Inter' font-size='16' font-weight='900' fill='%231641C8'%3EREBECCA%3C/text%3E%3C/svg%3E`
        }}
      />
    </Link>
  )

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 h-[70px] flex items-center
        px-[5%] bg-white/97 border-b border-slate-200 transition-all duration-300
        ${scrolled ? 'shadow-xl' : 'shadow-sm'}`}
        style={{ transform: hidden ? 'translateY(-100%)' : 'translateY(0)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>

        {navLogo}

        {/* Desktop nav */}
        {variant === 'public' && (
          <div className="hidden md:flex items-center gap-0.5 mx-auto">
            <Link href="/" className={`nav-item px-3.5 py-2 rounded-lg text-sm font-medium
              transition-all ${pathname === '/' ? 'text-[#1641C8] bg-blue-50 font-bold' : 'text-slate-600 hover:text-[#1641C8] hover:bg-blue-50'}`}>
              {t('nav.accueil')}
            </Link>

            <div className="nav-item relative nav-dropdown-trigger">
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm
                font-medium text-slate-600 hover:text-[#1641C8] hover:bg-blue-50
                transition-all border-none bg-transparent cursor-pointer font-sans">
                {t('nav.services')} <i className="fa-solid fa-chevron-down text-[10px]" />
              </button>
              <div className="nav-dropdown">
                <div className="dropdown-title">{lang === 'en' ? 'Our 10 services' : lang === 'ht' ? 'Sèvis nou yo' : lang === 'es' ? 'Nuestros servicios' : lang === 'zh' ? '我们的服务' : 'Nos 10 services'}</div>
                <Link href="/services" style={{fontWeight:700,color:'#1641C8'}}>
                  {lang === 'en' ? '→ All services' : lang === 'ht' ? '→ Tout sèvis' : lang === 'es' ? '→ Todos los servicios' : lang === 'zh' ? '→ 所有服务' : '→ Voir tous les services'}
                </Link>
                {SERVICES.map((s) => (
                  <Link key={s.href} href={s.href}>
                    <i className={`fa-solid ${s.icon}`} />{s.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="nav-item relative nav-dropdown-trigger">
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm
                font-medium text-slate-600 hover:text-[#1641C8] hover:bg-blue-50
                transition-all border-none bg-transparent cursor-pointer font-sans">
                {t('nav.specialites')} <i className="fa-solid fa-chevron-down text-[10px]" />
              </button>
              <div className="nav-dropdown">
                <div className="dropdown-title">{lang === 'en' ? 'Our specialists' : lang === 'ht' ? 'Espesyalis nou yo' : lang === 'es' ? 'Nuestros especialistas' : lang === 'zh' ? '我们的专科' : '15 spécialités'}</div>
                <Link href="/specialites" style={{fontWeight:700,color:'#1641C8'}}>
                  {lang === 'en' ? '→ All specialists' : lang === 'ht' ? '→ Tout espesyalis' : lang === 'es' ? '→ Todos los especialistas' : lang === 'zh' ? '→ 所有专科' : '→ Voir tous les spécialistes'}
                </Link>
                {SPECIALITES.map((s) => (
                  <Link key={s.slug} href={`/specialites?specialite=${encodeURIComponent(s.label)}`}>
                    <i className={`fa-solid ${s.icon}`} />{s.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/consultation" className={`px-3.5 py-2 rounded-lg text-sm font-medium
              transition-all ${pathname === '/consultation' ? 'text-[#1641C8] bg-blue-50 font-bold' : 'text-slate-600 hover:text-[#1641C8] hover:bg-blue-50'}`}>
              {t('nav.consultation')}
            </Link>
          </div>
        )}

        {/* Right side desktop */}
        <div className="hidden md:flex items-center gap-2.5 ml-auto">
          {/* Sélecteur de langue */}
        <LangSelector />

        {mounted && isAuthenticated ? (
            <>
              <Link href={getDashboardHref()}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50
                  text-[#1641C8] font-semibold text-sm hover:bg-blue-100 transition-all">
                <i className="fa-solid fa-circle-user" />
                {user?.nom?.split(' ')[0]}
              </Link>
              <button
                onClick={() => { logout(); router.push('/') }}
                className="px-3 py-2 rounded-full border border-slate-200 text-slate-500
                  font-semibold text-sm hover:border-red-200 hover:text-red-500 transition-all bg-transparent cursor-pointer">
                <i className="fa-solid fa-sign-out-alt" />
              </button>
            </>
          ) : (
            <>
              {pathname !== '/login' && (
              <Link href="/login" className="px-4 py-2 rounded-full border-[1.5px]
                border-[#0d9488] text-[#0d9488] font-semibold text-[13.5px]
                hover:bg-[#0d9488] hover:text-white transition-all">
                <i className="fa-regular fa-user mr-1.5" />{t('nav.connexion')}
              </Link>
              )}
              <button
                onClick={onRdvClick}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1641C8] to-[#0d9488]
                  text-white font-bold text-[13.5px] border-none cursor-pointer
                  hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg
                  hover:shadow-teal-200 transition-all">
                <i className="fa-regular fa-calendar-check" />{t('nav.prendreRdv')}
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto w-10 h-10 flex items-center justify-center rounded-lg
            border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-[#1641C8]
            transition-all bg-transparent cursor-pointer"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Menu"
        >
          <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'} text-lg`} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="mobile-nav-content absolute top-[70px] left-0 right-0 bg-white shadow-2xl
              max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700
                font-semibold text-[15px] hover:bg-blue-50 hover:text-[#1641C8] transition-all"
                onClick={() => setMobileOpen(false)}>
                <i className="fa-solid fa-house w-5 text-center text-[#1641C8]" /> {t('nav.accueil')}
              </Link>

              {/* Services */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                  text-slate-700 font-semibold text-[15px] hover:bg-blue-50 hover:text-[#1641C8]
                  transition-all bg-transparent border-none cursor-pointer"
                onClick={() => setMobileSection(mobileSection === 'services' ? null : 'services')}
              >
                <span className="flex items-center gap-3">
                  <i className="fa-solid fa-grid-2 w-5 text-center text-[#1641C8]" /> {t('nav.services')}
                </span>
                <i className={`fa-solid fa-chevron-${mobileSection === 'services' ? 'up' : 'down'} text-xs text-slate-400`} />
              </button>
              {mobileSection === 'services' && (
                <div className="ml-8 space-y-1 pb-1">
                  {SERVICES.map(s => (
                    <Link key={s.href} href={s.href}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600
                        font-medium text-[14px] hover:bg-blue-50 hover:text-[#1641C8] transition-all"
                      onClick={() => setMobileOpen(false)}>
                      <i className={`fa-solid ${s.icon} w-4 text-center text-[#1641C8] text-xs`} />
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Spécialités */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                  text-slate-700 font-semibold text-[15px] hover:bg-blue-50 hover:text-[#1641C8]
                  transition-all bg-transparent border-none cursor-pointer"
                onClick={() => setMobileSection(mobileSection === 'specs' ? null : 'specs')}
              >
                <span className="flex items-center gap-3">
                  <i className="fa-solid fa-user-doctor w-5 text-center text-[#1641C8]" /> {t('nav.specialites')}
                </span>
                <i className={`fa-solid fa-chevron-${mobileSection === 'specs' ? 'up' : 'down'} text-xs text-slate-400`} />
              </button>
              {mobileSection === 'specs' && (
                <div className="ml-8 space-y-1 pb-1">
                  {SPECIALITES.map(s => (
                    <Link key={s.slug} href="/specialites"
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600
                        font-medium text-[14px] hover:bg-blue-50 hover:text-[#1641C8] transition-all"
                      onClick={() => setMobileOpen(false)}>
                      <i className={`fa-solid ${s.icon} w-4 text-center text-[#1641C8] text-xs`} />
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/consultation"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700
                  font-semibold text-[15px] hover:bg-blue-50 hover:text-[#1641C8] transition-all"
                onClick={() => setMobileOpen(false)}>
                <i className="fa-solid fa-video w-5 text-center text-[#1641C8]" /> {t('nav.consultation')}
              </Link>

              {/* Auth buttons mobile */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {/* Sélecteur de langue */}
        <LangSelector />

        {mounted && isAuthenticated ? (
                  <>
                    <Link href={getDashboardHref()}
                      className="flex items-center gap-2 justify-center px-4 py-3 rounded-xl
                        bg-blue-50 text-[#1641C8] font-bold text-[14px]"
                      onClick={() => setMobileOpen(false)}>
                      <i className="fa-solid fa-circle-user" /> Mon espace
                    </Link>
                    <button
                      onClick={() => { logout(); router.push('/'); setMobileOpen(false) }}
                      className="w-full px-4 py-3 rounded-xl border border-red-200 text-red-500
                        font-semibold text-[14px] hover:bg-red-50 transition-all bg-transparent cursor-pointer">
                      Se déconnecter
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login"
                      className="flex items-center gap-2 justify-center px-4 py-3 rounded-xl
                        border-[1.5px] border-slate-200 text-slate-700 font-semibold text-[14px]
                        hover:border-[#1641C8] hover:text-[#1641C8] transition-all"
                      onClick={() => setMobileOpen(false)}>
                      <i className="fa-regular fa-user" /> {t('nav.connexion')}
                    </Link>
                    <button
                      onClick={() => { onRdvClick?.(); setMobileOpen(false) }}
                      className="w-full btn-primary justify-center py-3">
                      <i className="fa-regular fa-calendar-check" /> {t('nav.prendreRdv')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
