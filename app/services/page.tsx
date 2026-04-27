'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const SERVICES_DATA: Record<string, any> = {
  'clinique-externe': {
    titre:'Clinique Externe', icon:'fa-stethoscope', couleur:'#1641C8', bg:'#eff6ff',
    description:'La clinique externe regroupe 12 spécialités médicales dédiées à votre santé. Nos médecins qualifiés assurent des consultations, suivis, diagnostics et traitements dans un cadre moderne et accueillant.',
    medecins:[
      { nom:"Dr Vania Louissaint",      specialite:"Médecine interne",   prix:5000, tel:"4217-8031", emoji:"🩺" },
      { nom:"Dr Christelle Philippe",   specialite:"Médecine interne",   prix:4000, tel:"3894-8400", emoji:"🩺" },
      { nom:"Dr Lemoine Lafleur",       specialite:"Neurologie",         prix:6000, tel:"4869-0495", emoji:"🧠" },
      { nom:"Dr Eliode Pierre",         specialite:"Gynécologie",        prix:3000, tel:"3774-9416", emoji:"👩‍⚕️" },
      { nom:"Dr Delvalès Doccy",        specialite:"Gynécologie",        prix:5000, tel:"3493-6533", emoji:"👩‍⚕️" },
      { nom:"Dr Bob-Hallen Treisma",    specialite:"Gynécologie",        prix:5000, tel:"3816-5368", emoji:"👩‍⚕️" },
      { nom:"Dr Jean Daniel",           specialite:"Gynécologie",        prix:3000, tel:"3634-3265", emoji:"👩‍⚕️" },
      { nom:"Dr Enold Lubin",           specialite:"Gynécologie",        prix:4000, tel:"4853-4651", emoji:"👩‍⚕️" },
      { nom:"Dr Sophie Beaujour",       specialite:"Dermatologie",       prix:3000, tel:"3294-3481", emoji:"🧬" },
      { nom:"Dr Kaina Michaud",         specialite:"ORL",                prix:4000, tel:"3891-1659", emoji:"👂" },
      { nom:"Mr Reginald Volcy",        specialite:"Psychologie",        prix:3000, tel:"4308-9457", emoji:"🧬" },
      { nom:"Dr Jean Luc Mathurin",     specialite:"Radiologie",         prix:0,    tel:"4007-6328", emoji:"🩻" },
    ],
    infos:['Horaires : Lun–Ven 07h–17h, Sam 07h–12h','Paiement : Espèces, MonCash, NatCash','Résultats : disponibles sous 24-48h'],
  },
  'laboratoire': {
    titre:'Laboratoire', icon:'fa-flask-vial', couleur:'#16a34a', bg:'#f0fdf4',
    description:'Notre laboratoire propose 165 analyses biologiques avec des équipements modernes. Les résultats sont envoyés directement sur votre téléphone via WhatsApp.',
    medecins:[],
    examens_vedettes:['Hémogramme complet — 1 000 HTG','Glycémie — 900 HTG','Sérologie HIV — 1 000 HTG','Hépatite B — 1 400 HTG','Bilan rénal — 1 500 HTG','HBA1C — 2 000 HTG','TORCH — 8 600 HTG','TSH — 1 500 HTG'],
    infos:['Résultats envoyés par WhatsApp','Horaires : Lun–Sam 07h–15h','Prélèvement sur place ou à domicile (déplacement en sus)'],
  },
  'pharmacie': {
    titre:'Pharmacie', icon:'fa-pills', couleur:'#7c3aed', bg:'#f5f3ff',
    description:'Notre pharmacie interne offre des médicaments génériques et de marque à des prix accessibles pour tous les patients de la clinique.',
    medecins:[],
    infos:['Médicaments sur ordonnance et sans ordonnance','Conseils pharmaceutiques gratuits','Stocks régulièrement mis à jour'],
  },
  'dentisterie': {
    titre:'Dentisterie', icon:'fa-tooth', couleur:'#0d9488', bg:'#f0fdfa',
    description:'La dentisterie de la Clinique Rebecca offre une gamme complète de soins dentaires allant des extractions simples aux prothèses et aux appareils orthodontiques.',
    medecins:[
      { nom:"Dr Wolf Charlie Cajuste", specialite:"Dentisterie", prix:2500, tel:"3810-7562", emoji:"🦷" },
    ],
    tarifs_vedettes:['Consultation — 2 500 HTG','Extraction simple — 5 000 HTG','Prophylaxie grade 1 — 7 500 HTG','Couronne porcelaine — 500 USD','Couronne zirconium — 600 USD','Braces — 200 USD','Endodontie antérieure — 20 000 HTG'],
    infos:['Consultations HTG et procédures spécialisées en USD','Paiement échelonné disponible pour traitements importants'],
  },
  'physiotherapie': {
    titre:'Physiothérapie', icon:'fa-person-walking', couleur:'#d97706', bg:'#fffbeb',
    description:'La physiothérapie offre une prise en charge complète pour la rééducation fonctionnelle, les traumatismes, AVC et douleurs chroniques.',
    medecins:[
      { nom:"Mme Fredia Fleurival", specialite:"Physiothérapeute", prix:3000, tel:"3368-8796", emoji:"🏥" },
    ],
    infos:['Séances individuelles sur rendez-vous','Forfaits multi-séances disponibles','Prise en charge des références médicales'],
  },
  'optometrie': {
    titre:'Optométrie', icon:'fa-glasses', couleur:'#dc2626', bg:'#fef2f2',
    description:'Examens de la vue complets et vente de montures. Dr Gilles Abraham assure les consultations et prescriptions de lunettes correctrices.',
    medecins:[
      { nom:"Dr Gilles Abraham", specialite:"Optométrie", prix:2000, tel:"3627-1021", emoji:"👁️" },
    ],
    infos:['Examen complet — 2 000 HTG','Large choix de montures','Verres progressifs et unifocaux','Contrat : 35% consultation + 13% montures pour la clinique'],
  },
  'maternite': {
    titre:'Maternité', icon:'fa-baby', couleur:'#ec4899', bg:'#fdf2f8',
    description:'Suivi de grossesse complet et accouchement sécurisé par une équipe de gynécologues et pédiatres qualifiés.',
    medecins:[
      { nom:"Dr Eliode Pierre",      specialite:"Gynécologie", prix:3000, tel:"3774-9416", emoji:"👩‍⚕️" },
      { nom:"Dr Delvalès Doccy",     specialite:"Gynécologie", prix:5000, tel:"3493-6533", emoji:"👩‍⚕️" },
      { nom:"Dr Bob-Hallen Treisma", specialite:"Gynécologie", prix:5000, tel:"3816-5368", emoji:"👩‍⚕️" },
      { nom:"Dr Mikerline Charles",  specialite:"Pédiatrie",   prix:3000, tel:"3673-8631", emoji:"👶" },
    ],
    infos:['Suivi prénatal complet','Échographie obstétricale disponible','Accouchement médicalisé','Consultation pédiatrique néonatale'],
  },
  'salle-sop': {
    titre:'Salle Opératoire', icon:'fa-scalpel', couleur:'#64748b', bg:'#f8fafc',
    description:'Bloc opératoire moderne équipé pour les chirurgies générales, orthopédiques, gynécologiques et neurochirurgicales.',
    medecins:[
      { nom:"Dr Wisly Joseph",         specialite:"Chirurgie Générale",  prix:3000, tel:"3865-5254", emoji:"🔬" },
      { nom:"Dr Jean Berldine",        specialite:"Chirurgie Générale",  prix:4000, tel:"3685-7346", emoji:"🔬" },
      { nom:"Dr Jeff Tesnor",          specialite:"Chirurgie Générale",  prix:6000, tel:"3459-4612", emoji:"🔬" },
      { nom:"Dr Peterly PHILIPPE",     specialite:"Orthopédie",          prix:6500, tel:"3780-4789", emoji:"🦴" },
      { nom:"Dr Bernard Pierre",       specialite:"Neurochirurgie",      prix:5000, tel:"3719-2362", emoji:"🧠" },
      { nom:"Dr Pierre Billy Lemaus",  specialite:"Urologie",            prix:5000, tel:"3663-8503", emoji:"🩺" },
      { nom:"Dr Marie Kerline Pierre", specialite:"Anesthésiologie",     prix:5000, tel:"3780-6951", emoji:"💉" },
    ],
    infos:['Bloc opératoire équipé aux normes','Anesthésie générale et loco-régionale','Chirurgies programmées et urgences'],
  },
  'gestes-medicaux': {
    titre:'Gestes Médicaux', icon:'fa-syringe', couleur:'#f59e0b', bg:'#fffbeb',
    description:'Soins infirmiers et actes médicaux rapides. Injections, perfusions, pansements et surveillance sans rendez-vous.',
    medecins:[],
    infos:['Injection IM — 1 500 HTG','Injection IV — 2 000 HTG','Perfusion (avec soluté) — 3 000 HTG','Pansement simple — 1 500 HTG','Disponible sans rendez-vous'],
  },
}

