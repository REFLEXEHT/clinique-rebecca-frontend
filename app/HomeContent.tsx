'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'

const SERVICES_ACCUEIL = [
  { titre: 'Clinique externe', desc: 'Consultations générales et spécialisées avec nos médecins.', icon: 'fa-stethoscope', href: '/specialites', couleur: '#1641C8' },
  { titre: 'Laboratoire', desc: 'Analyses biologiques complètes avec résultats rapides.', icon: 'fa-flask-vial', href: '/services/laboratoire', couleur: '#0d9488' },
  { titre: 'Dentisterie', desc: 'Soins dentaires complets : extraction, orthodontie, prothèses.', icon: 'fa-tooth', href: '/services/dentisterie', couleur: '#7c3aed' },
  { titre: 'Pharmacie', desc: 'Médicaments disponibles sur place, ordonnances honorées.', icon: 'fa-pills', href: '/services/pharmacie', couleur: '#dc2626' },
  { titre: 'Physiothérapie', desc: 'Rééducation fonctionnelle et traitement des douleurs.', icon: 'fa-person-walking', href: '/services/physiotherapie', couleur: '#d97706' },
  { titre: 'Optométrie', desc: 'Bilan visuel, prescriptions et verres correcteurs.', icon: 'fa-glasses', href: '/services/optometrie', couleur: '#059669' },
  { titre: 'Maternité', desc: 'Suivi de grossesse, accouchement et soins néonataux.', icon: 'fa-baby', href: '/services/maternite', couleur: '#be185d' },
  { titre: 'Salle SOP', desc: 'Bloc opératoire équipé pour interventions chirurgicales.', icon: 'fa-scalpel', href: '/services/sop', couleur: '#374151' },
  { titre: 'Gestes médicaux', desc: 'Injections, perfusions, pansements et soins courants.', icon: 'fa-syringe', href: '/services/gestes', couleur: '#6366f1' },
]

const SPECIALITES_VEDETTES = [
  'Chirurgie générale','Gynécologie','Pédiatrie','Neurologie',
  'Orthopédie','Médecine interne','Dermatologie','ORL',
]

