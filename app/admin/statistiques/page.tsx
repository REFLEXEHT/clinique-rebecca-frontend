'use client'
// app/admin/statistiques/page.tsx — Statistiques par période: services, labo, pharmacie
import { useEffect, useState } from 'react'
import { statsApi, comptaApi } from '@/lib/api'
import { TrendingUp, Calendar, Activity, Download } from 'lucide-react'

interface PeriodeForm { debut:string; fin:string }

const COULEURS = ['#1641C8','#0d9488','#7c3aed','#dc2626','#d97706','#059669','#be185d','#6366f1']

const SERVICES_DEMO = [
  { nom:'Consultations', recette:850000, count:285 },
  { nom:'Laboratoire', recette:420000, count:320 },
  { nom:'Pharmacie', recette:380000, count:890 },
  { nom:'Dentisterie', recette:290000, count:58 },
  { nom:'Physiothérapie', recette:180000, count:150 },
  { nom:'Maternité', recette:650000, count:22 },
  { nom:'Optométrie', recette:120000, count:60 },
  { nom:'Gestes médicaux', recette:95000, count:320 },
]

const MOIS_DEMO = [
  { mois:'Nov',recette:220000,depense:95000 },{ mois:'Déc',recette:285000,depense:110000 },
  { mois:'Jan',recette:310000,depense:125000 },{ mois:'Fév',recette:275000,depense:108000 },
  { mois:'Mar',recette:340000,depense:130000 },{ mois:'Avr',recette:295000,depense:115000 },
]

