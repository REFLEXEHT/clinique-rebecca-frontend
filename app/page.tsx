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
              {n:'15',  k:'home.stat3'},{n:'6j/7',k:'home.stat4'}
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
      <section style={{ padding:'72px 5%', background:'#f8fafc' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36 }}>
            <div>
              <div style={{ color:'#1641C8', fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>{t('home.pourquoi')}</div>
              <h2 style={{ fontWeight:900, fontSize:'clamp(1.5rem,3vw,2rem)', color:'#0f172a', margin:0 }}>{t('home.nosServices')}</h2>
            </div>
            <Link href="/services" style={{ color:'#1641C8', fontWeight:700, fontSize:14, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
              {t('home.voirTout')} <i className="fa-solid fa-arrow-right" style={{ fontSize:11 }} />
            </Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
            {SERVICES_KEYS.map(s => (
              <Link key={s.key} href={s.link} style={{ textDecoration:'none' }}>
                <div style={{ background:'white', borderRadius:16, padding:'20px 16px', border:'1px solid #e2e8f0', textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(-4px)';el.style.boxShadow='0 8px 24px rgba(22,65,200,0.12)'}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(0)';el.style.boxShadow='none'}}>
                  <div style={{ width:48, height:48, borderRadius:12, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color:'#1641C8', fontSize:20 }} />
                  </div>
                  <div style={{ fontWeight:700, color:'#0f172a', fontSize:13, lineHeight:1.3 }}>{t(s.key)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POURQUOI NOUS ─────────────────────────────────────────── */}
      <section style={{ padding:'72px 5%', background:'white' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <div style={{ color:'#1641C8', fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>{t('home.pourquoi')}</div>
            <h2 style={{ fontWeight:900, fontSize:'clamp(1.5rem,3vw,2rem)', color:'#0f172a', margin:'0 0 16px' }}>{t('home.refTitle')}</h2>
            <p style={{ color:'#64748b', fontSize:15, lineHeight:1.8, margin:'0 0 28px' }}>{t('home.refDesc')}</p>
            {[
              { icon:'fa-user-doctor',   tk:'home.feat4Title', dk:'home.feat4Desc' },
              { icon:'fa-flask-vial',    tk:'home.feat5Title', dk:'home.feat5Desc' },
              { icon:'fa-shield-halved', tk:'home.feat6Title', dk:'home.feat6Desc' },
            ].map(f => (
              <div key={f.tk} style={{ display:'flex', gap:14, marginBottom:20 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className={`fa-solid ${f.icon}`} style={{ color:'#1641C8', fontSize:18 }} />
                </div>
                <div>
                  <div style={{ fontWeight:700, color:'#0f172a', fontSize:14, marginBottom:4 }}>{t(f.tk)}</div>
                  <div style={{ color:'#64748b', fontSize:13 }}>{t(f.dk)}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

          </div>
        </div>
      </section>

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
      icon: '🏆',
      fr: { titre: '30+ médecins certifiés', msg: 'Une équipe de spécialistes formés aux meilleures universités, dévoués à votre santé.' },
      ht: { titre: '30+ doktè sètifye', msg: 'Yon ekip espesyalis ki fòme nan pi bon inivèsite yo, dedye pou sante ou.' },
      en: { titre: '30+ certified doctors', msg: 'A team of specialists trained at the best universities, dedicated to your health.' },
      es: { titre: '30+ médicos certificados', msg: 'Un equipo de especialistas formados en las mejores universidades, dedicados a su salud.' },
      zh: { titre: '30+位认证医生', msg: '由顶尖大学培训的专科医生团队，专注于您的健康。' },
    },
    {
      icon: '⚡',
      fr: { titre: 'Résultats labo en 24-48h', msg: 'Vos résultats d'analyses vous sont envoyés directement sur WhatsApp. Rapide, fiable, sécurisé.' },
      ht: { titre: 'Rezilta labo nan 24-48h', msg: 'Rezilta analiz ou voye dirèkteman sou WhatsApp. Rapid, fyab, sekirize.' },
      en: { titre: 'Lab results in 24-48h', msg: 'Your test results are sent directly to your WhatsApp. Fast, reliable, secure.' },
      es: { titre: 'Resultados en 24-48h', msg: 'Sus resultados se envían directamente a su WhatsApp. Rápido, fiable, seguro.' },
      zh: { titre: '24-48小时内出结果', msg: '检验结果直接发送到您的WhatsApp。快速、可靠、安全。' },
    },
    {
      icon: '🔒',
      fr: { titre: 'Confidentialité garantie', msg: 'Votre dossier médical est 100% confidentiel. Seuls vous et votre médecin y avez accès.' },
      ht: { titre: 'Konfidansyalite garanti', msg: 'Dosye medikal ou 100% konfidansyèl. Se sèlman ou ak doktè ou ki gen aksè a li.' },
      en: { titre: 'Guaranteed confidentiality', msg: 'Your medical record is 100% confidential. Only you and your doctor have access.' },
      es: { titre: 'Confidencialidad garantizada', msg: 'Su expediente médico es 100% confidencial. Solo usted y su médico tienen acceso.' },
      zh: { titre: '保密性保证', msg: '您的医疗记录100%保密。只有您和您的医生才能访问。' },
    },
    {
      icon: '📍',
      fr: { titre: 'Tout sous un même toit', msg: 'Clinique, labo, pharmacie, dentiste, physiothérapie — une visite suffit pour tout régler.' },
      ht: { titre: 'Tout anba yon sèl tèt', msg: 'Klinik, labo, famasi, dantis, fizeyoterapi — yon vizit sifi pou tout ranje.' },
      en: { titre: 'Everything under one roof', msg: 'Clinic, lab, pharmacy, dentist, physiotherapy — one visit handles everything.' },
      es: { titre: 'Todo bajo un mismo techo', msg: 'Clínica, laboratorio, farmacia, dentista, fisioterapia — una visita lo resuelve todo.' },
      zh: { titre: '一站式服务', msg: '诊所、实验室、药房、牙科、物理治疗——一次就诊解决所有问题。' },
    },
    {
      icon: '📱',
      fr: { titre: 'Rendez-vous en ligne 24h/24', msg: 'Prenez rendez-vous depuis votre téléphone à toute heure. Confirmation immédiate.' },
      ht: { titre: 'Randevou sou entènèt 24h/24', msg: 'Pran randevou depi telefòn ou nenpòt lè. Konfirmasyon imedyat.' },
      en: { titre: 'Online booking 24/7', msg: 'Book appointments from your phone anytime. Immediate confirmation.' },
      es: { titre: 'Citas en línea 24/7', msg: 'Reserve citas desde su teléfono en cualquier momento. Confirmación inmediata.' },
      zh: { titre: '24/7在线预约', msg: '随时通过手机预约。即时确认。' },
    },
    {
      icon: '💚',
      fr: { titre: 'Des soins accessibles', msg: 'Des tarifs transparents et équitables. La qualité médicale ne doit pas être un luxe.' },
      ht: { titre: 'Swen aksesib', msg: 'Pri transparan ak ekitab. Kalite medikal pa ta dwe yon liks.' },
      en: { titre: 'Accessible care', msg: 'Transparent and fair pricing. Quality medical care should not be a luxury.' },
      es: { titre: 'Atención accesible', msg: 'Precios transparentes y justos. La calidad médica no debe ser un lujo.' },
      zh: { titre: '普惠医疗', msg: '透明公平的价格。优质医疗不应是奢侈品。' },
    },
  ]

  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % RAISONS.length), 4000)
    return () => clearInterval(t)
  }, [RAISONS.length])

  const r = RAISONS[idx]
  const txt = r[lang as 'fr'] || r.fr

  return (
    <section style={{ padding:'72px 5%', background:'white' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        {/* Titre */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ color:'#1641C8', fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
            {lang === 'en' ? 'Why choose us' : lang === 'es' ? 'Por qué elegirnos' : lang === 'zh' ? '为什么选择我们' : lang === 'ht' ? 'Poukwa chwazi nou' : 'Pourquoi nous choisir'}
          </div>
          <h2 style={{ fontWeight:900, fontSize:'clamp(1.5rem,3vw,2rem)', color:'#0f172a', margin:0 }}>
            {lang === 'en' ? 'What makes us different' : lang === 'es' ? 'Lo que nos hace diferentes' : lang === 'zh' ? '我们的与众不同' : lang === 'ht' ? 'Sa ki fè nou diferan' : 'Ce qui nous distingue'}
          </h2>
        </div>

        {/* Layout: carrousel gauche + stats droite */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'center' }}>

          {/* Carrousel messages catchy */}
          <div>
            <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8)', borderRadius:24, padding:40, minHeight:220, position:'relative', overflow:'hidden' }}>
              {/* Cercles déco */}
              <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
              <div style={{ position:'absolute', bottom:-30, left:-30, width:120, height:120, borderRadius:'50%', background:'rgba(13,148,136,0.15)' }} />
              {/* Contenu */}
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ fontSize:48, marginBottom:16 }}>{r.icon}</div>
                <h3 style={{ color:'white', fontWeight:900, fontSize:'1.4rem', margin:'0 0 12px', lineHeight:1.2 }}>{txt.titre}</h3>
                <p style={{ color:'rgba(255,255,255,0.8)', fontSize:15, lineHeight:1.7, margin:'0 0 24px' }}>{txt.msg}</p>
                {/* Indicateurs */}
                <div style={{ display:'flex', gap:6 }}>
                  {RAISONS.map((_,i) => (
                    <button key={i} onClick={() => setIdx(i)} style={{
                      width: i === idx ? 28 : 8, height:8, borderRadius:4, border:'none',
                      background: i === idx ? 'white' : 'rgba(255,255,255,0.3)',
                      cursor:'pointer', transition:'all 0.3s', padding:0
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats chiffrées */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              { n:'30+',    icon:'fa-user-doctor',   label:{ fr:'Médecins spécialistes', en:'Specialist doctors', ht:'Doktè espesyalis', es:'Médicos especialistas', zh:'专科医生' } },
              { n:'165',    icon:'fa-flask-vial',    label:{ fr:'Analyses disponibles',  en:'Tests available',     ht:'Analiz disponib',    es:'Análisis disponibles',  zh:'可用检验' } },
              { n:'1 200+', icon:'fa-star',          label:{ fr:'Patients satisfaits',   en:'Satisfied patients',  ht:'Pasyan satisfè',     es:'Pacientes satisfechos', zh:'满意患者' } },
              { n:'6j/7',   icon:'fa-clock',         label:{ fr:'Jours d'ouverture',    en:'Days open',           ht:'Jou ouvri',          es:'Días abiertos',         zh:'开放天数' } },
            ].map((s,i) => (
              <div key={i} style={{ background:'#f8fafc', borderRadius:18, padding:24, border:'1px solid #e2e8f0', textAlign:'center' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                  <i className={`fa-solid ${s.icon}`} style={{ color:'#1641C8', fontSize:18 }} />
                </div>
                <div style={{ fontWeight:900, fontSize:'1.8rem', color:'#0f172a', marginBottom:4 }}>{s.n}</div>
                <div style={{ color:'#64748b', fontSize:13, lineHeight:1.3 }}>{(s.label as any)[lang] || s.label.fr}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
