'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { rdvApi, specialistesApi } from '@/lib/api'
import { X } from 'lucide-react'
import PaiementFlow, { type PaiementInfo } from '@/components/ui/PaiementFlow'

const SPECIALITES = [
 'Médecine générale','Chirurgie générale','Neurochirurgie','Neurologie',
 'Orthopédie','Pédiatrie','Dermatologie','Urologie','ORL','Gynécologie',
 'Chirurgie pédiatrique','Médecine interne','Ophtalmologie','Cardiologie',
 'Endocrinologie','Dentisterie','Physiothérapie','Optométrie','Laboratoire',
]

const HEURES = [
 '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30',
 '11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30',
]


interface Medecin {
 id: number
 nom: string
 specialite: string
 description?: string
 emoji?: string
 email?: string
 telephone?: string
 prix_rdv?: number
 prix_consultation?: number
 type_medecin?: string
}

interface FormData {
 patient_nom: string
 patient_telephone: string
 patient_email: string
 specialite: string
 date: string
 heure: string
 type_rdv: 'presentiel' | 'video'
 mode_paiement: string
 reference_paiement: string
 motif: string
}

interface Props {
 open: boolean
 onClose: () => void
 defaultSpec?: string
}

// Étapes du formulaire
type Etape = 'specialite' | 'medecin' | 'profil' | 'formulaire'

