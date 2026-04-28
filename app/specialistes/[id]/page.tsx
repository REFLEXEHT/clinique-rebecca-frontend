'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'

// Données de fallback enrichies pour chaque médecin connu par son id
const FALLBACK_DATA: Record<number, any> = {
  1:  { tags: ['Endoscopie', 'Lithiase urinaire', 'Incontinence', 'Prostate'],           bio: 'Urologue expert avec plus de 10 ans d\'expérience en endoscopie urologique et traitement de la lithiase urinaire. Formé à l\'Université d\'État d\'Haïti.', disponibilites: 'Lun–Ven 08h–16h', experience: '10 ans' },
  2:  { tags: ['Grossesse à risque', 'Accouchement', 'Contraception', 'Ménopause'],       bio: 'Gynécologue-obstétricien spécialisé dans le suivi des grossesses à risque et la chirurgie gynécologique mini-invasive.', disponibilites: 'Lun–Sam 07h–15h', experience: '8 ans' },
  3:  { tags: ['Anesthésie générale', 'Soins intensifs', 'Analgésie', 'Réanimation'],     bio: 'Anesthésiste-réanimatrice experte en anesthésie pour interventions chirurgicales et soins intensifs post-opératoires.', disponibilites: 'Lun–Ven 07h–15h', experience: '9 ans' },
  4:  { tags: ['Diabète', 'Hypertension', 'Maladies chroniques', 'Approche préventive'], bio: 'Interniste avec une approche globale et préventive des maladies chroniques. Suivi personnalisé de chaque patient.', disponibilites: 'Lun–Sam 08h–17h', experience: '12 ans' },
  5:  { tags: ["Chirurgie d'urgence", 'Hernie', 'Appendicite', 'Laparoscopie'],          bio: "Chirurgien senior avec une expertise reconnue en chirurgie d'urgence et chirurgie digestive laparoscopique.", disponibilites: 'Lun–Sam 07h–15h', experience: '15 ans' },
  6:  { tags: ['Chirurgie mini-invasive', 'Kystectomie', 'Hystérectomie', 'Laparoscopie'], bio: 'Expert en chirurgie gynécologique mini-invasive, permettant des suites opératoires plus courtes et moins douloureuses.', disponibilites: 'Mar–Jeu 08h–14h', experience: '11 ans' },
  7:  { tags: ['Gynécologie médicale', 'Planning familial', 'Infections gynéco', 'Suivi'],  bio: 'Spécialisée en gynécologie médicale et planning familial. Approche douce et bienveillante pour chaque patiente.', disponibilites: 'Lun–Ven 08h–16h', experience: '7 ans' },
  8:  { tags: ['Néonatologie', 'Pédiatrie générale', 'Vaccinations', 'Croissance'],        bio: 'Pédiatre spécialisé en néonatologie et suivi pédiatrique général. Prise en charge des nouveau-nés et enfants jusqu\'à 15 ans.', disponibilites: 'Lun–Sam 07h–16h', experience: '10 ans' },
  9:  { tags: ['Suivi gynécologique', 'MST', 'Fertilité', 'Ménopause'],                   bio: 'Gynécologue avec une approche holistique et bienveillante. Spécialisé dans le suivi global de la santé de la femme.', disponibilites: 'Lun–Ven 08h–16h', experience: '9 ans' },
  10: { tags: ['Traumatologie sportive', 'Fractures', 'Arthroscopie', 'Genou'],           bio: 'Orthopédiste spécialisé en traumatologie sportive et chirurgie arthroscopique du genou et de l\'épaule.', disponibilites: 'Lun–Sam 07h–17h', experience: '8 ans' },
  11: { tags: ['Maladies chroniques', 'Diabète', 'Hypertension', 'Insuffisances'],        bio: 'Interniste spécialisée dans la gestion des maladies chroniques complexes. Coordination du suivi multidisciplinaire.', disponibilites: 'Mar–Sam 08h–16h', experience: '11 ans' },
  12: { tags: ['Néonatologie', 'Pédiatrie sociale', 'Développement enfant', 'Vaccins'],   bio: "Pédiatre dévouée à la santé des enfants de la naissance à l'adolescence. Spécialisée en pédiatrie sociale.", disponibilites: 'Lun–Ven 07h–15h', experience: '8 ans' },
  13: { tags: ['Rhinologie', 'Chirurgie des sinus', 'Surdité', 'Amygdales'],              bio: 'ORL avec expertise en rhinologie et chirurgie endoscopique des sinus. Prise en charge des pathologies de l\'oreille et du nez.', disponibilites: 'Lun–Sam 07h–16h', experience: '9 ans' },
  14: { tags: ['Chirurgie générale', 'Urgences', 'Hernies', 'Appendicite'],               bio: 'Chirurgien généraliste avec plus de 10 ans de pratique en Haïti. Expertise en chirurgie des urgences.', disponibilites: 'Lun–Sam 07h–17h', experience: '10 ans' },
  15: { tags: ['Chirurgie digestive', 'Laparoscopie', 'Côlon', 'Vésicule'],              bio: 'Spécialiste en chirurgie digestive et laparoscopique. Chirurgie mini-invasive du côlon, de la vésicule et des hernies.', disponibilites: 'Lun–Ven 08h–16h', experience: '9 ans' },
  16: { tags: ['Pédiatrie générale', 'Nourrissons', 'Adolescents', 'Nutrition'],          bio: "Pédiatre dévouée à la santé des enfants. Suivi de croissance, vaccinations et prise en charge des maladies courantes de l'enfance.", disponibilites: 'Lun–Sam 07h–16h', experience: '7 ans' },
  17: { tags: ['Neurochirurgie rachidienne', 'Tumeurs cérébrales', 'Traumatismes crâniens'], bio: 'Neurochirurgien formé en France, spécialisé en chirurgie rachidienne et traitement des tumeurs cérébrales.', disponibilites: 'Mer–Ven 08h–14h', experience: '14 ans' },
  18: { tags: ['Prothèses articulaires', 'Fractures complexes', 'Orthopédie traumato'],   bio: 'Formé en Haïti et aux États-Unis, spécialisé en chirurgie orthopédique prothétique et reconstruction osseuse.', disponibilites: 'Lun–Sam 07h–17h', experience: '13 ans' },
  19: { tags: ['Genou', 'Épaule', 'Traumatologie', 'Arthroscopie'],                       bio: "Orthopédiste spécialisé en pathologies du genou et de l'épaule. Expert en arthroscopie et chirurgie mini-invasive.", disponibilites: 'Lun–Ven 08h–17h', experience: '10 ans' },
  20: { tags: ['Chirurgie néonatale', 'Malformations congénitales', 'Hernies enfant'],    bio: 'Chirurgien pédiatrique formé en Europe, spécialisé dans les interventions chez les nourrissons et jeunes enfants.', disponibilites: 'Mar–Sam 08h–14h', experience: '12 ans' },
  21: { tags: ['Eczéma', 'Psoriasis', 'Acné', 'Dermatologie esthétique'],                bio: 'Dermatologue avec expertise en dermatologie esthétique et médicale. Prise en charge des maladies inflammatoires cutanées.', disponibilites: 'Lun–Ven 09h–16h', experience: '8 ans' },
  22: { tags: ['Épilepsie', 'Maladies neuromusculaires', 'Sclérose en plaques', 'AVC'],   bio: 'Neurologue spécialisé en épilepsie et maladies neuromusculaires. Prise en charge des pathologies du système nerveux.', disponibilites: 'Lun–Mer 08h–16h', experience: '14 ans' },
  23: { tags: ['Prothèses articulaires', 'Arthrose', 'Hanche', 'Genou'],                 bio: 'Orthopédiste avec spécialisation en prothèses articulaires de la hanche et du genou. Expertise en chirurgie reconstructive.', disponibilites: 'Lun–Sam 07h–16h', experience: '11 ans' },
  24: { tags: ["Infertilité", 'Grossesse', 'Gynécologie médico-chirurgicale'],            bio: "Gynécologue avec un intérêt particulier pour le traitement de l'infertilité féminine et le suivi obstétrical.", disponibilites: 'Lun–Sam 08h–16h', experience: '10 ans' },
  25: { tags: ['Gynécologie communautaire', 'Contraception', 'Infections'],               bio: 'Gynécologue engagé auprès des communautés défavorisées. Consultations accessibles et bienveillantes.', disponibilites: 'Lun–Ven 07h–15h', experience: '9 ans' },
  26: { tags: ['Orthodontie', 'Extraction', 'Soins conservateurs', 'Prothèses dentaires'], bio: 'Chirurgien-dentiste spécialisé en orthodontie et soins conservateurs. Cabinet moderne et équipé.', disponibilites: 'Lun–Sam 08h–17h', experience: '8 ans' },
  27: { tags: ['Rééducation post-op', 'Lombalgies', 'AVC', 'Kinésithérapie'],            bio: 'Physiothérapeute diplômée spécialisée en rééducation post-chirurgicale et traitement des lombalgies chroniques.', disponibilites: 'Lun–Sam 07h–16h', experience: '7 ans' },
  28: { tags: ['Basse vision', 'Verres progressifs', 'Glaucome', 'Fond d\'œil'],         bio: 'Optométriste avec expertise en basse vision et adaptation de verres progressifs. Bilans visuels complets.', disponibilites: 'Lun–Sam 08h–17h', experience: '9 ans' },
  29: { tags: ['TCC', 'Thérapie individuelle', 'Anxiété', 'Dépression'],                 bio: 'Psychologue clinicien spécialisé en thérapies cognitives et comportementales. Suivi individuel adulte.', disponibilites: 'Lun–Ven 09h–17h', experience: '10 ans' },
  30: { tags: ['Radiographie', 'Échographie', 'Scanner', 'Imagerie diagnostique'],       bio: 'Radiologue expert en imagerie médicale diagnostique. Interprétation de radiographies, échographies et scanners.', disponibilites: 'Lun–Sam 07h–15h', experience: '12 ans' },
}

