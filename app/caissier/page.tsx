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
  {nom:'Chambre Maternité / Jour',prix:15000,cat:'Maternité'},
  {nom:'Suivi prénatal — Consultation',prix:5000,cat:'Maternité'},
  {nom:'Accouchement vaginal spontané',prix:80000,cat:'Maternité'},
  {nom:'Accouchement vaginal après induction',prix:85000,cat:'Maternité'},
  {nom:'Accouchement vaginal jumeaux',prix:100000,cat:'Maternité'},
  {nom:'AVAC (après césarienne)',prix:105000,cat:'Maternité'},
  {nom:'Section Césarienne simple',prix:110000,cat:'Maternité'},
  {nom:'Section Césarienne à faibles risques',prix:130000,cat:'Maternité'},
  {nom:'Section Césarienne à haut risque',prix:160000,cat:'Maternité'},
  {nom:'Ligature des trompes (isolée)',prix:33000,cat:'Maternité'},
  {nom:'Ligature des trompes (avec césarienne)',prix:13000,cat:'Maternité'},
  {nom:'Échographie obstétricale T1',prix:5000,cat:'Maternité'},
  {nom:'Échographie obstétricale T2',prix:5000,cat:'Maternité'},
  {nom:'Échographie obstétricale T3',prix:5000,cat:'Maternité'},
  {nom:'Échographie avec Doppler',prix:10000,cat:'Maternité'},
  {nom:'Non Stress Test (NST)',prix:13000,cat:'Maternité'},
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
    contact_urgence:'', type_visite:'premiere' as 'premiere'|'rdv',
    service: SERVICES_TARIFS[0].nom, montant: SERVICES_TARIFS[0].prix,
    mode_paiement: 'especes', priorite: 'normal'
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
    api.get('/labo/tarifs').then(r => setTarifsLabo(r.data || [])).catch(() => {})
    api.get('/caissier/taux-change').then(r => setTauxChange(r.data?.taux_htg || 130)).catch(() => {})
    api.get('/specialistes').then(r => setSpecialistes(r.data || [])).catch(() => {})
    api.get('/tarifs-medecins').then(r => setTarifs(r.data || [])).catch(() => {})
    api.get('/tarifs/gestes').then(r => setCatalogueGestes(r.data?.gestes || [])).catch(() => {})
    api.get('/dentiste/tarifs').then(r => setTarifsDentiste(r.data || [])).catch(() => {})
    api.get('/pharmacie/stocks').then(r => setStocksPharmacie((r.data || []).filter((s:any) => s.quantite > 0))).catch(() => {})
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
    if (!formDepense.categorie) { toast.error('Catégorie requise'); return }
    setLoadingDepense(true)
    try {
      const r = await api.post('/caissier/depense', formDepense)
      toast.success('Dépense enregistrée ✓')
      setDepenses(prev => [r.data, ...prev])
      setTotalDepenses(prev => prev + formDepense.montant)
      setFormDepense({categorie:CATEGORIES_DEPENSES[0],description:'',montant:0,mode:'especes'})
    } catch (e: any) { toast.error(e?.response?.data?.detail||'Erreur enregistrement dépense') }
    finally { setLoadingDepense(false) }
  }

  const [loadingDepense, setLoadingDepense] = useState(false)
  const [queueResult, setQueueResult] = useState<any>(null)
  const [tarifsLabo, setTarifsLabo] = useState<any[]>([])
  const [tarifs, setTarifs] = useState<any[]>([])       // TarifMedecin: medecin_nom + specialite + prix_consultation
  const [specialistes, setSpecialistes] = useState<any[]>([])
  const [tauxChange, setTauxChange] = useState<number>(130)
  const [nouveauTaux, setNouveauTaux] = useState<string>('')
  const [catalogueGestes, setCatalogueGestes] = useState<any[]>([])
  const [tarifsDentiste, setTarifsDentiste] = useState<any[]>([])
  const [stocksPharmacie, setStocksPharmacie] = useState<any[]>([])
  const [previewNumero, setPreviewNumero] = useState<string>('')

  // Affiche le prochain ID estimé dès que le nom est saisi
  useEffect(() => {
    if (formNouv.nom && formNouv.prenom) {
      api.get('/caissier/dernier-patient').then(r => {
        const last = r.data?.patient?.numero
        if (last && last.startsWith('#RB-')) {
          const n = parseInt(last.replace('#RB-', '')) + 1
          setPreviewNumero(`#RB-${String(n).padStart(4, '0')}`)
        } else {
          setPreviewNumero('#RB-0001')
        }
      }).catch(() => setPreviewNumero('#RB-????'))
    } else {
      setPreviewNumero('')
    }
  }, [formNouv.nom, formNouv.prenom])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Recalculer le prix HTG des gestes médicaux si le taux de change est modifié
  useEffect(() => {
    if ((formNouv as any).serviceType === 'geste' && formNouv.service && catalogueGestes.length > 0) {
      const g = catalogueGestes.find((x:any) => x.libelle === formNouv.service)
      if (g && g.prix_usd > 0) {
        const htg = Math.round((g.prix_clinique_usd || g.prix_usd) * tauxChange)
        setFormNouv((p:any) => ({...p, montant: htg, prixBase: htg, remisePct: 0}))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tauxChange])

  const enregistrerVisite = async () => {
    if (!formNouv.nom || !formNouv.prenom) { toast.error('Nom et prénom requis'); return }
    if (!formNouv.telephone) { toast.error('Téléphone requis'); return }
    try {
      const r = await api.post('/caissier/enregistrer-visite', {
        ...formNouv,
        service: formNouv.service,
        montant: formNouv.montant,
        mode_paiement: formNouv.mode_paiement,
        priorite: formNouv.priorite,
        medecin_nom: (formNouv as any).praticien || '',
        praticien: (formNouv as any).praticien || '',
      })
      setQueueResult(r.data)
      toast.success(`✓ Patient ${r.data.patient?.numero} — Ticket #${r.data.ticket} envoyé à l'infirmière`)
      // Imprimer la facture automatiquement (appel direct dans le même tick)
      imprimerFacture(r.data)
      setFormNouv({ nom:'', prenom:'', age:'', adresse:'', telephone:'', email:'',
        contact_urgence:'', type_visite:'premiere', service: SERVICES_TARIFS[0].nom,
        montant: SERVICES_TARIFS[0].prix, mode_paiement:'especes', priorite:'normal' })
    } catch (e: any) { toast.error(e?.response?.data?.detail||'Erreur') }
  }

  const retrouverDernierPatient = async () => {
    try {
      const r = await api.get('/caissier/dernier-patient')
      if (r.data.patient) {
        setQueueResult({ patient: r.data.patient, ticket: '—', service: '—', montant: 0 })
        toast.success(`Dernier patient: ${r.data.patient.prenom} ${r.data.patient.nom} — ${r.data.patient.numero}`)
      } else toast("Aucun patient enregistré aujourd'hui")
    } catch { toast.error('Erreur') }
  }

  const imprimerFacture = (data: any) => {
    const patient = data.patient || {}
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Facture ${patient.numero}</title>
<style>
  body{font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px;font-size:13px}
  .header{text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:15px}
  .logo{font-size:20px;font-weight:900;color:#1641C8}
  .ticket{font-size:40px;font-weight:900;text-align:center;color:#1641C8;letter-spacing:3px;margin:10px 0}
  .row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dotted #ccc}
  .total{font-size:18px;font-weight:900;text-align:right;margin-top:10px;padding:8px 0;border-top:2px solid #000}
  .footer{text-align:center;margin-top:15px;font-size:11px;color:#666}
  .id{font-size:32px;font-weight:900;font-family:monospace;text-align:center;background:#f0f9ff;padding:8px;border-radius:8px;margin:10px 0}
  @media print{button{display:none}}
</style>
</head><body>
<div class="header">
  <div class="logo">🏥 Clinique de la Rebecca</div>
  <div style="font-size:11px;color:#666">Pétion-Ville, Haïti · Tel: (509) 4858-5757</div>
  <div style="font-size:11px;margin-top:4px">Reçu de paiement</div>
  <div style="font-size:11px">${new Date().toLocaleString('fr-FR')}</div>
</div>
<div class="id">${patient.numero || '#—'}</div>
<div class="ticket">#${data.ticket || '—'}</div>
<table style="width:100%">
  <tr class="row"><td>Patient</td><td><strong>${patient.nom || ''}</strong></td></tr>
  <tr class="row"><td>Téléphone</td><td>${patient.telephone || '—'}</td></tr>
  <tr class="row"><td>Service</td><td><strong>${data.service || '—'}</strong></td></tr>
  <tr class="row"><td>Mode paiement</td><td>${data.mode_paiement || 'Espèces'}</td></tr>
  ${data.montant > 0 ? `<tr><td colspan="2" class="total">Total: ${data.montant?.toLocaleString('fr-FR')} HTG</td></tr>` : ''}
</table>
<div class="footer">
  Présentez ce ticket à l'infirmière<br>
  Clinique de la Rebecca — Tous droits réservés<br>
  ${data.rdv_id ? 'RDV #' + data.rdv_id : ''}
</div>
<br><button onclick="window.print()" style="width:100%;padding:10px;background:#1641C8;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:700">🖨 Imprimer</button>
</body></html>`
    const w = window.open('', '_blank', 'width=450,height=600')
    if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(), 300) }
  }

  const rechercherPatient = async () => {
    if (searchQuery.length < 2) return
    try {
      const r = await api.get(`/caissier/recherche-patient?q=${encodeURIComponent(searchQuery)}`)
      setSearchResults(r.data.patients || [])
    } catch { toast.error('Erreur recherche') }
  }

  const creerPatient = enregistrerVisite

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
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#f8fafc',borderRadius:8,padding:'6px 10px',border:'1px solid #e2e8f0'}}>
              <span style={{fontSize:11,color:'#94a3b8'}}>1 USD =</span>
              <span style={{fontFamily:'monospace',fontWeight:700,color:'#1641C8'}}>{tauxChange.toLocaleString()} HTG</span>
              <input value={nouveauTaux} onChange={e=>setNouveauTaux(e.target.value)} onKeyDown={async e=>{
                if(e.key==='Enter'&&nouveauTaux){
                  const t=parseFloat(nouveauTaux)
                  if(t>0){await api.post('/caissier/taux-change',{taux_htg:t});setTauxChange(t);setNouveauTaux('');toast.success(`Taux: 1 USD = ${t} HTG`)}
                }
              }} placeholder="Nouveau taux" style={{width:80,padding:'3px 6px',borderRadius:6,border:'1px solid #d1d5db',fontSize:12,fontFamily:'monospace'}}/>
            </div>
            <div style={{color:'#64748b',fontSize:13}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>
          </div>
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
              <button onClick={enregistrerDepense} disabled={!formDepense.montant||!formDepense.description||loadingDepense} style={{
                width:'100%',background:'linear-gradient(135deg,#dc2626,#b91c1c)',color:'white',
                border:'none',borderRadius:10,padding:'12px',fontWeight:700,cursor:'pointer',fontSize:14,
                opacity:(!formDepense.montant||!formDepense.description||loadingDepense)?0.5:1
              }}>{loadingDepense ? '⏳ Enregistrement...' : '✓ Enregistrer la dépense'}</button>
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
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,alignItems:'start'}}>
            {/* Formulaire */}
            <div style={{background:'white',borderRadius:16,padding:24,border:'1px solid #e2e8f0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                <div>
                  <h2 style={{fontWeight:800,fontSize:'1.05rem',color:'#0f172a',margin:0}}>👤 Enregistrer un patient</h2>
                  <p style={{color:'#64748b',fontSize:12,margin:'4px 0 0'}}>Le ticket est envoyé à l'infirmière automatiquement.</p>
                </div>
                {previewNumero && (
                  <div style={{background:'linear-gradient(135deg,#0f172a,#1641C8)',borderRadius:10,padding:'8px 14px',textAlign:'center'}}>
                    <div style={{color:'rgba(255,255,255,0.5)',fontSize:9,textTransform:'uppercase',letterSpacing:1}}>ID attribué</div>
                    <div style={{color:'white',fontFamily:'monospace',fontWeight:900,fontSize:18,letterSpacing:1}}>{previewNumero}</div>
                  </div>
                )}
              </div>

              {/* Urgence */}
              <div style={{display:'flex',gap:8,marginBottom:14}}>
                {[{k:'normal',l:'Normal',c:'#1641C8'},{k:'urgent',l:'🚨 Urgent',c:'#dc2626'}].map(p=>(
                  <button key={p.k} type="button" onClick={()=>setFormNouv(f=>({...f,priorite:p.k}))} style={{
                    flex:1,padding:'8px',borderRadius:8,border:`2px solid ${formNouv.priorite===p.k?p.c:'#e2e8f0'}`,
                    background:formNouv.priorite===p.k?`${p.c}15`:'white',fontWeight:700,fontSize:13,cursor:'pointer',color:formNouv.priorite===p.k?p.c:'#94a3b8'
                  }}>{p.l}</button>
                ))}
              </div>

              {/* Infos patient */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                {[
                  {k:'prenom',l:'Prénom *',ph:'Jean'},
                  {k:'nom',l:'NOM *',ph:'PIERRE'},
                  {k:'telephone',l:'Téléphone *',ph:'36186469'},
                  {k:'age',l:'Âge',ph:'35'},
                  {k:'adresse',l:'Adresse',ph:'Pétion-Ville'},
                  {k:'email',l:'Email',ph:'jean@email.com'},
                ].map(f=>(
                  <div key={f.k}>
                    <label style={{display:'block',fontWeight:600,fontSize:12,color:'#374151',marginBottom:4}}>{f.l}</label>
                    <input value={(formNouv as any)[f.k]} onChange={e=>setFormNouv(p=>({...p,[f.k]:e.target.value}))}
                      placeholder={f.ph}
                      style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}}/>
                  </div>
                ))}
                <div style={{gridColumn:'1/-1'}}>
                  <label style={{display:'block',fontWeight:600,fontSize:12,color:'#374151',marginBottom:4}}>Urgence — personne à contacter</label>
                  <input value={formNouv.contact_urgence} onChange={e=>setFormNouv(p=>({...p,contact_urgence:e.target.value}))}
                    placeholder="Nom — Téléphone" style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}}/>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════
                  SÉLECTION SERVICE — logique: Type → Branche/Examen → Praticien → Prix
                  ═══════════════════════════════════════════════════════════ */}
              {(() => {
                const TYPES = [
                  {id:'clinique',    icon:'🏥', label:'Clinique Ext.'},
                  {id:'maternite',   icon:'🤱', label:'Maternité'},
                  {id:'dentisterie', icon:'🦷', label:'Dentisterie'},
                  {id:'physio',      icon:'🦴', label:'Physio'},
                  {id:'optometrie',  icon:'👁', label:'Optométrie'},
                  {id:'labo',        icon:'🔬', label:'Laboratoire'},
                  {id:'pharmacie',   icon:'💊', label:'Pharmacie'},
                  {id:'observation', icon:'🛏', label:'Observation'},
                  {id:'sop',         icon:'🔪', label:'SOP'},
                  {id:'geste',       icon:'⚕', label:'Geste médical'},
                ]
                const ST  = (formNouv as any).serviceType    || ''
                const SC  = (formNouv as any).serviceSousCat || ''   // branche/spécialité choisie
                const PS  = (formNouv as any).pharmSearch    || ''   // texte autocomplete
                const LS  = (formNouv as any).laboSearch     || ''   // texte autocomplete labo
                const PRIX_BASE = (formNouv as any).prixBase  || 0   // prix original avant override
                const PRAT = (formNouv as any).praticien      || ''  // praticien saisi ou choisi

                // Helpers
                const resetSvc = (type: string) =>
                  setFormNouv((p:any) => ({...p,
                    serviceType:type, serviceSousCat:'', pharmSearch:'', laboSearch:'',
                    service:'', montant:0, prixBase:0, praticien:'', remisePct:0
                  }))

                const setSousCat = (sc: string) =>
                  setFormNouv((p:any) => ({...p, serviceSousCat:sc, service:'', montant:0, prixBase:0, praticien:''}))

                const setService = (nom: string, prix: number) =>
                  setFormNouv((p:any) => ({...p, service:nom, montant:prix, prixBase:prix, remisePct:0}))

                const setPraticien = (nom: string, prix?: number) =>
                  setFormNouv((p:any) => ({
                    ...p, praticien:nom,
                    ...(prix != null ? { montant:prix, prixBase:prix, remisePct:0 } : {})
                  }))

                const applyOverride = (remisePct: number, prixDirect?: number) => {
                  if (prixDirect != null) {
                    setFormNouv((p:any) => ({...p, montant:prixDirect, remisePct:0}))
                  } else {
                    const base = (formNouv as any).prixBase || formNouv.montant
                    setFormNouv((p:any) => ({...p, montant:Math.round(base*(1-remisePct/100)), remisePct}))
                  }
                }

                // Branches / spécialités disponibles dans les tarifs médecins
                const BRANCHES = [...new Set(tarifs.filter((t:any)=>t.actif).map((t:any)=>t.specialite))].sort()

                // Médecins de la branche choisie
                const MEDECINS_BRANCHE = SC
                  ? tarifs.filter((t:any) => t.actif && t.specialite?.toLowerCase().includes(SC.toLowerCase()))
                  : []

                // Labo suggestions
                const LABO_SUGG = LS.length >= 2
                  ? tarifsLabo.filter((t:any) => t.libelle?.toLowerCase().includes(LS.toLowerCase())).slice(0,8)
                  : []

                // Pharmacie suggestions
                const PHARMA_SUGG = PS.length >= 2
                  ? stocksPharmacie.filter((s:any) => s.nom?.toLowerCase().includes(PS.toLowerCase())).slice(0,8)
                  : []

                const inlineInput: any = {
                  width:'100%', padding:'8px 10px', borderRadius:7,
                  border:'1px solid #d1d5db', fontSize:13, boxSizing:'border-box'
                }
                const selectStyle: any = {
                  width:'100%', padding:'8px 10px', borderRadius:7,
                  border:'1px solid #1641C8', fontSize:13, background:'white'
                }

                return (
                  <div style={{marginBottom:12}}>
                    <label style={{display:'block',fontWeight:600,fontSize:12,color:'#374151',marginBottom:6}}>Service *</label>

                    {/* Étape 1 — Type de service */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:4,marginBottom:10}}>
                      {TYPES.map(t => (
                        <button key={t.id} type="button" onClick={() => resetSvc(t.id)} style={{
                          padding:'6px 3px', borderRadius:7, cursor:'pointer', fontSize:10, fontWeight:600,
                          textAlign:'center' as const, lineHeight:1.4,
                          border:`2px solid ${ST===t.id?'#1641C8':'#e2e8f0'}`,
                          background: ST===t.id?'#eff6ff':'#fafafa',
                          color: ST===t.id?'#1641C8':'#64748b',
                        }}>{t.icon}<br/>{t.label}</button>
                      ))}
                    </div>

                    {/* ── CLINIQUE EXTERNE: Branche → Médecin de la branche → Prix ── */}
                    {ST==='clinique' && (
                      <div style={{display:'flex',flexDirection:'column' as const,gap:6}}>
                        {/* Étape 2: Choisir la branche/spécialité */}
                        <select value={SC} onChange={e => setSousCat(e.target.value)} style={selectStyle}>
                          <option value="">Branche / Spécialité...</option>
                          {/* Branches issues des tarifs médecins */}
                          {BRANCHES.map((b:any) => <option key={b} value={b}>{b}</option>)}
                          {/* Fallback si pas de tarifs médecins */}
                          {BRANCHES.length === 0 && ['Médecine interne','Gynécologie','Pédiatrie','Chirurgie','Orthopédie','Neurologie','Cardiologie','Dermatologie','ORL','Urologie','Psychiatrie'].map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>

                        {/* Étape 3a: Si médecins disponibles dans cette branche */}
                        {SC && MEDECINS_BRANCHE.length > 0 && (
                          <select value={PRAT} onChange={e => {
                            const val = e.target.value
                            if (val === '__autre__') {
                              setPraticien('__autre__')
                            } else {
                              const t = tarifs.find((x:any) => x.medecin_nom === val)
                              setPraticien(val, t?.prix_consultation || 0)
                              setFormNouv((p:any) => ({...p, service: `${SC} — ${val}`}))
                            }
                          }} style={selectStyle}>
                            <option value="">Choisir le médecin...</option>
                            {MEDECINS_BRANCHE.map((t:any) => (
                              <option key={t.id} value={t.medecin_nom}>
                                {t.medecin_nom}{t.prix_consultation > 0 ? ` — ${t.prix_consultation.toLocaleString()} HTG` : ''}
                              </option>
                            ))}
                            <option value="__autre__">— Autre praticien (saisir) —</option>
                          </select>
                        )}

                        {/* Étape 3b: Champ texte libre si pas de liste OU si "Autre" sélectionné */}
                        {SC && (MEDECINS_BRANCHE.length === 0 || PRAT === '__autre__') && (
                          <input value={PRAT === '__autre__' ? '' : PRAT} onChange={e => {
                            setPraticien(e.target.value)
                            setFormNouv((p:any) => ({...p, service:`${SC}${e.target.value?` — ${e.target.value}`:''}`}))
                          }} placeholder="Nom du praticien..." style={inlineInput} autoFocus={PRAT === '__autre__'} />
                        )}
                      </div>
                    )}

                    {/* ── MATERNITÉ ── */}
                    {ST==='maternite' && (
                      <div style={{display:'flex',flexDirection:'column' as const,gap:6}}>
                        <select value={formNouv.service} onChange={e => {
                          const t = SERVICES_TARIFS.find((x:any) => x.nom===e.target.value)
                          setService(e.target.value, t?.prix||0)
                        }} style={selectStyle}>
                          <option value="">Prestation maternité...</option>
                          {SERVICES_TARIFS.filter((s:any) => s.cat==='Maternité').map((s:any) => (
                            <option key={s.nom} value={s.nom}>{s.nom}{s.prix>0?` — ${s.prix.toLocaleString()} HTG`:''}</option>
                          ))}
                        </select>
                        <input value={PRAT} onChange={e => setPraticien(e.target.value)}
                          placeholder="Médecin / sage-femme (optionnel)" style={inlineInput} />
                        {/* Liste médecins gynéco si disponibles */}
                        {tarifs.filter((t:any)=>t.actif&&/gyn|obst|matern/i.test(t.specialite||'')).length > 0 && (
                          <select value={PRAT} onChange={e => setPraticien(e.target.value)} style={{...inlineInput,borderColor:'#e2e8f0'}}>
                            <option value="">Ou choisir parmi la liste...</option>
                            {tarifs.filter((t:any)=>t.actif&&/gyn|obst|matern/i.test(t.specialite||'')).map((t:any) => (
                              <option key={t.id} value={t.medecin_nom}>{t.medecin_nom}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    {/* ── DENTISTERIE ── */}
                    {ST==='dentisterie' && (
                      <div style={{display:'flex',flexDirection:'column' as const,gap:6}}>
                        <select value={formNouv.service} onChange={e => {
                          const t = SERVICES_TARIFS.find((x:any)=>x.nom===e.target.value)||tarifsDentiste.find((x:any)=>x.libelle===e.target.value)
                          setService(e.target.value, (t as any)?.prix||(t as any)?.montant||0)
                        }} style={selectStyle}>
                          <option value="">Acte dentaire...</option>
                          {SERVICES_TARIFS.filter((s:any)=>s.cat==='Dentisterie').map((s:any)=>(
                            <option key={s.nom} value={s.nom}>{s.nom} — {s.prix.toLocaleString()} HTG</option>
                          ))}
                          {tarifsDentiste.length>0&&<option disabled>── Tarifs complets ──</option>}
                          {tarifsDentiste.map((t:any)=>(
                            <option key={t.id} value={t.libelle}>{t.libelle}{t.montant>0?` — ${t.montant.toLocaleString()} HTG`:''}</option>
                          ))}
                        </select>
                        <input value={PRAT} onChange={e => setPraticien(e.target.value)}
                          placeholder="Dentiste / praticien (optionnel)" style={inlineInput} />
                      </div>
                    )}

                    {/* ── PHYSIO / OPTOMÉTRIE / OBSERVATION / SOP ── */}
                    {(ST==='physio'||ST==='optometrie'||ST==='observation'||ST==='sop') && (
                      <div style={{display:'flex',flexDirection:'column' as const,gap:6}}>
                        <select value={formNouv.service} onChange={e => {
                          const t = SERVICES_TARIFS.find((x:any)=>x.nom===e.target.value)
                          setService(e.target.value, t?.prix||0)
                        }} style={selectStyle}>
                          <option value="">Prestation...</option>
                          {SERVICES_TARIFS.filter((s:any) =>
                            (ST==='physio'&&s.cat==='Physiothérapie')||(ST==='optometrie'&&s.cat==='Optométrie')||
                            (ST==='observation'&&(s.cat==='Observation'||s.cat==='Hospitalisation'))||(ST==='sop'&&s.cat==='SOP')
                          ).map((s:any)=>(
                            <option key={s.nom} value={s.nom}>{s.nom} — {s.prix.toLocaleString()} HTG</option>
                          ))}
                        </select>
                        <input value={PRAT} onChange={e => setPraticien(e.target.value)}
                          placeholder="Praticien responsable (optionnel)" style={inlineInput} />
                      </div>
                    )}

                    {/* ── LABORATOIRE: autocomplete examens ── */}
                    {ST==='labo' && (
                      <div style={{position:'relative'}}>
                        <input value={LS} onChange={e => setFormNouv((p:any)=>({...p,laboSearch:e.target.value,service:'',montant:0,prixBase:0}))}
                          placeholder="Saisir le nom de l'examen..." style={selectStyle} autoComplete="off"/>
                        {LABO_SUGG.length > 0 && (
                          <div style={{position:'absolute',top:'100%',left:0,right:0,background:'white',border:'1px solid #e2e8f0',borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,0.12)',zIndex:100,maxHeight:200,overflowY:'auto'}}>
                            {LABO_SUGG.map((t:any) => {
                              const prix = t.montant_usd ? Math.round(t.montant_usd*tauxChange) : (t.montant||0)
                              return (
                                <div key={t.id} onClick={() => {
                                  setFormNouv((p:any)=>({...p,laboSearch:t.libelle,service:t.libelle,montant:prix,prixBase:prix,remisePct:0}))
                                }} style={{padding:'8px 12px',cursor:'pointer',fontSize:13,borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between'}}>
                                  <span>{t.libelle}</span>
                                  {prix > 0 && <span style={{color:'#0d9488',fontWeight:700}}>{prix.toLocaleString()} HTG</span>}
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {LS.length >= 2 && LABO_SUGG.length === 0 && (
                          <div style={{marginTop:4,padding:'6px 10px',background:'#fef9c3',borderRadius:7,fontSize:12,color:'#92400e',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span>"{LS}" non trouvé dans la liste</span>
                            <button onClick={() => setService(LS, 0)} style={{background:'#d97706',color:'white',border:'none',borderRadius:5,padding:'3px 8px',cursor:'pointer',fontSize:11,fontWeight:700}}>Utiliser quand même</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── PHARMACIE: autocomplete médicaments ── */}
                    {ST==='pharmacie' && (
                      <div style={{position:'relative'}}>
                        <input value={PS} onChange={e => setFormNouv((p:any)=>({...p,pharmSearch:e.target.value,service:'',montant:0,prixBase:0}))}
                          placeholder="Saisir le nom du médicament..." style={selectStyle} autoComplete="off"/>
                        {PHARMA_SUGG.length > 0 && (
                          <div style={{position:'absolute',top:'100%',left:0,right:0,background:'white',border:'1px solid #e2e8f0',borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,0.12)',zIndex:100,maxHeight:200,overflowY:'auto'}}>
                            {PHARMA_SUGG.map((s:any) => (
                              <div key={s.id} onClick={() => setService(s.nom, s.prix_unitaire||0)}
                                style={{padding:'8px 12px',cursor:'pointer',fontSize:13,borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between'}}>
                                <span>{s.nom} <span style={{color:'#94a3b8',fontSize:11}}>({s.quantite} {s.unite})</span></span>
                                {s.prix_unitaire > 0 && <span style={{color:'#0d9488',fontWeight:700}}>{s.prix_unitaire.toLocaleString()} HTG</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {PS.length >= 2 && PHARMA_SUGG.length === 0 && (
                          <div style={{marginTop:4,padding:'6px 10px',background:'#fef9c3',borderRadius:7,fontSize:12,color:'#92400e',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span>"{PS}" non en stock</span>
                            <button onClick={() => setService(PS, 0)} style={{background:'#d97706',color:'white',border:'none',borderRadius:5,padding:'3px 8px',cursor:'pointer',fontSize:11,fontWeight:700}}>Utiliser quand même</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── GESTE MÉDICAL: spécialité → geste du catalogue ── */}
                    {ST==='geste' && (
                      <div style={{display:'flex',flexDirection:'column' as const,gap:6}}>
                        <select value={SC} onChange={e => setSousCat(e.target.value)} style={selectStyle}>
                          <option value="">Spécialité médicale...</option>
                          {[...new Set(catalogueGestes.map((g:any)=>g.specialite))].sort().map((s:any) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {SC && (
                          <select value={formNouv.service} onChange={e => {
                            const g = catalogueGestes.find((x:any)=>x.libelle===e.target.value)
                            const htg = g && g.prix_usd > 0 ? Math.round((g.prix_clinique_usd||g.prix_usd)*tauxChange) : (g?.prix_htg_ref||0)
                            setService(e.target.value, htg)
                          }} style={selectStyle}>
                            <option value="">Geste / acte...</option>
                            {catalogueGestes.filter((g:any)=>g.specialite===SC).map((g:any) => {
                              const htg = g.prix_usd>0 ? Math.round((g.prix_clinique_usd||g.prix_usd)*tauxChange) : 0
                              return (
                                <option key={g.id} value={g.libelle}>
                                  {g.libelle}{htg>0?` — $${g.prix_usd} (${htg.toLocaleString()} HTG)`:g.prix_htg_ref?` — ${g.prix_htg_ref.toLocaleString()} HTG ref.`:''}
                                </option>
                              )
                            })}
                          </select>
                        )}
                        <input value={PRAT} onChange={e => setPraticien(e.target.value)}
                          placeholder="Praticien responsable (optionnel)" style={inlineInput} />
                      </div>
                    )}

                    {/* ── PRIX OVERRIDE (tous services sauf pharmacie/labo) ── */}
                    {formNouv.service && ST !== 'pharmacie' && (
                      <div style={{marginTop:8,background:'#f8fafc',borderRadius:8,padding:'10px 12px',border:'1px solid #e2e8f0'}}>
                        <div style={{fontSize:11,color:'#94a3b8',marginBottom:6,fontWeight:600}}>Ajustement du prix</div>
                        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap' as const}}>
                          <span style={{fontSize:12,color:'#374151'}}>Remise</span>
                          <input type="number" min="0" max="100" placeholder="0" value={(formNouv as any).remisePct||''}
                            onChange={e => applyOverride(parseInt(e.target.value)||0)}
                            style={{width:56,padding:'5px 7px',borderRadius:6,border:'1px solid #d1d5db',fontSize:12,textAlign:'right' as const}}/>
                          <span style={{fontSize:12,color:'#374151'}}>%</span>
                          <span style={{color:'#cbd5e1',fontSize:12}}>|</span>
                          <span style={{fontSize:12,color:'#374151'}}>Nouveau prix</span>
                          <input type="number" placeholder={String(PRIX_BASE||formNouv.montant||0)} value={formNouv.montant||''}
                            onChange={e => applyOverride(0, parseInt(e.target.value)||0)}
                            style={{width:90,padding:'5px 7px',borderRadius:6,border:'1px solid #d1d5db',fontSize:12,textAlign:'right' as const}}/>
                          <span style={{fontSize:12,color:'#374151'}}>HTG</span>
                          {PRIX_BASE > 0 && formNouv.montant !== PRIX_BASE && (
                            <button onClick={() => setFormNouv((p:any)=>({...p,montant:PRIX_BASE,remisePct:0}))}
                              style={{background:'#f1f5f9',border:'none',borderRadius:5,padding:'4px 8px',cursor:'pointer',fontSize:11,color:'#64748b'}}>
                              Réinitialiser ({PRIX_BASE.toLocaleString()} HTG)
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Confirmation */}
                    {formNouv.service && (
                      <div style={{marginTop:6,padding:'6px 12px',background:'#f0fdf4',border:'1px solid #86efac',borderRadius:7,fontSize:12,color:'#16a34a',fontWeight:600,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span>✓ {formNouv.service}{PRAT?` · ${PRAT}`:''}</span>
                        {formNouv.montant > 0 && (
                          <span style={{fontFamily:'monospace'}}>
                            {formNouv.montant.toLocaleString()} HTG
                            {(formNouv as any).remisePct > 0 && <span style={{color:'#d97706',marginLeft:4}}>(-{(formNouv as any).remisePct}%)</span>}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}
              {/* Montant */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div>
                  <label style={{display:'block',fontWeight:600,fontSize:12,color:'#374151',marginBottom:4}}>Montant (HTG)</label>
                  <input type="number" value={formNouv.montant||''} onChange={e=>setFormNouv(p=>({...p,montant:parseInt(e.target.value)||0}))}
                    style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,fontWeight:700,boxSizing:'border-box' as const}}/>
                </div>
                <div>
                  <label style={{display:'block',fontWeight:600,fontSize:12,color:'#374151',marginBottom:4}}>Mode paiement</label>
                  <select value={formNouv.mode_paiement} onChange={e=>setFormNouv(p=>({...p,mode_paiement:e.target.value}))}
                    style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,background:'white'}}>
                    {['especes','moncash','natcash','carte'].map(m=><option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={enregistrerVisite} disabled={!formNouv.nom||!formNouv.prenom||!formNouv.telephone} style={{
                width:'100%',background:'linear-gradient(135deg,#1641C8,#0d9488)',
                color:'white',border:'none',borderRadius:12,padding:'13px',fontWeight:700,cursor:'pointer',fontSize:14,
                opacity:(!formNouv.nom||!formNouv.prenom||!formNouv.telephone)?0.5:1,marginTop:4
              }}>✓ Enregistrer &amp; Envoyer à l'infirmière</button>

              <div style={{marginTop:10,textAlign:'center'}}>
                <button onClick={retrouverDernierPatient} style={{background:'none',border:'none',color:'#94a3b8',fontSize:12,cursor:'pointer',textDecoration:'underline'}}>
                  Retrouver le dernier patient enregistré
                </button>
              </div>
            </div>

            {/* Résultat + recherche */}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {/* Ticket généré */}
              {queueResult && (
                <div style={{background:'linear-gradient(135deg,#0f172a,#1641C8)',borderRadius:16,padding:24,color:'white'}}>
                  <div style={{fontSize:11,opacity:0.6,marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>Ticket patient</div>
                  <div style={{fontSize:32,fontWeight:900,fontFamily:'monospace',letterSpacing:2,marginBottom:8}}>
                    #{queueResult.ticket}
                  </div>
                  <div style={{fontSize:20,fontWeight:800,marginBottom:2}}>{queueResult.patient?.numero}</div>
                  <div style={{fontSize:15,opacity:0.8,marginBottom:12}}>{queueResult.patient?.nom}</div>
                  <div style={{background:'rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 12px',fontSize:13}}>
                    <div>📋 Service: <strong>{queueResult.service}</strong></div>
                    {queueResult.montant>0 && <div>💰 Payé: <strong>{queueResult.montant?.toLocaleString()} HTG</strong></div>}
                  </div>
                  <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{fontSize:12,opacity:0.6}}>✅ Envoyé à l'infirmière</div>
                    <button onClick={()=>imprimerFacture(queueResult)} style={{background:'rgba(255,255,255,0.2)',color:'white',border:'1px solid rgba(255,255,255,0.4)',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:700}}>
                      🖨 Imprimer reçu
                    </button>
                  </div>
                </div>
              )}

              {/* Recherche patient */}
              <div style={{background:'white',borderRadius:16,padding:20,border:'1px solid #e2e8f0'}}>
                <h3 style={{fontWeight:700,fontSize:13,margin:'0 0 12px',color:'#374151'}}>🔍 Rechercher un patient existant</h3>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&rechercherPatient()}
                    placeholder="Nom, téléphone ou #RB-XXXX"
                    style={{flex:1,padding:'9px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13}}/>
                  <button onClick={rechercherPatient} style={{background:'#1641C8',color:'white',border:'none',borderRadius:8,padding:'9px 14px',fontWeight:700,cursor:'pointer',fontSize:13}}>
                    Chercher
                  </button>
                </div>
                {searchResults.map((p:any)=>(
                  <div key={p.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 10px',borderRadius:8,background:'#f8fafc',marginBottom:6,fontSize:13,cursor:'pointer'}}
                    onClick={()=>{setPatient(p);setOnglet('paiement');toast.success(`Patient sélectionné: ${p.nom}`)}}>
                    <div>
                      <div style={{fontWeight:700}}>{p.prenom} {p.nom}</div>
                      <div style={{color:'#64748b',fontSize:12}}>{p.telephone}</div>
                    </div>
                    <div style={{fontFamily:'monospace',color:'#1641C8',fontWeight:700,alignSelf:'center'}}>{p.numero}</div>
                  </div>
                ))}
                {searchResults.length===0 && searchQuery.length>1 && (
                  <p style={{color:'#94a3b8',fontSize:12,textAlign:'center'}}>Aucun résultat</p>
                )}
              </div>
            </div>
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
