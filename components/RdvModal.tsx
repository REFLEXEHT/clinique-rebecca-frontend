'use client'
// components/ui/RdvModal.tsx — Modal prise de rendez-vous avec paiement
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { rdvApi } from '@/lib/api'
import { X } from 'lucide-react'

const SPECIALITES = [
 'Chirurgie générale', 'Neurochirurgie', 'Neurologie', 'Orthopédie',
 'Pédiatrie', 'Dermatologie', 'Urologie', 'ORL', 'Gynécologie',
 'Chirurgie pédiatrique', 'Médecine interne', 'Ophtalmologie',
 'Dentisterie', 'Physiothérapie', 'Optométrie', 'Laboratoire',
]
const HEURES = [
 '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30',
 '11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30',
 '16:00','16:30',
]
const MODES_PAIEMENT = [
 'À la clinique',
 'Mobile Money (Moncash)',
 'Natcash',
 'Carte de crédit',
 'Virement bancaire',
]

interface Props {
 open: boolean
 onClose: () => void
 defaultSpec?: string
}

interface FormData {
 patient_nom: string
 patient_telephone: string
 patient_email: string
 specialite: string
 date: string
 heure: string
 type_rdv: 'presentiel' | 'video'
 mode_paiement: string
 reference_paiement: string
 motif: string
}

export default function RdvModal({ open, onClose, defaultSpec }: Props) {
 const [loading, setLoading] = useState(false)
 const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
 defaultValues: {
 specialite: defaultSpec || '',
 type_rdv: 'presentiel',
 mode_paiement: 'À la clinique',
 },
 })

 const modePaiement = watch('mode_paiement')
 const showPayDetail = modePaiement !== 'À la clinique'
 const today = new Date().toISOString().split('T')[0]

 if (!open) return null

 const onSubmit = async (data: FormData) => {
 setLoading(true)
 try {
 const dateRdv = new Date(`${data.date}T${data.heure}:00`)
 await rdvApi.create({
 patient_nom: data.patient_nom,
 patient_telephone: data.patient_telephone,
 patient_email: data.patient_email || undefined,
 specialite: data.specialite,
 date_rdv: dateRdv.toISOString(),
 type_rdv: data.type_rdv,
 motif: data.motif || undefined,
 mode_paiement: data.mode_paiement,
 reference_paiement: data.reference_paiement || undefined,
 })

 const dateStr = dateRdv.toLocaleDateString('fr-FR', {
 weekday: 'long', day: 'numeric', month: 'long',
 })
 toast.success(` RDV confirmé — ${dateStr} à ${data.heure}`)
 setTimeout(() => toast.success(` WhatsApp à ${data.patient_telephone}`, { icon: '' }), 700)
 setTimeout(() => toast.success(`‍ Médecin notifié — ${data.specialite}`), 1400)
 setTimeout(() => toast(`⏰ Rappel 6h avant programmé`, { icon: '' }), 2100)
 reset()
 onClose()
 } catch (err: any) {
 toast.error(err.response?.data?.detail || 'Erreur lors de la prise de RDV')
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
 <div className="modal-box max-w-[580px]">
 {/* Header */}
 <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100">
 <h3 className="text-[16px] font-extrabold flex items-center gap-2">
 <i className="fa-regular fa-calendar-check text-[#1641C8]" />
 Prendre un rendez-vous
 </h3>
 <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex
 items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500
 transition-all border-none cursor-pointer">
 <X size={15} />
 </button>
 </div>

 <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-3">
 {/* Nom */}
 <div>
 <label className="label">Nom complet *</label>
 <input {...register('patient_nom', { required: 'Requis' })}
 className="input" placeholder="Jean Paul Marie" />
 {errors.patient_nom && <p className="text-red-500 text-xs mt-1">{errors.patient_nom.message}</p>}
 </div>

 {/* Téléphone + Email */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="label">WhatsApp *</label>
 <input {...register('patient_telephone', { required: 'Requis' })}
 className="input" placeholder="+509 3456-7890" />
 {errors.patient_telephone && <p className="text-red-500 text-xs mt-1">{errors.patient_telephone.message}</p>}
 </div>
 <div>
 <label className="label">Email</label>
 <input {...register('patient_email')} type="email" className="input"
 placeholder="email@gmail.com" />
 </div>
 </div>

 {/* Spécialité */}
 <div>
 <label className="label">Spécialité / Service *</label>
 <select {...register('specialite', { required: 'Requis' })} className="input">
 <option value="">Choisir...</option>
 {SPECIALITES.map(s => <option key={s}>{s}</option>)}
 </select>
 {errors.specialite && <p className="text-red-500 text-xs mt-1">{errors.specialite.message}</p>}
 </div>

 {/* Date + Heure */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="label">Date *</label>
 <input {...register('date', { required: 'Requis' })} type="date"
 min={today} className="input" />
 {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
 </div>
 <div>
 <label className="label">Heure *</label>
 <select {...register('heure', { required: 'Requis' })} className="input">
 <option value="">Choisir...</option>
 {HEURES.map(h => <option key={h}>{h}</option>)}
 </select>
 {errors.heure && <p className="text-red-500 text-xs mt-1">{errors.heure.message}</p>}
 </div>
 </div>

 {/* Type */}
 <div>
 <label className="label">Type de consultation</label>
 <select {...register('type_rdv')} className="input">
 <option value="presentiel">En personne à la clinique</option>
 <option value="video">En ligne (vidéoconsultation)</option>
 </select>
 </div>

 {/* Mode paiement */}
 <div>
 <label className="label">Mode de paiement</label>
 <select {...register('mode_paiement')} className="input">
 {MODES_PAIEMENT.map(m => <option key={m}>{m}</option>)}
 </select>
 </div>

 {/* Référence paiement (si en ligne) */}
 {showPayDetail && (
 <div className="pay-box">
 <div className="pay-box-title">
 <i className="fa-solid fa-mobile-screen" />
 Paiement en ligne — Référence de transaction
 </div>
 <label className="label">Numéro / Référence *</label>
 <input {...register('reference_paiement', { required: showPayDetail ? 'Requis pour le paiement en ligne' : false })}
 className="input" placeholder="Ex: +509 3456-7890 ou référence Moncash" />
 {errors.reference_paiement && (
 <p className="text-red-500 text-xs mt-1">{errors.reference_paiement.message}</p>
 )}
 </div>
 )}

 {/* Motif */}
 <div>
 <label className="label">Motif (optionnel)</label>
 <textarea {...register('motif')} className="input resize-none" rows={2}
 placeholder="Décrivez brièvement votre problème..." />
 </div>

 {/* Notifications info */}
 <div className="notif-box">
 <i className="fa-solid fa-bell text-green-600 mr-1.5" />
 <strong>Notifications automatiques :</strong> Confirmation WhatsApp + Email ·
 Rappel 6h avant — patient & médecin
 </div>

 {/* Actions */}
 <div className="flex gap-3 pt-1">
 <button type="button" onClick={onClose}
 className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-full
 font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer bg-white">
 Annuler
 </button>
 <button type="submit" disabled={loading}
 className="flex-1 btn-primary justify-center py-2.5 rounded-full">
 {loading ? (
 <span className="flex items-center gap-2">
 <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
 </svg>
 Envoi...
 </span>
 ) : (
 <><i className="fa-regular fa-calendar-check" /> Confirmer le RDV</>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 )
}
