'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { rdvApi, actesApi } from '@/lib/api'
import { RendezVous } from '@/types'
import RebeccaAI from '@/components/ui/RebeccaAI'
import { LogOut, Edit2, Save, X, Calendar, Clock, Video, User, Activity, ChevronRight } from 'lucide-react'

type Onglet = 'tableau'|'rdv'|'statistiques'|'profil'
type TypeActe = 'consultation'|'geste'|'observation'|'hospitalisation'|'chirurgie'

const TYPES_ACTE = [
  { value:'consultation' as TypeActe, label:'Consultation', couleur:'#1641C8', bg:'#eff6ff' },
  { value:'geste' as TypeActe, label:'Geste médical', couleur:'#16a34a', bg:'#f0fdf4' },
  { value:'observation' as TypeActe, label:'Observation', couleur:'#d97706', bg:'#fffbeb' },
  { value:'hospitalisation' as TypeActe, label:'Hospitalisation', couleur:'#dc2626', bg:'#fef2f2' },
  { value:'chirurgie' as TypeActe, label:'Chirurgie', couleur:'#7c3aed', bg:'#f5f3ff' },
]

const STATUT_MAP: Record<string,{label:string;couleur:string;bg:string}> = {
  en_attente:{ label:'En attente', couleur:'#d97706', bg:'#fffbeb' },
  confirme:{ label:'Confirmé', couleur:'#16a34a', bg:'#f0fdf4' },
  annule:{ label:'Annulé', couleur:'#dc2626', bg:'#fef2f2' },
  termine:{ label:'Terminé', couleur:'#64748b', bg:'#f8fafc' },
}

const DEMO_RDV: RendezVous[] = [
  { id:1, patient_nom:'Marie Théodore', patient_telephone:'+509 3111-2222', patient_email:null, specialite:'Gynécologie', date_rdv:"2026-04-26T13:00:00.000Z", type_rdv:'presentiel', statut:'confirme', motif:'Suivi grossesse T2', notes_admin:null, mode_paiement:'Espèces', rappel_envoye:true, created_at:"2026-04-26T12:00:00.000Z" },
  { id:2, patient_nom:'Jean Dorval', patient_telephone:'+509 3333-4444', patient_email:null, specialite:'Médecine interne', date_rdv:"2026-04-26T14:00:00.000Z", type_rdv:'presentiel', statut:'en_attente', motif:'Contrôle tension', notes_admin:null, mode_paiement:null, rappel_envoye:false, created_at:"2026-04-26T12:00:00.000Z" },
  { id:3, patient_nom:'Rose Étienne', patient_telephone:'+509 3555-6666', patient_email:'rose@email.com', specialite:'Gynécologie', date_rdv:"2026-04-27T12:00:00.000Z", type_rdv:'video', statut:'confirme', motif:'Consultation en ligne', notes_admin:null, mode_paiement:'Moncash', rappel_envoye:true, lien_video:'https://meet.jit.si/cr-abc123', created_at:"2026-04-26T12:00:00.000Z" },
  { id:4, patient_nom:'Claudette Marcelin', patient_telephone:'+509 3777-8888', patient_email:null, specialite:'Gynécologie', date_rdv:"2026-04-28T12:00:00.000Z", type_rdv:'presentiel', statut:'en_attente', motif:'Bilan prénatal', notes_admin:null, mode_paiement:'Espèces', rappel_envoye:false, created_at:"2026-04-26T12:00:00.000Z" },
]

