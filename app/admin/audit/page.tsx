'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Shield, Search } from 'lucide-react'

interface AuditEntry { id: number; audit_id: string; event_type: string; actor_id: number; actor_role: string; target_id: string; timestamp: string; ip_address: string; result: string; details: string }

const EVENT_COLORS: Record<string, string> = {
 DOSSIER_CONSULTE: '#1641C8', CONNEXION: '#16a34a', CONNEXION_ECHEC: '#dc2626',
 RESULTAT_LABO_MODIFIE: '#d97706', DOSSIER_CREE: '#0d9488', CONSULTATION_TERMINEE: '#7c3aed',
 SIGNES_VITAUX_SAISIS: '#0d9488', ACCES_DOSSIER_REFUSE: '#dc2626',
 AUTORISATION_SPECIALE_ADMIN: '#f59e0b',
}

export default function AdminAudit() {
 const [logs, setLogs] = useState<AuditEntry[]>([])
 const [search, setSearch] = useState('')
 const [filtre, setFiltre] = useState('')
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 api.get('/admin/audit-log?limit=200')
 .then(r => { setLogs(r.data || []); setLoading(false) })
 .catch(() => setLoading(false))
 }, [])

 const filtres = logs.filter(l => {
 if (filtre && l.event_type !== filtre) return false
 if (search && !l.actor_id?.toString().includes(search) && !l.target_id?.includes(search) && !l.ip_address?.includes(search)) return false
 return true
 })

 const event_types = [...new Set(logs.map(l => l.event_type))]

 return (
 <div style={{ padding:28, maxWidth:1100, margin:'0 auto' }}>
 <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
 <Shield size={24} color="#1641C8" />
 <div>
 <h1 style={{ fontWeight:900, fontSize:'1.4rem', color:'#0f172a', margin:0 }}>Journal d'Audit</h1>
 <p style={{ color:'#64748b', fontSize:13, margin:'4px 0 0' }}>Registre immuable — lecture seule — {logs.length} événements</p>
 </div>
 </div>

 <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:10, padding:12, marginBottom:20, fontSize:13, color:'#dc2626' }}>
 Ce journal est <strong>immuable</strong> — aucune modification ou suppression n'est possible.
 </div>

 <div style={{ display:'flex', gap:12, marginBottom:16 }}>
 <div style={{ position:'relative', flex:1 }}>
 <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
 <input placeholder="Rechercher par ID, IP..." value={search} onChange={e => setSearch(e.target.value)}
 style={{ width:'100%', padding:'10px 12px 10px 36px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, boxSizing:'border-box' as const }} />
 </div>
 <select value={filtre} onChange={e => setFiltre(e.target.value)}
 style={{ padding:'10px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, background:'white', minWidth:220 }}>
 <option value="">Tous les événements</option>
 {event_types.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>

 {loading ? (
 <div style={{ textAlign:'center', padding:48, color:'#94a3b8' }}>Chargement...</div>
 ) : (
 <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', overflow:'hidden' }}>
 <div style={{ maxHeight:600, overflowY:'auto' }}>
 <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
 <thead style={{ position:'sticky', top:0, background:'#f8fafc', zIndex:1 }}>
 <tr style={{ borderBottom:'1px solid #e2e8f0' }}>
 {['Timestamp','Événement','Acteur','Rôle','Cible','IP','Résultat','Détails'].map(h => (
 <th key={h} style={{ padding:'10px 14px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:11, whiteSpace:'nowrap' }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {filtres.map(l => (
 <tr key={l.id} style={{ borderBottom:'1px solid #f8fafc' }}>
 <td style={{ padding:'8px 14px', color:'#64748b', whiteSpace:'nowrap', fontFamily:'monospace', fontSize:11 }}>
 {new Date(l.timestamp).toLocaleString('fr-FR')}
 </td>
 <td style={{ padding:'8px 14px' }}>
 <span style={{ background:`${EVENT_COLORS[l.event_type] || '#64748b'}20`, color:EVENT_COLORS[l.event_type] || '#64748b', borderRadius:4, padding:'2px 8px', fontSize:10, fontWeight:700, whiteSpace:'nowrap' }}>
 {l.event_type}
 </span>
 </td>
 <td style={{ padding:'8px 14px', fontFamily:'monospace', color:'#0f172a' }}>{l.actor_id || '—'}</td>
 <td style={{ padding:'8px 14px', color:'#64748b' }}>{l.actor_role || '—'}</td>
 <td style={{ padding:'8px 14px', fontFamily:'monospace', color:'#0f172a' }}>{l.target_id || '—'}</td>
 <td style={{ padding:'8px 14px', fontFamily:'monospace', color:'#64748b', fontSize:11 }}>{l.ip_address || '—'}</td>
 <td style={{ padding:'8px 14px' }}>
 <span style={{ background: l.result === 'succes' ? '#f0fdf4' : '#fef2f2', color: l.result === 'succes' ? '#16a34a' : '#dc2626', borderRadius:4, padding:'2px 8px', fontSize:10, fontWeight:700 }}>
 {l.result}
 </span>
 </td>
 <td style={{ padding:'8px 14px', color:'#94a3b8', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.details || '—'}</td>
 </tr>
 ))}
 {filtres.length === 0 && (
 <tr><td colSpan={8} style={{ padding:32, textAlign:'center' as const, color:'#94a3b8' }}>Aucun événement</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 )
}
