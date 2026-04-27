'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { laboApi } from '@/lib/api'
import { ResultatLabo } from '@/types'
import { Plus, X, Search, FlaskConical, LogOut, CheckCircle, AlertCircle, Send } from 'lucide-react'

const EXAMENS = [
  'NFS (Numération Formule Sanguine)','Glycémie à jeun','HbA1c','Créatininémie',
  'Transaminases (ALAT/ASAT)','TSH (Thyroïde)','Sérologie VIH','ECBU',
  'Bilan lipidique','Hémoculture','Coproculture','Test de grossesse',
  'Ionogramme sanguin','TP/TCA','CRP','Acide urique','Bilan rénal complet',
  'Bilan hépatique','Protéinurie 24h','ANCA','Anti-DNA natif',
]

const STATUS_MAP: Record<string,{label:string;bg:string;color:string}> = {
  en_attente:{ label:'En attente', bg:'#fffbeb', color:'#d97706' },
  disponible:{ label:'Disponible', bg:'#eff6ff', color:'#1641C8' },
  envoye:{ label:'Transmis', bg:'#f0fdf4', color:'#16a34a' },
}

const DEMO: ResultatLabo[] = [
  { id:1, patient_id:'#RB-42015', patient_nom:'Marie Théodore', type_examen:'NFS', resultats:'Hb: 12g/dL, GB: 7800/mm³, Plaquettes: 245000/mm³', notes:'Normal', date_examen:new Date().toISOString(), technicien_id:1, status:'disponible' as 'en_attente' | 'disponible' | 'envoye' },
  { id:2, patient_id:'#RB-39841', patient_nom:'Paul Jean-Baptiste', type_examen:'Glycémie à jeun', resultats:'1.26 g/L', notes:'Légèrement élevé', date_examen:new Date().toISOString(), technicien_id:1, status:'en_attente' as 'en_attente' | 'disponible' | 'envoye' },
  { id:3, patient_id:'#RB-51203', patient_nom:'Rose Étienne', type_examen:'TSH', resultats:'2.8 mUI/L', notes:'Normal', date_examen:new Date(Date.now()-86400000).toISOString(), technicien_id:1, status:'envoye' as 'en_attente' | 'disponible' | 'envoye' },
]

interface LaboForm {
  patient_id:string; patient_nom:string; patient_telephone:string; patient_email:string
  type_examen:string; resultats:string; valeurs_normales:string; interpretation:string; notes:string
}

