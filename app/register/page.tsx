'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const ROLES = [
  { value:'patient',   label:'Patient',        icon:'fa-user',          color:'#1641C8', desc:'Accédez à vos RDV et résultats' },
  { value:'medecin',   label:'Médecin',         icon:'fa-user-doctor',   color:'#0d9488', desc:'Gérez vos consultations' },
  { value:'caissier',  label:'Caissier',        icon:'fa-cash-register', color:'#d97706', desc:'Encaissements et paiements' },
  { value:'labo',      label:'Laboratoire',     icon:'fa-flask-vial',    color:'#0891b2', desc:'Analyses et résultats' },
  { value:'pharmacie', label:'Pharmacie',       icon:'fa-pills',         color:'#be185d', desc:'Gestion des stocks' },
]

const SPECIALITES_MEDECIN = [
  'Chirurgie générale','Neurochirurgie','Neurologie','Orthopédie','Pédiatrie',
  'Dermatologie','Urologie','ORL','Gynécologie','Chirurgie pédiatrique',
  'Médecine interne','Ophtalmologie','Cardiologie','Endocrinologie',
]

const TYPES_MEDECIN = [
  { value:'investisseur',           label:'Médecin Investisseur',       desc:'70% consultations · 80% gestes', icon:'fa-chart-line',  color:'#1641C8' },
  { value:'affilie',                label:'Médecin Affilié',            desc:'60% consultations · 70% gestes', icon:'fa-handshake',   color:'#0d9488' },
  { value:'exploitant',             label:'Médecin Exploitant',         desc:'100% revenus + loyer fixe',      icon:'fa-building',    color:'#d97706' },
  { value:'investisseur_exploitant',label:'Investisseur-Exploitant',    desc:'100% revenus + loyer fixe',      icon:'fa-star',        color:'#7c3aed' },
]

interface FormData {
  nom: string; email: string; telephone: string
  password: string; confirmPassword: string
  specialite?: string; type_medecin?: string
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('patient')
  const [selectedTypeMedecin, setSelectedTypeMedecin] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()
  const pwd = watch('password')
  const isMedecin = selectedRole === 'medecin'

