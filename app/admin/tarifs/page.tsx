'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

const SOURCES = {
  AHC: { label: 'Chirurgie (AHC 2017)', color: '#1641C8' },
  SHOG: { label: 'Gynécologie (SHOG 2021)', color: '#7c3aed' },
  SHP: { label: 'Pédiatrie (SHP 2023)', color: '#0d9488' },
  SHA: { label: 'Anesthésie (SHA)', color: '#d97706' },
  CLINIQUE: { label: 'Clinique de la Rebecca', color: '#16a34a' },
}

export default function AdminTarifs() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [gestes, setGestes] = useState<any[]>([])
  const [specialites, setSpecialites] = useState<string[]>([])
  const [specFiltree, setSpecFiltree] = useState('')
  const [search, setSearch] = useState('')
  const [taux, setTaux] = useState<any>(null)
  const [nouveauTaux, setNouveauTaux] = useState('')
  const [editId, setEditId] = useState<number|null>(null)
  const [editPrix, setEditPrix] = useState('')
  const [loadSeed, setLoadSeed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ specialite:'', categorie:'', libelle:'', prix_usd:'', prix_usd_min:'', prix_usd_max:'', source_bareme:'CLINIQUE' })

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) router.push('/login')
  }, [isAuthenticated, loading, user])

  useEffect(() => {
    if (!isAuthenticated) return
    charger()
    api.get('/caissier/taux-change').then(r => setTaux(r.data)).catch(() => {})
  }, [isAuthenticated])

  const charger = () => {
    const params = new URLSearchParams()
    if (specFiltree) params.append('specialite', specFiltree)
    if (search) params.append('search', search)
    api.get(`/tarifs/gestes?${params}`).then(r => {
      setGestes(r.data.gestes || [])
      setSpecialites(r.data.specialites || [])
    }).catch(() => {})
  }

  useEffect(() => { if (isAuthenticated) charger() }, [specFiltree, search])

  const sauvegarderTaux = async () => {
    const t = parseFloat(nouveauTaux)
    if (!t || t <= 0) { toast.error('Taux invalide'); return }
    try {
      await api.post('/caissier/taux-change', { taux_htg: t })
      toast.success(`Taux mis à jour: 1 USD = ${t} HTG`)
      setTaux({ taux_htg: t, date: new Date().toISOString() })
      setNouveauTaux('')
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur') }
  }

  const sauvegarderPrixClinique = async (id: number) => {
    const prix = parseFloat(editPrix)
    try {
      await api.put(`/admin/tarifs/geste/${id}`, { prix_clinique_usd: prix || null })
      toast.success(prix ? `Prix clinique: $${prix}` : 'Prix clinique réinitialisé')
      setEditId(null); setEditPrix('')
      charger()
    } catch (e: any) { toast.error('Erreur')  }
  }

  const supprimerGeste = async (id: number) => {
    if (!confirm('Désactiver ce geste du catalogue ?')) return
    await api.delete(`/admin/tarifs/geste/${id}`)
    toast.success('Geste désactivé')
    charger()
  }

  const creerGeste = async () => {
    if (!form.specialite || !form.libelle || !form.prix_usd) { toast.error('Remplir les champs obligatoires'); return }
    try {
      await api.post('/admin/tarifs/geste', {
        ...form,
        prix_usd: parseFloat(form.prix_usd),
        prix_usd_min: form.prix_usd_min ? parseFloat(form.prix_usd_min) : null,
        prix_usd_max: form.prix_usd_max ? parseFloat(form.prix_usd_max) : null,
      })
      toast.success('Geste ajouté au catalogue')
      setShowForm(false)
      setForm({ specialite:'', categorie:'', libelle:'', prix_usd:'', prix_usd_min:'', prix_usd_max:'', source_bareme:'CLINIQUE' })
      charger()
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur') }
  }

  const initierSeed = async () => {
    if (!confirm('Importer les 290 gestes depuis les barèmes AHC/SHOG/SHP/SHA ? Cette opération n\'écrase pas les prix clinique déjà saisis.')) return
    setLoadSeed(true)
    try {
      const r = await api.post('/admin/seed-tarifs', {})
      toast.success(r.data.message)
      charger()
    } catch (e: any) { toast.error('Erreur') }
    finally { setLoadSeed(false) }
  }

  const taux_htg = taux?.taux_htg || 130

  if (loading) return null

  return (
    <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>📋 Barèmes des Gestes Médicaux</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
            Sources: AHC (Chirurgie), SHOG (Gynécologie), SHP (Pédiatrie), SHA (Anesthésie) · Données non publiques
          </p>
        </div>
        <div style={{ display:'flex', gap: 8 }}>
          <Link href="/admin/dashboard" style={{ background:'#f1f5f9', color:'#374151', textDecoration:'none', borderRadius: 10, padding:'9px 16px', fontWeight: 600, fontSize: 13 }}>
            ← Retour
          </Link>
          <button onClick={() => setShowForm(!showForm)} style={{ background:'#1641C8', color:'white', border:'none', borderRadius: 10, padding:'9px 16px', fontWeight: 700, cursor:'pointer', fontSize: 13 }}>
            + Nouveau geste
          </button>
          <button onClick={initierSeed} disabled={loadSeed} style={{ background:'#0d9488', color:'white', border:'none', borderRadius: 10, padding:'9px 16px', fontWeight: 700, cursor:'pointer', fontSize: 13 }}>
            {loadSeed ? '...' : '⬇ Importer barèmes'}
          </button>
        </div>
      </div>

      {/* Taux de change */}
      <div style={{ background:'linear-gradient(135deg,#0f172a,#1641C8)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display:'flex', alignItems:'center', gap: 20, flexWrap:'wrap' as const }}>
        <div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize: 11, textTransform:'uppercase', letterSpacing: 1 }}>Taux du jour</div>
          <div style={{ color:'white', fontWeight: 900, fontSize: 22, fontFamily:'monospace' }}>
            1 USD = {taux_htg.toLocaleString('fr-FR')} HTG
          </div>
          {taux?.date && <div style={{ color:'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>Mis à jour: {new Date(taux.date).toLocaleString('fr-FR')}</div>}
          {taux?.is_default && <div style={{ color:'#fcd34d', fontSize: 11 }}>⚠ Taux par défaut — mettre à jour</div>}
        </div>
        <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
          <input
            value={nouveauTaux}
            onChange={e => setNouveauTaux(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sauvegarderTaux()}
            placeholder="Ex: 134.5"
            style={{ padding:'9px 12px', borderRadius: 8, border:'none', fontSize: 14, fontFamily:'monospace', width: 120 }}
          />
          <button onClick={sauvegarderTaux} style={{ background:'#d97706', color:'white', border:'none', borderRadius: 8, padding:'9px 16px', fontWeight: 700, cursor:'pointer', fontSize: 13 }}>
            Mettre à jour
          </button>
        </div>
      </div>

      {/* Formulaire nouveau geste */}
      {showForm && (
        <div style={{ background:'white', borderRadius: 14, padding: 20, border:'1px solid #e2e8f0', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Nouveau geste au catalogue</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 2fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ display:'block', fontSize: 12, fontWeight: 600, color:'#374151', marginBottom: 4 }}>Spécialité *</label>
              <input value={form.specialite} onChange={e => setForm(p => ({...p, specialite: e.target.value}))}
                placeholder="Ex: Chirurgie Générale"
                style={{ width:'100%', padding:'9px 11px', borderRadius: 8, border:'1px solid #d1d5db', fontSize: 13, boxSizing:'border-box' as const }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize: 12, fontWeight: 600, color:'#374151', marginBottom: 4 }}>Catégorie</label>
              <input value={form.categorie} onChange={e => setForm(p => ({...p, categorie: e.target.value}))}
                placeholder="Ex: Abdomen"
                style={{ width:'100%', padding:'9px 11px', borderRadius: 8, border:'1px solid #d1d5db', fontSize: 13, boxSizing:'border-box' as const }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize: 12, fontWeight: 600, color:'#374151', marginBottom: 4 }}>Libellé *</label>
              <input value={form.libelle} onChange={e => setForm(p => ({...p, libelle: e.target.value}))}
                placeholder="Ex: Appendicectomie"
                style={{ width:'100%', padding:'9px 11px', borderRadius: 8, border:'1px solid #d1d5db', fontSize: 13, boxSizing:'border-box' as const }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize: 12, fontWeight: 600, color:'#374151', marginBottom: 4 }}>Prix USD *</label>
              <input type="number" value={form.prix_usd} onChange={e => setForm(p => ({...p, prix_usd: e.target.value}))}
                placeholder="1200"
                style={{ width:'100%', padding:'9px 11px', borderRadius: 8, border:'1px solid #d1d5db', fontSize: 13, boxSizing:'border-box' as const }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize: 12, fontWeight: 600, color:'#374151', marginBottom: 4 }}>Min USD (fourchette)</label>
              <input type="number" value={form.prix_usd_min} onChange={e => setForm(p => ({...p, prix_usd_min: e.target.value}))}
                placeholder="Optionnel"
                style={{ width:'100%', padding:'9px 11px', borderRadius: 8, border:'1px solid #d1d5db', fontSize: 13, boxSizing:'border-box' as const }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize: 12, fontWeight: 600, color:'#374151', marginBottom: 4 }}>Max USD (fourchette)</label>
              <input type="number" value={form.prix_usd_max} onChange={e => setForm(p => ({...p, prix_usd_max: e.target.value}))}
                placeholder="Optionnel"
                style={{ width:'100%', padding:'9px 11px', borderRadius: 8, border:'1px solid #d1d5db', fontSize: 13, boxSizing:'border-box' as const }} />
            </div>
          </div>
          <div style={{ display:'flex', gap: 8, justifyContent:'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ background:'#f1f5f9', border:'none', borderRadius: 8, padding:'9px 16px', cursor:'pointer', fontWeight: 600, fontSize: 13 }}>Annuler</button>
            <button onClick={creerGeste} style={{ background:'#1641C8', color:'white', border:'none', borderRadius: 8, padding:'9px 16px', cursor:'pointer', fontWeight: 700, fontSize: 13 }}>Ajouter au catalogue</button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display:'flex', gap: 10, marginBottom: 16, flexWrap:'wrap' as const }}>
        <select value={specFiltree} onChange={e => setSpecFiltree(e.target.value)}
          style={{ padding:'9px 12px', borderRadius: 8, border:'1px solid #d1d5db', fontSize: 13, background:'white', minWidth: 200 }}>
          <option value="">Toutes les spécialités ({gestes.length})</option>
          {specialites.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un geste..."
          style={{ flex: 1, minWidth: 200, padding:'9px 12px', borderRadius: 8, border:'1px solid #d1d5db', fontSize: 13 }} />
      </div>

      {/* Légende sources */}
      <div style={{ display:'flex', gap: 8, marginBottom: 16, flexWrap:'wrap' as const }}>
        {Object.entries(SOURCES).map(([k, v]) => (
          <span key={k} style={{ background:`${v.color}15`, color: v.color, border:`1px solid ${v.color}40`, borderRadius: 20, padding:'3px 10px', fontSize: 11, fontWeight: 600 }}>
            {k} — {v.label}
          </span>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'white', borderRadius: 14, border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background:'#f8fafc' }}>
              <th style={{ padding:'10px 14px', textAlign:'left', fontWeight: 700, color:'#374151', borderBottom:'1px solid #e2e8f0' }}>Spécialité / Catégorie / Geste</th>
              <th style={{ padding:'10px 14px', textAlign:'right', fontWeight: 700, color:'#374151', borderBottom:'1px solid #e2e8f0', whiteSpace:'nowrap' as const }}>Prix barème (USD)</th>
              <th style={{ padding:'10px 14px', textAlign:'right', fontWeight: 700, color:'#374151', borderBottom:'1px solid #e2e8f0', whiteSpace:'nowrap' as const }}>Prix clinique (USD)</th>
              <th style={{ padding:'10px 14px', textAlign:'right', fontWeight: 700, color:'#374151', borderBottom:'1px solid #e2e8f0', whiteSpace:'nowrap' as const }}>= HTG aujourd'hui</th>
              <th style={{ padding:'10px 14px', textAlign:'center', fontWeight: 700, color:'#374151', borderBottom:'1px solid #e2e8f0' }}>Source</th>
              <th style={{ padding:'10px 14px', textAlign:'center', fontWeight: 700, color:'#374151', borderBottom:'1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gestes.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign:'center', color:'#94a3b8' }}>
                {gestes.length === 0 ? 'Aucun geste — cliquez sur "⬇ Importer barèmes" pour initialiser les 290 gestes de référence' : 'Aucun résultat'}
              </td></tr>
            ) : gestes.map((g: any) => (
              <tr key={g.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                <td style={{ padding:'10px 14px' }}>
                  <div style={{ fontWeight: 600, color:'#0f172a' }}>{g.libelle}</div>
                  <div style={{ fontSize: 11, color:'#94a3b8', marginTop: 2 }}>
                    {g.specialite}{g.categorie ? ` › ${g.categorie}` : ''}
                  </div>
                </td>
                <td style={{ padding:'10px 14px', textAlign:'right', fontFamily:'monospace', whiteSpace:'nowrap' as const }}>
                  {g.prix_usd_min ? (
                    <span style={{ color:'#64748b' }}>${g.prix_usd_min} – ${g.prix_usd_max || g.prix_usd_bareme}</span>
                  ) : (
                    <span style={{ fontWeight: 700, color:'#0f172a' }}>${g.prix_usd_bareme}</span>
                  )}
                </td>
                <td style={{ padding:'10px 14px', textAlign:'right', whiteSpace:'nowrap' as const }}>
                  {editId === g.id ? (
                    <div style={{ display:'flex', gap: 4, justifyContent:'flex-end' }}>
                      <input type="number" value={editPrix} onChange={e => setEditPrix(e.target.value)}
                        placeholder={String(g.prix_usd_bareme)}
                        style={{ width: 80, padding:'5px 8px', borderRadius: 6, border:'2px solid #1641C8', fontSize: 13, textAlign:'right', fontFamily:'monospace' }} />
                      <button onClick={() => sauvegarderPrixClinique(g.id)} style={{ background:'#16a34a', color:'white', border:'none', borderRadius: 6, padding:'5px 10px', cursor:'pointer', fontSize: 12, fontWeight: 700 }}>✓</button>
                      <button onClick={() => { setEditId(null); setEditPrix('') }} style={{ background:'#f1f5f9', border:'none', borderRadius: 6, padding:'5px 8px', cursor:'pointer', fontSize: 12 }}>✕</button>
                    </div>
                  ) : (
                    <span
                      onClick={() => { setEditId(g.id); setEditPrix(String(g.prix_clinique_usd || g.prix_usd_bareme || '')) }}
                      style={{ cursor:'pointer', fontFamily:'monospace', fontWeight: 700, color: g.prix_clinique_usd ? '#16a34a' : '#94a3b8', padding:'3px 8px', borderRadius: 6, background: g.prix_clinique_usd ? '#f0fdf4' : '#f8fafc', border:`1px dashed ${g.prix_clinique_usd ? '#86efac' : '#e2e8f0'}` }}
                      title="Cliquer pour modifier le prix clinique"
                    >
                      {g.prix_clinique_usd ? `$${g.prix_clinique_usd}` : '— barème'}
                    </span>
                  )}
                </td>
                <td style={{ padding:'10px 14px', textAlign:'right', fontFamily:'monospace', color:'#0d9488', fontWeight: 700, whiteSpace:'nowrap' as const }}>
                  {Math.round(g.prix_usd * taux_htg).toLocaleString('fr-FR')} HTG
                </td>
                <td style={{ padding:'10px 14px', textAlign:'center' }}>
                  {g.source_bareme && (
                    <span style={{
                      background:`${(SOURCES as any)[g.source_bareme]?.color || '#64748b'}15`,
                      color: (SOURCES as any)[g.source_bareme]?.color || '#64748b',
                      borderRadius: 20, padding:'2px 8px', fontSize: 10, fontWeight: 700
                    }}>
                      {g.source_bareme}
                    </span>
                  )}
                </td>
                <td style={{ padding:'10px 14px', textAlign:'center' }}>
                  <button onClick={() => supprimerGeste(g.id)} style={{ background:'#fef2f2', color:'#dc2626', border:'none', borderRadius: 6, padding:'4px 8px', cursor:'pointer', fontSize: 11 }}>
                    Désactiver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
