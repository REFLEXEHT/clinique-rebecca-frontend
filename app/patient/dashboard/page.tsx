'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { LogOut, User, Calendar, FileText, Pill, Star, Clock, Stethoscope, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react'

type Onglet = 'accueil' | 'dossiers' | 'rdv' | 'prescriptions' | 'resultats' | 'medecins' | 'avis'

// ── Composant carte dossier expandable ────────────────────────────────────
function DossierCard({ d }: { d: any }) {
  const [open, setOpen] = useState(false)
  const statut = d.statut === 'termine' ? { label:'Terminé', bg:'#f0fdf4', color:'#16a34a' }
               : d.statut === 'en_cours' ? { label:'En cours', bg:'#fffbeb', color:'#d97706' }
               : { label: d.statut, bg:'#f8fafc', color:'#64748b' }

  return (
    <div style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', marginBottom:10, overflow:'hidden' }}>
      {/* En-tête dossier */}
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:16, cursor:'pointer' }}
           onClick={() => setOpen(o => !o)}>
        <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Stethoscope size={18} color="white"/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#0f172a' }}>
            {d.specialite || d.type_visite || 'Consultation'}
          </div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>
            {new Date(d.date_visite).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ background: statut.bg, color: statut.color, borderRadius:50, padding:'3px 10px', fontSize:11, fontWeight:700 }}>
            {statut.label}
          </span>
          {open ? <ChevronUp size={14} color="#94a3b8"/> : <ChevronDown size={14} color="#94a3b8"/>}
        </div>
      </div>

      {/* Détails expandable */}
      {open && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid #f1f5f9' }}>
          {d.motif_consultation && (
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Motif</div>
              <div style={{ fontSize:13, color:'#475569' }}>{d.motif_consultation}</div>
            </div>
          )}
          {d.diagnostic && (
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Diagnostic</div>
              <div style={{ background:'#f8fafc', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#374151' }}>{d.diagnostic}</div>
            </div>
          )}
          {d.examen_clinique && (
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Examen clinique</div>
              <div style={{ fontSize:13, color:'#475569', lineHeight:1.6 }}>{d.examen_clinique}</div>
            </div>
          )}
          {d.notes_medecin && (
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Notes du médecin</div>
              <div style={{ background:'#fffbeb', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#92400e', lineHeight:1.6 }}>{d.notes_medecin}</div>
            </div>
          )}
          {!d.diagnostic && !d.examen_clinique && !d.notes_medecin && (
            <p style={{ color:'#94a3b8', fontSize:13, marginTop:12 }}>Consultation en cours — informations disponibles après la visite.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Composant prescription ────────────────────────────────────────────────
function PrescriptionCard({ p, actif = true }: { p: any; actif?: boolean }) {
  const [open, setOpen] = useState(false)
  let meds: any[] = []
  try { meds = JSON.parse(p.medicaments || '[]') } catch { meds = [] }

  return (
    <div style={{ background:'white', borderRadius:14, border: actif ? '1px solid #a7f3d0' : '1px solid #e2e8f0', marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:14, cursor:'pointer' }} onClick={() => setOpen(o => !o)}>
        <div style={{ width:36, height:36, borderRadius:10, background: actif ? '#ecfdf5' : '#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Pill size={16} color={ actif ? '#16a34a' : '#94a3b8'}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>
            {p.medecin_nom ? `Dr ${p.medecin_nom}` : 'Médecin'}
            {actif && <span style={{ background:'#ecfdf5', color:'#16a34a', borderRadius:50, padding:'2px 8px', fontSize:10, fontWeight:700, marginLeft:8 }}>Active</span>}
          </div>
          <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>
            {new Date(p.date_prescription).toLocaleDateString('fr-FR')}
            {meds.length > 0 && ` · ${meds.length} médicament${meds.length > 1 ? 's' : ''}`}
          </div>
        </div>
        {open ? <ChevronUp size={14} color="#94a3b8"/> : <ChevronDown size={14} color="#94a3b8"/>}
      </div>
      {open && (
        <div style={{ padding:'0 14px 14px', borderTop:'1px solid #f1f5f9' }}>
          {meds.length > 0 ? (
            <div style={{ marginTop:10 }}>
              {meds.map((m: any, i: number) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i < meds.length-1 ? '1px solid #f1f5f9' : 'none', fontSize:13 }}>
                  <span style={{ fontWeight:600, color:'#374151' }}>{m.nom || m}</span>
                  <span style={{ color:'#64748b' }}>{m.posologie} {m.duree ? `· ${m.duree}` : ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize:13, color:'#475569', marginTop:10 }}>{p.medicaments}</div>
          )}
          {p.notes && (
            <div style={{ background:'#fffbeb', borderRadius:8, padding:'8px 12px', marginTop:10, fontSize:12, color:'#92400e' }}>
              📝 {p.notes}
            </div>
          )}
          {p.examens_requis && (
            <div style={{ background:'#eff6ff', borderRadius:8, padding:'8px 12px', marginTop:8, fontSize:12, color:'#1e40af' }}>
              🔬 Examens requis : {p.examens_requis}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PatientDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [onglet, setOnglet] = useState<Onglet>('accueil')
  const [data,   setData]   = useState<any>(null)
  const [synth,  setSynth]  = useState('')
  const [loadSy, setLoadSy] = useState(false)
  const [noteRdv, setNoteRdv] = useState(0)
  const [commentaire, setCommentaire] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/patient/mon-dossier').then(r => setData(r.data)).catch(() => {})
  }, [isAuthenticated])

  const genererSynthese = async () => {
    if (!data?.dossiers?.[0]) return
    setLoadSy(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:400,
          messages:[{ role:'user', content:
            `Tu es un assistant médical bienveillant. En 3-4 phrases simples et rassurantes, explique à ce patient ce qui s'est passé lors de sa dernière visite médicale, sans jargon. Données: ${JSON.stringify({ diagnostic: data.dossiers[0].diagnostic, specialite: data.dossiers[0].specialite, notes: data.dossiers[0].notes_medecin })}`
          }]
        })
      })
      const j = await res.json()
      setSynth(j.content?.[0]?.text || '')
    } catch { setSynth('') }
    finally { setLoadSy(false) }
  }

  const soumettreAvis = async (dossier_id: number) => {
    if (!noteRdv) return
    try {
      await api.post('/patient/avis', { note: noteRdv, commentaire, dossier_id })
      setNoteRdv(0); setCommentaire('')
      alert('Merci pour votre avis !')
    } catch { alert('Erreur') }
  }

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid #1641C8', borderTopColor:'transparent', animation:'spin 1s linear infinite' }}/></div>

  const NAV = [
    { k:'accueil',       icon:<User size={13}/>,          label:'Mon espace' },
    { k:'dossiers',      icon:<FileText size={13}/>,       label:`Mes visites${data?.nb_visites ? ` (${data.nb_visites})` : ''}` },
    { k:'rdv',           icon:<Calendar size={13}/>,       label:'Mes RDV' },
    { k:'prescriptions', icon:<Pill size={13}/>,           label:'Prescriptions' },
    { k:'resultats',     icon:<FlaskConical size={13}/>,   label:'Résultats labo' },
    { k:'medecins',      icon:<Stethoscope size={13}/>,    label:'Mes médecins' },
    { k:'avis',          icon:<Star size={13}/>,           label:'Donner un avis' },
  ] as const

  const STATUT_RDV: Record<string, {label:string;color:string;bg:string}> = {
    confirme:             { label:'✓ Confirmé',       color:'#16a34a', bg:'#f0fdf4' },
    en_attente:           { label:'⏳ En attente',    color:'#d97706', bg:'#fffbeb' },
    paiement_requis:      { label:'💳 Paiement requis', color:'#7c3aed', bg:'#f5f3ff' },
    paiement_effectue:    { label:'💳 Payé',          color:'#0d9488', bg:'#f0fdfa' },
    propose_autre_moment: { label:'📅 Autre moment proposé', color:'#d97706', bg:'#fffbeb' },
    annule:               { label:'✕ Annulé',         color:'#dc2626', bg:'#fef2f2' },
    termine:              { label:'✓ Terminé',         color:'#64748b', bg:'#f8fafc' },
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8)', height:60, display:'flex', alignItems:'center', padding:'0 24px', gap:14, position:'sticky', top:0, zIndex:50 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>👤</div>
        <div>
          <div style={{ color:'white', fontWeight:800, fontSize:14 }}>{user?.nom}</div>
          <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11 }}>
            {data?.numero_patient && <span style={{ fontFamily:'monospace', marginRight:8, color:'rgba(255,255,255,0.8)' }}>{data.numero_patient}</span>}
            Patient
          </div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
          <Link href="/consultation" style={{ background:'rgba(255,255,255,0.15)', color:'white', textDecoration:'none', borderRadius:8, padding:'7px 14px', fontWeight:700, fontSize:12, border:'1px solid rgba(255,255,255,0.2)' }}>
            + Prendre RDV
          </Link>
          <button onClick={() => { logout(); router.push('/') }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
            <LogOut size={13}/> Déconnexion
          </button>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────────────── */}
      <div style={{ background:'white', borderBottom:'1px solid #e2e8f0', padding:'0 16px', display:'flex', gap:2, overflowX:'auto' }}>
        {NAV.map(n => (
          <button key={n.k} onClick={() => setOnglet(n.k as Onglet)} style={{
            padding:'13px 14px', border:'none', background:'transparent', cursor:'pointer',
            fontWeight:600, fontSize:12, display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap',
            color: onglet === n.k ? '#1641C8' : '#64748b',
            borderBottom: onglet === n.k ? '2px solid #1641C8' : '2px solid transparent',
          }}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'24px 16px' }}>

        {/* ── MON ESPACE ──────────────────────────────────────────── */}
        {onglet === 'accueil' && (
          <div>
            <h2 style={{ fontWeight:900, fontSize:'1.3rem', color:'#0f172a', marginBottom:20 }}>
              Bonjour, {user?.nom?.split(' ')[0]} 👋
            </h2>

            {/* ID Patient + infos profil */}
            {data?.patient && (
              <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8)', borderRadius:16, padding:20, marginBottom:16, color:'white' }}>
                <div style={{ fontSize:11, opacity:0.6, marginBottom:4, textTransform:'uppercase', letterSpacing:1 }}>Votre identifiant patient</div>
                <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:'1.8rem', letterSpacing:2, marginBottom:12 }}>
                  {data.numero_patient || '—'}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, fontSize:13 }}>
                  <div><span style={{ opacity:0.6 }}>Nom :</span> {data.patient.nom}</div>
                  <div><span style={{ opacity:0.6 }}>Tél :</span> {data.patient.telephone || '—'}</div>
                  <div><span style={{ opacity:0.6 }}>Email :</span> {data.patient.email}</div>
                  <div><span style={{ opacity:0.6 }}>Inscrit le :</span> {new Date(data.patient.created_at || Date.now()).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            )}

            {/* Dernière visite + IA */}
            {data?.dossiers?.[0] && (
              <div style={{ background:'white', borderRadius:16, padding:20, border:'1px solid #e2e8f0', marginBottom:16 }}>
                <h3 style={{ fontWeight:700, fontSize:15, margin:'0 0 12px' }}>📋 Dernière visite</h3>
                <div style={{ fontSize:13, color:'#64748b', marginBottom:6 }}>
                  {new Date(data.dossiers[0].date_visite).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                  {' · '}{data.dossiers[0].specialite}
                </div>
                {data.dossiers[0].diagnostic && (
                  <div style={{ background:'#f8fafc', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#374151', marginBottom:12 }}>
                    <strong>Diagnostic :</strong> {data.dossiers[0].diagnostic}
                  </div>
                )}
                {!synth ? (
                  <button onClick={genererSynthese} disabled={loadSy} style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, fontSize:12, cursor:'pointer', opacity: loadSy ? 0.7 : 1 }}>
                    {loadSy ? '⏳ Génération en cours...' : '🤖 Résumé simplifié par IA'}
                  </button>
                ) : (
                  <div style={{ background:'#eff6ff', borderRadius:10, padding:'12px 16px', fontSize:13, color:'#1e40af', lineHeight:1.7, border:'1px solid #bfdbfe' }}>
                    <strong>🤖 Résumé IA :</strong> {synth}
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
              {[
                { icon:'🏥', label:'Visites', val: data?.nb_visites || 0, onglet:'dossiers' },
                { icon:'📅', label:'RDV à venir', val: data?.rdv_a_venir?.length || 0, onglet:'rdv' },
                { icon:'💊', label:'Prescriptions', val: data?.prescriptions_actives?.length || 0, onglet:'prescriptions' },
                { icon:'🔬', label:'Résultats labo', val: data?.resultats_labo?.length || 0, onglet:'resultats' },
              ].map(s => (
                <div key={s.label} onClick={() => setOnglet(s.onglet as Onglet)}
                  style={{ background:'white', borderRadius:14, padding:16, border:'1px solid #e2e8f0', textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='#1641C8'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor='#e2e8f0'}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontWeight:900, fontSize:'1.4rem', color:'#0f172a' }}>{s.val}</div>
                  <div style={{ color:'#64748b', fontSize:11 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Prochain RDV */}
            {data?.rdv_a_venir?.[0] && (
              <div style={{ background:'white', borderRadius:14, padding:16, border:'2px solid #1641C8', marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#1641C8', textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Prochain rendez-vous</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:700 }}>{data.rdv_a_venir[0].specialite}</div>
                    <div style={{ fontSize:13, color:'#64748b' }}>
                      {new Date(data.rdv_a_venir[0].date_rdv).toLocaleString('fr-FR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                    </div>
                    {data.rdv_a_venir[0].medecin_nom && <div style={{ fontSize:12, color:'#64748b' }}>Dr {data.rdv_a_venir[0].medecin_nom}</div>}
                  </div>
                  {data.rdv_a_venir[0].lien_video && (
                    <a href={data.rdv_a_venir[0].lien_video} target="_blank" rel="noreferrer"
                      style={{ background:'#7c3aed', color:'white', textDecoration:'none', borderRadius:10, padding:'10px 18px', fontWeight:700, fontSize:13 }}>
                      📹 Rejoindre
                    </a>
                  )}
                </div>
                {data.rdv_a_venir[0].autre_moment_propose && (
                  <div style={{ background:'#fffbeb', borderRadius:8, padding:'8px 12px', marginTop:10, fontSize:12, color:'#92400e' }}>
                    📅 Le médecin propose un autre créneau : <strong>{data.rdv_a_venir[0].autre_moment_propose}</strong>
                    {data.rdv_a_venir[0].autre_moment_message && <div style={{ marginTop:4 }}>{data.rdv_a_venir[0].autre_moment_message}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MES VISITES ─────────────────────────────────────────── */}
        {onglet === 'dossiers' && (
          <div>
            <h2 style={{ fontWeight:900, fontSize:'1.2rem', color:'#0f172a', marginBottom:16 }}>
              🏥 Mes visites ({data?.nb_visites || 0})
            </h2>
            {!data?.dossiers?.length ? (
              <div style={{ background:'white', borderRadius:16, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
                <Stethoscope size={40} color="#94a3b8" style={{ marginBottom:12 }}/>
                <p style={{ color:'#64748b' }}>Aucune visite enregistrée.</p>
              </div>
            ) : data.dossiers.map((d: any) => <DossierCard key={d.id} d={d}/>)}
          </div>
        )}

        {/* ── MES RDV ─────────────────────────────────────────────── */}
        {onglet === 'rdv' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h2 style={{ fontWeight:900, fontSize:'1.2rem', margin:0 }}>📅 Mes rendez-vous</h2>
              <Link href="/consultation" style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', textDecoration:'none', borderRadius:10, padding:'9px 16px', fontWeight:700, fontSize:13 }}>
                + Nouveau RDV
              </Link>
            </div>

            {/* RDV à venir */}
            {data?.rdv_a_venir?.length > 0 && (
              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontWeight:700, fontSize:14, color:'#1641C8', marginBottom:10 }}>À venir</h3>
                {data.rdv_a_venir.map((r: any) => {
                  const s = STATUT_RDV[r.statut] || STATUT_RDV.en_attente
                  return (
                    <div key={r.id} style={{ background:'white', borderRadius:14, padding:16, border:'1px solid #e2e8f0', marginBottom:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14 }}>{r.specialite}</div>
                          <div style={{ fontSize:13, color:'#64748b' }}>
                            {new Date(r.date_rdv).toLocaleString('fr-FR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                          </div>
                          {r.medecin_nom && <div style={{ fontSize:12, color:'#64748b' }}>Dr {r.medecin_nom}</div>}
                          {r.motif && <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>Motif : {r.motif}</div>}
                        </div>
                        <span style={{ background: s.bg, color: s.color, borderRadius:50, padding:'4px 12px', fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>
                          {s.label}
                        </span>
                      </div>
                      {r.lien_video && (
                        <a href={r.lien_video} target="_blank" rel="noreferrer"
                          style={{ background:'#7c3aed', color:'white', textDecoration:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, fontSize:12, display:'inline-block' }}>
                          📹 Rejoindre la vidéo
                        </a>
                      )}
                      {r.statut === 'paiement_requis' && (
                        <div style={{ background:'#f5f3ff', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#7c3aed', marginTop:8 }}>
                          💳 Un paiement est requis avant la confirmation de ce RDV vidéo.
                          Contactez la clinique : (509) 4858-5757
                        </div>
                      )}
                      {r.autre_moment_propose && (
                        <div style={{ background:'#fffbeb', borderRadius:8, padding:'10px 14px', marginTop:8, fontSize:12, color:'#92400e' }}>
                          📅 Le médecin propose un autre moment : <strong>{r.autre_moment_propose}</strong>
                          {r.autre_moment_message && <div style={{ marginTop:4 }}>{r.autre_moment_message}</div>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* RDV passés */}
            {data?.rdv_passes?.length > 0 && (
              <div>
                <h3 style={{ fontWeight:700, fontSize:14, color:'#94a3b8', marginBottom:10 }}>Historique</h3>
                {data.rdv_passes.map((r: any) => {
                  const s = STATUT_RDV[r.statut] || STATUT_RDV.termine
                  return (
                    <div key={r.id} style={{ background:'#f8fafc', borderRadius:12, padding:14, border:'1px solid #e2e8f0', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{r.specialite}</div>
                        <div style={{ fontSize:11, color:'#94a3b8' }}>
                          {new Date(r.date_rdv).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}
                          {r.medecin_nom && ` · Dr ${r.medecin_nom}`}
                        </div>
                      </div>
                      <span style={{ background: s.bg, color: s.color, borderRadius:50, padding:'3px 10px', fontSize:11, fontWeight:700 }}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {!data?.rdv_a_venir?.length && !data?.rdv_passes?.length && (
              <div style={{ background:'white', borderRadius:16, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
                <Calendar size={40} color="#94a3b8" style={{ marginBottom:12 }}/>
                <p style={{ color:'#64748b' }}>Aucun rendez-vous. <Link href="/consultation" style={{ color:'#1641C8', fontWeight:700 }}>Prendre un RDV →</Link></p>
              </div>
            )}
          </div>
        )}

        {/* ── PRESCRIPTIONS ───────────────────────────────────────── */}
        {onglet === 'prescriptions' && (
          <div>
            <h2 style={{ fontWeight:900, fontSize:'1.2rem', margin:'0 0 16px' }}>💊 Prescriptions</h2>

            {data?.prescriptions_actives?.length > 0 && (
              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontWeight:700, fontSize:14, color:'#16a34a', marginBottom:10 }}>
                  Actives (90 derniers jours) — {data.prescriptions_actives.length}
                </h3>
                {data.prescriptions_actives.map((p: any, i: number) => <PrescriptionCard key={i} p={p} actif={true}/>)}
              </div>
            )}

            {data?.prescriptions_historique?.length > 0 && (
              <div>
                <h3 style={{ fontWeight:700, fontSize:14, color:'#94a3b8', marginBottom:10 }}>Historique</h3>
                {data.prescriptions_historique.map((p: any, i: number) => <PrescriptionCard key={i} p={p} actif={false}/>)}
              </div>
            )}

            {!data?.prescriptions_actives?.length && !data?.prescriptions_historique?.length && (
              <div style={{ background:'white', borderRadius:16, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
                <Pill size={40} color="#94a3b8" style={{ marginBottom:12 }}/>
                <p style={{ color:'#64748b' }}>Aucune prescription disponible.</p>
              </div>
            )}
          </div>
        )}

        {/* ── RÉSULTATS LABO ──────────────────────────────────────── */}
        {onglet === 'resultats' && (
          <div>
            <h2 style={{ fontWeight:900, fontSize:'1.2rem', margin:'0 0 16px' }}>🔬 Résultats de laboratoire ({data?.resultats_labo?.length || 0})</h2>
            {!data?.resultats_labo?.length ? (
              <div style={{ background:'white', borderRadius:16, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
                <FlaskConical size={40} color="#94a3b8" style={{ marginBottom:12 }}/>
                <p style={{ color:'#64748b' }}>Aucun résultat de laboratoire disponible.</p>
              </div>
            ) : data.resultats_labo.map((r: any, i: number) => (
              <div key={i} style={{ background:'white', borderRadius:14, padding:16, border:'1px solid #e2e8f0', marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ fontWeight:700, color:'#0f172a' }}>{r.type_examen}</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {r.alerte_critique && <span style={{ background:'#fef2f2', color:'#dc2626', borderRadius:50, padding:'2px 8px', fontSize:10, fontWeight:700 }}>🚨 Critique</span>}
                    <span style={{ color:'#94a3b8', fontSize:11 }}>{new Date(r.date_examen).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div style={{ fontSize:13, color:'#475569', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{r.resultats}</div>
                {r.notes && (
                  <div style={{ background:'#eff6ff', borderRadius:8, padding:'8px 12px', marginTop:10, fontSize:12, color:'#1e40af' }}>
                    🤖 Note médicale : {r.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── MES MÉDECINS ────────────────────────────────────────── */}
        {onglet === 'medecins' && (
          <div>
            <h2 style={{ fontWeight:900, fontSize:'1.2rem', margin:'0 0 16px' }}>🩺 Médecins consultés</h2>
            {!data?.medecins_consultes?.length ? (
              <div style={{ background:'white', borderRadius:16, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
                <Stethoscope size={40} color="#94a3b8" style={{ marginBottom:12 }}/>
                <p style={{ color:'#64748b' }}>Aucun médecin consulté pour l'instant.</p>
              </div>
            ) : data.medecins_consultes.map((m: any, i: number) => (
              <div key={i} style={{ background:'white', borderRadius:14, padding:16, border:'1px solid #e2e8f0', marginBottom:10, display:'flex', gap:14, alignItems:'center' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                  👨‍⚕️
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700 }}>{m.nom}</div>
                  <div style={{ color:'#0d9488', fontSize:13, fontWeight:600 }}>{m.specialite}</div>
                  <div style={{ color:'#94a3b8', fontSize:12 }}>{m.email}</div>
                </div>
                <Link href="/consultation" style={{ background:'#eff6ff', color:'#1641C8', textDecoration:'none', borderRadius:8, padding:'7px 14px', fontWeight:700, fontSize:12 }}>
                  Reprendre RDV
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ── AVIS ────────────────────────────────────────────────── */}
        {onglet === 'avis' && (
          <div>
            <h2 style={{ fontWeight:900, fontSize:'1.2rem', margin:'0 0 6px' }}>⭐ Votre avis</h2>
            <p style={{ color:'#64748b', fontSize:14, marginBottom:20 }}>Aidez-nous à améliorer nos services en partageant votre expérience.</p>

            {!data?.dossiers?.filter((d: any) => d.statut === 'termine').length ? (
              <div style={{ background:'white', borderRadius:16, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
                <Star size={40} color="#94a3b8" style={{ marginBottom:12 }}/>
                <p style={{ color:'#64748b' }}>Aucune consultation terminée à évaluer.</p>
              </div>
            ) : data.dossiers.filter((d: any) => d.statut === 'termine').slice(0, 3).map((d: any) => (
              <div key={d.id} style={{ background:'white', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:14 }}>
                <div style={{ fontWeight:700, marginBottom:2 }}>{d.specialite}</div>
                <div style={{ color:'#64748b', fontSize:13, marginBottom:16 }}>
                  {new Date(d.date_visite).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}
                </div>
                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setNoteRdv(n)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:30, color: n <= noteRdv ? '#f59e0b' : '#e2e8f0', padding:0, transition:'color 0.1s' }}>★</button>
                  ))}
                </div>
                <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={3}
                  placeholder="Partagez votre expérience (facultatif)..."
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, resize:'vertical', boxSizing:'border-box' as const, marginBottom:12 }}/>
                <button onClick={() => soumettreAvis(d.id)} disabled={!noteRdv}
                  style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer', opacity: !noteRdv ? 0.5 : 1 }}>
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
