'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'

const ACTES = [
  { nom: 'Consultation médicale générale',     desc: "Évaluation complète de votre état de santé, bilan clinique et orientation vers la spécialité adaptée si nécessaire.",                          duree: '30 min' },
  { nom: 'Consultation spécialisée',           desc: "Rendez-vous avec l'un de nos 12 spécialistes : gynécologie, pédiatrie, chirurgie, neurologie, orthopédie, dermatologie, etc.",               duree: '30–45 min' },
  { nom: 'Suivi de maladies chroniques',       desc: "Gestion du diabète, de l'hypertension, de l'asthme et autres pathologies de longue durée avec ajustement régulier du traitement.",            duree: '20 min' },
  { nom: 'Médecine préventive & bilan santé',  desc: "Examens de dépistage annuels, vaccinations adultes et enfants, conseils hygiéno-diététiques personnalisés.",                                  duree: '30 min' },
  { nom: 'Renouvellement d\'ordonnance',       desc: "Renouvellement de traitements en cours après consultation médicale validant l'adéquation du traitement.",                                    duree: '15 min' },
  { nom: 'Certificat médical',                 desc: "Délivrance de certificats médicaux d'aptitude, d'inaptitude, scolaire ou sportif après examen clinique.",                                    duree: '20 min' },
]

export default function CliniqueExternePage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const couleur = '#1641C8'

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0f1e3d 0%,#1641C8 100%)', padding: '120px 5% 72px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div className="breadcrumb" style={{ marginBottom: 24 }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.6)' }}>Accueil</Link>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}> / </span>
          <Link href="/services" style={{ color: 'rgba(255,255,255,0.6)' }}>Services</Link>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}> / </span>
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Clinique externe</span>
        </div>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', backdropFilter: 'blur(8px)' }}>
          <i className="fa-solid fa-stethoscope" style={{ color: 'white', fontSize: 30 }} />
        </div>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 14 }}>Clinique externe</h1>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Consultations médicales générales et spécialisées, sans hospitalisation. Accueil du lundi au samedi de 7h à 17h.
        </p>
        <button onClick={() => setRdvOpen(true)} style={{ background: 'rgba(255,255,255,0.95)', color: couleur, border: 'none', borderRadius: 12, padding: '13px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
          <i className="fa-regular fa-calendar-check" style={{ marginRight: 8 }} />Prendre rendez-vous
        </button>
      </div>

      {/* Corps */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 60, alignItems: 'start' }}>
          <div>
            <span className="section-tag" style={{ background: couleur + '15', color: couleur }}>À propos</span>
            <h2 className="section-title" style={{ fontSize: '1.6rem' }}>Une prise en charge complète en ambulatoire</h2>
            <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: 15 }}>
              La clinique externe de la Clinique de la Rebecca offre des consultations médicales sans hospitalisation. 
              Nos médecins généralistes et spécialistes vous reçoivent dans des cabinets modernes et équipés pour établir 
              un diagnostic précis et mettre en place le traitement adapté à votre situation.
            </p>
            <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: 15, marginTop: 12 }}>
              Chaque patient bénéficie d'un dossier médical numérique, garantissant la continuité des soins entre tous 
              les praticiens de la clinique.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Dossier médical numérique', 'Coordination inter-spécialités', 'Sans rendez-vous possible'].map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, background: couleur + '10', borderRadius: 50, padding: '8px 16px' }}>
                  <i className="fa-solid fa-check" style={{ color: couleur, fontSize: 11 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: couleur + '08', borderRadius: 20, padding: 28, border: `1px solid ${couleur}20` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-location-dot" style={{ color: couleur }} /> Clinique de la Rebecca
            </div>
            {[
              { icon: 'fa-map-pin',  text: 'Delmas, Haïti — Accès facile' },
              { icon: 'fa-calendar', text: 'Lundi – Samedi, 7h00 – 17h00' },
              { icon: 'fa-phone',    text: '+509 3888-0000' },
              { icon: 'fa-users',    text: '30+ médecins et spécialistes' },
            ].map(i => (
              <div key={i.text} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <i className={`fa-solid ${i.icon}`} style={{ color: couleur, width: 16, textAlign: 'center' }} />
                <span style={{ color: '#475569', fontSize: 14 }}>{i.text}</span>
              </div>
            ))}
            <button onClick={() => setRdvOpen(true)} style={{ width: '100%', marginTop: 16, background: couleur, color: 'white', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              Prendre rendez-vous
            </button>
          </div>
        </div>

        {/* Actes */}
        <span className="section-tag" style={{ background: couleur + '15', color: couleur }}>Consultations disponibles</span>
        <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 8 }}>Ce que nous proposons</h2>
        <p style={{ color: '#64748b', marginBottom: 36 }}>Tous nos actes incluent une évaluation médicale complète.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ACTES.map((e, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start', transition: 'all 0.2s' }}
              onMouseEnter={el => { el.currentTarget.style.borderColor = couleur + '50'; el.currentTarget.style.boxShadow = `0 4px 20px ${couleur}15` }}
              onMouseLeave={el => { el.currentTarget.style.borderColor = '#e2e8f0'; el.currentTarget.style.boxShadow = 'none' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: couleur, flexShrink: 0 }} />
                  <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: 15, margin: 0 }}>{e.nom}</h4>
                </div>
                <p style={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.65, margin: 0, paddingLeft: 18 }}>{e.desc}</p>
              </div>
              <div style={{ background: couleur + '12', borderRadius: 50, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: couleur, whiteSpace: 'nowrap', flexShrink: 0 }}>{e.duree}</div>
            </div>
          ))}
        </div>

        {/* CTA spécialistes */}
        <div style={{ marginTop: 56, background: 'linear-gradient(135deg,#0f1e3d,#1641C8)', borderRadius: 20, padding: '40px 40px', textAlign: 'center', color: 'white' }}>
          <h3 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: 10 }}>Voir nos spécialistes</h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 24 }}>Choisissez votre spécialité et prenez rendez-vous directement avec le médecin de votre choix.</p>
          <Link href="/specialites" style={{ background: 'white', color: '#1641C8', borderRadius: 12, padding: '13px 28px', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
            <i className="fa-solid fa-user-doctor" style={{ marginRight: 8 }} />Nos médecins
          </Link>
        </div>
      </section>
      <Footer />
    </>
  )
}
