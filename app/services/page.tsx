'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'

// ── Données statiques de chaque service ──────────────────────────────────────
const SERVICES_DATA: Record<string, {
  titre: string; couleur: string; bg: string; icon: string
  desc: string; longDesc: string
  examens: { nom: string; raison: string; duree?: string }[]
  pharmacie?: boolean
  produits?: { nom: string; categorie: string; disponible: boolean; expiration?: string }[]
}> = {
  laboratoire: {
    titre: 'Laboratoire', couleur: '#0d9488', icon: 'fa-flask-vial',
    bg: 'linear-gradient(135deg,#0f1e3d 0%,#0d9488 100%)',
    desc: 'Analyses biologiques complètes avec résultats rapides',
    longDesc: 'Notre laboratoire est équipé d\'appareils modernes et calibrés pour vous fournir des résultats fiables en un minimum de temps. Nos techniciens de laboratoire certifiés traitent vos échantillons avec soin et précision. Les résultats urgents sont disponibles en 2 heures.',
    examens: [
      { nom: 'Numération formule sanguine (NFS)', raison: 'Détecter anémies, infections, troubles de la coagulation. Indiqué en cas de fatigue chronique, fièvre ou surveillance de traitement.', duree: '1h' },
      { nom: 'Glycémie à jeun', raison: 'Dépister ou surveiller le diabète. Recommandé à partir de 40 ans ou en cas d\'antécédents familiaux.', duree: '30 min' },
      { nom: 'HbA1c (hémoglobine glyquée)', raison: 'Évaluer l\'équilibre du diabète sur les 3 derniers mois. Essentiel pour ajuster le traitement.', duree: '2h' },
      { nom: 'Bilan lipidique', raison: 'Mesurer cholestérol total, HDL, LDL et triglycérides. Prévention cardio-vasculaire.', duree: '2h' },
      { nom: 'Fonction rénale (créatinine, urée)', raison: 'Évaluer la santé des reins. Essentiel avant tout traitement à élimination rénale.', duree: '2h' },
      { nom: 'Bilan hépatique (ALAT, ASAT)', raison: 'Surveiller la santé du foie. Recommandé en cas de traitement prolongé ou consommation d\'alcool.', duree: '2h' },
      { nom: 'Sérologie VIH', raison: 'Dépistage du VIH. Recommandé une fois par an pour toute personne sexuellement active.', duree: '30 min' },
      { nom: 'Test de grossesse (β-hCG)', raison: 'Confirmer une grossesse dès 10 jours après une relation. Résultat quantitatif et qualitatif.', duree: '30 min' },
      { nom: 'Analyse d\'urine (ECBU)', raison: 'Détecter infections urinaires, protéines, sang. Indiqué en cas de brûlures urinaires ou suivi rénal.', duree: '24h' },
    ],
  },
  dentisterie: {
    titre: 'Dentisterie', couleur: '#7c3aed', icon: 'fa-tooth',
    bg: 'linear-gradient(135deg,#0f1e3d 0%,#7c3aed 100%)',
    desc: 'Soins dentaires complets pour toute la famille',
    longDesc: 'Le Dr Wolf Charlie Cajuste vous accueille dans un cabinet moderne et équipé pour tous vos besoins bucco-dentaires. De la prévention à la réhabilitation complète, nous offrons des soins de qualité dans un environnement confortable et rassurant.',
    examens: [
      { nom: 'Consultation dentaire', raison: 'Examen complet de la cavité buccale, bilan de santé dentaire et plan de traitement personnalisé.', duree: '30 min' },
      { nom: 'Détartrage et prophylaxie', raison: 'Éliminer le tartre et la plaque dentaire pour prévenir caries et maladies des gencives. Recommandé tous les 6 mois.', duree: '45 min' },
      { nom: 'Extraction dentaire', raison: 'Ablation d\'une dent non récupérable, dent de sagesse enclavée ou dent déchaussée sévèrement.', duree: '30-60 min' },
      { nom: 'Obturation (plombage)', raison: 'Traitement des caries pour préserver la dent. Réalisé avec des matériaux esthétiques couleur dent.', duree: '45 min' },
      { nom: 'Traitement de canal', raison: 'Sauver une dent infectée en profondeur en traitant la pulpe. Évite l\'extraction.', duree: '60-90 min' },
      { nom: 'Prothèse dentaire', raison: 'Remplacement d\'une ou plusieurs dents perdues. Améliore la mastication et l\'esthétique.', duree: 'Plusieurs séances' },
      { nom: 'Radiographie dentaire', raison: 'Visualiser les racines, os alvéolaire et caries interproximales non visibles à l\'œil nu.', duree: '15 min' },
    ],
  },
  pharmacie: {
    titre: 'Pharmacie', couleur: '#dc2626', icon: 'fa-pills',
    bg: 'linear-gradient(135deg,#0f1e3d 0%,#dc2626 100%)',
    desc: 'Médicaments disponibles sur place, ordonnances honorées',
    longDesc: 'Notre pharmacie intégrée vous permet d\'honorer vos ordonnances sur place, sans déplacement supplémentaire. Notre pharmacien vérifie les interactions médicamenteuses et vous conseille sur la bonne utilisation de vos médicaments.',
    examens: [],
    pharmacie: true,
    produits: [
      { nom: 'Amoxicilline 500mg', categorie: 'Antibiotique', disponible: true, expiration: '2026-12' },
      { nom: 'Paracétamol 1g', categorie: 'Antalgique', disponible: true, expiration: '2027-03' },
      { nom: 'Metformine 500mg', categorie: 'Antidiabétique', disponible: true, expiration: '2026-09' },
      { nom: 'Amlodipine 5mg', categorie: 'Antihypertenseur', disponible: true, expiration: '2027-01' },
      { nom: 'Atorvastatine 20mg', categorie: 'Hypolipémiant', disponible: false },
      { nom: 'Oméprazole 20mg', categorie: 'Antiulcéreux', disponible: true, expiration: '2026-11' },
      { nom: 'Ibuprofène 400mg', categorie: 'Anti-inflammatoire', disponible: true, expiration: '2027-06' },
      { nom: 'Cotrimoxazole 480mg', categorie: 'Antibiotique', disponible: true, expiration: '2026-08' },
    ],
  },
  physiotherapie: {
    titre: 'Physiothérapie', couleur: '#d97706', icon: 'fa-person-walking',
    bg: 'linear-gradient(135deg,#0f1e3d 0%,#d97706 100%)',
    desc: 'Rééducation fonctionnelle et traitement des douleurs',
    longDesc: 'Mme Fredia Fleurival, notre physiothérapeute diplômée, prend en charge vos douleurs musculaires, articulaires et neurologiques. Chaque programme de rééducation est personnalisé selon votre pathologie et vos objectifs de récupération.',
    examens: [
      { nom: 'Kinésithérapie musculaire', raison: 'Renforcer les muscles affaiblis après traumatisme, chirurgie ou immobilisation prolongée.', duree: '45 min' },
      { nom: 'Rééducation post-opératoire', raison: 'Retrouver mobilité et force après une intervention chirurgicale (genou, hanche, épaule).', duree: '45-60 min' },
      { nom: 'Traitement des lombalgies', raison: 'Soulager et prévenir les douleurs du bas du dos par étirements, renforcement et posture.', duree: '45 min' },
      { nom: 'Rééducation post-AVC', raison: 'Récupérer les fonctions motrices et améliorer l\'autonomie après un accident vasculaire cérébral.', duree: '60 min' },
      { nom: 'Électrothérapie (TENS)', raison: 'Soulager les douleurs chroniques par stimulation électrique des nerfs. Non invasif.', duree: '30 min' },
      { nom: 'Ultrasons thérapeutiques', raison: 'Traiter les tendinites, bursites et cicatrices par ondes sonores de haute fréquence.', duree: '20 min' },
      { nom: 'Massage thérapeutique', raison: 'Relâcher les contractures musculaires, améliorer la circulation et réduire le stress.', duree: '45 min' },
    ],
  },
  optometrie: {
    titre: 'Optométrie', couleur: '#059669', icon: 'fa-glasses',
    bg: 'linear-gradient(135deg,#0f1e3d 0%,#059669 100%)',
    desc: 'Bilan visuel complet et prescriptions de verres correcteurs',
    longDesc: 'Mr Gilles Abraham, optométriste, réalise des bilans visuels complets et vous accompagne dans le choix de vos verres correcteurs ou lentilles de contact. Un suivi visuel annuel est recommandé pour détecter précocement glaucome, cataracte et dégénérescence maculaire.',
    examens: [
      { nom: 'Bilan visuel complet', raison: 'Évaluer l\'acuité visuelle de loin et de près, la réfraction et la santé oculaire globale.', duree: '45 min' },
      { nom: 'Réfractométrie (prescription)', raison: 'Déterminer avec précision la correction nécessaire pour lunettes ou lentilles.', duree: '20 min' },
      { nom: 'Dépistage glaucome (tonométrie)', raison: 'Mesurer la pression intraoculaire pour détecter un glaucome débutant, souvent asymptomatique.', duree: '15 min' },
      { nom: 'Fond d\'œil', raison: 'Examiner la rétine, le nerf optique et les vaisseaux. Indiqué chez diabétiques et hypertendus.', duree: '20 min' },
      { nom: 'Adaptation lentilles de contact', raison: 'Choisir et adapter des lentilles selon la forme de votre œil et votre prescription.', duree: '30 min' },
    ],
  },
  maternite: {
    titre: 'Maternité', couleur: '#be185d', icon: 'fa-baby',
    bg: 'linear-gradient(135deg,#0f1e3d 0%,#be185d 100%)',
    desc: 'Accompagnement de la grossesse à la naissance',
    longDesc: 'Notre service de maternité assure un suivi complet et bienveillant de votre grossesse jusqu\'à l\'accouchement. Le Dr Claudette Joseph et son équipe sont là pour vous accompagner à chaque étape, dans un environnement chaleureux et sécurisé.',
    examens: [
      { nom: 'Consultation prénatale', raison: 'Suivi mensuel de la grossesse : tension, poids, position du bébé, cœur fœtal.', duree: '30 min' },
      { nom: 'Échographie obstétricale', raison: 'Visualiser le bébé, mesurer sa croissance et vérifier le placenta. Recommandée à 12, 22 et 32 semaines.', duree: '30 min' },
      { nom: 'Test de tolérance au glucose', raison: 'Dépister le diabète gestationnel entre 24 et 28 semaines de grossesse.', duree: '2h' },
      { nom: 'Accouchement', raison: 'Prise en charge complète du travail et de l\'accouchement avec sage-femme et médecin disponibles.', duree: 'Variable' },
      { nom: 'Soins nouveau-né', raison: 'Bilan complet, pesée, mesures, vitamine K, vaccination BCG et soins de base du nourrisson.', duree: '1h' },
      { nom: 'Planification familiale', raison: 'Choix d\'une contraception adaptée après l\'accouchement ou pour espacement des naissances.', duree: '20 min' },
    ],
  },
  sop: {
    titre: 'Salle SOP (Bloc opératoire)', couleur: '#374151', icon: 'fa-scalpel',
    bg: 'linear-gradient(135deg,#0f1e3d 0%,#475569 100%)',
    desc: 'Bloc opératoire équipé pour interventions chirurgicales',
    longDesc: 'Notre salle d\'opération est équipée pour les interventions chirurgicales programmées et les urgences. L\'équipe comprend chirurgiens spécialistes, anesthésiste et infirmières de bloc, tous formés aux dernières pratiques chirurgicales.',
    examens: [
      { nom: 'Chirurgie digestive', raison: 'Traitement des affections du tube digestif : appendicite, hernie, vésicule biliaire, intestin.', duree: '1-3h' },
      { nom: 'Chirurgie gynécologique', raison: 'Hystérectomie, kystectomie ovarienne, ligature des trompes, césarienne.', duree: '1-2h' },
      { nom: 'Chirurgie orthopédique', raison: 'Ostéosynthèse de fractures, arthroplastie, corrections déformités osseuses.', duree: '1-4h' },
      { nom: 'Herniorraphie', raison: 'Réparation chirurgicale d\'une hernie abdominale ou inguinale avec filet synthétique.', duree: '45-90 min' },
      { nom: 'Appendicectomie', raison: 'Ablation de l\'appendice en cas d\'appendicite aiguë. Urgence chirurgicale fréquente.', duree: '45-60 min' },
    ],
  },
  gestes: {
    titre: 'Gestes médicaux', couleur: '#6366f1', icon: 'fa-syringe',
    bg: 'linear-gradient(135deg,#0f1e3d 0%,#6366f1 100%)',
    desc: 'Soins courants effectués sur place rapidement',
    longDesc: 'Notre service de gestes médicaux prend en charge les actes courants sans hospitalisation. Nos infirmières diplômées réalisent vos soins avec douceur et professionnalisme dans un environnement stérile et sécurisé.',
    examens: [
      { nom: 'Injection intramusculaire', raison: 'Administration d\'antibiotiques, vitamines, antiparasitaires. Absorption rapide et efficace.', duree: '10 min' },
      { nom: 'Perfusion intraveineuse', raison: 'Réhydratation, administration de médicaments à effet rapide ou traitement de la déshydratation.', duree: '30-120 min' },
      { nom: 'Prise de sang', raison: 'Prélèvement veineux pour analyses biologiques. Réalisé par des préleveurs expérimentés.', duree: '10 min' },
      { nom: 'Pansement et soins de plaie', raison: 'Nettoyage, désinfection et pansement de plaies traumatiques, brûlures ou plaies chroniques.', duree: '15-30 min' },
      { nom: 'Suture de plaie', raison: 'Fermeture de coupures et plaies ouvertes avec fils résorbables ou non. Anesthésie locale incluse.', duree: '20-40 min' },
      { nom: 'Électrocardiogramme (ECG)', raison: 'Enregistrer l\'activité électrique du cœur. Indiqué en cas de douleurs thoraciques ou palpitations.', duree: '15 min' },
      { nom: 'Ablation de fils / points', raison: 'Retrait des sutures après cicatrisation complète d\'une plaie opératoire ou traumatique.', duree: '15 min' },
    ],
  },
}

