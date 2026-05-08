'use client'
import { useState } from 'react'
import { api } from '@/lib/api'

export default function VerificationPaiement({ compact = false }: { compact?: boolean }) {
 const [query, setQuery] = useState('')
 const [result, setResult] = useState<any>(null)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')

 const verifier = async () => {
 if (query.trim().length < 2) return
 setLoading(true); setError(''); setResult(null)
 try {
 const r = await api.get(`/verification-paiement?q=${encodeURIComponent(query.trim())}`)
 setResult(r.data)
 } catch (e: any) {
 setError(e?.response?.data?.detail || 'Erreur de vérification')
 } finally { setLoading(false) }
 }

 const reset = () => { setQuery(''); setResult(null); setError('') }

 return (
 <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
 {/* Header */}
 <div style={{ background: 'linear-gradient(135deg,#0f172a,#1641C8)', padding: compact ? '12px 16px' : '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
 <span style={{ fontSize: 18 }}></span>
 <div>
 <div style={{ color: 'white', fontWeight: 700, fontSize: compact ? 13 : 14 }}>Vérification de paiement</div>
 {!compact && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>Ticket, #RB-XXXX, téléphone ou nom</div>}
 </div>
 </div>

 <div style={{ padding: compact ? '12px' : '16px' }}>
 {/* Champ de recherche */}
 <div style={{ display: 'flex', gap: 8, marginBottom: result || error ? 14 : 0 }}>
 <input
 value={query}
 onChange={e => setQuery(e.target.value)}
 onKeyDown={e => e.key === 'Enter' && verifier()}
 placeholder="Ex: AB12CD34, #RB-0042, 36186469, PIERRE..."
 style={{
 flex: 1, padding: '10px 12px', borderRadius: 8,
 border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'monospace',
 outline: 'none', background: '#f8fafc'
 }}
 />
 <button
 onClick={verifier}
 disabled={loading || query.trim().length < 2}
 style={{
 background: loading ? '#94a3b8' : '#1641C8', color: 'white', border: 'none',
 borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer',
 fontSize: 13, minWidth: 90, opacity: query.trim().length < 2 ? 0.5 : 1
 }}
 >
 {loading ? '...' : ' Vérifier'}
 </button>
 {result && (
 <button onClick={reset} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontSize: 13, color: '#64748b' }}></button>
 )}
 </div>

 {/* Erreur */}
 {error && (
 <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
 {error}
 </div>
 )}

 {/* Résultat */}
 {result && (
 <div>
 {/* Bandeau principal */}
 <div style={{
 borderRadius: 10, padding: '12px 16px', marginBottom: 12,
 background: result.a_paye ? '#f0fdf4' : result.trouve ? '#fefce8' : '#fef2f2',
 border: `2px solid ${result.a_paye ? '#16a34a' : result.trouve ? '#d97706' : '#ef4444'}`,
 display: 'flex', alignItems: 'center', gap: 12
 }}>
 <span style={{ fontSize: 28 }}>{result.a_paye ? '' : result.trouve ? '' : ''}</span>
 <div>
 <div style={{
 fontWeight: 800, fontSize: 15,
 color: result.a_paye ? '#16a34a' : result.trouve ? '#d97706' : '#dc2626'
 }}>
 {result.message}
 </div>
 {result.trouve && result.paiements?.[0] && (
 <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
 {result.paiements[0].patient_nom} · {result.paiements[0].patient_telephone}
 </div>
 )}
 </div>
 </div>

 {/* Détail des paiements */}
 {result.trouve && result.paiements?.map((p: any, i: number) => (
 <div key={i} style={{
 background: '#f8fafc', borderRadius: 8, padding: '10px 14px',
 marginBottom: 8, border: '1px solid #e2e8f0',
 display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
 flexWrap: 'wrap' as const
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
 {/* Ticket */}
 {p.ticket && (
 <div style={{ background: '#0f172a', borderRadius: 6, padding: '4px 8px' }}>
 <div style={{ color: '#94a3b8', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Ticket</div>
 <div style={{ color: 'white', fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>#{p.ticket}</div>
 </div>
 )}
 <div>
 <div style={{ fontWeight: 600, fontSize: 13 }}>{p.service}</div>
 <div style={{ fontSize: 11, color: '#94a3b8' }}>
 {new Date(p.heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
 {p.recu_numero && <span> · {p.recu_numero}</span>}
 </div>
 </div>
 </div>

 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
 {p.montant != null && (
 <div style={{ textAlign: 'right' as const }}>
 <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{p.montant?.toLocaleString('fr-FR')} HTG</div>
 {p.mode_paiement && <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' as const }}>{p.mode_paiement}</div>}
 </div>
 )}
 <div style={{
 background: p.paiement_ok ? '#f0fdf4' : '#fef9c3',
 border: `1px solid ${p.paiement_ok ? '#86efac' : '#fde047'}`,
 borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700,
 color: p.statut_couleur, whiteSpace: 'nowrap' as const
 }}>
 {p.statut_libelle}
 </div>
 </div>
 </div>
 ))}

 {/* Pas trouvé */}
 {!result.trouve && (
 <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '8px 0' }}>
 Aucun enregistrement aujourd'hui pour cette recherche.
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 )
}