const DEMO_ACTES: any[] = [
  { id:1, patient_id:'#RB-042', patient_nom:'Marie Théodore', type_acte:'consultation', specialite:'Gynécologie', description:'Suivi grossesse T2 — tout normal', notes:'Tension 120/80', date_acte:"2026-04-25T12:00:00.000Z" },
  { id:2, patient_id:'#RB-039', patient_nom:'Paul Jean-Baptiste', type_acte:'observation', specialite:'Médecine interne', description:'Observation 24h — diabète T2', notes:'Glycémie 280 mg/dL', date_acte:"2026-04-24T12:00:00.000Z" },
  { id:3, patient_id:'#RB-031', patient_nom:'Rose Étienne', type_acte:'geste', specialite:'Gestes médicaux', description:'Perfusion IV — déshydratation', notes:'Résolution en 3h', date_acte:"2026-04-23T12:00:00.000Z" },
  { id:4, patient_id:'#RB-028', patient_nom:'Jean Dorval', type_acte:'consultation', specialite:'Médecine interne', description:'HTA — ajustement Amlodipine', notes:'Contrôle dans 2 semaines', date_acte:"2026-04-23T12:00:00.000Z" },
  { id:5, patient_id:'#RB-021', patient_nom:'Nadia François', type_acte:'consultation', specialite:'Gynécologie', description:'Bilan santé annuel', notes:'RAS', date_acte:"2026-04-21T12:00:00.000Z" },
  { id:6, patient_id:'#RB-015', patient_nom:'Luc Desrosiers', type_acte:'geste', specialite:'Gestes médicaux', description:'Injection IM B12', notes:'', date_acte:"2026-02-25T12:00:00.000Z" },
  { id:7, patient_id:'#RB-011', patient_nom:'Ange-Marie Pierre', type_acte:'chirurgie', specialite:'Chirurgie', description:'Appendicectomie laparoscopique', notes:'Suites simples', date_acte:"2026-01-16T12:00:00.000Z" },
]

const fmtDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
const fmtHeure = (d:string) => new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})

