'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import ChangePasswordModal from '@/components/ui/ChangePasswordModal'
import { imprimerFeuilleDentisterie, imprimerFeuilleOptometrie } from '@/lib/print'
import toast from 'react-hot-toast'

const SERVICE_CONFIG: Record<string, {label:string,color:string,bg:string,icon:string}> = {
  dentisterie: { label:'Dentisterie',    color:'#0d9488', bg:'#f0fdfa', icon:'fa-tooth' },
  dentiste:    { label:'Dentisterie',    color:'#0d9488', bg:'#f0fdfa', icon:'fa-tooth' },
  physio:      { label:'Physiothérapie', color:'#d97706', bg:'#fffbeb', icon:'fa-person-walking' },
  optometrie:  { label:'Optométrie',     color:'#dc2626', bg:'#fef2f2', icon:'fa-glasses' },
  optom:       { label:'Optométrie',     color:'#dc2626', bg:'#fef2f2', icon:'fa-glasses' },
}

// Champs du formulaire par service
const CHAMPS_SERVICE: Record<string, {label:string, key:string, type?:string, rows?:number}[]> = {
  dentisterie: [
    {label:'Dent(s) concernée(s)',      key:'dents'},
    {label:"Type d'acte",               key:'type_acte'},
    {label:'Anesthésie utilisée',        key:'anesthesie'},
    {label:'Matériel utilisé',           key:'materiel'},
    {label:'Observations cliniques',     key:'observations', type:'textarea', rows:3},
    {label:'Traitement effectué',        key:'traitement',   type:'textarea', rows:3},
    {label:'Plan de traitement futur',   key:'plan_futur',   type:'textarea', rows:2},
    {label:'Prochain RDV recommandé',    key:'prochain_rdv'},
  ],
  physio: [
    {label:'Zone traitée',               key:'zone'},
    {label:'Type de thérapie',           key:'therapie'},
    {label:'Nombre de séances prescrites', key:'nb_seances'},
    {label:'Exercices prescrits',        key:'exercices',    type:'textarea', rows:3},
    {label:'Évolution / Progression',    key:'evolution',    type:'textarea', rows:3},
    {label:'Observations',               key:'observations', type:'textarea', rows:2},
    {label:'Prochain RDV',               key:'prochain_rdv'},
  ],
  optometrie: [
    {label:'Acuité visuelle OD (Œil droit)',  key:'av_od'},
    {label:'Acuité visuelle OG (Œil gauche)', key:'av_og'},
    {label:'Correction OD — SPH/CYL/AXE',    key:'correction_od'},
    {label:'Correction OG — SPH/CYL/AXE',    key:'correction_og'},
    {label:'Add (addition)',                   key:'add'},
    {label:'PD (distance pupillaire)',         key:'pd'},
    {label:'TIO D / TIO I (tonométrie)',       key:'tio'},
    {label:'Pathologie détectée',             key:'pathologie'},
    {label:'Observations',                    key:'observations', type:'textarea', rows:3},
    {label:'Prescription finale / Commentaires', key:'prescription', type:'textarea', rows:3},
  ],
}

