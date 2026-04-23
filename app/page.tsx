'use client'
// app/medecin/dashboard/page.tsx — Dashboard spécialiste complet
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { rdvApi, actesApi, specialistesApi } from '@/lib/api'
import { RendezVous, Acte, TypeActe, Specialiste } from '@/types'
import { LogOut, Edit2, Save, X, Users, Calendar, TrendingUp, Star, Plus } from 'lucide-react'

const STATUS_RDV: Record<string, {label:string;cls:string}> = {
  en_attente: {label:'En attente', cls:'badge-yellow'},
  confirme: {label:'Confirmé', cls:'badge-green'},
  annule: {label:'Annulé', cls:'badge-red'},
  termine: {label:'Terminé', cls:'badge-gray'},
}

const TYPES_ACTE: {value:TypeActe;label:string;cls:string}[] = [
  {value:'consultation', label:'Consultation', cls:'badge-blue'},
  {value:'observation', label:'Observation', cls:'badge-gray'},
  {value:'geste', label:'Geste médical', cls:'badge-green'},
  {value:'intervention', label:'Intervention', cls:'badge-yellow'},
  {value:'hospitalisation', label:'Hospitalisation', cls:'badge-red'},
]

type Onglet = 'dashboard' | 'rdv' | 'patients' | 'profil'

interface ActeForm { patient_id:string; patient_nom:string; type_acte:TypeActe; service:string; description:string; notes:string; date_acte:string }

