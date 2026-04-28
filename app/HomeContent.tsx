'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'
import { LOGO_SRC } from '@/lib/images'

// ─── Données statiques ────────────────────────────────────────────────────────

const AVANTAGES = [
  { icon: 'fa-calendar-check', text: 'Gérer vos rendez-vous facilement' },
  { icon: 'fa-flask-vial',     text: "Consulter vos résultats d'analyses" },
  { icon: 'fa-comments',       text: 'Communiquer avec votre médecin' },
]

const SERVICES_GRILLE = [
  { titre: 'Clinique externe',  icon: 'fa-stethoscope',    href: '/specialites',             couleur: '#1641C8' },
  { titre: 'Laboratoire',       icon: 'fa-flask-vial',     href: '/services/laboratoire',    couleur: '#0d9488' },
  { titre: 'Dentisterie',       icon: 'fa-tooth',          href: '/services/dentisterie',    couleur: '#7c3aed' },
  { titre: 'Pharmacie',         icon: 'fa-pills',          href: '/services/pharmacie',      couleur: '#dc2626' },
  { titre: 'Physiothérapie',    icon: 'fa-person-walking', href: '/services/physiotherapie', couleur: '#d97706' },
  { titre: 'Optométrie',        icon: 'fa-glasses',        href: '/services/optometrie',     couleur: '#059669' },
  { titre: 'Maternité',         icon: 'fa-baby',           href: '/services/maternite',      couleur: '#be185d' },
  { titre: 'Salle SOP',         icon: 'fa-scalpel',        href: '/services/sop',            couleur: '#374151' },
  { titre: 'Gestes médicaux',   icon: 'fa-syringe',        href: '/services/gestes',         couleur: '#6366f1' },
]

// ─── Composant principal ──────────────────────────────────────────────────────

