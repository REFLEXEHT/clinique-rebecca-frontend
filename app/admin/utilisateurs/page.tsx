'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { UserPlus, Users, Eye, EyeOff } from 'lucide-react'

const ROLES_PERSONNEL = [
 { value:'medecin',    label:'Médecin',         emoji:'' },
 { value:'caissier',   label:'Caissier(ère)',    emoji:'' },
 { value:'labo',       label:'Laboratoire',      emoji:'' },
 { value:'infirmier',  label:'Infirmier(ère)',   emoji:'' },
 { value:'pharmacie',  label:'Pharmacie',        emoji:'' },
 { value:'dentiste',   label:'Dentiste',         emoji:'' },
 { value:'physio',     label:'Physiothérapeute', emoji:'' },
 { value:'optometrie', label:'Optométriste',     emoji:'' },
 { value:'admin',      label:'Administrateur',   emoji:'' },
],
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { UserPlus, Users, Eye, EyeOff } from 'lucide-react'

const ROLES_PERSONNEL = [
 { value:'medecin', label:'Médecin', emoji:'' },
 { value:'caissier', label:'Caissier(ère)', emoji:'' },
 { value:'labo', label:'Laboratoire', emoji:'' },
 { value:'infirmier', label:'Infirmier(ère)', emoji:'' },
 { value:'pharmacie', label:'Pharmacie', emoji:'' },
 { value:'admin', label:'Administrateur', emoji:'️' },
]

interface User { id: number; nom: string; email: string; role: string; is_active: boolean; created_at: string }

