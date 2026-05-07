'use client'
import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Plus, Trash2, Brain, TrendingUp, TrendingDown, FileText, Users, Building, Calculator, ChevronDown, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'

const ONGLETS = [
  { id: 'journal',     label: 'Journal',       icon: 'fa-list' },
  { id: 'actes',       label: 'Actes & Répart.', icon: 'fa-stethoscope' },
  { id: 'decaissements',label:'Décaissements', icon: 'fa-money-bill-transfer' },
  { id: 'exploitants', label: 'Exploitants',   icon: 'fa-building' },
  { id: 'optometrie',  label: 'Optométrie',    icon: 'fa-glasses' },
  { id: 'bilan',       label: 'Bilan',         icon: 'fa-chart-bar' },
  { id: 'cumul',       label: 'Cumulatif',     icon: 'fa-chart-line' },
  { id: 'grand_livre', label: 'Grand Livre',   icon: 'fa-book' },
  { id: 'balance',     label: 'Balance',       icon: 'fa-scale-balanced' },
  { id: 'ai_compta',   label: '🤖 Rapport IA', icon: 'fa-robot' },
  { id: 'config',      label: 'Configuration', icon: 'fa-gear' },
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
  const [grandLivre, setGrandLivre] = useState<any>(null)
  const [balance, setBalance] = useState<any>(null)
  const [aiRapport, setAiRapport] = useState<string>('')
  const [aiDonnees, setAiDonnees] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiType, setAiType] = useState('mensuel')
  const [glCompte, setGlCompte] = useState('')
  const [glLoading, setGlLoading] = useState(false)
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

  const { register, handleSubmit, watch, reset } = useForm({ defaultValues: { type:'recette', mode_paiement:'Espèces', date_mouvement: new Date().toISOString().slice(0,16), categorie: '', description: '', montant: 0, notes: '' } })
  const { register: regActe, handleSubmit: subActe, watch: watchActe, reset: resetActe } = useForm()
  const { register: regDec, handleSubmit: subDec, reset: resetDec } = useForm({ defaultValues: { medecin_id: '', medecin_nom: '', montant: 0, motif: '', mode_paiement:'Espèces' } })
  const { register: regExplo, handleSubmit: subExplo, reset: resetExplo } = useForm({ defaultValues: { medecin_id: '', patient_nom: '', montant: 0, description: '', mode_paiement:'Espèces', flux_direct: false } })

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
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      if (detail?.includes('clôtur')) toast.error("Période comptable clôturée — impossible d'enregistrer")
      else toast.error(detail || 'Erreur enregistrement')
    }
  }

  const onSubmitActe = async (data: any) => {
    try {
      const res = await api.post('/actes-facturables', { ...data, montant_total: Number(data.montant_total) })
      toast.success(`Acte enregistré — Part clinique: ${fmt(res.data.repartition?.montant_clinique || 0)}`)
      resetActe(); setShowActeForm(false); loadAll()
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur enregistrement acte') }
  }

  const onSubmitDec = async (data: any) => {
    try {
      await api.post('/admin/decaissements', { ...data, montant: Number(data.montant) })
      toast.success('Décaissement enregistré')
      resetDec({ mode_paiement:'Espèces' }); setShowDecForm(false); loadAll()
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur décaissement') }
  }

  const onSubmitExplo = async (data: any) => {
    try {
      await api.post('/caissier/paiement-exploitant', { ...data, montant: Number(data.montant), flux_direct: data.flux_direct === 'true' || data.flux_direct === true })
      toast.success('Paiement exploitant enregistré')
      resetExplo({ mode_paiement:'Espèces', flux_direct: false }); setShowExploForm(false); loadAll()
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur paiement exploitant') }
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
      {/* ── GRAND LIVRE ── */}
      {onglet === 'grand_livre' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[15px] flex items-center gap-2">
              <i className="fa-solid fa-book text-[#1641C8]"/>Grand Livre PCN — {MOIS_NOMS[moisBilan]} {anneeBilan}
            </h2>
            <div className="flex gap-2 items-center">
              <input value={glCompte} onChange={e=>setGlCompte(e.target.value)} placeholder="Filtrer par compte (ex: 511)" className="input w-36 py-1.5 text-xs"/>
              <button disabled={glLoading} onClick={async()=>{
                setGlLoading(true)
                try {
                  const r = await api.get('/admin/grand-livre',{params:{mois:moisBilan,annee:anneeBilan,compte:glCompte||undefined}})
                  setGrandLivre(r.data)
                } catch(e:any){toast.error(e?.response?.data?.detail||'Erreur')}
                finally{setGlLoading(false)}
              }} className="btn-primary py-2">{glLoading?'⏳ Chargement...':'🔍 Charger le Grand Livre'}</button>
              {grandLivre && <button onClick={()=>window.print()} className="btn-ghost py-2"><i className="fa-solid fa-print mr-1"/>Imprimer</button>}
            </div>
          </div>

          {grandLivre && (
            <div id="grand-livre-print">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="kpi-card"><div className="text-xl font-black text-green-600">+{(grandLivre.total_recettes||0).toLocaleString('fr')} HTG</div><div className="text-xs text-slate-500">Total Produits (Cl. 7)</div></div>
                <div className="kpi-card"><div className="text-xl font-black text-red-500">-{(grandLivre.total_charges||0).toLocaleString('fr')} HTG</div><div className="text-xs text-slate-500">Total Charges (Cl. 6)</div></div>
                <div className="kpi-card"><div className={`text-xl font-black ${grandLivre.total_recettes-grandLivre.total_charges>=0?'text-[#1641C8]':'text-red-600'}`}>{((grandLivre.total_recettes||0)-(grandLivre.total_charges||0)).toLocaleString('fr')} HTG</div><div className="text-xs text-slate-500">Résultat ({grandLivre.nb_ecritures} écritures)</div></div>
              </div>

              {/* Balance par compte */}
              {grandLivre.comptes?.length > 0 && (
                <div className="card mb-5 overflow-hidden">
                  <div className="px-5 py-3 bg-[#0f172a] text-white font-bold text-sm">Soldes par compte PCN</div>
                  <table className="tbl w-full">
                    <thead><tr><th>Compte</th><th className="text-right">Total Débit</th><th className="text-right">Total Crédit</th><th className="text-right">Solde</th><th>Nb écritures</th></tr></thead>
                    <tbody>
                      {grandLivre.comptes.sort((a:any,b:any)=>a.compte.localeCompare(b.compte)).map((c:any)=>(
                        <tr key={c.compte} className={`${c.compte.startsWith('7')?'bg-green-50':c.compte.startsWith('6')?'bg-red-50':c.compte.startsWith('5')?'bg-blue-50':''}`}>
                          <td className="font-mono font-bold text-[#1641C8]">{c.compte}</td>
                          <td className="text-right font-mono text-green-700">{c.total_debit.toLocaleString('fr')}</td>
                          <td className="text-right font-mono text-red-600">{c.total_credit.toLocaleString('fr')}</td>
                          <td className={`text-right font-extrabold font-mono ${c.solde>=0?'text-green-700':'text-red-600'}`}>{c.solde>=0?'+':''}{c.solde.toLocaleString('fr')}</td>
                          <td className="text-center text-xs text-slate-400">{c.nb_ecritures}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Journal détaillé */}
              <div className="card overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 font-bold text-sm flex items-center justify-between">
                  <span>Écritures détaillées ({grandLivre.ecritures?.length} lignes)</span>
                </div>
                <div style={{maxHeight:400,overflowY:'auto'}}>
                  <table className="tbl w-full">
                    <thead style={{position:'sticky',top:0,background:'white',zIndex:1}}><tr><th>Pièce</th><th>Date</th><th>Jnl</th><th>Débit</th><th>Crédit</th><th>Description</th><th className="text-right">Montant</th><th>Ref.</th></tr></thead>
                    <tbody>
                      {grandLivre.ecritures?.map((e:any)=>(
                        <tr key={e.id} className={`${e.type==='recette'?'':'bg-red-50/30'}`}>
                          <td className="font-mono text-[10px] text-[#1641C8]">{e.numero_piece}</td>
                          <td className="text-[10px] text-slate-400">{e.date}</td>
                          <td><span className="badge badge-gray text-[9px]">{e.journal}</span></td>
                          <td className="font-mono text-[11px] text-green-700 font-bold">{e.compte_debit}</td>
                          <td className="font-mono text-[11px] text-red-500 font-bold">{e.compte_credit}</td>
                          <td className="text-xs max-w-[200px] truncate">{e.description}</td>
                          <td className={`text-right font-mono text-sm font-bold ${e.type==='recette'?'text-green-600':'text-red-500'}`}>{e.montant.toLocaleString('fr')}</td>
                          <td className="text-[10px] text-slate-400 max-w-[80px] truncate">{e.reference||'—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {!grandLivre && !glLoading && (
            <div className="card p-12 text-center text-slate-300">
              <i className="fa-solid fa-book text-5xl mb-4"/>
              <p className="text-sm">Cliquez sur "Charger le Grand Livre" pour afficher toutes les écritures PCN</p>
            </div>
          )}
        </div>
      )}

      {/* ── BALANCE DE VÉRIFICATION ── */}
      {onglet === 'balance' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[15px] flex items-center gap-2">
              <i className="fa-solid fa-scale-balanced text-[#1641C8]"/>Balance de vérification — {MOIS_NOMS[moisBilan]} {anneeBilan}
            </h2>
            <div className="flex gap-2">
              <button onClick={async()=>{
                try{
                  const r = await api.get('/admin/balance-verification',{params:{mois:moisBilan,annee:anneeBilan}})
                  setBalance(r.data)
                  if(r.data.equilibre) toast.success('Balance équilibrée ✓')
                  else toast.error('⚠️ Déséquilibre détecté!')
                }catch(e:any){toast.error(e?.response?.data?.detail||'Erreur')}
              }} className="btn-primary py-2"><i className="fa-solid fa-calculator mr-2"/>Vérifier la balance</button>
              {balance && <button onClick={()=>window.print()} className="btn-ghost py-2"><i className="fa-solid fa-print mr-1"/>Imprimer</button>}
            </div>
          </div>

          {balance && (
            <div id="balance-print">
              {/* Statut global */}
              <div className={`card p-5 mb-5 border-2 ${balance.equilibre?'border-green-300 bg-green-50':'border-red-300 bg-red-50'}`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{balance.equilibre?'✅':'⚠️'}</span>
                  <div>
                    <div className={`font-extrabold text-lg ${balance.equilibre?'text-green-700':'text-red-600'}`}>{balance.message}</div>
                    <div className="text-sm text-slate-600 mt-1">{balance.nb_ecritures} écritures · Total Débit = Total Crédit = {balance.total_debit.toLocaleString('fr')} HTG</div>
                    {!balance.equilibre && <div className="text-sm font-bold text-red-600 mt-1">Écart: {balance.ecart.toLocaleString('fr')} HTG — Vérification comptable requise</div>}
                  </div>
                </div>
              </div>

              {/* Par classe PCN */}
              <div className="card overflow-hidden mb-5">
                <div className="px-5 py-3 bg-[#0f172a] text-white font-bold text-sm">Soldes par classe PCN</div>
                <table className="tbl w-full">
                  <thead><tr><th>Classe PCN</th><th>Libellé</th><th className="text-right">Total Débit</th><th className="text-right">Total Crédit</th><th className="text-right">Solde</th></tr></thead>
                  <tbody>
                    {balance.par_classe?.map((c:any)=>{
                      const libelles: Record<string,string> = {'1':'Capitaux permanents','2':'Immobilisations','3':'Stocks','4':'Tiers','5':'Trésorerie','6':'Charges','7':'Produits','8':'Résultats','?':'Non classifié'}
                      const solde = (c.debit||0)-(c.credit||0)
                      return (
                        <tr key={c.classe} className={`${c.classe==='7'?'bg-green-50':c.classe==='6'?'bg-red-50':c.classe==='5'?'bg-blue-50':''}`}>
                          <td className="font-mono font-extrabold text-[#1641C8]">Classe {c.classe}</td>
                          <td className="text-sm text-slate-600">{libelles[c.classe]||'—'}</td>
                          <td className="text-right font-mono text-green-700">{(c.debit||0).toLocaleString('fr')} HTG</td>
                          <td className="text-right font-mono text-red-500">{(c.credit||0).toLocaleString('fr')} HTG</td>
                          <td className={`text-right font-extrabold font-mono ${solde>=0?'text-slate-800':'text-red-600'}`}>{solde>=0?'+':''}{solde.toLocaleString('fr')} HTG</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-extrabold">
                      <td colSpan={2} className="px-4 py-3">TOTAL GÉNÉRAL</td>
                      <td className="text-right px-4 py-3 font-mono text-green-700">{balance.total_debit.toLocaleString('fr')} HTG</td>
                      <td className="text-right px-4 py-3 font-mono text-red-500">{balance.total_credit.toLocaleString('fr')} HTG</td>
                      <td className="text-right px-4 py-3 font-mono text-[#1641C8]">0 HTG</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
          {!balance && (
            <div className="card p-12 text-center text-slate-300">
              <i className="fa-solid fa-scale-balanced text-5xl mb-4"/>
              <p className="text-sm">Cliquez sur "Vérifier la balance" pour contrôler la partie double</p>
              <p className="text-xs mt-1 text-slate-400">Norme PCN Haïti — Débit = Crédit toujours</p>
            </div>
          )}
        </div>
      )}

      {/* ── RAPPORT IA COMPTABLE ── */}
      {onglet === 'ai_compta' && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-extrabold text-[15px] flex items-center gap-2">
              <span>🤖</span>Assistant comptable IA — {MOIS_NOMS[moisBilan]} {anneeBilan}
            </h2>
            <div className="flex gap-2 items-center flex-wrap">
              <select value={aiType} onChange={e=>setAiType(e.target.value)} className="input w-52 py-1.5 text-xs">
                <option value="mensuel">📊 Rapport mensuel complet</option>
                <option value="flux_tresorerie">💰 Flux trésorerie (IAS 7)</option>
                <option value="bilan_patrimonial">🏦 Bilan patrimonial</option>
                <option value="annuel">📈 Synthèse annuelle</option>
              </select>
              <button disabled={aiLoading} onClick={async()=>{
                setAiLoading(true); setAiRapport(''); setAiDonnees(null)
                try{
                  const r = await api.post('/admin/comptable-ai',{mois:moisBilan,annee:anneeBilan,type:aiType})
                  setAiRapport(r.data.rapport)
                  setAiDonnees(r.data.donnees)
                  if(r.data.anomalies?.length>0) toast.error(`⚠️ ${r.data.anomalies.length} anomalie(s) détectée(s)`)
                  else toast.success('Rapport IA généré ✓')
                }catch(e:any){toast.error(e?.response?.data?.detail||'Erreur IA')}
                finally{setAiLoading(false)}
              }} className="btn-primary py-2">
                {aiLoading ? '⏳ Analyse IA...' : '🤖 Générer le rapport IA'}
              </button>
              {aiRapport && (
                <button onClick={()=>{
                  const d = aiDonnees
                  const w = window.open('','_blank','width=820,height=1050')
                  if(!w) { alert("Autorisez les popups pour imprimer"); return }
                  const lignesProduits = d?.recettes_par_service
                    ? Object.entries(d.recettes_par_service).sort((a:any,b:any)=>b[1]-a[1])
                        .map(([k,v]:any)=>`<tr><td>${k}</td><td style="text-align:right;font-weight:700;color:#16a34a">${(v||0).toLocaleString('fr')} HTG</td><td style="text-align:right">${d.total_produits>0?((v/d.total_produits)*100).toFixed(1):'0'}%</td></tr>`).join('')
                    : ''
                  const lignesCharges = d?.charges_par_categorie
                    ? Object.entries(d.charges_par_categorie).sort((a:any,b:any)=>b[1]-a[1])
                        .map(([k,v]:any)=>`<tr><td>${k}</td><td style="text-align:right;font-weight:700;color:#dc2626">${(v||0).toLocaleString('fr')} HTG</td></tr>`).join('')
                    : ''
                  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Rapport Comptable ${MOIS_NOMS[moisBilan]} ${anneeBilan}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;padding:24px;color:#1e293b;font-size:13px;line-height:1.6}
.header{text-align:center;border-bottom:3px solid #1641C8;padding-bottom:14px;margin-bottom:20px}
.clinic{font-size:22px;font-weight:900;color:#1641C8}
.sub{font-size:11px;color:#64748b;margin-top:3px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
.kpi{border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center;background:#f8fafc}
.kpi-val{font-size:16px;font-weight:900}.kpi-lbl{font-size:9px;color:#64748b;margin-top:3px;text-transform:uppercase}
.green{color:#16a34a}.red{color:#dc2626}.blue{color:#1641C8}
.section{margin-bottom:20px}
.section-title{font-size:12px;font-weight:700;color:#1641C8;border-bottom:2px solid #dbeafe;padding-bottom:6px;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}
.rapport-text{white-space:pre-wrap;line-height:1.9;font-size:13px;background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e2e8f0}
table{width:100%;border-collapse:collapse;font-size:12px;margin-top:6px}
th{background:#f1f5f9;padding:7px 10px;text-align:left;font-size:11px;color:#64748b;border-bottom:2px solid #e2e8f0}
td{padding:7px 10px;border-bottom:1px solid #f1f5f9}
.footer{text-align:center;font-size:9px;color:#94a3b8;margin-top:20px;padding-top:12px;border-top:1px solid #e2e8f0;line-height:1.8}
.btn-print{display:block;width:100%;padding:11px;background:#1641C8;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:700;margin-top:16px}
@media print{.btn-print{display:none!important} body{padding:8px}}
</style></head><body>
<div class="header">
  <div class="clinic">🏥 CLINIQUE DE LA REBECCA</div>
  <div class="sub">#44 Rue Rebecca, Pétion-Ville · (509) 4858-5757</div>
  <div class="sub" style="font-weight:700;color:#374151;margin-top:8px;font-size:13px">RAPPORT COMPTABLE — ${MOIS_NOMS[moisBilan].toUpperCase()} ${anneeBilan}</div>
  <div class="sub">Généré le ${new Date().toLocaleDateString('fr-FR')} · Assistant IA Comptable · PCN Haïti</div>
</div>
${d?`<div class="kpis">
  <div class="kpi"><div class="kpi-val green">+${(d.total_produits||0).toLocaleString('fr')} HTG</div><div class="kpi-lbl">Total Produits</div></div>
  <div class="kpi"><div class="kpi-val red">-${(d.total_charges||0).toLocaleString('fr')} HTG</div><div class="kpi-lbl">Total Charges</div></div>
  <div class="kpi"><div class="kpi-val ${(d.resultat_net||0)>=0?'green':'red'}">${(d.resultat_net||0)>=0?'+':''}${(d.resultat_net||0).toLocaleString('fr')} HTG</div><div class="kpi-lbl">Résultat Net (${d.ratio_marge||0}%)</div></div>
  <div class="kpi"><div class="kpi-val blue">${d.nb_patients||0}</div><div class="kpi-lbl">Patients · ${d.nb_transactions||0} trans.</div></div>
</div>`:''}
<div class="section">
  <div class="section-title">Rapport de l'Assistant Comptable IA</div>
  <div class="rapport-text">${aiRapport}</div>
</div>
${lignesProduits?`<div class="section">
  <div class="section-title">Détail des Produits — Classe 7 PCN</div>
  <table><thead><tr><th>Service</th><th style="text-align:right">Montant HTG</th><th style="text-align:right">%</th></tr></thead>
  <tbody>${lignesProduits}</tbody></table>
</div>`:''}
${lignesCharges?`<div class="section">
  <div class="section-title">Détail des Charges — Classe 6 PCN</div>
  <table><thead><tr><th>Catégorie</th><th style="text-align:right">Montant HTG</th></tr></thead>
  <tbody>${lignesCharges}</tbody></table>
</div>`:''}
<div class="footer">
  Rapport généré automatiquement par l'Assistant IA Comptable de la Clinique de la Rebecca<br>
  Conformité : Plan Comptable National Haïtien (PCN) · IFRS pour PME · DGI · OFATMA<br>
  Ce rapport est indicatif — une vérification par un expert-comptable est recommandée avant toute décision
</div>
<button class="btn-print" onclick="window.print()">🖨 Imprimer le rapport comptable</button>
</body></html>`)
                  w.document.close(); w.focus(); setTimeout(()=>w.print(), 500)
                }} className="btn-ghost py-2 flex items-center gap-1">
                  <i className="fa-solid fa-print"/>Imprimer
                </button>
              )}
            </div>
          </div>

          {/* KPIs */}
          {aiDonnees && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="kpi-card"><div className="text-xl font-black text-green-600">+{(aiDonnees.total_produits||0).toLocaleString('fr')} HTG</div><div className="text-xs text-slate-500">Total Produits</div></div>
              <div className="kpi-card"><div className="text-xl font-black text-red-500">-{(aiDonnees.total_charges||0).toLocaleString('fr')} HTG</div><div className="text-xs text-slate-500">Total Charges</div></div>
              <div className="kpi-card"><div className={`text-xl font-black ${(aiDonnees.resultat_net||0)>=0?'text-[#1641C8]':'text-red-600'}`}>{(aiDonnees.resultat_net||0)>=0?'+':''}{(aiDonnees.resultat_net||0).toLocaleString('fr')} HTG</div><div className="text-xs text-slate-500">Résultat Net ({aiDonnees.ratio_marge||0}%)</div></div>
              <div className="kpi-card"><div className="text-xl font-black text-purple-600">{aiDonnees.nb_patients||0}</div><div className="text-xs text-slate-500">{aiDonnees.nb_transactions||0} transactions</div></div>
            </div>
          )}
          {aiDonnees?.anomalies_count > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">
              ⚠️ {aiDonnees.anomalies_count} anomalie(s) comptable(s) détectée(s) — vérifiez les écritures PCN
            </div>
          )}

          {/* Rapport IA */}
          {aiRapport ? (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <div>
                  <div className="font-extrabold text-[#1641C8] text-base">CLINIQUE DE LA REBECCA</div>
                  <div className="text-xs text-slate-500">Rapport IA — {MOIS_NOMS[moisBilan]} {anneeBilan} · PCN Haïti · IFRS PME</div>
                </div>
                <div className="text-xs text-slate-400">Généré le {new Date().toLocaleDateString('fr-FR')}</div>
              </div>
              <div style={{whiteSpace:'pre-wrap',lineHeight:1.9,fontSize:14,color:'#1e293b'}}>{aiRapport}</div>
              {aiDonnees?.recettes_par_service && Object.keys(aiDonnees.recettes_par_service).length > 0 && (
                <div className="mt-5 pt-4 border-t">
                  <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Produits par service (Classe 7 PCN)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(aiDonnees.recettes_par_service).sort((a:any,b:any)=>b[1]-a[1]).map(([k,v]:any)=>(
                      <div key={k} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg gap-2">
                        <span className="text-slate-600 truncate">{k}</span>
                        <span className="font-bold text-green-700 whitespace-nowrap">+{(v||0).toLocaleString('fr')} HTG</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 pt-3 border-t text-[10px] text-slate-400 text-center">
                Rapport généré par assistant IA · PCN Haïti · IFRS pour PME · Vérification recommandée
              </div>
            </div>
          ) : !aiLoading && (
            <div className="card p-12 text-center">
              <span className="text-5xl">🤖</span>
              <p className="text-sm mt-4 text-slate-500 font-medium">Sélectionnez le type de rapport et cliquez sur "Générer"</p>
              <p className="text-xs mt-2 text-slate-400">L'IA analyse: recettes par service, charges, trésorerie PCN, activité clinique, anomalies</p>
              <p className="text-xs text-slate-400">Normes: PCN Haïti · IFRS pour PME · DGI · OFATMA</p>
            </div>
          )}
          {aiLoading && (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-sm font-bold text-[#1641C8]">Analyse comptable en cours...</p>
              <p className="text-xs text-slate-400 mt-2">L'assistant collecte et analyse toutes les données financières du mois</p>
            </div>
          )}
        </div>
      )}

            {onglet === 'config' && (
        <div>
          <h2 className="font-extrabold text-[15px] mb-2">Configuration — Règles de répartition</h2>
          <p className="text-slate-400 text-xs mb-5">Ces règles sont appliquées automatiquement lors de l'enregistrement de chaque acte médical.</p>

          {/* Tableau récapitulatif des règles */}
          <div className="card p-5 mb-5">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <i className="fa-solid fa-percent text-[#1641C8]"/>Règles de répartition par type de médecin
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 font-bold uppercase border-b border-slate-100">
                    <th className="pb-3 text-left">Type</th>
                    <th className="pb-3 text-center">Consultations</th>
                    <th className="pb-3 text-center">Gestes médicaux</th>
                    <th className="pb-3 text-center">Chirurgies</th>
                    <th className="pb-3 text-left">Loyer / Particularité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#1641C8] flex items-center justify-center text-xs"><i className="fa-solid fa-chart-line"/></div>
                        <span className="font-bold text-[13px] text-slate-800">Investisseur</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-green text-[11px]">70% médecin</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">30% clinique</div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-green text-[11px]">80% médecin</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">20% clinique</div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-gray text-[11px]">Manuel</span>
                    </td>
                    <td className="py-3 text-[12px] text-slate-500">Aucun loyer</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-xs"><i className="fa-solid fa-handshake"/></div>
                        <span className="font-bold text-[13px] text-slate-800">Affilié</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-green text-[11px]">60% médecin</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">40% clinique</div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-green text-[11px]">70% médecin</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">30% clinique</div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-gray text-[11px]">Manuel</span>
                    </td>
                    <td className="py-3 text-[12px] text-slate-500">Aucun loyer</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs"><i className="fa-solid fa-building"/></div>
                        <span className="font-bold text-[13px] text-slate-800">Exploitant</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-blue text-[11px]">100% médecin</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-blue text-[11px]">100% médecin</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-blue text-[11px]">100% médecin</span>
                    </td>
                    <td className="py-3 text-[12px] text-slate-500">Loyer fixe mensuel ↓</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs"><i className="fa-solid fa-star"/></div>
                        <span className="font-bold text-[13px] text-slate-800">Invest.-Exploitant</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-blue text-[11px]">100% médecin</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-blue text-[11px]">100% médecin</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-blue text-[11px]">100% médecin</span>
                    </td>
                    <td className="py-3 text-[12px] text-slate-500">Loyer fixe mensuel ↓</td>
                  </tr>
                  <tr>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs"><i className="fa-solid fa-glasses"/></div>
                        <span className="font-bold text-[13px] text-slate-800">Optométrie</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-blue text-[11px]">65% médecin</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">35% clinique</div>
                    </td>
                    <td className="py-3 text-center text-slate-400 text-xs">—</td>
                    <td className="py-3 text-center text-slate-400 text-xs">—</td>
                    <td className="py-3 text-[12px] text-slate-500">13% ventes montures · min mensuel ↓</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 bg-blue-50 rounded-xl p-3 text-xs text-[#1641C8] font-medium flex items-start gap-2">
              <i className="fa-solid fa-info-circle mt-0.5 flex-shrink-0"/>
              Pour modifier les pourcentages : contactez l'administrateur système. Les règles de partage sont configurées dans le backend via la table <code className="bg-blue-100 px-1 rounded">regles_partage</code>.
            </div>
          </div>

          {/* Loyers fixes */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="card p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <i className="fa-solid fa-building text-orange-500"/>Loyers fixes mensuels (Exploitants)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Ces montants sont comptabilisés comme revenus de la clinique chaque mois, indépendamment des actes.
              </p>
              <div className="space-y-2">
                {tarifs.filter((t:any)=>t.code?.includes('loyer') || t.unite==='mois').map((t:any)=>(
                  <div key={t.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50">
                    <div>
                      <div className="text-xs font-bold text-slate-700">{t.libelle}</div>
                      <div className="text-[10px] text-slate-400">Loyer mensuel fixe</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input type="number" defaultValue={t.montant} min={0}
                        onBlur={e=>updateTarif(t.code,Number(e.target.value))}
                        className="w-28 text-right border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:border-[#1641C8] outline-none"/>
                      <span className="text-xs text-slate-400">HTG/mois</span>
                    </div>
                  </div>
                ))}
                {tarifs.filter((t:any)=>t.code?.includes('loyer') || t.unite==='mois').length === 0 && (
                  <p className="text-xs text-slate-300 text-center py-4">Aucun loyer configuré</p>
                )}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <i className="fa-solid fa-tag text-[#1641C8]"/>Autres tarifs configurables
              </h3>
              <div className="space-y-2">
                {tarifs.filter((t:any)=>!t.code?.includes('loyer') && t.unite!=='mois').map((t:any)=>(
                  <div key={t.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-50">
                    <span className="text-xs text-slate-600 flex-1">{t.libelle}</span>
                    <div className="flex items-center gap-1.5">
                      <input type="number" defaultValue={t.montant} min={0}
                        onBlur={e=>updateTarif(t.code,Number(e.target.value))}
                        className="w-24 text-right border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold focus:border-[#1641C8] outline-none"/>
                      <span className="text-xs text-slate-400">{t.unite==='pct'?'%':t.unite==='jour'?'HTG/j':'HTG'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Règles modifiables depuis le backend */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <i className="fa-solid fa-sliders text-slate-500"/>Règles ajustables (depuis le backend)
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 font-bold uppercase">
                  <th className="pb-2 text-left">Type médecin</th>
                  <th className="pb-2 text-left">Type acte</th>
                  <th className="pb-2 text-center">% Médecin</th>
                  <th className="pb-2 text-center">% Clinique</th>
                </tr>
              </thead>
              <tbody>
                {regles.map((r:any)=>(
                  <tr key={r.id} className="border-t border-slate-50">
                    <td className="py-1.5 text-xs font-semibold text-slate-600 capitalize">{r.type_medecin?.replace('_',' ')}</td>
                    <td className="py-1.5 text-xs text-slate-500 capitalize">{r.type_acte}</td>
                    <td className="py-1.5 text-center">
                      <input type="number" defaultValue={r.pct_medecin} min={0} max={100}
                        onBlur={e=>updateRegle(r.id,Number(e.target.value))}
                        className="w-16 text-center border border-slate-200 rounded-lg px-1 py-0.5 text-xs font-bold focus:border-[#1641C8] outline-none"/>
                    </td>
                    <td className="py-1.5 text-center text-xs font-bold text-green-600">{100-r.pct_medecin}%</td>
                  </tr>
                ))}
                {regles.length===0&&<tr><td colSpan={4} className="text-center py-6 text-slate-300 text-xs">Aucune règle configurée dans le backend</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
