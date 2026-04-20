'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { comptaApi } from '@/lib/api'
import { Mouvement } from '@/types'
import { Trash2, Plus } from 'lucide-react'

const CATEGORIES_RECETTE = ['Consultations', 'Laboratoire', 'Pharmacie', 'Dentisterie', 'Physiothérapie', 'Optométrie', 'Accouchement', 'Autre']
const CATEGORIES_DEPENSE = ['RH', 'Médical', 'Pharmacie', 'Infrastructure', 'Équipements', 'Télécom', 'Autre']
const MODES = ['Espèces', 'Mobile Money', 'Virement', 'Chèque', 'Carte']

interface FormData {
  type: 'recette' | 'depense'; categorie: string; description: string;
  montant: number; date_mouvement: string; mode_paiement: string; notes: string;
}

export default function AdminCompta() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [filterType, setFilterType] = useState<'tous' | 'recette' | 'depense'>('tous')
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { type: 'recette', mode_paiement: 'Espèces', date_mouvement: new Date().toISOString().slice(0, 16) },
  })
  const typeWatch = watch('type')

  const load = (type?: string) => {
    const params: any = {}
    if (type && type !== 'tous') params.type = type
    const now = new Date()
    params.mois = now.getMonth() + 1
    params.annee = now.getFullYear()
    comptaApi.list(params).then((r) => setMouvements(r.data))
  }

  useEffect(() => { load(filterType) }, [filterType])

  const totaux = mouvements.reduce((acc, m) => {
    if (m.type === 'recette') acc.recettes += m.montant
    else acc.depenses += m.montant
    return acc
  }, { recettes: 0, depenses: 0 })

  const onSubmit = async (data: FormData) => {
    try {
      await comptaApi.create({
        ...data,
        montant: Number(data.montant),
        date_mouvement: new Date(data.date_mouvement).toISOString(),
      })
      toast.success(`${data.type === 'recette' ? 'Recette' : 'Dépense'} enregistrée`)
      reset({ type: 'recette', mode_paiement: 'Espèces', date_mouvement: new Date().toISOString().slice(0, 16) })
      setShowForm(false)
      load(filterType)
    } catch { toast.error('Erreur lors de l\'enregistrement') }
  }

  const onDelete = async (id: number, desc: string) => {
    if (!confirm(`Supprimer "${desc}" ?`)) return
    try { await comptaApi.delete(id); toast.success('Supprimé'); load(filterType) }
    catch { toast.error('Erreur') }
  }

  const fmt = (n: number) => n.toLocaleString('fr') + ' HTG'

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Comptabilité</h1>
          <p className="text-gray-500 text-[13px] mt-0.5">Compte de résultat — {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-blue">
          <Plus size={15} /> Nouvelle entrée
        </button>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <div className="text-[12px] text-gray-500 font-semibold mb-1">Total recettes</div>
          <div className="text-[22px] font-black text-[#5aaa28]">+{fmt(totaux.recettes)}</div>
        </div>
        <div className="kpi-card">
          <div className="text-[12px] text-gray-500 font-semibold mb-1">Total dépenses</div>
          <div className="text-[22px] font-black text-red-500">−{fmt(totaux.depenses)}</div>
        </div>
        <div className={`kpi-card border-2 ${totaux.recettes - totaux.depenses >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="text-[12px] text-gray-500 font-semibold mb-1">Résultat net</div>
          <div className={`text-[22px] font-black ${totaux.recettes - totaux.depenses >= 0 ? 'text-[#5aaa28]' : 'text-red-500'}`}>
            {totaux.recettes - totaux.depenses >= 0 ? '+' : ''}{fmt(totaux.recettes - totaux.depenses)}
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card p-5 mb-5">
          <h3 className="font-extrabold text-[14px] mb-4">Nouvelle entrée</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Type *</label>
                <select {...register('type', { required: true })} className="input">
                  <option value="recette">Recette</option>
                  <option value="depense">Dépense</option>
                </select>
              </div>
              <div>
                <label className="label">Catégorie *</label>
                <select {...register('categorie', { required: true })} className="input">
                  <option value="">Choisir...</option>
                  {(typeWatch === 'recette' ? CATEGORIES_RECETTE : CATEGORIES_DEPENSE).map(c =>
                    <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-2">
                <label className="label">Description *</label>
                <input {...register('description', { required: true })} className="input"
                  placeholder="Ex: Consultation gynécologie" />
              </div>
              <div>
                <label className="label">Montant (HTG) *</label>
                <input {...register('montant', { required: true, min: 0 })} type="number" className="input" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label">Date & heure *</label>
                <input {...register('date_mouvement', { required: true })} type="datetime-local" className="input" />
              </div>
              <div>
                <label className="label">Mode de paiement</label>
                <select {...register('mode_paiement')} className="input">
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <input {...register('notes')} className="input" placeholder="Optionnel" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-blue">
                <i className="fa-solid fa-save" /> Enregistrer
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres + table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h4 className="font-bold text-[13.5px] flex items-center gap-2">
            <i className="fa-solid fa-list text-[#1a4fc4] text-sm" />
            Transactions du mois
          </h4>
          <div className="flex gap-2">
            {['tous', 'recette', 'depense'].map((t) => (
              <button key={t} onClick={() => setFilterType(t as any)}
                className={`px-3 py-1 rounded-full text-[12px] font-bold border transition-all
                ${filterType === t ? 'bg-[#1a4fc4] text-white border-[#1a4fc4]' : 'bg-white text-gray-500 border-gray-200'}`}>
                {t === 'tous' ? 'Tous' : t === 'recette' ? 'Recettes' : 'Dépenses'}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full tbl">
          <thead><tr>
            <th>Date</th><th>Description</th><th>Catégorie</th>
            <th>Mode</th><th>Montant</th><th></th>
          </tr></thead>
          <tbody>
            {mouvements.map((m) => (
              <tr key={m.id}>
                <td className="text-[12px] text-gray-500">
                  {new Date(m.date_mouvement).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </td>
                <td><span className="font-semibold text-[13px]">{m.description}</span></td>
                <td><span className="badge badge-gray">{m.categorie}</span></td>
                <td className="text-[12px] text-gray-500">{m.mode_paiement}</td>
                <td>
                  <span className={`font-extrabold font-mono text-[13px] ${m.type === 'recette' ? 'text-[#5aaa28]' : 'text-red-500'}`}>
                    {m.type === 'recette' ? '+' : '−'}{m.montant.toLocaleString()} HTG
                  </span>
                </td>
                <td>
                  <button onClick={() => onDelete(m.id, m.description)}
                    className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100">
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
            {mouvements.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-8 text-[13px]">Aucune transaction ce mois</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
