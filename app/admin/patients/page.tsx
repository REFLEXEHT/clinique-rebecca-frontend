'use client'
// app/admin/patients/page.tsx
import { useEffect, useState } from 'react'
import { patientsApi } from '@/lib/api'
import { Patient } from '@/types'

export default function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)

  const load = (s?: string) => {
    setLoading(true)
    patientsApi.list(s)
      .then(r => setPatients(r.data))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const fmtDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'

  const demoPatients = [
    { id:1, numero:'#RB-001', nom:'Théodore', prenom:'Marie', telephone:'+509 3456-7890', email:'marie@gmail.com', adresse:null, created_at: "2026-04-26T12:00:00.000Z" },
    { id:2, numero:'#RB-002', nom:'Jean-Baptiste', prenom:'Paul', telephone:'+509 3789-0123', email:null, adresse:null, created_at: "2026-04-26T12:00:00.000Z" },
    { id:3, numero:'#RB-003', nom:'Pierre', prenom:'Lucie', telephone:'+509 3123-4567', email:'lucie@gmail.com', adresse:null, created_at: "2026-04-26T12:00:00.000Z" },
  ]

  const displayPatients = patients.length > 0 ? patients : demoPatients

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Patients</h1>
          <p className="text-slate-500 text-[13px] mt-0.5">Dossiers et historique des patients</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); load(search) }} className="flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un patient..."
            className="input w-56"
          />
          <button type="submit" className="btn-primary py-2 px-4">
            <i className="fa-solid fa-magnifying-glass text-sm"/>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="kpi-card"><div className="text-2xl font-black text-[#1641C8] mb-1">{displayPatients.length}</div><div className="text-xs text-slate-500 font-semibold">Patients affichés</div></div>
        <div className="kpi-card"><div className="text-2xl font-black text-green-600 mb-1">{displayPatients.filter(p=>p.email).length}</div><div className="text-xs text-slate-500 font-semibold">Avec email</div></div>
        <div className="kpi-card"><div className="text-2xl font-black text-[#d97706] mb-1">{displayPatients.filter(p=>p.telephone).length}</div><div className="text-xs text-slate-500 font-semibold">Avec WhatsApp</div></div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <svg className="animate-spin h-6 w-6 mx-auto text-[#1641C8]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : (
          <table className="tbl w-full">
            <thead><tr><th>ID</th><th>Nom</th><th>Téléphone</th><th>Email</th><th>Enregistré le</th><th>Actions</th></tr></thead>
            <tbody>
              {displayPatients.map(p => (
                <tr key={p.id}>
                  <td><span className="badge badge-blue font-mono">{p.numero}</span></td>
                  <td>
                    <div className="font-bold text-[13px]">{p.prenom} {p.nom}</div>
                  </td>
                  <td>
                    {p.telephone ? (
                      <a href={`https://wa.me/${p.telephone.replace(/\D/g,'')}`}
                        target="_blank" rel="noreferrer"
                        className="text-[#1641C8] font-semibold text-[12.5px] hover:underline
                          no-underline flex items-center gap-1">
                        <i className="fa-brands fa-whatsapp text-green-500 text-sm"/>
                        {p.telephone}
                      </a>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="text-[12.5px] text-slate-500">{p.email || '—'}</td>
                  <td className="text-[12px] text-slate-400">{fmtDate(p.created_at)}</td>
                  <td>
                    <button className="text-[12px] text-[#1641C8] hover:underline font-semibold
                      bg-transparent border-none cursor-pointer">
                      Voir dossier
                    </button>
                  </td>
                </tr>
              ))}
              {displayPatients.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-10 text-sm">
                    <i className="fa-solid fa-users text-3xl mb-2 block opacity-20"/>
                    Aucun patient trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
