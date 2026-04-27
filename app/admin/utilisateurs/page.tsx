'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { usersApi } from '@/lib/api'
import { Edit2, Save, X, CheckCircle, AlertCircle, Shield, RefreshCw, Trash2 } from 'lucide-react'

const ROLES_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  admin:     { label: 'Administrateur', color: '#6366f1', bg: '#f5f3ff' },
  medecin:   { label: 'Médecin',        color: '#0d9488', bg: '#f0fdfa' },
  caissier:  { label: 'Caissier',       color: '#d97706', bg: '#fffbeb' },
  labo:      { label: 'Laboratoire',    color: '#0891b2', bg: '#ecfeff' },
  patient:   { label: 'Patient',        color: '#1641C8', bg: '#eff6ff' },
  pharmacie: { label: 'Pharmacie',      color: '#dc2626', bg: '#fef2f2' },
}

const TYPES_MEDECIN = [
  { value: 'investisseur',            label: 'Investisseur' },
  { value: 'affilie',                 label: 'Affilié' },
  { value: 'exploitant',              label: 'Exploitant' },
  { value: 'investisseur_exploitant', label: 'Investisseur-Exploitant' },
]

const SPECIALITES = [
  'Chirurgie générale','Neurochirurgie','Neurologie','Orthopédie','Pédiatrie',
  'Dermatologie','Urologie','ORL','Gynécologie','Chirurgie pédiatrique',
  'Médecine interne','Ophtalmologie','Dentisterie','Physiothérapie','Optométrie',
]

interface PropResult { changed: number; detail?: Record<string, number>; message?: string }

