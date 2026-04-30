'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

type FormData = {
  nom: string; email: string; password: string; confirm: string; telephone: string
}

export default function RegisterPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()
  const pwd = watch('password')

  const onSubmit = async (data: FormData) => {
    // Block @cliniquerebecca.ht on patient registration
    if (data.email.toLowerCase().includes('@cliniquerebecca.ht')) {
      toast.error('Les comptes @cliniquerebecca.ht sont réservés au personnel de la clinique. Utilisez votre email personnel.')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.register({
        email: data.email, password: data.password,
        nom: data.nom, telephone: data.telephone, role: 'patient'
      })
      if (res.data?.access_token) {
        login(res.data.access_token, res.data.user)
        toast.success('Compte créé avec succès ! Bienvenue.')
        router.push('/patient/dashboard')
      } else {
        toast.success('Compte créé. Vous pouvez maintenant vous connecter.')
        router.push('/login')
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur lors de la création du compte')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex' }}>
      {/* Panneau gauche */}
      <div style={{ flex:1, background:'linear-gradient(135deg,#0f1e3d,#1641C8,#0d9488)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 48px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:48 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🏥</div>
          <span style={{ color:'white', fontWeight:900, fontSize:18 }}>Clinique de la Rebecca</span>
        </Link>
        <h1 style={{ color:'white', fontWeight:900, fontSize:'2rem', margin:'0 0 16px' }}>
          Créez votre<br /><em style={{ color:'#5eead4' }}>espace santé.</em>
        </h1>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:14, lineHeight:1.7, marginBottom:32, maxWidth:360 }}>
          Inscrivez-vous pour accéder à vos rendez-vous, résultats d'analyses et consultations vidéo.
        </p>

        {/* Règle confidentialité */}
        <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:14, padding:'18px 20px', borderLeft:'3px solid #5eead4' }}>
          <div style={{ color:'#5eead4', fontWeight:700, fontSize:13, marginBottom:8 }}>🔒 Confidentialité garantie</div>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:13, margin:0, lineHeight:1.6 }}>
            Votre compte patient est entièrement séparé des comptes du personnel de la clinique. Vos informations médicales ne sont accessibles qu'à vous et à vos médecins.
          </p>
        </div>

        <div style={{ marginTop:24, padding:'14px 18px', background:'rgba(255,255,255,0.06)', borderRadius:12 }}>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginBottom:6 }}>Vous êtes un employé de la clinique ?</div>
          <div style={{ color:'rgba(255,255,255,0.85)', fontSize:13 }}>Votre compte est créé par l'administrateur. Contactez : <strong style={{ color:'#5eead4' }}>admin@cliniquerebecca.ht</strong></div>
        </div>

        <Link href="/" style={{ color:'rgba(255,255,255,0.5)', fontSize:13, textDecoration:'none', marginTop:32, display:'flex', alignItems:'center', gap:6 }}>← Retour au site</Link>
      </div>

      {/* Formulaire */}
      <div style={{ width:'min(480px,100%)', background:'white', display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 44px' }}>
        <h2 style={{ fontWeight:900, fontSize:'1.6rem', color:'#0f172a', margin:'0 0 4px' }}>Créer un compte patient</h2>
        <p style={{ color:'#64748b', fontSize:13, margin:'0 0 28px' }}>Pour le personnel de la clinique, contactez l'administrateur.</p>

        {/* Bannière email personnel */}
        <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'10px 14px', marginBottom:20, fontSize:13, color:'#166534', display:'flex', alignItems:'flex-start', gap:8 }}>
          <span style={{ fontSize:16, flexShrink:0 }}>✓</span>
          <span><strong>Utilisez votre email personnel</strong> (gmail, yahoo, etc.). Les emails @cliniquerebecca.ht sont réservés au personnel.</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontWeight:700, fontSize:13, color:'#374151', marginBottom:6 }}>Nom complet *</label>
            <input {...register('nom', { required: 'Nom requis', minLength: { value: 2, message: 'Minimum 2 caractères' } })}
              placeholder="Prénom Nom"
              style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${errors.nom ? '#ef4444' : '#d1d5db'}`, fontSize:14, boxSizing:'border-box' as const, outline:'none' }} />
            {errors.nom && <p style={{ color:'#ef4444', fontSize:12, margin:'4px 0 0' }}>{errors.nom.message}</p>}
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontWeight:700, fontSize:13, color:'#374151', marginBottom:6 }}>Email personnel *</label>
            <input {...register('email', {
              required: 'Email requis',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
              validate: v => !v.toLowerCase().includes('@cliniquerebecca.ht') || 'Email @cliniquerebecca.ht réservé au personnel'
            })}
              type="email" placeholder="votre@email.com"
              style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`, fontSize:14, boxSizing:'border-box' as const, outline:'none' }} />
            {errors.email && <p style={{ color:'#ef4444', fontSize:12, margin:'4px 0 0' }}>{errors.email.message}</p>}
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontWeight:700, fontSize:13, color:'#374151', marginBottom:6 }}>Téléphone</label>
            <input {...register('telephone')}
              placeholder="+509 xxxx-xxxx"
              style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, boxSizing:'border-box' as const, outline:'none' }} />
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontWeight:700, fontSize:13, color:'#374151', marginBottom:6 }}>Mot de passe *</label>
            <div style={{ position:'relative' }}>
              <input {...register('password', {
                required: 'Mot de passe requis',
                minLength: { value: 8, message: 'Minimum 8 caractères' }
              })}
                type={showPwd ? 'text' : 'password'} placeholder="Minimum 8 caractères"
                style={{ width:'100%', padding:'11px 44px 11px 14px', borderRadius:10, border:`1px solid ${errors.password ? '#ef4444' : '#d1d5db'}`, fontSize:14, boxSizing:'border-box' as const, outline:'none' }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:4 }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color:'#ef4444', fontSize:12, margin:'4px 0 0' }}>{errors.password.message}</p>}
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontWeight:700, fontSize:13, color:'#374151', marginBottom:6 }}>Confirmer le mot de passe *</label>
            <input {...register('confirm', {
              required: 'Confirmation requise',
              validate: v => v === pwd || 'Les mots de passe ne correspondent pas'
            })}
              type={showPwd ? 'text' : 'password'} placeholder="••••••••"
              style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${errors.confirm ? '#ef4444' : '#d1d5db'}`, fontSize:14, boxSizing:'border-box' as const, outline:'none' }} />
            {errors.confirm && <p style={{ color:'#ef4444', fontSize:12, margin:'4px 0 0' }}>{errors.confirm.message}</p>}
          </div>

          <button type="submit" disabled={loading} style={{
            width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)',
            color:'white', border:'none', borderRadius:12, padding:'13px',
            fontWeight:800, fontSize:15, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            opacity: loading ? 0.8 : 1
          }}>
            <UserPlus size={16} />
            {loading ? 'Création...' : 'Créer mon compte patient'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:18, color:'#64748b', fontSize:13 }}>
          Déjà un compte ?{' '}
          <Link href="/login" style={{ color:'#1641C8', fontWeight:700, textDecoration:'none' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
