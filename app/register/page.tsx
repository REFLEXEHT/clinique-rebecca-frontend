'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const ROLES = [
  { value: 'patient', label: 'Patient', icon: 'fa-user', color: '#1641C8' },
  { value: 'medecin', label: 'Médecin', icon: 'fa-user-doctor', color: '#16a34a' },
  { value: 'caissier', label: 'Caissier', icon: 'fa-cash-register', color: '#d97706' },
  { value: 'labo', label: 'Laboratoire', icon: 'fa-flask-vial', color: '#0891b2' },
  { value: 'pharmacie', label: 'Pharmacie', icon: 'fa-pills', color: '#be185d' },
]

interface FormData {
  nom: string
  email: string
  telephone: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('patient')
  const [success, setSuccess] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()
  const pwd = watch('password')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.register({
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        password: data.password,
        role: selectedRole,
      })

      // Si patient → connexion directe
      if (res.data?.access_token && res.data?.user) {
        login(res.data.access_token, res.data.user)
        toast.success(`Bienvenue, ${res.data.user.nom} !`)
        router.push('/patient/dashboard')
      } else {
        // Autres rôles → en attente de validation
        setSuccess(true)
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail
      if (typeof msg === 'string') {
        toast.error(msg)
      } else if (Array.isArray(msg)) {
        toast.error(msg.map((e: any) => e.msg).join(', '))
      } else {
        toast.error("Erreur lors de l'inscription")
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1e3d] to-[#1641C8] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-clock text-green-600 text-2xl" />
        </div>
        <h2 className="font-extrabold text-xl mb-2 text-slate-900">Compte créé !</h2>
        <p className="text-slate-500 text-sm mb-2">
          Votre compte <strong>{selectedRole}</strong> est en attente de validation par l'administrateur.
        </p>
        <p className="text-slate-400 text-xs mb-6">
          Vous recevrez une notification dès que votre accès sera activé.
        </p>
        <Link href="/login" className="btn-primary w-full justify-center">
          <i className="fa-solid fa-sign-in-alt" /> Retour à la connexion
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1e3d] to-[#1641C8] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">
        <div className="bg-[#0f172a] px-6 py-5 text-center">
          <h1 className="text-white font-extrabold text-[17px]">Créer un compte</h1>
          <p className="text-white/50 text-[12.5px] mt-1">Clinique de la Rebecca</p>
        </div>

        <div className="p-6">
          <p className="text-sm font-bold text-slate-600 mb-3">Je suis :</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {ROLES.map(r => (
              <button key={r.value} type="button" onClick={() => setSelectedRole(r.value)}
                className={`p-3 rounded-xl border-[1.5px] flex flex-col items-center gap-1.5
                  text-[11.5px] font-semibold cursor-pointer transition-all
                  ${selectedRole === r.value
                    ? 'border-[#1641C8] bg-blue-50 text-[#1641C8]'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                <i className={`fa-solid ${r.icon} text-lg`}
                  style={selectedRole === r.value ? { color: r.color } : {}} />
                {r.label}
              </button>
            ))}
          </div>

          {selectedRole !== 'patient' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-500 text-sm mt-0.5" />
              <p className="text-amber-700 text-[12px] font-medium">
                Ce compte nécessite une validation par l'administrateur avant activation.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="label">Nom complet *</label>
              <input {...register('nom', { required: 'Nom requis' })}
                className="input" placeholder="Prénom Nom" />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
            </div>
            <div>
              <label className="label">Adresse email *</label>
              <input {...register('email', {
                required: 'Email requis',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' }
              })} type="email" className="input" placeholder="votre@email.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Téléphone WhatsApp</label>
              <input {...register('telephone')} className="input" placeholder="+509 3xxx-xxxx" />
            </div>
            <div>
              <label className="label">Mot de passe *</label>
              <input {...register('password', {
                required: 'Requis',
                minLength: { value: 6, message: 'Minimum 6 caractères' }
              })} type="password" className="input" placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirmer le mot de passe *</label>
              <input {...register('confirmPassword', {
                required: 'Requis',
                validate: v => v === pwd || 'Les mots de passe ne correspondent pas'
              })} type="password" className="input" placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-1">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Création en cours...
                </span>
              ) : (
                <><i className="fa-solid fa-user-plus" /> Créer mon compte</>
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-slate-500">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[#1641C8] font-bold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/30 text-xs">
        <Link href="/" className="hover:text-white/60 transition-colors no-underline">
          ← Retour au site
        </Link>
      </div>
    </div>
  )
}
