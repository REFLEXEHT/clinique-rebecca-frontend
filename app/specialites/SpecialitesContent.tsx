'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'

const MEDECINS_FALLBACK = [
  { nom: 'Dr Pierre Billy Lemaus',    specialite: 'Urologie',              telephone: '3663-8503', prix_consultation: 5000, disponible: true,  parcours: 'Urologue expert en endoscopie et lithiase urinaire.' },
  { nom: 'Dr Eliode Pierre',          specialite: 'Gynécologie',           telephone: '3774-9416', prix_consultation: 3000, disponible: true,  parcours: "Gynécologue-obstétricien avec une expertise en grossesses à risque." },
  { nom: 'Dr Marie Kerline Pierre',   specialite: 'Anesthésiologie',       telephone: '3780-6951', prix_consultation: 5000, disponible: true,  parcours: 'Anesthésiste-réanimatrice, experte en soins intensifs.' },
  { nom: 'Dr Vania Louissaint',       specialite: 'Médecine interne',      telephone: '4217-8031', prix_consultation: 5000, disponible: true,  parcours: 'Interniste avec une approche globale et préventive.' },
  { nom: 'Dr Jeff Tesnor',            specialite: 'Chirurgie Générale',    telephone: '3459-4612', prix_consultation: 6000, disponible: true,  parcours: "Chirurgien senior avec expertise en chirurgie d'urgence." },
  { nom: 'Dr Bob-Hallen Treisma',     specialite: 'Gynécologie',           telephone: '3816-5368', prix_consultation: 5000, disponible: false, parcours: 'Expert en chirurgie gynécologique mini-invasive.' },
  { nom: 'Dr Delvalès Doccy',         specialite: 'Gynécologie',           telephone: '3493-6533', prix_consultation: 5000, disponible: true,  parcours: 'Spécialisée en gynécologie médicale et planning familial.' },
  { nom: 'Dr Duvivier',               specialite: 'Pédiatrie',             telephone: '3325-9190', prix_consultation: 3000, disponible: true,  parcours: 'Pédiatre spécialisé en néonatologie.' },
  { nom: 'Dr Jean Daniel',            specialite: 'Gynécologie',           telephone: '3634-3265', prix_consultation: 3000, disponible: true,  parcours: 'Gynécologue avec approche holistique et bienveillante.' },
  { nom: 'Dr Clifford Edouard',       specialite: 'Orthopédie',            telephone: '3327-3689', prix_consultation: 4000, disponible: true,  parcours: 'Orthopédiste spécialisé en traumatologie sportive.' },
  { nom: 'Dr Christelle Philippe',    specialite: 'Médecine interne',      telephone: '3894-8400', prix_consultation: 4000, disponible: true,  parcours: 'Interniste spécialisée en maladies chroniques.' },
  { nom: 'Dr Rose Stéphanie Joseph',  specialite: 'Pédiatrie',             telephone: '3614-4332', prix_consultation: 3500, disponible: true,  parcours: 'Pédiatre spécialisée en pédiatrie sociale et développementale.' },
  { nom: 'Dr Kaina Michaud',          specialite: 'ORL',                   telephone: '3891-1659', prix_consultation: 4000, disponible: true,  parcours: 'ORL avec expertise en rhinologie et chirurgie des sinus.' },
  { nom: 'Dr Wisly Joseph',           specialite: 'Chirurgie Générale',    telephone: '3865-5254', prix_consultation: 3000, disponible: true,  parcours: 'Chirurgien généraliste avec plus de 10 ans de pratique.' },
  { nom: 'Dr Jean Berldine',          specialite: 'Chirurgie Générale',    telephone: '3685-7346', prix_consultation: 4000, disponible: true,  parcours: 'Spécialiste en chirurgie digestive et laparoscopique.' },
  { nom: 'Dr Mikerline Charles',      specialite: 'Pédiatrie',             telephone: '3673-8631', prix_consultation: 3000, disponible: true,  parcours: "Pédiatre dévouée à la santé des enfants de la naissance à l'adolescence." },
  { nom: 'Dr Bernard Pierre',         specialite: 'Neurochirurgie',        telephone: '3719-2362', prix_consultation: 5000, disponible: false, parcours: 'Neurochirurgien formé en France, spécialisé en chirurgie rachidienne.' },
  { nom: 'Dr Peterly Philippe',       specialite: 'Orthopédie',            telephone: '3780-4789', prix_consultation: 6500, disponible: true,  parcours: 'Formé en Haïti et aux États-Unis, spécialisé en chirurgie orthopédique.' },
  { nom: 'Dr Brunot Simon',           specialite: 'Orthopédie',            telephone: '3889-3720', prix_consultation: 3000, disponible: true,  parcours: "Orthopédiste spécialisé en pathologies du genou et de l'épaule." },
  { nom: 'Dr Jenh Robert',            specialite: 'Chirurgie Pédiatrique', telephone: '3406-0998', prix_consultation: 5000, disponible: true,  parcours: 'Seul chirurgien pédiatrique de la clinique, formé en Europe.' },
  { nom: 'Dr Sophie Beaujour',        specialite: 'Dermatologie',          telephone: '3294-3481', prix_consultation: 3000, disponible: true,  parcours: 'Dermatologue avec expertise en dermatologie esthétique et médicale.' },
  { nom: 'Dr Lemoine Lafleur',        specialite: 'Neurologie',            telephone: '4869-0495', prix_consultation: 6000, disponible: false, parcours: 'Neurologue spécialisé en épilepsie et maladies neuromusculaires.' },
  { nom: 'Dr Auguste Samy',           specialite: 'Orthopédie',            telephone: '3833-2358', prix_consultation: 4500, disponible: true,  parcours: 'Orthopédiste avec spécialisation en prothèses articulaires.' },
  { nom: 'Dr Enold Lubin',            specialite: 'Gynécologie',           telephone: '4853-4651', prix_consultation: 4000, disponible: true,  parcours: "Gynécologue avec intérêt particulier pour l'infertilité." },
  { nom: 'Dr Dauphin Roolandro',      specialite: 'Gynécologie',           telephone: '3106-4936', prix_consultation: 2000, disponible: true,  parcours: 'Gynécologue engagé auprès des communautés défavorisées.' },
  { nom: 'Dr Wolf Charlie Cajuste',   specialite: 'Dentisterie',           telephone: '3810-7562', prix_consultation: 2500, disponible: true,  parcours: 'Chirurgien-dentiste spécialisé en orthodontie et soins conservateurs.' },
  { nom: 'Mme Fredia Fleurival',      specialite: 'Physiothérapie',        telephone: '3368-8796', prix_consultation: 3000, disponible: true,  parcours: 'Physiothérapeute diplômée spécialisée en rééducation post-chirurgicale.' },
  { nom: 'Dr Gilles Abraham',         specialite: 'Optométrie',            telephone: '3627-1021', prix_consultation: 2000, disponible: true,  parcours: 'Optométriste avec expertise en basse vision et verres progressifs.' },
  { nom: 'Mr Reginald Volcy',         specialite: 'Psychologie',           telephone: '4308-9457', prix_consultation: 3000, disponible: true,  parcours: 'Psychologue clinicien spécialisé en thérapies cognitives et comportementales.' },
  { nom: 'Dr Jean Luc Mathurin',      specialite: 'Radiologie',            telephone: '4007-6328', prix_consultation: 0,    disponible: true,  parcours: 'Radiologue expert en imagerie médicale diagnostique.' },
]

