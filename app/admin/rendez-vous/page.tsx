'use client'
import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { rdvApi } from '@/lib/api'
import { RendezVous, StatutRDV } from '@/types'

const STATUTS: Record<StatutRDV, { label: string; cls: string }> = {
  confirme:   { label: 'Confirmé',   cls: 'badge-green'  },
  en_attente: { label: 'En attente', cls: 'badge-yellow' },
  annule:     { label: 'Annulé',     cls: 'badge-red'    },
  termine:    { label: 'Terminé',    cls: 'badge-gray'   },
}

export default function AdminRdv() {
  const [rdvs, setRdvs]       = useState<RendezVous[]>([])
  const [filter, setFilter]   = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    rdvApi.adminList(filter ? { statut: filter } : {})
      .then(r  => setRdvs(r.data))
      .catch(() => setRdvs([]))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [load])

  const updateStatut = async (id: number, statut: string) => {
    try {
      await rdvApi.update(id, { statut })
      toast.success('Statut mis à jour')
      load()
    } catch { toast.error('Erreur de mise à jour') }
  }

  const cancel = async (id: number) => {
    if (!confirm('Annuler ce RDV ?')) return
    try { await rdvApi.cancel(id); toast.success('RDV annulé'); load() }
    catch { toast.error('Erreur lors de l\'annulation') }
  }

  const fmt  = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const fmtH = (d: string) => new Date(d).toLocaleTimeString('fr',    { hour: '2-digit', minute: '2-digit' })

  // Données de démonstration si l'API n'est pas connectée
  const demoRdvs: RendezVous[] = [
    {
      id: 1, patient_nom: 'Marie Théodore', patient_telephone: '+509 3456-7890',
      patient_email: 'marie@gmail.com', specialite: 'Gynécologie',
      date_rdv: new Date().toISOString(), type_rdv: 'presentiel', statut: 'confirme',
      motif: 'Suivi grossesse', notes_admin: null, mode_paiement: 'À la clinique',
      rappel_envoye: false, created_at: new Date().toISOString(),
    },
    {
      id: 2, patient_nom: 'Paul Jean-Baptiste', patient_telephone: '+509 3789-0123',
      patient_email: null, specialite: 'Orthopédie',
      date_rdv: new Date().toISOString(), type_rdv: 'video', statut: 'en_attente',
      motif: 'Douleur genou', notes_admin: null, mode_paiement: 'Moncash',
      rappel_envoye: false, created_at: new Date().toISOString(),
    },
  ]

  const displayRdvs = rdvs.length > 0 ? rdvs : demoRdvs

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Rendez-vous</h1>
          <p className="text-slate-500 text-[13px] mt-0.5">Gestion complète des consultations</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['', 'en_attente', 'confirme', 'annule', 'termine'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all cursor-pointer
              ${filter === s
                ? 'bg-[#1641C8] text-white border-[#1641C8]'
                : 'bg-white text-slate-500 border-slate-200 hover:border-[#1641C8]'}`}
            >
              {s === '' ? 'Tous' : STATUTS[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Aujourd'hui", val: displayRdvs.filter(r => new Date(r.date_rdv).toDateString() === new Date().toDateString()).length, color: '#1641C8' },
          { label: 'Total affiché',  val: displayRdvs.length, color: '#22c55e' },
          { label: 'En attente',     val: displayRdvs.filter(r => r.statut === 'en_attente').length, color: '#d97706' },
          { label: 'Confirmés',      val: displayRdvs.filter(r => r.statut === 'confirme').length, color: '#22c55e' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="text-2xl font-black mb-1" style={{ color: k.color }}>{k.val}</div>
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <svg className="animate-spin h-6 w-6 mx-auto text-[#1641C8]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <table className="tbl w-full">
            <thead>
              <tr>
                <th>Date / Heure</th>
                <th>Patient</th>
                <th>WhatsApp</th>
                <th>Spécialité</th>
                <th>Type</th>
                <th>Paiement</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayRdvs.map(rdv => {
                const s = STATUTS[rdv.statut] || STATUTS.en_attente
                return (
                  <tr key={rdv.id}>
                    <td>
                      <div className="font-bold text-[13px]">{fmt(rdv.date_rdv)}</div>
                      <div className="text-slate-400 text-xs">{fmtH(rdv.date_rdv)}</div>
                    </td>
                    <td>
                      <div className="font-bold text-[13px]">{rdv.patient_nom}</div>
                      {rdv.patient_email && <div className="text-slate-400 text-xs">{rdv.patient_email}</div>}
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/${rdv.patient_telephone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1641C8] font-semibold text-[12.5px] hover:underline no-underline"
                      >
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
                    <td className="text-[12px] text-slate-500">{rdv.mode_paiement || '—'}</td>
                    <td>
                      <select
                        value={rdv.statut}
                        onChange={e => updateStatut(rdv.id, e.target.value)}
                        className={`text-[12px] font-bold px-2 py-1 rounded-lg border-none outline-none cursor-pointer
                          ${rdv.statut === 'confirme'   ? 'bg-green-100 text-green-700'
                          : rdv.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-700'
                          : rdv.statut === 'annule'     ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'}`}
                      >
                        <option value="en_attente">En attente</option>
                        <option value="confirme">Confirmé</option>
                        <option value="termine">Terminé</option>
                        <option value="annule">Annulé</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => cancel(rdv.id)}
                        className="text-[11.5px] text-red-400 hover:text-red-600 font-semibold transition-colors bg-transparent border-none cursor-pointer"
                      >
                        Annuler
                      </button>
                    </td>
                  </tr>
                )
              })}
              {displayRdvs.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 py-10 text-sm">
                    Aucun rendez-vous
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
