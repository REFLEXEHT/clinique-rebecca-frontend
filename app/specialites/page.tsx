'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLang } from '@/context/LangContext'
import { useAuth } from '@/context/AuthContext'
import { MEDECINS, nomComplet } from '@/lib/medecins'
import { tradSpecialite, TOUS } from '@/lib/specialite-translations'

const SPECIALITES_LIST = ['Tous', ...Array.from(new Set(MEDECINS.map(m => m.specialite))).sort()]

function BtnRdv({ lang }: { lang: string }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const labels: Record<string,string> = { en:'Book', es:'Reservar', zh:'预约', ht:'Rezève', fr:'Prendre RDV' }
  return (
    <button onClick={() => router.push(isAuthenticated ? '/consultation' : '/register?redirect=/consultation')}
      style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:8, padding:'6px 14px', fontWeight:700, fontSize:12, cursor:'pointer' }}>
      {labels[lang] || 'Prendre RDV'}
    </button>
  )
}

function SpecialitesContent() {
  const { lang } = useLang()
  const searchParams = useSearchParams()
  const [specFiltre, setSpecFiltre] = useState('Tous')
  const [search, setSearch] = useState('')
  // Try to fetch updated list from API, fallback to static
  const [medecins, setMedecins] = useState(MEDECINS)

  useEffect(() => {
    const spec = searchParams.get('specialite')
    if (spec) setSpecFiltre(spec)
  }, [searchParams])

  useEffect(() => {
    fetch('https://clinique-rebecca-api.onrender.com/api/specialistes')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge API data with our static data (API is source of truth for name updates)
          const merged = MEDECINS.map(m => {
            const apiMatch = data.find((d: any) =>
              d.nom?.toLowerCase().includes(m.nom.toLowerCase().split(' ')[0]) ||
              d.email === m.email
            )
            return apiMatch ? { ...m, nom: apiMatch.nom?.replace(/^(Dr\.?|Mme\.?|Mr\.?|M\.?)\s*/i, ''), photo: apiMatch.photo } : m
          })
          setMedecins(merged)
        }
      })
      .catch(() => {})
  }, [])

  const filtres = medecins.filter(m => {
    const matchSpec = specFiltre === 'Tous' || m.specialite === specFiltre
    const matchSearch = !search ||
      m.nom.toLowerCase().includes(search.toLowerCase()) ||
      m.specialite.toLowerCase().includes(search.toLowerCase())
    return matchSpec && matchSearch && m.actif
  })

  const titre = { fr:'Nos spécialistes', ht:'Espesyalis nou yo', en:'Our specialists', es:'Nuestros especialistas', zh:'我们的专科医生' }[lang] || 'Nos spécialistes'

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Navbar variant="public"/>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8,#0d9488)', padding:'56px 20px 40px', textAlign:'center' }}>
        <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.8rem,4vw,2.6rem)', margin:'0 0 12px' }}>{titre}</h1>
        <p style={{ color:'rgba(255,255,255,0.75)', margin:'0 auto 24px', maxWidth:500, fontSize:15 }}>
          {medecins.length} {lang==='en'?'professionals at your service':lang==='ht'?'pwofesyonèl nan sèvis ou':lang==='es'?'profesionales a su servicio':lang==='zh'?'位专业人员为您服务':'professionnels à votre service'}
        </p>
        <input placeholder={`🔍 ${lang==='en'?'Search doctor or specialty...':lang==='ht'?'Chèche doktè...':lang==='es'?'Buscar médico...':lang==='zh'?'搜索医生...':'Rechercher un médecin ou une spécialité...'}`}
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', maxWidth:440, padding:'13px 18px', borderRadius:12, border:'none', fontSize:15, outline:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}/>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px' }}>

        {/* Filtres spécialités */}
        <div style={{ marginBottom:24, display:'flex', gap:8, flexWrap:'wrap' }}>
          {SPECIALITES_LIST.map(s => (
            <button key={s} onClick={() => setSpecFiltre(s)} style={{
              padding:'7px 16px', borderRadius:50, border:'none', cursor:'pointer',
              fontWeight:600, fontSize:13, whiteSpace:'nowrap',
              background: specFiltre===s ? 'linear-gradient(135deg,#1641C8,#0d9488)' : 'white',
              color: specFiltre===s ? 'white' : '#64748b',
              boxShadow: specFiltre===s ? '0 4px 12px rgba(22,65,200,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
              transition:'all 0.2s'
            }}>
              {s === 'Tous' ? (TOUS[lang as keyof typeof TOUS] || 'Tous') : tradSpecialite(s, lang)}
            </button>
          ))}
        </div>

        {/* Résultat filtre */}
        {specFiltre !== 'Tous' && (
          <div style={{ background:'#eff6ff', borderRadius:10, padding:'10px 16px', marginBottom:20, fontSize:14, color:'#1641C8', fontWeight:600, display:'flex', alignItems:'center', gap:10 }}>
            {filtres.length} médecin{filtres.length>1?'s':''} en <strong>{specFiltre}</strong>
            <button onClick={() => setSpecFiltre('Tous')} style={{ marginLeft:4, background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:12 }}>✕</button>
          </div>
        )}

        {/* Grille médecins */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {filtres.map(m => (
            <div key={m.id} style={{ background:'white', borderRadius:16, padding:20, border:'1px solid #e2e8f0', display:'flex', gap:14, alignItems:'flex-start', transition:'all 0.2s' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(22,65,200,0.10)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.boxShadow='none'}>
              {/* Photo ou avatar */}
              <div style={{ width:52, height:52, borderRadius:14, overflow:'hidden', flexShrink:0, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(13,148,136,0.25)' }}>
                {m.photo
                  ? <img src={m.photo} alt={m.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <span style={{ fontSize:24 }}>{m.emoji}</span>
                }
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:14, color:'#0f172a', marginBottom:2 }}>{nomComplet(m)}</div>
                <div style={{ color:'#0d9488', fontSize:12, fontWeight:600, marginBottom:4 }}>{tradSpecialite(m.specialite, lang)}</div>
                <div style={{ color:'#94a3b8', fontSize:11, marginBottom:10 }}>🕐 {
                  lang==='en' ? m.disponibilites.replace('Lun','Mon').replace('Sam','Sat').replace('Ven','Fri').replace('07h','7am').replace('17h','5pm') :
                  lang==='es' ? m.disponibilites.replace('Lun','Lun').replace('Sam','Sáb') :
                  m.disponibilites
                }</div>
                <div style={{ display:'flex', gap:6 }}>
                  <Link href={`/specialistes/${m.id}`} style={{ background:'#f0fdf4', color:'#0d9488', textDecoration:'none', borderRadius:8, padding:'5px 10px', fontWeight:600, fontSize:11, border:'1px solid #a7f3d0' }}>
                    👤 Profil
                  </Link>
                  <BtnRdv lang={lang}/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtres.length === 0 && (
          <div style={{ textAlign:'center', padding:48, color:'#94a3b8' }}>
            <p>{lang==='en'?'No results':lang==='ht'?'Pa gen rezilta':lang==='es'?'Sin resultados':'Aucun résultat'}</p>
            <button onClick={() => { setSearch(''); setSpecFiltre('Tous') }} style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:10, padding:'10px 20px', cursor:'pointer', fontWeight:600 }}>{lang==='en'?'Reset':lang==='ht'?'Reyajiste':lang==='es'?'Restablecer':'Réinitialiser'}</button>
          </div>
        )}

        {/* CTA */}
        <div style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', borderRadius:20, padding:32, textAlign:'center', marginTop:40 }}>
          <h3 style={{ color:'white', fontWeight:800, fontSize:'1.2rem', margin:'0 0 10px' }}>
            {lang==='en'?'Book an appointment':lang==='ht'?'Pran yon randevou':lang==='es'?'Reservar una cita':lang==='zh'?'预约挂号':'Prendre rendez-vous'}
          </h3>
          <Link href="/consultation" style={{ background:'white', color:'#1641C8', textDecoration:'none', borderRadius:12, padding:'12px 28px', fontWeight:700, fontSize:15, display:'inline-block' }}>
            {lang==='en'?'Consult now':lang==='ht'?'Konsulte kounye a':lang==='es'?'Consultar ahora':lang==='zh'?'立即预约':'Consulter maintenant'}
          </Link>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

export default function SpecialitesPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #1641C8',borderTopColor:'transparent',animation:'spin 1s linear infinite'}}/></div>}>
      <SpecialitesContent/>
    </Suspense>
  )
}
