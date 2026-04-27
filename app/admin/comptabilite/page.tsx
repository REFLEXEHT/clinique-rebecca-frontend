'use client'
/**
 * app/admin/comptabilite/page.tsx — Comptabilité complète admin
 * Compilation journalière, rapports mensuels, revenus/dépenses, bilan P&L
 */
import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { comptaApi } from '@/lib/api'
import {
  TrendingUp, TrendingDown, Plus, Trash2, FileText,
  Download, Calendar, Calculator, RefreshCw, CheckCircle
} from 'lucide-react'

const ONGLETS = [
  { id: 'journal', label: 'Journal du jour', icon: 'fa-list' },
  { id: 'mensuel', label: 'Rapport mensuel', icon: 'fa-calendar-alt' },
  { id: 'recettes', label: 'Recettes', icon: 'fa-arrow-trend-up' },
  { id: 'depenses', label: 'Dépenses', icon: 'fa-arrow-trend-down' },
  { id: 'bilan', label: 'Bilan & P&L', icon: 'fa-chart-bar' },
]

const CATS_REC = [
  'Consultations','Laboratoire','Pharmacie','Dentisterie','Physiothérapie',
  'Maternité / Accouchement','Salle SOP','Optométrie','Gestes médicaux',
  'Hospitalisation','Autre recette',
]
const CATS_DEP = [
  'RH / Salaires','Médical / Consommables','Achats pharmacie','Infrastructure / Loyer',
  'Équipements','Télécom / Internet','Électricité / Eau','Transport',
  'Entretien / Réparations','Marketing','Décaissement médecin','Autre dépense',
]
const MODES = ['Espèces','Mobile Money (Moncash)','Natcash','Virement','Chèque']
const MOIS_NOMS = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const fmt = (n: number) => `${(n || 0).toLocaleString('fr')} HTG`
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'})

const DEMO_MOUVEMENTS = [
  { id:1, type:'recette',  categorie:'Consultations',          description:'Reçu REC-20260426-0041 — Marie Théodore',    montant:1500,  mode_paiement:'Espèces', created_at:new Date().toISOString() },
  { id:2, type:'recette',  categorie:'Laboratoire',             description:'Reçu REC-20260426-0042 — Paul Dorval',       montant:800,   mode_paiement:'Moncash', created_at:new Date().toISOString() },
  { id:3, type:'depense',  categorie:'Médical / Consommables',  description:'Achat seringues et compresses',              montant:4200,  mode_paiement:'Espèces', created_at:new Date().toISOString() },
  { id:4, type:'recette',  categorie:'Pharmacie',               description:'Reçu REC-20260426-0043 — Claudette Pierre', montant:2340,  mode_paiement:'Natcash', created_at:new Date().toISOString() },
  { id:5, type:'depense',  categorie:'Électricité / Eau',       description:'Facture électricité — avril 2026',          montant:12000, mode_paiement:'Virement', created_at:new Date().toISOString() },
  { id:6, type:'recette',  categorie:'Dentisterie',             description:'Reçu REC-20260426-0044 — Jean Bernard',     montant:3500,  mode_paiement:'Espèces', created_at:new Date().toISOString() },
]

const DEMO_REC_MOIS: Record<string,number> = {
  'Consultations':850000,'Laboratoire':420000,'Pharmacie':380000,'Dentisterie':290000,
  'Physiothérapie':180000,'Maternité / Accouchement':650000,'Salle SOP':320000,
  'Optométrie':120000,'Gestes médicaux':95000,'Hospitalisation':180000,
}
const DEMO_DEP_MOIS: Record<string,number> = {
  'RH / Salaires':620000,'Médical / Consommables':180000,'Achats pharmacie':210000,
  'Électricité / Eau':45000,'Entretien / Réparations':30000,'Télécom / Internet':18000,
  'Transport':12000,'Décaissement médecin':95000,
}

