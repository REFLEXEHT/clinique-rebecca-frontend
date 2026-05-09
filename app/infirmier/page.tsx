'use client'
import toast from 'react-hot-toast'
import ChangePasswordModal from '@/components/ui/ChangePasswordModal'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import VerificationPaiement from '@/components/ui/VerificationPaiement'
import { LogOut, Search, Activity, Clock, AlertTriangle, CheckCircle, Printer } from 'lucide-react'

interface Dossier {
 id: number; patient_numero: string; type_visite: string
 specialite: string; statut: string; date_visite: string
}

export default function InfirmierDashboard() {
 const { user, isAuthenticated, loading, logout , mustChangePassword, setMustChangePassword } = useAuth()
 const router = useRouter()
 const [dossiers, setDossiers] = useState<Dossier[]>([])
 const [selected, setSelected] = useState<Dossier | null>(null)
 const [sv, setSv] = useState<Record<string, string>>({})
 const [alertes, setAlertes] = useState<string[]>([])
 const [submitting, setSubmitting] = useState(false)
 // Search by patient ID
 const [searchId, setSearchId] = useState('')
 const [onglet, setOnglet] = useState<'queue'|'attente'|'alertes'|'recherche'|'paiement'|'avenir'>('queue')
 const [queue, setQueue] = useState<any[]>([])
 const [rdvAvenir, setRdvAvenir] = useState<any[]>([])
 const [alertesPrescriptions, setAlertesPrescriptions] = useState<any[]>([])
 const [selectedRdv, setSelectedRdv] = useState<any>(null)
 const [svRdv, setSvRdv] = useState({tension:'',pouls:'',temperature:'',poids:'',spo2:''})

 useEffect(() => {
 if (!loading && (!isAuthenticated || !['infirmier','admin'].includes(user?.role || ''))) {
 router.push('/login')
 }
 }, [isAuthenticated, user, loading, router])

 useEffect(() => {
 if (!isAuthenticated) return
 api.get('/infirmier/dossiers-en-attente').then(r => setDossiers(r.data || [])).catch(() => {})
 api.get('/infirmier/queue').then(r => setQueue(r.data?.patients || [])).catch(() => {})
      api.get('/rdv/a-venir').then(r => setRdvAvenir(r.data?.rdvs || [])).catch(() => {})
 api.get('/infirmier/alertes-prescriptions').then(r => setAlertesPrescriptions(r.data?.alertes || [])).catch(() => {})
 // Rafraîchir la queue toutes les 30 secondes
 const interval = setInterval(() => {
 api.get('/infirmier/queue').then(r => setQueue(r.data?.patients || [])).catch(() => {})
 api.get('/infirmier/alertes-prescriptions').then(r => setAlertesPrescriptions(r.data?.alertes || [])).catch(() => {})
 }, 30000)
 return () => clearInterval(interval)
 }, [isAuthenticated])

 const detectAlertes = (vals: Record<string, string>) => {
 const msgs: string[] = []
 const sys = parseFloat(vals.tension_systolique || '0')
 if (sys && (sys > 180 || sys < 80)) msgs.push(` Tension critique: ${sys} mmHg`)
 const glyc = parseFloat(vals.glycemie || '0')
 if (glyc && glyc > 600) msgs.push(` Glycémie critique: ${glyc} mg/dL`)
 const spo2 = parseFloat(vals.saturation_o2 || '0')
 if (spo2 && spo2 < 90) msgs.push(` SpO2 critique: ${spo2}%`)
 const temp = parseFloat(vals.temperature || '0')
 if (temp && (temp > 40 || temp < 35)) msgs.push(` Température critique: ${temp}°C`)
 const fc = parseFloat(vals.frequence_cardiaque || '0')
 if (fc && (fc > 150 || fc < 40)) msgs.push(` FC critique: ${fc} bpm`)
 setAlertes(msgs)
 }

 const onSvChange = (k: string, v: string) => {
 const n = { ...sv, [k]: v }; setSv(n); detectAlertes(n)
 }

 const submitSv = async () => {
 if (!selected) return
 setSubmitting(true)
 try {
 const payload: any = { dossier_id: selected.id }
 Object.entries(sv).forEach(([k, v]) => { if (v) payload[k] = parseFloat(v as string) || v })
 const r = await api.post('/infirmier/signes-vitaux', payload)
 if (r.data.alerte) {
 toast.error(` Alertes critiques !\n${r.data.alertes.join('\n')}`, { duration: 8000 })
 } else {
 toast.success('Signes vitaux enregistrés — patient en file d\'attente ')
 }
 setDossiers(prev => prev.filter(d => d.id !== selected.id))
 setSelected(null); setSv({}); setAlertes([])
 } catch (e: any) {
 toast.error(e?.response?.data?.detail || 'Erreur')
 } finally { setSubmitting(false) }
 }

 if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid #0d9488', borderTopColor:'transparent', animation:'spin 1s linear infinite' }} /></div>

 const FIELDS = [
 { key:'tension_systolique', label:'Tension sys.', ph:'120', unit:'mmHg' },
 { key:'tension_diastolique', label:'Tension dia.', ph:'80', unit:'mmHg' },
 { key:'frequence_cardiaque', label:'FC', ph:'72', unit:'bpm' },
 { key:'temperature', label:'Température', ph:'37', unit:'°C' },
 { key:'saturation_o2', label:'SpO2', ph:'98', unit:'%' },
 { key:'frequence_respiratoire', label:'FR', ph:'16', unit:'/min' },
 { key:'poids', label:'Poids', ph:'70', unit:'kg' },
 { key:'taille', label:'Taille', ph:'170', unit:'cm' },
 { key:'glycemie', label:'Glycémie', ph:'90', unit:'mg/dL'},
 ]

 return (
 <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column' }}>
 {/* Navbar */}
 <div style={{ background:'linear-gradient(135deg,#0f1e3d,#0d9488)', height:58, display:'flex', alignItems:'center', padding:'0 24px', gap:16, flexShrink:0 }}>
 <div style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}></div>
 <div>
 <div style={{ color:'white', fontWeight:800, fontSize:14 }}>{user?.nom || 'Infirmier'}</div>
 <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11 }}>Infirmier(ère)</div>
 </div>
 <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
 <Link href="/infirmier/documents" style={{ background:'rgba(255,255,255,0.1)', color:'white', textDecoration:'none', borderRadius:8, padding:'7px 14px', fontSize:12, display:'flex', alignItems:'center', gap:6, fontWeight:600 }}>
 <Printer size={13} /> Imprimer docs
 </Link>
 <button onClick={() => { logout(); router.push('/') }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
 <LogOut size={13} /> Déconnexion
 </button>
 </div>
 </div>

 <div style={{ flex:1, padding:24, maxWidth:1000, margin:'0 auto', width:'100%', boxSizing:'border-box' as const }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
 <div>
 <h1 style={{ fontWeight:900, fontSize:'1.3rem', color:'#0f172a', margin:0 }}>Dashboard Infirmier</h1>
 <p style={{ color:'#64748b', fontSize:13, margin:'4px 0 0' }}>{dossiers.length} dossier{dossiers.length > 1 ? 's' : ''} en attente</p>
 </div>
 {/* Onglets */}
 <div style={{ display:'flex', background:'#f1f5f9', borderRadius:10, padding:3, gap:2 }}>
 {([
 {k:'queue' as const, label:`Queue (${queue.length})`, icon:''},
 {k:'avenir' as const, label:`RDV à venir (${rdvAvenir.length})`, icon:''},
 {k:'attente' as const, label:'Dossiers', icon:''},
 {k:'alertes' as const, label:`Alertes (${alertesPrescriptions.length})`, icon:''},
 {k:'recherche' as const, label:'Recherche', icon:''},
 {k:'paiement' as const, label:'Vérif. paiement', icon:''},
 ] as const).map(t => (
 <button key={t.k} onClick={() => setOnglet(t.k)} style={{
 padding:'8px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
 background: onglet === t.k ? 'white' : 'transparent',
 color: onglet === t.k ? '#0f172a' : '#64748b',
 boxShadow: onglet === t.k ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
 }}>{t.icon} {t.label}</button>
 ))}
 </div>
 </div>

 {/* ONGLET QUEUE CAISSE (temps réel) */}
 {onglet === 'queue' && (
 <div>
 <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
 <div style={{fontSize:13,color:'#64748b'}}>{queue.length} patient(s) en attente · Actualisation auto 30s</div>
 <button onClick={()=>api.get('/infirmier/queue').then(r=>setQueue(r.data?.patients||[]))}
 style={{background:'#0d9488',color:'white',border:'none',borderRadius:8,padding:'7px 14px',fontWeight:700,cursor:'pointer',fontSize:13}}>
 Actualiser
 </button>
 </div>
 {queue.length === 0 ? (
 <div style={{background:'white',borderRadius:16,padding:40,textAlign:'center',border:'1px solid #e2e8f0'}}>
 <div style={{fontSize:40,marginBottom:12}}></div>
 <div style={{fontWeight:700,color:'#16a34a',fontSize:15}}>Aucun patient en attente</div>
 <div style={{color:'#64748b',fontSize:13,marginTop:4}}>La caisse n'a pas encore enregistré de patients aujourd'hui</div>
 </div>
 ) : (
 <div style={{display:'flex',flexDirection:'column',gap:12}}>
 {queue.map((p:any)=>(
 <div key={p.rdv_id} style={{background:'white',borderRadius:14,padding:16,border:`2px solid ${p.priorite==='urgent'?'#ef4444':'#e2e8f0'}`,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap' as const}}>
 <div style={{display:'flex',alignItems:'center',gap:14}}>
 {/* Ticket */}
 <div style={{background:p.priorite==='urgent'?'#fef2f2':'#f0fdfa',borderRadius:10,padding:'8px 12px',textAlign:'center' as const,minWidth:64}}>
 <div style={{fontFamily:'monospace',fontWeight:900,fontSize:16,color:p.priorite==='urgent'?'#dc2626':'#0d9488'}}>#{p.ticket}</div>
 <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{p.priorite==='urgent'?' URGENT':'Normal'}</div>
 </div>
 <div>
 <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
 <span style={{fontWeight:700,fontSize:15}}>{p.patient_nom}</span>
 {/* Badge statut paiement */}
 <span style={{
 background: `${p.couleur || '#dc2626'}18`,
 color: p.couleur || '#dc2626',
 border: `1px solid ${p.couleur || '#dc2626'}40`,
 borderRadius:20,padding:'2px 9px',fontSize:11,fontWeight:700,
 whiteSpace:'nowrap' as const
 }}>
 {p.libelle || ' Non payé'}
 </span>
 </div>
 <div style={{color:'#0d9488',fontSize:13,fontWeight:600}}>{p.service}</div>
 {p.medecin_nom && <div style={{color:'#1641C8',fontSize:12,fontWeight:600}}>‍ Dr {p.medecin_nom.replace('Dr ','')}</div>}
 <div style={{color:'#94a3b8',fontSize:12}}>{p.patient_telephone} · {new Date(p.heure).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>
 </div>
 </div>
 <button onClick={()=>setSelectedRdv(p)} style={{background:'linear-gradient(135deg,#0d9488,#0f766e)',color:'white',border:'none',borderRadius:10,padding:'9px 18px',fontWeight:700,cursor:'pointer',fontSize:13,flexShrink:0}}>
 Signes vitaux
 </button>
 </div>
 ))}
 </div>
 )}

 {/* Modal signes vitaux via queue */}
 {selectedRdv && (
 <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
 <div style={{background:'white',borderRadius:16,padding:24,width:'100%',maxWidth:500}}>
 <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
 <div>
 <div style={{fontWeight:800,fontSize:15}}>Signes vitaux — {selectedRdv.patient_nom}</div>
 <div style={{color:'#0d9488',fontSize:13}}>#{selectedRdv.ticket} · {selectedRdv.service}</div>
 </div>
 <button onClick={()=>setSelectedRdv(null)} style={{background:'#f1f5f9',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer'}}></button>
 </div>
 <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
 {[
 {k:'tension',l:'Tension (mmHg)',ph:'120/80'},
 {k:'pouls',l:'Pouls (bpm)',ph:'72'},
 {k:'temperature',l:'Température (°C)',ph:'37.0'},
 {k:'poids',l:'Poids (kg)',ph:'70'},
 {k:'spo2',l:'SpO2 (%)',ph:'98'},
 ].map(f=>(
 <div key={f.k} style={f.k==='tension'?{gridColumn:'1/-1'}:{}}>
 <label style={{display:'block',fontWeight:600,fontSize:12,color:'#374151',marginBottom:4}}>{f.l}</label>
 <input placeholder={f.ph} value={(svRdv as any)[f.k]}
 onChange={e=>setSvRdv(p=>({...p,[f.k]:e.target.value}))}
 style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}}/>
 </div>
 ))}
 </div>
 {/* Afficher le médecin destinataire */}
 {selectedRdv.medecin_nom && (
 <div style={{background:'#eff6ff',borderRadius:8,padding:'8px 12px',marginBottom:10,fontSize:13,color:'#1641C8',fontWeight:600}}>
 ‍ Sera envoyé à : {selectedRdv.medecin_nom}
 </div>
 )}
 <button onClick={async()=>{
 try {
 const payload = {
 ...svRdv,
 medecin_nom: selectedRdv.medecin_nom || '',
 medecin_email: selectedRdv.medecin_email || '',
 }
 await api.put(`/infirmier/signes-vitaux/${selectedRdv.rdv_id}`, payload)
 const dest = selectedRdv.medecin_nom ? ` → Dr ${selectedRdv.medecin_nom.replace('Dr ','')}` : ' au médecin'
 toast.success(` ${selectedRdv.patient_nom} envoyé${dest}`)
 setQueue(q=>q.filter((x:any)=>x.rdv_id!==selectedRdv.rdv_id))
 setSelectedRdv(null); setSvRdv({tension:'',pouls:'',temperature:'',poids:'',spo2:''})
 } catch(e:any){toast.error(e?.response?.data?.detail||'Erreur')}
 }} style={{width:'100%',background:'linear-gradient(135deg,#0d9488,#0f766e)',color:'white',border:'none',borderRadius:12,padding:'12px',fontWeight:700,cursor:'pointer',fontSize:14}}>
 Enregistrer &amp; Envoyer au médecin
 </button>
 </div>
 </div>
 )}
 </div>
 )}

 {/* ONGLET ALERTES PRESCRIPTIONS */}
 {onglet === 'alertes' && (
 <div>
 <div style={{marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
 <div style={{fontSize:13,color:'#64748b'}}>{alertesPrescriptions.length} prescription(s) à suivre (dernières 4h)</div>
 <button onClick={()=>api.get('/infirmier/alertes-prescriptions').then(r=>setAlertesPrescriptions(r.data?.alertes||[]))}
 style={{background:'#d97706',color:'white',border:'none',borderRadius:8,padding:'7px 14px',fontWeight:700,cursor:'pointer',fontSize:13}}>
 Actualiser
 </button>
 </div>
 {alertesPrescriptions.length===0 ? (
 <div style={{background:'white',borderRadius:16,padding:40,textAlign:'center',border:'1px solid #e2e8f0'}}>
 <div style={{fontSize:40,marginBottom:12}}></div>
 <div style={{fontWeight:700,color:'#16a34a'}}>Aucune alerte en cours</div>
 </div>
 ) : alertesPrescriptions.map((a:any,i:number)=>(
 <div key={i} style={{background:'white',borderRadius:14,padding:16,border:`1px solid ${a.type==='labo'?'#3b82f6':'#a855f7'}`,marginBottom:12}}>
 <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
 <span style={{background:a.type==='labo'?'#eff6ff':'#faf5ff',color:a.type==='labo'?'#1d4ed8':'#7e22ce',padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:700}}>
 {a.type==='labo'?' Laboratoire':' Pharmacie'}
 </span>
 <span style={{color:'#94a3b8',fontSize:12}}>{new Date(a.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span>
 </div>
 <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>Dr {a.medecin_nom}</div>
 <div style={{color:'#374151',fontSize:13}}>{a.medicaments}</div>
 {a.examens_requis && <div style={{color:'#1d4ed8',fontSize:12,marginTop:4}}>Examens: {a.examens_requis}</div>}
 </div>
 ))}
 </div>
 )}

 {/* ONGLET RECHERCHE PAR ID */}
 {onglet === 'recherche' && (
 <SearchByIdPanel />
 )}

 {/* ONGLET VÉRIFICATION PAIEMENT */}
 {onglet === 'paiement' && (
 <div style={{maxWidth:600}}>
 <p style={{color:'#64748b',fontSize:13,marginBottom:16}}>
 Entrez le ticket, le numéro #RB-XXXX, le téléphone ou le nom du patient pour vérifier si son paiement a été reçu à la caisse aujourd'hui.
 </p>
 <VerificationPaiement />
 </div>
 )}

 {/* ONGLET FILE D'ATTENTE + SIGNES VITAUX */}
 {onglet==='avenir' && (
 <div>
  <h2 style={{fontWeight:900,fontSize:'1.2rem',color:'#0f172a',marginBottom:8}}>Rendez-vous à venir</h2>
  <div style={{fontSize:12,color:'#64748b',marginBottom:16,background:'#f0f9ff',border:'1px solid #bae6fd',borderRadius:8,padding:'8px 12px'}}>
   <i className="fa-solid fa-info-circle" style={{marginRight:6,color:'#0369a1'}}/>
   Ces RDV sont confirmés. La caisse signale la présence du patient le jour J pour les envoyer dans la queue signes vitaux.
   <br/><span style={{color:'#16a34a',fontWeight:700}}>Vert = déjà payé à distance</span> · <span style={{color:'#d97706',fontWeight:700}}>Orange = paiement requis en caisse</span>
  </div>
  {rdvAvenir.length===0
   ? <div style={{textAlign:'center',padding:40,color:'#94a3b8',background:'white',borderRadius:12,border:'1px solid #e2e8f0'}}>
      <i className="fa-solid fa-calendar" style={{fontSize:36,display:'block',marginBottom:10,opacity:0.3}}/>
      Aucun rendez-vous à venir
     </div>
   : rdvAvenir.map((r:any) => {
    const statut = r.statut?.split('.')?.pop() || r.statut
    const isPaye = statut === 'paiement_effectue'
    return (
     <div key={r.id} style={{background:'white',borderRadius:12,padding:14,border:`1px solid ${isPaye?'#86efac':'#fde68a'}`,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div>
       <div style={{fontWeight:700,fontSize:14}}>{r.patient_nom}</div>
       <div style={{fontSize:12,color:'#94a3b8',marginTop:2}}>{r.patient_numero} · {r.service}</div>
       {r.medecin_nom && <div style={{fontSize:12,color:'#7c3aed',marginTop:1}}>{r.medecin_nom}</div>}
       <div style={{marginTop:6}}>
        <span style={{
         background:isPaye?'#f0fdf4':'#fff7ed',
         color:isPaye?'#16a34a':'#d97706',
         padding:'2px 10px',borderRadius:99,fontSize:11,fontWeight:700
        }}>
         {isPaye?'Payé à distance':'Paiement requis à la caisse'}
        </span>
       </div>
      </div>
      <div style={{textAlign:'right'}}>
       <div style={{fontWeight:800,color:'#1641C8',fontSize:13}}>
        {new Date(r.date_rdv).toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'long',hour:'2-digit',minute:'2-digit'})}
       </div>
       <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>
        La caisse signale la présence
       </div>
      </div>
     </div>
    )
   })
  }
 </div>
)}

{onglet === 'attente' && (
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
 {/* Liste dossiers en attente */}
 <div style={{ background:'white', borderRadius:18, padding:20, border:'1px solid #e2e8f0' }}>
 <h3 style={{ fontWeight:700, color:'#0f172a', marginBottom:16, fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
 <Clock size={14} color="#0d9488" /> Patients en attente de signes vitaux
 </h3>
 {dossiers.length === 0 ? (
 <div style={{ textAlign:'center', padding:32, color:'#94a3b8' }}>
 <CheckCircle size={32} style={{ marginBottom:8 }} />
 <p style={{ margin:0, fontSize:13 }}>Aucun patient en attente</p>
 </div>
 ) : dossiers.map(d => (
 <div key={d.id} onClick={() => setSelected(d)} style={{
 padding:'12px 14px', borderRadius:12,
 border:`2px solid ${selected?.id === d.id ? '#0d9488' : '#e2e8f0'}`,
 marginBottom:8, cursor:'pointer',
 background: selected?.id === d.id ? '#f0fdfa' : 'white',
 display:'flex', alignItems:'center', gap:12, transition:'all 0.15s'
 }}>
 <div style={{ width:40, height:40, borderRadius:10, background:'#f0fdfa', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
 <Activity size={18} color="#0d9488" />
 </div>
 <div style={{ flex:1, minWidth:0 }}>
 <div style={{ fontWeight:700, color:'#0f172a', fontFamily:'monospace', fontSize:14 }}>{d.patient_numero}</div>
 <div style={{ color:'#64748b', fontSize:12, marginTop:1 }}>{d.specialite || d.type_visite}</div>
 </div>
 <span style={{ background:'#fef3c7', color:'#d97706', borderRadius:50, padding:'3px 10px', fontSize:11, fontWeight:600, flexShrink:0 }}>En attente</span>
 </div>
 ))}
 <div style={{ marginTop:10, background:'#fffbeb', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#92400e' }}>
 Accès via ID patient uniquement — jamais par nom
 </div>
 </div>

 {/* Formulaire signes vitaux */}
 <div style={{ background:'white', borderRadius:18, padding:20, border:`2px solid ${selected ? '#0d9488' : '#e2e8f0'}` }}>
 <h3 style={{ fontWeight:700, color:'#0f172a', marginBottom:14, fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
 <Activity size={14} color="#0d9488" /> Saisie des signes vitaux
 </h3>
 {!selected ? (
 <div style={{ textAlign:'center', padding:32, color:'#94a3b8' }}>
 <Activity size={32} style={{ marginBottom:10 }} />
 <p style={{ margin:0, fontSize:13 }}>Sélectionnez un patient dans la liste</p>
 </div>
 ) : (
 <>
 {/* Patient ID badge */}
 <div style={{ background:'#f0fdfa', borderRadius:10, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
 <span style={{ fontWeight:800, color:'#0d9488', fontFamily:'monospace', fontSize:15 }}>{selected.patient_numero}</span>
 <span style={{ color:'#64748b', fontSize:13 }}>{selected.specialite}</span>
 </div>

 {/* Alertes */}
 {alertes.length > 0 && (
 <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:10, padding:12, marginBottom:14 }}>
 <div style={{ display:'flex', alignItems:'center', gap:6, fontWeight:700, color:'#dc2626', marginBottom:6, fontSize:13 }}>
 <AlertTriangle size={13} /> Valeurs critiques détectées
 </div>
 {alertes.map((a, i) => <div key={i} style={{ fontSize:12, color:'#dc2626' }}>{a}</div>)}
 </div>
 )}

 {/* Grille mesures */}
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
 {FIELDS.map(f => (
 <div key={f.key}>
 <label style={{ display:'block', fontWeight:600, fontSize:11, color:'#374151', marginBottom:3 }}>
 {f.label} <span style={{ color:'#94a3b8' }}>({f.unit})</span>
 </label>
 <input type="number" step="0.1" placeholder={f.ph}
 value={sv[f.key] || ''}
 onChange={e => onSvChange(f.key, e.target.value)}
 style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:`1px solid ${alertes.some(a => a.includes(f.label)) ? '#ef4444' : '#d1d5db'}`, fontSize:13, boxSizing:'border-box' as const }} />
 </div>
 ))}
 </div>
 <div style={{ marginBottom:12 }}>
 <label style={{ display:'block', fontWeight:600, fontSize:11, color:'#374151', marginBottom:3 }}>Notes</label>
 <textarea rows={2} value={sv.notes || ''} onChange={e => setSv(p => ({...p, notes:e.target.value}))}
 placeholder="Observations..." style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, resize:'vertical' as const, boxSizing:'border-box' as const }} />
 </div>
 <button onClick={submitSv} disabled={submitting} style={{
 width:'100%', color:'white', border:'none', borderRadius:12, padding:12, fontWeight:700, cursor:'pointer', fontSize:14,
 background: alertes.length > 0 ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'linear-gradient(135deg,#0d9488,#0f766e)'
 }}>
 {submitting ? 'Enregistrement...' : alertes.length > 0 ? ' Enregistrer (URGENT)' : ' Enregistrer + File d\'attente'}
 </button>
 </>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 )
}

// Composant recherche par ID patient 
function SearchByIdPanel() {
 const [patientId, setPatientId] = useState('')
 const [result, setResult] = useState<any>(null)
 const [error, setError] = useState('')
 const [loading, setLoading] = useState(false)
 const [modal, setModal] = useState<string | null>(null)
 const [printData, setPrintData] = useState<any>(null)

 const chercher = async () => {
 const id = patientId.trim().toUpperCase()
 if (!id) return
 setLoading(true); setError(''); setResult(null)
 try {
 const r = await api.get(`/infirmier/documents-disponibles/${id}`)
 setResult(r.data)
 } catch (e: any) {
 setError(e?.response?.data?.detail || 'Patient introuvable')
 } finally { setLoading(false) }
 }

 const ouvrirImpression = async (type: string) => {
 if (!result) return
 if (type === 'resultats_labo') {
 try {
 const r = await api.get(`/infirmier/imprimer-resultats-labo/${result.patient_numero}`)
 setPrintData(r.data); setModal(type)
 } catch { toast.error('Erreur chargement résultats') }
 } else {
 setPrintData({ patient_numero: result.patient_numero, patient_nom: result.patient_nom })
 setModal(type)
 }
 }

 const COLORS: Record<string,string> = {
 certificat:'#374151', exeat:'#0369a1', ecg:'#dc2626',
 sortie_contre_avis:'#b91c1c', resultats_labo:'#16a34a'
 }

 return (
 <div style={{ maxWidth:680 }}>
 <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:12, padding:'10px 16px', marginBottom:20, fontSize:13, color:'#92400e' }}>
 Impression uniquement — Recherchez par ID patient. Vous n'avez pas accès au dossier médical.
 </div>

 <div style={{ background:'white', borderRadius:18, padding:24, border:'1px solid #e2e8f0', marginBottom:16 }}>
 <h3 style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:14 }}> Rechercher un patient par ID</h3>
 <div style={{ display:'flex', gap:10 }}>
 <input value={patientId} onChange={e => setPatientId(e.target.value.toUpperCase())}
 onKeyDown={e => e.key === 'Enter' && chercher()}
 placeholder="Ex: #RB-0042"
 style={{ flex:1, padding:'12px 16px', borderRadius:10, border:`2px solid ${error ? '#ef4444' : '#e2e8f0'}`, fontSize:15, fontFamily:'monospace', fontWeight:700, outline:'none' }} />
 <button onClick={chercher} disabled={loading} style={{ background:'linear-gradient(135deg,#0d9488,#0f766e)', color:'white', border:'none', borderRadius:10, padding:'12px 22px', fontWeight:700, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
 <Search size={16} /> {loading ? 'Recherche...' : 'Chercher'}
 </button>
 </div>
 {error && <div style={{ marginTop:10, color:'#dc2626', fontSize:13, display:'flex', alignItems:'center', gap:6 }}> {error}</div>}
 </div>

 {result && (
 <div style={{ background:'white', borderRadius:18, padding:24, border:'1px solid #e2e8f0' }}>
 <div style={{ background:'#f0fdfa', borderRadius:12, padding:'12px 16px', marginBottom:18, border:'1px solid #99f6e4' }}>
 <div style={{ fontWeight:800, color:'#0f172a', fontSize:15 }}>{result.patient_nom}</div>
 <div style={{ fontFamily:'monospace', color:'#0d9488', fontWeight:700 }}>{result.patient_numero}</div>
 </div>
 {result.documents?.filter((d: any) => d.disponible).map((doc: any) => (
 <div key={doc.type} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:12, border:'1px solid #e2e8f0', marginBottom:8, background:'#fafafa' }}>
 <span style={{ fontSize:24 }}>{doc.icone}</span>
 <div style={{ flex:1 }}>
 <div style={{ fontWeight:700, color:'#0f172a', fontSize:14 }}>{doc.label}</div>
 {doc.derniere_date && <div style={{ color:'#64748b', fontSize:12 }}>Disponible depuis le {new Date(doc.derniere_date).toLocaleDateString('fr-FR')}</div>}
 </div>
 <button onClick={() => ouvrirImpression(doc.type)} style={{ background:COLORS[doc.type] || '#64748b', color:'white', border:'none', borderRadius:10, padding:'8px 16px', fontWeight:700, cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
 <Printer size={13} /> Imprimer
 </button>
 </div>
 ))}
 {result.documents?.filter((d: any) => d.disponible).length === 0 && (
 <p style={{ color:'#94a3b8', textAlign:'center', padding:20 }}>Aucun document disponible pour ce patient.</p>
 )}
 </div>
 )}

 {/* Modal impression simple */}
 {modal && printData && (
 <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
 <div style={{ background:'white', borderRadius:18, padding:28, maxWidth:500, width:'90%', textAlign:'center' }}>
 <p style={{ fontWeight:700, marginBottom:16 }}>Document prêt : {modal} — {printData.patient_nom} ({printData.patient_numero})</p>
 <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
 <button onClick={() => window.print()} style={{ background:COLORS[modal]||'#374151', color:'white', border:'none', borderRadius:10, padding:'10px 22px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
 <Printer size={14} /> Imprimer
 </button>
 <button onClick={() => { setModal(null); setPrintData(null) }} style={{ background:'#f1f5f9', border:'none', borderRadius:10, padding:'10px 18px', fontWeight:600, cursor:'pointer', color:'#374151' }}>
 Fermer
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 )
}
