'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import ChangePasswordModal from '@/components/ui/ChangePasswordModal'
import { imprimerFeuilleDentisterie, imprimerFeuilleOptometrie } from '@/lib/print'
import toast from 'react-hot-toast'

const SVC_CFG: Record<string, {label:string,color:string,bg:string,icon:string}> = {
  dentisterie: {label:'Dentisterie',    color:'#0d9488',bg:'#f0fdfa',icon:'fa-tooth'},
  dentiste:    {label:'Dentisterie',    color:'#0d9488',bg:'#f0fdfa',icon:'fa-tooth'},
  physio:      {label:'Physiothérapie', color:'#d97706',bg:'#fffbeb',icon:'fa-person-walking'},
  optometrie:  {label:'Optométrie',     color:'#dc2626',bg:'#fef2f2',icon:'fa-glasses'},
  optom:       {label:'Optométrie',     color:'#dc2626',bg:'#fef2f2',icon:'fa-glasses'},
}

const CHAMPS: Record<string,{label:string,key:string,type?:string,rows?:number}[]> = {
  dentisterie: [
    {label:"Dent(s) concernée(s)",      key:'dents'},
    {label:"Type d'acte",               key:'type_acte'},
    {label:"Anesthésie utilisée",        key:'anesthesie'},
    {label:"Matériel utilisé",           key:'materiel'},
    {label:"Observations cliniques",     key:'observations',type:'textarea',rows:3},
    {label:"Traitement effectué",        key:'traitement',  type:'textarea',rows:3},
    {label:"Plan de traitement futur",   key:'plan_futur',  type:'textarea',rows:2},
    {label:"Prochain RDV recommandé",    key:'prochain_rdv'},
  ],
  physio: [
    {label:"Zone traitée",               key:'zone'},
    {label:"Type de thérapie",           key:'therapie'},
    {label:"Nombre de séances prescrites",key:'nb_seances'},
    {label:"Exercices prescrits",        key:'exercices',   type:'textarea',rows:3},
    {label:"Évolution / Progression",    key:'evolution',   type:'textarea',rows:3},
    {label:"Observations",               key:'observations',type:'textarea',rows:2},
    {label:"Prochain RDV",               key:'prochain_rdv'},
  ],
  optometrie: [
    {label:"Acuité visuelle OD",         key:'av_od'},
    {label:"Acuité visuelle OG",         key:'av_og'},
    {label:"Correction OD — SPH/CYL/AXE",key:'correction_od'},
    {label:"Correction OG — SPH/CYL/AXE",key:'correction_og'},
    {label:"Add / PD",                   key:'add_pd'},
    {label:"TIO D / TIO I",             key:'tio'},
    {label:"Pathologie détectée",        key:'pathologie'},
    {label:"Observations",               key:'observations',type:'textarea',rows:3},
    {label:"Prescription finale",        key:'prescription',type:'textarea',rows:3},
  ],
}

const fmtDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
const fmtHeure = (d:string) => new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})

