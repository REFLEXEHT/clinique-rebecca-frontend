'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'

const MEDECINS_FALLBACK = [
  { nom:'Dr Peterly PHILIPPE', specialite:'Orthopédie', telephone:'3780-4789', prix_consultation:6500, disponible:true, parcours:'Formé en Haïti et aux États-Unis, spécialisé en chirurgie orthopédique et traumatologie.' },
  { nom:'Dr Wisly Joseph', specialite:'Chirurgie Générale', telephone:'3865-5254', prix_consultation:3000, disponible:true, parcours:'Chirurgien généraliste avec plus de 10 ans de pratique.' },
  { nom:'Dr Jean Berldine', specialite:'Chirurgie Générale', telephone:'3685-7346', prix_consultation:4000, disponible:true, parcours:'Spécialiste en chirurgie digestive et laparoscopique.' },
  { nom:'Dr Mikerline Charles', specialite:'Pédiatrie', telephone:'3673-8631', prix_consultation:3000, disponible:true, parcours:'Pédiatre dévoué à la santé des enfants de la naissance à l\'adolescence.' },
  { nom:'Dr Bernard Pierre', specialite:'Neurochirurgie', telephone:'3719-2362', prix_consultation:5000, disponible:false, parcours:'Neurochirurgien formé en France, spécialisé en chirurgie rachidienne.' },
  { nom:'Dr Pierre Billy Lemaus', specialite:'Urologie', telephone:'3663-8503', prix_consultation:5000, disponible:true, parcours:'Urologue expert en endoscopie et lithiase urinaire.' },
  { nom:'Dr Eliode Pierre', specialite:'Gynécologie', telephone:'3774-9416', prix_consultation:3000, disponible:true, parcours:'Gynécologue-obstétricien avec une expertise en grossesses à risque.' },
  { nom:'Dr Marie Kerline Pierre', specialite:'Anesthésiologie', telephone:'3780-6951', prix_consultation:5000, disponible:true, parcours:'Anesthésiste-réanimatrice, experte en soins intensifs.' },
  { nom:'Dr Brunot Simon', specialite:'Orthopédie', telephone:'3889-3720', prix_consultation:3000, disponible:true, parcours:'Orthopédiste spécialisé en pathologies du genou et de l\'épaule.' },
  { nom:'Dr Vania Louissaint', specialite:'Médecine interne', telephone:'4217-8031', prix_consultation:5000, disponible:true, parcours:'Interniste avec une approche globale et préventive.' },
  { nom:'Dr Jeff Tesnor', specialite:'Chirurgie Générale', telephone:'3459-4612', prix_consultation:6000, disponible:true, parcours:'Chirurgien senior avec expertise en chirurgie d\'urgence.' },
  { nom:'Dr Delvalès Doccy', specialite:'Gynécologie', telephone:'3493-6533', prix_consultation:5000, disponible:true, parcours:'Spécialisée en gynécologie médicale et planning familial.' },
  { nom:'Dr Bob-Hallen Treisma', specialite:'Gynécologie', telephone:'3816-5368', prix_consultation:5000, disponible:false, parcours:'Expert en chirurgie gynécologique mini-invasive.' },
  { nom:'Dr Jenh Robert', specialite:'Chirurgie Pédiatrique', telephone:'3406-0998', prix_consultation:5000, disponible:true, parcours:'Seul chirurgien pédiatrique de la clinique, formé en Europe.' },
  { nom:'Dr Duvivier', specialite:'Pédiatrie', telephone:'3325-9190', prix_consultation:3000, disponible:true, parcours:'Pédiatre spécialisé en néonatologie.' },
  { nom:'Dr Sophie Beaujour', specialite:'Dermatologie', telephone:'3294-3481', prix_consultation:3000, disponible:true, parcours:'Dermatologue avec expertise en dermatologie esthétique et médicale.' },
  { nom:'Dr Jean Daniel', specialite:'Gynécologie', telephone:'3634-3265', prix_consultation:3000, disponible:true, parcours:'Gynécologue avec approche holistique et bienveillante.' },
  { nom:'Dr Clifford Edouard', specialite:'Orthopédie', telephone:'3327-3689', prix_consultation:4000, disponible:true, parcours:'Orthopédiste spécialisé en traumatologie sportive.' },
  { nom:'Dr Christelle Philippe', specialite:'Médecine interne', telephone:'3894-8400', prix_consultation:4000, disponible:true, parcours:'Interniste spécialisée en maladies chroniques.' },
  { nom:'Dr Rose Stephanie Joseph', specialite:'Pédiatrie', telephone:'3614-4332', prix_consultation:3500, disponible:true, parcours:'Pédiatre spécialisée en pédiatrie sociale et développementale.' },
  { nom:'Dr Kaina Michaud', specialite:'ORL', telephone:'3891-1659', prix_consultation:4000, disponible:true, parcours:'ORL avec expertise en rhinologie et chirurgie des sinus.' },
  { nom:'Dr Lemoine Lafleur', specialite:'Neurologie', telephone:'4869-0495', prix_consultation:6000, disponible:false, parcours:'Neurologue spécialisé en épilepsie et maladies neuromusculaires.' },
  { nom:'Dr Auguste Samy', specialite:'Orthopédie', telephone:'3833-2358', prix_consultation:4500, disponible:true, parcours:'Orthopédiste avec spécialisation en prothèses articulaires.' },
  { nom:'Dr Enold Lubin', specialite:'Gynécologie', telephone:'4853-4651', prix_consultation:4000, disponible:true, parcours:'Gynécologue avec intérêt particulier pour l\'infertilité.' },
  { nom:'Dr Dauphin Roolandro', specialite:'Gynécologie', telephone:'3106-4936', prix_consultation:2000, disponible:true, parcours:'Jeune gynécologue engagé auprès des communautés défavorisées.' },
  { nom:'Dr Wolf Charlie Cajuste', specialite:'Dentisterie', telephone:'3810-7562', prix_consultation:2500, disponible:true, parcours:'Chirurgien-dentiste spécialisé en orthodontie et soins conservateurs.' },
  { nom:'Mme Fredia Fleurival', specialite:'Physiothérapie', telephone:'3368-8796', prix_consultation:3000, disponible:true, parcours:'Physiothérapeute diplômée spécialisée en rééducation post-chirurgicale.' },
  { nom:'Dr Gilles Abraham', specialite:'Optométrie', telephone:'3627-1021', prix_consultation:2000, disponible:true, parcours:'Optométriste avec expertise en basse vision et verres progressifs.' },
  { nom:'Mr Reginald Volcy', specialite:'Psychologie', telephone:'4308-9457', prix_consultation:3000, disponible:true, parcours:'Psychologue clinicien spécialisé en thérapies cognitives et comportementales.' },
  { nom:'Dr Jean Luc Mathurin', specialite:'Radiologie', telephone:'4007-6328', prix_consultation:0, disponible:true, parcours:'Radiologue expert en imagerie médicale diagnostique.' },
]

