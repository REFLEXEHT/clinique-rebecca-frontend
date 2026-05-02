'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { rdvApi } from '@/lib/api'
import toast from 'react-hot-toast'

const SPECIALITES = ['Médecine générale','Cardiologie','Pédiatrie','Gynécologie','Dermatologie','Neurologie','ORL','Orthopédie','Ophtalmologie','Chirurgie générale','Endocrinologie','Médecine interne']

type FormData = { nom: string; telephone: string; email: string; specialite: string; date_rdv: string; type_rdv: 'presentiel'|'video'; motif: string; mode_paiement: string; reference_paiement?: string }

export default function ConsultationPage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [typeChoisi, setTypeChoisi] = useState<'presentiel'|'video'|null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'form'|'paiement_video'|'attente_confirmation'>('form')
  const [rdvCreated, setRdvCreated] = useState<any>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        patient_nom: data.nom,
        patient_telephone: data.telephone,
        patient_email: data.email,
        date_rdv: new Date(data.date_rdv).toISOString(),
        // For video: starts as paiement_requis, for physique: en_attente
        statut: data.type_rdv === 'video' ? 'paiement_requis' : 'en_attente',
      }
      const rdv = await rdvApi.create(payload)

      if (data.type_rdv === 'video') {
        // Video requires payment before confirmation
        setRdvCreated(rdv.data)
        setStep('paiement_video')
      } else {
        setSuccess(true); reset()
        toast.success('Votre demande a été envoyée ! Nous vous contacterons pour confirmer.')
      }
    } catch { toast.error('Erreur lors de la soumission') }
    finally { setLoading(false) }
  }

  if (success) return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />
      <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', paddingTop:110 }}>
        <div style={{ background:'white', borderRadius:24, padding:56, textAlign:'center', maxWidth:480, boxShadow:'0 8px 40px rgba(0,0,0,0.08)', border:'1px solid #e2e8f0' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
            <i className="fa-solid fa-check" style={{ color:'#16a34a', fontSize:32 }} />
          </div>
          <h2 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.6rem', marginBottom:12 }}>Demande envoyée !</h2>
          <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:28 }}>Notre équipe vous contactera dans les plus brefs délais pour confirmer votre rendez-vous.</p>
          <button onClick={() => { setSuccess(false); setTypeChoisi(null) }} style={{
            background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none',
            borderRadius:12, padding:'12px 28px', fontWeight:700, cursor:'pointer'
          }}>Prendre un autre RDV</button>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ── EN-TÊTE ───────────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8 60%,#0d9488)', paddingTop:110, paddingBottom:56, padding:'110px 5% 56px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(13,148,136,0.2)', border:'1px solid rgba(13,148,136,0.4)', borderRadius:50, padding:'6px 16px', marginBottom:20 }}>
            <i className="fa-solid fa-calendar-check" style={{ color:'#5eead4', fontSize:13 }} />
            <span style={{ color:'#5eead4', fontSize:13, fontWeight:600 }}>Réservation en ligne · Rapide et simple</span>
          </div>
          <h1 style={{ fontSize:'clamp(1.8rem,3.5vw,2.8rem)', fontWeight:900, color:'white', lineHeight:1.2, marginBottom:16 }}>
            Prenez soin de vous,<br />
            <em style={{ fontStyle:'italic', color:'#5eead4', fontFamily:'Georgia,serif' }}>à votre rythme</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'1rem', lineHeight:1.7 }}>
            Consultez en cabinet ou depuis chez vous par vidéo. Une équipe bienveillante vous attend.
          </p>
        </div>
      </div>

      <div style={{ background:'#f8fafc', padding:'64px 5%', minHeight:'60vh' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>

          {/* ── CHOIX DU TYPE ────────────────────────────────────────── */}
          {!typeChoisi && (
            <>
              <h2 style={{ textAlign:'center', fontWeight:900, color:'#0f172a', fontSize:'1.6rem', marginBottom:8 }}>Comment souhaitez-vous consulter ?</h2>
              <p style={{ textAlign:'center', color:'#64748b', marginBottom:40 }}>Choisissez le mode qui vous convient le mieux</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, maxWidth:700, margin:'0 auto' }}>
                {[
                  { type:'presentiel' as const, icon:'fa-hospital', emoji:'🏥', titre:'En cabinet', desc:'Venez nous rencontrer à la clinique. Rencontrez votre médecin en personne pour un suivi complet.', avantages:['Examen physique complet','Résultats immédiats','Contact humain direct'] },
                  { type:'video' as const, icon:'fa-video', emoji:'💻', titre:'Par vidéo', desc:'Consultez depuis votre domicile. Pratique, sans déplacement, aussi efficace pour de nombreux cas.', avantages:['Sans déplacement','Lien vidéo sécurisé','Disponible 7j/7'] },
                ].map(opt => (
                  <div key={opt.type} onClick={() => setTypeChoisi(opt.type)} style={{
                    background:'white', borderRadius:24, padding:36, textAlign:'center', cursor:'pointer',
                    border:'2px solid #e2e8f0', transition:'all 0.25s'
                  }}
                    onMouseEnter={e => { const d = e.currentTarget; d.style.borderColor='#1641C8'; d.style.transform='translateY(-4px)'; d.style.boxShadow='0 16px 40px rgba(22,65,200,0.12)' }}
                    onMouseLeave={e => { const d = e.currentTarget; d.style.borderColor='#e2e8f0'; d.style.transform='none'; d.style.boxShadow='none' }}
                  >
                    <div style={{ fontSize:48, marginBottom:16 }}>{opt.emoji}</div>
                    <h3 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.2rem', marginBottom:10 }}>{opt.titre}</h3>
                    <p style={{ color:'#64748b', fontSize:14, lineHeight:1.6, marginBottom:20 }}>{opt.desc}</p>
                    <ul style={{ listStyle:'none', padding:0, margin:'0 0 24px', textAlign:'left' }}>
                      {opt.avantages.map(a => (
                        <li key={a} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, color:'#475569', fontSize:14 }}>
                          <i className="fa-solid fa-check-circle" style={{ color:'#0d9488' }} /> {a}
                        </li>
                      ))}
                    </ul>
                    <div style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', borderRadius:12, padding:'12px 0', fontWeight:700, fontSize:15 }}>
                      Choisir ce mode
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── FORMULAIRE ───────────────────────────────────────────── */}
          {typeChoisi && (
            <div style={{ maxWidth:600, margin:'0 auto' }}>
              <button onClick={() => setTypeChoisi(null)} style={{ background:'none', border:'none', color:'#1641C8', cursor:'pointer', fontWeight:600, marginBottom:24, display:'flex', alignItems:'center', gap:8 }}>
                <i className="fa-solid fa-arrow-left" /> Changer de mode
              </button>
              <div style={{ background:'white', borderRadius:24, padding:40, border:'1px solid #e2e8f0', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28, paddingBottom:20, borderBottom:'1px solid #f1f5f9' }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className={`fa-solid ${typeChoisi === 'video' ? 'fa-video' : 'fa-hospital'}`} style={{ color:'white' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight:800, color:'#0f172a' }}>Consultation {typeChoisi === 'video' ? 'vidéo' : 'en cabinet'}</div>
                    <div style={{ color:'#64748b', fontSize:13 }}>Remplissez le formulaire ci-dessous</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  {[
                    { name:'nom' as const, label:'Nom complet *', type:'text', placeholder:'Marie Dupont' },
                    { name:'telephone' as const, label:'Téléphone *', type:'tel', placeholder:'+509 xxxx xxxx' },
                    { name:'email' as const, label:'Email', type:'email', placeholder:'email@exemple.com' },
                  ].map(f => (
                    <div key={f.name} style={{ marginBottom:18 }}>
                      <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:14, marginBottom:6 }}>{f.label}</label>
                      <input {...register(f.name, f.name !== 'email' ? { required: true } : {})} type={f.type} placeholder={f.placeholder}
                        style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${errors[f.name] ? '#ef4444' : '#d1d5db'}`, fontSize:15, outline:'none', boxSizing:'border-box' }} />
                    </div>
                  ))}

                  <div style={{ marginBottom:18 }}>
                    <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:14, marginBottom:6 }}>Spécialité souhaitée *</label>
                    <select {...register('specialite', { required:true })} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:15, background:'white', boxSizing:'border-box' }}>
                      <option value="">Choisir une spécialité</option>
                      {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom:18 }}>
                    <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:14, marginBottom:6 }}>Date souhaitée *</label>
                    <input {...register('date_rdv', { required:true })} type="datetime-local" min={new Date().toISOString().slice(0,16)}
                      style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:15, boxSizing:'border-box' }} />
                  </div>

                  <div style={{ marginBottom:18 }}>
                    <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:14, marginBottom:6 }}>Motif de consultation</label>
                    <textarea {...register('motif')} placeholder="Décrivez brièvement votre motif de consultation..." rows={3}
                      style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:15, resize:'vertical', boxSizing:'border-box' }} />
                  </div>

                  {/* Paiement */}
                  <div style={{ background:'#f0f9ff', borderRadius:12, padding:16, marginBottom:24, border:'1px solid #bae6fd' }}>
                    <div style={{ fontWeight:700, color:'#0369a1', fontSize:14, marginBottom:12 }}>
                      <i className="fa-solid fa-credit-card" style={{ marginRight:8 }} />Mode de paiement
                    </div>
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                      {['especes','moncash','natcash','carte'].map(m => (
                        <label key={m} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:14, color:'#374151' }}>
                          <input {...register('mode_paiement')} type="radio" value={m} defaultChecked={m==='especes'} /> {m.charAt(0).toUpperCase()+m.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>

                  <input {...register('type_rdv')} type="hidden" value={typeChoisi} />

                  <button type="submit" disabled={loading} style={{
                    width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)',
                    color:'white', border:'none', borderRadius:12, padding:'14px 0',
                    fontWeight:700, fontSize:'1rem', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1
                  }}>
                    {loading ? 'Envoi en cours...' : <><i className="fa-solid fa-calendar-check" style={{ marginRight:8 }} />Confirmer ma demande</>}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
