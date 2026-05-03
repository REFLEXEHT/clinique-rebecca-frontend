'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LangContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, aiApi } from '@/lib/api'
import { LogOut, Calendar, Pill, FlaskConical, Star, ChevronDown, ChevronUp } from 'lucide-react'

type Onglet = 'accueil' | 'rdv' | 'prescriptions' | 'resultats' | 'avis'

const STATUT_RDV: Record<string, { label: string; color: string; bg: string }> = {
  confirme:             { label: '✓ Confirmé',             color: '#16a34a', bg: '#f0fdf4' },
  en_attente:           { label: '⏳ En attente',           color: '#d97706', bg: '#fffbeb' },
  paiement_requis:      { label: '💳 Paiement requis',     color: '#7c3aed', bg: '#f5f3ff' },
  paiement_effectue:    { label: '💳 Paiement reçu',       color: '#0d9488', bg: '#f0fdfa' },
  propose_autre_moment: { label: '📅 Autre moment proposé', color: '#d97706', bg: '#fffbeb' },
  annule:               { label: '✕ Annulé',               color: '#dc2626', bg: '#fef2f2' },
  termine:              { label: '✓ Terminé',               color: '#64748b', bg: '#f8fafc' },
}

export default function PatientDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const { lang } = useLang()
  const router = useRouter()
  const [onglet, setOnglet] = useState<Onglet>('accueil')
  const [data,   setData]   = useState<any>(null)
  const [synth,  setSynth]  = useState<Record<number, string>>({})
  const [loadSy, setLoadSy] = useState<number | null>(null)
  const [noteVisite, setNoteVisite] = useState(0)
  const [commentaire, setCommentaire] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/patient/mon-dossier').then(r => setData(r.data)).catch(() => {})
  }, [isAuthenticated])

  // IA génère UN résumé très court (1-2 phrases) sans diagnostic précis
  // On envoie seulement : spécialité + service — jamais le contenu médical
  const genererResume = async (visite: any) => {
    if (synth[visite.id]) return
    setLoadSy(visite.id)
    try {
      const j = await aiApi.chat([{
        role: 'user',
        content: `En 1 phrase simple et rassurante (max 20 mots), résume ce que représente une visite en ${visite.specialite || 'consultation médicale'} dans une clinique. Pas de diagnostic. Commence par "Vous avez consulté..."`
      }], { max_tokens: 120 })
      setSynth(prev => ({ ...prev, [visite.id]: j.content?.[0]?.text || '' }))
    } catch { /**/ }
    finally { setLoadSy(null) }
  }
  const soumettreAvis = async (visite_id: number) => {
    if (!noteVisite) return
    try {
      await api.post('/patient/avis', { note: noteVisite, commentaire, dossier_id: visite_id })
      setNoteVisite(0); setCommentaire('')
      alert('Merci pour votre avis !')
    } catch { alert('Erreur') }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #1641C8', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  const T = {
    accueil:    { fr:'Mon espace',      en:'My space',        ht:'Espas mwen',      es:'Mi espacio'     },
    rdv:        { fr:'RDV',             en:'Appointments',    ht:'Randevou',         es:'Citas'          },
    meds:       { fr:'Mes médicaments', en:'My medications',  ht:'Medikaman mwen',   es:'Mis medicamentos'},
    results:    { fr:'Mes résultats',   en:'My results',      ht:'Rezilta mwen',     es:'Mis resultados' },
    avis:       { fr:'Mon avis',        en:'My review',       ht:'Avis mwen',        es:'Mi opinión'     },
  } as const
  type TLang = 'fr'|'en'|'ht'|'es'
  const tl = (k: keyof typeof T) => T[k][(lang as TLang) in T[k] ? lang as TLang : 'fr']
  
  const NAV = [
    { k: 'accueil',      icon: '🏠', label: tl('accueil') },
    { k: 'rdv',          icon: '📅', label: `${tl('rdv')}${data?.rdv_a_venir?.length ? ` (${data.rdv_a_venir.length})` : ''}` },
    { k: 'prescriptions',icon: '💊', label: tl('meds') },
    { k: 'resultats',    icon: '🔬', label: tl('results') },
    { k: 'avis',         icon: '⭐', label: tl('avis') },
  ] as const

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* NAVBAR */}
      <div style={{ background: 'linear-gradient(135deg,#0f1e3d,#1641C8)', height: 60, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>{user?.nom}</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
            {data?.numero_patient && (
              <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.85)', fontWeight: 700, marginRight: 8 }}>
                {data.numero_patient}
              </span>
            )}
            Patient
          </div>
        </div>
        <Link href="/consultation" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 700, fontSize: 12, border: '1px solid rgba(255,255,255,0.2)' }}>
          {lang==='en'?'+ Book':lang==='ht'?'+ Rezève':lang==='es'?'+ Reservar':'+ Prendre RDV'}
        </Link>
        <button onClick={() => { logout(); router.push('/') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '6px 10px' }}>
          <LogOut size={16} />
        </button>
      </div>

      {/* TABS */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 12px', display: 'flex', gap: 2, overflowX: 'auto' }}>
        {NAV.map(n => (
          <button key={n.k} onClick={() => setOnglet(n.k as Onglet)} style={{
            padding: '12px 14px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
            color: onglet === n.k ? '#1641C8' : '#64748b',
            borderBottom: onglet === n.k ? '2px solid #1641C8' : '2px solid transparent',
          }}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px' }}>

        {/* ── MON ESPACE ─────────────────────────────────────────── */}
        {onglet === 'accueil' && (
          <div>
            {/* Carte identité patient */}
            <div style={{ background: 'linear-gradient(135deg,#0f1e3d,#1641C8)', borderRadius: 16, padding: 20, marginBottom: 16, color: 'white' }}>
              <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{lang==='en'?'Your patient ID':lang==='ht'?'Nimewo pasyan ou':lang==='es'?'Su número de paciente':'Votre numéro patient'}</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '2rem', letterSpacing: 2, marginBottom: 10 }}>
                {data?.numero_patient || '—'}
              </div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>{lang==='en'?'Present this number at reception and to the nurse.':lang==='ht'?'Prezante nimewo sa a nan resepsyon ak enfimyè a.':lang==='es'?'Presente este número en recepción y a la enfermera.':"Présentez ce numéro à l'accueil et à l'infirmière."}</div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { icon: '🏥', label: 'Visites', val: data?.nb_visites || 0, tab: 'accueil' },
                { icon: '📅', label: 'RDV à venir', val: data?.rdv_a_venir?.length || 0, tab: 'rdv' },
                { icon: '💊', label: 'Prescriptions actives', val: data?.prescriptions_actives?.length || 0, tab: 'prescriptions' },
                { icon: '🔬', label: 'Résultats disponibles', val: data?.resultats_labo?.length || 0, tab: 'resultats' },
              ].map(s => (
                <div key={s.label}
                  onClick={() => s.tab !== 'accueil' && setOnglet(s.tab as Onglet)}
                  style={{ background: 'white', borderRadius: 12, padding: '16px 14px', border: '1px solid #e2e8f0', textAlign: 'center', cursor: s.tab !== 'accueil' ? 'pointer' : 'default' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0f172a' }}>{s.val}</div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Prochain RDV */}
            {data?.rdv_a_venir?.[0] && (() => {
              const r = data.rdv_a_venir[0]
              const s = STATUT_RDV[r.statut] || STATUT_RDV.en_attente
              return (
                <div style={{ background: 'white', borderRadius: 14, padding: 16, border: '2px solid #1641C8', marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#1641C8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Prochain rendez-vous</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{r.specialite}</div>
                      <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                        {new Date(r.date_rdv).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {r.medecin_nom && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Dr {r.medecin_nom}</div>}
                    </div>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 50, padding: '4px 12px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                  {r.lien_video && (
                    <a href={r.lien_video} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-block', marginTop: 12, background: '#7c3aed', color: 'white', textDecoration: 'none', borderRadius: 10, padding: '9px 20px', fontWeight: 700, fontSize: 13 }}>
                      📹 Rejoindre la vidéo
                    </a>
                  )}
                  {r.statut === 'paiement_requis' && (
                    <div style={{ background: '#f5f3ff', borderRadius: 8, padding: '10px 14px', marginTop: 10, fontSize: 12, color: '#7c3aed' }}>
                      💳 Un paiement est requis pour confirmer ce RDV en ligne. Contactez-nous : (509) 4858-5757
                    </div>
                  )}
                  {r.autre_moment_propose && (
                    <div style={{ background: '#fffbeb', borderRadius: 8, padding: '10px 14px', marginTop: 10, fontSize: 12, color: '#92400e' }}>
                      📅 Le médecin propose un autre moment : <strong>{r.autre_moment_propose}</strong>
                      {r.autre_moment_message && <div style={{ marginTop: 4, opacity: 0.8 }}>{r.autre_moment_message}</div>}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Historique visites — résumé IA bref UNIQUEMENT */}
            {data?.visites?.length > 0 && (
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 14 }}>
                  Mes visites ({data.nb_visites})
                </div>
                {data.visites.slice(0, 5).map((v: any) => (
                  <VisiteResumee key={v.id} visite={v} synthese={synth[v.id]} loadSy={loadSy} onResume={genererResume} />
                ))}
                {data.visites.length > 5 && (
                  <div style={{ padding: '12px 18px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>et {data.visites.length - 5} visite(s) précédente(s)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MES RDV ─────────────────────────────────────────────── */}
        {onglet === 'rdv' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 900, fontSize: '1.2rem', margin: 0 }}>📅 Mes rendez-vous</h2>
              <Link href="/consultation" style={{ background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', textDecoration: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 12 }}>
                {lang==='en'?'+ New':lang==='ht'?'+ Nouvo':lang==='es'?'+ Nuevo':'+ Nouveau'}
              </Link>
            </div>

            {data?.rdv_a_venir?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#1641C8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>À venir</div>
                {data.rdv_a_venir.map((r: any) => <RdvCard key={r.id} rdv={r} />)}
              </div>
            )}

            {data?.rdv_passes?.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Historique</div>
                {data.rdv_passes.map((r: any) => <RdvCard key={r.id} rdv={r} compact />)}
              </div>
            )}

            {!data?.rdv_a_venir?.length && !data?.rdv_passes?.length && (
              <Vide icon="📅" message="Aucun rendez-vous." cta={{ label: 'Prendre un RDV', href: '/consultation' }} />
            )}
          </div>
        )}

        {/* ── MÉDICAMENTS ─────────────────────────────────────────── */}
        {onglet === 'prescriptions' && (
          <div>
            <h2 style={{ fontWeight: 900, fontSize: '1.2rem', margin: '0 0 6px' }}>💊 Médicaments prescrits</h2>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
              Liste de vos médicaments des 3 derniers mois. Pour toute question, consultez votre médecin.
            </p>
            {!data?.prescriptions_actives?.length ? (
              <Vide icon="💊" message="Aucun médicament prescrit récemment." />
            ) : data.prescriptions_actives.map((p: any, i: number) => {
              let meds: any[] = []
              try { meds = JSON.parse(p.medicaments || '[]') } catch { meds = [] }
              return (
                <div key={i} style={{ background: 'white', borderRadius: 14, padding: 16, border: '1px solid #a7f3d0', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>Dr {p.medecin_nom || '—'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <span style={{ background: '#ecfdf5', color: '#16a34a', borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>Active</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {meds.length > 0 ? meds.map((m: any, j: number) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: '#374151' }}>{m.nom || m}</span>
                        <span style={{ color: '#64748b', fontSize: 12 }}>{m.posologie}{m.duree ? ` · ${m.duree}` : ''}</span>
                      </div>
                    )) : (
                      <div style={{ fontSize: 13, color: '#475569' }}>{p.medicaments}</div>
                    )}
                  </div>
                  <div style={{ background: '#fffbeb', borderRadius: 8, padding: '8px 12px', marginTop: 10, fontSize: 11, color: '#92400e' }}>
                    ⚠️ Prenez vos médicaments selon les instructions de votre médecin. Ne les arrêtez pas sans avis médical.
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── RÉSULTATS LABO ──────────────────────────────────────── */}
        {onglet === 'resultats' && (
          <div>
            <h2 style={{ fontWeight: 900, fontSize: '1.2rem', margin: '0 0 6px' }}>{lang==='en'?'🔬 Lab Results':lang==='ht'?'🔬 Rezilta Labo':lang==='es'?'🔬 Resultados de laboratorio':'🔬 Résultats de laboratoire'}</h2>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
              Vos valeurs brutes. L'interprétation médicale doit être faite par votre médecin.
            </p>
            {!data?.resultats_labo?.length ? (
              <Vide icon="🔬" message="Aucun résultat de laboratoire disponible." />
            ) : data.resultats_labo.map((r: any, i: number) => (
              <div key={i} style={{ background: 'white', borderRadius: 14, padding: 16, border: r.alerte_critique ? '1px solid #fca5a5' : '1px solid #e2e8f0', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.type_examen}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {r.alerte_critique && (
                      <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 50, padding: '2px 10px', fontSize: 10, fontWeight: 700 }}>🚨 Valeur à signaler</span>
                    )}
                    <span style={{ color: '#94a3b8', fontSize: 11 }}>
                      {new Date(r.date_examen).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#374151', fontFamily: 'monospace', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {r.resultats}
                </div>
                {r.alerte_critique && (
                  <div style={{ background: '#fef2f2', borderRadius: 8, padding: '8px 12px', marginTop: 10, fontSize: 12, color: '#dc2626' }}>
                    ⚠️ Ce résultat nécessite une consultation médicale. Contactez votre médecin.
                  </div>
                )}
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px', marginTop: 8, fontSize: 11, color: '#64748b' }}>
                  Ces résultats bruts doivent être interprétés par votre médecin lors d'une consultation.
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── AVIS ────────────────────────────────────────────────── */}
        {onglet === 'avis' && (
          <div>
            <h2 style={{ fontWeight: 900, fontSize: '1.2rem', margin: '0 0 6px' }}>⭐ Votre avis</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>Aidez-nous à améliorer nos services.</p>
            {!data?.visites?.filter((v: any) => v.statut === 'termine').length ? (
              <Vide icon="⭐" message="Aucune visite terminée à évaluer." />
            ) : data.visites.filter((v: any) => v.statut === 'termine').slice(0, 3).map((v: any) => (
              <div key={v.id} style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{v.specialite}</div>
                <div style={{ color: '#64748b', fontSize: 13, marginBottom: 14 }}>
                  {new Date(v.date_visite).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setNoteVisite(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: n <= noteVisite ? '#f59e0b' : '#e2e8f0', padding: 0 }}>★</button>
                  ))}
                </div>
                <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={3}
                  placeholder="Partagez votre expérience (facultatif)..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' as const, marginBottom: 12 }} />
                <button onClick={() => soumettreAvis(v.id)} disabled={!noteVisite}
                  style={{ background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: !noteVisite ? 0.5 : 1 }}>
                  Soumettre mon avis
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

// ── Sous-composants ───────────────────────────────────────────────────────

function VisiteResumee({ visite, synthese, loadSy, onResume }: {
  visite: any; synthese?: string; loadSy: number | null; onResume: (v: any) => void
}) {
  const [open, setOpen] = useState(false)
  const statutColor = visite.statut === 'termine' ? '#16a34a' : '#d97706'
  const statutBg    = visite.statut === 'termine' ? '#f0fdf4' : '#fffbeb'
  const statutLabel = visite.statut === 'termine' ? 'Terminée' : 'En cours'

  return (
    <div style={{ borderTop: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{visite.specialite}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
            {new Date(visite.date_visite).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <span style={{ background: statutBg, color: statutColor, borderRadius: 50, padding: '2px 10px', fontSize: 10, fontWeight: 700 }}>{statutLabel}</span>
        {open ? <ChevronUp size={13} color="#94a3b8" /> : <ChevronDown size={13} color="#94a3b8" />}
      </div>
      {open && (
        <div style={{ padding: '0 18px 14px' }}>
          {synthese ? (
            <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#1e40af', lineHeight: 1.6, border: '1px solid #bfdbfe' }}>
              🤖 {synthese}
            </div>
          ) : (
            <button onClick={() => onResume(visite)} disabled={loadSy === visite.id}
              style={{ background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: loadSy === visite.id ? 0.7 : 1 }}>
              {loadSy === visite.id ? '⏳ Génération...' : '🤖 Résumé de visite'}
            </button>
          )}
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
            Pour les détails médicaux complets, consultez votre médecin.
          </div>
        </div>
      )}
    </div>
  )
}

function RdvCard({ rdv, compact = false }: { rdv: any; compact?: boolean }) {
  const s = STATUT_RDV[rdv.statut] || STATUT_RDV.en_attente
  if (compact) return (
    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #e2e8f0', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{rdv.specialite}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          {new Date(rdv.date_rdv).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          {rdv.medecin_nom && ` · Dr ${rdv.medecin_nom}`}
        </div>
      </div>
      <span style={{ background: s.bg, color: s.color, borderRadius: 50, padding: '3px 10px', fontSize: 10, fontWeight: 700 }}>{s.label}</span>
    </div>
  )
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{rdv.specialite}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            {new Date(rdv.date_rdv).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </div>
          {rdv.medecin_nom && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Dr {rdv.medecin_nom}</div>}
          {rdv.motif && <div style={{ fontSize: 12, color: '#94a3b8' }}>Motif : {rdv.motif}</div>}
        </div>
        <span style={{ background: s.bg, color: s.color, borderRadius: 50, padding: '4px 12px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</span>
      </div>
      {rdv.lien_video && (
        <a href={rdv.lien_video} target="_blank" rel="noreferrer"
          style={{ display: 'inline-block', background: '#7c3aed', color: 'white', textDecoration: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 12 }}>
          📹 Rejoindre la consultation vidéo
        </a>
      )}
      {rdv.statut === 'paiement_requis' && (
        <div style={{ background: '#f5f3ff', borderRadius: 8, padding: '10px 14px', marginTop: 8, fontSize: 12, color: '#7c3aed' }}>
          💳 Un paiement est requis avant confirmation. Contactez-nous : (509) 4858-5757
        </div>
      )}
      {rdv.autre_moment_propose && (
        <div style={{ background: '#fffbeb', borderRadius: 8, padding: '10px 14px', marginTop: 8, fontSize: 12, color: '#92400e' }}>
          📅 Nouveau créneau proposé : <strong>{rdv.autre_moment_propose}</strong>
          {rdv.autre_moment_message && <div style={{ marginTop: 4 }}>{rdv.autre_moment_message}</div>}
        </div>
      )}
    </div>
  )
}

function Vide({ icon, message, cta }: { icon: string; message: string; cta?: { label: string; href: string } }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 48, textAlign: 'center', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p style={{ color: '#64748b', margin: '0 0 12px' }}>{message}</p>
      {cta && <Link href={cta.href} style={{ color: '#1641C8', fontWeight: 700, fontSize: 13 }}>{cta.label} →</Link>}
    </div>
  )
}
