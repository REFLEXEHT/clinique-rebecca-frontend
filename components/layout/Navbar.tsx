'use client'
// components/layout/Navbar.tsx — Navigation responsive avec menu mobile
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
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

export default function Navbar({ onRdvClick, variant = 'public' }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
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
        px-[5%] bg-white/97 border-b border-slate-200 transition-shadow duration-300
        ${scrolled ? 'shadow-xl' : 'shadow-sm'}`}>

        {navLogo}

        {/* Desktop nav */}
        {variant === 'public' && (
          <div className="hidden md:flex items-center gap-0.5 mx-auto">
            <Link href="/" className={`nav-item px-3.5 py-2 rounded-lg text-sm font-medium
              transition-all ${pathname === '/' ? 'text-[#1641C8] bg-blue-50 font-bold' : 'text-slate-600 hover:text-[#1641C8] hover:bg-blue-50'}`}>
              Accueil
            </Link>

            <div className="nav-item relative nav-dropdown-trigger">
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm
                font-medium text-slate-600 hover:text-[#1641C8] hover:bg-blue-50
                transition-all border-none bg-transparent cursor-pointer font-sans">
                Services <i className="fa-solid fa-chevron-down text-[10px]" />
              </button>
              <div className="nav-dropdown">
                <div className="dropdown-title">Nos 9 services</div>
                {SERVICES.map((s) => (
                  <Link key={s.href} href="/services">
                    <i className={`fa-solid ${s.icon}`} />{s.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="nav-item relative nav-dropdown-trigger">
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm
                font-medium text-slate-600 hover:text-[#1641C8] hover:bg-blue-50
                transition-all border-none bg-transparent cursor-pointer font-sans">
                Spécialités <i className="fa-solid fa-chevron-down text-[10px]" />
              </button>
              <div className="nav-dropdown">
                <div className="dropdown-title">12 spécialités</div>
                {SPECIALITES.map((s) => (
                  <Link key={s.slug} href="/specialites">
                    <i className={`fa-solid ${s.icon}`} />{s.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/consultation" className={`px-3.5 py-2 rounded-lg text-sm font-medium
              transition-all ${pathname === '/consultation' ? 'text-[#1641C8] bg-blue-50 font-bold' : 'text-slate-600 hover:text-[#1641C8] hover:bg-blue-50'}`}>
              Consultation
            </Link>
          </div>
        )}

        {/* Right side desktop */}
        <div className="hidden md:flex items-center gap-2.5 ml-auto">
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
              <Link href="/login" className="px-4 py-2 rounded-full border-[1.5px]
                border-slate-200 text-slate-700 font-semibold text-[13.5px]
                hover:border-[#1641C8] hover:text-[#1641C8] hover:bg-blue-50 transition-all">
                <i className="fa-regular fa-user mr-1.5" />Connexion
              </Link>
              <button
                onClick={onRdvClick}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1641C8]
                  text-white font-bold text-[13.5px] border-none cursor-pointer
                  hover:bg-[#0f2fa3] hover:-translate-y-0.5 hover:shadow-lg
                  hover:shadow-blue-200 transition-all">
                <i className="fa-regular fa-calendar-check" />Prendre RDV
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
                <i className="fa-solid fa-house w-5 text-center text-[#1641C8]" /> Accueil
              </Link>

              {/* Services */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                  text-slate-700 font-semibold text-[15px] hover:bg-blue-50 hover:text-[#1641C8]
                  transition-all bg-transparent border-none cursor-pointer"
                onClick={() => setMobileSection(mobileSection === 'services' ? null : 'services')}
              >
                <span className="flex items-center gap-3">
                  <i className="fa-solid fa-grid-2 w-5 text-center text-[#1641C8]" /> Services
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
                  <i className="fa-solid fa-user-doctor w-5 text-center text-[#1641C8]" /> Spécialités
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
                <i className="fa-solid fa-video w-5 text-center text-[#1641C8]" /> Consultation
              </Link>

              {/* Auth buttons mobile */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
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
                      <i className="fa-regular fa-user" /> Connexion
                    </Link>
                    <button
                      onClick={() => { onRdvClick?.(); setMobileOpen(false) }}
                      className="w-full btn-primary justify-center py-3">
                      <i className="fa-regular fa-calendar-check" /> Prendre RDV
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
