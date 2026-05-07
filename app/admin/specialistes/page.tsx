'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Specialiste } from '@/types'
import { Trash2, Edit2, Save, X, Plus, User } from 'lucide-react'

const SPECIALITES_LIST = [
  'Médecine interne','Gynécologie','Pédiatrie','Neurologie','Neurochirurgie',
  'Orthopédie','Chirurgie Générale','Chirurgie Pédiatrique','Dermatologie',
  'ORL','Urologie','Anesthésiologie / Réanimation','Dentisterie','Physiothérapie',
  'Optométrie','Psychologie','Radiologie','Cardiologie','Endocrinologie',
  'Ophtalmologie','Autre (saisir manuellement)',
]

const EMOJIS = [
  '👨‍⚕️','👩‍⚕️','🩺','🔬','💊','🏥','🦷','👁️','🧠','❤️',
  '🦴','👂','🩻','💉','🧬','🌡️','🩹','🧪','👶','🫁',
]

const TYPE_MEDECIN = [
  { value: 'investisseur',           label: 'Investisseur (70/30)' },
  { value: 'affilie',                label: 'Affilié (60/40)' },
  { value: 'exploitant',             label: 'Exploitant (100% + loyer)' },
  { value: 'investisseur_exploitant',label: 'Investisseur-Exploitant' },
]

interface FormData {
  nom: string; specialite: string; specialite_autre?: string; description: string; photo?: string
  emoji: string; categorie: string; email: string
  telephone: string; ordre: number
  prix_consultation: number; prix_rdv: number
  type_medecin: string
}

interface SpecialisteExt extends Specialiste {
  prix_consultation?: number
  prix_rdv?: number
  type_medecin?: string
}

