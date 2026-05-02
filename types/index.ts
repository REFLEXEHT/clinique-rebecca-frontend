// types/index.ts — Types complets v3

export type Role = 'patient' | 'medecin' | 'admin' | 'caissier' | 'labo' | 'pharmacie'
export type StatutRDV = 'en_attente' | 'paiement_requis' | 'paiement_effectue' | 'confirme' | 'propose_autre_moment' | 'annule' | 'termine'
export type TypeRDV = 'presentiel' | 'video'
export type TypeMouvement = 'recette' | 'depense'
export type TypeActe = 'consultation' | 'geste' | 'intervention' | 'observation' | 'hospitalisation'

// ─── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  nom: string
  email: string
  role: Role
  specialite?: string
  telephone?: string
}

// ─── Patient (liste admin) ────────────────────────────────────────────────────
export interface Patient {
  id: number
  numero?: string
  nom: string
  prenom?: string
  email?: string | null
  telephone?: string | null
  code_unique?: string
  age?: number
  sexe?: 'M' | 'F' | 'Autre'
  date_naissance?: string | null
  adresse?: string | null
  created_at?: string
}

// ─── Patient complet ──────────────────────────────────────────────────────────
export interface PatientComplet {
  // Champs obligatoires
  id?: number
  code_unique: string          // Ex: #RB-00142 — généré automatiquement
  nom: string
  telephone: string            // Obligatoire
  // Champs obligatoires pour tout service (hors pharmacie)
  date_naissance?: string
  age?: number                 // Calculé automatiquement
  sexe?: 'M' | 'F' | 'Autre'
  contact_urgence_nom?: string
  contact_urgence_tel?: string  // Avec WhatsApp
  // Champs optionnels
  email?: string
  adresse?: string
  created_at?: string
}

// ─── Transaction / Reçu ───────────────────────────────────────────────────────
export interface Transaction {
  id?: number
  numero_recu: string          // Ex: REC-20260422-001
  code_patient: string         // Code unique patient
  patient_nom: string
  patient_telephone: string
  service: string
  detail: string
  montant: number
  mode_paiement: string
  date: string
  caissier_nom: string
  type: 'vente_pharmacie' | 'consultation' | 'labo' | 'autre_service'
  items?: TransactionItem[]    // Pour pharmacie (panier)
}
export interface TransactionItem {
  nom: string
  quantite: number
  prix_unitaire: number
  sous_total: number
}

// ─── Service ──────────────────────────────────────────────────────────────────
export interface Service {
  id: number
  nom: string
  description: string | null
  icone: string
  couleur: string
  ordre: number
  actif: boolean
}

// ─── Spécialiste ──────────────────────────────────────────────────────────────
export interface Specialiste {
  id: number
  nom: string
  specialite: string
  description: string | null
  emoji: string
  categorie: string
  email: string | null
  telephone: string | null
  actif: boolean
  ordre: number
  bio?: string
  tags?: string[]
  photo?: string
}

// ─── Horaire ──────────────────────────────────────────────────────────────────
export interface Horaire {
  id: number
  jour: string
  ouvert: boolean
  heure_ouverture: string
  heure_fermeture: string
}

// ─── Rendez-vous ──────────────────────────────────────────────────────────────
export interface RendezVous {
  id: number
  patient_nom: string
  patient_telephone: string
  patient_email: string | null
  code_patient?: string
  specialite: string
  date_rdv: string
  type_rdv: TypeRDV
  statut: StatutRDV
  motif: string | null
  notes_admin: string | null
  mode_paiement: string | null
  rappel_envoye: boolean
  lien_video?: string
  numero_rdv?: string
  created_at: string
  confirme_par_role?: string
  autre_moment_propose?: string
  autre_moment_message?: string
  medecin_nom?: string
  medecin_id?: number
}

export interface RendezVousCreate {
  patient_nom: string
  patient_telephone: string
  patient_email?: string
  specialite: string
  date_rdv: string
  type_rdv: TypeRDV
  motif?: string
  mode_paiement?: string
  reference_paiement?: string
  lien_video?: string
  numero_rdv?: string
}

// ─── Acte médical ─────────────────────────────────────────────────────────────
export interface Acte {
  id: number
  patient_id: string
  patient_nom: string
  type_acte: TypeActe
  service: string
  description: string | null
  notes: string | null
  date_acte: string
  medecin_id: number
  medecin_nom: string
}

export interface ActeCreate {
  patient_id: string
  patient_nom: string
  type_acte: TypeActe
  service: string
  description?: string
  notes?: string
  date_acte: string
}

// ─── Mouvement comptable ──────────────────────────────────────────────────────
export interface Mouvement {
  id: number
  type: TypeMouvement
  categorie: string
  description: string
  montant: number
  date_mouvement: string
  mode_paiement: string
  reference: string | null
  notes: string | null
  created_at: string
}

export interface MouvementCreate {
  type: TypeMouvement
  categorie: string
  description: string
  montant: number
  date_mouvement: string
  mode_paiement: string
  reference?: string
  notes?: string
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface DashboardStats {
  rdv_today: number
  rdv_month: number
  patients_month: number
  recettes_day: number
  recettes_month: number
  rdv_en_attente: number
  taux_presence: number
}

export interface MedecinStats {
  consultations_mois: number
  patients_uniques: number
  rdv_semaine: number
  taux_presence: number
}

// ─── Stock pharmacie ──────────────────────────────────────────────────────────
export interface StockItem {
  id: number
  nom: string
  categorie: string
  quantite: number
  seuil_min: number
  prix_unitaire: number
  unite: string
}

// ─── Résultat labo ────────────────────────────────────────────────────────────
export interface ResultatLabo {
  id: number
  patient_id: string
  patient_nom: string
  type_examen: string
  resultats: string
  notes: string | null
  date_examen: string
  technicien_id: number
  status: 'en_attente' | 'disponible' | 'envoye'
}

// ─── Tarif ────────────────────────────────────────────────────────────────────
export interface Tarif {
  id: number
  service: string
  type_acte: string
  prix_htg: number
  actif: boolean
}

// ─── Chat IA ──────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ─── Reçu imprimable ──────────────────────────────────────────────────────────
export interface RecuData {
  numero: string
  date: string
  patient_nom: string
  patient_code: string
  patient_tel: string
  service: string
  items: { label: string; prix: number }[]
  total: number
  mode_paiement: string
  caissier: string
}
