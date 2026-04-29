'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { UserCheck, UserX, Trash2, RefreshCw } from 'lucide-react'

const ROLE_COLORS: Record<string, string> = {
  admin: 'badge-purple', medecin: 'badge-green', patient: 'badge-blue',
  caissier: 'badge-yellow', labo: 'badge-blue', pharmacie: 'badge-orange',
}
const ROLES = ['patient','medecin','caissier','labo','pharmacie','admin']

export default function AdminUtilisateurs() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'tous'|'actif'|'inactif'>('tous')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const activate = async (id: number, nom: string) => {
    try {
      await api.put(`/admin/users/${id}/activate`)
      toast.success(`✅ ${nom} activé`)
      load()
    } catch { toast.error('Erreur') }
  }

  const deactivate = async (id: number, nom: string) => {
    try {
      await api.put(`/admin/users/${id}/deactivate`)
      toast.success(`⛔ ${nom} désactivé`)
      load()
    } catch { toast.error('Erreur') }
  }

  const deleteUser = async (id: number, nom: string) => {
    if (!confirm(`Supprimer le compte de ${nom} ?`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success(`Compte supprimé`)
      load()
    } catch { toast.error('Erreur') }
  }

  const changeRole = async (id: number, role: string) => {
    try {
      await api.put(`/admin/users/${id}/role?role=${role}`)
      toast.success(`Rôle mis à jour`)
      load()
    } catch { toast.error('Erreur') }
  }

  const filtered = users.filter(u => {
    if (filter === 'actif') return u.is_active
    if (filter === 'inactif') return !u.is_active
    return true
  })

  const pending = users.filter(u => !u.is_active).length

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Gestion des utilisateurs</h1>
          <p className="text-slate-500 text-[13px] mt-0.5">Validation, activation et gestion des rôles</p>
        </div>
        <button onClick={load} className="btn-ghost"><RefreshCw size={14} /> Actualiser</button>
      </div>

      {pending > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-5 flex items-center gap-3">
          <i className="fa-solid fa-clock text-amber-500 text-lg" />
          <div>
            <div className="font-bold text-amber-800">{pending} compte{pending > 1 ? 's' : ''} en attente de validation</div>
            <div className="text-amber-600 text-xs mt-0.5">Ces utilisateurs ne peuvent pas se connecter tant que vous ne les avez pas activés.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="kpi-card"><div className="text-2xl font-black text-[#1641C8] mb-1">{users.length}</div><div className="text-xs text-slate-500 font-semibold">Total comptes</div></div>
        <div className="kpi-card"><div className="text-2xl font-black text-green-600 mb-1">{users.filter(u=>u.is_active).length}</div><div className="text-xs text-slate-500 font-semibold">Comptes actifs</div></div>
        <div className="kpi-card"><div className="text-2xl font-black text-amber-500 mb-1">{pending}</div><div className="text-xs text-slate-500 font-semibold">En attente</div></div>
        <div className="kpi-card"><div className="text-2xl font-black text-slate-700 mb-1">{users.filter(u=>u.role==='patient').length}</div><div className="text-xs text-slate-500 font-semibold">Patients</div></div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['tous','inactif','actif'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-bold border cursor-pointer transition-all
            ${filter === f ? 'bg-[#1641C8] text-white border-[#1641C8]' : 'bg-white text-slate-500 border-slate-200'}`}>
            {f === 'tous' ? 'Tous' : f === 'inactif' ? '⏳ En attente' : '✅ Actifs'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="tbl w-full">
          <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Date création</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"/></td></tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td className="font-semibold text-[13px]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-[#1641C8] flex items-center justify-center text-xs font-bold">
                      {u.nom?.[0]?.toUpperCase()}
                    </div>
                    {u.nom}
                  </div>
                </td>
                <td className="text-[12.5px] text-slate-500">{u.email}</td>
                <td>
                  <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                    className="text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white cursor-pointer">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td>
                  <span className={`badge ${u.is_active ? 'badge-green' : 'badge-yellow'}`}>
                    {u.is_active ? '✓ Actif' : '⏳ En attente'}
                  </span>
                </td>
                <td className="text-[12px] text-slate-400">
                  {new Date(u.created_at).toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit', year:'numeric'})}
                </td>
                <td>
                  <div className="flex gap-1.5">
                    {!u.is_active ? (
                      <button onClick={() => activate(u.id, u.nom)}
                        className="flex items-center gap-1 text-xs bg-green-100 text-green-700 border-none px-2.5 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-green-200 transition-all">
                        <UserCheck size={12} /> Activer
                      </button>
                    ) : (
                      <button onClick={() => deactivate(u.id, u.nom)}
                        className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 border-none px-2.5 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-slate-200 transition-all">
                        <UserX size={12} /> Désactiver
                      </button>
                    )}
                    {u.role !== 'admin' && (
                      <button onClick={() => deleteUser(u.id, u.nom)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 border-none cursor-pointer">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-400 py-8 text-sm">Aucun utilisateur</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
