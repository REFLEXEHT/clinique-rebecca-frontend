'use client'
// app/register/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { LOGO_SRC } from '@/lib/images'

interface FormData {
  prenom: string; nom: string; email: string;
  telephone: string; password: string; confirm: string
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()
  const pwd = watch('password')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      // API: POST /api/auth/register (à implémenter dans le backend)
      toast.success('Compte créé ! Vérifiez votre email pour valider.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1e3d] to-[#1641C8]
      flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden">
        <div className="bg-[#0f172a] px-6 py-5 text-center">
          <img src={LOGO_SRC} alt="Logo" className="h-10 w-auto mx-auto mb-2 object-contain"
            style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <h1 className="text-white font-extrabold text-[17px]">Créer un compte patient</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prénom *</label>
              <input {...register('prenom', { required: 'Requis' })} className="input" placeholder="Jean" />
              {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
            </div>
            <div>
              <label className="label">Nom *</label>
              <input {...register('nom', { required: 'Requis' })} className="input" placeholder="Pierre" />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Email *</label>
            <input {...register('email', { required: 'Requis', pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' } })}
              type="email" className="input" placeholder="votre@email.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Téléphone / WhatsApp *</label>
            <input {...register('telephone', { required: 'Requis' })}
              className="input" placeholder="+509 3456-7890" />
          </div>

          <div>
            <label className="label">Mot de passe *</label>
            <input {...register('password', { required: 'Requis', minLength: { value: 8, message: '8 caractères minimum' } })}
              type="password" className="input" placeholder="••••••••" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Confirmer le mot de passe *</label>
            <input {...register('confirm', { required: 'Requis', validate: v => v === pwd || 'Les mots de passe ne correspondent pas' })}
              type="password" className="input" placeholder="••••••••" />
            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Création...' : <><i className="fa-solid fa-user-plus" /> Créer mon compte</>}
          </button>

          <p className="text-center text-sm text-slate-500">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-[#1641C8] font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <Link href="/" className="text-white/30 hover:text-white/60 text-xs no-underline transition-colors">
          ← Retour au site public
        </Link>
      </div>
    </div>
  )
}