  const onSubmit = async (data: FormData) => {
    if (isMedecin && !data.specialite) { toast.error('Sélectionnez une spécialité.'); return }
    if (isMedecin && !selectedTypeMedecin) { toast.error('Sélectionnez le type de médecin.'); return }
    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        nom: data.nom, email: data.email, telephone: data.telephone,
        password: data.password, role: selectedRole,
        ...(isMedecin ? { specialite: data.specialite, type_medecin: selectedTypeMedecin } : {})
      }
      const res = await authApi.register(payload)
      if (res.data?.access_token && res.data?.user) {
        login(res.data.access_token, res.data.user)
        toast.success(`Bienvenue, ${res.data.user.nom} !`)
        router.push('/patient/dashboard')
      } else { setSuccess(true) }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: unknown } }; code?: string }
      const msg = e.response?.data?.detail
      if (typeof msg === 'string') toast.error(msg)
      else if (Array.isArray(msg)) toast.error((msg as {msg:string}[]).map(x => x.msg).join(', '))
      else if (e.code === 'ERR_NETWORK') toast.error('Serveur inaccessible.')
      else toast.error("Erreur lors de l'inscription")
    } finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0f1e3d,#1641C8 60%,#0d9488)', padding:24 }}>
      <div style={{ background:'white', borderRadius:24, padding:48, textAlign:'center', maxWidth:420, width:'100%', boxShadow:'0 32px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <i className="fa-solid fa-clock" style={{ color:'#16a34a', fontSize:28 }} />
        </div>
        <h2 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.5rem', marginBottom:10 }}>Compte soumis !</h2>
        <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:8 }}>Votre compte <strong style={{ textTransform:'capitalize' }}>{selectedRole}</strong> est en attente de validation par l'administrateur.</p>
        <p style={{ color:'#94a3b8', fontSize:13, marginBottom:28 }}>Vous recevrez une notification dès l'activation.</p>
        <Link href="/login" style={{ display:'block', background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', textDecoration:'none', borderRadius:12, padding:'12px 0', fontWeight:700, textAlign:'center' }}>
          <i className="fa-solid fa-right-to-bracket" style={{ marginRight:8 }} />Se connecter
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1.4fr', background:'white' }}>

      {/* ── PANNEAU GAUCHE ──────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(160deg,#0f1e3d 0%,#1641C8 55%,#0d9488 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'56px 48px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:350, height:350, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', bottom:-80, left:-60, width:280, height:280, borderRadius:'50%', background:'rgba(13,148,136,0.12)' }} />
        <div style={{ position:'relative', color:'white' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:40 }}>
            <div style={{ width:44, height:44, background:'rgba(255,255,255,0.15)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>
              <i className="fa-solid fa-hospital-user" style={{ fontSize:20 }} />
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>Clinique de la</div>
              <div style={{ fontSize:18, fontWeight:900 }}>REBECCA</div>
            </div>
          </div>

          <h2 style={{ fontSize:'2rem', fontWeight:900, lineHeight:1.2, marginBottom:12 }}>Rejoignez<br /><em style={{ fontStyle:'italic', color:'#5eead4', fontFamily:'Georgia,serif' }}>notre famille</em><br />de soins</h2>
          <p style={{ color:'rgba(255,255,255,0.68)', lineHeight:1.7, marginBottom:40, fontSize:15 }}>Créez votre espace santé personnel en quelques minutes. Accédez à vos rendez-vous, résultats et médecins.</p>

          {/* Avantages */}
          {[
            { icon:'fa-shield-heart', color:'#5eead4', txt:'Données médicales sécurisées' },
            { icon:'fa-bell', color:'#5eead4', txt:'Rappels RDV automatiques par SMS' },
            { icon:'fa-flask', color:'#5eead4', txt:'Résultats labo sur votre téléphone' },
            { icon:'fa-video', color:'#5eead4', txt:'Consultations vidéo disponibles' },
          ].map(a => (
            <div key={a.txt} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'rgba(13,148,136,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={`fa-solid ${a.icon}`} style={{ color:a.color, fontSize:14 }} />
              </div>
              <span style={{ color:'rgba(255,255,255,0.82)', fontSize:14 }}>{a.txt}</span>
            </div>
          ))}

          <div style={{ marginTop:36, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.12)' }}>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>Déjà inscrit ?</p>
            <Link href="/login" style={{ color:'#5eead4', fontWeight:700, textDecoration:'none', fontSize:15 }}>
              <i className="fa-solid fa-right-to-bracket" style={{ marginRight:6 }} />Se connecter →
            </Link>
          </div>
        </div>
      </div>

      {/* ── PANNEAU DROIT — formulaire ───────────────────────────────────── */}
      <div style={{ overflowY:'auto', padding:'48px 56px', background:'#fafbfc', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div style={{ maxWidth:480, width:'100%', margin:'0 auto' }}>
          <h1 style={{ fontSize:'1.7rem', fontWeight:900, color:'#0f172a', marginBottom:4 }}>Créer un compte</h1>
          <p style={{ color:'#64748b', marginBottom:28, fontSize:15 }}>Choisissez votre profil et remplissez vos informations</p>

          {/* Sélection rôle */}
          <div style={{ marginBottom:24 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:2, marginBottom:12 }}>Je suis</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => { setSelectedRole(r.value); setSelectedTypeMedecin('') }} style={{
                  padding:'12px 6px', borderRadius:14, border:`2px solid ${selectedRole===r.value ? r.color : '#e2e8f0'}`,
                  background: selectedRole===r.value ? `${r.color}10` : 'white',
                  cursor:'pointer', textAlign:'center', transition:'all 0.2s'
                }}>
                  <i className={`fa-solid ${r.icon}`} style={{ color:r.color, fontSize:20, display:'block', marginBottom:6 }} />
                  <span style={{ fontSize:10, fontWeight:700, color:selectedRole===r.value ? r.color : '#94a3b8' }}>{r.label}</span>
                </button>
              ))}
            </div>
            {selectedRole !== 'patient' && (
              <div style={{ marginTop:10, background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:10, padding:'10px 14px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color:'#d97706', marginTop:2 }} />
                <span style={{ color:'#92400e', fontSize:13 }}>Ce compte nécessite une validation par l'administrateur avant activation.</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Champs de base */}
            {[
              { name:'nom' as const,       label:'Nom complet *',       type:'text',  placeholder:'Prénom Nom',       req:true },
              { name:'email' as const,     label:'Email *',             type:'email', placeholder:'votre@email.com',  req:true },
              { name:'telephone' as const, label:'Téléphone WhatsApp',  type:'tel',   placeholder:'+509 3xxx-xxxx',   req:false },
            ].map(f => (
              <div key={f.name} style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:14, marginBottom:6 }}>{f.label}</label>
                <input {...register(f.name, f.req ? { required:true } : {})} type={f.type} placeholder={f.placeholder}
                  style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${errors[f.name]?'#ef4444':'#d1d5db'}`, fontSize:15, outline:'none', boxSizing:'border-box', background:'white' }} />
              </div>
            ))}

            {/* Section médecin */}
            {isMedecin && (
              <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:16, overflow:'hidden', marginBottom:16 }}>
                <div style={{ background:'linear-gradient(135deg,#f0f9ff,#e0f2fe)', padding:'14px 18px', borderBottom:'1px solid #e2e8f0' }}>
                  <p style={{ fontWeight:700, color:'#0369a1', fontSize:13, margin:0 }}>
                    <i className="fa-solid fa-user-doctor" style={{ marginRight:8 }} />Profil médical
                  </p>
                </div>
                <div style={{ padding:18 }}>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:14, marginBottom:6 }}>Spécialité *</label>
                    <select {...register('specialite')} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, background:'white', boxSizing:'border-box' }}>
                      <option value="">Choisir une spécialité…</option>
                      {SPECIALITES_MEDECIN.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:14, marginBottom:10 }}>Type de médecin *</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {TYPES_MEDECIN.map(t => (
                      <button key={t.value} type="button" onClick={() => setSelectedTypeMedecin(t.value)} style={{
                        padding:14, borderRadius:12, border:`2px solid ${selectedTypeMedecin===t.value ? t.color : '#e2e8f0'}`,
                        background: selectedTypeMedecin===t.value ? `${t.color}08` : 'white',
                        cursor:'pointer', textAlign:'left', transition:'all 0.2s'
                      }}>
                        <i className={`fa-solid ${t.icon}`} style={{ color:t.color, marginBottom:6, display:'block' }} />
                        <div style={{ fontWeight:700, color:selectedTypeMedecin===t.value ? t.color : '#0f172a', fontSize:12, marginBottom:3 }}>{t.label}</div>
                        <div style={{ color:'#94a3b8', fontSize:11 }}>{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mots de passe */}
            {[
              { name:'password' as const,        label:'Mot de passe *',        validate:{ required:true, minLength:{ value:6, message:'6 caractères min.' } } },
              { name:'confirmPassword' as const,  label:'Confirmer le mot de passe *', validate:{ required:true, validate: (v: string) => v === pwd || 'Mots de passe différents' } },
            ].map(f => (
              <div key={f.name} style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:14, marginBottom:6 }}>{f.label}</label>
                <div style={{ position:'relative' }}>
                  <input {...register(f.name, f.validate as Parameters<typeof register>[1])} type={showPwd?'text':'password'} placeholder="••••••••"
                    style={{ width:'100%', padding:'12px 44px 12px 14px', borderRadius:10, border:`1px solid ${errors[f.name]?'#ef4444':'#d1d5db'}`, fontSize:15, outline:'none', boxSizing:'border-box', background:'white' }} />
                  {f.name === 'password' && (
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}>
                      <i className={`fa-solid ${showPwd?'fa-eye-slash':'fa-eye'}`} />
                    </button>
                  )}
                </div>
                {errors[f.name] && <p style={{ color:'#ef4444', fontSize:12, marginTop:4 }}>{errors[f.name]?.message as string}</p>}
              </div>
            ))}

            <button type="submit" disabled={loading} style={{
              width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white',
              border:'none', borderRadius:12, padding:'14px 0', fontWeight:700, fontSize:'1rem',
              cursor:loading?'not-allowed':'pointer', opacity:loading?0.75:1,
              boxShadow:'0 4px 16px rgba(22,65,200,0.3)', marginTop:8
            }}>
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight:8 }} />Création en cours…</>
                : <><i className="fa-solid fa-user-plus" style={{ marginRight:8 }} />Créer mon compte</>
              }
            </button>
          </form>

          <p style={{ textAlign:'center', color:'#64748b', fontSize:14, marginTop:20 }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color:'#1641C8', fontWeight:700, textDecoration:'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
