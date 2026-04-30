'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import AiChatWidget from '@/components/ui/AiChatWidget'
import { horairesApi } from '@/lib/api'
import { Horaire } from '@/types'

const SERVICES = [
  { icon:'fa-stethoscope', color:'#1641C8', bg:'#eff6ff', title:'Clinique Externe', sub:'12 spécialités médicales', desc:'Consultations, suivis, diagnostics — 12 spécialistes dédiés à votre santé.', link:'/services/clinique-externe' },
  { icon:'fa-flask-vial',  color:'#0d9488', bg:'#f0fdfa', title:'Laboratoire',      sub:'Résultats par WhatsApp',    desc:'Analyses biologiques complètes avec résultats envoyés directement sur votre téléphone.', link:'/services/laboratoire' },
  { icon:'fa-pills',       color:'#d97706', bg:'#fffbeb', title:'Pharmacie',        sub:'Médicaments génériques et de marque', desc:'Notre pharmacie interne vous offre accès immédiat à vos médicaments après consultation.', link:'/services/pharmacie' },
  { icon:'fa-tooth',       color:'#6366f1', bg:'#f5f3ff', title:'Dentisterie',      sub:'Soins complets',            desc:'Consultation, extraction, prophylaxie, orthodontie et prothèses dentaires.', link:'/services/dentisterie' },
  { icon:'fa-person-walking',color:'#16a34a',bg:'#f0fdf4',title:'Physiothérapie',  sub:'Rééducation & douleurs',    desc:'Rééducation fonctionnelle, traitement des douleurs et récupération physique.', link:'/services/physiotherapie' },
  { icon:'fa-glasses',     color:'#0891b2', bg:'#f0f9ff', title:'Optométrie',       sub:'Examen de la vue',          desc:'Examen de la vue complet, prescription de lunettes et lentilles sur mesure.', link:'/services/optometrie' },
]

const TEMOIGNAGES = [
  { nom:'Marie-Ange C.', texte:"L'équipe est d'une gentillesse remarquable. Je me suis sentie accompagnée à chaque étape.", initiale:'M' },
  { nom:'Jean-Pierre D.', texte:"Résultats labo reçus par WhatsApp en moins de 2h. Très professionnel et efficace.", initiale:'J' },
  { nom:'Claudette M.', texte:"La consultation vidéo m'a évité un long déplacement. Médecin à l'écoute, merci.", initiale:'C' },
]

