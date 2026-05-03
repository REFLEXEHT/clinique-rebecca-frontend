'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface FormData { email: string; password: string }

export default function AdminLogin() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { email: 'admin@cliniquerebecca.ht', password: '' },
  })

  useEffect(() => {
    if (isAuthenticated) router.push('/admin/dashboard')
  }, [isAuthenticated])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      login(res.data.access_token, res.data.user)
      toast.success(`Bienvenue, ${res.data.user.nom} !`)
      router.push('/admin/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1e3d] to-[#1a3a60]
      flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[380px] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1a2a4a] p-6 text-center">
          <div className="w-14 h-14 bg-[#1a4fc4]/20 rounded-full flex items-center justify-center
            mx-auto mb-3">
            <i className="fa-solid fa-shield-halved text-2xl text-[#7aadff]" />
          </div>
          <h1 className="text-white font-extrabold text-[17px]">Espace Administration</h1>
          <p className="text-white/50 text-[12.5px] mt-1">Clinique de la Rebecca</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Identifiant</label>
            <input
              {...register('email', { required: true })}
              type="email"
              className="input"
              placeholder="admin@cliniquerebecca.ht"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">Email requis</p>}
          </div>

          <div>
            <label className="label">Mot de passe</label>
            <input
              {...register('password', { required: true })}
              type="password"
              className="input"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">Mot de passe requis</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-blue w-full justify-center py-3 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Connexion...
              </span>
            ) : (
              <>
                <i className="fa-solid fa-sign-in-alt" />
                Se connecter
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <a href="/" className="text-[13px] text-gray-400 hover:text-[#1a4fc4] transition-colors">
              ← Retour au site public
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