const FILTRES = [
  { key:'tous', label:'Tous' },
  { key:'chir', label:'Chirurgie', specs:['Chirurgie Générale','Chirurgie Pédiatrique','Neurochirurgie','Orthopédie','Urologie','Anesthésiologie'] },
  { key:'med', label:'Médecine', specs:['Médecine interne','Neurologie','Dermatologie','ORL','Psychologie','Radiologie'] },
  { key:'gyn', label:'Gynécologie / Pédiatrie', specs:['Gynécologie','Pédiatrie'] },
  { key:'para', label:'Paramédicaux', specs:['Physiothérapie','Optométrie','Dentisterie'] },
]

const INITIALES = (nom: string) => nom.replace('Dr ','').replace('Mme ','').replace('Mr ','').split(' ').slice(0,2).map(n=>n[0]||'').join('')

export default function SpecialitesContent() {
  const [medecins, setMedecins] = useState
  const [mounted, setMounted] = useState(false)<any[]>(MEDECINS_FALLBACK)
  const [filtre, setFiltre] = useState('tous')
  const [search, setSearch] = useState('')
  const [rdvOpen, setRdvOpen] = useState(false)
  const [profilOpen, setProfilOpen] = useState<any|null>(null)

  useEffect(() => {
    specialistesApi.list().then(r => { if (r.data?.length > 0) setMedecins(r.data) }).catch(() => {})
  }, [])

  const categorie = FILTRES.find(c => c.key === filtre)
  const filtres = medecins.filter(m => {
    if (search && !m.nom.toLowerCase().includes(search.toLowerCase()) && !m.specialite.toLowerCase().includes(search.toLowerCase())) return false
    if (filtre === 'tous') return true
    return categorie?.specs?.some(s => m.specialite.includes(s.split(' ')[0]))
  })

  const groupes: Record<string, any[]> = {}
  filtres.forEach(m => {
    if (!groupes[m.specialite]) groupes[m.specialite] = []
    groupes[m.specialite].push(m)
  })

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Navbar variant="public" onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d 0%,#1641C8 60%,#0d9488 100%)', padding:'100px 5% 56px', textAlign:'center' }}>
        <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.8rem,4vw,2.8rem)', margin:'0 0 12px' }}>
          Nos <em style={{ fontStyle:'italic', color:'#5eead4' }}>spécialistes</em>
        </h1>
        <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'1.05rem', maxWidth:520, margin:'0 auto 28px' }}>
          {medecins.length} médecins et professionnels de santé à votre service
        </p>
        <div style={{ maxWidth:440, margin:'0 auto', position:'relative' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:15 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher par nom ou spécialité..."
            style={{ width:'100%', padding:'13px 16px 13px 44px', borderRadius:50, border:'none', fontSize:15, background:'white', outline:'none', boxSizing:'border-box', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }} />
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 5%' }}>
        {/* Filtres */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:36 }}>
          {FILTRES.map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              style={{ padding:'8px 20px', borderRadius:50, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, transition:'all 0.2s',
                background: filtre===f.key ? '#1641C8' : 'white',
                color: filtre===f.key ? 'white' : '#475569',
                boxShadow: filtre===f.key ? '0 4px 16px rgba(22,65,200,0.25)' : '0 1px 4px rgba(0,0,0,0.08)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Résultats */}
        <div style={{ marginBottom:12, color:'#64748b', fontSize:14, fontWeight:600 }}>
          {filtres.length} spécialiste{filtres.length!==1?'s':''} trouvé{filtres.length!==1?'s':''}
          {filtre!=='tous' && ` dans ${FILTRES.find(f=>f.key===filtre)?.label}`}
        </div>

        {/* Grille par spécialité */}
        {Object.entries(groupes).map(([spec, docs]) => (
          <div key={spec} style={{ marginBottom:36 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <h2 style={{ fontWeight:800, fontSize:'1.05rem', color:'#0f172a', margin:0 }}>{spec}</h2>
              <span style={{ background:'#eff6ff', color:'#1641C8', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:700 }}>{docs.length}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
              {docs.map(m => (
                <div key={m.nom} style={{ background:'white', borderRadius:18, padding:'20px', border:'1px solid #e2e8f0', cursor:'pointer', transition:'all 0.2s' }}
                  onClick={() => setProfilOpen(m)}
                  onMouseEnter={e => { const d=e.currentTarget; d.style.transform='translateY(-3px)'; d.style.boxShadow='0 8px 32px rgba(22,65,200,0.1)'; d.style.borderColor='#1641C8'+30 }}
                  onMouseLeave={e => { const d=e.currentTarget; d.style.transform='none'; d.style.boxShadow='none'; d.style.borderColor='#e2e8f0' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:16, flexShrink:0 }}>
                      {INITIALES(m.nom)}
                    </div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:14, color:'#0f172a' }}>{m.nom}</div>
                      <div style={{ color:'#1641C8', fontSize:12, fontWeight:600, marginTop:2 }}>{m.specialite}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background: m.disponible!==false ? '#22c55e' : '#f59e0b' }} />
                      <span style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>{m.disponible!==false ? 'Disponible' : 'Occupé'}</span>
                    </div>
                    {m.prix_consultation > 0 && (
                      <span style={{ fontSize:12, color:'#6366f1', fontWeight:700, background:'#f5f3ff', borderRadius:8, padding:'3px 10px' }}>
                        {m.prix_consultation.toLocaleString()} HTG
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop:12, color:'#94a3b8', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
                    <i className="fa-solid fa-phone" style={{ fontSize:10 }} /> {m.telephone}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Popup profil */}
      {profilOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
          onClick={() => setProfilOpen(null)}>
          <div style={{ background:'white', borderRadius:24, padding:36, maxWidth:480, width:'100%', position:'relative' }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setProfilOpen(null)} style={{ position:'absolute', top:16, right:16, background:'#f1f5f9', border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
              <i className="fa-solid fa-times" style={{ fontSize:14 }} />
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:24 }}>
              <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:22 }}>
                {INITIALES(profilOpen.nom)}
              </div>
              <div>
                <h3 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.1rem', margin:'0 0 4px' }}>{profilOpen.nom}</h3>
                <div style={{ color:'#1641C8', fontWeight:700, fontSize:14 }}>{profilOpen.specialite}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background: profilOpen.disponible!==false ? '#22c55e' : '#f59e0b' }} />
                  <span style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>{profilOpen.disponible!==false ? 'Disponible' : 'Actuellement occupé'}</span>
                </div>
              </div>
            </div>

            {profilOpen.parcours && (
              <div style={{ background:'#f8fafc', borderRadius:14, padding:'14px 16px', marginBottom:20 }}>
                <div style={{ fontWeight:700, color:'#374151', fontSize:13, marginBottom:6 }}>Parcours</div>
                <p style={{ color:'#64748b', fontSize:13, lineHeight:1.65, margin:0 }}>{profilOpen.parcours}</p>
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
              <div style={{ background:'#f0fdf4', borderRadius:12, padding:'12px 14px' }}>
                <div style={{ fontSize:11, color:'#16a34a', fontWeight:700, textTransform:'uppercase' as const, marginBottom:4 }}>Consultation</div>
                <div style={{ fontSize:15, fontWeight:800, color:'#0f172a' }}>
                  {profilOpen.prix_consultation > 0 ? `${profilOpen.prix_consultation.toLocaleString()} HTG` : 'Sur devis'}
                </div>
              </div>
              <div style={{ background:'#eff6ff', borderRadius:12, padding:'12px 14px' }}>
                <div style={{ fontSize:11, color:'#1641C8', fontWeight:700, textTransform:'uppercase' as const, marginBottom:4 }}>Contact clinique</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{profilOpen.telephone}</div>
              </div>
            </div>

            <button onClick={() => { setProfilOpen(null); setRdvOpen(true) }} style={{ width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:14, padding:'13px 0', fontWeight:700, fontSize:'0.95rem', cursor:'pointer' }}>
              <i className="fa-solid fa-calendar-plus" style={{ marginRight:8 }} />Prendre rendez-vous
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
