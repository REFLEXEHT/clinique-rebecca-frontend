'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'

// ── Données examens laboratoire ───────────────────────────────────────────────
const EXAMENS = [
  { nom: "Numération formule sanguine (NFS)", duree: "1h",     importance: "Essentiel", raison: "Détecte les anémies, infections et troubles de la coagulation. Recommandé en cas de fatigue chronique, fièvre persistante ou surveillance de traitement." },
  { nom: "Glycémie à jeun",                   duree: "30 min", importance: "Courant",   raison: "Dépiste ou surveille le diabète. Recommandé dès 40 ans ou en cas d'antécédents familiaux de diabète." },
  { nom: "HbA1c (hémoglobine glyquée)",        duree: "2h",    importance: "Essentiel", raison: "Évalue l'équilibre du diabète sur les 3 derniers mois. Indispensable pour ajuster le traitement antidiabétique." },
  { nom: "Bilan lipidique",                    duree: "2h",    importance: "Courant",   raison: "Mesure le cholestérol total, HDL, LDL et les triglycérides. Prévention des maladies cardiovasculaires." },
  { nom: "Fonction rénale (créatinine, urée)", duree: "2h",    importance: "Important", raison: "Évalue la santé des reins. Obligatoire avant tout traitement à élimination rénale." },
  { nom: "Bilan hépatique (ALAT, ASAT)",       duree: "2h",    importance: "Important", raison: "Surveille la santé du foie. Recommandé en cas de traitement prolongé ou de consommation d'alcool." },
  { nom: "Sérologie VIH",                      duree: "30 min", importance: "Courant",  raison: "Dépistage du VIH. Recommandé une fois par an pour toute personne sexuellement active." },
  { nom: "Test de grossesse (β-hCG)",          duree: "30 min", importance: "Courant",  raison: "Confirme une grossesse dès 10 jours après une relation. Résultat quantitatif et qualitatif." },
  { nom: "Analyse d'urine (ECBU)",             duree: "24h",   importance: "Courant",   raison: "Détecte les infections urinaires, présence de protéines ou de sang. Indiqué en cas de brûlures urinaires." },
]

// ── Données médicaments pharmacie ────────────────────────────────────────────
const PRODUITS = [
  { nom: 'Amoxicilline 500 mg',   categorie: 'Antibiotique',        disponible: true,  expiration: '12/2026' },
  { nom: 'Paracétamol 1 g',       categorie: 'Antalgique',          disponible: true,  expiration: '03/2027' },
  { nom: 'Metformine 500 mg',     categorie: 'Antidiabétique',      disponible: true,  expiration: '09/2026' },
  { nom: 'Amlodipine 5 mg',       categorie: 'Antihypertenseur',    disponible: true,  expiration: '01/2027' },
  { nom: 'Atorvastatine 20 mg',   categorie: 'Hypolipémiant',       disponible: false  },
  { nom: 'Oméprazole 20 mg',      categorie: 'Antiulcéreux',        disponible: true,  expiration: '11/2026' },
  { nom: 'Ibuprofène 400 mg',     categorie: 'Anti-inflammatoire',  disponible: true,  expiration: '06/2027' },
  { nom: 'Cotrimoxazole 480 mg',  categorie: 'Antibiotique',        disponible: true,  expiration: '08/2026' },
  { nom: 'Aspirine 100 mg',       categorie: 'Antiplaquettaire',    disponible: true,  expiration: '05/2027' },
  { nom: 'Salbutamol spray',      categorie: 'Bronchodilatateur',   disponible: true,  expiration: '04/2027' },
]

// ── Couleurs importance ────────────────────────────────────────────────────────
const BADGE_COULEUR: Record<string, { bg: string; color: string }> = {
  'Essentiel': { bg: '#fef2f2', color: '#dc2626' },
  'Important': { bg: '#fffbeb', color: '#d97706' },
  'Courant':   { bg: '#f0fdf4', color: '#16a34a' },
}

