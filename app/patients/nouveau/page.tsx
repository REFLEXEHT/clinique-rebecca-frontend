'use client'
// Page création patient — accessible à tous les rôles connectés
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface PatientForm {
 nom: string; prenom: string; date_naissance: string; sexe: string
 telephone: string; email: string; adresse: string
 groupe_sanguin: string; allergies: string; antecedents: string; notes: string
}

const REDIRECT_MAP: Record<string, string> = {
 admin: '/admin/dashboard', medecin: '/medecin/dashboard',
 caissier: '/caissier', labo: '/labo', pharmacie: '/pharmacie', patient: '/patient/dashboard'
}

export default function NouveauPatientPage() {
 const { user } = useAuth()
 const router = useRouter()
 const [loading, setLoading] = useState(false)
 const [created, setCreated] = useState<any>(null)
 const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientForm>()

 const onSubmit = async (data: PatientForm) => {
 setLoading(true)
 try {
 const res = await api.post('/patients', data)
 setCreated(res.data)
 toast.success(` Patient ${res.data.code} enregistré !`)
 reset()
 } catch (err: any) {
 toast.error(err.response?.data?.detail || 'Erreur lors de la création')
 } finally { setLoading(false) }
 }

 const backUrl = REDIRECT_MAP[user?.role || 'patient']

 if (created) return (
 <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
 <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <i className="fa-solid fa-user-check text-green-600 text-2xl" />
 </div>
 <h2 className="font-extrabold text-xl mb-1">Patient enregistré !</h2>
 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 my-4">
 <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Code patient unique</div>
 <div className="font-black text-2xl text-[#1641C8] font-mono">{created.code}</div>
 <div className="text-sm text-slate-600 mt-1">{created.nom}</div>
 </div>
 <p className="text-slate-500 text-sm mb-5">
 Conservez ce code — il sera utilisé pour les ordonnances, résultats de labo et RDV.
 </p>
 <div className="flex gap-3">
 <button onClick={() => setCreated(null)} className="btn-secondary flex-1 justify-center">
 <i className="fa-solid fa-plus" /> Nouveau patient
 </button>
 <Link href={backUrl} className="btn-primary flex-1 justify-center no-underline">
 <i className="fa-solid fa-arrow-left" /> Retour
 </Link>
 </div>
 </div>
 </div>
 )

 return (
 <div className="min-h-screen bg-slate-50">
 {/* Header */}
 <div className="bg-[#0f172a] h-[70px] flex items-center px-6 gap-4">
 <Link href={backUrl} className="text-white/60 hover:text-white text-sm no-underline">
 <i className="fa-solid fa-arrow-left mr-2" />Retour
 </Link>
 <div className="w-px h-5 bg-white/15" />
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
 <i className="fa-solid fa-user-plus text-sm" />
 </div>
 <h1 className="text-white font-bold">Nouveau Patient</h1>
 </div>
 <div className="ml-auto text-white/50 text-xs">{user?.nom} — {user?.role}</div>
 </div>

 <div className="max-w-3xl mx-auto p-7">
 <div className="card p-6">
 <form onSubmit={handleSubmit(onSubmit)}>
 {/* Identité */}
 <div className="mb-5">
 <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
 <i className="fa-solid fa-id-card text-[#1641C8]" /> Identité
 </h3>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="label">Nom *</label>
 <input {...register('nom', { required: 'Requis' })} className="input" placeholder="Nom de famille" />
 {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
 </div>
 <div>
 <label className="label">Prénom *</label>
 <input {...register('prenom', { required: 'Requis' })} className="input" placeholder="Prénom" />
 {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
 </div>
 <div>
 <label className="label">Date de naissance</label>
 <input {...register('date_naissance')} type="date" className="input" />
 </div>
 <div>
 <label className="label">Sexe</label>
 <select {...register('sexe')} className="input">
 <option value="">Choisir...</option>
 <option value="M">Masculin</option>
 <option value="F">Féminin</option>
 </select>
 </div>
 </div>
 </div>

 {/* Contact */}
 <div className="mb-5">
 <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
 <i className="fa-solid fa-phone text-[#1641C8]" /> Contact
 </h3>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="label">Téléphone / WhatsApp *</label>
 <input {...register('telephone', { required: 'Requis' })} className="input" placeholder="+509 3xxx-xxxx" />
 {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone.message}</p>}
 </div>
 <div>
 <label className="label">Email</label>
 <input {...register('email')} type="email" className="input" placeholder="patient@email.com" />
 </div>
 <div className="col-span-2">
 <label className="label">Adresse</label>
 <input {...register('adresse')} className="input" placeholder="Quartier, ville..." />
 </div>
 </div>
 </div>

 {/* Médical */}
 <div className="mb-6">
 <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
 <i className="fa-solid fa-heart-pulse text-[#1641C8]" /> Informations médicales
 </h3>
 <div className="grid grid-cols-3 gap-4">
 <div>
 <label className="label">Groupe sanguin</label>
 <select {...register('groupe_sanguin')} className="input">
 <option value="">Non connu</option>
 {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
 </select>
 </div>
 <div className="col-span-2">
 <label className="label">Allergies connues</label>
 <input {...register('allergies')} className="input" placeholder="Pénicilline, aspirine..." />
 </div>
 <div className="col-span-3">
 <label className="label">Antécédents médicaux</label>
 <textarea {...register('antecedents')} className="input resize-none" rows={2}
 placeholder="Diabète, hypertension, chirurgies antérieures..." />
 </div>
 <div className="col-span-3">
 <label className="label">Notes</label>
 <textarea {...register('notes')} className="input resize-none" rows={2} placeholder="Observations..." />
 </div>
 </div>
 </div>

 <div className="flex gap-3">
 <button type="submit" disabled={loading} className="btn-primary">
 {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Enregistrement...</> : <><i className="fa-solid fa-user-plus" /> Enregistrer le patient</>}
 </button>
 <Link href={backUrl} className="btn-ghost no-underline">Annuler</Link>
 </div>
 </form>
 </div>
 </div>
 </div>
 )
}
