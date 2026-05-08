// ═══════════════════════════════════════════════════════════════════════════
// SOURCE UNIQUE — Documents imprimables par rôle et service
// ═══════════════════════════════════════════════════════════════════════════

export interface DocType {
 type: string
 label: string
 icon: string
 couleur: string
 services: string[] // which services can use this
 roles: string[] // which roles can print this
}

// Services groupes
export const SERVICE_CLINIQUE_EXTERNE = ['medecine-interne','gynecologie','pediatrie','neurologie',
 'neurochirurgie','orthopedie','chirurgie-generale','chirurgie-pediatrique',
 'dermatologie','orl','urologie','anesthesiologie','radiologie','psychologie']
export const SERVICE_HOSPIT = ['hospitalisation','maternite','salle-sop']
export const SERVICE_DENTISTE = ['dentisterie']
export const SERVICE_PHYSIO = ['physiotherapie']
export const SERVICE_OPTOMETRIE = ['optometrie']

export const TOUS_SERVICES = [...SERVICE_CLINIQUE_EXTERNE, ...SERVICE_HOSPIT,
 ...SERVICE_DENTISTE, ...SERVICE_PHYSIO, ...SERVICE_OPTOMETRIE]

// Rôles autorisés
const MEDECIN_ROLES = ['medecin', 'infirmier', 'caissier', 'admin']
const CAISSIER_ROLES = ['caissier', 'admin']
const ALL_ROLES = ['medecin', 'infirmier', 'caissier', 'admin']

