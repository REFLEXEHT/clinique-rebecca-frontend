'use client'
// app/admin/comptabilite/page.tsx — Comptabilité avec IA + écritures comptables
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { comptaApi } from '@/lib/api'
import { Mouvement, TypeMouvement } from '@/types'
import { Plus, Trash2, Brain, TrendingUp, TrendingDown, FileText } from 'lucide-react'

const CATS_REC = ['Consultations','Laboratoire','Pharmacie','Dentisterie','Physiothérapie','Accouchement','Autre']
const CATS_DEP = ['RH','Médical','Pharmacie','Infrastructure','Équipements','Télécom','Autre']
const MODES    = ['Espèces','Mobile Money (Moncash)','Natcash','Virement','Chèque','Carte']

// Règles comptables simplifiées pour l'IA locale
const getEcritureComptable = (type: string, cat: string, montant: number, desc: string) => {
  if (type === 'recette') {
    const compteCredit = '70' + (cat === 'Consultations' ? '1' : cat === 'Pharmacie' ? '2' : cat === 'Laboratoire' ? '3' : '9')
    return {
      compteDebit: '512 - Banque / Caisse',
      compteCredit: `${compteCredit} - Produit ${cat}`,
      libelle: `Recette ${cat} — ${desc}`,
      montant,
      journal: 'VTE',
    }
  } else {
    const compteDebit = cat === 'RH' ? '641 - Salaires et traitements'
      : cat === 'Médical' ? '602 - Achats fournitures médicales'
      : cat === 'Pharmacie' ? '607 - Achats marchandises'
      : cat === 'Infrastructure' ? '615 - Entretien et réparations'
      : cat === 'Équipements' ? '218 - Autres immobilisations'
      : '628 - Frais divers'
    return {
      compteDebit,
      compteCredit: '512 - Banque / Caisse',
      libelle: `Dépense ${cat} — ${desc}`,
      montant,
      journal: 'ACH',
    }
  }
}

interface FormData {
  type: TypeMouvement; categorie: string; description: string
  montant: number; date_mouvement: string; mode_paiement: string; notes: string
}

interface EcritureAI {
  compteDebit: string; compteCredit: string; libelle: string; montant: number; journal: string
}

