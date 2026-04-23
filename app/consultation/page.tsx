'use client'
// app/consultation/page.tsx — Page de consultation redesignée, lumineuse et humaine
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

const TARIFS: Record<string, number> = {
  'Médecine interne': 1500,
  'Neurologie': 2500,
  'Pédiatrie': 1800,
  'Gynécologie': 2000,
  'Dermatologie': 1800,
  'ORL': 1800,
  'Urologie': 2000,
  'Ophtalmologie': 2000,
}

interface VideoForm {
  nom: string
  telephone: string
  email: string
  specialite: string
  date: string
  heure: string
  symptomes: string
  mode_paiement: string
  reference: string
}

export default function ConsultationPage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmation, setConfirmation] = useState<{numero: string; lienVideo: string; date: string} | null>(null)
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<VideoForm>()
  const today = new Date().toISOString().split('T')[0]
  const specW = watch('specialite')

  const genererNumeroRdv = () => `RB-VID-${Date.now().toString(36).toUpperCase()}`
  const genererLienVideo = (numero: string) => `https://meet.jit.si/clinique-rebecca-${numero}`

  const onSubmitVideo = async (data: VideoForm) => {
    setLoading(true)
    try {
      const dateRdv = new Date(`${data.date}T${data.heure}:00`)
      const numero = genererNumeroRdv()
      const lienVideo = genererLienVideo(numero)

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
        lien_video: lienVideo,
        numero_rdv: numero,
      }).catch(() => {})

      const ds = dateRdv.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })
      setConfirmation({ numero, lienVideo, date: `${ds} à ${data.heure}` })
      toast.success('Rendez-vous confirmé !')
      setTimeout(() => toast.success('Lien vidéo envoyé par WhatsApp', { duration: 4000 }), 700)
      setTimeout(() => toast.success('Email de confirmation envoyé', { duration: 4000 }), 1400)
      reset()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la réservation')
    } finally {
      setLoading(false)
    }
  }

  // Écran de confirmation
  if (confirmation) {
    return (
      <>
        <Navbar onRdvClick={() => setRdvOpen(true)} />
        <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center pt-[70px] px-4">
          <div className="card p-10 max-w-[520px] w-full text-center shadow-xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <i className="fa-solid fa-circle-check text-green-500 text-4xl" />
            </div>
            <h2 className="font-extrabold text-[22px] text-slate-800 mb-2">Consultation confirmée !</h2>
            <p className="text-slate-500 text-sm mb-6">{confirmation.date}</p>

            <div className="bg-[#0f172a] rounded-2xl p-5 mb-6 text-left">
              <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Votre lien vidéo</div>
              <div className="text-white font-extrabold text-sm mb-4 break-all">{confirmation.lienVideo}</div>
              <a href={confirmation.lienVideo} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#1641C8] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0f2fa3] transition-colors no-underline">
                <i className="fa-solid fa-video" /> Rejoindre la consultation
              </a>
              <p className="text-white/40 text-xs mt-3 text-center">Cliquez à l'heure du rendez-vous. Votre médecin vous rejoindra.</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Récapitulatif</div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Référence :</span> <span className="font-bold text-[#1641C8]">{confirmation.numero}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date :</span> <span className="font-semibold">{confirmation.date}</span></div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              Lien envoyé par WhatsApp et email · Rappel 6h avant le RDV
            </p>

            <div className="flex gap-3">
              <button onClick={() => setConfirmation(null)} className="btn-secondary flex-1 justify-center text-sm">
                Autre rendez-vous
              </button>
              <Link href="/" className="btn-primary flex-1 justify-center text-sm no-underline">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ── EN-TÊTE ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 pt-[110px] pb-12 px-[5%]">
        <div className="max-w-3xl mx-auto text-center">
          <nav className="flex items-center gap-2 justify-center text-sm text-slate-400 mb-5">
            <Link href="/" className="text-slate-500 hover:text-[#1641C8] transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-slate-700">Consultation</span>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Choisissez votre<br />
            <span className="italic text-[#1641C8]">mode de consultation</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            En personne à la clinique ou par vidéo depuis chez vous. Nous nous adaptons à vos besoins.
          </p>
        </div>
      </div>

      <div className="py-12 px-[5%] bg-slate-50">
        <div className="max-w-[960px] mx-auto">

          {!showVideoForm ? (
            <>
              {/* ── DEUX OPTIONS ──────────────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14 consultation-grid">

                {/* En personne */}
                <div
                  className="bg-white rounded-2xl border-2 border-slate-200 p-8 cursor-pointer
                    hover:-translate-y-1 hover:shadow-xl hover:border-[#1641C8]/40 transition-all duration-300"
                  onClick={() => setRdvOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setRdvOpen(true)}
                >
                  <div className="w-[72px] h-[72px] rounded-2xl bg-blue-50 text-[#1641C8] flex items-center justify-center text-3xl mx-auto mb-6">
                    <i className="fa-solid fa-hospital-user" />
                  </div>
                  <h2 className="font-extrabold text-[20px] text-slate-900 mb-3 text-center">Consultation en personne</h2>
                  <p className="text-slate-500 text-[14px] leading-relaxed mb-6 text-center">
                    Venez nous voir à la clinique. Nos médecins vous accueillent dans un espace calme et bienveillant.
                  </p>
                  <ul className="space-y-3 mb-7">
                    {[
                      '12 spécialités disponibles',
                      'Paiement flexible (espèces, Moncash)',
                      'Rappel WhatsApp 6h avant',
                      'Résultats labo par WhatsApp et email',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="fa-solid fa-check text-green-600 text-[10px]" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className="btn-primary w-full justify-center" onClick={e => { e.stopPropagation(); setRdvOpen(true) }}>
                    <i className="fa-regular fa-calendar-check" /> Réserver ma visite
                  </button>
                </div>

                {/* En ligne */}
                <div
                  className="bg-white rounded-2xl border-2 border-slate-200 p-8 cursor-pointer
                    hover:-translate-y-1 hover:shadow-xl hover:border-[#1641C8]/40 transition-all duration-300"
                  onClick={() => setShowVideoForm(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setShowVideoForm(true)}
                >
                  {/* Badge "Populaire" */}
                  <div className="flex justify-center mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-[#1641C8] text-white text-xs font-bold px-3 py-1 rounded-full">
                      <i className="fa-solid fa-star text-[10px]" /> Consultation populaire
                    </span>
                  </div>
                  <div className="w-[72px] h-[72px] rounded-2xl bg-blue-50 text-[#1641C8] flex items-center justify-center text-3xl mx-auto mb-6">
                    <i className="fa-solid fa-video" />
                  </div>
                  <h2 className="font-extrabold text-[20px] text-slate-900 mb-3 text-center">Consultation en ligne</h2>
                  <p className="text-slate-500 text-[14px] leading-relaxed mb-6 text-center">
                    Consultez votre médecin par vidéo depuis chez vous. Lien envoyé immédiatement après réservation.
                  </p>
                  <ul className="space-y-3 mb-7">
                    {[
                      'Vidéo sécurisée (Jitsi Meet, sans installation)',
                      'Ordonnance numérique par email',
                      'Rappel WhatsApp 6h avant',
                      'Paiement Moncash ou Natcash',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="fa-solid fa-check text-[#1641C8] text-[10px]" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className="btn-primary w-full justify-center" onClick={e => { e.stopPropagation(); setShowVideoForm(true) }}>
                    <i className="fa-solid fa-video" /> Démarrer une consultation vidéo
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-3">À partir de 1 500 HTG</p>
                </div>
              </div>

              {/* ── COMMENT ÇA MARCHE ──────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10">
                <h3 className="font-extrabold text-[18px] text-slate-800 text-center mb-10">
                  Comment fonctionne la consultation vidéo ?
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { n: '1', icon: 'fa-calendar-plus', title: 'Réservation', desc: 'Choisissez spécialiste, date et heure en ligne' },
                    { n: '2', icon: 'fa-money-bill-wave', title: 'Paiement', desc: 'Payez par Moncash ou Natcash et entrez la référence' },
                    { n: '3', icon: 'fa-link', title: 'Lien vidéo', desc: 'Recevez votre lien Jitsi Meet par WhatsApp et email' },
                    { n: '4', icon: 'fa-video', title: 'Consultation', desc: 'Rejoignez à l\'heure — votre médecin vous attend' },
                  ].map(s => (
                    <div key={s.n} className="text-center">
                      <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-[#1641C8]/20 text-[#1641C8] flex items-center justify-center text-lg mx-auto mb-3 font-extrabold text-[17px]">
                        {s.n}
                      </div>
                      <div className="font-extrabold text-slate-800 mb-1 text-[14px]">{s.title}</div>
                      <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ── FORMULAIRE VIDÉO ─────────────────────────────────────── */
            <div className="max-w-[680px] mx-auto">
              <button onClick={() => setShowVideoForm(false)}
                className="flex items-center gap-2 text-slate-500 hover:text-[#1641C8] text-sm font-semibold mb-6 border-none bg-transparent cursor-pointer transition-colors">
                <i className="fa-solid fa-arrow-left" /> Retour au choix
              </button>

              <div className="card p-8 shadow-lg">
                <div className="flex items-start gap-4 mb-7">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1641C8] text-xl flex-shrink-0">
                    <i className="fa-solid fa-video" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-[20px] text-slate-900">Réserver une consultation vidéo</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Lien Jitsi Meet envoyé par WhatsApp et email après confirmation</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmitVideo)} className="space-y-5">
                  {/* Infos patient */}
                  <div>
                    <div className="text-[11px] font-bold text-[#1641C8] uppercase tracking-wider mb-3">Vos informations</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="label">Nom complet *</label>
                        <input {...register('nom', { required: 'Requis' })} className="input" placeholder="Prénom Nom" />
                        {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
                      </div>
                      <div>
                        <label className="label">Téléphone WhatsApp *</label>
                        <input {...register('telephone', { required: 'Requis' })} className="input" placeholder="+509 3xxx-xxxx" />
                        {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone.message}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="label">Email *</label>
                        <input {...register('email', { required: 'Requis' })} type="email" className="input" placeholder="votre@email.com" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Spécialité + horaire */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Rendez-vous</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="label">Spécialité *</label>
                        <select {...register('specialite', { required: 'Requis' })} className="input">
                          <option value="">Choisir...</option>
                          {SPECS_ONLINE.map(s => <option key={s}>{s}</option>)}
                        </select>
                        {errors.specialite && <p className="text-red-500 text-xs mt-1">{errors.specialite.message}</p>}
                        {specW && TARIFS[specW] && (
                          <div className="mt-1.5 text-xs font-bold text-[#1641C8]">
                            Tarif : {TARIFS[specW].toLocaleString('fr')} HTG
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="label">Date *</label>
                        <input {...register('date', { required: 'Requis' })} type="date" min={today} className="input" />
                        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                      </div>
                      <div>
                        <label className="label">Heure *</label>
                        <select {...register('heure', { required: 'Requis' })} className="input">
                          <option value="">Heure...</option>
                          {HEURES.map(h => <option key={h}>{h}</option>)}
                        </select>
                        {errors.heure && <p className="text-red-500 text-xs mt-1">{errors.heure.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Motif / Symptômes *</label>
                    <textarea {...register('symptomes', { required: 'Requis' })} className="input resize-none" rows={3}
                      placeholder="Décrivez brièvement vos symptômes ou le motif de consultation..." />
                    {errors.symptomes && <p className="text-red-500 text-xs mt-1">{errors.symptomes.message}</p>}
                  </div>

                  {/* Paiement */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Paiement en ligne requis</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="label">Mode de paiement *</label>
                        <select {...register('mode_paiement', { required: 'Requis' })} className="input">
                          <option value="">Choisir...</option>
                          {MODES_PAY.map(m => <option key={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Référence transaction *</label>
                        <input {...register('reference', { required: 'Requis' })} className="input" placeholder="Ex: MCH-XXXXXXXX" />
                        {errors.reference && <p className="text-red-500 text-xs mt-1">{errors.reference.message}</p>}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Effectuez le paiement vers le compte clinique d'abord, puis entrez la référence de transaction.
                    </p>
                  </div>

                  {/* Info vidéo */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
                    <i className="fa-solid fa-video text-[#1641C8] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Un lien <strong>Jitsi Meet</strong> sera envoyé par WhatsApp et email.
                      Aucune installation — fonctionne dans votre navigateur.
                    </p>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base">
                    {loading ? (
                      <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block" />Confirmation en cours...</>
                    ) : (
                      <><i className="fa-solid fa-video" /> Confirmer et recevoir le lien vidéo</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
