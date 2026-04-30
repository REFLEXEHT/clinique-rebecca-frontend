'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { specialistesApi } from '@/lib/api'
import { Specialiste } from '@/types'

// Données réelles des médecins (fallback si API indisponible)
const MEDECINS_FALLBACK = [
  { nom:"Dr Peterly PHILIPPE",      specialite:"Orthopédie",                   telephone:"3780-4789", prix_consultation:6500, emoji:"🦴" },
  { nom:"Dr Wisly Joseph",          specialite:"Chirurgie Générale",            telephone:"3865-5254", prix_consultation:3000, emoji:"🔬" },
  { nom:"Dr Jean Berldine",         specialite:"Chirurgie Générale",            telephone:"3685-7346", prix_consultation:4000, emoji:"🔬" },
  { nom:"Dr Mikerline Charles",     specialite:"Pédiatrie",                     telephone:"3673-8631", prix_consultation:3000, emoji:"👶" },
  { nom:"Dr Bernard Pierre",        specialite:"Neurochirurgie",                telephone:"3719-2362", prix_consultation:5000, emoji:"🧠" },
  { nom:"Dr Pierre Billy Lemaus",   specialite:"Urologie",                      telephone:"3663-8503", prix_consultation:5000, emoji:"🩺" },
  { nom:"Dr Eliode Pierre",         specialite:"Gynécologie",                   telephone:"3774-9416", prix_consultation:3000, emoji:"👩‍⚕️" },
  { nom:"Dr Marie Kerline Pierre",  specialite:"Anesthésiologie / Réanimation", telephone:"3780-6951", prix_consultation:5000, emoji:"💉" },
  { nom:"Dr Brunot Simon",          specialite:"Orthopédie",                    telephone:"3889-3720", prix_consultation:3000, emoji:"🦴" },
  { nom:"Dr Vania Louissaint",      specialite:"Médecine interne",              telephone:"4217-8031", prix_consultation:5000, emoji:"🩺" },
  { nom:"Dr Jeff Tesnor",           specialite:"Chirurgie Générale",            telephone:"3459-4612", prix_consultation:6000, emoji:"🔬" },
  { nom:"Dr Delvalès Doccy",        specialite:"Gynécologie",                   telephone:"3493-6533", prix_consultation:5000, emoji:"👩‍⚕️" },
  { nom:"Dr Bob-Hallen Treisma",    specialite:"Gynécologie",                   telephone:"3816-5368", prix_consultation:5000, emoji:"👩‍⚕️" },
  { nom:"Dr Jenh Robert",           specialite:"Chirurgie Pédiatrique",         telephone:"3406-0998", prix_consultation:5000, emoji:"👶" },
  { nom:"Dr Duvivier",              specialite:"Pédiatrie",                     telephone:"3325-9190", prix_consultation:3000, emoji:"👶" },
  { nom:"Dr Sophie Beaujour",       specialite:"Dermatologie",                  telephone:"3294-3481", prix_consultation:3000, emoji:"🧬" },
  { nom:"Dr Jean Daniel",           specialite:"Gynécologie",                   telephone:"3634-3265", prix_consultation:3000, emoji:"👩‍⚕️" },
  { nom:"Dr Clifford Edouard",      specialite:"Orthopédie",                    telephone:"3327-3689", prix_consultation:4000, emoji:"🦴" },
  { nom:"Dr Christelle Philippe",   specialite:"Médecine interne",              telephone:"3894-8400", prix_consultation:4000, emoji:"🩺" },
  { nom:"Dr Rose Stephanie Joseph", specialite:"Pédiatrie",                     telephone:"3614-4332", prix_consultation:3500, emoji:"👶" },
  { nom:"Dr Kaina Michaud",         specialite:"ORL",                           telephone:"3891-1659", prix_consultation:4000, emoji:"👂" },
  { nom:"Dr Lemoine Lafleur",       specialite:"Neurologie",                    telephone:"4869-0495", prix_consultation:6000, emoji:"🧠" },
  { nom:"Dr Auguste Samy",          specialite:"Orthopédie",                    telephone:"3833-2358", prix_consultation:4500, emoji:"🦴" },
  { nom:"Dr Enold Lubin",           specialite:"Gynécologie",                   telephone:"4853-4651", prix_consultation:4000, emoji:"👩‍⚕️" },
  { nom:"Dr Dauphin Roolandro",     specialite:"Gynécologie",                   telephone:"3106-4936", prix_consultation:2000, emoji:"👩‍⚕️" },
  { nom:"Dr Wolf Charlie Cajuste",  specialite:"Dentisterie",                   telephone:"3810-7562", prix_consultation:2500, emoji:"🦷" },
  { nom:"Mme Fredia Fleurival",     specialite:"Physiothérapie",                telephone:"3368-8796", prix_consultation:3000, emoji:"🏥" },
  { nom:"Dr Gilles Abraham",        specialite:"Optométrie",                    telephone:"3627-1021", prix_consultation:2000, emoji:"👁️" },
  { nom:"Mr Reginald Volcy",        specialite:"Psychologie",                   telephone:"4308-9457", prix_consultation:3000, emoji:"🧬" },
  { nom:"Dr Jean Luc Mathurin",     specialite:"Radiologie",                    telephone:"4007-6328", prix_consultation:0,    emoji:"🩻" },
]

