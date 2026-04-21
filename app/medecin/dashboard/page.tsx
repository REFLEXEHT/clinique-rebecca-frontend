'use client'
// app/medecin/dashboard/page.tsx — Dashboard médecin avec actes
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { rdvApi, actesApi } from '@/lib/api'
import { RendezVous, Acte, TypeActe } from '@/types'
import { Plus, X } from 'lucide-react'

const TYPES_ACTE: { value: TypeActe; label: string; color: string }[] = [
  { value:'consultation',    label:'Consultation',    color:'#1641C8' },
  { value:'observation',     label:'Observation',     color:'#475569' },
  { value:'geste',           label:'Geste médical',   color:'#16a34a' },
  { value:'intervention',    label:'Intervention',    color:'#d97706' },
  { value:'hospitalisation', label:'Hospitalisation', color:'#dc2626' },
]
const BADGE_MAP: Record<TypeActe,string> = {
  consultation:'badge-blue', observation:'badge-gray', geste:'badge-green',
  intervention:'badge-yellow', hospitalisation:'badge-red',
}

interface ActeFormData { patient_id:string; patient_nom:string; type_acte:TypeActe; service:string; description:string; notes:string; date_acte:string }

export default function MedecinDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [rdvs, setRdvs]           = useState<RendezVous[]>([])
  const [actes, setActes]         = useState<Acte[]>([])
  const [showActeForm, setShowActeForm] = useState(false)
  const { register, handleSubmit, reset, formState:{errors} } = useForm<ActeFormData>({
    defaultValues: { type_acte:'consultation', date_acte: new Date().toISOString().slice(0,16) }
  })

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'medecin')) {
      router.push('/login')
    }
  }, [isAuthenticated, user, loading])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'medecin') {
      rdvApi.medecinList().then(r=>setRdvs(r.data)).catch(()=>{})
      actesApi.list().then(r=>setActes(r.data)).catch(()=>{})
    }
  }, [isAuthenticated, user])

  const onAddActe = async (data: ActeFormData) => {
    try {
      await actesApi.create({ ...data, date_acte: new Date(data.date_acte).toISOString() })
      toast.success('Acte enregistré')
      reset({ type_acte:'consultation', date_acte: new Date().toISOString().slice(0,16) })
      setShowActeForm(false)
      actesApi.list().then(r=>setActes(r.data)).catch(()=>{})
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>

  // Demo actes
  const demoActes: Acte[] = [
    { id:1, patient_id:'#RB-042', patient_nom:'Marie Théodore', type_acte:'consultation', service:'Gynécologie', description:'Suivi grossesse T2', notes:'', date_acte: new Date().toISOString(), medecin_id: user?.id||0, medecin_nom: user?.nom||'' },
    { id:2, patient_id:'#RB-039', patient_nom:'Lucie Pierre', type_acte:'observation', service:'Pédiatrie', description:'Observation 24h', notes:'Fièvre persistante', date_acte: new Date().toISOString(), medecin_id: user?.id||0, medecin_nom: user?.nom||'' },
    { id:3, patient_id:'#RB-031', patient_nom:'Robert Cajuste', type_acte:'intervention', service:'Salle SOP', description:'Appendicectomie', notes:'Procédure réussie', date_acte: new Date().toISOString(), medecin_id: user?.id||0, medecin_nom: user?.nom||'' },
    { id:4, patient_id:'#RB-028', patient_nom:'Nadia François', type_acte:'geste', service:'Gestes médicaux', description:'Perfusion IV', notes:'Solution saline', date_acte: new Date().toISOString(), medecin_id: user?.id||0, medecin_nom: user?.nom||'' },
    { id:5, patient_id:'#RB-024', patient_nom:'Jean Dorval', type_acte:'hospitalisation', service:'Hospitalisation', description:'3 jours', notes:'Post-opératoire', date_acte: new Date().toISOString(), medecin_id: user?.id||0, medecin_nom: user?.nom||'' },
  ]
  const displayActes = actes.length>0 ? actes : demoActes

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#0f172a] h-[70px] flex items-center px-6 gap-4">
        <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors no-underline">
          <i className="fa-solid fa-arrow-left mr-2"/>Accueil
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-white/70 text-sm">
            <i className="fa-solid fa-user-doctor text-[#1641C8] mr-1.5"/>
            Dr. {user?.nom}
          </span>
        </div>
      </div>

      <div className="p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold">Mon espace médecin</h1>
            <p className="text-slate-500 text-[13px] mt-0.5">
              {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </p>
          </div>
          <button onClick={()=>setShowActeForm(true)} className="btn-primary">
            <Plus size={15}/> Enregistrer un acte
          </button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {TYPES_ACTE.map(t => {
            const count = displayActes.filter(a=>a.type_acte===t.value).length
            return (
              <div key={t.value} className="kpi-card text-center">
                <div className="text-xl font-black mb-1" style={{color:t.color}}>{count}</div>
                <div className="text-[11px] text-slate-500 font-semibold">{t.label}</div>
              </div>
            )
          })}
        </div>

        {/* Formulaire acte */}
        {showActeForm && (
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[15px] flex items-center gap-2">
                <i className="fa-solid fa-clipboard-plus text-[#1641C8]"/> Enregistrer un acte
              </h3>
              <button onClick={()=>setShowActeForm(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={handleSubmit(onAddActe)}>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div><label className="label">ID Patient *</label>
                  <input {...register('patient_id',{required:true})} className="input" placeholder="#RB-042"/></div>
                <div><label className="label">Nom du patient *</label>
                  <input {...register('patient_nom',{required:true})} className="input" placeholder="Jean Paul Marie"/></div>
                <div><label className="label">Type d'acte *</label>
                  <select {...register('type_acte',{required:true})} className="input">
                    {TYPES_ACTE.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div><label className="label">Service *</label>
                  <input {...register('service',{required:true})} className="input" placeholder="Gynécologie, SOP..."/></div>
                <div><label className="label">Date & heure *</label>
                  <input {...register('date_acte',{required:true})} type="datetime-local" className="input"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="label">Description</label>
                  <input {...register('description')} className="input" placeholder="Description de l'acte"/></div>
                <div><label className="label">Notes cliniques</label>
                  <input {...register('notes')} className="input" placeholder="Notes additionnelles"/></div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary"><i className="fa-solid fa-save"/> Enregistrer</button>
                <button type="button" onClick={()=>setShowActeForm(false)} className="btn-ghost">Annuler</button>
              </div>
            </form>
          </div>
        )}

        {/* Actes enregistrés */}
        <div className="card overflow-hidden mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h4 className="font-bold text-[13.5px] flex items-center gap-2">
              <i className="fa-solid fa-clipboard-list text-[#1641C8] text-sm"/> Mes actes — Traçabilité complète
            </h4>
            <span className="badge badge-blue">{displayActes.length} actes</span>
          </div>
          <table className="tbl w-full">
            <thead><tr><th>Date</th><th>Patient ID</th><th>Patient</th><th>Type d'acte</th><th>Service</th><th>Description</th><th>Notes</th></tr></thead>
            <tbody>
              {displayActes.map(a=>(
                <tr key={a.id}>
                  <td className="text-[12px] text-slate-500 whitespace-nowrap">
                    {new Date(a.date_acte).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})}
                  </td>
                  <td><span className="badge badge-blue font-mono">{a.patient_id}</span></td>
                  <td className="font-semibold text-[13px]">{a.patient_nom}</td>
                  <td><span className={`badge ${BADGE_MAP[a.type_acte]}`}>{TYPES_ACTE.find(t=>t.value===a.type_acte)?.label}</span></td>
                  <td className="text-[12.5px]">{a.service}</td>
                  <td className="text-[12.5px] text-slate-600">{a.description || '—'}</td>
                  <td className="text-[12px] text-slate-400">{a.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mes RDV */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h4 className="font-bold text-[13.5px] flex items-center gap-2">
              <i className="fa-regular fa-calendar-check text-[#1641C8] text-sm"/> Mes prochains rendez-vous
            </h4>
          </div>
          {rdvs.length===0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <i className="fa-regular fa-calendar text-3xl mb-2 block opacity-20"/>
              Aucun rendez-vous — connectez l'API pour voir vos RDV
            </div>
          ) : (
            <table className="tbl w-full">
              <thead><tr><th>Date</th><th>Patient</th><th>Spécialité</th><th>Type</th><th>Statut</th></tr></thead>
              <tbody>
                {rdvs.slice(0,10).map(r=>(
                  <tr key={r.id}>
                    <td>{new Date(r.date_rdv).toLocaleDateString('fr-FR')}</td>
                    <td><div className="font-bold text-[13px]">{r.patient_nom}</div><div className="text-slate-400 text-xs">{r.patient_telephone}</div></td>
                    <td>{r.specialite}</td>
                    <td><span className={`badge ${r.type_rdv==='video'?'badge-blue':'badge-gray'}`}>{r.type_rdv==='video'?'Vidéo':'Présentiel'}</span></td>
                    <td><span className={`badge ${r.statut==='confirme'?'badge-green':r.statut==='en_attente'?'badge-yellow':'badge-red'}`}>{r.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