// ── Composant carrousel pharmacie ────────────────────────────────────────────
function PharmacieCarrousel({ produits }: { produits: { nom: string; categorie: string; disponible: boolean; expiration?: string }[] }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % produits.length), 2800)
    return () => clearInterval(timer)
  }, [produits.length])
  const p = produits[idx]
  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '28px 32px', maxWidth: 480 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', animation: 'blink 1.8s infinite' }} />
        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>Produits disponibles</span>
      </div>
      <div key={idx} style={{ animation: 'fadeSlideIn 0.4s ease both' }}>
        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: 6 }}>{p.nom}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>{p.categorie}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: p.disponible ? '#dcfce7' : '#fee2e2', color: p.disponible ? '#16a34a' : '#dc2626' }}>
            {p.disponible ? 'En stock' : 'Rupture temporaire'}
          </span>
          {p.disponible && p.expiration && (
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Exp. {p.expiration}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
        {produits.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === idx ? '#dc2626' : '#e2e8f0', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>
    </div>
  )
}

// ── Assistant IA ─────────────────────────────────────────────────────────────
function AiAssistant({ service }: { service: string }) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: `Bonjour ! Je suis l'assistant de la Clinique de la Rebecca. Comment puis-je vous aider concernant notre service ${service} ?` }
  ])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setQuestion('')
    setMessages(m => [...m, { role: 'user', content: q }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history: messages, context: `Service: ${service} - Clinique de la Rebecca, Delmas, Haïti` }),
      })
      const data = await res.json()
      const reply = data.reply || data.message || 'Je n\'ai pas pu répondre. Veuillez contacter la clinique directement.'
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Désolé, je rencontre une difficulté technique. Appelez-nous au +509 3888-0000.' }])
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999 }}>
      {open && (
        <div className="ai-chat-window" style={{ width: 360, marginBottom: 12, maxHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg,#0f1e3d,#1641C8)', borderRadius: '20px 20px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Assistant Rebecca</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '10px 14px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? '#1641C8' : '#f8fafc', color: m.role === 'user' ? 'white' : '#0f172a',
                  fontSize: 13, lineHeight: 1.55, border: m.role === 'assistant' ? '1px solid #e2e8f0' : 'none'
                }}>{m.content}</div>
              </div>
            ))}
            {loading && <div style={{ display: 'flex', gap: 5, padding: '8px 14px' }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8', animation: `blink 1.2s ${i*0.2}s infinite` }} />)}</div>}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '12px 14px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Posez une question…"
              style={{ flex: 1, padding: '9px 14px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: 'white' }}
            />
            <button onClick={send} disabled={loading || !question.trim()} style={{ width: 38, height: 38, borderRadius: 12, background: '#1641C8', border: 'none', cursor: 'pointer', color: 'white', flexShrink: 0, opacity: !question.trim() ? 0.5 : 1 }}>
              <i className="fa-solid fa-paper-plane" style={{ fontSize: 13 }} />
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(v => !v)} className="ai-chat-toggle" style={{ marginLeft: 'auto', display: 'flex' }}>
        <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-comment-medical'}`} />
      </button>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ServiceDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [rdvOpen, setRdvOpen] = useState(false)

  const s = SERVICES_DATA[slug]

  if (!s) return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', paddingTop: 70 }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
        <p style={{ fontSize: 18, fontWeight: 600 }}>Service non trouvé</p>
        <Link href="/services" style={{ color: '#1641C8', marginTop: 12, fontWeight: 600 }}>Voir tous les services</Link>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* Hero */}
      <div style={{ background: s.bg, padding: '120px 5% 72px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div className="breadcrumb" style={{ marginBottom: 24 }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.6)' }}>Accueil</Link>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}> / </span>
          <Link href="/services" style={{ color: 'rgba(255,255,255,0.6)' }}>Services</Link>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}> / </span>
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>{s.titre}</span>
        </div>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', backdropFilter: 'blur(8px)' }}>
          <i className={`fa-solid ${s.icon}`} style={{ color: 'white', fontSize: 30 }} />
        </div>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 14 }}>{s.titre}</h1>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>{s.desc}</p>
        <button onClick={() => setRdvOpen(true)} className="btn-primary" style={{ background: 'rgba(255,255,255,0.95)', color: s.couleur }}>
          Prendre rendez-vous
        </button>
      </div>

      {/* Corps */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 5%' }}>

        {/* Description */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 60, alignItems: 'start' }}>
          <div>
            <span className="section-tag" style={{ background: s.couleur + '15', color: s.couleur }}>À propos</span>
            <h2 className="section-title" style={{ fontSize: '1.6rem' }}>Pourquoi choisir notre {s.titre.toLowerCase()} ?</h2>
            <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: 15 }}>{s.longDesc}</p>
            <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { icon: 'fa-clock', label: 'Résultats rapides' },
                { icon: 'fa-shield-check', label: 'Matériel certifié' },
                { icon: 'fa-user-nurse', label: 'Personnel qualifié' },
              ].map(b => (
                <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: s.couleur + '10', borderRadius: 50, padding: '8px 16px' }}>
                  <i className={`fa-solid ${b.icon}`} style={{ color: s.couleur, fontSize: 13 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: s.couleur + '08', borderRadius: 20, padding: 28, border: `1px solid ${s.couleur}20` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-location-dot" style={{ color: s.couleur }} />
              Clinique de la Rebecca
            </div>
            {[
              { icon: 'fa-map-pin', text: 'Delmas, Haïti — Accès facile' },
              { icon: 'fa-calendar', text: 'Lundi – Samedi, 7h00 – 17h00' },
              { icon: 'fa-phone', text: '+509 3888-0000' },
            ].map(i => (
              <div key={i.text} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <i className={`fa-solid ${i.icon}`} style={{ color: s.couleur, width: 16, textAlign: 'center' }} />
                <span style={{ color: '#475569', fontSize: 14 }}>{i.text}</span>
              </div>
            ))}
            <button onClick={() => setRdvOpen(true)} style={{ width: '100%', marginTop: 16, background: s.couleur, color: 'white', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              Prendre rendez-vous
            </button>
          </div>
        </div>

        {/* Pharmacie : carrousel produits */}
        {s.pharmacie && s.produits && (
          <div style={{ marginBottom: 60 }}>
            <span className="section-tag" style={{ background: '#fee2e2', color: '#dc2626' }}>Disponibilités</span>
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 24 }}>Produits en pharmacie</h2>
            <p style={{ color: '#64748b', marginBottom: 28, lineHeight: 1.7 }}>Nos médicaments sont référencés par votre médecin. Présentez votre ordonnance à la pharmacie. Stock mis à jour régulièrement.</p>
            <PharmacieCarrousel produits={s.produits} />
          </div>
        )}

        {/* Examens / actes disponibles */}
        {s.examens.length > 0 && (
          <div>
            <span className="section-tag" style={{ background: s.couleur + '15', color: s.couleur }}>Actes disponibles</span>
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 8 }}>Ce que nous proposons</h2>
            <p style={{ color: '#64748b', marginBottom: 36 }}>Chaque acte inclut une consultation préalable avec notre équipe.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {s.examens.map((e, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start', transition: 'all 0.2s' }}
                  onMouseEnter={el => { el.currentTarget.style.borderColor = s.couleur + '50'; el.currentTarget.style.boxShadow = `0 4px 20px ${s.couleur}15` }}
                  onMouseLeave={el => { el.currentTarget.style.borderColor = '#e2e8f0'; el.currentTarget.style.boxShadow = 'none' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.couleur, flexShrink: 0 }} />
                      <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: 15, margin: 0 }}>{e.nom}</h4>
                    </div>
                    <p style={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.65, margin: 0, paddingLeft: 18 }}>{e.raison}</p>
                  </div>
                  {e.duree && (
                    <div style={{ background: s.couleur + '12', borderRadius: 50, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: s.couleur, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {e.duree}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <AiAssistant service={s.titre} />
      <Footer />
    </>
  )
}
