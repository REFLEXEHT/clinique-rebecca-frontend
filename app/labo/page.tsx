'use client'
// app/labo/page.tsx — Espace technicien de laboratoire
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { laboApi } from '@/lib/api'
import { ResultatLabo } from '@/types'
import { Plus, X } from 'lucide-react'

const EXAMENS = [
  'NFS (Numération Formule Sanguine)','Glycémie à jeun','HbA1c','Créatininémie',
  'Transaminases (ALAT/ASAT)','TSH (Thyroïde)','Sérologie VIH','ECBU',
  'Bilan lipidique','Hémoculture','Coproculture','Test de grossesse',
]

interface LaboForm { patient_id:string; patient_nom:string; type_examen:string; resultats:string; notes:string; date_examen:string }

export default function LaboPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [resultats, setResultats] = useState<ResultatLabo[]>([])
  const [showForm, setShowForm]   = useState(false)
  const { register, handleSubmit, reset } = useForm<LaboForm>({
    defaultValues: { date_examen: new Date().toISOString().slice(0,16) }
  })

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'labo')) router.push('/login')
  }, [isAuthenticated, user, loading])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'labo') {
      laboApi.list().then(r=>setResultats(r.data)).catch(()=>setResultats([]))
    }
  }, [isAuthenticated, user])

  const onSubmit = async (data: LaboForm) => {
    try {
      await laboApi.create({ ...data, date_examen: new Date(data.date_examen).toISOString() })
      toast.success('Résultat enregistré — envoi WhatsApp/Email au patient')
      reset({ date_examen: new Date().toISOString().slice(0,16) })
      setShowForm(false)
      laboApi.list().then(r=>setResultats(r.data)).catch(()=>{})
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await laboApi.update(id, { status })
      setResultats(prev=>prev.map(r=>r.id===id?{...r,status:status as any}:r))
      if (status==='envoye') toast.success('Résultats envoyés au patient ✓')
    } catch { toast.error('Erreur') }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>

  const demoResultats: ResultatLabo[] = [
    { id:1, patient_id:'#RB-042', patient_nom:'Marie Théodore', type_examen:'NFS', resultats:'Hb: 12g/dL, GB: 7800/mm³', notes:'Normal', date_examen: new Date().toISOString(), technicien_id: user?.id||0, status:'disponible' },
    { id:2, patient_id:'#RB-039', patient_nom:'Paul Jean-Baptiste', type_examen:'Glycémie', resultats:'1.26 g/L (à jeun)', notes:'Légèrement élevé', date_examen: new Date().toISOString(), technicien_id: user?.id||0, status:'en_attente' },
  ]
  const display = resultats.length>0 ? resultats : demoResultats
  const en_attente = display.filter(r=>r.status==='en_attente').length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#0f172a] h-[70px] flex items-center px-6 gap-4">
        <Link href="/" className="text-white/60 hover:text-white text-sm no-underline transition-colors">
          <i className="fa-solid fa-arrow-left mr-2"/>Accueil
        </Link>
        <h1 className="text-white font-bold ml-2">Espace Laboratoire</h1>
        <div className="ml-auto text-white/60 text-sm">
          <i className="fa-solid fa-flask-vial text-[#1641C8] mr-1.5"/>{user?.nom}
        </div>
      </div>

      <div className="p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold">Résultats de laboratoire</h1>
            <p className="text-slate-500 text-[13px] mt-0.5">Saisie et envoi des résultats d'examens aux patients</p>
          </div>
          <button onClick={()=>setShowForm(true)} className="btn-primary">
            <Plus size={15}/> Saisir un résultat
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="kpi-card"><div className="text-2xl font-black text-[#1641C8] mb-1">{display.length}</div><div className="text-xs text-slate-500 font-semibold">Total résultats</div></div>
          <div className="kpi-card"><div className="text-2xl font-black text-yellow-600 mb-1">{en_attente}</div><div className="text-xs text-slate-500 font-semibold">En attente de saisie</div></div>
          <div className="kpi-card"><div className="text-2xl font-black text-green-600 mb-1">{display.filter(r=>r.status==='envoye').length}</div><div className="text-xs text-slate-500 font-semibold">Résultats envoyés</div></div>
        </div>

        {showForm&&(
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[15px] flex items-center gap-2">
                <i className="fa-solid fa-flask text-[#1641C8]"/> Saisir un résultat
              </h3>
              <button onClick={()=>setShowForm(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div><label className="label">ID Patient *</label>
                  <input {...register('patient_id',{required:true})} className="input" placeholder="#RB-042"/>
                  <p className="text-xs text-slate-400 mt-1">ID unique du patient dans le système</p></div>
                <div><label className="label">Nom du patient *</label>
                  <input {...register('patient_nom',{required:true})} className="input" placeholder="Marie Théodore"/></div>
                <div><label className="label">Type d'examen *</label>
                  <select {...register('type_examen',{required:true})} className="input">
                    <option value="">Choisir...</option>
                    {EXAMENS.map(e=><option key={e}>{e}</option>)}
                  </select></div>
              </div>
              <div className="mb-3"><label className="label">Résultats *</label>
                <textarea {...register('resultats',{required:true})} className="input resize-none" rows={3} placeholder="Ex: Hb: 12g/dL, GB: 7800/mm³, Plaquettes: 250000/mm³..."/></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="label">Notes / Interprétation</label>
                  <input {...register('notes')} className="input" placeholder="Normal, Légèrement élevé..."/></div>
                <div><label className="label">Date & heure de l'examen</label>
                  <input {...register('date_examen')} type="datetime-local" className="input"/></div>
              </div>
              <div className="notif-box mb-4">
                <i className="fa-brands fa-whatsapp text-green-600 mr-1.5"/>
                <strong>Après enregistrement :</strong> Le patient {`{patient_id}`} recevra automatiquement ses résultats par WhatsApp et email.
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary"><i className="fa-solid fa-save"/> Enregistrer & Envoyer</button>
                <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost">Annuler</button>
              </div>
            </form>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h4 className="font-bold text-[13.5px]">Liste des résultats</h4>
          </div>
          <table className="tbl w-full">
            <thead><tr><th>Date</th><th>Patient ID</th><th>Patient</th><th>Examen</th><th>Résultats (résumé)</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>
              {display.map(r=>(
                <tr key={r.id}>
                  <td className="text-xs text-slate-500 whitespace-nowrap">{new Date(r.date_examen).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})}</td>
                  <td><span className="badge badge-blue font-mono">{r.patient_id}</span></td>
                  <td className="font-semibold text-[13px]">{r.patient_nom}</td>
                  <td className="text-[13px]">{r.type_examen}</td>
                  <td className="text-[12px] text-slate-600 max-w-[200px] truncate">{r.resultats}</td>
                  <td><span className={`badge ${r.status==='envoye'?'badge-green':r.status==='disponible'?'badge-blue':'badge-yellow'}`}>
                    {r.status==='envoye'?'Envoyé':r.status==='disponible'?'Disponible':'En attente'}
                  </span></td>
                  <td>{r.status!=='envoye'&&(
                    <button onClick={()=>updateStatus(r.id,'envoye')}
                      className="text-xs bg-green-100 text-green-700 border-none px-3 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-green-200 transition-all flex items-center gap-1">
                      <i className="fa-brands fa-whatsapp"/> Envoyer
                    </button>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
