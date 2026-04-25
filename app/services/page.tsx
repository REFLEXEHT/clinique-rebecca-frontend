'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'

const SERVICES = [
  {
    slug:'clinique-externe', icon:'fa-stethoscope', emoji:'🩺', color:'#1641C8',
    titre:'Clinique Externe', sous:'12 spécialités médicales',
    desc:'Notre clinique externe regroupe 12 spécialistes dédiés à votre santé. Consultations, suivis, diagnostics — tout est disponible sous un même toit avec des rendez-vous rapides.',
    avantages:['RDV le jour même disponibles','12 spécialités médicales','Suivi personnalisé du dossier'],
    lien:'/specialites'
  },
  {
    slug:'laboratoire', icon:'fa-flask-vial', emoji:'🔬', color:'#0d9488',
    titre:'Laboratoire', sous:'Résultats par WhatsApp',
    desc:'Analyses biologiques complètes avec un équipement moderne. Vos résultats sont envoyés directement sur votre téléphone WhatsApp ou par email dans les délais les plus courts.',
    avantages:['Résultats WhatsApp & email','Analyses complètes','Rapide et précis'],
    lien:'/services/laboratoire'
  },
  {
    slug:'pharmacie', icon:'fa-pills', emoji:'💊', color:'#d97706',
    titre:'Pharmacie', sous:'Médicaments génériques et de marque',
    desc:'Notre pharmacie interne vous offre un accès immédiat à vos médicaments après consultation, avec des conseils pharmaceutiques personnalisés de nos professionnels.',
    avantages:['Médicaments disponibles sur place','Génériques abordables','Conseils pharmaceutiques'],
    lien:'/services/pharmacie'
  },
  {
    slug:'dentisterie', icon:'fa-tooth', emoji:'🦷', color:'#6366f1',
    titre:'Dentisterie', sous:'Soins dentaires complets',
    desc:'Détartrage, extraction, soins des caries, prothèses dentaires et esthétique du sourire. Notre dentiste prend en charge toute la famille dans un environnement moderne.',
    avantages:['Famille et enfants acceptés','Esthétique dentaire','Prothèses sur mesure'],
    lien:'/services/dentisterie'
  },
  {
    slug:'physiotherapie', icon:'fa-person-walking', emoji:'🏃', color:'#16a34a',
    titre:'Physiothérapie', sous:'Rééducation et douleurs chroniques',
    desc:'Traitement des douleurs musculaires, articulaires et rééducation post-opératoire. Nos kinésithérapeutes vous accompagnent vers une récupération durable.',
    avantages:['Rééducation post-opératoire','Douleurs chroniques','Séances personnalisées'],
    lien:'/services/physio'
  },
  {
    slug:'optometrie', icon:'fa-glasses', emoji:'👓', color:'#0891b2',
    titre:'Optométrie', sous:'Examen de la vue et lunettes',
    desc:'Bilan visuel complet, prescription de lunettes et lentilles, dépistage précoce des maladies oculaires. Votre vue mérite des professionnels qualifiés.',
    avantages:['Bilan visuel complet','Lunettes sur mesure','Lentilles de contact'],
    lien:'/services/optometrie'
  },
  {
    slug:'sop', icon:'fa-scalpel', emoji:'🔪', color:'#dc2626',
    titre:'Salle d\'Opération', sous:'Chirurgie planifiée et urgences',
    desc:'Bloc opératoire équipé pour les interventions chirurgicales planifiées et les urgences. Une équipe spécialisée assure votre sécurité avant, pendant et après l\'opération.',
    avantages:['Bloc opératoire moderne','Équipe anesthésiste','Suivi post-opératoire'],
    lien:'/services/sop'
  },
  {
    slug:'maternite', icon:'fa-baby', emoji:'👶', color:'#ec4899',
    titre:'Maternité', sous:'Suivi grossesse et accouchement',
    desc:'Suivi prénatal, préparation à l\'accouchement et salle de naissance équipée. Accompagnement dédié des futures mamans dans un cadre sécurisé et bienveillant.',
    avantages:['Suivi prénatal complet','Salle de naissance','Sage-femme disponible'],
    lien:'/services/maternite'
  },
  {
    slug:'gestes', icon:'fa-syringe', emoji:'💉', color:'#7c3aed',
    titre:'Gestes Médicaux', sous:'Injections, perfusions, soins',
    desc:'Injections intramusculaires, intraveineuses, perfusions, pansements complexes et petits gestes chirurgicaux réalisés par des infirmiers et médecins qualifiés.',
    avantages:['Sans rendez-vous pour urgences','Infirmiers qualifiés','Environnement stérile'],
    lien:'/services/gestes'
  },
]

