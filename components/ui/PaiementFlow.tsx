'use client'
/**
 * PaiementFlow — composant universel de paiement
 * Gère les 5 modes : Espèces · MonCash · NatCash · Carte · Zelle
 * Props:
 * montant : number — montant HTG à payer
 * tauxChange : number — taux USD→HTG du jour
 * onVerifie : (info) => void — appelé quand le paiement est vérifié
 * onReset? : () => void — appelé si le caissier change de mode
 * compact? : boolean — affichage réduit (modal RDV)
 */

import { useState } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export type ModePaiement = 'especes' | 'moncash' | 'natcash' | 'carte' | 'zelle'

export interface PaiementInfo {
 mode: ModePaiement
 reference: string // référence enrichie à stocker
 verifie: boolean
 montant: number
 montant_usd?: number
}

interface Props {
 montant: number
 tauxChange: number
 onVerifie: (info: PaiementInfo) => void
 onReset?: () => void
 compact?: boolean
 modesDisponibles?: ModePaiement[]
}

const MODES = [
 { id: 'especes' as ModePaiement, label: 'Espèces', color: '#16a34a', bg: '#f0fdf4', faIcon: 'fa-money-bill-wave' },
 { id: 'moncash' as ModePaiement, label: 'MonCash', color: '#dc2626', bg: '#fef2f2', faIcon: 'fa-mobile-screen' },
 { id: 'natcash' as ModePaiement, label: 'NatCash', color: '#1d4ed8', bg: '#eff6ff', faIcon: 'fa-mobile-alt' },
 { id: 'carte'   as ModePaiement, label: 'Carte',   color: '#7c3aed', bg: '#f5f3ff', faIcon: 'fa-credit-card' },
 { id: 'zelle'   as ModePaiement, label: 'Zelle',   color: '#0369a1', bg: '#f0f9ff', faIcon: 'fa-dollar-sign' },
]

const inp: any = (extra?: any) => ({
 width: '100%', padding: '9px 11px', borderRadius: 7,
 border: '1px solid #d1d5db', fontSize: 13,
 boxSizing: 'border-box' as const, ...extra
})