export default function MedecinDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [onglet, setOnglet] = useState<Onglet>('dashboard')
  const [rdvs, setRdvs] = useState<RendezVous[]>([])
  const [actes, setActes] = useState<Acte[]>([])
  const [showActeForm, setShowActeForm] = useState(false)
  const [periodeDebut, setPeriodeDebut] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10))
  const [periodeFin, setPeriodeFin] = useState(new Date().toISOString().slice(0,10))
  const [editProfil, setEditProfil] = useState(false)
  const [profilData, setProfilData] = useState({ bio:'', specialite:'', telephone:'', disponibilites:'Lun-Ven 08h-17h' })
  const { register, handleSubmit, reset } = useForm<ActeForm>({
    defaultValues: { type_acte:'consultation', date_acte: new Date().toISOString().slice(0,16) }
  })

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'medecin')) router.push('/login')
  }, [isAuthenticated, user, loading])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'medecin') return
    rdvApi.medecinList().then(r => setRdvs(r.data)).catch(() => {})
    actesApi.list().then(r => setActes(r.data)).catch(() => {})
  }, [isAuthenticated, user])

  const onAddActe = async (data: ActeForm) => {
    try {
      await actesApi.create({ ...data, date_acte: new Date(data.date_acte).toISOString() })
      toast.success('Acte enregistré ✓')
      reset({ type_acte:'consultation', date_acte: new Date().toISOString().slice(0,16) })
      setShowActeForm(false)
      actesApi.list().then(r => setActes(r.data)).catch(() => {})
    } catch { toast.error('Erreur lors de l\'enregistrement') }
  }

  // Demo data
  const DEMO_ACTES: Acte[] = [
    {id:1, patient_id:'#RB-042', patient_nom:'Marie Théodore', type_acte:'consultation', service:'Gynécologie', description:'Suivi grossesse T2', notes:'Tension normale', date_acte:new Date().toISOString(), medecin_id:user?.id||0, medecin_nom:user?.nom||''},
    {id:2, patient_id:'#RB-039', patient_nom:'Paul Jean-Baptiste', type_acte:'observation', service:'Médecine interne', description:'Observation 24h — diabète', notes:'Glycémie à surveiller', date_acte:new Date().toISOString(), medecin_id:user?.id||0, medecin_nom:user?.nom||''},
    {id:3, patient_id:'#RB-031', patient_nom:'Rose Étienne', type_acte:'geste', service:'Gestes médicaux', description:'Perfusion IV — déshydratation', notes:'', date_acte:new Date(Date.now()-86400000).toISOString(), medecin_id:user?.id||0, medecin_nom:user?.nom||''},
    {id:4, patient_id:'#RB-028', patient_nom:'Jean Dorval', type_acte:'consultation', service:'Médecine interne', description:'Hypertension — ajustement traitement', notes:'', date_acte:new Date(Date.now()-86400000).toISOString(), medecin_id:user?.id||0, medecin_nom:user?.nom||''},
    {id:5, patient_id:'#RB-021', patient_nom:'Nadia François', type_acte:'consultation', service:'Gynécologie', description:'Bilan de santé annuel', notes:'', date_acte:new Date(Date.now()-172800000).toISOString(), medecin_id:user?.id||0, medecin_nom:user?.nom||''},
  ]
  const DEMO_RDV: RendezVous[] = [
    {id:1, patient_nom:'Marie Théodore', patient_telephone:'+509 3111-2222', patient_email:null, specialite:'Gynécologie', date_rdv:new Date(Date.now()+3600000).toISOString(), type_rdv:'presentiel', statut:'confirme', motif:'Suivi grossesse', notes_admin:null, mode_paiement:'Espèces', rappel_envoye:true, created_at:new Date().toISOString()},
    {id:2, patient_nom:'Jean Dorval', patient_telephone:'+509 3333-4444', patient_email:null, specialite:'Médecine interne', date_rdv:new Date(Date.now()+7200000).toISOString(), type_rdv:'presentiel', statut:'en_attente', motif:'Contrôle tension', notes_admin:null, mode_paiement:null, rappel_envoye:false, created_at:new Date().toISOString()},
    {id:3, patient_nom:'Rose Étienne', patient_telephone:'+509 3555-6666', patient_email:'rose@email.com', specialite:'Gynécologie', date_rdv:new Date(Date.now()+86400000).toISOString(), type_rdv:'video', statut:'confirme', motif:'Consultation en ligne', notes_admin:null, mode_paiement:'Moncash', rappel_envoye:true, lien_video:'https://meet.jit.si/cr-abc123', created_at:new Date().toISOString()},
  ]

  const displayActes = actes.length > 0 ? actes : DEMO_ACTES
  const displayRdv = rdvs.length > 0 ? rdvs : DEMO_RDV

  // Stats calculées sur la période
  const actesFiltered = displayActes.filter(a => {
    const d = new Date(a.date_acte)
    return d >= new Date(periodeDebut) && d <= new Date(periodeFin)
  })
  const patientsUniques = new Set(actesFiltered.map(a => a.patient_id)).size
  const rdvAujourd = displayRdv.filter(r => new Date(r.date_rdv).toDateString() === new Date().toDateString()).length

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0f172a] h-[70px] flex items-center px-6 gap-4 flex-shrink-0">
        <div className="text-white font-bold flex items-center gap-2">
          <i className="fa-solid fa-user-doctor text-[#1641C8]"/>
          Dr. {user?.nom}
        </div>
        {user?.role && <span className="badge-blue text-xs">{(user as any).specialite || 'Médecin'}</span>}
        <nav className="flex gap-1 ml-6">
          {([
            {key:'dashboard', icon:'fa-chart-line', label:'Tableau de bord'},
            {key:'rdv', icon:'fa-calendar-check', label:'Rendez-vous'},
            {key:'patients', icon:'fa-users', label:'Mes patients'},
            {key:'profil', icon:'fa-id-card', label:'Mon profil'},
          ] as const).map(t => (
            <button key={t.key} onClick={() => setOnglet(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-all
              ${onglet === t.key ? 'bg-[#1641C8] text-white' : 'text-white/60 hover:text-white hover:bg-white/10 bg-transparent'}`}>
              <i className={`fa-solid ${t.icon} text-xs`}/> {t.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href={`/specialistes/${user?.id || 1}`} target="_blank"
            className="text-white/50 hover:text-white text-xs flex items-center gap-1 no-underline transition-colors">
            <i className="fa-solid fa-eye text-xs"/> Mon profil public
          </Link>
          <button onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-1.5 text-white/40 hover:text-red-400 text-xs border-none bg-transparent cursor-pointer ml-3">
            <LogOut size={13}/> Déconnexion
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7">
        {/* ── TABLEAU DE BORD ───────────────────────────────────────────── */}
        {onglet === 'dashboard' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-extrabold">Mon tableau de bord</h1>
                <p className="text-slate-400 text-sm mt-0.5">Bienvenue Dr. {user?.nom?.split(' ').pop()}</p>
              </div>
              {/* Sélecteur période */}
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
                <span className="text-xs font-bold text-slate-500">Période :</span>
                <input type="date" value={periodeDebut} onChange={e => setPeriodeDebut(e.target.value)}
                  className="text-xs border-none bg-transparent outline-none font-semibold text-slate-700 cursor-pointer"/>
                <span className="text-slate-300">→</span>
                <input type="date" value={periodeFin} onChange={e => setPeriodeFin(e.target.value)}
                  className="text-xs border-none bg-transparent outline-none font-semibold text-slate-700 cursor-pointer"/>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                {icon:'fa-calendar-check', color:'#1641C8', bg:'rgba(22,65,200,0.1)', v:rdvAujourd, l:"RDV aujourd'hui"},
                {icon:'fa-file-medical', color:'#22c55e', bg:'rgba(34,197,94,0.1)', v:actesFiltered.length, l:'Actes sur la période'},
                {icon:'fa-users', color:'#d97706', bg:'rgba(245,158,11,0.1)', v:patientsUniques, l:'Patients uniques'},
                {icon:'fa-star', color:'#8b5cf6', bg:'rgba(139,92,246,0.1)', v:'4.8/5', l:'Note patients'},
              ].map(k => (
                <div key={k.l} className="kpi-card">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{background:k.bg, color:k.color}}>
                    <i className={`fa-solid ${k.icon}`}/>
                  </div>
                  <div className="text-2xl font-extrabold mb-0.5" style={{color:k.color}}>{k.v}</div>
                  <div className="text-xs text-slate-500 font-semibold">{k.l}</div>
                </div>
              ))}
            </div>

            {/* Prochain RDV + bouton nouvel acte */}
            <div className="grid grid-cols-2 gap-5 mb-6">
              <div className="card p-5">
                <h4 className="font-extrabold text-[14px] mb-4 flex items-center gap-2">
                  <Calendar size={15} className="text-[#1641C8]"/> Prochains rendez-vous
                </h4>
                {displayRdv.slice(0,3).map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                    <div className="flex-1">
                      <div className="font-bold text-sm">{r.patient_nom}</div>
                      <div className="text-slate-400 text-xs">
                        {new Date(r.date_rdv).toLocaleString('fr-FR', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                        {r.type_rdv === 'video' && <span className="ml-2 text-[#1641C8] font-bold">📹 Vidéo</span>}
                      </div>
                    </div>
                    <span className={STATUS_RDV[r.statut]?.cls || 'badge-gray'}>{STATUS_RDV[r.statut]?.label}</span>
                    {r.lien_video && (
                      <a href={r.lien_video} target="_blank" rel="noreferrer"
                        className="px-2 py-1 bg-[#1641C8] text-white text-xs font-bold rounded-lg no-underline">
                        Rejoindre
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-extrabold text-[14px] flex items-center gap-2">
                    <Plus size={15} className="text-[#1641C8]"/> Saisir un acte médical
                  </h4>
                  <button onClick={() => setShowActeForm(!showActeForm)} className="btn-sm bg-[#1641C8] text-white px-3 py-1.5">
                    {showActeForm ? 'Fermer' : 'Nouveau'}
                  </button>
                </div>
                {showActeForm ? (
                  <form onSubmit={handleSubmit(onAddActe)} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label">ID Patient</label>
                        <input {...register('patient_id',{required:true})} className="input text-sm py-2" placeholder="#RB-000"/>
                      </div>
                      <div>
                        <label className="label">Nom patient</label>
                        <input {...register('patient_nom',{required:true})} className="input text-sm py-2" placeholder="Nom complet"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label">Type acte</label>
                        <select {...register('type_acte')} className="input text-sm py-2">
                          {TYPES_ACTE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Service</label>
                        <input {...register('service',{required:true})} className="input text-sm py-2" placeholder="Ex: Gynécologie"/>
                      </div>
                    </div>
                    <div>
                      <label className="label">Description</label>
                      <input {...register('description')} className="input text-sm py-2" placeholder="Description de l'acte"/>
                    </div>
                    <div>
                      <label className="label">Notes cliniques</label>
                      <textarea {...register('notes')} className="input text-sm py-2 resize-none" rows={2} placeholder="Observations..."/>
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center text-sm py-2">
                      <i className="fa-solid fa-save"/> Enregistrer l'acte
                    </button>
                  </form>
                ) : (
                  <div className="space-y-2">
                    {displayActes.slice(0,3).map(a => {
                      const t = TYPES_ACTE.find(x => x.value === a.type_acte)
                      return (
                        <div key={a.id} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                          <span className={t?.cls || 'badge-gray'}>{t?.label}</span>
                          <span className="font-semibold flex-1">{a.patient_nom}</span>
                          <span className="text-slate-400">{a.service}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── RENDEZ-VOUS ───────────────────────────────────────────────── */}
        {onglet === 'rdv' && (
          <div>
            <h2 className="text-xl font-extrabold mb-6">Mes rendez-vous</h2>
            <div className="card overflow-hidden">
              <table className="tbl">
                <thead><tr><th>Patient</th><th>Téléphone</th><th>Date & heure</th><th>Type</th><th>Statut</th><th>Action</th></tr></thead>
                <tbody>
                  {displayRdv.map(r => (
                    <tr key={r.id}>
                      <td className="font-semibold">{r.patient_nom}</td>
                      <td className="text-slate-500 text-xs">{r.patient_telephone}</td>
                      <td className="text-xs font-medium">
                        {new Date(r.date_rdv).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'})}
                      </td>
                      <td>{r.type_rdv === 'video' ? <span className="badge-blue">📹 Vidéo</span> : <span className="badge-gray">En personne</span>}</td>
                      <td><span className={STATUS_RDV[r.statut]?.cls}>{STATUS_RDV[r.statut]?.label}</span></td>
                      <td>
                        {r.lien_video && (
                          <a href={r.lien_video} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 px-2 py-1 bg-[#1641C8] text-white text-xs font-bold rounded-lg no-underline">
                            Rejoindre
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PATIENTS VUS ──────────────────────────────────────────────── */}
        {onglet === 'patients' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold">Patients vus</h2>
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2.5">
                <input type="date" value={periodeDebut} onChange={e => setPeriodeDebut(e.target.value)}
                  className="text-xs border-none bg-transparent outline-none font-semibold cursor-pointer"/>
                <span className="text-slate-300">→</span>
                <input type="date" value={periodeFin} onChange={e => setPeriodeFin(e.target.value)}
                  className="text-xs border-none bg-transparent outline-none font-semibold cursor-pointer"/>
              </div>
            </div>
            <div className="card overflow-hidden">
              <table className="tbl">
                <thead><tr><th>Date</th><th>Patient</th><th>Code</th><th>Service</th><th>Type acte</th><th>Description</th></tr></thead>
                <tbody>
                  {actesFiltered.map(a => {
                    const t = TYPES_ACTE.find(x => x.value === a.type_acte)
                    return (
                      <tr key={a.id}>
                        <td className="text-xs text-slate-400">{new Date(a.date_acte).toLocaleDateString('fr-FR')}</td>
                        <td className="font-semibold text-sm">{a.patient_nom}</td>
                        <td><span className="font-extrabold text-[#1641C8] text-xs">{a.patient_id}</span></td>
                        <td className="text-slate-600 text-xs">{a.service}</td>
                        <td><span className={t?.cls || 'badge-gray'}>{t?.label}</span></td>
                        <td className="text-slate-600 text-xs max-w-[200px] truncate">{a.description}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PROFIL ────────────────────────────────────────────────────── */}
        {onglet === 'profil' && (
          <div className="max-w-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold">Mon profil</h2>
              <button onClick={() => setEditProfil(!editProfil)} className="btn-ghost text-sm">
                {editProfil ? <><X size={14}/> Annuler</> : <><Edit2 size={14}/> Modifier</>}
              </button>
            </div>

            <div className="card p-6 mb-5">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center text-4xl">
                  👨‍⚕️
                </div>
                <div>
                  <h3 className="font-extrabold text-xl">{user?.nom}</h3>
                  <div className="text-slate-400 text-sm">{profilData.specialite || (user as any)?.specialite || 'Médecin'}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{user?.email}</div>
                </div>
              </div>

              {editProfil ? (
                <div className="space-y-3">
                  <div>
                    <label className="label">Spécialité affichée</label>
                    <input value={profilData.specialite} onChange={e => setProfilData(p => ({...p, specialite:e.target.value}))}
                      className="input" placeholder="Ex: Gynécologie-Obstétrique"/>
                  </div>
                  <div>
                    <label className="label">Téléphone / WhatsApp</label>
                    <input value={profilData.telephone} onChange={e => setProfilData(p => ({...p, telephone:e.target.value}))}
                      className="input" placeholder="+509 3xxx-xxxx"/>
                  </div>
                  <div>
                    <label className="label">Biographie (visible sur votre profil public)</label>
                    <textarea value={profilData.bio} onChange={e => setProfilData(p => ({...p, bio:e.target.value}))}
                      className="input resize-none" rows={4} placeholder="Décrivez votre parcours et vos spécialisations..."/>
                  </div>
                  <div>
                    <label className="label">Disponibilités</label>
                    <input value={profilData.disponibilites} onChange={e => setProfilData(p => ({...p, disponibilites:e.target.value}))}
                      className="input" placeholder="Ex: Lun-Ven 08h-17h, Sam 08h-12h"/>
                  </div>
                  <button onClick={() => { toast.success('Profil mis à jour ✓'); setEditProfil(false) }} className="btn-primary">
                    <Save size={14}/> Sauvegarder le profil
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <span className="text-slate-400 text-sm w-28">Téléphone :</span>
                    <span className="font-semibold text-sm">{profilData.telephone || '+509 3456-xxxx'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 text-sm w-28">Disponibilités :</span>
                    <span className="font-semibold text-sm">{profilData.disponibilites}</span>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Biographie :</div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {profilData.bio || 'Cliquez sur "Modifier" pour ajouter votre biographie.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="card p-4 bg-blue-50 border border-blue-100">
              <div className="text-xs font-bold text-[#1641C8] mb-2">Votre profil public</div>
              <p className="text-xs text-slate-500">Les informations de votre profil sont visibles par les patients sur la page des spécialistes.</p>
              <Link href={`/specialistes/${user?.id || 1}`} target="_blank"
                className="btn-secondary inline-flex mt-3 text-xs py-2 no-underline">
                <i className="fa-solid fa-eye"/> Voir mon profil public
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