export default function HomePage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [horaires, setHoraires] = useState<Horaire[]>([])

  useEffect(() => {
    horairesApi.list().then(r => setHoraires(r.data || [])).catch(() => {})
  }, [])

  const jours = horaires.length > 0 ? horaires : [
    { jour:'Lundi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'17:00' },
    { jour:'Mardi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'17:00' },
    { jour:'Mercredi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'17:00' },
    { jour:'Jeudi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'17:00' },
    { jour:'Vendredi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'17:00' },
    { jour:'Samedi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'12:00' },
    { jour:'Dimanche', ouvert:false, heure_ouverture:'', heure_fermeture:'' },
  ]

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d 0%,#1641C8 60%,#0d9488 100%)', paddingTop:120, paddingBottom:80, padding:'120px 5% 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.04, backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize:'32px 32px' }} />
        <div style={{ maxWidth:760, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(13,148,136,0.2)', border:'1px solid rgba(13,148,136,0.4)', borderRadius:50, padding:'6px 18px', marginBottom:24 }}>
            <i className="fa-solid fa-hospital" style={{ color:'#5eead4', fontSize:13 }} />
            <span style={{ color:'#5eead4', fontSize:13, fontWeight:600 }}>9 services · Tout sous un même toit</span>
          </div>
          <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.4rem)', fontWeight:900, color:'white', lineHeight:1.15, margin:'0 0 20px' }}>
            Des soins complets<br />
            <em style={{ fontStyle:'italic', color:'#5eead4', fontFamily:'Georgia,serif' }}>pour toute la famille</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.78)', fontSize:'1.08rem', lineHeight:1.75, maxWidth:520, margin:'0 auto 36px' }}>
            Médecine, chirurgie, laboratoire, pharmacie, dentisterie et plus encore — tout ce dont vous avez besoin, en un seul endroit.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => setRdvOpen(true)} style={{ background:'#0d9488', color:'white', border:'none', borderRadius:12, padding:'14px 30px', fontWeight:700, fontSize:'1rem', cursor:'pointer', boxShadow:'0 4px 20px rgba(13,148,136,0.4)', display:'flex', alignItems:'center', gap:8 }}>
              <i className="fa-solid fa-calendar-check" />Prendre rendez-vous
            </button>
            <Link href="/consultation" style={{ background:'rgba(255,255,255,0.12)', color:'white', textDecoration:'none', borderRadius:12, padding:'14px 30px', fontWeight:600, border:'1px solid rgba(255,255,255,0.25)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', gap:8 }}>
              <i className="fa-solid fa-video" />Consultation vidéo
            </Link>
          </div>
        </div>
      </div>

      {/* ── SERVICES ──────────────────────────────────────────────────────── */}
      <section style={{ background:'#f8fafc', padding:'72px 5%' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontWeight:900, fontSize:'clamp(1.6rem,3vw,2.2rem)', color:'#0f172a', margin:'0 0 12px' }}>Nos services</h2>
            <p style={{ color:'#64748b', fontSize:'1rem', margin:0 }}>Une prise en charge complète sous un même toit</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:22 }}>
            {SERVICES.map(s => (
              <Link key={s.link} href={s.link} style={{ textDecoration:'none' }}>
                <div style={{ background:'white', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden', transition:'all 0.25s', cursor:'pointer', height:'100%' }}
                  onMouseEnter={e => { const d=e.currentTarget as HTMLDivElement; d.style.transform='translateY(-4px)'; d.style.boxShadow=`0 16px 40px ${s.color}18`; d.style.borderColor=s.color }}
                  onMouseLeave={e => { const d=e.currentTarget as HTMLDivElement; d.style.transform='none'; d.style.boxShadow='none'; d.style.borderColor='#e2e8f0' }}>
                  <div style={{ height:5, background:`linear-gradient(90deg,${s.color},${s.color}88)` }} />
                  <div style={{ padding:26 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                      <div style={{ width:50, height:50, borderRadius:14, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <i className={`fa-solid ${s.icon}`} style={{ color:s.color, fontSize:20 }} />
                      </div>
                      <div>
                        <div style={{ fontWeight:800, fontSize:16, color:'#0f172a' }}>{s.title}</div>
                        <div style={{ fontSize:12, color:s.color, fontWeight:600, marginTop:2 }}>{s.sub}</div>
                      </div>
                    </div>
                    <p style={{ color:'#64748b', fontSize:13, lineHeight:1.7, margin:'0 0 14px' }}>{s.desc}</p>
                    <div style={{ color:s.color, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:4 }}>
                      En savoir plus <i className="fa-solid fa-arrow-right" style={{ fontSize:11 }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ───────────────────────────────────────────────────── */}
      <section style={{ background:'white', padding:'72px 5%' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontWeight:900, fontSize:'clamp(1.5rem,3vw,2rem)', color:'#0f172a', margin:'0 0 10px' }}>Ce que disent nos patients</h2>
            <p style={{ color:'#64748b', fontSize:'0.95rem', margin:0 }}>La confiance de nos patients est notre meilleure récompense</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {TEMOIGNAGES.map((t, i) => (
              <div key={i} style={{ background:'#f8fafc', borderRadius:18, padding:28, border:'1px solid #e2e8f0' }}>
                <div style={{ fontSize:32, color:'#1641C8', marginBottom:12 }}>"</div>
                <p style={{ color:'#475569', fontSize:14, lineHeight:1.75, margin:'0 0 20px', fontStyle:'italic' }}>{t.texte}</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:15 }}>{t.initiale}</div>
                  <div style={{ fontWeight:700, color:'#0f172a', fontSize:14 }}>{t.nom}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HORAIRES ──────────────────────────────────────────────────────── */}
      <section style={{ background:'linear-gradient(135deg,#f0f9ff,#f0fdfa)', padding:'72px 5%' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
          <div>
            <h2 style={{ fontWeight:900, fontSize:'clamp(1.5rem,3vw,2rem)', color:'#0f172a', margin:'0 0 16px' }}>Nos horaires d'ouverture</h2>
            <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:24 }}>Nous sommes disponibles du lundi au samedi pour répondre à tous vos besoins de santé.</p>
            <button onClick={() => setRdvOpen(true)} style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
              <i className="fa-solid fa-calendar-plus" />Réserver maintenant
            </button>
          </div>
          <div style={{ background:'white', borderRadius:20, padding:24, border:'1px solid #e2e8f0', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
            {jours.map((h:any, i:number) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:i < jours.length-1 ? '1px solid #f1f5f9' : 'none' }}>
                <span style={{ fontWeight:600, color:'#374151', fontSize:14 }}>{h.jour}</span>
                <span style={{ fontSize:13, color: h.ouvert ? '#0d9488' : '#dc2626', fontWeight:600 }}>
                  {h.ouvert ? `${h.heure_ouverture} – ${h.heure_fermeture}` : 'Fermé'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8)', padding:'72px 5%', textAlign:'center' }}>
        <h2 style={{ fontWeight:900, fontSize:'clamp(1.6rem,3vw,2.2rem)', color:'white', margin:'0 0 16px' }}>Votre santé, notre priorité</h2>
        <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'1rem', margin:'0 0 32px', lineHeight:1.7 }}>
          Prenez rendez-vous dès aujourd'hui et bénéficiez d'une prise en charge rapide et professionnelle.
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => setRdvOpen(true)} style={{ background:'#0d9488', color:'white', border:'none', borderRadius:12, padding:'14px 30px', fontWeight:700, cursor:'pointer', fontSize:'1rem' }}>
            <i className="fa-solid fa-calendar-check" style={{ marginRight:8 }} />Prendre RDV
          </button>
          <Link href="/services" style={{ background:'rgba(255,255,255,0.1)', color:'white', textDecoration:'none', borderRadius:12, padding:'14px 30px', fontWeight:600, border:'1px solid rgba(255,255,255,0.2)' }}>
            Voir nos spécialistes
          </Link>
        </div>
      </section>

      <Footer />
      <AiChatWidget />
    </>
  )
}
