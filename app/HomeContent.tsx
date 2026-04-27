'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'

const SERVICES_ACCUEIL = [
  { titre: 'Clinique externe',  desc: 'Consultations générales et spécialisées avec nos médecins.', icon: 'fa-stethoscope',    href: '/specialites',           couleur: '#1641C8' },
  { titre: 'Laboratoire',       desc: 'Analyses biologiques complètes avec résultats rapides.',       icon: 'fa-flask-vial',     href: '/services/laboratoire',  couleur: '#0d9488' },
  { titre: 'Dentisterie',       desc: 'Soins dentaires complets : extraction, orthodontie, prothèses.', icon: 'fa-tooth',       href: '/services/dentisterie',  couleur: '#7c3aed' },
  { titre: 'Pharmacie',         desc: 'Médicaments disponibles sur place, ordonnances honorées.',     icon: 'fa-pills',         href: '/services/pharmacie',    couleur: '#dc2626' },
  { titre: 'Physiothérapie',    desc: 'Rééducation fonctionnelle et traitement des douleurs.',        icon: 'fa-person-walking', href: '/services/physiotherapie', couleur: '#d97706' },
  { titre: 'Optométrie',        desc: 'Bilan visuel, prescriptions et verres correcteurs.',           icon: 'fa-glasses',       href: '/services/optometrie',   couleur: '#059669' },
  { titre: 'Maternité',         desc: 'Suivi de grossesse, accouchement et soins néonataux.',         icon: 'fa-baby',          href: '/services/maternite',    couleur: '#be185d' },
  { titre: 'Salle SOP',         desc: 'Bloc opératoire équipé pour interventions chirurgicales.',     icon: 'fa-scalpel',       href: '/services/sop',          couleur: '#374151' },
  { titre: 'Gestes médicaux',   desc: 'Injections, perfusions, pansements et soins courants.',        icon: 'fa-syringe',       href: '/services/gestes',       couleur: '#6366f1' },
]

const SPECIALITES_VEDETTES = [
  'Chirurgie générale','Gynécologie','Pédiatrie','Neurologie',
  'Orthopédie','Médecine interne','Dermatologie','ORL',
]

const TEMOIGNAGES = [
  { texte: "L'équipe est d'une gentillesse remarquable. Je me suis sentie accompagnée à chaque étape de ma grossesse.", nom: "Marie-Ange C.", role: "Patiente — Maternité" },
  { texte: "Le laboratoire est rapide et les résultats sont clairs. Mon médecin a pu me donner un diagnostic précis le jour même.", nom: "Jean-Pierre D.", role: "Patient — Labo" },
  { texte: "Le Dr. Désir est exceptionnel avec les enfants. Mon fils n'avait plus peur des consultations.", nom: "Nadège F.", role: "Mère de famille — Pédiatrie" },
]

