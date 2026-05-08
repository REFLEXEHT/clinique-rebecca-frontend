'use client'
// components/layout/Footer.tsx
import Link from 'next/link'
import { LOGO_SRC } from '@/lib/images'

const SERVICES = ['Clinique externe', 'Dentisterie', 'Physiothérapie', 'Laboratoire', 'Pharmacie', 'Maternité', 'Salle SOP', 'Gestes médicaux']
const SPECIALITES = ['Chirurgie', 'Neurologie', 'Pédiatrie', 'Gynécologie', 'Orthopédie', 'Dermatologie', 'ORL', 'Ophtalmologie']
const LIENS = [
  { label: 'Prendre RDV', href: '/#rdv' },
  { label: 'Consultation en ligne', href: '/consultation' },
  { label: 'Espace patient', href: '/patient/dashboard' },
  { label: 'Connexion médecin', href: '/login' },
  { label: 'Administration', href: '/admin/dashboard' },
  { label: 'Contact', href: 'mailto:contact@cliniquerebecca.ht' },
]
const SOCIAL = [
  { icon: 'fa-brands fa-facebook-f', href: '#', label: 'Facebook' },
  { icon: 'fa-brands fa-whatsapp', href: 'https://wa.me/50948585757', label: 'WhatsApp' },
  { icon: 'fa-brands fa-instagram', href: '#', label: 'Instagram' },
  { icon: 'fa-brands fa-x-twitter', href: '#', label: 'X (Twitter)' },
  { icon: 'fa-brands fa-linkedin-in', href: '#', label: 'LinkedIn' },
  { icon: 'fa-regular fa-envelope', href: 'mailto:contact@cliniquerebecca.ht', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="bg-[#070f1e] text-white/60 pt-16 pb-7 px-[5%]">
      <div className="grid grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div>
          <div className="mb-3">
            <img
              src={LOGO_SRC}
              alt="Clinique de la Rebecca"
              className="h-14 w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.88 }}
              onError={(e) => {
                const t = e.target as HTMLImageElement
                t.style.display = 'none'
                if (t.nextElementSibling) (t.nextElementSibling as HTMLElement).style.display = 'block'
              }}
            />
            <div className="hidden">
              <div className="text-white font-extrabold text-xl">Clinique de la</div>
              <div className="text-white font-black text-2xl">REBECCA</div>
            </div>
          </div>
          <h3 className="text-white font-extrabold text-[17px] mb-2">
            Clinique de la Rebecca
          </h3>
          <p className="text-[13px] leading-relaxed mb-5">
            Des soins médicaux de qualité en Haïti. Consultations en ligne et suivi personnalisé par WhatsApp.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer" title={s.label}
                className="w-9 h-9 rounded-[10px] bg-white/8 flex items-center justify-center
                  text-white/60 text-[15px] hover:bg-[#1641C8] hover:text-white
                  hover:-translate-y-0.5 transition-all">
                <i className={s.icon} />
              </a>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-[12px] font-bold uppercase tracking-widest text-white mb-3.5">
            Services
          </h4>
          {SERVICES.map((s) => (
            <Link key={s} href="/services"
              className="block text-[13px] text-white/50 hover:text-green-400
                mb-2 transition-colors no-underline">
              {s}
            </Link>
          ))}
        </div>

        {/* Spécialités */}
        <div>
          <h4 className="text-[12px] font-bold uppercase tracking-widest text-white mb-3.5">
            Spécialités
          </h4>
          {SPECIALITES.map((s) => (
            <Link key={s} href="/specialites"
              className="block text-[13px] text-white/50 hover:text-green-400
                mb-2 transition-colors no-underline">
              {s}
            </Link>
          ))}
        </div>

        {/* Liens utiles */}
        <div>
          <h4 className="text-[12px] font-bold uppercase tracking-widest text-white mb-3.5">
            Liens utiles
          </h4>
          {LIENS.map((l) => (
            <Link key={l.label} href={l.href}
              className="block text-[13px] text-white/50 hover:text-green-400
                mb-2 transition-colors no-underline">
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/7 pt-5 flex justify-between text-[12px]
        text-white/30 flex-wrap gap-2">
        <span>© 2026 Clinique de la Rebecca. Tous droits réservés.</span>
        <span>Fait avec <span className="text-green-400">♥</span> pour vos soins · Haïti</span>
      </div>
    </footer>
  )
}
