'use client'
// app/admin/statistiques/page.tsx — Rapports financiers et statistiques complètes
import { useEffect, useState } from 'react'
import { statsApi, rdvApi, comptaApi } from '@/lib/api'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const MOIS_NOMS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

const COULEURS_CHART = {
  blue: '#1641C8',
  blueLight: 'rgba(22,65,200,0.12)',
  green: '#22c55e',
  greenLight: 'rgba(34,197,94,0.12)',
  orange: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
}

export default function AdminStatistiques() {
  const [periode, setPeriode] = useState({
    dateDebut: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10),
    dateFin:   new Date().toISOString().slice(0,10),
  })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [rdvData, setRdvData] = useState<any[]>([])
  const [recettesData, setRecettesData] = useState<any[]>([])

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      statsApi.dashboard(),
      statsApi.rdvParJour(30),
      statsApi.recettesParJour(30),
    ]).then(([s, rdv, rec]) => {
      if (s.status === 'fulfilled') setStats(s.value.data)
      if (rdv.status === 'fulfilled') setRdvData(rdv.value.data)
      if (rec.status === 'fulfilled') setRecettesData(rec.value.data)
    }).finally(() => setLoading(false))
  }, [periode])

  // Données demo si API non connectée
  const demoMois = MOIS_NOMS.slice(0,6)
  const demoRecettes = [480000, 520000, 610000, 540000, 730000, 680000]
  const demoDep = [210000, 195000, 240000, 220000, 280000, 255000]
  const demoRdv = [142, 158, 201, 175, 220, 198]

  const lineRecettes = {
    labels: recettesData.length ? recettesData.map(d => d.date) : demoMois,
    datasets: [
      {
        label: 'Recettes',
        data: recettesData.length ? recettesData.map(d => d.montant) : demoRecettes,
        borderColor: COULEURS_CHART.green, backgroundColor: COULEURS_CHART.greenLight,
        borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 3,
      },
      {
        label: 'Dépenses',
        data: demoDep,
        borderColor: COULEURS_CHART.red, backgroundColor: 'rgba(239,68,68,0.07)',
        borderWidth: 2, tension: 0.4, fill: true, pointRadius: 3,
      },
    ],
  }

  const barRdv = {
    labels: rdvData.length ? rdvData.map(d => d.date) : demoMois,
    datasets: [{
      label: 'Consultations',
      data: rdvData.length ? rdvData.map(d => d.count) : demoRdv,
      backgroundColor: COULEURS_CHART.blueLight,
      borderColor: COULEURS_CHART.blue,
      borderWidth: 1.5, borderRadius: 6,
    }],
  }

  const doughnutServices = {
    labels: ['Clinique ext.','Labo','Pharmacie','Dentiste','Physio','Autres'],
    datasets: [{
      data: [42, 18, 15, 11, 9, 5],
      backgroundColor: [COULEURS_CHART.blue, COULEURS_CHART.green, COULEURS_CHART.orange, '#be185d', '#8b5cf6', '#64748b'],
      borderWidth: 0,
    }],
  }

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  }

  const fmt = (n: number) => n.toLocaleString('fr') + ' HTG'

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Statistiques & Rapports</h1>
          <p className="text-slate-500 text-[13px] mt-0.5">Tableaux de bord financiers et opérationnels</p>
        </div>
        {/* Sélecteur période */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 mr-1">Période :</div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block">Début</label>
            <input type="date" value={periode.dateDebut}
              onChange={e => setPeriode(p => ({...p, dateDebut: e.target.value}))}
              className="text-xs border-none bg-transparent outline-none font-semibold text-slate-700 cursor-pointer"/>
          </div>
          <div className="text-slate-300">→</div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block">Fin</label>
            <input type="date" value={periode.dateFin}
              onChange={e => setPeriode(p => ({...p, dateFin: e.target.value}))}
              className="text-xs border-none bg-transparent outline-none font-semibold text-slate-700 cursor-pointer"/>
          </div>
        </div>
      </div>

      {/* KPIs financiers */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon:'fa-arrow-trend-up', color:'#22c55e', bg:'rgba(34,197,94,0.1)', label:'Recettes totales', value:fmt(3560000), trend:'+14% vs période préc.' },
          { icon:'fa-arrow-trend-down', color:'#ef4444', bg:'rgba(239,68,68,0.1)', label:'Dépenses totales', value:fmt(1400000), trend:'+6% vs période préc.' },
          { icon:'fa-scale-balanced', color:'#1641C8', bg:'rgba(22,65,200,0.1)', label:'Résultat net', value:fmt(2160000), trend:'+18% vs période préc.' },
          { icon:'fa-users', color:'#d97706', bg:'rgba(245,158,11,0.1)', label:'Patients vus', value:'1 094', trend:'+22% vs période préc.' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{background:k.bg,color:k.color}}>
              <i className={`fa-solid ${k.icon}`}/>
            </div>
            <div className="text-xl font-black mb-0.5" style={{color:k.color}}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold mb-1">{k.label}</div>
            <div className="text-[11px] text-green-600 font-bold">{k.trend}</div>
          </div>
        ))}
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Recettes vs Dépenses */}
        <div className="card p-5 col-span-2">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-area text-[#1641C8] text-sm"/>
            Recettes vs Dépenses (HTG)
          </h4>
          <div className="h-52">
            <Line data={lineRecettes} options={chartOpts as any}/>
          </div>
          <div className="flex gap-4 mt-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-green-500 rounded-full inline-block"/>Recettes</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-red-400 rounded-full inline-block"/>Dépenses</span>
          </div>
        </div>

        {/* Répartition services */}
        <div className="card p-5">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-[#1641C8] text-sm"/>
            Recettes par service (%)
          </h4>
          <div className="h-44">
            <Doughnut data={doughnutServices} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:true, position:'bottom', labels:{ font:{size:10}, boxWidth:10 } } } }}/>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Consultations */}
        <div className="card p-5">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-calendar-check text-[#1641C8] text-sm"/>
            Consultations par période
          </h4>
          <div className="h-48">
            <Bar data={barRdv} options={chartOpts as any}/>
          </div>
        </div>

        {/* Tableau récapitulatif */}
        <div className="card p-5">
          <h4 className="font-bold text-[13.5px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-table text-[#1641C8] text-sm"/>
            Récapitulatif par service
          </h4>
          <table className="tbl w-full text-xs">
            <thead>
              <tr>
                <th>Service</th>
                <th className="text-right">Patients</th>
                <th className="text-right">Recettes</th>
                <th className="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {[
                { svc:'Clinique externe', p:460, rec:1493200, pct:42 },
                { svc:'Laboratoire', p:197, rec:640800, pct:18 },
                { svc:'Pharmacie', p:164, rec:534000, pct:15 },
                { svc:'Dentisterie', p:120, rec:391600, pct:11 },
                { svc:'Physiothérapie', p:98, rec:320400, pct:9 },
                { svc:'Autres', p:55, rec:180000, pct:5 },
              ].map(row => (
                <tr key={row.svc}>
                  <td className="font-semibold">{row.svc}</td>
                  <td className="text-right text-slate-600">{row.p}</td>
                  <td className="text-right font-bold text-green-600">{row.rec.toLocaleString('fr')}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="h-1.5 bg-[#1641C8] rounded-full" style={{width:`${row.pct*1.5}px`}}/>
                      {row.pct}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note données démo */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium flex items-center gap-2">
        <i className="fa-solid fa-info-circle"/>
        Les données affichées sont des données de démonstration. Connectez l'API pour voir les données réelles de la clinique.
      </div>
    </div>
  )
}
