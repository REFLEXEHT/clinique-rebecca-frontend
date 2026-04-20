'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { horairesApi } from '@/lib/api'
import { Horaire } from '@/types'

export default function AdminHoraires() {
  const [horaires, setHoraires] = useState<Horaire[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    horairesApi.list().then((r) => setHoraires(r.data))
  }, [])

  const update = (jour: string, field: keyof Horaire, value: any) => {
    setHoraires((prev) => prev.map((h) => h.jour === jour ? { ...h, [field]: value } : h))
  }

  const save = async () => {
    setSaving(true)
    try {
      await Promise.all(
        horaires.map((h) => horairesApi.update(h.jour, {
          ouvert: h.ouvert,
          heure_ouverture: h.heure_ouverture,
          heure_fermeture: h.heure_fermeture,
        }))
      )
      toast.success('Horaires mis à jour sur le site public ✅')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold">Gestion des horaires</h1>
        <p className="text-gray-500 text-[13px] mt-0.5">
          Configurer les horaires affichés sur le site — mis à jour en temps réel
        </p>
      </div>

      <div className="card p-6 max-w-[540px]">
        <h3 className="font-extrabold text-[15px] mb-5 flex items-center gap-2">
          <i className="fa-solid fa-clock text-[#1a4fc4]" />
          Horaires par jour
        </h3>

        <div className="space-y-3">
          {horaires.map((h) => (
            <div key={h.jour} className="grid grid-cols-[100px_auto_1fr_auto_1fr] items-center gap-3
              pb-3 border-b border-gray-100 last:border-b-0">

              <span className="font-bold text-[13.5px]">{h.jour}</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={h.ouvert}
                    onChange={(e) => update(h.jour, 'ouvert', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 rounded-full transition-colors ${h.ouvert ? 'bg-[#5aaa28]' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform
                      ${h.ouvert ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </div>
                <span className={`text-[12px] font-bold ${h.ouvert ? 'text-[#5aaa28]' : 'text-gray-400'}`}>
                  {h.ouvert ? 'Ouvert' : 'Fermé'}
                </span>
              </label>

              <input
                type="time"
                value={h.heure_ouverture}
                disabled={!h.ouvert}
                onChange={(e) => update(h.jour, 'heure_ouverture', e.target.value)}
                className={`input text-center ${!h.ouvert ? 'opacity-40 cursor-not-allowed' : ''}`}
              />

              <span className="text-gray-400 text-center">—</span>

              <input
                type="time"
                value={h.heure_fermeture}
                disabled={!h.ouvert}
                onChange={(e) => update(h.jour, 'heure_fermeture', e.target.value)}
                className={`input text-center ${!h.ouvert ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            </div>
          ))}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="btn-primary w-full justify-center py-3 mt-5"
        >
          <i className="fa-solid fa-save" />
          {saving ? 'Enregistrement...' : 'Enregistrer les horaires'}
        </button>
      </div>
    </div>
  )
}
