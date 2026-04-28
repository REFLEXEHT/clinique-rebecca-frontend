'use client'
/**
 * HomeContent.tsx — Page d'accueil Clinique de la Rebecca
 * Design fidèle à la maquette : hero split 50/50, photo réception, floating cards,
 * grille services, section CTA dégradé.
 * Logique conservée à 100% (Navbar, Footer, RdvModal, specialistesApi, LOGO_SRC).
 */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'
import { LOGO_SRC } from '@/lib/images'

// ─── Données ──────────────────────────────────────────────────────────────────

const AVANTAGES = [
  'Gérer vos rendez-vous facilement',
  "Consulter vos résultats d'analyses",
  'Communiquer avec votre médecin',
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

const ATOUTS = [
  { icon: 'fa-user-doctor',  couleur: '#1641C8', titre: 'Médecins spécialisés',  desc: 'Plus de 30 médecins et spécialistes disponibles 6 jours sur 7.' },
  { icon: 'fa-flask-vial',   couleur: '#0d9488', titre: 'Laboratoire sur place', desc: 'Résultats rapides accessibles depuis votre espace patient en ligne.' },
  { icon: 'fa-video',        couleur: '#7c3aed', titre: 'Consultation vidéo',    desc: 'Consultez votre médecin depuis chez vous en toute sécurité.' },
  { icon: 'fa-shield-heart', couleur: '#be185d', titre: 'Suivi personnalisé',    desc: 'Dossier médical numérique et rappels automatiques de rendez-vous.' },
]

// ─── Composant principal ──────────────────────────────────────────────────────

export default function HomeContent() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [nbSpec, setNbSpec]   = useState(30)

  // Charge le nombre réel de spécialistes depuis l'API
  useEffect(() => {
    specialistesApi.list()
      .then(r => { if (r.data?.length > 0) setNbSpec(r.data.length) })
      .catch(() => {})
  }, [])

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Split 50/50 comme la maquette
          Gauche : logo + titre + avantages + CTA + stats
          Droite : photo réception + floating cards
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="hero-section">

        {/* Blobs décoratifs animés (définis dans globals.css) */}
        <div className="hero-bg-blobs">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>

        {/* ── Colonne gauche ───────────────────────────────────────────────── */}
        <div className="hero-left">

          {/* Logo — fond transparent, pointe vers /public/logo.png */}
          <div style={{ marginBottom: 28 }}>
            <img
              src={LOGO_SRC}
              alt="Clinique de la Rebecca"
              className="logo-img"
              onError={(e) => {
                // Si logo.png absent, masque l'image (la navbar a son propre fallback)
                const el = e.target as HTMLImageElement
                el.style.display = 'none'
              }}
            />
          </div>

          {/* Titre principal */}
          <h1 className="hero-title">
            Bienvenue à la<br />
            <span className="hero-title-accent">Clinique de la Rebecca</span>
          </h1>

          {/* Sous-titre avec séparateur */}
          <p style={{
            color: '#64748b', fontSize: 16, lineHeight: 1.6,
            marginBottom: 24, paddingBottom: 24,
            borderBottom: '2px solid #e2e8f0',
            maxWidth: 440,
          }}>
            Votre espace santé personnel
          </p>

          {/* Avantages — 3 coches vertes comme la maquette */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 36 }}>
            {AVANTAGES.map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: '#0d9488', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="fa-solid fa-check" style={{ color: 'white', fontSize: 10 }} />
                </div>
                <span style={{ color: '#334155', fontSize: '0.97rem', fontWeight: 500 }}>{a}</span>
              </div>
            ))}
          </div>

          {/* Boutons CTA */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
            <button
              onClick={() => setRdvOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#1641C8', color: 'white',
                border: 'none', borderRadius: 10, padding: '14px 28px',
                fontWeight: 700, fontSize: '0.97rem', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(22,65,200,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0f2fa3'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#1641C8'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <i className="fa-regular fa-circle-play" style={{ fontSize: 17 }} />
              Prendre rendez-vous
            </button>

            <Link
              href="/specialites"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'white', color: '#1641C8',
                border: '2px solid #1641C8', borderRadius: 10,
                padding: '13px 22px', fontWeight: 700, fontSize: '0.93rem',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white' }}
            >
              Nos spécialistes
            </Link>
          </div>

          {/* Stats rapides */}
          <div style={{ paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
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

        {/* ── Colonne droite — photo réception ─────────────────────────────── */}
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
                    'linear-gradient(160deg, #1641C8 0%, #0d9488 100%)'
                }
                el.style.display = 'none'
              }}
            />
            {/* Overlay doux */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(to right, rgba(244,247,255,0.12), transparent)',
            }} />
          </div>

          {/* Floating card — horaires */}
          <div className="hero-float hero-float-top">
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #1641C8, #0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fa-solid fa-clock" style={{ color: 'white', fontSize: 15 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', lineHeight: 1.2 }}>
                Ouvert maintenant
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                Lun – Sam &middot; 7h00 – 17h00
              </div>
            </div>
          </div>

          {/* Floating card — avis patients */}
          <div className="hero-float hero-float-bottom">
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fa-solid fa-star" style={{ color: 'white', fontSize: 15 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', lineHeight: 1.2 }}>
                4.9 / 5
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                +1 200 patients satisfaits
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SERVICES — grille 9 services
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '80px 8%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
            gap: 16,
          }}>
            {SERVICES_GRILLE.map(s => (
              <Link key={s.titre} href={s.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 16, padding: '22px 18px',
                    textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer',
                    height: '100%',
                  }}
                  onMouseEnter={e => {
                    const d = e.currentTarget
                    d.style.borderColor = s.couleur + '55'
                    d.style.background  = s.couleur + '07'
                    d.style.transform   = 'translateY(-3px)'
                    d.style.boxShadow   = `0 8px 24px ${s.couleur}20`
                  }}
                  onMouseLeave={e => {
                    const d = e.currentTarget
                    d.style.borderColor = '#e2e8f0'
                    d.style.background  = '#f8fafc'
                    d.style.transform   = 'none'
                    d.style.boxShadow   = 'none'
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 13,
                    background: s.couleur + '14',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 13px',
                  }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color: s.couleur, fontSize: 20 }} />
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13.5, lineHeight: 1.3 }}>
                    {s.titre}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          POURQUOI NOUS — 4 cartes atouts
      ══════════════════════════════════════════════════════════════════════ */}
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
            {ATOUTS.map(c => (
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

      {/* ══════════════════════════════════════════════════════════════════════
          CTA FINAL — dégradé bleu marine
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0f1e3d 0%, #1641C8 60%, #0d9488 100%)',
        padding: '80px 8%', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 250, height: 250, borderRadius: '50%',
          background: 'rgba(13,148,136,0.15)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)',
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
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            marginBottom: 16, lineHeight: 1.2,
          }}>
            Prenez soin de vous<br />
            dès aujourd&apos;hui
          </h2>

          <p style={{
            color: 'rgba(255,255,255,0.72)', lineHeight: 1.75,
            marginBottom: 36, fontSize: 15,
          }}>
            Consultation en cabinet ou par vidéo, disponible 6 jours sur 7.
            Notre équipe vous accueille avec bienveillance.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setRdvOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                background: 'white', color: '#1641C8', border: 'none',
                borderRadius: 10, padding: '14px 28px',
                fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
            >
              <i className="fa-regular fa-calendar-check" />
              Prendre rendez-vous
            </button>

            <Link
              href="/consultation"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.12)', color: 'white',
                border: '1.5px solid rgba(255,255,255,0.35)',
                borderRadius: 10, padding: '13px 24px',
                fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'
              }}
            >
              <i className="fa-solid fa-video" style={{ fontSize: 14 }} />
              Consultation en ligne
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
