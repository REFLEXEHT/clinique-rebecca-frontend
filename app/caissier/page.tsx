'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { api, aiApi } from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { LogOut, Printer, Search, Plus, TrendingUp, ArrowDownCircle, Eye } from 'lucide-react'

const SERVICES_TARIFS = [
  {nom:'Consultation Médecine interne',prix:4000,cat:'Clinique Externe'},
  {nom:'Consultation Gynécologie',prix:4500,cat:'Clinique Externe'},
  {nom:'Consultation Pédiatrie',prix:3500,cat:'Clinique Externe'},
  {nom:'Consultation Neurologie',prix:6000,cat:'Clinique Externe'},
  {nom:'Consultation Chirurgie Générale',prix:5000,cat:'Clinique Externe'},
  {nom:'Consultation Orthopédie',prix:6500,cat:'Clinique Externe'},
  {nom:'Consultation Dermatologie',prix:4000,cat:'Clinique Externe'},
  {nom:'Consultation ORL',prix:4500,cat:'Clinique Externe'},
  {nom:'Consultation Urologie',prix:5000,cat:'Clinique Externe'},
  {nom:'Consultation Neurochirurgie',prix:7000,cat:'Clinique Externe'},
  {nom:'Consultation Cardiologie',prix:6000,cat:'Clinique Externe'},
  {nom:'Consultation Psychologie',prix:4000,cat:'Clinique Externe'},
  {nom:'Consultation Dentisterie',prix:2500,cat:'Dentisterie'},
  {nom:'Extraction dentaire simple',prix:5000,cat:'Dentisterie'},
  {nom:'Prophylaxie dentaire',prix:7500,cat:'Dentisterie'},
  {nom:'Consultation Physiothérapie',prix:3000,cat:'Physiothérapie'},
  {nom:'Séance Physiothérapie',prix:2500,cat:'Physiothérapie'},
  {nom:'Consultation Optométrie',prix:2500,cat:'Optométrie'},
  {nom:'Examen Laboratoire (simple)',prix:1000,cat:'Laboratoire'},
  {nom:'Bilan complet laboratoire',prix:5000,cat:'Laboratoire'},
  {nom:'Médicaments Pharmacie',prix:0,cat:'Pharmacie'},
  {nom:'Observation/24h',prix:8000,cat:'Observation'},
  {nom:'Hospitalisation/24h',prix:15000,cat:'Hospitalisation'},
  {nom:'Chambre Maternité',prix:12000,cat:'Maternité'},
  {nom:'Accouchement voie basse',prix:25000,cat:'Maternité'},
  {nom:'Césarienne',prix:75000,cat:'Maternité'},
  {nom:'Salle SOP - Chirurgie mineure',prix:35000,cat:'SOP'},
  {nom:'Salle SOP - Chirurgie majeure',prix:80000,cat:'SOP'},
  {nom:'Geste médical simple',prix:2000,cat:'Gestes'},
  {nom:'ECG',prix:1500,cat:'Gestes'},
  {nom:'Suture plaie',prix:3000,cat:'Gestes'},
]

const CATEGORIES_DEPENSES = [
  'Salaires personnel','Médicaments/Fournitures','Maintenance équipements',
  'Électricité/Eau','Loyer/Charges','Alimentation patients','Produits nettoyage',
  'Transport','Formation','Autre'
]

