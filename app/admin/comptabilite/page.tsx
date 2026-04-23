'use client'
import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Plus, Trash2, Brain, TrendingUp, TrendingDown, FileText, Users, Building, Calculator, ChevronDown, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'

const ONGLETS = [
  { id: 'journal', label: 'Journal', icon: 'fa-list' },
  { id: 'actes', label: 'Actes & Répartition', icon: 'fa-stethoscope' },
  { id: 'decaissements', label: 'Décaissements', icon: 'fa-money-bill-transfer' },
  { id: 'exploitants', label: 'Exploitants', icon: 'fa-building' },
  { id: 'optometrie', label: 'Optométrie', icon: 'fa-glasses' },
  { id: 'bilan', label: 'Bilan mensuel', icon: 'fa-chart-bar' },
  { id: 'cumul', label: 'Rapport cumulatif', icon: 'fa-chart-line' },
  { id: 'config', label: 'Configuration', icon: 'fa-gear' },
]

const CATS_REC = ['Consultations','Laboratoire','Pharmacie','Dentisterie','Physiothérapie','Accouchement','Loyer salle','Autre']
const CATS_DEP = ['RH / Salaires','Médical','Pharmacie achats','Infrastructure','Équipements','Télécom','Autre']
const MODES = ['Espèces','Mobile Money (Moncash)','Natcash','Virement','Chèque']
const MOIS_NOMS = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const fmt = (n: number) => `${(n||0).toLocaleString('fr')} HTG`
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'})

// ─── Suggestion IA écriture comptable ────────────────────────────────────────
const suggererEcriture = (type: string, cat: string, desc: string) => {
  if (type === 'recette') {
    const map: Record<string,string> = {
      'Consultations': '701 - Produits consultations', 'Laboratoire': '702 - Produits laboratoire',
      'Pharmacie': '703 - Ventes pharmacie', 'Dentisterie': '704 - Produits dentisterie',
      'Physiothérapie': '705 - Produits physiothérapie', 'Accouchement': '706 - Produits obstétriques',
      'Loyer salle': '711 - Loyers reçus',
    }
    return { debit: '511 - Caisse / 512 - Banque', credit: map[cat] || '709 - Autres produits', journal: 'VTE' }
  } else {
    const map: Record<string,string> = {
      'RH / Salaires': '641 - Rémunérations personnel', 'Médical': '602 - Fournitures médicales',
      'Pharmacie achats': '607 - Achats marchandises', 'Infrastructure': '615 - Entretien réparations',
      'Équipements': '218 - Immobilisations corporelles', 'Télécom': '626 - Frais télécommunications',
    }
    return { debit: map[cat] || '628 - Charges diverses', credit: '511 - Caisse / 512 - Banque', journal: 'ACH' }
  }
}

