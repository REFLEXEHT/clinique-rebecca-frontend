'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { useState } from 'react'

const SERVICES = [
  {
    key: 'clinique-externe',
    titre: 'Clinique externe',
    href: '/services/clinique-externe',
    photo: '/clinque_externe.jpg',
    couleur: '#1641C8',
    icon: 'fa-stethoscope',
    desc: 'Consultations médicales générales et spécialisées, sans rendez-vous ou sur réservation.',
    tag: 'Ambulatoire',
  },
  {
    key: 'gestes-medicaux',
    titre: 'Gestes médicaux',
    href: '/services/gestes',
    photo: '/gestes_medicaux.jpg',
    couleur: '#6366f1',
    icon: 'fa-syringe',
    desc: 'Injections, perfusions IV, pansements et soins courants réalisés par nos infirmières.',
    tag: 'Soins rapides',
  },
  {
    key: 'hospitalisation',
    titre: 'Hospitalisation & Observation',
    href: '/services/hospitalisation',
    photo: '/hospitalisation_observation.avif',
    couleur: '#0891b2',
    icon: 'fa-bed-pulse',
    desc: 'Surveillance médicale continue 24h/24, soins infirmiers et suivi quotidien par nos médecins.',
    tag: '24h/24',
  },
  {
    key: 'labo-pharmacie',
    titre: 'Laboratoire & Pharmacie',
    href: '/services/labo-pharmacie',
    photo: null,
    couleur: '#0d9488',
    icon: 'fa-flask-vial',
    desc: 'Analyses biologiques complètes et médicaments disponibles sur place. Résultats en 2h.',
    tag: 'Sur place',
  },
  {
    key: 'dentisterie',
    titre: 'Dentisterie',
    href: '/services/dentisterie',
    photo: '/dentisterie.jpg',
    couleur: '#7c3aed',
    icon: 'fa-tooth',
    desc: 'Détartrage, extractions, prothèses dentaires et orthodontie pour toute la famille.',
    tag: 'Famille',
  },
  {
    key: 'optometrie',
    titre: 'Optométrie',
    href: '/services/optometrie',
    photo: null,
    couleur: '#059669',
    icon: 'fa-glasses',
    desc: 'Bilan visuel complet, prescription de verres correcteurs et dépistage du glaucome.',
    tag: 'Vision',
  },
  {
    key: 'maternite',
    titre: 'Maternité',
    href: '/services/maternite',
    photo: '/maternite.jpg',
    couleur: '#be185d',
    icon: 'fa-baby',
    desc: 'Suivi prénatal attentionné, accouchement assisté et soins néonatals dans un cadre chaleureux.',
    tag: 'Maman & bébé',
  },
  {
    key: 'physiotherapie',
    titre: 'Physiothérapie',
    href: '/services/physiotherapie',
    photo: '/Physiotherapie.png',
    couleur: '#d97706',
    icon: 'fa-person-walking',
    desc: 'Rééducation fonctionnelle, kinésithérapie et prise en charge des douleurs chroniques.',
    tag: 'Rééducation',
  },
  {
    key: 'sop',
    titre: 'Bloc opératoire',
    href: '/services/sop',
    photo: '/SOP.jpg',
    couleur: '#374151',
    icon: 'fa-scalpel',
    desc: 'Bloc opératoire équipé pour chirurgies programmées et interventions urgentes.',
    tag: 'Chirurgie',
  },
]

const CHIFFRES = [
  { val: '30+', label: 'Médecins spécialistes', icon: 'fa-user-doctor' },
  { val: '9',   label: 'Services sous un toit',  icon: 'fa-hospital' },
  { val: '7j',  label: 'Ouvert toute la semaine', icon: 'fa-calendar-check' },
  { val: '24h', label: 'Urgences & admissions',   icon: 'fa-clock' },
]

