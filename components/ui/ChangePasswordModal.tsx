'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface Props {
  isFirstLogin?: boolean   // si true = premier login obligatoire
  onClose: () => void
}

export default function ChangePasswordModal({ isFirstLogin, onClose }: Props) {
  const [ancien, setAncien] = useState('')
  const [nouveau, setNouveau] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    setErr('')
    if (nouveau.length < 6) { setErr('Minimum 6 caractères'); return }
    if (nouveau !== confirm) { setErr('Les mots de passe ne correspondent pas'); return }

    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        ancien_mot_de_passe: ancien,
        nouveau_mot_de_passe: nouveau,
      })
      toast.success('Mot de passe changé avec succès !')
      onClose()
    } catch (e: any) {
      setErr(e.response?.data?.detail || 'Erreur — vérifiez votre ancien mot de passe')
    } finally { setLoading(false) }
  }

  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: 9, fontSize: 14,
    border: '1.5px solid #e2e8f0', boxSizing: 'border-box' as const,
    marginBottom: 12,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 20,
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: 28,
        maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: isFirstLogin ? '#fff7ed' : '#eff6ff',
            border: `2px solid ${isFirstLogin ? '#fb923c' : '#93c5fd'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <i className="fa-solid fa-key" style={{
              fontSize: 22, color: isFirstLogin ? '#ea580c' : '#1641C8'
            }}/>
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '1.1rem', margin: 0, color: '#0f172a' }}>
            {isFirstLogin ? 'Changement de mot de passe obligatoire' : 'Changer mon mot de passe'}
          </h2>
          {isFirstLogin && (
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
              Votre compte a été créé par l'administrateur avec un mot de passe temporaire.
              Veuillez définir un nouveau mot de passe pour continuer.
            </p>
          )}
        </div>

        {/* Form */}
        {!isFirstLogin && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
              Ancien mot de passe
            </label>
            <input type="password" value={ancien} onChange={e => setAncien(e.target.value)}
              placeholder="Ancien mot de passe" style={inp} />
          </div>
        )}

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
            Nouveau mot de passe *
          </label>
          <input type="password" value={nouveau} onChange={e => setNouveau(e.target.value)}
            placeholder="Minimum 6 caractères" style={inp} />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
            Confirmer le nouveau mot de passe *
          </label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe" style={inp}
            onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        {err && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
            padding: '8px 12px', fontSize: 13, color: '#dc2626', marginBottom: 12,
          }}>
            {err}
          </div>
        )}

        {/* Strength indicator */}
        {nouveau && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Force du mot de passe</div>
            <div style={{ height: 4, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99, transition: 'all 0.3s',
                width: nouveau.length < 6 ? '20%' : nouveau.length < 8 ? '50%' : nouveau.length < 12 ? '75%' : '100%',
                background: nouveau.length < 6 ? '#dc2626' : nouveau.length < 8 ? '#d97706' : nouveau.length < 12 ? '#1641C8' : '#16a34a',
              }}/>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          {!isFirstLogin && (
            <button onClick={onClose} style={{
              flex: 1, padding: '11px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', background: 'white',
              fontWeight: 700, cursor: 'pointer', fontSize: 13,
            }}>
              Annuler
            </button>
          )}
          <button onClick={submit} disabled={loading} style={{
            flex: 2, padding: '11px', borderRadius: 10, border: 'none',
            background: loading ? '#94a3b8' : '#1641C8',
            color: 'white', fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontSize: 14,
          }}>
            {loading ? 'Enregistrement...' : 'Changer le mot de passe'}
          </button>
        </div>
      </div>
    </div>
  )
}
