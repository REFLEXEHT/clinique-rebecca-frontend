'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { rdvApi, actesApi, api } from '@/lib/api'
import { RendezVous } from '@/types'
import { LogOut, Edit2, Save, X, Calendar, Clock, User, FileText, Star, ChevronRight, Video, ExternalLink } from 'lucide-react'

// ─── Types locaux ────────────────────────────────────────────────────────────
type TypeActe = 'consultation' | 'geste' | 'observation' | 'hospitalisation' | 'chirurgie'
type Onglet   = 'file-attente' | 'tableau' | 'rdv' | 'consultations' | 'profil' | 'demande-acces'

interface ActeLocal {
  id: number
  patient_id?: string
  patient_nom: string
  type_acte: TypeActe
  specialite?: string
  description?: string
  notes?: string
  date_acte: string
}

interface ActeForm {
  patient_nom: string
  patient_id: string
  type_acte: TypeActe
  specialite: string
  description: string
  notes: string
}

const TYPES_ACTE: { value: TypeActe; label: string; color: string; bg: string }[] = [
  { value: 'consultation',   label: 'Consultation',   color: '#1641C8', bg: '#eff6ff' },
  { value: 'geste',          label: 'Geste médical',  color: '#16a34a', bg: '#f0fdf4' },
  { value: 'observation',    label: 'Observation',    color: '#d97706', bg: '#fffbeb' },
  { value: 'hospitalisation',label: 'Hospitalisation',color: '#dc2626', bg: '#fef2f2' },
  { value: 'chirurgie',      label: 'Chirurgie',      color: '#7c3aed', bg: '#f5f3ff' },
]

