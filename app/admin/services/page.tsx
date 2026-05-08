'use client'
// app/admin/services/page.tsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { servicesApi } from '@/lib/api'
import { Service } from '@/types'
import { Trash2 } from 'lucide-react'

const COULEURS = [
 { label: 'Bleu', value: '#1641C8' },
 { label: 'Vert', value: '#16a34a' },
 { label: 'Orange', value: '#d97706' },
 { label: 'Rose', value: '#be185d' },
 { label: 'Violet', value: '#7c3aed' },
]

interface FormData { nom:string; description:string; icone:string; couleur:string; ordre:number }

export default function AdminServices() {
 const [services, setServices] = useState<Service[]>([])
 const [loading, setLoading] = useState(false)
 const { register, handleSubmit, reset } = useForm<FormData>({
 defaultValues: { icone:'fa-stethoscope', couleur:'#1641C8', ordre:0 }
 })

 const load = () => servicesApi.list().then(r=>setServices(r.data)).catch(()=>{})
 useEffect(()=>{ load() },[])

 const onAdd = async (data: FormData) => {
 setLoading(true)
 try {
 await servicesApi.create(data)
 toast.success(`Service "${data.nom}" ajouté`)
 reset({ icone:'fa-stethoscope', couleur:'#1641C8', ordre:0 })
 load()
 } catch { toast.error("Erreur lors de l'ajout") }
 finally { setLoading(false) }
 }

 const onDelete = async (svc: Service) => {
 if (!confirm(`Supprimer "${svc.nom}" ?`)) return
 try { await servicesApi.delete(svc.id); toast.success('Service supprimé'); load() }
 catch { toast.error('Erreur') }
 }

 return (
 <div className="p-7">
 <div className="mb-6">
 <h1 className="text-xl font-extrabold">Gestion des services</h1>
 <p className="text-slate-500 text-[13px] mt-0.5">Ajouter ou supprimer les services affichés sur le site</p>
 </div>
 <div className="grid grid-cols-2 gap-6">
 <div className="card p-5">
 <h3 className="font-extrabold text-[15px] mb-4 flex items-center gap-2">
 <i className="fa-solid fa-plus-circle text-[#1641C8]"/> Ajouter un service
 </h3>
 <form onSubmit={handleSubmit(onAdd)} className="space-y-3">
 <div><label className="label">Nom *</label>
 <input {...register('nom',{required:true})} className="input" placeholder="Ex: Cardiologie"/></div>
 <div><label className="label">Icône (Font Awesome)</label>
 <input {...register('icone')} className="input" placeholder="fa-heart"/>
 <p className="text-xs text-slate-400 mt-1">Rechercher sur fontawesome.com/icons</p></div>
 <div><label className="label">Description</label>
 <textarea {...register('description')} className="input resize-none" rows={2}
 placeholder="Description courte du service..."/></div>
 <div className="grid grid-cols-2 gap-3">
 <div><label className="label">Couleur</label>
 <select {...register('couleur')} className="input">
 {COULEURS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
 </select></div>
 <div><label className="label">Ordre</label>
 <input {...register('ordre',{valueAsNumber:true})} type="number" className="input"/></div>
 </div>
 <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
 <i className="fa-solid fa-plus"/> {loading?'Ajout...':'Ajouter'}
 </button>
 </form>
 </div>
 <div className="card p-5">
 <h3 className="font-extrabold text-[15px] mb-4 flex items-center gap-2">
 <i className="fa-solid fa-list text-[#1641C8]"/> Services actifs ({services.length})
 </h3>
 <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
 {services.map(s=>(
 <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
 <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
 style={{background:`${s.couleur}18`,color:s.couleur}}>
 <i className={`fa-solid ${s.icone}`}/>
 </div>
 <div className="flex-1 min-w-0">
 <div className="font-bold text-[13px] truncate">{s.nom}</div>
 <div className="text-slate-400 text-[11px] truncate">{s.description}</div>
 </div>
 <button onClick={()=>onDelete(s)}
 className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center
 hover:bg-red-100 transition-all border-none cursor-pointer flex-shrink-0">
 <Trash2 size={12}/>
 </button>
 </div>
 ))}
 {services.length===0&&<div className="text-center text-slate-400 py-8 text-sm">Aucun service</div>}
 </div>
 </div>
 </div>
 </div>
 )
}
