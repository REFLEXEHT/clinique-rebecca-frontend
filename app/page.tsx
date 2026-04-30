'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import Link from 'next/link'
import { LogOut, User, Activity, Clock, AlertTriangle, CheckCircle, Printer } from 'lucide-react'

interface Dossier { id: number; patient_numero: string; type_visite: string; specialite: string; statut: string; date_visite: string; paiement_effectue: boolean }

const ALERTE_LIMITES = [
  { champ: 'tension_systolique', label: 'Tension systolique', unit: 'mmHg', min: 80,  max: 180 },
  { champ: 'glycemie',          label: 'Glycémie',           unit: 'mg/dL', min: 50,  max: 600 },
  { champ: 'saturation_o2',     label: 'SpO2',               unit: '%',    min: 90,  max: 100 },
  { champ: 'temperature',       label: 'Température',        unit: '°C',   min: 35,  max: 40  },
  { champ: 'frequence_cardiaque', label: 'FC',               unit: 'bpm',  min: 40,  max: 150 },
]

export default function InfirmierDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [dossiers,    setDossiers]    = useState<Dossier[]>([])
  const [selected,    setSelected]    = useState<Dossier | null>(null)
  const [sv,          setSv]          = useState<Record<string, string>>({})
  const [alertes,     setAlertes]     = useState<string[]>([])
  const [submitting,  setSubmitting]  = useState(false)

  useEffect(() => {
    if (!loading && (!isAuthenticated || !['infirmier','admin'].includes(user?.role || ''))) {
      router.push('/login')
    }
  }, [isAuthenticated, user, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/infirmier/dossiers-en-attente')
      .then(r => setDossiers(r.data || []))
      .catch(() => {})
  }, [isAuthenticated])

  const detectAlertes = (vals: Record<string, string>) => {
    const msgs: string[] = []
    const sys = parseFloat(vals.tension_systolique || '0')
    if (sys && (sys > 180 || sys < 80)) msgs.push(`⚠️ Tension critique: ${sys} mmHg`)
    const glyc = parseFloat(vals.glycemie || '0')
    if (glyc && glyc > 600) msgs.push(`⚠️ Glycémie critique: ${glyc} mg/dL`)
    const spo2 = parseFloat(vals.saturation_o2 || '0')
    if (spo2 && spo2 < 90) msgs.push(`⚠️ SpO2 critique: ${spo2}%`)
    const temp = parseFloat(vals.temperature || '0')
    if (temp && (temp > 40 || temp < 35)) msgs.push(`⚠️ Température critique: ${temp}°C`)
    const fc = parseFloat(vals.frequence_cardiaque || '0')
    if (fc && (fc > 150 || fc < 40)) msgs.push(`⚠️ FC critique: ${fc} bpm`)
    setAlertes(msgs)
  }

  const onSvChange = (champ: string, val: string) => {
    const newSv = { ...sv, [champ]: val }
    setSv(newSv)
    detectAlertes(newSv)
  }

  const submitSv = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      const payload: any = { dossier_id: selected.id }
      Object.entries(sv).forEach(([k, v]) => { if (v) payload[k] = parseFloat(v) })
      const r = await api.post('/infirmier/signes-vitaux', payload)
      if (r.data.alerte) {
        toast.error(`Alertes critiques détectées!\n${r.data.alertes.join('\n')}`, { duration: 8000 })
      } else {
        toast.success('Signes vitaux enregistrés — dossier placé en file d\'attente ✓')
      }
      setDossiers(prev => prev.filter(d => d.id !== selected.id))
      setSelected(null); setSv({}); setAlertes([])
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><p>Chargement...</p></div>

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column' }}>
      {/* Navbar */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d,#0d9488)', height:64, display:'flex', alignItems:'center', padding:'0 24px', gap:16 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🏥</div>
        <div>
          <div style={{ color:'white', fontWeight:800, fontSize:14 }}>{user?.nom}</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11 }}>Infirmier(ère)</div>
        </div>
        <div style={{ marginLeft:'auto' }}>
          <button onClick={() => { logout(); router.push('/') }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </div>

      <div style={{ flex:1, padding:28, maxWidth:1000, margin:'0 auto', width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
          <h1 style={{ fontWeight:900, fontSize:'1.4rem', color:'#0f172a', margin:0 }}>Dashboard Infirmier</h1>
          <Link href="/infirmier/documents" style={{ background:'#f0fdfa', color:'#0d9488', border:'1px solid #99f6e4', borderRadius:10, padding:'9px 16px', fontWeight:700, fontSize:13, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
            <Printer size={14} /> Imprimer documents
          </Link>
        </div>
        <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>{dossiers.length} dossier{dossiers.length > 1 ? 's' : ''} en attente de signes vitaux</p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          {/* Liste dossiers */}
          <div style={{ background:'white', borderRadius:18, padding:20, border:'1px solid #e2e8f0' }}>
            <h3 style={{ fontWeight:700, color:'#0f172a', marginBottom:16, fontSize:15, display:'flex', alignItems:'center', gap:8 }}>
              <Clock size={15} color="#0d9488" /> Patients en attente
            </h3>
            {dossiers.length === 0 ? (
              <div style={{ textAlign:'center', padding:32, color:'#94a3b8' }}>
                <CheckCircle size={32} style={{ marginBottom:8 }} />
                <p style={{ margin:0 }}>Aucun patient en attente</p>
              </div>
            ) : dossiers.map(d => (
              <div key={d.id} onClick={() => setSelected(d)} style={{
                padding:'12px 16px', borderRadius:12, border:`1px solid ${selected?.id === d.id ? '#0d9488' : '#e2e8f0'}`,
                marginBottom:8, cursor:'pointer', background: selected?.id === d.id ? '#f0fdfa' : 'white',
                display:'flex', alignItems:'center', gap:12
              }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'#f0fdfa', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <User size={18} color="#0d9488" />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#0f172a', fontFamily:'monospace', fontSize:15 }}>{d.patient_numero}</div>
                  <div style={{ color:'#64748b', fontSize:12 }}>{d.specialite || d.type_visite}</div>
                </div>
                <span style={{ background:'#fef3c7', color:'#d97706', borderRadius:50, padding:'3px 10px', fontSize:11, fontWeight:600 }}>
                  En attente
                </span>
              </div>
            ))}
            <div style={{ marginTop:12, background:'#fffbeb', borderRadius:10, padding:10, fontSize:12, color:'#92400e' }}>
              ⚠️ Accès via ID patient uniquement — jamais par nom
            </div>
          </div>

          {/* Formulaire signes vitaux */}
          <div style={{ background:'white', borderRadius:18, padding:20, border:`1px solid ${selected ? '#0d9488' : '#e2e8f0'}` }}>
            <h3 style={{ fontWeight:700, color:'#0f172a', marginBottom:16, fontSize:15, display:'flex', alignItems:'center', gap:8 }}>
              <Activity size={15} color="#0d9488" /> Signes vitaux
            </h3>
            {!selected ? (
              <div style={{ textAlign:'center', padding:32, color:'#94a3b8' }}>
                <Activity size={32} style={{ marginBottom:8 }} />
                <p style={{ margin:0 }}>Sélectionnez un patient à gauche</p>
              </div>
            ) : (
              <>
                <div style={{ background:'#f0fdfa', borderRadius:10, padding:'10px 14px', marginBottom:16 }}>
                  <span style={{ fontWeight:700, color:'#0d9488', fontFamily:'monospace' }}>{selected.patient_numero}</span>
                  <span style={{ color:'#64748b', fontSize:13, marginLeft:8 }}>{selected.specialite}</span>
                </div>

                {alertes.length > 0 && (
                  <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:10, padding:12, marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontWeight:700, color:'#dc2626', marginBottom:6 }}>
                      <AlertTriangle size={14} /> Valeurs critiques détectées
                    </div>
                    {alertes.map((a, i) => <div key={i} style={{ fontSize:13, color:'#dc2626' }}>{a}</div>)}
                  </div>
                )}

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                  {[
                    { key:'tension_systolique',    label:'Tension sys. (mmHg)', ph:'120' },
                    { key:'tension_diastolique',   label:'Tension dia. (mmHg)', ph:'80'  },
                    { key:'frequence_cardiaque',   label:'FC (bpm)',             ph:'72'  },
                    { key:'temperature',           label:'Température (°C)',     ph:'37'  },
                    { key:'saturation_o2',         label:'SpO2 (%)',             ph:'98'  },
                    { key:'frequence_respiratoire',label:'FR (/min)',            ph:'16'  },
                    { key:'poids',                 label:'Poids (kg)',           ph:'70'  },
                    { key:'taille',                label:'Taille (cm)',          ph:'170' },
                    { key:'glycemie',              label:'Glycémie (mg/dL)',     ph:'90'  },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display:'block', fontWeight:600, fontSize:12, color:'#374151', marginBottom:4 }}>{f.label}</label>
                      <input type="number" step="0.1" placeholder={f.ph}
                        value={sv[f.key] || ''}
                        onChange={e => onSvChange(f.key, e.target.value)}
                        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${alertes.some(a => a.includes(f.label.split(' ')[0])) ? '#ef4444' : '#d1d5db'}`, fontSize:14, boxSizing:'border-box' as const }} />
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontWeight:600, fontSize:12, color:'#374151', marginBottom:4 }}>Notes</label>
                  <textarea rows={2} value={sv.notes || ''} onChange={e => setSv(p => ({...p, notes: e.target.value}))}
                    placeholder="Observations infirmier..."
                    style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:14, resize:'vertical', boxSizing:'border-box' as const }} />
                </div>

                <button onClick={submitSv} disabled={submitting} style={{
                  width:'100%', background: alertes.length > 0 ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'linear-gradient(135deg,#0d9488,#0f766e)',
                  color:'white', border:'none', borderRadius:12, padding:'12px', fontWeight:700, cursor:'pointer', fontSize:14
                }}>
                  {submitting ? 'Enregistrement...' : alertes.length > 0 ? '🚨 Enregistrer (URGENT)' : '✓ Enregistrer + Placer en file d\'attente'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
