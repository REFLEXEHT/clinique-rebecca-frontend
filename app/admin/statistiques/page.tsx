'use client'
// app/admin/statistiques/page.tsx
import { useEffect, useState } from 'react'
import { statsApi } from '@/lib/api'
import { DashboardStats } from '@/types'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)

const OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
}

export default function AdminStats() {
  const [stats, setStats]       = useState<DashboardStats | null>(null)
  const [rdvChart, setRdvChart] = useState<any[]>([])
  const [recChart, setRecChart] = useState<any[]>([])

  useEffect(() => {
    statsApi.dashboard().then(r=>setStats(r.data)).catch(()=>{})
    statsApi.rdvParJour(14).then(r=>setRdvChart(r.data)).catch(()=>{})
    statsApi.recettesParJour(14).then(r=>setRecChart(r.data)).catch(()=>{})
  }, [])

  const KPIS = [
    { icon:'fa-users', color:'#1641C8', bg:'rgba(22,65,200,0.09)', label:'Patients (mois)', value: stats?.patients_month ?? '—', trend:'+22%', up:true },
    { icon:'fa-calendar-check', color:'#22c55e', bg:'rgba(34,197,94,0.09)', label:'Taux présence RDV', value: stats ? `${stats.taux_presence}%` : '—', trend:'+2pts', up:true },
    { icon:'fa-chart-line', color:'#d97706', bg:'rgba(245,158,11,0.09)', label:'Recettes du mois', value: stats ? `${(stats.recettes_month/1000).toFixed(0)}k HTG` : '—', trend:'+18%', up:true },
    { icon:'fa-video', color:'#be185d', bg:'rgba(190,24,93,0.09)', label:'Consultations vidéo', value:'38%', trend:'+8pts', up:true },
  ]

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold">Statistiques</h1>
        <p className="text-slate-500 text-[13px] mt-0.5">Analyses détaillées de l'activité de la clinique</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {KPIS.map(k=>(
          <div key={k.label} className="kpi-card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{background:k.bg,color:k.color}}>
              <i className={`fa-solid ${k.icon}`}/>
            </div>
            <div className="text-2xl font-black mb-1" style={{color:k.color}}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold mb-1">{k.label}</div>
            <div className={`text-[11px] font-bold flex items-center gap-1 ${k.up?'text-green-600':'text-red-500'}`}>
              <i className={`fa-solid ${k.up?'fa-arrow-trend-up':'fa-arrow-down'} text-xs`}/>{k.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-[#1641C8] text-sm"/>
            Consultations — 14 derniers jours
          </h4>
          <div className="h-52">
            {rdvChart.length>0 ? (
              <Line data={{
                labels: rdvChart.map(d=>d.date),
                datasets:[{ data:rdvChart.map(d=>d.count), borderColor:'#1641C8', backgroundColor:'rgba(22,65,200,0.07)', borderWidth:2.5, tension:0.4, fill:true, pointRadius:3 }]
              }} options={OPTS as any}/>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm">
                Connectez l'API pour voir les données
              </div>
            )}
          </div>
        </div>
        <div className="card p-5">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-bar text-green-600 text-sm"/>
            Recettes journalières (HTG)
          </h4>
          <div className="h-52">
            {recChart.length>0 ? (
              <Bar data={{
                labels: recChart.map(d=>d.date),
                datasets:[{ data:recChart.map(d=>d.total), backgroundColor:'rgba(34,197,94,0.75)', borderRadius:6 }]
              }} options={{ ...OPTS, scales:{ ...OPTS.scales, y:{ ...OPTS.scales.y, ticks:{ callback:(v:any)=>`${v/1000}k`, font:{size:11} } } } } as any}/>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm">
                Connectez l'API pour voir les données
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
          <i className="fa-solid fa-chart-bar text-[#d97706] text-sm"/>
          Top spécialités demandées
        </h4>
        <div className="h-48">
          <Bar data={{
            labels:['Gynécologie','Pédiatrie','Orthopédie','Neurologie','ORL','Chirurgie','Médecine int.'],
            datasets:[{ data:[68,52,44,38,32,28,24], backgroundColor:'rgba(22,65,200,0.75)', borderRadius:6 }]
          }} options={OPTS as any}/>
        </div>
      </div>
    </div>
  )
}
