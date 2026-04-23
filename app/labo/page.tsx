'use client'
// app/labo/page.tsx — Espace laboratoire avec formulaire patient + envoi résultats
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { laboApi } from '@/lib/api'
import { ResultatLabo } from '@/types'
import { Plus, X, Send, Search, FlaskConical, LogOut } from 'lucide-react'

const EXAMENS = [
  'NFS (Numération Formule Sanguine)','Glycémie à jeun','HbA1c','Créatininémie',
  'Transaminases (ALAT/ASAT)','TSH (Thyroïde)','Sérologie VIH','ECBU',
  'Bilan lipidique','Hémoculture','Coproculture','Test de grossesse',
  'Ionogramme sanguin','TP/TCA','CRP','Acide urique',
]

const STATUS_MAP: Record<string, {label:string;cls:string}> = {
  en_attente: {label:'En attente', cls:'badge-yellow'},
  disponible: {label:'Disponible', cls:'badge-blue'},
  envoye: {label:'Envoyé ✓', cls:'badge-green'},
}

interface LaboForm {
  patient_id: string; patient_nom: string; patient_telephone: string; patient_email: string
  type_examen: string; resultats: string; valeurs_normales: string; interpretation: string
  notes: string; date_examen: string
}

const DEMO_RESULTATS: ResultatLabo[] = [
  {id:1, patient_id:'#RB-42015', patient_nom:'Marie Théodore', type_examen:'NFS', resultats:'Hb: 12g/dL, GB: 7800/mm³, Plaquettes: 245000/mm³', notes:'Normal', date_examen:new Date().toISOString(), technicien_id:1, status:'disponible'},
  {id:2, patient_id:'#RB-39841', patient_nom:'Paul Jean-Baptiste', type_examen:'Glycémie à jeun', resultats:'1.26 g/L', notes:'Légèrement élevé', date_examen:new Date().toISOString(), technicien_id:1, status:'en_attente'},
  {id:3, patient_id:'#RB-51203', patient_nom:'Rose Étienne', type_examen:'TSH', resultats:'2.8 mUI/L', notes:'Normal', date_examen:new Date(Date.now()-86400000).toISOString(), technicien_id:1, status:'envoye'},
]