export default function StatistiquesPage() {
  const [periode, setPeriode] = useState(() => ({ debut: new Date(Date.now()-30*86400000).toISOString().slice(0,10), fin: new Date().toISOString().slice(0,10) }))
  const [activeSection, setActiveSection] = useState<'global'|'services'|'labo'|'pharmacie'>('global')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    statsApi.dashboard().then(r => setStats(r.data)).catch(()=>{})
  }, [])

  const totalRecettes = SERVICES_DEMO.reduce((a,s)=>a+s.recette,0)
  const totalDepenses = MOIS_DEMO.reduce((a,m)=>a+m.depense,0)
  const maxBar = Math.max(...MOIS_DEMO.map(m=>m.recette), 1)
  const maxService = Math.max(...SERVICES_DEMO.map(s=>s.recette), 1)

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.3rem', marginBottom:4 }}>Statistiques</h1>
          <p style={{ color:'#64748b', fontSize:13 }}>Analyse des performances par service et par période</p>
        </div>
        <button style={{ display:'flex', alignItems:'center', gap:8, background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:12, padding:'9px 18px', fontWeight:700, fontSize:13, cursor:'pointer', color:'#374151' }}>
          <Download size={15} /> Exporter
        </button>
      </div>

      {/* Filtre période */}
      <div style={{ background:'white', borderRadius:16, border:'1px solid #e2e8f0', padding:'16px 20px', marginBottom:24, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Calendar size={16} color="#1641C8" />
          <span style={{ fontWeight:700, color:'#374151', fontSize:14 }}>Période :</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <input type="date" value={periode.debut} onChange={e => setPeriode(p=>({...p,debut:e.target.value}))}
            style={{ padding:'8px 12px', borderRadius:10, border:'1px solid #d1d5db', fontSize:13 }} />
          <span style={{ color:'#64748b' }}>au</span>
          <input type="date" value={periode.fin} onChange={e => setPeriode(p=>({...p,fin:e.target.value}))}
            style={{ padding:'8px 12px', borderRadius:10, border:'1px solid #d1d5db', fontSize:13 }} />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[{label:'7 jours',j:7},{label:'30 jours',j:30},{label:'3 mois',j:90},{label:'6 mois',j:180}].map(p => (
            <button key={p.label} onClick={() => setPeriode({ fin:new Date().toISOString().slice(0,10), debut:new Date(Date.now()-p.j*86400000).toISOString().slice(0,10) })}
              style={{ padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, background:'#eff6ff', color:'#1641C8' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Onglets section */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'white', borderRadius:14, border:'1px solid #e2e8f0', padding:6, width:'fit-content' }}>
        {[{key:'global',label:'Vue globale'},{key:'services',label:'Services'},{key:'labo',label:'Laboratoire'},{key:'pharmacie',label:'Pharmacie'}].map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key as any)}
            style={{ padding:'8px 18px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
              background:activeSection===s.key?'#1641C8':'transparent',
              color:activeSection===s.key?'white':'#64748b' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* VUE GLOBALE */}
      {activeSection==='global' && (
        <>
          {/* KPIs */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
            {[
              { label:'Recettes (période)', val:`${(totalRecettes/1000).toFixed(0)}k HTG`, trend:'+12%', up:true, couleur:'#16a34a', bg:'#f0fdf4' },
              { label:'Dépenses (période)', val:`${(totalDepenses/1000).toFixed(0)}k HTG`, trend:'+4%', up:false, couleur:'#dc2626', bg:'#fef2f2' },
              { label:'Bénéfice net', val:`${((totalRecettes-totalDepenses)/1000).toFixed(0)}k HTG`, trend:'+18%', up:true, couleur:'#1641C8', bg:'#eff6ff' },
              { label:'Patients servis', val:`${stats?.total_patients||1145}`, trend:'+8%', up:true, couleur:'#7c3aed', bg:'#f5f3ff' },
            ].map(k => (
              <div key={k.label} style={{ background:'white', borderRadius:16, padding:'20px', border:'1px solid #e2e8f0' }}>
                <div style={{ fontSize:'1.5rem', fontWeight:900, color:k.couleur }}>{k.val}</div>
                <div style={{ color:'#64748b', fontSize:12, fontWeight:600, marginTop:4 }}>{k.label}</div>
                <div style={{ fontSize:12, fontWeight:700, color:k.up?'#16a34a':'#dc2626', marginTop:6 }}>
                  <i className={`fa-solid ${k.up?'fa-arrow-trend-up':'fa-arrow-down'}`} style={{ marginRight:4 }} />{k.trend} vs période précédente
                </div>
              </div>
            ))}
          </div>

          {/* Graphique recettes vs dépenses */}
          <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:24, marginBottom:20 }}>
            <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.95rem', marginBottom:20 }}>Évolution mensuelle — Recettes vs Dépenses</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:16, height:160 }}>
              {MOIS_DEMO.map(m => (
                <div key={m.mois} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ width:'100%', display:'flex', gap:3, alignItems:'flex-end', height:140 }}>
                    <div style={{ flex:1, background:'#1641C8', borderRadius:'4px 4px 0 0', height:`${(m.recette/maxBar)*100}%`, minHeight:4 }} />
                    <div style={{ flex:1, background:'#dc2626', borderRadius:'4px 4px 0 0', height:`${(m.depense/maxBar)*100}%`, opacity:0.7, minHeight:4 }} />
                  </div>
                  <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{m.mois}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:16, marginTop:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:12, height:12, borderRadius:3, background:'#1641C8' }} /><span style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>Recettes</span></div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:12, height:12, borderRadius:3, background:'#dc2626', opacity:0.7 }} /><span style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>Dépenses</span></div>
            </div>
          </div>
        </>
      )}

      {/* VUE SERVICES */}
      {activeSection==='services' && (
        <>
          <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:24, marginBottom:20 }}>
            <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.95rem', marginBottom:20 }}>Performance par service</div>
            <div style={{ display:'grid', gap:12 }}>
              {SERVICES_DEMO.sort((a,b)=>b.recette-a.recette).map((s,i) => (
                <div key={s.nom}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background:COULEURS[i%COULEURS.length], flexShrink:0 }} />
                      <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{s.nom}</span>
                    </div>
                    <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                      <span style={{ fontSize:13, color:'#64748b' }}>{s.count} actes</span>
                      <span style={{ fontSize:14, fontWeight:800, color:'#0f172a' }}>{(s.recette/1000).toFixed(0)}k HTG</span>
                      <span style={{ fontSize:12, color:'#64748b', minWidth:32, textAlign:'right' as const }}>{Math.round(s.recette/totalRecettes*100)}%</span>
                    </div>
                  </div>
                  <div style={{ height:8, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:COULEURS[i%COULEURS.length], width:`${s.recette/maxService*100}%`, borderRadius:4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* VUE LABO */}
      {activeSection==='labo' && (
        <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:24 }}>
          <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.95rem', marginBottom:20 }}>Analyses laboratoire par examen</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
            {[
              {nom:'NFS',count:42,revenu:33600},{nom:'Glycémie',count:35,revenu:12250},
              {nom:'Bilan lipidique',count:28,revenu:33600},{nom:'TSH',count:22,revenu:33000},
              {nom:'ECBU',count:18,revenu:12600},{nom:'Sérologie VIH',count:15,revenu:11250},
              {nom:'HbA1c',count:14,revenu:15400},{nom:'Créatininémie',count:12,revenu:7200},
            ].map((e,i) => (
              <div key={e.nom} style={{ background:'#f8fafc', borderRadius:14, padding:'16px' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:COULEURS[i%COULEURS.length]+'15', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                  <i className="fa-solid fa-flask-vial" style={{ color:COULEURS[i%COULEURS.length], fontSize:16 }} />
                </div>
                <div style={{ fontWeight:800, color:'#0f172a', fontSize:13, marginBottom:4 }}>{e.nom}</div>
                <div style={{ fontSize:'1.3rem', fontWeight:900, color:COULEURS[i%COULEURS.length] }}>{e.count}</div>
                <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{(e.revenu/1000).toFixed(1)}k HTG</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VUE PHARMACIE */}
      {activeSection==='pharmacie' && (
        <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:24 }}>
          <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.95rem', marginBottom:20 }}>Médicaments les plus vendus</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Médicament','Catégorie','Unités vendues','Revenu','% du total'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', color:'#64748b', fontWeight:700, fontSize:12, borderBottom:'1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {nom:'Amoxicilline 500mg',cat:'Antibiotique',unites:1240,revenu:55800,pct:14.7},
                {nom:'Paracétamol 500mg',cat:'Analgésique',unites:2100,revenu:31500,pct:8.3},
                {nom:'Ibuprofène 400mg',cat:'Anti-inflammatoire',unites:890,revenu:22250,pct:5.9},
                {nom:'Amlodipine 5mg',cat:'Antihypertenseur',unites:650,revenu:26000,pct:6.8},
                {nom:'Metformine 500mg',cat:'Antidiabétique',unites:520,revenu:15600,pct:4.1},
              ].map((m,i) => (
                <tr key={m.nom} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'12px 16px', fontWeight:700, color:'#0f172a' }}>{m.nom}</td>
                  <td style={{ padding:'12px 16px', color:'#64748b' }}><span style={{ background:COULEURS[i%COULEURS.length]+'12', color:COULEURS[i%COULEURS.length], borderRadius:8, padding:'3px 8px', fontSize:11, fontWeight:700 }}>{m.cat}</span></td>
                  <td style={{ padding:'12px 16px', color:'#374151', fontWeight:600 }}>{m.unites.toLocaleString()}</td>
                  <td style={{ padding:'12px 16px', fontWeight:800, color:'#16a34a' }}>{(m.revenu/1000).toFixed(1)}k HTG</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', background:COULEURS[i%COULEURS.length], width:`${m.pct*4}%`, borderRadius:3 }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:'#64748b', minWidth:36 }}>{m.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
