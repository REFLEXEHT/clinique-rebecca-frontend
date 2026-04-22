'use client'
// app/admin/caisse/page.tsx
import { useEffect, useState } from 'react'
import { comptaApi, statsApi } from '@/lib/api'
import { Mouvement } from '@/types'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

export default function AdminCaisse() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [recChart, setRecChart]     = useState<any[]>([])

  useEffect(() => {
    const now = new Date()
    comptaApi.list({ type:'recette', mois: now.getMonth()+1, annee: now.getFullYear() }).then(r=>setMouvements(r.data)).catch(()=>{})
    statsApi.recettesParJour(7).then(r=>setRecChart(r.data)).catch(()=>{})
  }, [])

  const total = mouvements.reduce((s,m) => s+m.montant, 0)
  const parMode = mouvements.reduce((acc: Record<string,number>, m) => { acc[m.mode_paiement]=(acc[m.mode_paiement]||0)+m.montant; return acc }, {})
  const COLORS = ['#22c55e','#1641C8','#d97706','#be185d','#6366f1']

  return (
    <div className="p-7">
      <div className="mb-6"><h1 className="text-xl font-extrabold">Caisse & Recettes</h1><p className="text-slate-500 text-[13px] mt-0.5">Suivi des encaissements du mois</p></div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="kpi-card"><div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-lg mb-3"><i className="fa-solid fa-cash-register"/></div><div className="text-2xl font-black text-green-600">+{total.toLocaleString('fr')} HTG</div><div className="text-xs text-slate-500 font-semibold">Total recettes du mois</div></div>
        <div className="kpi-card"><div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1641C8] flex items-center justify-center text-lg mb-3"><i className="fa-solid fa-receipt"/></div><div className="text-2xl font-black text-[#1641C8]">{mouvements.length}</div><div className="text-xs text-slate-500 font-semibold">Transactions ce mois</div></div>
        <div className="kpi-card"><div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg mb-3"><i className="fa-solid fa-chart-line"/></div><div className="text-2xl font-black text-orange-600">{mouvements.length>0?Math.round(total/mouvements.length).toLocaleString('fr'):0} HTG</div><div className="text-xs text-slate-500 font-semibold">Moyenne / transaction</div></div>
      </div>
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="card p-5"><h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2"><i className="fa-solid fa-chart-bar text-[#1641C8] text-sm"/>Recettes journalières — 7 jours</h4>
          <div className="h-52">{recChart.length>0?<Bar data={{labels:recChart.map(d=>d.date),datasets:[{data:recChart.map(d=>d.total),backgroundColor:'rgba(34,197,94,0.75)',borderRadius:6}]}} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:(v:any)=>`${v/1000}k`,font:{size:11}},grid:{color:'rgba(0,0,0,0.04)'}},x:{grid:{display:false},ticks:{font:{size:11}}}}}} />:<div className="h-full flex items-center justify-center text-slate-300 text-sm">Connectez l'API</div>}</div>
        </div>
        <div className="card p-5"><h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2"><i className="fa-solid fa-chart-pie text-orange-500 text-sm"/>Par mode de paiement</h4>
          <div className="h-52">{Object.keys(parMode).length>0?<Pie data={{labels:Object.keys(parMode),datasets:[{data:Object.values(parMode),backgroundColor:COLORS,borderWidth:0}]}} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{padding:12,font:{size:11}}}}}}/>:<div className="h-full flex items-center justify-center text-slate-300 text-sm">Aucune donnée</div>}</div>
        </div>
      </div>
      <div className="card overflow-hidden"><div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><h4 className="font-bold text-[13.5px]">Transactions du mois</h4><span className="badge badge-green">{total.toLocaleString('fr')} HTG</span></div>
        <table className="tbl w-full"><thead><tr><th>Date</th><th>Description</th><th>Catégorie</th><th>Mode</th><th>Montant</th></tr></thead>
        <tbody>{mouvements.map(m=><tr key={m.id}><td className="text-xs text-slate-500">{new Date(m.date_mouvement).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})}</td><td className="font-semibold text-[13px]">{m.description}</td><td><span className="badge badge-gray">{m.categorie}</span></td><td className="text-xs text-slate-500">{m.mode_paiement}</td><td><span className="font-extrabold font-mono text-[13px] text-green-600">+{m.montant.toLocaleString('fr')} HTG</span></td></tr>)}
        {mouvements.length===0&&<tr><td colSpan={5} className="text-center text-slate-400 py-8 text-sm">Aucune recette ce mois</td></tr>}</tbody></table>
      </div>
    </div>
  )
}
