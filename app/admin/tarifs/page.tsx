'use client'
// app/admin/tarifs/page.tsx
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { tarifsApi } from '@/lib/api'
import { Tarif } from '@/types'

const TARIFS_DEFAULT: Tarif[] = [
  { id:1, service:'Consultation générale',         type_acte:'Consultation', prix_htg:1500, actif:true },
  { id:2, service:'Consultation spécialisée',      type_acte:'Consultation', prix_htg:2500, actif:true },
  { id:3, service:'Consultation en ligne (vidéo)', type_acte:'Consultation', prix_htg:2000, actif:true },
  { id:4, service:'Observation 24h',               type_acte:'Observation',  prix_htg:5000, actif:true },
  { id:5, service:'Geste médical simple',          type_acte:'Geste',        prix_htg:800,  actif:true },
  { id:6, service:'Intervention chirurgicale',     type_acte:'Intervention', prix_htg:25000,actif:true },
  { id:7, service:'Hospitalisation (par jour)',    type_acte:'Hospitalisation',prix_htg:8000,actif:true },
  { id:8, service:'Analyse de sang — Labo',        type_acte:'Laboratoire',  prix_htg:800,  actif:true },
  { id:9, service:'Radiographie',                  type_acte:'Laboratoire',  prix_htg:1200, actif:true },
  { id:10,service:'Consultation dentaire',         type_acte:'Consultation', prix_htg:1800, actif:true },
]

export default function AdminTarifs() {
  const [tarifs, setTarifs] = useState<Tarif[]>(TARIFS_DEFAULT)
  const [edited, setEdited] = useState<Record<number, number>>({})

  useEffect(() => {
    tarifsApi.list()
      .then(r => setTarifs(r.data))
      .catch(() => setTarifs(TARIFS_DEFAULT))
  }, [])

  const save = async (t: Tarif) => {
    const newPrix = edited[t.id] ?? t.prix_htg
    try {
      await tarifsApi.update(t.id, newPrix)
      setTarifs(prev => prev.map(x => x.id === t.id ? { ...x, prix_htg: newPrix } : x))
      toast.success(`Tarif "${t.service}" mis à jour`)
    } catch {
      toast.error('Erreur — modification locale uniquement')
      setTarifs(prev => prev.map(x => x.id === t.id ? { ...x, prix_htg: newPrix } : x))
      toast.success(`Tarif "${t.service}" mis à jour (local)`)
    }
  }

  const BADGE_MAP: Record<string, string> = {
    Consultation: 'badge-blue', Observation: 'badge-gray', Geste: 'badge-green',
    Intervention: 'badge-yellow', Hospitalisation: 'badge-red', Laboratoire: 'badge-orange',
  }

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold">Gestion des tarifs</h1>
        <p className="text-slate-500 text-[13px] mt-0.5">
          Modifier les prix des services et types d'actes médicaux
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h4 className="font-bold text-[13.5px] flex items-center gap-2">
            <i className="fa-solid fa-tag text-[#1641C8] text-sm" />
            Tarifs actuels (HTG)
          </h4>
        </div>
        <table className="tbl w-full">
          <thead><tr>
            <th>Service / Acte</th><th>Type</th><th>Prix actuel</th><th>Nouveau prix</th><th>Action</th>
          </tr></thead>
          <tbody>
            {tarifs.map(t => (
              <tr key={t.id}>
                <td className="font-semibold text-[13px]">{t.service}</td>
                <td><span className={`badge ${BADGE_MAP[t.type_acte] || 'badge-gray'}`}>{t.type_acte}</span></td>
                <td>
                  <span className="font-mono font-bold text-[13px]">
                    {t.prix_htg.toLocaleString('fr')} HTG
                  </span>
                </td>
                <td>
                  <input
                    type="number"
                    defaultValue={t.prix_htg}
                    min={0}
                    onChange={e => setEdited(prev => ({ ...prev, [t.id]: Number(e.target.value) }))}
                    className="input w-32 text-center font-mono"
                  />
                </td>
                <td>
                  <button
                    onClick={() => save(t)}
                    className="bg-[#1641C8] text-white border-none px-4 py-1.5 rounded-lg
                      text-xs font-bold cursor-pointer hover:bg-[#0f2fa3] transition-all">
                    Sauvegarder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-[#1641C8] font-semibold flex items-center gap-2">
          <i className="fa-solid fa-circle-info" />
          Les tarifs modifiés sont appliqués immédiatement pour les nouveaux rendez-vous.
          Les RDV existants conservent leur tarif original.
        </p>
      </div>
    </div>
  )
}
