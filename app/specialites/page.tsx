'use client'
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { specialistesApi } from '@/lib/api'
import { useLang } from '@/context/LangContext'

const MEDECINS_FALLBACK = [
  { nom:'Dr Vania Louissaint',      specialite:'Médecine interne',              emoji:'🩺' },
  { nom:'Dr Christelle Philippe',   specialite:'Médecine interne',              emoji:'🩺' },
  { nom:'Dr Eliode Pierre',         specialite:'Gynécologie',                   emoji:'👩‍⚕️' },
  { nom:'Dr Delvalès Doccy',        specialite:'Gynécologie',                   emoji:'👩‍⚕️' },
  { nom:'Dr Bob-Hallen Treisma',    specialite:'Gynécologie',                   emoji:'👩‍⚕️' },
  { nom:'Dr Jean Daniel',           specialite:'Gynécologie',                   emoji:'👩‍⚕️' },
  { nom:'Dr Enold Lubin',           specialite:'Gynécologie',                   emoji:'👩‍⚕️' },
  { nom:'Dr Dauphin Roolandro',     specialite:'Gynécologie',                   emoji:'👩‍⚕️' },
  { nom:'Dr Mikerline Charles',     specialite:'Pédiatrie',                     emoji:'👶' },
  { nom:'Dr Duvivier',              specialite:'Pédiatrie',                     emoji:'👶' },
  { nom:'Dr Rose Stephanie Joseph', specialite:'Pédiatrie',                     emoji:'👶' },
  { nom:'Dr Lemoine Lafleur',       specialite:'Neurologie',                    emoji:'🧠' },
  { nom:'Dr Bernard Pierre',        specialite:'Neurochirurgie',                emoji:'🧠' },
  { nom:'Dr Peterly PHILIPPE',      specialite:'Orthopédie',                    emoji:'🦴' },
  { nom:'Dr Brunot Simon',          specialite:'Orthopédie',                    emoji:'🦴' },
  { nom:'Dr Clifford Edouard',      specialite:'Orthopédie',                    emoji:'🦴' },
  { nom:'Dr Auguste Samy',          specialite:'Orthopédie',                    emoji:'🦴' },
  { nom:'Dr Wisly Joseph',          specialite:'Chirurgie Générale',            emoji:'🔬' },
  { nom:'Dr Jean Berldine',         specialite:'Chirurgie Générale',            emoji:'🔬' },
  { nom:'Dr Jeff Tesnor',           specialite:'Chirurgie Générale',            emoji:'🔬' },
  { nom:'Dr Jenh Robert',           specialite:'Chirurgie Pédiatrique',         emoji:'👶' },
  { nom:'Dr Sophie Beaujour',       specialite:'Dermatologie',                  emoji:'🧬' },
  { nom:'Dr Kaina Michaud',         specialite:'ORL',                           emoji:'👂' },
  { nom:'Dr Pierre Billy Lemaus',   specialite:'Urologie',                      emoji:'🩺' },
  { nom:'Dr Marie Kerline Pierre',  specialite:'Anesthésiologie / Réanimation', emoji:'💉' },
  { nom:'Dr Wolf Charlie Cajuste',  specialite:'Dentisterie',                   emoji:'🦷' },
  { nom:'Mme Fredia Fleurival',     specialite:'Physiothérapie',                emoji:'🏥' },
  { nom:'M. Gilles Abraham',        specialite:'Optométrie',                    emoji:'👁️' },
  { nom:'Mr Reginald Volcy',        specialite:'Psychologie',                   emoji:'🧬' },
  { nom:'Dr Jean Luc Mathurin',     specialite:'Radiologie',                    emoji:'🩻' },
]

const SPECIALITES_LIST = [
  'Tous','Médecine interne','Gynécologie','Pédiatrie','Neurologie','Neurochirurgie',
  'Orthopédie','Chirurgie Générale','Chirurgie Pédiatrique','Dermatologie','ORL',
  'Urologie','Anesthésiologie / Réanimation','Dentisterie','Physiothérapie',
  'Optométrie','Psychologie','Radiologie',
]


function BtnRdv({ lang }: { lang: string }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const labels: Record<string,string> = { en:'Book', es:'Reservar', zh:'预约', ht:'Rezève', fr:'Prendre RDV' }
  
  const handleClick = () => {
    if (isAuthenticated) {
      router.push('/consultation')
    } else {
      router.push('/register?redirect=/consultation')
    }
  }
  
  return (
    <button onClick={handleClick} style={{ background:'#eff6ff', color:'#1641C8', border:'none', borderRadius:8, padding:'5px 12px', fontWeight:700, fontSize:12, cursor:'pointer' }}>
      {labels[lang] || 'Prendre RDV'}
    </button>
  )
}

