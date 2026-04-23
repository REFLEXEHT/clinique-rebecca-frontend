'use client'
// app/admin/stocks/page.tsx — Gestion stock pharmacie (admin uniquement)
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { stocksApi } from '@/lib/api'
import { StockItem } from '@/types'
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react'

const STOCKS_DEFAULT: StockItem[] = [
  { id:1, nom:'Amoxicilline 500mg',   categorie:'Antibiotique', quantite:245, seuil_min:50,  prix_unitaire:45,  unite:'comprimé' },
  { id:2, nom:'Paracétamol 500mg',    categorie:'Analgésique',  quantite:12,  seuil_min:100, prix_unitaire:15,  unite:'comprimé' },
  { id:3, nom:'Ibuprofène 400mg',     categorie:'Anti-inflammatoire', quantite:380, seuil_min:100, prix_unitaire:25, unite:'comprimé' },
  { id:4, nom:'Metformine 500mg',     categorie:'Antidiabétique', quantite:89,  seuil_min:50,  prix_unitaire:30,  unite:'comprimé' },
  { id:5, nom:'Amlodipine 5mg',       categorie:'Antihypertenseur', quantite:156, seuil_min:50, prix_unitaire:40, unite:'comprimé' },
  { id:6, nom:'Seringues 10ml',       categorie:'Matériel',     quantite:380, seuil_min:200, prix_unitaire:8,   unite:'unité' },
  { id:7, nom:'Gants latex (boîte)',  categorie:'Matériel',     quantite:45,  seuil_min:20,  prix_unitaire:350, unite:'boîte' },
  { id:8, nom:'Masques chirurgicaux', categorie:'Protection',   quantite:8,   seuil_min:50,  prix_unitaire:5,   unite:'unité' },
  { id:9, nom:'Solution IV 500ml',    categorie:'Perfusion',    quantite:92,  seuil_min:30,  prix_unitaire:180, unite:'flacon' },
  { id:10, nom:'Dextrose 5%',         categorie:'Perfusion',    quantite:67,  seuil_min:30,  prix_unitaire:150, unite:'flacon' },
]

interface FormData { nom:string; categorie:string; quantite:number; seuil_min:number; prix_unitaire:number; unite:string }

