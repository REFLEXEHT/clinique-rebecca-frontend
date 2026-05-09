'use client'
import React, { useRef } from 'react'
import ChangePasswordModal from '@/components/ui/ChangePasswordModal'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { LogOut, Search, AlertTriangle, CheckCircle, Clock, Edit, FlaskConical, Printer } from 'lucide-react'
import SignaturePad from '@/components/ui/SignaturePad'
import { imprimerResultatLabo } from '@/lib/print'

// 188 examens complets 
const TOUS_EXAMENS = [
 // Hématologie
 "Hémogramme complet (NFS)","Numération globulaire","Formule sanguine","Hématocrite",
 "Hémoglobine","Réticulocytes","Plaquettes","TS (Temps de saignement)","TC (Temps de coagulation)",
 "PT/INR","aPTT","D-Dimères","Fibrinogène","Groupe sanguin ABO","Rhésus (facteur Rh)",
 "RAI (Recherche Agglutinines Irrégulières)","Coombs direct","Coombs indirect",
 "Hémoglobine S (Sickling)","Électrophorèse de l\'hémoglobine",
 // Biochimie — Glycémie & Diabète
 "Glycémie à jeun","Glycémie post-prandiale","HBA1C (Hémoglobine glyquée)",
 "Insuline à jeun","Peptide C","Test de tolérance au glucose (HGPO)",
 // Biochimie — Fonction rénale
 "Urée sanguine","Créatinine sérique","Clairance créatinine","Acide urique",
 "Microalbuminurie","Protéinurie des 24h","Albumine urinaire","Créatinine urinaire",
 // Biochimie — Fonction hépatique
 "SGOT (AST)","SGPT (ALT)","Gamma GT (GGT)","Phosphatases alcalines (PAL)",
 "Bilirubine totale","Bilirubine directe","Bilirubine indirecte","Albumine sérique",
 "Protéines totales","LDH",
 // Lipides & Cardio
 "Cholestérol total","HDL cholestérol","LDL cholestérol","VLDL","Triglycérides",
 "Troponine I","Troponine T ultra-sensible","CK-MB","BNP","NT-proBNP","Myoglobine",
 // Thyroïde
 "TSH","T3 libre","T4 libre","T3 totale","T4 totale",
 "Thyroglobuline","Anti-TPO","Anti-TG",
 // Ions & Minéraux
 "Sodium (Na)","Potassium (K)","Chlorures (Cl)","Bicarbonates","Calcium",
 "Phosphore","Magnésium","Zinc","Cuivre","Fer sérique","Ferritine",
 "Transferrine","Coefficient de saturation en fer",
 // Vitamines
 "Vitamine D (25-OH)","Vitamine B12","Acide folique (B9)","Vitamine B1","Rétinol (Vit A)",
 // Hormones
 "Cortisol (8h)","DHEA-S","Testostérone totale","Testostérone libre",
 "Progestérone","Estradiol (E2)","FSH","LH","Prolactine",
 "β-HCG quantitatif","PSA total","PSA libre","AFP","CA-125","CEA","CA-19-9",
 // Sérologie infectieuse
 "HIV 1 et 2","Hépatite B (AgHBs)","Anticorps HBs","Anti-HBc",
 "Hépatite C (Ac anti-VHC)","Charge virale VIH","CD4","CD8","Ratio CD4/CD8",
 "VDRL","RPR","TPHA","FTA-ABS",
 "Widal O","Widal H","Widal AO","Widal BH",
 "Monotest","H. Pylori (antigène sanguin)","Malaria (Goutte épaisse)",
 "Dengue (NS1 + Ac)","Toxoplasmose IgG","Toxoplasmose IgM",
 "Rubéole IgG","Rubéole IgM","CMV IgG","CMV IgM",
 "Herpès I IgG","Herpès I IgM","Herpès II IgG","Herpès II IgM",
 "TORCH complet (5 agents)","Chikungunya","Leishmaniose",
 // Immunologie
 "CRP","CRP ultra-sensible","Interleukine 6 (IL-6)",
 "Procalcitonine (PCT)","RA-Latex (Facteur rhumatoïde)","ASO",
 "Anticorps anti-nucléaires (ANA)","Anti-ADN natif","Complément C3","Complément C4",
 "Électrophorèse des protéines","IgG","IgA","IgM",
 // Hormones rénales & autres
 "Rénine","Aldostérone","Érythropoïétine (EPO)","Parathormone (PTH)",
 // Urine
 "ECBU (Examen cytobactériologique)","Bandelette urinaire","Sédiment urinaire",
 "Protéinurie","Leucocytes urinaires","Nitrites urinaires",
 "Glucose urinaire","Corps cétoniques","Bilirubine urinaire",
 // Selles & Parasitologie
 "Parasitologie des selles","Coproculture",
 "Recherche amibes","Oxyures","Ascaris","Ankylostomes","Tænia",
 "Antigène H. Pylori (selles)","Sang occulte dans les selles",
 // Microbiologie
 "Frottis vaginal","Frottis urétral","Crachats BAAR (Tuberculose)",
 "Crachats bactériologie","Hémoculture","Culture pus","Culture plaie",
 "Antibiogramme","Antifongique — test sensibilité",
 "Prélèvement gorge","Prélèvement nasal",
 // Médicaments & Toxicologie
 "Digoxine","Phénobarbital","Acide valproïque",
 "Lithium","Cyclosporine","Tacrolimus","Vancomycine",
 "Dépistage drogues urinaires","Alcoolémie",
 // Gaz du sang & Spéciaux
 "Gaz du sang artériel","Amylase","Lipase","Cholinestérase",
 "Test de falciformation (Emmel)","Coombs néonatal",
]

