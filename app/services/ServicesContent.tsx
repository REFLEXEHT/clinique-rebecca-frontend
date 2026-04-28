'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { useState } from 'react'

// Laboratoire et Pharmacie → page combinée /services/labo-pharmacie
const SERVICES = [
  { key: 'physio',    titre: 'Physiothérapie',         href: '/services/physiotherapie', photo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80', couleur: '#d97706' },
  { key: 'clinique',  titre: 'Clinique externe',        href: '/specialites',             photo: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&q=80', couleur: '#1641C8' },
  { key: 'sop',       titre: 'Salle SOP',               href: '/services/sop',            photo: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&q=80', couleur: '#374151' },
  { key: 'mat1',      titre: 'Maternité',               href: '/services/maternite',      photo: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=600&q=80', couleur: '#be185d' },
  { key: 'opto1',     titre: 'Optométrie',              href: '/services/optometrie',     photo: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&q=80', couleur: '#059669' },
  { key: 'gestes',    titre: 'Gestes médicaux',         href: '/services/gestes',         photo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80', couleur: '#6366f1' },
  { key: 'mat2',      titre: 'Maternité',               href: '/services/maternite',      photo: 'https://images.unsplash.com/photo-1565489428748-3a3a4e2c5e28?w=600&q=80', couleur: '#be185d' },
  { key: 'opto2',     titre: 'Optométrie',              href: '/services/optometrie',     photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80', couleur: '#059669' },
  { key: 'labo',      titre: 'Para-clinique & Pharmacie', href: '/services/labo-pharmacie', photo: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80', couleur: '#0d9488' },
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
          <p style={{ color: '#64748b', fontSize: 15 }}>Rencontrez nos médecins et spécialistes</p>
        </div>
      </div>

      {/* Grille photo 3 colonnes */}
      <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '32px 5% 64px' }}>
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {SERVICES.map((s) => (
            <Link key={s.key} href={s.href} style={{ textDecoration: 'none', display: 'block' }}>
              <div
                style={{
                  background: 'white',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.22s',
                  cursor: 'pointer',
                }}
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
                {/* Photo */}
                <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: s.couleur + '15' }}>
                  <img
                    src={s.photo}
                    alt={s.titre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 48,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.25), transparent)',
                    pointerEvents: 'none',
                  }} />
                </div>
                {/* Titre */}
                <div style={{ padding: '14px 16px 16px', textAlign: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{s.titre}</span>
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