export default function SpecialistePage() {
  const params = useParams()
  const id = Number(params.id)
  const [rdvOpen, setRdvOpen] = useState(false)
  const [spec, setSpec] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    specialistesApi.getById(id)
      .then(r => {
        const apiData = r.data || {}
        const enriched = { ...apiData, ...(FALLBACK_DATA[id] || {}) }
        setSpec(enriched)
      })
      .catch(() => {
        // Use fallback only if no API data
        const fb = FALLBACK_DATA[id]
        if (fb) setSpec(fb)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 70 }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: '#1641C8' }} />
      </div>
    </>
  )

  if (!spec) return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', paddingTop: 70 }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
        <p style={{ fontSize: 18, fontWeight: 600 }}>Spécialiste introuvable</p>
        <Link href="/specialites" style={{ color: '#1641C8', marginTop: 12, fontWeight: 600, textDecoration: 'none' }}>
          ← Retour à la liste des médecins
        </Link>
      </div>
    </>
  )

  const displayName = spec.nom || 'Médecin'
  const displaySpec = spec.specialite || 'Spécialiste'
  const displayBio  = spec.bio || spec.parcours || spec.description || 'Médecin expérimenté de la Clinique de la Rebecca.'
  const tags        = spec.tags || []
  const experience  = spec.experience || spec.annees_experience ? `${spec.annees_experience} ans d'expérience` : null
  const disponibilites = spec.disponibilites || 'Lun–Sam 07h–17h'
  const telephone   = spec.telephone
  const email       = spec.email
  const photoUrl    = spec.photo_url || spec.avatar_url || null
  const prix        = spec.prix_consultation || 0

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} defaultSpec={displaySpec} />

      {/* Header */}
      <div style={{ paddingTop: 70, background: 'linear-gradient(135deg,#0f1e3d,#1641C8)', padding: '100px 5% 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 20 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Accueil</Link>
            {' / '}
            <Link href="/specialites" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Médecins</Link>
            {' / '}
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>{displayName}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '-30px auto 0', padding: '0 5% 64px' }}>

        {/* Card profil principale */}
        <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', marginBottom: 24, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Photo ou avatar */}
            <div style={{ width: 110, height: 110, borderRadius: 24, background: 'linear-gradient(135deg,#1641C8,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', boxShadow: '0 4px 20px rgba(22,65,200,0.25)' }}>
              {photoUrl ? (
                <img src={photoUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              ) : (
                <i className="fa-solid fa-circle-user" style={{ color: 'white', fontSize: 52 }} />
              )}
            </div>

            {/* Infos */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.2rem,3vw,1.7rem)', color: '#0f172a', marginBottom: 6 }}>{displayName}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ background: '#eff6ff', color: '#1641C8', borderRadius: 50, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>{displaySpec}</span>
                {experience && <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: 50, padding: '4px 14px', fontSize: 12, fontWeight: 600 }}>{experience}</span>}
                <span style={{ color: '#f59e0b', fontSize: 13 }}>★★★★★</span>
              </div>

              <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>{displayBio}</p>

              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {tags.map((tag: string) => (
                    <span key={tag} style={{ padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#1641C8', border: '1px solid #dbeafe' }}>{tag}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => setRdvOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  <i className="fa-regular fa-calendar-check" /> Prendre rendez-vous
                </button>
                <Link href="/consultation"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#1641C8', border: '2px solid #1641C8', borderRadius: 12, padding: '11px 22px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  <i className="fa-solid fa-video" /> Vidéo
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* Colonne principale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Domaines d'expertise */}
            {tags.length > 0 && (
              <div style={{ background: 'white', borderRadius: 18, padding: 24, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fa-solid fa-microscope" style={{ color: '#1641C8' }} /> Domaines d&apos;expertise
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {tags.map((tag: string) => (
                    <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      <i className="fa-solid fa-check" style={{ color: '#22c55e', fontSize: 11 }} /> {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations pratiques */}
            <div style={{ background: 'white', borderRadius: 18, padding: 24, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-circle-info" style={{ color: '#1641C8' }} /> Informations pratiques
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: 'fa-clock',        label: 'Disponibilités',       value: disponibilites },
                  { icon: 'fa-location-dot', label: 'Lieu',                 value: 'Clinique de la Rebecca, Delmas, Haïti' },
                  { icon: 'fa-language',     label: 'Langues',              value: 'Français · Créole haïtien' },
                  { icon: 'fa-money-bill',   label: 'Consultation',         value: prix > 0 ? `${prix.toLocaleString()} HTG` : 'Sur devis' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 34, height: 34, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <i className={`fa-solid ${item.icon}`} style={{ color: '#1641C8', fontSize: 13 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontWeight: 600, color: '#374151', fontSize: 14 }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Prendre RDV */}
            <div style={{ background: 'white', borderRadius: 18, padding: 20, border: '2px solid #1641C820' }}>
              <h4 style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 16 }}>Prendre rendez-vous</h4>
              <button onClick={() => setRdvOpen(true)} style={{ width: '100%', background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <i className="fa-regular fa-calendar-check" /> En personne
              </button>
              <Link href="/consultation" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 0', background: 'white', color: '#1641C8', border: '2px solid #1641C8', borderRadius: 12, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                <i className="fa-solid fa-video" /> Consultation vidéo
              </Link>
              {(telephone || email) && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  {telephone && (
                    <a href={`https://wa.me/509${telephone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#16a34a', fontWeight: 600, textDecoration: 'none', marginBottom: 8 }}>
                      <i className="fa-brands fa-whatsapp" style={{ color: '#22c55e', fontSize: 16 }} /> {telephone}
                    </a>
                  )}
                  {email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
                      <i className="fa-solid fa-envelope" /> {email}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Avis patients */}
            <div style={{ background: 'white', borderRadius: 18, padding: 20, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Avis patients</h4>
              {[
                { initiales: 'M.T.', note: '★★★★★', txt: 'Médecin très professionnel et à l\'écoute.' },
                { initiales: 'P.J.', note: '★★★★★', txt: 'Excellent suivi, je recommande vivement.' },
              ].map(a => (
                <div key={a.initiales} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eff6ff', color: '#1641C8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{a.initiales}</div>
                    <span style={{ color: '#f59e0b', fontSize: 11 }}>{a.note}</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: 12, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>&ldquo;{a.txt}&rdquo;</p>
                </div>
              ))}
            </div>

            {/* Retour liste */}
            <Link href="/specialites" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '10px 0' }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> Retour à la liste
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