export default function AdminUtilisateurs() {
 const [users, setUsers] = useState<User[]>([])
 const [showForm, setShowForm] = useState(false)
 const [showPwd, setShowPwd] = useState(false)
 const [loading, setLoading] = useState(false)
 const [form, setForm] = useState({ nom:'', prenom:'', role:'medecin', specialite:'', telephone:'', password:'clinique2026' })

 const load = () => {
 api.get('/admin/users').then(r => setUsers(r.data || [])).catch(() => {})
 }
 useEffect(() => { load() }, [])

 const emailGenere = form.nom && form.prenom
 ? `${form.prenom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'')}.${form.nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'')}@cliniquerebecca.ht`
 : ''

 const creer = async () => {
 if (!form.nom || !form.prenom) { toast.error('Nom et prénom requis'); return }
 setLoading(true)
 try {
 await api.post('/admin/creer-compte-personnel', {
 email: emailGenere, nom: `${form.prenom} ${form.nom}`,
 role: form.role, specialite: form.specialite,
 telephone: form.telephone, password: form.password,
 })
 toast.success(`Compte créé : ${emailGenere} `)
 setForm({ nom:'', prenom:'', role:'medecin', specialite:'', telephone:'', password:'clinique2026' })
 setShowForm(false); load()
 } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur') }
 finally { setLoading(false) }
 }

 const toggleActive = async (u: User) => {
 try {
 await api.put(`/admin/users/${u.id}/${u.is_active ? 'suspendre' : 'reactiver'}`, {})
 toast.success(u.is_active ? `${u.nom} suspendu` : `${u.nom} réactivé`)
 load()
 } catch { toast.error('Erreur') }
 }

 const inp = (key: string, ph: string, type='text') => (
 <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))}
 placeholder={ph} style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, boxSizing:'border-box' as const }} />
 )

 const ROLE_COLORS: Record<string,string> = { admin:'#6366f1', medecin:'#0d9488', caissier:'#d97706', labo:'#16a34a', infirmier:'#0d9488', pharmacie:'#dc2626', patient:'#1641C8' }

 return (
 <div style={{ padding:28, maxWidth:1000, margin:'0 auto' }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
 <div>
 <h1 style={{ fontWeight:900, fontSize:'1.4rem', color:'#0f172a', margin:0, display:'flex', alignItems:'center', gap:10 }}>
 <Users size={22} color="#1641C8" /> Gestion des utilisateurs
 </h1>
 <p style={{ color:'#64748b', margin:'4px 0 0', fontSize:13 }}>
 Personnel : email @cliniquerebecca.ht · Patients : email personnel uniquement
 </p>
 </div>
 <button onClick={() => setShowForm(!showForm)} style={{
 background: showForm ? '#f1f5f9' : 'linear-gradient(135deg,#1641C8,#0d9488)',
 color: showForm ? '#374151' : 'white', border:'none', borderRadius:12,
 padding:'10px 20px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8
 }}>
 <UserPlus size={14} /> {showForm ? 'Fermer' : 'Nouveau compte personnel'}
 </button>
 </div>

 {/* Règle de séparation */}
 <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#1e40af' }}>
 <strong>Règle d'intégrité :</strong> Le personnel utilise <strong>prenom.nom@cliniquerebecca.ht</strong> pour séparer leur travail de leur vie personnelle. Les patients s'inscrivent avec leur email personnel pour protéger la confidentialité de leurs données de santé.
 </div>

 {/* Formulaire création compte personnel */}
 {showForm && (
 <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:24, marginBottom:20 }}>
 <h3 style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:16 }}>Créer un compte personnel</h3>
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
 <div>
 <label style={{ display:'block', fontWeight:600, fontSize:12, color:'#374151', marginBottom:5 }}>Prénom *</label>
 {inp('prenom','Prénom')}
 </div>
 <div>
 <label style={{ display:'block', fontWeight:600, fontSize:12, color:'#374151', marginBottom:5 }}>Nom *</label>
 {inp('nom','NOM')}
 </div>
 <div>
 <label style={{ display:'block', fontWeight:600, fontSize:12, color:'#374151', marginBottom:5 }}>Rôle *</label>
 <select value={form.role} onChange={e => setForm(p => ({...p, role:e.target.value}))}
 style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13 }}>
 {ROLES_PERSONNEL.map(r => <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>)}
 </select>
 </div>
 <div>
 <label style={{ display:'block', fontWeight:600, fontSize:12, color:'#374151', marginBottom:5 }}>Spécialité (médecin)</label>
 {inp('specialite','Ex: Gynécologie')}
 </div>
 <div>
 <label style={{ display:'block', fontWeight:600, fontSize:12, color:'#374151', marginBottom:5 }}>Téléphone</label>
 {inp('telephone','+509 xxxx-xxxx')}
 </div>
 <div>
 <label style={{ display:'block', fontWeight:600, fontSize:12, color:'#374151', marginBottom:5 }}>Mot de passe initial</label>
 <div style={{ position:'relative' }}>
 <input type={showPwd ? 'text' : 'password'} value={form.password}
 onChange={e => setForm(p => ({...p, password:e.target.value}))}
 style={{ width:'100%', padding:'10px 40px 10px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, boxSizing:'border-box' as const }} />
 <button type="button" onClick={() => setShowPwd(!showPwd)}
 style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
 {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
 </button>
 </div>
 </div>
 </div>

 {emailGenere && (
 <div style={{ background:'#f0fdf4', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:13 }}>
 <span style={{ fontWeight:600, color:'#166534' }}>Email généré automatiquement : </span>
 <span style={{ fontFamily:'monospace', color:'#16a34a', fontWeight:700 }}>{emailGenere}</span>
 </div>
 )}

 <button onClick={creer} disabled={loading || !emailGenere} style={{
 background:'linear-gradient(135deg,#1641C8,#0d9488)', color:'white', border:'none',
 borderRadius:10, padding:'11px 24px', fontWeight:700, cursor:'pointer', fontSize:14,
 opacity: !emailGenere ? 0.5 : 1
 }}>
 {loading ? 'Création...' : ` Créer le compte ${emailGenere}`}
 </button>
 </div>
 )}

 {/* Liste utilisateurs */}
 <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', overflow:'hidden' }}>
 <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
 <thead>
 <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
 {['Nom','Email','Rôle','Statut','Action'].map(h => (
 <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:12 }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {users.map(u => (
 <tr key={u.id} style={{ borderBottom:'1px solid #f8fafc' }}>
 <td style={{ padding:'11px 16px', fontWeight:700, color:'#0f172a' }}>{u.nom}</td>
 <td style={{ padding:'11px 16px', fontFamily:'monospace', fontSize:12, color:'#64748b' }}>{u.email}</td>
 <td style={{ padding:'11px 16px' }}>
 <span style={{ background:`${ROLE_COLORS[u.role] || '#64748b'}15`, color:ROLE_COLORS[u.role] || '#64748b', borderRadius:50, padding:'3px 10px', fontSize:11, fontWeight:700 }}>
 {ROLES_PERSONNEL.find(r=>r.value===u.role)?.emoji || ''} {u.role}
 </span>
 </td>
 <td style={{ padding:'11px 16px' }}>
 <span style={{ background:u.is_active ? '#f0fdf4' : '#fef2f2', color:u.is_active ? '#16a34a' : '#dc2626', borderRadius:50, padding:'3px 10px', fontSize:11, fontWeight:700 }}>
 {u.is_active ? 'Actif' : 'Suspendu'}
 </span>
 </td>
 <td style={{ padding:'11px 16px' }}>
 <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>
 {u.role !== 'admin' && (
  <button onClick={() => toggleActive(u)} style={{
  background: u.is_active ? '#fef2f2' : '#f0fdf4',
  color: u.is_active ? '#dc2626' : '#16a34a',
  border:'none', borderRadius:8, padding:'6px 12px', fontWeight:700, cursor:'pointer', fontSize:12
  }}>
  {u.is_active ? 'Suspendre' : 'Réactiver'}
  </button>
 )}
 <button onClick={async()=>{
  if(!confirm(`Réinitialiser le mot de passe de ${u.nom} ?`)) return
  try{
   const r=await api.post(`/admin/reset-password/${u.id}`,{})
   alert(`Mot de passe temporaire:\n${r.data.temp_password}\n\nL'utilisateur devra le changer à sa prochaine connexion.`)
  }catch(e:any){alert(e.response?.data?.detail||'Erreur')}
 }} style={{background:'#eff6ff',color:'#1641C8',border:'1px solid #bfdbfe',borderRadius:8,padding:'6px 12px',fontWeight:700,cursor:'pointer',fontSize:12}}>
  Reset MDP
 </button>
 </div>
 </td>
 </tr>
 ))}
 {users.length === 0 && (
 <tr><td colSpan={5} style={{ padding:32, textAlign:'center' as const, color:'#94a3b8' }}>Aucun utilisateur</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )
}
