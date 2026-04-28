'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

type FormData = { email: string; password: string }

const ROLES = [
  { value: 'patient',   label: 'Patient',       icon: 'fa-user',          color: '#1641C8' },
  { value: 'medecin',   label: 'Médecin',        icon: 'fa-user-doctor',   color: '#0d9488' },
  { value: 'admin',     label: 'Administrateur', icon: 'fa-shield-halved', color: '#6366f1' },
  { value: 'caissier',  label: 'Caissier',       icon: 'fa-cash-register', color: '#d97706' },
  { value: 'labo',      label: 'Laboratoire',    icon: 'fa-flask',         color: '#16a34a' },
  { value: 'pharmacie', label: 'Pharmacie',      icon: 'fa-pills',         color: '#dc2626' },
]

const DASHBOARDS: Record<string, string> = {
  admin: '/admin/dashboard', medecin: '/medecin/dashboard',
  patient: '/patient/dashboard', caissier: '/caissier', labo: '/labo', pharmacie: '/pharmacie',
}

export default function LoginPage() {
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [roleSelec, setRoleSelec] = useState('patient')
  const { login } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      const { access_token, user } = res.data
      if (user.role !== roleSelec) {
        const roleLabel = ROLES.find(r => r.value === user.role)?.label || user.role
        toast.error(`Ce compte est enregistré comme "${roleLabel}". Veuillez sélectionner le bon profil.`)
        setLoading(false)
        return
      }
      login(access_token, user)
      toast.success(`Bienvenue, ${user.nom} !`)
      router.push(DASHBOARDS[user.role] || '/')
    } catch {
      toast.error('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = ROLES.find(r => r.value === roleSelec)!

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'white' }}>

      {/* ── Panneau gauche — identique au style page-header ── */}
      <div style={{
        background: 'linear-gradient(160deg, #0f1e3d 0%, #1641C8 55%, #0d9488 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '56px 48px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Décors */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(13,148,136,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', textAlign: 'center', color: 'white', maxWidth: 380 }}>
          {/* Badge label */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', borderRadius: 50, padding: '5px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24, border: '1px solid rgba(255,255,255,0.2)' }}>
            <i className="fa-solid fa-hospital" /> Clinique de la Rebecca
          </span>

          <div style={{ width: 68, height: 68, background: 'rgba(255,255,255,0.14)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <i className="fa-solid fa-hospital-user" style={{ fontSize: 30 }} />
          </div>

          <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>
            Votre espace santé personnel
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 36, lineHeight: 1.7 }}>
            Accédez à vos informations, rendez-vous et résultats médicaux en toute sécurité.
          </p>

          {[
            { icon: 'fa-calendar-check', txt: 'Gérez vos rendez-vous facilement' },
            { icon: 'fa-flask',          txt: "Consultez vos résultats d'analyses" },
            { icon: 'fa-video',          txt: 'Consultations vidéo disponibles' },
          ].map(a => (
            <div key={a.txt} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, textAlign: 'left' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(13,148,136,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(94,234,212,0.2)' }}>
                <i className={`fa-solid ${a.icon}`} style={{ color: '#5eead4', fontSize: 15 }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13.5 }}>{a.txt}</span>
            </div>
          ))}

          {/* Témoignage */}
          <div style={{ marginTop: 32, padding: '18px 20px', background: 'rgba(255,255,255,0.08)', borderRadius: 16, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', textAlign: 'left' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12.5, fontStyle: 'italic', lineHeight: 1.65 }}>
              &ldquo;L&apos;équipe est d&apos;une gentillesse remarquable. Je me suis sentie accompagnée à chaque étape.&rdquo;
            </p>
            <p style={{ color: '#5eead4', fontSize: 11.5, marginTop: 8, fontWeight: 700 }}>— Marie-Ange C., patiente</p>
          </div>

          <div style={{ marginTop: 24 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> Retour au site
            </Link>
          </div>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '56px 64px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>

          {/* En-tête formulaire */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${selectedRole.color}, ${selectedRole.color}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${selectedRole.color}40`, transition: 'all 0.3s' }}>
                <i className={`fa-solid ${selectedRole.icon}`} style={{ color: 'white', fontSize: 17 }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>Connexion</h2>
                <p style={{ color: '#64748b', fontSize: 13 }}>Clinique de la Rebecca</p>
              </div>
            </div>
          </div>

          {/* Sélection du profil */}
          <div style={{ marginBottom: 26 }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 13, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Je me connecte en tant que…
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setRoleSelec(r.value)} style={{
                  padding: '10px 6px', borderRadius: 12,
                  border: `2px solid ${roleSelec === r.value ? r.color : '#e2e8f0'}`,
                  background: roleSelec === r.value ? `${r.color}12` : 'white',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  boxShadow: roleSelec === r.value ? `0 4px 12px ${r.color}25` : 'none',
                }}>
                  <i className={`fa-solid ${r.icon}`} style={{ color: r.color, fontSize: 17, display: 'block', marginBottom: 4 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: roleSelec === r.value ? r.color : '#64748b' }}>{r.label}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, background: '#eff6ff', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #bfdbfe' }}>
              <i className="fa-solid fa-circle-info" />
              Le profil sélectionné doit correspondre exactement à votre compte.
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 13, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13 }} />
                <input
                  {...register('email', { required: true })}
                  type="email"
                  placeholder="votre@email.com"
                  style={{ width: '100%', padding: '13px 14px 13px 40px', borderRadius: 12, border: `1.5px solid ${errors.email ? '#ef4444' : '#e2e8f0'}`, fontSize: 14.5, outline: 'none', boxSizing: 'border-box', background: 'white', transition: 'border-color 0.2s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = selectedRole.color }}
                  onBlur={e => { e.currentTarget.style.borderColor = errors.email ? '#ef4444' : '#e2e8f0' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 26 }}>
              <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 13, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13 }} />
                <input
                  {...register('password', { required: true })}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '13px 44px 13px 40px', borderRadius: 12, border: `1.5px solid ${errors.password ? '#ef4444' : '#e2e8f0'}`, fontSize: 14.5, outline: 'none', boxSizing: 'border-box', background: 'white', transition: 'border-color 0.2s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = selectedRole.color }}
                  onBlur={e => { e.currentTarget.style.borderColor = errors.password ? '#ef4444' : '#e2e8f0' }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                  <i className={`fa-solid ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? '#94a3b8' : `linear-gradient(135deg, ${selectedRole.color}, ${selectedRole.color}cc)`,
              color: 'white', border: 'none', borderRadius: 12, padding: '14px 0',
              fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : `0 4px 20px ${selectedRole.color}45`,
              transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" /> Connexion en cours…</>
                : <><i className="fa-solid fa-right-to-bracket" /> Se connecter</>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 24 }}>
            Pas encore de compte ?{' '}
            <Link href="/register" style={{ color: selectedRole.color, fontWeight: 700, textDecoration: 'none' }}>Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