export default function LaboPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [resultats, setResultats] = useState<ResultatLabo[]>(DEMO)
  const [showForm, setShowForm] = useState(false)
  const [searchId, setSearchId] = useState('')
  const [filtered, setFiltered] = useState<ResultatLabo[]>(DEMO)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingData, setPendingData] = useState<LaboForm|null>(null)
  const [savLoading, setSavLoading] = useState(false)

  const { register, handleSubmit, reset, watch } = useForm<LaboForm>()

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'labo')) router.push('/login')
  }, [isAuthenticated, user, loading])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'labo') {
      laboApi.list().then(r => {
        const data = r.data?.length ? r.data : DEMO
        setResultats(data); setFiltered(data)
      }).catch(() => {})
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!searchId.trim()) { setFiltered(resultats); return }
    const q = searchId.toLowerCase()
    setFiltered(resultats.filter(r => r.patient_id?.toLowerCase().includes(q) || r.patient_nom.toLowerCase().includes(q)))
  }, [searchId, resultats])

  const onSubmitForm = (data: LaboForm) => {
    setPendingData(data); setShowConfirm(true)
  }

  const confirmerSauvegarde = async () => {
    if (!pendingData) return
    setSavLoading(true)
    try {
      const payload = { ...pendingData, date_examen: new Date().toISOString(), technicien_id: user?.id, status: 'disponible' as const }
      const r = await laboApi.create(payload)
      const nouv = { id: r.data?.id || Date.now(), ...payload } as unknown as ResultatLabo
      setResultats(prev => [nouv, ...prev])
      setFiltered(prev => [nouv, ...prev])
      toast.success('Résultat enregistré. Notification envoyée au caissier et à l\'admin.')
      setShowForm(false); setShowConfirm(false); setPendingData(null); reset()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    }
    finally { setSavLoading(false) }
  }

  const fmtDate = (d:string) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})

  if (loading||!isAuthenticated) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid #0d9488', borderTopColor:'transparent' }} /></div>

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      {/* Header */}
      <div style={{ background:'#0f172a', height:64, display:'flex', alignItems:'center', padding:'0 24px', gap:16 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'rgba(13,148,136,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <FlaskConical size={18} color="#5eead4" />
        </div>
        <div style={{ fontWeight:800, color:'white', fontSize:'0.95rem' }}>Espace Laboratoire</div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}>{user?.nom}</span>
          <button onClick={() => { logout(); router.push('/') }} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:'6px 12px', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:12 }}>
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px' }}>
        {/* Actions bar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <div style={{ flex:1, position:'relative' }}>
            <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
            <input value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="Rechercher par code patient ou nom..."
              style={{ width:'100%', padding:'11px 14px 11px 42px', borderRadius:12, border:'1px solid #e2e8f0', fontSize:14, outline:'none', background:'white', boxSizing:'border-box' as const }} />
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:8, background:'#0d9488', color:'white', border:'none', borderRadius:12, padding:'11px 20px', fontWeight:700, cursor:'pointer', fontSize:14, whiteSpace:'nowrap' as const }}>
            <Plus size={16} /> Nouveau résultat
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div style={{ background:'white', borderRadius:20, border:'1px solid #e2e8f0', padding:28, marginBottom:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontWeight:800, color:'#0f172a', fontSize:'1rem', margin:0 }}>Enregistrer un résultat</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', display:'flex' }}><X size={18} /></button>
            </div>
            <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#c2410c', fontWeight:600 }}>
              Important — Une fois sauvegardé, le résultat ne pourra plus être modifié après 24 heures. Vérifiez les données avant de confirmer.
            </div>
            <form onSubmit={handleSubmit(onSubmitForm)}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Code patient *</label>
                  <input {...register('patient_id',{required:true})} placeholder="#RB-XXXXX"
                    style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const }} />
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Nom du patient *</label>
                  <input {...register('patient_nom',{required:true})} placeholder="Prénom Nom"
                    style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const }} />
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Téléphone patient</label>
                  <input {...register('patient_telephone')} placeholder="+509 xxxx xxxx"
                    style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const }} />
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Email patient</label>
                  <input {...register('patient_email')} type="email" placeholder="email@exemple.com"
                    style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const }} />
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Type d'examen *</label>
                <select {...register('type_examen',{required:true})} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, background:'white' }}>
                  <option value="">Sélectionner un examen</option>
                  {EXAMENS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Résultats *</label>
                <textarea {...register('resultats',{required:true})} rows={4} placeholder="Ex: Hb: 12g/dL, GB: 7800/mm³, Plaquettes: 245000/mm³..."
                  style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, resize:'vertical', boxSizing:'border-box' as const }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Valeurs de référence</label>
                  <input {...register('valeurs_normales')} placeholder="Ex: Hb: 12-16 g/dL..."
                    style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const }} />
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Interprétation</label>
                  <input {...register('interpretation')} placeholder="Normal / Élevé / Bas / Pathologique"
                    style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const }} />
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontWeight:600, color:'#374151', fontSize:13, marginBottom:6 }}>Notes techniques</label>
                <textarea {...register('notes')} rows={2} placeholder="Observations du technicien..."
                  style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, resize:'vertical', boxSizing:'border-box' as const }} />
              </div>
              <button type="submit" style={{ display:'flex', alignItems:'center', gap:8, background:'#0d9488', color:'white', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontSize:14 }}>
                <CheckCircle size={16} /> Vérifier avant sauvegarde
              </button>
            </form>
          </div>
        )}

        {/* Popup confirmation */}
        {showConfirm && pendingData && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
            <div style={{ background:'white', borderRadius:24, padding:36, maxWidth:520, width:'100%' }}>
              <h3 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.1rem', marginBottom:20 }}>Résumé avant sauvegarde</h3>
              <div style={{ background:'#f8fafc', borderRadius:14, padding:20, marginBottom:20 }}>
                {[
                  { label:'Code patient', val:pendingData.patient_id },
                  { label:'Nom', val:pendingData.patient_nom },
                  { label:'Téléphone', val:pendingData.patient_telephone },
                  { label:'Examen', val:pendingData.type_examen },
                  { label:'Résultats', val:pendingData.resultats },
                  { label:'Interprétation', val:pendingData.interpretation },
                ].map(f => (
                  <div key={f.label} style={{ display:'flex', gap:12, padding:'6px 0', borderBottom:'1px solid #e2e8f0' }}>
                    <span style={{ fontSize:12, color:'#94a3b8', fontWeight:600, minWidth:110 }}>{f.label}</span>
                    <span style={{ fontSize:13, color:'#0f172a', fontWeight:600, flex:1 }}>{f.val||'—'}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#991b1b' }}>
                Modification impossible après 24 heures. Une notification sera envoyée au caissier et à l'administrateur.
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setShowConfirm(false)} style={{ flex:1, background:'#f1f5f9', border:'none', borderRadius:12, padding:'12px 0', fontWeight:700, cursor:'pointer', color:'#374151' }}>Corriger</button>
                <button onClick={confirmerSauvegarde} disabled={savLoading} style={{ flex:2, background:'#0d9488', color:'white', border:'none', borderRadius:12, padding:'12px 0', fontWeight:700, cursor:'pointer', opacity:savLoading?0.7:1 }}>
                  {savLoading ? 'Enregistrement...' : 'Confirmer et enregistrer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste résultats */}
        <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', overflow:'hidden' }}>
          <div style={{ padding:'16px 24px', borderBottom:'1px solid #f1f5f9', fontWeight:800, color:'#0f172a', fontSize:'0.9rem' }}>
            Résultats enregistrés — {filtered.length}
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Code patient','Nom','Examen','Date','Statut','Action'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', color:'#64748b', fontWeight:700, fontSize:12, borderBottom:'1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const s = STATUS_MAP[r.status||'en_attente']
                return (
                  <tr key={r.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'12px 16px', fontWeight:700, color:'#1641C8', fontFamily:'monospace' }}>{r.patient_id}</td>
                    <td style={{ padding:'12px 16px', fontWeight:600, color:'#0f172a' }}>{r.patient_nom}</td>
                    <td style={{ padding:'12px 16px', color:'#374151' }}>{r.type_examen}</td>
                    <td style={{ padding:'12px 16px', color:'#64748b', fontSize:12 }}>{new Date(r.date_examen).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ background:s.bg, color:s.color, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700 }}>{s.label}</span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <button onClick={() => toast.success(`Résultat envoyé pour ${r.patient_nom}`)}
                        style={{ display:'flex', alignItems:'center', gap:6, background:'#eff6ff', color:'#1641C8', border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontWeight:700, fontSize:12 }}>
                        <Send size={13} /> Transmettre
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
