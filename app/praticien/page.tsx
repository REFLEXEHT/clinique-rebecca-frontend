'use client'
import { useState, useEffect } from 'react'
import ChangePasswordModal from '@/components/ui/ChangePasswordModal'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

const SERVICE_CONFIG: Record<string, {label:string,color:string,bg:string,icon:string}> = {
  dentisterie: { label:'Dentisterie',    color:'#0d9488', bg:'#f0fdfa', icon:'fa-tooth' },
  physio:      { label:'Physiothérapie', color:'#d97706', bg:'#fffbeb', icon:'fa-person-walking' },
  optometrie:  { label:'Optométrie',     color:'#dc2626', bg:'#fef2f2', icon:'fa-glasses' },
}

export default function PraticienDirectPage() {
  const { user, isAuthenticated, loading , mustChangePassword, setMustChangePassword } = useAuth()
  const router = useRouter()
  const [queue, setQueue] = useState<any[]>([])
  const [loadingQueue, setLoadingQueue] = useState(true)
  const [onglet, setOnglet] = useState<'queue'|'consultation'>('queue')
  const [patientActif, setPatientActif] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const role = user?.role || ''
  const service = role === 'dentiste' ? 'dentisterie' : role === 'physio' ? 'physio' : role === 'optometrie' ? 'optometrie' : role
  const cfg = SERVICE_CONFIG[service] || { label: role, color:'#1641C8', bg:'#eff6ff', icon:'fa-user-doctor' }

  useEffect(() => {
    if (!loading && (!isAuthenticated || !['dentiste','physio','optometrie','admin'].includes(role))) {
      router.push('/login')
    }
  }, [isAuthenticated, role, loading, router])

  const loadQueue = () => {
    setLoadingQueue(true)
    api.get('/infirmier/queue').then(r => {
      const all = r.data?.patients || r.data || []
      // Patients payés qui viennent directement de la caisse pour ce service
      const filtered = all.filter((p: any) =>
        (p.service || p.specialite || '').toLowerCase().includes(service.toLowerCase()) &&
        (p.paiement_effectue || p.statut === 'paiement_effectue')
      )
      setQueue(filtered)
    }).catch(() => {}).finally(() => setLoadingQueue(false))
  }

  useEffect(() => {
    if (isAuthenticated) loadQueue()
    const interval = setInterval(loadQueue, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const ouvrirConsultation = async (patient: any) => {
    setPatientActif(patient)
    setNotes('')
    setOnglet('consultation')
  }

  const terminerConsultation = async () => {
    if (!patientActif) return
    setSaving(true)
    try {
      await api.put(`/infirmier/terminer-consultation/${patientActif.rdv_id || patientActif.id}`, {
        notes_praticien: notes,
        service,
      })
      toast.success('Consultation enregistrée')
      setPatientActif(null)
      setOnglet('queue')
      loadQueue()
    } catch {
      toast.error('Erreur enregistrement')
    } finally { setSaving(false) }
  }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div className="spinner"/></div>

  return (
  <>
  {mustChangePassword && (
    <ChangePasswordModal isFirstLogin={true} onClose={()=>setMustChangePassword(false)} />
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
          <button onClick={() => router.push('/login')} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:8,padding:'6px 12px',color:'white',cursor:'pointer',fontSize:12,fontWeight:600}}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:'white',borderBottom:'2px solid #f1f5f9',display:'flex',padding:'0 16px',gap:4}}>
        {[
          {k:'queue', label:`File d'attente (${queue.length})`},
          {k:'consultation', label:'Consultation en cours'},
        ].map(t => (
          <button key={t.k} onClick={() => setOnglet(t.k as any)} style={{
            padding:'12px 16px',border:'none',background:'transparent',cursor:'pointer',
            fontWeight:700,fontSize:13,
            color:onglet===t.k?cfg.color:'#64748b',
            borderBottom:onglet===t.k?`2px solid ${cfg.color}`:'2px solid transparent',
            marginBottom:-2
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{maxWidth:800,margin:'0 auto',padding:20}}>

        {/* FILE D'ATTENTE */}
        {onglet==='queue' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h2 style={{fontWeight:900,fontSize:'1.2rem',color:'#0f172a',margin:0}}>
                Patients en attente — {cfg.label}
              </h2>
              <button onClick={loadQueue} style={{background:cfg.bg,border:`1px solid ${cfg.color}`,borderRadius:8,padding:'6px 14px',color:cfg.color,cursor:'pointer',fontWeight:700,fontSize:12}}>
                <i className="fa-solid fa-rotate-right" style={{marginRight:6}}/>Actualiser
              </button>
            </div>

            {/* Important note */}
            <div style={{background:'#eff6ff',border:'1px solid #93c5fd',borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:'#1e40af'}}>
              <i className="fa-solid fa-info-circle" style={{marginRight:8}}/>
              Ces patients ont réglé leur paiement à la caisse et viennent directement en {cfg.label} — sans passer par l'infirmier.
            </div>

            {loadingQueue ? (
              <div style={{textAlign:'center',padding:40}}><div className="spinner" style={{margin:'0 auto'}}/></div>
            ) : queue.length === 0 ? (
              <div style={{textAlign:'center',padding:48,color:'#94a3b8'}}>
                <i className={`fa-solid ${cfg.icon}`} style={{fontSize:48,display:'block',marginBottom:12,opacity:0.2}}/>
                <div style={{fontWeight:600,marginBottom:4}}>Aucun patient en attente</div>
                <div style={{fontSize:12}}>Les patients payés apparaissent ici automatiquement</div>
              </div>
            ) : queue.map((p: any, i: number) => (
              <div key={i} style={{background:'white',borderRadius:12,padding:16,border:'1px solid #e2e8f0',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15}}>{p.patient_nom}</div>
                  <div style={{fontSize:12,color:'#94a3b8',marginTop:3}}>
                    #{p.patient_numero} · Ticket {p.ticket} · {new Date(p.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                  </div>
                  <div style={{marginTop:6}}>
                    <span style={{background:'#f0fdf4',color:'#16a34a',padding:'2px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>
                      Payé
                    </span>
                    {p.priorite === 'urgent' && (
                      <span style={{background:'#fef2f2',color:'#dc2626',padding:'2px 10px',borderRadius:99,fontSize:11,fontWeight:700,marginLeft:6}}>
                        URGENT
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => ouvrirConsultation(p)} style={{
                  background:cfg.color,color:'white',border:'none',borderRadius:10,
                  padding:'10px 18px',fontWeight:700,cursor:'pointer',fontSize:14
                }}>
                  Commencer
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CONSULTATION */}
        {onglet==='consultation' && (
          <div>
            {!patientActif ? (
              <div style={{textAlign:'center',padding:60,color:'#94a3b8'}}>
                <i className="fa-solid fa-user-doctor" style={{fontSize:48,display:'block',marginBottom:12,opacity:0.2}}/>
                Aucune consultation en cours — choisissez un patient dans la file d'attente
              </div>
            ) : (
              <div>
                <div style={{background:'white',borderRadius:14,padding:20,border:'1px solid #e2e8f0',marginBottom:16}}>
                  <div style={{fontWeight:900,fontSize:'1.1rem',color:'#0f172a',marginBottom:4}}>{patientActif.patient_nom}</div>
                  <div style={{fontSize:13,color:'#94a3b8'}}>#{patientActif.patient_numero} · {cfg.label}</div>
                  <div style={{marginTop:8}}>
                    <span style={{background:'#f0fdf4',color:'#16a34a',padding:'3px 12px',borderRadius:99,fontSize:12,fontWeight:700}}>
                      Paiement confirmé
                    </span>
                  </div>
                </div>

                <div style={{background:'white',borderRadius:14,padding:20,border:'1px solid #e2e8f0',marginBottom:16}}>
                  <label style={{display:'block',fontWeight:700,fontSize:13,color:'#374151',marginBottom:8}}>
                    Notes de consultation / Traitement
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder={`Notes de ${cfg.label.toLowerCase()}...`}
                    rows={8}
                    style={{width:'100%',padding:'10px 12px',borderRadius:9,border:'1.5px solid #e2e8f0',fontSize:14,resize:'vertical',boxSizing:'border-box'}}
                  />
                </div>

                <div style={{display:'flex',gap:10}}>
                  <button onClick={() => {setPatientActif(null);setOnglet('queue')}} style={{
                    flex:1,padding:'12px',borderRadius:10,border:'2px solid #e2e8f0',
                    background:'white',color:'#374151',fontWeight:700,cursor:'pointer',fontSize:14
                  }}>
                    Annuler
                  </button>
                  <button onClick={terminerConsultation} disabled={saving} style={{
                    flex:2,padding:'12px',borderRadius:10,border:'none',
                    background:cfg.color,color:'white',fontWeight:700,cursor:'pointer',fontSize:14,opacity:saving?0.6:1
                  }}>
                    {saving ? 'Enregistrement...' : 'Terminer la consultation'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </>
)
