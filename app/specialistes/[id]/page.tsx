'use client'
// app/specialistes/[id]/page.tsx — Profil public spécialiste
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MEDECINS, nomComplet } from '@/lib/medecins'
import { api } from '@/lib/api'


export default function SpecialistePage() {
  const params = useParams()
  const id = Number(params.id)
  const [rdvOpen, setRdvOpen] = useState(false)
  // Get from single source of truth, try to enrich from API
  const baseDoc = MEDECINS.find(m => m.id === id)
  const [apiData, setApiData] = useState<any>(null)

  useEffect(() => {
    api.get('/specialistes').then(r => {
      const found = r.data?.find((d: any) =>
        d.email === baseDoc?.email ||
        d.nom?.toLowerCase().includes(baseDoc?.nom?.toLowerCase().split(' ')[0] || '')
      )
      if (found) setApiData(found)
    }).catch(() => {})
  }, [id])

  const doc = apiData ? {
    ...baseDoc,
    nom: apiData.nom?.replace(/^(Dr\.?|Mme\.?|Mr\.?|M\.?)\s*/i, '') || baseDoc?.nom,
    photo: apiData.photo || baseDoc?.photo,
    bio: apiData.description || baseDoc?.bio,
    telephone: apiData.telephone || baseDoc?.telephone,
  } : baseDoc
  const baseMedecin = MEDECINS.find(m => m.id === id) || null
  const [spec, setSpec] = useState<any>(baseMedecin ? {
    ...baseMedecin,
    nom: nomComplet(baseMedecin),
    tags: [],
    bio: baseMedecin.bio || '',
    experience: '',
    disponibilites: baseMedecin.disponibilites,
  } : null)

  useEffect(() => {
    if (id) {
      api.get(`/specialistes/${id}`)
        .then(r => setSpec((prev: any) => ({ ...prev, ...r.data, nom: prev?.nom })))
        .catch(() => {})
    }
  }, [id])

  if (!spec) return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <div className="min-h-screen flex items-center justify-center text-slate-400 pt-[70px]">
        Spécialiste introuvable
      </div>
    </>
  )

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> / <Link href="/specialites">Spécialités</Link> / <span>{spec.nom}</span>
        </div>
      </div>

      <div className="py-14 px-[5%] max-w-[900px] mx-auto">
        {/* Card profil */}
        <div className="card p-8 mb-8 shadow-lg">
          <div className="flex gap-8 items-start">
            <div className="w-[100px] h-[100px] rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-5xl flex-shrink-0 shadow-md">
              {spec.emoji}
            </div>
            <div className="flex-1">
              <h1 className="font-extrabold text-[26px] text-slate-800 mb-1">{spec.nom}</h1>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="badge-blue text-sm px-3 py-1">{spec.specialite}</span>
                {(spec as any).experience && <span className="badge-gray text-xs">{(spec as any).experience}</span>}
                <span className="text-yellow-400 text-sm">★★★★★</span>
              </div>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-5">{spec.bio || spec.description}</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {spec.tags?.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-50 text-[#1641C8] text-xs font-bold rounded-full border border-blue-100">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setRdvOpen(true)} className="btn-primary">
                  <i className="fa-regular fa-calendar-check"/> Prendre rendez-vous
                </button>
                <Link href="/consultation" className="btn-secondary">
                  <i className="fa-solid fa-video"/> Consultation vidéo
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-6">
          <div className="space-y-5">
            {/* Domaines d'expertise */}
            <div className="card p-6">
              <h3 className="font-extrabold text-[16px] mb-4 flex items-center gap-2">
                <i className="fa-solid fa-microscope text-[#1641C8]"/> Domaines d'expertise
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {spec.tags?.map(tag => (
                  <div key={tag} className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-semibold text-slate-700">
                    <i className="fa-solid fa-check text-green-500 text-xs"/> {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* Informations pratiques */}
            <div className="card p-6">
              <h3 className="font-extrabold text-[16px] mb-4 flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-[#1641C8]"/> Informations pratiques
              </h3>
              <div className="space-y-3">
                {[
                  { icon:'fa-clock', label:'Disponibilités', value:(spec as any).disponibilites || 'Lun–Ven 08h–17h' },
                  { icon:'fa-location-dot', label:'Lieu', value:'Clinique de la Rebecca, Haïti' },
                  { icon:'fa-language', label:'Langues', value:'Français · Créole haïtien' },
                  { icon:'fa-money-bill', label:'Consultation', value:'À partir de 1 500 HTG' },
                ].map(i => (
                  <div key={i.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#1641C8] flex-shrink-0 mt-0.5">
                      <i className={`fa-solid ${i.icon} text-xs`}/>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{i.label}</div>
                      <div className="font-semibold text-slate-700 text-sm">{i.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar : contact + RDV */}
          <div className="space-y-4">
            <div className="card p-5 border-2 border-[#1641C8]/10">
              <h4 className="font-extrabold text-[14px] mb-4">Prendre rendez-vous</h4>
              <button onClick={() => setRdvOpen(true)} className="btn-primary w-full justify-center mb-3">
                <i className="fa-regular fa-calendar-check"/> En personne
              </button>
              <Link href="/consultation" className="btn-secondary w-full justify-center text-sm no-underline inline-flex">
                <i className="fa-solid fa-video"/> Consultation vidéo
              </Link>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {spec.telephone && (
                  <a href={`https://wa.me/${spec.telephone.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 font-medium no-underline hover:text-green-700">
                    <i className="fa-brands fa-whatsapp text-green-500"/> {spec.telephone}
                  </a>
                )}
                {spec.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <i className="fa-solid fa-envelope"/> {spec.email}
                  </div>
                )}
              </div>
            </div>

            {/* Témoignages */}
            <div className="card p-5">
              <h4 className="font-extrabold text-[14px] mb-3">Avis patients</h4>
              {[
                { n:'M.T.', note:'★★★★★', txt:'Médecin très professionnel et à l\'écoute.' },
                { n:'P.J.', note:'★★★★★', txt:'Excellent suivi, je recommande vivement.' },
              ].map(a => (
                <div key={a.n} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-[#1641C8] flex items-center justify-center text-xs font-bold">{a.n}</div>
                    <span className="text-yellow-400 text-xs">{a.note}</span>
                  </div>
                  <p className="text-slate-500 text-xs italic leading-relaxed">"{a.txt}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
