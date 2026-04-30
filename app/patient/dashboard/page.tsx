'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { LogOut, User, Calendar, FileText, Pill, Star, ChevronRight } from 'lucide-react'

type Onglet = 'accueil' | 'rdv' | 'resultats' | 'prescriptions' | 'avis'

export default function PatientDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [onglet,        setOnglet]        = useState<Onglet>('accueil')
  const [dossier,       setDossier]       = useState<any>(null)
  const [rdvList,       setRdvList]       = useState<any[]>([])
  const [synthese,      setSynthese]      = useState('')
  const [loadingSynth,  setLoadingSynth]  = useState(false)
  const [noteRdv,       setNoteRdv]       = useState<number>(0)
  const [commentaire,   setCommentaire]   = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    // Load patient data
    api.get('/patient/mon-dossier').then(r => setDossier(r.data)).catch(() => {})
    api.get('/rdv/mes-rdv').then(r => setRdvList(r.data || [])).catch(() => {})
  }, [isAuthenticated])

  const genererSynthese = async () => {
    if (!dossier) return
    setLoadingSynth(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Tu es un assistant médical. Génère un résumé simplifié et rassurant pour un patient de son dernier dossier médical. Données: ${JSON.stringify(dossier?.dossiers?.[0] || {})}. En 3-4 phrases, explique simplement ce qui s'est passé lors de sa dernière visite, sans jargon médical.`
          }]
        })
      })
      const data = await res.json()
      setSynthese(data.content?.[0]?.text || '')
    } catch { setSynthese('') }
    finally { setLoadingSynth(false) }
  }

  const soumettreAvis = async (rdv_id: number) => {
    if (!noteRdv) return
    try {
      await api.post('/patient/avis', { note: noteRdv, commentaire, dossier_id: rdv_id })
      setNoteRdv(0); setCommentaire('')
      alert('Merci pour votre avis !')
    } catch { alert('Erreur') }
  }

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid #1641C8', borderTopColor:'transparent', animation:'spin 1s linear infinite' }} /></div>

  const NAV = [
    { k:'accueil',       icon:<User size={14}/>,       label:'Mon espace' },
    { k:'rdv',           icon:<Calendar size={14}/>,   label:'Mes RDV' },
    { k:'resultats',     icon:<FileText size={14}/>,   label:'Résultats & Prescriptions' },
    { k:'avis',          icon:<Star size={14}/>,        label:'Donner un avis' },
  ] as const

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      {/* Navbar */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8)', height:58, display:'flex', alignItems:'center', padding:'0 24px', gap:14 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>👤</div>
        <div>
          <div style={{ color:'white', fontWeight:800, fontSize:14 }}>{user?.nom}</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11 }}>Patient · {user?.email}</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
          <Link href="/consultation" style={{ background:'white', color:'#1641C8', textDecoration:'none', borderRadius:8, padding:'7px 14px', fontWeight:700, fontSize:12 }}>
            + Prendre RDV
          </Link>
          <button onClick={() => { logout(); router.push('/') }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ background:'white', borderBottom:'1px solid #e2e8f0', padding:'0 24px', display:'flex', gap:4 }}>
        {NAV.map(n => (
          <button key={n.k} onClick={() => setOnglet(n.k as Onglet)} style={{
            padding:'14px 16px', border:'none', background:'transparent', cursor:'pointer',
            fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:6,
            color: onglet === n.k ? '#1641C8' : '#64748b',
            borderBottom: onglet === n.k ? '2px solid #1641C8' : '2px solid transparent',
          }}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 20px' }}>

        {/* ── MON ESPACE ─────────────────────────────────────────── */}
        {onglet === 'accueil' && (
          <div>
            <h2 style={{ fontWeight:900, fontSize:'1.3rem', color:'#0f172a', marginBottom:20 }}>Bonjour, {user?.nom?.split(' ')[0]} 👋</h2>

            {/* Dernière visite avec synthèse IA */}
            {dossier?.dossiers?.[0] && (
              <div style={{ background:'white', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
                <h3 style={{ fontWeight:700, fontSize:15, color:'#0f172a', marginBottom:12 }}>📋 Dernière visite</h3>
                <div style={{ fontSize:13, color:'#64748b', marginBottom:8 }}>
                  {new Date(dossier.dossiers[0].date_visite).toLocaleDateString('fr-FR')} · {dossier.dossiers[0].specialite || dossier.dossiers[0].type_visite}
                </div>
                {dossier.dossiers[0].diagnostic && (
                  <div style={{ background:'#f8fafc', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#374151', marginBottom:12 }}>
                    <strong>Diagnostic :</strong> {dossier.dossiers[0].diagnostic}
                  </div>
                )}
                {!synthese ? (
                  <button onClick={genererSynthese} disabled={loadingSynth} style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                    {loadingSynth ? '⏳ Génération...' : '🤖 Résumé simplifié IA'}
                  </button>
                ) : (
                  <div style={{ background:'#eff6ff', borderRadius:10, padding:'12px 16px', fontSize:13, color:'#1e40af', lineHeight:1.7, border:'1px solid #bfdbfe' }}>
                    <strong>🤖 Résumé IA :</strong> {synthese}
                  </div>
                )}
              </div>
            )}

            {/* Stats rapides */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
              {[
                { icon:'🏥', label:'Dossiers', val: dossier?.dossiers?.length || 0 },
                { icon:'💊', label:'Prescriptions actives', val: dossier?.prescriptions_actives?.length || 0 },
                { icon:'🔬', label:'Résultats labo', val: dossier?.resultats_labo?.length || 0 },
              ].map(s => (
                <div key={s.label} style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #e2e8f0', textAlign:'center' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontWeight:900, fontSize:'1.5rem', color:'#0f172a' }}>{s.val}</div>
                  <div style={{ color:'#64748b', fontSize:12 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MES RDV ────────────────────────────────────────────── */}
        {onglet === 'rdv' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontWeight:900, fontSize:'1.3rem', color:'#0f172a', margin:0 }}>Mes rendez-vous</h2>
              <Link href="/consultation" style={{ background:'#1641C8', color:'white', textDecoration:'none', borderRadius:10, padding:'10px 18px', fontWeight:700, fontSize:13 }}>
                + Nouveau RDV
              </Link>
            </div>
            {rdvList.length === 0 ? (
              <div style={{ background:'white', borderRadius:16, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
                <Calendar size={40} color="#94a3b8" style={{ marginBottom:12 }} />
                <p style={{ color:'#64748b' }}>Aucun rendez-vous. <Link href="/consultation" style={{ color:'#1641C8', fontWeight:700 }}>Prendre un RDV</Link></p>
              </div>
            ) : rdvList.map((rdv: any) => (
              <div key={rdv.id} style={{ background:'white', borderRadius:14, padding:18, border:'1px solid #e2e8f0', marginBottom:10, display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Calendar size={20} color="#1641C8" />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#0f172a' }}>{rdv.medecin_nom || 'Médecin'}</div>
                  <div style={{ color:'#64748b', fontSize:13 }}>{new Date(rdv.date_rdv).toLocaleString('fr-FR')} · {rdv.type_rdv}</div>
                  <div style={{ color:'#64748b', fontSize:12 }}>{rdv.specialite}</div>
                </div>
                <span style={{ background: rdv.statut === 'confirme' ? '#f0fdf4' : '#fffbeb', color: rdv.statut === 'confirme' ? '#16a34a' : '#d97706', borderRadius:50, padding:'4px 12px', fontSize:12, fontWeight:700 }}>
                  {rdv.statut}
                </span>
                {rdv.lien_video && (
                  <a href={rdv.lien_video} target="_blank" style={{ background:'#7c3aed', color:'white', textDecoration:'none', borderRadius:8, padding:'6px 12px', fontWeight:700, fontSize:12 }}>
                    📹 Rejoindre
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── RÉSULTATS & PRESCRIPTIONS ──────────────────────────── */}
        {onglet === 'resultats' && (
          <div>
            <h2 style={{ fontWeight:900, fontSize:'1.3rem', color:'#0f172a', marginBottom:20 }}>Résultats & Prescriptions</h2>

            {/* Prescriptions actives */}
            {dossier?.prescriptions_actives?.length > 0 && (
              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>💊 Prescriptions actives</h3>
                {dossier.prescriptions_actives.map((p: any, i: number) => (
                  <div key={i} style={{ background:'white', borderRadius:14, padding:18, border:'1px solid #e2e8f0', marginBottom:10 }}>
                    <div style={{ fontWeight:700, color:'#0f172a', marginBottom:6 }}>Dr {p.medecin_nom}</div>
                    <div style={{ fontSize:13, color:'#475569', lineHeight:1.7 }}>{p.medicaments}</div>
                    <div style={{ fontSize:12, color:'#94a3b8', marginTop:8 }}>
                      Valide jusqu'au {p.valide_jusqu_au ? new Date(p.valide_jusqu_au).toLocaleDateString('fr-FR') : 'indéfini'}
                    </div>
                    {/* Rappel IA */}
                    <div style={{ background:'#fffbeb', borderRadius:8, padding:'8px 12px', marginTop:10, fontSize:12, color:'#92400e' }}>
                      ⏰ Rappel: Prenez vos médicaments régulièrement pour un traitement efficace.
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Résultats labo */}
            {dossier?.resultats_labo?.length > 0 && (
              <div>
                <h3 style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>🔬 Résultats laboratoire</h3>
                {dossier.resultats_labo.map((r: any, i: number) => (
                  <div key={i} style={{ background:'white', borderRadius:14, padding:18, border:'1px solid #e2e8f0', marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ fontWeight:700, color:'#0f172a' }}>{r.type_examen}</div>
                      <span style={{ background:'#f0fdf4', color:'#16a34a', borderRadius:50, padding:'3px 10px', fontSize:12, fontWeight:700 }}>
                        {r.status}
                      </span>
                    </div>
                    <div style={{ fontSize:13, color:'#475569', lineHeight:1.6 }}>{r.resultats}</div>
                    <div style={{ fontSize:12, color:'#94a3b8', marginTop:6 }}>{new Date(r.date_examen).toLocaleDateString('fr-FR')}</div>
                    {/* Interprétation IA simplifiée */}
                    {r.notes && (
                      <div style={{ background:'#eff6ff', borderRadius:8, padding:'8px 12px', marginTop:10, fontSize:12, color:'#1e40af' }}>
                        🤖 Note médicale : {r.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!dossier?.prescriptions_actives?.length && !dossier?.resultats_labo?.length && (
              <div style={{ background:'white', borderRadius:16, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
                <FileText size={40} color="#94a3b8" style={{ marginBottom:12 }} />
                <p style={{ color:'#64748b' }}>Aucun résultat ou prescription disponible.</p>
              </div>
            )}
          </div>
        )}

        {/* ── DONNER UN AVIS ─────────────────────────────────────── */}
        {onglet === 'avis' && (
          <div>
            <h2 style={{ fontWeight:900, fontSize:'1.3rem', color:'#0f172a', marginBottom:6 }}>Votre avis</h2>
            <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>Aidez-nous à améliorer nos services en partageant votre expérience.</p>

            {rdvList.filter((r: any) => r.statut === 'termine').length === 0 ? (
              <div style={{ background:'white', borderRadius:16, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
                <Star size={40} color="#94a3b8" style={{ marginBottom:12 }} />
                <p style={{ color:'#64748b' }}>Aucune consultation terminée à évaluer.</p>
              </div>
            ) : rdvList.filter((r: any) => r.statut === 'termine').slice(0, 3).map((rdv: any) => (
              <div key={rdv.id} style={{ background:'white', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:16 }}>
                <div style={{ fontWeight:700, marginBottom:4 }}>{rdv.medecin_nom} — {new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}</div>
                <div style={{ color:'#64748b', fontSize:13, marginBottom:16 }}>{rdv.specialite}</div>

                {/* Étoiles */}
                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setNoteRdv(n)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:28, color: n <= noteRdv ? '#f59e0b' : '#e2e8f0', padding:0, transition:'color 0.1s' }}>★</button>
                  ))}
                </div>
                <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={3}
                  placeholder="Partagez votre expérience (facultatif)..."
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, resize:'vertical', boxSizing:'border-box' as const, marginBottom:12 }} />
                <button onClick={() => soumettreAvis(rdv.id)} disabled={!noteRdv} style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer', opacity:!noteRdv ? 0.5 : 1 }}>
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