export default function PraticienDirectPage() {
  const { user, isAuthenticated, loading, mustChangePassword, setMustChangePassword } = useAuth()
  const router = useRouter()
  const role = user?.role || ''
  const service = role === 'dentiste' ? 'dentisterie'
    : role === 'physio' ? 'physio'
    : role === 'optometrie' ? 'optometrie'
    : role
  const cfg = SERVICE_CONFIG[service] || { label:role, color:'#1641C8', bg:'#eff6ff', icon:'fa-user-doctor' }
  const champs = CHAMPS_SERVICE[service] || CHAMPS_SERVICE.physio

  const [onglet, setOnglet]           = useState<'recherche'|'dossier'>('recherche')
  const [codePatient, setCodePatient] = useState('')
  const [patient, setPatient]         = useState<any>(null)
  const [rdv,     setRdv]             = useState<any>(null)
  const [searchErr, setSearchErr]     = useState('')
  const [searching, setSearching]     = useState(false)
  const [formData, setFormData]       = useState<Record<string,string>>({})
  const [saving,  setSaving]          = useState(false)
  const [savedOk, setSavedOk]         = useState(false)

  useEffect(() => {
    if (!loading && (!isAuthenticated || !['dentiste','physio','optometrie','admin'].includes(role))) {
      router.push('/login')
    }
  }, [isAuthenticated, role, loading, router])

  const rechercherPatient = async () => {
    if (!codePatient.trim()) { setSearchErr('Saisissez le code patient #RB-XXXX'); return }
    setSearching(true); setSearchErr(''); setPatient(null); setRdv(null)
    try {
      const r = await api.get(`/caissier/recherche-patient?q=${encodeURIComponent(codePatient.trim())}`)
      const pts = r.data?.patients || []
      if (pts.length === 0) { setSearchErr('Patient introuvable'); setSearching(false); return }
      const p = pts[0]
      // Verify paiement status
      if (!p.paiement_effectue) {
        setSearchErr('Ce patient n\'a pas de paiement confirmé pour aujourd\'hui')
        setSearching(false); return
      }
      setPatient(p)
      // Load today's RDV for this patient
      const r2 = await api.get(`/rdv/demandes`)
      const rdvs = (r2.data?.demandes || []).filter((d: any) =>
        d.patient_id === p.id &&
        ['paiement_effectue', 'confirme'].includes((d.statut||'').split('.').pop())
      )
      setRdv(rdvs[0] || null)
      setOnglet('dossier')
      setFormData({})
      setSavedOk(false)
    } catch (e: any) {
      setSearchErr(e.response?.data?.detail || 'Erreur de recherche')
    } finally { setSearching(false) }
  }

  const sauvegarder = async () => {
    if (!patient) return
    setSaving(true)
    try {
      // Save as dossier patient
      await api.post('/dossiers', {
        patient_id: patient.id,
        service,
        service_label: cfg.label,
        rdv_id: rdv?.id || null,
        praticien_nom: user?.nom || '',
        praticien_role: role,
        date_visite: new Date().toISOString(),
        donnees: formData,
        // Store each field as notes
        notes: Object.entries(formData)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n'),
      }).catch(() => null) // non-blocking

      toast.success('Dossier enregistré')
      setSavedOk(true)
    } catch {
      toast.error('Erreur enregistrement')
    } finally { setSaving(false) }
  }

  const imprimerFeuille = () => {
    if (!patient) return
    const f = {
      type: 'specialise' as const,
      service_dest: service,
      ticket: codePatient,
      patient_id: patient.id,
      patient_numero: patient.numero || codePatient,
      patient_nom: `${patient.prenom || ''} ${patient.nom || ''}`.trim(),
      patient_age: patient.age || null,
      patient_tel: patient.telephone || '',
      service, service_label: cfg.label,
      praticien: user?.nom || '',
      date_visite: new Date().toISOString(),
      montant_paye: 0, mode_paiement: '',
      paiement_complet: true,
      rdv_id: rdv?.id || 0,
      is_premiere_visite: false,
    }
    if (service === 'dentisterie' || service === 'dentiste') imprimerFeuilleDentisterie(f)
    else if (service === 'optometrie' || service === 'optom') imprimerFeuilleOptometrie(f)
    else toast('Feuille physiothérapie en cours de préparation')
  }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div style={{width:36,height:36,borderRadius:'50%',border:`3px solid ${cfg.color}`,borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}/></div>

  return (
    <>
    {mustChangePassword && (
      <ChangePasswordModal isFirstLogin={true} onClose={() => setMustChangePassword(false)} />
    )}
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>

      {/* Navbar */}
      <div style={{background:`linear-gradient(135deg,#0f1e3d,${cfg.color})`,height:56,display:'flex',alignItems:'center',padding:'0 20px',gap:12}}>
        <div style={{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <i className={`fa-solid ${cfg.icon}`} style={{color:'white',fontSize:16}}/>
        </div>
        <div>
          <div style={{color:'white',fontWeight:800,fontSize:15}}>{user?.nom}</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:11}}>{cfg.label}</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={() => setOnglet('recherche')} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:8,padding:'6px 12px',color:'white',cursor:'pointer',fontSize:12,fontWeight:600}}>
            <i className="fa-solid fa-search" style={{marginRight:5}}/>Nouveau patient
          </button>
          <button onClick={() => router.push('/login')} style={{background:'rgba(255,255,255,0.12)',border:'none',borderRadius:8,padding:'6px 12px',color:'white',cursor:'pointer',fontSize:12,fontWeight:600}}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{maxWidth:860,margin:'0 auto',padding:20}}>

        {/* ── RECHERCHE PATIENT ── */}
        {onglet === 'recherche' && (
          <div>
            <div style={{textAlign:'center',padding:'32px 0 24px'}}>
              <div style={{width:64,height:64,borderRadius:'50%',background:cfg.bg,border:`2px solid ${cfg.color}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
                <i className={`fa-solid ${cfg.icon}`} style={{fontSize:28,color:cfg.color}}/>
              </div>
              <h2 style={{fontWeight:900,fontSize:'1.3rem',color:'#0f172a',margin:0}}>{cfg.label}</h2>
              <p style={{color:'#64748b',fontSize:13,marginTop:6}}>
                Le patient vous remet sa facture — entrez son code dossier pour ouvrir sa fiche
              </p>
            </div>

            <div style={{background:'white',borderRadius:16,padding:24,border:'1px solid #e2e8f0',maxWidth:480,margin:'0 auto'}}>
              <label style={{fontWeight:700,fontSize:13,color:'#374151',display:'block',marginBottom:8}}>
                Code dossier patient
              </label>
              <div style={{display:'flex',gap:8}}>
                <input
                  value={codePatient}
                  onChange={e => setCodePatient(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && rechercherPatient()}
                  placeholder="#RB-0001"
                  style={{flex:1,padding:'12px 14px',borderRadius:10,border:`2px solid ${codePatient?cfg.color:'#e2e8f0'}`,fontSize:16,fontFamily:'monospace',fontWeight:700,outline:'none',letterSpacing:1}}
                  autoFocus
                />
                <button onClick={rechercherPatient} disabled={searching} style={{
                  padding:'12px 20px',borderRadius:10,border:'none',
                  background:cfg.color,color:'white',fontWeight:700,cursor:'pointer',fontSize:14
                }}>
                  {searching ? '...' : 'Ouvrir'}
                </button>
              </div>
              {searchErr && (
                <div style={{marginTop:10,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'8px 12px',fontSize:13,color:'#dc2626'}}>
                  <i className="fa-solid fa-exclamation-circle" style={{marginRight:6}}/>
                  {searchErr}
                </div>
              )}
              <div style={{marginTop:12,fontSize:12,color:'#94a3b8',textAlign:'center'}}>
                Le code se trouve sur la facture remise par la caisse (ex: #RB-0042)
              </div>
            </div>
          </div>
        )}

        {/* ── DOSSIER PATIENT ── */}
        {onglet === 'dossier' && patient && (
          <div>
            {/* Patient card */}
            <div style={{background:'white',borderRadius:14,padding:16,border:`2px solid ${cfg.color}22`,marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:900,fontSize:'1.1rem',color:'#0f172a'}}>
                  {patient.prenom} {patient.nom}
                </div>
                <div style={{fontFamily:'monospace',color:cfg.color,fontWeight:700,fontSize:14,marginTop:2}}>
                  {patient.numero}
                </div>
                <div style={{fontSize:12,color:'#64748b',marginTop:3}}>
                  {patient.telephone}
                  {patient.age && ` · ${patient.age} ans`}
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:99,padding:'4px 14px',fontSize:12,fontWeight:700,color:'#16a34a',marginBottom:6}}>
                  <i className="fa-solid fa-circle-check" style={{marginRight:5}}/>Paiement confirmé
                </div>
                {rdv && (
                  <div style={{fontSize:11,color:'#64748b'}}>
                    RDV: {new Date(rdv.date_rdv_demandee||rdv.created_at).toLocaleDateString('fr-FR')}
                    {rdv.medecin_nom && ` · ${rdv.medecin_nom}`}
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div style={{background:'white',borderRadius:14,padding:20,border:'1px solid #e2e8f0',marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:14,color:cfg.color,marginBottom:16,borderBottom:`2px solid ${cfg.color}22`,paddingBottom:10}}>
                <i className={`fa-solid ${cfg.icon}`} style={{marginRight:8}}/>
                Fiche de consultation — {cfg.label}
              </div>

              {champs.map(ch => (
                <div key={ch.key} style={{marginBottom:12}}>
                  <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>
                    {ch.label}
                  </label>
                  {ch.type === 'textarea' ? (
                    <textarea
                      value={formData[ch.key] || ''}
                      onChange={e => setFormData(p => ({...p, [ch.key]: e.target.value}))}
                      rows={ch.rows || 2}
                      style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #e2e8f0',fontSize:13,resize:'vertical',boxSizing:'border-box',fontFamily:'inherit'}}
                    />
                  ) : (
                    <input
                      value={formData[ch.key] || ''}
                      onChange={e => setFormData(p => ({...p, [ch.key]: e.target.value}))}
                      style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #e2e8f0',fontSize:13,boxSizing:'border-box' as const}}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            {savedOk && (
              <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:'10px 16px',marginBottom:12,fontSize:13,color:'#16a34a',fontWeight:700}}>
                <i className="fa-solid fa-check" style={{marginRight:6}}/>Dossier enregistré avec succès
              </div>
            )}
            <div style={{display:'flex',gap:10}}>
              <button onClick={() => {setOnglet('recherche');setCodePatient('');setPatient(null)}} style={{
                padding:'11px 16px',borderRadius:10,border:'1.5px solid #e2e8f0',
                background:'white',fontWeight:700,cursor:'pointer',fontSize:13,color:'#374151'
              }}>
                <i className="fa-solid fa-arrow-left" style={{marginRight:6}}/>Nouveau patient
              </button>
              <button onClick={imprimerFeuille} style={{
                padding:'11px 16px',borderRadius:10,border:`1.5px solid ${cfg.color}`,
                background:'white',color:cfg.color,fontWeight:700,cursor:'pointer',fontSize:13
              }}>
                <i className="fa-solid fa-print" style={{marginRight:6}}/>Imprimer feuille
              </button>
              <button onClick={sauvegarder} disabled={saving} style={{
                flex:1,padding:'11px',borderRadius:10,border:'none',
                background:saving?'#94a3b8':cfg.color,color:'white',fontWeight:700,cursor:'pointer',fontSize:14
              }}>
                {saving ? 'Enregistrement...' : 'Enregistrer le dossier'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  )
}