export default function PaiementFlow({
 montant, tauxChange, onVerifie, onReset,
 compact = false, modesDisponibles
}: Props) {
 const [mode, setMode] = useState<ModePaiement>('especes')
 const [verifie, setVerifie] = useState(false)
 const [loading, setLoading] = useState(false)

 // Champs MonCash / NatCash
 const [tel, setTel] = useState('')
 const [ref, setRef] = useState('')
 // Champs Carte
 const [cNum, setCNum] = useState('')
 const [cExp, setCExp] = useState('')
 const [cCvv, setCCvv] = useState('')
 const [cNom, setCNom] = useState('')
 // Champs Zelle
 const [zContact, setZContact] = useState('')
 const [zNom, setZNom] = useState('')
 const [zUsd, setZUsd] = useState('')
 const [zRef, setZRef] = useState('')

 const modes = modesDisponibles
 ? MODES.filter(m => modesDisponibles.includes(m.id))
 : MODES

 const changeMode = (m: ModePaiement) => {
 setMode(m); setVerifie(false)
 setTel(''); setRef('')
 setCNum(''); setCExp(''); setCCvv(''); setCNom('')
 setZContact(''); setZNom(''); setZUsd(''); setZRef('')
 onReset?.()
 }

 const confirmerEspeces = () => {
 setVerifie(true)
 onVerifie({ mode: 'especes', reference: 'especes', verifie: true, montant })
 }

 const verifierMobile = async (endpoint: string) => {
 if (!tel) { toast.error('Saisissez le numéro'); return }
 setLoading(true)
 try {
 const r = await api.post(endpoint, { telephone: tel, reference: ref, montant })
 setVerifie(true)
 const refEnrichie = `${mode}:${tel}${ref ? '|ref:' + ref : ''}`
 toast.success(r.data.message || 'Vérifié ')
 onVerifie({ mode, reference: refEnrichie, verifie: true, montant })
 } catch (e: any) {
 toast.error(e?.response?.data?.detail || 'Numéro invalide')
 } finally { setLoading(false) }
 }

 const verifierCarte = async () => {
 const num = cNum.replace(/\s/g, '')
 if (!num || !cExp || !cCvv || !cNom) { toast.error('Complétez toutes les informations de la carte'); return }
 setLoading(true)
 try {
 const r = await api.post('/caissier/verifier-carte', {
 numero: num, expiry: cExp, cvv: cCvv, nom_titulaire: cNom, montant
 })
 setVerifie(true)
 toast.success(`${r.data.carte_type} ${r.data.numero_masque} — validée `)
 onVerifie({ mode: 'carte', reference: `Carte:${cNom}|${r.data.numero_masque}|${r.data.token}`, verifie: true, montant })
 } catch (e: any) {
 toast.error(e?.response?.data?.detail || 'Carte invalide')
 } finally { setLoading(false) }
 }

 const verifierZelle = async () => {
 if (!zContact || !zNom || !zUsd) { toast.error('Complétez les informations Zelle'); return }
 setLoading(true)
 try {
 const r = await api.post('/caissier/verifier-zelle', {
 email_ou_tel: zContact, nom_envoyeur: zNom, montant_usd: parseFloat(zUsd), reference: zRef
 })
 setVerifie(true)
 toast.success("Zelle confirmé — vérifiez sur l'app bancaire")
 onVerifie({
 mode: 'zelle', verifie: true, montant,
 montant_usd: parseFloat(zUsd),
 reference: `Zelle:${zContact}|${zNom}|$${zUsd}${zRef ? '|ref:' + zRef : ''}`
 })
 } catch (e: any) {
 toast.error(e?.response?.data?.detail || 'Informations Zelle invalides')
 } finally { setLoading(false) }
 }

 const pad = compact ? '10px 12px' : '12px 14px'
 const fs = compact ? 12 : 13

 return (
 <div>
 {/* Sélection mode */}
 <div style={{ display: 'grid', gridTemplateColumns: `repeat(${modes.length}, 1fr)`, gap: 5, marginBottom: 12 }}>
 {modes.map(m => (
 <button key={m.id} type="button" onClick={() => changeMode(m.id)} style={{
   padding: compact ? '8px 3px' : '10px 4px', borderRadius: 8, cursor: 'pointer',
   border: `2px solid ${mode === m.id ? (m as any).color : '#e2e8f0'}`,
   background: mode === m.id ? (m as any).bg : 'white',
   color: mode === m.id ? (m as any).color : '#94a3b8',
   fontWeight: 700, fontSize: 10, textAlign: 'center' as const, lineHeight: 1.5,
   transition: 'all 0.15s'
  }}>
  <i className={`fa-solid ${(m as any).faIcon}`} style={{ display:'block', fontSize: 15, marginBottom: 2 }} />
  {m.label}
  </button>
 ))}
 </div>

 {/* ── ESPÈCES ── */}
 {mode === 'especes' && !verifie && (
 <div style={{ background: '#f0fdf4', borderRadius: 8, padding: pad, marginBottom: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
 <span style={{ fontSize: 20 }}></span>
 <div style={{ flex: 1, fontSize: fs, color: '#15803d' }}>
 Paiement en espèces — {montant.toLocaleString()} HTG
 </div>
 <button onClick={confirmerEspeces} style={{
 background: '#16a34a', color: 'white', border: 'none', borderRadius: 7,
 padding: '7px 14px', fontWeight: 700, cursor: 'pointer', fontSize: fs, whiteSpace: 'nowrap' as const
 }}>Confirmer</button>
 </div>
 )}

 {/* ── MONCASH ── */}
 {mode === 'moncash' && !verifie && (
 <div style={{ background: '#fef3c7', borderRadius: 10, padding: pad, border: '1px solid #fcd34d', marginBottom: 10 }}>
 <div style={{ fontWeight: 700, fontSize: fs, color: '#92400e', marginBottom: 6 }}> Vérification MonCash</div>
 <div style={{ fontSize: 11, color: '#78350f', marginBottom: 8 }}>
 Numéro MonCash du patient + référence de la transaction reçue.
 </div>
 <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
 <input value={tel} onChange={e => setTel(e.target.value)}
 placeholder="3X/4X-XXX-XXXX" style={{ ...inp({ borderColor: '#f59e0b', fontFamily: 'monospace', fontSize: 14 }), flex: 1 }} />
 <input value={ref} onChange={e => setRef(e.target.value)}
 placeholder="Réf. transaction (optionnel)" style={{ ...inp({ borderColor: '#f59e0b', fontSize: 12 }), flex: 1 }} />
 </div>
 <button onClick={() => verifierMobile('/caissier/verifier-moncash')} disabled={!tel || loading} style={{
 width: '100%', background: '#d97706', color: 'white', border: 'none',
 borderRadius: 8, padding: '9px', fontWeight: 700, cursor: 'pointer', fontSize: fs,
 opacity: !tel ? 0.5 : 1
 }}>{loading ? ' Vérification...' : ' Vérifier le numéro MonCash'}</button>
 </div>
 )}

 {/* ── NATCASH ── */}
 {mode === 'natcash' && !verifie && (
 <div style={{ background: '#eff6ff', borderRadius: 10, padding: pad, border: '1px solid #bfdbfe', marginBottom: 10 }}>
 <div style={{ fontWeight: 700, fontSize: fs, color: '#1e40af', marginBottom: 6 }}> Vérification NatCash</div>
 <div style={{ fontSize: 11, color: '#1d4ed8', marginBottom: 8 }}>
 Numéro NatCash du patient + référence de la transaction.
 </div>
 <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
 <input value={tel} onChange={e => setTel(e.target.value)}
 placeholder="3X/4X-XXX-XXXX" style={{ ...inp({ borderColor: '#93c5fd', fontFamily: 'monospace', fontSize: 14 }), flex: 1 }} />
 <input value={ref} onChange={e => setRef(e.target.value)}
 placeholder="Réf. NatCash (optionnel)" style={{ ...inp({ borderColor: '#93c5fd', fontSize: 12 }), flex: 1 }} />
 </div>
 <button onClick={() => verifierMobile('/caissier/verifier-natcash')} disabled={!tel || loading} style={{
 width: '100%', background: '#1d4ed8', color: 'white', border: 'none',
 borderRadius: 8, padding: '9px', fontWeight: 700, cursor: 'pointer', fontSize: fs,
 opacity: !tel ? 0.5 : 1
 }}>{loading ? ' Vérification...' : ' Vérifier le numéro NatCash'}</button>
 </div>
 )}

 {/* ── CARTE ── */}
 {mode === 'carte' && !verifie && (
 <div style={{ background: '#f5f3ff', borderRadius: 10, padding: pad, border: '1px solid #ddd6fe', marginBottom: 10 }}>
 <div style={{ fontWeight: 700, fontSize: fs, color: '#5b21b6', marginBottom: 6 }}> Informations carte bancaire</div>
 <div style={{ fontSize: 11, color: '#6d28d9', marginBottom: 8 }}>Données non stockées — traitement sécurisé uniquement.</div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 8 }}>
 <div style={{ gridColumn: '1/-1' }}>
 <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#5b21b6', marginBottom: 3 }}>Numéro de carte *</label>
 <input value={cNum} onChange={e => {
 const v = e.target.value.replace(/\D/g, '').slice(0, 19)
 setCNum(v.replace(/(\d{4})/g, '$1 ').trim())
 }} placeholder="XXXX XXXX XXXX XXXX" maxLength={23}
 style={inp({ borderColor: '#c4b5fd', fontFamily: 'monospace', fontSize: 15, letterSpacing: 2 })} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#5b21b6', marginBottom: 3 }}>Expiration *</label>
 <input value={cExp} onChange={e => {
 let v = e.target.value.replace(/\D/g, '')
 if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4)
 setCExp(v)
 }} placeholder="MM/AA" maxLength={5} style={inp({ borderColor: '#c4b5fd', fontFamily: 'monospace' })} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#5b21b6', marginBottom: 3 }}>CVV *</label>
 <input value={cCvv} onChange={e => setCCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
 placeholder="123" maxLength={4} type="password" style={inp({ borderColor: '#c4b5fd', fontFamily: 'monospace' })} />
 </div>
 <div style={{ gridColumn: '1/-1' }}>
 <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#5b21b6', marginBottom: 3 }}>Nom du titulaire *</label>
 <input value={cNom} onChange={e => setCNom(e.target.value.toUpperCase())}
 placeholder="NOM PRÉNOM" style={inp({ borderColor: '#c4b5fd' })} />
 </div>
 </div>
 <button onClick={verifierCarte} disabled={loading} style={{
 width: '100%', background: '#7c3aed', color: 'white', border: 'none',
 borderRadius: 8, padding: '9px', fontWeight: 700, cursor: 'pointer', fontSize: fs
 }}>{loading ? ' Validation...' : ' Valider la carte'}</button>
 </div>
 )}

 {/* ── ZELLE ── */}
 {mode === 'zelle' && !verifie && (
 <div style={{ background: '#f0f9ff', borderRadius: 10, padding: pad, border: '1px solid #7dd3fc', marginBottom: 10 }}>
 <div style={{ fontWeight: 700, fontSize: fs, color: '#0369a1', marginBottom: 6 }}> Paiement Zelle (USD)</div>
 <div style={{ background: '#fef9c3', borderRadius: 7, padding: '6px 10px', marginBottom: 8, fontSize: 11, color: '#92400e' }}>
 Confirmez visuellement la réception sur votre application bancaire <strong>avant</strong> de valider.
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 8 }}>
 <div style={{ gridColumn: '1/-1' }}>
 <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#0369a1', marginBottom: 3 }}>Email ou numéro US de l'envoyeur *</label>
 <input value={zContact} onChange={e => setZContact(e.target.value)}
 placeholder="email@ex.com ou +1-XXX-XXX-XXXX" style={inp({ borderColor: '#7dd3fc' })} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#0369a1', marginBottom: 3 }}>Nom de l'envoyeur *</label>
 <input value={zNom} onChange={e => setZNom(e.target.value)} placeholder="Prénom NOM" style={inp({ borderColor: '#7dd3fc' })} />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#0369a1', marginBottom: 3 }}>Montant USD reçu *</label>
 <input type="number" value={zUsd} onChange={e => setZUsd(e.target.value)}
 placeholder={tauxChange > 0 ? `${Math.round(montant / tauxChange * 100) / 100}` : '0'}
 style={inp({ borderColor: '#7dd3fc', fontFamily: 'monospace' })} />
 </div>
 <div style={{ gridColumn: '1/-1' }}>
 <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#0369a1', marginBottom: 3 }}>Référence Zelle (optionnel)</label>
 <input value={zRef} onChange={e => setZRef(e.target.value)} placeholder="N° de confirmation" style={inp({ borderColor: '#7dd3fc' })} />
 </div>
 </div>
 {montant > 0 && tauxChange > 0 && (
 <div style={{ background: '#e0f2fe', borderRadius: 7, padding: '5px 10px', marginBottom: 8, fontSize: 11, color: '#0369a1', fontWeight: 600 }}>
 {montant.toLocaleString()} HTG ≈ ${Math.round(montant / tauxChange * 100) / 100} USD (taux: 1 USD = {tauxChange} HTG)
 </div>
 )}
 <button onClick={verifierZelle} disabled={!zContact || !zNom || !zUsd || loading} style={{
 width: '100%', background: '#0284c7', color: 'white', border: 'none',
 borderRadius: 8, padding: '9px', fontWeight: 700, cursor: 'pointer', fontSize: fs,
 opacity: (!zContact || !zNom || !zUsd) ? 0.5 : 1
 }}>{loading ? ' Confirmation...' : " Confirmer la réception Zelle"}</button>
 </div>
 )}

 {/* ── BADGE VÉRIFIÉ ── */}
 {verifie && (
 <div style={{
 background: '#f0fdf4', border: '2px solid #16a34a', borderRadius: 10,
 padding: pad, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10
 }}>
 <span style={{ fontSize: 24 }}></span>
 <div>
 <div style={{ fontWeight: 700, fontSize: fs, color: '#15803d' }}>Paiement vérifié — prêt à enregistrer</div>
 <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>
 Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)} · {montant.toLocaleString()} HTG
 </div>
 </div>
 <button onClick={() => { setVerifie(false); onReset?.() }} style={{
 marginLeft: 'auto', background: '#f1f5f9', border: '1px solid #e2e8f0',
 borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 11, color: '#64748b'
 }}>Modifier</button>
 </div>
 )}
 </div>
 )
}
