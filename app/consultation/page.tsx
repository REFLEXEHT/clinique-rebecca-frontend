'use client'
// app/consultation/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { rdvApi } from '@/lib/api'

const SPECS_ONLINE = [
  'Médecine interne', 'Neurologie', 'Pédiatrie', 'Gynécologie',
  'Dermatologie', 'ORL', 'Urologie', 'Ophtalmologie',
]
const MODES_PAY = ['Mobile Money (Moncash)', 'Natcash', 'Carte de crédit', 'Virement bancaire']
const HEURES = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00']

interface VideoForm {
  nom: string; telephone: string; email: string
  specialite: string; date: string; heure: string
  symptomes: string; mode_paiement: string; reference: string
}

export default function ConsultationPage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<VideoForm>()
  const today = new Date().toISOString().split('T')[0]

  const onSubmitVideo = async (data: VideoForm) => {
    setLoading(true)
    try {
      const dateRdv = new Date(`${data.date}T${data.heure}:00`)
      await rdvApi.create({
        patient_nom: data.nom,
        patient_telephone: data.telephone,
        patient_email: data.email,
        specialite: data.specialite,
        date_rdv: dateRdv.toISOString(),
        type_rdv: 'video',
        motif: data.symptomes,
        mode_paiement: data.mode_paiement,
        reference_paiement: data.reference,
      })
      const ds = dateRdv.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      toast.success(`✅ Consultation réservée — ${ds} à ${data.heure}`)
      setTimeout(() => toast.success('🎥 Lien vidéo envoyé sur WhatsApp', { icon: '📱' }), 700)
      setTimeout(() => toast.success('📧 Email de confirmation envoyé'), 1400)
      setTimeout(() => toast(`⏰ Rappel 6h avant programmé`, { icon: '🔔' }), 2100)
      reset()
      setShowVideoForm(false)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la réservation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      <div className="page-header">
        <div className="breadcrumb"><Link href="/">Accueil</Link> / <span>Consultation</span></div>
        <h1>Choisissez votre consultation</h1>
        <p>En personne à la clinique ou en ligne par vidéo</p>
      </div>

      <div className="py-16 px-[5%] max-w-[900px] mx-auto">
        {!showVideoForm ? (
          <div className="grid grid-cols-2 gap-7">
            {/* En personne */}
            <div className="card p-9 text-center cursor-pointer
              hover:-translate-y-1 hover:shadow-md transition-all
              hover:border-[#1641C8]/30" onClick={() => setRdvOpen(true)}>
              <div className="w-18 h-18 rounded-[18px] bg-blue-50 text-[#1641C8]
                flex items-center justify-center text-3xl mx-auto mb-5 w-[72px] h-[72px]">
                <i className="fa-solid fa-hospital-user" />
              </div>
              <h3 className="text-xl font-extrabold mb-2.5">Consultation en personne</h3>
              <p className="text-slate-500 text-sm leading-[1.7] mb-6">
                Venez consulter directement à la clinique avec votre médecin.
                Paiement possible sur place ou en ligne.
              </p>
              <div className="flex flex-col gap-2 mb-6 text-left">
                {['12 spécialités disponibles', 'Paiement flexible', 'Rappel WhatsApp 6h avant'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-green-500 text-xs" /> {f}
                  </div>
                ))}
              </div>
              <button className="btn-primary w-full justify-center">
                <i className="fa-regular fa-calendar-check" /> Prendre RDV
              </button>
            </div>

            {/* En ligne */}
            <div className="bg-gradient-to-br from-[#0f1e3d] to-[#1641C8] rounded-2xl
              p-9 text-center cursor-pointer hover:-translate-y-1
              transition-all hover:shadow-xl" onClick={() => setShowVideoForm(true)}>
              <div className="w-[72px] h-[72px] rounded-[18px] bg-white/15 text-white
                flex items-center justify-center text-3xl mx-auto mb-5">
                <i className="fa-solid fa-video" />
              </div>
              <h3 className="text-xl font-extrabold mb-2.5 text-white">Consultation en ligne</h3>
              <p className="text-white/70 text-sm leading-[1.7] mb-6">
                Consultez par vidéo depuis chez vous. Ordonnance numérique
                envoyée par email après la consultation.
              </p>
              <div className="flex flex-col gap-2 mb-6 text-left">
                {['Vidéo sécurisée', 'Ordonnance par email', 'Paiement en ligne requis'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <i className="fa-solid fa-check text-green-400 text-xs" /> {f}
                  </div>
                ))}
              </div>
              <button className="btn-green w-full justify-center">
                <i className="fa-solid fa-video" /> Démarrer — 2,000 HTG
              </button>
            </div>
          </div>
        ) : (
          /* Formulaire consultation vidéo */
          <div className="card p-8 max-w-[580px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <i className="fa-solid fa-video text-[#1641C8]" />
                Consultation vidéo
              </h2>
              <button onClick={() => setShowVideoForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer">
                <i className="fa-solid fa-arrow-left" /> Retour
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitVideo)} className="space-y-4">
              <div>
                <label className="label">Nom complet *</label>
                <input {...register('nom', { required: 'Requis' })} className="input"
                  placeholder="Jean Paul Marie" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">WhatsApp *</label>
                  <input {...register('telephone', { required: 'Requis' })} className="input"
                    placeholder="+509 3456-7890" />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input {...register('email', { required: 'Requis' })} type="email"
                    className="input" placeholder="email@gmail.com" />
                </div>
              </div>
              <div>
                <label className="label">Spécialité *</label>
                <select {...register('specialite', { required: 'Requis' })} className="input">
                  <option value="">Choisir...</option>
                  {SPECS_ONLINE.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date *</label>
                  <input {...register('date', { required: 'Requis' })} type="date"
                    min={today} className="input" />
                </div>
                <div>
                  <label className="label">Heure *</label>
                  <select {...register('heure', { required: 'Requis' })} className="input">
                    <option value="">Choisir...</option>
                    {HEURES.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Symptômes / Motif</label>
                <textarea {...register('symptomes')} className="input resize-none" rows={2}
                  placeholder="Décrivez vos symptômes..." />
              </div>

              {/* Paiement */}
              <div className="pay-box">
                <div className="pay-box-title">
                  <i className="fa-solid fa-credit-card" />
                  Paiement en ligne obligatoire — 2,000 HTG
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Mode de paiement *</label>
                    <select {...register('mode_paiement', { required: 'Requis' })} className="input">
                      {MODES_PAY.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">N° téléphone / Référence *</label>
                    <input {...register('reference', { required: 'Requis' })} className="input"
                      placeholder="+509 3456-7890" />
                  </div>
                </div>
              </div>

              <div className="notif-box">
                <i className="fa-solid fa-bell text-green-600 mr-1.5" />
                <strong>Après paiement :</strong> Lien vidéo envoyé sur WhatsApp 30 min avant ·
                Ordonnance par email · Rappel 6h avant
              </div>

              <button type="submit" disabled={loading} className="btn-green w-full justify-center py-3">
                {loading ? 'Traitement...' : <><i className="fa-solid fa-video" /> Réserver & Payer — 2,000 HTG</>}
              </button>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
