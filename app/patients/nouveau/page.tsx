'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

const SERVICES = [
  {id:'clinique',    label:'Clinique Ext.',  color:'#1641C8'},
  {id:'maternite',   label:'Maternite',      color:'#db2777'},
  {id:'dentisterie', label:'Dentisterie',    color:'#0d9488'},
  {id:'physio',      label:'Physiotherapie', color:'#d97706'},
  {id:'optometrie',  label:'Optometrie',     color:'#dc2626'},
  {id:'labo',        label:'Laboratoire',    color:'#7c3aed'},
  {id:'pharmacie',   label:'Pharmacie',      color:'#16a34a'},
  {id:'observation', label:'Observation',    color:'#64748b'},
  {id:'sop',         label:'SOP',            color:'#475569'},
  {id:'geste',       label:'Geste medical',  color:'#b45309'},
]

const BACK_MAP: Record<string,string> = {
  admin:'/admin/dashboard', medecin:'/medecin/dashboard',
  caissier:'/caissier', labo:'/labo', infirmier:'/infirmier',
  pharmacie:'/pharmacie',
}

export default function NouveauPatientPage() {
  const { user } = useAuth()
  const router = useRouter()
  const backUrl = BACK_MAP[user?.role || 'admin'] || '/admin/dashboard'

  // Mode: 'nouveau' | 'existant'
  const [mode, setMode] = useState<'nouveau'|'existant'>('nouveau')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<any>(null)

  // Nouveau patient form
  const [form, setForm] = useState({
    prenom:'', nom:'', telephone:'', age:'',
    adresse:'', email:'', contact_urgence:'',
    sexe:'', date_naissance:'',
    service:'clinique', montant:0, mode_paiement:'especes',
    priorite:'normal', praticien:'',
  })

  // Patient existant search
  const [searchMode, setSearchMode] = useState<'id'|'nom'>('id')
  const [searchId, setSearchId] = useState('')
  const [searchNom, setSearchNom] = useState('')
  const [searchDdn, setSearchDdn] = useState('')
  const [foundPatient, setFoundPatient] = useState<any>(null)
  const [searchErr, setSearchErr] = useState('')
  const [rdvService, setRdvService] = useState('clinique')
  const [rdvMontant, setRdvMontant] = useState(0)
  const [rdvMode, setRdvMode] = useState('especes')
  const [rdvPraticien, setRdvPraticien] = useState('')

  const chercher = async () => {
    setSearchErr(''); setFoundPatient(null)
    try {
      if (searchMode === 'id') {
        if (!searchId.trim()) { setSearchErr('Saisissez le numero #RB-XXXX'); return }
        const r = await api.get(`/caissier/recherche-patient?q=${encodeURIComponent(searchId.trim())}`)
        const pts = r.data?.patients || []
        if (pts.length === 0) { setSearchErr('Patient introuvable'); return }
        setFoundPatient(pts[0])
      } else {
        if (!searchNom.trim() || !searchDdn) { setSearchErr('Nom complet et date de naissance requis'); return }
        const r = await api.get(`/medecin/chercher-patient?nom=${encodeURIComponent(searchNom.trim())}&ddn=${searchDdn}`)
        const pts = r.data?.patients || []
        if (pts.length === 0) { setSearchErr('Patient introuvable avec ces informations'); return }
        setFoundPatient(pts[0])
      }
    } catch { setSearchErr('Erreur de recherche') }
  }

  const ajouterRdv = async () => {
    if (!foundPatient) return
    setLoading(true)
    try {
      await api.post('/patients', {
        ...foundPatient,
        service: rdvService,
        montant: rdvMontant,
        mode_paiement: rdvMode,
        praticien: rdvPraticien,
        priorite: 'normal',
        _rdv_only: true,
      })
      toast.success(`Rendez-vous ajouté pour ${foundPatient.prenom} ${foundPatient.nom}`)
      setCreated({ ...foundPatient, ticket: 'RDV', numero: foundPatient.numero, service: rdvService })
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Erreur')
    } finally { setLoading(false) }
  }

  const enregistrer = async () => {
    if (!form.prenom || !form.nom || !form.telephone) {
      toast.error('Prenom, NOM et telephone requis'); return
    }
    setLoading(true)
    try {
      const res = await api.post('/patients', {
        ...form,
        age: form.age ? parseInt(form.age) || null : null,
      })
      setCreated(res.data)
      toast.success(`Patient ${res.data.numero} enregistre !`)
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Erreur creation')
    } finally { setLoading(false) }
  }

  if (created) return (
    <div style={{minHeight:'100vh',background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',borderRadius:20,padding:32,maxWidth:440,width:'100%',textAlign:'center',boxShadow:'0 4px 24px rgba(0,0,0,0.1)'}}>
        <div style={{width:64,height:64,background:'#dcfce7',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
          <i className="fa-solid fa-user-check" style={{color:'#16a34a',fontSize:28}}/>
        </div>
        <h2 style={{fontWeight:900,fontSize:'1.3rem',marginBottom:8}}>
          {created.ticket === 'RDV' ? 'Rendez-vous enregistre !' : 'Patient enregistre !'}
        </h2>
        <div style={{background:'#eff6ff',borderRadius:12,padding:16,margin:'12px 0'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:4}}>Dossier patient unique</div>
          <div style={{fontFamily:'monospace',fontWeight:900,fontSize:'1.5rem',color:'#1641C8'}}>{created.numero}</div>
          <div style={{fontSize:13,color:'#374151',marginTop:4}}>{created.prenom} {created.nom}</div>
          {created.ticket && created.ticket !== 'RDV' && (
            <div style={{marginTop:8,background:'#dbeafe',borderRadius:8,padding:'6px 12px'}}>
              <div style={{fontSize:11,color:'#94a3b8'}}>Ticket infirmier</div>
              <div style={{fontFamily:'monospace',fontWeight:900,color:'#1641C8'}}>#{created.ticket}</div>
            </div>
          )}
          <div style={{marginTop:8,fontSize:12,color:'#16a34a',fontWeight:700}}>
            Envoye dans la queue infirmier
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:16}}>
          <button onClick={() => { setCreated(null); setFoundPatient(null); setForm({prenom:'',nom:'',telephone:'',age:'',adresse:'',email:'',contact_urgence:'',sexe:'',date_naissance:'',service:'clinique',montant:0,mode_paiement:'especes',priorite:'normal',praticien:''}) }}
            style={{flex:1,padding:'11px',borderRadius:10,border:'1.5px solid #e2e8f0',background:'white',fontWeight:700,cursor:'pointer',fontSize:13}}>
            <i className="fa-solid fa-plus" style={{marginRight:6}}/>Nouveau
          </button>
          <button onClick={() => router.push(backUrl)}
            style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'#1641C8',color:'white',fontWeight:700,cursor:'pointer',fontSize:13}}>
            <i className="fa-solid fa-arrow-left" style={{marginRight:6}}/>Retour
          </button>
        </div>
      </div>
    </div>
  )

  const inp = {width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid #e2e8f0',fontSize:13,boxSizing:'border-box' as const}

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#0f172a,#1641C8)',padding:'14px 20px',display:'flex',alignItems:'center',gap:12}}>
        <button onClick={() => router.push(backUrl)} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:8,padding:'7px 14px',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>
          <i className="fa-solid fa-arrow-left" style={{marginRight:6}}/>Retour
        </button>
        <div style={{color:'white',fontWeight:800,fontSize:16}}>Nouveau patient / Rendez-vous</div>
      </div>

      {/* Mode selector */}
      <div style={{maxWidth:760,margin:'20px auto',padding:'0 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
          <button onClick={() => setMode('nouveau')} style={{
            padding:'14px',borderRadius:12,border:`2px solid ${mode==='nouveau'?'#1641C8':'#e2e8f0'}`,
            background:mode==='nouveau'?'#eff6ff':'white',fontWeight:700,cursor:'pointer',fontSize:14,
            color:mode==='nouveau'?'#1641C8':'#64748b',
          }}>
            <i className="fa-solid fa-user-plus" style={{marginRight:8}}/>Nouveau patient
          </button>
          <button onClick={() => setMode('existant')} style={{
            padding:'14px',borderRadius:12,border:`2px solid ${mode==='existant'?'#16a34a':'#e2e8f0'}`,
            background:mode==='existant'?'#f0fdf4':'white',fontWeight:700,cursor:'pointer',fontSize:14,
            color:mode==='existant'?'#16a34a':'#64748b',
          }}>
            <i className="fa-solid fa-user-clock" style={{marginRight:8}}/>Patient existant (RDV)
          </button>
        </div>

        {/* ── NOUVEAU PATIENT ── */}
        {mode === 'nouveau' && (
          <div style={{background:'white',borderRadius:16,padding:24,border:'1px solid #e2e8f0'}}>
            <h3 style={{fontWeight:800,fontSize:15,marginBottom:16,color:'#0f172a'}}>Informations du patient</h3>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Prenom *</label>
                <input value={form.prenom} onChange={e=>setForm(p=>({...p,prenom:e.target.value}))} placeholder="Prenom" style={inp}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>NOM *</label>
                <input value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value.toUpperCase()}))} placeholder="NOM DE FAMILLE" style={inp}/>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Telephone *</label>
                <input value={form.telephone} onChange={e=>setForm(p=>({...p,telephone:e.target.value}))} placeholder="Ex: 36186469" style={inp}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Age</label>
                <input type="number" value={form.age} onChange={e=>setForm(p=>({...p,age:e.target.value}))} placeholder="35" style={inp}/>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Date de naissance</label>
                <input type="date" value={form.date_naissance} onChange={e=>setForm(p=>({...p,date_naissance:e.target.value}))} style={inp}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Sexe</label>
                <select value={form.sexe} onChange={e=>setForm(p=>({...p,sexe:e.target.value}))} style={inp}>
                  <option value="">Choisir...</option>
                  <option value="M">Masculin</option>
                  <option value="F">Feminin</option>
                </select>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Adresse</label>
                <input value={form.adresse} onChange={e=>setForm(p=>({...p,adresse:e.target.value}))} placeholder="Petion-Ville" style={inp}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Email</label>
                <input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="email@..." style={inp}/>
              </div>
            </div>

            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Urgence - personne a contacter</label>
              <input value={form.contact_urgence} onChange={e=>setForm(p=>({...p,contact_urgence:e.target.value}))} placeholder="Nom - Telephone" style={inp}/>
            </div>

            {/* Service */}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:8}}>Service *</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
                {SERVICES.map(s => (
                  <button key={s.id} onClick={()=>setForm(p=>({...p,service:s.id}))} style={{
                    padding:'8px 4px',borderRadius:8,border:`2px solid ${form.service===s.id?s.color:'#e2e8f0'}`,
                    background:form.service===s.id?s.color+'18':'white',
                    color:form.service===s.id?s.color:'#94a3b8',
                    fontWeight:700,fontSize:10,cursor:'pointer',transition:'all 0.15s'
                  }}>{s.label}</button>
                ))}
              </div>
            </div>

            {/* Montant */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Montant (HTG)</label>
                <input type="number" value={form.montant} onChange={e=>setForm(p=>({...p,montant:parseFloat(e.target.value)||0}))} style={inp}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Mode de paiement</label>
                <select value={form.mode_paiement} onChange={e=>setForm(p=>({...p,mode_paiement:e.target.value}))} style={inp}>
                  <option value="especes">Especes</option>
                  <option value="moncash">MonCash</option>
                  <option value="natcash">NatCash</option>
                  <option value="carte">Carte</option>
                  <option value="zelle">Zelle</option>
                </select>
              </div>
            </div>

            <button onClick={enregistrer} disabled={loading} style={{
              width:'100%',padding:'13px',borderRadius:10,border:'none',
              background:loading?'#94a3b8':'#1641C8',color:'white',fontWeight:700,cursor:'pointer',fontSize:14
            }}>
              {loading ? 'Enregistrement...' : 'Enregistrer et envoyer a la queue infirmier'}
            </button>
          </div>
        )}

        {/* ── PATIENT EXISTANT ── */}
        {mode === 'existant' && (
          <div style={{background:'white',borderRadius:16,padding:24,border:'1px solid #e2e8f0'}}>
            <h3 style={{fontWeight:800,fontSize:15,marginBottom:16,color:'#0f172a'}}>Trouver le dossier patient</h3>

            {/* Mode selector */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
              {(['id','nom'] as const).map(m => (
                <button key={m} onClick={()=>{setSearchMode(m);setFoundPatient(null);setSearchErr('')}} style={{
                  padding:'10px',borderRadius:9,border:`2px solid ${searchMode===m?'#1641C8':'#e2e8f0'}`,
                  background:searchMode===m?'#eff6ff':'white',fontWeight:700,fontSize:13,cursor:'pointer',
                  color:searchMode===m?'#1641C8':'#64748b'
                }}>
                  {m==='id' ? 'Par ID patient (#RB-XXXX)' : 'Par Nom + Date naissance'}
                </button>
              ))}
            </div>

            {searchMode === 'id' ? (
              <div style={{display:'flex',gap:8,marginBottom:8}}>
                <input value={searchId} onChange={e=>setSearchId(e.target.value)} onKeyDown={e=>e.key==='Enter'&&chercher()}
                  placeholder="#RB-0001" style={{...inp,flex:1}}/>
                <button onClick={chercher} style={{padding:'10px 18px',borderRadius:8,border:'none',background:'#1641C8',color:'white',fontWeight:700,cursor:'pointer'}}>
                  Chercher
                </button>
              </div>
            ) : (
              <div style={{marginBottom:8}}>
                <input value={searchNom} onChange={e=>setSearchNom(e.target.value)} placeholder="Nom complet (ex: Jean PIERRE)"
                  style={{...inp,marginBottom:8}}/>
                <div style={{display:'flex',gap:8}}>
                  <input type="date" value={searchDdn} onChange={e=>setSearchDdn(e.target.value)} style={{...inp,flex:1}}/>
                  <button onClick={chercher} style={{padding:'10px 18px',borderRadius:8,border:'none',background:'#1641C8',color:'white',fontWeight:700,cursor:'pointer'}}>
                    Chercher
                  </button>
                </div>
                <div style={{fontSize:11,color:'#94a3b8',marginTop:4}}>Les deux champs sont obligatoires</div>
              </div>
            )}

            {searchErr && <div style={{color:'#dc2626',fontSize:13,marginBottom:8}}>{searchErr}</div>}

            {foundPatient && (
              <div>
                {/* Patient card */}
                <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:14,marginBottom:16}}>
                  <div style={{fontWeight:800,fontSize:15,color:'#0f172a'}}>{foundPatient.prenom} {foundPatient.nom}</div>
                  <div style={{fontFamily:'monospace',color:'#1641C8',fontWeight:700,marginTop:2}}>{foundPatient.numero}</div>
                  <div style={{fontSize:12,color:'#64748b',marginTop:4}}>{foundPatient.telephone}</div>
                </div>

                {/* Nouveau RDV */}
                <h4 style={{fontWeight:700,fontSize:13,marginBottom:10,color:'#374151'}}>Nouveau rendez-vous</h4>

                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:6}}>Service</label>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
                    {SERVICES.map(s => (
                      <button key={s.id} onClick={()=>setRdvService(s.id)} style={{
                        padding:'8px 4px',borderRadius:8,border:`2px solid ${rdvService===s.id?s.color:'#e2e8f0'}`,
                        background:rdvService===s.id?s.color+'18':'white',
                        color:rdvService===s.id?s.color:'#94a3b8',
                        fontWeight:700,fontSize:10,cursor:'pointer'
                      }}>{s.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  <div>
                    <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Montant (HTG)</label>
                    <input type="number" value={rdvMontant} onChange={e=>setRdvMontant(parseFloat(e.target.value)||0)} style={inp}/>
                  </div>
                  <div>
                    <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Mode paiement</label>
                    <select value={rdvMode} onChange={e=>setRdvMode(e.target.value)} style={inp}>
                      <option value="especes">Especes</option>
                      <option value="moncash">MonCash</option>
                      <option value="natcash">NatCash</option>
                      <option value="carte">Carte</option>
                      <option value="zelle">Zelle</option>
                    </select>
                  </div>
                </div>

                <div style={{marginBottom:14}}>
                  <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:4}}>Praticien (optionnel)</label>
                  <input value={rdvPraticien} onChange={e=>setRdvPraticien(e.target.value)} placeholder="Dr Nom Prenom" style={inp}/>
                </div>

                <button onClick={ajouterRdv} disabled={loading} style={{
                  width:'100%',padding:'13px',borderRadius:10,border:'none',
                  background:'#16a34a',color:'white',fontWeight:700,cursor:'pointer',fontSize:14
                }}>
                  {loading ? 'Enregistrement...' : 'Confirmer le rendez-vous et envoyer a la queue'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
