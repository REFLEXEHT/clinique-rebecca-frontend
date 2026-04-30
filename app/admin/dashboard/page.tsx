'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'
import { LogOut, Users, FileText, AlertTriangle, TrendingUp, Shield, Clock } from 'lucide-react'

type Onglet = 'overview' | 'utilisateurs' | 'audit' | 'analytics'

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [onglet,    setOnglet]    = useState<Onglet>('overview')
  const [analytics, setAnalytics] = useState<any>(null)
  const [users,     setUsers]     = useState<any[]>([])
  const [attente,   setAttente]   = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [aiReport,  setAiReport]  = useState('')
  const [loadAI,    setLoadAI]    = useState(false)

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login')
    }
  }, [isAuthenticated, user, loading, router])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return
    api.get('/admin/dashboard-analytics').then(r => setAnalytics(r.data)).catch(() => {})
    api.get('/admin/users').then(r => {
      const all = r.data || []
      setUsers(all)
      setAttente(all.filter((u: any) => !u.is_active && u.role !== 'patient'))
    }).catch(() => {})
    api.get('/admin/audit-logs?limit=50').then(r => setAuditLogs(r.data?.logs || [])).catch(() => {})
  }, [isAuthenticated, user])

  const genererRapportIA = async () => {
    if (!analytics) return
    setLoadAI(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 800,
          messages: [{
            role: 'user',
            content: `Tu es un assistant analytique pour une clinique médicale à Haïti. Génère un rapport de direction concis basé sur ces données: ${JSON.stringify(analytics)}. 
Inclure: 
1. Résumé exécutif (2 phrases)
2. Points d'attention critiques (si alertes accès suspects, comptes en attente)
3. Performance des services les plus demandés
4. Recommandations concrètes (3 max)
Format: texte structuré, 300 mots max, ton professionnel.`
          }]
        })
      })
      const data = await res.json()
      setAiReport(data.content?.[0]?.text || '')
    } catch { setAiReport('Erreur génération rapport') }
    finally { setLoadAI(false) }
  }

  const activerCompte = async (userId: number) => {
    try {
      await api.post(`/admin/users/${userId}/activer`, {})
      setAttente(prev => prev.filter(u => u.id !== userId))
      setUsers(prev => prev.map(u => u.id === userId ? {...u, is_active: true} : u))
      alert('Compte activé — email de confirmation envoyé')
    } catch { alert('Erreur') }
  }

  const rejeterCompte = async (userId: number) => {
    const motif = prompt('Motif du rejet :')
    if (!motif) return
    try {
      await api.post(`/admin/users/${userId}/rejeter`, { motif })
      setAttente(prev => prev.filter(u => u.id !== userId))
      alert('Compte rejeté — email envoyé')
    } catch { alert('Erreur') }
  }

  const suspendre = async (u: any) => {
    try {
      await api.put(`/admin/users/${u.id}/${u.is_active ? 'suspendre' : 'reactiver'}`, {})
      setUsers(prev => prev.map(x => x.id === u.id ? {...x, is_active: !u.is_active} : x))
    } catch { alert('Erreur') }
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #1641C8',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} /></div>

  const NAV = [
    {k:'overview',     icon:<TrendingUp size={14}/>,  label:'Vue d\'ensemble'},
    {k:'analytics',    icon:<TrendingUp size={14}/>,   label:'Analytique IA'},
    {k:'utilisateurs', icon:<Users size={14}/>,        label:`Utilisateurs ${attente.length > 0 ? `(🔴 ${attente.length} en attente)` : ''}`},
    {k:'audit',        icon:<Shield size={14}/>,       label:'Journal Audit'},
  ] as const

  const ROLE_COLOR: Record<string,string> = {admin:'#6366f1',medecin:'#0d9488',caissier:'#d97706',labo:'#16a34a',infirmier:'#0369a1',pharmacie:'#7c3aed',patient:'#1641C8'}

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      {/* Navbar */}
      <div style={{background:'linear-gradient(135deg,#0f1e3d,#1641C8)',height:58,display:'flex',alignItems:'center',padding:'0 24px',gap:14}}>
        <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🛡️</div>
        <div>
          <div style={{color:'white',fontWeight:800,fontSize:14}}>{user?.nom}</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:11}}>Administrateur</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8,flexWrap:'wrap'}}>
          {[
            {href:'/admin/utilisateurs', label:'👥 Utilisateurs'},
            {href:'/admin/specialistes', label:'👨‍⚕️ Médecins'},
            {href:'/admin/tarifs',       label:'💰 Tarifs'},
            {href:'/admin/labo',         label:'🔬 Labo'},
            {href:'/admin/audit',        label:'📋 Audit'},
            {href:'/admin/demandes-acces',label:'🔐 Accès'},
          ].map(l => (
            <Link key={l.href} href={l.href} style={{background:'rgba(255,255,255,0.1)',color:'white',textDecoration:'none',borderRadius:8,padding:'6px 12px',fontSize:12,fontWeight:600}}>
              {l.label}
            </Link>
          ))}
          <button onClick={()=>{logout();router.push('/')}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
            <LogOut size={13}/> Déconnexion
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div style={{background:'white',borderBottom:'1px solid #e2e8f0',padding:'0 24px',display:'flex',gap:4,overflowX:'auto'}}>
        {NAV.map(n => (
          <button key={n.k} onClick={()=>setOnglet(n.k as Onglet)} style={{
            padding:'13px 16px',border:'none',background:'transparent',cursor:'pointer',
            fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',
            color:onglet===n.k?'#1641C8':'#64748b',
            borderBottom:onglet===n.k?'2px solid #1641C8':'2px solid transparent',
          }}>{n.icon}{n.label}</button>
        ))}
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 20px'}}>

        {/* ── VUE D'ENSEMBLE ─────────────────────────────────────── */}
        {onglet==='overview' && (
          <div>
            {/* Alertes critiques */}
            {attente.length > 0 && (
              <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:14,padding:'14px 18px',marginBottom:20,display:'flex',alignItems:'center',gap:12}}>
                <AlertTriangle size={20} color="#dc2626"/>
                <div>
                  <div style={{fontWeight:700,color:'#dc2626'}}>{attente.length} compte{attente.length>1?'s':''} en attente de validation</div>
                  <div style={{fontSize:13,color:'#94a3b8'}}>Cliquez sur "Utilisateurs" pour traiter les demandes</div>
                </div>
              </div>
            )}
            {analytics?.alertes_acces_suspects?.length > 0 && (
              <div style={{background:'#fffbeb',border:'1px solid #fcd34d',borderRadius:14,padding:'14px 18px',marginBottom:20}}>
                <div style={{fontWeight:700,color:'#d97706'}}>⚠️ Accès suspects détectés</div>
                {analytics.alertes_acces_suspects.map((a: any, i: number) => (
                  <div key={i} style={{fontSize:13,color:'#92400e'}}>Utilisateur #{a.actor_id} : {a.nb_acces} dossiers consultés aujourd'hui</div>
                ))}
              </div>
            )}

            {/* KPIs */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
              {[
                {icon:'💰',label:'Revenus du mois',val:`${analytics?.revenus_mois?.toLocaleString('fr-FR') || 0} HTG`,bg:'#f0fdf4',c:'#16a34a'},
                {icon:'👤',label:'Nouveaux patients',val:analytics?.nouveaux_patients || 0,bg:'#eff6ff',c:'#1641C8'},
                {icon:'⏳',label:'Comptes en attente',val:analytics?.comptes_en_attente || 0,bg:'#fef2f2',c:'#dc2626'},
                {icon:'👥',label:'Total utilisateurs',val:users.length,bg:'#f5f3ff',c:'#7c3aed'},
              ].map(s => (
                <div key={s.label} style={{background:s.bg,borderRadius:16,padding:20,border:'1px solid #e2e8f0'}}>
                  <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
                  <div style={{fontWeight:900,fontSize:'1.4rem',color:s.c}}>{s.val}</div>
                  <div style={{color:'#64748b',fontSize:12,marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Services les plus demandés */}
            {analytics?.dossiers_par_specialite?.length > 0 && (
              <div style={{background:'white',borderRadius:16,padding:22,border:'1px solid #e2e8f0'}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:16,color:'#0f172a'}}>📊 Dossiers par spécialité (30 jours)</h3>
                {analytics.dossiers_par_specialite.sort((a: any,b: any)=>b.count-a.count).map((d: any, i: number) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                    <div style={{width:160,fontSize:13,color:'#374151'}}>{d.specialite}</div>
                    <div style={{flex:1,background:'#f1f5f9',borderRadius:4,height:14,overflow:'hidden'}}>
                      <div style={{height:'100%',background:'#1641C8',borderRadius:4,width:`${Math.min(100, (d.count/Math.max(...analytics.dossiers_par_specialite.map((x: any)=>x.count)))*100)}%`}} />
                    </div>
                    <div style={{fontWeight:700,fontSize:13,color:'#1641C8',width:30}}>{d.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTIQUE IA ──────────────────────────────────────── */}
        {onglet==='analytics' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontWeight:900,fontSize:'1.3rem',color:'#0f172a',margin:0}}>🤖 Rapport IA de direction</h2>
              <button onClick={genererRapportIA} disabled={loadAI||!analytics} style={{background:'linear-gradient(135deg,#1641C8,#0d9488)',color:'white',border:'none',borderRadius:10,padding:'10px 20px',fontWeight:700,cursor:'pointer',fontSize:14}}>
                {loadAI ? '⏳ Génération...' : '🤖 Générer rapport IA'}
              </button>
            </div>

            {aiReport ? (
              <div style={{background:'white',borderRadius:16,padding:28,border:'1px solid #e2e8f0',marginBottom:20}}>
                <div style={{fontWeight:700,color:'#1641C8',marginBottom:12}}>📋 Rapport automatique IA</div>
                <div style={{fontSize:14,color:'#374151',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{aiReport}</div>
              </div>
            ) : (
              <div style={{background:'#f8fafc',borderRadius:16,padding:40,textAlign:'center',border:'1px dashed #e2e8f0',marginBottom:20}}>
                <TrendingUp size={40} color="#94a3b8" style={{marginBottom:12}}/>
                <p style={{color:'#64748b'}}>Cliquez sur "Générer rapport IA" pour obtenir une analyse automatique</p>
              </div>
            )}

            {/* Taux occupation */}
            {analytics?.taux_occupation_semaine?.length > 0 && (
              <div style={{background:'white',borderRadius:16,padding:22,border:'1px solid #e2e8f0'}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:16}}>📈 Occupation par service (7 jours)</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:12}}>
                  {analytics.taux_occupation_semaine.map((s: any, i: number) => (
                    <div key={i} style={{background:'#f8fafc',borderRadius:12,padding:16,textAlign:'center',border:'1px solid #e2e8f0'}}>
                      <div style={{fontWeight:900,fontSize:'1.5rem',color:'#1641C8'}}>{s.count}</div>
                      <div style={{fontSize:12,color:'#64748b',marginTop:4}}>{s.service}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── UTILISATEURS ───────────────────────────────────────── */}
        {onglet==='utilisateurs' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontWeight:900,fontSize:'1.3rem',color:'#0f172a',margin:0}}>Gestion des utilisateurs</h2>
              <Link href="/admin/utilisateurs" style={{background:'#1641C8',color:'white',textDecoration:'none',borderRadius:10,padding:'10px 18px',fontWeight:700,fontSize:13}}>
                + Créer compte personnel
              </Link>
            </div>

            {/* Comptes en attente */}
            {attente.length > 0 && (
              <div style={{marginBottom:24}}>
                <h3 style={{fontWeight:700,color:'#dc2626',marginBottom:12,fontSize:15}}>🔴 En attente de validation ({attente.length})</h3>
                {attente.map(u => (
                  <div key={u.id} style={{background:'white',borderRadius:14,padding:18,border:'2px solid #fca5a5',marginBottom:10,display:'flex',alignItems:'center',gap:14}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:'#0f172a'}}>{u.nom}</div>
                      <div style={{fontSize:13,color:'#64748b',fontFamily:'monospace'}}>{u.email}</div>
                      <span style={{background:`${ROLE_COLOR[u.role]||'#64748b'}20`,color:ROLE_COLOR[u.role]||'#64748b',borderRadius:50,padding:'2px 10px',fontSize:11,fontWeight:700}}>
                        {u.role}
                      </span>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>activerCompte(u.id)} style={{background:'#16a34a',color:'white',border:'none',borderRadius:8,padding:'8px 14px',fontWeight:700,cursor:'pointer',fontSize:13}}>
                        ✓ Activer
                      </button>
                      <button onClick={()=>rejeterCompte(u.id)} style={{background:'#dc2626',color:'white',border:'none',borderRadius:8,padding:'8px 14px',fontWeight:700,cursor:'pointer',fontSize:13}}>
                        ✗ Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tous les utilisateurs */}
            <div style={{background:'white',borderRadius:16,border:'1px solid #e2e8f0',overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{background:'#f8fafc',borderBottom:'1px solid #e2e8f0'}}>
                    {['Nom','Email','Rôle','Statut','Action'].map(h => (
                      <th key={h} style={{padding:'12px 16px',textAlign:'left',color:'#64748b',fontWeight:600,fontSize:12}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{borderBottom:'1px solid #f8fafc'}}>
                      <td style={{padding:'11px 16px',fontWeight:700,color:'#0f172a'}}>{u.nom}</td>
                      <td style={{padding:'11px 16px',fontFamily:'monospace',fontSize:12,color:'#64748b'}}>{u.email}</td>
                      <td style={{padding:'11px 16px'}}>
                        <span style={{background:`${ROLE_COLOR[u.role]||'#64748b'}15`,color:ROLE_COLOR[u.role]||'#64748b',borderRadius:50,padding:'3px 10px',fontSize:11,fontWeight:700}}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{padding:'11px 16px'}}>
                        <span style={{background:u.is_active?'#f0fdf4':'#fef2f2',color:u.is_active?'#16a34a':'#dc2626',borderRadius:50,padding:'3px 10px',fontSize:11,fontWeight:700}}>
                          {u.is_active?'Actif':'Inactif'}
                        </span>
                      </td>
                      <td style={{padding:'11px 16px'}}>
                        {u.role!=='admin' && (
                          <button onClick={()=>suspendre(u)} style={{background:u.is_active?'#fef2f2':'#f0fdf4',color:u.is_active?'#dc2626':'#16a34a',border:'none',borderRadius:8,padding:'6px 12px',fontWeight:700,cursor:'pointer',fontSize:12}}>
                            {u.is_active?'Suspendre':'Réactiver'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── JOURNAL AUDIT ──────────────────────────────────────── */}
        {onglet==='audit' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontWeight:900,fontSize:'1.3rem',color:'#0f172a',margin:0}}>Journal d'Audit</h2>
              <Link href="/admin/audit" style={{color:'#1641C8',fontWeight:700,fontSize:13,textDecoration:'none'}}>
                Voir journal complet →
              </Link>
            </div>
            <div style={{background:'white',borderRadius:16,border:'1px solid #e2e8f0',overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead>
                  <tr style={{background:'#f8fafc',borderBottom:'1px solid #e2e8f0'}}>
                    {['Événement','Acteur','Cible','Résultat','Date/Heure','IP'].map(h=>(
                      <th key={h} style={{padding:'10px 14px',textAlign:'left',color:'#64748b',fontWeight:600}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice(0,30).map((log: any, i: number) => (
                    <tr key={i} style={{borderBottom:'1px solid #f8fafc'}}>
                      <td style={{padding:'9px 14px',fontWeight:600,color:log.result==='echec'?'#dc2626':'#374151'}}>{log.event_type}</td>
                      <td style={{padding:'9px 14px',color:'#64748b'}}>#{log.actor_id} ({log.actor_role})</td>
                      <td style={{padding:'9px 14px',color:'#64748b',fontFamily:'monospace'}}>{log.target_id}</td>
                      <td style={{padding:'9px 14px'}}>
                        <span style={{background:log.result==='succes'?'#f0fdf4':'#fef2f2',color:log.result==='succes'?'#16a34a':'#dc2626',borderRadius:50,padding:'2px 8px',fontSize:11,fontWeight:700}}>
                          {log.result}
                        </span>
                      </td>
                      <td style={{padding:'9px 14px',color:'#94a3b8',whiteSpace:'nowrap'}}>{new Date(log.timestamp).toLocaleString('fr-FR')}</td>
                      <td style={{padding:'9px 14px',color:'#94a3b8',fontFamily:'monospace'}}>{log.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditLogs.length === 0 && (
                <div style={{padding:32,textAlign:'center',color:'#94a3b8'}}>Aucun log disponible</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
