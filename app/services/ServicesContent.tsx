'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { useState } from 'react'

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

      {/* ── En-tête harmonisé (même style que Spécialités & Connexion) ── */}
      <div className="page-header" style={{ paddingTop: 110, paddingBottom: 52 }}>
        {/* Décors de fond */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(13,148,136,0.15)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '0 5%' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', borderRadius: 50, padding: '5px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, border: '1px solid rgba(255,255,255,0.2)' }}>
            <i className="fa-solid fa-hospital" /> Clinique de la Rebecca
          </span>
          <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginBottom: 12, lineHeight: 1.15 }}>
            Nos Services
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, lineHeight: 1.7, marginBottom: 0 }}>
            Des soins complets sous un même toit — cliquez sur un service pour en savoir plus
          </p>
        </div>
      </div>

      {/* ── Grille services ── */}
      <div style={{ background: '#f8fafc', padding: '40px 5% 72px', minHeight: '60vh' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {SERVICES.map((s) => (
            <Link key={s.key} href={s.href} style={{ textDecoration: 'none', display: 'block' }}>
              <div
                style={{ background: 'white', borderRadius: 18, overflow: 'hidden', border: '1.5px solid #e2e8f0', transition: 'all 0.22s', cursor: 'pointer', height: '100%' }}
                onMouseEnter={e => {
                  const d = e.currentTarget
                  d.style.transform = 'translateY(-5px)'
                  d.style.boxShadow = `0 16px 40px ${s.couleur}28`
                  d.style.borderColor = s.couleur + '55'
                }}
                onMouseLeave={e => {
                  const d = e.currentTarget
                  d.style.transform = 'none'
                  d.style.boxShadow = 'none'
                  d.style.borderColor = '#e2e8f0'
                }}
              >
                {/* Photo */}
                <div style={{ position: 'relative', height: 168, overflow: 'hidden', background: s.couleur + '15' }}>
                  <img
                    src={s.photo}
                    alt={s.titre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
                  />
                  {/* Gradient overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${s.couleur}70, transparent 55%)` }} />
                  {/* Icône badge */}
                  <div style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color: s.couleur, fontSize: 14 }} />
                  </div>
                </div>

                {/* Contenu */}
                <div style={{ padding: '16px 18px 20px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 2, background: s.couleur, flexShrink: 0 }} />
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{s.titre}</span>
                  </div>
                  <span style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, display: 'block', marginBottom: 12 }}>{s.desc}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: s.couleur, fontSize: 12, fontWeight: 700 }}>
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