export default function AdminCompta() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [filterType, setFilterType] = useState<'tous'|TypeMouvement>('tous')
  const [showForm, setShowForm]     = useState(false)
  const [ecriture, setEcriture]     = useState<EcritureAI | null>(null)
  const [periode, setPeriode]       = useState({ mois: new Date().getMonth()+1, annee: new Date().getFullYear() })
  const { register, handleSubmit, watch, reset, getValues } = useForm<FormData>({
    defaultValues: { type:'recette', mode_paiement:'Espèces', date_mouvement: new Date().toISOString().slice(0,16) }
  })
  const typeW = watch('type')
  const catW = watch('categorie')
  const montantW = watch('montant')
  const descW = watch('description')

  // Génération écriture comptable IA locale
  useEffect(() => {
    if (catW && montantW && descW) {
      const ec = getEcritureComptable(typeW, catW, Number(montantW), descW)
      setEcriture(ec)
    } else {
      setEcriture(null)
    }
  }, [typeW, catW, montantW, descW])

  const load = () => {
    const params: any = { mois: periode.mois, annee: periode.annee }
    if (filterType !== 'tous') params.type = filterType
    comptaApi.list(params).then(r => setMouvements(r.data)).catch(() => setMouvements([]))
  }

  useEffect(() => { load() }, [filterType, periode])

  const totaux = mouvements.reduce((acc, m) => {
    if (m.type === 'recette') acc.rec += m.montant
    else acc.dep += m.montant
    return acc
  }, { rec: 0, dep: 0 })

  const onSubmit = async (data: FormData) => {
    try {
      await comptaApi.create({ ...data, montant: Number(data.montant), date_mouvement: new Date(data.date_mouvement).toISOString() })
      toast.success('Entrée enregistrée ✓')
      reset({ type:'recette', mode_paiement:'Espèces', date_mouvement: new Date().toISOString().slice(0,16) })
      setShowForm(false)
      setEcriture(null)
      load()
    } catch { toast.error('Erreur lors de l\'enregistrement') }
  }

  const del = async (id: number) => {
    if (!confirm('Supprimer cette entrée ?')) return
    try { await comptaApi.delete(id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur') }
  }

  const fmt = (n: number) => n.toLocaleString('fr') + ' HTG'
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'2-digit' })

  const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Comptabilité</h1>
          <p className="text-slate-500 text-[13px] mt-0.5">
            Compte de résultat — {MOIS[periode.mois-1]} {periode.annee}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sélecteur période */}
          <select value={periode.mois} onChange={e=>setPeriode(p=>({...p,mois:+e.target.value}))}
            className="input w-36 text-sm">
            {MOIS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
          </select>
          <select value={periode.annee} onChange={e=>setPeriode(p=>({...p,annee:+e.target.value}))}
            className="input w-24 text-sm">
            {[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
          </select>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus size={15} /> Nouvelle entrée
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="kpi-card border-l-4 border-green-500">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mb-1">
            <TrendingUp size={14} className="text-green-600" /> Total recettes
          </div>
          <div className="text-xl font-black text-green-600">+{fmt(totaux.rec)}</div>
        </div>
        <div className="kpi-card border-l-4 border-red-400">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mb-1">
            <TrendingDown size={14} className="text-red-500" /> Total dépenses
          </div>
          <div className="text-xl font-black text-red-500">−{fmt(totaux.dep)}</div>
        </div>
        <div className={`kpi-card border-l-4 ${totaux.rec-totaux.dep >= 0 ? 'border-[#1641C8] bg-blue-50' : 'border-red-400 bg-red-50'}`}>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mb-1">
            <FileText size={14} /> Résultat net
          </div>
          <div className={`text-xl font-black ${totaux.rec-totaux.dep >= 0 ? 'text-[#1641C8]' : 'text-red-500'}`}>
            {totaux.rec-totaux.dep >= 0 ? '+' : ''}{fmt(totaux.rec-totaux.dep)}
          </div>
        </div>
      </div>

      {/* Formulaire + écriture IA */}
      {showForm && (
        <div className="grid grid-cols-[1fr_360px] gap-5 mb-6">
          <div className="card p-6">
            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2">
              <Plus size={15} className="text-[#1641C8]" /> Nouvelle entrée
            </h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="label">Type *</label>
                  <select {...register('type')} className="input">
                    <option value="recette">💰 Recette / Encaissement</option>
                    <option value="depense">📋 Dépense / Décaissement</option>
                  </select>
                </div>
                <div>
                  <label className="label">Catégorie *</label>
                  <select {...register('categorie',{required:true})} className="input">
                    <option value="">Choisir...</option>
                    {(typeW==='recette' ? CATS_REC : CATS_DEP).map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="col-span-2">
                  <label className="label">Description *</label>
                  <input {...register('description',{required:true})} className="input" placeholder="Ex: Consultation gynécologie — Mme Dupont"/>
                </div>
                <div>
                  <label className="label">Montant (HTG) *</label>
                  <input {...register('montant',{required:true,min:0})} type="number" className="input" placeholder="0"/>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="label">Date & heure *</label>
                  <input {...register('date_mouvement',{required:true})} type="datetime-local" className="input"/>
                </div>
                <div>
                  <label className="label">Mode paiement</label>
                  <select {...register('mode_paiement')} className="input">
                    {MODES.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <input {...register('notes')} className="input" placeholder="Optionnel..."/>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  <i className="fa-solid fa-save" /> Enregistrer
                </button>
                <button type="button" onClick={()=>{setShowForm(false);setEcriture(null)}} className="btn-ghost">
                  Annuler
                </button>
              </div>
            </form>
          </div>

          {/* Écriture comptable IA */}
          <div className={`card p-5 border-2 ${ecriture ? 'border-[#1641C8]/20 bg-blue-50/30' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1641C8] to-[#0f2fa3] flex items-center justify-center">
                <Brain size={16} className="text-white" />
              </div>
              <div>
                <div className="font-extrabold text-[13px]">Assistant Comptable IA</div>
                <div className="text-[11px] text-slate-400">Écriture auto-générée</div>
              </div>
            </div>

            {ecriture ? (
              <div className="space-y-3">
                <div className="bg-white rounded-xl border border-slate-200 p-3.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Journal</div>
                  <div className="text-sm font-extrabold text-[#1641C8]">{ecriture.journal}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3.5">
                  <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">DÉBIT</div>
                  <div className="text-sm font-bold text-slate-800">{ecriture.compteDebit}</div>
                  <div className="text-xs text-green-700 font-extrabold mt-1">{ecriture.montant.toLocaleString('fr')} HTG</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">CRÉDIT</div>
                  <div className="text-sm font-bold text-slate-800">{ecriture.compteCredit}</div>
                  <div className="text-xs text-blue-700 font-extrabold mt-1">{ecriture.montant.toLocaleString('fr')} HTG</div>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Libellé</div>
                  <div className="text-xs text-slate-700">{ecriture.libelle}</div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  ✓ Écriture générée automatiquement. Vérifiez avec votre comptable.
                </p>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-slate-300 text-sm">
                <Brain size={32} className="mb-2 opacity-40" />
                Remplissez le formulaire pour<br />générer l'écriture comptable
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        {(['tous','recette','depense'] as const).map(t => (
          <button key={t} onClick={()=>setFilterType(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all
            ${filterType===t ? 'bg-[#1641C8] text-white border-[#1641C8]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1641C8]'}`}>
            {t==='tous' ? 'Tout voir' : t==='recette' ? '💰 Recettes' : '📋 Dépenses'}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Catégorie</th>
              <th>Description</th>
              <th>Mode</th>
              <th className="text-right">Montant</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mouvements.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-300 text-sm">
                Aucune transaction ce mois-ci
              </td></tr>
            ) : mouvements.map(m => (
              <tr key={m.id}>
                <td className="text-slate-500 text-xs font-medium">{fmtDate(m.date_mouvement)}</td>
                <td>
                  <span className={m.type==='recette' ? 'badge-green' : 'badge-red'}>
                    {m.type==='recette' ? '↑ Recette' : '↓ Dépense'}
                  </span>
                </td>
                <td className="text-slate-600 text-xs font-semibold">{m.categorie}</td>
                <td className="text-slate-800 text-xs max-w-[200px] truncate font-medium">{m.description}</td>
                <td className="text-slate-400 text-xs">{m.mode_paiement}</td>
                <td className={`text-right font-extrabold text-sm ${m.type==='recette' ? 'text-green-600' : 'text-red-500'}`}>
                  {m.type==='recette' ? '+' : '−'}{m.montant.toLocaleString('fr')} HTG
                </td>
                <td>
                  <button onClick={()=>del(m.id)} className="btn-sm bg-red-50 text-red-500 hover:bg-red-100 border-none">
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {mouvements.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50">
                <td colSpan={5} className="px-4 py-3 text-sm font-extrabold text-slate-700">Total période</td>
                <td className={`px-4 py-3 text-right font-extrabold text-sm ${totaux.rec-totaux.dep >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {totaux.rec-totaux.dep >= 0 ? '+' : ''}{fmt(totaux.rec-totaux.dep)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
