'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import AiChatWidget from '@/components/ui/AiChatWidget'
import { horairesApi } from '@/lib/api'

const SERVICES_ACCUEIL = [
  { icon:'fa-stethoscope', color:'#1641C8', bg:'#eff6ff', title:'Clinique Externe',  link:'/services/clinique-externe' },
  { icon:'fa-flask-vial',  color:'#0d9488', bg:'#f0fdfa', title:'Laboratoire',       link:'/services/laboratoire' },
  { icon:'fa-pills',       color:'#7c3aed', bg:'#f5f3ff', title:'Pharmacie',         link:'/services/pharmacie' },
  { icon:'fa-tooth',       color:'#0d9488', bg:'#f0fdfa', title:'Dentisterie',       link:'/services/dentisterie' },
  { icon:'fa-baby',        color:'#ec4899', bg:'#fdf2f8', title:'Maternité',         link:'/services/maternite' },
  { icon:'fa-scalpel',     color:'#475569', bg:'#f8fafc', title:'Salle SOP',         link:'/services/salle-sop' },
  { icon:'fa-person-walking',color:'#d97706',bg:'#fffbeb',title:'Physiothérapie',   link:'/services/physiotherapie' },
  { icon:'fa-glasses',     color:'#dc2626', bg:'#fef2f2', title:'Optométrie',        link:'/services/optometrie' },
  { icon:'fa-syringe',     color:'#f59e0b', bg:'#fffbeb', title:'Gestes Médicaux',   link:'/services/gestes-medicaux' },
  { icon:'fa-bed-pulse',   color:'#0369a1', bg:'#f0f9ff', title:'Hospitalisation',   link:'/services/hospitalisation' },
]

