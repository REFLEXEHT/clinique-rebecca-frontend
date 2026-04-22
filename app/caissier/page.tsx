'use client'
// app/caissier/page.tsx — Espace caissier
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { comptaApi } from '@/lib/api'
import { Mouvement, MouvementCreate } from '@/types'
import { Plus } from 'lucide-react'

const MODES = ['Espèces','Mobile Money (Moncash)','Natcash','Carte de crédit','Virement']
const CATS_REC = ['Consultations','Laboratoire','Pharmacie','Dentisterie','Physiothérapie','Accouchement','Autre']
const CATS_DEP = ['RH','Fournitures médicales','Infrastructure','Pharmacie','Autre']

export default function CaissierPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [activeTab, setActiveTab]   = useState<'recette'|'depense'>('recette')
  const [showForm, setShowForm]     = useState(false)
  const { register, handleSubmit, reset } = useForm<MouvementCreate>({
    defaultValues: { type:'recette', mode_paiement:'Espèces', date_mouvement: new Date().toISOString().slice(0,16), categorie:'' }
  })

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'caissier')) router.push('/login')
  }, [isAuthenticated, user, loading])

  useEffect(() => {
    const now = new Date()
    comptaApi.list({ type: activeTab, mois: now.getMonth()+1, annee: now.getFullYear() })
      .then(r=>setMouvements(r.data)).catch(()=>setMouvements([]))
  }, [activeTab])

  const totaux = mouvements.reduce((acc, m) => { acc.total += m.montant; return acc }, { total: 0 })

  const onSubmit = async (data: any) => {
    try {
      await comptaApi.create({ ...data, type: activeTab, montant: Number(data.montant), date_mouvement: new Date(data.date_mouvement).toISOString() })
      toast.success('Transaction enregistrée')
      reset({ type:activeTab, mode_paiement:'Espèces', date_mouvement: new Date().toISOString().slice(0,16) })
      setShowForm(false)
      const now = new Date()
      comptaApi.list({ type: activeTab, mois: now.getMonth()+1, annee: now.getFullYear() }).then(r=>setMouvements(r.data)).catch(()=>{})
    } catch { toast.error('Erreur') }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#0f172a] h-[70px] flex items-center px-6 gap-4">
        <Link href="/" className="text-white/60 hover:text-white text-sm no-underline transition-colors">
          <i className="fa-solid fa-arrow-left mr-2"/>Accueil
        </Link>
        <h1 className="text-white font-bold ml-2">Espace Caissier</h1>
        <div className="ml-auto text-white/60 text-sm">
          <i className="fa-solid fa-cash-register text-[#1641C8] mr-1.5"/>{user?.nom}
        </div>
      </div>

      <div className="p-7">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(['recette','depense'] as const).map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)}
                className={`px-5 py-2 rounded-full font-bold text-sm border cursor-pointer transition-all
                ${activeTab===t?'bg-[#1641C8] text-white border-[#1641C8]':'bg-white text-slate-600 border-slate-200 hover:border-[#1641C8]'}`}>
                {t==='recette'?'💰 Recettes':'📋 Dépenses & Décaissements'}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowForm(!showForm)} className="btn-primary">
            <Plus size={15}/> Enregistrer
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="kpi-card">
            <div className={`text-xl font-black mb-1 ${activeTab==='recette'?'text-green-600':'text-red-500'}`}>
              {activeTab==='recette'?'+':'−'}{totaux.total.toLocaleString('fr')} HTG
            </div>
            <div className="text-xs text-slate-500 font-semibold">Total {activeTab==='recette'?'recettes':'dépenses'} du mois</div>
          </div>
          <div className="kpi-card"><div className="text-xl font-black text-[#1641C8] mb-1">{mouvements.length}</div><div className="text-xs text-slate-500 font-semibold">Transactions</div></div>
          <div className="kpi-card"><div className="text-xl font-black text-[#d97706] mb-1">{mouvements.length>0?Math.round(totaux.total/mouvements.length).toLocaleString('fr'):0} HTG</div><div className="text-xs text-slate-500 font-semibold">Moyenne / transaction</div></div>
        </div>

        {showForm&&(
          <div className="card p-5 mb-5">
            <h3 className="font-extrabold text-sm mb-4">Nouvelle {activeTab==='recette'?'recette':'dépense'}</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div><label className="label">Catégorie *</label>
                  <select {...register('categorie',{required:true})} className="input">
                    <option value="">Choisir...</option>
                    {(activeTab==='recette'?CATS_REC:CATS_DEP).map(c=><option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="label">Description *</label>
                  <input {...register('description',{required:true})} className="input" placeholder="Ex: Consultation Dr. Joseph"/></div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div><label className="label">Montant (HTG) *</label>
                  <input {...register('montant',{required:true,min:0})} type="number" className="input"/></div>
                <div><label className="label">Date & heure</label>
                  <input {...register('date_mouvement')} type="datetime-local" className="input"/></div>
                <div><label className="label">Mode de paiement</label>
                  <select {...register('mode_paiement')} className="input">
                    {MODES.map(m=><option key={m}>{m}</option>)}
                  </select></div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary"><i className="fa-solid fa-save"/> Enregistrer</button>
                <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost">Annuler</button>
              </div>
            </form>
          </div>
        )}

        <div className="card overflow-hidden">
          <table className="tbl w-full">
            <thead><tr><th>Date</th><th>Description</th><th>Catégorie</th><th>Mode</th><th>Montant</th></tr></thead>
            <tbody>
              {mouvements.map(m=>(
                <tr key={m.id}>
                  <td className="text-xs text-slate-500">{new Date(m.date_mouvement).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})}</td>
                  <td className="font-semibold text-[13px]">{m.description}</td>
                  <td><span className="badge badge-gray">{m.categorie}</span></td>
                  <td className="text-xs text-slate-500">{m.mode_paiement}</td>
                  <td><span className={`font-extrabold font-mono text-[13px] ${m.type==='recette'?'text-green-600':'text-red-500'}`}>
                    {m.type==='recette'?'+':'−'}{m.montant.toLocaleString('fr')} HTG
                  </span></td>
                </tr>
              ))}
              {mouvements.length===0&&<tr><td colSpan={5} className="text-center text-slate-400 py-8 text-sm">Aucune transaction ce mois</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
