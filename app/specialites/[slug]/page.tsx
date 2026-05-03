'use client'
// app/specialites/[slug]/page.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { api } from '@/lib/api'
import { Specialiste } from '@/types'

const SPEC_META: Record<string, { label: string; icon: string; desc: string }> = {
  chirurgie: { label: 'Chirurgie générale', icon: 'fa-scalpel', desc: 'Chirurgiens experts en interventions complexes' },
  neurochirurgie: { label: 'Neurochirurgie', icon: 'fa-brain', desc: 'Spécialistes en neurochirurgie adulte et pédiatrique' },
  neurologie: { label: 'Neurologie', icon: 'fa-brain', desc: 'Traitement des maladies du système nerveux' },
  orthopedie: { label: 'Orthopédie', icon: 'fa-bone', desc: 'Traumatologie et chirurgie osseuse' },
  pediatrie: { label: 'Pédiatrie', icon: 'fa-child', desc: 'Soins dédiés aux enfants de la naissance à 18 ans' },
  dermatologie: { label: 'Dermatologie', icon: 'fa-hand-dots', desc: 'Maladies de peau et dermatologie cosmétique' },
  urologie: { label: 'Urologie', icon: 'fa-kidneys', desc: 'Affections du système urinaire et reproducteur masculin' },
  orl: { label: 'ORL', icon: 'fa-ear-listen', desc: 'Oreille, nez, gorge et chirurgie cervicale' },
  gynecologie: { label: 'Gynécologie', icon: 'fa-venus', desc: 'Santé féminine et suivi de grossesse' },
  'chir-ped': { label: 'Chirurgie pédiatrique', icon: 'fa-child-reaching', desc: 'Chirurgie spécialisée pour nourrissons et enfants' },
  'medecine-interne': { label: 'Médecine interne', icon: 'fa-heart-pulse', desc: 'Maladies chroniques et pathologies complexes' },
  ophtalmologie: { label: 'Ophtalmologie', icon: 'fa-eye', desc: 'Chirurgie oculaire et maladies de l\'œil' },
}

// Données de fallback si l'API n'est pas disponible
const SPECS_STATIC: Record<string, Specialiste[]> = {
  chirurgie: [{ id:1, nom:'Dr. Michel Dubois', specialite:'Chirurgie générale', description:'Chirurgien senior, 15 ans d\'expérience. Spécialisé en chirurgie digestive et laparoscopie.', emoji:'🔬', categorie:'chirurgie', email:'m.dubois@cliniquerebecca.ht', telephone:'+509 3456-0001', actif:true, ordre:0 }],
  gynecologie: [{ id:9, nom:'Dr. Claudette Joseph', specialite:'Gynécologie', description:'Gynécologue-obstétricienne. Suivi grossesse et santé féminine.', emoji:'🌺', categorie:'gynecologie', email:'c.joseph@cliniquerebecca.ht', telephone:'+509 3456-0009', actif:true, ordre:0 }],
  pediatrie: [{ id:5, nom:'Dr. Paul Désir', specialite:'Pédiatrie', description:'Pédiatre spécialisé en néonatologie et pédiatrie générale.', emoji:'👶', categorie:'pediatrie', email:'p.desir@cliniquerebecca.ht', telephone:'+509 3456-0005', actif:true, ordre:0 }],
}

export default function SpecialitePage() {
  const params = useParams()
  const slug = params.slug as string
  const [rdvOpen, setRdvOpen] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState('')
  const [specs, setSpecs] = useState<Specialiste[]>([])
  const [loading, setLoading] = useState(true)

  const meta = SPEC_META[slug] || { label: slug, icon: 'fa-user-doctor', desc: '' }

  useEffect(() => {
    setLoading(true)
    api.list(slug)
      .then(r => setSpecs(r.data))
      .catch(() => setSpecs(SPECS_STATIC[slug] || []))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} defaultSpec={selectedSpec || meta.label} />

      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> /
          <Link href="/specialites">Spécialités</Link> /
          <span>{meta.label}</span>
        </div>
        <h1>{meta.label}</h1>
        <p>{meta.desc}</p>
      </div>

      <div className="py-14 px-[5%]">
        {loading ? (
          <div className="grid grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : specs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <i className="fa-solid fa-user-doctor text-5xl mb-4 block opacity-20" />
            <p className="text-lg font-medium">Aucun spécialiste disponible pour cette spécialité.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-5">
            {specs.map(s => (
              <Link key={s.id} href={`/specialistes/${s.id}`}
                className="spec-card no-underline">
                <div className="spec-card-photo text-5xl">{s.emoji}</div>
                <div className="p-4">
                  <h4 className="font-extrabold text-[14.5px] text-slate-900 mb-0.5">{s.nom}</h4>
                  <div className="text-[#1641C8] text-[12px] font-bold mb-1.5">{s.specialite}</div>
                  {s.description && (
                    <p className="text-slate-400 text-xs leading-[1.5] mb-3 line-clamp-2">{s.description}</p>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); setSelectedSpec(s.specialite); setRdvOpen(true) }}
                    className="w-full py-2 rounded-full bg-blue-50 text-[#1641C8]
                      text-xs font-bold hover:bg-[#1641C8] hover:text-white
                      transition-all border-none cursor-pointer">
                    Prendre RDV
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