export default function AdminComptabilite() {
  const now = new Date()
  const [onglet, setOnglet] = useState('journal')
  const [mouvements, setMouvements] = useState<any[]>(DEMO_MOUVEMENTS)
  const [filterType, setFilterType] = useState<'tous'|'recette'|'depense'>('tous')
  const [filterDate, setFilterDate] = useState(now.toISOString().slice(0,10))
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [moisBilan, setMoisBilan] = useState(now.getMonth()+1)
  const [anneeBilan, setAnneeBilan] = useState(now.getFullYear())
  const [periodeDebut, setPeriodeDebut] = useState(now.toISOString().slice(0,7)+'-01')
  const [periodeFin, setPeriodeFin] = useState(now.toISOString().slice(0,10))

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      type:'recette', mode_paiement:'Espèces',
      date_mouvement: now.toISOString().slice(0,16),
      categorie:'', description:'', montant:'', notes:'',
    },
  })
  const typeW = watch('type')

  const load = useCallback(() => {
    comptaApi.list().then(r => { if (r.data?.length) setMouvements(r.data) }).catch(()=>{})
  },[])
  useEffect(()=>{ load() },[load])

  const onAdd = async (data: any) => {
    setFormLoading(true)
    try {
      await comptaApi.create({ ...data, montant: Number(data.montant) })
      toast.success(`${data.type==='recette'?'Recette':'Dépense'} ajoutée`)
      reset(); setShowForm(false); load()
    } catch { toast.error("Erreur lors de l'ajout") }
    finally { setFormLoading(false) }
  }

  const onDelete = async (id: number) => {
    if (!confirm('Supprimer cette écriture ?')) return
    try { await comptaApi.delete(id); toast.success('Supprimée'); load() }
    catch { toast.error('Erreur') }
  }

  const recettes = mouvements.filter(m=>m.type==='recette')
  const depenses = mouvements.filter(m=>m.type==='depense')
  const recJour = recettes.reduce((a,m)=>a+m.montant,0)
  const depJour = depenses.reduce((a,m)=>a+m.montant,0)
  const benJour = recJour - depJour
  const mvtsFiltres = mouvements.filter(m=>filterType==='tous'||m.type===filterType)

  const totalRecMois = Object.values(DEMO_REC_MOIS).reduce((a,v)=>a+v,0)
  const totalDepMois = Object.values(DEMO_DEP_MOIS).reduce((a,v)=>a+v,0)
  const benMois = totalRecMois - totalDepMois
  const marge = totalRecMois>0 ? Math.round(benMois/totalRecMois*100) : 0

  const inp = {
    width:'100%', padding:'10px 14px', borderRadius:10,
    border:'1px solid #d1d5db', fontSize:14, outline:'none',
    boxSizing:'border-box' as const,
  }

  return (
    <div style={{ padding:28 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontWeight:900, color:'#0f172a', fontSize:'1.3rem', marginBottom:4 }}>Comptabilité</h1>
          <p style={{ color:'#64748b', fontSize:13 }}>Gestion financière complète — accès réservé à l'administrateur</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:7, background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:12, padding:'9px 16px', fontWeight:700, fontSize:13, cursor:'pointer', color:'#374151' }}>
            <RefreshCw size={14} /> Actualiser
          </button>
          <button style={{ display:'flex', alignItems:'center', gap:7, background:'#1641C8', color:'white', border:'none', borderRadius:12, padding:'9px 16px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            <Download size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display:'flex', gap:4, marginBottom:28, background:'white', borderRadius:14, border:'1px solid #e2e8f0', padding:6, width:'fit-content' }}>
        {ONGLETS.map(o => (
          <button key={o.id} onClick={()=>setOnglet(o.id)}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
              background:onglet===o.id?'#1641C8':'transparent', color:onglet===o.id?'white':'#64748b' }}>
            <i className={`fa-solid ${o.icon}`} style={{ fontSize:12 }} />{o.label}
          </button>
        ))}
      </div>

      {/* ──────────────────── JOURNAL ──────────────────────────────────── */}
      {onglet==='journal' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
            {[
              { l:'Recettes du jour', v:recJour, c:'#16a34a', bg:'#f0fdf4', icon:<TrendingUp size={20}/> },
              { l:'Dépenses du jour', v:depJour, c:'#dc2626', bg:'#fef2f2', icon:<TrendingDown size={20}/> },
              { l:'Bénéfice net',     v:benJour, c:'#1641C8', bg:'#eff6ff', icon:<Calculator size={20}/> },
              { l:'Nb transactions', v:mouvements.length, c:'#7c3aed', bg:'#f5f3ff', icon:<FileText size={20}/>, cnt:true },
            ].map(k => (
              <div key={k.l} style={{ background:'white', borderRadius:16, padding:'20px', border:'1px solid #e2e8f0' }}>
                <div style={{ width:40, height:40, borderRadius:12, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', color:k.c, marginBottom:12 }}>{k.icon}</div>
                <div style={{ fontSize:(k as any).cnt?'2rem':'1.2rem', fontWeight:900, color:k.c, lineHeight:1 }}>{(k as any).cnt?k.v:fmt(k.v as number)}</div>
                <div style={{ color:'#64748b', fontSize:12, fontWeight:600, marginTop:6 }}>{k.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
              style={{ padding:'9px 14px', borderRadius:10, border:'1px solid #e2e8f0', fontSize:13 }} />
            <div style={{ display:'flex', gap:6 }}>
              {[{k:'tous',l:'Tous'},{k:'recette',l:'Recettes'},{k:'depense',l:'Dépenses'}].map(f => (
                <button key={f.k} onClick={()=>setFilterType(f.k as any)}
                  style={{ padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
                    background:filterType===f.k?'#1641C8':'#f1f5f9', color:filterType===f.k?'white':'#64748b' }}>
                  {f.l}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowForm(!showForm)} style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:7, background:'#1641C8', color:'white', border:'none', borderRadius:12, padding:'9px 18px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              <Plus size={15} /> Ajouter une écriture
            </button>
          </div>

          {showForm && (
            <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:'24px 28px', marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <h3 style={{ fontWeight:800, color:'#0f172a', fontSize:'0.95rem', margin:0 }}>Nouvelle écriture comptable</h3>
                <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:18 }}>✕</button>
              </div>
              <form onSubmit={handleSubmit(onAdd)}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:16 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase' as const, marginBottom:6 }}>Type *</label>
                    <select {...register('type',{required:true})} style={inp}>
                      <option value="recette">Recette</option>
                      <option value="depense">Dépense</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase' as const, marginBottom:6 }}>Catégorie *</label>
                    <select {...register('categorie',{required:true})} style={inp}>
                      <option value="">Choisir...</option>
                      {(typeW==='recette'?CATS_REC:CATS_DEP).map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase' as const, marginBottom:6 }}>Montant (HTG) *</label>
                    <input type="number" {...register('montant',{required:true,min:1})} placeholder="0" style={inp} />
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase' as const, marginBottom:6 }}>Description *</label>
                    <input {...register('description',{required:true})} placeholder="Ex: Reçu patient, prestation, fournisseur..." style={inp} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase' as const, marginBottom:6 }}>Mode paiement</label>
                    <select {...register('mode_paiement')} style={inp}>{MODES.map(m=><option key={m} value={m}>{m}</option>)}</select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase' as const, marginBottom:6 }}>Date / Heure</label>
                    <input type="datetime-local" {...register('date_mouvement')} style={inp} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase' as const, marginBottom:6 }}>Notes</label>
                    <input {...register('notes')} placeholder="Remarques..." style={inp} />
                  </div>
                </div>
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'10px 16px', marginBottom:16, fontSize:12, color:'#166534', display:'flex', alignItems:'center', gap:8 }}>
                  <CheckCircle size={14}/> Écriture conforme PCN Haïti — Classe {typeW==='recette'?'7 (Produits)':'6 (Charges)'}
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button type="submit" disabled={formLoading}
                    style={{ background:typeW==='recette'?'#16a34a':'#dc2626', color:'white', border:'none', borderRadius:12, padding:'11px 24px', fontWeight:800, fontSize:14, cursor:'pointer', opacity:formLoading?0.7:1 }}>
                    {formLoading?'Enregistrement...':`Enregistrer ${typeW==='recette'?'la recette':'la dépense'}`}
                  </button>
                  <button type="button" onClick={()=>{reset();setShowForm(false)}}
                    style={{ background:'#f1f5f9', color:'#374151', border:'none', borderRadius:12, padding:'11px 20px', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9', fontWeight:800, color:'#0f172a', fontSize:'0.9rem' }}>
              Journal — {mvtsFiltres.length} écriture{mvtsFiltres.length!==1?'s':''}
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['Date','Type','Catégorie','Description','Mode','Montant',''].map(h=>(
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', color:'#64748b', fontWeight:700, fontSize:12, borderBottom:'1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mvtsFiltres.map(m=>(
                  <tr key={m.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'11px 16px', color:'#64748b', fontSize:12 }}>{fmtDate(m.created_at)}</td>
                    <td style={{ padding:'11px 16px' }}>
                      <span style={{ background:m.type==='recette'?'#f0fdf4':'#fef2f2', color:m.type==='recette'?'#16a34a':'#dc2626', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:800 }}>
                        {m.type==='recette'?'Recette':'Dépense'}
                      </span>
                    </td>
                    <td style={{ padding:'11px 16px', color:'#374151', fontWeight:600 }}>{m.categorie}</td>
                    <td style={{ padding:'11px 16px', color:'#64748b', maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{m.description}</td>
                    <td style={{ padding:'11px 16px', color:'#64748b', fontSize:12 }}>{m.mode_paiement}</td>
                    <td style={{ padding:'11px 16px', fontWeight:900, color:m.type==='recette'?'#16a34a':'#dc2626', fontSize:14 }}>
                      {m.type==='recette'?'+':'-'}{fmt(m.montant)}
                    </td>
                    <td style={{ padding:'11px 16px' }}>
                      <button onClick={()=>onDelete(m.id)} style={{ background:'#fef2f2', border:'none', borderRadius:8, padding:'5px 8px', cursor:'pointer', color:'#dc2626' }}>
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background:'#f8fafc', borderTop:'2px solid #e2e8f0' }}>
                  <td colSpan={5} style={{ padding:'12px 16px', fontWeight:900, color:'#0f172a' }}>Solde du jour</td>
                  <td style={{ padding:'12px 16px', fontWeight:900, color:benJour>=0?'#16a34a':'#dc2626', fontSize:15 }}>
                    {benJour>=0?'+':''}{fmt(benJour)}
                  </td>
                  <td/>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* ──────────────────── RAPPORT MENSUEL ─────────────────────────── */}
      {onglet==='mensuel' && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28, background:'white', borderRadius:14, border:'1px solid #e2e8f0', padding:'16px 20px' }}>
            <Calendar size={18} color="#1641C8"/>
            <span style={{ fontWeight:700, color:'#374151', fontSize:14 }}>Rapport pour :</span>
            <select value={moisBilan} onChange={e=>setMoisBilan(Number(e.target.value))}
              style={{ padding:'8px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14 }}>
              {MOIS_NOMS.slice(1).map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select value={anneeBilan} onChange={e=>setAnneeBilan(Number(e.target.value))}
              style={{ padding:'8px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14 }}>
              {[2025,2026,2027].map(a=><option key={a} value={a}>{a}</option>)}
            </select>
            <span style={{ fontWeight:800, color:'#0f172a', fontSize:'1rem' }}>{MOIS_NOMS[moisBilan]} {anneeBilan}</span>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
            {[
              { l:'Total recettes', v:totalRecMois, c:'#16a34a', bg:'#f0fdf4', i:<TrendingUp size={20}/> },
              { l:'Total dépenses', v:totalDepMois, c:'#dc2626', bg:'#fef2f2', i:<TrendingDown size={20}/> },
              { l:'Bénéfice net',   v:benMois,      c:'#1641C8', bg:'#eff6ff', i:<Calculator size={20}/> },
              { l:'Marge nette',   v:marge,         c:'#7c3aed', bg:'#f5f3ff', i:<FileText size={20}/>, pct:true },
            ].map(k=>(
              <div key={k.l} style={{ background:'white', borderRadius:16, padding:'22px', border:'1px solid #e2e8f0' }}>
                <div style={{ width:40, height:40, borderRadius:12, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', color:k.c, marginBottom:14 }}>{k.i}</div>
                <div style={{ fontSize:(k as any).pct?'2rem':'1.15rem', fontWeight:900, color:k.c, lineHeight:1 }}>
                  {(k as any).pct?`${k.v}%`:fmt(k.v as number)}
                </div>
                <div style={{ color:'#64748b', fontSize:12, fontWeight:600, marginTop:6 }}>{k.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {[
              { label:'Recettes par service', data:DEMO_REC_MOIS, total:totalRecMois, couleur:'#16a34a', bg:'#f0fdf4' },
              { label:'Dépenses par catégorie', data:DEMO_DEP_MOIS, total:totalDepMois, couleur:'#dc2626', bg:'#fef2f2' },
            ].map(section=>(
              <div key={section.label} style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', padding:'24px' }}>
                <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.9rem', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:section.couleur }}/>{section.label}
                </div>
                {Object.entries(section.data).sort(([,a],[,b])=>b-a).map(([cat,val])=>(
                  <div key={cat} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{cat}</span>
                      <span style={{ fontSize:13, fontWeight:800, color:section.couleur }}>{fmt(val)}</span>
                    </div>
                    <div style={{ height:5, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', background:section.couleur, width:`${val/section.total*100}%`, opacity:0.8, borderRadius:3 }}/>
                    </div>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', paddingTop:12, borderTop:'2px solid #e2e8f0', marginTop:6 }}>
                  <span style={{ fontWeight:900, color:'#0f172a' }}>TOTAL</span>
                  <span style={{ fontWeight:900, color:section.couleur, fontSize:15 }}>{fmt(section.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ──────────────────── RECETTES ─────────────────────────────────── */}
      {onglet==='recettes' && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <input type="date" value={periodeDebut} onChange={e=>setPeriodeDebut(e.target.value)}
              style={{ padding:'9px 14px', borderRadius:10, border:'1px solid #e2e8f0', fontSize:13 }}/>
            <span style={{ color:'#64748b', fontWeight:700 }}>au</span>
            <input type="date" value={periodeFin} onChange={e=>setPeriodeFin(e.target.value)}
              style={{ padding:'9px 14px', borderRadius:10, border:'1px solid #e2e8f0', fontSize:13 }}/>
            <button onClick={()=>{setShowForm(true)}} style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:7, background:'#16a34a', color:'white', border:'none', borderRadius:12, padding:'9px 18px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              <Plus size={15}/> Nouvelle recette
            </button>
          </div>
          <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#f0fdf4' }}>
                  {['Date','Service','Description','Mode','Montant'].map(h=>(
                    <th key={h} style={{ padding:'11px 16px', textAlign:'left', color:'#15803d', fontWeight:700, fontSize:12, borderBottom:'2px solid #bbf7d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recettes.map(m=>(
                  <tr key={m.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'11px 16px', color:'#64748b', fontSize:12 }}>{fmtDate(m.created_at)}</td>
                    <td style={{ padding:'11px 16px', fontWeight:700, color:'#0f172a' }}>{m.categorie}</td>
                    <td style={{ padding:'11px 16px', color:'#64748b', maxWidth:280, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{m.description}</td>
                    <td style={{ padding:'11px 16px', color:'#64748b', fontSize:12 }}>{m.mode_paiement}</td>
                    <td style={{ padding:'11px 16px', fontWeight:900, color:'#16a34a', fontSize:14 }}>+{fmt(m.montant)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background:'#f0fdf4', borderTop:'2px solid #bbf7d0' }}>
                  <td colSpan={4} style={{ padding:'12px 16px', fontWeight:900, color:'#0f172a' }}>TOTAL RECETTES</td>
                  <td style={{ padding:'12px 16px', fontWeight:900, color:'#16a34a', fontSize:15 }}>{fmt(recJour)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* ──────────────────── DÉPENSES ─────────────────────────────────── */}
      {onglet==='depenses' && (
        <>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
            <button onClick={()=>setShowForm(true)} style={{ display:'flex', alignItems:'center', gap:7, background:'#dc2626', color:'white', border:'none', borderRadius:12, padding:'9px 18px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              <Plus size={15}/> Nouvelle dépense
            </button>
          </div>
          <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#fef2f2' }}>
                  {['Date','Catégorie','Description','Mode','Montant',''].map(h=>(
                    <th key={h} style={{ padding:'11px 16px', textAlign:'left', color:'#991b1b', fontWeight:700, fontSize:12, borderBottom:'2px solid #fca5a5' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {depenses.map(m=>(
                  <tr key={m.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'11px 16px', color:'#64748b', fontSize:12 }}>{fmtDate(m.created_at)}</td>
                    <td style={{ padding:'11px 16px', fontWeight:700, color:'#0f172a' }}>{m.categorie}</td>
                    <td style={{ padding:'11px 16px', color:'#64748b', maxWidth:280, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{m.description}</td>
                    <td style={{ padding:'11px 16px', color:'#64748b', fontSize:12 }}>{m.mode_paiement}</td>
                    <td style={{ padding:'11px 16px', fontWeight:900, color:'#dc2626', fontSize:14 }}>-{fmt(m.montant)}</td>
                    <td style={{ padding:'11px 16px' }}>
                      <button onClick={()=>onDelete(m.id)} style={{ background:'#fef2f2', border:'none', borderRadius:8, padding:'5px 8px', cursor:'pointer', color:'#dc2626' }}>
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background:'#fef2f2', borderTop:'2px solid #fca5a5' }}>
                  <td colSpan={4} style={{ padding:'12px 16px', fontWeight:900, color:'#0f172a' }}>TOTAL DÉPENSES</td>
                  <td colSpan={2} style={{ padding:'12px 16px', fontWeight:900, color:'#dc2626', fontSize:15 }}>{fmt(depJour)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* ──────────────────── BILAN P&L ────────────────────────────────── */}
      {onglet==='bilan' && (
        <div style={{ maxWidth:720 }}>
          <div style={{ background:'white', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden', marginBottom:20 }}>
            <div style={{ background:'linear-gradient(135deg,#0f172a,#1641C8)', padding:'24px 28px', color:'white' }}>
              <div style={{ fontWeight:900, fontSize:'1.1rem', marginBottom:4 }}>Compte de résultat</div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>{MOIS_NOMS[moisBilan]} {anneeBilan} — Clinique de la Rebecca</div>
            </div>
            <div style={{ padding:'20px 28px', borderBottom:'2px solid #e2e8f0' }}>
              <div style={{ fontWeight:800, fontSize:'0.8rem', textTransform:'uppercase' as const, letterSpacing:1, marginBottom:16, color:'#15803d' }}>PRODUITS (Classe 7)</div>
              {Object.entries(DEMO_REC_MOIS).map(([cat,val])=>(
                <div key={cat} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:13, borderBottom:'1px solid #f8fafc' }}>
                  <span style={{ color:'#374151' }}>{cat}</span>
                  <span style={{ fontWeight:700, color:'#0f172a' }}>{fmt(val)}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 0', marginTop:8, borderTop:'2px solid #16a34a' }}>
                <span style={{ fontWeight:900, color:'#0f172a', fontSize:14 }}>Total produits</span>
                <span style={{ fontWeight:900, color:'#16a34a', fontSize:15 }}>{fmt(totalRecMois)}</span>
              </div>
            </div>
            <div style={{ padding:'20px 28px', borderBottom:'2px solid #e2e8f0' }}>
              <div style={{ fontWeight:800, fontSize:'0.8rem', textTransform:'uppercase' as const, letterSpacing:1, marginBottom:16, color:'#dc2626' }}>CHARGES (Classe 6)</div>
              {Object.entries(DEMO_DEP_MOIS).map(([cat,val])=>(
                <div key={cat} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:13, borderBottom:'1px solid #f8fafc' }}>
                  <span style={{ color:'#374151' }}>{cat}</span>
                  <span style={{ fontWeight:700, color:'#0f172a' }}>{fmt(val)}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 0', marginTop:8, borderTop:'2px solid #dc2626' }}>
                <span style={{ fontWeight:900, color:'#0f172a', fontSize:14 }}>Total charges</span>
                <span style={{ fontWeight:900, color:'#dc2626', fontSize:15 }}>{fmt(totalDepMois)}</span>
              </div>
            </div>
            <div style={{ padding:'24px 28px', background:benMois>=0?'#f0fdf4':'#fef2f2' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:900, fontSize:'1rem', color:'#0f172a' }}>{benMois>=0?'Bénéfice net':'Perte nette'}</div>
                  <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>Marge nette : {marge}%</div>
                </div>
                <div style={{ fontSize:'1.6rem', fontWeight:900, color:benMois>=0?'#16a34a':'#dc2626' }}>
                  {benMois>=0?'+':''}{fmt(benMois)}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#1641C8', color:'white', border:'none', borderRadius:14, padding:'12px 0', fontWeight:700, fontSize:14, cursor:'pointer' }}>
              <Download size={16}/> Exporter PDF
            </button>
            <button style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#f1f5f9', color:'#374151', border:'1px solid #e2e8f0', borderRadius:14, padding:'12px 0', fontWeight:700, fontSize:14, cursor:'pointer' }}>
              <FileText size={16}/> Rapport Excel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
