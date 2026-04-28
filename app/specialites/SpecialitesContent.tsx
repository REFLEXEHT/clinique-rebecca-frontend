'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

// Couleurs par spécialité pour les avatars
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

export default function SpecialitesContent() {
  const [medecins, setMedecins] = useState<any[]>(MEDECINS_FALLBACK)
  const [search, setSearch]     = useState('')
  const [rdvOpen, setRdvOpen]   = useState(false)
  const [rdvSpec, setRdvSpec]   = useState('')
  const router = useRouter()

  useEffect(() => {
    specialistesApi.list()
      .then(r => { if (r.data?.length > 0) setMedecins(r.data) })
      .catch(() => {})
  }, [])

  const filtres = medecins.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.nom.toLowerCase().includes(q) || m.specialite.toLowerCase().includes(q)
  })

  const handleDoctorClick = (m: any) => {
    if (m.id) router.push(`/specialistes/${m.id}`)
    else { setRdvSpec(m.specialite); setRdvOpen(true) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar variant="public" onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} defaultSpec={rdvSpec} />

      {/* ── En-tête harmonisé ── */}
      <div className="page-header" style={{ paddingTop: 110, paddingBottom: 52 }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(13,148,136,0.15)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto', padding: '0 5%' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', borderRadius: 50, padding: '5px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, border: '1px solid rgba(255,255,255,0.2)' }}>
            <i className="fa-solid fa-user-doctor" /> Notre équipe médicale
          </span>
          <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginBottom: 12, lineHeight: 1.15 }}>
            Médecins & Spécialistes
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
            Cliquez sur un médecin pour consulter son profil détaillé et prendre rendez-vous
          </p>

          {/* Barre de recherche dans le header */}
          <div style={{ maxWidth: 420, margin: '0 auto', position: 'relative' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 14 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Chercher par nom ou spécialité…"
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 50, border: '1.5px solid rgba(255,255,255,0.2)', fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.12)', color: 'white', boxSizing: 'border-box', backdropFilter: 'blur(8px)' }}
            />
          </div>
        </div>
      </div>

      {/* ── Grille médecins ── */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '36px 5% 72px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {filtres.map((m) => {
            const color = SPEC_COLORS[m.specialite] || '#1641C8'
            return (
              <div
                key={m.id || m.nom}
                onClick={() => handleDoctorClick(m)}
                style={{
                  background: 'white', borderRadius: 16, border: '1.5px solid #e2e8f0',
                  padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  const d = e.currentTarget
                  d.style.transform = 'translateY(-3px)'
                  d.style.boxShadow = `0 10px 28px ${color}20`
                  d.style.borderColor = color + '50'
                }}
                onMouseLeave={e => {
                  const d = e.currentTarget
                  d.style.transform = 'none'
                  d.style.boxShadow = 'none'
                  d.style.borderColor = '#e2e8f0'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: 'white', overflow: 'hidden',
                  boxShadow: `0 4px 12px ${color}35`,
                }}>
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                  ) : (
                    <i className="fa-solid fa-circle-user" style={{ fontSize: 24 }} />
                  )}
                </div>

                {/* Infos */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.nom}
                  </div>
                  <div style={{ color, fontSize: 11.5, fontWeight: 700, marginTop: 3 }}>{m.specialite}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: m.disponible !== false ? '#22c55e' : '#f59e0b', flexShrink: 0, boxShadow: m.disponible !== false ? '0 0 0 2px #dcfce7' : '0 0 0 2px #fef9c3' }} />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{m.disponible !== false ? 'Disponible' : 'Occupé'}</span>
                  </div>
                </div>

                <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1', fontSize: 11, flexShrink: 0 }} />
              </div>
            )
          })}
        </div>

        {filtres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <i className="fa-solid fa-user-doctor" style={{ fontSize: 48, opacity: 0.15, display: 'block', marginBottom: 16 }} />
            <p style={{ fontWeight: 700, fontSize: 16 }}>Aucun résultat pour « {search} »</p>
            <p style={{ fontSize: 14, marginTop: 4 }}>Essayez un autre nom ou une spécialité différente</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
