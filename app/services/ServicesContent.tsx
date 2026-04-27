'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { useState, useEffect } from 'react'

const SERVICES = [
  { slug:'clinique-externe', titre:'Clinique externe', desc:'Consultations générales et spécialisées avec nos médecins qualifiés.', icon:'fa-stethoscope', couleur:'#1641C8', nb:22, details:['Médecine générale','Spécialités médicales','Consultations vidéo','Urgences légères'] },
  { slug:'dentisterie', titre:'Dentisterie', desc:'Soins dentaires complets assurés par notre chirurgien-dentiste expérimenté.', icon:'fa-tooth', couleur:'#7c3aed', nb:1, details:['Consultation','Extraction dentaire','Prophylaxie','Orthodontie','Prothèses'] },
  { slug:'laboratoire', titre:"Laboratoire d'analyses", desc:'Analyses biologiques réalisées avec des équipements modernes. Résultats rapides.', icon:'fa-flask-vial', couleur:'#0d9488', nb:2, details:['NFS complète','Glycémie','Bilan lipidique','Sérologies','ECBU'] },
  { slug:'pharmacie', titre:'Pharmacie', desc:'Médicaments disponibles sur place. Ordonnances honorées immédiatement.', icon:'fa-pills', couleur:'#dc2626', nb:1, details:['Médicaments sur ordonnance','Médicaments OTC','Matériel médical'] },
  { slug:'physiotherapie', titre:'Physiothérapie', desc:'Rééducation fonctionnelle, traitement des douleurs chroniques.', icon:'fa-person-walking', couleur:'#d97706', nb:1, details:['Kinésithérapie','Rééducation post-op','Traitement douleurs'] },
  { slug:'optometrie', titre:'Optométrie', desc:'Bilan visuel complet et prescription de verres correcteurs.', icon:'fa-glasses', couleur:'#059669', nb:1, details:["Bilan visuel","Prescription lunettes","Fond d'oeil"] },
  { slug:'sop', titre:'Salle SOP', desc:'Bloc opératoire équipé pour les interventions chirurgicales.', icon:'fa-scalpel', couleur:'#374151', nb:6, details:['Chirurgie générale','Chirurgie pédiatrique','Neurochirurgie','Orthopédie'] },
  { slug:'maternite', titre:'Maternité', desc:"Suivi de grossesse, accouchement et soins mère-enfant.", icon:'fa-baby', couleur:'#be185d', nb:5, details:['Suivi prénatal','Accouchement','Césarienne','Soins néonataux'] },
  { slug:'gestes', titre:'Gestes médicaux', desc:'Soins infirmiers et gestes techniques courants.', icon:'fa-syringe', couleur:'#6366f1', nb:3, details:['Injections IM/IV','Perfusions','Pansements','Sutures'] },
]

export default function ServicesContent() {
  const [rdvOpen, setRdvOpen] = useState(false)
  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />
      <div style={{ background:'linear-gradient(135deg,#0f1e3d 0%,#1641C8 55%,#0d9488 100%)', padding:'100px 5% 60px', textAlign:'center' }}>
        <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.8rem,4vw,3rem)', marginBottom:16 }}>Nos services médicaux</h1>
        <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'1.05rem', maxWidth:540, margin:'0 auto' }}>Une gamme complète de soins médicaux et paramédicaux pour toute la famille.</p>
      </div>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'60px 5%' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:24 }}>
          {SERVICES.map(s => (
            <div key={s.slug} style={{ background:'white', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden', transition:'all 0.22s' }}
              onMouseEnter={e => { const d=e.currentTarget; d.style.transform='translateY(-4px)'; d.style.boxShadow='0 16px 48px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { const d=e.currentTarget; d.style.transform='none'; d.style.boxShadow='none' }}>
              <div style={{ height:4, background:s.couleur }} />
              <div style={{ padding:28 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:16 }}>
                  <div style={{ width:52, height:52, borderRadius:16, background:s.couleur+'14', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color:s.couleur, fontSize:22 }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.05rem', marginBottom:4 }}>{s.titre}</h3>
                    <span style={{ color:'#64748b', fontSize:12, fontWeight:600 }}>{s.nb} professionnel{s.nb>1?'s':''}</span>
                  </div>
                </div>
                <p style={{ color:'#64748b', fontSize:14, lineHeight:1.65, marginBottom:20 }}>{s.desc}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
                  {s.details.slice(0,4).map(d => (
                    <span key={d} style={{ background:s.couleur+'10', color:s.couleur, borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{d}</span>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <Link href={`/services/${s.slug}`} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:s.couleur, color:'white', borderRadius:12, padding:'10px 0', fontWeight:700, fontSize:14, textDecoration:'none' }}>
                    Voir le service
                  </Link>
                  <button onClick={() => setRdvOpen(true)} style={{ width:42, height:42, borderRadius:12, background:s.couleur+'12', border:'none', color:s.couleur, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className="fa-solid fa-calendar-plus" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}
