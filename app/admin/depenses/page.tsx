'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { comptaApi } from '@/lib/api'
import { Mouvement } from '@/types'
import { Trash2, Plus } from 'lucide-react'

const CATEGORIES = ['RH', 'Médical', 'Pharmacie', 'Infrastructure', 'Équipements', 'Télécom', 'Autre']
const MODES = ['Espèces', 'Mobile Money', 'Virement', 'Chèque']

interface FormData {
  description: string; categorie: string; montant: number;
  date_mouvement: string; mode_paiement: string; notes: string;
}

export default function AdminDepenses() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      mode_paiement: 'Espèces',
      date_mouvement: new Date().toISOString().slice(0, 16),
    },
  })

  const load = () => {
    const now = new Date()
    comptaApi.list({ type: 'depense', mois: now.getMonth() + 1, annee: now.getFullYear() })
      .then((r) => setMouvements(r.data))
  }

  useEffect(() => { load() }, [])

  const total = mouvements.reduce((s, m) => s + m.montant, 0)

  const parCat = mouvements.reduce((acc: Record<string, number>, m) => {
    acc[m.categorie] = (acc[m.categorie] || 0) + m.montant
    return acc
  }, {})

  const onSubmit = async (data: FormData) => {
    try {
      await comptaApi.create({
        type: 'depense',
        categorie: data.categorie,
        description: data.description,
        montant: Number(data.montant),
        date_mouvement: new Date(data.date_mouvement).toISOString(),
        mode_paiement: data.mode_paiement,
        notes: data.notes || undefined,
      })
      toast.success('Dépense enregistrée')
      reset({ mode_paiement: 'Espèces', date_mouvement: new Date().toISOString().slice(0, 16) })
      setShowForm(false)
      load()
    } catch { toast.error("Erreur lors de l'enregistrement") }
  }

  const onDelete = async (id: number, desc: string) => {
    if (!confirm(`Supprimer "${desc}" ?`)) return
    try { await comptaApi.delete(id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur') }
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Dépenses</h1>
          <p className="text-gray-500 text-[13px] mt-0.5">
            Suivi des charges — {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-blue">
          <Plus size={15} /> Ajouter une dépense
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <div className="text-[22px] font-black text-red-500 mb-1">
            −{total.toLocaleString('fr')} HTG
          </div>
          <div className="text-[12px] text-gray-500 font-semibold">Total dépenses</div>
        </div>
        <div className="kpi-card">
          <div className="text-[22px] font-black text-[#1a4fc4] mb-1">{mouvements.length}</div>
          <div className="text-[12px] text-gray-500 font-semibold">Transactions</div>
        </div>
        {Object.entries(parCat).slice(0, 2).map(([cat, val]) => (
          <div key={cat} className="kpi-card">
            <div className="text-[22px] font-black text-[#e07a00] mb-1">
              {val.toLocaleString('fr')} HTG
            </div>
            <div className="text-[12px] text-gray-500 font-semibold">{cat}</div>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card p-5 mb-5">
          <h3 className="font-extrabold text-[14px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-file-invoice text-[#1a4fc4]" />
            Nouvelle dépense
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="label">Description *</label>
                <input {...register('description', { required: true })} className="input"
                  placeholder="Ex: Fournitures médicales" />
                {errors.description && <p className="text-red-500 text-xs mt-1">Requis</p>}
              </div>
              <div>
                <label className="label">Catégorie *</label>
                <select {...register('categorie', { required: true })} className="input">
                  <option value="">Choisir...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <label className="label">Montant (HTG) *</label>
                <input {...register('montant', { required: true, min: 0 })} type="number"
                  className="input" placeholder="0" />
              </div>
              <div>
                <label className="label">Date & heure</label>
                <input {...register('date_mouvement')} type="datetime-local" className="input" />
              </div>
              <div>
                <label className="label">Mode de paiement</label>
                <select {...register('mode_paiement')} className="input">
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="label">Notes (optionnel)</label>
              <input {...register('notes')} className="input" placeholder="Notes additionnelles..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-blue">
                <i className="fa-solid fa-save" /> Enregistrer
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="font-bold text-[13.5px] flex items-center gap-2">
            <i className="fa-solid fa-file-invoice text-[#1a4fc4] text-sm" />
            Dépenses du mois
          </h4>
          <span className="badge badge-red">−{total.toLocaleString('fr')} HTG</span>
        </div>
        <table className="w-full tbl">
          <thead><tr>
            <th>Date</th><th>Description</th><th>Catégorie</th>
            <th>Mode</th><th>Montant</th><th></th>
          </tr></thead>
          <tbody>
            {mouvements.map((m) => (
              <tr key={m.id}>
                <td className="text-[12px] text-gray-500">{fmtDate(m.date_mouvement)}</td>
                <td className="font-semibold text-[13px]">{m.description}</td>
                <td><span className="badge badge-gray">{m.categorie}</span></td>
                <td className="text-[12px] text-gray-500">{m.mode_paiement}</td>
                <td>
                  <span className="font-extrabold font-mono text-[13px] text-red-500">
                    −{m.montant.toLocaleString('fr')} HTG
                  </span>
                </td>
                <td>
                  <button onClick={() => onDelete(m.id, m.description)}
                    className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center
                    justify-center hover:bg-red-100 hover:text-red-600 transition-all">
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
            {mouvements.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8 text-[13px]">
                  Aucune dépense ce mois
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
