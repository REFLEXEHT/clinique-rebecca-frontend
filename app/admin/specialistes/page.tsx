'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { specialistesApi } from '@/lib/api'
import { Specialiste } from '@/types'
import { Trash2 } from 'lucide-react'

const SPECIALITES = [
  'Chirurgie générale','Neurochirurgie','Neurologie','Orthopédie','Pédiatrie',
  'Dermatologie','Urologie','ORL','Gynécologie','Chirurgie pédiatrique',
  'Médecine interne','Ophtalmologie','Dentisterie','Physiothérapie','Optométrie',
]

const CATEGORIES = [
  { value: 'tous', label: 'Générale' },
  { value: 'chir', label: 'Chirurgie' },
  { value: 'neuro', label: 'Neurologie' },
  { value: 'ped', label: 'Pédiatrie' },
  { value: 'gyn', label: 'Gynécologie' },
]

interface FormData {
  nom: string; specialite: string; description: string;
  emoji: string; categorie: string; email: string; telephone: string; ordre: number;
}

export default function AdminSpecialistes() {
  const [specs, setSpecs] = useState<Specialiste[]>([])
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { emoji: '👨‍⚕️', categorie: 'tous', ordre: 0 },
  })

  const load = () => specialistesApi.list().then((r) => setSpecs(r.data))

  useEffect(() => { load() }, [])

  const onAdd = async (data: FormData) => {
    setLoading(true)
    try {
      await specialistesApi.create(data)
      toast.success(`Dr. ${data.nom} ajouté`)
      reset({ emoji: '👨‍⚕️', categorie: 'tous', ordre: 0 })
      load()
    } catch { toast.error("Erreur lors de l'ajout") }
    finally { setLoading(false) }
  }

  const onDelete = async (spec: Specialiste) => {
    if (!confirm(`Supprimer ${spec.nom} ?`)) return
    try {
      await specialistesApi.delete(spec.id)
      toast.success('Spécialiste supprimé')
      load()
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold">Gestion des spécialistes</h1>
        <p className="text-gray-500 text-[13px] mt-0.5">
          Ajouter ou supprimer les médecins affichés sur le site
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Formulaire */}
        <div className="card p-5">
          <h3 className="font-extrabold text-[15px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-user-plus text-[#1a4fc4]" />
            Ajouter un spécialiste
          </h3>
          <form onSubmit={handleSubmit(onAdd)} className="space-y-3">
            <div>
              <label className="label">Nom complet *</label>
              <input
                {...register('nom', { required: true })}
                className="input"
                placeholder="Dr. Prénom Nom"
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">Requis</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Spécialité *</label>
                <select {...register('specialite', { required: true })} className="input">
                  <option value="">Choisir...</option>
                  {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.specialite && <p className="text-red-500 text-xs mt-1">Requis</p>}
              </div>
              <div>
                <label className="label">Catégorie filtre</label>
                <select {...register('categorie')} className="input">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Description courte</label>
              <input
                {...register('description')}
                className="input"
                placeholder="Spécialisation, années d'expérience..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Email professionnel</label>
                <input {...register('email')} type="email" className="input" placeholder="dr@cliniquerebecca.ht" />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input {...register('telephone')} className="input" placeholder="+509 3456-7890" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Emoji avatar</label>
                <input
                  {...register('emoji')}
                  className="input text-center text-xl"
                  maxLength={4}
                  placeholder="👨‍⚕️"
                />
              </div>
              <div>
                <label className="label">Ordre affichage</label>
                <input
                  {...register('ordre', { valueAsNumber: true })}
                  type="number"
                  className="input"
                  min={0}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-blue w-full justify-center py-2.5">
              <i className="fa-solid fa-user-plus" />
              {loading ? 'Ajout...' : 'Ajouter le spécialiste'}
            </button>
          </form>
        </div>

        {/* Liste */}
        <div className="card p-5">
          <h3 className="font-extrabold text-[15px] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-users text-[#1a4fc4]" />
            Spécialistes actifs ({specs.length})
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {specs.map((spec) => (
              <div
                key={spec.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-green-50
                  border-2 border-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                  {spec.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[13px] truncate">{spec.nom}</div>
                  <div className="text-[#1a4fc4] text-[11px] font-bold">{spec.specialite}</div>
                  {spec.description && (
                    <div className="text-gray-400 text-[11px] truncate">{spec.description}</div>
                  )}
                </div>
                <button
                  onClick={() => onDelete(spec)}
                  className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center
                  justify-center hover:bg-red-100 hover:text-red-600 transition-all flex-shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {specs.length === 0 && (
              <div className="text-center text-gray-400 py-8 text-[13px]">Aucun spécialiste</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
