'use client'
// app/admin/depenses/page.tsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { comptaApi } from '@/lib/api'
import { Mouvement } from '@/types'
import { Plus, Trash2 } from 'lucide-react'

const CATS = ['RH / Salaires','Médical','Pharmacie achats','Infrastructure','Équipements','Télécom','Achats médicaments','Consommables médicaux','Honoraires médecins','Autres charges']
const MODES = ['Espèces','Mobile Money','Virement','Chèque']

interface FormData { description:string; categorie:string; montant:number; date_mouvement:string; mode_paiement:string; notes:string; tiers_nom:string; tiers_type:string }

export default function AdminDepenses() {
 const [mouvements, setMouvements] = useState<Mouvement[]>([])
 const [showForm, setShowForm] = useState(false)
 const { register, handleSubmit, reset } = useForm<FormData>({
 defaultValues: { mode_paiement:'Espèces', date_mouvement: new Date().toISOString().slice(0,16) }
 })

 const load = () => {
 const now = new Date()
 comptaApi.list({ type:'depense', mois: now.getMonth()+1, annee: now.getFullYear() }).then(r=>setMouvements(r.data)).catch(()=>setMouvements([]))
 }
 useEffect(()=>{ load() },[])

 const total = mouvements.reduce((s,m)=>s+m.montant,0)

 const [loadingSubmit, setLoadingSubmit] = useState(false)

 const onSubmit = async (data: FormData) => {
 if (!data.categorie) { return }
 setLoadingSubmit(true)
 try {
 await comptaApi.create({ type:'depense', categorie:data.categorie, description:data.description, montant:Number(data.montant), date_mouvement:new Date(data.date_mouvement).toISOString(), mode_paiement:data.mode_paiement, notes:data.notes||undefined, tiers_nom:data.tiers_nom||undefined, tiers_type:data.tiers_type||'fournisseur' })
 toast.success('Dépense enregistrée')
 reset({ mode_paiement:'Espèces', date_mouvement: new Date().toISOString().slice(0,16) })
 setShowForm(false)
 load()
 } catch (e: any) {
 const detail = e?.response?.data?.detail
 toast.error(detail || 'Erreur enregistrement — vérifiez que la période comptable est ouverte')
 } finally {
 setLoadingSubmit(false)
 }
 }

 const del = async (id: number) => {
 if (!confirm('Supprimer ?')) return
 try { await comptaApi.delete(id); toast.success('Supprimé'); load() }
 catch { toast.error('Erreur') }
 }

 return (
 <div className="p-7">
 <div className="flex items-center justify-between mb-6">
 <div><h1 className="text-xl font-extrabold">Dépenses</h1><p className="text-slate-500 text-[13px] mt-0.5">Charges du mois — {new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</p></div>
 <button onClick={()=>setShowForm(!showForm)} className="btn-primary"><Plus size={15}/> Ajouter une dépense</button>
 </div>
 <div className="grid grid-cols-3 gap-4 mb-6">
 <div className="kpi-card"><div className="text-xl font-black text-red-500 mb-1">−{total.toLocaleString('fr')} HTG</div><div className="text-xs text-slate-500 font-semibold">Total dépenses</div></div>
 <div className="kpi-card"><div className="text-xl font-black text-[#1641C8] mb-1">{mouvements.length}</div><div className="text-xs text-slate-500 font-semibold">Transactions</div></div>
 <div className="kpi-card"><div className="text-xl font-black text-[#d97706] mb-1">{mouvements.length>0?Math.round(total/mouvements.length).toLocaleString('fr'):0} HTG</div><div className="text-xs text-slate-500 font-semibold">Moyenne</div></div>
 </div>
 {showForm&&(
 <div className="card p-5 mb-5">
 <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2"><i className="fa-solid fa-file-invoice text-[#1641C8]"/>Nouvelle dépense</h3>
 <form onSubmit={handleSubmit(onSubmit)}>
 <div className="grid grid-cols-2 gap-4 mb-3">
 <div><label className="label">Description *</label><input {...register('description',{required:true})} className="input" placeholder="Ex: Achat fournitures médicales"/></div>
 <div><label className="label">Catégorie *</label><select {...register('categorie',{required:true})} className="input"><option value="">Choisir...</option>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
 </div>
 <div className="grid grid-cols-2 gap-4 mb-3">
 <div>
 <label className="label">Fournisseur / Bénéficiaire *</label>
 <input {...register('tiers_nom',{required:true})} className="input" placeholder="Nom de la personne ou société payée"/>
 <p className="text-[11px] text-slate-400 mt-1">À qui l'argent a été remis (fournisseur, médecin, employé...)</p>
 </div>
 <div>
 <label className="label">Type de tiers</label>
 <select {...register('tiers_type')} className="input">
 <option value="fournisseur"> Fournisseur / Société</option>
 <option value="medecin">‍ Médecin / Praticien</option>
 <option value="employe"> Employé / Personnel</option>
 <option value="institution"> Institution / Gouvernement</option>
 <option value="autre">Autre</option>
 </select>
 </div>
 </div>
 <div className="grid grid-cols-3 gap-4 mb-4">
 <div><label className="label">Montant (HTG) *</label><input {...register('montant',{required:true,min:0})} type="number" className="input"/></div>
 <div><label className="label">Date & heure</label><input {...register('date_mouvement')} type="datetime-local" className="input"/></div>
 <div><label className="label">Mode de paiement</label><select {...register('mode_paiement')} className="input">{MODES.map(m=><option key={m}>{m}</option>)}</select></div>
 </div>
 <div className="mb-4"><label className="label">Notes</label><input {...register('notes')} className="input" placeholder="Optionnel"/></div>
 <div className="flex gap-3"><button type="submit" disabled={loadingSubmit} className="btn-primary"><i className="fa-solid fa-save"/>{loadingSubmit ? 'Enregistrement...' : 'Enregistrer'}</button><button type="button" onClick={()=>setShowForm(false)} className="btn-ghost">Annuler</button></div>
 </form>
 </div>
 )}
 <div className="card overflow-hidden">
 <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><h4 className="font-bold text-[13.5px]">Dépenses du mois</h4><span className="badge badge-red">−{total.toLocaleString('fr')} HTG</span></div>
 <table className="tbl w-full"><thead><tr><th>Date</th><th>Description</th><th>Bénéficiaire</th><th>Catégorie</th><th>Mode</th><th>Montant</th><th></th></tr></thead>
 <tbody>
 {mouvements.map(m=><tr key={m.id}><td className="text-xs text-slate-500">{new Date(m.date_mouvement||m.created_at).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})}</td><td className="font-semibold text-[13px]">{m.description}</td><td className="text-xs text-slate-600">{m.tiers_nom||<span className="text-slate-300 italic">—</span>}</td><td><span className="badge badge-gray">{m.categorie}</span></td><td className="text-xs text-slate-500">{m.mode_paiement}</td><td><span className="font-extrabold font-mono text-[13px] text-red-500">−{m.montant.toLocaleString('fr')} HTG</span></td><td><button onClick={()=>del(m.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-all border-none cursor-pointer"><Trash2 size={12}/></button></td></tr>)}
 {mouvements.length===0&&<tr><td colSpan={6} className="text-center text-slate-400 py-8 text-sm">Aucune dépense ce mois</td></tr>}
 </tbody></table>
 </div>
 </div>
 )
}
