'use client'
// app/specialites/page.tsx — Liste de toutes les spécialités
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { useState } from 'react'

const SPECIALITES = [
  { slug: 'chirurgie', label: 'Chirurgie générale', icon: 'fa-scalpel', desc: 'Chirurgie digestive, laparoscopie, urgences chirurgicales' },
  { slug: 'neurochirurgie', label: 'Neurochirurgie', icon: 'fa-brain', desc: 'Tumeurs cérébrales, chirurgie de la colonne vertébrale' },
  { slug: 'neurologie', label: 'Neurologie', icon: 'fa-brain', desc: 'Épilepsie, AVC, sclérose en plaques' },
  { slug: 'orthopedie', label: 'Orthopédie', icon: 'fa-bone', desc: 'Traumatologie, prothèse de hanche, arthroscopie' },
  { slug: 'pediatrie', label: 'Pédiatrie', icon: 'fa-child', desc: 'Soins nourrissons, enfants et adolescents' },
  { slug: 'dermatologie', label: 'Dermatologie', icon: 'fa-hand-dots', desc: 'Eczéma, psoriasis, dermatologie cosmétique' },
  { slug: 'urologie', label: 'Urologie', icon: 'fa-kidneys', desc: 'Prostate, lithiase urinaire, fertilité masculine' },
  { slug: 'orl', label: 'ORL', icon: 'fa-ear-listen', desc: 'Sinusite, surdité, chirurgie ORL' },
  { slug: 'gynecologie', label: 'Gynécologie', icon: 'fa-venus', desc: 'Suivi grossesse, accouchement, santé féminine' },
  { slug: 'chir-ped', label: 'Chirurgie pédiatrique', icon: 'fa-child-reaching', desc: 'Chirurgie néonatale, hernies, appendicite pédiatrique' },
  { slug: 'medecine-interne', label: 'Médecine interne', icon: 'fa-heart-pulse', desc: 'Diabète, hypertension, maladies chroniques' },
  { slug: 'ophtalmologie', label: 'Ophtalmologie', icon: 'fa-eye', desc: 'Cataracte, glaucome, chirurgie oculaire' },
]

export default function SpecialitesPage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />
      <div className="page-header">
        <div className="breadcrumb"><Link href="/">Accueil</Link> / <span>Spécialités</span></div>
        <h1>Nos 12 spécialités</h1>
        <p>Des médecins experts à votre service dans toutes les disciplines médicales</p>
      </div>
      <div className="py-16 px-[5%]">
        <div className="grid grid-cols-3 gap-5">
          {SPECIALITES.map(s => (
            <Link key={s.slug} href={`/specialites/${s.slug}`}
              className="card-hover p-6 no-underline cursor-pointer block">
              <div className="w-12 h-12 rounded-[13px] bg-blue-50 text-[#1641C8]
                flex items-center justify-center text-xl mb-4">
                <i className={`fa-solid ${s.icon}`} />
              </div>
              <h3 className="font-extrabold text-[16px] mb-2 text-slate-900">{s.label}</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-3">{s.desc}</p>
              <span className="text-sm font-bold text-[#1641C8] flex items-center gap-1.5">
                Voir les spécialistes <i className="fa-solid fa-arrow-right text-xs" />
              </span>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}
