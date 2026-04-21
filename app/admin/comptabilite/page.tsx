'use client'
// app/admin/comptabilite/page.tsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { comptaApi } from '@/lib/api'
import { Mouvement, TypeMouvement } from '@/types'
import { Plus, Trash2 } from 'lucide-react'

const CATS_REC = ['Consultations','Laboratoire','Pharmacie','Dentisterie','Physiothérapie','Accouchement','Autre']
const CATS_DEP = ['RH','Médical','Pharmacie','Infrastructure','Équipements','Télécom','Autre']
const MODES    = ['Espèces','Mobile Money','Virement','Chèque','Carte']

interface FormData {
  type: TypeMouvement; categorie: string; description: string
  montant: number; date_mouvement: string; mode_paiement: string; notes: string
}

export default function AdminCompta() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [filterType, setFilterType] = useState<'tous'|TypeMouvement>('tous')
  const [showForm, setShowForm]     = useState(false)
  const { register, handleSubmit, watch, reset } = useForm<FormData>({
    defaultValues: { type:'recette', mode_paiement:'Espèces', date_mouvement: new Date().toISOString().slice(0,16) }
  })
  const typeW = watch('type')

  const load = () => {
    const now = new Date()
    const params: any = { mois: now.getMonth()+1, annee: now.getFullYear() }
    if (filterType !== 'tous') params.type = filterType
    comptaApi.list(params).then(r => setMouvements(r.data)).catch(() => setMouvements([]))
  }

  useEffect(() => { load() }, [filterType])

  const totaux = mouvements.reduce((acc, m) => {
    if (m.type === 'recette') acc.rec += m.montant
    else acc.dep += m.montant
    return acc
  }, { rec: 0, dep: 0 })

  const onSubmit = async (data: FormData) => {
    try {
      await comptaApi.create({ ...data, montant: Number(data.montant), date_mouvement: new Date(data.date_mouvement).toISOString() })
      toast.success('Entrée enregistrée')
      reset({ type:'recette', mode_paiement:'Espèces', date_mouvement: new Date().toISOString().slice(0,16) })
      setShowForm(false)
      load()
    } catch { toast.error('Erreur') }
  }

  const del = async (id: number) => {
    if (!confirm('Supprimer cette entrée ?')) return
    try { await comptaApi.delete(id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur') }
  }

  const fmt = (n: number) => n.toLocaleString('fr') + ' HTG'
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' })

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Comptabilité</h1>
          <p className="text-slate-500 text-[13px] mt-0.5">
            Compte de résultat — {new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={15} /> Nouvelle entrée
        </button>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <div className="text-[11px] text-slate-500 font-semibold mb-1">Total recettes</div>
          <div className="text-xl font-black text-green-600">+{fmt(totaux.rec)}</div>
        </div>
        <div className="kpi-card">
          <div className="text-[11px] text-slate-500 font-semibold mb-1">Total dépenses</div>
          <div className="text-xl font-black text-red-500">−{fmt(totaux.dep)}</div>
        </div>
        <div className={`kpi-card border-2 ${totaux.rec-totaux.dep >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="text-[11px] text-slate-500 font-semibold mb-1">Résultat net</div>
          <div className={`text-xl font-black ${totaux.rec-totaux.dep >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {totaux.rec-totaux.dep >= 0 ? '+' : ''}{fmt(totaux.rec-totaux.dep)}
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card p-5 mb-5">
          <h3 className="font-extrabold text-sm mb-4">Nouvelle entrée</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div><label className="label">Type *</label>
                <select {...register('type')} className="input">
                  <option value="recette">Recette</option>
                  <option value="depense">Dépense</option>
                </select></div>
              <div><label className="label">Catégorie *</label>
                <select {...register('categorie',{required:true})} className="input">
                  <option value="">Choisir...</option>
                  {(typeW==='recette' ? CATS_REC : CATS_DEP).map(c=><option key={c}>{c}</option>)}
                </select></div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="col-span-2"><label className="label">Description *</label>
                <input {...register('description',{required:true})} className="input" placeholder="Ex: Consultation gynécologie"/></div>
              <div><label className="label">Montant (HTG) *</label>
                <input {...register('montant',{required:true,min:0})} type="number" className="input" placeholder="0"/></div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div><label className="label">Date & heure *</label>
                <input {...register('date_mouvement',{required:true})} type="datetime-local" className="input"/></div>
              <div><label className="label">Mode paiement</label>
                <select {...register('mode_paiement')} className="input">
                  {MODES.map(m=><option key={m}>{m}</option>)}
                </select></div>
              <div><label className="label">Notes</label>
                <input {...register('notes')} className="input" placeholder="Optionnel"/></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary"><i className="fa-solid fa-save"/> Enregistrer</button>
              <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="font-bold text-[13.5px] flex items-center gap-2">
            <i className="fa-solid fa-list text-[#1641C8] text-sm"/> Transactions du mois
          </h4>
          <div className="flex gap-2">
            {(['tous','recette','depense'] as const).map(t=>(
              <button key={t} onClick={()=>setFilterType(t)}
                className={`px-3 py-1 rounded-full text-[12px] font-bold border transition-all cursor-pointer
                ${filterType===t ? 'bg-[#1641C8] text-white border-[#1641C8]' : 'bg-white text-slate-500 border-slate-200'}`}>
                {t==='tous'?'Tous':t==='recette'?'Recettes':'Dépenses'}
              </button>
            ))}
          </div>
        </div>
        <table className="tbl w-full">
          <thead><tr><th>Date</th><th>Description</th><th>Catégorie</th><th>Mode</th><th>Montant</th><th></th></tr></thead>
          <tbody>
            {mouvements.map(m=>(
              <tr key={m.id}>
                <td className="text-[12px] text-slate-500">{fmtDate(m.date_mouvement)}</td>
                <td className="font-semibold text-[13px]">{m.description}</td>
                <td><span className="badge badge-gray">{m.categorie}</span></td>
                <td className="text-[12px] text-slate-500">{m.mode_paiement}</td>
                <td><span className={`font-extrabold font-mono text-[13px] ${m.type==='recette'?'text-green-600':'text-red-500'}`}>
                  {m.type==='recette'?'+':'−'}{m.montant.toLocaleString('fr')} HTG
                </span></td>
                <td><button onClick={()=>del(m.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-400
                  flex items-center justify-center hover:bg-red-100 transition-all border-none cursor-pointer">
                  <Trash2 size={12}/>
                </button></td>
              </tr>
            ))}
            {mouvements.length===0&&(
              <tr><td colSpan={6} className="text-center text-slate-400 py-8 text-sm">
                Aucune transaction — connectez l'API pour voir les données
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
