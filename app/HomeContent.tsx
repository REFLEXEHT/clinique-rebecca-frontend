'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { specialistesApi } from '@/lib/api'

const AVANTAGES = [
  { icon: 'fa-calendar-check', text: 'Gérer vos rendez-vous facilement' },
  { icon: 'fa-flask',          text: "Consulter vos résultats d'analyses" },
  { icon: 'fa-video',          text: 'Communiquer avec votre médecin' },
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

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 70px)',
        marginTop: 70,
        background: '#eef2fb',
      }}>

        {/* ── Colonne gauche ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '64px 6% 64px 8%',
        }}>

          {/* Logo */}
          <div style={{ marginBottom: 32 }}>
            <img
              src="/logo.png"
              alt="Clinique de la Rebecca"
              style={{ height: 72, width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Titre */}
          <h1 style={{
            fontWeight: 900,
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            color: '#0f1e3d',
            lineHeight: 1.2,
            marginBottom: 14,
          }}>
            Bienvenue à la<br />
            <span style={{ color: '#1641C8' }}>Clinique de la Rebecca</span>
          </h1>

          {/* Sous-titre */}
          <p style={{
            color: '#64748b',
            fontSize: '1.05rem',
            marginBottom: 28,
            paddingBottom: 28,
            borderBottom: '2px solid #dde3f0',
          }}>
            Votre espace santé personnel
          </p>

          {/* Avantages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 40 }}>
            {AVANTAGES.map(a => (
              <div key={a.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#1641C8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <i className={`fa-solid ${a.icon}`} style={{ color: 'white', fontSize: 14 }} />
                </div>
                <span style={{ color: '#334155', fontSize: '1rem', fontWeight: 500 }}>{a.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Boutons */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => setRdvOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#1641C8', color: 'white',
                border: 'none', borderRadius: 12,
                padding: '15px 32px',
                fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(22,65,200,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0f2fa3'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1641C8'; e.currentTarget.style.transform = 'none' }}
            >
              <i className="fa-regular fa-calendar-check" style={{ fontSize: 16 }} />
              Prendre rendez-vous
            </button>

            <Link href="/specialites" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'white', color: '#1641C8',
              border: '2px solid #1641C8', borderRadius: 12,
              padding: '14px 26px',
              fontWeight: 700, fontSize: '0.95rem',
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white' }}>
              Nos spécialistes
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 36, marginTop: 48,
            paddingTop: 28, borderTop: '1px solid #dde3f0',
          }}>
            {[
              { val: `${nbSpec}+`, label: 'Médecins' },
              { val: '9',          label: 'Services' },
              { val: '12',         label: 'Spécialités' },
              { val: '6j/7',       label: 'Disponible' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#1641C8' }}>{s.val}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Colonne droite : photo réception ── */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src="/reception.jpg"
            alt="Réception Clinique de la Rebecca"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              display: 'block',
            }}
            onError={(e) => {
              const el = e.target as HTMLImageElement
              el.parentElement!.style.background = 'linear-gradient(160deg,#1641C8 0%,#0d9488 100%)'
              el.style.display = 'none'
            }}
          />
          {/* Léger fondu gauche pour transition fluide */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(238,242,251,0.18), transparent)',
            pointerEvents: 'none',
          }} />
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '80px 8%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{
              display: 'inline-block',
              background: '#eff6ff', color: '#1641C8',
              borderRadius: 50, padding: '5px 18px',
              fontSize: 12, fontWeight: 700, letterSpacing: 1,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              Nos 9 services
            </div>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.5rem,2.5vw,2.1rem)', color: '#0f172a', marginBottom: 10 }}>
              Des soins complets <em style={{ color: '#1641C8', fontStyle: 'normal' }}>sous un même toit</em>
            </h2>
            <p style={{ color: '#64748b', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
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
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: '24px 18px',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const d = e.currentTarget
                    d.style.borderColor = s.couleur + '60'
                    d.style.background = s.couleur + '0a'
                    d.style.transform = 'translateY(-4px)'
                    d.style.boxShadow = `0 10px 28px ${s.couleur}20`
                  }}
                  onMouseLeave={e => {
                    const d = e.currentTarget
                    d.style.borderColor = '#e2e8f0'
                    d.style.background = '#f8fafc'
                    d.style.transform = 'none'
                    d.style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: s.couleur + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color: s.couleur, fontSize: 20 }} />
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13.5 }}>{s.titre}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ═════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0f1e3d 0%, #1641C8 60%, #0d9488 100%)',
        padding: '72px 8%',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.5rem,3vw,2.2rem)', marginBottom: 14 }}>
            Prenez soin de vous dès aujourd'hui
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, marginBottom: 32 }}>
            Consultation en cabinet ou par vidéo, disponible 6 jours sur 7.
            Notre équipe vous accueille avec bienveillance.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setRdvOpen(true)}
              style={{
                background: 'white', color: '#1641C8', border: 'none',
                borderRadius: 12, padding: '14px 32px',
                fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
            >
              Prendre rendez-vous
            </button>
            <Link href="/consultation" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.12)', color: 'white',
              border: '1.5px solid rgba(255,255,255,0.35)',
              borderRadius: 12, padding: '13px 26px',
              fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)' }}>
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
