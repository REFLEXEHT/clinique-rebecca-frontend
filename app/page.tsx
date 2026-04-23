'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import AiChat from '@/components/ui/AiChat'
import Link from 'next/link'
import { horairesApi } from '@/lib/api'
import { Horaire } from '@/types'
import { RECEPTION_SRC } from '@/lib/images'

const SVC_PRINCIPAL = [
  { icon: 'fa-stethoscope', color: '#1641C8', bg: 'rgba(22,65,200,0.09)', title: 'Clinique Externe', desc: '12 spécialistes : chirurgie, neurologie, pédiatrie, gynécologie, ORL et plus.', link: '/specialites', cta: 'Voir les spécialistes' },
  { icon: 'fa-flask-vial', color: '#16a34a', bg: 'rgba(34,197,94,0.09)', title: 'Laboratoire', desc: 'Analyses complètes avec résultats envoyés automatiquement par WhatsApp et email.', link: '/services/laboratoire', cta: 'Prendre RDV labo' },
  { icon: 'fa-pills', color: '#d97706', bg: 'rgba(245,158,11,0.09)', title: 'Pharmacie', desc: 'Médicaments génériques et de marque, conseils pharmaceutiques personnalisés.', link: '/services/pharmacie', cta: 'Voir les produits' },
]

const SVC_INFO = [
  { icon: 'fa-tooth', label: 'Dentisterie' },
  { icon: 'fa-person-walking', label: 'Physiothérapie' },
  { icon: 'fa-glasses', label: 'Optométrie' },
  { icon: 'fa-scalpel', label: "Salle d'Opération (SOP)" },
  { icon: 'fa-baby', label: "Salle d'Accouchement" },
  { icon: 'fa-syringe', label: 'Gestes médicaux' },
]

const SPECS_PREVIEW = [
  { icon: 'fa-scalpel', label: 'Chirurgie générale', slug: 'chirurgie' },
  { icon: 'fa-brain', label: 'Neurologie', slug: 'neurologie' },
  { icon: 'fa-bone', label: 'Orthopédie', slug: 'orthopedie' },
  { icon: 'fa-child', label: 'Pédiatrie', slug: 'pediatrie' },
  { icon: 'fa-venus', label: 'Gynécologie', slug: 'gynecologie' },
  { icon: 'fa-heart-pulse', label: 'Médecine interne', slug: 'medecine-interne' },
]

