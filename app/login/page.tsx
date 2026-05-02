'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LangContext'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ChevronDown, ArrowLeft } from 'lucide-react'

type FormData = { email: string; password: string }

const DASHBOARDS: Record<string,string> = {
  admin:'/admin/dashboard', medecin:'/medecin/dashboard',
  patient:'/patient/dashboard', caissier:'/caissier',
  labo:'/labo', pharmacie:'/pharmacie', infirmier:'/infirmier',
}

const ROLES_DATA = [
  { value:'patient',   icon:'👤', domaine: null },
  { value:'medecin',   icon:'🩺', domaine:'@cliniquerebecca.ht' },
  { value:'admin',     icon:'🛡️', domaine:'@cliniquerebecca.ht' },
  { value:'caissier',  icon:'💳', domaine:'@cliniquerebecca.ht' },
  { value:'labo',      icon:'🔬', domaine:'@cliniquerebecca.ht' },
  { value:'infirmier', icon:'🏥', domaine:'@cliniquerebecca.ht' },
  { value:'pharmacie', icon:'💊', domaine:'@cliniquerebecca.ht' },
]

const ROLE_LABELS: Record<string, Record<string,string>> = {
  patient:   { fr:'Patient', ht:'Pasyan', en:'Patient', es:'Paciente', zh:'患者' },
  medecin:   { fr:'Médecin', ht:'Doktè', en:'Doctor', es:'Médico', zh:'医生' },
  admin:     { fr:'Administrateur', ht:'Administratè', en:'Administrator', es:'Administrador', zh:'管理员' },
  caissier:  { fr:'Caissier(ère)', ht:'Kesye', en:'Cashier', es:'Cajero/a', zh:'收银员' },
  labo:      { fr:'Laboratoire', ht:'Laboratwa', en:'Laboratory', es:'Laboratorio', zh:'实验室' },
  infirmier: { fr:'Infirmier(ère)', ht:'Enfimyè', en:'Nurse', es:'Enfermero/a', zh:'护士' },
  pharmacie: { fr:'Pharmacie', ht:'Famasi', en:'Pharmacy', es:'Farmacia', zh:'药房' },
}

