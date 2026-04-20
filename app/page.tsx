'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import RdvModal from '@/components/RdvModal'
import AiChat from '@/components/AiChat'
import { servicesApi, specialistesApi, horairesApi } from '@/lib/api'
import { Service, Specialiste, Horaire } from '@/types'
import Link from 'next/link'

const SPEC_FILTERS = [
  { label: 'Tous', value: 'tous' },
  { label: 'Chirurgie', value: 'chir' },
  { label: 'Neurologie', value: 'neuro' },
  { label: 'Pédiatrie', value: 'ped' },
  { label: 'Gynécologie', value: 'gyn' },
]

const SERVICE_CHIPS = [
  { icon: 'fa-stethoscope', label: 'Clinique externe' },
  { icon: 'fa-tooth', label: 'Dentisterie' },
  { icon: 'fa-flask-vial', label: 'Laboratoire' },
  { icon: 'fa-pills', label: 'Pharmacie' },
  { icon: 'fa-baby', label: 'Maternité' },
  { icon: 'fa-person-walking', label: 'Physiothérapie' },
  { icon: 'fa-glasses', label: 'Optométrie' },
  { icon: 'fa-syringe', label: 'Gestes médicaux' },
]

export default function HomePage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [specs, setSpecs] = useState<Specialiste[]>([])
  const [specFilter, setSpecFilter] = useState('tous')
  const [horaires, setHoraires] = useState<Horaire[]>([])
  const [rdvSpec, setRdvSpec] = useState('')

  useEffect(() => {
    servicesApi.list().then((r) => setServices(r.data)).catch(() => {})
    specialistesApi.list().then((r) => setSpecs(r.data)).catch(() => {})
    horairesApi.list().then((r) => setHoraires(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    specialistesApi.list(specFilter).then((r) => setSpecs(r.data)).catch(() => {})
  }, [specFilter])

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const openRdv = (spec = '') => {
    setRdvSpec(spec)
    setRdvOpen(true)
  }

  return (
    <>
      <Navbar onRdvClick={() => openRdv()} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} defaultSpec={rdvSpec} />

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section id="home" className="min-h-screen bg-gradient-to-br from-[#1a2a4a] via-[#1e3a6e] to-[#1a3a28]
        flex items-center px-[8%] pt-24 pb-16 relative overflow-hidden">

        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full
          bg-gradient-radial from-blue-600/15 to-transparent" />

        <div className="max-w-[520px] relative z-10">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20
            text-white/85 text-xs font-bold px-3 py-1.5 rounded-full mb-5 tracking-wide">
            <i className="fa-solid fa-location-dot text-[#5aaa28]" />
            Haïti · Soins de qualité
          </div>

          <h1 className="font-serif text-[clamp(28px,4vw,48px)] font-bold leading-[1.15] text-white mb-3">
            Votre santé,<br />
            notre <em className="italic text-[#7ec8f0]">engagement</em>
          </h1>

          <p className="text-white/65 text-[15px] leading-[1.7] mb-7 max-w-[440px]">
            Soins spécialisés, consultations en ligne et suivi personnalisé par WhatsApp — pour toute la famille.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <button onClick={() => openRdv()} className="btn-primary text-[14px] px-6 py-3">
              <i className="fa-regular fa-calendar-check" />
              Prendre rendez-vous
            </button>
            <button onClick={() => goTo('consultation')} className="btn-outline text-[14px] px-6 py-3">
              <i className="fa-solid fa-video" />
              Consulter en ligne
            </button>
          </div>

          {/* Service chips */}
          <div className="flex flex-wrap gap-2">
            {SERVICE_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => goTo('services')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/9 border border-white/15
                rounded-full text-[12.5px] font-semibold text-white/72
                hover:bg-white/18 hover:border-white/35 hover:text-white
                transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <i className={`fa-solid ${chip.icon} text-xs`} />
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right cards */}
        <div className="absolute right-[8%] top-1/2 -translate-y-1/2 flex flex-col gap-3 hidden lg:flex">
          {[
            { icon: 'fa-video', color: 'rgba(26,79,196,0.25)', iconColor: '#7aadff', title: 'Consultation en ligne', desc: 'Consultez un médecin par vidéo depuis chez vous' },
            { icon: 'fa-brands fa-whatsapp', color: 'rgba(37,211,102,0.2)', iconColor: '#25D366', title: 'Résultats sur WhatsApp', desc: 'Résultats de labo envoyés automatiquement' },
            { icon: 'fa-bell', color: 'rgba(90,170,40,0.2)', iconColor: '#5aaa28', title: 'Rappel 6h avant le RDV', desc: 'Patient & médecin notifiés automatiquement' },
          ].map((card, i) => (
            <div key={i}
              className={`bg-white/7 border border-white/12 rounded-xl p-4 w-[230px]
              ${i === 0 ? 'animate-float' : i === 1 ? 'animate-float-delayed ml-7' : 'animate-float ml-3.5'}`}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base mb-2.5"
                style={{ background: card.color, color: card.iconColor }}>
                <i className={`fa-solid ${card.icon}`} />
              </div>
              <h5 className="text-white font-extrabold text-[13px] mb-1">{card.title}</h5>
              <p className="text-white/55 text-[11.5px] leading-[1.5]">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════════════ */}
      <section id="services" className="py-16 px-[8%]">
        <div className="text-center max-w-[580px] mx-auto mb-10">
          <div className="section-tag"><i className="fa-solid fa-grid-2" /> Nos services</div>
          <h2 className="section-title">Une prise en charge <em>complète</em></h2>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            De la consultation externe à la pharmacie, laboratoire et salle d'accouchement — tout sous un même toit.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {services.map((svc) => (
              <div key={svc.id}
                onClick={() => goTo('specialists')}
                className="card-hover p-6 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl scale-x-0
                  group-hover:scale-x-100 transition-transform duration-200"
                  style={{ background: svc.couleur }} />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: `${svc.couleur}18`, color: svc.couleur }}>
                  <i className={`fa-solid ${svc.icone}`} />
                </div>
                <h3 className="font-extrabold text-[15px] mb-2">{svc.nom}</h3>
                <p className="text-gray-500 text-[12.5px] leading-relaxed mb-3">{svc.description}</p>
                <span className="flex items-center gap-1.5 text-xs font-bold transition-all group-hover:gap-2.5"
                  style={{ color: svc.couleur }}>
                  En savoir plus <i className="fa-solid fa-arrow-right text-xs" />
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══ SPECIALISTS ══════════════════════════════════════════════ */}
      <section id="specialists" className="py-16 px-[8%] bg-white">
        <div className="grid grid-cols-[1fr_300px] gap-10 items-start">
          <div>
            <div className="mb-5">
              <div className="section-tag"><i className="fa-solid fa-user-doctor" /> Clinique externe</div>
              <h2 className="section-title">Nos <em>spécialistes</em></h2>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {SPEC_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setSpecFilter(f.value)}
                  className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-bold border transition-all
                  ${specFilter === f.value
                    ? 'bg-[#1a4fc4] text-white border-[#1a4fc4]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#1a4fc4] hover:text-[#1a4fc4]'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-3">
              {specs.map((spec) => (
                <div key={spec.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center
                  hover:border-[#1a4fc4] hover:bg-white hover:shadow-md hover:-translate-y-0.5
                  transition-all cursor-pointer"
                >
                  <div className="w-13 h-13 rounded-full mx-auto mb-3 flex items-center justify-center
                    text-2xl bg-gradient-to-br from-blue-50 to-green-50 border-2 border-gray-100">
                    {spec.emoji}
                  </div>
                  <h4 className="font-extrabold text-[12.5px] mb-0.5">{spec.nom}</h4>
                  <div className="text-[#1a4fc4] text-[11px] font-bold mb-1.5">{spec.specialite}</div>
                  <div className="text-gray-400 text-[11px] mb-3 leading-[1.5]">{spec.description}</div>
                  <button onClick={() => openRdv(spec.specialite)}
                    className="block w-full py-1.5 rounded-full bg-blue-50 text-[#1a4fc4]
                    text-[11.5px] font-bold hover:bg-[#1a4fc4] hover:text-white transition-all">
                    Prendre RDV
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Horaires sidebar */}
          <div className="card p-5 sticky top-20">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Horaires d'ouverture
            </div>
            {horaires.length === 0 ? (
              <div className="space-y-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {horaires.map((h) => (
                  <div key={h.jour} className="flex justify-between items-center
                    px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-[13px]">
                    <span className="font-bold flex items-center gap-2">
                      <i className={`text-xs ${h.ouvert ? 'fa-regular fa-sun text-orange-400' : 'fa-solid fa-moon text-gray-400'}`} />
                      {h.jour}
                    </span>
                    <span className={`font-extrabold text-[12px] ${h.ouvert ? 'text-[#5aaa28]' : 'text-gray-400'}`}>
                      {h.ouvert ? `${h.heure_ouverture} – ${h.heure_fermeture}` : 'Fermé'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ CONSULTATION EN LIGNE ══════════════════════════════════════ */}
      <section id="consultation" className="py-16 px-[8%] bg-gradient-to-br from-[#0f1e3d] to-[#1a3a60]">
        <div className="grid grid-cols-2 gap-14 items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-green-900/30 text-green-400
              text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <i className="fa-solid fa-video" /> Téléconsultation
            </div>
            <h2 className="font-serif text-[clamp(24px,3vw,36px)] text-white font-bold leading-[1.2] mb-3">
              Consultez depuis{' '}
              <em className="italic text-[#7ec8f0]">chez vous</em>
            </h2>
            <p className="text-white/65 text-[15px] leading-[1.7] mb-7">
              Prenez RDV en ligne, consultez par vidéo, recevez votre ordonnance.
              Patient et médecin notifiés automatiquement.
            </p>
            <div className="space-y-3">
              {[
                { ic: 'fa-video', col: 'rgba(26,79,196,0.25)', colT: '#7aadff', title: 'Vidéoconsultation sécurisée', desc: 'Lien sécurisé envoyé par WhatsApp 30 min avant.' },
                { ic: 'fa-bell', col: 'rgba(90,170,40,0.2)', colT: '#5aaa28', title: 'Rappel automatique 6h avant', desc: 'Patient ET médecin notifiés pour confirmer le maintien du RDV.' },
                { ic: 'fa-file-prescription', col: 'rgba(224,122,0,0.2)', colT: '#e07a00', title: 'Ordonnance numérique', desc: 'Envoyée par WhatsApp et email après consultation.' },
              ].map((feat) => (
                <div key={feat.title} className="flex gap-3.5 bg-white/4 border border-white/7 rounded-xl p-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: feat.col, color: feat.colT }}>
                    <i className={`fa-solid ${feat.ic}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-[13.5px] mb-0.5">{feat.title}</h4>
                    <p className="text-white/55 text-[12px] leading-[1.5]">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inline RDV form */}
          <div className="bg-white/6 border border-white/11 rounded-xl p-7">
            <h3 className="text-white font-extrabold text-[17px] mb-5 flex items-center gap-2.5">
              <i className="fa-solid fa-calendar-plus text-[#5aaa28]" />
              Réserver une consultation
            </h3>
            <button onClick={() => openRdv()} className="btn-primary w-full justify-center py-3.5 text-[14.5px]">
              <i className="fa-regular fa-calendar-check" />
              Ouvrir le formulaire de RDV
            </button>
            <p className="text-white/50 text-xs text-center mt-3">
              Confirmation WhatsApp + Email · Rappel 6h avant · Patient & Médecin
            </p>
          </div>
        </div>
      </section>

      {/* ══ COMMUNICATION ══════════════════════════════════════════════ */}
      <section id="communication" className="py-16 px-[8%]">
        <div className="text-center max-w-[560px] mx-auto mb-10">
          <div className="section-tag"><i className="fa-solid fa-comments" /> Communication</div>
          <h2 className="section-title">Restez <em>connecté</em> à votre santé</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              ic: 'fa-brands fa-whatsapp', bg: 'rgba(37,211,102,0.12)', col: '#25D366',
              title: 'WhatsApp', desc: 'Canal principal pour résultats, rappels de RDV et suivi.',
              items: ['Résultats de laboratoire (instantané)', 'Confirmation & rappel RDV 6h avant', 'Ordonnances numériques', 'Offres de la clinique'],
              btn: 'Nous écrire', btnClass: 'bg-[#25D366]', href: 'https://wa.me/50938880000',
            },
            {
              ic: 'fa-solid fa-envelope', bg: 'rgba(26,79,196,0.10)', col: '#1a4fc4',
              title: 'Email', desc: 'Résultats complets en PDF, comptes-rendus et confirmations.',
              items: ['Résultats complets (PDF)', 'Compte-rendu médical', 'Rappel RDV — patient & médecin', 'Factures et reçus'],
              btn: 'Nous écrire', btnClass: 'bg-[#1a4fc4]', href: 'mailto:contact@cliniquerebecca.ht',
            },
            {
              ic: 'fa-solid fa-bell', bg: 'rgba(224,122,0,0.12)', col: '#e07a00',
              title: 'Notifications auto', desc: 'Activez les alertes pour ne jamais manquer un RDV ni un résultat.',
              items: ['Rappel patient J-1 (WhatsApp)', 'Rappel médecin 6h avant', 'Alerte résultats disponibles'],
              btn: 'Activer les alertes', btnClass: 'bg-[#e07a00]', href: '#',
            },
            {
              ic: 'fa-solid fa-file-medical', bg: 'rgba(90,170,40,0.10)', col: '#5aaa28',
              title: 'Portail Patient', desc: 'Accédez à votre dossier médical et historique en ligne.',
              items: ['Dossier médical complet', 'Historique des visites', 'Messagerie sécurisée médecin'],
              btn: 'Mon espace patient', btnClass: 'bg-[#5aaa28]', href: '/portail',
            },
          ].map((card) => (
            <div key={card.title} className="card-hover p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: card.bg, color: card.col }}>
                <i className={card.ic} />
              </div>
              <h3 className="font-extrabold text-lg mb-2">{card.title}</h3>
              <p className="text-gray-500 text-[13.5px] leading-relaxed mb-4">{card.desc}</p>
              <ul className="space-y-1.5 mb-5">
                {card.items.map((it) => (
                  <li key={it} className="flex items-center gap-2 text-[12.5px] text-gray-600 font-semibold">
                    <i className="fa-solid fa-check-circle text-[#5aaa28] text-xs" />
                    {it}
                  </li>
                ))}
              </ul>
              <a href={card.href} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
                text-white text-[13px] font-bold transition-all hover:opacity-90 hover:-translate-y-0.5
                ${card.btnClass}`}>
                {card.btn}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ══ AI ════════════════════════════════════════════════════════ */}
      <section id="ai" className="py-16 px-[8%] bg-white">
        <div className="text-center max-w-[540px] mx-auto mb-10">
          <div className="section-tag"><i className="fa-solid fa-robot" /> Assistant IA</div>
          <h2 className="section-title">Rebecca, votre <em>assistante médicale IA</em></h2>
        </div>
        <div className="grid grid-cols-[420px_1fr] gap-12 items-center">
          <AiChat />
          <div>
            <h3 className="text-[20px] font-extrabold mb-2">Ce que Rebecca peut faire</h3>
            <p className="text-gray-500 text-[13.5px] leading-relaxed mb-6">
              Formée sur les services de la clinique, disponible en permanence.
            </p>
            <div className="space-y-4">
              {[
                { n: '1', col: '#1a4fc4', t: 'Orientation médicale', d: 'Décrivez vos symptômes — Rebecca vous oriente vers le bon spécialiste.' },
                { n: '2', col: '#5aaa28', t: 'Prise de rendez-vous', d: 'Réservez avec le bon médecin, à la bonne date.' },
                { n: '3', col: '#e07a00', t: 'Suivi de résultats', d: 'Vérifiez la disponibilité de vos résultats de labo.' },
                { n: '4', col: '#be185d', t: 'Informations clinique', d: 'Horaires, services, spécialistes — réponses instantanées.' },
              ].map((feat) => (
                <div key={feat.t} className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-extrabold
                    text-white flex-shrink-0" style={{ background: feat.col }}>
                    {feat.n}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[14px] mb-0.5">{feat.t}</h4>
                    <p className="text-gray-500 text-[13px] leading-relaxed">{feat.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONTACT ═══════════════════════════════════════════════════ */}
      <section id="contact" className="py-16 px-[8%]">
        <div className="mb-8">
          <div className="section-tag"><i className="fa-solid fa-location-dot" /> Contact</div>
          <h2 className="section-title">Nous sommes <em>là pour vous</em></h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { ic: 'fa-phone', bg: 'rgba(26,79,196,0.10)', col: '#1a4fc4', t: 'Téléphone', d: '+509 3888-0000', sub: 'Standard — Lun à Dim' },
            { ic: 'fa-brands fa-whatsapp', bg: 'rgba(37,211,102,0.10)', col: '#25D366', t: 'WhatsApp', d: '+509 3888-0000', sub: 'Résultats, suivi, questions' },
            { ic: 'fa-envelope', bg: 'rgba(90,170,40,0.10)', col: '#5aaa28', t: 'Email', d: 'contact@cliniquerebecca.ht', sub: 'Dossiers médicaux, documents' },
            { ic: 'fa-location-dot', bg: 'rgba(224,122,0,0.12)', col: '#e07a00', t: 'Localisation', d: 'Clinique de la Rebecca', sub: 'Haïti — Contactez-nous pour l\'adresse' },
          ].map((c) => (
            <div key={c.t} className="card-hover flex gap-3.5 p-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
                style={{ background: c.bg, color: c.col }}>
                <i className={`fa-solid ${c.ic}`} />
              </div>
              <div>
                <h4 className="font-extrabold text-[14.5px] mb-0.5">{c.t}</h4>
                <p className="text-[#1a4fc4] font-bold text-[13px]">{c.d}</p>
                <p className="text-gray-400 text-[12px]">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="bg-[#080f22] text-white/60 py-12 px-[8%]">
        <div className="grid grid-cols-4 gap-10 mb-10">
          <div>
            <img src="/logo.png" alt="Logo" className="h-9 mb-3 brightness-0 invert opacity-80"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <p className="text-[12.5px] leading-relaxed mb-4">
              Des soins médicaux de qualité en Haïti. Consultations en ligne et suivi personnalisé.
            </p>
            <div className="flex gap-2">
              {['fa-brands fa-facebook-f', 'fa-brands fa-whatsapp', 'fa-brands fa-instagram', 'fa-regular fa-envelope'].map((ic) => (
                <a key={ic} href="#" className="w-8 h-8 rounded-lg bg-white/8 flex items-center
                  justify-center text-white/55 text-sm hover:bg-[#1a4fc4] hover:text-white transition-all">
                  <i className={ic} />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Services', items: ['Clinique externe', 'Dentisterie', 'Physiothérapie', 'Laboratoire', 'Pharmacie', 'Optométrie', 'Salle SOP', 'Accouchement'] },
            { title: 'Spécialistes', items: ['Chirurgie', 'Neurologie', 'Orthopédie', 'Pédiatrie', 'Gynécologie', 'Dermatologie', 'ORL', 'Ophtalmologie'] },
            { title: 'Liens utiles', items: ['Prendre RDV', 'Consultation en ligne', 'Espace patient', 'Résultats de labo', 'Contact'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-white mb-3">{col.title}</h4>
              {col.items.map((it) => (
                <button key={it} onClick={() => goTo(it === 'Prendre RDV' ? 'home' : 'services')}
                  className="block text-[12.5px] text-white/50 hover:text-[#5aaa28] mb-1.5 transition-colors cursor-pointer bg-transparent border-none text-left">
                  {it}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-white/7 pt-5 flex justify-between text-[11.5px] text-white/32">
          <span>© 2026 Clinique de la Rebecca. Tous droits réservés.</span>
          <span>Fait avec <span className="text-[#5aaa28]">♥</span> pour vos soins</span>
        </div>
      </footer>

      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 items-end">
        <div onClick={() => goTo('ai')}
          className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-[12px]
          font-bold text-gray-600 shadow-md flex items-center gap-2 cursor-pointer hover:border-[#1a4fc4]">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-blink" />
          Rebecca IA disponible
        </div>
        <div className="flex gap-2">
          <a href="https://wa.me/50938880000" target="_blank"
            className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center
            justify-center text-xl shadow-lg hover:scale-110 transition-transform">
            <i className="fa-brands fa-whatsapp" />
          </a>
          <button onClick={() => openRdv()}
            className="w-12 h-12 rounded-full bg-[#1a4fc4] text-white flex items-center
            justify-center text-lg shadow-lg hover:scale-110 transition-transform border-none cursor-pointer">
            <i className="fa-regular fa-calendar-check" />
          </button>
        </div>
      </div>
    </>
  )
}
