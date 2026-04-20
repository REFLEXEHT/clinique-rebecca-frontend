export interface Service {
  id: number
  nom: string
  description: string | null
  icone: string
  couleur: string
  ordre: number
  actif: boolean
}

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
}

export interface Horaire {
  id: number
  jour: string
  ouvert: boolean
  heure_ouverture: string
  heure_fermeture: string
}

export interface RendezVous {
  id: number
  patient_nom: string
  patient_telephone: string
  patient_email: string | null
  specialite: string
  date_rdv: string
  type_rdv: 'presentiel' | 'video'
  statut: 'en_attente' | 'confirme' | 'annule' | 'termine'
  motif: string | null
  notes_admin: string | null
  created_at: string
}

export interface Mouvement {
  id: number
  type: 'recette' | 'depense'
  categorie: string
  description: string
  montant: number
  date_mouvement: string
  mode_paiement: string
  reference: string | null
  created_at: string
}

export interface DashboardStats {
  rdv_today: number
  rdv_month: number
  patients_month: number
  recettes_day: number
  recettes_month: number
  rdv_en_attente: number
  taux_presence: number
}

export interface Patient {
  id: number
  numero: string
  nom: string
  prenom: string | null
  telephone: string | null
  email: string | null
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