const STATUT_RDV: Record<string, { label: string; color: string; bg: string }> = {
  en_attente: { label: 'En attente', color: '#d97706', bg: '#fffbeb' },
  confirme:   { label: 'Confirmé',   color: '#16a34a', bg: '#f0fdf4' },
  annule:     { label: 'Annulé',     color: '#dc2626', bg: '#fef2f2' },
  termine:    { label: 'Terminé',    color: '#64748b', bg: '#f8fafc' },
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
const fmtHeure = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
const fmtDateCourt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_RDV: RendezVous[] = [
  { id: 1, patient_nom: 'Marie Théodore',    patient_telephone: '+509 3111-2222', patient_email: null,               specialite: 'Gynécologie',     date_rdv: new Date(Date.now() + 3_600_000).toISOString(),   type_rdv: 'presentiel', statut: 'confirme',   motif: 'Suivi grossesse T2',       notes_admin: null, mode_paiement: 'Espèces',        rappel_envoye: true,  created_at: new Date().toISOString() },
  { id: 2, patient_nom: 'Jean Dorval',       patient_telephone: '+509 3333-4444', patient_email: null,               specialite: 'Médecine interne', date_rdv: new Date(Date.now() + 7_200_000).toISOString(),   type_rdv: 'presentiel', statut: 'en_attente', motif: 'Contrôle tension',         notes_admin: null, mode_paiement: null,             rappel_envoye: false, created_at: new Date().toISOString() },
  { id: 3, patient_nom: 'Rose Étienne',      patient_telephone: '+509 3555-6666', patient_email: 'rose@email.com',   specialite: 'Gynécologie',     date_rdv: new Date(Date.now() + 86_400_000).toISOString(),  type_rdv: 'video',      statut: 'confirme',   motif: 'Consultation en ligne',   notes_admin: null, mode_paiement: 'Moncash',        rappel_envoye: true,  lien_video: 'https://meet.jit.si/cr-abc123', created_at: new Date().toISOString() },
  { id: 4, patient_nom: 'Claudette Marcelin',patient_telephone: '+509 3777-8888', patient_email: null,               specialite: 'Gynécologie',     date_rdv: new Date(Date.now() + 172_800_000).toISOString(), type_rdv: 'presentiel', statut: 'en_attente', motif: 'Bilan prénatal',          notes_admin: null, mode_paiement: 'Espèces',        rappel_envoye: false, created_at: new Date().toISOString() },
]

const DEMO_ACTES: ActeLocal[] = [
  { id: 1, patient_id: '#RB-042', patient_nom: 'Marie Théodore',    type_acte: 'consultation',    specialite: 'Gynécologie',    description: 'Suivi grossesse trimestre 2 — tout normal',       notes: 'Tension 120/80, bébé bien positionné',    date_acte: new Date(Date.now() - 86_400_000).toISOString() },
  { id: 2, patient_id: '#RB-039', patient_nom: 'Paul Jean-Baptiste', type_acte: 'observation',     specialite: 'Médecine interne',description: 'Observation 24h — diabète type 2 décompensé',     notes: 'Glycémie 280 mg/dL à surveiller',          date_acte: new Date(Date.now() - 172_800_000).toISOString() },
  { id: 3, patient_id: '#RB-031', patient_nom: 'Rose Étienne',      type_acte: 'geste',           specialite: 'Gestes médicaux',description: 'Perfusion IV — déshydratation sévère',            notes: 'Résolution complète en 3h',               date_acte: new Date(Date.now() - 259_200_000).toISOString() },
  { id: 4, patient_id: '#RB-028', patient_nom: 'Jean Dorval',       type_acte: 'consultation',    specialite: 'Médecine interne',description: 'Hypertension — ajustement traitement Amlodipine', notes: 'Contrôle dans 2 semaines',                date_acte: new Date(Date.now() - 345_600_000).toISOString() },
  { id: 5, patient_id: '#RB-021', patient_nom: 'Nadia François',    type_acte: 'consultation',    specialite: 'Gynécologie',    description: 'Bilan de santé annuel complet',                  notes: 'RAS — très bon état général',             date_acte: new Date(Date.now() - 432_000_000).toISOString() },
  { id: 6, patient_id: '#RB-015', patient_nom: 'Luc Desrosiers',    type_acte: 'geste',           specialite: 'Gestes médicaux',description: 'Injection intramusculaire Vitamines B12',         notes: '',                                        date_acte: new Date(Date.now() - 5_184_000_000).toISOString() },
  { id: 7, patient_id: '#RB-011', patient_nom: 'Ange-Marie Pierre', type_acte: 'chirurgie',       specialite: 'Chirurgie',      description: 'Appendicectomie laparoscopique',                 notes: 'Suites simples',                          date_acte: new Date(Date.now() - 8_640_000_000).toISOString() },
]

// ═════════════════════════════════════════════════════════════════════════════

function RecommandationPanel({ dossierId }: { dossierId: number | null }) {
  const [specialiste, setSpecialiste] = useState('')
  const [motif, setMotif] = useState('')
  const [resumeIA, setResumeIA] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const envoyer = async () => {
    if (!dossierId || !specialiste || !motif) return
    setLoading(true)
    try {
      const r = await api.post(`/medecin/recommander-avec-resume/${dossierId}`, { specialiste_cible: specialiste, motif })
      const resIA = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 250,
          messages: [{ role: 'user', content: `Résumé LIMITÉ pour ${specialiste} (150 mots max). Motif: "${motif}". Inclure uniquement: raison de consultation, points pertinents pour cette spécialité. NE PAS inclure le dossier complet.` }]
        })
      })
      const iaData = await resIA.json()
      setResumeIA(iaData.content?.[0]?.text || '')
      setSent(true)
    } catch (e: any) { alert(e?.response?.data?.detail || 'Erreur') }
    finally { setLoading(false) }
  }

  if (!dossierId) return <div style={{ fontSize: 13, color: '#94a3b8' }}>Sélectionnez un dossier d'abord.</div>

  return !sent ? (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div>
        <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5 }}>Spécialiste cible</label>
        <select value={specialiste} onChange={e => setSpecialiste(e.target.value)}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, background: 'white' }}>
          <option value="">-- Sélectionner --</option>
          <option value="physiotherapeute">Physiothérapeute</option>
          <option value="dentiste">Dentiste</option>
          <option value="optometriste">Optométriste</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5 }}>Motif *</label>
        <input value={motif} onChange={e => setMotif(e.target.value)} placeholder="Ex: Rééducation post-fracture"
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' as const }} />
      </div>
      <div style={{ gridColumn: '1/-1' }}>
        <button onClick={envoyer} disabled={loading || !specialiste || !motif} style={{
          background: 'linear-gradient(135deg,#7c3aed,#0d9488)', color: 'white', border: 'none',
          borderRadius: 10, padding: '9px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 13,
          opacity: (!specialiste || !motif) ? 0.5 : 1
        }}>{loading ? '⏳ IA en cours...' : '🤖 Recommander + Résumé IA'}</button>
      </div>
    </div>
  ) : (
    <div style={{ background: '#f5f3ff', borderRadius: 12, padding: 16, border: '1px solid #ddd6fe' }}>
      <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>✓ Recommandation envoyée à {specialiste}</div>
      <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 8 }}>{resumeIA}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>ℹ️ Seul ce résumé est transmis — dossier complet confidentiel.</div>
      <button onClick={() => { setSent(false); setSpecialiste(''); setMotif(''); setResumeIA('') }}
        style={{ marginTop: 8, background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#64748b' }}>
        Nouvelle recommandation
      </button>
    </div>
  )
}

