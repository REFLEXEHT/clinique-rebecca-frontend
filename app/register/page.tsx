'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const ROLES = [
  { value: 'patient',   label: 'Patient',    icon: 'fa-user',          color: '#1641C8' },
  { value: 'medecin',   label: 'Médecin',    icon: 'fa-user-doctor',   color: '#16a34a' },
  { value: 'caissier',  label: 'Caissier',   icon: 'fa-cash-register', color: '#d97706' },
  { value: 'labo',      label: 'Laboratoire',icon: 'fa-flask-vial',    color: '#0891b2' },
  { value: 'pharmacie', label: 'Pharmacie',  icon: 'fa-pills',         color: '#be185d' },
]

const SPECIALITES_MEDECIN = [
  'Chirurgie générale','Neurochirurgie','Neurologie','Orthopédie',
  'Pédiatrie','Dermatologie','Urologie','ORL','Gynécologie',
  'Chirurgie pédiatrique','Médecine interne','Ophtalmologie',
]

const TYPES_MEDECIN = [
  {
    value: 'investisseur',
    label: 'Médecin Investisseur',
    desc: '30% consultations + 20% gestes reversés à la clinique',
    icon: 'fa-chart-line',
    color: '#1641C8',
  },
  {
    value: 'affilie',
    label: 'Médecin Affilié',
    desc: '40% consultations + 30% gestes reversés à la clinique',
    icon: 'fa-handshake',
    color: '#16a34a',
  },
  {
    value: 'exploitant',
    label: 'Médecin Exploitant',
    desc: '100% revenus au médecin — loyer fixe mensuel payé à la clinique',
    icon: 'fa-building',
    color: '#d97706',
  },
  {
    value: 'investisseur_exploitant',
    label: 'Investisseur-Exploitant',
    desc: '100% revenus + loyer fixe mensuel (investisseur dans la clinique)',
    icon: 'fa-star',
    color: '#7c3aed',
  },
]

interface FormData {
  nom: string
  email: string
  telephone: string
  password: string
  confirmPassword: string
  specialite?: string
  type_medecin?: string
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('patient')
  const [selectedTypeMedecin, setSelectedTypeMedecin] = useState('')
  const [success, setSuccess] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()
  const pwd = watch('password')
  const isMedecin = selectedRole === 'medecin'

