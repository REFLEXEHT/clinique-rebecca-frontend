'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'

const MEDECINS_FALLBACK = [
  { id: 1,  nom: 'Dr Pierre Billy Lemaus',   specialite: 'Urologie',              telephone: '3663-8503', prix_consultation: 5000, disponible: true  },
  { id: 2,  nom: 'Dr Eliode Pierre',          specialite: 'Gynécologie',           telephone: '3774-9416', prix_consultation: 3000, disponible: true  },
  { id: 3,  nom: 'Dr Marie Kerline Pierre',   specialite: 'Anesthésiologie',       telephone: '3780-6951', prix_consultation: 5000, disponible: true  },
  { id: 4,  nom: 'Dr Vania Louissaint',       specialite: 'Médecine interne',      telephone: '4217-8031', prix_consultation: 5000, disponible: true  },
  { id: 5,  nom: 'Dr Jeff Tesnor',            specialite: 'Chirurgie Générale',    telephone: '3459-4612', prix_consultation: 6000, disponible: true  },
  { id: 6,  nom: 'Dr Bob-Hallen Treisma',     specialite: 'Gynécologie',           telephone: '3816-5368', prix_consultation: 5000, disponible: false },
  { id: 7,  nom: 'Dr Delvalès Doccy',         specialite: 'Gynécologie',           telephone: '3493-6533', prix_consultation: 5000, disponible: true  },
  { id: 8,  nom: 'Dr Duvivier',               specialite: 'Pédiatrie',             telephone: '3325-9190', prix_consultation: 3000, disponible: true  },
  { id: 9,  nom: 'Dr Jean Daniel',            specialite: 'Gynécologie',           telephone: '3634-3265', prix_consultation: 3000, disponible: true  },
  { id: 10, nom: 'Dr Clifford Edouard',       specialite: 'Orthopédie',            telephone: '3327-3689', prix_consultation: 4000, disponible: true  },
  { id: 11, nom: 'Dr Christelle Philippe',    specialite: 'Médecine interne',      telephone: '3894-8400', prix_consultation: 4000, disponible: true  },
  { id: 12, nom: 'Dr Rose Stéphanie Joseph',  specialite: 'Pédiatrie',             telephone: '3614-4332', prix_consultation: 3500, disponible: true  },
  { id: 13, nom: 'Dr Kaina Michaud',          specialite: 'ORL',                   telephone: '3891-1659', prix_consultation: 4000, disponible: true  },
  { id: 14, nom: 'Dr Wisly Joseph',           specialite: 'Chirurgie Générale',    telephone: '3865-5254', prix_consultation: 3000, disponible: true  },
  { id: 15, nom: 'Dr Jean Berldine',          specialite: 'Chirurgie Générale',    telephone: '3685-7346', prix_consultation: 4000, disponible: true  },
  { id: 16, nom: 'Dr Mikerline Charles',      specialite: 'Pédiatrie',             telephone: '3673-8631', prix_consultation: 3000, disponible: true  },
  { id: 17, nom: 'Dr Bernard Pierre',         specialite: 'Neurochirurgie',        telephone: '3719-2362', prix_consultation: 5000, disponible: false },
  { id: 18, nom: 'Dr Peterly Philippe',       specialite: 'Orthopédie',            telephone: '3780-4789', prix_consultation: 6500, disponible: true  },
  { id: 19, nom: 'Dr Brunot Simon',           specialite: 'Orthopédie',            telephone: '3889-3720', prix_consultation: 3000, disponible: true  },
  { id: 20, nom: 'Dr Jenh Robert',            specialite: 'Chirurgie Pédiatrique', telephone: '3406-0998', prix_consultation: 5000, disponible: true  },
  { id: 21, nom: 'Dr Sophie Beaujour',        specialite: 'Dermatologie',          telephone: '3294-3481', prix_consultation: 3000, disponible: true  },
  { id: 22, nom: 'Dr Lemoine Lafleur',        specialite: 'Neurologie',            telephone: '4869-0495', prix_consultation: 6000, disponible: false },
  { id: 23, nom: 'Dr Auguste Samy',           specialite: 'Orthopédie',            telephone: '3833-2358', prix_consultation: 4500, disponible: true  },
  { id: 24, nom: 'Dr Enold Lubin',            specialite: 'Gynécologie',           telephone: '4853-4651', prix_consultation: 4000, disponible: true  },
  { id: 25, nom: 'Dr Dauphin Roolandro',      specialite: 'Gynécologie',           telephone: '3106-4936', prix_consultation: 2000, disponible: true  },
  { id: 26, nom: 'Dr Wolf Charlie Cajuste',   specialite: 'Dentisterie',           telephone: '3810-7562', prix_consultation: 2500, disponible: true  },
  { id: 27, nom: 'Mme Fredia Fleurival',      specialite: 'Physiothérapie',        telephone: '3368-8796', prix_consultation: 3000, disponible: true  },
  { id: 28, nom: 'Dr Gilles Abraham',         specialite: 'Optométrie',            telephone: '3627-1021', prix_consultation: 2000, disponible: true  },
  { id: 29, nom: 'Mr Reginald Volcy',         specialite: 'Psychologie',           telephone: '4308-9457', prix_consultation: 3000, disponible: true  },
  { id: 30, nom: 'Dr Jean Luc Mathurin',      specialite: 'Radiologie',            telephone: '4007-6328', prix_consultation: 0,    disponible: true  },
]