// Valeurs critiques → alerte automatique
const SEUILS_CRITIQUES: {exam: string, check: (v: number) => boolean, msg: string}[] = [
 {exam:'glycem', check: v => v > 600 || v < 40, msg:'Glycémie critique'},
 {exam:'potassium', check: v => v > 6.5 || v < 2.5, msg:'Kaliémie critique'},
 {exam:'sodium', check: v => v > 160 || v < 120, msg:'Natrémie critique'},
 {exam:'hemoglobin', check: v => v < 5, msg:'Anémie sévère'},
 {exam:'plaquett', check: v => v < 20000, msg:'Thrombopénie sévère'},
 {exam:'creatinin', check: v => v > 884, msg:'Insuffisance rénale sévère'},
 {exam:'troponin', check: v => v > 0.04, msg:'Troponine élevée — urgence cardiaque'},
 {exam:'ph', check: v => v < 7.2 || v > 7.6, msg:'pH artériel critique'},
 {exam:'pao2', check: v => v < 60, msg:'Hypoxémie sévère'},
 {exam:'bilirub', check: v => v > 200, msg:'Hyperbilirubinémie sévère'},
]

function detecterValeurCritique(examen: string, resultats: string) {
 const examLower = examen.toLowerCase()
 const nums = resultats.match(/\d+\.?\d*/g)?.map(Number) || []
 for (const seuil of SEUILS_CRITIQUES) {
 if (examLower.includes(seuil.exam)) {
 for (const val of nums) {
 if (seuil.check(val)) return seuil.msg
 }
 }
 }
 return null
}


