'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

interface TarifMedecin {
  id: number; medecin_nom: string; specialite: string
  prix_consultation: number; prix_rdv: number
  prix_hospitalisation_jr: number; type_medecin: string; actif: boolean
}
interface TarifLabo { id: number; code: string; libelle: string; montant: number; devise: string }
interface TarifDentiste { id: number; code: string; libelle: string; montant: number; devise: string }

const TAB_STYLE = (active: boolean) => ({
  padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
  background: active ? 'linear-gradient(135deg,#1641C8,#0d9488)' : '#f1f5f9',
  color: active ? 'white' : '#64748b', transition: 'all 0.2s'
})

export default function AdminTarifs() {
  const [tab,         setTab]         = useState<'medecins'|'labo'|'dentiste'>('medecins')
  const [medecins,    setMedecins]    = useState<TarifMedecin[]>([])
  const [labo,        setLabo]        = useState<TarifLabo[]>([])
  const [dentiste,    setDentiste]    = useState<TarifDentiste[]>([])
  const [edited,      setEdited]      = useState<Record<string, number>>({})
  const [searchLabo,  setSearchLabo]  = useState('')
  const [loading,     setLoading]     = useState(false)

  useEffect(() => {
    api.get('/tarifs-medecins').then(r => setMedecins(r.data || [])).catch(() => {})
    api.get('/labo/tarifs').then(r => setLabo(r.data || [])).catch(() => {})
    api.get('/dentiste/tarifs').then(r => setDentiste(r.data || [])).catch(() => {})
  }, [])

  const saveMedecin = async (m: TarifMedecin) => {
    const data: any = {}
    if (edited[`m_cons_${m.id}`] !== undefined) data.prix_consultation = edited[`m_cons_${m.id}`]
    if (edited[`m_rdv_${m.id}`]  !== undefined) data.prix_rdv          = edited[`m_rdv_${m.id}`]
    if (edited[`m_hosp_${m.id}`] !== undefined) data.prix_hospitalisation_jr = edited[`m_hosp_${m.id}`]
    if (!Object.keys(data).length) { toast('Aucune modification'); return }
    try {
      await api.put(`/admin/tarifs-medecins/${m.id}`, data)
      setMedecins(prev => prev.map(x => x.id === m.id ? { ...x, ...data } : x))
      toast.success(`Tarifs Dr ${m.medecin_nom} mis à jour ✓`)
    } catch { toast.error('Erreur') }
  }

  const saveLabo = async (t: TarifLabo) => {
    const val = edited[`labo_${t.code}`]
    if (val === undefined) return
    try {
      await api.put(`/admin/labo/tarifs/${t.code}`, { montant: val })
      setLabo(prev => prev.map(x => x.code === t.code ? { ...x, montant: val } : x))
      toast.success(`${t.libelle} mis à jour ✓`)
    } catch { toast.error('Erreur') }
  }

  const saveDentiste = async (t: TarifDentiste) => {
    const val = edited[`dent_${t.code}`]
    if (val === undefined) return
    try {
      await api.put(`/admin/dentiste/tarifs/${t.code}`, { montant: val })
      setDentiste(prev => prev.map(x => x.code === t.code ? { ...x, montant: val } : x))
      toast.success(`${t.libelle} mis à jour ✓`)
    } catch { toast.error('Erreur') }
  }

  const laboFiltres = labo.filter(t =>
    !searchLabo || t.libelle.toLowerCase().includes(searchLabo.toLowerCase())
  )

  const inp = (val: number, key: string) => (
    <input
      type="number" min={0}
      defaultValue={val}
      onChange={e => setEdited(p => ({ ...p, [key]: Number(e.target.value) }))}
      style={{ width: 110, padding: '7px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, textAlign: 'right' }}
    />
  )

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a', margin: '0 0 4px' }}>Gestion des tarifs</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Prix par médecin, laboratoire et dentisterie</p>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button style={TAB_STYLE(tab === 'medecins')} onClick={() => setTab('medecins')}>
          👨‍⚕️ Médecins ({medecins.length})
        </button>
        <button style={TAB_STYLE(tab === 'labo')} onClick={() => setTab('labo')}>
          🔬 Laboratoire ({labo.length})
        </button>
        <button style={TAB_STYLE(tab === 'dentiste')} onClick={() => setTab('dentiste')}>
          🦷 Dentisterie ({dentiste.length})
        </button>
      </div>

      {/* ── TARIFS MÉDECINS ─────────────────────────────────────────── */}
      {tab === 'medecins' && (
        <div style={{ background: 'white', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Médecin','Spécialité','Type','Consultation (HTG)','RDV (HTG)','Hospit./jr (HTG)','Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {medecins.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{m.medecin_nom}</td>
                    <td style={{ padding: '12px 16px', color: '#0d9488', fontWeight: 600 }}>{m.specialite}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#eff6ff', color: '#1641C8', borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {m.type_medecin || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{inp(m.prix_consultation, `m_cons_${m.id}`)}</td>
                    <td style={{ padding: '12px 16px' }}>{inp(m.prix_rdv, `m_rdv_${m.id}`)}</td>
                    <td style={{ padding: '12px 16px' }}>{inp(m.prix_hospitalisation_jr || 0, `m_hosp_${m.id}`)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => saveMedecin(m)} style={{
                        background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white',
                        border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 12
                      }}>
                        Sauvegarder
                      </button>
                    </td>
                  </tr>
                ))}
                {medecins.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                    Aucun tarif médecin — le seed s'exécute au démarrage
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TARIFS LABO ─────────────────────────────────────────────── */}
      {tab === 'labo' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <input
              placeholder="🔍 Rechercher un examen..."
              value={searchLabo}
              onChange={e => setSearchLabo(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' as const }}
            />
          </div>
          <div style={{ background: 'white', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', maxHeight: 600, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    {['Examen','Code','Prix (HTG)','Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {laboFiltres.map(t => (
                    <tr key={t.code} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#0f172a' }}>{t.libelle}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#64748b', fontSize: 11 }}>{t.code}</td>
                      <td style={{ padding: '10px 16px' }}>{inp(t.montant, `labo_${t.code}`)}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <button onClick={() => saveLabo(t)} style={{
                          background: '#f0fdf4', color: '#16a34a', border: 'none',
                          borderRadius: 8, padding: '6px 12px', fontWeight: 700, cursor: 'pointer', fontSize: 12
                        }}>
                          Sauv.
                        </button>
                      </td>
                    </tr>
                  ))}
                  {laboFiltres.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                      {searchLabo ? 'Aucun résultat' : 'Chargement des tarifs labo...'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TARIFS DENTISTERIE ──────────────────────────────────────── */}
      {tab === 'dentiste' && (
        <div style={{ background: 'white', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Service dentaire','Prix','Devise','Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dentiste.map(t => (
                  <tr key={t.code} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#0f172a' }}>{t.libelle}</td>
                    <td style={{ padding: '10px 16px' }}>{inp(t.montant, `dent_${t.code}`)}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ background: t.devise === 'USD' ? '#fef3c7' : '#f0fdf4', color: t.devise === 'USD' ? '#d97706' : '#16a34a', borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                        {t.devise}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <button onClick={() => saveDentiste(t)} style={{
                        background: '#fff7ed', color: '#d97706', border: 'none',
                        borderRadius: 8, padding: '6px 12px', fontWeight: 700, cursor: 'pointer', fontSize: 12
                      }}>
                        Sauv.
                      </button>
                    </td>
                  </tr>
                ))}
                {dentiste.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                    Chargement des tarifs dentisterie...
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
