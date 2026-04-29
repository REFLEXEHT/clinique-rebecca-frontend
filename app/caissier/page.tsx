'use client'
export const dynamic = 'force-dynamic'
/**
 * app/caissier/page.tsx — Espace Caissier Clinique de la Rebecca
 * Formulaires patients adaptés par service, facturation complète, impression
 */
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { stocksApi, comptaApi } from '@/lib/api'
import { StockItem } from '@/types'
import {
  genererNumeroRecu, genererCodePatient, formatHTG, calculerAge,
  imprimerDeuxCopies
} from '@/lib/utils'
import RebeccaAI from '@/components/ui/RebeccaAI'
import {
  ShoppingCart, Plus, Minus, Trash2, Printer, LogOut,
  CheckCircle, X, Search, User, Activity, DollarSign
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type TypeService =
  'consultation' | 'laboratoire' | 'dentisterie' | 'physiotherapie' |
  'pharmacie' | 'observation' | 'hospitalisation' | 'gestes' | 'optometrie' |
  'maternite' | 'sop'

type Etape = 'service' | 'panier' | 'patient' | 'confirmation' | 'succes'

interface PanierItem { label: string; prix: number; qte: number; stock_id?: number }

interface PatientBase {
  nom: string; prenom: string; telephone: string; telephone_whatsapp: string
  sexe: string; date_naissance: string; age: number; date_visite: string
  code_unique: string
}

interface PatientHospitalisation extends PatientBase {
  contact_urgence_nom: string; contact_urgence_tel: string
  medecin_traitant: string; chambre: string
  frais_medicaux: number; frais_visite_medecin: number
  prix_chambre_par_jour: number; nb_jours: number
  medicaments_pris: string; examens_effectues: string
  montant_total: number; montant_verse: number
}

// ─── Catalogues ───────────────────────────────────────────────────────────────
const MEDECINS = [
  'Dr Peterly PHILIPPE (Orthopédie)',
  'Dr Wisly Joseph (Chirurgie Générale)',
  'Dr Mikerline Charles (Pédiatrie)',
  'Dr Bernard Pierre (Neurochirurgie)',
  'Dr Eliode Pierre (Gynécologie)',
  'Dr Vania Louissaint (Médecine interne)',
  'Dr Sophie Beaujour (Dermatologie)',
  'Dr Kaina Michaud (ORL)',
  'Dr Wolf Charlie Cajuste (Dentisterie)',
  'Mme Fredia Fleurival (Physiothérapie)',
  'Dr Gilles Abraham (Optométrie)',
  'Dr Lemoine Lafleur (Neurologie)',
]

const SERVICES_CATALOGUE: Record<string, { cat: string; items: { nom: string; prix: number }[] }[]> = {
  consultation: [
    { cat: 'Consultations', items: [
      { nom: 'Consultation générale', prix: 1000 },
      { nom: 'Consultation spécialiste', prix: 1500 },
      { nom: 'Consultation pédiatrie', prix: 1200 },
      { nom: 'Consultation gynécologie', prix: 1500 },
      { nom: 'Consultation neurologie', prix: 2000 },
      { nom: 'Consultation chirurgie', prix: 2000 },
      { nom: 'Consultation orthopédie', prix: 2500 },
      { nom: 'Consultation en ligne (vidéo)', prix: 1500 },
    ]},
  ],
  laboratoire: [
    { cat: 'Analyses biologiques', items: [
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
      { nom: 'Ionogramme sanguin', prix: 1300 },
      { nom: 'CRP', prix: 600 },
      { nom: 'Bilan hépatique complet', prix: 1800 },
      { nom: 'TP/TCA', prix: 900 },
      { nom: 'Hémoculture', prix: 1500 },
    ]},
  ],
  dentisterie: [
    { cat: 'Soins dentaires', items: [
      { nom: 'Consultation dentaire', prix: 1000 },
      { nom: 'Extraction simple', prix: 2000 },
      { nom: 'Extraction complexe', prix: 3500 },
      { nom: 'Détartrage', prix: 1500 },
      { nom: 'Obturation (par dent)', prix: 2500 },
      { nom: 'Inlay/Onlay', prix: 5000 },
      { nom: 'Prothèse partielle', prix: 8000 },
      { nom: 'Prothèse complète', prix: 15000 },
      { nom: 'Orthodontie — consultation', prix: 2000 },
      { nom: 'Radiographie dentaire', prix: 1200 },
    ]},
  ],
  physiotherapie: [
    { cat: 'Séances de kinésithérapie', items: [
      { nom: 'Séance kinésithérapie', prix: 1200 },
      { nom: 'Rééducation post-op', prix: 1500 },
      { nom: 'Massage thérapeutique', prix: 1000 },
      { nom: 'Électrostimulation', prix: 800 },
      { nom: 'Ultrasons thérapeutiques', prix: 900 },
    ]},
  ],
  gestes: [
    { cat: 'Gestes médicaux', items: [
      { nom: 'Injection IM', prix: 300 },
      { nom: 'Injection IV', prix: 400 },
      { nom: 'Perfusion (pose + solution)', prix: 1200 },
      { nom: 'Pansement simple', prix: 500 },
      { nom: 'Pansement complexe', prix: 900 },
      { nom: 'Sutures (< 5 points)', prix: 1500 },
      { nom: 'Sutures (> 5 points)', prix: 2200 },
      { nom: 'ECG', prix: 800 },
      { nom: 'Sondage vésical', prix: 1200 },
      { nom: 'Oxygénothérapie (heure)', prix: 600 },
    ]},
  ],
  optometrie: [
    { cat: 'Optométrie', items: [
      { nom: "Bilan visuel complet", prix: 1500 },
      { nom: "Prescription lunettes", prix: 500 },
      { nom: "Fond d'oeil", prix: 1200 },
      { nom: "Dépistage glaucome", prix: 1000 },
    ]},
  ],
  maternite: [
    { cat: 'Maternité', items: [
      { nom: 'Consultation prénatale', prix: 1500 },
      { nom: 'Accouchement normal', prix: 12000 },
      { nom: 'Accouchement par césarienne', prix: 35000 },
      { nom: 'Soins néonataux', prix: 3000 },
      { nom: 'Suivi post-partum', prix: 1200 },
    ]},
  ],
  sop: [
    { cat: 'Bloc opératoire', items: [
      { nom: 'Appendicectomie', prix: 25000 },
      { nom: 'Hernie inguinale', prix: 20000 },
      { nom: 'Cholécystectomie', prix: 30000 },
      { nom: 'Chirurgie orthopédique', prix: 35000 },
      { nom: 'Neurochirurgie', prix: 60000 },
      { nom: 'Intervention SOP (forfait)', prix: 15000 },
    ]},
  ],
}

const MODES_PAY = [
  'Espèces', 'Mobile Money (Moncash)', 'Natcash', 'Carte de crédit', 'Virement bancaire'
]

const DECAISSEMENTS_TYPES = [
  'Achat médicaments', 'Achat matériel', 'Entretien', 'Électricité / Eau',
  'Salaires personnel', 'Alimentation', 'Transport', 'Remboursement patient', 'Autre dépense',
]

const SERVICES_MENU = [
  { key: 'consultation' as TypeService, label: 'Clinique externe', icon: 'fa-stethoscope', couleur: '#1641C8' },
  { key: 'laboratoire' as TypeService, label: 'Laboratoire', icon: 'fa-flask-vial', couleur: '#0d9488' },
  { key: 'dentisterie' as TypeService, label: 'Dentisterie', icon: 'fa-tooth', couleur: '#7c3aed' },
  { key: 'physiotherapie' as TypeService, label: 'Physiothérapie', icon: 'fa-person-walking', couleur: '#d97706' },
  { key: 'gestes' as TypeService, label: 'Gestes médicaux', icon: 'fa-syringe', couleur: '#6366f1' },
  { key: 'optometrie' as TypeService, label: 'Optométrie', icon: 'fa-glasses', couleur: '#059669' },
  { key: 'maternite' as TypeService, label: 'Maternité', icon: 'fa-baby', couleur: '#be185d' },
  { key: 'sop' as TypeService, label: 'Salle SOP', icon: 'fa-scalpel', couleur: '#374151' },
  { key: 'pharmacie' as TypeService, label: 'Pharmacie', icon: 'fa-pills', couleur: '#dc2626' },
  { key: 'observation' as TypeService, label: 'Observation', icon: 'fa-bed', couleur: '#f59e0b' },
  { key: 'hospitalisation' as TypeService, label: 'Hospitalisation', icon: 'fa-hospital', couleur: '#ef4444' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STOCKS_DEMO: StockItem[] = [
  { id: 1, nom: 'Amoxicilline 500mg', categorie: 'Antibiotique', quantite: 245, seuil_min: 50, prix_unitaire: 45, unite: 'comprimé' },
  { id: 2, nom: 'Paracétamol 500mg', categorie: 'Analgésique', quantite: 180, seuil_min: 100, prix_unitaire: 15, unite: 'comprimé' },
  { id: 3, nom: 'Ibuprofène 400mg', categorie: 'Anti-inflammatoire', quantite: 380, seuil_min: 100, prix_unitaire: 25, unite: 'comprimé' },
  { id: 4, nom: 'Metformine 500mg', categorie: 'Antidiabétique', quantite: 89, seuil_min: 50, prix_unitaire: 30, unite: 'comprimé' },
  { id: 5, nom: 'Amlodipine 5mg', categorie: 'Antihypertenseur', quantite: 156, seuil_min: 50, prix_unitaire: 40, unite: 'comprimé' },
  { id: 6, nom: 'Seringues 10ml', categorie: 'Matériel', quantite: 380, seuil_min: 200, prix_unitaire: 8, unite: 'unité' },
  { id: 7, nom: 'Solution IV 500ml', categorie: 'Perfusion', quantite: 92, seuil_min: 30, prix_unitaire: 180, unite: 'flacon' },
  { id: 8, nom: 'Paracétamol sirop pédiatrique', categorie: 'Analgésique', quantite: 45, seuil_min: 20, prix_unitaire: 120, unite: 'flacon' },
  { id: 9, nom: 'Metronidazole 500mg', categorie: 'Antibiotique', quantite: 210, seuil_min: 50, prix_unitaire: 20, unite: 'comprimé' },
  { id: 10, nom: 'Oméprazole 20mg', categorie: 'Gastroprotecteur', quantite: 140, seuil_min: 40, prix_unitaire: 18, unite: 'gélule' },
]

// ─── Composant principal ──────────────────────────────────────────────────────
export default function CaissierPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()

  // Navigation
  const [ongletPrincipal, setOngletPrincipal] = useState<'caisse' | 'decaissement'>('caisse')
  const [serviceActif, setServiceActif] = useState<TypeService>('consultation')
  const [catActive, setCatActive] = useState<string>('')

  // Panier & flux de caisse
  const [panier, setPanier] = useState<PanierItem[]>([])
  const [stocks, setStocks] = useState<StockItem[]>([])
  const [searchMed, setSearchMed] = useState('')
  const [modePay, setModePay] = useState(MODES_PAY[0])
  const [etape, setEtape] = useState<Etape>('panier')
  const [savLoading, setSavLoading] = useState(false)
  const [derniereTransaction, setDerniereTransaction] = useState<any>(null)

  // Formulaire patient
  const [patient, setPatient] = useState<any>({
    nom: '', prenom: '', telephone: '', telephone_whatsapp: '',
    sexe: 'M', date_naissance: '', age: 0,
    date_visite: '',  // set in useEffect to avoid hydration mismatch
    code_unique: genererCodePatient(),
    contact_urgence_nom: '', contact_urgence_tel: '',
    medecin_traitant: '',
    // Hospitalisation/Observation
    chambre: '', frais_medicaux: 0, frais_visite_medecin: 0,
    prix_chambre_par_jour: 0, nb_jours: 1,
    medicaments_pris: '', examens_effectues: '',
    montant_verse: 0,
  })

  // Décaissement
  const [decType, setDecType] = useState(DECAISSEMENTS_TYPES[0])
  const [decMontant, setDecMontant] = useState('')
  const [decNote, setDecNote] = useState('')
  const [decLoading, setDecLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== 'caissier' && user?.role !== 'admin')))
      router.push('/login')
  }, [isAuthenticated, user, loading, router])

  useEffect(() => {
    stocksApi.list().then(r => setStocks(r.data?.length ? r.data : STOCKS_DEMO)).catch(() => setStocks(STOCKS_DEMO))
  }, [])

  useEffect(() => {
    const cats = SERVICES_CATALOGUE[serviceActif]
    if (cats?.length) setCatActive(cats[0].cat)
    else setCatActive('')
    setPanier([])
  }, [serviceActif])

  // Calcul auto de l'âge
  const onDateNaissanceChange = (val: string) => {
    const age = val ? calculerAge(val) : 0
    setPatient((p: any) => ({ ...p, date_naissance: val, age }))
  }

  // Calcul total hospitalisation
  const totalHospi = serviceActif === 'hospitalisation' || serviceActif === 'observation'
    ? (Number(patient.frais_medicaux) || 0) +
      (Number(patient.frais_visite_medecin) || 0) +
      (Number(patient.prix_chambre_par_jour) || 0) * (Number(patient.nb_jours) || 1) +
      panier.reduce((a, p) => a + p.prix * p.qte, 0)
    : panier.reduce((a, p) => a + p.prix * p.qte, 0)

  const balance = totalHospi - (Number(patient.montant_verse) || 0)

  // Panier helpers
  const addItem = (item: { nom: string; prix: number }) => {
    setPanier(prev => {
      const ex = prev.find(p => p.label === item.nom)
      if (ex) return prev.map(p => p.label === item.nom ? { ...p, qte: p.qte + 1 } : p)
      return [...prev, { label: item.nom, prix: item.prix, qte: 1 }]
    })
  }

  const addMed = (stock: StockItem) => {
    if (stock.quantite <= 0) { toast.error('Stock épuisé'); return }
    setPanier(prev => {
      const ex = prev.find(p => p.stock_id === stock.id)
      if (ex) return prev.map(p => p.stock_id === stock.id ? { ...p, qte: p.qte + 1 } : p)
      return [...prev, { label: stock.nom, prix: stock.prix_unitaire, qte: 1, stock_id: stock.id }]
    })
  }

  const removeItem = (label: string) => setPanier(prev => prev.filter(p => p.label !== label))
  const changeQte = (label: string, delta: number) =>
    setPanier(prev => prev.map(p => p.label === label ? { ...p, qte: Math.max(1, p.qte + delta) } : p))

  // Valider patient
  const validerPatient = () => {
    if (!patient.nom.trim()) { toast.error('Le nom est obligatoire'); return }
    if (!patient.telephone.trim()) { toast.error('Le téléphone est obligatoire'); return }
    if (serviceActif !== 'pharmacie' && !patient.date_naissance) {
      toast.error('La date de naissance est obligatoire'); return
    }
    if (panier.length === 0) { toast.error('Le panier est vide'); return }
    setEtape('confirmation')
  }

  // Sauvegarder
  const sauvegarder = async () => {
    setSavLoading(true)
    try {
      const numeroRecu = genererNumeroRecu()
      const transaction = {
        numero_recu: numeroRecu,
        patient_code: patient.code_unique,
        patient_nom: `${patient.prenom} ${patient.nom}`.trim(),
        patient_telephone: patient.telephone,
        service: SERVICES_MENU.find(s => s.key === serviceActif)?.label || serviceActif,
        items: panier,
        montant_total: totalHospi,
        montant_verse: Number(patient.montant_verse) || totalHospi,
        balance,
        mode_paiement: modePay,
        medecin_traitant: patient.medecin_traitant,
        caissier_nom: user?.nom || 'Caissier',
        date: new Date().toLocaleString('fr-FR'),
        // Hospi extras
        ...(serviceActif === 'hospitalisation' || serviceActif === 'observation' ? {
          chambre: patient.chambre,
          nb_jours: patient.nb_jours,
          frais_medicaux: patient.frais_medicaux,
          frais_visite_medecin: patient.frais_visite_medecin,
          prix_chambre_par_jour: patient.prix_chambre_par_jour,
          medicaments_pris: patient.medicaments_pris,
          examens_effectues: patient.examens_effectues,
        } : {}),
      }
      await comptaApi.create({
        type: 'recette',
        montant: totalHospi,
        description: `Reçu ${numeroRecu} — ${transaction.patient_nom} — ${transaction.service}`,
        categorie: transaction.service,
        mode_paiement: modePay,
      })
      setDerniereTransaction(transaction)
      setEtape('succes')
      toast.success('Transaction enregistrée avec succès')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSavLoading(false)
    }
  }

  const nouvelleTransaction = () => {
    setPanier([])
    setPatient({
      nom: '', prenom: '', telephone: '', telephone_whatsapp: '',
      sexe: 'M', date_naissance: '', age: 0,
      date_visite: '',  // set in useEffect to avoid hydration mismatch
      code_unique: genererCodePatient(),
      contact_urgence_nom: '', contact_urgence_tel: '',
      medecin_traitant: '',
      chambre: '', frais_medicaux: 0, frais_visite_medecin: 0,
      prix_chambre_par_jour: 0, nb_jours: 1,
      medicaments_pris: '', examens_effectues: '',
      montant_verse: 0,
    })
    setModePay(MODES_PAY[0])
    setEtape('panier')
  }

  const imprimerRecu = () => {
    if (!derniereTransaction) return
    imprimerDeuxCopies({
      numero: derniereTransaction.numero_recu,
      date: derniereTransaction.date,
      patient_nom: derniereTransaction.patient_nom,
      patient_code: derniereTransaction.patient_code,
      patient_tel: derniereTransaction.patient_telephone,
      service: derniereTransaction.service,
      items: derniereTransaction.items.map((i: PanierItem) => ({ label: `${i.label} ×${i.qte}`, prix: i.prix * i.qte })),
      total: derniereTransaction.montant_total,
      mode_paiement: derniereTransaction.mode_paiement,
      caissier: derniereTransaction.caissier_nom,
    })
  }

  const sauvegarderDecaissement = async () => {
    if (!decMontant || isNaN(Number(decMontant)) || Number(decMontant) <= 0) {
      toast.error('Montant invalide'); return
    }
    setDecLoading(true)
    try {
      await comptaApi.create({
        type: 'depense',
        montant: Number(decMontant),
        description: `${decType}${decNote ? ' — ' + decNote : ''}`,
        categorie: decType,
        mode_paiement: 'Espèces',
      })
      toast.success('Décaissement enregistré')
      setDecMontant('')
      setDecNote('')
    } catch { toast.error('Erreur lors de l\'enregistrement') }
    finally { setDecLoading(false) }
  }

  if (loading || !isAuthenticated) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #1641C8', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const serviceInfo = SERVICES_MENU.find(s => s.key === serviceActif)!

  // ── SUCCÈS ────────────────────────────────────────────────────────────────
  if (etape === 'succes' && derniereTransaction) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 40, maxWidth: 560, width: '100%', boxShadow: '0 8px 48px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={36} color="#16a34a" />
          </div>
          <h2 style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.4rem', marginBottom: 6 }}>Transaction réussie</h2>
          <div style={{ color: '#1641C8', fontWeight: 800, fontFamily: 'monospace', fontSize: 15 }}>{derniereTransaction.numero_recu}</div>
        </div>

        {/* Résumé complet */}
        <div style={{ background: '#f8fafc', borderRadius: 16, padding: '20px', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, color: '#374151', fontSize: 13, marginBottom: 14, textTransform: 'uppercase' as const, letterSpacing: 1 }}>Récapitulatif</div>

          {[
            { label: 'Code patient', val: derniereTransaction.patient_code, mono: true },
            { label: 'Patient', val: derniereTransaction.patient_nom },
            { label: 'Téléphone', val: derniereTransaction.patient_telephone },
            { label: 'Service', val: derniereTransaction.service },
            ...(derniereTransaction.medecin_traitant ? [{ label: 'Médecin', val: derniereTransaction.medecin_traitant }] : []),
            ...(derniereTransaction.chambre ? [{ label: 'Chambre', val: derniereTransaction.chambre }] : []),
            ...(derniereTransaction.nb_jours > 1 ? [{ label: 'Durée', val: `${derniereTransaction.nb_jours} jour(s)` }] : []),
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{f.label}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', fontFamily: (f as any).mono ? 'monospace' : undefined }}>{f.val}</span>
            </div>
          ))}

          {/* Items */}
          <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px dashed #d1d5db' }}>
            {derniereTransaction.items.map((it: PanierItem) => (
              <div key={it.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>{it.label} ×{it.qte}</span>
                <span style={{ fontWeight: 700, fontSize: 12 }}>{formatHTG(it.prix * it.qte)}</span>
              </div>
            ))}
            {(derniereTransaction.frais_medicaux > 0) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>Frais médicaux</span>
                <span style={{ fontWeight: 700, fontSize: 12 }}>{formatHTG(derniereTransaction.frais_medicaux)}</span>
              </div>
            )}
            {(derniereTransaction.frais_visite_medecin > 0) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>Visite médecin</span>
                <span style={{ fontWeight: 700, fontSize: 12 }}>{formatHTG(derniereTransaction.frais_visite_medecin)}</span>
              </div>
            )}
            {(derniereTransaction.prix_chambre_par_jour > 0) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>Chambre ({derniereTransaction.nb_jours}j × {formatHTG(derniereTransaction.prix_chambre_par_jour)})</span>
                <span style={{ fontWeight: 700, fontSize: 12 }}>{formatHTG(derniereTransaction.prix_chambre_par_jour * derniereTransaction.nb_jours)}</span>
              </div>
            )}
          </div>

          {/* Totaux */}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: 15 }}>Total</span>
              <span style={{ fontWeight: 900, color: '#1641C8', fontSize: 16 }}>{formatHTG(derniereTransaction.montant_total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>Versé</span>
              <span style={{ fontWeight: 700, color: '#16a34a', fontSize: 13 }}>{formatHTG(derniereTransaction.montant_verse || derniereTransaction.montant_total)}</span>
            </div>
            {(derniereTransaction.balance !== undefined && derniereTransaction.balance !== 0) && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#d97706', fontSize: 13, fontWeight: 700 }}>Balance</span>
                <span style={{ fontWeight: 800, color: '#d97706', fontSize: 13 }}>{formatHTG(Math.abs(derniereTransaction.balance))}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>Mode paiement</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{derniereTransaction.mode_paiement}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={imprimerRecu} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#1641C8', color: 'white', border: 'none', borderRadius: 14, padding: '13px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            <Printer size={16} /> Imprimer reçu (2 copies)
          </button>
          <button onClick={nouvelleTransaction} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 14, padding: '13px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            <Plus size={15} /> Nouveau patient
          </button>
        </div>
      </div>
    </div>
  )

  // ── CONFIRMATION ──────────────────────────────────────────────────────────
  if (etape === 'confirmation') return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 40, maxWidth: 580, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.2rem', marginBottom: 20 }}>Confirmation avant enregistrement</h2>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e', fontWeight: 600 }}>
          Vérifiez toutes les informations. Aucune modification n'est possible après la sauvegarde.
        </div>

        {/* Infos patient */}
        <div style={{ background: '#f8fafc', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontWeight: 800, color: '#374151', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12 }}>Patient</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { l: 'Code', v: patient.code_unique },
              { l: 'Nom complet', v: `${patient.prenom} ${patient.nom}` },
              { l: 'Téléphone', v: patient.telephone },
              { l: 'Sexe', v: patient.sexe === 'M' ? 'Masculin' : patient.sexe === 'F' ? 'Féminin' : 'Autre' },
              ...(patient.date_naissance ? [{ l: 'Date naissance', v: patient.date_naissance }, { l: 'Âge', v: `${patient.age} ans` }] : []),
              ...(patient.medecin_traitant ? [{ l: 'Médecin', v: patient.medecin_traitant }] : []),
            ].map(f => (
              <div key={f.l}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{f.l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{f.v || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hospi extras */}
        {(serviceActif === 'hospitalisation' || serviceActif === 'observation') && (
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, color: '#92400e', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12 }}>
              {serviceActif === 'hospitalisation' ? 'Hospitalisation' : 'Observation'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { l: 'Chambre', v: patient.chambre },
                { l: 'Durée', v: `${patient.nb_jours} jour(s)` },
                { l: 'Frais médicaux', v: formatHTG(Number(patient.frais_medicaux)) },
                { l: 'Visite médecin', v: formatHTG(Number(patient.frais_visite_medecin)) },
                { l: 'Prix chambre/jour', v: formatHTG(Number(patient.prix_chambre_par_jour)) },
              ].map(f => (
                <div key={f.l}>
                  <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>{f.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{f.v}</div>
                </div>
              ))}
            </div>
            {patient.medicaments_pris && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>Médicaments pris</div>
                <div style={{ fontSize: 13, color: '#0f172a' }}>{patient.medicaments_pris}</div>
              </div>
            )}
            {patient.examens_effectues && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>Examens effectués</div>
                <div style={{ fontSize: 13, color: '#0f172a' }}>{patient.examens_effectues}</div>
              </div>
            )}
          </div>
        )}

        {/* Items & totaux */}
        <div style={{ background: '#f8fafc', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontWeight: 800, color: '#374151', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12 }}>Services / Produits</div>
          {panier.map(it => (
            <div key={it.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: 13 }}>{it.label} × {it.qte}</span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{formatHTG(it.prix * it.qte)}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: 15 }}>Total à payer</span>
              <span style={{ fontWeight: 900, color: '#1641C8', fontSize: 16 }}>{formatHTG(totalHospi)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>Montant versé</span>
              <span style={{ fontWeight: 800, color: '#16a34a', fontSize: 14 }}>{formatHTG(Number(patient.montant_verse) || totalHospi)}</span>
            </div>
            {balance !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#d97706', fontSize: 13, fontWeight: 700 }}>Balance restante</span>
                <span style={{ fontWeight: 800, color: '#d97706', fontSize: 14 }}>{formatHTG(Math.abs(balance))}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mode paiement */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: '#374151', fontSize: 13, marginBottom: 10 }}>Mode de paiement</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MODES_PAY.map(m => (
              <button key={m} onClick={() => setModePay(m)}
                style={{ padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: modePay === m ? '#1641C8' : '#f1f5f9',
                  color: modePay === m ? 'white' : '#475569' }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setEtape('patient')} style={{ flex: 1, background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 14, padding: '13px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Retour
          </button>
          <button onClick={sauvegarder} disabled={savLoading} style={{ flex: 2, background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none', borderRadius: 14, padding: '13px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: savLoading ? 0.7 : 1 }}>
            {savLoading ? 'Enregistrement...' : 'Confirmer et enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── FORMULAIRE PATIENT ────────────────────────────────────────────────────
  if (etape === 'patient') {
    const needsFullForm = serviceActif !== 'pharmacie'
    const isHospi = serviceActif === 'hospitalisation' || serviceActif === 'observation'

    const inp = (style?: any) => ({
      width: '100%', padding: '10px 14px', borderRadius: 10,
      border: '1px solid #d1d5db', fontSize: 14, outline: 'none',
      boxSizing: 'border-box' as const, ...style
    })

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 20, paddingTop: 60 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: serviceInfo.couleur + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`fa-solid ${serviceInfo.icon}`} style={{ color: serviceInfo.couleur, fontSize: 18 }} />
            </div>
            <div>
              <h2 style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem', margin: 0 }}>Dossier patient — {serviceInfo.label}</h2>
              <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2, fontFamily: 'monospace', fontWeight: 700 }}>{patient.code_unique}</div>
            </div>
            <button onClick={() => setEtape('panier')} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <i className="fa-solid fa-arrow-left" /> Retour panier
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '28px 32px', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, color: '#374151', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
              Informations patient
            </div>

            {/* Date de visite */}
            <div style={{ background: '#eff6ff', borderRadius: 12, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fa-solid fa-calendar-day" style={{ color: '#1641C8', fontSize: 14 }} />
              <div>
                <div style={{ fontSize: 11, color: '#1641C8', fontWeight: 700 }}>Date de visite (automatique)</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  <span suppressHydrationWarning>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Nom & prénom */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>Prénom *</label>
                <input value={patient.prenom} onChange={e => setPatient((p: any) => ({ ...p, prenom: e.target.value }))}
                  placeholder="Prénom" style={inp()} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>Nom de famille *</label>
                <input value={patient.nom} onChange={e => setPatient((p: any) => ({ ...p, nom: e.target.value }))}
                  placeholder="Nom" style={inp()} />
              </div>

              {/* Téléphone principal */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>Téléphone *</label>
                <input value={patient.telephone} onChange={e => setPatient((p: any) => ({ ...p, telephone: e.target.value }))}
                  placeholder="+509 xxxx xxxx" type="tel" style={inp()} />
              </div>

              {/* WhatsApp */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
                  <i className="fa-brands fa-whatsapp" style={{ color: '#25d366', marginRight: 4 }} />
                  Numéro WhatsApp (si différent)
                </label>
                <input value={patient.telephone_whatsapp} onChange={e => setPatient((p: any) => ({ ...p, telephone_whatsapp: e.target.value }))}
                  placeholder="Même que téléphone si identique" type="tel" style={inp()} />
              </div>

              {/* Champs complets si pas pharmacie */}
              {needsFullForm && (
                <>
                  {/* Sexe */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>Sexe *</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[{ v: 'M', l: 'Masculin' }, { v: 'F', l: 'Féminin' }, { v: 'Autre', l: 'Autre' }].map(s => (
                        <label key={s.v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, background: patient.sexe === s.v ? '#eff6ff' : '#f8fafc', border: `1px solid ${patient.sexe === s.v ? '#1641C8' : '#e2e8f0'}`, borderRadius: 8, padding: '7px 12px', fontWeight: patient.sexe === s.v ? 700 : 500 }}>
                          <input type="radio" name="sexe" value={s.v} checked={patient.sexe === s.v} onChange={() => setPatient((p: any) => ({ ...p, sexe: s.v }))} style={{ margin: 0 }} />
                          {s.l}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date naissance + âge auto */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>Date de naissance *</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="date" value={patient.date_naissance} onChange={e => onDateNaissanceChange(e.target.value)}
                        max={new Date().toISOString().slice(0, 10)} style={{ ...inp(), flex: 1 }} />
                      {patient.age > 0 && (
                        <div style={{ background: '#eff6ff', color: '#1641C8', borderRadius: 10, padding: '10px 14px', fontWeight: 900, fontSize: 15, whiteSpace: 'nowrap' as const }}>
                          {patient.age} ans
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Médecin traitant */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
                      Médecin qui prend en charge *
                    </label>
                    <select value={patient.medecin_traitant} onChange={e => setPatient((p: any) => ({ ...p, medecin_traitant: e.target.value }))}
                      style={inp()}>
                      <option value="">Sélectionner le médecin</option>
                      {MEDECINS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  {/* Contact urgence */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>Personne à contacter (urgence)</label>
                    <input value={patient.contact_urgence_nom} onChange={e => setPatient((p: any) => ({ ...p, contact_urgence_nom: e.target.value }))}
                      placeholder="Nom du contact" style={inp()} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
                      <i className="fa-brands fa-whatsapp" style={{ color: '#25d366', marginRight: 4 }} />
                      Tel. urgence (avec WhatsApp)
                    </label>
                    <input value={patient.contact_urgence_tel} onChange={e => setPatient((p: any) => ({ ...p, contact_urgence_tel: e.target.value }))}
                      placeholder="+509 xxxx xxxx" type="tel" style={inp()} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Champs spécifiques Observation / Hospitalisation */}
          {isHospi && (
            <div style={{ background: 'white', borderRadius: 20, border: '2px solid #fde68a', padding: '28px 32px', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, color: '#92400e', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #fde68a' }}>
                {serviceActif === 'hospitalisation' ? 'Détails hospitalisation' : "Détails observation"}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const }}>Chambre / Lit</label>
                  <input value={patient.chambre} onChange={e => setPatient((p: any) => ({ ...p, chambre: e.target.value }))}
                    placeholder="Ex: Ch. 12 - Lit A" style={inp()} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const }}>
                    Nombre de jours {serviceActif === 'observation' ? "d'observation" : "d'hospitalisation"}
                  </label>
                  <input type="number" min={1} value={patient.nb_jours} onChange={e => setPatient((p: any) => ({ ...p, nb_jours: e.target.value }))}
                    style={inp()} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const }}>Frais médicaux (HTG)</label>
                  <input type="number" min={0} value={patient.frais_medicaux} onChange={e => setPatient((p: any) => ({ ...p, frais_medicaux: e.target.value }))}
                    placeholder="0" style={inp()} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const }}>Visite médecin (HTG)</label>
                  <input type="number" min={0} value={patient.frais_visite_medecin} onChange={e => setPatient((p: any) => ({ ...p, frais_visite_medecin: e.target.value }))}
                    placeholder="0" style={inp()} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const }}>Prix chambre / jour (HTG)</label>
                  <input type="number" min={0} value={patient.prix_chambre_par_jour} onChange={e => setPatient((p: any) => ({ ...p, prix_chambre_par_jour: e.target.value }))}
                    placeholder="0" style={inp()} />
                </div>
                {/* Total hospi calculé auto */}
                <div style={{ background: '#fef3c7', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>TOTAL ESTIMÉ</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
                    {formatHTG((Number(patient.frais_medicaux) || 0) + (Number(patient.frais_visite_medecin) || 0) + (Number(patient.prix_chambre_par_jour) || 0) * (Number(patient.nb_jours) || 1) + panier.reduce((a, p) => a + p.prix * p.qte, 0))}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const }}>Médicaments pris (nom + quantité)</label>
                  <textarea value={patient.medicaments_pris} onChange={e => setPatient((p: any) => ({ ...p, medicaments_pris: e.target.value }))}
                    placeholder="Ex: Amoxicilline 500mg × 3/jour, Paracétamol 500mg × 2/jour..." rows={3}
                    style={{ ...inp(), resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const }}>Examens effectués</label>
                  <textarea value={patient.examens_effectues} onChange={e => setPatient((p: any) => ({ ...p, examens_effectues: e.target.value }))}
                    placeholder="Ex: NFS, Glycémie à jeun, Radiographie thorax..." rows={3}
                    style={{ ...inp(), resize: 'vertical' }} />
                </div>
              </div>
            </div>
          )}

          {/* Règlement */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '28px 32px', marginBottom: 24 }}>
            <div style={{ fontWeight: 800, color: '#374151', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
              Règlement
            </div>

            {/* Résumé panier */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              {panier.map(it => (
                <div key={it.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>{it.label} × {it.qte}</span>
                  <span style={{ fontWeight: 700 }}>{formatHTG(it.prix * it.qte)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '2px solid #e2e8f0', fontSize: 15, fontWeight: 900 }}>
                <span>Total à payer</span>
                <span style={{ color: '#1641C8' }}>{formatHTG(totalHospi)}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' as const }}>Montant versé (HTG)</label>
                <input type="number" min={0} value={patient.montant_verse || ''} onChange={e => setPatient((p: any) => ({ ...p, montant_verse: e.target.value }))}
                  placeholder={String(totalHospi)} style={inp({ fontSize: 16, fontWeight: 700 })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ background: balance > 0 ? '#fef2f2' : balance < 0 ? '#f0fdf4' : '#f0fdf4', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>BALANCE</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: balance > 0 ? '#dc2626' : '#16a34a' }}>
                    {balance === 0 ? 'Soldé' : balance > 0 ? `-${formatHTG(balance)}` : `+${formatHTG(Math.abs(balance))}`}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 4 }}>
              <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, marginBottom: 10, textTransform: 'uppercase' as const }}>Mode de paiement</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {MODES_PAY.map(m => (
                  <button key={m} onClick={() => setModePay(m)}
                    style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      background: modePay === m ? '#1641C8' : '#f1f5f9',
                      color: modePay === m ? 'white' : '#475569' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={validerPatient} style={{ width: '100%', background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none', borderRadius: 16, padding: '15px 0', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
            Vérifier et continuer
          </button>
        </div>
      </div>
    )
  }

  // ── INTERFACE PRINCIPALE (PANIER) ─────────────────────────────────────────
  const catalogue = SERVICES_CATALOGUE[serviceActif] || []
  const catData = catalogue.find(c => c.cat === catActive) || catalogue[0]
  const medsFiltres = stocks.filter(s => !searchMed || s.nom.toLowerCase().includes(searchMed.toLowerCase()) || s.categorie.toLowerCase().includes(searchMed.toLowerCase()))
  const totalPanier = panier.reduce((a, p) => a + p.prix * p.qte, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#0f172a', height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 20, flexShrink: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 900, color: 'white', fontSize: '1rem' }}>Espace Caissier</div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 20 }}>
          <button onClick={() => setOngletPrincipal('caisse')} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: ongletPrincipal === 'caisse' ? '#1641C8' : 'rgba(255,255,255,0.08)', color: 'white' }}>
            Caisse
          </button>
          <button onClick={() => setOngletPrincipal('decaissement')} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: ongletPrincipal === 'decaissement' ? '#dc2626' : 'rgba(255,255,255,0.08)', color: 'white' }}>
            Décaissements
          </button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{user?.nom}</span>
          <button onClick={() => { logout(); router.push('/') }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 12 }}>
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Bouton + Panneau Rebecca AI */}
      <div style={{ padding:'10px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', background:'white' }}>
        <button onClick={() => setShowAI(v => !v)} style={{
          display:'flex', alignItems:'center', gap:8, padding:'8px 16px',
          borderRadius:50, border:'none', cursor:'pointer', fontWeight:700, fontSize:12,
          background: showAI ? '#d97706' : '#fffbeb', color: showAI ? 'white' : '#d97706',
        }}>
          <i className="fa-solid fa-wand-magic-sparkles" />
          {showAI ? 'Fermer AI' : 'Rebecca AI — Aide saisie décaissement'}
        </button>
      </div>
      {showAI && (
        <div style={{ margin:'12px 20px', borderRadius:20, overflow:'hidden', border:'1px solid #fde68a', maxHeight:420 }}>
          <RebeccaAI
            mode="caissier"
            context={{
              caissier_nom: user?.nom,
              date: new Date().toLocaleDateString('fr-FR'),
              instructions: "Le caissier saisit un montant et un motif de décaissement. Le système comptable gère automatiquement les comptes."
            }}
            compact
          />
        </div>
      )}

      {/* DÉCAISSEMENTS */}
      {ongletPrincipal === 'decaissement' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ background: 'white', borderRadius: 22, border: '1px solid #e2e8f0', padding: 36, maxWidth: 520, width: '100%' }}>
            <h2 style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem', marginBottom: 24 }}>
              <DollarSign size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: '#dc2626' }} />
              Enregistrer un décaissement journalier
            </h2>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, textTransform: 'uppercase' as const, marginBottom: 8 }}>Type de dépense</label>
              <select value={decType} onChange={e => setDecType(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, background: 'white' }}>
                {DECAISSEMENTS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, textTransform: 'uppercase' as const, marginBottom: 8 }}>Montant (HTG) *</label>
              <input type="number" value={decMontant} onChange={e => setDecMontant(e.target.value)} placeholder="0"
                style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 20, fontWeight: 800, outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: 12, textTransform: 'uppercase' as const, marginBottom: 8 }}>Description complète *</label>
              <div style={{ fontSize:11, color:'#94a3b8', marginBottom:6 }}>Précisez : fournisseur, objet exact, référence facture. Rebecca AI peut vous aider à formuler.</div>
              <textarea value={decNote} onChange={e => setDecNote(e.target.value)} placeholder="Ex: Achat médicaments — Pharmacie Dupont — 45 boîtes Amoxicilline — Facture #2026-042" rows={3}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' as const }} />
            </div>
            <button onClick={sauvegarderDecaissement} disabled={decLoading}
              style={{ width: '100%', background: '#dc2626', color: 'white', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: decLoading ? 0.7 : 1 }}>
              {decLoading ? 'Enregistrement...' : 'Enregistrer le décaissement'}
            </button>
          </div>
        </div>
      )}

      {/* CAISSE */}
      {ongletPrincipal === 'caisse' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar services */}
          <div style={{ width: 200, background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ padding: '14px 12px 8px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: 1 }}>Services</div>
            {SERVICES_MENU.map(s => (
              <button key={s.key} onClick={() => setServiceActif(s.key)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, textAlign: 'left' as const, transition: 'all 0.15s', marginBottom: 2,
                  background: serviceActif === s.key ? s.couleur + '12' : 'transparent',
                  color: serviceActif === s.key ? s.couleur : '#64748b',
                  borderLeft: `3px solid ${serviceActif === s.key ? s.couleur : 'transparent'}` }}>
                <i className={`fa-solid ${s.icon}`} style={{ fontSize: 13, width: 16, textAlign: 'center' as const }} />
                <span style={{ lineHeight: 1.3 }}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Zone centrale */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {/* Header service actif */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: serviceInfo.couleur + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fa-solid ${serviceInfo.icon}`} style={{ color: serviceInfo.couleur, fontSize: 16 }} />
              </div>
              <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', margin: 0 }}>{serviceInfo.label}</h2>
            </div>

            {/* PHARMACIE */}
            {serviceActif === 'pharmacie' && (
              <>
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input value={searchMed} onChange={e => setSearchMed(e.target.value)} placeholder="Rechercher un médicament..."
                    style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' as const }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {medsFiltres.map(s => (
                    <div key={s.id} onClick={() => s.quantite > 0 && addMed(s)}
                      style={{ background: 'white', borderRadius: 14, padding: '16px', border: `1px solid ${s.quantite <= s.seuil_min ? '#fde68a' : '#e2e8f0'}`, cursor: s.quantite > 0 ? 'pointer' : 'default', transition: 'all 0.2s', opacity: s.quantite <= 0 ? 0.45 : 1 }}
                      onMouseEnter={e => { if (s.quantite > 0) { const d = e.currentTarget; d.style.borderColor = '#1641C8'; d.style.boxShadow = '0 4px 16px rgba(22,65,200,0.1)' } }}
                      onMouseLeave={e => { const d = e.currentTarget; d.style.borderColor = s.quantite <= s.seuil_min ? '#fde68a' : '#e2e8f0'; d.style.boxShadow = 'none' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, marginBottom: 4, lineHeight: 1.4 }}>{s.nom}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>{s.categorie}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: '#1641C8', fontSize: 14 }}>{formatHTG(s.prix_unitaire)} <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>/{s.unite}</span></div>
                          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: s.quantite <= s.seuil_min ? '#d97706' : '#16a34a' }}>
                            Stock: {s.quantite} {s.unite}s
                          </div>
                        </div>
                        {s.quantite > 0 && (
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={14} color="#1641C8" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* AUTRES SERVICES (avec sous-catégories) */}
            {serviceActif !== 'pharmacie' && catalogue.length > 0 && (
              <>
                {catalogue.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {catalogue.map(c => (
                      <button key={c.cat} onClick={() => setCatActive(c.cat)}
                        style={{ padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                          background: catActive === c.cat ? serviceInfo.couleur : '#f1f5f9',
                          color: catActive === c.cat ? 'white' : '#64748b' }}>
                        {c.cat}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {(catData?.items || []).map(it => (
                    <div key={it.nom} onClick={() => addItem(it)}
                      style={{ background: 'white', borderRadius: 14, padding: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { const d = e.currentTarget; d.style.borderColor = serviceInfo.couleur; d.style.boxShadow = `0 4px 16px ${serviceInfo.couleur}22` }}
                      onMouseLeave={e => { const d = e.currentTarget; d.style.borderColor = '#e2e8f0'; d.style.boxShadow = 'none' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, marginBottom: 10, lineHeight: 1.4 }}>{it.nom}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 900, color: serviceInfo.couleur, fontSize: 15 }}>{formatHTG(it.prix)}</span>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: serviceInfo.couleur + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={14} color={serviceInfo.couleur} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* HOSPI / OBSERVATION — pas de catalogue, aller direct au formulaire */}
            {(serviceActif === 'hospitalisation' || serviceActif === 'observation') && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14, marginBottom: 8 }}>
                  {serviceActif === 'hospitalisation' ? 'Dossier d\'hospitalisation' : "Dossier d'observation"}
                </div>
                <p style={{ color: '#92400e', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                  Pour ce service, les frais sont saisis directement dans le formulaire patient (frais médicaux, visite médecin, chambre, médicaments, examens).
                  Vous pouvez aussi ajouter des actes supplémentaires ci-dessous.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {[
                    { nom: 'Injection IM', prix: 300 },
                    { nom: 'Perfusion IV', prix: 1200 },
                    { nom: 'Pansement', prix: 600 },
                    { nom: 'ECG', prix: 800 },
                    { nom: 'Radiographie', prix: 1800 },
                    { nom: 'Échographie', prix: 2500 },
                  ].map(it => (
                    <div key={it.nom} onClick={() => addItem(it)}
                      style={{ background: 'white', borderRadius: 12, padding: '14px', border: '1px solid #fde68a', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, marginBottom: 6 }}>{it.nom}</div>
                      <span style={{ fontWeight: 800, color: '#d97706', fontSize: 14 }}>{formatHTG(it.prix)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panier droite */}
          <div style={{ width: 300, background: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart size={17} color="#1641C8" />
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Panier</span>
              {panier.length > 0 && (
                <span style={{ marginLeft: 'auto', background: '#1641C8', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 900 }}>
                  {panier.reduce((a, p) => a + p.qte, 0)}
                </span>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
              {panier.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '40px 0', lineHeight: 1.6 }}>
                  Sélectionnez des services ou médicaments pour les ajouter
                </div>
              ) : (
                panier.map(it => (
                  <div key={it.label} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', flex: 1, lineHeight: 1.4, paddingRight: 8 }}>{it.label}</span>
                      <button onClick={() => removeItem(it.label)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 2, flexShrink: 0 }}>
                        <X size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => changeQte(it.label, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={11} />
                        </button>
                        <span style={{ fontWeight: 800, minWidth: 20, textAlign: 'center' as const, fontSize: 14 }}>{it.qte}</span>
                        <button onClick={() => changeQte(it.label, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={11} />
                        </button>
                      </div>
                      <span style={{ fontWeight: 900, color: '#1641C8', fontSize: 13 }}>{formatHTG(it.prix * it.qte)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {panier.length > 0 && (
              <div style={{ padding: '14px 16px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, paddingTop: 8 }}>
                  <span style={{ fontWeight: 900, color: '#0f172a', fontSize: 15 }}>Total</span>
                  <span style={{ fontWeight: 900, color: '#1641C8', fontSize: 16 }}>{formatHTG(totalPanier)}</span>
                </div>
                <button onClick={() => setEtape('patient')} style={{ width: '100%', background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <User size={15} /> Dossier patient
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
