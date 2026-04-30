'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const SERVICES = [
  {
    slug: 'clinique-externe',
    titre: 'Clinique Externe',
    description: '12 spécialités médicales avec des médecins qualifiés pour votre santé et celle de votre famille.',
    image: '/services/clinique_externe.jpg',
    couleur: '#1641C8', bg: '#eff6ff', icon: 'fa-stethoscope',
    tags: ['Médecine interne', 'Gynécologie', 'Pédiatrie', 'Neurologie'],
  },
  {
    slug: 'laboratoire',
    titre: 'Laboratoire',
    description: '165 analyses biologiques complètes. Résultats rapides envoyés directement sur votre téléphone.',
    image: '/services/laboratoire.avif',
    couleur: '#16a34a', bg: '#f0fdf4', icon: 'fa-flask-vial',
    tags: ['Hématologie', 'Biochimie', 'Sérologie', 'Bactériologie'],
  },
  {
    slug: 'pharmacie',
    titre: 'Pharmacie',
    description: 'Médicaments génériques et de marque disponibles après consultation.',
    image: '/services/pharmacie.avif',
    couleur: '#7c3aed', bg: '#f5f3ff', icon: 'fa-pills',
    tags: ['Médicaments génériques', 'Médicaments de marque', 'Conseils pharmaceutiques'],
  },
  {
    slug: 'dentisterie',
    titre: 'Dentisterie',
    description: 'Soins dentaires complets de la consultation à la prothèse, en HTG et en USD.',
    image: '/services/dentisterie.jpg',
    couleur: '#0d9488', bg: '#f0fdfa', icon: 'fa-tooth',
    tags: ['Consultations', 'Extractions', 'Orthodontie', 'Prothèses'],
  },
  {
    slug: 'optometrie',
    titre: 'Optométrie',
    description: 'Examens de la vue complets et vente de montures avec Dr Gilles Abraham.',
    image: '/services/optometrie.avif',
    couleur: '#dc2626', bg: '#fef2f2', icon: 'fa-glasses',
    tags: ['Examen de la vue', 'Prescription lunettes', 'Vente montures'],
  },
  {
    slug: 'physiotherapie',
    titre: 'Physiothérapie',
    description: 'Rééducation fonctionnelle et thérapies physiques avec Mme Fredia Fleurival.',
    image: '/services/physiotherapie.png',
    couleur: '#d97706', bg: '#fffbeb', icon: 'fa-person-walking',
    tags: ['Rééducation motrice', 'Électrostimulation', 'Massage thérapeutique'],
  },
  {
    slug: 'hospitalisation',
    titre: 'Hospitalisation & Observation',
    description: 'Chambres équipées pour hospitalisation courte et longue durée avec suivi médical continu.',
    image: '/services/hospitalisation.avif',
    couleur: '#0369a1', bg: '#f0f9ff', icon: 'fa-bed-pulse',
    tags: ['Chambre individuelle', 'Surveillance 24h/24', 'Soins intensifs'],
  },
  {
    slug: 'maternite',
    titre: 'Maternité',
    description: 'Suivi de grossesse et accouchement sécurisé par une équipe de gynécologues qualifiés.',
    image: '/services/maternite.jpg',
    couleur: '#ec4899', bg: '#fdf2f8', icon: 'fa-baby',
    tags: ['Suivi prénatal', 'Échographie', 'Accouchement', 'Postnatal'],
  },
  {
    slug: 'salle-sop',
    titre: 'Salle Opératoire (SOP)',
    description: 'Bloc opératoire équipé pour chirurgies générales, orthopédiques et gynécologiques.',
    image: '/services/sop.jpg',
    couleur: '#64748b', bg: '#f8fafc', icon: 'fa-scalpel',
    tags: ['Chirurgie générale', 'Orthopédie', 'Gynécologie', 'Neurochirurgie'],
  },
  {
    slug: 'gestes-medicaux',
    titre: 'Gestes Médicaux',
    description: 'Soins infirmiers et actes médicaux rapides sans rendez-vous.',
    image: '/services/gestes_medicaux.jpg',
    couleur: '#f59e0b', bg: '#fffbeb', icon: 'fa-syringe',
    tags: ['Injections IM/IV', 'Perfusions', 'Pansements', 'ECG'],
  },
]

export default function ServicesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar variant="public" />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0f1e3d,#1641C8,#0d9488)', padding: '64px 20px 48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 50, padding: '6px 16px', marginBottom: 20 }}>
          <i className="fa-solid fa-hospital" style={{ color: '#5eead4', fontSize: 13 }} />
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600 }}>10 services · Tout sous un même toit</span>
        </div>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.8rem)', margin: '0 0 12px' }}>
          Nos <em style={{ fontStyle: 'italic', color: '#5eead4' }}>services</em>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
          Santé, chirurgie, pharmacie et bien plus — cliquez sur un service pour en savoir plus
        </p>
      </div>

      {/* Grille services avec photos */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 22 }}>
          {SERVICES.map(s => (
            <Link key={s.slug} href={`/services/${s.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white', borderRadius: 20, overflow: 'hidden',
                border: '1px solid #e2e8f0', cursor: 'pointer',
                transition: 'all 0.25s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(-5px)'
                  el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                {/* Photo */}
                <div style={{ height: 190, overflow: 'hidden', position: 'relative' }}>
                  <img src={s.image} alt={s.titre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', bottom: 14, left: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`fa-solid ${s.icon}`} style={{ color: 'white', fontSize: 16 }} />
                    </div>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: 16, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{s.titre}</span>
                  </div>
                </div>

                {/* Contenu */}
                <div style={{ padding: '16px 18px 18px' }}>
                  <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, margin: '0 0 14px' }}>{s.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {s.tags.slice(0, 3).map(t => (
                      <span key={t} style={{ background: s.bg, color: s.couleur, borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.couleur, fontWeight: 700, fontSize: 13 }}>
                    Voir le service <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
