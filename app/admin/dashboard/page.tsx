'use client'
import { useEffect, useState } from 'react'
import { statsApi, rdvApi } from '@/lib/api'
import { DashboardStats, RendezVous } from '@/types'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const STATUT_BADGE: Record<string, string> = {
  confirme: 'badge-green',
  en_attente: 'badge-yellow',
  annule: 'badge-red',
  termine: 'badge-gray',
}
const STATUT_LABEL: Record<string, string> = {
  confirme: 'Confirmé',
  en_attente: 'En attente',
  annule: 'Annulé',
  termine: 'Terminé',
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [rdvChart, setRdvChart] = useState<any[]>([])
  const [rdvList, setRdvList] = useState<RendezVous[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      statsApi.dashboard(),
      statsApi.rdvParJour(7),
      rdvApi.adminList({ statut: undefined }),
    ]).then(([s, chart, list]) => {
      setStats(s.data)
      setRdvChart(chart.data)
      setRdvList(list.data.slice(0, 6))
    }).finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const lineData = {
    labels: rdvChart.map((d: any) => d.date),
    datasets: [{
      label: 'Consultations',
      data: rdvChart.map((d: any) => d.count),
      borderColor: '#1a4fc4',
      backgroundColor: 'rgba(26,79,196,0.07)',
      borderWidth: 2.5,
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointBackgroundColor: '#1a4fc4',
    }],
  }

  const doughnutData = {
    labels: ['Clinique ext.', 'Labo', 'Dentiste', 'Physio', 'Pharma'],
    datasets: [{
      data: [42, 18, 14, 12, 14],
      backgroundColor: ['#1a4fc4', '#5aaa28', '#e07a00', '#be185d', '#6366f1'],
      borderWidth: 0,
    }],
  }

  const KPI = ({ icon, color, bg, value, label, trend, trendUp }: any) => (
    <div className="kpi-card">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
        style={{ background: bg, color }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className="text-[26px] font-black leading-none mb-1" style={{ color }}>{value}</div>
      <div className="text-[12px] text-gray-500 font-semibold mb-1.5">{label}</div>
      {trend && (
        <div className={`text-[11.5px] font-bold flex items-center gap-1 ${trendUp ? 'text-[#5aaa28]' : 'text-red-500'}`}>
          <i className={`fa-solid ${trendUp ? 'fa-arrow-trend-up' : 'fa-arrow-down'} text-xs`} />
          {trend}
        </div>
      )}
    </div>
  )

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Tableau de bord</h1>
          <p className="text-gray-500 text-[13px] mt-0.5 capitalize">{today}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KPI icon="fa-calendar-check" color="#1a4fc4" bg="rgba(26,79,196,0.1)"
            value={stats.rdv_today} label="RDV aujourd'hui" trend="+3 vs hier" trendUp />
          <KPI icon="fa-users" color="#5aaa28" bg="rgba(90,170,40,0.1)"
            value={stats.patients_month} label="Patients ce mois" trend="+18%" trendUp />
          <KPI icon="fa-cash-register" color="#e07a00" bg="rgba(224,122,0,0.12)"
            value={`${(stats.recettes_day / 1000).toFixed(0)}k`} label="Recettes du jour (HTG)" trend="+12%" trendUp />
          <KPI icon="fa-clock" color="#dc2626" bg="rgba(220,38,38,0.1)"
            value={stats.rdv_en_attente} label="RDV en attente" trend="À confirmer" trendUp={false} />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="card p-5">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-[#1a4fc4] text-sm" />
            Consultations — 7 derniers jours
          </h4>
          <div className="h-48">
            <Line data={lineData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
              },
            }} />
          </div>
        </div>
        <div className="card p-5">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-[#1a4fc4] text-sm" />
            Répartition par service
          </h4>
          <div className="h-48">
            <Doughnut data={doughnutData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 } } } },
              cutout: '62%',
            }} />
          </div>
        </div>
      </div>

      {/* Recent RDV */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h4 className="font-bold text-[13.5px] flex items-center gap-2">
            <i className="fa-regular fa-calendar-check text-[#1a4fc4] text-sm" />
            Prochains rendez-vous
          </h4>
          <a href="/admin/rendez-vous" className="text-[12.5px] text-[#1a4fc4] font-bold hover:underline">
            Voir tout →
          </a>
        </div>
        <table className="w-full tbl">
          <thead>
            <tr>
              <th>Heure</th><th>Patient</th><th>Spécialité</th><th>Type</th><th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rdvList.map((rdv) => (
              <tr key={rdv.id}>
                <td className="font-bold text-[12.5px]">
                  {new Date(rdv.date_rdv).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <div className="font-bold text-[13px]">{rdv.patient_nom}</div>
                  <div className="text-gray-400 text-xs">{rdv.patient_telephone}</div>
                </td>
                <td className="text-[13px]">{rdv.specialite}</td>
                <td>
                  <span className={`badge ${rdv.type_rdv === 'video' ? 'badge-blue' : 'badge-gray'}`}>
                    <i className={`fa-solid ${rdv.type_rdv === 'video' ? 'fa-video' : 'fa-user'} text-xs`} />
                    {rdv.type_rdv === 'video' ? 'Vidéo' : 'Présentiel'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${STATUT_BADGE[rdv.statut]}`}>
                    {STATUT_LABEL[rdv.statut]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
