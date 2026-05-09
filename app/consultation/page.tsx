'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { rdvApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { useLang } from '@/context/LangContext'
import { tradSpecialite } from '@/lib/specialite-translations'
import { MEDECINS } from '@/lib/medecins'
import Link from 'next/link'

const SPECIALITES_FR = Array.from(new Set(MEDECINS.map(m => m.specialite))).sort()

type FormData = {
 nom: string; telephone: string; email: string
 specialite: string; date_rdv: string
 type_rdv: 'presentiel' | 'video'
 motif: string; mode_paiement: string
}

export default function ConsultationPage() {
 const { lang } = useLang()
 const [typeChoisi, setTypeChoisi] = useState<'presentiel' | 'video' | null>(null)
 const [loading, setLoading] = useState(false)
 const [success, setSuccess] = useState(false)
 const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

 const T = {
 title: { fr:'Prenez soin de vous,', en:'Take care of yourself,', ht:'Pran swen tèt ou,', es:'Cuídese,' },
 subtitle: { fr:'à votre rythme', en:'at your own pace', ht:'nan ritmou ou', es:'a su ritmo' },
 badge: { fr:'Réservation en ligne · Rapide et simple', en:'Online booking · Fast & easy', ht:'Rezèvasyon anliy · Rapid', es:'Reserva online · Rápido' },
 how: { fr:'Comment souhaitez-vous consulter ?', en:'How would you like to consult?', ht:'Kijan ou vle konsulte?', es:'¿Cómo desea consultar?' },
 choose: { fr:'Choisissez le mode qui vous convient', en:'Choose the mode that suits you', ht:'Chwazi mòd ki pi bon pou ou', es:'Elija el modo que prefiera' },
 physical: { fr:'Consultation physique', en:'In-person', ht:'Vizit fizik', es:'Presencial' },
 video: { fr:'Consultation vidéo', en:'Video consultation', ht:'Konsiltasyon videyo', es:'Consulta por vídeo' },
 physDesc: { fr:'Venez à la clinique', en:'Come to the clinic', ht:'Vini nan klinik lan', es:'Visítenos en la clínica' },
 vidDesc: { fr:'Depuis chez vous', en:'From home', ht:'Depi lakay ou', es:'Desde su casa' },
 formTitle: { fr:'Votre demande de rendez-vous', en:'Your appointment request', ht:'Demann randevou ou', es:'Su solicitud de cita' },
 name: { fr:'Nom complet', en:'Full name', ht:'Non konplè', es:'Nombre completo' },
 phone: { fr:'Téléphone', en:'Phone', ht:'Telefòn', es:'Teléfono' },
 email: { fr:'Email', en:'Email', ht:'Imèl', es:'Correo electrónico' },
 spec: { fr:'Spécialité', en:'Specialty', ht:'Espesyalite', es:'Especialidad' },
 chooseSpec:{ fr:'Choisir une spécialité', en:'Choose a specialty', ht:'Chwazi espesyalite', es:'Elegir especialidad' },
 date: { fr:'Date souhaitée', en:'Preferred date', ht:'Dat souete', es:'Fecha deseada' },
 motif: { fr:'Motif de consultation', en:'Reason for consultation', ht:'Rezon konsiltasyon', es:'Motivo de consulta' },
 payment: { fr:'Mode de paiement', en:'Payment method', ht:'Mòd peman', es:'Método de pago' },
 send: { fr:'Envoyer ma demande', en:'Send my request', ht:'Voye demann mwen', es:'Enviar solicitud' },
 sending: { fr:'Envoi en cours...', en:'Sending...', ht:'Ap voye...', es:'Enviando...' },
 another: { fr:'Prendre un autre RDV', en:'Book another appointment', ht:'Pran yon lòt randevou', es:'Reservar otra cita' },
 sent: { fr:'Demande envoyée !', en:'Request sent!', ht:'Demann voye!', es:'Solicitud enviada!' },
 confirm: { fr:'Nous vous contacterons dans les plus brefs délais.', en:'We will contact you shortly.', ht:'Nou pral kontakte w vit.', es:'Le contactaremos pronto.' },
 required: { fr:'Champ obligatoire', en:'Required field', ht:'Chan obligatwa', es:'Campo requerido' },
 vidNote: { fr:' Le paiement est requis avant confirmation pour les consultations vidéo.',
 en:' Payment required before confirmation for video consultations.',
 ht:' Peman obligatwa anvan konfirmasyon pou videyo.',
 es:' Se requiere pago antes de la confirmación para consultas por vídeo.' },
 }
 const t = (k: keyof typeof T) => T[k][(lang as keyof (typeof T)[keyof typeof T]) in T[k] ? lang as any : 'fr'] || T[k].fr

 const onSubmit = async (data: FormData) => {
 setLoading(true)
 try {
 await rdvApi.create({
 ...data,
 patient_nom: data.nom,
 patient_telephone: data.telephone,
 patient_email: data.email,
 date_rdv: new Date(data.date_rdv).toISOString(),
 statut: data.type_rdv === 'video' ? 'paiement_requis' : 'en_attente',
 })
 setSuccess(true)
 reset()
 toast.success(t('sent'))
 } catch {
 toast.error(lang==='en'?'Submission error. Try again.':lang==='ht'?'Erè. Eseye ankò.':lang==='es'?'Error. Inténtelo de nuevo.':'Erreur lors de la soumission.')
 } finally {
 setLoading(false)
 }
 }

 const inp = { padding:'12px 16px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:14, width:'100%', boxSizing:'border-box' as const, fontFamily:'inherit' }
 const inpErr = { ...inp, borderColor:'#ef4444' }

 // ── Success screen ─────────────────────────────────────────────────────
 if (success) return (
 <>
 <Navbar />
 <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', paddingTop:110 }}>
 <div style={{ background:'white', borderRadius:24, padding:56, textAlign:'center', maxWidth:480, boxShadow:'0 8px 40px rgba(0,0,0,0.08)', border:'1px solid #e2e8f0' }}>
 <div style={{ width:80, height:80, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:36 }}></div>
 <h2 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.6rem', marginBottom:12 }}>{t('sent')}</h2>
 <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:28 }}>{t('confirm')}</p>
 <button onClick={() => { setSuccess(false); setTypeChoisi(null) }}
 style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:12, padding:'12px 28px', fontWeight:700, cursor:'pointer', fontSize:15 }}>
 {t('another')}
 </button>
 </div>
 </div>
 <Footer />
 </>
 )

 // ── Step 1: Choose type ────────────────────────────────────────────────
 if (!typeChoisi) return (
 <>
 <Navbar />
 {/* Hero */}
 <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8 60%,#0d9488)', padding:'110px 5% 56px' }}>
 <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
 <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(13,148,136,0.2)', border:'1px solid rgba(13,148,136,0.4)', borderRadius:50, padding:'6px 16px', marginBottom:20 }}>
 <i className="fa-solid fa-calendar-check" style={{ color:'#5eead4', fontSize:13 }} />
 <span style={{ color:'#5eead4', fontWeight:600, fontSize:13 }}>{t('badge')}</span>
 </div>
 <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(2rem,5vw,3rem)', lineHeight:1.15, margin:'0 0 8px' }}>
 {t('title')}
 </h1>
 <em style={{ color:'#5eead4', fontWeight:900, fontSize:'clamp(2rem,5vw,3rem)', fontStyle:'italic' }}>{t('subtitle')}</em>
 <p style={{ color:'rgba(255,255,255,0.7)', fontSize:16, marginTop:16, lineHeight:1.6 }}>
 {lang==='en'?'Consult in person or from home via video. A caring team awaits you.':
 lang==='ht'?'Konsulte nan kabinèt oswa depi lakay ou pa videyo.':
 lang==='es'?'Consulte en el consultorio o desde casa por vídeo.':
 lang==='zh'?'在诊室或视频问诊，专业团队等候您。':
 'Consultez en cabinet ou depuis chez vous par vidéo. Une équipe bienveillante vous attend.'}
 </p>
 </div>
 </div>

 {/* Type chooser */}
 <div style={{ maxWidth:800, margin:'0 auto', padding:'56px 20px' }}>
 <h2 style={{ textAlign:'center', fontWeight:900, fontSize:'1.6rem', color:'#0f172a', marginBottom:8 }}>{t('how')}</h2>
 <p style={{ textAlign:'center', color:'#64748b', marginBottom:40 }}>{t('choose')}</p>
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
 {[
 { type:'presentiel' as const, icon:'', label:t('physical'), desc:t('physDesc'), color:'#1641C8' },
 { type:'video' as const, icon:'', label:t('video'), desc:t('vidDesc'), color:'#0d9488' },
 ].map(opt => (
 <button key={opt.type} onClick={() => setTypeChoisi(opt.type)}
 style={{ background:'white', borderRadius:20, padding:36, border:`2px solid #e2e8f0`, cursor:'pointer', textAlign:'center', transition:'all 0.2s' }}
 onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = opt.color; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${opt.color}22` }}
 onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
 <div style={{ fontSize:52, marginBottom:16 }}>{opt.icon}</div>
 <div style={{ fontWeight:800, fontSize:'1.2rem', color:'#0f172a', marginBottom:8 }}>{opt.label}</div>
 <div style={{ color:'#64748b', fontSize:14 }}>{opt.desc}</div>
 {opt.type === 'video' && (
 <div style={{ background:'#f0fdf4', borderRadius:8, padding:'8px 14px', marginTop:14, fontSize:12, color:'#0d9488', fontWeight:600 }}>
 {lang==='en'?'Payment required before confirmation':lang==='ht'?'Peman obligatwa':lang==='es'?'Pago requerido':lang==='zh'?'需先付款':'Paiement requis avant confirmation'}
 </div>
 )}
 </button>
 ))}
 </div>
 </div>
 <Footer />
 </>
 )

 // ── Step 2: Form ───────────────────────────────────────────────────────
 return (
 <>
 <Navbar />
 <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8)', padding:'110px 5% 40px', textAlign:'center' }}>
 <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.1)', borderRadius:50, padding:'6px 16px', marginBottom:16 }}>
 <span style={{ color:'white', fontSize:13 }}>{typeChoisi === 'video' ? '' : ''} {typeChoisi === 'video' ? t('video') : t('physical')}</span>
 </div>
 <h1 style={{ color:'white', fontWeight:900, fontSize:'2rem', margin:0 }}>{t('formTitle')}</h1>
 </div>

 <div style={{ maxWidth:680, margin:'0 auto', padding:'40px 20px 60px' }}>
 <button onClick={() => setTypeChoisi(null)}
 style={{ background:'none', border:'none', color:'#1641C8', fontWeight:600, cursor:'pointer', marginBottom:24, fontSize:14, padding:0 }}>
 ← {lang==='en'?'Back':lang==='ht'?'Retounen':lang==='es'?'Volver':lang==='zh'?'返回':'Retour'}
 </button>

 {typeChoisi === 'video' && (
 <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:12, padding:'12px 16px', marginBottom:24, fontSize:13, color:'#92400e' }}>
 {t('vidNote')}
 </div>
 )}

 <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:18 }}>
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
 <div>
 <label style={{ fontWeight:600, fontSize:13, color:'#374151', display:'block', marginBottom:6 }}>{t('name')} *</label>
 <input {...register('nom', { required: true })} placeholder="Jean DUPONT"
 style={errors.nom ? inpErr : inp} />
 {errors.nom && <div style={{ color:'#ef4444', fontSize:11, marginTop:4 }}>{t('required')}</div>}
 </div>
 <div>
 <label style={{ fontWeight:600, fontSize:13, color:'#374151', display:'block', marginBottom:6 }}>{t('phone')} *</label>
 <input {...register('telephone', { required: true })} placeholder="+509 XXXX-XXXX"
 style={errors.telephone ? inpErr : inp} />
 {errors.telephone && <div style={{ color:'#ef4444', fontSize:11, marginTop:4 }}>{t('required')}</div>}
 </div>
 </div>

 <div>
 <label style={{ fontWeight:600, fontSize:13, color:'#374151', display:'block', marginBottom:6 }}>Email</label>
 <input {...register('email')} type="email" placeholder="votre@email.com" style={inp} />
 </div>

 <div>
 <label style={{ fontWeight:600, fontSize:13, color:'#374151', display:'block', marginBottom:6 }}>{t('spec')} *</label>
 <select {...register('specialite', { required: true })} style={errors.specialite ? inpErr : inp}>
 <option value="">{t('chooseSpec')}</option>
 {SPECIALITES_FR.map(s => (
 <option key={s} value={s}>{tradSpecialite(s, lang)}</option>
 ))}
 </select>
 {errors.specialite && <div style={{ color:'#ef4444', fontSize:11, marginTop:4 }}>{t('required')}</div>}
 </div>

 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
 <div>
 <label style={{ fontWeight:600, fontSize:13, color:'#374151', display:'block', marginBottom:6 }}>Date et heure du RDV *</label>
 <input {...register('date_rdv', {
   required: 'Date requise',
   validate: (v: string) => new Date(v) > new Date() || "La date et heure doivent être dans le futur"
  })} type="datetime-local"
  min={new Date(Date.now() + 30*60000).toISOString().slice(0,16)} style={errors.date_rdv ? inpErr : inp} />
 {errors.date_rdv && <div style={{ color:'#ef4444', fontSize:11, marginTop:4 }}>{String((errors.date_rdv as any).message||'Date invalide')}</div>}
 </div>
 <div>
 <label style={{ fontWeight:600, fontSize:13, color:'#374151', display:'block', marginBottom:6 }}>{t('payment')}</label>
 <select {...register('mode_paiement')} style={inp}>
 <option value="especes">{lang==='en'?'Cash':lang==='ht'?'Lajan kach':lang==='es'?'Efectivo':'Espèces'}</option>
 <option value="moncash">MonCash</option>
 <option value="natcash">NatCash</option>
 <option value="carte">{lang==='en'?'Card':lang==='ht'?'Kat':lang==='es'?'Tarjeta':'Carte'}</option>
 </select>
 </div>
 </div>

 <div>
 <label style={{ fontWeight:600, fontSize:13, color:'#374151', display:'block', marginBottom:6 }}>{t('motif')}</label>
 <textarea {...register('motif')} rows={3}
 placeholder={lang==='en'?'Describe your symptoms or reason for visit...':lang==='ht'?'Dekri sentòm ou oswa rezon vizit ou...':lang==='es'?'Describa sus síntomas o motivo de visita...':lang==='zh'?'请描述症状或就诊原因...':'Décrivez vos symptômes ou le motif de votre visite...'}
 style={{ ...inp, resize:'vertical' as const }} />
 </div>

 <button type="submit" disabled={loading}
 style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:14, padding:'16px', fontWeight:800, fontSize:16, cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.2s' }}>
 {loading ? t('sending') : t('send')}
 </button>
 </form>
 </div>
 <Footer />
 </>
 )
}