const CATEGORIES = [
  { key:'tous',  label:'Tous' },
  { key:'chir',  label:'Chirurgie', specs:['Chirurgie Générale','Chirurgie Pédiatrique','Neurochirurgie','Orthopédie','Urologie','Anesthésiologie / Réanimation'] },
  { key:'med',   label:'Médecine',  specs:['Médecine interne','Neurologie','Dermatologie','ORL','Cardiologie','Psychologie','Radiologie'] },
  { key:'gyn',   label:'Gynécologie / Pédiatrie', specs:['Gynécologie','Pédiatrie'] },
  { key:'para',  label:'Paramédicaux', specs:['Physiothérapie','Optométrie','Dentisterie'] },
]

export default function SpecialitesPage() {
  const [medecins,  setMedecins]  = useState<any[]>(MEDECINS_FALLBACK)
  const [filtre,    setFiltre]    = useState('tous')
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    specialistesApi.list()
      .then(r => { if (r.data?.length > 0) setMedecins(r.data) })
      .catch(() => {})
  }, [])

  const categorie = CATEGORIES.find(c => c.key === filtre)
  const filtres = medecins.filter(m => {
    if (search && !m.nom.toLowerCase().includes(search.toLowerCase()) && !m.specialite.toLowerCase().includes(search.toLowerCase())) return false
    if (filtre === 'tous') return true
    return categorie?.specs?.includes(m.specialite)
  })

  const router = useRouter()
  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Navbar variant="public" />

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d 0%,#1641C8 60%,#0d9488 100%)', padding:'64px 20px 48px', textAlign:'center' }}>
        <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.8rem,4vw,2.8rem)', margin:'0 0 12px' }}>
          Nos <em style={{ fontStyle:'italic', color:'#5eead4' }}>spécialistes</em>
        </h1>
        <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'1.05rem', maxWidth:520, margin:'0 auto 28px' }}>
          30 médecins et professionnels de santé à votre service
        </p>
        <input
          placeholder="🔍 Rechercher un médecin ou une spécialité..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', maxWidth:440, padding:'13px 18px', borderRadius:12, border:'none', fontSize:15, outline:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}
        />
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 20px' }}>
        {/* Filtres */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setFiltre(c.key)} style={{
              padding:'8px 18px', borderRadius:50, border:'none', cursor:'pointer', fontWeight:600, fontSize:13,
              background: filtre === c.key ? '#1641C8' : 'white',
              color: filtre === c.key ? 'white' : '#64748b',
              boxShadow: filtre === c.key ? '0 4px 12px rgba(22,65,200,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
              transition:'all 0.2s'
            }}>
              {c.label} {filtre === c.key && `(${filtres.length})`}
            </button>
          ))}
        </div>

        {/* Grille médecins */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {filtres.map((m, i) => (
            <div key={i} style={{ background:'white', borderRadius:18, padding:22, border:'1px solid #e2e8f0', display:'flex', gap:14, alignItems:'flex-start', transition:'all 0.2s', cursor:'default' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 30px rgba(22,65,200,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
                {m.emoji || '👨‍⚕️'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:14, color:'#0f172a', marginBottom:3 }}>{m.nom}</div>
                <div style={{ color:'#0d9488', fontSize:12, fontWeight:600, marginBottom:6 }}>{m.specialite}</div>
                {m.telephone && (
                  <div style={{ color:'#94a3b8', fontSize:12, marginBottom:6 }}>📞 {m.telephone}</div>
                )}
                {(m.prix_consultation > 0 || m.description) && (
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {m.prix_consultation > 0 && (
                      <span style={{ background:'#eff6ff', color:'#1641C8', borderRadius:50, padding:'3px 10px', fontSize:11, fontWeight:700 }}>
                        Cons. : {m.prix_consultation.toLocaleString()} HTG
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtres.length === 0 && (
          <div style={{ textAlign:'center', padding:48, color:'#94a3b8' }}>
            <p style={{ fontSize:'1.1rem' }}>Aucun résultat pour « {search} »</p>
            <button onClick={() => { setSearch(''); setFiltre('tous') }} style={{ background:'#1641C8', color:'white', border:'none', borderRadius:10, padding:'10px 20px', cursor:'pointer', fontWeight:600, marginTop:12 }}>
              Réinitialiser
            </button>
          </div>
        )}

        {/* CTA */}
        <div style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', borderRadius:20, padding:32, textAlign:'center', marginTop:40 }}>
          <h3 style={{ color:'white', fontWeight:800, fontSize:'1.3rem', margin:'0 0 10px' }}>Prendre rendez-vous</h3>
          <p style={{ color:'rgba(255,255,255,0.8)', margin:'0 0 20px', fontSize:14 }}>Choisissez votre spécialiste et réservez en ligne</p>
          <Link href="/consultation" style={{ background:'white', color:'#1641C8', textDecoration:'none', borderRadius:12, padding:'12px 28px', fontWeight:700, fontSize:15, display:'inline-block' }}>
            Consulter maintenant
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
