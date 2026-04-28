'use client'
import Link from 'next/link'
import { LOGO_SRC } from '@/lib/images'

const SERVICES_LIENS = [
  { label: 'Clinique externe',  href: '/specialites' },
  { label: 'Dentisterie',       href: '/services/dentisterie' },
  { label: 'Physiothérapie',    href: '/services/physiotherapie' },
  { label: 'Laboratoire',       href: '/services/laboratoire' },
  { label: 'Pharmacie',         href: '/services/pharmacie' },
  { label: 'Maternité',         href: '/services/maternite' },
  { label: 'Salle SOP',         href: '/services/sop' },
  { label: 'Gestes médicaux',   href: '/services/gestes' },
  { label: 'Optométrie',        href: '/services/optometrie' },
]

const SPECIALITES_LIENS = [
  { label: 'Chirurgie générale', href: '/specialites/chirurgie' },
  { label: 'Neurologie',         href: '/specialites/neurologie' },
  { label: 'Pédiatrie',          href: '/specialites/pediatrie' },
  { label: 'Gynécologie',        href: '/specialites/gynecologie' },
  { label: 'Orthopédie',         href: '/specialites/orthopedie' },
  { label: 'Dermatologie',       href: '/specialites/dermatologie' },
  { label: 'ORL',                href: '/specialites/orl' },
  { label: 'Ophtalmologie',      href: '/specialites/ophtalmologie' },
]

const LIENS_UTILES = [
  { label: 'Prendre rendez-vous',    href: '/consultation' },
  { label: 'Consultation en ligne',  href: '/consultation' },
  { label: 'Espace patient',         href: '/patient/dashboard' },
  { label: 'Espace médecin',         href: '/login' },
  { label: 'Administration',         href: '/admin/dashboard' },
  { label: 'Nos spécialistes',       href: '/specialites' },
]

const SOCIAL = [
  { icon: 'fa-brands fa-facebook-f',  href: '#',                                   label: 'Facebook' },
  { icon: 'fa-brands fa-whatsapp',    href: 'https://wa.me/50938880000',            label: 'WhatsApp' },
  { icon: 'fa-brands fa-instagram',   href: '#',                                   label: 'Instagram' },
  { icon: 'fa-brands fa-x-twitter',   href: '#',                                   label: 'X (Twitter)' },
  { icon: 'fa-brands fa-linkedin-in', href: '#',                                   label: 'LinkedIn' },
  { icon: 'fa-regular fa-envelope',   href: 'mailto:contact@cliniquerebecca.ht',   label: 'Email' },
]

export default function Footer() {
  return (
    <footer style={{ background: '#070f1e', color: 'rgba(255,255,255,0.55)', paddingTop: 64, paddingBottom: 28, paddingLeft: '5%', paddingRight: '5%' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, marginBottom: 48, maxWidth: 1200, margin: '0 auto 48px' }}>

        {/* ── Marque ── */}
        <div>
          <div style={{ marginBottom: 12 }}>
            <img
              src={LOGO_SRC}
              alt="Clinique de la Rebecca"
              style={{ height: 52, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
          <h3 style={{ color: 'white', fontWeight: 800, fontSize: 16, marginBottom: 8 }}>
            Clinique de la Rebecca
          </h3>
          <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 20, maxWidth: 260 }}>
            Des soins médicaux de qualité en Haïti. Consultations en ligne et suivi personnalisé disponible.
          </p>
          {/* Coordonnées */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {[
              { icon: 'fa-location-dot', text: 'Delmas, Haïti' },
              { icon: 'fa-phone',        text: '+509 3888-0000' },
              { icon: 'fa-clock',        text: 'Lundi – Samedi, 7h00 – 17h00' },
            ].map(c => (
              <div key={c.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className={`fa-solid ${c.icon}`} style={{ color: '#1641C8', fontSize: 12, width: 14, textAlign: 'center' }} />
                <span style={{ fontSize: 12 }}>{c.text}</span>
              </div>
            ))}
          </div>
          {/* Réseaux sociaux */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SOCIAL.map(s => (
              <a
                key={s.label} href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer" title={s.label}
                style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: 'rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.55)', fontSize: 14,
                  textDecoration: 'none', transition: 'all 0.18s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1641C8'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
              >
                <i className={s.icon} />
              </a>
            ))}
          </div>
        </div>

        {/* ── Services ── */}
        <div>
          <h4 style={{ color: 'white', fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            Services
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SERVICES_LIENS.map(s => (
              <Link key={s.href + s.label} href={s.href} style={{
                fontSize: 13, color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none', transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4ade80' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Spécialités ── */}
        <div>
          <h4 style={{ color: 'white', fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            Spécialités
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SPECIALITES_LIENS.map(s => (
              <Link key={s.href + s.label} href={s.href} style={{
                fontSize: 13, color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none', transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4ade80' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Liens utiles ── */}
        <div>
          <h4 style={{ color: 'white', fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            Liens utiles
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LIENS_UTILES.map(l => (
              <Link key={l.href + l.label} href={l.href} style={{
                fontSize: 13, color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none', transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4ade80' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Email contact */}
          <div style={{ marginTop: 20 }}>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
              Contact
            </h4>
            <a href="mailto:contact@cliniquerebecca.ht" style={{
              fontSize: 12, color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4ade80' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}>
              contact@cliniquerebecca.ht
            </a>
          </div>
        </div>
      </div>

      {/* ── Barre de bas de page ── */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingTop: 20,
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: 'rgba(255,255,255,0.25)',
        flexWrap: 'wrap', gap: 8,
      }}>
        <span>© 2026 Clinique de la Rebecca. Tous droits réservés.</span>
        <span>Fait avec <span style={{ color: '#4ade80' }}>♥</span> pour vos soins · Haïti</span>
      </div>
    </footer>
  )
}