  const onSubmit = async (data: FormData) => {
    if (isMedecin && !data.specialite) {
      toast.error('Veuillez sélectionner une spécialité.')
      return
    }
    if (isMedecin && !selectedTypeMedecin) {
      toast.error('Veuillez sélectionner le type de médecin.')
      return
    }
    setLoading(true)
    try {
      const payload: any = {
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        password: data.password,
        role: selectedRole,
      }
      if (isMedecin) {
        payload.specialite = data.specialite
        payload.type_medecin = selectedTypeMedecin
      }

      const res = await authApi.register(payload)

      if (res.data?.access_token && res.data?.user) {
        login(res.data.access_token, res.data.user)
        toast.success(`Bienvenue, ${res.data.user.nom} !`)
        router.push('/patient/dashboard')
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail
      if (typeof msg === 'string') {
        toast.error(msg)
      } else if (Array.isArray(msg)) {
        toast.error(msg.map((e: any) => e.msg).join(', '))
      } else if (err.code === 'ERR_NETWORK') {
        toast.error('Impossible de contacter le serveur.')
      } else {
        toast.error("Erreur lors de l'inscription")
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f1e3d 0%, #1641C8 100%)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-clock text-green-600 text-2xl" />
        </div>
        <h2 className="font-extrabold text-xl mb-2 text-slate-900">Compte soumis !</h2>
        <p className="text-slate-500 text-sm mb-1">
          Votre compte <strong className="capitalize">{selectedRole}</strong> est en attente de validation.
        </p>
        <p className="text-slate-400 text-xs mb-6">
          L'administrateur activera votre accès et configurera votre profil comptable.
        </p>
        <Link href="/login" className="btn-primary w-full justify-center">
          <i className="fa-solid fa-sign-in-alt" /> Retour à la connexion
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8"
      style={{ background: 'linear-gradient(135deg, #0f1e3d 0%, #1a3a8f 50%, #1641C8 100%)' }}>
      <div className="w-full max-w-[520px]">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-plus text-[#1641C8] text-lg" />
          </div>
          <div>
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Clinique de la</div>
            <div className="text-white font-extrabold text-lg">REBECCA</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-100">
            <h1 className="font-extrabold text-slate-900 text-[19px]">Créer un compte</h1>
            <p className="text-slate-400 text-sm mt-0.5">Rejoignez la Clinique de la Rebecca</p>
          </div>

          <div className="p-7">
            {/* Sélection rôle */}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Je suis :</p>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {ROLES.map(r => (
                <button key={r.value} type="button"
                  onClick={() => { setSelectedRole(r.value); setSelectedTypeMedecin('') }}
                  className={`p-2.5 rounded-xl border-[1.5px] flex flex-col items-center gap-1
                    text-[10.5px] font-semibold cursor-pointer transition-all duration-150
                    ${selectedRole === r.value
                      ? 'border-[#1641C8] bg-blue-50 text-[#1641C8]'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                  <i className={`fa-solid ${r.icon} text-base`}
                    style={selectedRole === r.value ? { color: r.color } : {}} />
                  {r.label}
                </button>
              ))}
            </div>

            {selectedRole !== 'patient' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex items-start gap-2.5">
                <i className="fa-solid fa-triangle-exclamation text-amber-500 text-sm mt-0.5 flex-shrink-0" />
                <p className="text-amber-700 text-[12px] font-medium">
                  Ce compte nécessite une validation par l'administrateur avant activation.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
                })} type="email" className="input" placeholder="votre@email.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Téléphone WhatsApp</label>
                <input {...register('telephone')} className="input" placeholder="+509 3xxx-xxxx" />
              </div>

              {/* Champs spécifiques médecin */}
              {isMedecin && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Profil médical
                    </p>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="label">Spécialité *</label>
                      <select {...register('specialite')} className="input">
                        <option value="">Choisir une spécialité...</option>
                        {SPECIALITES_MEDECIN.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="label">Type de médecin *</label>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Détermine la répartition des revenus avec la clinique.
                      </p>
                      <div className="space-y-2">
                        {TYPES_MEDECIN.map(t => (
                          <button key={t.value} type="button"
                            onClick={() => setSelectedTypeMedecin(t.value)}
                            className={`w-full text-left p-3 rounded-xl border-[1.5px] transition-all cursor-pointer
                              ${selectedTypeMedecin === t.value
                                ? 'border-[#1641C8] bg-blue-50'
                                : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: `${t.color}15`, color: t.color }}>
                                <i className={`fa-solid ${t.icon} text-sm`} />
                              </div>
                              <div>
                                <div className={`font-bold text-[13px] ${selectedTypeMedecin === t.value ? 'text-[#1641C8]' : 'text-slate-800'}`}>
                                  {t.label}
                                </div>
                                <div className="text-[11.5px] text-slate-400 mt-0.5">{t.desc}</div>
                              </div>
                              <div className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 transition-all
                                ${selectedTypeMedecin === t.value
                                  ? 'border-[#1641C8] bg-[#1641C8]'
                                  : 'border-slate-300'}`}>
                                {selectedTypeMedecin === t.value && (
                                  <div className="w-full h-full rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="label">Mot de passe *</label>
                <input {...register('password', {
                  required: 'Requis',
                  minLength: { value: 6, message: 'Minimum 6 caractères' },
                })} type="password" className="input" placeholder="••••••••" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">Confirmer le mot de passe *</label>
                <input {...register('confirmPassword', {
                  required: 'Requis',
                  validate: v => v === pwd || 'Les mots de passe ne correspondent pas',
                })} type="password" className="input" placeholder="••••••••" />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Création en cours...
                  </span>
                ) : (
                  <><i className="fa-solid fa-user-plus" /> Créer mon compte</>
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Déjà un compte ?{' '}
                <Link href="/login" className="text-[#1641C8] font-bold hover:underline">Se connecter</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors no-underline">
            ← Retour au site public
          </Link>
        </div>
      </div>
    </div>
  )
}