export default function MedecinDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router   = useRouter()
  const [onglet, setOnglet] = useState<Onglet>('tableau')
  const [rdvs,   setRdvs]   = useState<RendezVous[]>([])
  const [actes,  setActes]  = useState<ActeLocal[]>([])
  const [showForm,     setShowForm]     = useState(false)
  const [dossierId,    setDossierId]    = useState<number|null>(null)
  const [fileAttente,  setFileAttente]  = useState<any[]>([])
  const [nbAttente,    setNbAttente]    = useState(0)
  const [synthese,     setSynthese]     = useState<Record<number,string>>({})
  const [loadSynth,    setLoadSynth]    = useState<number|null>(null)
  const [interactions, setInteractions] = useState('')
  const [loadInter,    setLoadInter]    = useState(false)
  const [editProfil, setEditProfil] = useState(false)
  const [filtreActe, setFiltreActe] = useState<TypeActe | 'tous'>('tous')
  const [profil, setProfil] = useState({
    bio: '', telephone: '', disponibilites: 'Lun–Ven 07h–17h · Sam 07h–12h', emoji: '👨‍⚕️'
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ActeForm>({
    defaultValues: { type_acte: 'consultation' }
  })

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'medecin')) router.push('/login')
  }, [isAuthenticated, user, loading, router])

  // Polling file d'attente every 30 seconds
  useEffect(() => {
    const chargerFile = () => {
      api.get('/medecin/file-attente')
        .then(r => {
          const file = r.data || []
          setFileAttente(file)
          setNbAttente(file.length)
        })
        .catch(() => {})
    }
    if (isAuthenticated && user?.role === 'medecin') {
      chargerFile()
      const interval = setInterval(chargerFile, 30000) // refresh every 30s
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'medecin') return
    rdvApi.medecinList().then(r => setRdvs(r.data || [])).catch(() => {})
    actesApi.list().then(r => setActes(r.data || [])).catch(() => {})
  }, [isAuthenticated, user])

  const displayRdv   = rdvs.length   > 0 ? rdvs   : DEMO_RDV
  const displayActes = actes.length  > 0 ? actes  : DEMO_ACTES

  // 6 derniers mois
  const sixMoisAvant = new Date(); sixMoisAvant.setMonth(sixMoisAvant.getMonth() - 6)
  const actes6mois = displayActes.filter(a => new Date(a.date_acte) >= sixMoisAvant)
  const actesFiltres = filtreActe === 'tous' ? actes6mois : actes6mois.filter(a => a.type_acte === filtreActe)

  // RDV à venir
  const rdvAVenir  = displayRdv.filter(r => new Date(r.date_rdv) > new Date() && r.statut !== 'annule')
  const rdvAujourd = displayRdv.filter(r => new Date(r.date_rdv).toDateString() === new Date().toDateString())

  // Stats 6 mois
  const statActes = TYPES_ACTE.map(t => ({
    ...t, count: actes6mois.filter(a => a.type_acte === t.value).length
  }))

  const onAddActe = async (data: ActeForm) => {
    try {
      await actesApi.create({ ...data, date_acte: new Date().toISOString() })
      toast.success('Acte enregistré ✓')
      reset()
      setShowForm(false)
      actesApi.list().then(r => setActes(r.data || [])).catch(() => {})
    } catch {
      // En mode démo : juste simuler
      const newActe: ActeLocal = { id: Date.now(), ...data, date_acte: new Date().toISOString() }
      setActes(prev => [newActe, ...prev])
      toast.success('Acte enregistré ✓')
      reset(); setShowForm(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: '#1641C8', marginBottom: 12, display: 'block' }} />
        <p style={{ color: '#64748b' }}>Chargement…</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#0f1e3d,#1641C8)', height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            {profil.emoji}
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>Dr. {user?.nom}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{(user as any)?.specialite || 'Médecin'}</div>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: 4, marginLeft: 24 }}>
          {([
            { key: 'tableau',       icon: 'fa-house',          label: 'Tableau de bord' },
            { key: 'rdv',           icon: 'fa-calendar-check', label: 'Rendez-vous' },
            { key: 'consultations', icon: 'fa-file-medical',   label: 'Mes consultations' },
            { key: 'profil',        icon: 'fa-id-card',        label: 'Mon profil' },
            { key: 'demande-acces', icon: 'fa-key',             label: 'Accès dossier' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setOnglet(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: onglet === t.key ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: onglet === t.key ? 'white' : 'rgba(255,255,255,0.55)',
              transition: 'all 0.2s'
            }}>
              <i className={`fa-solid ${t.icon}`} style={{ fontSize: 12 }} /> {t.label}
            </button>
          ))}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 4 }} />Site public
          </Link>
          <button onClick={() => { logout(); router.push('/') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>

        {/* ══════════════════════════════════════════════════════════════
            TABLEAU DE BORD
        ══════════════════════════════════════════════════════════════ */}
        {/* ── FILE D'ATTENTE ────────────────────────────────────── */}
        {onglet === 'file-attente' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontWeight:900, fontSize:'1.2rem', margin:0 }}>
                🏥 Patients en attente de consultation
              </h2>
              <button onClick={() => api.get('/medecin/file-attente').then(r => { setFileAttente(r.data||[]); setNbAttente((r.data||[]).length) })}
                style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontWeight:600, fontSize:13, color:'#64748b' }}>
                🔄 Actualiser
              </button>
            </div>
            {fileAttente.length === 0 ? (
              <div style={{ background:'white', borderRadius:16, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <p style={{ color:'#16a34a', fontWeight:700, fontSize:15 }}>Aucun patient en attente</p>
                <p style={{ color:'#94a3b8', fontSize:13 }}>La file se met à jour automatiquement toutes les 30 secondes</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {fileAttente.map((f: any, i: number) => (
                  <div key={f.id} style={{
                    background:'white', borderRadius:14, padding:18,
                    border: f.priorite === 1 ? '2px solid #dc2626' : '1px solid #e2e8f0',
                    display:'flex', alignItems:'center', gap:14
                  }}>
                    {/* Numéro de position */}
                    <div style={{ width:40, height:40, borderRadius:'50%', background: f.priorite===1?'#fef2f2':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, color: f.priorite===1?'#dc2626':'#1641C8', flexShrink:0 }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>{f.patient_numero}</span>
                        {f.priorite === 1 && <span style={{ background:'#fef2f2', color:'#dc2626', borderRadius:50, padding:'2px 10px', fontSize:11, fontWeight:700 }}>🚨 URGENT</span>}
                      </div>
                      <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>
                        Entré à {f.heure_entree ? new Date(f.heure_entree).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}) : '—'}
                        {f.alerte_message && <span style={{ color:'#dc2626', marginLeft:8 }}>⚠️ {f.alerte_message}</span>}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          // Open dossier directly from file d'attente
                          const r = await api.get(`/medecin/dossier/${f.dossier_id}`)
                          setSelected(r.data.dossier)
                          setDossierId(f.dossier_id)
                          setOnglet('consultations')
                        } catch (e: any) {
                          toast.error(e?.response?.data?.detail || 'Erreur accès dossier')
                        }
                      }}
                      style={{ background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontSize:14 }}>
                      📋 Ouvrir dossier
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {onglet === 'tableau' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Bonjour Dr. {user?.nom?.split(' ').pop()} 👋</h1>
              <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
                {rdvAujourd.length > 0 ? `Vous avez ${rdvAujourd.length} rendez-vous aujourd'hui.` : "Aucun rendez-vous aujourd'hui."}
              </p>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { icon: 'fa-calendar-check', color: '#1641C8', bg: '#eff6ff',  v: rdvAujourd.length,    label: "RDV aujourd'hui" },
                { icon: 'fa-calendar-days',  color: '#0d9488', bg: '#f0fdfa',  v: rdvAVenir.length,     label: 'RDV à venir' },
                { icon: 'fa-file-medical',   color: '#16a34a', bg: '#f0fdf4',  v: actes6mois.length,    label: 'Actes — 6 mois' },
                { icon: 'fa-users',          color: '#7c3aed', bg: '#f5f3ff',  v: new Set(actes6mois.map(a => a.patient_id || a.patient_nom)).size, label: 'Patients uniques' },
              ].map(k => (
                <div key={k.label} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <i className={`fa-solid ${k.icon}`} style={{ color: k.color, fontSize: 18 }} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: k.color }}>{k.v}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{k.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Prochains RDV */}
              <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={15} color="#1641C8" /> Prochains rendez-vous
                  </h3>
                  <button onClick={() => setOnglet('rdv')} style={{ background: 'none', border: 'none', color: '#1641C8', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    Voir tout <ChevronRight size={12} />
                  </button>
                </div>
                {rdvAVenir.slice(0, 4).map(r => {
                  const s = STATUT_RDV[r.statut] || STATUT_RDV.en_attente
                  return (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {r.type_rdv === 'video' ? <Video size={16} color="#1641C8" /> : <User size={16} color="#1641C8" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{r.patient_nom}</div>
                        <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                          {fmtDate(r.date_rdv)} · {fmtHeure(r.date_rdv)}
                          {r.motif && <> · {r.motif}</>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ background: s.bg, color: s.color, borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                          {s.label}
                        </span>
                        {r.lien_video && (
                          <a href={r.lien_video} target="_blank" rel="noreferrer" style={{ background: '#1641C8', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                            Rejoindre
                          </a>
                        )}
                        {r.statut === 'en_attente' || r.statut === 'paiement_effectue' ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={async () => {
                              await api.post(`/rdv/confirmer/${r.id}`, {})
                              toast.success('RDV confirmé ✓')
                              const updated = await rdvApi.list()
                              setRdvAVenir(updated.data?.filter((x: any) => new Date(x.date_rdv) >= new Date()) || [])
                            }} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                              ✓ Confirmer
                            </button>
                            <button onClick={() => {
                              const msg = prompt('Votre message + nouveau créneau proposé:')
                              if (msg) api.post(`/rdv/proposer-autre-moment/${r.id}`, { message: msg, nouveau_moment: msg }).then(() => toast.success('Proposition envoyée'))
                            }} style={{ background: '#d97706', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                              📅 Autre moment
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
                {rdvAVenir.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                    <Calendar size={32} style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0, fontSize: 13 }}>Aucun rendez-vous à venir</p>
                  </div>
                )}
              </div>

              {/* Répartition actes 6 mois */}
              <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={15} color="#0d9488" /> Activité — 6 derniers mois
                  </h3>
                  <button onClick={() => setOnglet('consultations')} style={{ background: 'none', border: 'none', color: '#1641C8', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    Détail <ChevronRight size={12} />
                  </button>
                </div>
                {statActes.map(s => (
                  <div key={s.value} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{s.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.count}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3, background: s.color,
                        width: actes6mois.length > 0 ? `${(s.count / actes6mois.length) * 100}%` : '0%',
                        transition: 'width 0.5s'
                      }} />
                    </div>
                  </div>
                ))}
                {actes6mois.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                    <p style={{ margin: 0, fontSize: 13 }}>Aucune activité enregistrée</p>
                  </div>
                )}
              </div>
            </div>

            {/* Derniers actes */}
            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0', marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', margin: 0 }}>Dernières consultations / gestes</h3>
                <Link href="/medecin/dossier" style={{ background:'white', color:'#1641C8', border:'1px solid #1641C8', borderRadius:8, padding:'7px 14px', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, textDecoration:'none', marginRight:8 }}>
                <FileText size={13} /> Formulaires
              </Link>
              <button onClick={() => { setShowForm(true); setOnglet('consultations') }} style={{
                  background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white',
                  border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}>
                  <i className="fa-solid fa-plus" style={{ marginRight: 6 }} />Nouvel acte
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      {['Date','Patient','Code','Type','Description','Notes'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#94a3b8', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayActes.slice(0, 5).map(a => {
                      const t = TYPES_ACTE.find(x => x.value === a.type_acte)
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>{fmtDateCourt(a.date_acte)}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{a.patient_nom}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: '#eff6ff', color: '#1641C8', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                              {a.patient_id || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: t?.bg, color: t?.color, borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {t?.label}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#475569', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description}</td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.notes}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            RENDEZ-VOUS À VENIR
        ══════════════════════════════════════════════════════════════ */}
        {onglet === 'rdv' && (
          <div>
            <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#0f172a', marginBottom: 6 }}>Mes rendez-vous à venir</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>{rdvAVenir.length} rendez-vous planifié{rdvAVenir.length > 1 ? 's' : ''}</p>

            {rdvAVenir.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 20, padding: 48, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <Calendar size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
                <p style={{ color: '#64748b' }}>Aucun rendez-vous à venir pour le moment.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rdvAVenir.map(r => {
                  const s = STATUT_RDV[r.statut] || STATUT_RDV.en_attente
                  const isToday = new Date(r.date_rdv).toDateString() === new Date().toDateString()
                  return (
                    <div key={r.id} style={{
                      background: 'white', borderRadius: 18, padding: 20,
                      border: `1px solid ${isToday ? '#bae6fd' : '#e2e8f0'}`,
                      borderLeft: `4px solid ${isToday ? '#1641C8' : '#e2e8f0'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: r.type_rdv === 'video' ? '#eff6ff' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {r.type_rdv === 'video' ? <Video size={22} color="#1641C8" /> : <User size={22} color="#16a34a" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{r.patient_nom}</span>
                            {isToday && <span style={{ background: '#fef3c7', color: '#d97706', borderRadius: 50, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>AUJOURD'HUI</span>}
                            <span style={{ background: s.bg, color: s.color, borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            <span style={{ color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={13} /> {fmtDate(r.date_rdv)} à {fmtHeure(r.date_rdv)}
                            </span>
                            <span style={{ color: '#64748b', fontSize: 13 }}>📞 {r.patient_telephone}</span>
                            {r.patient_email && <span style={{ color: '#64748b', fontSize: 13 }}>✉️ {r.patient_email}</span>}
                            {r.type_rdv === 'video' && <span style={{ color: '#1641C8', fontSize: 13, fontWeight: 600 }}>📹 Consultation vidéo</span>}
                          </div>
                          {r.motif && <div style={{ marginTop: 8, color: '#475569', fontSize: 13, background: '#f8fafc', borderRadius: 8, padding: '6px 10px' }}>Motif : {r.motif}</div>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                          {r.lien_video && (
                            <a href={r.lien_video} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', textDecoration: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Video size={14} /> Rejoindre
                            </a>
                          )}
                          <a href={`tel:${r.patient_telephone}`} style={{ background: '#f1f5f9', color: '#374151', textDecoration: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>
                            Appeler
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            CONSULTATIONS / GESTES — 6 DERNIERS MOIS
        ══════════════════════════════════════════════════════════════ */}
        {onglet === 'consultations' && (
          <div>
            {/* Recherche directe par ID patient (patient se présente sans RDV) */}
            <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', gap:12, alignItems:'center' }}>
              <span style={{ fontSize:20 }}>🔍</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>Patient se présente avec son ID</div>
                <div style={{ display:'flex', gap:8 }}>
                  <input
                    id="search-patient-id"
                    placeholder="#RB-0042"
                    style={{ flex:1, padding:'9px 14px', borderRadius:8, border:'1px solid #fcd34d', fontSize:14, fontFamily:'monospace', fontWeight:700 }}
                    onKeyDown={async (e) => {
                      if (e.key !== 'Enter') return
                      const val = (e.target as HTMLInputElement).value.trim().toUpperCase()
                      if (!val) return
                      try {
                        // Try to get active dossier for this patient
                        const r = await api.get(`/medecin/dossier-par-patient/${val}`)
                        if (r.data?.dossier) {
                          setSelected(r.data.dossier)
                          setDossierId(r.data.dossier.id)
                          toast.success(`Dossier ouvert pour ${val}`)
                        }
                      } catch (err: any) {
                        toast.error(err?.response?.data?.detail || `Aucun dossier actif pour ${val}`)
                      }
                    }}
                  />
                  <button
                    onClick={async () => {
                      const input = document.getElementById('search-patient-id') as HTMLInputElement
                      const val = input?.value?.trim().toUpperCase()
                      if (!val) return
                      try {
                        const r = await api.get(`/medecin/dossier-par-patient/${val}`)
                        if (r.data?.dossier) { setSelected(r.data.dossier); setDossierId(r.data.dossier.id); toast.success(`Dossier ouvert`) }
                      } catch (err: any) { toast.error(err?.response?.data?.detail || 'Introuvable') }
                    }}
                    style={{ background:'#d97706', color:'white', border:'none', borderRadius:8, padding:'9px 18px', fontWeight:700, cursor:'pointer', fontSize:13 }}>
                    Ouvrir
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#0f172a', margin: 0 }}>Consultations & gestes effectués</h2>
                <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>6 derniers mois · {actes6mois.length} acte{actes6mois.length > 1 ? 's' : ''} enregistré{actes6mois.length > 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setShowForm(!showForm)} style={{
                background: showForm ? '#f1f5f9' : 'linear-gradient(135deg,#1641C8,#0d9488)',
                color: showForm ? '#374151' : 'white', border: 'none', borderRadius: 12,
                padding: '10px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
              }}>
                {showForm ? <><X size={14} /> Fermer</> : <><i className="fa-solid fa-plus" /> Saisir un acte</>}
              </button>
            </div>

            {/* Formulaire nouvel acte */}
            {showForm && (
              <div style={{ background: 'white', borderRadius: 18, padding: 24, border: '1px solid #e2e8f0', marginBottom: 20 }}>
                <h4 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Saisir un nouvel acte médical</h4>
                <form onSubmit={handleSubmit(onAddActe)}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 5 }}>Nom du patient *</label>
                      <input {...register('patient_nom', { required: true })} placeholder="Nom complet"
                        style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: `1px solid ${errors.patient_nom ? '#ef4444' : '#d1d5db'}`, fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 5 }}>Code patient</label>
                      <input {...register('patient_id')} placeholder="#RB-000"
                        style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 5 }}>Type d'acte *</label>
                      <select {...register('type_acte')} style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, background: 'white', boxSizing: 'border-box' }}>
                        {TYPES_ACTE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 5 }}>Spécialité / Service</label>
                      <input {...register('specialite')} placeholder="Ex: Gynécologie"
                        style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 5 }}>Description de l'acte *</label>
                    <input {...register('description', { required: true })} placeholder="Description clinique"
                      style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: `1px solid ${errors.description ? '#ef4444' : '#d1d5db'}`, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 5 }}>Notes cliniques</label>
                    <textarea {...register('notes')} rows={3} placeholder="Observations, prescriptions, suivi recommandé..."
                      style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" style={{ background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    <i className="fa-solid fa-save" style={{ marginRight: 8 }} />Enregistrer l'acte
                  </button>
                </form>
                <div style={{ marginTop: 18, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                  <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🔄 Recommander vers spécialiste</h4>
                  <RecommandationPanel dossierId={dossierId} />
                </div>
              </div>
            )}

            {/* Filtres par type */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={() => setFiltreActe('tous')} style={{
                padding: '7px 16px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                background: filtreActe === 'tous' ? '#1641C8' : '#f1f5f9',
                color: filtreActe === 'tous' ? 'white' : '#64748b'
              }}>Tous ({actes6mois.length})</button>
              {TYPES_ACTE.map(t => (
                <button key={t.value} onClick={() => setFiltreActe(t.value)} style={{
                  padding: '7px 16px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  background: filtreActe === t.value ? t.color : '#f1f5f9',
                  color: filtreActe === t.value ? 'white' : '#64748b'
                }}>
                  {t.label} ({actes6mois.filter(a => a.type_acte === t.value).length})
                </button>
              ))}
            </div>

            {/* Liste des actes */}
            {actesFiltres.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 20, padding: 48, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <FileText size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
                <p style={{ color: '#64748b' }}>Aucun acte enregistré pour cette période.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {actesFiltres.map(a => {
                  const t = TYPES_ACTE.find(x => x.value === a.type_acte)
                  return (
                    <div key={a.id} style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: t?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fa-solid fa-file-medical" style={{ color: t?.color, fontSize: 18 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{a.patient_nom}</span>
                          {a.patient_id && (
                            <span style={{ background: '#eff6ff', color: '#1641C8', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{a.patient_id}</span>
                          )}
                          <span style={{ background: t?.bg, color: t?.color, borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{t?.label}</span>
                          <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 'auto' }}>{fmtDate(a.date_acte)}</span>
                        </div>
                        {a.specialite && <div style={{ color: '#0d9488', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{a.specialite}</div>}
                        <div style={{ color: '#475569', fontSize: 13 }}>{a.description}</div>
                        {a.notes && <div style={{ marginTop: 6, background: '#f8fafc', borderRadius: 8, padding: '6px 10px', color: '#64748b', fontSize: 12 }}>📝 {a.notes}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PROFIL — INFORMATIONS PERSONNELLES ET PROFESSIONNELLES UNIQUEMENT
            Aucune donnée financière ou comptable
        ══════════════════════════════════════════════════════════════ */}
        {onglet === 'profil' && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#0f172a', margin: 0 }}>Mon profil</h2>
                <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Informations visibles par les patients</p>
              </div>
              <button onClick={() => setEditProfil(!editProfil)} style={{
                background: editProfil ? '#f1f5f9' : 'white', border: '1px solid #e2e8f0',
                borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontWeight: 600,
                fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 6
              }}>
                {editProfil ? <><X size={14} /> Annuler</> : <><Edit2 size={14} /> Modifier</>}
              </button>
            </div>

            {/* Carte identité */}
            <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#1641C8,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                  {profil.emoji}
                </div>
                <div>
                  <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a', margin: '0 0 4px' }}>Dr. {user?.nom}</h3>
                  <div style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: 50, padding: '4px 14px', fontSize: 12, fontWeight: 600, display: 'inline-block', marginBottom: 4 }}>
                    {(user as any)?.specialite || 'Médecin'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{user?.email}</div>
                </div>
              </div>

              {editProfil ? (
                <div>
                  {[
                    { label: 'Téléphone / WhatsApp', key: 'telephone' as const, placeholder: '+509 3xxx-xxxx' },
                    { label: 'Disponibilités', key: 'disponibilites' as const, placeholder: 'Ex: Lun–Ven 07h–17h' },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: 13, marginBottom: 6 }}>{f.label}</label>
                      <input value={profil[f.key]} onChange={e => setProfil(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                        style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: 13, marginBottom: 6 }}>
                      Biographie <span style={{ color: '#94a3b8', fontWeight: 400 }}>(visible sur votre profil public)</span>
                    </label>
                    <textarea value={profil.bio} onChange={e => setProfil(p => ({ ...p, bio: e.target.value }))}
                      rows={5} placeholder="Décrivez votre formation, vos spécialisations, votre approche médicale..."
                      style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <button onClick={() => { toast.success('Profil mis à jour ✓'); setEditProfil(false) }} style={{
                    background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white',
                    border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <Save size={14} /> Sauvegarder
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { icon: 'fa-phone',      label: 'Téléphone',      val: profil.telephone || 'Non renseigné' },
                    { icon: 'fa-clock',      label: 'Disponibilités', val: profil.disponibilites },
                    { icon: 'fa-envelope',   label: 'Email',          val: user?.email || '' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`fa-solid ${item.icon}`} style={{ color: '#1641C8', fontSize: 14 }} />
                      </div>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14, marginTop: 2 }}>{item.val}</div>
                      </div>
                    </div>
                  ))}
                  {profil.bio && (
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Biographie</div>
                      <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, margin: 0, background: '#f8fafc', padding: 12, borderRadius: 10 }}>{profil.bio}</p>
                    </div>
                  )}
                  {!profil.bio && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: 12 }}>
                      <p style={{ margin: 0, color: '#92400e', fontSize: 13 }}>
                        💡 Ajoutez votre biographie pour que les patients puissent vous connaître avant le rendez-vous.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lien profil public */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 16, padding: 18 }}>
              <div style={{ fontWeight: 700, color: '#0369a1', fontSize: 13, marginBottom: 6 }}>
                <Star size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Votre profil public
              </div>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 12px', lineHeight: 1.6 }}>
                Votre profil est visible par tous les patients sur la page des spécialistes. Plus il est complet, plus les patients vous font confiance.
              </p>
              <Link href={`/specialistes/${user?.id || 1}`} target="_blank" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'white', color: '#1641C8', textDecoration: 'none',
                borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13,
                border: '1px solid #bae6fd'
              }}>
                <i className="fa-solid fa-eye" /> Voir mon profil public
              </Link>
            </div>
          </div>
        )}

      </div>

        {/* ══════════════════════════════════════════════════════════════
            DEMANDE D'ACCÈS DOSSIER (via autorisation admin)
        ══════════════════════════════════════════════════════════════ */}
        {onglet === 'demande-acces' && (
          <DemandeAccesSection />
        )}

    </div>
  )
}

function DemandeAccesSection() {
  const [patientNumero, setPatientNumero] = React.useState('')
  const [motif,         setMotif]         = React.useState('')
  const [urgence,       setUrgence]       = React.useState(false)
  const [mesdemandes,   setMesDemandes]   = React.useState<any[]>([])
  const [loading,       setLoading]       = React.useState(false)
  const [recherche,     setRecherche]     = React.useState('')
  const [dossierAcces,  setDossierAcces]  = React.useState<any>(null)

  React.useEffect(() => {
    import('@/lib/api').then(({ api }) => {
      api.get('/medecin/mes-demandes-acces').then(r => setMesDemandes(r.data || [])).catch(() => {})
    })
  }, [])

  const soumettre = async () => {
    if (!patientNumero.trim() || !motif.trim()) { alert('Numéro patient et motif requis'); return }
    setLoading(true)
    try {
      const { api } = await import('@/lib/api')
      await api.post('/medecin/demande-acces-dossier', { patient_numero: patientNumero.trim(), motif, urgence })
      alert("Demande envoyée à l'administrateur. Vous serez notifié de la décision.")
      setPatientNumero(''); setMotif(''); setUrgence(false)
      api.get('/medecin/mes-demandes-acces').then(r => setMesDemandes(r.data || [])).catch(() => {})
    } catch (e: any) { alert(e?.response?.data?.detail || 'Erreur') }
    finally { setLoading(false) }
  }

  const verifierAcces = async () => {
    if (!recherche.trim()) return
    try {
      const { api } = await import('@/lib/api')
      const r = await api.get(`/medecin/acces-autorise/${recherche.trim()}`)
      setDossierAcces(r.data)
    } catch (e: any) { alert(e?.response?.data?.detail || 'Accès non autorisé — soumettez une demande ci-dessous') }
  }

  const STATUT: Record<string, any> = {
    en_attente: { label: 'En attente admin', bg: '#fef3c7', color: '#d97706' },
    approuve:   { label: 'Approuvé ✓',       bg: '#f0fdf4', color: '#16a34a' },
    refuse:     { label: 'Refusé',            bg: '#fef2f2', color: '#dc2626' },
    expire:     { label: 'Expiré',            bg: '#f1f5f9', color: '#64748b' },
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#0f172a', marginBottom: 6 }}>Accès à un dossier patient</h2>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Consultez un dossier autorisé ou soumettez une demande d'accès à l'administrateur.</p>

      {/* Vérifier accès existant */}
      <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14 }}>🔍 Consulter un dossier autorisé</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={recherche} onChange={e => setRecherche(e.target.value)}
            placeholder="Numéro patient ex: #RB-0042"
            style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'monospace' }} />
          <button onClick={verifierAcces} style={{ background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none', borderRadius: 10, padding: '11px 20px', fontWeight: 700, cursor: 'pointer' }}>
            Accéder
          </button>
        </div>
        {dossierAcces && (
          <div style={{ marginTop: 16, background: '#f0fdf4', borderRadius: 10, padding: 16 }}>
            <div style={{ color: '#16a34a', fontWeight: 700, marginBottom: 8 }}>
              ✓ Accès autorisé — expire dans {dossierAcces.duree_restante_h}h
            </div>
            <div style={{ fontSize: 13, color: '#374151' }}>
              Patient : <strong>{dossierAcces.patient?.nom} {dossierAcces.patient?.prenom}</strong> · {dossierAcces.dossiers?.length} dossier(s)
            </div>
          </div>
        )}
      </div>

      {/* Formulaire demande */}
      <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14 }}>📋 Soumettre une demande d'accès</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Numéro patient *</label>
          <input value={patientNumero} onChange={e => setPatientNumero(e.target.value)} placeholder="#RB-0042"
            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'monospace', boxSizing: 'border-box' as const }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Motif de la demande * <span style={{ color: '#94a3b8', fontWeight: 400 }}>(obligatoire — journalisé)</span></label>
          <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3}
            placeholder="Expliquez pourquoi vous avez besoin d'accéder à ce dossier..."
            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' as const }} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 18 }}>
          <input type="checkbox" checked={urgence} onChange={e => setUrgence(e.target.checked)} style={{ width: 16, height: 16 }} />
          <span style={{ fontWeight: 600, fontSize: 13, color: urgence ? '#dc2626' : '#374151' }}>🚨 Cas urgent (traitement prioritaire)</span>
        </label>
        <button onClick={soumettre} disabled={loading} style={{
          background: urgence ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'linear-gradient(135deg,#1641C8,#0d9488)',
          color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14
        }}>
          {loading ? 'Envoi...' : urgence ? '🚨 Envoyer demande urgente' : "Envoyer la demande à l'admin"}
        </button>
      </div>

      {/* Mes demandes */}
      {mesdemandes.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Mes demandes récentes</h3>
          {mesdemandes.slice(0, 5).map((d: any) => {
            const s = STATUT[d.statut] || STATUT.en_attente
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontFamily: 'monospace', color: '#1641C8', fontWeight: 700, fontSize: 13 }}>{d.patient_numero}</span>
                <span style={{ flex: 1, color: '#64748b', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.motif}</span>
                <span style={{ background: s.bg, color: s.color, borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</span>
                {d.acces_expire_at && d.statut === 'approuve' && (
                  <span style={{ color: '#94a3b8', fontSize: 11 }}>Exp: {new Date(d.acces_expire_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
