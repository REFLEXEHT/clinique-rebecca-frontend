'use client'
// app/admin/stocks/page.tsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { stocksApi } from '@/lib/api'
import { StockItem } from '@/types'
import { Plus, Trash2 } from 'lucide-react'

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
  { id:10,nom:'Dextrose 5%',          categorie:'Perfusion',    quantite:67,  seuil_min:30,  prix_unitaire:150, unite:'flacon' },
]

interface FormData { nom:string; categorie:string; quantite:number; seuil_min:number; prix_unitaire:number; unite:string }

export default function AdminStocks() {
  const [stocks, setStocks]   = useState<StockItem[]>(STOCKS_DEFAULT)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { unite:'comprimé', seuil_min:50 }
  })

  useEffect(() => {
    stocksApi.list()
      .then(r => setStocks(r.data))
      .catch(() => setStocks(STOCKS_DEFAULT))
  }, [])

  const onAdd = async (data: FormData) => {
    setLoading(true)
    try {
      await stocksApi.create({ ...data, quantite:Number(data.quantite), seuil_min:Number(data.seuil_min), prix_unitaire:Number(data.prix_unitaire) })
      toast.success(`${data.nom} ajouté au stock`)
      reset({ unite:'comprimé', seuil_min:50 })
      setShowForm(false)
      stocksApi.list().then(r=>setStocks(r.data)).catch(()=>{})
    } catch {
      // Local update
      const newItem: StockItem = { id: Date.now(), ...data, quantite:Number(data.quantite), seuil_min:Number(data.seuil_min), prix_unitaire:Number(data.prix_unitaire) }
      setStocks(prev=>[...prev,newItem])
      toast.success(`${data.nom} ajouté (local)`)
      reset({ unite:'comprimé', seuil_min:50 })
      setShowForm(false)
    } finally { setLoading(false) }
  }

  const updateQte = async (id: number, qte: number, nom: string) => {
    try {
      await stocksApi.update(id, qte)
      setStocks(prev=>prev.map(s=>s.id===id?{...s,quantite:qte}:s))
      toast.success(`Stock ${nom} mis à jour`)
    } catch {
      setStocks(prev=>prev.map(s=>s.id===id?{...s,quantite:qte}:s))
      toast.success(`Stock ${nom} mis à jour (local)`)
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return
    try { await stocksApi.delete(id) }
    catch {}
    setStocks(prev=>prev.filter(s=>s.id!==id))
    toast.success('Produit supprimé')
  }

  const getStatus = (s: StockItem) => {
    if (s.quantite === 0) return { label:'Rupture', cls:'badge-red' }
    if (s.quantite < s.seuil_min) return { label:'Critique', cls:'badge-red' }
    if (s.quantite < s.seuil_min * 1.5) return { label:'Faible', cls:'badge-yellow' }
    return { label:'OK', cls:'badge-green' }
  }

  const critiques = stocks.filter(s=>s.quantite<s.seuil_min).length

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Stocks — Pharmacie</h1>
          <p className="text-slate-500 text-[13px] mt-0.5">Inventaire et gestion des produits pharmaceutiques</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} className="btn-primary">
          <Plus size={15}/> Ajouter un produit
        </button>
      </div>

      {critiques>0&&(
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 flex items-center gap-2.5">
          <i className="fa-solid fa-triangle-exclamation text-red-500"/>
          <span className="text-red-700 font-semibold text-sm">
            {critiques} produit{critiques>1?'s':''} en dessous du seuil minimum — réapprovisionnement requis
          </span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="kpi-card"><div className="text-2xl font-black text-[#1641C8] mb-1">{stocks.length}</div><div className="text-xs text-slate-500 font-semibold">Produits référencés</div></div>
        <div className="kpi-card"><div className="text-2xl font-black text-green-600 mb-1">{stocks.filter(s=>s.quantite>=s.seuil_min).length}</div><div className="text-xs text-slate-500 font-semibold">Stock suffisant</div></div>
        <div className="kpi-card"><div className="text-2xl font-black text-red-500 mb-1">{critiques}</div><div className="text-xs text-slate-500 font-semibold">Stock critique</div></div>
        <div className="kpi-card"><div className="text-2xl font-black text-slate-700 mb-1">{stocks.filter(s=>s.quantite===0).length}</div><div className="text-xs text-slate-500 font-semibold">Rupture de stock</div></div>
      </div>

      {showForm&&(
        <div className="card p-5 mb-5">
          <h3 className="font-extrabold text-sm mb-4">Nouveau produit</h3>
          <form onSubmit={handleSubmit(onAdd)}>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="col-span-2"><label className="label">Nom du produit *</label>
                <input {...register('nom',{required:true})} className="input" placeholder="Ex: Amoxicilline 500mg"/></div>
              <div><label className="label">Catégorie *</label>
                <input {...register('categorie',{required:true})} className="input" placeholder="Antibiotique"/></div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div><label className="label">Quantité *</label>
                <input {...register('quantite',{required:true,min:0})} type="number" className="input"/></div>
              <div><label className="label">Seuil minimum</label>
                <input {...register('seuil_min',{required:true,min:0})} type="number" className="input"/></div>
              <div><label className="label">Prix unitaire (HTG)</label>
                <input {...register('prix_unitaire',{required:true,min:0})} type="number" className="input"/></div>
              <div><label className="label">Unité</label>
                <input {...register('unite')} className="input" placeholder="comprimé"/></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary"><i className="fa-solid fa-plus"/> Ajouter</button>
              <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="tbl w-full">
          <thead><tr><th>Produit</th><th>Catégorie</th><th>Quantité</th><th>Seuil min</th><th>Prix unit.</th><th>Statut</th><th>Modifier qté</th><th></th></tr></thead>
          <tbody>
            {stocks.map(s=>{
              const st=getStatus(s)
              return (
                <tr key={s.id}>
                  <td><div className="font-semibold text-[13px]">{s.nom}</div></td>
                  <td><span className="badge badge-gray">{s.categorie}</span></td>
                  <td><span className={`font-mono font-bold ${s.quantite<s.seuil_min?'text-red-500':s.quantite<s.seuil_min*1.5?'text-yellow-600':'text-green-600'}`}>{s.quantite} {s.unite}</span></td>
                  <td className="text-[12px] text-slate-500">{s.seuil_min} {s.unite}</td>
                  <td className="text-[12px] font-mono">{s.prix_unitaire} HTG</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button onClick={()=>updateQte(s.id, Math.max(0,s.quantite-1), s.nom)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold border-none cursor-pointer">−</button>
                      <span className="font-mono text-sm w-10 text-center">{s.quantite}</span>
                      <button onClick={()=>updateQte(s.id, s.quantite+1, s.nom)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold border-none cursor-pointer">+</button>
                    </div>
                  </td>
                  <td>
                    <button onClick={()=>onDelete(s.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-all border-none cursor-pointer">
                      <Trash2 size={12}/>
                    </button>
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