// ── Modal aperçu document ──────────────────────────────────────────────────
function ModalDocument({ doc, onClose, onPrint }: any) {
  if (!doc) return null
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',borderRadius:18,width:'100%',maxWidth:680,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderBottom:'1px solid #e2e8f0'}}>
          <div>
            <h3 style={{fontWeight:800,margin:0,fontSize:15}}>{doc.titre}</h3>
            <div style={{fontSize:12,color:'#64748b',marginTop:3}}>
              Patient: <strong>{doc.patient_nom}</strong> · ID: <span style={{fontFamily:'monospace',color:'#1641C8'}}>{doc.patient_numero}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={onPrint} style={{background:'#1641C8',color:'white',border:'none',borderRadius:10,padding:'8px 18px',fontWeight:700,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6}}>
              <Printer size={13}/> Imprimer
            </button>
            <button onClick={onClose} style={{background:'#f1f5f9',border:'none',borderRadius:10,padding:'8px 14px',cursor:'pointer',fontWeight:600,color:'#374151',fontSize:13}}>Fermer</button>
          </div>
        </div>
        <div style={{padding:24}}>
          {/* En-tête clinique */}
          <div style={{textAlign:'center',borderBottom:`2px solid ${doc.couleur||'#1641C8'}`,paddingBottom:14,marginBottom:20}}>
            <div style={{fontWeight:900,fontSize:16,color:'#1641C8'}}>CLINIQUE DE LA REBECCA</div>
            <div style={{fontSize:12,color:'#64748b'}}>#44, Rue Rebecca, Pétion-Ville · (509) 4858-5757</div>
            <div style={{fontWeight:800,fontSize:14,marginTop:8,color:doc.couleur||'#1641C8',textTransform:'uppercase'}}>{doc.titre}</div>
          </div>

          {/* Infos patient */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16,fontSize:13}}>
            <div><strong>Patient :</strong> {doc.patient_nom}</div>
            <div><strong># Dossier :</strong> {doc.patient_numero}</div>
            <div><strong>Date :</strong> {new Date().toLocaleDateString('fr-FR')}</div>
          </div>

          {/* Contenu du document */}
          <div style={{background:'#f8fafc',borderRadius:10,padding:16,marginBottom:16}}>
            {doc.type === 'resultat_labo' && doc.resultats?.map((r: any, i: number) => (
              <div key={i} style={{marginBottom:12,paddingBottom:12,borderBottom:i<doc.resultats.length-1?'1px solid #e2e8f0':'none'}}>
                <div style={{fontWeight:700,color:'#16a34a',marginBottom:4}}>{r.type_examen}</div>
                <div style={{fontSize:13,whiteSpace:'pre-wrap',lineHeight:1.6}}>{r.resultats}</div>
                {r.notes && <div style={{fontSize:12,color:'#64748b',marginTop:4,fontStyle:'italic'}}>{r.notes}</div>}
              </div>
            ))}
            {doc.type === 'certificat' && (
              <div style={{fontSize:13,lineHeight:2}}>
                <div>Je soussigné(e) <span style={{fontWeight:700}}>{doc.medecin_nom || 'Dr _______________'}</span>,</div>
                <div>certifie que M./Mme <strong>{doc.patient_nom}</strong> ({doc.patient_numero})</div>
                <div>a été examiné(e) à la Clinique de la Rebecca le {new Date().toLocaleDateString('fr-FR')}.</div>
                <div style={{marginTop:10,color:'#475569'}}>{doc.contenu || ''}</div>
              </div>
            )}
          </div>

          {/* Vérification signature médecin */}
          {doc.medecin_nom && (
            <div style={{background:'#f0fdf4',borderRadius:10,padding:12,marginBottom:16,display:'flex',alignItems:'center',gap:10,fontSize:13}}>
              <span style={{fontSize:18}}>✅</span>
              <div>
                <strong style={{color:'#16a34a'}}>Document signé par :</strong> {doc.medecin_nom}
                {doc.medecin_specialite && <span style={{color:'#64748b'}}> · {doc.medecin_specialite}</span>}
              </div>
            </div>
          )}
          {!doc.medecin_nom && (
            <div style={{background:'#fef2f2',borderRadius:10,padding:12,marginBottom:16,display:'flex',alignItems:'center',gap:10,fontSize:13}}>
              <span style={{fontSize:18}}>⚠️</span>
              <div><strong style={{color:'#dc2626'}}>En attente de signature médicale</strong> — Ce document nécessite une validation du médecin traitant.</div>
            </div>
          )}

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginTop:16}}>
            <div><div style={{fontSize:12,marginBottom:36}}>Signature médecin</div><div style={{borderBottom:'1px solid #374151',width:140}}/></div>
            <div><div style={{fontSize:12,marginBottom:36}}>Cachet clinique</div><div style={{borderBottom:'1px solid #374151',width:120}}/></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CaissierPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [onglet, setOnglet] = useState<'paiement'|'documents'|'depenses'|'nouveau'|'rapport'|'registre'>('paiement')
  const [searchPaiement, setSearchPaiement] = useState('')
  const [searchDoc, setSearchDoc] = useState('')
  const [patient, setPatient] = useState<any>(null)
  const [patientDoc, setPatientDoc] = useState<any>(null)
  const [docsDispos, setDocsDispos] = useState<any[]>([])
  const [paiements, setPaiements] = useState<any[]>([])
  const [depenses, setDepenses] = useState<any[]>([])
  const [totalJour, setTotalJour] = useState(0)
  const [totalDepenses, setTotalDepenses] = useState(0)
  const [rapport, setRapport] = useState('')
  const [loadRapport, setLoadRapport] = useState(false)
  const [recu, setRecu] = useState<any>(null)
  const [modalDoc, setModalDoc] = useState<any>(null)
  const [form, setForm] = useState({
    service: SERVICES_TARIFS[0].nom, montant: SERVICES_TARIFS[0].prix,
    mode_paiement: 'especes', reference: ''
  })
  const [formDepense, setFormDepense] = useState({
    categorie: CATEGORIES_DEPENSES[0], description: '', montant: 0, mode: 'especes'
  })
  const [formNouv, setFormNouv] = useState({
    nom:'', prenom:'', age:'', adresse:'', telephone:'', email:'',
    contact_urgence:'', type_visite:'premiere' as 'premiere'|'rdv'
  })
  const [registre,   setRegistre] = useState<any[]>([])

  useEffect(() => {
    if (!loading && (!isAuthenticated || !['caissier','admin'].includes(user?.role||'')))
      router.push('/login')
  }, [isAuthenticated, user, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/caissier/paiements-jour').then(r => {
      setPaiements(r.data?.paiements||[])
      setTotalJour(r.data?.total||0)
    }).catch(()=>{})
    api.get('/caissier/depenses-jour').then(r => {
      setDepenses(r.data?.depenses||[])
      setTotalDepenses(r.data?.total||0)
    }).catch(()=>{})
    api.get('/registre-rdv?jours=30').then(r => setRegistre(r.data?.rdvs||[])).catch(()=>{})
  }, [isAuthenticated])

  const chercherPatientPaiement = async () => {
    const id = searchPaiement.trim().toUpperCase()
    if (!id) return
    try {
      const r = await api.get(`/patients/par-numero/${id}`)
      setPatient(r.data)
      toast.success(`Patient trouvé: ${r.data.nom}`)
    } catch { toast.error('Patient introuvable') }
  }

  const chercherPatientDocs = async () => {
    const id = searchDoc.trim().toUpperCase()
    if (!id) return
    try {
      const [rp, rd] = await Promise.all([
        api.get(`/patients/par-numero/${id}`),
        api.get(`/caissier/documents-disponibles/${id}`)
      ])
      setPatientDoc(rp.data)
      setDocsDispos(rd.data?.documents || [])
    } catch { toast.error('Patient introuvable') }
  }

  const ouvrirDocument = async (doc: any) => {
    if (!patientDoc) return
    if (doc.type === 'resultats_labo') {
      try {
        const r = await api.get(`/infirmier/imprimer-resultats-labo/${patientDoc.numero}`)
        setModalDoc({
          type:'resultat_labo', titre:'Résultats de Laboratoire', couleur:'#16a34a',
          patient_nom: patientDoc.nom, patient_numero: patientDoc.numero,
          resultats: r.data.resultats, medecin_nom: r.data.medecin_nom,
        })
      } catch { toast.error('Erreur chargement') }
    } else if (doc.type === 'certificat') {
      try {
        const r = await api.get(`/medecin/certificat/${patientDoc.id}`)
        setModalDoc({
          type:'certificat', titre:'Certificat Médical', couleur:'#374151',
          patient_nom: patientDoc.nom, patient_numero: patientDoc.numero,
          medecin_nom: r.data?.medecin_nom, medecin_specialite: r.data?.specialite,
          contenu: r.data?.contenu
        })
      } catch {
        setModalDoc({
          type:'certificat', titre:'Certificat Médical', couleur:'#374151',
          patient_nom: patientDoc.nom, patient_numero: patientDoc.numero,
        })
      }
    }
  }

  const enregistrerPaiement = async () => {
    if (!patient) { toast.error('Recherchez un patient'); return }
    try {
      const r = await api.post('/caissier/paiement', {
        patient_id: patient.id, service: form.service,
        montant: form.montant, mode_paiement: form.mode_paiement, reference: form.reference
      })
      setRecu({...r.data, patient_nom: patient.nom, patient_numero: patient.numero})
      toast.success('Paiement enregistré — reçu généré ✓')
      setPaiements(prev => [r.data, ...prev])
      setTotalJour(prev => prev + form.montant)
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur') }
  }

  const enregistrerDepense = async () => {
    if (!formDepense.montant || !formDepense.description) { toast.error('Complétez les champs requis'); return }
    try {
      const r = await api.post('/caissier/depense', formDepense)
      toast.success('Dépense enregistrée ✓')
      setDepenses(prev => [r.data, ...prev])
      setTotalDepenses(prev => prev + formDepense.montant)
      setFormDepense({categorie:CATEGORIES_DEPENSES[0],description:'',montant:0,mode:'especes'})
    } catch (e: any) { toast.error(e?.response?.data?.detail||'Erreur') }
  }

  const creerPatient = async () => {
    if (!formNouv.nom || !formNouv.prenom) { toast.error('Nom et prénom requis'); return }
    try {
      const r = await api.post('/caissier/nouveau-patient', {...formNouv, is_premiere_visite: formNouv.type_visite==='premiere'})
      setPatient(r.data.patient)
      toast.success(`Patient créé — ID: ${r.data.patient?.numero}`)
      setOnglet('paiement')
    } catch (e: any) { toast.error(e?.response?.data?.detail||'Erreur') }
  }

  const genererRapport = async () => {
    setLoadRapport(true)
    try {
      const data = await aiApi.chat([{role:'user',content:`Rapport comptable journalier — Clinique de la Rebecca.
Encaissements: ${totalJour} HTG en ${paiements.length} transactions.
Services: ${[...new Set(paiements.map((p:any)=>p.service?.split(' ')[0]||'Autre'))].join(', ')}.
Décaissements: ${totalDepenses} HTG en ${depenses.length} dépenses.
Catégories dépenses: ${depenses.map((d:any)=>d.categorie).join(', ')}.
Solde net: ${totalJour - totalDepenses} HTG.
Génère un rapport comptable structuré avec: résumé financier, recettes par catégorie, dépenses par catégorie, solde net, recommandations. Max 300 mots.`}], { max_tokens: 600 })
      setRapport(data.content?.[0]?.text || '')
    } catch { setRapport('Erreur') }
    finally { setLoadRapport(false) }
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #d97706',borderTopColor:'transparent',animation:'spin 1s linear infinite'}}/></div>

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      {/* Navbar */}
      <div style={{background:'linear-gradient(135deg,#0f1e3d,#d97706)',height:58,display:'flex',alignItems:'center',padding:'0 24px',gap:14,flexWrap:'wrap'}}>
        <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>💳</div>
        <div>
          <div style={{color:'white',fontWeight:800,fontSize:14}}>{user?.nom}</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:11}}>Caissier(ère)</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          {[
            {href:'/caissier/documents',label:'🖨️ Documents'},
          ].map(l=>(
            <Link key={l.href} href={l.href} style={{background:'rgba(255,255,255,0.1)',color:'white',textDecoration:'none',borderRadius:8,padding:'6px 12px',fontSize:12,fontWeight:600}}>
              {l.label}
            </Link>
          ))}
          <button onClick={()=>{logout();router.push('/')}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
            <LogOut size={13}/> Déconnexion
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div style={{background:'white',borderBottom:'1px solid #e2e8f0',padding:'0 20px',display:'flex',gap:2,overflowX:'auto'}}>
        {[
          {k:'paiement',  label:'💰 Paiement'},
          {k:'documents', label:'📋 Documents patient'},
          {k:'depenses',  label:'💸 Décaissements'},
          {k:'nouveau',   label:'👤 Nouveau patient'},
          {k:'rapport',   label:'📊 Rapport comptable IA'},
        ].map(t=>(
          <button key={t.k} onClick={()=>setOnglet(t.k as any)} style={{
            padding:'12px 14px',border:'none',background:'transparent',cursor:'pointer',
            fontWeight:600,fontSize:13,color:onglet===t.k?'#d97706':'#64748b',
            borderBottom:onglet===t.k?'2px solid #d97706':'2px solid transparent',
            whiteSpace:'nowrap'
          }}>{t.label}</button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{background:'white',borderBottom:'1px solid #f1f5f9',padding:'12px 20px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',gap:16,flexWrap:'wrap'}}>
          {[
            {label:'Encaissé',val:`${totalJour.toLocaleString('fr-FR')} HTG`,c:'#16a34a'},
            {label:'Dépensé',val:`${totalDepenses.toLocaleString('fr-FR')} HTG`,c:'#dc2626'},
            {label:'Net',val:`${(totalJour-totalDepenses).toLocaleString('fr-FR')} HTG`,c:'#1641C8'},
            {label:'Transactions',val:paiements.length,c:'#d97706'},
          ].map(s=>(
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontWeight:900,fontSize:'1.1rem',color:s.c}}>{s.val}</span>
              <span style={{fontSize:12,color:'#94a3b8'}}>{s.label}</span>
            </div>
          ))}
          <div style={{marginLeft:'auto',color:'#64748b',fontSize:13}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'20px'}}>

        {/* ── PAIEMENT ───────────────────────────────────────────── */}
        {onglet==='paiement' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            {/* Gauche: formulaire */}
            <div>
              <div style={{background:'white',borderRadius:16,padding:20,border:'1px solid #e2e8f0',marginBottom:14}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:12,color:'#0f172a'}}>🔍 Patient</h3>
                <div style={{display:'flex',gap:8,marginBottom:10}}>
                  <input value={searchPaiement} onChange={e=>setSearchPaiement(e.target.value.toUpperCase())}
                    onKeyDown={e=>e.key==='Enter'&&chercherPatientPaiement()}
                    placeholder="#RB-0042 ou NOM"
                    style={{flex:1,padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,fontFamily:'monospace'}}/>
                  <button onClick={chercherPatientPaiement} style={{background:'#d97706',color:'white',border:'none',borderRadius:8,padding:'10px 14px',fontWeight:700,cursor:'pointer'}}>
                    <Search size={14}/>
                  </button>
                </div>
                {patient && (
                  <div style={{background:'#f0fdf4',borderRadius:8,padding:'8px 12px',fontSize:13,display:'flex',justifyContent:'space-between'}}>
                    <strong>{patient.nom}</strong>
                    <span style={{fontFamily:'monospace',color:'#16a34a'}}>{patient.numero}</span>
                  </div>
                )}
              </div>

              <div style={{background:'white',borderRadius:16,padding:20,border:'1px solid #e2e8f0'}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:14,color:'#0f172a'}}>💳 Service & Paiement</h3>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Service *</label>
                  <select value={form.service} onChange={e=>{
                    const t=SERVICES_TARIFS.find(x=>x.nom===e.target.value)
                    setForm(p=>({...p,service:e.target.value,montant:t?.prix||0}))
                  }} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,background:'white'}}>
                    {['Clinique Externe','Dentisterie','Physiothérapie','Optométrie','Laboratoire','Pharmacie','Observation','Hospitalisation','Maternité','SOP','Gestes'].map(cat => (
                      <optgroup key={cat} label={cat}>
                        {SERVICES_TARIFS.filter(s=>s.cat===cat).map(s=>(
                          <option key={s.nom} value={s.nom}>{s.nom} {s.prix>0?`(${s.prix.toLocaleString()} HTG)`:''}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Montant (HTG) *</label>
                  <input type="number" value={form.montant} onChange={e=>setForm(p=>({...p,montant:parseInt(e.target.value)||0}))}
                    style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:15,fontWeight:700,boxSizing:'border-box' as const}}/>
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Mode de paiement</label>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                    {['especes','moncash','natcash','carte'].map(m=>(
                      <button key={m} type="button" onClick={()=>setForm(p=>({...p,mode_paiement:m}))} style={{
                        padding:'8px 4px',borderRadius:8,border:`2px solid ${form.mode_paiement===m?'#d97706':'#e2e8f0'}`,
                        background:form.mode_paiement===m?'#fff7ed':'white',fontWeight:600,fontSize:11,cursor:'pointer',
                        color:form.mode_paiement===m?'#d97706':'#64748b',textTransform:'capitalize'
                      }}>{m}</button>
                    ))}
                  </div>
                </div>
                {['moncash','natcash'].includes(form.mode_paiement) && (
                  <div style={{marginBottom:12}}>
                    <input value={form.reference} onChange={e=>setForm(p=>({...p,reference:e.target.value}))}
                      placeholder="Référence transaction"
                      style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,boxSizing:'border-box' as const}}/>
                  </div>
                )}
                <button onClick={enregistrerPaiement} disabled={!patient||!form.montant} style={{
                  width:'100%',background:'linear-gradient(135deg,#d97706,#b45309)',color:'white',
                  border:'none',borderRadius:10,padding:'13px',fontWeight:700,cursor:'pointer',
                  fontSize:15,opacity:(!patient||!form.montant)?0.5:1
                }}>✓ Enregistrer le paiement</button>
              </div>
            </div>

            {/* Droite: reçu + historique */}
            <div>
              {recu && (
                <div style={{background:'white',borderRadius:16,padding:20,border:'2px solid #d97706',marginBottom:14}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <h3 style={{fontWeight:700,fontSize:15,margin:0}}>🧾 Reçu</h3>
                    <button onClick={()=>window.print()} style={{background:'#d97706',color:'white',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
                      <Printer size={12}/> Imprimer
                    </button>
                  </div>
                  <div style={{background:'#f8fafc',borderRadius:8,padding:14,fontSize:13,lineHeight:1.8}}>
                    <div style={{textAlign:'center',fontWeight:900,marginBottom:8}}>CLINIQUE DE LA REBECCA</div>
                    <div style={{borderTop:'1px dashed #d1d5db',paddingTop:8}}>
                      <div>Patient: <strong>{recu.patient_nom}</strong></div>
                      <div>ID: <span style={{fontFamily:'monospace',color:'#1641C8'}}>{recu.patient_numero}</span></div>
                      <div>Service: {form.service}</div>
                      <div>Montant: <strong style={{color:'#16a34a'}}>{form.montant.toLocaleString()} HTG</strong></div>
                      <div>Paiement: {form.mode_paiement}</div>
                      <div>Reçu N°: <span style={{fontFamily:'monospace'}}>{recu.recu_numero}</span></div>
                      <div>Date: {new Date().toLocaleString('fr-FR')}</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{background:'white',borderRadius:16,padding:18,border:'1px solid #e2e8f0',maxHeight:420,overflowY:'auto'}}>
                <h3 style={{fontWeight:700,fontSize:14,marginBottom:12}}>📋 Transactions du jour ({paiements.length})</h3>
                {paiements.length===0 ? (
                  <p style={{color:'#94a3b8',textAlign:'center',padding:20,fontSize:13}}>Aucune transaction</p>
                ) : paiements.map((p:any,i:number)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9',fontSize:12}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13}}>{p.patient_nom||`Patient #${p.patient_id}`}</div>
                      <div style={{color:'#64748b'}}>{p.service}</div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontWeight:700,color:'#16a34a'}}>{(p.montant||0).toLocaleString()} HTG</div>
                      <div style={{color:'#94a3b8'}}>{p.mode_paiement}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── DOCUMENTS PATIENT ──────────────────────────────────── */}
        {onglet==='documents' && (
          <div style={{maxWidth:700}}>
            <div style={{background:'#fffbeb',border:'1px solid #fcd34d',borderRadius:12,padding:'10px 16px',marginBottom:20,fontSize:13,color:'#92400e'}}>
              ℹ️ Vous pouvez apercevoir et imprimer les documents disponibles d'un patient via son ID. Chaque document est vérifié : patient confirmé + signature médicale.
            </div>
            <div style={{background:'white',borderRadius:16,padding:22,border:'1px solid #e2e8f0',marginBottom:16}}>
              <h3 style={{fontWeight:700,fontSize:15,marginBottom:14}}>🔍 Chercher patient par ID</h3>
              <div style={{display:'flex',gap:10}}>
                <input value={searchDoc} onChange={e=>setSearchDoc(e.target.value.toUpperCase())}
                  onKeyDown={e=>e.key==='Enter'&&chercherPatientDocs()}
                  placeholder="#RB-0042"
                  style={{flex:1,padding:'12px 14px',borderRadius:10,border:'2px solid #e2e8f0',fontSize:15,fontFamily:'monospace',fontWeight:700}}/>
                <button onClick={chercherPatientDocs} style={{background:'#d97706',color:'white',border:'none',borderRadius:10,padding:'12px 20px',fontWeight:700,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',gap:6}}>
                  <Search size={15}/> Chercher
                </button>
              </div>
            </div>

            {patientDoc && (
              <div style={{background:'white',borderRadius:16,padding:22,border:'1px solid #e2e8f0'}}>
                <div style={{background:'#f0fdf4',borderRadius:10,padding:'10px 14px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:15,color:'#0f172a'}}>{patientDoc.nom}</div>
                    <div style={{fontFamily:'monospace',color:'#16a34a',fontWeight:700}}>{patientDoc.numero}</div>
                  </div>
                  <span style={{background:'#f0fdf4',color:'#16a34a',borderRadius:50,padding:'4px 12px',fontSize:12,fontWeight:700}}>✓ Patient identifié</span>
                </div>

                {docsDispos.length===0 ? (
                  <p style={{color:'#94a3b8',textAlign:'center',padding:24}}>Aucun document disponible pour ce patient.</p>
                ) : docsDispos.filter((d:any)=>d.disponible).map((doc:any)=>(
                  <div key={doc.type} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,border:'1px solid #e2e8f0',marginBottom:8,background:'#fafafa'}}>
                    <span style={{fontSize:26}}>{doc.icone}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:'#0f172a',fontSize:14}}>{doc.label}</div>
                      {doc.derniere_date && <div style={{fontSize:12,color:'#64748b'}}>Disponible depuis le {new Date(doc.derniere_date).toLocaleDateString('fr-FR')}</div>}
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>ouvrirDocument(doc)} style={{background:'#eff6ff',color:'#1641C8',border:'none',borderRadius:8,padding:'7px 14px',fontWeight:700,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
                        <Eye size={12}/> Aperçu
                      </button>
                      <button onClick={()=>{ouvrirDocument(doc).then(()=>setTimeout(()=>window.print(),500))}} style={{background:'#1641C8',color:'white',border:'none',borderRadius:8,padding:'7px 14px',fontWeight:700,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
                        <Printer size={12}/> Imprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── DÉCAISSEMENTS ──────────────────────────────────────── */}
        {onglet==='depenses' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'white',borderRadius:16,padding:22,border:'1px solid #e2e8f0'}}>
              <h3 style={{fontWeight:700,fontSize:15,marginBottom:16}}>💸 Enregistrer une dépense</h3>
              <div style={{marginBottom:12}}>
                <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Catégorie *</label>
                <select value={formDepense.categorie} onChange={e=>setFormDepense(p=>({...p,categorie:e.target.value}))}
                  style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,background:'white'}}>
                  {CATEGORIES_DEPENSES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Description *</label>
                <input value={formDepense.description} onChange={e=>setFormDepense(p=>({...p,description:e.target.value}))}
                  placeholder="Ex: Achat médicaments fournisseur"
                  style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,boxSizing:'border-box' as const}}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Montant (HTG) *</label>
                <input type="number" value={formDepense.montant||''} onChange={e=>setFormDepense(p=>({...p,montant:parseInt(e.target.value)||0}))}
                  style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:15,fontWeight:700,boxSizing:'border-box' as const}}/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:6}}>Mode</label>
                <div style={{display:'flex',gap:8}}>
                  {['especes','virement','cheque'].map(m=>(
                    <button key={m} type="button" onClick={()=>setFormDepense(p=>({...p,mode:m}))} style={{
                      flex:1,padding:'8px',borderRadius:8,border:`2px solid ${formDepense.mode===m?'#dc2626':'#e2e8f0'}`,
                      background:formDepense.mode===m?'#fef2f2':'white',fontWeight:600,fontSize:12,cursor:'pointer',
                      color:formDepense.mode===m?'#dc2626':'#64748b',textTransform:'capitalize'
                    }}>{m}</button>
                  ))}
                </div>
              </div>
              <button onClick={enregistrerDepense} disabled={!formDepense.montant||!formDepense.description} style={{
                width:'100%',background:'linear-gradient(135deg,#dc2626,#b91c1c)',color:'white',
                border:'none',borderRadius:10,padding:'12px',fontWeight:700,cursor:'pointer',fontSize:14,
                opacity:(!formDepense.montant||!formDepense.description)?0.5:1
              }}>✓ Enregistrer la dépense</button>
            </div>

            <div style={{background:'white',borderRadius:16,padding:18,border:'1px solid #e2e8f0',maxHeight:500,overflowY:'auto'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
                <h3 style={{fontWeight:700,fontSize:14,margin:0}}>Dépenses du jour ({depenses.length})</h3>
                <span style={{fontWeight:700,color:'#dc2626'}}>{totalDepenses.toLocaleString()} HTG</span>
              </div>
              {depenses.length===0 ? (
                <p style={{color:'#94a3b8',textAlign:'center',padding:20,fontSize:13}}>Aucune dépense enregistrée</p>
              ) : depenses.map((d:any,i:number)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9',fontSize:12}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>{d.description}</div>
                    <div style={{color:'#64748b'}}>{d.categorie}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontWeight:700,color:'#dc2626'}}>{(d.montant||0).toLocaleString()} HTG</div>
                    <div style={{color:'#94a3b8'}}>{d.mode}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NOUVEAU PATIENT ────────────────────────────────────── */}
        {onglet==='nouveau' && (
          <div style={{background:'white',borderRadius:16,padding:24,border:'1px solid #e2e8f0',maxWidth:700}}>
            <h2 style={{fontWeight:800,fontSize:'1.1rem',color:'#0f172a',marginBottom:6}}>👤 Créer un nouveau dossier patient</h2>
            <p style={{color:'#64748b',fontSize:13,marginBottom:20}}>Un ID unique (#RB-XXXX) sera attribué automatiquement.</p>
            <div style={{display:'flex',gap:10,marginBottom:20}}>
              {[{k:'premiere',l:'🆕 1ère consultation'},{k:'rdv',l:'📅 Rendez-vous'}].map(t=>(
                <button key={t.k} type="button" onClick={()=>setFormNouv(p=>({...p,type_visite:t.k as any}))} style={{
                  flex:1,padding:'11px',borderRadius:10,border:`2px solid ${formNouv.type_visite===t.k?'#1641C8':'#e2e8f0'}`,
                  background:formNouv.type_visite===t.k?'#eff6ff':'white',fontWeight:700,fontSize:13,cursor:'pointer',
                  color:formNouv.type_visite===t.k?'#1641C8':'#64748b'
                }}>{t.l}</button>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[
                {k:'prenom',l:'Prénom *',ph:'Jean'},
                {k:'nom',l:'NOM *',ph:'PIERRE'},
                {k:'age',l:'Âge',ph:'35 ans'},
                {k:'telephone',l:'Téléphone *',ph:'+509 3890-1234'},
                {k:'adresse',l:'Adresse',ph:'Pétion-Ville'},
                {k:'email',l:'Email',ph:'jean@email.com'},
              ].map(f=>(
                <div key={f.k}>
                  <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:5}}>{f.l}</label>
                  <input value={(formNouv as any)[f.k]} onChange={e=>setFormNouv(p=>({...p,[f.k]:e.target.value}))}
                    placeholder={f.ph}
                    style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,boxSizing:'border-box' as const}}/>
                </div>
              ))}
              <div style={{gridColumn:'1/-1'}}>
                <label style={{display:'block',fontWeight:600,fontSize:13,color:'#374151',marginBottom:5}}>Personne à contacter en urgence</label>
                <input value={formNouv.contact_urgence} onChange={e=>setFormNouv(p=>({...p,contact_urgence:e.target.value}))}
                  placeholder="Nom — Téléphone"
                  style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,boxSizing:'border-box' as const}}/>
              </div>
            </div>
            <button onClick={creerPatient} disabled={!formNouv.nom||!formNouv.prenom} style={{
              marginTop:20,width:'100%',background:'linear-gradient(135deg,#1641C8,#0d9488)',
              color:'white',border:'none',borderRadius:12,padding:'13px',fontWeight:700,cursor:'pointer',fontSize:15,
              opacity:(!formNouv.nom||!formNouv.prenom)?0.5:1
            }}>✓ Créer le dossier patient</button>
          </div>
        )}

        {/* ── REGISTRE RDV ──────────────────────────────────────── */}
        {onglet==='registre' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontWeight:900,fontSize:'1.2rem',margin:0}}>📅 Registre des rendez-vous (30 jours)</h2>
              <button onClick={()=>api.get('/registre-rdv?jours=30').then(r=>setRegistre(r.data?.rdvs||[]))} style={{background:'#1641C8',color:'white',border:'none',borderRadius:10,padding:'8px 16px',fontWeight:700,cursor:'pointer',fontSize:13}}>
                🔄 Actualiser
              </button>
            </div>
            <div style={{background:'white',borderRadius:16,border:'1px solid #e2e8f0',overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{background:'#f8fafc',borderBottom:'1px solid #e2e8f0'}}>
                    {['Date & Heure','Patient','Médecin','Spécialité','Type','Statut','Action'].map(h=>(
                      <th key={h} style={{padding:'10px 14px',textAlign:'left',color:'#64748b',fontWeight:600,fontSize:12}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registre.map((r:any)=>(
                    <tr key={r.id} style={{borderBottom:'1px solid #f8fafc'}}>
                      <td style={{padding:'10px 14px',fontWeight:600,whiteSpace:'nowrap'}}>{new Date(r.date_rdv).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</td>
                      <td style={{padding:'10px 14px'}}><div style={{fontWeight:600}}>{r.patient_nom}</div><div style={{fontSize:11,color:'#94a3b8'}}>{r.motif}</div></td>
                      <td style={{padding:'10px 14px',color:'#64748b'}}>{r.medecin_nom||'—'}</td>
                      <td style={{padding:'10px 14px',color:'#0d9488',fontWeight:600}}>{r.specialite}</td>
                      <td style={{padding:'10px 14px'}}><span style={{background:r.type_rdv==='video'?'#f5f3ff':'#eff6ff',color:r.type_rdv==='video'?'#7c3aed':'#1641C8',borderRadius:50,padding:'2px 10px',fontSize:11,fontWeight:700}}>{r.type_rdv==='video'?'📹 Vidéo':'🏥 Présentiel'}</span></td>
                      <td style={{padding:'10px 14px'}}>
                        <span style={{background:r.statut==='confirme'?'#f0fdf4':r.statut==='en_attente'?'#fffbeb':'#eff6ff',color:r.statut==='confirme'?'#16a34a':r.statut==='en_attente'?'#d97706':'#1641C8',borderRadius:50,padding:'2px 10px',fontSize:11,fontWeight:700}}>
                          {r.statut==='confirme'?'✓ Confirmé':r.statut==='en_attente'?'⏳ En attente':r.statut==='paiement_effectue'?'💳 Payé':r.statut}
                        </span>
                      </td>
                      <td style={{padding:'10px 14px'}}>
                        {(r.statut==='en_attente'||r.statut==='paiement_effectue')&&(
                          <button onClick={()=>api.post(`/rdv/confirmer/${r.id}`,{}).then(()=>{toast.success('RDV confirmé');api.get('/registre-rdv?jours=30').then(res=>setRegistre(res.data?.rdvs||[]))})}
                            style={{background:'#16a34a',color:'white',border:'none',borderRadius:8,padding:'5px 12px',fontWeight:700,cursor:'pointer',fontSize:12}}>
                            ✓ Confirmer
                          </button>
                        )}
                        {r.statut==='confirme'&&r.type_rdv==='presentiel'&&(
                          <button onClick={()=>api.post(`/rdv/initiation-physique/${r.id}`,{}).then(res=>{toast.success(`Patient ${res.data.patient_numero} — Dossier créé`)})}
                            style={{background:'#1641C8',color:'white',border:'none',borderRadius:8,padding:'5px 12px',fontWeight:700,cursor:'pointer',fontSize:12}}>
                            🏥 Initier visite
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {registre.length===0&&<div style={{padding:32,textAlign:'center',color:'#94a3b8'}}>Aucun RDV dans les 30 prochains jours</div>}
            </div>
          </div>
        )}

        {/* ── RAPPORT IA ─────────────────────────────────────────── */}
        {onglet==='rapport' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontWeight:900,fontSize:'1.2rem',margin:0}}>📊 Rapport comptable journalier</h2>
              <div style={{display:'flex',gap:8}}>
                <button onClick={genererRapport} disabled={loadRapport} style={{background:'linear-gradient(135deg,#d97706,#b45309)',color:'white',border:'none',borderRadius:10,padding:'10px 18px',fontWeight:700,cursor:'pointer',fontSize:14}}>
                  {loadRapport?'⏳ Génération...':'🤖 Générer rapport IA'}
                </button>
                {rapport && <button onClick={()=>window.print()} style={{background:'#374151',color:'white',border:'none',borderRadius:10,padding:'10px 14px',fontWeight:700,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',gap:6}}><Printer size={14}/></button>}
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:24}}>
              {[
                {label:'Total encaissé',val:totalJour,c:'#16a34a',bg:'#f0fdf4'},
                {label:'Total décaissé',val:totalDepenses,c:'#dc2626',bg:'#fef2f2'},
                {label:'Solde net',val:totalJour-totalDepenses,c:totalJour-totalDepenses>=0?'#1641C8':'#dc2626',bg:'#eff6ff'},
              ].map(s=>(
                <div key={s.label} style={{background:s.bg,borderRadius:14,padding:20,textAlign:'center',border:'1px solid #e2e8f0'}}>
                  <div style={{fontWeight:900,fontSize:'1.5rem',color:s.c}}>{s.val.toLocaleString('fr-FR')} HTG</div>
                  <div style={{fontSize:13,color:'#64748b',marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            {rapport && (
              <div style={{background:'white',borderRadius:16,padding:28,border:'1px solid #e2e8f0',marginBottom:20}}>
                <div style={{fontWeight:700,color:'#d97706',marginBottom:12,fontSize:15}}>📋 Rapport IA — {new Date().toLocaleDateString('fr-FR')}</div>
                <div style={{fontSize:14,color:'#374151',lineHeight:1.9,whiteSpace:'pre-wrap'}}>{rapport}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal aperçu document */}
      <ModalDocument doc={modalDoc} onClose={()=>setModalDoc(null)} onPrint={()=>window.print()} />
    </div>
  )
}