export default function HomeContent() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [nbSpec, setNbSpec]   = useState(30)

  useEffect(() => {
    specialistesApi.list().then(r => {
      if (r.data?.length > 0) setNbSpec(r.data.length)
    }).catch(() => {})
  }, [])

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-blobs">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>

        <div className="hero-left">
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(22,65,200,0.08)', border:'1px solid rgba(22,65,200,0.18)', borderRadius:50, padding:'6px 18px', marginBottom:24 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#1641C8' }} />
            <span style={{ color:'#1641C8', fontSize:13, fontWeight:600 }}>Clinique de la Rebecca — Delmas, Haïti</span>
          </div>

          <h1 className="hero-title">
            Votre santé,<br />
            <em className="hero-title-accent">entre de bonnes mains</em>
          </h1>

          <p className="hero-desc">
            Une équipe de {nbSpec} médecins et professionnels de santé dévoués à votre mieux-être, dans un cadre moderne et bienveillant à Delmas.
          </p>

          <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:48 }}>
            <button onClick={() => setRdvOpen(true)} className="btn-primary btn-glow">
              Prendre rendez-vous
            </button>
            <Link href="/specialites" className="btn-secondary">
              Nos spécialistes
            </Link>
          </div>

          <div className="hero-stats">
            {[
              { val:`${nbSpec}+`, label:'Médecins spécialistes' },
              { val:'9',          label:'Services médicaux' },
              { val:'12',         label:'Spécialités' },
              { val:'6j/7',       label:'Disponibilité' },
            ].map(c => (
              <div key={c.label} className="hero-stat-item">
                <span className="hero-stat-num">{c.val}</span>
                <span className="hero-stat-label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-photo-wrap">
            <img src="/reception.jpg" alt="Réception Clinique de la Rebecca" className="hero-photo"
              onError={(e) => {
                const el = e.target as HTMLImageElement
                el.parentElement!.style.background = 'linear-gradient(160deg,#0f1e3d 0%,#1641C8 55%,#0d9488 100%)'
                el.style.display = 'none'
              }} />
            <div className="hero-float hero-float-top">
              <div style={{ width:40, height:40, borderRadius:10, background:'rgba(22,65,200,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="fa-solid fa-calendar-check" style={{ color:'#1641C8', fontSize:18 }} />
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:14, color:'#0f172a' }}>RDV disponible</div>
                <div style={{ fontSize:12, color:'#64748b' }}>Aujourd'hui à 14h00</div>
              </div>
            </div>
            <div className="hero-float hero-float-bottom">
              <div style={{ width:40, height:40, borderRadius:10, background:'rgba(34,197,94,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="fa-solid fa-shield-check" style={{ color:'#16a34a', fontSize:18 }} />
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:14, color:'#0f172a' }}>Soins de qualité</div>
                <div style={{ fontSize:12, color:'#64748b' }}>Certifiés &amp; accrédités</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section style={{ padding:'90px 5%', background:'#f8fafc' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <span className="section-tag">Nos 9 services</span>
            <h2 className="section-title">Des soins complets <em>sous un même toit</em></h2>
            <p className="section-sub" style={{ maxWidth:520, margin:'0 auto' }}>
              De la consultation médicale à la chirurgie, en passant par le laboratoire et la pharmacie.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
            {SERVICES_ACCUEIL.map(s => (
              <Link key={s.titre} href={s.href} style={{ textDecoration:'none' }}>
                <div className="card" style={{ padding:'28px 24px', transition:'all 0.22s', cursor:'pointer' }}
                  onMouseEnter={e => { const d=e.currentTarget; d.style.transform='translateY(-4px)'; d.style.boxShadow=`0 12px 40px ${s.couleur}15`; d.style.borderColor=s.couleur+'40' }}
                  onMouseLeave={e => { const d=e.currentTarget; d.style.transform='none'; d.style.boxShadow='none'; d.style.borderColor='#e2e8f0' }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:s.couleur+'12', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color:s.couleur, fontSize:20 }} />
                  </div>
                  <div style={{ fontWeight:800, color:'#0f172a', fontSize:'1rem', marginBottom:8 }}>{s.titre}</div>
                  <div style={{ color:'#64748b', fontSize:14, lineHeight:1.6 }}>{s.desc}</div>
                  <div style={{ marginTop:16, color:s.couleur, fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                    En savoir plus <i className="fa-solid fa-arrow-right" style={{ fontSize:10 }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPÉCIALITÉS ──────────────────────────────────────────────────── */}
      <section style={{ padding:'90px 5%', background:'white' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <span className="section-tag" style={{ background:'#f0fdf4', color:'#16a34a' }}>12 spécialités médicales</span>
            <h2 className="section-title">Des experts dans <em style={{ color:'#0d9488' }}>chaque domaine</em> de la médecine</h2>
            <p className="section-sub" style={{ marginBottom:32, lineHeight:1.75 }}>
              Chirurgie, gynécologie, pédiatrie, neurologie, orthopédie et bien plus. Nos médecins sont formés dans les meilleures institutions.
            </p>
            <Link href="/specialites" className="btn-primary">
              <i className="fa-solid fa-user-doctor" /> Voir tous nos spécialistes
            </Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {SPECIALITES_VEDETTES.map(s => (
              <Link key={s} href="/specialites" style={{ textDecoration:'none' }}>
                <div style={{ background:'#f8fafc', borderRadius:14, padding:'14px 18px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:10, transition:'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#1641C8'; e.currentTarget.style.background='#eff6ff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#f8fafc' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#1641C8', flexShrink:0 }} />
                  <span style={{ fontWeight:600, color:'#0f172a', fontSize:14 }}>{s}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ──────────────────────────────────────────────────── */}
      <section style={{ padding:'90px 5%', background:'#f8fafc' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <span className="section-tag">Témoignages</span>
            <h2 className="section-title">Ce que disent <em>nos patients</em></h2>
          </div>
          <div className="temoignages-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24 }}>
            {TEMOIGNAGES.map((item, i) => (
              <div key={i} className="card" style={{ padding:'32px 28px' }}>
                <div style={{ display:'flex', gap:3, marginBottom:20 }}>
                  {[...Array(5)].map((_, j) => <i key={j} className="fa-solid fa-star" style={{ color:'#f59e0b', fontSize:14 }} />)}
                </div>
                <p style={{ color:'#334155', fontSize:15, lineHeight:1.75, marginBottom:24, fontStyle:'italic' }}>"{item.texte}"</p>
                <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:20, display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:16 }}>
                    {item.nom[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:'#0f172a', fontSize:14 }}>{item.nom}</div>
                    <div style={{ color:'#94a3b8', fontSize:12 }}>{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8)', padding:'90px 5%', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.6rem,3vw,2.4rem)', marginBottom:16 }}>
            Prenez soin de vous aujourd'hui
          </h2>
          <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'1rem', lineHeight:1.75, marginBottom:36 }}>
            Consultation en cabinet ou par vidéo, disponible 6 jours sur 7. Notre équipe vous accueille avec bienveillance.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => setRdvOpen(true)} className="btn-primary" style={{ background:'white', color:'#1641C8' }}>
              Prendre rendez-vous
            </button>
            <Link href="/consultation" className="btn-outline-white">Consultation en ligne</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
