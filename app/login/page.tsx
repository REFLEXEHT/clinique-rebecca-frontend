'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

type FormData = { email: string; password: string }

const ROLES = [
  { value:'patient',   label:'Patient',       icon:'fa-user',          color:'#1641C8' },
  { value:'medecin',   label:'Médecin',        icon:'fa-user-doctor',   color:'#0d9488' },
  { value:'admin',     label:'Administrateur', icon:'fa-shield-halved', color:'#6366f1' },
  { value:'caissier',  label:'Caissier',       icon:'fa-cash-register', color:'#d97706' },
  { value:'labo',      label:'Laboratoire',    icon:'fa-flask',         color:'#16a34a' },
  { value:'infirmier',  label:'Infirmier(ère)',  icon:'fa-user-nurse',    color:'#0d9488' },
  { value:'pharmacie', label:'Pharmacie',      icon:'fa-pills',         color:'#dc2626' },
]

const DASHBOARDS: Record<string,string> = {
  admin:'/admin/dashboard', medecin:'/medecin/dashboard',
  patient:'/patient/dashboard', caissier:'/caissier', labo:'/labo', pharmacie:'/pharmacie', infirmier:'/infirmier'
}

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [roleSelec, setRoleSelec] = useState('patient')
  const { login } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, formState:{ errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      const { access_token, user } = res.data
      login(access_token, user)
      toast.success(`Bienvenue, ${user.nom} !`)
      router.push(DASHBOARDS[user.role] || '/')
    } catch {
      toast.error('Email ou mot de passe incorrect')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', background:'white' }}>

      {/* ── PANNEAU GAUCHE — visuel ───────────────────────────────────── */}
      <div style={{ background:'linear-gradient(160deg,#0f1e3d 0%,#1641C8 50%,#0d9488 100%)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:56, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', bottom:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'rgba(13,148,136,0.15)' }} />
        <div style={{ position:'relative', textAlign:'center', color:'white', maxWidth:360 }}>
          <div style={{ width:64, height:64, background:'rgba(255,255,255,0.15)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', backdropFilter:'blur(8px)' }}>
            <i className="fa-solid fa-hospital-user" style={{ fontSize:28 }} />
          </div>
          <h1 style={{ fontSize:'2rem', fontWeight:900, marginBottom:8 }}>Clinique de la Rebecca</h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'1rem', marginBottom:48, lineHeight:1.6 }}>
            Votre espace santé personnel.<br />Accédez à vos informations, rendez-vous et résultats.
          </p>
          {[
            { icon:'fa-calendar-check', txt:'Gérez vos rendez-vous facilement' },
            { icon:'fa-flask', txt:'Consultez vos résultats d\'analyses' },
            { icon:'fa-message', txt:'Communiquez avec votre médecin' },
          ].map(a => (
            <div key={a.txt} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16, textAlign:'left' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'rgba(13,148,136,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={`fa-solid ${a.icon}`} style={{ color:'#5eead4', fontSize:16 }} />
              </div>
              <span style={{ color:'rgba(255,255,255,0.85)', fontSize:14 }}>{a.txt}</span>
            </div>
          ))}
          <div style={{ marginTop:36, padding:'20px 24px', background:'rgba(255,255,255,0.08)', borderRadius:16, backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🌟</div>
            <p style={{ color:'rgba(255,255,255,0.8)', fontSize:13, fontStyle:'italic', lineHeight:1.6 }}>
              "L'équipe est d'une gentillesse remarquable. Je me suis sentie accompagnée à chaque étape."
            </p>
            <p style={{ color:'#5eead4', fontSize:12, marginTop:8, fontWeight:600 }}>— Marie-Ange C., patiente</p>
          </div>
        </div>
      </div>

      {/* ── PANNEAU DROIT — formulaire ───────────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'56px 64px', background:'#fafbfc' }}>
        <div style={{ maxWidth:400, width:'100%', margin:'0 auto' }}>
          <h2 style={{ fontSize:'1.8rem', fontWeight:900, color:'#0f172a', marginBottom:6 }}>Connexion</h2>
          <p style={{ color:'#64748b', marginBottom:32 }}>Bienvenue ! Sélectionnez votre profil pour continuer.</p>

          {/* Sélection rôle */}
          <div style={{ marginBottom:28 }}>
            <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:14, marginBottom:10 }}>Je suis un(e)…</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setRoleSelec(r.value)} style={{
                  padding:'10px 8px', borderRadius:12, border:`2px solid ${roleSelec===r.value ? r.color : '#e2e8f0'}`,
                  background: roleSelec===r.value ? `${r.color}15` : 'white',
                  cursor:'pointer', textAlign:'center', transition:'all 0.2s'
                }}>
                  <i className={`fa-solid ${r.icon}`} style={{ color:r.color, fontSize:18, display:'block', marginBottom:4 }} />
                  <span style={{ fontSize:11, fontWeight:600, color:roleSelec===r.value ? r.color : '#64748b' }}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:14, marginBottom:6 }}>Email</label>
              <input {...register('email',{ required:true })} type="email" placeholder="votre@email.com"
                style={{ width:'100%', padding:'13px 14px', borderRadius:10, border:`1px solid ${errors.email?'#ef4444':'#d1d5db'}`, fontSize:15, outline:'none', boxSizing:'border-box', background:'white' }} />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:14, marginBottom:6 }}>Mot de passe</label>
              <div style={{ position:'relative' }}>
                <input {...register('password',{ required:true })} type={showPwd?'text':'password'} placeholder="••••••••"
                  style={{ width:'100%', padding:'13px 44px 13px 14px', borderRadius:10, border:`1px solid ${errors.password?'#ef4444':'#d1d5db'}`, fontSize:15, outline:'none', boxSizing:'border-box', background:'white' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}>
                  <i className={`fa-solid ${showPwd?'fa-eye-slash':'fa-eye'}`} />
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white',
              border:'none', borderRadius:12, padding:'14px 0', fontWeight:700, fontSize:'1rem',
              cursor:loading?'not-allowed':'pointer', opacity:loading?0.75:1,
              boxShadow:'0 4px 16px rgba(22,65,200,0.3)'
            }}>
              {loading ? 'Connexion...' : <><i className="fa-solid fa-right-to-bracket" style={{ marginRight:8 }} />Se connecter</>}
            </button>
          </form>

          <p style={{ textAlign:'center', color:'#64748b', fontSize:14, marginTop:24 }}>
            Pas encore de compte ?{' '}
            <Link href="/register" style={{ color:'#1641C8', fontWeight:700, textDecoration:'none' }}>Créer un compte</Link>
          </p>
          <p style={{ textAlign:'center', marginTop:12 }}>
            <Link href="/" style={{ color:'#94a3b8', fontSize:13, textDecoration:'none' }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight:4 }} />Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