export default function MedecinDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [onglet, setOnglet] = useState<Onglet>('tableau')
  const [rdvs, setRdvs] = useState<RendezVous[]>([])
  const [actes, setActes] = useState<any[]>([])
  const [editProfil, setEditProfil] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [profil, setProfil] = useState({ bio:'', telephone:'', disponibilites:'Lun–Ven 07h–17h · Sam 07h–12h' })

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'medecin')) router.push('/login')
  }, [isAuthenticated, user, loading])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'medecin') return
    rdvApi.medecinList().then(r => setRdvs(r.data||[])).catch(() => {})
    actesApi.list().then(r => setActes(r.data||[])).catch(() => {})
  }, [isAuthenticated, user])

  const displayRdv = rdvs.length > 0 ? rdvs : DEMO_RDV
  const displayActes = actes.length > 0 ? actes : DEMO_ACTES

  const now = new Date()
  const sixMoisAvant = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
  const actes6mois = displayActes.filter(a => new Date(a.date_acte) >= sixMoisAvant)

  const rdvAVenir = displayRdv.filter(r => new Date(r.date_rdv) > now && r.statut !== 'annule')
  const rdvAujourd = displayRdv.filter(r => new Date(r.date_rdv).toDateString() === now.toDateString())

  const statsActes = TYPES_ACTE.map(t => ({ ...t, count: actes6mois.filter(a => a.type_acte === t.value).length }))

  // Stats par mois (6 mois)
  const statsParMois = Array.from({length:6}).map((_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1)
    const moisLabel = d.toLocaleDateString('fr-FR',{month:'short'})
    const count = actes6mois.filter(a => {
      const ad = new Date(a.date_acte)
      return ad.getMonth()===d.getMonth() && ad.getFullYear()===d.getFullYear()
    }).length
    return { mois:moisLabel, count }
  })
  const maxCount = Math.max(...statsParMois.map(m => m.count), 1)

  if (loading || !isAuthenticated) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid #1641C8', borderTopColor:'transparent' }} /></div>

  const ONGLETS: {key:Onglet;label:string;icon:string}[] = [
    { key:'tableau', label:'Tableau de bord', icon:'fa-grid-2' },
    { key:'rdv', label:'Rendez-vous', icon:'fa-calendar-check' },
    { key:'statistiques', label:'Statistiques', icon:'fa-chart-bar' },
    { key:'profil', label:'Mon profil', icon:'fa-user-doctor' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:'#0f172a', height:64, display:'flex', alignItems:'center', padding:'0 24px', gap:20, flexShrink:0 }}>
        <Link href="/" style={{ color:'rgba(255,255,255,0.5)', fontSize:13, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize:11 }} /> Site
        </Link>
        <div style={{ width:1, height:24, background:'rgba(255,255,255,0.1)' }} />
        <div style={{ fontWeight:800, color:'white', fontSize:'0.95rem' }}>Espace médecin</div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>{user?.nom}</span>
          <button onClick={() => { logout(); router.push('/') }} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:'6px 12px', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:12 }}>
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Navigation onglets */}
      <div style={{ background:'white', borderBottom:'1px solid #e2e8f0', padding:'0 24px', display:'flex', gap:4 }}>
        {ONGLETS.map(o => (
          <button key={o.key} onClick={() => setOnglet(o.key)} style={{ display:'flex', alignItems:'center', gap:8, padding:'14px 18px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:700, borderBottom:`2px solid ${onglet===o.key?'#1641C8':'transparent'}`, color:onglet===o.key?'#1641C8':'#64748b' }}>
            <i className={`fa-solid ${o.icon}`} style={{ fontSize:13 }} /> {o.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, maxWidth:1100, margin:'0 auto', width:'100%', padding:'32px 24px' }}>

        {/* TABLEAU DE BORD */}
        {onglet==='tableau' && (
          <>
            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.4rem', marginBottom:4 }}>Bonjour, {user?.nom?.split(' ').slice(1).join(' ')}</h1>
              <p style={{ color:'#64748b', fontSize:13 }}><span suppressHydrationWarning>{now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span></p>
            </div>

            {/* KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
              {[
                { label:"Aujourd'hui", val:rdvAujourd.length, icon:'fa-calendar-day', couleur:'#1641C8', bg:'#eff6ff' },
                { label:'À venir', val:rdvAVenir.length, icon:'fa-clock', couleur:'#d97706', bg:'#fffbeb' },
                { label:'Actes (6 mois)', val:actes6mois.length, icon:'fa-file-medical', couleur:'#16a34a', bg:'#f0fdf4' },
                { label:'Consultations', val:actes6mois.filter(a=>a.type_acte==='consultation').length, icon:'fa-stethoscope', couleur:'#7c3aed', bg:'#f5f3ff' },
              ].map(k => (
                <div key={k.label} style={{ background:'white', borderRadius:16, padding:'20px', border:'1px solid #e2e8f0' }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                    <i className={`fa-solid ${k.icon}`} style={{ color:k.couleur, fontSize:18 }} />
                  </div>
                  <div style={{ fontSize:'1.8rem', fontWeight:900, color:k.couleur, lineHeight:1 }}>{k.val}</div>
                  <div style={{ color:'#64748b', fontSize:12, marginTop:4, fontWeight:600 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Prochains RDV */}
            <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:'24px', marginBottom:24 }}>
              <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.95rem', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <Calendar size={16} color="#1641C8" /> Prochains rendez-vous
                <span style={{ marginLeft:'auto', background:'#eff6ff', color:'#1641C8', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:700 }}>{rdvAVenir.length}</span>
              </div>
              {rdvAVenir.slice(0,4).map(rdv => {
                const s = STATUT_MAP[rdv.statut]||STATUT_MAP.en_attente
                return (
                  <div key={rdv.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:'1px solid #f1f5f9' }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8' }}>{new Date(rdv.date_rdv).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}).split(' ')[1]?.toUpperCase()}</div>
                      <div style={{ fontSize:16, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{new Date(rdv.date_rdv).getDate()}</div>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:800, color:'#0f172a', fontSize:14 }}>{rdv.patient_nom}</div>
                      <div style={{ color:'#64748b', fontSize:12, marginTop:2 }}>
                        {fmtHeure(rdv.date_rdv)} — {rdv.motif||rdv.specialite}
                        {(rdv as any).type_rdv === 'video' && <span style={{ marginLeft:8, color:'#1641C8', fontWeight:700 }}><Video size={11} style={{ verticalAlign:'middle' }} /> Vidéo</span>}
                      </div>
                    </div>
                    <span style={{ background:s.bg, color:s.couleur, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700 }}>{s.label}</span>
                  </div>
                )
              })}
              {rdvAVenir.length === 0 && <p style={{ color:'#94a3b8', fontSize:13, textAlign:'center', padding:'20px 0' }}>Aucun rendez-vous à venir</p>}
            </div>

            {/* Derniers actes */}
            <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:'24px' }}>
              <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.95rem', marginBottom:16 }}>Derniers actes enregistrés</div>
              {displayActes.slice(0,5).map(a => {
                const t = TYPES_ACTE.find(t=>t.value===a.type_acte)||TYPES_ACTE[0]
                return (
                  <div key={a.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 0', borderBottom:'1px solid #f1f5f9' }}>
                    <span style={{ background:t.bg, color:t.couleur, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700, flexShrink:0 }}>{t.label}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{a.patient_nom} <span style={{ color:'#94a3b8', fontWeight:500 }}>{a.patient_id}</span></div>
                      <div style={{ color:'#64748b', fontSize:12, marginTop:2 }}>{a.description}</div>
                    </div>
                    <span style={{ color:'#94a3b8', fontSize:11, flexShrink:0 }}>{fmtDate(a.date_acte)}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* RENDEZ-VOUS */}
        {onglet==='rdv' && (
          <div>
            <h2 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.2rem', marginBottom:20 }}>Mes rendez-vous</h2>
            <div style={{ display:'grid', gap:12 }}>
              {displayRdv.map(rdv => {
                const s = STATUT_MAP[rdv.statut]||STATUT_MAP.en_attente
                return (
                  <div key={rdv.id} style={{ background:'white', borderRadius:16, padding:'20px 24px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:20 }}>
                    <div style={{ textAlign:'center', minWidth:56 }}>
                      <div style={{ fontSize:22, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{new Date(rdv.date_rdv).getDate()}</div>
                      <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8' }}>{new Date(rdv.date_rdv).toLocaleDateString('fr-FR',{month:'short'}).toUpperCase()}</div>
                      <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{fmtHeure(rdv.date_rdv)}</div>
                    </div>
                    <div style={{ width:1, height:48, background:'#f1f5f9' }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.95rem' }}>{rdv.patient_nom}</div>
                      <div style={{ color:'#64748b', fontSize:13, marginTop:3 }}>{rdv.motif || rdv.specialite}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6 }}>
                        <i className="fa-solid fa-phone" style={{ color:'#94a3b8', fontSize:11 }} />
                        <span style={{ color:'#94a3b8', fontSize:12 }}>{rdv.patient_telephone}</span>
                        {(rdv as any).type_rdv === 'video' && (
                          <span style={{ display:'flex', alignItems:'center', gap:4, color:'#1641C8', fontSize:12, fontWeight:700 }}>
                            <Video size={12} /> Vidéo
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                      <span style={{ background:s.bg, color:s.couleur, borderRadius:8, padding:'4px 12px', fontSize:12, fontWeight:700 }}>{s.label}</span>
                      {(rdv as any).lien_video && (
                        <a href={(rdv as any).lien_video} target="_blank" rel="noreferrer"
                          style={{ display:'flex', alignItems:'center', gap:6, background:'#1641C8', color:'white', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:700, textDecoration:'none' }}>
                          <Video size={12} /> Rejoindre
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STATISTIQUES */}
        {onglet==='statistiques' && (
          <div>
            <h2 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.2rem', marginBottom:20 }}>Statistiques — 6 derniers mois</h2>

            {/* Graphique barres par mois */}
            <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:'24px', marginBottom:20 }}>
              <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.95rem', marginBottom:20 }}>Actes médicaux par mois</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:140 }}>
                {statsParMois.map(m => (
                  <div key={m.mois} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'#64748b' }}>{m.count}</span>
                    <div style={{ width:'100%', background:'#1641C8', borderRadius:6, height: m.count > 0 ? `${Math.max(8,(m.count/maxCount)*100)}%` : 4, opacity:m.count>0?1:0.15 }} />
                    <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{m.mois}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Par type d'acte */}
            <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:'24px', marginBottom:20 }}>
              <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.95rem', marginBottom:16 }}>Répartition par type</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12 }}>
                {statsActes.map(s => (
                  <div key={s.value} style={{ background:s.bg, borderRadius:14, padding:'16px' }}>
                    <div style={{ fontSize:'1.8rem', fontWeight:900, color:s.couleur }}>{s.count}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:s.couleur, marginTop:4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actes récents */}
            <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:'24px' }}>
              <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.95rem', marginBottom:16 }}>Détail des actes</div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Date','Patient','Code','Type','Description'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left', color:'#64748b', fontWeight:700, fontSize:12, borderBottom:'1px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {actes6mois.map(a => {
                    const t = TYPES_ACTE.find(t=>t.value===a.type_acte)||TYPES_ACTE[0]
                    return (
                      <tr key={a.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                        <td style={{ padding:'10px 14px', color:'#64748b' }}>{fmtDate(a.date_acte)}</td>
                        <td style={{ padding:'10px 14px', fontWeight:700, color:'#0f172a' }}>{a.patient_nom}</td>
                        <td style={{ padding:'10px 14px', color:'#94a3b8' }}>{a.patient_id}</td>
                        <td style={{ padding:'10px 14px' }}><span style={{ background:t.bg, color:t.couleur, borderRadius:8, padding:'3px 8px', fontSize:11, fontWeight:700 }}>{t.label}</span></td>
                        <td style={{ padding:'10px 14px', color:'#64748b', maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.description}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROFIL */}
        {onglet==='profil' && (
          <div style={{ maxWidth:560 }}>
            <h2 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.2rem', marginBottom:20 }}>Mon profil</h2>
            <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:32, marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:28 }}>
                <div style={{ width:80, height:80, borderRadius:20, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:24 }}>
                  {user?.nom?.replace('Dr ','').split(' ').map((n:string)=>n[0]||'').slice(0,2).join('')}
                </div>
                <div>
                  <h3 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.1rem', margin:0 }}>{user?.nom}</h3>
                  <div style={{ color:'#1641C8', fontWeight:700, marginTop:4 }}>{user?.specialite||'Médecin'}</div>
                  <div style={{ color:'#64748b', fontSize:13, marginTop:4 }}>{user?.email}</div>
                </div>
              </div>

              {!editProfil ? (
                <>
                  <div style={{ display:'grid', gap:16, marginBottom:24 }}>
                    {[
                      { label:'Téléphone', val:profil.telephone||user?.telephone||'Non renseigné' },
                      { label:'Disponibilités', val:profil.disponibilites },
                      { label:'Bio', val:profil.bio||'Aucune bio renseignée' },
                    ].map(f => (
                      <div key={f.label} style={{ background:'#f8fafc', borderRadius:12, padding:'14px 16px' }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase' as const, marginBottom:4 }}>{f.label}</div>
                        <div style={{ color:'#0f172a', fontSize:14 }}>{f.val}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setEditProfil(true)} style={{ display:'flex', alignItems:'center', gap:8, background:'#1641C8', color:'white', border:'none', borderRadius:12, padding:'11px 20px', fontWeight:700, cursor:'pointer', fontSize:14 }}>
                    <Edit2 size={15} /> Modifier le profil
                  </button>
                </>
              ) : (
                <>
                  {[
                    { label:'Téléphone', key:'telephone', type:'tel' },
                    { label:'Disponibilités', key:'disponibilites', type:'text' },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom:16 }}>
                      <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>{f.label}</label>
                      <input type={f.type} value={(profil as any)[f.key]} onChange={e => setProfil(prev=>({...prev,[f.key]:e.target.value}))}
                        style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const }} />
                    </div>
                  ))}
                  <div style={{ marginBottom:24 }}>
                    <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Bio professionnelle</label>
                    <textarea value={profil.bio} onChange={e => setProfil(prev=>({...prev,bio:e.target.value}))} rows={4} placeholder="Décrivez votre parcours et expertise..."
                      style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, resize:'vertical', boxSizing:'border-box' as const }} />
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => { setEditProfil(false); toast.success('Profil mis à jour') }} style={{ flex:1, background:'#1641C8', color:'white', border:'none', borderRadius:12, padding:'11px 0', fontWeight:700, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <Save size={15} /> Sauvegarder
                    </button>
                    <button onClick={() => setEditProfil(false)} style={{ width:44, background:'#f1f5f9', border:'none', borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
                      <X size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
