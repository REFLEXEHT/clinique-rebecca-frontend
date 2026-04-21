'use client'
// app/page.tsx — Page d'accueil publique
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
  { icon: 'fa-stethoscope', color: '#1641C8', bg: 'rgba(22,65,200,0.09)',
    title: 'Clinique Externe', desc: '12 spécialistes : chirurgie, neurologie, pédiatrie, gynécologie, ORL et plus.',
    link: '/specialites', cta: 'Voir les spécialistes' },
  { icon: 'fa-flask-vial', color: '#16a34a', bg: 'rgba(34,197,94,0.09)',
    title: 'Laboratoire', desc: 'Analyses complètes avec résultats envoyés automatiquement par WhatsApp et email.',
    link: '/services/laboratoire', cta: 'Prendre RDV labo' },
  { icon: 'fa-pills', color: '#d97706', bg: 'rgba(245,158,11,0.09)',
    title: 'Pharmacie', desc: 'Médicaments génériques et de marque, conseils pharmaceutiques personnalisés.',
    link: '/services/pharmacie', cta: 'Voir les produits' },
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

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="min-h-screen grid grid-cols-2 items-center pt-[70px]
        bg-white gap-0 overflow-hidden">
        {/* Left */}
        <div className="px-[7%] py-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1641C8]
            text-xs font-bold px-3.5 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-blink" />
            Clinique certifiée · Haïti
          </div>

          <h1 className="font-serif text-[clamp(32px,3.8vw,50px)] font-bold
            leading-[1.15] text-slate-900 mb-4">
            Votre santé,<br />
            <em className="italic text-[#1641C8]">notre engagement</em>
          </h1>

          <p className="text-slate-500 text-[16px] leading-[1.7] mb-8 max-w-[450px]">
            La Clinique de la Rebecca offre des soins spécialisés de qualité,
            des consultations en ligne et un suivi personnalisé — pour toute la famille.
          </p>

          <div className="flex gap-3.5 flex-wrap mb-10">
            <button className="btn-primary" onClick={() => setRdvOpen(true)}>
              <i className="fa-regular fa-calendar-check" />
              Prendre rendez-vous
            </button>
            <Link href="/consultation" className="btn-secondary">
              <i className="fa-solid fa-video" />
              Consultation en ligne
            </Link>
          </div>

          <div className="flex gap-9">
            {[
              { n: '12+', l: 'Spécialités' },
              { n: '9', l: 'Services' },
              { n: '7j/7', l: 'Disponibilité' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-[26px] font-black text-[#1641C8] leading-none">{s.n}</div>
                <div className="text-xs text-slate-400 font-medium mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Clinic photo */}
        <div className="relative h-screen overflow-hidden flex items-center">
          <div className="hero-img-container w-full">
            <img src={RECEPTION_SRC} alt="Réception Clinique de la Rebecca" />
            <div className="hero-img-overlay">
              <p className="text-white text-sm font-semibold">Accueil — Clinique de la Rebecca</p>
              <p className="text-white/65 text-xs mt-1">Haïti · Soins de qualité</p>
            </div>
          </div>
          {/* Float cards */}
          <div className="hero-float-card animate-float top-[16%] right-[-16px]
            w-52 absolute">
            <div className="w-9 h-9 rounded-[9px] bg-blue-100 text-[#1641C8]
              flex items-center justify-center text-base flex-shrink-0">
              <i className="fa-solid fa-video" />
            </div>
            <div>
              <div className="text-[12.5px] font-extrabold">Consultation en ligne</div>
              <div className="text-[11px] text-slate-400">7j/7 disponible</div>
            </div>
          </div>
          <div className="hero-float-card animate-float-delay bottom-[24%] right-[-16px]
            w-48 absolute">
            <div className="w-9 h-9 rounded-[9px] bg-green-100 text-green-600
              flex items-center justify-center text-base flex-shrink-0">
              <i className="fa-brands fa-whatsapp" />
            </div>
            <div>
              <div className="text-[12.5px] font-extrabold">Résultats WhatsApp</div>
              <div className="text-[11px] text-slate-400">Envoi automatique</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════════════════ */}
      <section className="py-20 px-[5%] bg-slate-50" id="services">
        <div className="text-center mb-12">
          <div className="section-tag"><i className="fa-solid fa-grid-2" /> Nos services</div>
          <h2 className="section-title">Une prise en charge <em>complète</em></h2>
          <p className="section-sub max-w-lg mx-auto">
            9 services médicaux sous un même toit pour toute la famille.
          </p>
        </div>

        {/* 3 services principaux */}
        <div className="grid grid-cols-3 gap-5 mb-5">
          {SVC_PRINCIPAL.map(s => (
            <Link key={s.title} href={s.link}
              className="card p-7 cursor-pointer group relative overflow-hidden
              hover:-translate-y-1 hover:shadow-md hover:border-[#1641C8]/20
              transition-all duration-200 no-underline">
              <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl
                scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                style={{ background: s.color }} />
              <div className="w-[50px] h-[50px] rounded-[13px] flex items-center
                justify-center text-xl mb-4"
                style={{ background: s.bg, color: s.color }}>
                <i className={`fa-solid ${s.icon}`} />
              </div>
              <h3 className="font-extrabold text-[16px] mb-2">{s.title}</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-3">{s.desc}</p>
              <span className="text-sm font-bold flex items-center gap-1.5
                transition-all group-hover:gap-2.5"
                style={{ color: s.color }}>
                {s.cta} <i className="fa-solid fa-arrow-right text-xs" />
              </span>
            </Link>
          ))}
        </div>

        {/* 6 autres services — informatif seulement */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {SVC_INFO.map(s => (
            <div key={s.label} className="flex items-center gap-3 bg-white
              rounded-xl p-3.5 border border-slate-200 text-[13.5px] font-semibold
              text-slate-600">
              <i className={`fa-solid ${s.icon} text-[#1641C8] w-4.5 text-center`} />
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

      {/* ══ CONSULTATION CTA ══════════════════════════════════════════════ */}
      <section className="py-20 px-[5%] bg-gradient-to-br from-[#0f1e3d] to-[#1641C8]
        grid grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-green-500/15 text-green-400
            text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <i className="fa-solid fa-video" /> Téléconsultation
          </div>
          <h2 className="font-serif text-[clamp(26px,3vw,40px)] text-white font-bold
            leading-[1.2] mb-3">
            Consultez depuis <em className="italic text-[#93c5fd]">chez vous</em>
          </h2>
          <p className="text-white/70 text-[15.5px] leading-[1.7] mb-7">
            Prenez RDV en ligne, consultez par vidéo, recevez votre ordonnance.
            Patient et médecin notifiés automatiquement.
          </p>
          <div className="flex gap-3.5">
            <Link href="/consultation" className="btn-green">
              <i className="fa-solid fa-video" /> Démarrer
            </Link>
            <button className="btn-outline-white" onClick={() => setRdvOpen(true)}>
              <i className="fa-regular fa-calendar-check" /> RDV en personne
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {[
            { ic: 'fa-video', bg: 'rgba(22,65,200,0.25)', col: '#93c5fd',
              t: 'Vidéoconsultation sécurisée', d: 'Lien envoyé par WhatsApp 30 min avant.' },
            { ic: 'fa-bell', bg: 'rgba(34,197,94,0.2)', col: '#4ade80',
              t: 'Rappel automatique 6h avant', d: 'Patient ET médecin notifiés.' },
            { ic: 'fa-credit-card', bg: 'rgba(245,158,11,0.2)', col: '#fcd34d',
              t: 'Paiement en ligne sécurisé', d: 'Moncash, Natcash, carte ou virement.' },
          ].map(f => (
            <div key={f.t} className="flex gap-3.5 bg-white/5 border border-white/8
              rounded-xl p-4">
              <div className="w-9 h-9 rounded-[9px] flex items-center justify-center
                text-base flex-shrink-0" style={{ background: f.bg, color: f.col }}>
                <i className={`fa-solid ${f.ic}`} />
              </div>
              <div>
                <h4 className="text-white font-extrabold text-sm mb-0.5">{f.t}</h4>
                <p className="text-white/55 text-xs leading-[1.5]">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HORAIRES + SPECSPREVIEW ═══════════════════════════════════════ */}
      <section className="py-20 px-[5%] bg-white grid grid-cols-[1fr_300px] gap-12">
        <div>
          <div className="section-tag mb-3">
            <i className="fa-solid fa-user-doctor" /> Nos spécialités
          </div>
          <h2 className="section-title mb-8">Consultez un <em>spécialiste</em></h2>
          <div className="grid grid-cols-3 gap-3">
            {SPECS_PREVIEW.map(s => (
              <Link key={s.slug} href={`/specialites/${s.slug}`}
                className="flex items-center gap-3 bg-slate-50 hover:bg-blue-50
                  rounded-xl p-4 border border-slate-200 hover:border-[#1641C8]
                  text-slate-700 hover:text-[#1641C8] font-semibold text-sm
                  transition-all no-underline hover:-translate-y-0.5">
                <div className="w-9 h-9 rounded-[9px] bg-blue-100 text-[#1641C8]
                  flex items-center justify-center flex-shrink-0 text-base">
                  <i className={`fa-solid ${s.icon}`} />
                </div>
                {s.label}
              </Link>
            ))}
          </div>
          <div className="mt-5">
            <Link href="/specialites" className="text-sm font-bold text-[#1641C8]
              hover:underline flex items-center gap-1.5">
              Voir les 12 spécialités <i className="fa-solid fa-arrow-right text-xs" />
            </Link>
          </div>
        </div>

        {/* Horaires */}
        <div className="card p-5 h-fit sticky top-24">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Horaires d'ouverture
          </div>
          {horaires.length === 0 ? (
            // Fallback statique
            [
              { j: 'Lundi', h: '07h00 – 17h00', open: true },
              { j: 'Mardi', h: '07h00 – 17h00', open: true },
              { j: 'Mercredi', h: '07h00 – 17h00', open: true },
              { j: 'Jeudi', h: '07h00 – 17h00', open: true },
              { j: 'Vendredi', h: '07h00 – 17h00', open: true },
              { j: 'Samedi', h: '07h00 – 17h00', open: true },
              { j: 'Dimanche', h: '07h00 – 15h00', open: true },
            ].map(h => (
              <div key={h.j} className="flex justify-between items-center px-3 py-2
                rounded-lg bg-slate-50 border border-slate-100 text-[13px] mb-1.5">
                <span className="font-bold flex items-center gap-2">
                  <i className={`fa-regular fa-sun text-orange-400 text-xs`} />
                  {h.j}
                </span>
                <span className="font-extrabold text-[12px] text-green-600">{h.h}</span>
              </div>
            ))
          ) : (
            horaires.map(h => (
              <div key={h.jour} className="flex justify-between items-center px-3 py-2
                rounded-lg bg-slate-50 border border-slate-100 text-[13px] mb-1.5">
                <span className="font-bold flex items-center gap-2">
                  <i className={`fa-regular ${h.ouvert ? 'fa-sun text-orange-400' : 'fa-moon text-slate-400'} text-xs`} />
                  {h.jour}
                </span>
                <span className={`font-extrabold text-[12px] ${h.ouvert ? 'text-green-600' : 'text-slate-400'}`}>
                  {h.ouvert ? `${h.heure_ouverture} – ${h.heure_fermeture}` : 'Fermé'}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ══ AI CHAT ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-[5%] bg-slate-50 grid grid-cols-[420px_1fr] gap-12 items-center">
        <AiChat />
        <div>
          <div className="section-tag"><i className="fa-solid fa-robot" /> Assistant IA</div>
          <h2 className="section-title">Rebecca, votre <em>assistante médicale</em></h2>
          <p className="section-sub mb-7">Disponible 24h/24 pour répondre à vos questions.</p>
          <div className="space-y-4">
            {[
              { n: '1', c: '#1641C8', t: 'Orientation médicale', d: "Décrivez vos symptômes — Rebecca vous oriente." },
              { n: '2', c: '#22c55e', t: 'Prise de rendez-vous', d: 'Réservez avec le bon médecin.' },
              { n: '3', c: '#d97706', t: 'Résultats de labo', d: 'Vérifiez la disponibilité de vos résultats.' },
              { n: '4', c: '#be185d', t: 'Informations clinique', d: 'Horaires, services, spécialistes.' },
            ].map(f => (
              <div key={f.t} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center
                  text-[13px] font-extrabold text-white flex-shrink-0"
                  style={{ background: f.c }}>{f.n}</div>
                <div>
                  <h4 className="font-extrabold text-sm mb-0.5">{f.t}</h4>
                  <p className="text-slate-500 text-[13px]">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═════════════════════════════════════════════════ */}
      <section className="py-20 px-[5%] bg-white">
        <div className="text-center mb-12">
          <div className="section-tag"><i className="fa-solid fa-star" /> Témoignages</div>
          <h2 className="section-title">Ce que disent <em>nos patients</em></h2>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {[
            { av: 'M', nom: 'Marie Théodore', svc: 'Gynécologie',
              txt: '"Service exceptionnel. Les médecins sont très professionnels et attentionnés. J\'ai reçu mes résultats de laboratoire sur WhatsApp en moins de 2 heures."' },
            { av: 'P', nom: 'Paul Jean-Baptiste', svc: 'Orthopédie',
              txt: '"La consultation en ligne est très pratique. J\'ai pu voir un spécialiste depuis mon domicile et recevoir mon ordonnance par email le même jour."' },
            { av: 'R', nom: 'Rose-Marie Étienne', svc: 'Pédiatrie',
              txt: '"Clinique moderne avec un personnel chaleureux. Le système de rappel par WhatsApp est très utile pour ne pas oublier ses rendez-vous."' },
          ].map(t => (
            <div key={t.nom} className="card p-7">
              <div className="text-yellow-400 text-sm mb-3 tracking-widest">★★★★★</div>
              <p className="text-slate-500 text-sm leading-[1.7] mb-4 italic">{t.txt}</p>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1641C8]
                  flex items-center justify-center font-bold text-base">
                  {t.av}
                </div>
                <div>
                  <div className="font-bold text-[13.5px]">{t.nom}</div>
                  <div className="text-xs text-slate-400">{t.svc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CONTACT ══════════════════════════════════════════════════════ */}
      <section className="py-16 px-[5%] bg-slate-50">
        <div className="mb-8">
          <div className="section-tag"><i className="fa-solid fa-location-dot" /> Contact</div>
          <h2 className="section-title">Nous sommes <em>là pour vous</em></h2>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          {[
            { ic: 'fa-phone', bg: 'rgba(22,65,200,0.09)', col: '#1641C8', t: 'Téléphone', v: '+509 3888-0000', s: 'Standard — Lun à Dim' },
            { ic: 'fa-brands fa-whatsapp', bg: 'rgba(34,197,94,0.09)', col: '#16a34a', t: 'WhatsApp', v: '+509 3888-0000', s: 'Résultats, suivi, questions' },
            { ic: 'fa-envelope', bg: 'rgba(34,197,94,0.09)', col: '#16a34a', t: 'Email', v: 'contact@cliniquerebecca.ht', s: 'Dossiers, documents' },
            { ic: 'fa-location-dot', bg: 'rgba(245,158,11,0.09)', col: '#d97706', t: 'Localisation', v: 'Clinique de la Rebecca', s: 'Haïti' },
          ].map(c => (
            <div key={c.t} className="card-hover flex gap-3.5 p-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center
                text-[18px] flex-shrink-0" style={{ background: c.bg, color: c.col }}>
                <i className={`fa-solid ${c.ic}`} />
              </div>
              <div>
                <div className="font-extrabold text-sm mb-0.5">{c.t}</div>
                <div className="text-[#1641C8] font-bold text-[13px]">{c.v}</div>
                <div className="text-slate-400 text-xs">{c.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      {/* Float buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 items-end">
        <a href="https://wa.me/50938880000" target="_blank" rel="noreferrer"
          className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center
            justify-center text-xl shadow-lg hover:scale-110 transition-transform">
          <i className="fa-brands fa-whatsapp" />
        </a>
        <button onClick={() => setRdvOpen(true)}
          className="w-12 h-12 rounded-full bg-[#1641C8] text-white flex items-center
            justify-center text-lg shadow-lg hover:scale-110 transition-transform border-none">
          <i className="fa-regular fa-calendar-check" />
        </button>
      </div>
    </>
  )
}
