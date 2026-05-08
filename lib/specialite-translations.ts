// ═══════════════════════════════════════════════════════════════════════════
// Traductions des spécialités médicales dans toutes les langues
// ═══════════════════════════════════════════════════════════════════════════

export type Lang = 'fr' | 'en' | 'ht' | 'es' | 'zh'

export const SPECIALITE_TRANSLATIONS: Record<string, Record<Lang, string>> = {
 'Médecine interne': { fr:'Médecine interne', en:'Internal Medicine', ht:'Medsin Entèn', es:'Medicina Interna', zh:'内科' },
 'Gynécologie': { fr:'Gynécologie', en:'Gynecology', ht:'Jinekologi', es:'Ginecología', zh:'妇科' },
 'Pédiatrie': { fr:'Pédiatrie', en:'Pediatrics', ht:'Pediatri', es:'Pediatría', zh:'儿科' },
 'Neurologie': { fr:'Neurologie', en:'Neurology', ht:'Newoloji', es:'Neurología', zh:'神经科' },
 'Neurochirurgie': { fr:'Neurochirurgie', en:'Neurosurgery', ht:'Newochiriiji', es:'Neurocirugía', zh:'神经外科' },
 'Orthopédie': { fr:'Orthopédie', en:'Orthopedics', ht:'Òtopedi', es:'Ortopedia', zh:'骨科' },
 'Chirurgie Générale': { fr:'Chirurgie Générale', en:'General Surgery', ht:'Chiriji Jeneral', es:'Cirugía General', zh:'普通外科' },
 'Chirurgie Pédiatrique': { fr:'Chirurgie Pédiatrique', en:'Pediatric Surgery', ht:'Chiriji Pediatrik', es:'Cirugía Pediátrica', zh:'小儿外科' },
 'Dermatologie': { fr:'Dermatologie', en:'Dermatology', ht:'Dèmatoloji', es:'Dermatología', zh:'皮肤科' },
 'ORL': { fr:'ORL', en:'ENT (Ear, Nose & Throat)', ht:'ORL', es:'ORL (Otorrino)', zh:'耳鼻喉科' },
 'Urologie': { fr:'Urologie', en:'Urology', ht:'Iwoloji', es:'Urología', zh:'泌尿科' },
 'Anesthésiologie / Réanimation':{ fr:'Anesthésiologie', en:'Anesthesiology & ICU', ht:'Anestezoloji', es:'Anestesiología', zh:'麻醉科' },
 'Dentisterie': { fr:'Dentisterie', en:'Dentistry', ht:'Dantistri', es:'Odontología', zh:'口腔科' },
 'Physiothérapie': { fr:'Physiothérapie', en:'Physical Therapy', ht:'Fizeyoterapi', es:'Fisioterapia', zh:'理疗科' },
 'Optométrie': { fr:'Optométrie', en:'Optometry', ht:'Optometri', es:'Optometría', zh:'视光科' },
 'Psychologie': { fr:'Psychologie', en:'Psychology', ht:'Sikoloji', es:'Psicología', zh:'心理科' },
 'Radiologie': { fr:'Radiologie', en:'Radiology', ht:'Radyoloji', es:'Radiología', zh:'放射科' },
}

/** Retourne le nom de la spécialité dans la langue demandée (fallback: français) */
export function tradSpecialite(specialite: string, lang: string): string {
 const map = SPECIALITE_TRANSLATIONS[specialite]
 if (!map) return specialite
 return map[lang as Lang] || map.fr || specialite
}

/** Mot "Tous" traduit */
export const TOUS: Record<Lang, string> = {
 fr: 'Tous', en: 'All', ht: 'Tout', es: 'Todos', zh: '全部'
}

/** Disponibilités traduites */
export const DISPOS: Record<string, Record<Lang, string>> = {
 'Lun–Sam 07h–17h': { fr:'Lun–Sam 07h–17h', en:'Mon–Sat 7am–5pm', ht:'Lun–Sam 07h–17h', es:'Lun–Sáb 07h–17h', zh:'周一至周六 7–17时' },
 'Lun–Ven 07h–17h': { fr:'Lun–Ven 07h–17h', en:'Mon–Fri 7am–5pm', ht:'Lun–Ven 07h–17h', es:'Lun–Vie 07h–17h', zh:'周一至周五 7–17时' },
}
export function tradDispo(dispo: string, lang: string): string {
 return DISPOS[dispo]?.[lang as Lang] || dispo
}
