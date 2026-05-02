'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'
import { Eye, EyeOff } from 'lucide-react'

type FormData = {
  nom: string
  email: string
  password: string
  confirm: string
  telephone: string
}

// Error messages in French with context
function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0 }}>⚠️</span>
      <span>{msg}</span>
    </div>
  )
}

function SuccessMsg({ msg }: { msg: string }) {
  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#16a34a', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0 }}>✓</span>
      <span>{msg}</span>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <div style={{ color: '#dc2626', fontSize: 11, marginTop: 4, display: 'flex', gap: 4 }}><span>↑</span>{msg}</div>
}

export default function RegisterPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [showPwd,   setShowPwd]   = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()
  const pwd = watch('password', '')

  // Real-time email hint
  const email = watch('email', '')
  const isClinicEmail = email.toLowerCase().includes('@cliniquerebecca.ht')

  const parseBackendError = (e: any): string => {
    const detail = e?.response?.data?.detail || ''
    const status = e?.response?.status

    if (status === 403 && detail.includes('libre-service')) {
      return '🏥 Les comptes du personnel (médecin, infirmier, caissier, etc.) sont créés par l\'administrateur de la clinique. Contactez : admin@cliniquerebecca.ht ou appelez le (509) 4858-5757.'
    }
    if (status === 400 && detail.includes('Email déjà utilisé')) {
      return '📧 Un compte avec cette adresse email existe déjà. Essayez de vous connecter, ou utilisez une autre adresse email.'
    }
    if (status === 400 && detail.includes('@cliniquerebecca.ht')) {
      return '📧 Les adresses @cliniquerebecca.ht sont réservées au personnel. Utilisez votre email personnel (Gmail, Yahoo, Outlook, etc.).'
    }
    if (status === 422) {
      const errors = e?.response?.data?.detail
      if (Array.isArray(errors)) {
        return errors.map((err: any) => {
          const field = err.loc?.[err.loc.length - 1] || 'champ'
          const fieldNames: Record<string, string> = {
            email: 'Email',
            password: 'Mot de passe',
            nom: 'Nom complet',
            telephone: 'Téléphone',
          }
          return `${fieldNames[field] || field} : ${err.msg}`
        }).join('\n')
      }
    }
    if (!navigator.onLine) {
      return '🌐 Pas de connexion internet. Vérifiez votre connexion et réessayez.'
    }
    if (status === 500) {
      return '🔧 Erreur serveur. Notre équipe technique a été notifiée. Réessayez dans quelques minutes.'
    }
    if (status === 503 || !status) {
      return '⏳ Le serveur est temporairement indisponible. Réessayez dans quelques instants.'
    }
    return detail || 'Une erreur est survenue. Vérifiez vos informations et réessayez.'
  }

  const onSubmit = async (data: FormData) => {
    setError(''); setSuccess('')

    // Frontend validation
    if (data.nom.trim().length < 3) {
      setError('Le nom complet doit contenir au moins 3 caractères.')
      return
    }
    if (!data.email.includes('@') || !data.email.includes('.')) {
      setError('Adresse email invalide. Exemple : prenom.nom@gmail.com')
      return
    }
    if (isClinicEmail) {
      setError('Les adresses @cliniquerebecca.ht sont réservées au personnel de la clinique. Utilisez votre email personnel.')
      return
    }
    if (data.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (data.password !== data.confirm) {
      setError('Les mots de passe ne correspondent pas. Vérifiez la saisie.')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.register({
        email:     data.email.trim().toLowerCase(),
        password:  data.password,
        nom:       data.nom.trim(),
        telephone: data.telephone?.trim() || '',
        role:      'patient',
      })

      if (res.data?.access_token) {
        login(res.data.access_token, res.data.user)
        setSuccess('✓ Compte créé avec succès ! Redirection vers votre espace...')
        setTimeout(() => router.push('/patient/dashboard'), 1200)
      } else {
        setSuccess('Compte créé. Vous pouvez maintenant vous connecter.')
        setTimeout(() => router.push('/login'), 1500)
      }
    } catch (e: any) {
      setError(parseBackendError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── PANNEAU GAUCHE ───────────────────────────────────────── */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg,#0f1e3d,#1641C8,#0d9488)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏥</div>
          <span style={{ color: 'white', fontWeight: 900, fontSize: 18 }}>Clinique de la Rebecca</span>
        </Link>

        <h1 style={{ color: 'white', fontWeight: 900, fontSize: '2rem', margin: '0 0 16px' }}>
          Créez votre<br /><em style={{ color: '#5eead4' }}>espace santé.</em>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7, marginBottom: 32, maxWidth: 360 }}>
          Accédez à vos rendez-vous, résultats d'analyses et consultations vidéo depuis votre compte personnel.
        </p>

        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', borderLeft: '3px solid #5eead4', marginBottom: 16 }}>
          <div style={{ color: '#5eead4', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🔒 Cette page est pour les patients</div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            Vous êtes patient de la clinique ? Créez votre compte ici avec votre email personnel.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 }}>Vous travaillez à la clinique ?</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.6 }}>
            Votre compte est créé par l'administration.<br />
            Contactez : <strong style={{ color: '#5eead4' }}>admin@cliniquerebecca.ht</strong><br />
            ou : <strong style={{ color: '#5eead4' }}>(509) 4858-5757</strong>
          </div>
        </div>

        <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none', marginTop: 32, display: 'flex', alignItems: 'center', gap: 6 }}>← Retour au site</Link>
      </div>

      {/* ── FORMULAIRE ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', background: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontWeight: 900, fontSize: '1.6rem', color: '#0f172a', margin: '0 0 8px' }}>Créer un compte patient</h2>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
              Déjà inscrit ? <Link href="/login" style={{ color: '#1641C8', fontWeight: 700 }}>Se connecter</Link>
            </p>
          </div>

          {/* Errors & Success */}
          {error   && <div style={{ marginBottom: 16 }}><ErrorMsg msg={error} /></div>}
          {success && <div style={{ marginBottom: 16 }}><SuccessMsg msg={success} /></div>}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Nom */}
            <div>
              <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>
                Nom complet <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input {...register('nom', {
                required: 'Nom complet obligatoire',
                minLength: { value: 3, message: 'Au moins 3 caractères' },
              })}
                placeholder="Prénom NOM"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: errors.nom ? '1.5px solid #dc2626' : '1.5px solid #d1d5db', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
              <FieldError msg={errors.nom?.message} />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>
                Email <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input {...register('email', {
                required: 'Email obligatoire',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
                validate: v => !v.toLowerCase().includes('@cliniquerebecca.ht') || 'Utilisez votre email personnel'
              })}
                type="email" placeholder="votre@email.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: errors.email || isClinicEmail ? '1.5px solid #dc2626' : '1.5px solid #d1d5db', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
              <FieldError msg={errors.email?.message} />
              {isClinicEmail && !errors.email && (
                <div style={{ color: '#d97706', fontSize: 11, marginTop: 4 }}>
                  ⚠️ Les emails @cliniquerebecca.ht sont réservés au personnel — utilisez votre email personnel
                </div>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>
                Téléphone <span style={{ color: '#94a3b8', fontSize: 11 }}>(optionnel)</span>
              </label>
              <input {...register('telephone')}
                type="tel" placeholder="+509 XXXX-XXXX"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>
                Mot de passe <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input {...register('password', {
                  required: 'Mot de passe obligatoire',
                  minLength: { value: 6, message: 'Au moins 6 caractères' },
                })}
                  type={showPwd ? 'text' : 'password'} placeholder="Minimum 6 caractères"
                  style={{ width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10, border: errors.password ? '1.5px solid #dc2626' : '1.5px solid #d1d5db', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <FieldError msg={errors.password?.message} />
              {/* Password strength indicator */}
              {pwd.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background:
                        pwd.length >= 10 && i <= 4 ? '#16a34a' :
                        pwd.length >= 8  && i <= 3 ? '#d97706' :
                        pwd.length >= 6  && i <= 2 ? '#f59e0b' :
                        pwd.length >= 4  && i <= 1 ? '#dc2626' : '#e2e8f0'
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>
                    {pwd.length < 6 ? 'Trop court' : pwd.length < 8 ? 'Faible' : pwd.length < 10 ? 'Moyen' : 'Fort ✓'}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>
                Confirmer le mot de passe <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input {...register('confirm', {
                  required: 'Confirmation obligatoire',
                  validate: v => v === pwd || 'Les mots de passe ne correspondent pas',
                })}
                  type={showConf ? 'text' : 'password'} placeholder="Répétez le mot de passe"
                  style={{ width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10, border: errors.confirm ? '1.5px solid #dc2626' : '1.5px solid #d1d5db', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
                <button type="button" onClick={() => setShowConf(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                  {showConf ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <FieldError msg={errors.confirm?.message} />
            </div>

            <button type="submit" disabled={loading || !!isClinicEmail}
              style={{
                background: loading || isClinicEmail ? '#94a3b8' : 'linear-gradient(135deg,#1641C8,#0d9488)',
                color: 'white', border: 'none', borderRadius: 12, padding: '13px 0',
                fontWeight: 800, fontSize: 15, cursor: loading || isClinicEmail ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', width: '100%'
              }}>
              {loading ? '⏳ Création en cours...' : 'Créer mon compte'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              En créant un compte, vous acceptez la politique de confidentialité de la Clinique de la Rebecca.
              Vos données médicales sont protégées et accessibles uniquement à vous et à vos médecins.
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
