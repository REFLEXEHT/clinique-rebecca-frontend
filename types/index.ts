// types/index.ts — Tous les types TypeScript du projet

export type Role = 'patient' | 'medecin' | 'admin' | 'caissier' | 'labo' | 'pharmacie'

export type StatutRDV = 'en_attente' | 'confirme' | 'annule' | 'termine'
export type TypeRDV = 'presentiel' | 'video'
export type TypeMouvement = 'recette' | 'depense'
export type TypeActe = 'consultation' | 'geste' | 'intervention' | 'observation' | 'hospitalisation'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  nom: string
  email: string
  role: Role
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// ─── Service ─────────────────────────────────────────────────────────────────
export interface Service {
  id: number
  nom: string
  description: string | null
  icone: string
  couleur: string
  ordre: number
  actif: boolean
}

// ─── Spécialiste ─────────────────────────────────────────────────────────────
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
}

// ─── Horaire ─────────────────────────────────────────────────────────────────
export interface Horaire {
  id: number
  jour: string
  ouvert: boolean
  heure_ouverture: string
  heure_fermeture: string
}

// ─── Patient ─────────────────────────────────────────────────────────────────
export interface Patient {
  id: number
  numero: string
  nom: string
  prenom: string | null
  telephone: string | null
  email: string | null
  adresse: string | null
  created_at: string
}

// ─── Rendez-vous ─────────────────────────────────────────────────────────────
export interface RendezVous {
  id: number
  patient_nom: string
  patient_telephone: string
  patient_email: string | null
  specialite: string
  date_rdv: string
  type_rdv: TypeRDV
  statut: StatutRDV
  motif: string | null
  notes_admin: string | null
  mode_paiement: string | null
  rappel_envoye: boolean
  created_at: string
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
}

// ─── Acte médical ────────────────────────────────────────────────────────────
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

// ─── Stats dashboard ─────────────────────────────────────────────────────────
export interface DashboardStats {
  rdv_today: number
  rdv_month: number
  patients_month: number
  recettes_day: number
  recettes_month: number
  rdv_en_attente: number
  taux_presence: number
}

// ─── Stock pharmacie ─────────────────────────────────────────────────────────
export interface StockItem {
  id: number
  nom: string
  categorie: string
  quantite: number
  seuil_min: number
  prix_unitaire: number
  unite: string
}

// ─── Résultat labo ───────────────────────────────────────────────────────────
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

// ─── Tarif ───────────────────────────────────────────────────────────────────
export interface Tarif {
  id: number
  service: string
  type_acte: string
  prix_htg: number
  actif: boolean
}

// ─── Chat IA ─────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ─── Form helpers ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
}