// ── Carrousel examens avec IA ─────────────────────────────────────────────────
function CarrouselExamens() {
  const [idx, setIdx]       = useState(0)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setIdx(i => (i + 1) % EXAMENS.length)
      setAiText(null)
    }, 4000)
  }

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const goTo = (i: number) => {
    setIdx(i)
    setAiText(null)
    startTimer()
  }

  const demanderAI = async () => {
    if (aiLoading) return
    setAiLoading(true)
    setAiText(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `En 2 phrases courtes et claires pour un patient, explique pourquoi l'examen "${EXAMENS[idx].nom}" est important et quand le faire. Sois précis et rassurant.`,
          context: 'Clinique de la Rebecca, Haïti. Réponse courte destinée à un patient.',
        }),
      })
      const data = await res.json()
      setAiText(data.reply || data.message || EXAMENS[idx].raison)
    } catch {
      setAiText(EXAMENS[idx].raison)
    } finally {
      setAiLoading(false)
    }
  }

  const e = EXAMENS[idx]
  const badge = BADGE_COULEUR[e.importance]

  return (
    <div>
      {/* Carte examen */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '28px 32px', marginBottom: 20, minHeight: 200 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
          <h3 style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem', margin: 0 }}>{e.nom}</h3>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>{e.importance}</span>
            <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>⏱ {e.duree}</span>
          </div>
        </div>

        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
          {aiText || e.raison}
        </p>

        <button
          onClick={demanderAI}
          disabled={aiLoading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: aiLoading ? '#f1f5f9' : '#eff6ff',
            color: aiLoading ? '#94a3b8' : '#1641C8',
            border: 'none', borderRadius: 50, padding: '8px 18px',
            fontSize: 12, fontWeight: 700, cursor: aiLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <i className={`fa-solid ${aiLoading ? 'fa-spinner fa-spin' : 'fa-robot'}`} style={{ fontSize: 12 }} />
          {aiLoading ? 'Génération en cours…' : 'Explication IA'}
        </button>
      </div>

      {/* Pastilles navigation */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EXAMENS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === idx ? 28 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
              background: i === idx ? '#0d9488' : '#e2e8f0',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Carrousel pharmacie ───────────────────────────────────────────────────────
function CarrouselPharmacie() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % PRODUITS.length), 3000)
    return () => clearInterval(t)
  }, [])

  const p = PRODUITS[idx]

  return (
    <div>
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '28px 32px', marginBottom: 20, minHeight: 160 }}>
        <div key={idx} style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: p.disponible ? '#22c55e' : '#f59e0b', flexShrink: 0 }} />
            <h3 style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem', margin: 0 }}>{p.nom}</h3>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{p.categorie}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: p.disponible ? '#dcfce7' : '#fef3c7',
              color: p.disponible ? '#16a34a' : '#d97706',
            }}>
              {p.disponible ? 'En stock' : 'Rupture temporaire'}
            </span>
            {p.disponible && p.expiration && (
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                Exp. {p.expiration}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {PRODUITS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 28 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
              background: i === idx ? '#dc2626' : '#e2e8f0',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function LaboPharmacieePage() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [onglet, setOnglet]   = useState<'labo' | 'pharmacie'>('labo')

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0f1e3d 0%,#0d9488 60%,#dc2626 100%)', padding: '110px 5% 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div className="breadcrumb" style={{ marginBottom: 20 }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.6)' }}>Accueil</Link>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}> / </span>
          <Link href="/services" style={{ color: 'rgba(255,255,255,0.6)' }}>Services</Link>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}> / </span>
          <span style={{ color: 'white' }}>Laboratoire & Pharmacie</span>
        </div>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: 12 }}>
          Laboratoire & Pharmacie
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Analyses biologiques et médicaments disponibles sur place, sans déplacement supplémentaire.
        </p>

        {/* Onglets */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.12)', borderRadius: 50, padding: 4, gap: 4 }}>
          {([
            { key: 'labo',      label: 'Laboratoire',  icon: 'fa-flask-vial' },
            { key: 'pharmacie', label: 'Pharmacie',     icon: 'fa-pills' },
          ] as const).map(o => (
            <button
              key={o.key}
              onClick={() => setOnglet(o.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 50, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                background: onglet === o.key ? 'white' : 'transparent',
                color: onglet === o.key ? '#0f172a' : 'rgba(255,255,255,0.8)',
              }}
            >
              <i className={`fa-solid ${o.icon}`} style={{ fontSize: 13 }} />
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu onglets */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 5% 80px' }}>

        {onglet === 'labo' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ccfbf1', color: '#0d9488', borderRadius: 50, padding: '5px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 10 }}>
                  <i className="fa-solid fa-flask-vial" style={{ fontSize: 11 }} /> Laboratoire
                </span>
                <h2 style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.4rem', marginBottom: 10 }}>
                  Examens disponibles
                </h2>
                <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: 14, margin: 0 }}>
                  Nos {EXAMENS.length} examens sont réalisés avec des équipements calibrés par des techniciens certifiés.
                  Le carrousel présente chaque examen avec son utilité et l'explication de l'assistant IA.
                </p>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: 14, padding: '14px 18px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, marginBottom: 6 }}>Délais de résultats</div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                  Urgents : <strong>2h</strong><br />
                  Standard : <strong>24–48h</strong><br />
                  Spéciaux : <strong>72h</strong>
                </div>
              </div>
            </div>

            <CarrouselExamens />

            <div style={{ marginTop: 32, padding: '20px 24px', background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
              <i className="fa-solid fa-circle-info" style={{ color: '#0d9488', fontSize: 20, flexShrink: 0 }} />
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                Une ordonnance médicale est requise pour certains examens. Présentez-vous au laboratoire avec votre ordonnance. Les prélèvements se font le matin à jeun pour les examens sanguins.
              </p>
            </div>
          </div>
        )}

        {onglet === 'pharmacie' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fee2e2', color: '#dc2626', borderRadius: 50, padding: '5px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 10 }}>
                  <i className="fa-solid fa-pills" style={{ fontSize: 11 }} /> Pharmacie
                </span>
                <h2 style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.4rem', marginBottom: 10 }}>
                  Médicaments disponibles
                </h2>
                <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: 14, margin: 0 }}>
                  Notre pharmacie honore vos ordonnances sur place. Le stock est mis à jour régulièrement.
                  Présentez votre ordonnance à la pharmacie.
                </p>
              </div>
              <div style={{ background: '#fef2f2', borderRadius: 14, padding: '14px 18px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 700, marginBottom: 6 }}>Horaires pharmacie</div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                  Lun – Sam : <strong>7h00 – 17h00</strong><br />
                  Dimanche : <strong>Fermé</strong>
                </div>
              </div>
            </div>

            <CarrouselPharmacie />

            <div style={{ marginTop: 32, padding: '20px 24px', background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
              <i className="fa-solid fa-circle-info" style={{ color: '#dc2626', fontSize: 20, flexShrink: 0 }} />
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                Les médicaments sur ordonnance ne sont délivrés que sur présentation d'une ordonnance valide d'un médecin de la clinique ou externe. Notre pharmacien vérifie les interactions médicamenteuses.
              </p>
            </div>
          </div>
        )}
      </section>

      <Footer />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>
    </>
  )
}
