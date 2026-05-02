'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import AiChatWidget from '@/components/ui/AiChatWidget'
import { horairesApi } from '@/lib/api'
import { useLang } from '@/context/LangContext'

const SERVICES_KEYS = [
  { key:'svc.cliExt',  icon:'fa-stethoscope',   color:'#1641C8', bg:'#eff6ff', link:'/services/clinique-externe' },
  { key:'svc.labo',    icon:'fa-flask-vial',     color:'#0d9488', bg:'#f0fdfa', link:'/services/laboratoire'      },
  { key:'svc.pharma',  icon:'fa-pills',          color:'#7c3aed', bg:'#f5f3ff', link:'/services/pharmacie'        },
  { key:'svc.dent',    icon:'fa-tooth',          color:'#0d9488', bg:'#f0fdfa', link:'/services/dentisterie'      },
  { key:'svc.mat',     icon:'fa-baby',           color:'#ec4899', bg:'#fdf2f8', link:'/services/maternite'        },
  { key:'svc.sop',     icon:'fa-scalpel',        color:'#475569', bg:'#f8fafc', link:'/services/salle-sop'        },
  { key:'svc.physio',  icon:'fa-person-walking', color:'#d97706', bg:'#fffbeb', link:'/services/physiotherapie'   },
  { key:'svc.opto',    icon:'fa-glasses',        color:'#dc2626', bg:'#fef2f2', link:'/services/optometrie'       },
  { key:'svc.gestes',  icon:'fa-syringe',        color:'#f59e0b', bg:'#fffbeb', link:'/services/gestes-medicaux'  },
  { key:'svc.hospit',  icon:'fa-bed-pulse',      color:'#0369a1', bg:'#f0f9ff', link:'/services/hospitalisation'  },
]

