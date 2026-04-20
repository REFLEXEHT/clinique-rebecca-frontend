'use client'
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
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
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
  motif: string
}

export default function RdvModal({ open, onClose, defaultSpec }: Props) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { specialite: defaultSpec || '', type_rdv: 'presentiel' },
  })

  if (!open) return null

  const today = new Date().toISOString().split('T')[0]

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
      })

      const dateStr = dateRdv.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long',
      })

      toast.success(`✅ RDV confirmé — ${dateStr} à ${data.heure}`)
      setTimeout(() => toast.success(`📱 WhatsApp envoyé à ${data.patient_telephone}`, { icon: '💬' }), 700)
      setTimeout(() => toast.success(`👨‍⚕️ Médecin (${data.specialite}) notifié par email`), 1400)
      setTimeout(() => toast(`⏰ Rappel programmé 6h avant — patient & médecin`, { icon: '🔔' }), 2100)

      reset()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la prise de RDV')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[580px] max-h-[92vh] overflow-y-auto
        animate-[modalIn_0.22s_cubic-bezier(0.34,1.56,0.64,1)]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <i className="fa-regular fa-calendar-check text-[#1a4fc4]" />
            <span className="text-[16px] font-extrabold">Prendre un rendez-vous</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center
            justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-3">
          <div>
            <label className="label">Nom complet *</label>
            <input {...register('patient_nom', { required: true })} className="input"
              placeholder="Jean Paul Marie" />
            {errors.patient_nom && <p className="text-red-500 text-xs mt-1">Champ requis</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">WhatsApp *</label>
              <input {...register('patient_telephone', { required: true })} className="input"
                placeholder="+509 3456-7890" />
              {errors.patient_telephone && <p className="text-red-500 text-xs mt-1">Champ requis</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('patient_email')} type="email" className="input"
                placeholder="email@gmail.com" />
            </div>
          </div>

          <div>
            <label className="label">Spécialité / Service *</label>
            <select {...register('specialite', { required: true })} className="input">
              <option value="">Sélectionner...</option>
              {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.specialite && <p className="text-red-500 text-xs mt-1">Champ requis</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input {...register('date', { required: true })} type="date" min={today} className="input" />
              {errors.date && <p className="text-red-500 text-xs mt-1">Champ requis</p>}
            </div>
            <div>
              <label className="label">Heure *</label>
              <select {...register('heure', { required: true })} className="input">
                <option value="">Choisir l'heure...</option>
                {HEURES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              {errors.heure && <p className="text-red-500 text-xs mt-1">Champ requis</p>}
            </div>
          </div>

          <div>
            <label className="label">Type de consultation</label>
            <select {...register('type_rdv')} className="input">
              <option value="presentiel">En personne à la clinique</option>
              <option value="video">En ligne (vidéoconsultation)</option>
            </select>
          </div>

          <div>
            <label className="label">Motif (optionnel)</label>
            <textarea {...register('motif')} className="input resize-none" rows={2}
              placeholder="Décrivez brièvement votre problème..." />
          </div>

          {/* Notifications info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
            <p className="font-bold text-green-700 mb-2 flex items-center gap-1.5">
              <i className="fa-solid fa-bell text-xs" /> Notifications automatiques
            </p>
            <div className="space-y-1.5 text-green-600 text-xs">
              <div className="flex items-start gap-2">
                <i className="fa-brands fa-whatsapp mt-0.5" />
                <span><strong>Immédiatement :</strong> WhatsApp + Email au patient</span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-user-doctor mt-0.5 text-[#1a4fc4]" />
                <span><strong>Immédiatement :</strong> Email au médecin concerné</span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-clock mt-0.5 text-orange-500" />
                <span><strong>6h avant :</strong> Rappel WhatsApp + Email — patient & médecin</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-full
              font-bold text-sm hover:bg-gray-50 transition-all">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 btn-blue justify-center py-2.5 rounded-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Envoi...
                </span>
              ) : (
                <>
                  <i className="fa-regular fa-calendar-check text-sm" />
                  Confirmer le RDV
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