const INITIALES = (nom: string) =>
  nom.replace('Dr ', '').replace('Mme ', '').replace('Mr ', '').split(' ').slice(0, 2).map(n => n[0] || '').join('')

export default function SpecialitesContent() {
  const [medecins, setMedecins] = useState<any[]>(MEDECINS_FALLBACK)
  const [search, setSearch]     = useState('')
  const [rdvOpen, setRdvOpen]   = useState(false)
  const [profil, setProfil]     = useState<any | null>(null)
  const [rdvNom, setRdvNom]     = useState('')

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

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar variant="public" onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} defaultSpec={rdvNom} />

      {/* En-tête — style fidèle à la maquette */}
      <div style={{ paddingTop: 70, background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 5% 28px', textAlign: 'center' }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem,3vw,2.2rem)', color: '#0f172a', marginBottom: 8 }}>
            Nos Médecins
          </h1>
          <div style={{ width: 48, height: 3, background: '#1641C8', borderRadius: 2, margin: '0 auto 14px' }} />
          <p style={{ color: '#64748b', fontSize: 15 }}>Rencontrez nos médecins et spécialistes</p>

          {/* Barre de recherche */}
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

      {/* Grille médecins — style maquette : rangées de 3 cartes horizontales avec photo avatar */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 5% 64px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}>
          {filtres.map((m, i) => (
            <div
              key={i}
              onClick={() => { setProfil(m); setRdvNom(m.specialite) }}
              style={{
                background: 'white',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                const d = e.currentTarget
                d.style.transform = 'translateY(-2px)'
                d.style.boxShadow = '0 8px 24px rgba(22,65,200,0.1)'
                d.style.borderColor = '#1641C830'
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
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                color: '#64748b', fontSize: 18,
              }}>
                <i className="fa-solid fa-circle-user" />
              </div>
              {/* Infos */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.nom}
                </div>
                <div style={{ color: '#1641C8', fontSize: 12, fontWeight: 600, marginTop: 2 }}>{m.specialite}</div>
              </div>
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

      {/* Popup profil */}
      {profil && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setProfil(null)}
        >
          <div
            style={{ background: 'white', borderRadius: 24, padding: 36, maxWidth: 460, width: '100%', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setProfil(null)}
              style={{ position: 'absolute', top: 14, right: 14, background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
            >
              <i className="fa-solid fa-times" style={{ fontSize: 14 }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#64748b', fontSize: 28 }}>
                <i className="fa-solid fa-circle-user" />
              </div>
              <div>
                <h3 style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem', margin: '0 0 4px' }}>{profil.nom}</h3>
                <div style={{ color: '#1641C8', fontWeight: 700, fontSize: 14 }}>{profil.specialite}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: profil.disponible !== false ? '#22c55e' : '#f59e0b' }} />
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                    {profil.disponible !== false ? 'Disponible' : 'Actuellement occupé'}
                  </span>
                </div>
              </div>
            </div>

            {profil.parcours && (
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '13px 16px', marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 5 }}>Parcours</div>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{profil.parcours}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 4 }}>Consultation</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  {profil.prix_consultation > 0 ? `${profil.prix_consultation.toLocaleString()} HTG` : 'Sur devis'}
                </div>
              </div>
              <div style={{ background: '#eff6ff', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#1641C8', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 4 }}>Téléphone clinique</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{profil.telephone}</div>
              </div>
            </div>

            <button
              onClick={() => { setProfil(null); setRdvOpen(true) }}
              style={{ width: '100%', background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none', borderRadius: 14, padding: '13px 0', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-calendar-plus" style={{ marginRight: 8 }} />
              Prendre rendez-vous
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