export default function AdminStocks() {
  const [stocks, setStocks]     = useState<StockItem[]>(STOCKS_DEFAULT)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [editId, setEditId]     = useState<number|null>(null)
  const [editQte, setEditQte]   = useState<number>(0)
  const [editPrix, setEditPrix] = useState<number>(0)
  const [search, setSearch]     = useState('')
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { unite:'comprimé', seuil_min:50 }
  })

  useEffect(() => {
    stocksApi.list().then(r => setStocks(r.data)).catch(() => setStocks(STOCKS_DEFAULT))
  }, [])

  const onAdd = async (data: FormData) => {
    setLoading(true)
    try {
      await stocksApi.create({...data, quantite:+data.quantite, seuil_min:+data.seuil_min, prix_unitaire:+data.prix_unitaire})
      toast.success(`${data.nom} ajouté`)
      reset({ unite:'comprimé', seuil_min:50 })
      setShowForm(false)
      stocksApi.list().then(r => setStocks(r.data)).catch(() => {})
    } catch {
      const newItem: StockItem = { id: Date.now(), ...data, quantite:+data.quantite, seuil_min:+data.seuil_min, prix_unitaire:+data.prix_unitaire }
      setStocks(prev => [...prev, newItem])
      toast.success(`${data.nom} ajouté (local)`)
      reset({ unite:'comprimé', seuil_min:50 })
      setShowForm(false)
    } finally { setLoading(false) }
  }

  const startEdit = (s: StockItem) => {
    setEditId(s.id)
    setEditQte(s.quantite)
    setEditPrix(s.prix_unitaire)
  }

  const saveEdit = async (s: StockItem) => {
    try {
      await stocksApi.update(s.id, editQte)
      setStocks(prev => prev.map(x => x.id===s.id ? {...x, quantite:editQte, prix_unitaire:editPrix} : x))
      toast.success(`${s.nom} mis à jour`)
    } catch {
      setStocks(prev => prev.map(x => x.id===s.id ? {...x, quantite:editQte, prix_unitaire:editPrix} : x))
      toast.success(`${s.nom} mis à jour (local)`)
    }
    setEditId(null)
  }

  const onDelete = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return
    try { await stocksApi.delete(id) } catch {}
    setStocks(prev => prev.filter(s => s.id !== id))
    toast.success('Produit supprimé')
  }

  const getStatus = (s: StockItem) => {
    if (s.quantite === 0) return { label:'Rupture', cls:'badge-red' }
    if (s.quantite < s.seuil_min) return { label:'Critique', cls:'badge-red' }
    if (s.quantite < s.seuil_min * 1.5) return { label:'Faible', cls:'badge-yellow' }
    return { label:'OK', cls:'badge-green' }
  }

  const filtered = stocks.filter(s => s.nom.toLowerCase().includes(search.toLowerCase()))
  const alertes = stocks.filter(s => s.quantite < s.seuil_min)
  const valeurStock = stocks.reduce((acc, s) => acc + s.quantite * s.prix_unitaire, 0)

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Gestion des stocks pharmacie</h1>
          <p className="text-slate-500 text-[13px] mt-0.5">Inventaire complet — modification des quantités et prix</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={15}/> Ajouter un produit
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <div className="text-2xl font-black text-[#1641C8] mb-1">{stocks.length}</div>
          <div className="text-xs text-slate-500 font-semibold">Références</div>
        </div>
        <div className="kpi-card">
          <div className="text-2xl font-black text-green-600 mb-1">{stocks.filter(s=>getStatus(s).label==='OK').length}</div>
          <div className="text-xs text-slate-500 font-semibold">Stock OK</div>
        </div>
        <div className="kpi-card border-l-4 border-orange-400">
          <div className="text-2xl font-black text-orange-500 mb-1">{alertes.length}</div>
          <div className="text-xs text-slate-500 font-semibold">Alertes stock</div>
        </div>
        <div className="kpi-card">
          <div className="text-lg font-black text-slate-700 mb-1">{valeurStock.toLocaleString('fr')} HTG</div>
          <div className="text-xs text-slate-500 font-semibold">Valeur totale stock</div>
        </div>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 flex gap-3 items-start">
          <i className="fa-solid fa-triangle-exclamation text-orange-500 mt-0.5"/>
          <div>
            <div className="text-sm font-extrabold text-orange-700 mb-1">⚠ {alertes.length} produit(s) en stock critique</div>
            <div className="flex flex-wrap gap-2">
              {alertes.map(s => (
                <span key={s.id} className="badge-yellow text-xs">
                  {s.nom} ({s.quantite}/{s.seuil_min})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formulaire ajout */}
      {showForm && (
        <div className="card p-5 mb-5">
          <h3 className="font-extrabold text-sm mb-4">Nouveau produit</h3>
          <form onSubmit={handleSubmit(onAdd)} className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className="label">Nom du produit *</label>
              <input {...register('nom',{required:true})} className="input" placeholder="Ex: Amoxicilline 500mg"/></div>
            <div><label className="label">Catégorie</label>
              <input {...register('categorie')} className="input" placeholder="Ex: Antibiotique"/></div>
            <div><label className="label">Quantité initiale *</label>
              <input {...register('quantite',{required:true})} type="number" min={0} className="input"/></div>
            <div><label className="label">Seuil d'alerte min</label>
              <input {...register('seuil_min')} type="number" min={0} className="input"/></div>
            <div><label className="label">Prix unitaire (HTG) *</label>
              <input {...register('prix_unitaire',{required:true})} type="number" min={0} className="input"/></div>
            <div><label className="label">Unité</label>
              <select {...register('unite')} className="input">
                {['comprimé','gélule','flacon','ampoule','boîte','unité','sachet','tube'].map(u=><option key={u}>{u}</option>)}
              </select></div>
            <div className="col-span-2 flex gap-3 items-end">
              <button type="submit" disabled={loading} className="btn-primary">
                <Plus size={14}/> {loading?'Ajout...':'Ajouter au stock'}
              </button>
              <button type="button" onClick={()=>{setShowForm(false);reset()}} className="btn-ghost">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Recherche */}
      <div className="flex gap-3 mb-4">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Rechercher un produit..." className="input w-72"/>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th className="text-center">Quantité</th>
              <th>Unité</th>
              <th>Seuil min</th>
              <th className="text-right">Prix unitaire</th>
              <th className="text-right">Valeur stock</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const st = getStatus(s)
              const isEditing = editId === s.id
              return (
                <tr key={s.id} className={s.quantite < s.seuil_min ? 'bg-red-50/40' : ''}>
                  <td className="font-semibold text-slate-800 text-sm">{s.nom}</td>
                  <td><span className="badge-gray text-xs">{s.categorie}</span></td>
                  <td className="text-center">
                    {isEditing ? (
                      <input type="number" value={editQte} onChange={e=>setEditQte(+e.target.value)}
                        className="input w-20 text-center text-sm py-1"/>
                    ) : (
                      <span className={`font-extrabold text-sm ${s.quantite < s.seuil_min ? 'text-red-500' : 'text-slate-800'}`}>
                        {s.quantite}
                      </span>
                    )}
                  </td>
                  <td className="text-slate-500 text-xs">{s.unite}</td>
                  <td className="text-slate-500 text-xs">{s.seuil_min}</td>
                  <td className="text-right">
                    {isEditing ? (
                      <input type="number" value={editPrix} onChange={e=>setEditPrix(+e.target.value)}
                        className="input w-24 text-right text-sm py-1"/>
                    ) : (
                      <span className="font-bold text-sm">{s.prix_unitaire} HTG</span>
                    )}
                  </td>
                  <td className="text-right font-semibold text-sm text-slate-600">
                    {(s.quantite * s.prix_unitaire).toLocaleString('fr')} HTG
                  </td>
                  <td><span className={st.cls}>{st.label}</span></td>
                  <td>
                    <div className="flex gap-1.5">
                      {isEditing ? (
                        <>
                          <button onClick={()=>saveEdit(s)} className="btn-sm bg-green-50 text-green-600 hover:bg-green-100 border border-green-200">
                            <Save size={11}/>
                          </button>
                          <button onClick={()=>setEditId(null)} className="btn-sm bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200">
                            <X size={11}/>
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={()=>startEdit(s)} className="btn-sm bg-blue-50 text-[#1641C8] hover:bg-blue-100 border border-blue-200">
                            <Edit2 size={11}/>
                          </button>
                          <button onClick={()=>onDelete(s.id)} className="btn-sm bg-red-50 text-red-500 hover:bg-red-100 border border-red-200">
                            <Trash2 size={11}/>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
