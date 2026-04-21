'use client'
// app/specialistes/[id]/page.tsx — Profil public du spécialiste
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'
import { Specialiste } from '@/types'

// Données statiques enrichies (fallback)
const SPECS_DATA: Record<number, Specialiste & { tags: string[]; bio: string }> = {
  1: { id:1, nom:'Dr. Michel Dubois', specialite:'Chirurgie générale', description:'Chirurgien senior', emoji:'🔬', categorie:'chirurgie', email:'m.dubois@cliniquerebecca.ht', telephone:'+509 3456-0001', actif:true, ordre:0, bio:'Spécialiste en chirurgie générale et digestive avec plus de 15 ans d\'expérience dans les interventions chirurgicales complexes. Formé à Paris et Port-au-Prince.', tags:['Chirurgie digestive','Laparoscopie','Urgences chirurgicales'] },
  2: { id:2, nom:'Dr. Anne-Marie Pierre', specialite:'Neurochirurgie', description:'Neurochirurgie pédiatrique', emoji:'🧠', categorie:'neurochirurgie', email:'am.pierre@cliniquerebecca.ht', telephone:'+509 3456-0002', actif:true, ordre:0, bio:'Experte en neurochirurgie pédiatrique et adulte. Spécialisée dans le traitement des tumeurs cérébrales et de la colonne vertébrale.', tags:['Tumeurs cérébrales','Colonne vertébrale','Neurochirurgie pédiatrique'] },
  3: { id:3, nom:'Dr. Jean-Claude Étienne', specialite:'Neurologie', description:'Épilepsie, AVC', emoji:'🧬', categorie:'neurologie', email:'jc.etienne@cliniquerebecca.ht', telephone:'+509 3456-0003', actif:true, ordre:0, bio:'Neurologue expérimenté spécialisé dans le traitement de l\'épilepsie, des accidents vasculaires cérébraux et des maladies démyélinisantes.', tags:['Épilepsie','AVC','Sclérose en plaques'] },
  4: { id:4, nom:'Dr. Sophie Lamour', specialite:'Orthopédie', description:'Traumatologie', emoji:'🦴', categorie:'orthopedie', email:'s.lamour@cliniquerebecca.ht', telephone:'+509 3456-0004', actif:true, ordre:0, bio:'Orthopédiste spécialisée en traumatologie et chirurgie prothétique. Prise en charge des fractures complexes et des arthroses sévères.', tags:['Prothèse de hanche','Fractures','Arthroscopie'] },
  5: { id:5, nom:'Dr. Paul Désir', specialite:'Pédiatrie', description:'Néonatologie', emoji:'👶', categorie:'pediatrie', email:'p.desir@cliniquerebecca.ht', telephone:'+509 3456-0005', actif:true, ordre:0, bio:'Pédiatre dévoué spécialisé en néonatologie et pédiatrie générale. Prise en charge des nourrissons et adolescents.', tags:['Néonatologie','Pédiatrie générale','Vaccinations'] },
  6: { id:6, nom:'Dr. Isabelle François', specialite:'Dermatologie', description:'Maladies de peau', emoji:'🌸', categorie:'dermatologie', email:'i.francois@cliniquerebecca.ht', telephone:'+509 3456-0006', actif:true, ordre:0, bio:'Dermatologue spécialisée dans les maladies inflammatoires de la peau, les infections cutanées et la dermatologie cosmétique.', tags:['Eczéma','Psoriasis','Dermatologie cosmétique'] },
  7: { id:7, nom:'Dr. Henri Nazaire', specialite:'Urologie', description:'Prostate, système urinaire', emoji:'💊', categorie:'urologie', email:'h.nazaire@cliniquerebecca.ht', telephone:'+509 3456-0007', actif:true, ordre:0, bio:'Urologue expérimenté. Traitement des affections du système urinaire, la prostate et les troubles de la fertilité masculine.', tags:['Prostate','Lithiase urinaire','Fertilité masculine'] },
  8: { id:8, nom:'Dr. Marie-Rose Cajuste', specialite:'ORL', description:'Oreille, nez, gorge', emoji:'👂', categorie:'orl', email:'mr.cajuste@cliniquerebecca.ht', telephone:'+509 3456-0008', actif:true, ordre:0, bio:'Spécialiste en oto-rhino-laryngologie. Prise en charge des pathologies de l\'oreille, du nez, de la gorge et de la voix.', tags:['Sinusite','Surdité','Chirurgie ORL'] },
  9: { id:9, nom:'Dr. Claudette Joseph', specialite:'Gynécologie', description:'Suivi grossesse', emoji:'🌺', categorie:'gynecologie', email:'c.joseph@cliniquerebecca.ht', telephone:'+509 3456-0009', actif:true, ordre:0, bio:'Gynécologue-obstétricienne assurant le suivi de grossesse, les accouchements et la santé reproductive de la femme.', tags:['Grossesse','Accouchement','Santé reproductive'] },
  10: { id:10, nom:'Dr. Patrick Dorival', specialite:'Chirurgie pédiatrique', description:'Chirurgie nourrissons', emoji:'🏥', categorie:'chir-ped', email:'p.dorival@cliniquerebecca.ht', telephone:'+509 3456-0010', actif:true, ordre:0, bio:'Chirurgien pédiatrique spécialisé dans les interventions chez les nourrissons et les jeunes enfants.', tags:['Chirurgie néonatale','Hernies','Appendicite pédiatrique'] },
  11: { id:11, nom:'Dr. Réginald Louis', specialite:'Médecine interne', description:'Diabète, hypertension', emoji:'❤️', categorie:'medecine-interne', email:'r.louis@cliniquerebecca.ht', telephone:'+509 3456-0011', actif:true, ordre:0, bio:'Interniste expérimenté. Prise en charge des maladies chroniques complexes incluant le diabète, l\'hypertension et les maladies auto-immunes.', tags:['Diabète','Hypertension','Maladies auto-immunes'] },
  12: { id:12, nom:'Dr. Nathalie Vincent', specialite:'Ophtalmologie', description:'Chirurgie oculaire', emoji:'👁️', categorie:'ophtalmologie', email:'n.vincent@cliniquerebecca.ht', telephone:'+509 3456-0012', actif:true, ordre:0, bio:'Ophtalmologue spécialisée en chirurgie de la cataracte, du glaucome et des pathologies rétiniennes.', tags:['Cataracte','Glaucome','Rétine'] },
}

