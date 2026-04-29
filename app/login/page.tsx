'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

type FormData = { email: string; password: string }

const ROLES = [
  { value: 'patient',   label: 'Patient',       icon: 'fa-user',          color: '#1641C8', desc: 'Mes rendez-vous & résultats' },
  { value: 'medecin',   label: 'Médecin',        icon: 'fa-user-doctor',   color: '#0d9488', desc: 'Mes consultations' },
  { value: 'admin',     label: 'Administrateur', icon: 'fa-shield-halved', color: '#6366f1', desc: 'Gestion de la clinique' },
  { value: 'caissier',  label: 'Caissier',       icon: 'fa-cash-register', color: '#d97706', desc: 'Encaissements' },
  { value: 'labo',      label: 'Laboratoire',    icon: 'fa-flask',         color: '#16a34a', desc: 'Analyses & résultats' },
  { value: 'pharmacie', label: 'Pharmacie',      icon: 'fa-pills',         color: '#dc2626', desc: 'Gestion des stocks' },
]

const DASHBOARDS: Record<string, string> = {
  admin: '/admin/dashboard', medecin: '/medecin/dashboard',
  patient: '/patient/dashboard', caissier: '/caissier', labo: '/labo', pharmacie: '/pharmacie',
}

const TEMOIGNAGES = [
  { texte: 'L\'équipe est d\'une gentillesse remarquable. Je me suis sentie accompagnée à chaque étape.', auteur: 'Marie-Ange C.', role: 'Patiente' },
  { texte: 'Les résultats de labo arrivent vite, et le médecin m\'a tout expliqué avec patience.', auteur: 'Jean-Pierre M.', role: 'Patient' },
  { texte: 'Consultation vidéo parfaite. Depuis chez moi, j\'ai eu un suivi complet et humain.', auteur: 'Rosalie D.', role: 'Patiente' },
]