export const DOCUMENTS: DocType[] = [
 // ── CLINIQUE EXTERNE (tous médecins) ──────────────────────────────────
 {
 type: 'premiere_consultation',
 label: 'Feuille 1ère consultation',
 icon: '',
 couleur: '#1641C8',
 services: TOUS_SERVICES,
 roles: ALL_ROLES,
 },
 {
 type: 'rdv_suivi',
 label: 'Feuille RDV de suivi',
 icon: '',
 couleur: '#1641C8',
 services: TOUS_SERVICES,
 roles: ALL_ROLES,
 },
 {
 type: 'prescription',
 label: 'Ordonnance / Prescription',
 icon: '',
 couleur: '#7c3aed',
 services: [...SERVICE_CLINIQUE_EXTERNE, ...SERVICE_HOSPIT],
 roles: ALL_ROLES,
 },
 {
 type: 'demande_labo',
 label: 'Demande d\'examen labo',
 icon: '',
 couleur: '#16a34a',
 services: [...SERVICE_CLINIQUE_EXTERNE, ...SERVICE_HOSPIT],
 roles: ALL_ROLES,
 },
 {
 type: 'certificat',
 label: 'Certificat médical',
 icon: '',
 couleur: '#374151',
 services: [...SERVICE_CLINIQUE_EXTERNE, ...SERVICE_HOSPIT],
 roles: ALL_ROLES,
 },
 {
 type: 'ecg',
 label: 'Compte rendu ECG',
 icon: '',
 couleur: '#dc2626',
 services: ['medecine-interne','cardiologie','anesthesiologie','neurologie',
 'hospitalisation','maternite','salle-sop'],
 roles: ALL_ROLES,
 },
 {
 type: 'radiologie',
 label: 'Interprétation radiologie',
 icon: '',
 couleur: '#0369a1',
 services: ['radiologie','medecine-interne','orthopedie','neurochirurgie',
 'chirurgie-generale','hospitalisation','maternite','salle-sop'],
 roles: ALL_ROLES,
 },
 {
 type: 'echographie',
 label: 'Compte rendu échographie',
 icon: '',
 couleur: '#0d9488',
 services: ['gynecologie','pediatrie','medecine-interne','radiologie',
 'hospitalisation','maternite','chirurgie-generale'],
 roles: ALL_ROLES,
 },
 {
 type: 'feuille_blanche',
 label: 'Note libre / Feuille vierge',
 icon: '',
 couleur: '#64748b',
 services: TOUS_SERVICES,
 roles: ALL_ROLES,
 },
 // ── HOSPITALISATION / MATERNITE / SOP ────────────────────────────────
 {
 type: 'obs_infirmiere',
 label: 'Feuille d\'observation infirmière',
 icon: '',
 couleur: '#0369a1',
 services: SERVICE_HOSPIT,
 roles: ALL_ROLES,
 },
 {
 type: 'controle_infirmiere',
 label: 'Feuille de contrôle infirmière',
 icon: '',
 couleur: '#0369a1',
 services: SERVICE_HOSPIT,
 roles: ALL_ROLES,
 },
 {
 type: 'consentement_eclaire',
 label: 'Consentement éclairé',
 icon: '',
 couleur: '#374151',
 services: [...SERVICE_HOSPIT, 'neurochirurgie','chirurgie-generale',
 'chirurgie-pediatrique','orthopedie','salle-sop','orl','urologie'],
 roles: ALL_ROLES,
 },
 {
 type: 'exeat',
 label: 'Note d\'exéat / Sortie',
 icon: '',
 couleur: '#0369a1',
 services: SERVICE_HOSPIT,
 roles: ALL_ROLES,
 },
 {
 type: 'requisition_sang',
 label: 'Réquisition de sang',
 icon: '',
 couleur: '#dc2626',
 services: [...SERVICE_HOSPIT,'chirurgie-generale','neurochirurgie','orthopedie'],
 roles: ALL_ROLES,
 },
 {
 type: 'sortie_contre_avis',
 label: 'Sortie contre avis médical',
 icon: '',
 couleur: '#dc2626',
 services: SERVICE_HOSPIT,
 roles: ALL_ROLES,
 },
 // ── DENTISTERIE ───────────────────────────────────────────────────────
 {
 type: 'fiche_dentaire',
 label: 'Fiche de consultation dentaire',
 icon: '',
 couleur: '#0d9488',
 services: SERVICE_DENTISTE,
 roles: ALL_ROLES,
 },
 {
 type: 'prescription_dentaire',
 label: 'Prescription dentaire',
 icon: '',
 couleur: '#7c3aed',
 services: SERVICE_DENTISTE,
 roles: ALL_ROLES,
 },
 {
 type: 'devis_dentaire',
 label: 'Devis / Plan de traitement',
 icon: '',
 couleur: '#d97706',
 services: SERVICE_DENTISTE,
 roles: ALL_ROLES,
 },
 // ── PHYSIOTHÉRAPIE ────────────────────────────────────────────────────
 {
 type: 'bilan_physio',
 label: 'Bilan initial physiothérapie',
 icon: '',
 couleur: '#d97706',
 services: SERVICE_PHYSIO,
 roles: ALL_ROLES,
 },
 {
 type: 'seance_physio',
 label: 'Fiche de séance de rééducation',
 icon: '',
 couleur: '#d97706',
 services: SERVICE_PHYSIO,
 roles: ALL_ROLES,
 },
 {
 type: 'programme_physio',
 label: 'Programme d\'exercices',
 icon: '',
 couleur: '#d97706',
 services: SERVICE_PHYSIO,
 roles: ALL_ROLES,
 },
 // ── OPTOMÉTRIE ────────────────────────────────────────────────────────
 {
 type: 'examen_vue',
 label: 'Fiche examen de la vue',
 icon: '️',
 couleur: '#dc2626',
 services: SERVICE_OPTOMETRIE,
 roles: ALL_ROLES,
 },
 {
 type: 'prescription_lunettes',
 label: 'Prescription lunettes / lentilles',
 icon: '',
 couleur: '#dc2626',
 services: SERVICE_OPTOMETRIE,
 roles: ALL_ROLES,
 },
 // ── CAISSIER / ADMIN UNIQUEMENT ───────────────────────────────────────
 {
 type: 'etat_compte',
 label: 'État de compte patient',
 icon: '',
 couleur: '#d97706',
 services: TOUS_SERVICES,
 roles: CAISSIER_ROLES,
 },
 {
 type: 'resultats_labo',
 label: 'Résultats laboratoire',
 icon: '',
 couleur: '#16a34a',
 services: TOUS_SERVICES,
 roles: ALL_ROLES,
 },
]

// Get documents for a specific service and role
export function getDocsForContext(service: string, role: string): DocType[] {
 return DOCUMENTS.filter(d =>
 d.services.some(s => service.includes(s) || s.includes(service) || service === 'all') &&
 d.roles.includes(role)
 )
}

// Get service group from specialite string
export function getServiceGroup(specialite: string): string {
 const s = specialite.toLowerCase()
 if (s.includes('dentist')) return 'dentisterie'
 if (s.includes('physio')) return 'physiotherapie'
 if (s.includes('optom')) return 'optometrie'
 if (s.includes('maternit') || s.includes('gynéco') || s.includes('gyneco')) return 'maternite'
 if (s.includes('chirurgie') && !s.includes('péd') && !s.includes('ped')) return 'chirurgie-generale'
 if (s.includes('hospitali')) return 'hospitalisation'
 if (s.includes('sop') || s.includes('opérat')) return 'salle-sop'
 return 'medecine-interne' // default clinique externe
}