export default function AdminUtilisateurs() {
  const [users, setUsers] = useState<any[]>([])
  const [editId, setEditId] = useState<number | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [propagation, setPropagation] = useState<{user_nom: string; props: any[]} | null>(null)
  const [filtre, setFiltre] = useState('tous')

  const load = () => usersApi.list().then(r => setUsers(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const startEdit = (u: any) => {
    setEditId(u.id)
    setPropagation(null)
    setEditData({ nom: u.nom, email: u.email, telephone: u.telephone || '', specialite: u.specialite || '', type_medecin: u.type_medecin || '' })
  }

  const onSave = async (u: any) => {
    setLoading(true)
    try {
      const res = await usersApi.update(u.id, editData)
      const props = res.data?.propagations || []
      const totalChanged = props.reduce((a: number, p: any) => a + (p.result?.changed || 0), 0)
      if (totalChanged > 0) {
        setPropagation({ user_nom: u.nom, props })
        toast.success(`${u.nom} mis à jour — ${totalChanged} enregistrements synchronisés`)
      } else {
        toast.success(`${u.nom} mis à jour`)
        setPropagation(null)
      }
      setEditId(null)
      load()
    } catch { toast.error('Erreur lors de la modification') }
    finally { setLoading(false) }
  }

  const onActivate = async (u: any) => {
    try { await usersApi.activate(u.id); toast.success(`${u.nom} activé`); load() }
    catch { toast.error('Erreur') }
  }

  const onDelete = async (u: any) => {
    if (!confirm(`Supprimer définitivement ${u.nom} ?`)) return
    try { await usersApi.delete(u.id); toast.success('Utilisateur supprimé'); load() }
    catch { toast.error('Impossible de supprimer (protégé ou admin)') }
  }

  const filtres = users.filter(u => filtre === 'tous' || u.role === filtre)

  const inp = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid #d1d5db', fontSize: 13, outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.3rem', marginBottom: 4 }}>Utilisateurs</h1>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          La modification du nom, du type ou de la spécialité d'un médecin est propagée automatiquement
          vers tous les rendez-vous, actes et profils comptables concernés.
        </p>
      </div>

      {/* Bannière propagation */}
      {propagation && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <CheckCircle size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Mise à jour en cascade — {propagation.user_nom}
              </div>
              {propagation.props.map((p: any, i: number) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>
                    {p.type === 'nom' ? 'Changement de nom' :
                     p.type === 'type_medecin' ? 'Changement de type médecin' :
                     p.type === 'specialite' ? 'Changement de spécialité' :
                     p.type === 'email' ? 'Changement d'email' : p.type}
                    {p.result?.changed > 0 ? ` — ${p.result.changed} enregistrement${p.result.changed > 1 ? 's' : ''} mis à jour` : ' — aucun impact'}
                  </div>
                  {p.result?.detail && Object.entries(p.result.detail).filter(([, v]) => (v as number) > 0).map(([k, v]) => (
                    <div key={k} style={{ fontSize: 11, color: '#64748b', marginLeft: 12 }}>
                      · {k.replace(/_/g, ' ')} : {v as number} ligne{(v as number) > 1 ? 's' : ''}
                    </div>
                  ))}
                  {p.result?.nouvelles_regles_partage && (
                    <div style={{ background: '#eff6ff', borderRadius: 8, padding: '8px 12px', marginTop: 6, fontSize: 12 }}>
                      <strong>Nouvelles règles de partage actives :</strong>
                      {Object.entries(p.result.nouvelles_regles_partage).map(([acte, pct]) => (
                        <div key={acte} style={{ color: '#1641C8' }}>· {acte} : {pct as string}</div>
                      ))}
                      <div style={{ color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>
                        {p.result.note_actes_passes}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setPropagation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[{ k: 'tous', l: 'Tous' }, ...Object.entries(ROLES_LABELS).map(([k, v]) => ({ k, l: v.label }))].map(f => (
          <button key={f.k} onClick={() => setFiltre(f.k)}
            style={{ padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: filtre === f.k ? '#1641C8' : '#f1f5f9',
              color: filtre === f.k ? 'white' : '#64748b' }}>
            {f.l} {f.k !== 'tous' && `(${users.filter(u => u.role === f.k).length})`}
          </button>
        ))}
        <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Nom', 'Email', 'Rôle', 'Spécialité / Type', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: 12, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtres.map(u => {
              const roleInfo = ROLES_LABELS[u.role] || { label: u.role, color: '#64748b', bg: '#f8fafc' }
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {editId === u.id ? (
                    <td colSpan={6} style={{ padding: '16px 20px', background: '#f8fafc' }}>
                      {u.role === 'medecin' && (
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#92400e', display: 'flex', gap: 8 }}>
                          <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                          <div>
                            <strong>Propagation automatique activée.</strong> Modifier le nom, le type ou la spécialité
                            mettra à jour les rendez-vous, profils comptables, tarifs et spécialiste liés.
                            Les actes comptables passés restent immuables (PCN Haïti).
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, marginBottom: 4 }}>Nom complet</label>
                          <input value={editData.nom} onChange={e => setEditData((d: any) => ({ ...d, nom: e.target.value }))} style={inp} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, marginBottom: 4 }}>Email</label>
                          <input value={editData.email} onChange={e => setEditData((d: any) => ({ ...d, email: e.target.value }))} style={inp} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, marginBottom: 4 }}>Téléphone</label>
                          <input value={editData.telephone} onChange={e => setEditData((d: any) => ({ ...d, telephone: e.target.value }))} style={inp} />
                        </div>
                        {u.role === 'medecin' && (
                          <>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, marginBottom: 4 }}>Spécialité</label>
                              <select value={editData.specialite} onChange={e => setEditData((d: any) => ({ ...d, specialite: e.target.value }))} style={inp}>
                                <option value="">Aucune</option>
                                {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, marginBottom: 4 }}>Type médecin</label>
                              <select value={editData.type_medecin} onChange={e => setEditData((d: any) => ({ ...d, type_medecin: e.target.value }))} style={inp}>
                                <option value="">Non défini</option>
                                {TYPES_MEDECIN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </select>
                            </div>
                          </>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => onSave(u)} disabled={loading}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1641C8', color: 'white', border: 'none', borderRadius: 9, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                          <Save size={14} /> {u.role === 'medecin' ? 'Enregistrer et propager' : 'Enregistrer'}
                        </button>
                        <button onClick={() => setEditId(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', border: 'none', borderRadius: 9, padding: '9px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#374151' }}>
                          <X size={14} /> Annuler
                        </button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{u.nom}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: roleInfo.bg, color: roleInfo.color, borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 800 }}>{roleInfo.label}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>
                        {u.specialite && <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.specialite}</div>}
                        {u.type_medecin && <div style={{ color: '#0d9488', fontSize: 11 }}>{TYPES_MEDECIN.find(t => t.value === u.type_medecin)?.label || u.type_medecin}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.is_active
                          ? <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>Actif</span>
                          : (
                            <button onClick={() => onActivate(u)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              <Shield size={12} /> Activer
                            </button>
                          )
                        }
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => startEdit(u)} style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: '6px 9px', cursor: 'pointer', color: '#1641C8' }}>
                            <Edit2 size={13} />
                          </button>
                          {u.role !== 'admin' && (
                            <button onClick={() => onDelete(u)} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '6px 9px', cursor: 'pointer', color: '#dc2626' }}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
