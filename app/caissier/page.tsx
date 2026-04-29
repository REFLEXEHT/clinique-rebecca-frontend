'use client'
// app/caissier/page.tsx — Espace caissier : tous les services + pharmacie + impression reçu
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { stocksApi, comptaApi } from '@/lib/api'
import { StockItem } from '@/types'
import PatientForm, { PatientFormData } from '@/components/ui/PatientForm'
import { genererNumeroRecu, formatDate, imprimerDeuxCopies, formatHTG } from '@/lib/utils'
import { ShoppingCart, Plus, Minus, Trash2, Printer, LogOut, CheckCircle, X } from 'lucide-react'

// ─── Catalogue des services (hors pharmacie) ─────────────────────────────────
const SERVICES_CATALOGUE = [
  // Clinique Externe
  { cat: 'Consultations', items: [
    { nom: 'Consultation générale', prix: 1000 },
    { nom: 'Consultation spécialiste', prix: 1500 },
    { nom: 'Consultation pédiatrie', prix: 1200 },
    { nom: 'Consultation gynécologie', prix: 1500 },
    { nom: 'Consultation neurologie', prix: 2000 },
    { nom: 'Consultation chirurgie', prix: 2000 },
    { nom: 'Consultation en ligne (vidéo)', prix: 1500 },
  ]},
  // Laboratoire
  { cat: 'Laboratoire', items: [
    { nom: 'NFS complète', prix: 800 },
    { nom: 'Glycémie à jeun', prix: 350 },
    { nom: 'Bilan lipidique', prix: 1200 },
    { nom: 'TSH (Thyroïde)', prix: 1500 },
    { nom: 'Créatininémie', prix: 600 },
    { nom: 'Sérologie VIH', prix: 750 },
    { nom: 'ECBU', prix: 700 },
    { nom: 'HbA1c', prix: 1100 },
    { nom: 'Transaminases', prix: 800 },
    { nom: 'Test de grossesse', prix: 400 },
  ]},
  // Autres services
  { cat: 'Autres services', items: [
    { nom: 'Radiographie', prix: 1800 },
    { nom: 'Échographie abdominale', prix: 2500 },
    { nom: 'Échographie obstétricale', prix: 2000 },
    { nom: 'Dentisterie - Consultation', prix: 1000 },
    { nom: 'Dentisterie - Extraction', prix: 2500 },
    { nom: 'Physiothérapie - Séance', prix: 1200 },
    { nom: 'Optométrie - Examen', prix: 1500 },
    { nom: 'Salle SOP - Intervention', prix: 15000 },
    { nom: 'Accouchement normal', prix: 12000 },
    { nom: 'Geste médical', prix: 800 },
    { nom: 'Hospitalisation (par jour)', prix: 5000 },
  ]},
]

const MODES_PAY = ['Espèces', 'Mobile Money (Moncash)', 'Natcash', 'Carte de crédit', 'Virement bancaire']

interface PanierItem { label: string; prix: number; qte?: number; stock_id?: number }

type Onglet = 'services' | 'pharmacie'

