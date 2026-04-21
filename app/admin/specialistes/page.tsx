'use client'
// app/admin/specialistes/page.tsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { specialistesApi } from '@/lib/api'
import { Specialiste } from '@/types'
import { Trash2 } from 'lucide-react'

const SPECIALITES_LIST = [
  'Chirurgie générale','Neurochirurgie','Neurologie','Orthopédie','Pédiatrie',
  'Dermatologie','Urologie','ORL','Gynécologie','Chirurgie pédiatrique',
  'Médecine interne','Ophtalmologie','Dentisterie','Physiothérapie','Optométrie',
]
const CATEGORIES = [
  { value:'tous', label:'Générale' },{ value:'chir', label:'Chirurgie' },
  { value:'neuro', label:'Neurologie' },{ value:'ped', label:'Pédiatrie' },
  { value:'gyn', label:'Gynécologie' },
]

interface FormData { nom:string; specialite:string; description:string; emoji:string; categorie:string; email:string; telephone:string; ordre:number }

export default function AdminSpecialistes() {
  const [specs, setSpecs]     = useState<Specialiste[]>([])
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { emoji:'👨‍⚕️', categorie:'tous', ordre:0 }
  })

  const load = () => specialistesApi.list().then(r=>setSpecs(r.data)).catch(()=>{})
  useEffect(()=>{ load() },[])

  const onAdd = async (data: FormData) => {
    setLoading(true)
    try {
      await specialistesApi.create(data)
      toast.success(`${data.nom} ajouté`)
      reset({ emoji:'👨‍⚕️', categorie:'tous', ordre:0 })
      load()
    } catch { toast.error("Erreur") }
    finally { setLoading(false) }
  }

  const onDelete = async (s: Specialiste) => {
    if (!confirm(`Supprimer ${s.nom} ?`)) return
    try { await specialistesApi.delete(s.id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur') }
  }

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold">Gestion des spécialistes</h1>
        <p className="text-slate-500 text-[13px] mt-0.5">Ajouter ou supprimer des médecins</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-extrabold text-[15px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-user-plus text-[#1641C8]"/> Ajouter un spécialiste
          </h3>
          <form onSubmit={handleSubmit(onAdd)} className="space-y-3">
            <div><label className="label">Nom complet *</label>
              <input {...register('nom',{required:true})} className="input" placeholder="Dr. Prénom Nom"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Spécialité *</label>
                <select {...register('specialite',{required:true})} className="input">
                  <option value="">Choisir...</option>
                  {SPECIALITES_LIST.map(s=><option key={s}>{s}</option>)}
                </select></div>
              <div><label className="label">Catégorie filtre</label>
                <select {...register('categorie')} className="input">
                  {CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                </select></div>
            </div>
            <div><label className="label">Description courte</label>
              <input {...register('description')} className="input" placeholder="Spécialisation, expérience..."/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Email professionnel</label>
                <input {...register('email')} type="email" className="input" placeholder="dr@cliniquerebecca.ht"/></div>
              <div><label className="label">Téléphone</label>
                <input {...register('telephone')} className="input" placeholder="+509 3456-7890"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Emoji avatar</label>
                <input {...register('emoji')} className="input text-center text-xl" maxLength={4} placeholder="👨‍⚕️"/></div>
              <div><label className="label">Ordre d'affichage</label>
                <input {...register('ordre',{valueAsNumber:true})} type="number" className="input" min={0}/></div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              <i className="fa-solid fa-user-plus"/> {loading?'Ajout...':'Ajouter le spécialiste'}
            </button>
          </form>
        </div>
        <div className="card p-5">
          <h3 className="font-extrabold text-[15px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-users text-[#1641C8]"/> Spécialistes actifs ({specs.length})
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {specs.map(s=>(
              <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-green-50
                  border-2 border-slate-200 flex items-center justify-center text-xl flex-shrink-0">
                  {s.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[13px] truncate">{s.nom}</div>
                  <div className="text-[#1641C8] text-[11px] font-bold">{s.specialite}</div>
                  {s.description&&<div className="text-slate-400 text-[11px] truncate">{s.description}</div>}
                </div>
                <button onClick={()=>onDelete(s)}
                  className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center
                  hover:bg-red-100 transition-all border-none cursor-pointer flex-shrink-0">
                  <Trash2 size={12}/>
                </button>
              </div>
            ))}
            {specs.length===0&&<div className="text-center text-slate-400 py-8 text-sm">Aucun spécialiste</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
