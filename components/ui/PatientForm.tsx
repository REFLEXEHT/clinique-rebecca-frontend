'use client'
// components/ui/PatientForm.tsx — Formulaire patient réutilisable avec confirmation
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { genererCodePatient, calculerAge } from '@/lib/utils'

export interface PatientFormData {
 code_unique: string
 nom: string
 telephone: string
 date_naissance?: string
 age?: number
 sexe?: 'M' | 'F' | 'Autre'
 contact_urgence_nom?: string
 contact_urgence_tel?: string
 email?: string
}

interface PatientFormProps {
 avecInfoMedicale?: boolean // true = champs médicaux obligatoires (hors pharmacie)
 onConfirm: (data: PatientFormData) => void
 onCancel?: () => void
 loading?: boolean
 titre?: string
}

export default function PatientForm({ avecInfoMedicale = true, onConfirm, onCancel, loading, titre = 'Enregistrement patient' }: PatientFormProps) {
 const [etape, setEtape] = useState<'saisie' | 'confirmation'>('saisie')
 const [donnees, setDonnees] = useState<PatientFormData | null>(null)
 const [codeGenere] = useState(genererCodePatient())

 const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PatientFormData>({
 defaultValues: { code_unique: codeGenere, sexe: 'M' }
 })

 const dateNaissance = watch('date_naissance')

 // Calcul automatique de l'âge
 useEffect(() => {
 if (dateNaissance) {
 const age = calculerAge(dateNaissance)
 if (age >= 0 && age <= 120) setValue('age', age)
 }
 }, [dateNaissance, setValue])

 const onSubmit = (data: PatientFormData) => {
 setDonnees(data)
 setEtape('confirmation')
 }

 const onValider = () => {
 if (donnees) onConfirm(donnees)
 }

 if (etape === 'confirmation' && donnees) {
 return (
 <div className="card p-6 border-2 border-[#1641C8]/20 bg-blue-50/30">
 <div className="flex items-center gap-3 mb-5">
 <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 text-xl"></div>
 <div>
 <h3 className="font-extrabold text-[16px]">Confirmer les informations</h3>
 <p className="text-slate-400 text-xs">Une fois sauvegardé, seul l'administrateur pourra modifier</p>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 space-y-2">
 <div className="text-center mb-3">
 <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Code patient généré</div>
 <div className="text-2xl font-extrabold text-[#1641C8] tracking-wider">{donnees.code_unique}</div>
 </div>
 <div className="grid grid-cols-2 gap-2 text-sm">
 {[
 { l: 'Nom', v: donnees.nom },
 { l: 'Téléphone', v: donnees.telephone },
 ...(donnees.date_naissance ? [{ l: 'Date naissance', v: new Date(donnees.date_naissance).toLocaleDateString('fr-FR') }] : []),
 ...(donnees.age !== undefined ? [{ l: 'Âge calculé', v: `${donnees.age} ans` }] : []),
 ...(donnees.sexe ? [{ l: 'Sexe', v: donnees.sexe === 'M' ? 'Masculin' : donnees.sexe === 'F' ? 'Féminin' : 'Autre' }] : []),
 ...(donnees.email ? [{ l: 'Email', v: donnees.email }] : []),
 ...(donnees.contact_urgence_nom ? [{ l: 'Contact urgence', v: donnees.contact_urgence_nom }] : []),
 ...(donnees.contact_urgence_tel ? [{ l: 'Tél. contact', v: donnees.contact_urgence_tel }] : []),
 ].map(({ l, v }) => (
 <div key={l} className="flex gap-2">
 <span className="text-slate-400 font-medium min-w-[110px]">{l} :</span>
 <span className="font-bold text-slate-800">{v}</span>
 </div>
 ))}
 </div>
 </div>

 <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-700 font-medium flex items-center gap-2">
 <i className="fa-solid fa-lock text-amber-500" />
 Ces informations seront verrouillées après sauvegarde. Vérifiez soigneusement avant de confirmer.
 </div>

 <div className="flex gap-3">
 <button type="button" onClick={() => setEtape('saisie')}
 className="btn-ghost flex-1 justify-center">
 <i className="fa-solid fa-pen" /> Modifier
 </button>
 <button type="button" onClick={onValider} disabled={loading}
 className="btn-primary flex-1 justify-center bg-green-600 hover:bg-green-700">
 {loading
 ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block"/>Sauvegarde...</>
 : <><i className="fa-solid fa-check-double" /> Confirmer et sauvegarder</>
 }
 </button>
 </div>
 </div>
 )
 }

 return (
 <div className="card p-6">
 <h3 className="font-extrabold text-[16px] mb-5 flex items-center gap-2">
 <i className="fa-solid fa-user-plus text-[#1641C8]" /> {titre}
 </h3>

 {/* Code unique */}
 <div className="bg-[#1641C8] text-white rounded-xl p-3 text-center mb-5">
 <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Code patient unique (généré automatiquement)</div>
 <div className="text-2xl font-extrabold tracking-widest">{codeGenere}</div>
 </div>

 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 {/* Champs obligatoires toujours */}
 <div className="bg-red-50 rounded-xl border border-red-100 p-4">
 <div className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1">
 <i className="fa-solid fa-asterisk text-[8px]" /> Champs obligatoires
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="col-span-2">
 <label className="label">Nom complet *</label>
 <input {...register('nom', { required: 'Le nom est obligatoire' })}
 className="input" placeholder="Prénom NOM" autoComplete="off"/>
 {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
 </div>
 <div className="col-span-2">
 <label className="label">Numéro de téléphone (WhatsApp) *</label>
 <input {...register('telephone', { required: 'Le téléphone est obligatoire' })}
 className="input" placeholder="+509 3xxx-xxxx"/>
 {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone.message}</p>}
 </div>
 </div>
 </div>

 {/* Champs médicaux obligatoires (hors pharmacie) */}
 {avecInfoMedicale && (
 <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
 <div className="text-[10px] font-extrabold text-[#1641C8] uppercase tracking-wider mb-3">
 Informations médicales obligatoires
 </div>
 <div className="grid grid-cols-3 gap-3">
 <div>
 <label className="label">Date de naissance *</label>
 <input {...register('date_naissance', { required: avecInfoMedicale ? 'Obligatoire' : false })}
 type="date" className="input"
 max={new Date().toISOString().split('T')[0]}/>
 {errors.date_naissance && <p className="text-red-500 text-xs mt-1">{errors.date_naissance.message}</p>}
 </div>
 <div>
 <label className="label">Âge (calculé auto)</label>
 <input {...register('age')} type="number" className="input bg-slate-50" readOnly
 placeholder="Auto"/>
 </div>
 <div>
 <label className="label">Sexe *</label>
 <select {...register('sexe', { required: avecInfoMedicale ? 'Obligatoire' : false })} className="input">
 <option value="M">Masculin</option>
 <option value="F">Féminin</option>
 <option value="Autre">Autre</option>
 </select>
 </div>
 <div className="col-span-2">
 <label className="label">Personne de contact / urgence *</label>
 <input {...register('contact_urgence_nom', { required: avecInfoMedicale ? 'Obligatoire' : false })}
 className="input" placeholder="Nom du contact"/>
 {errors.contact_urgence_nom && <p className="text-red-500 text-xs mt-1">{errors.contact_urgence_nom.message}</p>}
 </div>
 <div>
 <label className="label">Tél. contact (WhatsApp) *</label>
 <input {...register('contact_urgence_tel', { required: avecInfoMedicale ? 'Obligatoire' : false })}
 className="input" placeholder="+509 3xxx-xxxx"/>
 {errors.contact_urgence_tel && <p className="text-red-500 text-xs mt-1">{errors.contact_urgence_tel.message}</p>}
 </div>
 </div>
 </div>
 )}

 {/* Champs optionnels */}
 <div>
 <label className="label">Email (optionnel)</label>
 <input {...register('email')} type="email" className="input" placeholder="patient@email.com"/>
 </div>

 <div className="flex gap-3">
 <button type="submit" className="btn-primary flex-1 justify-center">
 Vérifier les informations <i className="fa-solid fa-arrow-right ml-1" />
 </button>
 {onCancel && (
 <button type="button" onClick={onCancel} className="btn-ghost">Annuler</button>
 )}
 </div>
 </form>
 </div>
 )
}
