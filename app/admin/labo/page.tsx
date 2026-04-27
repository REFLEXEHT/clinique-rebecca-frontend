'use client'
// app/admin/labo/page.tsx — Dashboard laboratoire admin avec statistiques
import { useEffect, useState } from 'react'
import { laboApi } from '@/lib/api'
import { ResultatLabo } from '@/types'
import { FlaskConical, TrendingUp, Clock, CheckCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const EXAMENS_STATS = [
  { nom:'NFS', count:42, pct:22 },{ nom:'Glycémie', count:35, pct:18 },
  { nom:'Bilan lipidique', count:28, pct:14 },{ nom:'TSH', count:22, pct:11 },
  { nom:'ECBU', count:18, pct:9 },{ nom:'Sérologie VIH', count:15, pct:8 },
  { nom:'HbA1c', count:14, pct:7 },{ nom:'Créatininémie', count:12, pct:6 },
  { nom:'Autres', count:10, pct:5 },
]

const STATUS_MAP: Record<string,{label:string;bg:string;color:string}> = {
  en_attente:{ label:'En attente', bg:'#fffbeb', color:'#d97706' },
  disponible:{ label:'Disponible', bg:'#eff6ff', color:'#1641C8' },
  envoye:{ label:'Transmis', bg:'#f0fdf4', color:'#16a34a' },
}

const DEMO: ResultatLabo[] = [
  { id:1, patient_id:'#RB-42015', patient_nom:'Marie Théodore', type_examen:'NFS', resultats:'Normal', notes:'', date_examen:new Date().toISOString(), technicien_id:1, status:'disponible' as 'en_attente' | 'disponible' | 'envoye' },
  { id:2, patient_id:'#RB-39841', patient_nom:'Paul Jean-Baptiste', type_examen:'Glycémie à jeun', resultats:'Élevée: 1.26 g/L', notes:'Légèrement élevé', date_examen:new Date().toISOString(), technicien_id:1, status:'en_attente' as 'en_attente' | 'disponible' | 'envoye' },
  { id:3, patient_id:'#RB-51203', patient_nom:'Rose Étienne', type_examen:'TSH', resultats:'2.8 mUI/L — Normal', notes:'', date_examen:new Date(Date.now()-86400000).toISOString(), technicien_id:1, status:'envoye' as 'en_attente' | 'disponible' | 'envoye' },
]

const COULEURS = ['#1641C8','#0d9488','#7c3aed','#dc2626','#d97706','#059669','#be185d','#374151','#6366f1']

export default function AdminLaboPage() {
  const [resultats, setResultats] = useState<ResultatLabo[]>(DEMO)
  const [filtreStatus, setFiltreStatus] = useState('tous')
  const [periode, setPeriode] = useState('mois')

  useEffect(() => {
    laboApi.list().then(r => { if (r.data?.length) setResultats(r.data) }).catch(()=>{})
  }, [])

  const stats = {
    total: resultats.length,
    attente: resultats.filter(r=>r.status==='en_attente').length,
    disponibles: resultats.filter(r=>r.status==='disponible').length,
    envoyes: resultats.filter(r=>r.status==='envoye').length,
  }

  const filtered = filtreStatus==='tous' ? resultats : resultats.filter(r=>r.status===filtreStatus)

  return (
    <div style={{ padding:28 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.3rem', marginBottom:4 }}>Laboratoire — Tableau de bord</h1>
        <p style={{ color:'#64748b', fontSize:13 }}>Statistiques et suivi des résultats d'analyses</p>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {[
          { label:'Total analyses', val:stats.total, icon:<FlaskConical size={20}/>, couleur:'#0d9488', bg:'#f0fdfa' },
          { label:'En attente', val:stats.attente, icon:<Clock size={20}/>, couleur:'#d97706', bg:'#fffbeb' },
          { label:'Disponibles', val:stats.disponibles, icon:<CheckCircle size={20}/>, couleur:'#1641C8', bg:'#eff6ff' },
          { label:'Transmis', val:stats.envoyes, icon:<Send size={20}/>, couleur:'#16a34a', bg:'#f0fdf4' },
        ].map(k => (
          <div key={k.label} style={{ background:'white', borderRadius:16, padding:'20px', border:'1px solid #e2e8f0' }}>
            <div style={{ width:40, height:40, borderRadius:12, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', color:k.couleur, marginBottom:12 }}>{k.icon}</div>
            <div style={{ fontSize:'1.8rem', fontWeight:900, color:k.couleur }}>{k.val}</div>
            <div style={{ color:'#64748b', fontSize:12, fontWeight:600, marginTop:4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:20, marginBottom:24 }}>
        {/* Répartition par examen */}
        <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:24 }}>
          <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.9rem', marginBottom:20 }}>Examens les plus demandés</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {EXAMENS_STATS.map((e,i) => (
              <div key={e.nom}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:13, color:'#374151', fontWeight:600 }}>{e.nom}</span>
                  <span style={{ fontSize:12, color:'#64748b' }}>{e.count} ({e.pct}%)</span>
                </div>
                <div style={{ height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:COULEURS[i%COULEURS.length], width:`${e.pct}%`, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Évolution mensuelle (simple bar chart) */}
        <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.9rem' }}>Volume par mois</div>
            <div style={{ display:'flex', gap:6 }}>
              {['semaine','mois','trimestre'].map(p => (
                <button key={p} onClick={() => setPeriode(p)} style={{ padding:'5px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                  background:periode===p?'#0d9488':'#f1f5f9', color:periode===p?'white':'#64748b' }}>
                  {p.charAt(0).toUpperCase()+p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:140 }}>
            {[32,41,28,55,48,62,44,71,58,66,53,79].slice(0,periode==='semaine'?7:periode==='mois'?8:12).map((v,i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <span style={{ fontSize:10, color:'#94a3b8', fontWeight:600 }}>{v}</span>
                <div style={{ width:'100%', background:'#0d9488', borderRadius:4, height:`${(v/79)*100}%`, minHeight:4 }} />
                <span style={{ fontSize:10, color:'#94a3b8' }}>{['Jan','Fév','Mar','Avr','Mai','Jui','Juil','Aoû','Sep','Oct','Nov','Déc'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table résultats */}
      <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <div style={{ padding:'16px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontWeight:800, color:'#0f172a', fontSize:'0.9rem' }}>Tous les résultats</span>
          <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
            {['tous','en_attente','disponible','envoye'].map(f => (
              <button key={f} onClick={() => setFiltreStatus(f)} style={{ padding:'5px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                background:filtreStatus===f?'#1641C8':'#f1f5f9', color:filtreStatus===f?'white':'#64748b' }}>
                {f==='tous'?'Tous':STATUS_MAP[f]?.label||f}
              </button>
            ))}
          </div>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#f8fafc' }}>
              {['Code','Patient','Examen','Résultats','Date','Statut'].map(h => (
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', color:'#64748b', fontWeight:700, fontSize:12, borderBottom:'1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const s = STATUS_MAP[r.status||'en_attente']
              return (
                <tr key={r.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'12px 16px', fontWeight:700, color:'#0d9488', fontFamily:'monospace' }}>{r.patient_id}</td>
                  <td style={{ padding:'12px 16px', fontWeight:600, color:'#0f172a' }}>{r.patient_nom}</td>
                  <td style={{ padding:'12px 16px', color:'#374151' }}>{r.type_examen}</td>
                  <td style={{ padding:'12px 16px', color:'#64748b', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{r.resultats}</td>
                  <td style={{ padding:'12px 16px', color:'#94a3b8', fontSize:12 }}>{new Date(r.date_examen).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ background:s.bg, color:s.color, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700 }}>{s.label}</span>
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