export default function ServicesContent() {
  const [rdvOpen, setRdvOpen] = useState(false)

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(150deg, #0a1628 0%, #1641C8 55%, #0d9488 100%)',
        paddingTop: 120, paddingBottom: 0,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* blobs décoratifs */}
        <div style={{ position:'absolute', top:-120, right:-80, width:420, height:420, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:60, left:-60, width:300, height:300, borderRadius:'50%', background:'rgba(13,148,136,0.12)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'30%', left:'38%', width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }} />

        <div style={{ maxWidth:720, margin:'0 auto', padding:'0 5%', textAlign:'center', position:'relative' }}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.88)',
            borderRadius:50, padding:'6px 18px', fontSize:11, fontWeight:700,
            letterSpacing:2, textTransform:'uppercase', marginBottom:22,
            border:'1px solid rgba(255,255,255,0.18)',
          }}>
            <i className="fa-solid fa-hospital" /> Clinique de la Rebecca
          </span>

          <h1 style={{
            color:'white', fontWeight:900,
            fontSize:'clamp(2rem, 4.5vw, 3.2rem)',
            lineHeight:1.1, marginBottom:18,
            letterSpacing:'-0.02em',
          }}>
            Des soins complets,<br />
            <em style={{ fontStyle:'italic', color:'#5eead4', fontFamily:'Georgia, serif' }}>sous un même toit</em>
          </h1>

          <p style={{ color:'rgba(255,255,255,0.70)', fontSize:16, lineHeight:1.75, marginBottom:40, maxWidth:520, margin:'0 auto 40px' }}>
            De la consultation au bloc opératoire, chaque service de la clinique est conçu pour vous éviter des déplacements inutiles et vous offrir une prise en charge continue.
          </p>

          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:56 }}>
            <button
              onClick={() => setRdvOpen(true)}
              style={{
                display:'inline-flex', alignItems:'center', gap:9,
                background:'white', color:'#1641C8', border:'none',
                borderRadius:12, padding:'14px 28px', fontWeight:800, fontSize:15,
                cursor:'pointer', boxShadow:'0 4px 24px rgba(0,0,0,0.18)',
              }}
            >
              <i className="fa-regular fa-calendar-check" /> Prendre rendez-vous
            </button>
            <a
              href="tel:+50938880000"
              style={{
                display:'inline-flex', alignItems:'center', gap:9,
                background:'rgba(255,255,255,0.12)', color:'white',
                border:'1.5px solid rgba(255,255,255,0.3)',
                borderRadius:12, padding:'13px 24px', fontWeight:600, fontSize:15,
                textDecoration:'none',
              }}
            >
              <i className="fa-solid fa-phone" /> +509 3888-0000
            </a>
          </div>
        </div>

        {/* Chiffres clés — chevauchant le hero et le contenu */}
        <div style={{
          maxWidth:860, margin:'0 auto', padding:'0 5%',
          display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:1,
          background:'rgba(255,255,255,0.07)', backdropFilter:'blur(16px)',
          borderRadius:'20px 20px 0 0', border:'1px solid rgba(255,255,255,0.12)',
          borderBottom:'none',
        }}>
          {CHIFFRES.map((c, i) => (
            <div key={c.label} style={{
              padding:'24px 20px', textAlign:'center',
              borderRight: i < CHIFFRES.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}>
              <i className={`fa-solid ${c.icon}`} style={{ color:'#5eead4', fontSize:18, marginBottom:8, display:'block' }} />
              <div style={{ color:'white', fontWeight:900, fontSize:'1.8rem', lineHeight:1, marginBottom:4 }}>{c.val}</div>
              <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11.5, fontWeight:600 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── GRILLE SERVICES ─────────────────────────────────────────────── */}
      <div style={{ background:'#f0f4ff', padding:'0 5% 80px' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>

          <div style={{ paddingTop:56, marginBottom:40 }}>
            <p style={{ color:'#64748b', fontSize:14, fontWeight:600, textAlign:'center', letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Tous nos pôles de soins</p>
            <h2 style={{ textAlign:'center', fontWeight:900, color:'#0f172a', fontSize:'clamp(1.5rem, 2.5vw, 2rem)', marginBottom:0 }}>
              Choisissez le soin dont vous avez besoin
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20 }}>
            {SERVICES.map((s) => (
              <Link key={s.key} href={s.href} style={{ textDecoration:'none', display:'block' }}>
                <div
                  style={{
                    background:'white', borderRadius:20, overflow:'hidden',
                    border:'1.5px solid #e2e8f0', transition:'all 0.24s',
                    cursor:'pointer', height:'100%', display:'flex', flexDirection:'column',
                  }}
                  onMouseEnter={e => {
                    const d = e.currentTarget
                    d.style.transform = 'translateY(-6px)'
                    d.style.boxShadow = `0 20px 48px ${s.couleur}22`
                    d.style.borderColor = s.couleur + '60'
                  }}
                  onMouseLeave={e => {
                    const d = e.currentTarget
                    d.style.transform = 'none'
                    d.style.boxShadow = 'none'
                    d.style.borderColor = '#e2e8f0'
                  }}
                >
                  {/* Visuel */}
                  <div style={{
                    position:'relative', height:172, overflow:'hidden',
                    background:`linear-gradient(135deg, ${s.couleur}22, ${s.couleur}44)`,
                    flexShrink:0,
                  }}>
                    {s.photo ? (
                      <img
                        src={s.photo}
                        alt={s.titre}
                        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.4s' }}
                        onError={e => { e.currentTarget.style.display = 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
                      />
                    ) : (
                      /* Placeholder élégant quand pas de photo */
                      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <i className={`fa-solid ${s.icon}`} style={{ fontSize:52, color:s.couleur, opacity:0.25 }} />
                      </div>
                    )}
                    {/* Fondu bas */}
                    <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${s.couleur}88 0%, transparent 50%)` }} />
                    {/* Badge tag */}
                    <div style={{
                      position:'absolute', top:12, left:12,
                      background:'rgba(255,255,255,0.92)', borderRadius:50,
                      padding:'4px 11px', fontSize:11, fontWeight:700, color:s.couleur,
                    }}>
                      {s.tag}
                    </div>
                    {/* Icône */}
                    <div style={{
                      position:'absolute', bottom:12, right:12,
                      width:36, height:36, borderRadius:10,
                      background:'white', boxShadow:'0 2px 12px rgba(0,0,0,0.14)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <i className={`fa-solid ${s.icon}`} style={{ color:s.couleur, fontSize:15 }} />
                    </div>
                  </div>

                  {/* Contenu */}
                  <div style={{ padding:'18px 20px 22px', flex:1, display:'flex', flexDirection:'column' }}>
                    <h3 style={{ fontWeight:800, color:'#0f172a', fontSize:15, marginBottom:8, lineHeight:1.3 }}>
                      {s.titre}
                    </h3>
                    <p style={{ fontSize:13, color:'#64748b', lineHeight:1.65, margin:0, flex:1 }}>
                      {s.desc}
                    </p>
                    <div style={{
                      marginTop:16, display:'inline-flex', alignItems:'center', gap:6,
                      color:s.couleur, fontSize:13, fontWeight:700,
                    }}>
                      Découvrir <i className="fa-solid fa-arrow-right" style={{ fontSize:11 }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── BANDE CTA ───────────────────────────────────────────────────── */}
      <div style={{
        background:'linear-gradient(135deg, #0f1e3d 0%, #1641C8 60%, #0d9488 100%)',
        padding:'64px 5%', textAlign:'center',
      }}>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>
          Une question ? Une urgence ?
        </p>
        <h2 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.4rem, 2.5vw, 2rem)', marginBottom:16 }}>
          Notre équipe vous accueille 6 jours sur 7
        </h2>
        <p style={{ color:'rgba(255,255,255,0.65)', fontSize:15, lineHeight:1.7, marginBottom:36, maxWidth:480, margin:'0 auto 36px' }}>
          Pas besoin d'attendre. Réservez en ligne en moins de 2 minutes, ou appelez-nous directement.
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <button
            onClick={() => setRdvOpen(true)}
            style={{
              display:'inline-flex', alignItems:'center', gap:9,
              background:'white', color:'#1641C8', border:'none',
              borderRadius:12, padding:'14px 28px', fontWeight:800, fontSize:15, cursor:'pointer',
              boxShadow:'0 4px 24px rgba(0,0,0,0.2)',
            }}
          >
            <i className="fa-regular fa-calendar-check" /> Prendre rendez-vous
          </button>
          <Link href="/consultation" style={{
            display:'inline-flex', alignItems:'center', gap:9,
            background:'rgba(255,255,255,0.12)', color:'white',
            border:'1.5px solid rgba(255,255,255,0.3)',
            borderRadius:12, padding:'13px 24px', fontWeight:600, fontSize:15,
            textDecoration:'none',
          }}>
            <i className="fa-solid fa-video" /> Consultation vidéo
          </Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
