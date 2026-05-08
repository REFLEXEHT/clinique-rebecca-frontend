// ═══════════════════════════════════════════════════════════════════════════
// SOURCE UNIQUE DE VÉRITÉ — Tous les médecins de la Clinique de la Rebecca
// Modifier ici → propagé automatiquement sur toutes les pages
// ═══════════════════════════════════════════════════════════════════════════

export interface Medecin {
 id: number
 nom: string
 titre: string // 'Dr' | 'Mme' | 'Mr' | ''
 specialite: string
 email: string
 telephone?: string
 emoji: string
 photo?: string // /uploads/medecins/nom.jpg si uploadée
 bio?: string
 disponibilites: string
 type?: 'affilie' | 'investisseur' | 'exploitant'
 actif: boolean
}

export const MEDECINS: Medecin[] = [
 { id:1, nom:'Vania Louissaint', titre:'Dr', specialite:'Médecine interne', email:'v.louissaint@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:2, nom:'Christelle Philippe', titre:'Dr', specialite:'Médecine interne', email:'c.philippe@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:3, nom:'Eliode Pierre', titre:'Dr', specialite:'Gynécologie', email:'e.pierre@cliniquerebecca.ht', emoji:'‍', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:4, nom:'Delvalès Doccy', titre:'Dr', specialite:'Gynécologie', email:'d.doccy@cliniquerebecca.ht', emoji:'‍', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:5, nom:'Bob-Hallen Treisma', titre:'Dr', specialite:'Gynécologie', email:'b.treisma@cliniquerebecca.ht', emoji:'‍', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:6, nom:'Jean Daniel', titre:'Dr', specialite:'Gynécologie', email:'j.daniel@cliniquerebecca.ht', emoji:'‍', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:7, nom:'Enold Lubin', titre:'Dr', specialite:'Gynécologie', email:'e.lubin@cliniquerebecca.ht', emoji:'‍', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:8, nom:'Dauphin Roolandro', titre:'Dr', specialite:'Gynécologie', email:'d.roolandro@cliniquerebecca.ht', emoji:'‍', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:9, nom:'Mikerline Charles', titre:'Dr', specialite:'Pédiatrie', email:'m.charles@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:10, nom:'Duvivier', titre:'Dr', specialite:'Pédiatrie', email:'duvivier@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:11, nom:'Rose Stephanie Joseph',titre:'Dr', specialite:'Pédiatrie', email:'r.joseph@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:12, nom:'Lemoine Lafleur', titre:'Dr', specialite:'Neurologie', email:'l.lafleur@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:13, nom:'Bernard Pierre', titre:'Dr', specialite:'Neurochirurgie', email:'b.pierre@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:14, nom:'Peterly PHILIPPE', titre:'Dr', specialite:'Orthopédie', email:'p.philippe@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:15, nom:'Brunot Simon', titre:'Dr', specialite:'Orthopédie', email:'b.simon@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:16, nom:'Clifford Edouard', titre:'Dr', specialite:'Orthopédie', email:'c.edouard@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:17, nom:'Auguste Samy', titre:'Dr', specialite:'Orthopédie', email:'a.samy@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:18, nom:'Wisly Joseph', titre:'Dr', specialite:'Chirurgie Générale', email:'w.joseph@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:19, nom:'Jean Berldine', titre:'Dr', specialite:'Chirurgie Générale', email:'j.berldine@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:20, nom:'Jeff Tesnor', titre:'Dr', specialite:'Chirurgie Générale', email:'j.tesnor@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:21, nom:'Jenh Robert', titre:'Dr', specialite:'Chirurgie Pédiatrique', email:'j.robert@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:22, nom:'Sophie Beaujour', titre:'Dr', specialite:'Dermatologie', email:'s.beaujour@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:23, nom:'Kaina Michaud', titre:'Dr', specialite:'ORL', email:'k.michaud@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:24, nom:'Pierre Billy Lemaus', titre:'Dr', specialite:'Urologie', email:'p.lemaus@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:25, nom:'Marie Kerline Pierre', titre:'Dr', specialite:'Anesthésiologie / Réanimation', email:'mk.pierre@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:26, nom:'Wolf Charlie Cajuste', titre:'Dr', specialite:'Dentisterie', email:'wc.cajuste@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:27, nom:'Fredia Fleurival', titre:'Mme', specialite:'Physiothérapie', email:'f.fleurival@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:28, nom:'Gilles Abraham', titre:'M.', specialite:'Optométrie', email:'g.abraham@cliniquerebecca.ht', emoji:'️', disponibilites:'Lun–Sam 07h–17h', actif:true },
 { id:29, nom:'Reginald Volcy', titre:'Mr', specialite:'Psychologie', email:'r.volcy@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Ven 07h–17h', actif:true },
 { id:30, nom:'Jean Luc Mathurin', titre:'Dr', specialite:'Radiologie', email:'jl.mathurin@cliniquerebecca.ht', emoji:'', disponibilites:'Lun–Sam 07h–17h', actif:true },
]

// Helper: nom complet avec titre
export const nomComplet = (m: Medecin) => m.titre ? `${m.titre} ${m.nom}` : m.nom

// Helper: get by specialite
export const parSpecialite = (spec: string) =>
 MEDECINS.filter(m => m.specialite.toLowerCase() === spec.toLowerCase() && m.actif)

// Helper: get by id
export const parId = (id: number) => MEDECINS.find(m => m.id === id)
