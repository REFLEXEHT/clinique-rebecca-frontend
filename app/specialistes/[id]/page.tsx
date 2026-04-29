'use client'
// app/specialistes/[id]/page.tsx — Profil public spécialiste (lecture seule)
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'
import { Specialiste } from '@/types'

const SPECS_DATA: Record<number, Specialiste & { tags: string[]; bio: string; disponibilites: string; experience: string }> = {
  1: { id:1, nom:'Dr. Michel Dubois', specialite:'Chirurgie générale', description:'Chirurgien senior', emoji:'🔬', categorie:'chirurgie', email:'m.dubois@cliniquerebecca.ht', telephone:'+509 3456-0001', actif:true, ordre:0, bio:'Chirurgien général spécialisé dans la chirurgie digestive et laparoscopique. Plus de 15 ans d\'expérience dans les interventions chirurgicales complexes, formé à l\'Hôpital Universitaire d\'État d\'Haïti et en France.', tags:['Chirurgie digestive','Laparoscopie','Urgences chirurgicales','Hernies'], disponibilites:'Lun–Ven 08h–17h · Sam 08h–12h', experience:'15 ans d\'expérience' },
  2: { id:2, nom:'Dr. Anne-Marie Pierre', specialite:'Neurochirurgie', description:'Neurochirurgie pédiatrique', emoji:'🧠', categorie:'neurochirurgie', email:'am.pierre@cliniquerebecca.ht', telephone:'+509 3456-0002', actif:true, ordre:0, bio:'Experte en neurochirurgie pédiatrique et adulte, spécialisée dans le traitement des tumeurs cérébrales, des malformations vasculaires et de la pathologie de la colonne vertébrale.', tags:['Tumeurs cérébrales','Chirurgie de la colonne','Neurochirurgie pédiatrique'], disponibilites:'Mar–Jeu 08h–16h', experience:'12 ans d\'expérience' },
  3: { id:3, nom:'Dr. Jean-Claude Étienne', specialite:'Neurologie', description:'Épilepsie, AVC', emoji:'🧬', categorie:'neurologie', email:'jc.etienne@cliniquerebecca.ht', telephone:'+509 3456-0003', actif:true, ordre:0, bio:'Neurologue expérimenté dans le diagnostic et le traitement de l\'épilepsie, des AVC et des pathologies démyélinisantes comme la sclérose en plaques.', tags:['Épilepsie','AVC','Sclérose en plaques'], disponibilites:'Lun–Ven 08h–17h', experience:'10 ans d\'expérience' },
  4: { id:4, nom:'Dr. Sophie Lamour', specialite:'Orthopédie', description:'Traumatologie', emoji:'🦴', categorie:'orthopedie', email:'s.lamour@cliniquerebecca.ht', telephone:'+509 3456-0004', actif:true, ordre:0, bio:'Orthopédiste spécialisée en traumatologie et chirurgie prothétique. Prise en charge des fractures complexes, des arthroses sévères et remplacement articulaire.', tags:['Prothèse de hanche','Fractures complexes','Arthroscopie'], disponibilites:'Lun–Sam 08h–17h', experience:'13 ans d\'expérience' },
  5: { id:5, nom:'Dr. Paul Désir', specialite:'Pédiatrie', description:'Néonatologie', emoji:'👶', categorie:'pediatrie', email:'p.desir@cliniquerebecca.ht', telephone:'+509 3456-0005', actif:true, ordre:0, bio:'Pédiatre dévoué spécialisé en néonatologie et pédiatrie générale. Suivi de croissance, vaccinations, maladies infectieuses de l\'enfant et maladies chroniques pédiatriques.', tags:['Néonatologie','Pédiatrie générale','Vaccinations','Maladies chroniques'], disponibilites:'Lun–Ven 08h–17h · Sam 08h–15h', experience:'11 ans d\'expérience' },
  6: { id:6, nom:'Dr. Isabelle François', specialite:'Dermatologie', description:'Maladies de peau', emoji:'🌸', categorie:'dermatologie', email:'i.francois@cliniquerebecca.ht', telephone:'+509 3456-0006', actif:true, ordre:0, bio:'Dermatologue spécialisée dans les maladies inflammatoires de la peau, les infections cutanées, les pathologies pigmentaires et la dermatologie cosmétique.', tags:['Eczéma','Psoriasis','Acné','Dermatologie cosmétique'], disponibilites:'Lun–Ven 09h–17h', experience:'9 ans d\'expérience' },
  7: { id:7, nom:'Dr. Henri Nazaire', specialite:'Urologie', description:'Prostate, système urinaire', emoji:'💊', categorie:'urologie', email:'h.nazaire@cliniquerebecca.ht', telephone:'+509 3456-0007', actif:true, ordre:0, bio:'Urologue expérimenté dans le traitement des pathologies de la prostate, des lithiases urinaires, des infections urinaires récidivantes et des troubles de la fertilité masculine.', tags:['Prostate','Lithiase urinaire','Fertilité masculine'], disponibilites:'Lun–Ven 08h–17h', experience:'14 ans d\'expérience' },
  8: { id:8, nom:'Dr. Marie-Rose Cajuste', specialite:'ORL', description:'Oreille, nez, gorge', emoji:'👂', categorie:'orl', email:'mr.cajuste@cliniquerebecca.ht', telephone:'+509 3456-0008', actif:true, ordre:0, bio:'Spécialiste en oto-rhino-laryngologie. Prise en charge des pathologies de l\'oreille, du nez, des sinus, de la gorge et du larynx, avec ou sans chirurgie.', tags:['Sinusite','Troubles auditifs','Chirurgie ORL','Amygdales'], disponibilites:'Lun–Sam 07h–16h', experience:'8 ans d\'expérience' },
  9: { id:9, nom:'Dr. Claudette Joseph', specialite:'Gynécologie-Obstétrique', description:'Suivi grossesse', emoji:'🌺', categorie:'gynecologie', email:'c.joseph@cliniquerebecca.ht', telephone:'+509 3456-0009', actif:true, ordre:0, bio:'Gynécologue-obstétricienne assurant le suivi de grossesse, les accouchements, et la santé reproductive de la femme tout au long de sa vie.', tags:['Suivi grossesse','Accouchement','Ménopause','Contraception'], disponibilites:'Lun–Sam 07h–17h', experience:'16 ans d\'expérience' },
  10: { id:10, nom:'Dr. Patrick Dorival', specialite:'Chirurgie pédiatrique', description:'Chirurgie nourrissons', emoji:'🏥', categorie:'chir-ped', email:'p.dorival@cliniquerebecca.ht', telephone:'+509 3456-0010', actif:true, ordre:0, bio:'Chirurgien pédiatrique spécialisé dans les interventions chez les nourrissons et jeunes enfants, y compris les malformations congénitales.', tags:['Chirurgie néonatale','Hernies','Appendicite','Malformations'], disponibilites:'Lun–Ven 08h–16h', experience:'10 ans d\'expérience' },
  11: { id:11, nom:'Dr. Réginald Louis', specialite:'Médecine interne', description:'Diabète, hypertension', emoji:'❤️', categorie:'medecine-interne', email:'r.louis@cliniquerebecca.ht', telephone:'+509 3456-0011', actif:true, ordre:0, bio:'Interniste expérimenté dans la prise en charge des maladies chroniques complexes. Diabète, hypertension, dyslipidémie, maladies auto-immunes et polyvasculaires.', tags:['Diabète','Hypertension','Maladies auto-immunes','Gériatrie'], disponibilites:'Lun–Sam 07h–17h', experience:'18 ans d\'expérience' },
  12: { id:12, nom:'Dr. Nathalie Vincent', specialite:'Ophtalmologie', description:'Chirurgie oculaire', emoji:'👁️', categorie:'ophtalmologie', email:'n.vincent@cliniquerebecca.ht', telephone:'+509 3456-0012', actif:true, ordre:0, bio:'Ophtalmologue spécialisée en chirurgie de la cataracte, traitement du glaucome, pathologies rétiniennes et réfraction oculaire.', tags:['Cataracte','Glaucome','Rétine','Réfraction'], disponibilites:'Mar–Sam 08h–17h', experience:'12 ans d\'expérience' },
}

export default function SpecialistePage() {
  const params = useParams()
  const id = Number(params.id)
  const [rdvOpen, setRdvOpen] = useState(false)
  const [spec, setSpec] = useState(SPECS_DATA[id] || null)

  useEffect(() => {
    if (id) {
      specialistesApi.getById(id)
        .then(r => setSpec(prev => ({ ...SPECS_DATA[id], ...r.data, tags: SPECS_DATA[id]?.tags || [], bio: SPECS_DATA[id]?.bio || '' })))
        .catch(() => setSpec(SPECS_DATA[id] || null))
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