const SPEC_COLORS: Record<string, string> = {
  'Urologie': '#0891b2',
  'Gynécologie': '#be185d',
  'Anesthésiologie': '#6366f1',
  'Médecine interne': '#1641C8',
  'Chirurgie Générale': '#374151',
  'Pédiatrie': '#d97706',
  'ORL': '#059669',
  'Orthopédie': '#7c3aed',
  'Neurochirurgie': '#dc2626',
  'Neurologie': '#dc2626',
  'Chirurgie Pédiatrique': '#0d9488',
  'Dermatologie': '#db2777',
  'Dentisterie': '#2563eb',
  'Physiothérapie': '#16a34a',
  'Optométrie': '#0284c7',
  'Psychologie': '#9333ea',
  'Radiologie': '#475569',
}

// Initiales depuis le nom du médecin
function getInitials(nom: string): string {
  return nom
    .replace(/^(Dr|Mme|Mr)\s+/i, '')
    .split(' ')
    .map(n => n[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function SpecialitesContent() {
  const [medecins, setMedecins] = useState<any[]>(MEDECINS_FALLBACK)
  const [search, setSearch]     = useState('')
  const [filtre, setFiltre]     = useState('Tous')
  const [rdvOpen, setRdvOpen]   = useState(false)
  const [rdvSpec, setRdvSpec]   = useState('')

  useEffect(() => {
    specialistesApi.list()
      .then(r => { if (r.data?.length > 0) setMedecins(r.data) })
      .catch(() => {})
  }, [])

  // Liste unique des spécialités
  const specialites = ['Tous', ...Array.from(new Set(medecins.map(m => m.specialite))).sort()]

  const filtres = medecins.filter(m => {
    const matchSearch = !search || m.nom.toLowerCase().includes(search.toLowerCase()) || m.specialite.toLowerCase().includes(search.toLowerCase())
    const matchFiltre = filtre === 'Tous' || m.specialite === filtre
    return matchSearch && matchFiltre
  })

  const disponibles = filtres.filter(m => m.disponible !== false)
  const occupes     = filtres.filter(m => m.disponible === false)
  const ordonnes    = [...disponibles, ...occupes]

  const handleRdv = (m: any) => {
    setRdvSpec(m.specialite)
    setRdvOpen(true)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f0f4ff' }}>
      <Navbar variant="public" onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} defaultSpec={rdvSpec} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={{
        background:'linear-gradient(150deg, #0a1628 0%, #1641C8 55%, #0d9488 100%)',
        paddingTop:120, paddingBottom:56,
        position:'relative', overflow:'hidden', textAlign:'center',
      }}>
        <div style={{ position:'absolute', top:-100, right:-80, width:380, height:380, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-50, left:-60, width:260, height:260, borderRadius:'50%', background:'rgba(13,148,136,0.12)', pointerEvents:'none' }} />

        <div style={{ position:'relative', maxWidth:680, margin:'0 auto', padding:'0 5%' }}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.88)',
            borderRadius:50, padding:'6px 18px', fontSize:11, fontWeight:700,
            letterSpacing:2, textTransform:'uppercase', marginBottom:22,
            border:'1px solid rgba(255,255,255,0.18)',
          }}>
            <i className="fa-solid fa-user-doctor" /> Notre équipe médicale
          </span>

          <h1 style={{
            color:'white', fontWeight:900,
            fontSize:'clamp(1.9rem, 4vw, 3rem)',
            lineHeight:1.1, marginBottom:16, letterSpacing:'-0.02em',
          }}>
            Des médecins qui<br />
            <em style={{ fontStyle:'italic', color:'#5eead4', fontFamily:'Georgia, serif' }}>vous connaissent</em>
          </h1>

          <p style={{ color:'rgba(255,255,255,0.68)', fontSize:15.5, lineHeight:1.75, marginBottom:36, maxWidth:500, margin:'0 auto 36px' }}>
            Chaque spécialiste de la clinique a été choisi pour sa compétence, mais aussi pour son écoute. Cliquez sur un profil pour en savoir plus et prendre rendez-vous.
          </p>

          {/* Barre de recherche */}
          <div style={{ maxWidth:460, margin:'0 auto', position:'relative' }}>
            <i className="fa-solid fa-magnifying-glass" style={{
              position:'absolute', left:18, top:'50%', transform:'translateY(-50%)',
              color:'rgba(255,255,255,0.45)', fontSize:15,
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou spécialité…"
              style={{
                width:'100%', padding:'14px 18px 14px 48px',
                borderRadius:50, border:'1.5px solid rgba(255,255,255,0.22)',
                fontSize:14.5, outline:'none',
                background:'rgba(255,255,255,0.10)',
                color:'white', boxSizing:'border-box',
                backdropFilter:'blur(10px)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── FILTRES PAR SPÉCIALITÉ ────────────────────────────────────────── */}
      <div style={{ background:'white', borderBottom:'1px solid #e2e8f0', padding:'0 5%', overflowX:'auto' }}>
        <div style={{ maxWidth:1060, margin:'0 auto', display:'flex', gap:4, padding:'14px 0', flexWrap:'nowrap' }}>
          {specialites.map(s => (
            <button
              key={s}
              onClick={() => setFiltre(s)}
              style={{
                padding:'7px 16px', borderRadius:50, border:'none', cursor:'pointer',
                fontSize:13, fontWeight:700, whiteSpace:'nowrap', transition:'all 0.18s',
                background: filtre === s ? '#1641C8' : '#f1f5f9',
                color: filtre === s ? 'white' : '#475569',
                flexShrink:0,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRILLE MÉDECINS ───────────────────────────────────────────────── */}
      <div style={{ maxWidth:1060, margin:'0 auto', padding:'40px 5% 80px' }}>

        {ordonnes.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'#94a3b8' }}>
            <i className="fa-solid fa-user-doctor" style={{ fontSize:48, opacity:0.15, display:'block', marginBottom:16 }} />
            <p style={{ fontWeight:700, fontSize:17 }}>Aucun résultat pour « {search} »</p>
            <p style={{ fontSize:14, marginTop:6 }}>Essayez un autre nom ou changez de spécialité</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
            {ordonnes.map(m => {
              const color = SPEC_COLORS[m.specialite] || '#1641C8'
              const initials = getInitials(m.nom)
              return (
                <div
                  key={m.id || m.nom}
                  style={{
                    background:'white', borderRadius:18,
                    border:'1.5px solid #e2e8f0',
                    padding:'22px 20px',
                    display:'flex', flexDirection:'column', gap:0,
                    cursor:'pointer', transition:'all 0.22s',
                    opacity: m.disponible === false ? 0.72 : 1,
                  }}
                  onMouseEnter={e => {
                    if (m.disponible === false) return
                    const d = e.currentTarget
                    d.style.transform = 'translateY(-5px)'
                    d.style.boxShadow = `0 16px 40px ${color}22`
                    d.style.borderColor = color + '55'
                  }}
                  onMouseLeave={e => {
                    const d = e.currentTarget
                    d.style.transform = 'none'
                    d.style.boxShadow = 'none'
                    d.style.borderColor = '#e2e8f0'
                  }}
                >
                  {/* Top: avatar + nom + spécialité */}
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                    {/* Avatar avec initiales */}
                    <div style={{
                      width:54, height:54, borderRadius:16, flexShrink:0,
                      background:`linear-gradient(135deg, ${color}, ${color}bb)`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:'white', fontWeight:900, fontSize:18, letterSpacing:'-0.5px',
                      boxShadow:`0 4px 14px ${color}35`,
                    }}>
                      {m.photo_url ? (
                        <img
                          src={m.photo_url}
                          alt={m.nom}
                          style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:16 }}
                          onError={e => { e.currentTarget.style.display = 'none' }}
                        />
                      ) : initials}
                    </div>

                    <div style={{ minWidth:0, flex:1 }}>
                      <div style={{
                        fontWeight:800, color:'#0f172a', fontSize:14,
                        lineHeight:1.3, marginBottom:4,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                      }}>
                        {m.nom}
                      </div>
                      <div style={{
                        display:'inline-flex', alignItems:'center', gap:5,
                        background: color + '12', borderRadius:50,
                        padding:'3px 10px',
                      }}>
                        <span style={{ fontSize:11.5, fontWeight:700, color }}>{m.specialite}</span>
                      </div>
                    </div>
                  </div>

                  {/* Disponibilité + prix */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{
                        width:9, height:9, borderRadius:'50%',
                        background: m.disponible !== false ? '#22c55e' : '#f59e0b',
                        boxShadow: m.disponible !== false ? '0 0 0 3px #dcfce7' : '0 0 0 3px #fef9c3',
                      }} />
                      <span style={{ fontSize:12.5, color: m.disponible !== false ? '#16a34a' : '#d97706', fontWeight:600 }}>
                        {m.disponible !== false ? 'Disponible' : 'Actuellement occupé'}
                      </span>
                    </div>
                    {m.prix_consultation > 0 && (
                      <span style={{ fontSize:12, fontWeight:700, color:'#64748b' }}>
                        {m.prix_consultation.toLocaleString('fr')} HTG
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:8 }}>
                    <Link
                      href={`/specialistes/${m.id}`}
                      style={{
                        flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                        background:'#f1f5f9', color:'#475569', borderRadius:10,
                        padding:'9px 0', fontSize:12.5, fontWeight:700, textDecoration:'none',
                        transition:'all 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e2e8f0' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9' }}
                    >
                      <i className="fa-solid fa-eye" style={{ fontSize:11 }} /> Profil
                    </Link>
                    <button
                      onClick={() => handleRdv(m)}
                      disabled={m.disponible === false}
                      style={{
                        flex:1.4, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                        background: m.disponible !== false ? `linear-gradient(135deg, ${color}, ${color}cc)` : '#e2e8f0',
                        color: m.disponible !== false ? 'white' : '#94a3b8',
                        border:'none', borderRadius:10, padding:'9px 0',
                        fontSize:12.5, fontWeight:700, cursor: m.disponible !== false ? 'pointer' : 'not-allowed',
                        boxShadow: m.disponible !== false ? `0 4px 14px ${color}35` : 'none',
                      }}
                    >
                      <i className="fa-regular fa-calendar-check" style={{ fontSize:11 }} />
                      {m.disponible !== false ? 'Prendre RDV' : 'Indisponible'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Légende bas */}
        <div style={{ textAlign:'center', marginTop:40, padding:'20px', background:'white', borderRadius:16, border:'1px solid #e2e8f0' }}>
          <p style={{ color:'#64748b', fontSize:13, margin:0 }}>
            <i className="fa-solid fa-phone" style={{ color:'#1641C8', marginRight:8 }} />
            Vous ne trouvez pas le spécialiste qu'il vous faut ? Appelez-nous au{' '}
            <a href="tel:+50938880000" style={{ color:'#1641C8', fontWeight:700, textDecoration:'none' }}>+509 3888-0000</a>
            , nous vous orienterons.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
