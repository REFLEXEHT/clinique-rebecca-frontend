'use client'
import { useEffect, useState } from 'react'
import { patientsApi } from '@/lib/api'
import { Patient } from '@/types'

export default function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = (s?: string) => {
    setLoading(true)
    patientsApi.list(s).then((r) => setPatients(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    load(search)
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Patients</h1>
          <p className="text-gray-500 text-[13px] mt-0.5">Liste et dossiers patients enregistrés</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un patient..."
            className="input w-60"
          />
          <button type="submit" className="btn-blue py-2 px-4">
            <i className="fa-solid fa-magnifying-glass text-sm" />
          </button>
        </form>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <div className="text-[24px] font-black text-[#1a4fc4] mb-1">{patients.length}</div>
          <div className="text-[12px] text-gray-500 font-semibold">Patients affichés</div>
        </div>
        <div className="kpi-card">
          <div className="text-[24px] font-black text-[#5aaa28] mb-1">
            {patients.filter(p => {
              const d = new Date(p.created_at)
              const now = new Date()
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            }).length}
          </div>
          <div className="text-[12px] text-gray-500 font-semibold">Nouveaux ce mois</div>
        </div>
        <div className="kpi-card">
          <div className="text-[24px] font-black text-[#e07a00] mb-1">
            {patients.filter(p => p.email).length}
          </div>
          <div className="text-[12px] text-gray-500 font-semibold">Avec email</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h4 className="font-bold text-[13.5px] flex items-center gap-2">
            <i className="fa-solid fa-users text-[#1a4fc4] text-sm" />
            Patients enregistrés
          </h4>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <svg className="animate-spin h-6 w-6 mx-auto text-[#1a4fc4]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : (
          <table className="w-full tbl">
            <thead><tr>
              <th>ID</th><th>Nom</th><th>Téléphone</th><th>Email</th>
              <th>Enregistré le</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="badge badge-blue font-mono">{p.numero}</span>
                  </td>
                  <td>
                    <div className="font-bold text-[13px]">{p.nom}{p.prenom ? ` ${p.prenom}` : ''}</div>
                  </td>
                  <td>
                    {p.telephone ? (
                      <a
                        href={`https://wa.me/${p.telephone.replace(/\D/g, '')}`}
                        target="_blank"
                        className="text-[#1a4fc4] font-semibold text-[12.5px] hover:underline flex items-center gap-1"
                      >
                        <i className="fa-brands fa-whatsapp text-[#25D366]" />
                        {p.telephone}
                      </a>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="text-[12.5px] text-gray-500">{p.email || '—'}</td>
                  <td className="text-[12px] text-gray-400">{fmtDate(p.created_at)}</td>
                  <td>
                    <button className="text-[12px] text-[#1a4fc4] hover:underline font-semibold">
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-10 text-[13px]">
                    <i className="fa-solid fa-users text-3xl mb-2 block opacity-20" />
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