export default function ServiceDetailPage() {
  const params = useParams()
  const slug   = params?.slug as string
  const svc    = SERVICES_DATA[slug]

  if (!svc) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:'1.2rem', color:'#64748b', marginBottom:16 }}>Service introuvable</p>
        <Link href="/services" style={{ color:'#1641C8', fontWeight:700 }}>← Retour aux services</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Navbar variant="public" />

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,#0f1e3d,${svc.couleur})`, padding:'56px 20px 40px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <Link href="/services" style={{ color:'rgba(255,255,255,0.7)', fontSize:13, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6, marginBottom:20 }}>
            <i className="fa-solid fa-arrow-left" /> Tous les services
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className={`fa-solid ${svc.icon}`} style={{ color:'white', fontSize:28 }} />
            </div>
            <div>
              <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.6rem,4vw,2.4rem)', margin:0 }}>{svc.titre}</h1>
            </div>
          </div>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'1rem', maxWidth:600, margin:'16px 0 0', lineHeight:1.7 }}>{svc.description}</p>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'36px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns: svc.medecins?.length > 0 ? '1fr 320px' : '1fr', gap:24 }}>

          {/* Médecins */}
          {svc.medecins?.length > 0 && (
            <div>
              <h2 style={{ fontWeight:800, fontSize:'1.1rem', color:'#0f172a', marginBottom:16 }}>
                Nos spécialistes
              </h2>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {svc.medecins.map((m: any, i: number) => (
                  <div key={i} style={{ background:'white', borderRadius:16, padding:18, border:'1px solid #e2e8f0', display:'flex', gap:14, alignItems:'center' }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:`linear-gradient(135deg,${svc.couleur},#0d9488)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                      {m.emoji}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, color:'#0f172a', fontSize:14 }}>{m.nom}</div>
                      <div style={{ color:svc.couleur, fontSize:12, fontWeight:600 }}>{m.specialite}</div>
                      {m.tel && <div style={{ color:'#94a3b8', fontSize:12, marginTop:3 }}>📞 {m.tel}</div>}
                    </div>
                    {m.prix > 0 && (
                      <span style={{ background:svc.bg, color:svc.couleur, borderRadius:50, padding:'4px 12px', fontSize:12, fontWeight:700, whiteSpace:'nowrap' }}>
                        {m.prix.toLocaleString()} HTG
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sidebar infos */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Tarifs vedettes */}
            {(svc.tarifs_vedettes || svc.examens_vedettes || svc.infos) && (
              <div style={{ background:'white', borderRadius:16, padding:20, border:'1px solid #e2e8f0' }}>
                <h3 style={{ fontWeight:700, color:'#0f172a', fontSize:14, marginBottom:12 }}>
                  {svc.tarifs_vedettes ? '💰 Tarifs principaux' : svc.examens_vedettes ? '🔬 Examens populaires' : 'ℹ️ Informations'}
                </h3>
                {(svc.tarifs_vedettes || svc.examens_vedettes)?.map((t: string, i: number) => (
                  <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid #f1f5f9', fontSize:13, color:'#475569', display:'flex', justifyContent:'space-between' }}>
                    <span>{t.split('—')[0]}</span>
                    <span style={{ fontWeight:700, color:svc.couleur }}>{t.split('—')[1]}</span>
                  </div>
                ))}
                {svc.infos?.map((info: string, i: number) => (
                  <div key={i} style={{ padding:'7px 0', borderBottom:'1px solid #f1f5f9', fontSize:13, color:'#64748b', display:'flex', gap:8 }}>
                    <span style={{ color:svc.couleur }}>✓</span> {info}
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div style={{ background:`linear-gradient(135deg,${svc.couleur},#0d9488)`, borderRadius:16, padding:20, textAlign:'center' }}>
              <p style={{ color:'white', fontWeight:700, margin:'0 0 14px', fontSize:15 }}>Prendre rendez-vous</p>
              <Link href="/consultation" style={{ background:'white', color:svc.couleur, textDecoration:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, fontSize:14, display:'inline-block' }}>
                Réserver maintenant
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