function SpecialitesContent() {
  const { lang } = useLang()
  const searchParams = useSearchParams()
  const [medecins, setMedecins] = useState<any[]>(MEDECINS_FALLBACK)
  const [specFiltre, setSpecFiltre] = useState('Tous')
  const [search, setSearch] = useState('')

  // Read URL param ?specialite=xxx on load
  useEffect(() => {
    const spec = searchParams.get('specialite')
    if (spec) {
      setSpecFiltre(spec)
    }
  }, [searchParams])

  useEffect(() => {
    specialistesApi.list()
      .then(r => { if (r.data?.length > 0) setMedecins(r.data) })
      .catch(() => {})
  }, [])

  const filtres = medecins.filter(m => {
    const matchSpec = specFiltre === 'Tous' || m.specialite === specFiltre
    const matchSearch = !search ||
      m.nom.toLowerCase().includes(search.toLowerCase()) ||
      m.specialite.toLowerCase().includes(search.toLowerCase())
    return matchSpec && matchSearch
  })

  const titre = {
    fr:'Nos spécialistes', ht:'Espesyalis nou yo',
    en:'Our specialists', es:'Nuestros especialistas', zh:'我们的专科医生'
  }[lang] || 'Nos spécialistes'

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Navbar variant="public" />

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8,#0d9488)', padding:'56px 20px 40px', textAlign:'center' }}>
        <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.8rem,4vw,2.6rem)', margin:'0 0 12px' }}>
          {titre}
        </h1>
        <p style={{ color:'rgba(255,255,255,0.75)', margin:'0 auto 24px', maxWidth:500, fontSize:15 }}>
          {medecins.length} {lang === 'en' ? 'professionals at your service' : lang === 'es' ? 'profesionales a su servicio' : lang === 'zh' ? '位专业人员为您服务' : lang === 'ht' ? 'pwofesyonèl nan sèvis ou' : 'professionnels à votre service'}
        </p>
        {/* Recherche */}
        <input
          placeholder={lang === 'en' ? '🔍 Search a doctor or specialty...' : lang === 'es' ? '🔍 Buscar un médico o especialidad...' : lang === 'zh' ? '🔍 搜索医生或专科...' : lang === 'ht' ? '🔍 Chèche doktè oswa espesyalite...' : '🔍 Rechercher un médecin ou une spécialité...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', maxWidth:440, padding:'13px 18px', borderRadius:12, border:'none', fontSize:15, outline:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}
        />
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px' }}>

        {/* Filtre par spécialité */}
        <div style={{ marginBottom:24, overflowX:'auto' }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {SPECIALITES_LIST.map(s => (
              <button key={s} onClick={() => setSpecFiltre(s)} style={{
                padding:'7px 16px', borderRadius:50, border:'none', cursor:'pointer',
                fontWeight:600, fontSize:13, whiteSpace:'nowrap',
                background: specFiltre === s ? '#1641C8' : 'white',
                color: specFiltre === s ? 'white' : '#64748b',
                boxShadow: specFiltre === s ? '0 4px 12px rgba(22,65,200,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
                transition:'all 0.2s'
              }}>
                {s === 'Tous' ? (lang === 'en' ? 'All' : lang === 'es' ? 'Todos' : lang === 'zh' ? '全部' : lang === 'ht' ? 'Tout' : 'Tous') : s}
              </button>
            ))}
          </div>
        </div>

        {/* Résultat */}
        {specFiltre !== 'Tous' && (
          <div style={{ background:'#eff6ff', borderRadius:10, padding:'10px 16px', marginBottom:20, fontSize:14, color:'#1641C8', fontWeight:600 }}>
            {filtres.length} médecin{filtres.length > 1 ? 's' : ''} en <strong>{specFiltre}</strong>
            <button onClick={() => setSpecFiltre('Tous')} style={{ marginLeft:12, background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:12 }}>
              ✕ Effacer
            </button>
          </div>
        )}

        {/* Grille médecins */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {filtres.map((m, i) => (
            <div key={i} style={{ background:'white', borderRadius:16, padding:20, border:'1px solid #e2e8f0', display:'flex', gap:14, alignItems:'flex-start', transition:'box-shadow 0.2s', cursor:'default' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(22,65,200,0.10)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.boxShadow='none'}>
              <div style={{ width:54, height:54, borderRadius:14, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0, boxShadow:'0 2px 8px rgba(13,148,136,0.3)' }}>
                {m.emoji || '👨‍⚕️'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:14, color:'#0f172a', marginBottom:3 }}>{m.nom}</div>
                <div style={{ color:'#0d9488', fontSize:12, fontWeight:600, marginBottom:8 }}>{m.specialite}</div>
                <BtnRdv lang={lang} />
              </div>
            </div>
          ))}
        </div>

        {filtres.length === 0 && (
          <div style={{ textAlign:'center', padding:48, color:'#94a3b8' }}>
            <p style={{ fontSize:'1.1rem' }}>Aucun résultat</p>
            <button onClick={() => { setSearch(''); setSpecFiltre('Tous') }} style={{ background:'#1641C8', color:'white', border:'none', borderRadius:10, padding:'10px 20px', cursor:'pointer', fontWeight:600, marginTop:12 }}>
              Réinitialiser
            </button>
          </div>
        )}

        {/* CTA */}
        <div style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', borderRadius:20, padding:32, textAlign:'center', marginTop:40 }}>
          <h3 style={{ color:'white', fontWeight:800, fontSize:'1.2rem', margin:'0 0 10px' }}>
            {lang === 'en' ? 'Book an appointment' : lang === 'es' ? 'Reservar una cita' : lang === 'zh' ? '预约挂号' : lang === 'ht' ? 'Pran yon randevou' : 'Prendre rendez-vous'}
          </h3>
          <Link href="/consultation" style={{ background:'white', color:'#1641C8', textDecoration:'none', borderRadius:12, padding:'12px 28px', fontWeight:700, fontSize:15, display:'inline-block' }}>
            {lang === 'en' ? 'Consult now' : lang === 'es' ? 'Consultar ahora' : lang === 'zh' ? '立即预约' : lang === 'ht' ? 'Konsulte kounye a' : 'Consulter maintenant'}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function SpecialitesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid #1641C8', borderTopColor:'transparent', animation:'spin 1s linear infinite' }} />
      </div>
    }>
      <SpecialitesContent />
    </Suspense>
  )
}