export default function ServicesPage() {
  const [rdvOpen, setRdvOpen] = useState(false)

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ── EN-TÊTE ─────────────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d 0%,#1641C8 65%,#0d9488 100%)', paddingTop:110, paddingBottom:64, padding:'110px 5% 64px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.04, backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize:'32px 32px' }} />
        <div style={{ maxWidth:760, margin:'0 auto', textAlign:'center', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(13,148,136,0.2)', border:'1px solid rgba(13,148,136,0.4)', borderRadius:50, padding:'6px 18px', marginBottom:20 }}>
            <i className="fa-solid fa-hospital" style={{ color:'#5eead4', fontSize:13 }} />
            <span style={{ color:'#5eead4', fontSize:13, fontWeight:600 }}>9 services · Tout sous un même toit</span>
          </div>
          <h1 style={{ fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, color:'white', lineHeight:1.2, marginBottom:16 }}>
            Des soins complets<br />
            <em style={{ fontStyle:'italic', color:'#5eead4', fontFamily:'Georgia,serif' }}>pour toute la famille</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'1.05rem', lineHeight:1.7, maxWidth:520, margin:'0 auto 32px' }}>
            Médecine, chirurgie, laboratoire, pharmacie, dentisterie et plus encore — tout ce dont vous avez besoin, en un seul endroit.
          </p>
          <button onClick={() => setRdvOpen(true)} style={{
            background:'#0d9488', color:'white', border:'none', borderRadius:12,
            padding:'13px 28px', fontWeight:700, fontSize:'1rem', cursor:'pointer',
            boxShadow:'0 4px 20px rgba(13,148,136,0.4)'
          }}>
            <i className="fa-solid fa-calendar-check" style={{ marginRight:8 }} />Prendre rendez-vous
          </button>
        </div>
      </div>

      {/* ── GRILLE DES SERVICES ─────────────────────────────────────────── */}
      <section style={{ background:'#f8fafc', padding:'64px 5%' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
          {SERVICES.map(s => (
            <div key={s.slug} style={{ background:'white', borderRadius:22, overflow:'hidden', border:'1px solid #e2e8f0', transition:'all 0.25s' }}
              onMouseEnter={e => { const d = e.currentTarget; d.style.transform='translateY(-5px)'; d.style.boxShadow=`0 20px 48px ${s.color}18`; d.style.borderColor=s.color }}
              onMouseLeave={e => { const d = e.currentTarget; d.style.transform='none'; d.style.boxShadow='none'; d.style.borderColor='#e2e8f0' }}>

              {/* Header coloré */}
              <div style={{ height:8, background:`linear-gradient(90deg,${s.color},${s.color}99)` }} />

              <div style={{ padding:28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:`${s.color}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
                    {s.emoji}
                  </div>
                  <div>
                    <h3 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.05rem', marginBottom:2 }}>{s.titre}</h3>
                    <span style={{ color:s.color, fontSize:12, fontWeight:600 }}>{s.sous}</span>
                  </div>
                </div>

                <p style={{ color:'#64748b', fontSize:14, lineHeight:1.7, marginBottom:18 }}>{s.desc}</p>

                <ul style={{ listStyle:'none', padding:0, margin:'0 0 20px' }}>
                  {s.avantages.map(a => (
                    <li key={a} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7, color:'#475569', fontSize:13 }}>
                      <i className="fa-solid fa-check-circle" style={{ color:'#0d9488', fontSize:14 }} /> {a}
                    </li>
                  ))}
                </ul>

                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setRdvOpen(true)} style={{
                    flex:1, background:`linear-gradient(135deg,${s.color},${s.color}cc)`,
                    color:'white', border:'none', borderRadius:10, padding:'10px 0',
                    fontWeight:700, fontSize:13, cursor:'pointer'
                  }}>
                    <i className="fa-solid fa-calendar-check" style={{ marginRight:6 }} />RDV
                  </button>
                  <Link href={s.lien} style={{
                    flex:1, background:s.color+'10', color:s.color, textDecoration:'none',
                    borderRadius:10, padding:'10px 0', fontWeight:700, fontSize:13,
                    textAlign:'center', border:`1px solid ${s.color}30`
                  }}>
                    En savoir plus
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────────── */}
      <section style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8 60%,#0d9488)', padding:'64px 5%', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:'2rem', fontWeight:900, color:'white', marginBottom:12 }}>Besoin d'une consultation ?</h2>
          <p style={{ color:'rgba(255,255,255,0.75)', marginBottom:28, lineHeight:1.7 }}>Prenez rendez-vous en ligne ou consultez par vidéo depuis chez vous. Simple, rapide et sans file d'attente.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => setRdvOpen(true)} style={{ background:'#0d9488', color:'white', border:'none', borderRadius:12, padding:'13px 28px', fontWeight:700, cursor:'pointer' }}>
              <i className="fa-solid fa-calendar-check" style={{ marginRight:8 }} />Prendre RDV
            </button>
            <Link href="/consultation" style={{ background:'rgba(255,255,255,0.12)', color:'white', textDecoration:'none', borderRadius:12, padding:'13px 24px', fontWeight:600, border:'1px solid rgba(255,255,255,0.25)', backdropFilter:'blur(8px)' }}>
              <i className="fa-solid fa-video" style={{ marginRight:8 }} />Consultation vidéo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