const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
const HEURES_RDV = ['07h-17h','07h-17h','07h-17h','07h-17h','07h-17h','07h-13h','07h-15h']

export default function SpecialistePage() {
  const params = useParams()
  const id = Number(params.id)
  const [rdvOpen, setRdvOpen] = useState(false)
  const [spec, setSpec] = useState(SPECS_DATA[id] || null)

  useEffect(() => {
    if (id) {
      specialistesApi.getById(id)
        .then(r => setSpec({ ...r.data, tags: SPECS_DATA[id]?.tags || [], bio: SPECS_DATA[id]?.bio || r.data.description || '' }))
        .catch(() => setSpec(SPECS_DATA[id] || null))
    }
  }, [id])

  if (!spec) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      Spécialiste introuvable
    </div>
  )

  const slugMap: Record<string, string> = {
    chirurgie:'chirurgie', neurochirurgie:'neurochirurgie', neurologie:'neurologie',
    orthopedie:'orthopedie', pediatrie:'pediatrie', dermatologie:'dermatologie',
    urologie:'urologie', orl:'orl', gynecologie:'gynecologie',
    'chir-ped':'chir-ped', 'medecine-interne':'medecine-interne', ophtalmologie:'ophtalmologie'
  }

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} defaultSpec={spec.specialite} />

      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> /
          <Link href="/specialites">Spécialités</Link> /
          <Link href={`/specialites/${spec.categorie}`}>{spec.specialite}</Link> /
          <span>{spec.nom}</span>
        </div>
        <h1>{spec.nom}</h1>
        <p>{spec.specialite}</p>
      </div>

      <div className="py-14 px-[5%] max-w-5xl mx-auto">
        {/* Profile header */}
        <div className="grid grid-cols-[240px_1fr] gap-10 card p-8 mb-6">
          <div className="text-center">
            <div className="w-44 h-44 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50
              border-2 border-slate-200 flex items-center justify-center text-7xl mx-auto mb-3">
              {spec.emoji}
            </div>
            <div className="badge badge-green">
              <i className="fa-solid fa-circle text-[8px]" /> Disponible
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold mb-1">{spec.nom}</h1>
            <div className="text-[#1641C8] text-[16px] font-bold mb-4">{spec.specialite}</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {(spec as any).tags?.map((t: string) => (
                <span key={t} className="px-3 py-1 rounded-full text-[12.5px] font-semibold
                  bg-blue-50 text-[#1641C8]">{t}</span>
              ))}
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-5 max-w-lg">
              {(spec as any).bio || spec.description}
            </p>
            <div className="flex gap-3">
              <button className="btn-primary" onClick={() => setRdvOpen(true)}>
                <i className="fa-regular fa-calendar-check" /> Prendre rendez-vous
              </button>
              <Link href="/consultation" className="btn-secondary">
                <i className="fa-solid fa-video" /> Consultation en ligne
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { n: '15+', l: "Années d'expérience", c: '#1641C8' },
            { n: '500+', l: 'Patients traités', c: '#22c55e' },
            { n: '4.9/5', l: 'Note moyenne', c: '#f59e0b' },
          ].map(s => (
            <div key={s.l} className="card p-5 text-center">
              <div className="text-3xl font-black mb-1.5" style={{ color: s.c }}>{s.n}</div>
              <div className="text-slate-500 text-sm font-semibold">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Horaires */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-[15px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-clock text-[#1641C8] text-sm" />
            Horaires de consultation
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {JOURS.map((j, i) => (
              <div key={j} className={`text-center py-2.5 px-2 rounded-lg text-xs font-bold
                ${i < 5 ? 'bg-green-100 text-green-700' : i === 5 ? 'bg-blue-100 text-[#1641C8]' : 'bg-slate-100 text-slate-500'}`}>
                <div>{j}</div>
                <div className="text-[10px] mt-0.5">{HEURES_RDV[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        {(spec.email || spec.telephone) && (
          <div className="card p-6">
            <h3 className="font-bold text-[15px] mb-4">Contact professionnel</h3>
            <div className="flex gap-4">
              {spec.telephone && (
                <a href={`tel:${spec.telephone}`} className="flex items-center gap-2
                  text-sm text-slate-600 hover:text-[#1641C8] transition-colors no-underline">
                  <i className="fa-solid fa-phone text-[#1641C8]" /> {spec.telephone}
                </a>
              )}
              {spec.email && (
                <a href={`mailto:${spec.email}`} className="flex items-center gap-2
                  text-sm text-slate-600 hover:text-[#1641C8] transition-colors no-underline">
                  <i className="fa-solid fa-envelope text-[#1641C8]" /> {spec.email}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
