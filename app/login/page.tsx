'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ChevronDown, LogIn } from 'lucide-react'

type FormData = { email: string; password: string }

const ROLES = [
  { value:'patient',   label:'Patient',          icon:'👤', desc:'Accéder à vos rendez-vous et résultats' },
  { value:'medecin',   label:'Médecin',           icon:'🩺', desc:'Espace médecin — dossiers et consultations', domaine:'@cliniquerebecca.ht' },
  { value:'admin',     label:'Administrateur',    icon:'🛡️', desc:'Gestion complète de la clinique', domaine:'@cliniquerebecca.ht' },
  { value:'caissier',  label:'Caissier(ère)',      icon:'💳', desc:'Facturation et paiements', domaine:'@cliniquerebecca.ht' },
  { value:'labo',      label:'Laboratoire',       icon:'🔬', desc:'Saisie et gestion des résultats', domaine:'@cliniquerebecca.ht' },
  { value:'infirmier', label:'Infirmier(ère)',     icon:'🏥', desc:'Signes vitaux et suivi patients', domaine:'@cliniquerebecca.ht' },
  { value:'pharmacie', label:'Pharmacie',         icon:'💊', desc:'Gestion des médicaments', domaine:'@cliniquerebecca.ht' },
]

const DASHBOARDS: Record<string,string> = {
  admin:'/admin/dashboard', medecin:'/medecin/dashboard',
  patient:'/patient/dashboard', caissier:'/caissier',
  labo:'/labo', pharmacie:'/pharmacie', infirmier:'/infirmier',
}

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [showPwd,    setShowPwd]    = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [roleOpen,   setRoleOpen]   = useState(false)
  const [roleSelec,  setRoleSelec]  = useState(ROLES[0])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      const { access_token, user } = res.data
      if (user.role !== roleSelec.value) {
        toast.error(`Ce compte est un compte "${user.role}", pas "${roleSelec.label}". Sélectionnez le bon rôle.`)
        setLoading(false); return
      }
      login(access_token, user)
      toast.success(`Bienvenue, ${user.nom} !`)
      router.push(DASHBOARDS[user.role] || '/')
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Identifiants incorrects'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const selectedRole = roleSelec

  return (
    <div style={{ minHeight:'100vh', display:'flex' }}>
      {/* Panneau gauche */}
      <div style={{ flex:1, background:'linear-gradient(135deg,#0f1e3d 0%,#1641C8 60%,#0d9488 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 48px', position:'relative', overflow:'hidden' }}>
        {/* Cercles décoratifs */}
        <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', bottom:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />

        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:48 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🏥</div>
          <span style={{ color:'white', fontWeight:900, fontSize:18 }}>Clinique de la Rebecca</span>
        </Link>

        <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.8rem,3vw,2.6rem)', lineHeight:1.2, margin:'0 0 16px' }}>
          Votre espace santé<br /><em style={{ fontStyle:'italic', color:'#5eead4' }}>personnel.</em>
        </h1>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:15, lineHeight:1.7, margin:'0 0 40px', maxWidth:380 }}>
          Accédez à vos informations médicales, rendez-vous et résultats en toute sécurité.
        </p>

        {[
          { icon:'📅', text:'Gérez vos rendez-vous facilement' },
          { icon:'🔬', text:'Consultez vos résultats d\'analyses' },
          { icon:'📹', text:'Consultations vidéo disponibles' },
        ].map((f,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{f.icon}</div>
            <span style={{ color:'rgba(255,255,255,0.8)', fontSize:14 }}>{f.text}</span>
          </div>
        ))}

        {/* Témoignage */}
        <div style={{ marginTop:40, background:'rgba(255,255,255,0.08)', borderRadius:14, padding:'18px 20px', borderLeft:'3px solid #5eead4' }}>
          <p style={{ color:'rgba(255,255,255,0.85)', fontSize:13, fontStyle:'italic', margin:'0 0 8px', lineHeight:1.6 }}>
            "L'équipe est d'une gentillesse remarquable. Je me suis sentie accompagnée à chaque étape."
          </p>
          <span style={{ color:'#5eead4', fontSize:12, fontWeight:600 }}>— Marie-Ange C., patiente</span>
        </div>

        <Link href="/" style={{ color:'rgba(255,255,255,0.5)', fontSize:13, textDecoration:'none', marginTop:32, display:'flex', alignItems:'center', gap:6 }}>
          ← Retour au site
        </Link>
      </div>

      {/* Panneau droit - formulaire */}
      <div style={{ width:'min(480px,100%)', background:'white', display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 44px' }}>
        <h2 style={{ fontWeight:900, fontSize:'1.7rem', color:'#0f172a', margin:'0 0 6px' }}>Connexion</h2>
        <p style={{ color:'#64748b', fontSize:14, margin:'0 0 32px' }}>Sélectionnez votre rôle, puis entrez vos identifiants.</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Sélecteur de rôle */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontWeight:700, fontSize:13, color:'#374151', marginBottom:8 }}>
              Je me connecte en tant que...
            </label>
            <div style={{ position:'relative' }}>
              <button type="button" onClick={() => setRoleOpen(!roleOpen)}
                style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:'2px solid #e2e8f0', background:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left' }}>
                <span style={{ fontSize:22 }}>{selectedRole.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#0f172a', fontSize:15 }}>{selectedRole.label}</div>
                  <div style={{ color:'#64748b', fontSize:12 }}>{selectedRole.desc}</div>
                </div>
                <ChevronDown size={16} color="#64748b" style={{ transition:'transform 0.2s', transform: roleOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {roleOpen && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, right:0, background:'white', borderRadius:14, border:'1px solid #e2e8f0', boxShadow:'0 12px 40px rgba(0,0,0,0.12)', zIndex:50, overflow:'hidden' }}>
                  {ROLES.map(r => (
                    <button key={r.value} type="button"
                      onClick={() => { setRoleSelec(r); setRoleOpen(false) }}
                      style={{
                        width:'100%', padding:'12px 16px', background: r.value === selectedRole.value ? '#f0f9ff' : 'white',
                        border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:12,
                        borderBottom:'1px solid #f1f5f9', textAlign:'left',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = r.value === selectedRole.value ? '#f0f9ff' : 'white')}>
                      <span style={{ fontSize:20 }}>{r.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, color:'#0f172a', fontSize:14 }}>{r.label}</div>
                        {r.domaine && <div style={{ fontSize:11, color:'#94a3b8' }}>Email requis : ...{r.domaine}</div>}
                      </div>
                      {r.value === selectedRole.value && <span style={{ color:'#1641C8', fontSize:18 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Avertissement domaine */}
            {selectedRole.domaine && (
              <div style={{ marginTop:8, padding:'8px 12px', background:'#fffbeb', borderRadius:8, fontSize:12, color:'#92400e', display:'flex', alignItems:'center', gap:6 }}>
                ⚠️ Ce rôle nécessite un email <strong>{selectedRole.domaine}</strong>
              </div>
            )}
            {selectedRole.value === 'patient' && (
              <div style={{ marginTop:8, padding:'8px 12px', background:'#f0fdf4', borderRadius:8, fontSize:12, color:'#166534', display:'flex', alignItems:'center', gap:6 }}>
                ✓ Utilisez votre email personnel pour protéger votre vie privée
              </div>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontWeight:700, fontSize:13, color:'#374151', marginBottom:6 }}>Email</label>
            <input {...register('email', {
              required: 'Email requis',
              pattern: {
                value: selectedRole.domaine
                  ? new RegExp(`@cliniquerebecca\\.ht$`)
                  : /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: selectedRole.domaine
                  ? `Les comptes ${selectedRole.label} utilisent uniquement @cliniquerebecca.ht`
                  : 'Email invalide'
              }
            })}
              type="email"
              placeholder={selectedRole.domaine ? `prenom.nom@cliniquerebecca.ht` : 'votre@email.com'}
              style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`, fontSize:14, boxSizing:'border-box' as const, outline:'none' }} />
            {errors.email && <p style={{ color:'#ef4444', fontSize:12, marginTop:4 }}>{errors.email.message}</p>}
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontWeight:700, fontSize:13, color:'#374151', marginBottom:6 }}>Mot de passe</label>
            <div style={{ position:'relative' }}>
              <input {...register('password', { required: 'Mot de passe requis' })}
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                style={{ width:'100%', padding:'12px 44px 12px 16px', borderRadius:10, border:`1px solid ${errors.password ? '#ef4444' : '#d1d5db'}`, fontSize:14, boxSizing:'border-box' as const, outline:'none' }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:4 }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color:'#ef4444', fontSize:12, marginTop:4 }}>{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} style={{
            width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)',
            color:'white', border:'none', borderRadius:12, padding:'14px',
            fontWeight:800, fontSize:15, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            opacity: loading ? 0.8 : 1
          }}>
            <LogIn size={16} />
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {selectedRole.value === 'patient' && (
          <p style={{ textAlign:'center', marginTop:20, color:'#64748b', fontSize:13 }}>
            Pas encore de compte ?{' '}
            <Link href="/register" style={{ color:'#1641C8', fontWeight:700, textDecoration:'none' }}>Créer un compte</Link>
          </p>
        )}

        {selectedRole.value !== 'patient' && (
          <div style={{ marginTop:20, padding:'12px 16px', background:'#f8fafc', borderRadius:10, fontSize:12, color:'#64748b', textAlign:'center' }}>
            Compte personnel de la clinique ? Contactez l'administrateur :<br />
            <strong style={{ color:'#1641C8' }}>admin@cliniquerebecca.ht</strong>
          </div>
        )}
      </div>
    </div>
  )
}
