'use client'
// app/admin/horaires/page.tsx
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { horairesApi } from '@/lib/api'
import { Horaire } from '@/types'

const DEFAULT_HORAIRES: Horaire[] = [
 { id:1, jour:'Lundi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'17:00' },
 { id:2, jour:'Mardi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'17:00' },
 { id:3, jour:'Mercredi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'17:00' },
 { id:4, jour:'Jeudi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'17:00' },
 { id:5, jour:'Vendredi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'17:00' },
 { id:6, jour:'Samedi', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'17:00' },
 { id:7, jour:'Dimanche', ouvert:true, heure_ouverture:'07:00', heure_fermeture:'15:00' },
]

export default function AdminHoraires() {
 const [horaires, setHoraires] = useState<Horaire[]>(DEFAULT_HORAIRES)
 const [saving, setSaving] = useState(false)

 useEffect(() => {
 horairesApi.list()
 .then(r => setHoraires(r.data))
 .catch(() => setHoraires(DEFAULT_HORAIRES))
 }, [])

 const update = (jour: string, field: keyof Horaire, value: any) => {
 setHoraires(prev => prev.map(h => h.jour === jour ? { ...h, [field]: value } : h))
 }

 const save = async () => {
 setSaving(true)
 try {
 await Promise.all(
 horaires.map(h => horairesApi.update(h.jour, {
 ouvert: h.ouvert,
 heure_ouverture: h.heure_ouverture,
 heure_fermeture: h.heure_fermeture,
 }))
 )
 toast.success('Horaires mis à jour sur le site public ')
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
 <p className="text-slate-500 text-[13px] mt-0.5">
 Configurer les horaires affichés sur le site — mis à jour en temps réel
 </p>
 </div>

 <div className="card p-6 max-w-[540px]">
 <h3 className="font-extrabold text-[15px] mb-5 flex items-center gap-2">
 <i className="fa-solid fa-clock text-[#1641C8]" />
 Horaires par jour
 </h3>

 <div className="space-y-4">
 {horaires.map(h => (
 <div key={h.jour} className="flex items-center gap-3 pb-4
 border-b border-slate-100 last:border-b-0 last:pb-0">
 <span className="w-[90px] font-bold text-[13.5px] flex-shrink-0">{h.jour}</span>

 {/* Toggle ouvert/fermé */}
 <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
 <div className="relative">
 <input
 type="checkbox"
 checked={h.ouvert}
 onChange={e => update(h.jour, 'ouvert', e.target.checked)}
 className="sr-only"
 />
 <div className={`w-9 h-5 rounded-full transition-colors duration-200
 ${h.ouvert ? 'bg-green-500' : 'bg-slate-300'}`}>
 <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow
 transition-transform duration-200
 ${h.ouvert ? 'translate-x-4' : 'translate-x-0.5'}`} />
 </div>
 </div>
 <span className={`text-[12px] font-bold ${h.ouvert ? 'text-green-600' : 'text-slate-400'}`}>
 {h.ouvert ? 'Ouvert' : 'Fermé'}
 </span>
 </label>

 <input
 type="time"
 value={h.heure_ouverture}
 disabled={!h.ouvert}
 onChange={e => update(h.jour, 'heure_ouverture', e.target.value)}
 className={`input w-28 text-center ${!h.ouvert ? 'opacity-40 cursor-not-allowed' : ''}`}
 />
 <span className="text-slate-400">—</span>
 <input
 type="time"
 value={h.heure_fermeture}
 disabled={!h.ouvert}
 onChange={e => update(h.jour, 'heure_fermeture', e.target.value)}
 className={`input w-28 text-center ${!h.ouvert ? 'opacity-40 cursor-not-allowed' : ''}`}
 />
 </div>
 ))}
 </div>

 <button
 onClick={save}
 disabled={saving}
 className="btn-primary w-full justify-center mt-6">
 {saving ? (
 <span className="flex items-center gap-2">
 <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
 </svg>
 Enregistrement...
 </span>
 ) : (
 <><i className="fa-solid fa-save" /> Enregistrer les horaires</>
 )}
 </button>
 </div>
 </div>
 )
}
