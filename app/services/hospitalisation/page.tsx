'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'

const ACTES = [
  { nom: 'Admission en observation (24h)',        desc: "Surveillance médicale rapprochée après un traumatisme, une douleur thoracique ou tout symptôme nécessitant un suivi immédiat sans chirurgie.",        duree: '24h' },
  { nom: 'Hospitalisation courte durée (2–5j)',   desc: "Prise en charge médicale complète incluant soins infirmiers continus, bilan biologique, imagerie et consultation spécialisée.",                       duree: '2–5 j' },
  { nom: 'Hospitalisation prolongée',             desc: "Suivi intensif pour pathologies complexes : infections sévères, insuffisances organiques, post-opératoire de chirurgie lourde.",                      duree: 'Variable' },
  { nom: 'Soins infirmiers 24h/24',               desc: "Infirmières diplômées présentes en permanence pour administration des traitements, surveillance des constantes et soutien au patient.",               duree: 'Continu' },
  { nom: 'Nutrition clinique & diététique',       desc: "Alimentation adaptée à votre pathologie, administrée oralement ou par voie entérale selon les prescriptions médicales.",                             duree: 'Quotidien' },
  { nom: 'Visite médicale quotidienne',           desc: "Passage du médecin traitant chaque matin pour réévaluation clinique, adaptation du traitement et information du patient et de sa famille.",         duree: '30 min/j' },
]

export default function HospitalisationPage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const couleur = '#0891b2'

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      <div style={{ background: 'linear-gradient(135deg,#0f1e3d 0%,#0891b2 100%)', padding: '120px 5% 72px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div className="breadcrumb" style={{ marginBottom: 24 }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.6)' }}>Accueil</Link>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}> / </span>
          <Link href="/services" style={{ color: 'rgba(255,255,255,0.6)' }}>Services</Link>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}> / </span>
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Hospitalisation</span>
        </div>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', backdropFilter: 'blur(8px)' }}>
          <i className="fa-solid fa-bed-pulse" style={{ color: 'white', fontSize: 30 }} />
        </div>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 14 }}>Hospitalisation & Observation</h1>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Surveillance médicale continue 24h/24, soins infirmiers permanents et suivi par nos médecins spécialistes.
        </p>
        <button onClick={() => setRdvOpen(true)} style={{ background: 'rgba(255,255,255,0.95)', color: couleur, border: 'none', borderRadius: 12, padding: '13px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
          <i className="fa-regular fa-calendar-check" style={{ marginRight: 8 }} />Prendre rendez-vous
        </button>
      </div>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 60, alignItems: 'start' }}>
          <div>
            <span className="section-tag" style={{ background: couleur + '15', color: couleur }}>À propos</span>
            <h2 className="section-title" style={{ fontSize: '1.6rem' }}>Un suivi médical rigoureux et bienveillant</h2>
            <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: 15 }}>
              Notre service d'hospitalisation et d'observation accueille les patients nécessitant une surveillance 
              médicale rapprochée. Chambres individuelles et communes équipées, moniteurs cardiaques, oxymétrie 
              continue et personnel soignant disponible 24h/24.
            </p>
            <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: 15, marginTop: 12 }}>
              Le médecin traitant effectue une visite quotidienne et peut faire appel à tout spécialiste de la clinique 
              pour une prise en charge multidisciplinaire adaptée à votre situation.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Surveillance 24h/24', 'Chambres individuelles', 'Équipement médical complet'].map(b => (
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
              { icon: 'fa-map-pin',      text: 'Delmas, Haïti — Accès facile' },
              { icon: 'fa-clock',        text: 'Admissions 7j/7, 24h/24' },
              { icon: 'fa-phone',        text: '+509 3888-0000 (urgences)' },
              { icon: 'fa-user-nurse',   text: 'Infirmières diplômées en permanence' },
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

        <span className="section-tag" style={{ background: couleur + '15', color: couleur }}>Prestations</span>
        <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 8 }}>Ce que nous proposons</h2>
        <p style={{ color: '#64748b', marginBottom: 36 }}>Tous nos patients hospitalisés bénéficient d'un suivi médical et infirmier continu.</p>
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
      </section>
      <Footer />
    </>
  )
}
