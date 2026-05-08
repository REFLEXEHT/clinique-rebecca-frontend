'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Eye, EyeOff } from 'lucide-react'

type Step = 'email' | 'code' | 'nouveau_mdp' | 'succes'

export default function ForgotPasswordPage() {
 const { login } = useAuth()
 const router = useRouter()
 const [step, setStep] = useState<Step>('email')
 const [email, setEmail] = useState('')
 const [code, setCode] = useState('')
 const [sessionToken, setSessionToken]= useState('')
 const [newPwd, setNewPwd] = useState('')
 const [confirmPwd, setConfirmPwd] = useState('')
 const [showPwd, setShowPwd] = useState(false)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')
 const [info, setInfo] = useState('')

 const clear = () => { setError(''); setInfo('') }

 const submitEmail = async () => {
 clear()
 if (!email.trim() || !email.includes('@')) { setError('Veuillez saisir une adresse email valide.'); return }
 setLoading(true)
 try {
 await api.post('/auth/mot-de-passe-oublie', { email: email.trim().toLowerCase() })
 } catch { /* always succeed for security */ }
 setInfo('Si un compte existe avec cet email, vous recevrez un code à 6 chiffres. Vérifiez aussi vos spams.')
 setStep('code')
 setLoading(false)
 }

 const submitCode = async () => {
 clear()
 if (!/^\d{6}$/.test(code.trim())) { setError('Le code doit contenir exactement 6 chiffres.'); return }
 setLoading(true)
 try {
 const res = await api.post('/auth/verifier-code-reset', { email: email.trim().toLowerCase(), code: code.trim() })
 setSessionToken(res.data.session_token)
 setStep('nouveau_mdp')
 } catch (e: any) {
 const msg = e?.response?.data?.detail || ''
 if (msg.includes('expiré')) setError('Code expiré. Cliquez sur "Renvoyer un code".')
 else if (msg.includes('utilisé')) setError('Code déjà utilisé. Cliquez sur "Renvoyer un code".')
 else setError('Code incorrect. Vérifiez les 6 chiffres reçus par email.')
 } finally { setLoading(false) }
 }

 const submitNewPwd = async () => {
 clear()
 if (newPwd.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
 if (newPwd !== confirmPwd) { setError('Les mots de passe ne correspondent pas.'); return }
 setLoading(true)
 try {
 const res = await api.post('/auth/nouveau-mot-de-passe', { session_token: sessionToken, nouveau_mot_de_passe: newPwd })
 if (res.data?.access_token) login(res.data.access_token, res.data.user)
 setStep('succes')
 } catch (e: any) {
 const msg = e?.response?.data?.detail || ''
 if (msg.includes('expirée') || msg.includes('invalide')) {
 setError('Session expirée. Recommencez la procédure.')
 setTimeout(() => { setStep('email'); setCode(''); setNewPwd(''); setConfirmPwd('') }, 2500)
 } else setError('Erreur lors de la mise à jour. Réessayez.')
 } finally { setLoading(false) }
 }

 const resendCode = async () => {
 clear(); setCode('')
 try { await api.post('/auth/mot-de-passe-oublie', { email: email.trim().toLowerCase() }) } catch { /* */ }
 setInfo('Un nouveau code a été envoyé à votre adresse email.')
 }

 const pwdStr = (p: string) => {
 if (p.length >= 10) return { n: 4, label: 'Fort ', color: '#16a34a' }
 if (p.length >= 8) return { n: 3, label: 'Moyen', color: '#d97706' }
 if (p.length >= 6) return { n: 2, label: 'Faible', color: '#f59e0b' }
 return { n: 1, label: 'Trop court', color: '#dc2626' }
 }
 const str = pwdStr(newPwd)

 const stepNum = { email:1, code:2, nouveau_mdp:3, succes:4 }[step]

 return (
 <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>
 <div style={{ width:'100%', maxWidth:460 }}>

 {/* Header */}
 <div style={{ textAlign:'center', marginBottom:28 }}>
 <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:16 }}>
 <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}></div>
 <span style={{ fontWeight:900, fontSize:16, color:'#0f172a' }}>Clinique de la Rebecca</span>
 </Link>
 <h1 style={{ fontWeight:900, fontSize:'1.5rem', color:'#0f172a', margin:'0 0 6px' }}>Mot de passe oublié</h1>
 <p style={{ color:'#64748b', fontSize:14, margin:0 }}>Récupérez l'accès à votre compte</p>
 </div>

 {/* Progress */}
 {step !== 'succes' && (
 <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
 {[{n:1,l:'Email'},{n:2,l:'Code'},{n:3,l:'Nouveau MDP'}].map((s,i) => (
 <div key={s.n} style={{ display:'flex', alignItems:'center', flex: i < 2 ? 1 : 'none' }}>
 <div style={{ width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0, background: stepNum > s.n ? '#16a34a' : stepNum === s.n ? '#1641C8' : '#e2e8f0', color: stepNum >= s.n ? 'white' : '#94a3b8' }}>
 {stepNum > s.n ? '' : s.n}
 </div>
 <span style={{ marginLeft:5, fontSize:11, fontWeight:600, color: stepNum === s.n ? '#1641C8' : '#94a3b8', marginRight:5 }}>{s.l}</span>
 {i < 2 && <div style={{ flex:1, height:2, background: stepNum > s.n ? '#16a34a' : '#e2e8f0', margin:'0 4px' }}/>}
 </div>
 ))}
 </div>
 )}

 {/* Card */}
 <div style={{ background:'white', borderRadius:20, padding:28, boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid #e2e8f0' }}>

 {error && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#dc2626', marginBottom:18, display:'flex', gap:8 }}><span></span><span>{error}</span></div>}
 {info && <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#1e40af', marginBottom:18, display:'flex', gap:8 }}><span>ℹ️</span><span>{info}</span></div>}

 {/* STEP 1 */}
 {step === 'email' && (
 <div>
 <h2 style={{ fontWeight:800, fontSize:'1.1rem', margin:'0 0 8px' }}>Votre adresse email</h2>
 <p style={{ color:'#64748b', fontSize:13, margin:'0 0 18px', lineHeight:1.6 }}>Entrez l'email associé à votre compte. Vous recevrez un code de vérification à 6 chiffres.</p>
 <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6 }}>Email</label>
 <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitEmail()} placeholder="votre@email.com" autoFocus
 style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const, marginBottom:16 }}/>
 <button onClick={submitEmail} disabled={loading} style={{ width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', opacity:loading?0.7:1 }}>
 {loading ? ' Envoi...' : 'Envoyer le code →'}
 </button>
 </div>
 )}

 {/* STEP 2 */}
 {step === 'code' && (
 <div>
 <h2 style={{ fontWeight:800, fontSize:'1.1rem', margin:'0 0 8px' }}>Code de vérification</h2>
 <p style={{ color:'#64748b', fontSize:13, margin:'0 0 4px', lineHeight:1.6 }}>Entrez le code à 6 chiffres envoyé à :</p>
 <div style={{ fontFamily:'monospace', fontWeight:700, color:'#1641C8', fontSize:14, marginBottom:18 }}>{email}</div>
 <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6 }}>Code reçu par email</label>
 <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))} onKeyDown={e => e.key === 'Enter' && code.length === 6 && submitCode()} placeholder="• • • • • •" autoFocus
 style={{ width:'100%', padding:'14px', borderRadius:12, border:'2px solid #1641C8', fontSize:28, fontWeight:900, textAlign:'center', letterSpacing:10, fontFamily:'monospace', outline:'none', boxSizing:'border-box' as const, color:'#0f172a', marginBottom:6 }}/>
 <div style={{ fontSize:11, color:'#94a3b8', textAlign:'center', marginBottom:16 }}>Valide pendant 1 heure</div>
 <button onClick={submitCode} disabled={loading || code.length !== 6} style={{ width:'100%', background: code.length === 6 ? 'linear-gradient(135deg,#1641C8,#0d9488)' : '#e2e8f0', color: code.length === 6 ? 'white' : '#94a3b8', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor: code.length !== 6 ? 'not-allowed' : 'pointer' }}>
 {loading ? ' Vérification...' : 'Vérifier →'}
 </button>
 <div style={{ display:'flex', justifyContent:'space-between', marginTop:14, fontSize:13 }}>
 <button onClick={() => { setStep('email'); setCode(''); clear() }} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', padding:0, fontSize:13 }}>← Changer d'email</button>
 <button onClick={resendCode} disabled={loading} style={{ background:'none', border:'none', color:'#1641C8', cursor:'pointer', padding:0, fontWeight:600, fontSize:13 }}>Renvoyer un code</button>
 </div>
 </div>
 )}

 {/* STEP 3 */}
 {step === 'nouveau_mdp' && (
 <div>
 <h2 style={{ fontWeight:800, fontSize:'1.1rem', margin:'0 0 8px' }}>Nouveau mot de passe</h2>
 <p style={{ color:'#64748b', fontSize:13, margin:'0 0 18px', lineHeight:1.6 }}>Choisissez un mot de passe sécurisé d'au moins 6 caractères.</p>
 <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6 }}>Nouveau mot de passe</label>
 <div style={{ position:'relative', marginBottom:newPwd.length > 0 ? 6 : 14 }}>
 <input type={showPwd ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Minimum 6 caractères" autoFocus
 style={{ width:'100%', padding:'12px 44px 12px 14px', borderRadius:10, border:'1.5px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const }}/>
 <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
 {showPwd ? <EyeOff size={17}/> : <Eye size={17}/>}
 </button>
 </div>
 {newPwd.length > 0 && (
 <div style={{ marginBottom:14 }}>
 <div style={{ display:'flex', gap:3, marginBottom:3 }}>
 {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= str.n ? str.color : '#e2e8f0' }}/>)}
 </div>
 <div style={{ fontSize:11, color:str.color, fontWeight:600 }}>{str.label}</div>
 </div>
 )}
 <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6 }}>Confirmer</label>
 <input type={showPwd ? 'text' : 'password'} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitNewPwd()} placeholder="Répétez le mot de passe"
 style={{ width:'100%', padding:'12px 14px', borderRadius:10, border: confirmPwd && confirmPwd !== newPwd ? '1.5px solid #dc2626' : '1.5px solid #d1d5db', fontSize:14, outline:'none', boxSizing:'border-box' as const, marginBottom:4 }}/>
 {confirmPwd && confirmPwd !== newPwd && <div style={{ color:'#dc2626', fontSize:11, marginBottom:14 }}>↑ Les mots de passe ne correspondent pas</div>}
 {confirmPwd && confirmPwd === newPwd && newPwd.length >= 6 && <div style={{ color:'#16a34a', fontSize:11, marginBottom:14 }}> Mots de passe identiques</div>}
 {!(confirmPwd && (confirmPwd !== newPwd || (confirmPwd === newPwd && newPwd.length >= 6))) && <div style={{ marginBottom:14 }}/>}
 <button onClick={submitNewPwd} disabled={loading || newPwd.length < 6 || newPwd !== confirmPwd}
 style={{ width:'100%', background: newPwd.length >= 6 && newPwd === confirmPwd ? 'linear-gradient(135deg,#1641C8,#0d9488)' : '#e2e8f0', color: newPwd.length >= 6 && newPwd === confirmPwd ? 'white' : '#94a3b8', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', opacity:loading?0.7:1 }}>
 {loading ? ' Enregistrement...' : ' Enregistrer le nouveau mot de passe'}
 </button>
 </div>
 )}

 {/* SUCCES */}
 {step === 'succes' && (
 <div style={{ textAlign:'center' }}>
 <div style={{ width:68, height:68, borderRadius:'50%', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', fontSize:34 }}></div>
 <h2 style={{ fontWeight:900, fontSize:'1.2rem', color:'#16a34a', margin:'0 0 10px' }}>Mot de passe modifié !</h2>
 <p style={{ color:'#64748b', fontSize:14, margin:'0 0 22px', lineHeight:1.6 }}>Votre mot de passe a été mis à jour avec succès. Un email de confirmation vous a été envoyé.</p>
 <button onClick={() => router.push('/patient/dashboard')} style={{ width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none', borderRadius:12, padding:'12px', fontWeight:800, fontSize:15, cursor:'pointer', marginBottom:12 }}>
 Accéder à mon espace →
 </button>
 <Link href="/login" style={{ color:'#64748b', fontSize:13, display:'block' }}>Aller à la page de connexion</Link>
 </div>
 )}
 </div>

 <div style={{ textAlign:'center', marginTop:20, fontSize:12, color:'#94a3b8', lineHeight:1.6 }}>
 Besoin d'aide ? <strong style={{ color:'#64748b' }}>(509) 4858-5757</strong> · <strong style={{ color:'#64748b' }}>admin@cliniquerebecca.ht</strong>
 </div>
 <div style={{ textAlign:'center', marginTop:12 }}>
 <Link href="/login" style={{ color:'#1641C8', fontWeight:700, fontSize:13, textDecoration:'none' }}>← Retour à la connexion</Link>
 </div>
 </div>
 </div>
 )
}
