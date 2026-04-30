'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { LogOut, Search, FlaskConical, AlertTriangle, CheckCircle, Clock, Edit } from 'lucide-react'

interface Resultat {
  id: number; patient_id: string; patient_nom?: string; patient_numero?: string
  type_examen: string; resultats: string; notes: string
  date_examen: string; status: string; created_at: string
  modifiable: boolean  // within 24h window
}

const VALEURS_CRITIQUES: Record<string, (val: number) => boolean> = {
  'glycemie':          v => v > 600 || v < 40,
  'potassium':         v => v > 6.5 || v < 2.5,
  'sodium':            v => v > 160 || v < 120,
  'hemoglobine':       v => v < 5,
  'plaquettes':        v => v < 20000,
  'creatinine':        v => v > 884,
  'troponine':         v => v > 0.04,
}

async function alerterMedecinCritique(examen: string, valeur: string, patientId: string) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Valeur critique de laboratoire détectée: ${examen} = ${valeur} pour patient #${patientId}. Génère un message d'alerte médical urgent en 2 phrases pour le médecin prescripteur. Ton: urgent mais professionnel.`
        }]
      })
    })
    const data = await res.json()
    return data.content?.[0]?.text || ''
  } catch { return '' }
}

export default function LaboPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [onglet,    setOnglet]    = useState<'saisie'|'historique'|'alertes'>('saisie')
  const [search,    setSearch]    = useState('')
  const [patient,   setPatient]   = useState<any>(null)
  const [resultats, setResultats] = useState<Resultat[]>([])
  const [alertes,   setAlertes]   = useState<any[]>([])
  const [submitting,setSubmitting]= useState(false)
  const [editId,    setEditId]    = useState<number|null>(null)
  const [form, setForm] = useState({
    type_examen: '', resultats: '', notes: '', date_examen: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (!loading && (!isAuthenticated || !['labo','admin'].includes(user?.role||''))) {
      router.push('/login')
    }
  }, [isAuthenticated, user, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    // Load recent results with alerts
    api.get('/labo/resultats-recents?limit=30')
      .then(r => {
        const all = r.data || []
        setResultats(all)
        setAlertes(all.filter((r: any) => r.valeur_critique))
      })
      .catch(() => {})
  }, [isAuthenticated])

  const chercherPatient = async () => {
    const id = search.trim().toUpperCase()
    if (!id) return
    try {
      const r = await api.get(`/patients/par-numero/${id}`)
      setPatient(r.data)
      // Load this patient's results
      const res = await api.get(`/labo/resultats/${r.data.id}`)
      setResultats(res.data || [])
    } catch { toast.error('Patient introuvable') }
  }

  const soumettre = async () => {
    if (!patient || !form.type_examen || !form.resultats) {
      toast.error('Complétez tous les champs obligatoires')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        patient_id: String(patient.id),
        patient_nom: patient.nom,
        ...form,
        status: 'disponible',
      }

      let res
      if (editId) {
        res = await api.put(`/labo/resultats/${editId}`, payload)
        toast.success('Résultat modifié ✓')
      } else {
        res = await api.post('/labo/resultats', payload)
        toast.success('Résultat enregistré — notification envoyée au patient ✓')
      }

      // Check for critical values using AI
      const valeurNum = parseFloat(form.resultats.replace(/[^0-9.]/g, ''))
      const examKey = form.type_examen.toLowerCase().replace(/\s+/g,'')
      const isCritical = Object.entries(VALEURS_CRITIQUES).some(([key, check]) =>
        examKey.includes(key) && !isNaN(valeurNum) && check(valeurNum)
      )

      if (isCritical) {
        const msg = await alerterMedecinCritique(form.type_examen, form.resultats, patient.numero)
        toast.error(`🚨 VALEUR CRITIQUE!\n${msg}`, { duration: 10000 })
        // Notify the backend
        if (res?.data?.id) {
          await api.post(`/labo/alerte-critique/${res.data.id}`, {
            examen: form.type_examen, valeur: form.resultats
          })
        }
        setAlertes(prev => [...prev, { examen: form.type_examen, valeur: form.resultats, patient: patient.nom }])
      }

      setForm({ type_examen:'', resultats:'', notes:'', date_examen: new Date().toISOString().split('T')[0] })
      setEditId(null)
      // Reload
      const updated = await api.get(`/labo/resultats/${patient.id}`)
      setResultats(updated.data || [])
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur')
    } finally { setSubmitting(false) }
  }

  const demarrerEdition = (r: Resultat) => {
    if (!r.modifiable) { toast.error('Fenêtre de 24h expirée — modification impossible'); return }
    setEditId(r.id)
    setForm({ type_examen: r.type_examen, resultats: r.resultats, notes: r.notes, date_examen: r.date_examen })
    setOnglet('saisie')
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #16a34a',borderTopColor:'transparent',animation:'spin 1s linear infinite'}}/></div>

  const EXAMENS_COMMUNS = [
    'Hémogramme (NFS)','Glycémie à jeun','Sérologie HIV 1&2','Hépatite B (AgHBs)',
    'Hépatite C','Bilan rénal (Urée + Créatinine)','HBA1C','TSH','Bilan lipidique',
    'Widal','βHCG','VDRL/RPR','CRP','Ferritine','SGOT/SGPT','Frottis vaginal',
    'Culture urine (ECBU)','Troponine','Potassium','Sodium','Calcium','Groupe sanguin',
  ]

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      {/* Navbar */}
      <div style={{background:'linear-gradient(135deg,#0f1e3d,#16a34a)',height:58,display:'flex',alignItems:'center',padding:'0 24px',gap:14}}>
        <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🔬</div>
        <div>
          <div style={{color:'white',fontWeight:800,fontSize:14}}>{user?.nom}</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:11}}>Technicien Laboratoire</div>
        </div>
        {alertes.length > 0 && (
          <div style={{background:'#dc2626',color:'white',borderRadius:50,padding:'4px 12px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:6}}>
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
          {k:'saisie',     label:'📝 Saisie résultats'},
          {k:'historique', label:'📋 Historique'},
          {k:'alertes',    label:`🚨 Alertes critiques ${alertes.length>0?`(${alertes.length})`:''}`},
        ].map(t => (
          <button key={t.k} onClick={()=>setOnglet(t.k as any)} style={{
            padding:'13px 16px',border:'none',background:'transparent',cursor:'pointer',
            fontWeight:600,fontSize:13,color:onglet===t.k?'#16a34a':'#64748b',
            borderBottom:onglet===t.k?'2px solid #16a34a':'2px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 20px'}}>

        {/* ── SAISIE ─────────────────────────────────────────────── */}
        {onglet==='saisie' && (
          <div>
            {/* Recherche patient */}
            <div style={{background:'white',borderRadius:16,padding:22,border:'1px solid #e2e8f0',marginBottom:20}}>
              <h3 style={{fontWeight:700,fontSize:15,marginBottom:14,color:'#0f172a'}}>🔍 Rechercher le patient</h3>
              <div style={{display:'flex',gap:10}}>
                <input value={search} onChange={e=>setSearch(e.target.value.toUpperCase())}
                  onKeyDown={e=>e.key==='Enter'&&chercherPatient()}
                  placeholder="ID patient (ex: #RB-0042) ou NOM PRÉNOM"
                  style={{flex:1,padding:'11px 14px',borderRadius:10,border:'1px solid #d1d5db',fontSize:14,fontFamily:'monospace'}}/>
                <button onClick={chercherPatient} style={{background:'#16a34a',color:'white',border:'none',borderRadius:10,padding:'11px 20px',fontWeight:700,cursor:'pointer'}}>
                  <Search size={16}/>
                </button>
              </div>
              {patient && (
                <div style={{marginTop:12,background:'#f0fdf4',borderRadius:10,padding:'10px 16px',display:'flex',gap:10,alignItems:'center'}}>
                  <CheckCircle size={16} color="#16a34a"/>
                  <div>
                    <span style={{fontWeight:700,color:'#0f172a'}}>{patient.nom}</span>
                    <span style={{fontFamily:'monospace',color:'#16a34a',marginLeft:10}}>{patient.numero}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Formulaire résultat */}
            {patient && (
              <div style={{background:'white',borderRadius:16,padding:22,border:`2px solid ${editId?'#f59e0b':'#16a34a'}`}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:16,color:'#0f172a'}}>
                  {editId ? '✏️ Modifier le résultat (fenêtre 24h)' : '➕ Nouveau résultat'}
                </h3>

                <div style={{marginBottom:14}}>
                  <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Type d'examen *</label>
                  <select value={form.type_examen} onChange={e=>setForm(p=>({...p,type_examen:e.target.value}))}
                    style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #d1d5db',fontSize:14,background:'white'}}>
                    <option value="">-- Sélectionner un examen --</option>
                    {EXAMENS_COMMUNS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    <option value="autre">Autre (saisie manuelle)</option>
                  </select>
                  {form.type_examen === 'autre' && (
                    <input value="" onChange={e=>setForm(p=>({...p,type_examen:e.target.value}))}
                      placeholder="Nom de l'examen"
                      style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #d1d5db',fontSize:14,marginTop:8,boxSizing:'border-box' as const}}/>
                  )}
                </div>

                <div style={{marginBottom:14}}>
                  <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Résultats * <span style={{color:'#94a3b8',fontWeight:400}}>(valeurs et unités)</span></label>
                  <textarea value={form.resultats} onChange={e=>setForm(p=>({...p,resultats:e.target.value}))}
                    rows={4} placeholder="Ex: Glycémie: 5.6 mmol/L (réf: 3.9-6.1)&#10;Hémoglobine: 12.5 g/dL (réf: 12-17)"
                    style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #d1d5db',fontSize:14,resize:'vertical',boxSizing:'border-box' as const}}/>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                  <div>
                    <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Notes / Interprétation</label>
                    <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                      rows={3} placeholder="Notes du technicien..."
                      style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #d1d5db',fontSize:14,resize:'vertical',boxSizing:'border-box' as const}}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Date d'examen *</label>
                    <input type="date" value={form.date_examen} onChange={e=>setForm(p=>({...p,date_examen:e.target.value}))}
                      style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #d1d5db',fontSize:14,boxSizing:'border-box' as const}}/>
                  </div>
                </div>

                {/* Avertissement valeurs critiques */}
                <div style={{background:'#fffbeb',borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:12,color:'#92400e',display:'flex',gap:8,alignItems:'center'}}>
                  <AlertTriangle size={14}/> 
                  Vérification automatique des valeurs critiques lors de la soumission — alerte immédiate au médecin si nécessaire.
                </div>

                <div style={{display:'flex',gap:10}}>
                  <button onClick={soumettre} disabled={submitting||!form.type_examen||!form.resultats} style={{
                    background:editId?'linear-gradient(135deg,#f59e0b,#d97706)':'linear-gradient(135deg,#16a34a,#0d9488)',
                    color:'white',border:'none',borderRadius:10,padding:'12px 24px',fontWeight:700,cursor:'pointer',fontSize:14,
                    opacity:(!form.type_examen||!form.resultats)?0.5:1
                  }}>
                    {submitting ? '⏳ Enregistrement...' : editId ? '✏️ Modifier' : '✓ Enregistrer & Notifier le patient'}
                  </button>
                  {editId && (
                    <button onClick={()=>{setEditId(null);setForm({type_examen:'',resultats:'',notes:'',date_examen:new Date().toISOString().split('T')[0]})}}
                      style={{background:'#f1f5f9',color:'#374151',border:'none',borderRadius:10,padding:'12px 18px',fontWeight:600,cursor:'pointer'}}>
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORIQUE ─────────────────────────────────────────── */}
        {onglet==='historique' && (
          <div>
            <h2 style={{fontWeight:900,fontSize:'1.3rem',color:'#0f172a',marginBottom:20}}>Historique des résultats</h2>
            {resultats.length === 0 ? (
              <div style={{background:'white',borderRadius:16,padding:48,textAlign:'center',border:'1px solid #e2e8f0'}}>
                <FlaskConical size={40} color="#94a3b8" style={{marginBottom:12}}/>
                <p style={{color:'#64748b'}}>Aucun résultat. Recherchez un patient pour voir ses résultats.</p>
              </div>
            ) : resultats.map(r => (
              <div key={r.id} style={{background:'white',borderRadius:14,padding:18,border:`1px solid ${r.modifiable?'#fcd34d':'#e2e8f0'}`,marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:800,color:'#0f172a',fontSize:15}}>{r.type_examen}</div>
                    <div style={{color:'#64748b',fontSize:12,marginTop:2}}>
                      Patient: {r.patient_nom || r.patient_id} · {new Date(r.date_examen).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    {r.modifiable && (
                      <span style={{background:'#fffbeb',color:'#d97706',borderRadius:50,padding:'3px 10px',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',gap:4}}>
                        <Clock size={10}/> Modifiable
                      </span>
                    )}
                    <span style={{background:'#f0fdf4',color:'#16a34a',borderRadius:50,padding:'3px 10px',fontSize:11,fontWeight:700}}>
                      {r.status}
                    </span>
                    {r.modifiable && (
                      <button onClick={()=>demarrerEdition(r)} style={{background:'#f59e0b',color:'white',border:'none',borderRadius:8,padding:'5px 12px',fontWeight:700,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
                        <Edit size={12}/> Modifier
                      </button>
                    )}
                  </div>
                </div>
                <div style={{background:'#f8fafc',borderRadius:8,padding:'10px 12px',fontSize:13,color:'#374151',whiteSpace:'pre-wrap',fontFamily:'monospace'}}>
                  {r.resultats}
                </div>
                {r.notes && <div style={{fontSize:12,color:'#64748b',marginTop:6,fontStyle:'italic'}}>{r.notes}</div>}
              </div>
            ))}
          </div>
        )}

        {/* ── ALERTES CRITIQUES ──────────────────────────────────── */}
        {onglet==='alertes' && (
          <div>
            <h2 style={{fontWeight:900,fontSize:'1.3rem',color:'#dc2626',marginBottom:20}}>
              🚨 Alertes valeurs critiques
            </h2>
            {alertes.length === 0 ? (
              <div style={{background:'#f0fdf4',borderRadius:16,padding:48,textAlign:'center',border:'1px solid #bbf7d0'}}>
                <CheckCircle size={40} color="#16a34a" style={{marginBottom:12}}/>
                <p style={{color:'#16a34a',fontWeight:700}}>Aucune valeur critique détectée.</p>
              </div>
            ) : alertes.map((a,i) => (
              <div key={i} style={{background:'#fef2f2',borderRadius:14,padding:18,border:'2px solid #fca5a5',marginBottom:10,display:'flex',alignItems:'center',gap:14}}>
                <AlertTriangle size={24} color="#dc2626"/>
                <div>
                  <div style={{fontWeight:700,color:'#dc2626',fontSize:15}}>{a.examen}</div>
                  <div style={{color:'#374151',fontSize:13}}>Valeur: <strong>{a.valeur}</strong> · Patient: {a.patient}</div>
                  <div style={{color:'#64748b',fontSize:12,marginTop:4}}>Médecin prescripteur notifié automatiquement</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
