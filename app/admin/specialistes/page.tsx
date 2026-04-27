'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { specialistesApi } from '@/lib/api'
import { Specialiste } from '@/types'
import { Trash2, Edit2, Save, X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

const SPECIALITES_LISTE = [
  'Chirurgie générale','Neurochirurgie','Neurologie','Orthopédie','Pédiatrie',
  'Dermatologie','Urologie','ORL','Gynécologie','Chirurgie pédiatrique',
  'Médecine interne','Ophtalmologie','Dentisterie','Physiothérapie','Optométrie',
  'Anesthésiologie','Radiologie','Psychologie',
]

const CATEGORIES = ['tous','chir','med','gyn','para']

interface FormData {
  nom: string; specialite: string; description: string
  email: string; telephone: string; categorie: string
}

interface PropagationResult {
  changed: number
  detail?: Record<string, number>
  message?: string
  note_comptable?: string
}

export default function AdminSpecialistes() {
  const [specs, setSpecs] = useState<Specialiste[]>([])
  const [editId, setEditId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [propagation, setPropagation] = useState<PropagationResult | null>(null)
  const { register, handleSubmit, reset, setValue } = useForm<FormData>({
    defaultValues: { categorie: 'tous' }
  })

  const load = () => specialistesApi.list().then(r => setSpecs(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const onAdd = async (data: FormData) => {
    setLoading(true)
    try {
      await specialistesApi.create({ ...data, ordre: 0 })
      toast.success(`${data.nom} ajouté`)
      reset({ categorie: 'tous' })
      load()
    } catch { toast.error("Erreur lors de l'ajout") }
    finally { setLoading(false) }
  }

  const onUpdate = async (id: number, data: FormData) => {
    setLoading(true)
    setPropagation(null)
    try {
      const res = await specialistesApi.update(id, data)
      // Le backend retourne { propagations: [...] }
      const props = res.data?.propagations || []
      let totalChanged = 0
      const detail: Record<string, number> = {}
      props.forEach((p: any) => {
        totalChanged += p.result?.changed || 0
        if (p.result?.detail) Object.assign(detail, p.result.detail)
      })
      if (totalChanged > 0) {
        setPropagation({ changed: totalChanged, detail, message: `${totalChanged} enregistrements mis à jour en cascade` })
        toast.success(`Modification propagée sur ${totalChanged} enregistrements`)
      } else {
        toast.success('Spécialiste mis à jour')
      }
      setEditId(null)
      load()
    } catch { toast.error('Erreur lors de la modification') }
    finally { setLoading(false) }
  }

  const onDelete = async (s: Specialiste) => {
    if (!confirm(`Supprimer "${s.nom}" ? Cette action désactivera la fiche.`)) return
    try { await specialistesApi.delete(s.id); toast.success('Spécialiste désactivé'); load() }
    catch { toast.error('Erreur') }
  }

  const startEdit = (s: Specialiste) => {
    setEditId(s.id)
    setPropagation(null)
    setValue('nom', s.nom)
    setValue('specialite', s.specialite)
    setValue('description', s.description || '')
    setValue('email', s.email || '')
    setValue('telephone', s.telephone || '')
    setValue('categorie', s.categorie || 'tous')
  }

  const inp = {
    width: '100%', padding: '9px 12px', borderRadius: 9,
    border: '1px solid #d1d5db', fontSize: 13, outline: 'none',
    boxSizing: 'border-box' as const,
  }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 5 }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.3rem', marginBottom: 4 }}>Spécialistes</h1>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Toute modification d'un nom ou d'une spécialité est propagée automatiquement
          sur les rendez-vous, profils comptables et tarifs associés.
        </p>
      </div>

      {/* Bannière propagation */}
      {propagation && propagation.changed > 0 && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <CheckCircle size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              Mise à jour en cascade effectuée — {propagation.changed} enregistrement{propagation.changed > 1 ? 's' : ''} synchronisé{propagation.changed > 1 ? 's' : ''}
            </div>
            {propagation.detail && Object.entries(propagation.detail).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k} style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                · {k.replace(/_/g, ' ')} : {v} ligne{v > 1 ? 's' : ''}
              </div>
            ))}
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontStyle: 'italic' }}>
              Les écritures comptables passées sont immutables (règle PCN Haïti).
            </div>
          </div>
          <button onClick={() => setPropagation(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 24 }}>
        {/* Formulaire ajout */}
        <div style={{ background: 'white', borderRadius: 18, border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', marginBottom: 20 }}>
            <i className="fa-solid fa-plus-circle" style={{ color: '#1641C8', marginRight: 8 }} />
            Ajouter un spécialiste
          </h3>
          <form onSubmit={handleSubmit(onAdd)}>
            {[
              { name: 'nom' as const, label: 'Nom complet', ph: 'Dr Prénom Nom' },
              { name: 'email' as const, label: 'Email', ph: 'email@clinique.ht' },
              { name: 'telephone' as const, label: 'Téléphone', ph: '3XXX-XXXX' },
            ].map(f => (
              <div key={f.name} style={{ marginBottom: 14 }}>
                <label style={lbl}>{f.label}</label>
                <input {...register(f.name, f.name === 'nom' ? { required: true } : {})} placeholder={f.ph} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Spécialité *</label>
              <select {...register('specialite', { required: true })} style={inp}>
                <option value="">Choisir...</option>
                {SPECIALITES_LISTE.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Description / Parcours</label>
              <textarea {...register('description')} rows={3} placeholder="Formation, expertise..." style={{ ...inp, resize: 'vertical' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#1641C8', color: 'white', border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              Ajouter le spécialiste
            </button>
          </form>
        </div>

        {/* Liste */}
        <div style={{ background: 'white', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
              {specs.length} spécialiste{specs.length !== 1 ? 's' : ''}
            </span>
            <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <RefreshCw size={15} />
            </button>
          </div>

          <div style={{ maxHeight: 620, overflowY: 'auto' }}>
            {specs.map(s => (
              <div key={s.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f8fafc' }}>
                {editId === s.id ? (
                  <form onSubmit={handleSubmit(d => onUpdate(s.id, d))}>
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#92400e', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <strong>Propagation automatique :</strong> Toute modification du nom ou de la spécialité
                        sera répercutée sur les rendez-vous, actes et profils comptables liés.
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      {[
                        { name: 'nom' as const, label: 'Nom' },
                        { name: 'telephone' as const, label: 'Téléphone' },
                        { name: 'email' as const, label: 'Email' },
                      ].map(f => (
                        <div key={f.name}>
                          <label style={lbl}>{f.label}</label>
                          <input {...register(f.name)} style={inp} />
                        </div>
                      ))}
                      <div>
                        <label style={lbl}>Spécialité</label>
                        <select {...register('specialite')} style={inp}>
                          {SPECIALITES_LISTE.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <label style={lbl}>Description</label>
                      <textarea {...register('description')} rows={2} style={{ ...inp, resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1641C8', color: 'white', border: 'none', borderRadius: 9, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        <Save size={14} /> Enregistrer et propager
                      </button>
                      <button type="button" onClick={() => setEditId(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', border: 'none', borderRadius: 9, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#374151' }}>
                        <X size={14} /> Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fa-solid fa-user-doctor" style={{ color: '#1641C8', fontSize: 16 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{s.nom}</div>
                      <div style={{ color: '#1641C8', fontSize: 12, fontWeight: 700, marginTop: 2 }}>{s.specialite}</div>
                      {s.telephone && <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 3 }}>{s.telephone}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEdit(s)} style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: '#1641C8' }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDelete(s)} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: '#dc2626' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