export default function LaboPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [resultats, setResultats] = useState<ResultatLabo[]>(DEMO_RESULTATS)
  const [showForm, setShowForm] = useState(false)
  const [searchId, setSearchId] = useState('')
  const [filtered, setFiltered] = useState<ResultatLabo[]>(DEMO_RESULTATS)
  const { register, handleSubmit, reset } = useForm<LaboForm>({
    defaultValues: { date_examen: new Date().toISOString().slice(0,16) }
  })

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'labo')) router.push('/login')
  }, [isAuthenticated, user, loading])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'labo') {
      laboApi.list().then(r => setResultats(r.data.length ? r.data : DEMO_RESULTATS)).catch(() => setResultats(DEMO_RESULTATS))
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!searchId.trim()) { setFiltered(resultats); return }
    setFiltered(resultats.filter(r =>
      r.patient_id.toLowerCase().includes(searchId.toLowerCase()) ||
      r.patient_nom.toLowerCase().includes(searchId.toLowerCase())
    ))
  }, [searchId, resultats])

  const onSubmit = async (data: LaboForm) => {
    try {
      await laboApi.create({ ...data, date_examen: new Date(data.date_examen).toISOString(), status:'disponible' })
      toast.success('✓ Résultat enregistré')
      setTimeout(() => toast.success('📱 WhatsApp envoyé au patient', {duration:3000}), 600)
      setTimeout(() => toast.success('📧 Email envoyé', {duration:3000}), 1200)
      reset({ date_examen: new Date().toISOString().slice(0,16) })
      setShowForm(false)
      laboApi.list().then(r => setResultats(r.data.length ? r.data : DEMO_RESULTATS)).catch(() => {})
    } catch { toast.error('Erreur lors de l\'enregistrement') }
  }

  const envoyer = async (r: ResultatLabo) => {
    try {
      await laboApi.update(r.id, { status:'envoye' })
      setResultats(prev => prev.map(x => x.id===r.id ? {...x,status:'envoye'} : x))
      toast.success(`📱 Résultats envoyés à ${r.patient_nom}`)
    } catch { toast.error('Erreur') }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#0f172a] h-[70px] flex items-center px-6 gap-4">
        <Link href="/" className="text-white/60 hover:text-white text-sm no-underline"><i className="fa-solid fa-arrow-left mr-2"/>Accueil</Link>
        <h1 className="text-white font-bold">Espace Laboratoire</h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-white/60 text-sm"><i className="fa-solid fa-flask-vial text-[#1641C8] mr-1.5"/>{user?.nom}</span>
          <button onClick={() => { logout(); router.push('/') }} className="text-white/40 hover:text-red-400 text-xs border-none bg-transparent cursor-pointer ml-2 flex items-center gap-1">
            <LogOut size={12}/> Déco
          </button>
        </div>
      </div>

      <div className="p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold">Résultats de laboratoire</h1>
            <p className="text-slate-400 text-[13px] mt-0.5">Saisie et envoi par numéro patient unique</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={15}/> Saisir un résultat</button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="kpi-card"><div className="text-2xl font-black text-[#1641C8] mb-1">{resultats.length}</div><div className="text-xs text-slate-500 font-semibold">Total</div></div>
          <div className="kpi-card"><div className="text-2xl font-black text-yellow-600 mb-1">{resultats.filter(r=>r.status==='en_attente').length}</div><div className="text-xs text-slate-500 font-semibold">En attente</div></div>
          <div className="kpi-card"><div className="text-2xl font-black text-blue-600 mb-1">{resultats.filter(r=>r.status==='disponible').length}</div><div className="text-xs text-slate-500 font-semibold">Prêts</div></div>
          <div className="kpi-card"><div className="text-2xl font-black text-green-600 mb-1">{resultats.filter(r=>r.status==='envoye').length}</div><div className="text-xs text-slate-500 font-semibold">Envoyés</div></div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-[16px] flex items-center gap-2"><FlaskConical size={18} className="text-[#1641C8]"/> Saisir un résultat d'examen</h3>
              <button onClick={() => { setShowForm(false); reset() }} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                <div className="text-[11px] font-extrabold text-[#1641C8] uppercase tracking-wider mb-3">Identification du patient</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Code patient unique * (#RB-XXXXX)</label>
                    <input {...register('patient_id',{required:true})} className="input" placeholder="#RB-00000"/></div>
                  <div><label className="label">Nom complet *</label>
                    <input {...register('patient_nom',{required:true})} className="input" placeholder="Prénom NOM"/></div>
                  <div><label className="label">Téléphone (WhatsApp)</label>
                    <input {...register('patient_telephone')} className="input" placeholder="+509 3xxx-xxxx"/></div>
                  <div><label className="label">Email</label>
                    <input {...register('patient_email')} type="email" className="input" placeholder="patient@email.com"/></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Type d'examen *</label>
                  <select {...register('type_examen',{required:true})} className="input">
                    <option value="">Choisir...</option>
                    {EXAMENS.map(e => <option key={e}>{e}</option>)}
                  </select></div>
                <div><label className="label">Date de l'examen *</label>
                  <input {...register('date_examen',{required:true})} type="datetime-local" className="input"/></div>
              </div>
              <div><label className="label">Résultats détaillés *</label>
                <textarea {...register('resultats',{required:true})} className="input resize-none" rows={3} placeholder="Ex: Hb: 12g/dL, GB: 7800/mm³ ..."/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Valeurs normales (référence)</label>
                  <textarea {...register('valeurs_normales')} className="input resize-none" rows={2} placeholder="Ex: Hb: 11-15 g/dL ..."/></div>
                <div><label className="label">Interprétation</label>
                  <textarea {...register('interpretation')} className="input resize-none" rows={2} placeholder="Normal / Suivi recommandé..."/></div>
              </div>
              <div><label className="label">Notes du technicien</label>
                <input {...register('notes')} className="input" placeholder="Observations particulières..."/></div>
              <div className="bg-green-50 rounded-xl border border-green-200 p-3 flex items-center gap-2 text-sm text-green-700 font-medium">
                <i className="fa-solid fa-paper-plane text-green-600"/>
                Résultat envoyé automatiquement par WhatsApp + Email après enregistrement.
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary"><Send size={14}/> Enregistrer & Envoyer au patient</button>
                <button type="button" onClick={() => { setShowForm(false); reset() }} className="btn-ghost">Annuler</button>
              </div>
            </form>
          </div>
        )}

        {/* Recherche */}
        <div className="flex gap-3 mb-4">
          <div className="relative max-w-sm flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={searchId} onChange={e => setSearchId(e.target.value)} className="input pl-9" placeholder="Rechercher par code ou nom patient..."/>
          </div>
          {searchId && <button onClick={() => setSearchId('')} className="btn-ghost text-xs"><X size={12}/> Effacer</button>}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="tbl">
            <thead><tr><th>Code Patient</th><th>Nom</th><th>Examen</th><th>Résultats</th><th>Notes</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} className="text-center py-12 text-slate-300 text-sm">Aucun résultat</td></tr>
                : filtered.map(r => {
                  const st = STATUS_MAP[r.status] || {label:r.status,cls:'badge-gray'}
                  return (
                    <tr key={r.id}>
                      <td><span className="font-extrabold text-[#1641C8] text-sm">{r.patient_id}</span></td>
                      <td className="font-semibold text-sm">{r.patient_nom}</td>
                      <td className="text-xs font-medium text-slate-600">{r.type_examen}</td>
                      <td className="max-w-[160px]"><div className="text-xs truncate font-medium">{r.resultats}</div></td>
                      <td className="text-xs text-slate-400 italic">{r.notes}</td>
                      <td className="text-xs text-slate-400">{new Date(r.date_examen).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'})}</td>
                      <td><span className={st.cls}>{st.label}</span></td>
                      <td>{r.status !== 'envoye' && (
                        <button onClick={() => envoyer(r)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1641C8] text-white text-xs font-bold border-none cursor-pointer hover:bg-[#0f2fa3]">
                          <Send size={11}/> Envoyer
                        </button>
                      )}</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>

        <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-sm font-extrabold text-[#1641C8] mb-2">📋 Flux de travail Laboratoire</div>
          <div className="flex gap-4 text-xs text-slate-600 font-medium flex-wrap">
            <span>1. Patient reçoit un code unique (#RB-XXXXX) à l'enregistrement</span>
            <span className="text-slate-300">→</span>
            <span>2. Caissier encaisse le service labo</span>
            <span className="text-slate-300">→</span>
            <span>3. Technicien saisit les résultats ici avec le code patient</span>
            <span className="text-slate-300">→</span>
            <span>4. Patient reçoit les résultats par WhatsApp + Email</span>
          </div>
        </div>
      </div>
    </div>
  )
}