export default function PraticienPage() {
  const { user, isAuthenticated, loading, mustChangePassword, setMustChangePassword } = useAuth()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const role    = user?.role || ''
  const service = role === 'dentiste' ? 'dentisterie' : role === 'physio' ? 'physio' : role === 'optometrie' ? 'optometrie' : role
  const cfg     = SVC_CFG[service] || {label:role, color:'#1641C8', bg:'#eff6ff', icon:'fa-user-doctor'}
  const champs  = CHAMPS[service] || CHAMPS.physio

  type Onglet = 'recherche'|'dossier'|'historique'|'stats'|'profil'
  const [onglet, setOnglet]       = useState<Onglet>('stats')
  const [showPwd, setShowPwd]     = useState(false)

  // Recherche
  const [code, setCode]           = useState('')
  const [patient, setPatient]     = useState<any>(null)
  const [dossierData, setDossierData] = useState<any>(null)
  const [searchErr, setSearchErr] = useState('')
  const [searching, setSearching] = useState(false)
  const [formData, setFormData]   = useState<Record<string,string>>({})
  const [saving, setSaving]       = useState(false)
  const [savedOk, setSavedOk]     = useState(false)

  // Stats
  const [stats, setStats]         = useState<any>(null)

  // Historique
  const [historique, setHistorique] = useState<any[]>([])
  const [moisFiltrer, setMoisFiltrer] = useState(3)
  const [loadingHist, setLoadingHist] = useState(false)

  // Profil
  const [bio, setBio]             = useState('')
  const [photoUrl, setPhotoUrl]   = useState('')
  const [savingProfil, setSavingProfil] = useState(false)

  useEffect(() => {
    if (!loading && (!isAuthenticated || !['dentiste','physio','optometrie','admin'].includes(role))) {
      router.push('/login')
    }
  }, [isAuthenticated, role, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/praticien/stats-semaine').then(r => setStats(r.data)).catch(() => {})
    // Load profil
    api.get('/auth/me').then(r => {
      setBio(r.data?.bio || '')
      setPhotoUrl(r.data?.photo_profil || '')
    }).catch(() => {})
  }, [isAuthenticated])

  const loadHistorique = (mois: number) => {
    setLoadingHist(true)
    api.get(`/praticien/historique-patients?mois=${mois}`)
      .then(r => setHistorique(r.data?.patients || []))
      .catch(() => setHistorique([]))
      .finally(() => setLoadingHist(false))
  }

  useEffect(() => {
    if (onglet === 'historique') loadHistorique(moisFiltrer)
  }, [onglet, moisFiltrer])

  const rechercherPatient = async () => {
    if (!code.trim()) { setSearchErr('Saisissez le code #RB-XXXX'); return }
    setSearching(true); setSearchErr(''); setPatient(null); setDossierData(null); setSavedOk(false)
    try {
      const r  = await api.get(`/caissier/recherche-patient?q=${encodeURIComponent(code.trim())}`)
      const pts = r.data?.patients || []
      if (!pts.length) { setSearchErr('Patient introuvable'); return }
      const p = pts[0]
      if (!p.paiement_effectue) { setSearchErr("Paiement non confirmé pour ce patient aujourd'hui"); return }
      setPatient(p)
      // Load full dossier
      const r2 = await api.get(`/praticien/dossier-patient/${p.id}`)
      setDossierData(r2.data)
      setFormData({})
      setOnglet('dossier')
    } catch (e:any) {
      setSearchErr(e.response?.data?.detail || 'Erreur de recherche')
    } finally { setSearching(false) }
  }

  const sauvegarder = async () => {
    if (!patient) return
    setSaving(true)
    try {
      await api.post('/dossiers', {
        patient_id:    patient.id,
        service,
        service_label: cfg.label,
        praticien_nom: user?.nom || '',
        praticien_role: role,
        date_visite:   new Date().toISOString(),
        donnees:       formData,
        notes:         Object.entries(formData).map(([k,v]) => `${k}: ${v}`).join('\n'),
      }).catch(() => null)
      toast.success('Dossier enregistré')
      setSavedOk(true)
      // Reload stats
      api.get('/praticien/stats-semaine').then(r => setStats(r.data)).catch(() => {})
    } catch { toast.error('Erreur enregistrement') }
    finally { setSaving(false) }
  }

  const imprimerFeuille = () => {
    if (!patient) return
    const f = {
      type:'specialise' as const, service_dest:service,
      ticket:code, patient_id:patient.id,
      patient_numero:patient.numero||code,
      patient_nom:`${patient.prenom||''} ${patient.nom||''}`.trim(),
      patient_age:patient.age||null, patient_tel:patient.telephone||'',
      service, service_label:cfg.label, praticien:user?.nom||'',
      date_visite:new Date().toISOString(), montant_paye:0, mode_paiement:'',
      paiement_complet:true, rdv_id:0, is_premiere_visite:false,
    }
    if (['dentisterie','dentiste'].includes(service as string)) imprimerFeuilleDentisterie(f)
    else if (['optometrie','optom'].includes(service as string)) imprimerFeuilleOptometrie(f)
    else toast('Feuille physiothérapie — bientôt disponible')
  }

  const sauvegarderProfil = async () => {
    setSavingProfil(true)
    try {
      await api.post('/praticien/profil', {bio, photo: photoUrl})
      toast.success('Profil mis à jour')
    } catch { toast.error('Erreur') }
    finally { setSavingProfil(false) }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div style={{width:36,height:36,borderRadius:'50%',border:`3px solid ${cfg.color}`,borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}/>
    </div>
  )

  const tabs: {k:Onglet,label:string,icon:string}[] = [
    {k:'stats',      label:'Tableau de bord', icon:'fa-chart-bar'},
    {k:'recherche',  label:'Patient du jour',  icon:'fa-search'},
    {k:'historique', label:'Historique',       icon:'fa-clock-rotate-left'},
    {k:'profil',     label:'Mon profil',       icon:'fa-user'},
  ]

  const inp = {width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #e2e8f0',fontSize:13,boxSizing:'border-box' as const}

  return (
    <>
    {(mustChangePassword || showPwd) && (
      <ChangePasswordModal
        isFirstLogin={mustChangePassword}
        onClose={() => { setMustChangePassword(false); setShowPwd(false) }}
      />
    )}

    <div style={{minHeight:'100vh',background:'#f8fafc',display:'flex',flexDirection:'column'}}>

      {/* Navbar */}
      <div style={{background:`linear-gradient(135deg,#0f172a,${cfg.color})`,padding:'0 20px',height:58,display:'flex',alignItems:'center',gap:14,flexShrink:0}}>
        <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {photoUrl
            ? <img src={photoUrl} alt="" style={{width:36,height:36,borderRadius:10,objectFit:'cover'}}/>
            : <i className={`fa-solid ${cfg.icon}`} style={{color:'white',fontSize:16}}/>
          }
        </div>
        <div>
          <div style={{color:'white',fontWeight:800,fontSize:15}}>{user?.nom}</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:11}}>{cfg.label}</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={() => setShowPwd(true)} style={{background:'rgba(255,255,255,0.12)',border:'none',borderRadius:8,padding:'6px 12px',color:'white',cursor:'pointer',fontSize:12,fontWeight:600}}>
            <i className="fa-solid fa-key" style={{marginRight:5}}/>Mot de passe
          </button>
          <button onClick={() => router.push('/login')} style={{background:'rgba(255,255,255,0.12)',border:'none',borderRadius:8,padding:'6px 12px',color:'white',cursor:'pointer',fontSize:12,fontWeight:600}}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:'white',borderBottom:'2px solid #f1f5f9',display:'flex',padding:'0 16px',gap:2,flexShrink:0}}>
        {tabs.map(t => (
          <button key={t.k} onClick={() => setOnglet(t.k)} style={{
            padding:'13px 16px',border:'none',background:'transparent',cursor:'pointer',
            fontWeight:700,fontSize:13,whiteSpace:'nowrap' as const,
            color:onglet===t.k?cfg.color:'#64748b',
            borderBottom:onglet===t.k?`2px solid ${cfg.color}`:'2px solid transparent',
            marginBottom:-2,display:'flex',alignItems:'center',gap:6,
          }}>
            <i className={`fa-solid ${t.icon}`} style={{fontSize:12}}/>
            {t.label}
          </button>
        ))}
        {onglet==='dossier' && patient && (
          <button onClick={() => setOnglet('dossier')} style={{
            padding:'13px 16px',border:'none',background:'transparent',cursor:'pointer',
            fontWeight:700,fontSize:13,color:cfg.color,
            borderBottom:`2px solid ${cfg.color}`,marginBottom:-2,
          }}>
            <i className="fa-solid fa-file-medical" style={{fontSize:12,marginRight:6}}/>
            {patient.prenom} {patient.nom}
          </button>
        )}
      </div>

      <div style={{flex:1,overflow:'auto',padding:20}}>
        <div style={{maxWidth:960,margin:'0 auto'}}>

          {/* ── STATS ── */}
          {onglet==='stats' && (
            <div>
              <h2 style={{fontWeight:900,fontSize:'1.2rem',color:'#0f172a',marginBottom:16}}>
                Tableau de bord — {cfg.label}
              </h2>

              {/* KPIs semaine */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
                {[
                  {label:'Patients cette semaine', val:stats?.patients_semaine??'—', color:cfg.color, bg:cfg.bg},
                  {label:'Consultations semaine',  val:stats?.rdv_semaine??'—',      color:'#7c3aed', bg:'#f5f3ff'},
                  {label:'Patients total',          val:stats?.patients_total??'—',   color:'#0d9488', bg:'#f0fdfa'},
                ].map(s => (
                  <div key={s.label} style={{background:s.bg,borderRadius:14,padding:18,textAlign:'center',border:`1px solid ${s.color}22`}}>
                    <div style={{fontWeight:900,fontSize:'2rem',color:s.color}}>{s.val}</div>
                    <div style={{fontSize:12,color:'#64748b',marginTop:4}}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick search */}
              <div style={{background:'white',borderRadius:14,padding:20,border:'1px solid #e2e8f0',marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:14,color:'#374151',marginBottom:12}}>
                  <i className="fa-solid fa-search" style={{marginRight:8,color:cfg.color}}/>
                  Ouvrir un dossier patient
                </div>
                <div style={{display:'flex',gap:8}}>
                  <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())}
                    onKeyDown={e=>e.key==='Enter'&&rechercherPatient()}
                    placeholder="#RB-0001" style={{...inp,flex:1,fontFamily:'monospace',fontWeight:700,fontSize:15}}/>
                  <button onClick={rechercherPatient} disabled={searching} style={{
                    padding:'9px 20px',borderRadius:8,border:'none',
                    background:cfg.color,color:'white',fontWeight:700,cursor:'pointer'
                  }}>
                    {searching?'...':'Ouvrir'}
                  </button>
                </div>
                {searchErr && <div style={{color:'#dc2626',fontSize:12,marginTop:8}}>{searchErr}</div>}
              </div>

              {/* Recent patients (last 5) */}
              <div style={{background:'white',borderRadius:14,padding:20,border:'1px solid #e2e8f0'}}>
                <div style={{fontWeight:700,fontSize:14,color:'#374151',marginBottom:12}}>
                  Derniers patients (3 mois)
                </div>
                {historique.slice(0,5).length === 0
                  ? <div style={{color:'#94a3b8',fontSize:13,textAlign:'center',padding:'20px 0'}}>
                      Chargement...
                    </div>
                  : historique.slice(0,5).map((h,i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9',fontSize:13}}>
                      <div>
                        <span style={{fontWeight:700}}>{h.prenom} {h.nom}</span>
                        <span style={{color:'#94a3b8',marginLeft:8,fontFamily:'monospace',fontSize:11}}>{h.numero}</span>
                      </div>
                      <div style={{color:'#64748b',fontSize:12}}>{fmtDate(h.date_visite)}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ── RECHERCHE / DOSSIER ── */}
          {(onglet==='recherche' || onglet==='dossier') && (
            <div>
              {!patient || onglet==='recherche' ? (
                <div style={{maxWidth:480,margin:'32px auto'}}>
                  <div style={{textAlign:'center',marginBottom:24}}>
                    <div style={{width:64,height:64,borderRadius:'50%',background:cfg.bg,border:`2px solid ${cfg.color}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
                      <i className={`fa-solid ${cfg.icon}`} style={{fontSize:28,color:cfg.color}}/>
                    </div>
                    <h2 style={{fontWeight:900,fontSize:'1.3rem',color:'#0f172a',margin:0}}>{cfg.label}</h2>
                    <p style={{color:'#64748b',fontSize:13,marginTop:6}}>
                      Entrez le code dossier du patient (reçu de la caisse)
                    </p>
                  </div>
                  <div style={{background:'white',borderRadius:16,padding:24,border:'1px solid #e2e8f0'}}>
                    <div style={{display:'flex',gap:8}}>
                      <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())}
                        onKeyDown={e=>e.key==='Enter'&&rechercherPatient()}
                        placeholder="#RB-0001" autoFocus
                        style={{flex:1,padding:'12px 14px',borderRadius:10,border:`2px solid ${code?cfg.color:'#e2e8f0'}`,
                          fontSize:16,fontFamily:'monospace',fontWeight:700,outline:'none',letterSpacing:1}}/>
                      <button onClick={rechercherPatient} disabled={searching} style={{
                        padding:'12px 20px',borderRadius:10,border:'none',
                        background:cfg.color,color:'white',fontWeight:700,cursor:'pointer',fontSize:14
                      }}>{searching?'...':'Ouvrir'}</button>
                    </div>
                    {searchErr && (
                      <div style={{marginTop:10,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'8px 12px',fontSize:13,color:'#dc2626'}}>
                        {searchErr}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Patient header */}
                  <div style={{background:'white',borderRadius:14,padding:16,border:`2px solid ${cfg.color}22`,marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontWeight:900,fontSize:'1.1rem'}}>{patient.prenom} {patient.nom}</div>
                      <div style={{fontFamily:'monospace',color:cfg.color,fontWeight:700,fontSize:14,marginTop:2}}>{patient.numero}</div>
                      <div style={{fontSize:12,color:'#64748b',marginTop:3}}>
                        {patient.telephone}{patient.age && ` · ${patient.age} ans`}
                      </div>
                      {dossierData?.patient?.allergies && (
                        <div style={{marginTop:6,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,padding:'3px 10px',fontSize:12,color:'#dc2626',display:'inline-block'}}>
                          <i className="fa-solid fa-triangle-exclamation" style={{marginRight:4}}/>
                          Allergies: {dossierData.patient.allergies}
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:99,padding:'4px 14px',fontSize:12,fontWeight:700,color:'#16a34a'}}>
                        <i className="fa-solid fa-circle-check" style={{marginRight:5}}/>Paiement confirmé
                      </div>
                      <button onClick={() => {setPatient(null);setCode('');setOnglet('recherche')}}
                        style={{marginTop:8,background:'transparent',border:'none',color:'#94a3b8',cursor:'pointer',fontSize:12}}>
                        ← Autre patient
                      </button>
                    </div>
                  </div>

                  {/* Antécédents */}
                  {dossierData?.patient?.antecedents && (
                    <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'8px 14px',marginBottom:12,fontSize:13,color:'#92400e'}}>
                      <strong>Antécédents:</strong> {dossierData.patient.antecedents}
                    </div>
                  )}

                  {/* Historique visites précédentes */}
                  {dossierData?.dossiers?.length > 0 && (
                    <div style={{background:'white',borderRadius:12,padding:14,border:'1px solid #e2e8f0',marginBottom:14}}>
                      <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:10}}>
                        <i className="fa-solid fa-clock-rotate-left" style={{marginRight:6,color:cfg.color}}/>
                        Visites précédentes ({dossierData.dossiers.length})
                      </div>
                      {dossierData.dossiers.slice(0,4).map((d:any,i:number) => (
                        <div key={i} style={{padding:'7px 0',borderBottom:'1px solid #f1f5f9',fontSize:12}}>
                          <span style={{fontWeight:700}}>{fmtDate(d.date)}</span>
                          <span style={{color:'#64748b',marginLeft:8}}>{d.praticien}</span>
                          {d.notes && <div style={{color:'#94a3b8',marginTop:2,fontStyle:'italic'}}>{d.notes.slice(0,80)}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulaire consultation */}
                  <div style={{background:'white',borderRadius:14,padding:20,border:'1px solid #e2e8f0',marginBottom:16}}>
                    <div style={{fontWeight:800,fontSize:14,color:cfg.color,marginBottom:16,borderBottom:`2px solid ${cfg.color}22`,paddingBottom:10}}>
                      <i className={`fa-solid ${cfg.icon}`} style={{marginRight:8}}/>
                      Fiche consultation — {cfg.label}
                    </div>
                    {champs.map(ch => (
                      <div key={ch.key} style={{marginBottom:12}}>
                        <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>{ch.label}</label>
                        {ch.type==='textarea'
                          ? <textarea value={formData[ch.key]||''} onChange={e=>setFormData(p=>({...p,[ch.key]:e.target.value}))}
                              rows={ch.rows||2} style={{...inp,resize:'vertical',fontFamily:'inherit'}}/>
                          : <input value={formData[ch.key]||''} onChange={e=>setFormData(p=>({...p,[ch.key]:e.target.value}))} style={inp}/>
                        }
                      </div>
                    ))}
                  </div>

                  {savedOk && (
                    <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:'10px 16px',marginBottom:12,fontSize:13,color:'#16a34a',fontWeight:700}}>
                      <i className="fa-solid fa-check" style={{marginRight:6}}/>Dossier enregistré
                    </div>
                  )}
                  <div style={{display:'flex',gap:10}}>
                    <button onClick={imprimerFeuille} style={{padding:'11px 16px',borderRadius:10,border:`1.5px solid ${cfg.color}`,background:'white',color:cfg.color,fontWeight:700,cursor:'pointer',fontSize:13}}>
                      <i className="fa-solid fa-print" style={{marginRight:6}}/>Imprimer
                    </button>
                    <button onClick={sauvegarder} disabled={saving} style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:saving?'#94a3b8':cfg.color,color:'white',fontWeight:700,cursor:'pointer',fontSize:14}}>
                      {saving?'Enregistrement...':'Enregistrer le dossier'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── HISTORIQUE ── */}
          {onglet==='historique' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h2 style={{fontWeight:900,fontSize:'1.2rem',color:'#0f172a',margin:0}}>
                  Historique patients
                </h2>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{fontSize:13,color:'#64748b'}}>Période :</span>
                  {[3,6].map(m => (
                    <button key={m} onClick={() => {setMoisFiltrer(m)}}
                      style={{padding:'6px 14px',borderRadius:8,border:`1.5px solid ${moisFiltrer===m?cfg.color:'#e2e8f0'}`,
                        background:moisFiltrer===m?cfg.bg:'white',color:moisFiltrer===m?cfg.color:'#64748b',
                        fontWeight:700,cursor:'pointer',fontSize:12}}>
                      {m} mois
                    </button>
                  ))}
                </div>
              </div>

              {loadingHist ? (
                <div style={{textAlign:'center',padding:40}}>
                  <div style={{width:32,height:32,borderRadius:'50%',border:`3px solid ${cfg.color}`,borderTopColor:'transparent',animation:'spin 0.8s linear infinite',margin:'0 auto'}}/>
                </div>
              ) : historique.length === 0 ? (
                <div style={{textAlign:'center',padding:48,color:'#94a3b8',background:'white',borderRadius:12,border:'1px solid #e2e8f0'}}>
                  <i className={`fa-solid ${cfg.icon}`} style={{fontSize:40,display:'block',marginBottom:12,opacity:0.2}}/>
                  Aucun patient dans les {moisFiltrer} derniers mois
                </div>
              ) : (
                <div>
                  <div style={{fontSize:13,color:'#64748b',marginBottom:12}}>{historique.length} patient(s) sur {moisFiltrer} mois</div>
                  {historique.map((h,i) => (
                    <div key={i} style={{background:'white',borderRadius:12,padding:14,border:'1px solid #e2e8f0',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}
                      onClick={() => { setCode(h.numero); rechercherPatient(); setOnglet('dossier') }}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14}}>{h.prenom} {h.nom}</div>
                        <div style={{fontSize:12,color:'#94a3b8',marginTop:2}}>
                          <span style={{fontFamily:'monospace'}}>{h.numero}</span>
                          {h.telephone && ` · ${h.telephone}`}
                        </div>
                        {h.notes && (
                          <div style={{fontSize:11,color:'#64748b',marginTop:4,fontStyle:'italic'}}>
                            {h.notes.slice(0,60)}{h.notes.length>60?'...':''}
                          </div>
                        )}
                      </div>
                      <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                        <div style={{fontWeight:700,color:cfg.color,fontSize:13}}>{fmtDate(h.date_visite)}</div>
                        <div style={{fontSize:11,color:'#94a3b8'}}>{fmtHeure(h.date_visite)}</div>
                        <div style={{marginTop:4,background:cfg.bg,color:cfg.color,padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:700}}>
                          {cfg.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFIL ── */}
          {onglet==='profil' && (
            <div style={{maxWidth:560,margin:'0 auto'}}>
              <h2 style={{fontWeight:900,fontSize:'1.2rem',color:'#0f172a',marginBottom:20}}>Mon profil</h2>

              {/* Photo */}
              <div style={{background:'white',borderRadius:14,padding:20,border:'1px solid #e2e8f0',marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:14,color:'#374151',marginBottom:14}}>Photo de profil</div>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <div style={{width:80,height:80,borderRadius:'50%',border:`3px solid ${cfg.color}`,overflow:'hidden',flexShrink:0,background:cfg.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {photoUrl
                      ? <img src={photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      : <i className={`fa-solid ${cfg.icon}`} style={{fontSize:32,color:cfg.color}}/>
                    }
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoUpload}/>
                    <button onClick={() => fileRef.current?.click()} style={{
                      padding:'9px 18px',borderRadius:8,border:`1.5px solid ${cfg.color}`,
                      background:cfg.bg,color:cfg.color,fontWeight:700,cursor:'pointer',fontSize:13,marginBottom:6,display:'block'
                    }}>
                      <i className="fa-solid fa-upload" style={{marginRight:6}}/>Choisir une photo
                    </button>
                    <div style={{fontSize:11,color:'#94a3b8'}}>JPG, PNG — max 2 MB</div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div style={{background:'white',borderRadius:14,padding:20,border:'1px solid #e2e8f0',marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:14,color:'#374151',marginBottom:14}}>Informations</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  <div>
                    <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',display:'block',marginBottom:4}}>Nom complet</label>
                    <div style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>{user?.nom}</div>
                  </div>
                  <div>
                    <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',display:'block',marginBottom:4}}>Spécialité</label>
                    <div style={{fontSize:14,color:'#374151'}}>{cfg.label}</div>
                  </div>
                  <div>
                    <label style={{fontSize:12,fontWeight:700,color:'#94a3b8',display:'block',marginBottom:4}}>Email</label>
                    <div style={{fontSize:13,color:'#64748b'}}>{(user as any)?.email || '—'}</div>
                  </div>
                </div>

                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Bio / Présentation</label>
                <textarea value={bio} onChange={e=>setBio(e.target.value)}
                  placeholder={`Présentez votre pratique en ${cfg.label.toLowerCase()}...`}
                  rows={4} style={{...inp,resize:'vertical',fontFamily:'inherit'}}/>
              </div>

              <div style={{display:'flex',gap:10}}>
                <button onClick={() => setShowPwd(true)} style={{
                  flex:1,padding:'11px',borderRadius:10,border:'1.5px solid #e2e8f0',
                  background:'white',fontWeight:700,cursor:'pointer',fontSize:13,color:'#374151'
                }}>
                  <i className="fa-solid fa-key" style={{marginRight:6}}/>Changer le mot de passe
                </button>
                <button onClick={sauvegarderProfil} disabled={savingProfil} style={{
                  flex:1,padding:'11px',borderRadius:10,border:'none',
                  background:savingProfil?'#94a3b8':cfg.color,color:'white',fontWeight:700,cursor:'pointer',fontSize:14
                }}>
                  {savingProfil?'Enregistrement...':'Sauvegarder le profil'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
    </>
  )
}