export default function HomePage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [horaires, setHoraires] = useState<Horaire[]>([])

  useEffect(() => {
    horairesApi.list().then(r => setHoraires(r.data)).catch(() => {})
  }, [])

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-blobs">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        <div className="hero-left">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1641C8] text-xs font-bold px-4 py-2 rounded-full mb-7 border border-blue-100">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-blink" />
            Clinique certifiée · Haïti
          </div>
          <h1 className="hero-title">
            Votre santé,<br />
            <span className="hero-title-accent">notre engagement</span>
          </h1>
          <p className="hero-desc">
            La Clinique de la Rebecca offre des soins spécialisés de qualité,
            des consultations en ligne et un suivi personnalisé — pour toute la famille,
            avec chaleur et expertise médicale.
          </p>
          <div className="flex gap-4 flex-wrap mb-10">
            <button className="btn-primary btn-glow" onClick={() => setRdvOpen(true)}>
              <i className="fa-regular fa-calendar-check" /> Prendre rendez-vous
            </button>
            <Link href="/consultation" className="btn-secondary">
              <i className="fa-solid fa-video" /> Consultation en ligne
            </Link>
          </div>
          <div className="hero-stats">
            {[{ n: '12+', l: 'Spécialités' }, { n: '9', l: 'Services' }, { n: '7j/7', l: 'Disponibilité' }].map(s => (
              <div key={s.l} className="hero-stat-item">
                <div className="hero-stat-num">{s.n}</div>
                <div className="hero-stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-photo-wrap">
            <img src={RECEPTION_SRC} alt="Réception Clinique de la Rebecca" className="hero-photo"
              onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='700'%3E%3Crect width='600' height='700' fill='%23e8f0fe'/%3E%3C/svg%3E" }} />
            <div className="hero-float hero-float-top">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-lg flex-shrink-0">
                <i className="fa-solid fa-circle-check" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Accueil 7j/7</div>
                <div className="text-xs text-slate-400">07h00 – 17h00</div>
              </div>
            </div>
            <div className="hero-float hero-float-bottom">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#1641C8] text-lg flex-shrink-0">
                <i className="fa-solid fa-video" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Consultation vidéo</div>
                <div className="text-xs text-slate-400">Disponible en ligne</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-[5%] bg-white" id="services">
        <div className="text-center mb-14">
          <div className="section-tag"><i className="fa-solid fa-grid-2" /> Nos services</div>
          <h2 className="section-title">Une prise en charge <em>complète</em></h2>
          <p className="section-sub max-w-lg mx-auto">9 services médicaux sous un même toit pour toute la famille.</p>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-6">
          {SVC_PRINCIPAL.map(s => (
            <Link key={s.title} href={s.link}
              className="card p-7 cursor-pointer group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 no-underline border border-transparent hover:border-[#1641C8]/10">
              <div className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center text-xl mb-5 transition-transform group-hover:scale-110 duration-300" style={{ background: s.bg, color: s.color }}>
                <i className={`fa-solid ${s.icon}`} />
              </div>
              <h3 className="font-extrabold text-[17px] mb-2">{s.title}</h3>
              <p className="text-slate-500 text-[13.5px] leading-relaxed mb-4">{s.desc}</p>
              <span className="text-sm font-bold flex items-center gap-1.5 group-hover:gap-3 transition-all" style={{ color: s.color }}>
                {s.cta} <i className="fa-solid fa-arrow-right text-xs" />
              </span>
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mb-10">
          {SVC_INFO.map(s => (
            <div key={s.label} className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100 text-[13.5px] font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-[#1641C8] transition-all">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <i className={`fa-solid ${s.icon} text-[#1641C8]`} />
              </div>
              {s.label}
            </div>
          ))}
        </div>
        <div className="text-center">
          <button className="btn-primary" onClick={() => setRdvOpen(true)}>
            <i className="fa-regular fa-calendar-check" /> Prendre rendez-vous
          </button>
        </div>
      </section>

      {/* ── SPÉCIALITÉS + HORAIRES ────────────────────────────────────────── */}
      <section className="py-20 px-[5%] bg-slate-50 grid grid-cols-[1fr_320px] gap-12">
        <div>
          <div className="section-tag mb-3"><i className="fa-solid fa-user-doctor" /> Nos spécialités</div>
          <h2 className="section-title mb-8">Consultez un <em>spécialiste</em></h2>
          <div className="grid grid-cols-2 gap-3">
            {SPECS_PREVIEW.map(s => (
              <Link key={s.slug} href={`/specialites/${s.slug}`}
                className="flex items-center gap-3 bg-white hover:bg-blue-50 rounded-xl p-4 border border-slate-200 hover:border-[#1641C8] text-slate-700 hover:text-[#1641C8] font-semibold text-sm transition-all no-underline hover:-translate-y-0.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1641C8] flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${s.icon}`} />
                </div>
                {s.label}
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/specialites" className="btn-secondary inline-flex">
              Voir toutes les spécialités <i className="fa-solid fa-arrow-right ml-2 text-xs" />
            </Link>
          </div>
        </div>
        <div className="card p-6 h-fit sticky top-24 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-clock text-[#1641C8] text-sm" />
            </div>
            <div className="text-[12px] font-extrabold text-slate-700 uppercase tracking-widest">Horaires</div>
          </div>
          {[
            { j: 'Lundi', h: '07h00 – 17h00' }, { j: 'Mardi', h: '07h00 – 17h00' },
            { j: 'Mercredi', h: '07h00 – 17h00' }, { j: 'Jeudi', h: '07h00 – 17h00' },
            { j: 'Vendredi', h: '07h00 – 17h00' }, { j: 'Samedi', h: '07h00 – 17h00' },
            { j: 'Dimanche', h: '07h00 – 15h00' },
          ].map(h => (
            <div key={h.j} className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-[13px] mb-1.5">
              <span className="font-bold">{h.j}</span>
              <span className="font-extrabold text-[12px] text-green-600">{h.h}</span>
            </div>
          ))}
          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-blink" />
            <span className="text-xs font-bold text-green-700">Ouvert maintenant</span>
          </div>
        </div>
      </section>

      {/* ── AI ────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-[5%] bg-white grid grid-cols-[420px_1fr] gap-16 items-center">
        <AiChat />
        <div>
          <div className="section-tag"><i className="fa-solid fa-robot" /> Assistant IA</div>
          <h2 className="section-title">Rebecca, votre <em>assistante médicale</em></h2>
          <p className="section-sub mb-6">Disponible 24h/24 pour répondre à vos questions médicales et vous orienter.</p>
          <ul className="space-y-3">
            {[
              { icon: 'fa-comments', text: 'Répond à vos questions de santé instantanément' },
              { icon: 'fa-user-doctor', text: 'Vous oriente vers le bon spécialiste' },
              { icon: 'fa-calendar-plus', text: 'Aide à la prise de rendez-vous' },
            ].map(i => (
              <li key={i.icon} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#1641C8] flex-shrink-0">
                  <i className={`fa-solid ${i.icon} text-xs`} />
                </div>
                {i.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ───────────────────────────────────────────────────── */}
      <section className="py-20 px-[5%] bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center mb-14">
          <div className="section-tag"><i className="fa-solid fa-star" /> Témoignages</div>
          <h2 className="section-title">Ce que disent <em>nos patients</em></h2>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            { av: 'M', nom: 'Marie Théodore', svc: 'Gynécologie', txt: 'Service exceptionnel. Les médecins sont très professionnels et attentionnés. Je recommande vivement.' },
            { av: 'P', nom: 'Paul Jean-Baptiste', svc: 'Orthopédie', txt: 'La consultation en ligne est très pratique. Ordonnance reçue par email le même jour.' },
            { av: 'R', nom: 'Rose-Marie Étienne', svc: 'Pédiatrie', txt: 'Clinique moderne avec un personnel chaleureux. Le rappel WhatsApp 6h avant est très utile.' },
          ].map(t => (
            <div key={t.nom} className="card p-7 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="text-yellow-400 text-base mb-4">★★★★★</div>
              <p className="text-slate-600 text-[14px] leading-[1.75] mb-5 italic">"{t.txt}"</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-[#1641C8] flex items-center justify-center font-extrabold text-base">
                  {t.av}
                </div>
                <div>
                  <div className="font-extrabold text-[14px] text-slate-800">{t.nom}</div>
                  <div className="text-xs text-slate-400 font-medium">{t.svc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        <a href="https://wa.me/50938880000" target="_blank" rel="noreferrer"
          className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform">
          <i className="fa-brands fa-whatsapp" />
        </a>
        <button onClick={() => setRdvOpen(true)}
          className="w-14 h-14 rounded-full bg-[#1641C8] text-white flex items-center justify-center text-lg shadow-lg hover:scale-110 transition-transform border-none cursor-pointer">
          <i className="fa-regular fa-calendar-check" />
        </button>
      </div>
    </>
  )
}