export default function AdminComptabilite() {
  const now = new Date()
  const [onglet, setOnglet] = useState('journal')
  const [mouvements, setMouvements] = useState<any[]>([])
  const [actes, setActes] = useState<any[]>([])
  const [decaissements, setDecaissements] = useState<any[]>([])
  const [profils, setProfils] = useState<any[]>([])
  const [bilans, setBilans] = useState<any[]>([])
  const [bilanCourant, setBilanCourant] = useState<any>(null)
  const [cumul, setCumul] = useState<any>(null)
  const [regles, setRegles] = useState<any[]>([])
  const [tarifs, setTarifs] = useState<any[]>([])
  const [contratOptomet, setContratOptomet] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [showActeForm, setShowActeForm] = useState(false)
  const [showDecForm, setShowDecForm] = useState(false)
  const [showExploForm, setShowExploForm] = useState(false)
  const [ecriture, setEcriture] = useState<any>(null)
  const [filterType, setFilterType] = useState<'tous'|'recette'|'depense'>('tous')
  const [moisBilan, setMoisBilan] = useState(now.getMonth()+1)
  const [anneeBilan, setAnneeBilan] = useState(now.getFullYear())
  const [periodeDebut, setPeriodeDebut] = useState({ mois: 1, annee: now.getFullYear() })
  const [periodeFin, setPeriodeFin] = useState({ mois: now.getMonth()+1, annee: now.getFullYear() })
  const [optoData, setOptoData] = useState({ total_consultations: 0, total_montures: 0, mois: now.getMonth()+1, annee: now.getFullYear() })
  const [optoResultat, setOptoResultat] = useState<any>(null)

  const { register, handleSubmit, watch, reset } = useForm({ defaultValues: { type:'recette', mode_paiement:'Espèces', date_mouvement: new Date().toISOString().slice(0,16), categorie: '' } })
  const { register: regActe, handleSubmit: subActe, watch: watchActe, reset: resetActe } = useForm()
  const { register: regDec, handleSubmit: subDec, reset: resetDec } = useForm({ defaultValues: { mode_paiement:'Espèces' } })
  const { register: regExplo, handleSubmit: subExplo, reset: resetExplo } = useForm({ defaultValues: { mode_paiement:'Espèces', flux_direct: false } })

  const typeW = watch('type')
  const catW = watch('categorie')
  const descW = watch('description')
  const montantW = watch('montant')
  const typeActe = watchActe('type_acte')

  useEffect(() => {
    if (catW && descW && montantW > 0) setEcriture(suggererEcriture(typeW, catW, descW))
    else setEcriture(null)
  }, [typeW, catW, descW, montantW])

  const loadJournal = useCallback(async () => {
    try {
      const res = await api.get('/admin/mouvements', { params: { mois: moisBilan, annee: anneeBilan } })
      setMouvements(res.data)
    } catch { setMouvements([]) }
  }, [moisBilan, anneeBilan])

  const loadAll = useCallback(async () => {
    loadJournal()
    try { const r = await api.get('/admin/actes-facturables', { params: { mois: moisBilan, annee: anneeBilan } }); setActes(r.data) } catch {}
    try { const r = await api.get('/admin/decaissements'); setDecaissements(r.data) } catch {}
    try { const r = await api.get('/admin/profils-medecins'); setProfils(r.data) } catch {}
    try { const r = await api.get('/admin/bilans'); setBilans(r.data) } catch {}
    try { const r = await api.get('/admin/regles-partage'); setRegles(r.data) } catch {}
    try { const r = await api.get('/admin/tarifs-clinic'); setTarifs(r.data) } catch {}
    try { const r = await api.get('/admin/contrat-optometrie'); setContratOptomet(r.data) } catch {}
  }, [moisBilan, anneeBilan, loadJournal])

  useEffect(() => { loadAll() }, [loadAll])

  const totaux = mouvements.reduce((acc, m) => {
    if (m.type === 'recette') acc.rec += m.montant
    else acc.dep += m.montant
    return acc
  }, { rec: 0, dep: 0 })

  const onSubmitJournal = async (data: any) => {
    try {
      await api.post('/admin/mouvements', { ...data, montant: Number(data.montant), date_mouvement: new Date(data.date_mouvement).toISOString() })
      toast.success('Entrée enregistrée')
      reset({ type:'recette', mode_paiement:'Espèces', date_mouvement: new Date().toISOString().slice(0,16), categorie:'' })
      setShowForm(false); setEcriture(null); loadJournal()
    } catch { toast.error('Erreur') }
  }

  const onSubmitActe = async (data: any) => {
    try {
      const res = await api.post('/actes-facturables', { ...data, montant_total: Number(data.montant_total) })
      toast.success(`Acte enregistré — Part clinique: ${fmt(res.data.repartition?.montant_clinique || 0)}`)
      resetActe(); setShowActeForm(false); loadAll()
    } catch { toast.error('Erreur enregistrement acte') }
  }

  const onSubmitDec = async (data: any) => {
    try {
      await api.post('/admin/decaissements', { ...data, montant: Number(data.montant) })
      toast.success('Décaissement enregistré')
      resetDec({ mode_paiement:'Espèces' }); setShowDecForm(false); loadAll()
    } catch { toast.error('Erreur') }
  }

  const onSubmitExplo = async (data: any) => {
    try {
      await api.post('/caissier/paiement-exploitant', { ...data, montant: Number(data.montant), flux_direct: data.flux_direct === 'true' || data.flux_direct === true })
      toast.success('Paiement exploitant enregistré')
      resetExplo({ mode_paiement:'Espèces', flux_direct: false }); setShowExploForm(false); loadAll()
    } catch { toast.error('Erreur') }
  }

  const genererBilan = async () => {
    try {
      const res = await api.post('/admin/generer-bilan', { mois: moisBilan, annee: anneeBilan })
      setBilanCourant(res.data); toast.success('Bilan généré')
      loadAll()
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Erreur') }
  }

  const validerBilan = async (id: number) => {
    try {
      await api.put(`/admin/bilans/${id}/valider`)
      toast.success('Bilan validé'); loadAll()
    } catch { toast.error('Erreur') }
  }

  const genererCumul = async () => {
    try {
      const res = await api.get('/admin/rapport-cumul', { params: { mois_debut: periodeDebut.mois, annee_debut: periodeDebut.annee, mois_fin: periodeFin.mois, annee_fin: periodeFin.annee } })
      setCumul(res.data)
    } catch { toast.error('Erreur') }
  }

  const calculerOptomet = async () => {
    try {
      const res = await api.post('/admin/calculer-optometrie', optoData)
      setOptoResultat(res.data); toast.success('Calcul effectué')
    } catch { toast.error('Erreur') }
  }

  const updateRegle = async (id: number, pct_medecin: number) => {
    try {
      await api.put(`/admin/regles-partage/${id}`, { pct_medecin, pct_clinique: 100 - pct_medecin })
      toast.success('Règle mise à jour'); loadAll()
    } catch { toast.error('Erreur') }
  }

  const updateTarif = async (code: string, montant: number) => {
    try {
      await api.put(`/admin/tarifs-clinic/${code}`, { montant })
      toast.success('Tarif mis à jour'); loadAll()
    } catch { toast.error('Erreur') }
  }

  const updateContratOptomet = async (data: any) => {
    try {
      await api.put('/admin/contrat-optometrie', data)
      toast.success('Contrat mis à jour'); loadAll()
    } catch { toast.error('Erreur') }
  }

  const exportPDF = () => {
    toast.success('Export PDF en préparation...')
    window.print()
  }

  const bilanMoisCourant = bilans.find(b => b.mois === moisBilan && b.annee === anneeBilan)

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Comptabilité</h1>
          <p className="text-slate-500 text-[13px] mt-0.5">Système comptable complet — SYSCOHADA / IFRS</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={moisBilan} onChange={e => setMoisBilan(Number(e.target.value))} className="input w-36 text-sm">
            {MOIS_NOMS.slice(1).map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select value={anneeBilan} onChange={e => setAnneeBilan(Number(e.target.value))} className="input w-28 text-sm">
            {[2024,2025,2026,2027].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={loadAll} className="btn-ghost py-2"><RefreshCw size={14}/></button>
          <button onClick={exportPDF} className="btn-ghost py-2"><i className="fa-solid fa-file-pdf text-red-500 mr-1"/>PDF</button>
        </div>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <div className="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-2"><TrendingUp size={18}/></div>
          <div className="text-xl font-black text-green-600">+{fmt(totaux.rec)}</div>
          <div className="text-xs text-slate-500 font-semibold">Recettes {MOIS_NOMS[moisBilan]}</div>
        </div>
        <div className="kpi-card">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-500 flex items-center justify-center mb-2"><TrendingDown size={18}/></div>
          <div className="text-xl font-black text-red-500">-{fmt(totaux.dep)}</div>
          <div className="text-xs text-slate-500 font-semibold">Dépenses {MOIS_NOMS[moisBilan]}</div>
        </div>
        <div className={`kpi-card border-2 ${totaux.rec-totaux.dep >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1641C8] flex items-center justify-center mb-2"><Calculator size={18}/></div>
          <div className={`text-xl font-black ${totaux.rec-totaux.dep >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {totaux.rec-totaux.dep >= 0 ? '+' : ''}{fmt(totaux.rec-totaux.dep)}
          </div>
          <div className="text-xs text-slate-500 font-semibold">Résultat net</div>
        </div>
        <div className="kpi-card">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2"><Users size={18}/></div>
          <div className="text-xl font-black text-orange-600">{actes.filter(a => a.statut_decaissement === 'en_attente').length}</div>
          <div className="text-xs text-slate-500 font-semibold">Décaissements en attente</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {ONGLETS.map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap border-none cursor-pointer transition-all
            ${onglet === o.id ? 'bg-white text-[#1641C8] shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'}`}>
            <i className={`fa-solid ${o.icon} text-[11px]`}/>{o.label}
          </button>
        ))}
      </div>

      {/* ── JOURNAL ── */}
      {onglet === 'journal' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[15px] flex items-center gap-2"><Brain size={16} className="text-[#1641C8]"/>Journal comptable — {MOIS_NOMS[moisBilan]} {anneeBilan}</h2>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2"><Plus size={14}/>Nouvelle entrée</button>
          </div>

          {showForm && (
            <div className="card p-5 mb-5 border-l-4 border-[#1641C8]">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Brain size={15} className="text-[#1641C8]"/>Nouvelle écriture <span className="badge badge-blue text-[10px]">Assistance IA</span></h3>
              <form onSubmit={handleSubmit(onSubmitJournal)}>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div><label className="label">Type *</label>
                    <select {...register('type')} className="input">
                      <option value="recette">📈 Recette</option>
                      <option value="depense">📉 Dépense</option>
                    </select></div>
                  <div><label className="label">Catégorie *</label>
                    <select {...register('categorie',{required:true})} className="input">
                      <option value="">Choisir...</option>
                      {(typeW==='recette'?CATS_REC:CATS_DEP).map(c=><option key={c}>{c}</option>)}
                    </select></div>
                  <div><label className="label">Montant (HTG) *</label>
                    <input {...register('montant',{required:true,min:0})} type="number" className="input"/></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="col-span-2"><label className="label">Description *</label>
                    <input {...register('description',{required:true})} className="input" placeholder="Ex: Consultation Dr. Martin — Patient Marie T."/></div>
                  <div><label className="label">Mode paiement</label>
                    <select {...register('mode_paiement')} className="input">{MODES.map(m=><option key={m}>{m}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><label className="label">Date & heure</label>
                    <input {...register('date_mouvement')} type="datetime-local" className="input"/></div>
                  <div><label className="label">Notes</label>
                    <input {...register('notes')} className="input" placeholder="Optionnel"/></div>
                </div>

                {ecriture && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="text-[11px] font-bold text-[#1641C8] mb-2 flex items-center gap-1.5">
                      <Brain size={12}/>Écriture comptable suggérée (SYSCOHADA)
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Journal</div>
                        <div className="font-mono text-xs font-extrabold text-[#1641C8]">{ecriture.journal}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2.5 border border-green-200">
                        <div className="text-[9px] font-bold text-green-600 uppercase mb-1">Débit</div>
                        <div className="font-mono text-[11px] font-bold text-slate-800">{ecriture.debit}</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-200">
                        <div className="text-[9px] font-bold text-blue-600 uppercase mb-1">Crédit</div>
                        <div className="font-mono text-[11px] font-bold text-slate-800">{ecriture.credit}</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">✓ Vérifiez avec votre comptable</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary"><i className="fa-solid fa-save"/>Enregistrer</button>
                  <button type="button" onClick={()=>{setShowForm(false);setEcriture(null)}} className="btn-ghost">Annuler</button>
                </div>
              </form>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            {(['tous','recette','depense'] as const).map(t=>(
              <button key={t} onClick={()=>setFilterType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all
                ${filterType===t?'bg-[#1641C8] text-white border-[#1641C8]':'bg-white text-slate-500 border-slate-200'}`}>
                {t==='tous'?'Tout':t==='recette'?'📈 Recettes':'📉 Dépenses'}
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            <table className="tbl w-full">
              <thead><tr><th>Date</th><th>Type</th><th>Catégorie</th><th>Description</th><th>Écriture</th><th>Mode</th><th className="text-right">Montant</th><th></th></tr></thead>
              <tbody>
                {mouvements.filter(m=>filterType==='tous'||m.type===filterType).map(m=>(
                  <tr key={m.id}>
                    <td className="text-xs text-slate-400">{fmtDate(m.date_mouvement)}</td>
                    <td><span className={`badge ${m.type==='recette'?'badge-green':'badge-red'} text-[10px]`}>{m.type==='recette'?'↑':'↓'} {m.type}</span></td>
                    <td className="text-xs text-slate-600 font-semibold">{m.categorie}</td>
                    <td className="text-xs max-w-[180px] truncate">{m.description}</td>
                    <td className="text-[10px] font-mono text-slate-400">{m.notes?.includes('Flux direct') ? <span className="badge badge-gray text-[9px]">Direct</span> : '—'}</td>
                    <td className="text-xs text-slate-400">{m.mode_paiement}</td>
                    <td className={`text-right font-extrabold text-sm ${m.type==='recette'?'text-green-600':'text-red-500'}`}>
                      {m.type==='recette'?'+':'-'}{m.montant?.toLocaleString('fr')} HTG
                    </td>
                    <td><button onClick={async()=>{await api.delete(`/admin/mouvements/${m.id}`);loadJournal()}} className="w-6 h-6 bg-red-50 text-red-400 rounded-lg border-none cursor-pointer hover:bg-red-100 flex items-center justify-center"><Trash2 size={11}/></button></td>
                  </tr>
                ))}
                {mouvements.length===0&&<tr><td colSpan={8} className="text-center py-10 text-slate-300 text-sm">Aucune transaction — Ajoutez une entrée</td></tr>}
              </tbody>
              {mouvements.length>0&&(
                <tfoot><tr className="bg-slate-50">
                  <td colSpan={6} className="px-4 py-3 text-sm font-extrabold">Total {MOIS_NOMS[moisBilan]}</td>
                  <td className={`px-4 py-3 text-right font-extrabold ${totaux.rec-totaux.dep>=0?'text-green-600':'text-red-500'}`}>
                    {totaux.rec-totaux.dep>=0?'+':''}{fmt(totaux.rec-totaux.dep)}
                  </td><td/>
                </tr></tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* ── ACTES & RÉPARTITION ── */}
      {onglet === 'actes' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[15px]">Actes médicaux & Répartition automatique</h2>
            <button onClick={()=>setShowActeForm(!showActeForm)} className="btn-primary py-2"><Plus size={14}/>Nouvel acte</button>
          </div>

          {showActeForm && (
            <div className="card p-5 mb-5 border-l-4 border-green-500">
              <h3 className="font-bold text-sm mb-4">Enregistrer un acte — Calcul automatique des parts</h3>
              <form onSubmit={subActe(onSubmitActe)}>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div><label className="label">Patient (code ou nom)</label>
                    <input {...regActe('patient_nom')} className="input" placeholder="#RB-042 — Marie T."/></div>
                  <div><label className="label">Médecin</label>
                    <select {...regActe('medecin_id')} className="input">
                      <option value="">Choisir médecin...</option>
                      {profils.map((p:any)=><option key={p.id} value={p.id}>{p.nom} ({p.type_medecin})</option>)}
                    </select></div>
                  <div><label className="label">Type d'acte *</label>
                    <select {...regActe('type_acte',{required:true})} className="input">
                      <option value="consultation">Consultation</option>
                      <option value="geste">Geste médical</option>
                      <option value="chirurgie">Chirurgie (montant manuel)</option>
                      <option value="hospit">Hospitalisation</option>
                      <option value="observation">Observation</option>
                    </select></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div><label className="label">Montant total (HTG) *</label>
                    <input {...regActe('montant_total',{required:true})} type="number" className="input"/></div>
                  <div><label className="label">Mode paiement</label>
                    <select {...regActe('mode_paiement')} className="input">{MODES.map(m=><option key={m}>{m}</option>)}</select></div>
                  <div><label className="label">Description</label>
                    <input {...regActe('description')} className="input" placeholder="Détails de l'acte"/></div>
                </div>
                {typeActe === 'chirurgie' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                    <p className="text-xs font-bold text-amber-700 mb-2">Chirurgie — Saisie manuelle des parts :</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label">Part médecin (HTG)</label>
                        <input {...regActe('montant_medecin_manuel')} type="number" className="input"/></div>
                      <div><label className="label">Part clinique (HTG)</label>
                        <input {...regActe('montant_clinique_manuel')} type="number" className="input"/></div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary"><i className="fa-solid fa-calculator mr-1.5"/>Calculer & Enregistrer</button>
                  <button type="button" onClick={()=>setShowActeForm(false)} className="btn-ghost">Annuler</button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="tbl w-full">
              <thead><tr><th>Date</th><th>Patient</th><th>Médecin</th><th>Type</th><th>Total</th><th>Part médecin</th><th>Part clinique</th><th>%</th><th>Statut</th></tr></thead>
              <tbody>
                {actes.map((a:any)=>(
                  <tr key={a.id}>
                    <td className="text-xs text-slate-400">{fmtDate(a.date_acte)}</td>
                    <td className="font-mono text-xs font-bold text-[#1641C8]">{a.patient_nom}</td>
                    <td className="text-xs">{a.medecin_nom||'—'}</td>
                    <td><span className="badge badge-blue text-[10px]">{a.type_acte}</span></td>
                    <td className="font-bold text-sm">{fmt(a.montant_total)}</td>
                    <td className="font-bold text-orange-600">{fmt(a.montant_medecin)}</td>
                    <td className="font-bold text-green-600">{fmt(a.montant_clinique)}</td>
                    <td className="text-xs text-slate-500">{a.pct_medecin}%</td>
                    <td><span className={`badge ${a.statut_decaissement==='decaisse'?'badge-green':'badge-yellow'} text-[10px]`}>
                      {a.statut_decaissement==='decaisse'?'✓ Décaissé':'En attente'}
                    </span></td>
                  </tr>
                ))}
                {actes.length===0&&<tr><td colSpan={9} className="text-center py-8 text-slate-300 text-sm">Aucun acte ce mois</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DÉCAISSEMENTS ── */}
      {onglet === 'decaissements' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[15px]">Décaissements médecins</h2>
            <button onClick={()=>setShowDecForm(!showDecForm)} className="btn-primary py-2"><Plus size={14}/>Nouveau décaissement</button>
          </div>

          {showDecForm && (
            <div className="card p-5 mb-5 border-l-4 border-orange-500">
              <h3 className="font-bold text-sm mb-4">Enregistrer un décaissement</h3>
              <form onSubmit={subDec(onSubmitDec)}>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div><label className="label">Médecin *</label>
                    <select {...regDec('medecin_id',{required:true})} className="input" onChange={e=>{const p=profils.find((p:any)=>p.id==e.target.value);if(p)resetDec({...{medecin_id:e.target.value,medecin_nom:p.nom},mode_paiement:'Espèces'})}}>
                      <option value="">Choisir...</option>
                      {profils.map((p:any)=><option key={p.id} value={p.id}>{p.nom}</option>)}
                    </select></div>
                  <div><label className="label">Montant (HTG) *</label>
                    <input {...regDec('montant',{required:true,min:0})} type="number" className="input"/></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><label className="label">Motif *</label>
                    <input {...regDec('motif',{required:true})} className="input" placeholder="Part consultations semaine du..."/></div>
                  <div><label className="label">Mode paiement</label>
                    <select {...regDec('mode_paiement')} className="input">{MODES.map(m=><option key={m}>{m}</option>)}</select></div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary"><i className="fa-solid fa-money-bill-transfer mr-1.5"/>Enregistrer</button>
                  <button type="button" onClick={()=>setShowDecForm(false)} className="btn-ghost">Annuler</button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="tbl w-full">
              <thead><tr><th>Date</th><th>Médecin</th><th>Motif</th><th>Mode</th><th className="text-right">Montant</th></tr></thead>
              <tbody>
                {decaissements.map((d:any)=>(
                  <tr key={d.id}>
                    <td className="text-xs text-slate-400">{fmtDate(d.date_decaissement)}</td>
                    <td className="font-semibold text-sm">{d.medecin_nom}</td>
                    <td className="text-xs text-slate-600 max-w-[200px] truncate">{d.motif}</td>
                    <td className="text-xs text-slate-400">{d.mode_paiement}</td>
                    <td className="text-right font-extrabold text-red-500">-{fmt(d.montant)}</td>
                  </tr>
                ))}
                {decaissements.length===0&&<tr><td colSpan={5} className="text-center py-8 text-slate-300 text-sm">Aucun décaissement</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── EXPLOITANTS ── */}
      {onglet === 'exploitants' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-extrabold text-[15px]">Paiements exploitants</h2>
              <p className="text-slate-500 text-xs mt-0.5">Physio, Dentisterie, Laboratoire — espèces / chèque / virement direct</p>
            </div>
            <button onClick={()=>setShowExploForm(!showExploForm)} className="btn-primary py-2"><Plus size={14}/>Enregistrer paiement</button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
            <p className="text-[12px] font-semibold text-[#1641C8]">
              <i className="fa-solid fa-info-circle mr-1.5"/>
              Pour les paiements <strong>chèque/virement direct</strong> — cocher "Flux direct" : l'argent n'est pas passé par la caisse mais est comptabilisé dans les statistiques.
            </p>
          </div>

          {showExploForm && (
            <div className="card p-5 mb-5 border-l-4 border-blue-500">
              <h3 className="font-bold text-sm mb-4">Enregistrer paiement exploitant</h3>
              <form onSubmit={subExplo(onSubmitExplo)}>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div><label className="label">Exploitant *</label>
                    <select {...regExplo('medecin_id',{required:true})} className="input">
                      <option value="">Choisir...</option>
                      {profils.filter((p:any)=>['exploitant','investisseur_exploitant'].includes(p.type_medecin)).map((p:any)=>(
                        <option key={p.id} value={p.id}>{p.nom} ({p.specialite})</option>
                      ))}
                    </select></div>
                  <div><label className="label">Patient</label>
                    <input {...regExplo('patient_nom')} className="input" placeholder="Nom du patient"/></div>
                  <div><label className="label">Montant (HTG) *</label>
                    <input {...regExplo('montant',{required:true,min:0})} type="number" className="input"/></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div><label className="label">Mode paiement *</label>
                    <select {...regExplo('mode_paiement')} className="input">{MODES.map(m=><option key={m}>{m}</option>)}</select></div>
                  <div><label className="label">Description</label>
                    <input {...regExplo('description')} className="input" placeholder="Type de service..."/></div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...regExplo('flux_direct')} className="w-4 h-4 accent-[#1641C8]"/>
                      <span className="text-sm font-semibold text-slate-700">Flux direct <span className="text-slate-400 font-normal">(chèque/virement reçu directement)</span></span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary"><i className="fa-solid fa-save mr-1.5"/>Enregistrer</button>
                  <button type="button" onClick={()=>setShowExploForm(false)} className="btn-ghost">Annuler</button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="tbl w-full">
              <thead><tr><th>Date</th><th>Exploitant</th><th>Patient</th><th>Description</th><th>Mode</th><th>Flux</th><th className="text-right">Montant</th></tr></thead>
              <tbody>
                {mouvements.filter(m=>m.categorie==='Exploitant').map((m:any)=>(
                  <tr key={m.id}>
                    <td className="text-xs text-slate-400">{fmtDate(m.date_mouvement)}</td>
                    <td className="font-semibold text-xs">{m.description?.split('—')[0]}</td>
                    <td className="text-xs text-slate-600">{m.description?.split('—')[1]}</td>
                    <td className="text-xs text-slate-500">{m.description?.split('—')[2]}</td>
                    <td className="text-xs">{m.mode_paiement}</td>
                    <td><span className={`badge ${m.notes?.includes('true')?'badge-yellow':'badge-green'} text-[10px]`}>{m.notes?.includes('true')?'Direct':'Caisse'}</span></td>
                    <td className="text-right font-bold text-green-600">+{fmt(m.montant)}</td>
                  </tr>
                ))}
                {mouvements.filter(m=>m.categorie==='Exploitant').length===0&&<tr><td colSpan={7} className="text-center py-8 text-slate-300 text-sm">Aucun paiement exploitant</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── OPTOMÉTRIE ── */}
      {onglet === 'optometrie' && (
        <div>
          <h2 className="font-extrabold text-[15px] mb-4">Calcul mensuel Optométrie</h2>
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="card p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><i className="fa-solid fa-glasses text-[#1641C8]"/>Contrat actuel</h3>
              {contratOptomet && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">% clinique consultations</span><span className="font-bold">{contratOptomet.pct_consultation}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">% clinique montures</span><span className="font-bold">{contratOptomet.pct_montures}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Minimum mensuel</span><span className="font-bold text-[#1641C8]">{contratOptomet.minimum_mensuel_usd} USD</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Taux USD→HTG</span><span className="font-bold">{contratOptomet.taux_usd_htg}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="text-slate-500">Minimum en HTG</span><span className="font-black text-[#1641C8]">{fmt(contratOptomet.minimum_mensuel_usd * contratOptomet.taux_usd_htg)}</span></div>
                </div>
              )}
              <button onClick={()=>{
                const min = prompt('Nouveau minimum mensuel (USD) :', contratOptomet?.minimum_mensuel_usd)
                const taux = prompt('Taux USD→HTG :', contratOptomet?.taux_usd_htg)
                if (min && taux) updateContratOptomet({ minimum_mensuel_usd: Number(min), taux_usd_htg: Number(taux) })
              }} className="btn-ghost mt-4 text-xs py-1.5">
                <i className="fa-solid fa-pencil mr-1"/>Modifier le contrat
              </button>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-sm mb-4">Calculer pour un mois</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="label">Mois</label>
                  <select value={optoData.mois} onChange={e=>setOptoData({...optoData,mois:Number(e.target.value)})} className="input">
                    {MOIS_NOMS.slice(1).map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
                  </select></div>
                <div><label className="label">Année</label>
                  <input type="number" value={optoData.annee} onChange={e=>setOptoData({...optoData,annee:Number(e.target.value)})} className="input"/></div>
                <div><label className="label">Total consultations (HTG)</label>
                  <input type="number" value={optoData.total_consultations} onChange={e=>setOptoData({...optoData,total_consultations:Number(e.target.value)})} className="input"/></div>
                <div><label className="label">Total ventes montures (HTG)</label>
                  <input type="number" value={optoData.total_montures} onChange={e=>setOptoData({...optoData,total_montures:Number(e.target.value)})} className="input"/></div>
              </div>
              <button onClick={calculerOptomet} className="btn-primary w-full justify-center py-2.5">
                <Calculator size={14}/>Calculer
              </button>
            </div>
          </div>

          {optoResultat && (
            <div className={`card p-5 border-2 ${optoResultat.difference >= 0 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <h3 className="font-extrabold text-[15px] mb-4">Résultat — {MOIS_NOMS[optoResultat.mois]} {optoResultat.annee}</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-xl p-3 text-center"><div className="text-xs text-slate-500 mb-1">Part clinique consultations</div><div className="font-bold text-sm">{fmt(optoResultat.part_clinique_consultations)}</div></div>
                <div className="bg-white rounded-xl p-3 text-center"><div className="text-xs text-slate-500 mb-1">Part clinique montures</div><div className="font-bold text-sm">{fmt(optoResultat.part_clinique_montures)}</div></div>
                <div className="bg-white rounded-xl p-3 text-center"><div className="text-xs text-slate-500 mb-1">Total % clinique</div><div className="font-bold text-sm text-[#1641C8]">{fmt(optoResultat.total_part_clinique)}</div></div>
                <div className="bg-white rounded-xl p-3 text-center"><div className="text-xs text-slate-500 mb-1">Minimum applicable</div><div className="font-bold text-sm text-orange-600">{fmt(optoResultat.minimum_htg)}</div></div>
              </div>
              <div className={`rounded-xl p-4 text-center ${optoResultat.difference >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className={`text-2xl font-black mb-1 ${optoResultat.difference >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {fmt(optoResultat.montant_final_clinique)}
                </div>
                <div className="font-bold text-sm">{optoResultat.verdict}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BILAN MENSUEL ── */}
      {onglet === 'bilan' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[15px]">Bilan mensuel — {MOIS_NOMS[moisBilan]} {anneeBilan}</h2>
            <div className="flex gap-2">
              <button onClick={genererBilan} className="btn-primary py-2"><Calculator size={14}/>Générer le bilan</button>
              {bilanMoisCourant && bilanMoisCourant.statut === 'brouillon' && (
                <button onClick={()=>validerBilan(bilanMoisCourant.id)} className="btn-green py-2"><CheckCircle size={14}/>Valider</button>
              )}
              {bilanMoisCourant && <button onClick={exportPDF} className="btn-ghost py-2"><i className="fa-solid fa-file-pdf text-red-500 mr-1"/>Export</button>}
            </div>
          </div>

          {bilanMoisCourant ? (
            <div id="bilan-print">
              <div className="flex items-center gap-2 mb-4">
                <span className={`badge ${bilanMoisCourant.statut==='valide'?'badge-green':'badge-yellow'}`}>
                  {bilanMoisCourant.statut==='valide'?'✓ Validé':'Brouillon'}
                </span>
                {bilanMoisCourant.statut==='valide'&&<span className="text-xs text-slate-400">Validé — prêt pour partage investisseurs</span>}
              </div>

              <div className="grid grid-cols-2 gap-5 mb-5">
                {/* PRODUITS */}
                <div className="card p-5">
                  <h3 className="font-extrabold text-sm mb-4 text-green-700 flex items-center gap-2"><TrendingUp size={15}/>PRODUITS (Revenus)</h3>
                  {[
                    ['Consultations', bilanMoisCourant.total_consultations],
                    ['Gestes médicaux', bilanMoisCourant.total_gestes],
                    ['Chirurgies', bilanMoisCourant.total_chirurgies],
                    ['Hospitalisations / Obs.', bilanMoisCourant.total_hospitalisations],
                    ['Laboratoire', bilanMoisCourant.total_laboratoire],
                    ['Pharmacie', bilanMoisCourant.total_pharmacie],
                    ['Loyers reçus', bilanMoisCourant.total_loyers_recus],
                    ['Autres produits', bilanMoisCourant.total_autres_produits],
                  ].map(([l,v]:any)=>(
                    <div key={l} className="flex justify-between items-center py-1.5 border-b border-slate-50 text-sm">
                      <span className="text-slate-600">{l}</span>
                      <span className="font-bold text-green-600">{fmt(v)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 mt-1">
                    <span className="font-extrabold text-sm">TOTAL PRODUITS</span>
                    <span className="font-extrabold text-green-700 text-base">+{fmt(bilanMoisCourant.total_produits)}</span>
                  </div>
                </div>

                {/* CHARGES */}
                <div className="card p-5">
                  <h3 className="font-extrabold text-sm mb-4 text-red-600 flex items-center gap-2"><TrendingDown size={15}/>CHARGES (Dépenses)</h3>
                  {[
                    ['Décaissements médecins', bilanMoisCourant.total_decaissements_medecins],
                    ['Salaires personnel', bilanMoisCourant.total_salaires],
                    ['Achats pharmacie', bilanMoisCourant.total_pharmacie_achats],
                    ['Infrastructure / Énergie', bilanMoisCourant.total_infrastructure],
                    ['Autres charges', bilanMoisCourant.total_autres_charges],
                  ].map(([l,v]:any)=>(
                    <div key={l} className="flex justify-between items-center py-1.5 border-b border-slate-50 text-sm">
                      <span className="text-slate-600">{l}</span>
                      <span className="font-bold text-red-500">-{fmt(v)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 mt-1">
                    <span className="font-extrabold text-sm">TOTAL CHARGES</span>
                    <span className="font-extrabold text-red-600 text-base">-{fmt(bilanMoisCourant.total_charges)}</span>
                  </div>
                </div>
              </div>

              {/* RÉSULTAT */}
              <div className={`card p-6 text-center border-2 ${bilanMoisCourant.resultat_net>=0?'border-green-300 bg-green-50':'border-red-200 bg-red-50'}`}>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">RÉSULTAT NET — {MOIS_NOMS[moisBilan]} {anneeBilan}</div>
                <div className={`text-4xl font-black mb-2 ${bilanMoisCourant.resultat_net>=0?'text-green-700':'text-red-600'}`}>
                  {bilanMoisCourant.resultat_net>=0?'+':''}{fmt(bilanMoisCourant.resultat_net)}
                </div>
                <div className="text-xs text-slate-500">
                  Taux de marge : {bilanMoisCourant.total_produits>0?Math.round(bilanMoisCourant.resultat_net/bilanMoisCourant.total_produits*100):0}%
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-10 text-center text-slate-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="text-sm">Aucun bilan pour {MOIS_NOMS[moisBilan]} {anneeBilan}</p>
              <p className="text-xs mt-1">Cliquez sur "Générer le bilan" pour calculer automatiquement</p>
            </div>
          )}
        </div>
      )}

      {/* ── RAPPORT CUMULATIF ── */}
      {onglet === 'cumul' && (
        <div>
          <h2 className="font-extrabold text-[15px] mb-4">Rapport cumulatif — 3 / 6 / 12 mois</h2>
          <div className="card p-5 mb-5">
            <div className="grid grid-cols-4 gap-4 items-end">
              <div><label className="label">Mois début</label>
                <select value={periodeDebut.mois} onChange={e=>setPeriodeDebut({...periodeDebut,mois:Number(e.target.value)})} className="input">
                  {MOIS_NOMS.slice(1).map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
                </select></div>
              <div><label className="label">Année début</label>
                <select value={periodeDebut.annee} onChange={e=>setPeriodeDebut({...periodeDebut,annee:Number(e.target.value)})} className="input">
                  {[2024,2025,2026,2027].map(a=><option key={a} value={a}>{a}</option>)}
                </select></div>
              <div><label className="label">Mois fin</label>
                <select value={periodeFin.mois} onChange={e=>setPeriodeFin({...periodeFin,mois:Number(e.target.value)})} className="input">
                  {MOIS_NOMS.slice(1).map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
                </select></div>
              <div><label className="label">Année fin</label>
                <select value={periodeFin.annee} onChange={e=>setPeriodeFin({...periodeFin,annee:Number(e.target.value)})} className="input">
                  {[2024,2025,2026,2027].map(a=><option key={a} value={a}>{a}</option>)}
                </select></div>
            </div>
            <div className="flex gap-2 mt-4">
              {[[1,3],[1,6],[1,12]].map(([dm,fm])=>(
                <button key={fm} onClick={()=>{setPeriodeDebut({mois:now.getMonth()+2-fm<1?now.getMonth()+2-fm+12:now.getMonth()+2-fm,annee:now.getMonth()+2-fm<1?now.getFullYear()-1:now.getFullYear()});setPeriodeFin({mois:now.getMonth()+1,annee:now.getFullYear()})}}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#1641C8] text-xs font-bold border border-blue-200 cursor-pointer hover:bg-blue-100">
                  {fm} mois
                </button>
              ))}
              <button onClick={genererCumul} className="btn-primary py-1.5 px-5 ml-auto"><Calculator size={14}/>Générer</button>
              {cumul && <button onClick={exportPDF} className="btn-ghost py-1.5"><i className="fa-solid fa-file-pdf text-red-500 mr-1"/>PDF</button>}
            </div>
          </div>

          {cumul && (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="kpi-card"><div className="text-xs text-slate-500 mb-1">Total produits</div><div className="text-xl font-black text-green-600">+{fmt(cumul.total_produits)}</div><div className="text-xs text-slate-400">{cumul.nb_mois} mois · {cumul.periode}</div></div>
                <div className="kpi-card"><div className="text-xs text-slate-500 mb-1">Total charges</div><div className="text-xl font-black text-red-500">-{fmt(cumul.total_charges)}</div></div>
                <div className={`kpi-card border-2 ${cumul.resultat_net>=0?'border-green-200 bg-green-50':'border-red-200 bg-red-50'}`}>
                  <div className="text-xs text-slate-500 mb-1">Résultat net cumulé</div>
                  <div className={`text-xl font-black ${cumul.resultat_net>=0?'text-green-700':'text-red-600'}`}>
                    {cumul.resultat_net>=0?'+':''}{fmt(cumul.resultat_net)}
                  </div>
                  <div className="text-xs text-slate-400">Marge: {cumul.total_produits>0?Math.round(cumul.resultat_net/cumul.total_produits*100):0}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div className="card p-5">
                  <h3 className="font-bold text-sm mb-3 text-green-700">Détail produits</h3>
                  {Object.entries(cumul.detail_produits).map(([k,v]:any)=>(
                    <div key={k} className="flex justify-between py-1 border-b border-slate-50 text-sm">
                      <span className="text-slate-600 capitalize">{k.replace(/_/g,' ')}</span>
                      <span className="font-bold text-green-600">{fmt(v)}</span>
                    </div>
                  ))}
                </div>
                <div className="card p-5">
                  <h3 className="font-bold text-sm mb-3 text-red-600">Détail charges</h3>
                  {Object.entries(cumul.detail_charges).map(([k,v]:any)=>(
                    <div key={k} className="flex justify-between py-1 border-b border-slate-50 text-sm">
                      <span className="text-slate-600 capitalize">{k.replace(/_/g,' ')}</span>
                      <span className="font-bold text-red-500">-{fmt(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 font-bold text-sm">Évolution mensuelle</div>
                <table className="tbl w-full">
                  <thead><tr><th>Mois</th><th className="text-right">Produits</th><th className="text-right">Charges</th><th className="text-right">Résultat</th><th>Statut</th></tr></thead>
                  <tbody>
                    {cumul.bilans_mensuels.map((b:any)=>(
                      <tr key={`${b.mois}-${b.annee}`}>
                        <td className="font-semibold">{MOIS_NOMS[b.mois]} {b.annee}</td>
                        <td className="text-right text-green-600 font-bold">{fmt(b.produits)}</td>
                        <td className="text-right text-red-500 font-bold">-{fmt(b.charges)}</td>
                        <td className={`text-right font-extrabold ${b.resultat>=0?'text-green-700':'text-red-600'}`}>{b.resultat>=0?'+':''}{fmt(b.resultat)}</td>
                        <td><span className={`badge ${b.statut==='valide'?'badge-green':'badge-yellow'} text-[10px]`}>{b.statut}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CONFIGURATION ── */}
      {onglet === 'config' && (
        <div>
          <h2 className="font-extrabold text-[15px] mb-5">Configuration — Règles & Tarifs</h2>
          <div className="grid grid-cols-2 gap-5">
            {/* Règles de partage */}
            <div className="card p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><i className="fa-solid fa-percent text-[#1641C8]"/>Règles de partage médecins</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-slate-400 font-bold uppercase"><th className="pb-2 text-left">Type</th><th className="pb-2 text-left">Acte</th><th className="pb-2 text-center">% Médecin</th><th className="pb-2 text-center">% Clinique</th></tr></thead>
                <tbody>
                  {regles.map((r:any)=>(
                    <tr key={r.id} className="border-t border-slate-50">
                      <td className="py-1.5 text-xs font-semibold text-slate-600">{r.type_medecin}</td>
                      <td className="py-1.5 text-xs text-slate-500">{r.type_acte}</td>
                      <td className="py-1.5 text-center">
                        <input type="number" defaultValue={r.pct_medecin} min={0} max={100}
                          onBlur={e=>updateRegle(r.id,Number(e.target.value))}
                          className="w-16 text-center border border-slate-200 rounded-lg px-1 py-0.5 text-xs font-bold focus:border-[#1641C8] outline-none"/>
                      </td>
                      <td className="py-1.5 text-center text-xs font-bold text-green-600">{100-r.pct_medecin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarifs configurables */}
            <div className="card p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><i className="fa-solid fa-tag text-orange-500"/>Tarifs configurables</h3>
              <div className="space-y-2">
                {tarifs.map((t:any)=>(
                  <div key={t.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-50">
                    <span className="text-xs text-slate-600 flex-1">{t.libelle}</span>
                    <div className="flex items-center gap-1.5">
                      <input type="number" defaultValue={t.montant} min={0}
                        onBlur={e=>updateTarif(t.code,Number(e.target.value))}
                        className="w-24 text-right border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold focus:border-[#1641C8] outline-none"/>
                      <span className="text-xs text-slate-400">{t.unite==='pct'?'%':t.unite==='jour'?'HTG/j':t.unite==='mois'?'HTG/mois':'HTG'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
