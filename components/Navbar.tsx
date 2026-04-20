'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Spécialistes', href: '#specialists' },
  { label: 'Consultation en ligne', href: '#consultation' },
  { label: 'Communication', href: '#communication' },
  { label: 'Contact', href: '#contact' },
]

interface NavbarProps {
  onRdvClick: () => void
}

export default function Navbar({ onRdvClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href: string) => {
    const id = href.replace('#', '')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-[66px] flex items-center px-8 gap-5
      bg-[#1a2a4a] transition-shadow duration-300 ${scrolled ? 'shadow-xl' : ''}`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center flex-shrink-0">
        <img
          src="/logo.png"
          alt="Clinique de la Rebecca"
          className="h-11 w-auto object-contain brightness-0 invert opacity-95"
          onError={(e) => {
            // Fallback SVG logo if image not found
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            target.nextElementSibling?.classList.remove('hidden')
          }}
        />
        {/* SVG Fallback */}
        <div className="hidden items-center gap-2">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="rgba(255,255,255,0.15)" />
            <rect x="19" y="8" width="10" height="32" rx="4" fill="#fff" />
            <rect x="8" y="19" width="32" height="10" rx="4" fill="rgba(255,255,255,0.7)" />
          </svg>
          <div>
            <div className="text-white font-extrabold text-[13px] leading-tight">Clinique de la</div>
            <div className="text-white font-extrabold text-[15px] leading-tight">REBECCA</div>
          </div>
        </div>
      </Link>

      <div className="w-px h-8 bg-white/10 mx-1" />

      {/* Links */}
      <div className="flex items-center gap-0.5 ml-auto">
        {NAV_LINKS.map((link) => (
          <button
            key={link.href}
            onClick={() => scrollTo(link.href)}
            className="px-3 py-2 rounded-lg text-[13px] font-semibold text-white/70
            hover:bg-white/10 hover:text-white transition-all border-none bg-transparent cursor-pointer"
          >
            {link.label}
          </button>
        ))}

        <button
          onClick={onRdvClick}
          className="ml-2 flex items-center gap-2 px-4 py-2 bg-[#5aaa28] text-white
          rounded-full text-[13px] font-bold transition-all hover:bg-[#4a9420]
          hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-900/40"
        >
          <i className="fa-regular fa-calendar-check text-xs" />
          Prendre RDV
        </button>

        <Link
          href="/admin/login"
          className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-white/10
          border border-white/20 text-white/75 rounded-lg text-[12.5px] font-bold
          hover:bg-white/18 hover:text-white transition-all"
        >
          <i className="fa-solid fa-lock text-xs" />
          Admin
        </Link>
      </div>
    </nav>
  )
}
