'use client'
// app/specialites/page.tsx — Liste des spécialités — design humain et chaleureux
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { useState } from 'react'

const SPECIALITES = [
  {
    slug: 'chirurgie',
    label: 'Chirurgie générale',
    icon: 'fa-scalpel',
    desc: 'Chirurgie digestive, laparoscopie, urgences chirurgicales',
    medecins: 3,
    color: '#1641C8',
    bg: 'rgba(22,65,200,0.07)',
  },
  {
    slug: 'neurochirurgie',
    label: 'Neurochirurgie',
    icon: 'fa-brain',
    desc: 'Tumeurs cérébrales, chirurgie de la colonne vertébrale',
    medecins: 2,
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.07)',
  },
  {
    slug: 'neurologie',
    label: 'Neurologie',
    icon: 'fa-brain',
    desc: 'Épilepsie, AVC, sclérose en plaques',
    medecins: 2,
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.07)',
  },
  {
    slug: 'orthopedie',
    label: 'Orthopédie',
    icon: 'fa-bone',
    desc: 'Traumatologie, prothèse de hanche, arthroscopie',
    medecins: 2,
    color: '#d97706',
    bg: 'rgba(217,119,6,0.07)',
  },
  {
    slug: 'pediatrie',
    label: 'Pédiatrie',
    icon: 'fa-child',
    desc: 'Soins nourrissons, enfants et adolescents',
    medecins: 3,
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.07)',
  },
  {
    slug: 'dermatologie',
    label: 'Dermatologie',
    icon: 'fa-hand-dots',
    desc: 'Eczéma, psoriasis, dermatologie cosmétique',
    medecins: 1,
    color: '#db2777',
    bg: 'rgba(219,39,119,0.07)',
  },
  {
    slug: 'urologie',
    label: 'Urologie',
    icon: 'fa-kidneys',
    desc: 'Prostate, lithiase urinaire, fertilité masculine',
    medecins: 1,
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.07)',
  },
  {
    slug: 'orl',
    label: 'ORL',
    icon: 'fa-ear-listen',
    desc: 'Sinusite, surdité, chirurgie ORL',
    medecins: 1,
    color: '#059669',
    bg: 'rgba(5,150,105,0.07)',
  },
  {
    slug: 'gynecologie',
    label: 'Gynécologie',
    icon: 'fa-venus',
    desc: 'Suivi grossesse, accouchement, santé féminine',
    medecins: 3,
    color: '#db2777',
    bg: 'rgba(219,39,119,0.07)',
  },
  {
    slug: 'chir-ped',
    label: 'Chirurgie pédiatrique',
    icon: 'fa-child-reaching',
    desc: 'Chirurgie néonatale, hernies, appendicite pédiatrique',
    medecins: 1,
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.07)',
  },
  {
    slug: 'medecine-interne',
    label: 'Médecine interne',
    icon: 'fa-heart-pulse',
    desc: 'Diabète, hypertension, maladies chroniques',
    medecins: 2,
    color: '#e11d48',
    bg: 'rgba(225,29,72,0.07)',
  },
  {
    slug: 'ophtalmologie',
    label: 'Ophtalmologie',
    icon: 'fa-eye',
    desc: 'Cataracte, glaucome, chirurgie oculaire',
    medecins: 1,
    color: '#1641C8',
    bg: 'rgba(22,65,200,0.07)',
  },
]

const STATS = [
  { n: '12', label: 'Spécialités', icon: 'fa-stethoscope' },
  { n: '22+', label: 'Spécialistes', icon: 'fa-user-doctor' },
  { n: '7j/7', label: 'Disponibilité', icon: 'fa-clock' },
  { n: '15+', label: 'Années d\'expérience', icon: 'fa-award' },
]

export default function SpecialitesPage() {
  const [rdvOpen, setRdvOpen] = useState(false)

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ── EN-TÊTE HUMAINE ────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0f1e3d 0%, #1641C8 100%)' }}
        className="pt-[110px] pb-16 px-[5%] text-white relative overflow-hidden">

        {/* Formes douces de fond */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
            top: -100, right: '10%',
          }} />
          <div style={{
            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
            bottom: -50, left: '20%',
          }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <nav className="flex items-center gap-2 justify-center text-sm text-white/50 mb-6">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white/80">Spécialités</span>
          </nav>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Des médecins qui prennent<br />
            <span className="italic text-blue-200">soin de vous</span>
          </h1>
          <p className="text-white/65 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Chaque patient mérite une attention particulière. Nos 22 spécialistes vous accueillent
            dans un environnement humain, moderne et bienveillant.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/10 border border-white/15 rounded-2xl py-4 px-3 backdrop-blur-sm">
                <div className="text-2xl font-extrabold text-white mb-1">{s.n}</div>
                <div className="text-white/60 text-xs font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INTRO HUMAINE ──────────────────────────────────────────────── */}
      <div className="bg-blue-50 border-b border-blue-100 py-8 px-[5%]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-slate-600 text-[15px] leading-relaxed">
            Que vous veniez pour un suivi, une urgence, ou une consultation de prévention,
            nos équipes sont formées pour vous écouter, vous expliquer et vous accompagner
            à chaque étape de votre parcours de santé.
          </p>
        </div>
      </div>

      {/* ── GRILLE DES SPÉCIALITÉS ─────────────────────────────────────── */}
      <div className="py-16 px-[5%] bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SPECIALITES.map(s => (
            <Link
              key={s.slug}
              href={`/specialites/${s.slug}`}
              className="group block rounded-2xl border border-slate-200 bg-white p-6 no-underline
                transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-opacity-50"
              style={{ '--hover-border': s.color } as any}
            >
              {/* Icône */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl mb-4
                  transition-transform duration-300 group-hover:scale-110"
                style={{ background: s.bg, color: s.color }}
              >
                <i className={`fa-solid ${s.icon}`} />
              </div>

              {/* Contenu */}
              <h3 className="font-extrabold text-[16px] text-slate-900 mb-2 group-hover:text-[#1641C8] transition-colors">
                {s.label}
              </h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-4">{s.desc}</p>

              {/* Footer card */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">
                  <i className="fa-solid fa-user-doctor mr-1" />
                  {s.medecins} médecin{s.medecins > 1 ? 's' : ''}
                </span>
                <span
                  className="text-sm font-bold flex items-center gap-1.5 transition-all group-hover:gap-3"
                  style={{ color: s.color }}
                >
                  Consulter <i className="fa-solid fa-arrow-right text-xs" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CTA BAS DE PAGE ────────────────────────────────────────────── */}
      <div className="py-16 px-[5%] bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 text-[#1641C8] text-2xl">
            <i className="fa-regular fa-calendar-check" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-800 mb-3">
            Prêt à prendre rendez-vous ?
          </h2>
          <p className="text-slate-500 text-[15px] mb-7 leading-relaxed">
            Nos équipes sont disponibles du lundi au dimanche pour vous accueillir.
            Consultation en personne ou par vidéo depuis chez vous.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              className="btn-primary"
              onClick={() => setRdvOpen(true)}
            >
              <i className="fa-regular fa-calendar-check" /> Prendre un rendez-vous
            </button>
            <Link href="/consultation" className="btn-secondary">
              <i className="fa-solid fa-video" /> Consultation en ligne
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
