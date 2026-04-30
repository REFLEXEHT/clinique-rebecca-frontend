'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface Demande {
  id: number; medecin_nom: string; medecin_specialite: string
  patient_numero: string; motif: string; urgence: boolean
  statut: string; created_at: string; acces_expire_at?: string
  admin_commentaire?: string
}

export default function AdminDemandesAcces() {
  const [demandes,  setDemandes]  = useState<Demande[]>([])
  const [selected,  setSelected]  = useState<Demande | null>(null)
  const [duree,     setDuree]     = useState(24)
  const [motifRefus, setMotifRefus] = useState('')
  const [loading,   setLoading]   = useState(true)
  const [action,    setAction]    = useState<'approuver'|'refuser'|null>(null)

  const load = () => {
    api.get('/admin/demandes-acces-dossier')
      .then(r => { setDemandes(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const enAttente = demandes.filter(d => d.statut === 'en_attente')
  const traitees  = demandes.filter(d => d.statut !== 'en_attente')

  const approuver = async () => {
    if (!selected) return
    try {
      await api.put(`/admin/demandes-acces-dossier/${selected.id}/approuver`, { duree_acces_h: duree })
      toast.success(`Accès accordé à Dr ${selected.medecin_nom} pour ${duree}h ✓`)
      setSelected(null); setAction(null); load()
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur') }
  }

  const refuser = async () => {
    if (!selected || !motifRefus.trim()) { toast.error('Motif de refus obligatoire'); return }
    try {
      await api.put(`/admin/demandes-acces-dossier/${selected.id}/refuser`, { motif_refus: motifRefus })
      toast.success(`Demande refusée`)
      setSelected(null); setAction(null); setMotifRefus(''); load()
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur') }
  }

  const STATUT_STYLE: Record<string, any> = {
    en_attente: { bg: '#fef3c7', color: '#d97706', label: 'En attente' },
    approuve:   { bg: '#f0fdf4', color: '#16a34a', label: 'Approuvé' },
    refuse:     { bg: '#fef2f2', color: '#dc2626', label: 'Refusé' },
    expire:     { bg: '#f1f5f9', color: '#64748b', label: 'Expiré' },
  }

  return (
    <div style={{ padding: 28, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Shield size={24} color="#1641C8" />
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>
            Demandes d'accès dossier
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            {enAttente.length} demande{enAttente.length > 1 ? 's' : ''} en attente
          </p>
        </div>
        {enAttente.some(d => d.urgence) && (
          <div style={{ marginLeft: 'auto', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', fontWeight: 700, fontSize: 13 }}>
            <AlertTriangle size={14} /> {enAttente.filter(d => d.urgence).length} URGENTE{enAttente.filter(d => d.urgence).length > 1 ? 'S' : ''}
          </div>
        )}
      </div>

      {/* Modal décision */}
      {selected && action && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 480, width: '90%' }}>
            <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              {action === 'approuver' ? '✅ Approuver l\'accès' : '❌ Refuser l\'accès'}
            </h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
              Dr {selected.medecin_nom} demande l'accès au dossier <strong>{selected.patient_numero}</strong>
            </p>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 13 }}>
              <strong>Motif :</strong> {selected.motif}
            </div>

            {action === 'approuver' ? (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 8 }}>
                  Durée d'accès (heures)
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[2, 8, 24, 48].map(h => (
                    <button key={h} onClick={() => setDuree(h)} style={{
                      flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${duree === h ? '#1641C8' : '#e2e8f0'}`,
                      background: duree === h ? '#eff6ff' : 'white', color: duree === h ? '#1641C8' : '#64748b',
                      fontWeight: 700, cursor: 'pointer', fontSize: 14
                    }}>{h}h</button>
                  ))}
                </div>
                <input type="number" value={duree} onChange={e => setDuree(Number(e.target.value))} min={1} max={168}
                  style={{ width: '100%', marginTop: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' as const }} />
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 8 }}>
                  Motif du refus * (obligatoire)
                </label>
                <textarea value={motifRefus} onChange={e => setMotifRefus(e.target.value)} rows={3}
                  placeholder="Expliquez la raison du refus..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' as const }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={action === 'approuver' ? approuver : refuser} style={{
                flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 14, color: 'white',
                background: action === 'approuver' ? 'linear-gradient(135deg,#16a34a,#0d9488)' : 'linear-gradient(135deg,#dc2626,#b91c1c)'
              }}>
                {action === 'approuver' ? `✓ Accorder ${duree}h d'accès` : '✗ Refuser'}
              </button>
              <button onClick={() => { setSelected(null); setAction(null); setMotifRefus('') }}
                style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demandes en attente */}
      {enAttente.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={15} color="#d97706" /> En attente de décision
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {enAttente.map(d => (
              <div key={d.id} style={{ background: 'white', borderRadius: 16, padding: '18px 20px', border: `1px solid ${d.urgence ? '#fca5a5' : '#e2e8f0'}`, borderLeft: `4px solid ${d.urgence ? '#dc2626' : '#d97706'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>Dr {d.medecin_nom}</span>
                      <span style={{ color: '#0d9488', fontSize: 12, fontWeight: 600 }}>{d.medecin_specialite}</span>
                      {d.urgence && <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 50, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>🚨 URGENT</span>}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                      Demande d'accès au dossier patient <strong style={{ color: '#1641C8', fontFamily: 'monospace' }}>{d.patient_numero}</strong>
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#475569' }}>
                      <strong>Motif :</strong> {d.motif}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
                      Soumis le {new Date(d.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => { setSelected(d); setAction('approuver') }} style={{
                      background: 'linear-gradient(135deg,#16a34a,#0d9488)', color: 'white', border: 'none',
                      borderRadius: 10, padding: '9px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <CheckCircle size={14} /> Approuver
                    </button>
                    <button onClick={() => { setSelected(d); setAction('refuser') }} style={{
                      background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
                      borderRadius: 10, padding: '9px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <XCircle size={14} /> Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique */}
      {traitees.length > 0 && (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 12 }}>Historique des décisions</h2>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Médecin','Patient','Motif','Statut','Décision','Expire le'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {traitees.map(d => {
                  const s = STATUT_STYLE[d.statut] || STATUT_STYLE.en_attente
                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>Dr {d.medecin_nom}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#1641C8' }}>{d.patient_numero}</td>
                      <td style={{ padding: '10px 14px', color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.motif}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: s.bg, color: s.color, borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 12 }}>{d.admin_commentaire || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 12 }}>{d.acces_expire_at ? new Date(d.acces_expire_at).toLocaleString('fr-FR') : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Chargement...</div>}
      {!loading && demandes.length === 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 48, textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <Shield size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
          <p style={{ color: '#64748b' }}>Aucune demande d'accès pour le moment.</p>
        </div>
      )}
    </div>
  )
}