// Searchable exam selector 
function ExamenSearchable({ value, onChange, examens }: { value: string; onChange: (v: string) => void; examens: string[] }) {
 const [search, setSearch] = useState('')
 const [open, setOpen] = useState(false)
 const ref = React.useRef<HTMLDivElement>(null)

 const filtered = search.length > 1
 ? examens.filter(e => e.toLowerCase().includes(search.toLowerCase())).slice(0, 20)
 : examens.slice(0, 30)

 useEffect(() => {
 const handler = (e: MouseEvent) => {
 if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
 }
 document.addEventListener('mousedown', handler)
 return () => document.removeEventListener('mousedown', handler)
 }, [])

 return (
 <div ref={ref} style={{ position: 'relative' }}>
 <input
 value={value || search}
 onChange={e => { setSearch(e.target.value); onChange(''); setOpen(true) }}
 onFocus={() => setOpen(true)}
 placeholder="Taper pour rechercher (ex: Glycémie, HIV, TSH...)"
 style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' as const }}
 />
 {open && filtered.length > 0 && !value && (
 <div style={{
 position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
 background: 'white', borderRadius: 10, border: '1px solid #e2e8f0',
 boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 260, overflowY: 'auto'
 }}>
 {filtered.map(ex => (
 <button key={ex} type="button" onClick={() => { onChange(ex); setSearch(''); setOpen(false) }}
 style={{ width: '100%', padding: '9px 14px', border: 'none', background: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#374151', borderBottom: '1px solid #f8fafc' }}
 onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
 onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
 {ex}
 </button>
 ))}
 {search.length > 1 && (
 <button type="button" onClick={() => { onChange(search); setOpen(false) }}
 style={{ width: '100%', padding: '9px 14px', border: 'none', background: '#f8fafc', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#1641C8', fontWeight: 600 }}>
 Utiliser "{search}" (examen personnalisé)
 </button>
 )}
 </div>
 )}
 </div>
 )
}

export default function LaboPage() {
 const { user, isAuthenticated, loading, logout , mustChangePassword, setMustChangePassword } = useAuth()
 const router = useRouter()
 const [onglet, setOnglet] = useState<'saisie'|'historique'|'alertes'|'stats'|'queue'>('stats')
 const [searchPat, setSearchPat] = useState('')
 const [patient, setPatient] = useState<any>(null)
 const [resultats, setResultats] = useState<any[]>([])
 const [maSignature, setMaSignature] = useState<string | null>(null)
 const [showSigPad, setShowSigPad] = useState(false)
 const [alertes,   setAlertes]   = useState<any[]>([])
  const [statsJour, setStatsJour] = useState<any>({examens_jour:0, examens_critique:0, patients_jour:0})
  const [statsSem,  setStatsSem]  = useState<any>({examens_semaine:0, patients_semaine:0, taux_critique:0})
  const [queueLabo, setQueueLabo] = useState<any[]>([])
 const [submitting,setSubmitting]= useState(false)
 const [editId, setEditId] = useState<number|null>(null)
 const [searchEx, setSearchEx] = useState('')
 const [form, setForm] = useState({
 type_examen: '', resultats: '', notes: '',
 date_examen: new Date().toISOString().split('T')[0],
 medecin_prescripteur: ''
 })

 useEffect(() => {
 if (!loading && (!isAuthenticated || !['labo','admin'].includes(user?.role||'')))
 router.push('/login')
 }, [isAuthenticated, user, loading, router])

 useEffect(() => {
 if (!isAuthenticated) return
 // Charger la signature du technicien
 api.get('/medecin/ma-signature').then(r => {
 if (r.data?.signature) setMaSignature(r.data.signature)
 }).catch(() => {})
 api.get('/labo/resultats-recents?limit=50')
 .then(r => {
 const all = r.data || []
 setResultats(all)
 setAlertes(all.filter((x: any) => x.valeur_critique))
 }).catch(()=>{})
 }, [isAuthenticated])

 const chercherPatient = async () => {
 const id = searchPat.trim().toUpperCase()
 if (!id) return
 try {
 const r = await api.get(`/patients/par-numero/${id}`)
 setPatient(r.data)
 const res = await api.get(`/labo/resultats/${r.data.id}`)
 setResultats(res.data || [])
 } catch { toast.error('Patient introuvable — vérifiez l\'ID') }
 }

 const soumettre = async () => {
 if (!patient || !form.type_examen || !form.resultats) {
 toast.error('Patient, examen et résultats requis'); return
 }
 setSubmitting(true)
 try {
 const alerteCritique = detecterValeurCritique(form.type_examen, form.resultats)

 const payload = {
 patient_id: String(patient.id),
 patient_nom: patient.nom,
 type_examen: form.type_examen,
 resultats: form.resultats,
 notes: form.notes,
 date_examen: form.date_examen,
 medecin_prescripteur: form.medecin_prescripteur,
 status: 'disponible',
 valeur_critique: !!alerteCritique,
 }

 let res
 if (editId) {
 res = await api.put(`/labo/resultats/${editId}`, payload)
 toast.success('Résultat modifié ')
 } else {
 res = await api.post('/labo/resultats', payload)
 toast.success('Résultat enregistré — patient notifié ')
 }

 if (alerteCritique) {
 toast.error(` ${alerteCritique} — Médecin prescripteur alerté automatiquement`, {duration: 10000})
 if (res?.data?.id) {
 await api.post(`/labo/alerte-critique/${res.data.id}`, {
 examen: form.type_examen,
 valeur: form.resultats,
 medecin_email: form.medecin_prescripteur,
 }).catch(()=>{})
 }
 setAlertes(prev => [...prev, {
 examen: form.type_examen, valeur: form.resultats,
 patient: patient.nom, message: alerteCritique
 }])
 }

 setForm({type_examen:'', resultats:'', notes:'', date_examen: new Date().toISOString().split('T')[0], medecin_prescripteur:''})
 setEditId(null)
 const updated = await api.get(`/labo/resultats/${patient.id}`)
 setResultats(updated.data || [])
 } catch (e: any) {
 toast.error(e?.response?.data?.detail || 'Erreur lors de l\'enregistrement')
 } finally { setSubmitting(false) }
 }

 const examsFiltres = TOUS_EXAMENS.filter(e =>
 !searchEx || e.toLowerCase().includes(searchEx.toLowerCase())
 )

 const canEdit = (r: any) => {
 const created = new Date(r.created_at || r.date_examen).getTime()
 return Date.now() - created < 24 * 3600 * 1000
 }

 if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #16a34a',borderTopColor:'transparent',animation:'spin 1s linear infinite'}}/></div>

 return (
 <div style={{minHeight:'100vh',background:'#f8fafc'}}>
 {/* Navbar */}
 <div style={{background:'linear-gradient(135deg,#0f1e3d,#16a34a)',height:58,display:'flex',alignItems:'center',padding:'0 24px',gap:14}}>
 <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}></div>
 <div>
 <div style={{color:'white',fontWeight:800,fontSize:14}}>{user?.nom}</div>
 <div style={{color:'rgba(255,255,255,0.6)',fontSize:11}}>Technicien de Laboratoire</div>
 </div>
 {alertes.length > 0 && (
 <div style={{background:'#dc2626',color:'white',borderRadius:50,padding:'4px 14px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:6,cursor:'pointer'}} onClick={()=>setOnglet('alertes')}>
 <AlertTriangle size={12}/> {alertes.length} alerte{alertes.length>1?'s':''}
 </div>
 )}
 <button onClick={()=>{logout();router.push('/')}} style={{marginLeft:'auto',background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
 <LogOut size={13}/> Déconnexion
 </button>
 </div>

 {/* Onglets */}
 <div style={{background:'white',borderBottom:'1px solid #e2e8f0',padding:'0 24px',display:'flex',gap:4}}>
 {[
 {k:'stats',     label:'Tableau de bord'},
     {k:'queue',     label:`File d'attente (${queueLabo.length})`},
     {k:'saisie',    label:'Saisir résultat'},
     {k:'historique',label:'Historique'},
     {k:'alertes',   label:`Alertes${alertes.length>0?` (${alertes.length})`:''}`},
     ].map(t => (
 <button key={t.k} onClick={()=>setOnglet(t.k as any)} style={{
 padding:'13px 16px',border:'none',background:'transparent',cursor:'pointer',
 fontWeight:600,fontSize:13,color:onglet===t.k?'#16a34a':'#64748b',
 borderBottom:onglet===t.k?'2px solid #16a34a':'2px solid transparent',
 }}>{t.label}</button>
 ))}
 </div>

 <div style={{maxWidth:1000,margin:'0 auto',padding:'24px 20px'}}>

 {/* SAISIE */}
       {/* STATS */}
      {onglet==='stats' && (
        <div>
          <h2 style={{fontWeight:900,fontSize:'1.2rem',color:'#0f172a',marginBottom:16}}>Tableau de bord — Laboratoire</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            <div style={{background:'#f0fdf4',borderRadius:14,padding:18,textAlign:'center',border:'1px solid #bbf7d0'}}>
              <div style={{fontWeight:900,fontSize:'1.8rem',color:'#16a34a'}}>{statsJour?.examens_jour||0}</div>
              <div style={{fontSize:12,color:'#64748b',marginTop:4}}>Examens aujourd&apos;hui</div>
            </div>
            <div style={{background:'#eff6ff',borderRadius:14,padding:18,textAlign:'center',border:'1px solid #bfdbfe'}}>
              <div style={{fontWeight:900,fontSize:'1.8rem',color:'#1641C8'}}>{statsJour?.patients_jour||0}</div>
              <div style={{fontSize:12,color:'#64748b',marginTop:4}}>Patients du jour</div>
            </div>
            <div style={{background:'#fef2f2',borderRadius:14,padding:18,textAlign:'center',border:'1px solid #fecaca'}}>
              <div style={{fontWeight:900,fontSize:'1.8rem',color:'#dc2626'}}>{statsJour?.examens_critique||0}</div>
              <div style={{fontSize:12,color:'#64748b',marginTop:4}}>Valeurs critiques</div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            <div style={{background:'#f0fdfa',borderRadius:14,padding:18,textAlign:'center',border:'1px solid #99f6e4'}}>
              <div style={{fontWeight:900,fontSize:'1.8rem',color:'#0d9488'}}>{statsSem?.examens_semaine||0}</div>
              <div style={{fontSize:12,color:'#64748b',marginTop:4}}>Examens cette semaine</div>
            </div>
            <div style={{background:'#f5f3ff',borderRadius:14,padding:18,textAlign:'center',border:'1px solid #ddd6fe'}}>
              <div style={{fontWeight:900,fontSize:'1.8rem',color:'#7c3aed'}}>{statsSem?.patients_semaine||0}</div>
              <div style={{fontSize:12,color:'#64748b',marginTop:4}}>Patients cette semaine</div>
            </div>
            <div style={{background:'#fefce8',borderRadius:14,padding:18,textAlign:'center',border:'1px solid #fef08a'}}>
              <div style={{fontWeight:900,fontSize:'1.8rem',color:'#d97706'}}>{statsSem?.taux_critique||0}%</div>
              <div style={{fontSize:12,color:'#64748b',marginTop:4}}>Taux critique</div>
            </div>
          </div>
          <div style={{background:'white',borderRadius:14,padding:16,border:'1px solid #e2e8f0'}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:'#374151'}}>Alertes critiques du jour</div>
            {alertes.length===0
              ? <div style={{color:'#94a3b8',fontSize:13,textAlign:'center',padding:'16px 0'}}>Aucune valeur critique aujourd&apos;hui</div>
              : alertes.slice(0,5).map((a:any,i:number) => (
                <div key={i} style={{padding:'7px 10px',background:'#fef2f2',borderRadius:8,marginBottom:6,fontSize:13}}>
                  <strong>{a.patient_nom}</strong> — {a.libelle} : <span style={{color:'#dc2626',fontWeight:700}}>{a.valeur_observee}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* QUEUE */}
      {onglet==='queue' && (
        <div>
          <h2 style={{fontWeight:900,fontSize:'1.2rem',color:'#0f172a',marginBottom:16}}>File d&apos;attente — Laboratoire</h2>
          {queueLabo.length===0
            ? (
              <div style={{textAlign:'center',padding:40,color:'#94a3b8'}}>
                <i className="fa-solid fa-flask-vial" style={{fontSize:40,display:'block',marginBottom:12,opacity:0.3}}/>
                <div>Aucun patient en attente pour le laboratoire</div>
              </div>
            )
            : queueLabo.map((p:any,i:number) => (
              <div key={i} style={{background:'white',borderRadius:12,padding:14,border:'1px solid #e2e8f0',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{p.patient_nom}</div>
                  <div style={{fontSize:12,color:'#94a3b8',marginTop:2}}>#{p.patient_numero} · {p.service} · Ticket {p.ticket}</div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{background:p.paiement_effectue?'#f0fdf4':'#fef2f2',color:p.paiement_effectue?'#16a34a':'#dc2626',padding:'2px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>
                    {p.paiement_effectue?'Payé':'Non payé'}
                  </span>
                  <button onClick={()=>setSearchPat(p.patient_numero)} style={{background:'#1641C8',color:'white',border:'none',borderRadius:8,padding:'6px 12px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                    Saisir résultat
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}

{onglet==='saisie' && (
 <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',gap:20}}>

 {/* Colonne gauche: recherche patient + sélection examen */}
 <div>
 <div style={{background:'white',borderRadius:16,padding:20,border:'1px solid #e2e8f0',marginBottom:16}}>
 <h3 style={{fontWeight:700,fontSize:15,marginBottom:12,color:'#0f172a'}}> Patient (ID ou NOM)</h3>
 <div style={{display:'flex',gap:8,marginBottom:10}}>
 <input value={searchPat} onChange={e=>setSearchPat(e.target.value.toUpperCase())}
 onKeyDown={e=>e.key==='Enter'&&chercherPatient()}
 placeholder="#RB-0042"
 style={{flex:1,padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,fontFamily:'monospace'}}/>
 <button onClick={chercherPatient} style={{background:'#16a34a',color:'white',border:'none',borderRadius:8,padding:'10px 16px',fontWeight:700,cursor:'pointer'}}>
 <Search size={14}/>
 </button>
 </div>
 {patient && (
 <div style={{background:'#f0fdf4',borderRadius:8,padding:'8px 12px',fontSize:13,display:'flex',alignItems:'center',gap:8}}>
 <CheckCircle size={14} color="#16a34a"/>
 <strong>{patient.nom}</strong>
 <span style={{fontFamily:'monospace',color:'#16a34a',fontSize:12}}>{patient.numero}</span>
 </div>
 )}
 </div>

 {/* Sélecteur d'examen avec recherche */}
 <div style={{background:'white',borderRadius:16,padding:16,border:'1px solid #e2e8f0'}}>
 <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>
 Examen ({TOUS_EXAMENS.length} disponibles)
 </div>
 <input value={searchEx} onChange={e=>setSearchEx(e.target.value)}
 placeholder="Filtrer les examens..."
 style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,marginBottom:8,boxSizing:'border-box' as const}}/>
 <div style={{maxHeight:280,overflowY:'auto'}}>
 {examsFiltres.map(ex => (
 <button key={ex} type="button" onClick={()=>setForm(p=>({...p,type_examen:ex}))} style={{
 width:'100%',padding:'7px 10px',border:'none',background:form.type_examen===ex?'#f0fdf4':'transparent',
 borderRadius:6,cursor:'pointer',textAlign:'left',fontSize:12,
 color:form.type_examen===ex?'#16a34a':'#374151',
 fontWeight:form.type_examen===ex?700:400,
 borderLeft:form.type_examen===ex?'3px solid #16a34a':'3px solid transparent',
 }}>{ex}</button>
 ))}
 </div>
 {form.type_examen && (
 <div style={{marginTop:8,padding:'6px 10px',background:'#eff6ff',borderRadius:6,fontSize:12,color:'#1641C8',fontWeight:600}}>
 {form.type_examen}
 </div>
 )}
 </div>
 </div>

 {/* Colonne droite: saisie résultats */}
 <div style={{background:'white',borderRadius:16,padding:20,border:`2px solid ${editId?'#f59e0b':'#e2e8f0'}`}}>
 <h3 style={{fontWeight:700,fontSize:15,marginBottom:16,color:'#0f172a'}}>
 {editId ? ' Modifier (fenêtre 24h)' : ' Résultats de l\'examen'}
 </h3>

 {!form.type_examen && (
 <div style={{background:'#f8fafc',borderRadius:10,padding:20,textAlign:'center',color:'#94a3b8',marginBottom:14}}>
 ← Sélectionnez un examen dans la liste
 </div>
 )}

 {form.type_examen && (
 <>
 <div style={{background:'#eff6ff',borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:13,fontWeight:700,color:'#1641C8'}}>
 {form.type_examen}
 </div>

 <div style={{marginBottom:14}}>
 <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>
 Résultats avec valeurs et unités *
 </label>
 <textarea value={form.resultats} onChange={e=>setForm(p=>({...p,resultats:e.target.value}))}
 rows={5}
 placeholder={`Exemple:\nGlycémie: 5.6 mmol/L [réf: 3.9–6.1]\nHémoglobine: 12.5 g/dL [réf: 12–17]\n\nOu texte libre avec valeurs numériques`}
 style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,resize:'vertical',boxSizing:'border-box' as const,fontFamily:'monospace'}}/>
 {form.resultats && detecterValeurCritique(form.type_examen, form.resultats) && (
 <div style={{marginTop:6,background:'#fef2f2',borderRadius:6,padding:'8px 12px',fontSize:12,color:'#dc2626',fontWeight:700,display:'flex',gap:6,alignItems:'center'}}>
 <AlertTriangle size={12}/> VALEUR CRITIQUE DÉTECTÉE — Alerte automatique au médecin
 </div>
 )}
 </div>

 <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
 <div>
 <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Notes du technicien</label>
 <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
 rows={3} placeholder="Observations..."
 style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,resize:'vertical',boxSizing:'border-box' as const}}/>
 </div>
 <div>
 <div style={{marginBottom:10}}>
 <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Date examen *</label>
 <input type="date" value={form.date_examen} onChange={e=>setForm(p=>({...p,date_examen:e.target.value}))}
 style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}}/>
 </div>
 <div>
 <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Médecin prescripteur</label>
 <input value={form.medecin_prescripteur} onChange={e=>setForm(p=>({...p,medecin_prescripteur:e.target.value}))}
 placeholder="Email du médecin"
 style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}}/>
 </div>
 </div>
 </div>

 <div style={{background:'#fffbeb',borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:12,color:'#92400e',display:'flex',gap:6}}>
 <AlertTriangle size={12}/> Après 24h le résultat sera verrouillé — plus de modification possible.
 </div>

 <div style={{display:'flex',gap:10}}>
 <button onClick={soumettre} disabled={submitting||!patient||!form.type_examen||!form.resultats} style={{
 flex:1,background:editId?'linear-gradient(135deg,#f59e0b,#d97706)':'linear-gradient(135deg,#16a34a,#0d9488)',
 color:'white',border:'none',borderRadius:10,padding:'13px',fontWeight:700,cursor:'pointer',fontSize:14,
 opacity:(!patient||!form.type_examen||!form.resultats)?0.5:1
 }}>
 {submitting ? '...' : editId ? ' Modifier' : ' Enregistrer & Notifier'}
 </button>
 {editId && (
 <button onClick={()=>{setEditId(null);setForm({type_examen:'',resultats:'',notes:'',date_examen:new Date().toISOString().split('T')[0],medecin_prescripteur:''})}}
 style={{background:'#f1f5f9',color:'#374151',border:'none',borderRadius:10,padding:'13px 18px',fontWeight:600,cursor:'pointer'}}>
 Annuler
 </button>
 )}
 </div>
 </>
 )}
 </div>
 </div>
 )}

 {/* HISTORIQUE */}
 {onglet==='historique' && (
 <div>
 <h2 style={{fontWeight:900,fontSize:'1.3rem',color:'#0f172a',marginBottom:16}}>Historique des résultats</h2>
 {/* Recherche patient pour historique */}
 <div style={{background:'white',borderRadius:12,padding:16,border:'1px solid #e2e8f0',marginBottom:16,display:'flex',gap:10}}>
 <input value={searchPat} onChange={e=>setSearchPat(e.target.value.toUpperCase())}
 onKeyDown={e=>e.key==='Enter'&&chercherPatient()}
 placeholder="ID patient pour filtrer..."
 style={{flex:1,padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,fontFamily:'monospace'}}/>
 <button onClick={chercherPatient} style={{background:'#16a34a',color:'white',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:700,cursor:'pointer'}}>
 Filtrer
 </button>
 </div>

 {resultats.length === 0 ? (
 <div style={{background:'white',borderRadius:16,padding:48,textAlign:'center',border:'1px solid #e2e8f0'}}>
 <FlaskConical size={40} color="#94a3b8" style={{marginBottom:12}}/>
 <p style={{color:'#64748b'}}>Recherchez un patient pour voir ses résultats.</p>
 </div>
 ) : resultats.map((r: any) => (
 <div key={r.id} style={{background:'white',borderRadius:14,padding:18,border:`1px solid ${canEdit(r)?'#fcd34d':'#e2e8f0'}`,marginBottom:10}}>
 <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
 <div>
 <div style={{fontWeight:800,color:'#0f172a',fontSize:15}}>{r.type_examen}</div>
 <div style={{color:'#64748b',fontSize:12,marginTop:2}}>
 Patient: {r.patient_nom || r.patient_id} · {new Date(r.date_examen).toLocaleDateString('fr-FR')}
 </div>
 </div>
 <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
 {r.valeur_critique && (
 <span style={{background:'#fef2f2',color:'#dc2626',borderRadius:50,padding:'3px 10px',fontSize:11,fontWeight:700}}>
 Critique
 </span>
 )}
 {canEdit(r) && (
 <span style={{background:'#fffbeb',color:'#d97706',borderRadius:50,padding:'3px 10px',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',gap:4}}>
 <Clock size={10}/> Modifiable
 </span>
 )}
 <span style={{background:'#f0fdf4',color:'#16a34a',borderRadius:50,padding:'3px 10px',fontSize:11,fontWeight:700}}>
 {r.status}
 </span>
 {canEdit(r) && (
 <button onClick={()=>{
 setEditId(r.id)
 setForm({type_examen:r.type_examen,resultats:r.resultats,notes:r.notes||'',date_examen:r.date_examen,medecin_prescripteur:r.medecin_prescripteur||''})
 setOnglet('saisie')
 }} style={{background:'#f59e0b',color:'white',border:'none',borderRadius:8,padding:'5px 12px',fontWeight:700,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
 <Edit size={12}/> Modifier
 </button>
 )}
 </div>
 </div>
 <div style={{background:'#f8fafc',borderRadius:8,padding:'10px 12px',fontSize:13,color:'#374151',whiteSpace:'pre-wrap',fontFamily:'monospace',lineHeight:1.6}}>
 {r.resultats}
 </div>
 {r.notes && <div style={{fontSize:12,color:'#64748b',marginTop:6,fontStyle:'italic'}}>{r.notes}</div>}
 {/* Bouton imprimer résultat */}
 <div style={{display:'flex',justifyContent:'flex-end',marginTop:10}}>
 <button onClick={()=>{
 if (!maSignature) {
 toast.error("Enregistrez votre signature d'abord — voir section Signature ci-dessous")
 setShowSigPad(true)
 return
 }
 imprimerResultatLabo({
 patient: {
 numero: r.patient_id || r.patient_numero || '#RB-????',
 nom: r.patient_nom || 'Patient',
 age: r.patient_age,
 telephone: r.patient_telephone,
 },
 examens: [{
 code: r.code || '',
 libelle: r.type_examen,
 valeur: r.resultats,
 unite: r.unite || '',
 reference: r.reference || '',
 critique: r.valeur_critique,
 }],
 technicien: user?.nom || 'Technicien',
 prescripteur: r.medecin_prescripteur || '',
 signature_technicien: maSignature,
 date: r.date_examen,
 recu_numero: r.numero_resultat || r.id?.toString(),
 notes: r.notes,
 })
 }} style={{
 background:'#16a34a',color:'white',border:'none',borderRadius:8,
 padding:'7px 16px',fontWeight:700,cursor:'pointer',fontSize:12,
 display:'flex',alignItems:'center',gap:6
 }}>
 <Printer size={13}/>Imprimer le résultat
 </button>
 </div>
 </div>
 ))}

 {/* SIGNATURE TECHNICIEN */}
 <div style={{background:'white',borderRadius:16,padding:20,border:'2px dashed #16a34a',marginTop:20}}>
 <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
 <div>
 <div style={{fontWeight:800,fontSize:14,color:'#15803d'}}> Ma signature de technicien</div>
 <div style={{fontSize:12,color:'#64748b',marginTop:2}}>
 Sera apposée automatiquement sur tous vos résultats imprimés.
 </div>
 </div>
 {maSignature && !showSigPad && (
 <button onClick={()=>setShowSigPad(true)} style={{background:'#f0fdf4',border:'1px solid #16a34a',color:'#15803d',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:700}}>
 Modifier
 </button>
 )}
 </div>
 {maSignature && !showSigPad ? (
 <div style={{display:'flex',alignItems:'center',gap:14}}>
 <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:10}}>
 <img src={maSignature} style={{height:60,maxWidth:200,objectFit:'contain'}} alt="Ma signature"/>
 </div>
 <div style={{fontSize:12,color:'#16a34a',fontWeight:600}}> Signature enregistrée — apparaîtra sur vos documents</div>
 </div>
 ) : (
 <div>
 <SignaturePad
 onSign={sig => setMaSignature(sig)}
 initialValue={maSignature || undefined}
 label={`Signature — ${user?.nom || 'Technicien de Laboratoire'}`}
 width={440}
 height={140}
 strokeColor="#15803d"
 />
 {maSignature && (
 <button onClick={async()=>{
 try {
 await api.post('/medecin/enregistrer-signature', { signature_base64: maSignature })
 toast.success('Signature enregistrée ')
 setShowSigPad(false)
 } catch(e:any) { toast.error('Erreur enregistrement') }
 }} style={{marginTop:10,background:'#16a34a',color:'white',border:'none',borderRadius:8,padding:'9px 20px',fontWeight:700,cursor:'pointer',fontSize:13}}>
 Enregistrer ma signature
 </button>
 )}
 </div>
 )}
 </div>
 </div>
 )}

 {/* ALERTES */}
 {onglet==='alertes' && (
 <div>
 <h2 style={{fontWeight:900,fontSize:'1.3rem',color:'#dc2626',marginBottom:20}}> Valeurs critiques</h2>
 {alertes.length === 0 ? (
 <div style={{background:'#f0fdf4',borderRadius:16,padding:48,textAlign:'center',border:'1px solid #bbf7d0'}}>
 <CheckCircle size={40} color="#16a34a" style={{marginBottom:12}}/>
 <p style={{color:'#16a34a',fontWeight:700}}>Aucune valeur critique — tout est normal.</p>
 </div>
 ) : alertes.map((a: any, i: number) => (
 <div key={i} style={{background:'#fef2f2',borderRadius:14,padding:18,border:'2px solid #fca5a5',marginBottom:10,display:'flex',gap:14}}>
 <AlertTriangle size={24} color="#dc2626" style={{flexShrink:0,marginTop:2}}/>
 <div>
 <div style={{fontWeight:800,color:'#dc2626',fontSize:15}}>{a.message || a.examen}</div>
 <div style={{color:'#374151',fontSize:13,marginTop:4}}>
 <strong>Examen :</strong> {a.examen} · <strong>Valeur :</strong> {a.valeur}
 </div>
 <div style={{color:'#374151',fontSize:13}}><strong>Patient :</strong> {a.patient}</div>
 <div style={{color:'#64748b',fontSize:12,marginTop:6,display:'flex',alignItems:'center',gap:6}}>
 <CheckCircle size={11} color="#16a34a"/> Médecin prescripteur alerté automatiquement
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )
}