export default function HomeContent() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [nbSpec, setNbSpec]   = useState(30)

  useEffect(() => {
    specialistesApi.list()
      .then(r => { if (r.data?.length > 0) setNbSpec(r.data.length) })
      .catch(() => {})
  }, [])

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ══ HERO ══════════════════════════════════════════════════════════════
          Utilise les classes définies dans globals.css :
          .hero-section, .hero-left, .hero-right, .hero-photo-wrap,
          .hero-float, .hero-title, .hero-desc, .hero-stats
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="hero-section" style={{ background: '#f4f7ff' }}>

        {/* Blobs de fond animés */}
        <div className="hero-bg-blobs">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>

        {/* ── Colonne gauche ── */}
        <div className="hero-left">

          {/* Logo */}
          <div style={{ marginBottom: 32 }}>
            <img
              src={LOGO_SRC}
              alt="Clinique de la Rebecca"
              className="logo-img"
              style={{ height: 60 }}
              onError={(e) => {
                const el = e.target as HTMLImageElement
                el.style.display = 'none'
              }}
            />
          </div>

          {/* Titre principal — reproduction exacte de la maquette */}
          <h1 className="hero-title" style={{ marginBottom: 8 }}>
            Bienvenue à la<br />
            <span className="hero-title-accent">Clinique de la Rebecca</span>
          </h1>

          {/* Sous-titre */}
          <p style={{
            color: '#64748b',
            fontSize: 16,
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: '2px solid #e2e8f0',
            maxWidth: 420,
          }}>
            Votre espace santé personnel
          </p>

          {/* Avantages avec coches vertes — identique à la maquette */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
            {AVANTAGES.map(a => (
              <div key={a.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#0d9488',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <i className="fa-solid fa-check" style={{ color: 'white', fontSize: 11 }} />
                </div>
                <span style={{ color: '#334155', fontSize: '1rem', fontWeight: 500 }}>{a.text}</span>
              </div>
            ))}
          </div>

          {/* Boutons CTA */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
            <button
              onClick={() => setRdvOpen(true)}
              className="btn-primary btn-glow"
              style={{ borderRadius: 10, padding: '14px 28px' }}
            >
              <i className="fa-regular fa-circle-play" style={{ fontSize: 17 }} />
              Prendre rendez-vous
            </button>

            <Link
              href="/specialites"
              className="btn-secondary"
              style={{ borderRadius: 10, padding: '13px 24px', fontSize: '0.95rem' }}
            >
              Nos spécialistes
            </Link>
          </div>

          {/* Stats rapides */}
          <div style={{
            paddingTop: 28,
            borderTop: '1px solid #e2e8f0',
          }}>
            <div className="hero-stats">
              {[
                { val: `${nbSpec}+`, label: 'Médecins' },
                { val: '9',          label: 'Services' },
                { val: '12',         label: 'Spécialités' },
                { val: '6j/7',       label: 'Disponible' },
              ].map(s => (
                <div className="hero-stat-item" key={s.label}>
                  <span className="hero-stat-num">{s.val}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Colonne droite — photo réception ── */}
        <div className="hero-right">
          <div className="hero-photo-wrap">
            <img
              src="/reception.jpg"
              alt="Réception Clinique de la Rebecca"
              className="hero-photo"
              onError={(e) => {
                const el = e.target as HTMLImageElement
                if (el.parentElement) {
                  el.parentElement.style.background =
                    'linear-gradient(160deg,#1641C8 0%,#0d9488 100%)'
                }
                el.style.display = 'none'
              }}
            />
            {/* Overlay doux */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, rgba(244,247,255,0.18), transparent)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Floating card — disponibilité */}
          <div className="hero-float hero-float-top">
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg,#1641C8,#0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fa-solid fa-clock" style={{ color: 'white', fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>Ouvert maintenant</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Lun – Sam · 7h00 – 17h00</div>
            </div>
          </div>

          {/* Floating card — satisfaction */}
          <div className="hero-float hero-float-bottom">
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fa-solid fa-star" style={{ color: 'white', fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>4.9 / 5 · Patients satisfaits</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>+1 200 avis vérifiés</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '80px 8%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* En-tête section */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-tag">
              <i className="fa-solid fa-grid-2" />
              Nos 9 services
            </span>
            <h2 className="section-title">
              Des soins complets <em>sous un même toit</em>
            </h2>
            <p className="section-sub" style={{ maxWidth: 480, margin: '0 auto' }}>
              De la consultation médicale à la chirurgie, en passant par le laboratoire et la pharmacie.
            </p>
          </div>

          {/* Grille services */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
            gap: 16,
          }}>
            {SERVICES_GRILLE.map(s => (
              <Link key={s.titre} href={s.href} style={{ textDecoration: 'none' }}>
                <div
                  className="card-hover"
                  style={{ padding: '22px 18px', textAlign: 'center', cursor: 'pointer' }}
                  onMouseEnter={e => {
                    const d = e.currentTarget
                    d.style.borderColor = s.couleur + '50'
                    d.style.background  = s.couleur + '06'
                    d.style.boxShadow   = `0 8px 28px ${s.couleur}20`
                  }}
                  onMouseLeave={e => {
                    const d = e.currentTarget
                    d.style.borderColor = ''
                    d.style.background  = ''
                    d.style.boxShadow   = ''
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: s.couleur + '14',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color: s.couleur, fontSize: 20 }} />
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13.5, lineHeight: 1.35 }}>
                    {s.titre}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Lien vers tous les services */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/services" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
              <i className="fa-solid fa-arrow-right" />
              Voir tous nos services
            </Link>
          </div>
        </div>
      </section>

      {/* ══ POURQUOI NOUS ═════════════════════════════════════════════════════ */}
      <section style={{ background: '#f8fafc', padding: '72px 8%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-tag">
              <i className="fa-solid fa-heart-pulse" />
              Pourquoi nous choisir
            </span>
            <h2 className="section-title">
              Une clinique <em>à votre écoute</em>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 24,
          }}>
            {[
              { icon: 'fa-user-doctor',  couleur: '#1641C8', titre: 'Médecins spécialisés',    desc: 'Plus de 30 médecins et spécialistes expérimentés disponibles 6 jours sur 7.' },
              { icon: 'fa-flask-vial',   couleur: '#0d9488', titre: 'Laboratoire sur place',    desc: 'Résultats rapides disponibles directement dans votre espace patient en ligne.' },
              { icon: 'fa-video',        couleur: '#7c3aed', titre: 'Consultation vidéo',       desc: 'Consultez votre médecin depuis chez vous, en toute sécurité et confidentialité.' },
              { icon: 'fa-shield-heart', couleur: '#be185d', titre: 'Suivi personnalisé',       desc: 'Dossier médical numérique, rappels automatiques et communication directe.' },
            ].map(c => (
              <div key={c.titre} className="card" style={{ padding: '28px 24px' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: c.couleur + '14',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                }}>
                  <i className={`fa-solid ${c.icon}`} style={{ color: c.couleur, fontSize: 22 }} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 8 }}>
                  {c.titre}
                </h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ═════════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0f1e3d 0%, #1641C8 60%, #0d9488 100%)',
        padding: '80px 8%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 250, height: 250, borderRadius: '50%',
          background: 'rgba(13,148,136,0.15)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.85)',
            borderRadius: 50, padding: '5px 16px',
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 20,
            border: '1px solid rgba(255,255,255,0.18)',
          }}>
            <i className="fa-solid fa-calendar-check" />
            Disponible maintenant
          </span>

          <h2 style={{
            color: 'white', fontWeight: 900,
            fontSize: 'clamp(1.6rem,3vw,2.4rem)',
            marginBottom: 16, lineHeight: 1.2,
          }}>
            Prenez soin de vous<br />dès aujourd&apos;hui
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, marginBottom: 36, fontSize: 15 }}>
            Consultation en cabinet ou par vidéo, disponible 6 jours sur 7.
            Notre équipe vous accueille avec bienveillance.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setRdvOpen(true)}
              className="btn-outline-white"
              style={{ background: 'white', color: '#1641C8', border: 'none', fontWeight: 800 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
            >
              <i className="fa-regular fa-calendar-check" />
              Prendre rendez-vous
            </button>
            <Link href="/consultation" className="btn-outline-white">
              <i className="fa-solid fa-video" />
              Consultation en ligne
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
