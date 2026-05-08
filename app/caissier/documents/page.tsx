'use client'
import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ChevronLeft, Search, Printer, FileText, AlertCircle, Lock } from 'lucide-react'

interface DocInfo { type: string; label: string; icone: string; disponible: boolean; nb_transactions?: number; nb_resultats?: number }
interface SearchResult { patient_numero: string; patient_nom: string; documents: DocInfo[] }

function PrintModal({ title, couleur, children, onClose }: any) {
 return (
 <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
 <div style={{ background:'white', borderRadius:18, width:'100%', maxWidth:680, maxHeight:'90vh', overflowY:'auto' }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid #e2e8f0' }}>
 <h3 style={{ fontWeight:800, margin:0, fontSize:15 }}>{title}</h3>
 <div style={{ display:'flex', gap:10 }}>
 <button onClick={() => window.print()} style={{ background:couleur, color:'white', border:'none', borderRadius:10, padding:'8px 18px', fontWeight:700, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
 <Printer size={13} /> Imprimer
 </button>
 <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', borderRadius:10, padding:'8px 14px', cursor:'pointer', fontWeight:600, color:'#374151', fontSize:13 }}>Fermer</button>
 </div>
 </div>
 <div style={{ padding:24 }}>{children}</div>
 </div>
 </div>
 )
}

export default function CaissierDocumentsPage() {
 const [patientId, setPatientId] = useState('')
 const [result, setResult] = useState<SearchResult | null>(null)
 const [error, setError] = useState('')
 const [loading, setLoading] = useState(false)
 const [modal, setModal] = useState<{type:string; data:any} | null>(null)

 const chercher = async () => {
 const id = patientId.trim().toUpperCase()
 if (!id) return
 setLoading(true); setError(''); setResult(null)
 try {
 const r = await api.get(`/caissier/documents-disponibles/${id}`)
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
 setModal({ type, data: r.data })
 } catch { alert('Aucun résultat disponible') }
 } else {
 setModal({ type, data: { patient_numero: result.patient_numero, patient_nom: result.patient_nom } })
 }
 }

 const renderModal = () => {
 if (!modal) return null
 const { type, data } = modal
 const onClose = () => setModal(null)

 if (type === 'resultats_labo') {
 return (
 <PrintModal title="Résultats Laboratoire" couleur="#16a34a" onClose={onClose}>
 <div style={{ textAlign:'center', borderBottom:'2px solid #16a34a', paddingBottom:14, marginBottom:20 }}>
 <div style={{ fontWeight:900, fontSize:17, color:'#1641C8' }}>CLINIQUE DE LA REBECCA</div>
 <div style={{ fontSize:12, color:'#64748b' }}>#44, Rue Rebecca, Pétion-Ville · (509) 4858-5757</div>
 <div style={{ fontWeight:800, fontSize:14, marginTop:8, color:'#16a34a' }}>RÉSULTATS D'EXAMENS DE LABORATOIRE</div>
 </div>
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16, fontSize:13 }}>
 <div><strong>Patient :</strong> {data.patient_nom}</div>
 <div><strong># Dossier :</strong> {data.patient_numero}</div>
 <div><strong>Date impression :</strong> {new Date().toLocaleDateString('fr-FR')}</div>
 </div>
 {data.resultats?.length > 0 ? data.resultats.map((r: any, i: number) => (
 <div key={i} style={{ background:'#f0fdf4', borderRadius:10, padding:14, marginBottom:10, border:'1px solid #bbf7d0' }}>
 <div style={{ fontWeight:700, color:'#16a34a', marginBottom:6 }}>{r.type_examen}</div>
 <div style={{ fontSize:13, whiteSpace:'pre-wrap', lineHeight:1.7 }}>{r.resultats}</div>
 {r.notes && <div style={{ fontSize:12, color:'#64748b', marginTop:6 }}>{r.notes}</div>}
 <div style={{ fontSize:11, color:'#94a3b8', marginTop:6 }}>{new Date(r.date_examen).toLocaleDateString('fr-FR')}</div>
 </div>
 )) : <p style={{ color:'#94a3b8', textAlign:'center' }}>Aucun résultat disponible.</p>}
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:20 }}>
 <div><div style={{ fontSize:12, marginBottom:36 }}>Signature technicien</div><div style={{ borderBottom:'1px solid #374151', width:120 }} /></div>
 <div><div style={{ fontSize:12, marginBottom:36 }}>Cachet laboratoire</div><div style={{ borderBottom:'1px solid #374151', width:120 }} /></div>
 </div>
 </PrintModal>
 )
 }

 if (type === 'etat_compte') {
 return (
 <PrintModal title="État de Compte Patient" couleur="#1641C8" onClose={onClose}>
 <div style={{ textAlign:'center', borderBottom:'2px solid #1641C8', paddingBottom:14, marginBottom:20 }}>
 <div style={{ fontWeight:900, fontSize:17, color:'#1641C8' }}>CLINIQUE DE LA REBECCA</div>
 <div style={{ fontSize:12, color:'#64748b' }}>#44, Rue Rebecca, Pétion-Ville · (509) 4858-5757</div>
 <div style={{ fontWeight:800, fontSize:14, marginTop:8 }}>ÉTAT DE COMPTE PATIENT</div>
 </div>
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16, fontSize:13 }}>
 <div style={{ display:'flex', gap:6 }}><span style={{ fontWeight:600 }}>NOM DU PATIENT:</span> {data.patient_nom}</div>
 <div style={{ display:'flex', gap:6 }}><span style={{ fontWeight:600 }}>TÉLÉPHONE:</span> <span style={{ borderBottom:'1px solid #d1d5db', flex:1 }} /></div>
 <div style={{ display:'flex', gap:6 }}><span style={{ fontWeight:600 }}>DATE ARRIVÉE:</span> <span style={{ borderBottom:'1px solid #d1d5db', flex:1 }} /></div>
 <div style={{ display:'flex', gap:6 }}><span style={{ fontWeight:600 }}>DATE DÉPART:</span> <span style={{ borderBottom:'1px solid #d1d5db', flex:1 }} /></div>
 <div style={{ display:'flex', gap:6 }}><span style={{ fontWeight:600 }}>MD TRAITANT:</span> <span style={{ borderBottom:'1px solid #d1d5db', flex:1 }} /></div>
 <div style={{ display:'flex', gap:6 }}><span style={{ fontWeight:600 }}>CHAMBRE:</span> <span style={{ borderBottom:'1px solid #d1d5db', flex:1 }} /></div>
 </div>
 {/* Tableau services */}
 <div style={{ overflowX:'auto', marginBottom:16 }}>
 <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
 <thead>
 <tr style={{ background:'#1641C8', color:'white' }}>
 {['Service','Jour 1','Jour 2','Jour 3','Jour 4','Jour 5','TOTAL'].map(h => (
 <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontWeight:600 }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {['Consultation','Hospitalisation','Médicaments','Examens Labo','Actes médicaux','Autres'].map((service,i) => (
 <tr key={service} style={{ background: i%2===0 ? '#f8fafc' : 'white', borderBottom:'1px solid #e2e8f0' }}>
 <td style={{ padding:'8px 10px', fontWeight:500 }}>{service}</td>
 {[1,2,3,4,5,'total'].map(j => <td key={j} style={{ padding:'8px 10px', borderLeft:'1px solid #e2e8f0', minWidth:60 }}></td>)}
 </tr>
 ))}
 <tr style={{ background:'#1641C8', color:'white', fontWeight:700 }}>
 <td style={{ padding:'8px 10px' }}>TOTAL GÉNÉRAL</td>
 {[1,2,3,4,5,'total'].map(j => <td key={j} style={{ padding:'8px 10px', borderLeft:'1px solid #3b5bdb' }}></td>)}
 </tr>
 </tbody>
 </table>
 </div>
 <div style={{ display:'flex', gap:20, fontSize:13, marginBottom:20 }}>
 <div style={{ display:'flex', gap:6 }}><span style={{ fontWeight:600 }}>MONTANT PAYÉ:</span> <span style={{ borderBottom:'1px solid #d1d5db', minWidth:100 }} /></div>
 <div style={{ display:'flex', gap:6 }}><span style={{ fontWeight:600 }}>SOLDE DÛ:</span> <span style={{ borderBottom:'1px solid #d1d5db', minWidth:100 }} /></div>
 </div>
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
 <div><div style={{ fontSize:12, marginBottom:36 }}>Signature caissier</div><div style={{ borderBottom:'1px solid #374151', width:120 }} /></div>
 <div><div style={{ fontSize:12, marginBottom:36 }}>Cachet clinique</div><div style={{ borderBottom:'1px solid #374151', width:120 }} /></div>
 </div>
 </PrintModal>
 )
 }

 return null
 }

 const COLORS: Record<string,string> = { resultats_labo:'#16a34a', etat_compte:'#1641C8' }
 const ICONES: Record<string,string> = { resultats_labo:'', etat_compte:'' }

 return (
 <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
 <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8)', height:56, display:'flex', alignItems:'center', padding:'0 20px', gap:12 }}>
 <Link href="/caissier" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
 <ChevronLeft size={14} /> Caisse
 </Link>
 <span style={{ color:'white', fontWeight:700 }}>| Documents Patient</span>
 </div>

 <div style={{ maxWidth:640, margin:'36px auto', padding:'0 20px' }}>
 <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:12, padding:'12px 16px', marginBottom:24, display:'flex', gap:10, alignItems:'flex-start' }}>
 <Lock size={16} style={{ color:'#d97706', flexShrink:0, marginTop:2 }} />
 <div style={{ fontSize:13, color:'#92400e', lineHeight:1.6 }}>
 <strong>Impression uniquement.</strong> Entrez l'ID du patient pour voir les documents disponibles.
 Vous pouvez imprimer les résultats labo et l'état de compte — pas d'accès au dossier médical.
 </div>
 </div>

 <div style={{ background:'white', borderRadius:18, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
 <h2 style={{ fontWeight:800, fontSize:'1.1rem', color:'#0f172a', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
 <FileText size={18} color="#1641C8" /> Rechercher par ID patient
 </h2>
 <div style={{ display:'flex', gap:10 }}>
 <input
 value={patientId}
 onChange={e => setPatientId(e.target.value.toUpperCase())}
 onKeyDown={e => e.key === 'Enter' && chercher()}
 placeholder="Ex: #RB-0042"
 style={{ flex:1, padding:'12px 16px', borderRadius:10, border:`2px solid ${error ? '#ef4444' : '#e2e8f0'}`, fontSize:16, fontFamily:'monospace', fontWeight:700, outline:'none' }}
 />
 <button onClick={chercher} disabled={loading} style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:10, padding:'12px 22px', fontWeight:700, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
 <Search size={16} /> {loading ? 'Recherche...' : 'Chercher'}
 </button>
 </div>
 {error && (
 <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8, color:'#dc2626', fontSize:13, background:'#fef2f2', padding:'10px 14px', borderRadius:8 }}>
 <AlertCircle size={14} /> {error}
 </div>
 )}
 </div>

 {result && (
 <div style={{ background:'white', borderRadius:18, padding:24, border:'1px solid #e2e8f0' }}>
 <div style={{ background:'#eff6ff', borderRadius:12, padding:'14px 18px', marginBottom:20, border:'1px solid #bfdbfe' }}>
 <div style={{ fontWeight:800, fontSize:16, color:'#0f172a' }}>{result.patient_nom}</div>
 <div style={{ fontFamily:'monospace', color:'#1641C8', fontWeight:700, fontSize:15, marginTop:2 }}>{result.patient_numero}</div>
 </div>

 <div style={{ fontWeight:700, fontSize:12, color:'#64748b', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>
 Documents disponibles
 </div>
 <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
 {result.documents.map(doc => (
 <div key={doc.type} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14, border:'1px solid #e2e8f0', background:'#fafafa' }}>
 <div style={{ width:46, height:46, borderRadius:12, background:`${COLORS[doc.type] || '#64748b'}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
 {ICONES[doc.type] || ''}
 </div>
 <div style={{ flex:1 }}>
 <div style={{ fontWeight:700, color:'#0f172a', fontSize:14 }}>{doc.label}</div>
 {doc.nb_transactions !== undefined && (
 <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{doc.nb_transactions} transaction(s) enregistrée(s)</div>
 )}
 </div>
 <button onClick={() => ouvrirImpression(doc.type)} style={{ background:COLORS[doc.type] || '#64748b', color:'white', border:'none', borderRadius:10, padding:'9px 18px', fontWeight:700, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
 <Printer size={14} /> Imprimer
 </button>
 </div>
 ))}
 </div>
 <div style={{ marginTop:14, fontSize:12, color:'#dc2626', display:'flex', alignItems:'center', gap:6 }}>
 <Lock size={12} /> Le contenu médical ne s'affiche pas — impression directe uniquement.
 </div>
 </div>
 )}
 </div>

 {renderModal()}
 </div>
 )
}
