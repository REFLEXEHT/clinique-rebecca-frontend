'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Plus, Search, Save, X } from 'lucide-react'

interface TarifLabo { id: number; code: string; libelle: string; montant: number; devise: string }

export default function AdminLabo() {
 const [tarifs, setTarifs] = useState<TarifLabo[]>([])
 const [search, setSearch] = useState('')
 const [edited, setEdited] = useState<Record<string, number>>({})
 const [showAdd, setShowAdd] = useState(false)
 const [newItem, setNewItem] = useState({ libelle: '', montant: 0, code: '' })
 const [loading, setLoading] = useState(true)

 const load = () => {
 api.get('/labo/tarifs').then(r => { setTarifs(r.data || []); setLoading(false) }).catch(() => setLoading(false))
 }
 useEffect(() => { load() }, [])

 const save = async (t: TarifLabo) => {
 const val = edited[t.code]; if (val === undefined) return
 try {
 await api.put(`/admin/labo/tarifs/${t.code}`, { montant: val })
 setTarifs(p => p.map(x => x.code === t.code ? { ...x, montant: val } : x))
 setEdited(p => { const n={...p}; delete n[t.code]; return n })
 toast.success(`${t.libelle} mis à jour `)
 } catch { toast.error('Erreur') }
 }

 const addExamen = async () => {
 if (!newItem.libelle || newItem.montant <= 0) { toast.error('Libellé et prix requis'); return }
 const code = newItem.code || `LABO_${newItem.libelle.toUpperCase().replace(/[^A-Z0-9]/g,'_').slice(0,20)}`
 try {
 await api.post('/admin/labo/ajouter', { code, libelle: newItem.libelle, montant: newItem.montant })
 toast.success('Examen ajouté ')
 setNewItem({ libelle:'', montant:0, code:'' }); setShowAdd(false); load()
 } catch { toast.error('Erreur') }
 }

 const filtres = tarifs.filter(t => !search || t.libelle.toLowerCase().includes(search.toLowerCase()))

 return (
 <div style={{ padding:28, maxWidth:1000, margin:'0 auto' }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
 <div>
 <h1 style={{ fontWeight:900, fontSize:'1.4rem', color:'#0f172a', margin:0 }}>Gestion Laboratoire</h1>
 <p style={{ color:'#64748b', margin:'4px 0 0', fontSize:14 }}>{tarifs.length} examens · Actualisation Février 2026</p>
 </div>
 <button onClick={() => setShowAdd(!showAdd)} style={{
 background: showAdd ? '#f1f5f9' : 'linear-gradient(135deg,#16a34a,#0d9488)',
 color: showAdd ? '#374151' : 'white', border:'none', borderRadius:12,
 padding:'10px 20px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8
 }}>
 {showAdd ? <><X size={14} />Fermer</> : <><Plus size={14} />Ajouter un examen</>}
 </button>
 </div>

 {showAdd && (
 <div style={{ background:'white', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
 <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:14, marginBottom:16 }}>
 <div>
 <label style={{ display:'block', fontWeight:600, fontSize:13, color:'#374151', marginBottom:6 }}>Nom de l'examen *</label>
 <input value={newItem.libelle} onChange={e => setNewItem(p => ({...p, libelle:e.target.value}))}
 placeholder="Ex: Interleukine 6" style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:14, boxSizing:'border-box' as const }} />
 </div>
 <div>
 <label style={{ display:'block', fontWeight:600, fontSize:13, color:'#374151', marginBottom:6 }}>Prix HTG *</label>
 <input type="number" value={newItem.montant} onChange={e => setNewItem(p => ({...p, montant:Number(e.target.value)}))}
 style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:14, boxSizing:'border-box' as const }} />
 </div>
 <div style={{ display:'flex', alignItems:'flex-end' }}>
 <button onClick={addExamen} style={{ width:'100%', background:'linear-gradient(135deg,#16a34a,#0d9488)', color:'white', border:'none', borderRadius:8, padding:'11px', fontWeight:700, cursor:'pointer' }}>
 Ajouter
 </button>
 </div>
 </div>
 </div>
 )}

 <div style={{ position:'relative', marginBottom:16 }}>
 <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
 <input placeholder="Rechercher un examen..." value={search} onChange={e => setSearch(e.target.value)}
 style={{ width:'100%', padding:'11px 14px 11px 40px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, boxSizing:'border-box' as const }} />
 </div>

 {loading ? (
 <div style={{ textAlign:'center', padding:48, color:'#94a3b8' }}>Chargement...</div>
 ) : (
 <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', overflow:'hidden' }}>
 <div style={{ maxHeight:580, overflowY:'auto' }}>
 <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
 <thead style={{ position:'sticky', top:0, background:'#f8fafc', zIndex:1 }}>
 <tr style={{ borderBottom:'1px solid #e2e8f0' }}>
 {['Examen','Prix actuel','Modifier le prix',''].map(h => (
 <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:12 }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {filtres.map(t => (
 <tr key={t.code} style={{ borderBottom:'1px solid #f8fafc', background: edited[t.code] !== undefined ? '#f0fdf4' : 'white' }}>
 <td style={{ padding:'10px 16px', fontWeight:600, color:'#0f172a' }}>{t.libelle}</td>
 <td style={{ padding:'10px 16px', color:'#16a34a', fontWeight:700 }}>{t.montant.toLocaleString()} {t.devise}</td>
 <td style={{ padding:'10px 16px' }}>
 <input type="number" min={0} placeholder={String(t.montant)}
 onChange={e => setEdited(p => ({...p, [t.code]: Number(e.target.value)}))}
 style={{ width:110, padding:'7px 10px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, textAlign:'right' as const }} />
 </td>
 <td style={{ padding:'10px 16px' }}>
 {edited[t.code] !== undefined && (
 <button onClick={() => save(t)} style={{ background:'#16a34a', color:'white', border:'none', borderRadius:8, padding:'6px 14px', fontWeight:700, cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
 <Save size={12} /> Sauvegarder
 </button>
 )}
 </td>
 </tr>
 ))}
 {filtres.length === 0 && (
 <tr><td colSpan={4} style={{ padding:32, textAlign:'center' as const, color:'#94a3b8' }}>
 {tarifs.length === 0 ? 'Données en cours de chargement depuis Render...' : `Aucun résultat pour "${search}"`}
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
