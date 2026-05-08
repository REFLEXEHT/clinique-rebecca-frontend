'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Eye, EyeOff } from 'lucide-react'

function ResetContent() {
 const { login } = useAuth()
 const router = useRouter()
 const params = useSearchParams()
 const token = params.get('token') || ''
 const [verifying, setVerifying] = useState(true)
 const [sessionToken, setSessionToken] = useState('')
 const [error, setError] = useState('')
 const [newPwd, setNewPwd] = useState('')
 const [confirm, setConfirm] = useState('')
 const [showPwd, setShowPwd] = useState(false)
 const [loading, setLoading] = useState(false)
 const [done, setDone] = useState(false)

 useEffect(() => {
 if (!token) { setError('Lien invalide — token manquant.'); setVerifying(false); return }
 // Auto-verify token from URL
 api.post('/auth/verifier-code-reset', { token })
 .then(r => { setSessionToken(r.data.session_token); setVerifying(false) })
 .catch(e => {
 const msg = e?.response?.data?.detail || ''
 if (msg.includes('expiré')) setError('Ce lien a expiré. Faites une nouvelle demande.')
 else if (msg.includes('utilisé')) setError('Ce lien a déjà été utilisé.')
 else setError('Lien invalide ou expiré. Faites une nouvelle demande.')
 setVerifying(false)
 })
 }, [token])

 const submit = async () => {
 if (newPwd.length < 6) { setError('Au moins 6 caractères.'); return }
 if (newPwd !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
 setLoading(true); setError('')
 try {
 const res = await api.post('/auth/nouveau-mot-de-passe', { session_token: sessionToken, nouveau_mot_de_passe: newPwd })
 if (res.data?.access_token) login(res.data.access_token, res.data.user)
 setDone(true)
 } catch { setError('Erreur lors de la mise à jour. Réessayez.') }
 finally { setLoading(false) }
 }

 return (
 <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>
 <div style={{ width:'100%', maxWidth:420 }}>
 <div style={{ textAlign:'center', marginBottom:24 }}>
 <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:14 }}>
 <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}></div>
 <span style={{ fontWeight:900, fontSize:15, color:'#0f172a' }}>Clinique de la Rebecca</span>
 </Link>
 <h1 style={{ fontWeight:900, fontSize:'1.4rem', color:'#0f172a', margin:'0 0 6px' }}>Nouveau mot de passe</h1>
 </div>
 <div style={{ background:'white', borderRadius:20, padding:28, boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid #e2e8f0' }}>
 {verifying && <div style={{ textAlign:'center', padding:32, color:'#64748b' }}> Vérification du lien...</div>}
 {error && !verifying && (
 <div>
 <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#dc2626', marginBottom:20 }}> {error}</div>
 <Link href="/forgot-password" style={{ display:'block', background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', textDecoration:'none', borderRadius:12, padding:'12px', fontWeight:700, textAlign:'center', fontSize:14 }}>
 Faire une nouvelle demande →
 </Link>
 </div>
 )}
 {!verifying && sessionToken && !done && (
 <div>
 <p style={{ color:'#64748b', fontSize:13, margin:'0 0 18px' }}>Choisissez un nouveau mot de passe sécurisé.</p>
 <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6 }}>Nouveau mot de passe</label>
 <div style={{ position:'relative', marginBottom:14 }}>
 <input type={showPwd ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Minimum 6 caractères" autoFocus
 style={{ width:'100%', padding:'12px 44px 12px 14px', borderRadius:10, border:'1.5px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const }}/>
 <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
 {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
 </button>
 </div>
 <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6 }}>Confirmer</label>
 <input type={showPwd ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Répétez le mot de passe"
 style={{ width:'100%', padding:'12px 14px', borderRadius:10, border: confirm && confirm !== newPwd ? '1.5px solid #dc2626' : '1.5px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const, marginBottom:16 }}/>
 {error && <div style={{ color:'#dc2626', fontSize:12, marginBottom:14 }}> {error}</div>}
 <button onClick={submit} disabled={loading || newPwd.length < 6 || newPwd !== confirm}
 style={{ width:'100%', background: newPwd.length >= 6 && newPwd === confirm ? 'linear-gradient(135deg,#1641C8,#0d9488)' : '#e2e8f0', color: newPwd.length >= 6 && newPwd === confirm ? 'white' : '#94a3b8', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', opacity:loading?0.7:1 }}>
 {loading ? '...' : ' Enregistrer'}
 </button>
 </div>
 )}
 {done && (
 <div style={{ textAlign:'center' }}>
 <div style={{ fontSize:48, marginBottom:14 }}></div>
 <h2 style={{ fontWeight:900, color:'#16a34a', margin:'0 0 10px' }}>Mot de passe modifié !</h2>
 <button onClick={() => router.push('/patient/dashboard')} style={{ width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:12, padding:'12px', fontWeight:800, fontSize:14, cursor:'pointer' }}>
 Accéder à mon espace →
 </button>
 </div>
 )}
 </div>
 <div style={{ textAlign:'center', marginTop:16 }}>
 <Link href="/login" style={{ color:'#1641C8', fontWeight:700, fontSize:13, textDecoration:'none' }}>← Retour à la connexion</Link>
 </div>
 </div>
 </div>
 )
}

export default function ResetPasswordPage() {
 return <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}> Chargement...</div>}><ResetContent/></Suspense>
}