export default function LoginPage() {
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [roleSelec, setRoleSelec] = useState('patient')
  const [temoIndex, setTemoIndex] = useState(0)
  const { login } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      const { access_token, user } = res.data
      if (user.role !== roleSelec) {
        const roleLabel = ROLES.find(r => r.value === user.role)?.label || user.role
        toast.error(`Ce compte est enregistré comme « ${roleLabel} ». Sélectionnez le bon profil.`)
        setLoading(false)
        return
      }
      login(access_token, user)
      toast.success(`Bienvenue, ${user.nom} !`)
      router.push(DASHBOARDS[user.role] || '/')
    } catch {
      toast.error('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = ROLES.find(r => r.value === roleSelec)!
  const temo = TEMOIGNAGES[temoIndex]

  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', background:'white' }}>

      {/* ── PANNEAU GAUCHE — émotionnel ──────────────────────────────────── */}
      <div style={{
        background:'linear-gradient(150deg, #0a1628 0%, #1641C8 55%, #0d9488 100%)',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'56px 52px', position:'relative', overflow:'hidden',
      }}>
        {/* blobs */}
        <div style={{ position:'absolute', top:-100, right:-100, width:360, height:360, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-70, left:-60, width:280, height:280, borderRadius:'50%', background:'rgba(13,148,136,0.12)', pointerEvents:'none' }} />

        <div style={{ position:'relative', color:'white', maxWidth:380 }}>
          {/* Logo texte */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:44 }}>
            <div style={{
              width:44, height:44, background:'rgba(255,255,255,0.13)',
              borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
              backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.18)',
            }}>
              <i className="fa-solid fa-plus" style={{ fontSize:20, color:'white' }} />
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, color:'rgba(255,255,255,0.45)', textTransform:'uppercase' }}>Clinique de la</div>
              <div style={{ fontSize:18, fontWeight:900 }}>REBECCA</div>
            </div>
          </div>

          {/* Accroche principale */}
          <h1 style={{ fontSize:'clamp(1.5rem, 2.5vw, 2rem)', fontWeight:900, marginBottom:14, lineHeight:1.2 }}>
            Votre santé,<br />
            <em style={{ fontStyle:'italic', color:'#5eead4', fontFamily:'Georgia, serif' }}>entre de bonnes mains</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:14.5, lineHeight:1.75, marginBottom:40 }}>
            Accédez à votre espace personnel pour gérer vos rendez-vous, consulter vos résultats et communiquer avec votre médecin.
          </p>

          {/* Avantages */}
          {[
            { icon:'fa-calendar-check', txt:'Rendez-vous en ligne — rapide et simple' },
            { icon:'fa-flask',          txt:'Résultats d\'analyses sur votre téléphone' },
            { icon:'fa-video',          txt:'Consultations vidéo disponibles 6j/7' },
            { icon:'fa-shield-heart',   txt:'Dossier médical sécurisé et confidentiel' },
          ].map(a => (
            <div key={a.txt} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:13 }}>
              <div style={{
                width:36, height:36, borderRadius:10,
                background:'rgba(13,148,136,0.25)',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0, border:'1px solid rgba(94,234,212,0.15)',
              }}>
                <i className={`fa-solid ${a.icon}`} style={{ color:'#5eead4', fontSize:14 }} />
              </div>
              <span style={{ color:'rgba(255,255,255,0.80)', fontSize:13.5 }}>{a.txt}</span>
            </div>
          ))}

          {/* Témoignage rotatif */}
          <div style={{
            marginTop:36, padding:'20px 22px',
            background:'rgba(255,255,255,0.07)', borderRadius:18,
            backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.10)',
          }}>
            <div style={{ display:'flex', gap:3, marginBottom:10 }}>
              {[0,1,2,3,4].map(i => (
                <i key={i} className="fa-solid fa-star" style={{ color:'#fbbf24', fontSize:12 }} />
              ))}
            </div>
            <p style={{ color:'rgba(255,255,255,0.78)', fontSize:13, fontStyle:'italic', lineHeight:1.65, marginBottom:12 }}>
              &ldquo;{temo.texte}&rdquo;
            </p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <span style={{ color:'#5eead4', fontSize:12, fontWeight:700 }}>— {temo.auteur}</span>
                <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginLeft:6 }}>{temo.role}</span>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {TEMOIGNAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTemoIndex(i)}
                    style={{
                      width: i === temoIndex ? 20 : 7, height:7, borderRadius:4,
                      border:'none', cursor:'pointer', padding:0,
                      background: i === temoIndex ? '#5eead4' : 'rgba(255,255,255,0.25)',
                      transition:'all 0.3s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Retour site */}
          <div style={{ marginTop:28 }}>
            <Link href="/" style={{
              color:'rgba(255,255,255,0.45)', fontSize:13, textDecoration:'none',
              display:'inline-flex', alignItems:'center', gap:6, transition:'color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)' }}
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize:11 }} /> Retour au site
            </Link>
          </div>
        </div>
      </div>

      {/* ── PANNEAU DROIT — formulaire ────────────────────────────────────── */}
      <div style={{
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'56px 64px', background:'#f8fafc', overflowY:'auto',
      }}>
        <div style={{ maxWidth:400, width:'100%', margin:'0 auto' }}>

          {/* Titre */}
          <div style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:'1.75rem', fontWeight:900, color:'#0f172a', marginBottom:6 }}>
              Connexion
            </h2>
            <p style={{ color:'#64748b', fontSize:14 }}>
              Accédez à votre espace personnel
            </p>
          </div>

          {/* Sélection profil */}
          <div style={{ marginBottom:28 }}>
            <label style={{ display:'block', fontWeight:700, color:'#374151', fontSize:12, marginBottom:12, textTransform:'uppercase', letterSpacing:'0.07em' }}>
              Je me connecte en tant que
            </label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRoleSelec(r.value)}
                  style={{
                    padding:'11px 8px', borderRadius:14,
                    border:`2px solid ${roleSelec === r.value ? r.color : '#e2e8f0'}`,
                    background: roleSelec === r.value ? `${r.color}0e` : 'white',
                    cursor:'pointer', textAlign:'center', transition:'all 0.18s',
                    boxShadow: roleSelec === r.value ? `0 4px 14px ${r.color}22` : 'none',
                  }}
                >
                  <i className={`fa-solid ${r.icon}`} style={{ color:r.color, fontSize:18, display:'block', marginBottom:5 }} />
                  <span style={{ fontSize:11, fontWeight:700, color: roleSelec === r.value ? r.color : '#64748b', display:'block', lineHeight:1.2 }}>{r.label}</span>
                </button>
              ))}
            </div>
            {/* Info contextuelle */}
            <div style={{
              marginTop:10, background:`${selectedRole.color}0a`,
              border:`1px solid ${selectedRole.color}22`,
              borderRadius:10, padding:'8px 14px',
              display:'flex', alignItems:'center', gap:8, fontSize:12.5, color:selectedRole.color,
            }}>
              <i className={`fa-solid ${selectedRole.icon}`} />
              <span><strong>{selectedRole.label}</strong> — {selectedRole.desc}</span>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {/* Email */}
            <div>
              <label style={{ display:'block', fontWeight:700, color:'#374151', fontSize:12.5, marginBottom:7, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                Email
              </label>
              <div style={{ position:'relative' }}>
                <i className="fa-solid fa-envelope" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:13 }} />
                <input
                  {...register('email', { required: true })}
                  type="email"
                  placeholder="votre@email.com"
                  autoComplete="username"
                  style={{
                    width:'100%', padding:'13px 14px 13px 42px',
                    borderRadius:12, border:`1.5px solid ${errors.email ? '#ef4444' : '#e2e8f0'}`,
                    fontSize:14.5, outline:'none', boxSizing:'border-box',
                    background:'white', transition:'border-color 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = selectedRole.color }}
                  onBlur={e => { e.currentTarget.style.borderColor = errors.email ? '#ef4444' : '#e2e8f0' }}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ display:'block', fontWeight:700, color:'#374151', fontSize:12.5, marginBottom:7, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                Mot de passe
              </label>
              <div style={{ position:'relative' }}>
                <i className="fa-solid fa-lock" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:13 }} />
                <input
                  {...register('password', { required: true })}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width:'100%', padding:'13px 46px 13px 42px',
                    borderRadius:12, border:`1.5px solid ${errors.password ? '#ef4444' : '#e2e8f0'}`,
                    fontSize:14.5, outline:'none', boxSizing:'border-box',
                    background:'white', transition:'border-color 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = selectedRole.color }}
                  onBlur={e => { e.currentTarget.style.borderColor = errors.password ? '#ef4444' : '#e2e8f0' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94a3b8', cursor:'pointer', padding:0 }}
                >
                  <i className={`fa-solid ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width:'100%', marginTop:8,
                background: loading ? '#94a3b8' : `linear-gradient(135deg, ${selectedRole.color}, ${selectedRole.color}cc)`,
                color:'white', border:'none', borderRadius:12,
                padding:'14px 0', fontWeight:800, fontSize:15.5,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : `0 6px 24px ${selectedRole.color}40`,
                transition:'all 0.3s',
                display:'flex', alignItems:'center', justifyContent:'center', gap:9,
              }}
            >
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" /> Connexion en cours…</>
                : <><i className="fa-solid fa-right-to-bracket" /> Se connecter</>
              }
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
            <span style={{ color:'#94a3b8', fontSize:12.5, fontWeight:600 }}>Nouveau ici ?</span>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
          </div>

          <Link
            href="/register"
            style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              padding:'13px 0', borderRadius:12, border:'1.5px solid #e2e8f0',
              color:'#374151', fontWeight:700, fontSize:14.5, textDecoration:'none',
              background:'white', transition:'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = selectedRole.color; (e.currentTarget as HTMLElement).style.color = selectedRole.color }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
          >
            <i className="fa-solid fa-user-plus" /> Créer un compte
          </Link>

          <p style={{ textAlign:'center', color:'#94a3b8', fontSize:12, marginTop:20, lineHeight:1.6 }}>
            En vous connectant, vous acceptez nos{' '}
            <span style={{ color:'#64748b', textDecoration:'underline', cursor:'pointer' }}>conditions d&apos;utilisation</span>
            {' '}et notre{' '}
            <span style={{ color:'#64748b', textDecoration:'underline', cursor:'pointer' }}>politique de confidentialité</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