export default function RdvModal({ open, onClose, defaultSpec }: Props) {
 const [etape, setEtape] = useState<Etape>('specialite')
 const [loading, setLoading] = useState(false)
 const [loadingMedecins, setLoadingMedecins] = useState(false)
 const [medecins, setMedecins] = useState<Medecin[]>([])
 const [medecinChoisi, setMedecinChoisi] = useState<Medecin | null>(null)
 const [profilOuvert, setProfilOuvert] = useState<Medecin | null>(null)
 const [specialiteChoisie, setSpecialiteChoisie] = useState(defaultSpec || '')
 const [paiementInfo, setPaiementInfo] = useState<PaiementInfo | null>(null)
 const [tauxChange, setTauxChange] = useState(130)

 // Charger le taux USD→HTG du jour
 useEffect(() => {
 import('@/lib/api').then(({ api }) => {
 api.get('/caissier/taux-change').then(r => {
 if (r.data?.taux) setTauxChange(r.data.taux)
 }).catch(() => {})
 })
 }, [])

 const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
 defaultValues: {
 type_rdv: 'presentiel',
 mode_paiement: 'À la clinique',
 specialite: defaultSpec || '',
 }
 })



 // Quand la spécialité change → charger les médecins
 const chargerMedecins = async (spec: string) => {
 if (!spec) return
 setLoadingMedecins(true)
 try {
 const res = await specialistesApi.list(spec)
 const data = Array.isArray(res) ? res : res.data || []
 setMedecins(data)
 } catch {
 setMedecins([])
 } finally {
 setLoadingMedecins(false)
 }
 }

 useEffect(() => {
 if (defaultSpec) {
 setSpecialiteChoisie(defaultSpec)
 setValue('specialite', defaultSpec)
 }
 }, [defaultSpec, setValue])

 useEffect(() => {
 if (!open) {
 setEtape('specialite')
 setMedecinChoisi(null)
 setProfilOuvert(null)
 setMedecins([])
 reset()
 }
 }, [open, reset])

 const handleSpecialiteValider = async () => {
 if (!specialiteChoisie) { toast.error('Choisissez une spécialité'); return }
 setValue('specialite', specialiteChoisie)
 await chargerMedecins(specialiteChoisie)
 setEtape('medecin')
 }

 const handleMedecinChoisir = (m: Medecin) => {
 setMedecinChoisi(m)
 setEtape('formulaire')
 }

 const onSubmit = async (data: FormData) => {
 if (!medecinChoisi) { toast.error('Veuillez choisir un médecin'); return }
 if (!paiementInfo?.verifie) {
 toast.error("Vérifiez le paiement avant de confirmer le rendez-vous")
 return
 }
 setLoading(true)
 try {
 const dateHeure = new Date(`${data.date}T${data.heure}:00`)
 await rdvApi.create({
 patient_nom: data.patient_nom,
 patient_telephone: data.patient_telephone,
 patient_email: data.patient_email || undefined,
 specialite: specialiteChoisie,
 specialiste_id: medecinChoisi.id,
 medecin_nom: medecinChoisi.nom,
 medecin_email: medecinChoisi.email || undefined,
 date_rdv: dateHeure.toISOString(),
 type_rdv: data.type_rdv,
 motif: data.motif || undefined,
 mode_paiement: paiementInfo.mode,
 reference_paiement: paiementInfo.reference || undefined,
 })
 toast.success(' Rendez-vous envoyé ! Vous recevrez une confirmation.')
 onClose()
 } catch {
 toast.error('Erreur lors de la soumission')
 } finally {
 setLoading(false)
 }
 }

 if (!open) return null

 return (
 <div style={{
 position:'fixed', inset:0, zIndex:9999,
 background:'rgba(15,30,61,0.7)', backdropFilter:'blur(4px)',
 display:'flex', alignItems:'center', justifyContent:'center', padding:16
 }}>
 <div style={{
 background:'white', borderRadius:24, width:'100%', maxWidth:560,
 maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column',
 boxShadow:'0 32px 80px rgba(0,0,0,0.35)'
 }}>

 {/* ── HEADER ─────────────────────────────────────────────────── */}
 <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8 60%,#0d9488)', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
 <div>
 <h2 style={{ color:'white', fontWeight:900, fontSize:'1.1rem', margin:0 }}>
 {etape === 'specialite' && ' Choisir une spécialité'}
 {etape === 'medecin' && `‍ Médecins disponibles — ${specialiteChoisie}`}
 {etape === 'profil' && ` Profil — ${profilOuvert?.nom}`}
 {etape === 'formulaire' && ` Prendre RDV — Dr ${medecinChoisi?.nom}`}
 </h2>
 {/* Indicateur d'étape */}
 <div style={{ display:'flex', gap:6, marginTop:8 }}>
 {(['specialite','medecin','formulaire'] as Etape[]).map((e, i) => (
 <div key={e} style={{
 height:3, borderRadius:2, flex:1,
 background: etape === e || (etape === 'profil' && i === 1) || (etape === 'formulaire' && i <= 2)
 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)'
 }} />
 ))}
 </div>
 </div>
 <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white' }}>
 <X size={16} />
 </button>
 </div>

 {/* ── CONTENU SCROLLABLE ─────────────────────────────────────── */}
 <div style={{ overflowY:'auto', flex:1 }}>

 {/* ── ÉTAPE 1 : SPÉCIALITÉ ─────────────────────────────────── */}
 {etape === 'specialite' && (
 <div style={{ padding:24 }}>
 <p style={{ color:'#64748b', fontSize:14, marginBottom:20 }}>
 Sélectionnez la spécialité dont vous avez besoin pour voir les médecins disponibles.
 </p>
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
 {SPECIALITES.map(s => (
 <button key={s} onClick={() => setSpecialiteChoisie(s)} style={{
 padding:'12px 14px', borderRadius:12, textAlign:'left', cursor:'pointer',
 border:`2px solid ${specialiteChoisie === s ? '#1641C8' : '#e2e8f0'}`,
 background: specialiteChoisie === s ? '#eff6ff' : 'white',
 fontWeight: specialiteChoisie === s ? 700 : 500,
 color: specialiteChoisie === s ? '#1641C8' : '#374151',
 fontSize:13, transition:'all 0.15s'
 }}>
 {specialiteChoisie === s && <i className="fa-solid fa-check-circle" style={{ marginRight:6, color:'#1641C8' }} />}
 {s}
 </button>
 ))}
 </div>
 <button onClick={handleSpecialiteValider} disabled={!specialiteChoisie} style={{
 width:'100%', background: specialiteChoisie ? 'linear-gradient(135deg,#1641C8,#0d9488)' : '#e2e8f0',
 color: specialiteChoisie ? 'white' : '#94a3b8',
 border:'none', borderRadius:12, padding:'13px 0',
 fontWeight:700, fontSize:'1rem', cursor: specialiteChoisie ? 'pointer' : 'not-allowed'
 }}>
 {loadingMedecins
 ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight:8 }} />Chargement…</>
 : <>Voir les médecins disponibles <i className="fa-solid fa-arrow-right" style={{ marginLeft:8 }} /></>
 }
 </button>
 </div>
 )}

 {/* ── ÉTAPE 2 : CHOISIR MÉDECIN ────────────────────────────── */}
 {etape === 'medecin' && (
 <div style={{ padding:24 }}>
 <button onClick={() => setEtape('specialite')} style={{ background:'none', border:'none', color:'#1641C8', cursor:'pointer', fontWeight:600, fontSize:13, marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
 <i className="fa-solid fa-arrow-left" /> Changer de spécialité
 </button>

 {loadingMedecins ? (
 <div style={{ textAlign:'center', padding:40, color:'#64748b' }}>
 <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:24, marginBottom:12, display:'block' }} />
 Chargement des médecins…
 </div>
 ) : medecins.length === 0 ? (
 <div style={{ textAlign:'center', padding:40 }}>
 <div style={{ fontSize:48, marginBottom:12 }}></div>
 <p style={{ color:'#64748b', marginBottom:4 }}>Aucun médecin disponible pour cette spécialité pour le moment.</p>
 <p style={{ color:'#94a3b8', fontSize:13 }}>Appelez-nous au <strong>+509 3888-0000</strong></p>
 <button onClick={() => setEtape('specialite')} style={{ marginTop:16, background:'#f1f5f9', border:'none', borderRadius:10, padding:'10px 20px', color:'#1641C8', fontWeight:600, cursor:'pointer' }}>
 Changer de spécialité
 </button>
 </div>
 ) : (
 <>
 <p style={{ color:'#64748b', fontSize:13, marginBottom:16 }}>
 {medecins.length} médecin{medecins.length > 1 ? 's' : ''} disponible{medecins.length > 1 ? 's' : ''} — cliquez sur un profil pour en savoir plus
 </p>
 <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
 {medecins.map(m => (
 <div key={m.id} style={{
 border:'1px solid #e2e8f0', borderRadius:16, overflow:'hidden',
 transition:'all 0.2s'
 }}
 onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1641C8'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(22,65,200,0.1)' }}
 onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
 >
 <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
 {/* Avatar */}
 <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:22 }}>
 {m.emoji || '‍'}
 </div>
 <div style={{ flex:1 }}>
 <div style={{ fontWeight:800, color:'#0f172a', fontSize:15 }}>Dr {m.nom}</div>
 <div style={{ color:'#0d9488', fontWeight:600, fontSize:12, marginTop:2 }}>{m.specialite}</div>
 {m.description && (
 <div style={{ color:'#64748b', fontSize:12, marginTop:4, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
 {m.description}
 </div>
 )}
 </div>
 <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
 <button onClick={() => { setProfilOuvert(m); setEtape('profil') }} style={{
 background:'#f1f5f9', border:'none', borderRadius:8, padding:'7px 12px',
 color:'#475569', fontWeight:600, fontSize:12, cursor:'pointer', whiteSpace:'nowrap'
 }}>
 <i className="fa-solid fa-eye" style={{ marginRight:4 }} />Profil
 </button>
 <button onClick={() => handleMedecinChoisir(m)} style={{
 background:'linear-gradient(135deg,#1641C8,#0d9488)', border:'none',
 borderRadius:8, padding:'7px 12px', color:'white',
 fontWeight:700, fontSize:12, cursor:'pointer', whiteSpace:'nowrap'
 }}>
 <i className="fa-solid fa-calendar-check" style={{ marginRight:4 }} />Choisir
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </>
 )}
 </div>
 )}

 {/* ── ÉTAPE PROFIL : FICHE DÉTAILLÉE DU MÉDECIN ───────────── */}
 {etape === 'profil' && profilOuvert && (
 <div style={{ padding:24 }}>
 <button onClick={() => setEtape('medecin')} style={{ background:'none', border:'none', color:'#1641C8', cursor:'pointer', fontWeight:600, fontSize:13, marginBottom:20, display:'flex', alignItems:'center', gap:6 }}>
 <i className="fa-solid fa-arrow-left" /> Retour à la liste
 </button>

 <div style={{ textAlign:'center', marginBottom:24 }}>
 <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:36 }}>
 {profilOuvert.emoji || '‍'}
 </div>
 <h3 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.3rem', marginBottom:4 }}>Dr {profilOuvert.nom}</h3>
 <span style={{ background:'#e0f2fe', color:'#0369a1', borderRadius:50, padding:'4px 14px', fontSize:13, fontWeight:600 }}>
 {profilOuvert.specialite}
 </span>
 </div>

 {profilOuvert.description && (
 <div style={{ background:'#f8fafc', borderRadius:14, padding:18, marginBottom:18 }}>
 <div style={{ fontWeight:700, color:'#0f172a', fontSize:13, marginBottom:8 }}>
 <i className="fa-solid fa-user-doctor" style={{ color:'#1641C8', marginRight:8 }} />À propos
 </div>
 <p style={{ color:'#475569', lineHeight:1.7, fontSize:14, margin:0 }}>{profilOuvert.description}</p>
 </div>
 )}

 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
 {[
 { icon:'fa-stethoscope', label:'Spécialité', val:profilOuvert.specialite, color:'#1641C8' },
 { icon:'fa-clock', label:'Disponibilité', val:'Lun–Sam · 7h–17h', color:'#0d9488' },
 ...(profilOuvert.telephone ? [{ icon:'fa-phone', label:'Téléphone', val:profilOuvert.telephone, color:'#16a34a' }] : []),
 ].map(item => (
 <div key={item.label} style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:12, padding:14 }}>
 <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
 <i className={`fa-solid ${item.icon}`} style={{ color:item.color, fontSize:13 }} />
 <span style={{ color:'#94a3b8', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>{item.label}</span>
 </div>
 <div style={{ fontWeight:700, color:'#0f172a', fontSize:13 }}>{item.val}</div>
 </div>
 ))}
 </div>

 <button onClick={() => handleMedecinChoisir(profilOuvert)} style={{
 width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)',
 color:'white', border:'none', borderRadius:12, padding:'14px 0',
 fontWeight:700, fontSize:'1rem', cursor:'pointer',
 boxShadow:'0 4px 16px rgba(22,65,200,0.3)'
 }}>
 <i className="fa-solid fa-calendar-check" style={{ marginRight:8 }} />Choisir Dr {profilOuvert.nom}
 </button>
 </div>
 )}

 {/* ── ÉTAPE 3 : FORMULAIRE RDV ─────────────────────────────── */}
 {etape === 'formulaire' && medecinChoisi && (
 <div style={{ padding:24 }}>
 <button onClick={() => setEtape('medecin')} style={{ background:'none', border:'none', color:'#1641C8', cursor:'pointer', fontWeight:600, fontSize:13, marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
 <i className="fa-solid fa-arrow-left" /> Changer de médecin
 </button>

 {/* Récap médecin choisi */}
 <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
 <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
 {medecinChoisi.emoji || '‍'}
 </div>
 <div>
 <div style={{ fontWeight:800, color:'#0f172a', fontSize:14 }}>Dr {medecinChoisi.nom}</div>
 <div style={{ color:'#0d9488', fontSize:12, fontWeight:600 }}>{medecinChoisi.specialite}</div>
 </div>
 <i className="fa-solid fa-check-circle" style={{ color:'#16a34a', fontSize:20, marginLeft:'auto' }} />
 </div>

 <form onSubmit={handleSubmit(onSubmit)}>
 {/* Infos patient */}
 <div style={{ marginBottom:20 }}>
 <div style={{ fontWeight:700, fontSize:13, marginBottom:12, textTransform:'uppercase', letterSpacing:1, color:'#94a3b8' }}>
 Vos informations
 </div>
 {[
 { name:'patient_nom' as const, label:'Nom complet *', type:'text', req:true },
 { name:'patient_telephone' as const, label:'Téléphone *', type:'tel', req:true },
 { name:'patient_email' as const, label:'Email', type:'email', req:false },
 ].map(f => (
 <div key={f.name} style={{ marginBottom:12 }}>
 <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:5 }}>{f.label}</label>
 <input {...register(f.name, f.req ? { required:true } : {})} type={f.type}
 style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:`1px solid ${errors[f.name]?'#ef4444':'#d1d5db'}`, fontSize:14, outline:'none', boxSizing:'border-box' }} />
 </div>
 ))}
 </div>

 {/* Date / heure / type */}
 <div style={{ fontWeight:700, color:'#94a3b8', fontSize:13, marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>
 Date & type
 </div>
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
 <div>
 <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:5 }}>Date *</label>
 <input {...register('date', { required:true })} type="date" min={new Date().toISOString().split('T')[0]}
 style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, boxSizing:'border-box' }} />
 </div>
 <div>
 <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:5 }}>Heure *</label>
 <select {...register('heure', { required:true })} style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, background:'white', boxSizing:'border-box' }}>
 <option value="">Choisir</option>
 {HEURES.map(h => <option key={h} value={h}>{h}</option>)}
 </select>
 </div>
 </div>

 {/* Type RDV */}
 <div style={{ display:'flex', gap:10, marginBottom:16 }}>
 {[{ v:'presentiel', icon:'fa-hospital', label:'En cabinet' }, { v:'video', icon:'fa-video', label:'Vidéo' }].map(t => (
 <label key={t.v} style={{ flex:1, cursor:'pointer' }}>
 <input {...register('type_rdv')} type="radio" value={t.v} style={{ display:'none' }} />
 <div style={{
 padding:'11px', borderRadius:12, textAlign:'center', fontSize:13, fontWeight:600,
 border:`2px solid ${watch('type_rdv') === t.v ? '#1641C8' : '#e2e8f0'}`,
 background: watch('type_rdv') === t.v ? '#eff6ff' : 'white',
 color: watch('type_rdv') === t.v ? '#1641C8' : '#64748b'
 }}>
 <i className={`fa-solid ${t.icon}`} style={{ marginRight:6 }} />{t.label}
 </div>
 </label>
 ))}
 </div>

 {/* Motif */}
 <div style={{ marginBottom:16 }}>
 <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:5 }}>Motif de consultation</label>
 <textarea {...register('motif')} rows={2} placeholder="Décrivez brièvement votre motif…"
 style={{ width:'100%', padding:'11px 13px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, resize:'vertical', boxSizing:'border-box' }} />
 </div>

 {/* Paiement */}
 <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:14, marginBottom:20 }}>
 <div style={{ fontWeight:700, color:'#374151', fontSize:13, marginBottom:10 }}>
 <i className="fa-solid fa-credit-card" style={{ marginRight:6 }} />Paiement
 </div>
 <PaiementFlow
 montant={medecinChoisi?.prix_rdv || medecinChoisi?.prix_consultation || 0}
 tauxChange={tauxChange}
 onVerifie={info => setPaiementInfo(info)}
 onReset={() => setPaiementInfo(null)}
 compact={true}
 />
 </div>

 <button type="submit" disabled={loading || !paiementInfo?.verifie} style={{
 width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)',
 color:'white', border:'none', borderRadius:12, padding:'14px 0',
 fontWeight:700, fontSize:'1rem', cursor:loading?'not-allowed':'pointer',
 opacity:loading?0.75:1, boxShadow:'0 4px 16px rgba(22,65,200,0.3)'
 }}>
 {loading
 ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight:8 }} />Envoi…</>
 : !paiementInfo?.verifie
 ? <><i className="fa-solid fa-lock" style={{ marginRight:8 }} />Vérifiez le paiement d'abord</>
 : <><i className="fa-solid fa-calendar-check" style={{ marginRight:8 }} />Confirmer le rendez-vous</>
 }
 </button>
 </form>
 </div>
 )}
 </div>
 </div>
 </div>
 )
}