const s = { padding: '11px 13px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, width: '100%', boxSizing: 'border-box' as const, background: 'white' }

export default function AdminSpecialistes() {
  const [specs,       setSpecs]       = useState<SpecialisteExt[]>([])
  const [loading,     setLoading]     = useState(false)
  const [showForm,    setShowForm]    = useState(false)
  const [editingId,   setEditingId]   = useState<number | null>(null)
  const [editData,    setEditData]    = useState<Partial<FormData>>({})
  const [emojiPicker, setEmojiPicker] = useState(false)
  const [editEmojiPicker, setEditEmojiPicker] = useState(false)

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    defaultValues: { emoji: '👨‍⚕️', categorie: 'tous', ordre: 0, prix_consultation: 3000, prix_rdv: 3000, type_medecin: 'investisseur' }
  })
  const selectedEmoji = watch('emoji')

  const load = () => api.get('/admin/specialistes').then(r => setSpecs(r.data || [])).catch(() => {})
  useEffect(() => { load() }, [])

  const onAdd = async (data: FormData) => {
    setLoading(true)
    try {
      const specialite = (data.specialite === 'Autre (saisir manuellement)' && data.specialite_autre)
        ? data.specialite_autre
        : data.specialite
      await api.post('/admin/specialistes', {
        ...data,
        specialite,
        description: data.description || `Consultation : ${data.prix_consultation?.toLocaleString()} HTG | RDV : ${data.prix_rdv?.toLocaleString()} HTG`,
      })
      toast.success(`Dr ${data.nom} ajouté ✓`)
      reset({ emoji: '👨‍⚕️', categorie: 'tous', ordre: 0, prix_consultation: 3000, prix_rdv: 3000, type_medecin: 'investisseur' })
      setShowForm(false); setEmojiPicker(false); load()
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      if (Array.isArray(detail)) {
        toast.error('Erreur: ' + detail.map((d: any) => d.msg).join(', '))
      } else {
        toast.error(detail || "Erreur lors de l'ajout")
      }
    }
    finally { setLoading(false) }
  }

  const onEdit = (s: SpecialisteExt) => {
    setEditingId(s.id)
    setEditData({
      nom: s.nom, specialite: s.specialite, description: s.description || '',
      emoji: s.emoji || '👨‍⚕️', telephone: s.telephone || '', email: s.email || '',
      prix_consultation: s.prix_consultation || 0, prix_rdv: s.prix_rdv || 0,
      type_medecin: s.type_medecin || 'investisseur',
    })
  }

  const onSaveEdit = async () => {
    if (!editingId) return
    try {
      await api.put(`/admin/specialistes/${editingId}`, {
        ...editData,
        description: editData.description || `Consultation : ${editData.prix_consultation?.toLocaleString()} HTG | RDV : ${editData.prix_rdv?.toLocaleString()} HTG`,
      })
      toast.success('Médecin mis à jour ✓')
      setEditingId(null); setEditData({}); setEditEmojiPicker(false); load()
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      if (Array.isArray(detail)) {
        toast.error('Erreur: ' + detail.map((d: any) => d.msg).join(', '))
      } else {
        toast.error(detail || 'Erreur mise à jour')
      }
    }
  }

  const onDelete = async (s: SpecialisteExt) => {
    if (!confirm(`Supprimer ${s.nom} définitivement ?`)) return
    try { await api.delete(`/admin/specialistes/${s.id}`); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur') }
  }

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Gestion des spécialistes</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>{specs.length} médecin{specs.length > 1 ? 's' : ''} enregistré{specs.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: showForm ? '#f1f5f9' : 'linear-gradient(135deg,#1641C8,#0d9488)',
          color: showForm ? '#374151' : 'white', border: 'none', borderRadius: 12,
          padding: '10px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
        }}>
          {showForm ? <><X size={14} /> Fermer</> : <><Plus size={14} /> Nouveau médecin</>}
        </button>
      </div>

      {/* ── FORMULAIRE AJOUT ────────────────────────────────────────── */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: 18, border: '1px solid #e2e8f0', padding: 28, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 20, fontSize: 16 }}>Ajouter un nouveau médecin</h3>
          <form onSubmit={handleSubmit(onAdd)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Nom complet *</label>
                <input {...register('nom', { required: true })} placeholder="Dr Prénom NOM" style={s} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Spécialité *</label>
                <select {...register('specialite', { required: true })} style={s}>
                  <option value="">Choisir...</option>
                  {SPECIALITES_LIST.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Téléphone</label>
                <input {...register('telephone')} placeholder="+509 xxxx-xxxx" style={s} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Email</label>
                <input {...register('email')} type="email" placeholder="medecin@email.com" style={s} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Prix consultation (HTG) *</label>
                <input {...register('prix_consultation', { valueAsNumber: true })} type="number" placeholder="3000" style={s} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Prix RDV (HTG) *</label>
                <input {...register('prix_rdv', { valueAsNumber: true })} type="number" placeholder="3000" style={s} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Type médecin</label>
                <select {...register('type_medecin')} style={s}>
                  {TYPE_MEDECIN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Emoji / Avatar</label>
                <div style={{ position: 'relative' }}>
                  <button type="button" onClick={() => setEmojiPicker(!emojiPicker)} style={{
                    width: '100%', padding: '10px 13px', borderRadius: 10, border: '1px solid #d1d5db',
                    background: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 22, display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    {selectedEmoji} <span style={{ fontSize: 13, color: '#64748b' }}>Cliquer pour changer</span>
                  </button>
                  {emojiPicker && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, display: 'flex', flexWrap: 'wrap', gap: 6, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                      {EMOJIS.map(e => (
                        <button key={e} type="button" onClick={() => { setValue('emoji', e); setEmojiPicker(false) }}
                          style={{ fontSize: 24, background: selectedEmoji === e ? '#eff6ff' : 'transparent', border: '1px solid transparent', borderRadius: 8, padding: '4px 6px', cursor: 'pointer' }}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                  <input type="hidden" {...register('emoji')} />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Description / Bio</label>
              <textarea {...register('description')} rows={2} placeholder="Formation, spécialisations, approche médicale..." style={{ ...s, resize: 'vertical' }} />
            </div>
            <button type="submit" disabled={loading} style={{
              background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none',
              borderRadius: 12, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14
            }}>
              {loading ? 'Ajout...' : <><Plus size={14} style={{ marginRight: 6 }} />Ajouter le médecin</>}
            </button>
          </form>
        </div>
      )}

      {/* ── LISTE DES SPÉCIALISTES ───────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {specs.map(sp => (
          <div key={sp.id} style={{ background: 'white', borderRadius: 16, border: `1px solid ${editingId === sp.id ? '#1641C8' : '#e2e8f0'}`, overflow: 'hidden' }}>
            {editingId === sp.id ? (
              /* ── MODE ÉDITION ────────────────────────────────────── */
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontWeight: 700, color: '#1641C8', fontSize: 14 }}>Modification en cours</span>
                  <button onClick={() => { setEditingId(null); setEditEmojiPicker(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  {[
                    { key: 'nom', label: 'Nom complet', type: 'text' },
                    { key: 'telephone', label: 'Téléphone', type: 'text' },
                    { key: 'email', label: 'Email', type: 'email' },
                    { key: 'prix_consultation', label: 'Prix consultation (HTG)', type: 'number' },
                    { key: 'prix_rdv', label: 'Prix RDV (HTG)', type: 'number' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 5 }}>{f.label}</label>
                      <input type={f.type} value={(editData as any)[f.key] || ''} onChange={e => setEditData(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                        style={s} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 5 }}>Spécialité</label>
                    <select value={editData.specialite || ''} onChange={e => setEditData(p => ({ ...p, specialite: e.target.value }))} style={s}>
                      {SPECIALITES_LIST.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 5 }}>Type médecin</label>
                    <select value={editData.type_medecin || 'investisseur'} onChange={e => setEditData(p => ({ ...p, type_medecin: e.target.value }))} style={s}>
                      {TYPE_MEDECIN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                {/* Emoji picker édition */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 5 }}>Emoji / Avatar</label>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button type="button" onClick={() => setEditEmojiPicker(!editEmojiPicker)} style={{
                      padding: '8px 16px', borderRadius: 10, border: '1px solid #d1d5db',
                      background: 'white', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', gap: 8
                    }}>
                      {editData.emoji || '👨‍⚕️'} <span style={{ fontSize: 12, color: '#64748b' }}>Changer</span>
                    </button>
                    {editEmojiPicker && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 10, display: 'flex', flexWrap: 'wrap', gap: 4, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                        {EMOJIS.map(e => (
                          <button key={e} type="button" onClick={() => { setEditData(p => ({ ...p, emoji: e })); setEditEmojiPicker(false) }}
                            style={{ fontSize: 22, background: editData.emoji === e ? '#eff6ff' : 'transparent', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer' }}>
                            {e}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 5 }}>Description</label>
                  <textarea value={editData.description || ''} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...s, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={onSaveEdit} style={{ background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Save size={14} /> Sauvegarder
                  </button>
                  <button onClick={() => { setEditingId(null); setEditEmojiPicker(false) }} style={{ background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              /* ── MODE AFFICHAGE ──────────────────────────────────── */
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,#1641C8,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {sp.emoji || '👨‍⚕️'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>{sp.nom}</div>
                  <div style={{ color: '#0d9488', fontSize: 12, fontWeight: 600, marginTop: 2 }}>{sp.specialite}</div>
                  {sp.description && <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{sp.description}</div>}
                  {sp.telephone && <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>📞 {sp.telephone}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => onEdit(sp)} style={{ background: '#eff6ff', color: '#1641C8', border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Edit2 size={13} /> Modifier
                  </button>
                  <button onClick={() => onDelete(sp)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Trash2 size={13} /> Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {specs.length === 0 && (
          <div style={{ background: 'white', borderRadius: 16, padding: 48, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <User size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
            <p style={{ color: '#64748b' }}>Aucun spécialiste enregistré. Cliquez sur "Nouveau médecin" pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  )
}
