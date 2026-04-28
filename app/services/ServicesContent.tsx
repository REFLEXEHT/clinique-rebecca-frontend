'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { useState } from 'react'

// ── Services sans duplication, avec photos locales ──────────────────────────
const SERVICES = [
  {
    key: 'clinique-externe',
    titre: 'Clinique externe',
    href: '/services/clinique-externe',
    photo: '/clinque_externe.jpg',
    couleur: '#1641C8',
    icon: 'fa-stethoscope',
    desc: 'Consultations médicales générales et spécialisées en ambulatoire.',
  },
  {
    key: 'gestes-medicaux',
    titre: 'Gestes médicaux',
    href: '/services/gestes',
    photo: '/gestes_medicaux.jpg',
    couleur: '#6366f1',
    icon: 'fa-syringe',
    desc: 'Injections, perfusions, pansements et actes courants sans hospitalisation.',
  },
  {
    key: 'hospitalisation',
    titre: 'Hospitalisation / Observation',
    href: '/services/hospitalisation',
    photo: '/hospitalisation_observation.avif',
    couleur: '#0891b2',
    icon: 'fa-bed-pulse',
    desc: 'Suivi 24h/24 pour patients nécessitant une surveillance médicale prolongée.',
  },
  {
    key: 'labo-pharmacie',
    titre: 'Para-clinique & Pharmacie',
    href: '/services/labo-pharmacie',
    photo: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80',
    couleur: '#0d9488',
    icon: 'fa-flask-vial',
    desc: 'Analyses biologiques complètes, imagerie médicale et médicaments sur place.',
  },
  {
    key: 'dentisterie',
    titre: 'Dentisterie',
    href: '/services/dentisterie',
    photo: '/dentisterie.jpg',
    couleur: '#7c3aed',
    icon: 'fa-tooth',
    desc: 'Soins dentaires complets : détartrage, extractions, prothèses et orthodontie.',
  },
  {
    key: 'optometrie',
    titre: 'Optométrie',
    href: '/services/optometrie',
    photo: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&q=80',
    couleur: '#059669',
    icon: 'fa-glasses',
    desc: 'Bilan visuel complet, prescription de lunettes et dépistage du glaucome.',
  },
  {
    key: 'maternite',
    titre: 'Maternité',
    href: '/services/maternite',
    photo: '/maternite.jpg',
    couleur: '#be185d',
    icon: 'fa-baby',
    desc: 'Suivi prénatal, accouchement assisté et soins néonatals.',
  },
  {
    key: 'physiotherapie',
    titre: 'Physiothérapie',
    href: '/services/physiotherapie',
    photo: '/Physiotherapie.png',
    couleur: '#d97706',
    icon: 'fa-person-walking',
    desc: 'Rééducation fonctionnelle, kinésithérapie et traitement des douleurs.',
  },
  {
    key: 'sop',
    titre: 'Salle SOP (Bloc opératoire)',
    href: '/services/sop',
    photo: '/SOP.jpg',
    couleur: '#374151',
    icon: 'fa-scalpel',
    desc: 'Bloc opératoire équipé pour chirurgies programmées et urgences.',
  },
]

export default function ServicesContent() {
  const [rdvOpen, setRdvOpen] = useState(false)

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* En-tête */}
      <div style={{ paddingTop: 70, background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 5% 28px', textAlign: 'center' }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem,3vw,2.2rem)', color: '#0f172a', marginBottom: 8 }}>
            Nos services
          </h1>
          <div style={{ width: 48, height: 3, background: '#1641C8', borderRadius: 2, margin: '0 auto 14px' }} />
          <p style={{ color: '#64748b', fontSize: 15 }}>
            Des soins complets sous un même toit — cliquez sur un service pour en savoir plus
          </p>
        </div>
      </div>

      {/* Grille photo 3 colonnes */}
      <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '32px 5% 64px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {SERVICES.map((s) => (
            <Link key={s.key} href={s.href} style={{ textDecoration: 'none', display: 'block' }}>
              <div
                style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', transition: 'all 0.22s', cursor: 'pointer' }}
                onMouseEnter={e => {
                  const d = e.currentTarget
                  d.style.transform = 'translateY(-4px)'
                  d.style.boxShadow = `0 12px 32px ${s.couleur}25`
                  d.style.borderColor = s.couleur + '60'
                }}
                onMouseLeave={e => {
                  const d = e.currentTarget
                  d.style.transform = 'none'
                  d.style.boxShadow = 'none'
                  d.style.borderColor = '#e2e8f0'
                }}
              >
                {/* Photo cliquable */}
                <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: s.couleur + '15' }}>
                  <img
                    src={s.photo}
                    alt={s.titre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                  {/* Overlay couleur au survol */}
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${s.couleur}60, transparent)`, opacity: 0, transition: 'opacity 0.22s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
                  />
                  {/* Icône badge */}
                  <div style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 8, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color: s.couleur, fontSize: 13 }} />
                  </div>
                </div>

                {/* Titre + description */}
                <div style={{ padding: '14px 16px 18px', textAlign: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, display: 'block', marginBottom: 6 }}>{s.titre}</span>
                  <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, display: 'block' }}>{s.desc}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10, color: s.couleur, fontSize: 12, fontWeight: 700 }}>
                    En savoir plus <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </>
  )
}