export default function CaissierPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [onglet, setOnglet] = useState<Onglet>('services')
  const [catActive, setCatActive] = useState('Consultations')
  const [panier, setPanier] = useState<PanierItem[]>([])
  const [stocks, setStocks] = useState<StockItem[]>([])
  const [searchMed, setSearchMed] = useState('')
  const [modePay, setModePay] = useState(MODES_PAY[0])
  const [etape, setEtape] = useState<'panier' | 'patient' | 'confirmation' | 'succes'>('panier')
  const [patientData, setPatientData] = useState<PatientFormData | null>(null)
  const [savLoading, setSavLoading] = useState(false)
  const [derniereTransaction, setDerniereTransaction] = useState<any>(null)

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== 'caissier' && user?.role !== 'admin'))) router.push('/login')
  }, [isAuthenticated, user, loading])

  useEffect(() => {
    stocksApi.list().then(r => setStocks(r.data)).catch(() => setStocks(STOCKS_DEMO))
  }, [])

  const STOCKS_DEMO: StockItem[] = [
    { id:1, nom:'Amoxicilline 500mg', categorie:'Antibiotique', quantite:245, seuil_min:50, prix_unitaire:45, unite:'comprimé' },
    { id:2, nom:'Paracétamol 500mg', categorie:'Analgésique', quantite:12, seuil_min:100, prix_unitaire:15, unite:'comprimé' },
    { id:3, nom:'Ibuprofène 400mg', categorie:'Anti-inflammatoire', quantite:380, seuil_min:100, prix_unitaire:25, unite:'comprimé' },
    { id:4, nom:'Metformine 500mg', categorie:'Antidiabétique', quantite:89, seuil_min:50, prix_unitaire:30, unite:'comprimé' },
    { id:5, nom:'Amlodipine 5mg', categorie:'Antihypertenseur', quantite:156, seuil_min:50, prix_unitaire:40, unite:'comprimé' },
    { id:6, nom:'Seringues 10ml', categorie:'Matériel', quantite:380, seuil_min:200, prix_unitaire:8, unite:'unité' },
    { id:7, nom:'Solution IV 500ml', categorie:'Perfusion', quantite:92, seuil_min:30, prix_unitaire:180, unite:'flacon' },
    { id:8, nom:'Paracétamol sirop', categorie:'Analgésique', quantite:45, seuil_min:20, prix_unitaire:120, unite:'flacon' },
  ]

  const total = panier.reduce((acc, p) => acc + p.prix * (p.qte || 1), 0)

  const addService = (item: { nom: string; prix: number }) => {
    setPanier(prev => {
      const ex = prev.find(p => p.label === item.nom)
      if (ex) return prev.map(p => p.label === item.nom ? { ...p, qte: (p.qte||1) + 1 } : p)
      return [...prev, { label: item.nom, prix: item.prix, qte: 1 }]
    })
    toast.success(`${item.nom} ajouté`, { duration: 1200 })
  }

  const addMed = (s: StockItem) => {
    if (s.quantite <= 0) { toast.error('Rupture de stock'); return }
    setPanier(prev => {
      const ex = prev.find(p => p.stock_id === s.id)
      if (ex) return prev.map(p => p.stock_id === s.id ? { ...p, qte: (p.qte||1) + 1 } : p)
      return [...prev, { label: `${s.nom} (${s.unite})`, prix: s.prix_unitaire, qte: 1, stock_id: s.id }]
    })
    toast.success(`${s.nom} ajouté`, { duration: 1200 })
  }

  const changeQte = (label: string, delta: number) => {
    setPanier(prev => prev
      .map(p => p.label === label ? { ...p, qte: Math.max(1, (p.qte||1) + delta) } : p)
    )
  }

  const removeItem = (label: string) => setPanier(prev => prev.filter(p => p.label !== label))

  // Est-ce que le panier contient seulement des médicaments?
  const estPharmaciePure = panier.every(p => p.stock_id !== undefined)
  const besoinInfoMedicale = !estPharmaciePure // Si consultation ou labo → infos médicales obligatoires

  const onPatientConfirme = (data: PatientFormData) => {
    setPatientData(data)
    setEtape('confirmation')
  }

  const onFinaliser = async () => {
    if (!patientData) return
    setSavLoading(true)
    const numero = genererNumeroRecu()
    const dateNow = new Date().toLocaleString('fr-FR')
    const service = panier.map(p => p.label).join(', ')

    try {
      // Enregistrer le mouvement comptable
      await comptaApi.create({
        type: 'recette',
        categorie: estPharmaciePure ? 'Pharmacie' : panier[0]?.label?.includes('Labo') ? 'Laboratoire' : 'Consultations',
        description: `${service} — Patient: ${patientData.nom} (${patientData.code_unique})`,
        montant: total,
        mode_paiement: modePay,
        date_mouvement: new Date().toISOString(),
        reference: numero,
        notes: `Code patient: ${patientData.code_unique}`,
      }).catch(() => {})

      // Mise à jour stocks si pharmacie
      for (const item of panier) {
        if (item.stock_id) {
          const stock = stocks.find(s => s.id === item.stock_id)
          if (stock) {
            await stocksApi.update(item.stock_id, stock.quantite - (item.qte||1)).catch(() => {})
          }
        }
      }

      const recuData = {
        numero,
        date: dateNow,
        patient_nom: patientData.nom,
        patient_code: patientData.code_unique,
        patient_tel: patientData.telephone,
        service: estPharmaciePure ? 'Pharmacie' : 'Services clinique',
        items: panier.map(p => ({ label: `${p.label} x${p.qte||1}`, prix: p.prix * (p.qte||1) })),
        total,
        mode_paiement: modePay,
        caissier: user?.nom || 'Caissier',
      }

      setDerniereTransaction(recuData)
      setEtape('succes')
      toast.success('✓ Transaction enregistrée !')
    } finally {
      setSavLoading(false)
    }
  }

  const onNouvelleTransaction = () => {
    setPanier([])
    setPatientData(null)
    setDerniereTransaction(null)
    setEtape('panier')
    setModePay(MODES_PAY[0])
  }

  const medFiltres = stocks.filter(s =>
    s.nom.toLowerCase().includes(searchMed.toLowerCase())
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#0f172a] h-[70px] flex items-center px-6 gap-4 sticky top-0 z-40">
        <Link href="/" className="text-white/60 hover:text-white text-sm no-underline transition-colors">
          <i className="fa-solid fa-plus text-[#1641C8] mr-1"/>Accueil
        </Link>
        <h1 className="text-white font-bold ml-2">Espace Caissier</h1>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-white/60 text-sm"><i className="fa-solid fa-cash-register text-[#1641C8] mr-1.5"/>{user?.nom}</span>
          <button onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-1.5 text-white/40 hover:text-red-400 text-xs border-none bg-transparent cursor-pointer transition-colors">
            <LogOut size={13}/> Déconnexion
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-70px)]">
        {/* ── SUCCÈS ──────────────────────────────────────────────────────── */}
        {etape === 'succes' && derniereTransaction && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="card p-10 max-w-[480px] w-full text-center shadow-xl">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">✅</div>
              <h2 className="font-extrabold text-[22px] mb-2">Transaction réussie !</h2>
              <div className="text-2xl font-extrabold text-[#1641C8] mb-1">{formatHTG(derniereTransaction.total)}</div>
              <p className="text-slate-400 text-sm mb-6">{derniereTransaction.patient_nom} · {derniereTransaction.patient_code}</p>
              <div className="bg-slate-50 rounded-xl p-4 text-left mb-6 text-sm space-y-1">
                {derniereTransaction.items.map((i: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-600">{i.label}</span>
                    <span className="font-bold">{i.prix.toLocaleString('fr')} HTG</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button onClick={() => imprimerDeuxCopies(derniereTransaction)}
                  className="btn-primary justify-center">
                  <Printer size={15}/> Imprimer reçu (2 copies)
                </button>
                <button onClick={onNouvelleTransaction} className="btn-secondary justify-center">
                  <Plus size={15}/> Nouvelle transaction
                </button>
              </div>
              <p className="text-xs text-slate-400">2 copies seront imprimées : une pour le patient, une pour la clinique</p>
            </div>
          </div>
        )}

        {/* ── FORMULAIRE PATIENT ───────────────────────────────────────── */}
        {etape === 'patient' && (
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-[680px] mx-auto">
              <button onClick={() => setEtape('panier')} className="flex items-center gap-2 text-slate-500 hover:text-[#1641C8] text-sm font-medium mb-5 border-none bg-transparent cursor-pointer">
                <i className="fa-solid fa-arrow-left"/> Retour au panier
              </button>
              <div className="bg-[#1641C8] text-white rounded-2xl p-4 mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold opacity-70 mb-0.5">Total à encaisser</div>
                  <div className="text-2xl font-extrabold">{formatHTG(total)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-70">Mode paiement</div>
                  <select value={modePay} onChange={e => setModePay(e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1 text-sm font-bold mt-1 cursor-pointer outline-none">
                    {MODES_PAY.map(m => <option key={m} className="text-slate-900">{m}</option>)}
                  </select>
                </div>
              </div>
              <PatientForm
                avecInfoMedicale={besoinInfoMedicale}
                onConfirm={onPatientConfirme}
                onCancel={() => setEtape('panier')}
                titre="Informations du patient"
              />
            </div>
          </div>
        )}

        {/* ── CONFIRMATION FINALE ──────────────────────────────────────── */}
        {etape === 'confirmation' && patientData && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="card p-8 max-w-[560px] w-full shadow-xl">
              <h3 className="font-extrabold text-[18px] mb-5 text-center">Récapitulatif final</h3>

              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Patient</div>
                <div className="font-extrabold text-[#1641C8] text-xl mb-1">{patientData.code_unique}</div>
                <div className="font-bold">{patientData.nom}</div>
                <div className="text-slate-500 text-sm">{patientData.telephone}</div>
                {patientData.age && <div className="text-slate-500 text-sm">{patientData.age} ans · {patientData.sexe === 'M' ? 'Masculin' : patientData.sexe === 'F' ? 'Féminin' : 'Autre'}</div>}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Services</div>
                {panier.map(p => (
                  <div key={p.label} className="flex justify-between text-sm mb-1.5">
                    <span>{p.label} ×{p.qte||1}</span>
                    <span className="font-bold">{((p.qte||1) * p.prix).toLocaleString('fr')} HTG</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-extrabold text-base">
                  <span>TOTAL</span>
                  <span className="text-[#1641C8]">{formatHTG(total)}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-5">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Mode paiement</div>
                <div className="font-bold">{modePay}</div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEtape('patient')} className="btn-ghost flex-1 justify-center">
                  <i className="fa-solid fa-pen"/> Modifier
                </button>
                <button onClick={onFinaliser} disabled={savLoading} className="btn-primary flex-1 justify-center bg-green-600 hover:bg-green-700">
                  {savLoading
                    ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block"/>Enregistrement...</>
                    : <><CheckCircle size={15}/> Encaisser & Imprimer</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PANIER + CATALOGUE ───────────────────────────────────────── */}
        {etape === 'panier' && (
          <>
            {/* Catalogue (gauche) */}
            <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200">
              {/* Onglets Services / Pharmacie */}
              <div className="flex border-b border-slate-200 bg-white px-4 pt-3 gap-2 flex-shrink-0">
                {[
                  { key: 'services', icon: 'fa-stethoscope', label: 'Services clinique' },
                  { key: 'pharmacie', icon: 'fa-pills', label: 'Pharmacie' },
                ].map(t => (
                  <button key={t.key} onClick={() => setOnglet(t.key as Onglet)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-bold text-sm border-b-2 cursor-pointer transition-all border-x-0 border-t-0 bg-transparent
                    ${onglet === t.key ? 'border-b-[#1641C8] text-[#1641C8]' : 'border-b-transparent text-slate-400 hover:text-slate-600'}`}>
                    <i className={`fa-solid ${t.icon}`}/> {t.label}
                  </button>
                ))}
              </div>

              {/* Services */}
              {onglet === 'services' && (
                <div className="flex flex-1 overflow-hidden">
                  {/* Catégories */}
                  <div className="w-44 bg-slate-50 border-r border-slate-200 overflow-y-auto flex-shrink-0">
                    {SERVICES_CATALOGUE.map(cat => (
                      <button key={cat.cat} onClick={() => setCatActive(cat.cat)}
                        className={`w-full text-left px-4 py-3 text-[13px] font-semibold border-none cursor-pointer transition-all border-l-2
                        ${catActive === cat.cat ? 'bg-blue-50 text-[#1641C8] border-l-[#1641C8]' : 'bg-transparent text-slate-500 border-l-transparent hover:bg-slate-100'}`}>
                        {cat.cat}
                      </button>
                    ))}
                  </div>
                  {/* Items */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICES_CATALOGUE.find(c => c.cat === catActive)?.items.map(item => (
                        <button key={item.nom} onClick={() => addService(item)}
                          className="text-left p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#1641C8] hover:bg-blue-50 hover:text-[#1641C8] transition-all cursor-pointer group">
                          <div className="font-semibold text-[13px] mb-1 group-hover:text-[#1641C8] text-slate-800">{item.nom}</div>
                          <div className="font-extrabold text-[#1641C8] text-sm">{item.prix.toLocaleString('fr')} HTG</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pharmacie */}
              {onglet === 'pharmacie' && (
                <div className="flex-1 overflow-y-auto p-4">
                  <input value={searchMed} onChange={e => setSearchMed(e.target.value)}
                    className="input mb-4" placeholder="🔍 Rechercher un médicament..."/>
                  <div className="grid grid-cols-2 gap-2">
                    {medFiltres.map(s => (
                      <button key={s.id} onClick={() => addMed(s)} disabled={s.quantite <= 0}
                        className={`text-left p-3.5 border rounded-xl transition-all cursor-pointer
                        ${s.quantite <= 0 ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-slate-200 hover:border-[#1641C8] hover:bg-blue-50'}`}>
                        <div className="font-semibold text-[13px] mb-0.5 text-slate-800">{s.nom}</div>
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[#1641C8] text-sm">{s.prix_unitaire} HTG/{s.unite}</span>
                          <span className={`text-[11px] font-bold ${s.quantite <= 0 ? 'text-red-500' : s.quantite < s.seuil_min ? 'text-orange-500' : 'text-green-600'}`}>
                            Stock: {s.quantite}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Panier (droite) */}
            <div className="w-[340px] flex-shrink-0 flex flex-col bg-white">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <ShoppingCart size={16} className="text-[#1641C8]"/>
                <span className="font-extrabold text-[15px]">Panier</span>
                {panier.length > 0 && (
                  <span className="ml-auto badge-blue">{panier.length} article(s)</span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {panier.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                    <ShoppingCart size={36} className="mb-3 opacity-40"/>
                    <p className="text-sm">Sélectionnez des services</p>
                  </div>
                ) : panier.map(p => (
                  <div key={p.label} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{p.label}</div>
                      <div className="text-[11px] text-slate-400">{p.prix.toLocaleString('fr')} HTG</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => changeQte(p.label, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 border-none cursor-pointer text-xs font-bold">
                        <Minus size={10}/>
                      </button>
                      <span className="w-6 text-center text-xs font-extrabold">{p.qte||1}</span>
                      <button onClick={() => changeQte(p.label, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 border-none cursor-pointer text-xs font-bold">
                        <Plus size={10}/>
                      </button>
                    </div>
                    <div className="text-xs font-extrabold text-[#1641C8] w-20 text-right">
                      {((p.qte||1)*p.prix).toLocaleString('fr')} HTG
                    </div>
                    <button onClick={() => removeItem(p.label)}
                      className="text-red-400 hover:text-red-600 border-none bg-transparent cursor-pointer p-0.5">
                      <X size={13}/>
                    </button>
                  </div>
                ))}
              </div>

              {/* Total + Payer */}
              <div className="p-4 border-t border-slate-200">
                <div className="flex justify-between font-extrabold text-lg mb-3">
                  <span>TOTAL</span>
                  <span className="text-[#1641C8]">{formatHTG(total)}</span>
                </div>
                <select value={modePay} onChange={e => setModePay(e.target.value)} className="input mb-3 text-sm">
                  {MODES_PAY.map(m => <option key={m}>{m}</option>)}
                </select>
                <button
                  onClick={() => { if (panier.length === 0) { toast.error('Ajoutez des articles'); return } setEtape('patient') }}
                  disabled={panier.length === 0}
                  className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-40">
                  <i className="fa-solid fa-user-plus mr-1"/> Enregistrer patient & Encaisser
                </button>
                {panier.length > 0 && (
                  <button onClick={() => setPanier([])} className="w-full text-center text-xs text-slate-400 hover:text-red-400 mt-2 border-none bg-transparent cursor-pointer transition-colors">
                    Vider le panier
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
