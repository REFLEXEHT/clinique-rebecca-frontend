'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { rdvApi } from '@/lib/api'
import toast from 'react-hot-toast'

const SPECIALITES = ['Médecine générale','Cardiologie','Pédiatrie','Gynécologie','Dermatologie','Neurologie','ORL','Orthopédie','Ophtalmologie','Chirurgie générale','Médecine interne','Pneumologie']

type FormData = { nom:string; telephone:string; email:string; specialite:string; date_rdv:string; type_rdv:'presentiel'|'video'; motif:string; mode_paiement:string }

export default function ConsultationPage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [typeChoisi, setTypeChoisi] = useState<'presentiel'|'video'|null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, reset, formState:{errors} } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await rdvApi.create({ ...data, patient_nom:data.nom, patient_telephone:data.telephone, patient_email:data.email, date_rdv:new Date(data.date_rdv).toISOString() })
      setSuccess(true); reset()
      toast.success('Votre demande a été envoyée !')
    } catch { toast.error('Erreur lors de la soumission') }
    finally { setLoading(false) }
  }

  if (success) return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />
      <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', paddingTop:80 }}>
        <div style={{ background:'white', borderRadius:24, padding:'48px 40px', textAlign:'center', maxWidth:460, boxShadow:'0 8px 40px rgba(0,0,0,0.08)', border:'1px solid #e2e8f0' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <i className="fa-solid fa-check" style={{ color:'#16a34a', fontSize:28 }} />
          </div>
          <h2 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.5rem', marginBottom:12 }}>Demande envoyée</h2>
          <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:28 }}>Notre équipe vous contactera rapidement pour confirmer votre rendez-vous.</p>
          <button onClick={() => { setSuccess(false); setTypeChoisi(null) }} style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:12, padding:'12px 28px', fontWeight:700, cursor:'pointer' }}>
            Prendre un autre rendez-vous
          </button>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* Hero compact */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8 60%,#0d9488)', padding:'90px 5% 40px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(13,148,136,0.2)', border:'1px solid rgba(13,148,136,0.4)', borderRadius:50, padding:'5px 16px', marginBottom:16 }}>
            <i className="fa-solid fa-calendar-check" style={{ color:'#5eead4', fontSize:12 }} />
            <span style={{ color:'#5eead4', fontSize:13, fontWeight:600 }}>Réservation en ligne — Rapide et simple</span>
          </div>
          <h1 style={{ fontSize:'clamp(1.6rem,3vw,2.6rem)', fontWeight:900, color:'white', lineHeight:1.2, marginBottom:12 }}>
            Prenez soin de vous, <em style={{ fontStyle:'italic', color:'#5eead4', fontFamily:'Georgia,serif' }}>à votre rythme</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'0.95rem', lineHeight:1.65 }}>
            Consultez en cabinet ou depuis chez vous. Une équipe bienveillante vous attend.
          </p>
        </div>
      </div>

      <div style={{ background:'#f8fafc', padding:'40px 5% 64px' }}>
        <div style={{ maxWidth:860, margin:'0 auto' }}>

          {/* Choix du type */}
          {!typeChoisi && (
            <>
              <h2 style={{ textAlign:'center', fontWeight:900, color:'#0f172a', fontSize:'1.4rem', marginBottom:6 }}>Comment souhaitez-vous consulter ?</h2>
              <p style={{ textAlign:'center', color:'#64748b', marginBottom:32, fontSize:14 }}>Choisissez le mode qui vous convient</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, maxWidth:660, margin:'0 auto' }}>
                {[
                  { type:'presentiel' as const, icon:'fa-hospital', titre:'En cabinet', desc:'Rencontrez votre médecin en personne pour un examen physique complet et un suivi personnalisé.', avantages:['Examen physique complet','Résultats immédiats','Contact direct avec le médecin'] },
                  { type:'video' as const, icon:'fa-video', titre:'Par vidéo', desc:'Consultez depuis chez vous pour un avis médical, un suivi ou un renouvellement ordonnance.', avantages:['Sans déplacement','Lien vidéo sécurisé','Disponible 6j/7'] },
                ].map(opt => (
                  <div key={opt.type} onClick={() => setTypeChoisi(opt.type)} style={{ background:'white', borderRadius:20, padding:'28px 24px', textAlign:'center', cursor:'pointer', border:'2px solid #e2e8f0', transition:'all 0.22s' }}
                    onMouseEnter={e => { const d=e.currentTarget; d.style.borderColor='#1641C8'; d.style.transform='translateY(-4px)'; d.style.boxShadow='0 12px 40px rgba(22,65,200,0.1)' }}
                    onMouseLeave={e => { const d=e.currentTarget; d.style.borderColor='#e2e8f0'; d.style.transform='none'; d.style.boxShadow='none' }}>
                    <div style={{ width:56, height:56, borderRadius:16, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                      <i className={`fa-solid ${opt.icon}`} style={{ color:'#1641C8', fontSize:22 }} />
                    </div>
                    <h3 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.1rem', marginBottom:10 }}>{opt.titre}</h3>
                    <p style={{ color:'#64748b', fontSize:13, lineHeight:1.6, marginBottom:18 }}>{opt.desc}</p>
                    <ul style={{ listStyle:'none', padding:0, margin:'0 0 20px', textAlign:'left' }}>
                      {opt.avantages.map(a => (
                        <li key={a} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7, color:'#475569', fontSize:13 }}>
                          <i className="fa-solid fa-circle-check" style={{ color:'#0d9488', fontSize:13 }} /> {a}
                        </li>
                      ))}
                    </ul>
                    <div style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', borderRadius:12, padding:'11px 0', fontWeight:700, fontSize:14 }}>
                      Choisir ce mode
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Formulaire */}
          {typeChoisi && (
            <div style={{ maxWidth:580, margin:'0 auto' }}>
              <button onClick={() => setTypeChoisi(null)} style={{ background:'none', border:'none', color:'#1641C8', cursor:'pointer', fontWeight:600, marginBottom:20, display:'flex', alignItems:'center', gap:8, fontSize:14 }}>
                <i className="fa-solid fa-arrow-left" /> Changer de mode
              </button>
              <div style={{ background:'white', borderRadius:20, padding:'32px 28px', border:'1px solid #e2e8f0', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, paddingBottom:18, borderBottom:'1px solid #f1f5f9' }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className={`fa-solid ${typeChoisi==='video'?'fa-video':'fa-hospital'}`} style={{ color:'white' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight:800, color:'#0f172a' }}>Consultation {typeChoisi==='video'?'vidéo':'en cabinet'}</div>
                    <div style={{ color:'#64748b', fontSize:13 }}>Remplissez le formulaire ci-dessous</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  {[
                    { name:'nom' as const, label:'Nom complet', type:'text', placeholder:'Marie Dupont', required:true },
                    { name:'telephone' as const, label:'Téléphone', type:'tel', placeholder:'+509 xxxx xxxx', required:true },
                    { name:'email' as const, label:'Email (optionnel)', type:'email', placeholder:'email@exemple.com', required:false },
                  ].map(f => (
                    <div key={f.name} style={{ marginBottom:16 }}>
                      <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>{f.label}{f.required?' *':''}</label>
                      <input {...register(f.name, f.required?{required:true}:{})} type={f.type} placeholder={f.placeholder}
                        style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${errors[f.name]?'#ef4444':'#d1d5db'}`, fontSize:14, outline:'none', boxSizing:'border-box' }} />
                    </div>
                  ))}

                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Spécialité souhaitée *</label>
                    <select {...register('specialite',{required:true})} style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, background:'white', boxSizing:'border-box' }}>
                      <option value="">Choisir une spécialité</option>
                      {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Date souhaitée *</label>
                    <input {...register('date_rdv',{required:true})} type="datetime-local" min={new Date().toISOString().slice(0,16)}
                      style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, boxSizing:'border-box' }} />
                  </div>

                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Motif de consultation</label>
                    <textarea {...register('motif')} placeholder="Décrivez brièvement votre motif..." rows={3}
                      style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, resize:'vertical', boxSizing:'border-box' }} />
                  </div>

                  <div style={{ background:'#f0f9ff', borderRadius:12, padding:'14px 16px', marginBottom:20, border:'1px solid #bae6fd' }}>
                    <div style={{ fontWeight:700, color:'#0369a1', fontSize:13, marginBottom:10 }}>Mode de paiement préféré</div>
                    <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                      {['especes','moncash','natcash','carte'].map(m => (
                        <label key={m} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:13, color:'#374151' }}>
                          <input {...register('mode_paiement')} type="radio" value={m} defaultChecked={m==='especes'} />
                          {m==='especes'?'Espèces':m.charAt(0).toUpperCase()+m.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>

                  <input {...register('type_rdv')} type="hidden" value={typeChoisi} />

                  <button type="submit" disabled={loading} style={{ width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:12, padding:'13px 0', fontWeight:700, fontSize:'0.95rem', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1 }}>
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