export default function HomeContent() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [nbSpec, setNbSpec] = useState(30)

  useEffect(() => {
    specialistesApi.list().then(r => {
      if (r.data?.length > 0) setNbSpec(r.data.length)
    }).catch(() => {})
  }, [])

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* HERO */}
      <section style={{ background:'linear-gradient(135deg,#0f1e3d 0%,#1641C8 55%,#0d9488 100%)', minHeight:'90vh', display:'flex', alignItems:'center', padding:'120px 5% 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'10%', right:'8%', width:340, height:340, borderRadius:'50%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', pointerEvents:'none' }} />
        <div style={{ maxWidth:760, position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(13,148,136,0.2)', border:'1px solid rgba(13,148,136,0.4)', borderRadius:50, padding:'6px 18px', marginBottom:28 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#5eead4' }} />
            <span style={{ color:'#5eead4', fontSize:13, fontWeight:600 }}>Clinique de la Rebecca — Delmas, Haïti</span>
          </div>
          <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(2.2rem,5vw,3.8rem)', lineHeight:1.15, marginBottom:20 }}>
            Votre santé,<br /><em style={{ fontStyle:'italic', color:'#5eead4', fontFamily:'Georgia,serif' }}>entre de bonnes mains</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.78)', fontSize:'1.1rem', lineHeight:1.75, maxWidth:540, marginBottom:36 }}>
            Une équipe de {nbSpec} médecins et professionnels de santé dévoués à votre mieux-être, dans un cadre moderne et bienveillant.
          </p>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <button onClick={() => setRdvOpen(true)} style={{ background:'white', color:'#1641C8', border:'none', borderRadius:50, padding:'14px 32px', fontWeight:800, fontSize:'1rem', cursor:'pointer', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
              Prendre rendez-vous
            </button>
            <Link href="/specialites" style={{ background:'rgba(255,255,255,0.12)', color:'white', border:'1px solid rgba(255,255,255,0.3)', borderRadius:50, padding:'14px 32px', fontWeight:700, fontSize:'1rem', cursor:'pointer', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8 }}>
              Voir nos spécialistes <i className="fa-solid fa-arrow-right" style={{ fontSize:13 }} />
            </Link>
          </div>
          <div style={{ display:'flex', gap:36, marginTop:52, flexWrap:'wrap' }}>
            {[{val:`${nbSpec}+`, label:'Médecins spécialistes'},{val:'9',label:'Services médicaux'},{val:'12',label:'Spécialités'},{val:'6j/7',label:'Disponibilité'}].map(c => (
              <div key={c.label}>
                <div style={{ color:'white', fontWeight:900, fontSize:'1.8rem', lineHeight:1 }}>{c.val}</div>
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginTop:4, fontWeight:500 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding:'80px 5%', background:'#f8fafc' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#eff6ff', color:'#1641C8', borderRadius:50, padding:'6px 18px', fontSize:12, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:1, marginBottom:16 }}>Nos 9 services</span>
            <h2 style={{ fontWeight:900, fontSize:'clamp(1.6rem,3vw,2.4rem)', color:'#0f172a', marginBottom:12 }}>Des soins complets sous un même toit</h2>
            <p style={{ color:'#64748b', fontSize:'1rem', maxWidth:520, margin:'0 auto' }}>De la consultation médicale à la chirurgie, en passant par le laboratoire et la pharmacie.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
            {SERVICES_ACCUEIL.map(s => (
              <Link key={s.titre} href={s.href} style={{ textDecoration:'none' }}>
                <div style={{ background:'white', borderRadius:20, padding:'28px 24px', border:'1px solid #e2e8f0', transition:'all 0.22s', cursor:'pointer' }}
                  onMouseEnter={e => { const d=e.currentTarget; d.style.transform='translateY(-4px)'; d.style.boxShadow='0 12px 40px rgba(22,65,200,0.1)'; d.style.borderColor=s.couleur+'30' }}
                  onMouseLeave={e => { const d=e.currentTarget; d.style.transform='none'; d.style.boxShadow='none'; d.style.borderColor='#e2e8f0' }}
                >
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

      {/* SPÉCIALITÉS */}
      <section style={{ padding:'80px 5%', background:'white' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <span style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#f0fdf4', color:'#16a34a', borderRadius:50, padding:'6px 18px', fontSize:12, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:1, marginBottom:20 }}>12 spécialités médicales</span>
            <h2 style={{ fontWeight:900, fontSize:'clamp(1.6rem,3vw,2.4rem)', color:'#0f172a', lineHeight:1.25, marginBottom:20 }}>Des experts dans chaque domaine de la médecine</h2>
            <p style={{ color:'#64748b', fontSize:'1rem', lineHeight:1.75, marginBottom:32 }}>Chirurgie, gynécologie, pédiatrie, neurologie, orthopédie et bien plus. Nos médecins sont formés dans les meilleures institutions.</p>
            <Link href="/specialites" style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#1641C8', color:'white', borderRadius:50, padding:'14px 28px', fontWeight:700, fontSize:'0.95rem', textDecoration:'none' }}>
              <i className="fa-solid fa-user-doctor" /> Voir tous nos spécialistes
            </Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {SPECIALITES_VEDETTES.map(s => (
              <div key={s} style={{ background:'#f8fafc', borderRadius:14, padding:'16px 18px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#1641C8', flexShrink:0 }} />
                <span style={{ fontWeight:600, color:'#0f172a', fontSize:14 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8)', padding:'80px 5%', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.6rem,3vw,2.4rem)', marginBottom:16 }}>Prenez soin de vous aujourd'hui</h2>
          <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'1rem', lineHeight:1.75, marginBottom:36 }}>Consultation en cabinet ou par vidéo, disponible 6 jours sur 7. Notre équipe vous accueille avec bienveillance.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => setRdvOpen(true)} style={{ background:'white', color:'#1641C8', border:'none', borderRadius:50, padding:'14px 32px', fontWeight:800, fontSize:'1rem', cursor:'pointer' }}>Prendre rendez-vous</button>
            <Link href="/consultation" style={{ background:'rgba(255,255,255,0.12)', color:'white', border:'1px solid rgba(255,255,255,0.3)', borderRadius:50, padding:'14px 32px', fontWeight:700, fontSize:'1rem', textDecoration:'none' }}>Consultation en ligne</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