export default function HomePage() {
  const { t } = useLang()
  const [rdvOpen,  setRdvOpen]  = useState(false)
  const [horaires, setHoraires] = useState<any[]>([])

  useEffect(() => {
    horairesApi.list().then(r => setHoraires(r.data || [])).catch(() => {})
  }, [])

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ── HERO SPLIT ────────────────────────────────────────────── */}
      <section style={{ minHeight:'calc(100vh - 72px)', display:'grid', gridTemplateColumns:'1fr 1fr' }}>
        {/* Gauche */}
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 60px', background:'white' }}>
          {/* Badge horaires */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:50, padding:'8px 16px', marginBottom:32, alignSelf:'flex-start' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="fa-regular fa-clock" style={{ color:'#1641C8', fontSize:14 }} />
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{t('nav.ouvert')}</div>
              <div style={{ fontSize:12, color:'#64748b' }}>{t('nav.horaires')}</div>
            </div>
          </div>

          <h1 style={{ fontWeight:900, fontSize:'clamp(2rem,4vw,3rem)', color:'#0f172a', lineHeight:1.15, margin:'0 0 16px' }}>
            {t('home.bienvenue')}<br />
            <em style={{ fontStyle:'italic', color:'#1641C8', fontFamily:'Georgia, serif' }}>{t('home.nom')}</em>
          </h1>
          <p style={{ color:'#64748b', fontSize:16, margin:'0 0 20px' }}>{t('home.tagline')}</p>
          <div style={{ width:48, height:3, background:'linear-gradient(90deg,#1641C8,#0d9488)', borderRadius:2, marginBottom:24 }} />

          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:36 }}>
            {(['home.feat1','home.feat2','home.feat3'] as const).map(k => (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:'#0d9488', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className="fa-solid fa-check" style={{ color:'white', fontSize:11 }} />
                </div>
                <span style={{ color:'#374151', fontSize:15 }}>{t(k)}</span>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:40 }}>
            <button onClick={() => setRdvOpen(true)} style={{ background:'#1641C8', color:'white', border:'none', borderRadius:10, padding:'14px 28px', fontWeight:700, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
              <i className="fa-solid fa-circle-play" /> {t('home.btnRdv')}
            </button>
            <Link href="/specialites" style={{ background:'white', color:'#1641C8', border:'2px solid #1641C8', borderRadius:10, padding:'13px 24px', fontWeight:700, fontSize:15, textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
              {t('home.btnSpec')}
            </Link>
          </div>

          <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
            {([
              {n:'30+', k:'home.stat1'},{n:'10', k:'home.stat2'},
              {n:'15',  k:'home.stat3'},{n:'7j/7',k:'home.stat4'}
            ] as const).map(s => (
              <div key={s.k}>
                <div style={{ fontWeight:900, fontSize:'1.7rem', color:'#1641C8', lineHeight:1 }}>{s.n}</div>
                <div style={{ color:'#94a3b8', fontSize:13, marginTop:4, textTransform:'uppercase', letterSpacing:0.5 }}>{t(s.k)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Droite — photo */}
        <div style={{ position:'relative', overflow:'hidden' }}>
          <img src="/services/accueil.png" alt="Clinique de la Rebecca"
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(22,65,200,0.06),rgba(13,148,136,0.06))' }} />
          <div style={{ position:'absolute', bottom:40, left:32, background:'white', borderRadius:16, padding:'14px 18px', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="fa-solid fa-star" style={{ color:'white', fontSize:18 }} />
            </div>
            <div>
              <div style={{ fontWeight:900, color:'#0f172a', fontSize:16 }}>4.9 / 5</div>
              <div style={{ color:'#64748b', fontSize:12 }}>+1 200 {t('home.rating')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOS SERVICES ─────────────────────────────────────────── */}

      {/* ── POURQUOI ── */}
      <PourquoiSection />

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8,#0d9488)', padding:'72px 5%', textAlign:'center' }}>
        <h2 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.4rem,3vw,2rem)', margin:'0 0 12px' }}>{t('home.ctaTitle')}</h2>
        <p style={{ color:'rgba(255,255,255,0.75)', fontSize:15, margin:'0 0 32px' }}>{t('home.ctaDesc')}</p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => setRdvOpen(true)} style={{ background:'white', color:'#1641C8', border:'none', borderRadius:12, padding:'14px 30px', fontWeight:800, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
            <i className="fa-solid fa-calendar-check" /> {t('home.btnRdv')}
          </button>
          <a href="tel:+50948585757" style={{ background:'rgba(255,255,255,0.12)', color:'white', textDecoration:'none', borderRadius:12, padding:'14px 24px', fontWeight:700, fontSize:15, display:'flex', alignItems:'center', gap:8, border:'1px solid rgba(255,255,255,0.2)' }}>
            <i className="fa-solid fa-phone" /> (509) 4858-5757
          </a>
        </div>
      </section>

      <AiChatWidget />
      <Footer />
    </>
  )
}

// ── Composant Pourquoi Nous Choisir ──────────────────────────────────────
function PourquoiSection() {
  const { lang } = useLang()
  const [idx, setIdx] = useState(0)

  const RAISONS = [
    {
      icon: '🏠',
      img: '/services/accueil.png',
      fr: { titre: 'Tout sous un même toit', msg: 'Clinique, labo, pharmacie, physio et hospitalisation — tout en un seul lieu.' },
      ht: { titre: 'Tout anba yon sèl tèt', msg: 'Klinik, labo, famasi, fizeyoterapi — tout nan yon sèl kote.' },
      en: { titre: 'Everything under one roof', msg: 'Clinic, lab, pharmacy, physio — all in one place.' },
      es: { titre: 'Todo bajo un mismo techo', msg: 'Clínica, laboratorio, farmacia, fisio — todo en un solo lugar.' },
      zh: { titre: '一站式医疗', msg: '诊所、实验室、药房、康复——全在一处。' },
    },
    {
      icon: '💛',
      img: '/pourquoi/ecoute.png',
      fr: { titre: 'À votre écoute, toujours', msg: 'Chaque patient accueilli avec bienveillance. Un suivi personnalisé et rassurant à chaque visite.' },
      ht: { titre: 'Nou koute ou, toujou', msg: 'Chak pasyan resevwa ak kè, swivi pèsonalize ak rekonfortan.' },
      en: { titre: 'Always here for you', msg: 'Every patient welcomed warmly. Personalized, reassuring care at every visit.' },
      es: { titre: 'Siempre a su escucha', msg: 'Cada paciente acogido con calidez. Seguimiento personalizado en cada visita.' },
      zh: { titre: '始终倾听您', msg: '每位患者都受到热情接待，每次就诊均提供个性化护理。' },
    },
    {
      icon: '👥',
      img: '/pourquoi/equipe.png',
      fr: { titre: 'Équipe pluridisciplinaire', msg: 'Médecins, infirmiers, physios et techniciens — ensemble pour votre santé.' },
      ht: { titre: 'Ekip konplè pou ou', msg: 'Doktè, enfimyè, fizeyoterapis — ansanm pou sante ou.' },
      en: { titre: 'Full multidisciplinary team', msg: 'Doctors, nurses, physios and techs — together for your health.' },
      es: { titre: 'Equipo multidisciplinar', msg: 'Médicos, enfermeros, fisios y técnicos — juntos por su salud.' },
      zh: { titre: '多学科协作团队', msg: '医生、护士、物理治疗师、技术员——共同守护您的健康。' },
    },
    {
      icon: '✨',
      img: '/pourquoi/batiment.png',
      fr: { titre: 'Espaces modernes & propres', msg: 'Salles lumineuses, équipements de qualité, environnement professionnel et apaisant.' },
      ht: { titre: 'Espas modèn ak pwòp', msg: 'Sal liminyè, ekipman kalite, anviwònman pwofesyonèl ak kalm.' },
      en: { titre: 'Modern & clean spaces', msg: 'Bright rooms, quality equipment, professional and calming environment.' },
      es: { titre: 'Espacios modernos y limpios', msg: 'Salas luminosas, equipos de calidad, ambiente profesional y tranquilo.' },
      zh: { titre: '现代整洁的环境', msg: '明亮的房间、优质设备，专业且令人安心的环境。' },
    },
    {
      icon: '🤝',
      img: '/pourquoi/engage.png',
      fr: { titre: 'Engagés pour la communauté', msg: 'Prévention, éducation sanitaire, soutien local — pour une meilleure santé publique.' },
      ht: { titre: 'Angaje pou kominote a', msg: 'Prevansyon, edikasyon sante, sipò lokal — pou yon pi bon sante piblik.' },
      en: { titre: 'Committed to the community', msg: 'Prevention, health education, local support — for better public health.' },
      es: { titre: 'Comprometidos con la comunidad', msg: 'Prevención, educación sanitaria, apoyo local — por una mejor salud pública.' },
      zh: { titre: '服务社区', msg: '预防、健康教育、本地支持——促进公共健康。' },
    },
  ]

  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % RAISONS.length), 4000)
    return () => clearInterval(t)
  }, [RAISONS.length])

  const r = RAISONS[idx]
  const txt = r[lang as 'fr'] || r.fr

  return (
    <section style={{ padding:'88px 5% 96px', background:'white' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        {/* Titre */}
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <div style={{ color:'#1641C8', fontWeight:700, fontSize:14, textTransform:'uppercase', letterSpacing:3, marginBottom:14 }}>
            {lang==='en'?'Why choose us':lang==='ht'?'Poukwa chwazi nou':lang==='es'?'Por qué elegirnos':lang==='zh'?'为什么选择我们':'Pourquoi nous choisir'}
          </div>
          <h2 style={{ fontWeight:900, fontSize:'clamp(1.8rem,3.5vw,2.6rem)', color:'#0f172a', margin:0, lineHeight:1.2 }}>
            {lang==='en'?'What sets us apart':lang==='ht'?'Sa ki fè nou diferan':lang==='es'?'Lo que nos distingue':lang==='zh'?'我们的特色':'Ce qui nous distingue'}
          </h2>
        </div>

        {/* Carrousel principal */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:32, alignItems:'center', marginBottom:48 }}>
          {/* Navigation */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {RAISONS.map((r, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                display:'flex', alignItems:'center', gap:14, padding:'14px 18px',
                borderRadius:14, border:'none', cursor:'pointer', textAlign:'left',
                background: i===idx ? 'linear-gradient(135deg,#1641C8,#0d9488)' : '#f8fafc',
                transition:'all 0.25s'
              }}>
                <span style={{ width:40, height:40, borderRadius:10, flexShrink:0, overflow:'hidden', border: i===idx?'2px solid rgba(255,255,255,0.4)':'2px solid #e2e8f0' }}>
                  <img src={r.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                </span>
                <span style={{ fontWeight:700, fontSize:14, color: i===idx?'white':'#374151' }}>
                  {(r as any)[lang]?.titre || r.fr.titre}
                </span>
              </button>
            ))}
          </div>

          {/* Contenu actif */}
          <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8)', borderRadius:24, padding:'48px 44px', minHeight:280 }}>
            <div style={{ width:'100%', height:160, borderRadius:14, overflow:'hidden', marginBottom:20, position:'relative' }}>
                <img src={RAISONS[idx].img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }}/>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(10,20,60,0.6) 100%)' }}/>
              </div>
            <h3 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.4rem,2.5vw,2rem)', margin:'0 0 16px', lineHeight:1.2 }}>
              {(RAISONS[idx] as any)[lang]?.titre || RAISONS[idx].fr.titre}
            </h3>
            <p style={{ color:'rgba(255,255,255,0.85)', fontSize:16, lineHeight:1.9, margin:0 }}>
              {(RAISONS[idx] as any)[lang]?.msg || RAISONS[idx].fr.msg}
            </p>
          </div>
        </div>

        {/* Dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
          {RAISONS.map((_,i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: i===idx?32:10, height:10, borderRadius:5,
              background: i===idx?'#1641C8':'#e2e8f0',
              border:'none', cursor:'pointer', padding:0, transition:'all 0.3s'
            }}/>
          ))}
        </div>
      </div>
    </section>
  )
}
