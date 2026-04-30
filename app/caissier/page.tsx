'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { LogOut, Printer, Search, Plus, TrendingUp, FileText } from 'lucide-react'

const SERVICES_TARIFS = [
  { nom:'Consultation Médecine interne',   prix:4000 },
  { nom:'Consultation Gynécologie',        prix:4500 },
  { nom:'Consultation Pédiatrie',          prix:3500 },
  { nom:'Consultation Neurologie',         prix:6000 },
  { nom:'Consultation Chirurgie',          prix:5000 },
  { nom:'Consultation Orthopédie',         prix:6500 },
  { nom:'Consultation Dentisterie',        prix:2500 },
  { nom:'Consultation Physiothérapie',     prix:3000 },
  { nom:'Consultation Optométrie',         prix:2500 },
  { nom:'Examen Laboratoire',              prix:1500 },
  { nom:'Médicaments Pharmacie',           prix:0    },
  { nom:'Observation (par jour)',          prix:8000 },
  { nom:'Hospitalisation (par jour)',      prix:15000},
  { nom:'Chambre Maternité',              prix:12000},
  { nom:'Salle SOP (chirurgie)',           prix:50000},
  { nom:'Geste Médical',                  prix:2000 },
]

export default function CaissierPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [onglet,     setOnglet]     = useState<'paiement'|'nouveau'|'decaissements'|'documents'|'rapport'>('paiement')
  const [decaissements, setDecaissements] = useState<any[]>([])
  const [formDec, setFormDec] = useState({description:'', montant:0, categorie:'fournitures'})
  const [docSearch, setDocSearch] = useState('')
  const [docPatient, setDocPatient] = useState<any>(null)
  const [docApercu, setDocApercu] = useState<any>(null)
  const [searchId,   setSearchId]   = useState('')
  const [patient,    setPatient]    = useState<any>(null)
  const [paiements,  setPaiements]  = useState<any[]>([])
  const [totalJour,  setTotalJour]  = useState(0)
  const [rapport,    setRapport]    = useState('')
  const [loadRapport,setLoadRapport]= useState(false)
  const [recu,       setRecu]       = useState<any>(null)
  const [form, setForm] = useState({
    nom:'', prenom:'', age:'', adresse:'', telephone:'', email:'',
    contact_urgence:'', type_visite:'premiere' as 'premiere'|'rdv',
    service: SERVICES_TARIFS[0].nom, montant: SERVICES_TARIFS[0].prix,
    mode_paiement:'especes' as string, reference:''
  })

  useEffect(() => {
    if (!loading && (!isAuthenticated || !['caissier','admin'].includes(user?.role||'')))
      router.push('/login')
  }, [isAuthenticated, user, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/caissier/paiements-jour').then(r => {
      setPaiements(r.data?.paiements || [])
      setTotalJour(r.data?.total || 0)
    }).catch(()=>{})
  }, [isAuthenticated])

  const chercherPatient = async () => {
    const id = searchId.trim().toUpperCase()
    if (!id) return
    try {
      const r = await api.get(`/patients/par-numero/${id}`)
      setPatient(r.data)
    } catch { toast.error('Patient introuvable') }
  }

  const enregistrerPaiement = async () => {
    if (!patient) { toast.error('Recherchez un patient d\'abord'); return }
    try {
      const r = await api.post('/caissier/paiement', {
        patient_id: patient.id,
        service: form.service,
        montant: form.montant,
        mode_paiement: form.mode_paiement,
        reference: form.reference,
      })
      setRecu(r.data)
      toast.success('Paiement enregistré — reçu généré ✓')
      setPaiements(prev => [r.data, ...prev])
      setTotalJour(prev => prev + form.montant)
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur') }
  }

  const creerNouveauPatient = async () => {
    if (!form.nom || !form.prenom) { toast.error('Nom et prénom requis'); return }
    try {
      const r = await api.post('/caissier/nouveau-patient', {
        ...form, is_premiere_visite: form.type_visite === 'premiere'
      })
      setPatient(r.data.patient)
      toast.success(`Patient créé — ID: ${r.data.patient?.numero}`)
      setOnglet('paiement')
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur') }
  }

  const genererRapportIA = async () => {
    setLoadRapport(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Génère un rapport de caisse journalier pour la Clinique de la Rebecca. Données: Total encaissé: ${totalJour} HTG, ${paiements.length} transactions, Services: ${paiements.map((p:any)=>p.service).join(', ')}. Format: résumé exécutif, services les plus demandés, total par mode de paiement, recommandations. 200 mots max.`
          }]
        })
      })
      const data = await res.json()
      setRapport(data.content?.[0]?.text || '')
    } catch { setRapport('Erreur génération') }
    finally { setLoadRapport(false) }
  }

  const imprimerRecu = () => window.print()

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #d97706',borderTopColor:'transparent',animation:'spin 1s linear infinite'}}/></div>

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      {/* Navbar */}
      <div style={{background:'linear-gradient(135deg,#0f1e3d,#d97706)',height:58,display:'flex',alignItems:'center',padding:'0 24px',gap:14}}>
        <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>💳</div>
        <div>
          <div style={{color:'white',fontWeight:800,fontSize:14}}>{user?.nom}</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:11}}>Caissier(ère)</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <Link href="/caissier/documents" style={{background:'rgba(255,255,255,0.1)',color:'white',textDecoration:'none',borderRadius:8,padding:'6px 12px',fontSize:12,fontWeight:600}}>
            <Printer size={12} style={{marginRight:4}}/> Imprimer docs
          </Link>
          <button onClick={()=>{logout();router.push('/')}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
            <LogOut size={13}/> Déconnexion
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div style={{background:'white',borderBottom:'1px solid #e2e8f0',padding:'0 24px',display:'flex',gap:4}}>
        {[
          {k:'paiement',       label:'💰 Paiement'},
          {k:'nouveau',        label:'👤 Nouveau patient'},
          {k:'decaissements',  label:'📤 Décaissements'},
          {k:'documents',      label:'🖨️ Documents'},
          {k:'rapport',        label:'📊 Rapport IA'},
        ].map(t => (
          <button key={t.k} onClick={()=>setOnglet(t.k as any)} style={{
            padding:'13px 16px',border:'none',background:'transparent',cursor:'pointer',
            fontWeight:600,fontSize:13,color:onglet===t.k?'#d97706':'#64748b',
            borderBottom:onglet===t.k?'2px solid #d97706':'2px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 20px'}}>

        {/* Stats jour */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
          {[
            {icon:'💰',label:'Total encaissé',val:`${totalJour.toLocaleString('fr-FR')} HTG`,bg:'#f0fdf4',c:'#16a34a'},
            {icon:'📋',label:'Transactions',val:paiements.length,bg:'#eff6ff',c:'#1641C8'},
            {icon:'📅',label:'Date',val:new Date().toLocaleDateString('fr-FR'),bg:'#fff7ed',c:'#d97706'},
          ].map(s => (
            <div key={s.label} style={{background:s.bg,borderRadius:14,padding:18,border:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:12}}>
              <div style={{fontSize:28}}>{s.icon}</div>
              <div>
                <div style={{fontWeight:900,fontSize:'1.2rem',color:s.c}}>{s.val}</div>
                <div style={{fontSize:12,color:'#64748b'}}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── PAIEMENT ───────────────────────────────────────────── */}
        {onglet==='paiement' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div>
              {/* Recherche patient */}
              <div style={{background:'white',borderRadius:16,padding:20,border:'1px solid #e2e8f0',marginBottom:16}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:12}}>🔍 Chercher patient</h3>
                <div style={{display:'flex',gap:8}}>
                  <input value={searchId} onChange={e=>setSearchId(e.target.value.toUpperCase())}
                    onKeyDown={e=>e.key==='Enter'&&chercherPatient()}
                    placeholder="#RB-0042 ou NOM"
                    style={{flex:1,padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,fontFamily:'monospace'}}/>
                  <button onClick={chercherPatient} style={{background:'#d97706',color:'white',border:'none',borderRadius:8,padding:'10px 16px',fontWeight:700,cursor:'pointer'}}>
                    <Search size={14}/>
                  </button>
                </div>
                {patient && (
                  <div style={{marginTop:10,background:'#f0fdf4',borderRadius:8,padding:'8px 12px',fontSize:13}}>
                    <strong>{patient.nom}</strong> · <span style={{fontFamily:'monospace',color:'#16a34a'}}>{patient.numero}</span>
                  </div>
                )}
              </div>

              {/* Service + paiement */}
              <div style={{background:'white',borderRadius:16,padding:20,border:'1px solid #e2e8f0'}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:14}}>💳 Enregistrer paiement</h3>
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Service *</label>
                  <select value={form.service} onChange={e=>{
                    const tarif = SERVICES_TARIFS.find(t=>t.nom===e.target.value)
                    setForm(p=>({...p,service:e.target.value,montant:tarif?.prix||0}))
                  }} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,background:'white'}}>
                    {SERVICES_TARIFS.map(t => <option key={t.nom} value={t.nom}>{t.nom} {t.prix>0?`— ${t.prix.toLocaleString()} HTG`:''}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Montant (HTG) *</label>
                  <input type="number" value={form.montant} onChange={e=>setForm(p=>({...p,montant:parseInt(e.target.value)||0}))}
                    style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,fontWeight:700,boxSizing:'border-box' as const}}/>
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Mode de paiement *</label>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                    {['especes','moncash','natcash','carte'].map(m => (
                      <button key={m} type="button" onClick={()=>setForm(p=>({...p,mode_paiement:m}))} style={{
                        padding:'8px',borderRadius:8,border:`2px solid ${form.mode_paiement===m?'#d97706':'#e2e8f0'}`,
                        background:form.mode_paiement===m?'#fff7ed':'white',fontWeight:600,fontSize:12,cursor:'pointer',
                        color:form.mode_paiement===m?'#d97706':'#64748b'
                      }}>{m.charAt(0).toUpperCase()+m.slice(1)}</button>
                    ))}
                  </div>
                </div>
                {['moncash','natcash'].includes(form.mode_paiement) && (
                  <div style={{marginBottom:14}}>
                    <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Référence transaction</label>
                    <input value={form.reference} onChange={e=>setForm(p=>({...p,reference:e.target.value}))}
                      placeholder="Ex: MNC-2026-xxxx"
                      style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,boxSizing:'border-box' as const}}/>
                  </div>
                )}
                <button onClick={enregistrerPaiement} disabled={!patient} style={{width:'100%',background:'linear-gradient(135deg,#d97706,#b45309)',color:'white',border:'none',borderRadius:10,padding:'13px',fontWeight:700,cursor:'pointer',fontSize:15,opacity:!patient?0.5:1}}>
                  ✓ Enregistrer le paiement
                </button>
              </div>
            </div>

            {/* Reçu / Historique */}
            <div>
              {recu && (
                <div style={{background:'white',borderRadius:16,padding:20,border:'2px solid #d97706',marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <h3 style={{fontWeight:700,fontSize:15,margin:0}}>🧾 Reçu généré</h3>
                    <button onClick={imprimerRecu} style={{background:'#d97706',color:'white',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
                      <Printer size={12}/> Imprimer
                    </button>
                  </div>
                  <div style={{background:'#f8fafc',borderRadius:8,padding:14,fontSize:13}}>
                    <div style={{textAlign:'center',fontWeight:900,marginBottom:10}}>CLINIQUE DE LA REBECCA</div>
                    <div style={{borderTop:'1px dashed #d1d5db',paddingTop:10}}>
                      <div>Patient: <strong>{patient?.nom}</strong></div>
                      <div>ID: <span style={{fontFamily:'monospace'}}>{patient?.numero}</span></div>
                      <div>Service: {form.service}</div>
                      <div>Montant: <strong style={{color:'#16a34a'}}>{form.montant.toLocaleString()} HTG</strong></div>
                      <div>Paiement: {form.mode_paiement}</div>
                      <div>Date: {new Date().toLocaleString('fr-FR')}</div>
                      {recu.recu_numero && <div>N° reçu: {recu.recu_numero}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions du jour */}
              <div style={{background:'white',borderRadius:16,padding:20,border:'1px solid #e2e8f0',maxHeight:400,overflowY:'auto'}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:14}}>📋 Transactions du jour</h3>
                {paiements.length === 0 ? (
                  <p style={{color:'#94a3b8',textAlign:'center',padding:20}}>Aucune transaction aujourd'hui</p>
                ) : paiements.map((p:any,i:number) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f1f5f9',fontSize:13}}>
                    <div>
                      <div style={{fontWeight:600}}>{p.patient_nom || p.patient_id}</div>
                      <div style={{color:'#64748b',fontSize:12}}>{p.service}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontWeight:700,color:'#16a34a'}}>{(p.montant||0).toLocaleString()} HTG</div>
                      <div style={{color:'#94a3b8',fontSize:11}}>{p.mode_paiement}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── NOUVEAU PATIENT ────────────────────────────────────── */}
        {onglet==='nouveau' && (
          <div style={{background:'white',borderRadius:16,padding:24,border:'1px solid #e2e8f0'}}>
            <h2 style={{fontWeight:800,fontSize:'1.2rem',color:'#0f172a',marginBottom:6}}>Créer un nouveau dossier patient</h2>
            <p style={{color:'#64748b',fontSize:13,marginBottom:20}}>Un ID unique sera attribué automatiquement. Le dossier suit le patient tout au long de son parcours.</p>

            {/* Type de visite */}
            <div style={{display:'flex',gap:10,marginBottom:20}}>
              {[
                {k:'premiere',label:'🆕 Première consultation'},
                {k:'rdv',    label:'📅 Rendez-vous'},
              ].map(t => (
                <button key={t.k} type="button" onClick={()=>setForm(p=>({...p,type_visite:t.k as any}))} style={{
                  flex:1,padding:'12px',borderRadius:12,border:`2px solid ${form.type_visite===t.k?'#1641C8':'#e2e8f0'}`,
                  background:form.type_visite===t.k?'#eff6ff':'white',fontWeight:700,fontSize:14,cursor:'pointer',
                  color:form.type_visite===t.k?'#1641C8':'#64748b'
                }}>{t.label}</button>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              {[
                {k:'prenom',label:'Prénom *',ph:'Jean'},
                {k:'nom',  label:'NOM *',  ph:'PIERRE'},
                {k:'age',  label:'Âge',    ph:'35'},
                {k:'telephone',label:'Téléphone *',ph:'+509 xxxx-xxxx'},
                {k:'adresse',label:'Adresse',ph:'Pétion-Ville, Haïti'},
                {k:'email',label:'Email',ph:'jean@email.com'},
                {k:'contact_urgence',label:'Contact d\'urgence',ph:'Marie PIERRE - 3890-1234'},
              ].map(f => (
                <div key={f.k} style={{gridColumn:f.k==='contact_urgence'?'1/-1':'auto'}}>
                  <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>{f.label}</label>
                  <input value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}
                    placeholder={f.ph}
                    style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #d1d5db',fontSize:14,boxSizing:'border-box' as const}}/>
                </div>
              ))}
            </div>

            <button onClick={creerNouveauPatient} disabled={!form.nom||!form.prenom} style={{
              marginTop:20,width:'100%',background:'linear-gradient(135deg,#1641C8,#0d9488)',
              color:'white',border:'none',borderRadius:12,padding:'14px',fontWeight:700,
              cursor:'pointer',fontSize:15,opacity:(!form.nom||!form.prenom)?0.5:1
            }}>
              ✓ Créer le dossier patient
            </button>
          </div>
        )}

        {/* ── RAPPORT IA ─────────────────────────────────────────── */}
        {onglet==='rapport' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontWeight:900,fontSize:'1.3rem',color:'#0f172a',margin:0}}>📊 Rapport journalier automatique</h2>
              <button onClick={genererRapportIA} disabled={loadRapport} style={{background:'linear-gradient(135deg,#d97706,#b45309)',color:'white',border:'none',borderRadius:10,padding:'10px 20px',fontWeight:700,cursor:'pointer',fontSize:14}}>
                {loadRapport?'⏳ Génération...':'🤖 Générer rapport IA'}
              </button>
            </div>

            {rapport ? (
              <div style={{background:'white',borderRadius:16,padding:28,border:'1px solid #e2e8f0',marginBottom:20}}>
                <div style={{fontWeight:700,color:'#d97706',marginBottom:12}}>📋 Rapport de caisse — {new Date().toLocaleDateString('fr-FR')}</div>
                <div style={{fontSize:14,color:'#374151',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{rapport}</div>
                <button onClick={()=>window.print()} style={{marginTop:16,background:'#d97706',color:'white',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:700,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6}}>
                  <Printer size={13}/> Imprimer le rapport
                </button>
              </div>
            ) : (
              <div style={{background:'#f8fafc',borderRadius:16,padding:48,textAlign:'center',border:'1px dashed #e2e8f0'}}>
                <TrendingUp size={40} color="#94a3b8" style={{marginBottom:12}}/>
                <p style={{color:'#64748b'}}>Cliquez "Générer rapport IA" pour un rapport automatique des transactions du jour.</p>
              </div>
            )}

            {/* Résumé transactions */}
            <div style={{background:'white',borderRadius:16,padding:20,border:'1px solid #e2e8f0'}}>
              <div style={{fontWeight:700,marginBottom:14}}>Récapitulatif du {new Date().toLocaleDateString('fr-FR')}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                <div style={{background:'#f0fdf4',borderRadius:10,padding:14,textAlign:'center'}}>
                  <div style={{fontWeight:900,fontSize:'1.5rem',color:'#16a34a'}}>{totalJour.toLocaleString()} HTG</div>
                  <div style={{fontSize:12,color:'#64748b'}}>Total encaissé</div>
                </div>
                <div style={{background:'#eff6ff',borderRadius:10,padding:14,textAlign:'center'}}>
                  <div style={{fontWeight:900,fontSize:'1.5rem',color:'#1641C8'}}>{paiements.length}</div>
                  <div style={{fontSize:12,color:'#64748b'}}>Transactions</div>
                </div>
              </div>
              {/* Breakdown par mode paiement */}
              {['especes','moncash','natcash','carte'].map(mode => {
                const total = paiements.filter((p:any)=>p.mode_paiement===mode).reduce((s:number,p:any)=>s+(p.montant||0),0)
                if (!total) return null
                return (
                  <div key={mode} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9',fontSize:13}}>
                    <span style={{color:'#374151',textTransform:'capitalize'}}>{mode}</span>
                    <span style={{fontWeight:700,color:'#0f172a'}}>{total.toLocaleString()} HTG</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