export default function LoginPage() {
  const { login } = useAuth()
  const { t, lang } = useLang()
  const router = useRouter()
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [roleOpen,  setRoleOpen]  = useState(false)
  const [roleSelec, setRoleSelec] = useState(ROLES_DATA[0])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const getRoleLabel = (val: string) =>
    ROLE_LABELS[val]?.[lang] ?? ROLE_LABELS[val]?.fr ?? val

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      const { access_token, user } = res.data
      if (user.role !== roleSelec.value) {
        toast.error(`Rôle incorrect — ce compte est "${user.role}"`)
        setLoading(false); return
      }
      login(access_token, user)
      toast.success(`✓ ${user.nom}`)
      router.push(DASHBOARDS[user.role] || '/')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Identifiants incorrects')
    } finally { setLoading(false) }
  }

  const inp = {
    width:'100%', padding:'13px 16px', borderRadius:10,
    border:'1px solid #e2e8f0', fontSize:15, outline:'none',
    boxSizing:'border-box' as const,
    background:'#f8fafc', color:'#0f172a',
    transition:'border-color 0.2s',
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column' }}>

      {/* ── Topbar avec retour ──────────────────────────────────────── */}
      <div style={{ background:'white', borderBottom:'1px solid #e2e8f0', height:60, display:'flex', alignItems:'center', padding:'0 24px', gap:16 }}>
        <button onClick={() => router.push('/')} style={{
          display:'flex', alignItems:'center', gap:8, background:'none', border:'none',
          cursor:'pointer', color:'#1641C8', fontWeight:700, fontSize:14, padding:'8px 14px',
          borderRadius:10, transition:'background 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <ArrowLeft size={16} /> {lang === 'zh' ? '返回首页' : lang === 'es' ? 'Volver al inicio' : lang === 'ht' ? 'Retounen akèy' : lang === 'en' ? 'Back to home' : 'Retour à l\'accueil'}
        </button>
        <div style={{ flex:1 }} />
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🏥</div>
          <span style={{ fontWeight:800, color:'#0f172a', fontSize:14 }}>Clinique de la Rebecca</span>
        </Link>
      </div>

      {/* ── Contenu centré ──────────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
        <div style={{ width:'100%', maxWidth:460 }}>

          {/* Photo accueil en haut */}
          <div style={{ borderRadius:20, overflow:'hidden', height:160, marginBottom:28, position:'relative' }}>
            <img src="/services/accueil.png" alt="Clinique de la Rebecca"
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 30%' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 30%, rgba(15,30,61,0.75))' }} />
            <div style={{ position:'absolute', bottom:16, left:20 }}>
              <div style={{ color:'white', fontWeight:900, fontSize:18 }}>
                {t('login.titre')}
              </div>
              <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13 }}>
                {t('login.sous')}
              </div>
            </div>
          </div>

          {/* Carte formulaire */}
          <div style={{ background:'white', borderRadius:20, padding:32, boxShadow:'0 4px 24px rgba(0,0,0,0.08)', border:'1px solid #e2e8f0' }}>

            {/* Sélecteur rôle */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontWeight:700, fontSize:13, color:'#374151', marginBottom:8 }}>
                {t('login.role')}
              </label>
              <div style={{ position:'relative' }}>
                <button type="button" onClick={() => setRoleOpen(!roleOpen)} style={{
                  width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid #e2e8f0',
                  background:'#f8fafc', cursor:'pointer', display:'flex', alignItems:'center', gap:12,
                  textAlign:'left', transition:'border-color 0.2s',
                }}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor='#1641C8')}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor='#e2e8f0')}>
                  <span style={{ fontSize:22 }}>{roleSelec.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:'#0f172a', fontSize:15 }}>{getRoleLabel(roleSelec.value)}</div>
                    {roleSelec.domaine && <div style={{ fontSize:11, color:'#94a3b8' }}>Email : ...{roleSelec.domaine}</div>}
                  </div>
                  <ChevronDown size={15} color="#94a3b8" style={{ transform: roleOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }} />
                </button>

                {roleOpen && (
                  <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'white', borderRadius:14, border:'1px solid #e2e8f0', boxShadow:'0 12px 36px rgba(0,0,0,0.12)', zIndex:100, overflow:'hidden' }}>
                    {ROLES_DATA.map(r => (
                      <button key={r.value} type="button"
                        onClick={() => { setRoleSelec(r); setRoleOpen(false) }}
                        style={{
                          width:'100%', padding:'11px 16px', background: r.value === roleSelec.value ? '#eff6ff' : 'white',
                          border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:12,
                          borderBottom:'1px solid #f1f5f9', textAlign:'left',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = r.value === roleSelec.value ? '#eff6ff' : '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = r.value === roleSelec.value ? '#eff6ff' : 'white')}>
                        <span style={{ fontSize:20 }}>{r.icon}</span>
                        <span style={{ fontWeight: r.value === roleSelec.value ? 700 : 500, color: r.value === roleSelec.value ? '#1641C8' : '#374151', fontSize:14 }}>
                          {getRoleLabel(r.value)}
                        </span>
                        {r.value === roleSelec.value && <span style={{ marginLeft:'auto', color:'#1641C8' }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Badge info rôle */}
              {roleSelec.domaine ? (
                <div style={{ marginTop:8, padding:'7px 12px', background:'#fffbeb', borderRadius:8, fontSize:12, color:'#92400e', display:'flex', alignItems:'center', gap:6 }}>
                  ⚠️ {lang === 'en' ? 'Requires' : lang === 'es' ? 'Requiere' : lang === 'zh' ? '需要' : lang === 'ht' ? 'Bezwen' : 'Requiert'} ...{roleSelec.domaine}
                </div>
              ) : (
                <div style={{ marginTop:8, padding:'7px 12px', background:'#f0fdf4', borderRadius:8, fontSize:12, color:'#166534', display:'flex', alignItems:'center', gap:6 }}>
                  ✓ {lang === 'en' ? 'Use your personal email' : lang === 'es' ? 'Use su correo personal' : lang === 'zh' ? '使用您的个人邮箱' : lang === 'ht' ? 'Sèvi ak imèl pèsonèl ou' : 'Utilisez votre email personnel'}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontWeight:700, fontSize:13, color:'#374151', marginBottom:6 }}>{t('login.email')}</label>
                <input {...register('email', { required: true })} type="email"
                  placeholder={roleSelec.domaine ? `prenom.nom${roleSelec.domaine}` : 'votre@email.com'}
                  style={{ ...inp, borderColor: errors.email ? '#ef4444' : '#e2e8f0' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#1641C8')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:'block', fontWeight:700, fontSize:13, color:'#374151', marginBottom:6 }}>{t('login.mdp')}</label>
                <div style={{ position:'relative' }}>
                  <input {...register('password', { required: true })} type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    style={{ ...inp, paddingRight:44, borderColor: errors.password ? '#ef4444' : '#e2e8f0' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#1641C8')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ textAlign:'right', marginBottom:8, marginTop:-4 }}>
                <Link href="/forgot-password" style={{ color:'#1641C8', fontSize:12, fontWeight:600, textDecoration:'none' }}>
                  Mot de passe oublié ?
                </Link>
              </div>

              <button type="submit" disabled={loading} style={{
                width:'100%', background:'linear-gradient(135deg,#1641C8,#0d9488)',
                color:'white', border:'none', borderRadius:12, padding:'14px',
                fontWeight:800, fontSize:15, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                opacity: loading ? 0.8 : 1, transition:'opacity 0.2s',
              }}>
                {loading ? '...' : t('login.btn')}
              </button>
            </form>

            {roleSelec.value === 'patient' && (
              <p style={{ textAlign:'center', marginTop:18, color:'#64748b', fontSize:13 }}>
                {t('login.pasCompte')}{' '}
                <Link href="/register" style={{ color:'#1641C8', fontWeight:700, textDecoration:'none' }}>
                  {t('login.creer')}
                </Link>
              </p>
            )}
            {roleSelec.value !== 'patient' && (
              <div style={{ marginTop:16, padding:'10px 14px', background:'#f8fafc', borderRadius:8, fontSize:12, color:'#64748b', textAlign:'center' }}>
                {lang === 'en' ? 'Contact your administrator to obtain your credentials.' :
                 lang === 'es' ? 'Contacte a su administrador para obtener sus credenciales.' :
                 lang === 'zh' ? '请联系管理员获取您的登录凭据。' :
                 lang === 'ht' ? 'Kontakte administratè ou pou jwenn idantifyan ou.' :
                 'Contactez votre administrateur pour obtenir vos identifiants.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
