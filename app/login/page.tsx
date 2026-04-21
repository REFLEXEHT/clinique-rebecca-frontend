'use client'
// app/login/page.tsx — Connexion avec sélection de rôle
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Role } from '@/types'
import { LOGO_SRC } from '@/lib/images'

const ROLES = [
  { value: 'patient', label: 'Patient', icon: 'fa-user', color: '#1641C8' },
  { value: 'medecin', label: 'Médecin', icon: 'fa-user-doctor', color: '#16a34a' },
  { value: 'admin', label: 'Admin', icon: 'fa-shield-halved', color: '#7c3aed' },
  { value: 'caissier', label: 'Caissier', icon: 'fa-cash-register', color: '#d97706' },
  { value: 'labo', label: 'Laboratoire', icon: 'fa-flask-vial', color: '#0891b2' },
  { value: 'pharmacie', label: 'Pharmacie', icon: 'fa-pills', color: '#be185d' },
]

const ROLE_REDIRECTS: Record<Role, string> = {
  admin: '/admin/dashboard',
  medecin: '/medecin/dashboard',
  patient: '/patient/dashboard',
  caissier: '/caissier',
  labo: '/labo',
  pharmacie: '/pharmacie',
}

interface FormData {
  email: string
  password: string
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>('patient')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      const { access_token, user } = res.data
      login(access_token, user)
      toast.success(`Bienvenue, ${user.nom} !`)
      router.push(ROLE_REDIRECTS[user.role as Role] || '/')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1e3d] to-[#1641C8]
      flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f172a] px-6 py-6 text-center">
          <img src={LOGO_SRC} alt="Logo" className="h-12 w-auto mx-auto mb-3 object-contain"
            style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <h1 className="text-white font-extrabold text-[17px]">Espace de connexion</h1>
          <p className="text-white/50 text-[12.5px] mt-1">Clinique de la Rebecca</p>
        </div>

        <div className="p-6">
          {/* Role selector */}
          <p className="text-sm text-slate-500 font-semibold mb-3">Sélectionnez votre rôle :</p>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRole(r.value as Role)}
                className={`p-3 rounded-xl border-[1.5px] flex flex-col items-center gap-1.5
                  text-[12.5px] font-semibold cursor-pointer transition-all duration-150
                  ${selectedRole === r.value
                    ? 'border-[#1641C8] bg-blue-50 text-[#1641C8]'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}>
                <i className={`fa-solid ${r.icon} text-xl ${selectedRole === r.value ? '' : 'text-slate-400'}`}
                  style={selectedRole === r.value ? { color: r.color } : {}} />
                {r.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Adresse email</label>
              <input
                {...register('email', { required: 'Email requis' })}
                type="email"
                className="input"
                placeholder="votre@email.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <input
                {...register('password', { required: 'Mot de passe requis' })}
                type="password"
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <a href="#" className="text-xs text-[#1641C8] font-semibold hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Connexion...
                </span>
              ) : (
                <><i className="fa-solid fa-sign-in-alt" /> Se connecter</>
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-slate-500">
            Pas de compte ?{' '}
            <Link href="/register" className="text-[#1641C8] font-bold hover:underline">
              S'inscrire
            </Link>
          </p>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-400 text-center">
            Admin: admin@cliniquerebecca.ht / rebecca2026
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white/30 text-xs">
        <Link href="/" className="hover:text-white/60 transition-colors no-underline">
          ← Retour au site public
        </Link>
      </div>
    </div>
  )
}
