'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Role } from '@/types'

const ROLES = [
  { value: 'patient',   label: 'Patient',      icon: 'fa-user',           color: '#1641C8' },
  { value: 'medecin',   label: 'Médecin',       icon: 'fa-user-doctor',    color: '#16a34a' },
  { value: 'admin',     label: 'Admin',          icon: 'fa-shield-halved',  color: '#7c3aed' },
  { value: 'caissier',  label: 'Caissier',       icon: 'fa-cash-register',  color: '#d97706' },
  { value: 'labo',      label: 'Laboratoire',    icon: 'fa-flask-vial',     color: '#0891b2' },
  { value: 'pharmacie', label: 'Pharmacie',      icon: 'fa-pills',          color: '#be185d' },
]

const ROLE_REDIRECTS: Record<Role, string> = {
  admin: '/admin/dashboard',
  medecin: '/medecin/dashboard',
  patient: '/patient/dashboard',
  caissier: '/caissier',
  labo: '/labo',
  pharmacie: '/pharmacie',
}

interface FormData { email: string; password: string }

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>('patient')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      const { access_token, user } = res.data
      if (user.role !== selectedRole) {
        toast.error(`Ce compte est un compte "${user.role}". Sélectionnez le bon rôle.`, { duration: 5000 })
        setLoading(false)
        return
      }
      login(access_token, user)
      toast.success(`Bienvenue, ${user.nom} !`)
      router.push(ROLE_REDIRECTS[user.role as Role] || '/')
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        toast.error('Impossible de contacter le serveur.', { duration: 6000 })
      } else if (typeof detail === 'string') {
        if (detail.includes('inactif') || detail.includes('activé')) {
          toast.error("Compte en attente de validation par l'administrateur.", { duration: 6000 })
        } else {
          toast.error('Email ou mot de passe incorrect.')
        }
      } else {
        toast.error('Erreur de connexion. Vérifiez vos identifiants.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f1e3d 0%, #1a3a8f 50%, #1641C8 100%)' }}>
      {/* Panneau gauche — visuel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-white/5" />
        <div className="absolute top-[40%] right-[10%] w-[160px] h-[160px] rounded-full bg-white/4" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-plus text-[#1641C8] text-xl" />
            </div>
            <div>
              <div className="text-white/60 text-[11px] font-bold uppercase tracking-widest">Clinique de la</div>
              <div className="text-white font-extrabold text-xl leading-tight">REBECCA</div>
            </div>
          </Link>
        </div>

        {/* Message central */}
        <div className="relative z-10">
          <h2 className="text-white font-serif text-3xl font-bold leading-tight mb-4">
            Des soins de qualité,<br />
            <span className="italic text-blue-200">à votre portée</span>
          </h2>
          <p className="text-white/55 text-[15px] leading-relaxed mb-8">
            Accédez à votre espace personnel pour gérer vos rendez-vous, consulter vos résultats et suivre votre parcours de santé.
          </p>
          <div className="space-y-3">
            {[
              { icon: 'fa-calendar-check', text: 'Rendez-vous en ligne 7j/7' },
              { icon: 'fa-video', text: 'Consultation vidéo depuis chez vous' },
              { icon: 'fa-file-medical', text: 'Résultats disponibles sur votre espace' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${item.icon} text-blue-200 text-sm`} />
                </div>
                <span className="text-white/70 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-blink" />
            <span className="text-white/40 text-xs">Ouvert 7j/7 · 07h00 – 17h00</span>
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px]">
          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-plus text-[#1641C8] text-lg" />
            </div>
            <div>
              <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Clinique de la</div>
              <div className="text-white font-extrabold text-lg">REBECCA</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-7 py-6 border-b border-slate-100">
              <h1 className="font-extrabold text-slate-900 text-[20px]">Connexion</h1>
              <p className="text-slate-400 text-sm mt-1">Sélectionnez votre rôle et connectez-vous</p>
            </div>

            <div className="p-7">
              {/* Sélection rôle */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setSelectedRole(r.value as Role)}
                    className={`p-2.5 rounded-xl border-[1.5px] flex flex-col items-center gap-1.5
                      text-[11.5px] font-semibold cursor-pointer transition-all duration-150
                      ${selectedRole === r.value
                        ? 'border-[#1641C8] bg-blue-50 text-[#1641C8]'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <i className={`fa-solid ${r.icon} text-lg`}
                      style={selectedRole === r.value ? { color: r.color } : {}} />
                    {r.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Adresse email</label>
                  <input {...register('email', {
                    required: 'Email requis',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format invalide' },
                  })} type="email" className="input" placeholder="votre@email.com" autoComplete="email" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label mb-0">Mot de passe</label>
                    <a href="#" className="text-[11px] text-[#1641C8] font-semibold hover:underline">Mot de passe oublié ?</a>
                  </div>
                  <div className="relative">
                    <input {...register('password', { required: 'Mot de passe requis' })}
                      type={showPwd ? 'text' : 'password'} className="input pr-10"
                      placeholder="••••••••" autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0">
                      <i className={`fa-solid ${showPwd ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Connexion...
                    </span>
                  ) : (
                    <><i className="fa-solid fa-sign-in-alt" /> Se connecter</>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-5 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Pas encore de compte ?{' '}
                  <Link href="/register" className="text-[#1641C8] font-bold hover:underline">Créer un compte</Link>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors no-underline">
              ← Retour au site public
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
