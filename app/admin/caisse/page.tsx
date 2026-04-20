'use client'
import { useEffect, useState } from 'react'
import { comptaApi, statsApi } from '@/lib/api'
import { Mouvement } from '@/types'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

export default function AdminCaisse() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [recChart, setRecChart] = useState<any[]>([])

  useEffect(() => {
    const now = new Date()
    comptaApi.list({ type: 'recette', mois: now.getMonth() + 1, annee: now.getFullYear() })
      .then((r) => setMouvements(r.data))
    statsApi.recettesParJour(7).then((r) => setRecChart(r.data))
  }, [])

  const total = mouvements.reduce((s, m) => s + m.montant, 0)

  const parMode = mouvements.reduce((acc: Record<string, number>, m) => {
    acc[m.mode_paiement] = (acc[m.mode_paiement] || 0) + m.montant
    return acc
  }, {})

  const COLORS = ['#5aaa28', '#1a4fc4', '#e07a00', '#be185d', '#6366f1']

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold">Caisse & Recettes</h1>
        <p className="text-gray-500 text-[13px] mt-0.5">Suivi des encaissements du mois</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-[#5aaa28] flex items-center
            justify-center text-lg mb-3">
            <i className="fa-solid fa-cash-register" />
          </div>
          <div className="text-[24px] font-black text-[#5aaa28]">
            +{total.toLocaleString('fr')} HTG
          </div>
          <div className="text-[12px] text-gray-500 font-semibold">Total recettes du mois</div>
        </div>
        <div className="kpi-card">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1a4fc4] flex items-center
            justify-center text-lg mb-3">
            <i className="fa-solid fa-receipt" />
          </div>
          <div className="text-[24px] font-black text-[#1a4fc4]">{mouvements.length}</div>
          <div className="text-[12px] text-gray-500 font-semibold">Transactions ce mois</div>
        </div>
        <div className="kpi-card">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#e07a00] flex items-center
            justify-center text-lg mb-3">
            <i className="fa-solid fa-chart-line" />
          </div>
          <div className="text-[24px] font-black text-[#e07a00]">
            {mouvements.length > 0 ? Math.round(total / mouvements.length).toLocaleString('fr') : 0} HTG
          </div>
          <div className="text-[12px] text-gray-500 font-semibold">Moyenne par transaction</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="card p-5">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-bar text-[#1a4fc4] text-sm" />
            Recettes journalières — 7 jours (HTG)
          </h4>
          <div className="h-52">
            <Bar
              data={{
                labels: recChart.map((d) => d.date),
                datasets: [{
                  data: recChart.map((d) => d.total),
                  backgroundColor: 'rgba(90,170,40,0.75)',
                  borderRadius: 6,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { callback: (v: any) => `${(v / 1000).toFixed(0)}k`, font: { size: 11 } },
                  },
                  x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                },
              } as any}
            />
          </div>
        </div>

        <div className="card p-5">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-[#e07a00] text-sm" />
            Par mode de paiement
          </h4>
          {Object.keys(parMode).length > 0 ? (
            <div className="h-52">
              <Pie
                data={{
                  labels: Object.keys(parMode),
                  datasets: [{
                    data: Object.values(parMode),
                    backgroundColor: COLORS,
                    borderWidth: 0,
                  }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } } },
                }}
              />
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="font-bold text-[13.5px] flex items-center gap-2">
            <i className="fa-solid fa-list text-[#1a4fc4] text-sm" />
            Transactions du mois
          </h4>
          <span className="badge badge-green">
            {total.toLocaleString('fr')} HTG encaissés
          </span>
        </div>
        <table className="w-full tbl">
          <thead><tr>
            <th>Date</th><th>Heure</th><th>Description</th>
            <th>Catégorie</th><th>Mode</th><th>Montant</th>
          </tr></thead>
          <tbody>
            {mouvements.map((m) => (
              <tr key={m.id}>
                <td className="text-[12px] text-gray-500">{fmtDate(m.date_mouvement)}</td>
                <td className="text-[12px] text-gray-400">{fmtTime(m.date_mouvement)}</td>
                <td className="font-semibold text-[13px]">{m.description}</td>
                <td><span className="badge badge-gray">{m.categorie}</span></td>
                <td className="text-[12px] text-gray-500">{m.mode_paiement}</td>
                <td>
                  <span className="font-extrabold font-mono text-[13px] text-[#5aaa28]">
                    +{m.montant.toLocaleString('fr')} HTG
                  </span>
                </td>
              </tr>
            ))}
            {mouvements.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8 text-[13px]">
                  Aucune recette ce mois
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
