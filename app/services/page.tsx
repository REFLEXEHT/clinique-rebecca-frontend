'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'

const SERVICES = [
  {
    slug: 'laboratoire',
    titre: 'Laboratoire',
    icon: 'fa-flask-vial',
    couleur: '#0d9488',
    bg: 'linear-gradient(135deg,#0f1e3d,#0d9488)',
    desc: 'Analyses biologiques complètes avec résultats rapides. Hématologie, biochimie, microbiologie, sérologie.',
    examens: ['Numération formule sanguine', 'Glycémie / HbA1c', 'Bilan lipidique', 'Fonction rénale', 'Fonction hépatique', 'Sérologie VIH/VHB/VHC', 'Test de grossesse', 'Analyse d\'urine', 'Coproculture'],
  },
  {
    slug: 'dentisterie',
    titre: 'Dentisterie',
    icon: 'fa-tooth',
    couleur: '#7c3aed',
    bg: 'linear-gradient(135deg,#0f1e3d,#7c3aed)',
    desc: 'Soins dentaires complets par le Dr Wolf Charlie Cajuste : extractions, soins, prothèses et orthodontie.',
    examens: ['Consultation dentaire', 'Détartrage', 'Extraction', 'Obturation (plombage)', 'Prothèse dentaire', 'Orthodontie', 'Blanchissement', 'Radiographie dentaire'],
  },
  {
    slug: 'pharmacie',
    titre: 'Pharmacie',
    icon: 'fa-pills',
    couleur: '#dc2626',
    bg: 'linear-gradient(135deg,#0f1e3d,#dc2626)',
    desc: 'Médicaments disponibles sur place, ordonnances honorées. Produits pharmaceutiques et parapharmaceutiques.',
    examens: [],
    pharmacie: true,
  },
  {
    slug: 'physiotherapie',
    titre: 'Physiothérapie',
    icon: 'fa-person-walking',
    couleur: '#d97706',
    bg: 'linear-gradient(135deg,#0f1e3d,#d97706)',
    desc: 'Rééducation fonctionnelle, traitement des douleurs chroniques et récupération post-opératoire.',
    examens: ['Kinésithérapie musculaire', 'Rééducation post-opératoire', 'Traitement lombalgies', 'Rééducation AVC', 'Traitement cervicalgies', 'Électrothérapie', 'Ultrasons thérapeutiques'],
  },
  {
    slug: 'optometrie',
    titre: 'Optométrie',
    icon: 'fa-glasses',
    couleur: '#059669',
    bg: 'linear-gradient(135deg,#0f1e3d,#059669)',
    desc: 'Bilan visuel complet, prescriptions de verres correcteurs et suivi ophtalmologique de base.',
    examens: ['Bilan visuel complet', 'Test d\'acuité visuelle', 'Prescription de lunettes', 'Dépistage glaucome', 'Fond d\'œil', 'Mesure tension oculaire'],
  },
  {
    slug: 'maternite',
    titre: 'Maternité',
    icon: 'fa-baby',
    couleur: '#be185d',
    bg: 'linear-gradient(135deg,#0f1e3d,#be185d)',
    desc: 'Suivi de grossesse, accouchement sécurisé et soins néonataux dans un environnement chaleureux.',
    examens: ['Consultation prénatale', 'Échographie obstétricale', 'Suivi mensuel grossesse', 'Accouchement', 'Soins nouveau-né', 'Vaccination nourrisson', 'Planification familiale'],
  },
  {
    slug: 'sop',
    titre: 'Salle SOP',
    icon: 'fa-scalpel',
    couleur: '#374151',
    bg: 'linear-gradient(135deg,#0f1e3d,#374151)',
    desc: 'Bloc opératoire équipé pour interventions chirurgicales programmées et urgences.',
    examens: ['Chirurgie digestive', 'Chirurgie gynécologique', 'Chirurgie orthopédique', 'Herniorraphie', 'Appendicectomie', 'Césarienne'],
  },
  {
    slug: 'gestes',
    titre: 'Gestes médicaux',
    icon: 'fa-syringe',
    couleur: '#6366f1',
    bg: 'linear-gradient(135deg,#0f1e3d,#6366f1)',
    desc: 'Soins courants effectués sur place : injections, perfusions, pansements et petites interventions.',
    examens: ['Injection intramusculaire', 'Perfusion intraveineuse', 'Prise de sang', 'Pansement', 'Suture', 'Ablation points', 'ECG', 'Pose sonde urinaire'],
  },
]

export default function ServicesPage() {
  const [rdvOpen, setRdvOpen] = useState(false)

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> / <span>Services</span>
        </div>
        <h1>Nos services médicaux</h1>
        <p>Des soins complets sous un même toit, du lundi au samedi</p>
      </div>

      <section style={{ padding: '72px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 24 }}>
          {SERVICES.map(s => (
            <Link key={s.slug} href={`/services/${s.slug}`} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{ padding: '28px 24px', transition: 'all 0.22s', cursor: 'pointer' }}
                onMouseEnter={e => { const d = e.currentTarget; d.style.transform = 'translateY(-4px)'; d.style.boxShadow = `0 12px 40px ${s.couleur}22`; d.style.borderColor = s.couleur + '40' }}
                onMouseLeave={e => { const d = e.currentTarget; d.style.transform = 'none'; d.style.boxShadow = 'none'; d.style.borderColor = '#e2e8f0' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.couleur + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <i className={`fa-solid ${s.icon}`} style={{ color: s.couleur, fontSize: 22 }} />
                </div>
                <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: 10 }}>{s.titre}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 18 }}>{s.desc}</p>
                <div style={{ color: s.couleur, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Voir le service <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg,#0f1e3d,#1641C8)', padding: '72px 5%', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.5rem,3vw,2.2rem)', marginBottom: 14 }}>Besoin d'un service spécifique ?</h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', marginBottom: 32, lineHeight: 1.75 }}>Notre équipe est disponible 6 jours sur 7 pour vous orienter vers le bon spécialiste.</p>
          <button onClick={() => setRdvOpen(true)} className="btn-primary" style={{ background: 'white', color: '#1641C8' }}>
            Prendre rendez-vous
          </button>
        </div>
      </section>

      <Footer />
    </>
  )
}
