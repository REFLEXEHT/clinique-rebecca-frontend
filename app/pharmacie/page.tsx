'use client'
// app/pharmacie/page.tsx — Espace pharmacien : consultation stocks uniquement
// La vente est gérée par le caissier (qui a accès à la pharmacie dans son interface)
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { stocksApi } from '@/lib/api'
import { StockItem } from '@/types'
import { AlertTriangle, Package } from 'lucide-react'

const STOCKS_DEMO: StockItem[] = [
  { id:1, nom:'Amoxicilline 500mg', categorie:'Antibiotique', quantite:245, seuil_min:50, prix_unitaire:45, unite:'comprimé' },
  { id:2, nom:'Paracétamol 500mg', categorie:'Analgésique', quantite:12, seuil_min:100, prix_unitaire:15, unite:'comprimé' },
  { id:3, nom:'Ibuprofène 400mg', categorie:'Anti-inflammatoire', quantite:380, seuil_min:100, prix_unitaire:25, unite:'comprimé' },
  { id:4, nom:'Metformine 500mg', categorie:'Antidiabétique', quantite:89, seuil_min:50, prix_unitaire:30, unite:'comprimé' },
  { id:5, nom:'Amlodipine 5mg', categorie:'Antihypertenseur', quantite:156, seuil_min:50, prix_unitaire:40, unite:'comprimé' },
  { id:6, nom:'Seringues 10ml', categorie:'Matériel', quantite:380, seuil_min:200, prix_unitaire:8, unite:'unité' },
  { id:7, nom:'Masques chirurgicaux', categorie:'Protection', quantite:8, seuil_min:50, prix_unitaire:5, unite:'unité' },
  { id:8, nom:'Solution IV 500ml', categorie:'Perfusion', quantite:92, seuil_min:30, prix_unitaire:180, unite:'flacon' },
]

export default function PharmaciePage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [stocks, setStocks] = useState<StockItem[]>(STOCKS_DEMO)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'pharmacie')) router.push('/login')
  }, [isAuthenticated, user, loading])

  useEffect(() => {
    stocksApi.list().then(r => setStocks(r.data.length ? r.data : STOCKS_DEMO)).catch(() => setStocks(STOCKS_DEMO))
  }, [isAuthenticated, user])

  const categories = [...new Set(stocks.map(s => s.categorie))]
  const filtered = stocks.filter(s => {
    const matchSearch = s.nom.toLowerCase().includes(search.toLowerCase())
    const matchCat = !catFilter || s.categorie === catFilter
    return matchSearch && matchCat
  })

  const getStatus = (s: StockItem) => {
    if (s.quantite === 0) return { label:'Rupture', cls:'badge-red' }
    if (s.quantite < s.seuil_min) return { label:'Critique', cls:'badge-red' }
    if (s.quantite < s.seuil_min * 1.5) return { label:'Faible', cls:'badge-yellow' }
    return { label:'Disponible', cls:'badge-green' }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#0f172a] h-[70px] flex items-center px-6 gap-4">
        <Link href="/" className="text-white/60 hover:text-white text-sm no-underline">
          <i className="fa-solid fa-arrow-left mr-2"/>Accueil
        </Link>
        <h1 className="text-white font-bold">Espace Pharmacie</h1>
        <div className="ml-auto text-white/60 text-sm">
          <i className="fa-solid fa-pills text-[#1641C8] mr-1.5"/>{user?.nom}
        </div>
      </div>

      <div className="p-7">
        <div className="mb-6">
          <h1 className="text-xl font-extrabold">Inventaire pharmacie</h1>
          <p className="text-slate-400 text-[13px] mt-0.5">Consultation des stocks — Les ventes sont gérées par le caissier</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-5 flex items-center gap-2.5">
          <i className="fa-solid fa-circle-info text-[#1641C8]"/>
          <span className="text-[#1641C8] font-semibold text-sm">
            Espace de consultation des stocks. Pour modifier les quantités ou les prix, contactez l'administrateur.
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="kpi-card"><div className="text-2xl font-black text-[#1641C8] mb-1">{stocks.length}</div><div className="text-xs text-slate-500 font-semibold">Produits</div></div>
          <div className="kpi-card"><div className="text-2xl font-black text-green-600 mb-1">{stocks.filter(s=>getStatus(s).label==='Disponible').length}</div><div className="text-xs text-slate-500 font-semibold">En stock normal</div></div>
          <div className="kpi-card"><div className="text-2xl font-black text-yellow-600 mb-1">{stocks.filter(s=>s.quantite>0&&s.quantite<s.seuil_min*1.5).length}</div><div className="text-xs text-slate-500 font-semibold">Stock faible</div></div>
          <div className="kpi-card"><div className="text-2xl font-black text-red-500 mb-1">{stocks.filter(s=>s.quantite===0).length}</div><div className="text-xs text-slate-500 font-semibold">Rupture</div></div>
        </div>

        {stocks.some(s => s.quantite < s.seuil_min) && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 flex items-start gap-3">
            <AlertTriangle size={16} className="text-orange-500 mt-0.5"/>
            <div>
              <div className="text-sm font-extrabold text-orange-700 mb-1">Alertes stock à signaler à l'administrateur</div>
              <div className="flex flex-wrap gap-2">
                {stocks.filter(s => s.quantite < s.seuil_min).map(s => (
                  <span key={s.id} className="badge-yellow text-xs">{s.nom} ({s.quantite}/{s.seuil_min})</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..." className="input w-64"/>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input w-44">
            <option value="">Toutes catégories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="card overflow-hidden">
          <table className="tbl">
            <thead><tr><th>Médicament / Produit</th><th>Catégorie</th><th>Quantité</th><th>Unité</th><th>Prix unitaire</th><th>Statut</th></tr></thead>
            <tbody>
              {filtered.map(s => {
                const st = getStatus(s)
                return (
                  <tr key={s.id} className={s.quantite < s.seuil_min ? 'bg-red-50/30' : ''}>
                    <td className="font-semibold text-slate-800">{s.nom}</td>
                    <td><span className="badge-gray text-xs">{s.categorie}</span></td>
                    <td className={`font-extrabold text-sm ${s.quantite < s.seuil_min ? 'text-red-500' : 'text-slate-800'}`}>{s.quantite}</td>
                    <td className="text-slate-400 text-xs">{s.unite}</td>
                    <td className="font-bold text-sm">{s.prix_unitaire} HTG</td>
                    <td><span className={st.cls}>{st.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