export default function HomePage() {
  const [rdvOpen,   setRdvOpen]   = useState(false)
  const [horaires,  setHoraires]  = useState<any[]>([])

  useEffect(() => {
    horairesApi.list().then(r => setHoraires(r.data || [])).catch(() => {})
  }, [])

  const ouverture = horaires.find(h => h.jour === 'Lundi' && h.ouvert)
  const heures = ouverture
    ? `${ouverture.heure_ouverture} – ${ouverture.heure_fermeture}`
    : '7h00 – 17h00'

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ── HERO SPLIT ─────────────────────────────────────────────── */}
      <section style={{ minHeight:'calc(100vh - 72px)', display:'grid', gridTemplateColumns:'1fr 1fr' }}>

        {/* Côté gauche — texte */}
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 60px', background:'white' }}>
          {/* Badge horaires */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:50, padding:'8px 16px', marginBottom:32, alignSelf:'flex-start' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="fa-regular fa-clock" style={{ color:'#1641C8', fontSize:14 }} />
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>Ouvert maintenant</div>
              <div style={{ fontSize:12, color:'#64748b' }}>Lun – Sam · {heures}</div>
            </div>
          </div>

          {/* Titre principal */}
          <h1 style={{ fontWeight:900, fontSize:'clamp(2rem,4vw,3rem)', color:'#0f172a', lineHeight:1.15, margin:'0 0 16px' }}>
            Bienvenue à la<br />
            <em style={{ fontStyle:'italic', color:'#1641C8', fontFamily:'Georgia, serif' }}>Clinique de la Rebecca</em>
          </h1>
          <p style={{ color:'#64748b', fontSize:16, margin:'0 0 28px', lineHeight:1.6 }}>
            Votre espace santé personnel
          </p>

          {/* Séparateur */}
          <div style={{ width:48, height:3, background:'linear-gradient(90deg,#1641C8,#0d9488)', borderRadius:2, marginBottom:28 }} />

          {/* Features */}
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:36 }}>
            {[
              'Gérer vos rendez-vous facilement',
              'Consulter vos résultats d\'analyses',
              'Communiquer avec votre médecin',
            ].map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:'#0d9488', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className="fa-solid fa-check" style={{ color:'white', fontSize:11 }} />
                </div>
                <span style={{ color:'#374151', fontSize:15 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Boutons */}
          <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:40 }}>
            <button onClick={() => setRdvOpen(true)} style={{
              background:'#1641C8', color:'white', border:'none', borderRadius:10,
              padding:'14px 28px', fontWeight:700, fontSize:15, cursor:'pointer',
              display:'flex', alignItems:'center', gap:8
            }}>
              <i className="fa-solid fa-circle-play" /> Prendre rendez-vous
            </button>
            <Link href="/specialites" style={{
              background:'white', color:'#1641C8', border:'2px solid #1641C8',
              borderRadius:10, padding:'13px 24px', fontWeight:700, fontSize:15,
              textDecoration:'none', display:'flex', alignItems:'center', gap:8
            }}>
              Nos spécialistes
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
            {[
              { n:'30+', l:'Médecins'    },
              { n:'10',  l:'Services'    },
              { n:'15',  l:'Spécialités' },
              { n:'6j/7',l:'Disponible'  },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontWeight:900, fontSize:'1.7rem', color:'#1641C8', lineHeight:1 }}>{s.n}</div>
                <div style={{ color:'#94a3b8', fontSize:13, marginTop:4, textTransform:'uppercase', letterSpacing:0.5 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Côté droit — photo clinique */}
        <div style={{ position:'relative', overflow:'hidden', background:'#f8fafc' }}>
          <Image
            src="/services/clinique_externe.jpg"
            alt="Clinique de la Rebecca"
            fill
            style={{ objectFit:'cover' }}
            priority
          />
          {/* Overlay léger */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(22,65,200,0.08),rgba(13,148,136,0.08))' }} />

          {/* Badge note */}
          <div style={{ position:'absolute', bottom:40, left:32, background:'white', borderRadius:16, padding:'14px 18px', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="fa-solid fa-star" style={{ color:'white', fontSize:18 }} />
            </div>
            <div>
              <div style={{ fontWeight:900, color:'#0f172a', fontSize:16 }}>4.9 / 5</div>
              <div style={{ color:'#64748b', fontSize:12 }}>+1 200 patients satisfaits</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOS SERVICES ────────────────────────────────────────────── */}
      <section style={{ padding:'72px 5%', background:'#f8fafc' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36 }}>
            <div>
              <div style={{ color:'#1641C8', fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Ce que nous offrons</div>
              <h2 style={{ fontWeight:900, fontSize:'clamp(1.5rem,3vw,2rem)', color:'#0f172a', margin:0 }}>Nos services</h2>
            </div>
            <Link href="/services" style={{ color:'#1641C8', fontWeight:700, fontSize:14, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
              Voir tout <i className="fa-solid fa-arrow-right" style={{ fontSize:11 }} />
            </Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
            {SERVICES_ACCUEIL.map(s => (
              <Link key={s.title} href={s.link} style={{ textDecoration:'none' }}>
                <div style={{ background:'white', borderRadius:16, padding:'20px 16px', border:'1px solid #e2e8f0', textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(-4px)';el.style.boxShadow='0 8px 24px rgba(22,65,200,0.12)'}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(0)';el.style.boxShadow='none'}}>
                  <div style={{ width:48, height:48, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color:s.color, fontSize:20 }} />
                  </div>
                  <div style={{ fontWeight:700, color:'#0f172a', fontSize:13, lineHeight:1.3 }}>{s.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POURQUOI NOUS ───────────────────────────────────────────── */}
      <section style={{ padding:'72px 5%', background:'white' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <div style={{ color:'#1641C8', fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Pourquoi nous choisir</div>
            <h2 style={{ fontWeight:900, fontSize:'clamp(1.5rem,3vw,2rem)', color:'#0f172a', margin:'0 0 20px' }}>
              Une clinique de référence<br />à Pétion-Ville
            </h2>
            <p style={{ color:'#64748b', fontSize:15, lineHeight:1.8, margin:'0 0 28px' }}>
              Fondée pour offrir des soins de qualité accessibles à tous, la Clinique de la Rebecca regroupe des spécialistes expérimentés dans un cadre moderne et accueillant.
            </p>
            {[
              { icon:'fa-user-doctor', title:'Médecins certifiés', desc:'30+ spécialistes avec formations internationales' },
              { icon:'fa-flask-vial',  title:'Laboratoire complet', desc:'165 analyses disponibles, résultats par WhatsApp' },
              { icon:'fa-shield-halved', title:'Données sécurisées', desc:'Dossier patient confidentiel et protégé' },
            ].map(f => (
              <div key={f.title} style={{ display:'flex', gap:14, marginBottom:20 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className={`fa-solid ${f.icon}`} style={{ color:'#1641C8', fontSize:18 }} />
                </div>
                <div>
                  <div style={{ fontWeight:700, color:'#0f172a', fontSize:14, marginBottom:4 }}>{f.title}</div>
                  <div style={{ color:'#64748b', fontSize:13 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[
              { n:'30+',   l:'Médecins spécialistes',  bg:'#eff6ff', c:'#1641C8' },
              { n:'165',   l:'Analyses laboratoire',   bg:'#f0fdfa', c:'#0d9488' },
              { n:'1 200+',l:'Patients satisfaits',    bg:'#fff7ed', c:'#f59e0b' },
              { n:'6j/7',  l:'Disponibilité clinique', bg:'#fdf2f8', c:'#ec4899' },
            ].map(s => (
              <div key={s.l} style={{ background:s.bg, borderRadius:16, padding:24, textAlign:'center' }}>
                <div style={{ fontWeight:900, fontSize:'1.8rem', color:s.c, marginBottom:6 }}>{s.n}</div>
                <div style={{ color:'#64748b', fontSize:13, lineHeight:1.4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────── */}
      <section style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8,#0d9488)', padding:'72px 5%', textAlign:'center' }}>
        <h2 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.4rem,3vw,2rem)', margin:'0 0 12px' }}>
          Prenez soin de votre santé dès aujourd'hui
        </h2>
        <p style={{ color:'rgba(255,255,255,0.75)', fontSize:15, margin:'0 0 32px' }}>
          Réservez votre consultation en ligne ou appelez-nous directement
        </p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => setRdvOpen(true)} style={{
            background:'white', color:'#1641C8', border:'none', borderRadius:12,
            padding:'14px 30px', fontWeight:800, fontSize:15, cursor:'pointer',
            display:'flex', alignItems:'center', gap:8
          }}>
            <i className="fa-solid fa-calendar-check" /> Prendre rendez-vous
          </button>
          <a href="tel:+50948585757" style={{
            background:'rgba(255,255,255,0.12)', color:'white', textDecoration:'none',
            borderRadius:12, padding:'14px 24px', fontWeight:700, fontSize:15,
            display:'flex', alignItems:'center', gap:8, border:'1px solid rgba(255,255,255,0.2)'
          }}>
            <i className="fa-solid fa-phone" /> (509) 4858-5757
          </a>
        </div>
      </section>

      <AiChatWidget />
      <Footer />
    </>
  )
}
