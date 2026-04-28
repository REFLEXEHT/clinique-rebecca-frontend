'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'

const MEDECINS_FALLBACK = [
  { id: 1,  nom: 'Dr Pierre Billy Lemaus',   specialite: 'Urologie',              telephone: '3663-8503', prix_consultation: 5000, disponible: true,  parcours: 'Urologue expert en endoscopie et lithiase urinaire.' },
  { id: 2,  nom: 'Dr Eliode Pierre',          specialite: 'Gynécologie',           telephone: '3774-9416', prix_consultation: 3000, disponible: true,  parcours: 'Gynécologue-obstétricien avec une expertise en grossesses à risque.' },
  { id: 3,  nom: 'Dr Marie Kerline Pierre',   specialite: 'Anesthésiologie',       telephone: '3780-6951', prix_consultation: 5000, disponible: true,  parcours: 'Anesthésiste-réanimatrice, experte en soins intensifs.' },
  { id: 4,  nom: 'Dr Vania Louissaint',       specialite: 'Médecine interne',      telephone: '4217-8031', prix_consultation: 5000, disponible: true,  parcours: 'Interniste avec une approche globale et préventive.' },
  { id: 5,  nom: 'Dr Jeff Tesnor',            specialite: 'Chirurgie Générale',    telephone: '3459-4612', prix_consultation: 6000, disponible: true,  parcours: "Chirurgien senior avec expertise en chirurgie d'urgence." },
  { id: 6,  nom: 'Dr Bob-Hallen Treisma',     specialite: 'Gynécologie',           telephone: '3816-5368', prix_consultation: 5000, disponible: false, parcours: 'Expert en chirurgie gynécologique mini-invasive.' },
  { id: 7,  nom: 'Dr Delvalès Doccy',         specialite: 'Gynécologie',           telephone: '3493-6533', prix_consultation: 5000, disponible: true,  parcours: 'Spécialisée en gynécologie médicale et planning familial.' },
  { id: 8,  nom: 'Dr Duvivier',               specialite: 'Pédiatrie',             telephone: '3325-9190', prix_consultation: 3000, disponible: true,  parcours: 'Pédiatre spécialisé en néonatologie.' },
  { id: 9,  nom: 'Dr Jean Daniel',            specialite: 'Gynécologie',           telephone: '3634-3265', prix_consultation: 3000, disponible: true,  parcours: 'Gynécologue avec approche holistique et bienveillante.' },
  { id: 10, nom: 'Dr Clifford Edouard',       specialite: 'Orthopédie',            telephone: '3327-3689', prix_consultation: 4000, disponible: true,  parcours: 'Orthopédiste spécialisé en traumatologie sportive.' },
  { id: 11, nom: 'Dr Christelle Philippe',    specialite: 'Médecine interne',      telephone: '3894-8400', prix_consultation: 4000, disponible: true,  parcours: 'Interniste spécialisée en maladies chroniques.' },
  { id: 12, nom: 'Dr Rose Stéphanie Joseph',  specialite: 'Pédiatrie',             telephone: '3614-4332', prix_consultation: 3500, disponible: true,  parcours: 'Pédiatre spécialisée en pédiatrie sociale et développementale.' },
  { id: 13, nom: 'Dr Kaina Michaud',          specialite: 'ORL',                   telephone: '3891-1659', prix_consultation: 4000, disponible: true,  parcours: 'ORL avec expertise en rhinologie et chirurgie des sinus.' },
  { id: 14, nom: 'Dr Wisly Joseph',           specialite: 'Chirurgie Générale',    telephone: '3865-5254', prix_consultation: 3000, disponible: true,  parcours: 'Chirurgien généraliste avec plus de 10 ans de pratique.' },
  { id: 15, nom: 'Dr Jean Berldine',          specialite: 'Chirurgie Générale',    telephone: '3685-7346', prix_consultation: 4000, disponible: true,  parcours: 'Spécialiste en chirurgie digestive et laparoscopique.' },
  { id: 16, nom: 'Dr Mikerline Charles',      specialite: 'Pédiatrie',             telephone: '3673-8631', prix_consultation: 3000, disponible: true,  parcours: "Pédiatre dévouée à la santé des enfants de la naissance à l'adolescence." },
  { id: 17, nom: 'Dr Bernard Pierre',         specialite: 'Neurochirurgie',        telephone: '3719-2362', prix_consultation: 5000, disponible: false, parcours: 'Neurochirurgien formé en France, spécialisé en chirurgie rachidienne.' },
  { id: 18, nom: 'Dr Peterly Philippe',       specialite: 'Orthopédie',            telephone: '3780-4789', prix_consultation: 6500, disponible: true,  parcours: 'Formé en Haïti et aux États-Unis, spécialisé en chirurgie orthopédique.' },
  { id: 19, nom: 'Dr Brunot Simon',           specialite: 'Orthopédie',            telephone: '3889-3720', prix_consultation: 3000, disponible: true,  parcours: "Orthopédiste spécialisé en pathologies du genou et de l'épaule." },
  { id: 20, nom: 'Dr Jenh Robert',            specialite: 'Chirurgie Pédiatrique', telephone: '3406-0998', prix_consultation: 5000, disponible: true,  parcours: 'Seul chirurgien pédiatrique de la clinique, formé en Europe.' },
  { id: 21, nom: 'Dr Sophie Beaujour',        specialite: 'Dermatologie',          telephone: '3294-3481', prix_consultation: 3000, disponible: true,  parcours: 'Dermatologue avec expertise en dermatologie esthétique et médicale.' },
  { id: 22, nom: 'Dr Lemoine Lafleur',        specialite: 'Neurologie',            telephone: '4869-0495', prix_consultation: 6000, disponible: false, parcours: 'Neurologue spécialisé en épilepsie et maladies neuromusculaires.' },
  { id: 23, nom: 'Dr Auguste Samy',           specialite: 'Orthopédie',            telephone: '3833-2358', prix_consultation: 4500, disponible: true,  parcours: 'Orthopédiste avec spécialisation en prothèses articulaires.' },
  { id: 24, nom: 'Dr Enold Lubin',            specialite: 'Gynécologie',           telephone: '4853-4651', prix_consultation: 4000, disponible: true,  parcours: "Gynécologue avec intérêt particulier pour l'infertilité." },
  { id: 25, nom: 'Dr Dauphin Roolandro',      specialite: 'Gynécologie',           telephone: '3106-4936', prix_consultation: 2000, disponible: true,  parcours: 'Gynécologue engagé auprès des communautés défavorisées.' },
  { id: 26, nom: 'Dr Wolf Charlie Cajuste',   specialite: 'Dentisterie',           telephone: '3810-7562', prix_consultation: 2500, disponible: true,  parcours: 'Chirurgien-dentiste spécialisé en orthodontie et soins conservateurs.' },
  { id: 27, nom: 'Mme Fredia Fleurival',      specialite: 'Physiothérapie',        telephone: '3368-8796', prix_consultation: 3000, disponible: true,  parcours: 'Physiothérapeute diplômée spécialisée en rééducation post-chirurgicale.' },
  { id: 28, nom: 'Dr Gilles Abraham',         specialite: 'Optométrie',            telephone: '3627-1021', prix_consultation: 2000, disponible: true,  parcours: 'Optométriste avec expertise en basse vision et verres progressifs.' },
  { id: 29, nom: 'Mr Reginald Volcy',         specialite: 'Psychologie',           telephone: '4308-9457', prix_consultation: 3000, disponible: true,  parcours: 'Psychologue clinicien spécialisé en thérapies cognitives et comportementales.' },
  { id: 30, nom: 'Dr Jean Luc Mathurin',      specialite: 'Radiologie',            telephone: '4007-6328', prix_consultation: 0,    disponible: true,  parcours: 'Radiologue expert en imagerie médicale diagnostique.' },
]

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

  // Navigate to doctor profile page
  const handleDoctorClick = (m: any) => {
    if (m.id) {
      router.push(`/specialistes/${m.id}`)
    } else {
      // Fallback: open RDV modal with their specialty
      setRdvSpec(m.specialite)
      setRdvOpen(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar variant="public" onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} defaultSpec={rdvSpec} />

      {/* En-tête */}
      <div style={{ paddingTop: 70, background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 5% 28px', textAlign: 'center' }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem,3vw,2.2rem)', color: '#0f172a', marginBottom: 8 }}>
            Nos Médecins & Spécialistes
          </h1>
          <div style={{ width: 48, height: 3, background: '#1641C8', borderRadius: 2, margin: '0 auto 14px' }} />
          <p style={{ color: '#64748b', fontSize: 15 }}>
            Cliquez sur un médecin pour consulter son profil détaillé et prendre rendez-vous
          </p>
          <div style={{ maxWidth: 400, margin: '20px auto 0', position: 'relative' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Chercher par nom ou spécialité…"
              style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 50, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Grille médecins — clic → profil page */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 5% 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {filtres.map((m) => (
            <div
              key={m.id || m.nom}
              onClick={() => handleDoctorClick(m)}
              title={`Voir le profil de ${m.nom}`}
              style={{
                background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
                padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                const d = e.currentTarget
                d.style.transform = 'translateY(-2px)'
                d.style.boxShadow = '0 8px 24px rgba(22,65,200,0.12)'
                d.style.borderColor = '#1641C840'
              }}
              onMouseLeave={e => {
                const d = e.currentTarget
                d.style.transform = 'none'
                d.style.boxShadow = 'none'
                d.style.borderColor = '#e2e8f0'
              }}
            >
              {/* Avatar avec photo si disponible ou icône */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg,#1641C8,#0d9488)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color: 'white', fontSize: 20, overflow: 'hidden',
              }}>
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <i className="fa-solid fa-circle-user" style={{ fontSize: 22 }} />
                )}
              </div>

              {/* Infos */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.nom}
                </div>
                <div style={{ color: '#1641C8', fontSize: 12, fontWeight: 600, marginTop: 2 }}>{m.specialite}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.disponible !== false ? '#22c55e' : '#f59e0b', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{m.disponible !== false ? 'Disponible' : 'Occupé'}</span>
                </div>
              </div>

              {/* Flèche indiquant que la card est cliquable */}
              <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1', fontSize: 11, flexShrink: 0 }} />
            </div>
          ))}
        </div>

        {filtres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <i className="fa-solid fa-user-doctor" style={{ fontSize: 40, opacity: 0.2, display: 'block', marginBottom: 12 }} />
            <p style={{ fontWeight: 600 }}>Aucun résultat pour « {search} »</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
