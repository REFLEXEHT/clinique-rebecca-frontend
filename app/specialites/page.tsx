'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'

const SPECIALITES = [
  { slug:'cardiologie',    emoji:'❤️',  titre:'Cardiologie',       desc:'Diagnostic et traitement des maladies du cœur et des vaisseaux.', categorie:'interne' },
  { slug:'pediatrie',      emoji:'👶',  titre:'Pédiatrie',          desc:'Soins médicaux pour nourrissons, enfants et adolescents.', categorie:'enfants' },
  { slug:'gynecologie',    emoji:'🌸',  titre:'Gynécologie',        desc:'Santé féminine, suivi de grossesse, examens gynécologiques.', categorie:'femmes' },
  { slug:'neurologie',     emoji:'🧠',  titre:'Neurologie',         desc:'Maladies du système nerveux : migraines, épilepsie, AVC.', categorie:'interne' },
  { slug:'chirurgie',      emoji:'🔬',  titre:'Chirurgie Générale', desc:'Interventions chirurgicales planifiées et urgences.', categorie:'chirurgie' },
  { slug:'dermatologie',   emoji:'🧴',  titre:'Dermatologie',       desc:'Affections de la peau, cheveux et ongles.', categorie:'interne' },
  { slug:'ophtalmologie',  emoji:'👁️',  titre:'Ophtalmologie',      desc:'Examens de la vue, traitements des maladies oculaires.', categorie:'interne' },
  { slug:'orl',            emoji:'👂',  titre:'ORL',                desc:'Oreilles, nez, gorge — consultations et interventions.', categorie:'interne' },
  { slug:'orthopedie',     emoji:'🦴',  titre:'Orthopédie',         desc:'Troubles musculo-squelettiques, fractures, articulations.', categorie:'chirurgie' },
  { slug:'radiologie',     emoji:'📡',  titre:'Radiologie',         desc:'Échographie, radio, imagerie médicale diagnostique.', categorie:'diagnostic' },
  { slug:'endocrinologie', emoji:'⚗️',  titre:'Endocrinologie',     desc:'Diabète, thyroïde, troubles hormonaux.', categorie:'interne' },
  { slug:'medecine-interne', emoji:'🩺', titre:'Médecine Interne',  desc:'Bilan général, maladies chroniques, prévention.', categorie:'interne' },
]

const CATEGORIES = [
  { id:'tous', label:'Toutes les spécialités' },
  { id:'interne', label:'Médecine interne' },
  { id:'chirurgie', label:'Chirurgie' },
  { id:'enfants', label:'Enfants' },
  { id:'femmes', label:'Santé féminine' },
  { id:'diagnostic', label:'Diagnostic' },
]

export default function SpecialitesPage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [filtre, setFiltre] = useState('tous')

  const visibles = filtre === 'tous' ? SPECIALITES : SPECIALITES.filter(s => s.categorie === filtre)

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ── EN-TÊTE ───────────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d 0%,#1641C8 70%,#0d9488 100%)', paddingTop:110, paddingBottom:64, padding:'110px 5% 64px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10S0 14.5 0 20s4.5 10 10 10 10-4.5 10-10zm10 0c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10-10 4.5-10 10z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(13,148,136,0.2)', border:'1px solid rgba(13,148,136,0.4)', borderRadius:50, padding:'6px 16px', marginBottom:20 }}>
            <i className="fa-solid fa-user-doctor" style={{ color:'#5eead4', fontSize:13 }} />
            <span style={{ color:'#5eead4', fontSize:13, fontWeight:600 }}>22 spécialistes · 12 disciplines</span>
          </div>
          <h1 style={{ fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, color:'white', lineHeight:1.2, marginBottom:16 }}>
            Des médecins qui prennent<br />
            <em style={{ fontStyle:'italic', color:'#5eead4', fontFamily:'Georgia,serif' }}>soin de vous</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'1.05rem', lineHeight:1.7, maxWidth:540, margin:'0 auto 32px' }}>
            Chaque patient mérite une attention particulière. Nos spécialistes vous accueillent dans un environnement humain, moderne et bienveillant.
          </p>
          <div style={{ display:'flex', gap:24, justifyContent:'center', flexWrap:'wrap' }}>
            {[['12','Spécialités'],['22+','Spécialistes'],['7j/7','Disponibilité'],['15+','Ans d\'expérience']].map(([n,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.8rem', fontWeight:900, color:'white' }}>{n}</div>
                <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INTRO TEXTE ──────────────────────────────────────────────── */}
      <div style={{ background:'white', borderBottom:'1px solid #e2e8f0', padding:'28px 5%' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', textAlign:'center' }}>
          <p style={{ color:'#475569', fontSize:'1rem', lineHeight:1.7 }}>
            Que vous veniez pour un suivi, une urgence ou une consultation de prévention, nos équipes sont formées pour vous écouter, vous expliquer et vous accompagner à chaque étape de votre parcours de santé.
          </p>
        </div>
      </div>

      {/* ── FILTRES ──────────────────────────────────────────────────── */}
      <div style={{ background:'#f8fafc', padding:'32px 5% 0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFiltre(c.id)} style={{
              padding:'8px 20px', borderRadius:50, border:'none', cursor:'pointer', fontWeight:600, fontSize:14,
              background: filtre === c.id ? 'linear-gradient(135deg,#1641C8,#0d9488)' : 'white',
              color: filtre === c.id ? 'white' : '#475569',
              boxShadow: filtre === c.id ? '0 4px 12px rgba(22,65,200,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
              transition:'all 0.2s'
            }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRILLE SPÉCIALITÉS ────────────────────────────────────────── */}
      <section style={{ background:'#f8fafc', padding:'32px 5% 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
          {visibles.map((s) => (
            <div key={s.slug} style={{
              background:'white', borderRadius:20, padding:28, border:'1px solid #e2e8f0',
              transition:'all 0.25s', cursor:'pointer'
            }}
              onMouseEnter={e => { const d = e.currentTarget; d.style.transform='translateY(-5px)'; d.style.boxShadow='0 16px 40px rgba(22,65,200,0.12)'; d.style.borderColor='#1641C8' }}
              onMouseLeave={e => { const d = e.currentTarget; d.style.transform='none'; d.style.boxShadow='none'; d.style.borderColor='#e2e8f0' }}
            >
              <div style={{ fontSize:40, marginBottom:16 }}>{s.emoji}</div>
              <h3 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.05rem', marginBottom:8 }}>{s.titre}</h3>
              <p style={{ color:'#64748b', fontSize:14, lineHeight:1.6, marginBottom:20 }}>{s.desc}</p>
              <button onClick={() => setRdvOpen(true)} style={{
                width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)',
                color:'white', border:'none', borderRadius:10, padding:'10px 0',
                fontWeight:700, fontSize:14, cursor:'pointer'
              }}>
                Prendre RDV
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}
