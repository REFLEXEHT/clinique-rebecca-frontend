'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { rdvApi } from '@/lib/api'
import { RendezVous } from '@/types'

const STATUT_BADGE: Record<string, string> = {
  confirme: 'badge-green', en_attente: 'badge-yellow', annule: 'badge-red', termine: 'badge-gray',
}
const STATUT_LABEL: Record<string, string> = {
  confirme: 'Confirmé', en_attente: 'En attente', annule: 'Annulé', termine: 'Terminé',
}

export default function AdminRdv() {
  const [rdvs, setRdvs] = useState<RendezVous[]>([])
  const [filterStatut, setFilterStatut] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    rdvApi.adminList(filterStatut ? { statut: filterStatut } : {})
      .then((r) => setRdvs(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterStatut])

  const updateStatut = async (id: number, statut: string) => {
    try {
      await rdvApi.update(id, { statut })
      toast.success('Statut mis à jour')
      load()
    } catch { toast.error('Erreur') }
  }

  const cancel = async (id: number) => {
    if (!confirm('Annuler ce RDV ?')) return
    try { await rdvApi.cancel(id); toast.success('RDV annulé'); load() }
    catch { toast.error('Erreur') }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Rendez-vous</h1>
          <p className="text-gray-500 text-[13px] mt-0.5">Gestion complète des consultations</p>
        </div>
        <div className="flex gap-2">
          {['', 'en_attente', 'confirme', 'annule', 'termine'].map((s) => (
            <button key={s} onClick={() => setFilterStatut(s)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all
              ${filterStatut === s ? 'bg-[#1a4fc4] text-white border-[#1a4fc4]' : 'bg-white text-gray-500 border-gray-200'}`}>
              {s === '' ? 'Tous' : STATUT_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Aujourd'hui", val: rdvs.filter(r => fmtDate(r.date_rdv) === fmtDate(new Date().toISOString())).length, col: '#1a4fc4' },
          { label: 'Total', val: rdvs.length, col: '#5aaa28' },
          { label: 'En attente', val: rdvs.filter(r => r.statut === 'en_attente').length, col: '#e07a00' },
          { label: 'Confirmés', val: rdvs.filter(r => r.statut === 'confirme').length, col: '#5aaa28' },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="text-[24px] font-black mb-1" style={{ color: k.col }}>{k.val}</div>
            <div className="text-[12px] text-gray-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-[#1a4fc4]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Chargement...
          </div>
        ) : (
          <table className="w-full tbl">
            <thead><tr>
              <th>Date & Heure</th><th>Patient</th><th>WhatsApp</th>
              <th>Spécialité</th><th>Type</th><th>Statut</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {rdvs.map((rdv) => (
                <tr key={rdv.id}>
                  <td>
                    <div className="font-bold text-[13px]">{fmtDate(rdv.date_rdv)}</div>
                    <div className="text-gray-400 text-xs">{fmtTime(rdv.date_rdv)}</div>
                  </td>
                  <td>
                    <div className="font-bold text-[13px]">{rdv.patient_nom}</div>
                    {rdv.patient_email && <div className="text-gray-400 text-xs">{rdv.patient_email}</div>}
                  </td>
                  <td className="text-[12.5px] text-[#1a4fc4] font-semibold">
                    <a href={`https://wa.me/${rdv.patient_telephone.replace(/\D/g,'')}`} target="_blank">
                      {rdv.patient_telephone}
                    </a>
                  </td>
                  <td className="text-[13px]">{rdv.specialite}</td>
                  <td>
                    <span className={`badge ${rdv.type_rdv === 'video' ? 'badge-blue' : 'badge-gray'}`}>
                      <i className={`fa-solid ${rdv.type_rdv === 'video' ? 'fa-video' : 'fa-user'} text-xs`} />
                      {rdv.type_rdv === 'video' ? 'Vidéo' : 'Présentiel'}
                    </span>
                  </td>
                  <td>
                    <select
                      value={rdv.statut}
                      onChange={(e) => updateStatut(rdv.id, e.target.value)}
                      className={`text-[12px] font-bold px-2 py-1 rounded-lg border-none outline-none cursor-pointer
                      ${rdv.statut === 'confirme' ? 'bg-green-100 text-green-700'
                        : rdv.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-700'
                        : rdv.statut === 'annule' ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'}`}
                    >
                      <option value="en_attente">En attente</option>
                      <option value="confirme">Confirmé</option>
                      <option value="termine">Terminé</option>
                      <option value="annule">Annulé</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => cancel(rdv.id)}
                      className="text-[11.5px] text-red-400 hover:text-red-600 font-semibold transition-colors">
                      Annuler
                    </button>
                  </td>
                </tr>
              ))}
              {rdvs.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8 text-[13px]">Aucun rendez-vous</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
