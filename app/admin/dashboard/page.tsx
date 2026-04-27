'use client'
// app/admin/dashboard/page.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { statsApi, rdvApi } from '@/lib/api'
import { DashboardStats, RendezVous } from '@/types'
import RebeccaAI from '@/components/ui/RebeccaAI'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const STATUS_MAP = {
  confirme: { label: 'Confirmé', cls: 'badge-green' },
  en_attente: { label: 'En attente', cls: 'badge-yellow' },
  annule: { label: 'Annulé', cls: 'badge-red' },
  termine: { label: 'Terminé', cls: 'badge-gray' },
}

function KpiCard({ icon, color, bg, value, label, trend, up }: any) {
  return (
    <div className="kpi-card">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
        style={{ background: bg, color }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className="text-2xl font-black leading-none mb-1" style={{ color }}>{value}</div>
      <div className="text-xs text-slate-500 font-semibold mb-1.5">{label}</div>
      {trend && (
        <div className={`text-[11px] font-bold flex items-center gap-1 ${up ? 'text-green-600' : 'text-red-500'}`}>
          <i className={`fa-solid ${up ? 'fa-arrow-trend-up' : 'fa-arrow-down'} text-xs`} />
          {trend}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [rdvChart, setRdvChart] = useState<any[]>([])
  const [rdvList, setRdvList] = useState<RendezVous[]>([])
  const [loading, setLoading] = useState(true)
  const [showAI, setShowAI] = useState(false)
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }))
    Promise.allSettled([
      statsApi.dashboard(),
      statsApi.rdvParJour(7),
      rdvApi.adminList(),
    ]).then(([s, chart, list]) => {
      if (s.status === 'fulfilled') setStats(s.value.data)
      if (chart.status === 'fulfilled') setRdvChart(chart.value.data)
      if (list.status === 'fulfilled') setRdvList(list.value.data.slice(0, 6))
    }).finally(() => setLoading(false))
  }, [])

  const lineData = {
    labels: rdvChart.map((d: any) => d.date),
    datasets: [{
      label: 'Consultations',
      data: rdvChart.map((d: any) => d.count),
      borderColor: '#1641C8', backgroundColor: 'rgba(22,65,200,0.07)',
      borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 3,
      pointBackgroundColor: '#1641C8',
    }],
  }

  const doughnutData = {
    labels: ['Clinique ext.', 'Labo', 'Dentiste', 'Physio', 'Pharma'],
    datasets: [{
      data: [42, 18, 14, 12, 14],
      backgroundColor: ['#1641C8', '#22c55e', '#d97706', '#be185d', '#6366f1'],
      borderWidth: 0,
    }],
  }

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  }

  return (
    <div className="p-7">
      {/* Bouton Rebecca AI */}
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button onClick={() => setShowAI(v => !v)} style={{
          display:'flex', alignItems:'center', gap:8, padding:'10px 20px',
          borderRadius:50, border:'none', cursor:'pointer', fontWeight:700, fontSize:13,
          background: showAI ? '#6366f1' : '#f5f3ff', color: showAI ? 'white' : '#6366f1',
          transition:'all 0.2s',
        }}>
          <i className="fa-solid fa-wand-magic-sparkles" />
          {showAI ? 'Fermer Rebecca AI' : 'Rebecca AI — Analyse & Alertes'}
        </button>
      </div>
      {showAI && stats && (
        <div style={{ marginBottom:24, borderRadius:20, overflow:'hidden', border:'1px solid #e2e8f0', boxShadow:'0 4px 24px rgba(99,102,241,0.1)' }}>
          <RebeccaAI
            mode="admin"
            context={{
              stats_jour: { rdv: stats.rdv_today, recettes: stats.recettes_day },
              stats_mois: { rdv: stats.rdv_month, patients: stats.patients_month, recettes: stats.recettes_month },
              rdv_en_attente: stats.rdv_en_attente,
              taux_presence: stats.taux_presence,
              derniers_rdv: rdvList.slice(0,5).map(r => ({ patient: r.patient_nom, specialite: r.specialite, statut: r.statut })),
            }}
            initialPrompt="Donne-moi un résumé de la situation actuelle et les alertes importantes."
          />
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Tableau de bord</h1>
          <p className="text-slate-500 text-[13px] mt-0.5 capitalize">{today}</p>
        </div>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard icon="fa-calendar-check" color="#1641C8" bg="rgba(22,65,200,0.09)"
            value={stats.rdv_today} label="RDV aujourd'hui" trend="+3 vs hier" up />
          <KpiCard icon="fa-users" color="#22c55e" bg="rgba(34,197,94,0.09)"
            value={stats.patients_month} label="Patients ce mois" trend="+18%" up />
          <KpiCard icon="fa-cash-register" color="#d97706" bg="rgba(245,158,11,0.09)"
            value={`${(stats.recettes_day / 1000).toFixed(0)}k`} label="Recettes du jour (HTG)" trend="+12%" up />
          <KpiCard icon="fa-clock" color="#dc2626" bg="rgba(220,38,38,0.09)"
            value={stats.rdv_en_attente} label="RDV en attente" />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard icon="fa-calendar-check" color="#1641C8" bg="rgba(22,65,200,0.09)"
            value="—" label="RDV aujourd'hui" />
          <KpiCard icon="fa-users" color="#22c55e" bg="rgba(34,197,94,0.09)"
            value="—" label="Patients ce mois" />
          <KpiCard icon="fa-cash-register" color="#d97706" bg="rgba(245,158,11,0.09)"
            value="—" label="Recettes du jour" />
          <KpiCard icon="fa-clock" color="#dc2626" bg="rgba(220,38,38,0.09)"
            value="—" label="RDV en attente" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="card p-5">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-[#1641C8] text-sm" />
            Consultations — 7 derniers jours
          </h4>
          <div className="h-48">
            {rdvChart.length > 0 ? (
              <Line data={lineData} options={chartOpts as any} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm">
                Connectez l'API pour voir les données
              </div>
            )}
          </div>
        </div>
        <div className="card p-5">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-[#1641C8] text-sm" />
            Répartition par service
          </h4>
          <div className="h-48">
            <Doughnut data={doughnutData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } } },
              cutout: '62%',
            }} />
          </div>
        </div>
      </div>

      {/* Recent RDV */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="font-bold text-[13.5px] flex items-center gap-2">
            <i className="fa-regular fa-calendar-check text-[#1641C8] text-sm" />
            Rendez-vous récents
          </h4>
          <Link href="/admin/rendez-vous"
            className="text-[12.5px] text-[#1641C8] font-bold hover:underline no-underline">
            Voir tout →
          </Link>
        </div>
        <table className="tbl w-full">
          <thead><tr>
            <th>Date/Heure</th><th>Patient</th><th>Spécialité</th><th>Type</th><th>Statut</th>
          </tr></thead>
          <tbody>
            {rdvList.length > 0 ? rdvList.map(rdv => {
              const s = STATUS_MAP[rdv.statut] || STATUS_MAP.en_attente
              return (
                <tr key={rdv.id}>
                  <td>
                    <div className="font-bold text-[13px]">
                      {new Date(rdv.date_rdv).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {new Date(rdv.date_rdv).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-[13px]">{rdv.patient_nom}</div>
                    <div className="text-slate-400 text-xs">{rdv.patient_telephone}</div>
                  </td>
                  <td className="text-[13px]">{rdv.specialite}</td>
                  <td>
                    <span className={`badge ${rdv.type_rdv === 'video' ? 'badge-blue' : 'badge-gray'}`}>
                      <i className={`fa-solid ${rdv.type_rdv === 'video' ? 'fa-video' : 'fa-user'} text-xs`} />
                      {rdv.type_rdv === 'video' ? 'Vidéo' : 'Présentiel'}
                    </span>
                  </td>
                  <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                </tr>
              )
            }) : (
              // Données de démonstration si API non connectée
              [
                { h: '08:00', p: 'Marie Théodore', t: '+509 3456-7890', s: 'Gynécologie', type: 'Présentiel', st: 'Confirmé', sc: 'badge-green' },
                { h: '09:00', p: 'Lucie Pierre', t: '+509 3123-4567', s: 'Pédiatrie', type: 'Vidéo', st: 'En attente', sc: 'badge-yellow' },
                { h: '10:00', p: 'Jean-Marc Dorval', t: '+509 3654-3210', s: 'Neurologie', type: 'Vidéo', st: 'Confirmé', sc: 'badge-green' },
              ].map((r, i) => (
                <tr key={i}>
                  <td><div className="font-bold text-[13px]">Aujourd'hui</div><div className="text-slate-400 text-xs">{r.h}</div></td>
                  <td><div className="font-bold text-[13px]">{r.p}</div><div className="text-slate-400 text-xs">{r.t}</div></td>
                  <td className="text-[13px]">{r.s}</td>
                  <td><span className={`badge ${r.type === 'Vidéo' ? 'badge-blue' : 'badge-gray'}`}>{r.type}</span></td>
                  <td><span className={`badge ${r.sc}`}>{r.st}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
