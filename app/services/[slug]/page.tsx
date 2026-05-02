'use client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const CLINIQUE_TEL = '(509) 4858-5757'

// ── Branches clinique externe avec contenu ──────────────────────────────
const BRANCHES_CLINIQUE = [
  { slug:'medecine-interne', label:'Médecine Interne', icon:'🩺', email:'medecine@cliniquerebecca.ht',
    desc:'Prise en charge des maladies chroniques (diabète, hypertension, insuffisance cardiaque), infections, troubles digestifs et bilan de santé général.',
    medecins:['Dr Vania Louissaint','Dr Christelle Philippe'] },
  { slug:'gynecologie', label:'Gynécologie', icon:'👩‍⚕️', email:'gyneco@cliniquerebecca.ht',
    desc:'Suivi gynécologique annuel, contraception, maladies sexuellement transmissibles, infections vaginales, ménopause et bilan de fertilité.',
    medecins:['Dr Eliode Pierre','Dr Delvalès Doccy','Dr Bob-Hallen Treisma','Dr Jean Daniel','Dr Enold Lubin','Dr Dauphin Roolandro'] },
  { slug:'pediatrie', label:'Pédiatrie', icon:'👶', email:'pediatrie@cliniquerebecca.ht',
    desc:'Santé de l\'enfant de 0 à 15 ans : vaccinations, suivi de croissance, maladies infantiles, nutrition pédiatrique et développement psychomoteur.',
    medecins:['Dr Mikerline Charles','Dr Duvivier','Dr Rose Stephanie Joseph'] },
  { slug:'neurologie', label:'Neurologie', icon:'🧠', email:'neurologie@cliniquerebecca.ht',
    desc:'Maux de tête chroniques, épilepsie, AVC, maladies de Parkinson, sclérose en plaques, neuropathies périphériques et troubles de la mémoire.',
    medecins:['Dr Lemoine Lafleur'] },
  { slug:'neurochirurgie', label:'Neurochirurgie', icon:'🔬', email:'neurochir@cliniquerebecca.ht',
    desc:'Chirurgie du cerveau et de la moelle épinière, hernie discale, tumeurs cérébrales, traumatismes crâniens et sténose rachidienne.',
    medecins:['Dr Bernard Pierre'] },
  { slug:'orthopedie', label:'Orthopédie', icon:'🦴', email:'ortho@cliniquerebecca.ht',
    desc:'Fractures, entorses, arthrose, prothèses de hanche et de genou, chirurgie du rachis, traumatologie sportive et rééducation post-opératoire.',
    medecins:['Dr Peterly PHILIPPE','Dr Brunot Simon','Dr Clifford Edouard','Dr Auguste Samy'] },
  { slug:'chirurgie-generale', label:'Chirurgie Générale', icon:'⚕️', email:'chirurgie@cliniquerebecca.ht',
    desc:'Appendicectomie, hernie, vésicule biliaire, thyroïde, chirurgie digestive, biopsies et chirurgie laparoscopique mini-invasive.',
    medecins:['Dr Wisly Joseph','Dr Jean Berldine','Dr Jeff Tesnor'] },
  { slug:'chirurgie-pediatrique', label:'Chirurgie Pédiatrique', icon:'👶', email:'chirpediatrie@cliniquerebecca.ht',
    desc:'Chirurgie de l\'enfant : hernies, appendicite, malformations congénitales, phimosis, cryptorchidie et traumatismes pédiatriques.',
    medecins:['Dr Jenh Robert'] },
  { slug:'dermatologie', label:'Dermatologie', icon:'🧬', email:'dermato@cliniquerebecca.ht',
    desc:'Acné, eczéma, psoriasis, infections cutanées, mycoses, alopécie, vitiligo, tumeurs cutanées et allergies dermatologiques.',
    medecins:['Dr Sophie Beaujour'] },
  { slug:'orl', label:'ORL', icon:'👂', email:'orl@cliniquerebecca.ht',
    desc:'Otites, sinusites, angines, rhinites allergiques, troubles de l\'audition, vertiges, ronflements et chirurgie des amygdales.',
    medecins:['Dr Kaina Michaud'] },
  { slug:'urologie', label:'Urologie', icon:'🩺', email:'urologie@cliniquerebecca.ht',
    desc:'Infections urinaires récidivantes, lithiase rénale, hypertrophie prostatique, incontinence urinaire et troubles de la fertilité masculine.',
    medecins:['Dr Pierre Billy Lemaus'] },
  { slug:'anesthesiologie', label:'Anesthésiologie', icon:'💉', email:'anesth@cliniquerebecca.ht',
    desc:'Anesthésie générale et loco-régionale pour toutes interventions chirurgicales, prise en charge de la douleur chronique et soins en réanimation.',
    medecins:['Dr Marie Kerline Pierre'] },
  { slug:'radiologie', label:'Radiologie', icon:'🩻', email:'radio@cliniquerebecca.ht',
    desc:'Radiographies, échographies abdominales et obstétricales, Doppler vasculaire, mammographie et guidage de biopsies radiologiques.',
    medecins:['Dr Jean Luc Mathurin'] },
  { slug:'psychologie', label:'Psychologie', icon:'🧠', email:'psy@cliniquerebecca.ht',
    desc:'Troubles anxieux, dépression, stress post-traumatique, troubles du comportement, addictions, thérapie de couple et soutien psychologique.',
    medecins:['Mr Reginald Volcy'] },
]

const MEDECINS_INFO: Record<string,any> = {
  'Dr Vania Louissaint':      { email:'v.louissaint@cliniquerebecca.ht',  specialite:'Médecine interne',    emoji:'🩺' },
  'Dr Christelle Philippe':   { email:'c.philippe@cliniquerebecca.ht',    specialite:'Médecine interne',    emoji:'🩺' },
  'Dr Eliode Pierre':         { email:'e.pierre@cliniquerebecca.ht',      specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Delvalès Doccy':        { email:'d.doccy@cliniquerebecca.ht',       specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Bob-Hallen Treisma':    { email:'b.treisma@cliniquerebecca.ht',     specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Jean Daniel':           { email:'j.daniel@cliniquerebecca.ht',      specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Enold Lubin':           { email:'e.lubin@cliniquerebecca.ht',       specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Dauphin Roolandro':     { email:'d.roolandro@cliniquerebecca.ht',   specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Mikerline Charles':     { email:'m.charles@cliniquerebecca.ht',     specialite:'Pédiatrie',           emoji:'👶' },
  'Dr Duvivier':              { email:'duvivier@cliniquerebecca.ht',      specialite:'Pédiatrie',           emoji:'👶' },
  'Dr Rose Stephanie Joseph': { email:'r.joseph@cliniquerebecca.ht',      specialite:'Pédiatrie',           emoji:'👶' },
  'Dr Lemoine Lafleur':       { email:'l.lafleur@cliniquerebecca.ht',     specialite:'Neurologie',          emoji:'🧠' },
  'Dr Bernard Pierre':        { email:'b.pierre@cliniquerebecca.ht',      specialite:'Neurochirurgie',      emoji:'🔬' },
  'Dr Peterly PHILIPPE':      { email:'p.philippe@cliniquerebecca.ht',    specialite:'Orthopédie',          emoji:'🦴' },
  'Dr Brunot Simon':          { email:'b.simon@cliniquerebecca.ht',       specialite:'Orthopédie',          emoji:'🦴' },
  'Dr Clifford Edouard':      { email:'c.edouard@cliniquerebecca.ht',     specialite:'Orthopédie',          emoji:'🦴' },
  'Dr Auguste Samy':          { email:'a.samy@cliniquerebecca.ht',        specialite:'Orthopédie',          emoji:'🦴' },
  'Dr Wisly Joseph':          { email:'w.joseph@cliniquerebecca.ht',      specialite:'Chirurgie Générale',  emoji:'⚕️' },
  'Dr Jean Berldine':         { email:'j.berldine@cliniquerebecca.ht',    specialite:'Chirurgie Générale',  emoji:'⚕️' },
  'Dr Jeff Tesnor':           { email:'j.tesnor@cliniquerebecca.ht',      specialite:'Chirurgie Générale',  emoji:'⚕️' },
  'Dr Jenh Robert':           { email:'j.robert@cliniquerebecca.ht',      specialite:'Chir. Pédiatrique',   emoji:'👶' },
  'Dr Sophie Beaujour':       { email:'s.beaujour@cliniquerebecca.ht',    specialite:'Dermatologie',        emoji:'🧬' },
  'Dr Kaina Michaud':         { email:'k.michaud@cliniquerebecca.ht',     specialite:'ORL',                 emoji:'👂' },
  'Dr Pierre Billy Lemaus':   { email:'p.lemaus@cliniquerebecca.ht',      specialite:'Urologie',            emoji:'🩺' },
  'Dr Marie Kerline Pierre':  { email:'mk.pierre@cliniquerebecca.ht',     specialite:'Anesthésiologie',     emoji:'💉' },
  'Dr Wolf Charlie Cajuste':  { email:'wc.cajuste@cliniquerebecca.ht',    specialite:'Dentisterie',         emoji:'🦷' },
  'Mme Fredia Fleurival':     { email:'f.fleurival@cliniquerebecca.ht',   specialite:'Physiothérapie',      emoji:'🏥' },
  'Dr Gilles Abraham':        { email:'g.abraham@cliniquerebecca.ht',     specialite:'Optométrie',          emoji:'👁️' },
  'Mr Reginald Volcy':        { email:'r.volcy@cliniquerebecca.ht',       specialite:'Psychologie',         emoji:'🧠' },
  'Dr Jean Luc Mathurin':     { email:'jl.mathurin@cliniquerebecca.ht',   specialite:'Radiologie',          emoji:'🩻' },
}

// ── Carrousel auto ────────────────────────────────────────────────────────
function Carrousel({ items, couleur, vitesse=3800 }: {items:{titre:string;desc:string}[];couleur:string;vitesse?:number}) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => setIdx(p => (p+1)%items.length), vitesse)
    return () => clearInterval(t)
  }, [items.length, vitesse])
  if (!items.length) return null
  const item = items[idx]
  return (
    <div style={{background:'white',borderRadius:18,padding:28,border:'1px solid #e2e8f0',position:'relative',minHeight:160}}>
      <div style={{position:'absolute',top:0,left:0,width:4,height:'100%',background:couleur,borderRadius:'18px 0 0 18px'}}/>
      <div style={{fontSize:12,color:couleur,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>{idx+1} / {items.length}</div>
      <div style={{fontWeight:800,fontSize:'1.05rem',color:'#0f172a',marginBottom:10}}>{item.titre}</div>
      <div style={{color:'#64748b',fontSize:14,lineHeight:1.7}}>{item.desc}</div>
      <div style={{display:'flex',gap:5,marginTop:16}}>
        {items.map((_,i)=>(
          <button key={i} onClick={()=>setIdx(i)} style={{width:i===idx?24:8,height:8,borderRadius:4,background:i===idx?couleur:'#e2e8f0',border:'none',cursor:'pointer',transition:'all 0.3s',padding:0}}/>
        ))}
      </div>
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────
function Hero({titre,icon,gradient,desc}:any) {
  const router = useRouter()
  return (
    <div style={{background:gradient,padding:'56px 20px 40px'}}>
      <div style={{maxWidth:1000,margin:'0 auto'}}>
        <button onClick={()=>router.back()} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.75)',fontSize:13,display:'inline-flex',alignItems:'center',gap:6,marginBottom:20,padding:0,fontWeight:600}}>
          ← Retour
        </button>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:64,height:64,borderRadius:18,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,flexShrink:0}}>{icon}</div>
          <div>
            <h1 style={{color:'white',fontWeight:900,fontSize:'clamp(1.6rem,4vw,2.4rem)',margin:0}}>{titre}</h1>
            {desc&&<p style={{color:'rgba(255,255,255,0.8)',margin:'8px 0 0',fontSize:14,maxWidth:600}}>{desc}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CTA sidebar ───────────────────────────────────────────────────────────
function SidebarCTA({couleur}:{couleur:string}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{background:`linear-gradient(135deg,${couleur},#0d9488)`,borderRadius:14,padding:20,textAlign:'center'}}>
        <p style={{color:'white',fontWeight:700,margin:'0 0 6px',fontSize:14}}>Prendre rendez-vous</p>
        <p style={{color:'rgba(255,255,255,0.8)',fontSize:12,margin:'0 0 14px'}}>{CLINIQUE_TEL}</p>
        <Link href="/consultation" style={{background:'white',color:couleur,textDecoration:'none',borderRadius:10,padding:'10px 20px',fontWeight:700,fontSize:13,display:'inline-block'}}>
          Réserver
        </Link>
      </div>
      <Link href="/specialites" style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:14,padding:'14px 16px',textDecoration:'none',display:'block',textAlign:'center'}}>
        <div style={{fontSize:20,marginBottom:6}}>👨‍⚕️</div>
        <div style={{fontWeight:700,color:'#0f172a',fontSize:13}}>Tous nos spécialistes</div>
        <div style={{color:'#64748b',fontSize:12,marginTop:4}}>30 médecins disponibles</div>
      </Link>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// CLINIQUE EXTERNE
// ══════════════════════════════════════════════════════════════════════════
function PageCliniqueExterne() {
  const [branche, setBranche] = useState<string|null>(null)
  const [medecinsList, setMedecinsList] = useState<any[]>([])

  useEffect(() => {
    // Fetch doctors from API for live propagation
    fetch('https://clinique-rebecca-api.onrender.com/api/specialistes')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setMedecinsList(data) })
      .catch(() => {}) // fallback to hardcoded BRANCHES_CLINIQUE
  }, [])

  // Merge API doctors with branch data if available
  const getMedecinsForBranche = (branche: typeof BRANCHES_CLINIQUE[0]) => {
    if (!medecinsList.length) return branche.medecins
    const fromAPI = medecinsList
      .filter(m => m.specialite?.toLowerCase().includes(branche.label.toLowerCase().split(' ')[0].toLowerCase()))
      .map(m => m.nom)
    return fromAPI.length > 0 ? fromAPI : branche.medecins
  }
  const b = BRANCHES_CLINIQUE.find(x=>x.slug===branche)
  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      <Navbar variant="public"/>
      <Hero titre="Clinique Externe" icon="🩺" gradient="linear-gradient(135deg,#0f1e3d,#1641C8)"
        desc="15 spécialités médicales — cliquez sur une branche pour voir les médecins et les cas traités"/>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'36px 20px'}}>
        {!branche ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14}}>
            {BRANCHES_CLINIQUE.map(b=>(
              <button key={b.slug} onClick={()=>setBranche(b.slug)} style={{
                background:'white',borderRadius:16,padding:'18px 14px',border:'1px solid #e2e8f0',
                cursor:'pointer',textAlign:'left',display:'flex',alignItems:'flex-start',gap:12,transition:'all 0.2s'
              }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#1641C8';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(22,65,200,0.12)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#e2e8f0';(e.currentTarget as HTMLElement).style.boxShadow='none'}}>
                <span style={{fontSize:26,flexShrink:0}}>{b.icon}</span>
                <div>
                  <div style={{fontWeight:700,color:'#0f172a',fontSize:14}}>{b.label}</div>
                  <div style={{color:'#64748b',fontSize:12,marginTop:2}}>{b.medecins.length} médecin{b.medecins.length>1?'s':''}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            <button onClick={()=>setBranche(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#1641C8',fontWeight:700,fontSize:14,display:'flex',alignItems:'center',gap:6,marginBottom:24,padding:0}}>
              ← Toutes les spécialités
            </button>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:24}}>
              <div>
                <h2 style={{fontWeight:900,fontSize:'1.3rem',color:'#0f172a',marginBottom:8}}>{b?.icon} {b?.label}</h2>
                <p style={{color:'#64748b',fontSize:14,marginBottom:20,lineHeight:1.7}}>{b?.desc}</p>
                <p style={{color:'#94a3b8',fontSize:13,marginBottom:16}}>Contact : <a href={`mailto:${b?.email}`} style={{color:'#1641C8'}}>{b?.email}</a> · {CLINIQUE_TEL}</p>
                {!b||!getMedecinsForBranche(b).length ? (
                  <div style={{background:'white',borderRadius:14,padding:24,border:'1px solid #e2e8f0'}}>
                    <p style={{color:'#64748b'}}>Disponible sur demande — appelez le {CLINIQUE_TEL}</p>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {(b ? getMedecinsForBranche(b) : []).map(nom=>{
                      const info=MEDECINS_INFO[nom]||{}
                      return (
                        <div key={nom} style={{background:'white',borderRadius:14,padding:18,border:'1px solid #e2e8f0',display:'flex',gap:14,alignItems:'center'}}>
                          <div style={{width:50,height:50,borderRadius:14,background:'linear-gradient(135deg,#1641C8,#0d9488)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{info.emoji||'👨‍⚕️'}</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:800,color:'#0f172a',fontSize:14}}>{nom}</div>
                            <div style={{color:'#0d9488',fontWeight:600,fontSize:12,marginTop:2}}>{info.specialite}</div>
                            {info.email&&<a href={`mailto:${info.email}`} style={{color:'#94a3b8',fontSize:11,display:'block',marginTop:3,textDecoration:'none'}}>✉️ {info.email}</a>}
                          </div>
                          <Link href="/consultation" style={{background:'#eff6ff',color:'#1641C8',textDecoration:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,fontSize:12}}>RDV</Link>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <SidebarCTA couleur="#1641C8"/>
            </div>
          </>
        )}
      </div>
      <Footer/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// LABORATOIRE
// ══════════════════════════════════════════════════════════════════════════
function PageLaboratoire() {
  // Fetch real exam list from backend - fallback to static list
  const [examensFromDB, setExamensFromDB] = useState<{titre:string;desc:string}[]>([])
  useEffect(() => {
    fetch('https://clinique-rebecca-api.onrender.com/api/admin/labo/examens')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setExamensFromDB(data.map((e: any) => ({
            titre: e.nom || e.type_examen || e.name || String(e),
            desc: e.description || e.desc || `Analyse disponible au laboratoire de la Clinique de la Rebecca. Prélèvement sans rendez-vous Lun–Sam 07h–17h · Dim 07h–15h.`
          })))
        }
      })
      .catch(() => {}) // use EXAMENS_CARR fallback
  }, [])

  const allExamens = examensFromDB.length > 0 ? examensFromDB : EXAMENS_CARR
  const EXAMENS_CARR = [
    {titre:'Hémogramme Complet (NFS)',desc:'Analyse complète du sang : globules rouges, blancs, plaquettes. Détecte anémie, infections et troubles de la coagulation.'},
    {titre:'Glycémie à jeun',desc:'Mesure du taux de sucre sanguin. Indispensable pour le dépistage et suivi du diabète de type 1 et 2. À faire le matin avant de manger.'},
    {titre:'Sérologie HIV 1 & 2',desc:'Dépistage des anticorps VIH. Résultat confidentiel. Conseil pré et post-test inclus par notre équipe.'},
    {titre:'Hépatite B (AgHBs)',desc:'Détection de l'antigène de surface du virus B. Recommandé avant toute vaccination anti-hépatite B.'},
    {titre:'Hépatite C (Ac anti-VHC)',desc:'Dépistage du virus de l'hépatite C. Essentiel avant chirurgie ou chez personnes à risque.'},
    {titre:'Bilan Rénal (Urée + Créatinine)',desc:'Évalue la fonction rénale. Essentiel pour diabétiques, hypertendus et patients sous néphrotoxiques.'},
    {titre:'HBA1C (Hémoglobine glyquée)',desc:'Reflète la glycémie des 3 derniers mois. Outil clé pour le suivi du diabète.'},
    {titre:'TORCH Complet (5 antigènes)',desc:'Toxoplasmose, Rubéole, CMV, Herpès I & II. Bilan recommandé en début de grossesse.'},
    {titre:'TSH (Thyroïde)',desc:'Dépiste hypo et hyperthyroïdie. Indiqué en cas de fatigue chronique, prise de poids ou troubles du rythme.'},
    {titre:'Bilan Lipidique Complet',desc:'Cholestérol total, HDL, LDL, triglycérides. Évalue le risque cardiovasculaire. À faire à jeun.'},
    {titre:'VDRL / RPR (Syphilis)',desc:'Dépistage de la syphilis. Obligatoire pendant la grossesse et dans tout bilan IST.'},
    {titre:'βHCG Quantitatif',desc:'Test de grossesse sanguin quantitatif. Plus fiable que le test urinaire, détectable très tôt.'},
    {titre:'CRP & Procalcitonine',desc:'Marqueurs inflammatoires et infectieux. Distingue infection bactérienne de virale. Guide l'antibiothérapie.'},
    {titre:'Bilan Hépatique (SGOT/SGPT/GGT)',desc:'Évalue la santé du foie. Indiqué en cas de jaunisse, alcool ou médicaments hépatotoxiques.'},
    {titre:'Widal (Fièvre typhoïde)',desc:'Dépistage de la typhoïde. Très demandé en contexte haïtien.'},
    {titre:'Groupe Sanguin & Rhésus',desc:'Détermination du groupe ABO et du facteur Rhésus. Obligatoire avant transfusion ou grossesse.'},
    {titre:'Ferritine & Transferrine',desc:'Évalue les réserves en fer. Essentiel pour le diagnostic et suivi de l'anémie ferriprive.'},
    {titre:'Ionogramme (Na, K, Cl)',desc:'Mesure des électrolytes. Indispensable en cas de vomissements, diarrhées ou insuffisance rénale.'},
    {titre:'Troponine I & T',desc:'Marqueur cardiaque. Détecte les lésions myocardiques en cas de douleur thoracique suspecte.'},
    {titre:'D-Dimères',desc:'Détecte les caillots sanguins. Indiqué en suspicion d'embolie pulmonaire ou thrombose veineuse.'},
    {titre:'TP / INR (Coagulation)',desc:'Évalue la coagulation sanguine. Essentiel pour patients sous anticoagulants (Warfarine, AVK).'},
    {titre:'Hormones Sexuelles (FSH/LH/E2)',desc:'FSH, LH, Estradiol, Progestérone. Bilan pour infertilité, ménopause et troubles du cycle.'},
    {titre:'Vitamine D (25-OH)',desc:'Mesure le taux de vitamine D. Carence fréquente : fatigue, douleurs osseuses, immunité réduite.'},
    {titre:'Vitamine B12 & Acide Folique',desc:'Déficits responsables d'anémie et troubles neurologiques. Indispensable chez la femme enceinte.'},
    {titre:'PSA Total (Prostate)',desc:'Dépistage du cancer de la prostate. Recommandé chez l'homme de plus de 50 ans.'},
    {titre:'CA 125 (Marqueur ovarien)',desc:'Marqueur tumoral ovarien. Diagnostic et suivi du cancer de l'ovaire.'},
    {titre:'Culture Urine (ECBU)',desc:'Identifie le germe d'une infection urinaire et teste sa sensibilité aux antibiotiques.'},
    {titre:'Frottis Vaginal & Culture',desc:'Recherche de germes pathogènes vaginaux. Indiqué en cas de pertes anormales ou IST suspectée.'},
    {titre:'Goutte Épaisse (Malaria)',desc:'Examen de référence pour le diagnostic du paludisme à Plasmodium falciparum.'},
    {titre:'Antigène Paludisme (TDR rapide)',desc:'Test rapide de dépistage du paludisme. Résultat en 15 minutes sur place.'},
    {titre:'Spermiogramme',desc:'Analyse de la fertilité masculine : mobilité, morphologie et concentration des spermatozoïdes.'},
    {titre:'Amylase & Lipase',desc:'Marqueurs pancréatiques. Indiqués en urgence en cas de douleurs abdominales intenses.'},
    {titre:'Glycémie Post-Prandiale',desc:'Mesure la glycémie 2h après repas. Détecte le diabète et évalue l'équilibre glycémique.'},
    {titre:'Hémoglobine S (Sickling Test)',desc:'Dépistage de la drépanocytose. Prévalence élevée du trait drépanocytaire en Haïti.'},
    {titre:'Bilirubine Totale & Directe',desc:'Évalue la jaunisse. Distingue les causes hépatiques, hémolytiques et obstructives.'},
    {titre:'Albumine & Protéines Totales',desc:'Évalue l'état nutritionnel et la fonction hépatique. Abaissée en malnutrition ou cirrhose.'},
    {titre:'Acide Urique',desc:'Dépistage et suivi de la goutte. Mesuré aussi en insuffisance rénale ou chimiothérapie.'},
    {titre:'Calcium Sérique',desc:'Dépiste hypo et hypercalcémies. Indiqué en crampes, ostéoporose, lithiase rénale ou cancer.'},
    {titre:'Numération Plaquettes',desc:'Compte précis des plaquettes. Indiqué en saignements, purpura ou sous chimiothérapie.'},
    {titre:'Coombs Direct & Indirect',desc:'Détecte les anticorps anti-globules rouges. Indispensable avant transfusion.'},
    {titre:'ACE (Antigène Carcinoembryonnaire)',desc:'Marqueur tumoral digestif. Suivi des cancers colorectaux et gastriques sous traitement.'},
    {titre:'Interleukine 6 (IL-6)',desc:'Marqueur inflammatoire avancé. Suivi des infections sévères et maladies auto-immunes.'},
  ]

  const TOUS_EXAMENS = ['Hémogramme','NFS','Glycémie','Urée','Créatinine','Cholestérol','HDL','LDL','VLDL','Triglycérides','SGOT','SGPT','Gamma GT','Bilirubine','Albumine','TSH','T3','T4','HIV','Hépatite B','Hépatite C','VDRL','RPR','Widal','CRP','RA-Latex','ASO','H.Pylori','PSA','HBA1C','BHCG','Ferritine','Fer sérique','Calcium','Phosphore','Acide urique','Hémoglobine','Réticulocytes','Plaquettes','TS','TC','PT/INR','D-Dimères','Groupe sanguin','Sickling','Électrophorèse','Malaria','Monotest','TORCH','Toxoplasmose','Rubéole','CMV','Herpès','Frottis vaginal','Frottis urétral','Crachats','Culture urine','Culture selles','Culture pus','Goutte pendante','Leucocytes','Nitrite','Albumine urinaire','Glucose urinaire','Interleukine 6','Procalcitonine','Cortisol','DHEA','Testostérone','Progestérone','Estradiol','FSH','LH','Prolactine','Insuline','Peptide C','Microalbuminurie','Créatinine urinaire','Acide valproïque','Digoxine','Phénobarbital','Troponine','BNP','NT-proBNP','Amylase','Lipase','LDH','CPK','Potassium','Sodium','Chlorures','Bicarbonates','Zinc','Cuivre','Vitamine D','Vitamine B12','Acide folique','Rétinol','Fer','Transferrine','TPHA','FTA-ABS','Western Blot','PCR','ELISA','Coombs direct','Coombs indirect','Numération leucocytes','Numération globulaire','Formule sanguine','Hématocrite','MCV','MCH','RDW','Antigène HBs','Anticorps HBs','CD4','CD8','Charge virale','Thyroglobuline','Anti-TPO','T3 libre','T4 libre','Spermiogramme','Bilan coagulation']

  const [search, setSearch] = useState('')
  const [result, setResult] = useState<'dispo'|'non'|null>(null)

  const chercher = () => {
    if (!search.trim()) return
    const ok = TOUS_EXAMENS.some(e=>e.toLowerCase().includes(search.toLowerCase()))
    setResult(ok?'dispo':'non')
  }

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      <Navbar variant="public"/>
      <Hero titre="Laboratoire" icon="🔬" gradient="linear-gradient(135deg,#0f1e3d,#16a34a)"
        desc={`${allExamens.length > 42 ? allExamens.length : 165}+ analyses biologiques disponibles · Lun–Sam 07h–17h · Dim 07h–15h · Prélèvement sans RDV`}/>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'36px 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <div>
            <h2 style={{fontWeight:800,color:'#0f172a',fontSize:'1.1rem',marginBottom:16}}>🔬 Examens disponibles (165+)</h2>
            <Carrousel items={allExamens} couleur="#16a34a" vitesse={3000}/>
            <div style={{marginTop:16,background:'#f0fdf4',borderRadius:12,padding:'12px 16px',fontSize:13}}>
              {['Résultats communiqués par le laboratoire','Lun–Sam 07h–17h · Dim 07h–15h','Prélèvement sur place'].map((i,k)=>(
                <div key={k} style={{color:'#475569',display:'flex',gap:8,marginTop:k?6:0}}><span style={{color:'#16a34a'}}>✓</span>{i}</div>
              ))}
            </div>
          </div>
          <div>
            <h2 style={{fontWeight:800,color:'#0f172a',fontSize:'1.1rem',marginBottom:16}}>🔍 Vérifier la disponibilité</h2>
            <div style={{background:'white',borderRadius:18,padding:24,border:'1px solid #e2e8f0'}}>
              <p style={{color:'#64748b',fontSize:13,marginBottom:14}}>Tapez le nom d'un examen pour vérifier s'il est disponible.</p>
              <div style={{display:'flex',gap:8,marginBottom:14}}>
                <input value={search} onChange={e=>{setSearch(e.target.value);setResult(null)}}
                  onKeyDown={e=>e.key==='Enter'&&chercher()}
                  placeholder="Ex: Glycémie, HIV, TSH..."
                  style={{flex:1,padding:'11px 14px',borderRadius:10,border:'1px solid #d1d5db',fontSize:14,outline:'none'}}/>
                <button onClick={chercher} style={{background:'#16a34a',color:'white',border:'none',borderRadius:10,padding:'11px 18px',fontWeight:700,cursor:'pointer',fontSize:13}}>Vérifier</button>
              </div>
              {result==='dispo'&&<div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'12px 16px',display:'flex',gap:10}}><span style={{fontSize:20}}>✅</span><div><div style={{fontWeight:700,color:'#16a34a'}}>Disponible</div><div style={{fontSize:12,color:'#64748b'}}>Cet examen est disponible dans notre laboratoire.</div></div></div>}
              {result==='non'&&<div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:10,padding:'12px 16px',display:'flex',gap:10}}><span style={{fontSize:20}}>❌</span><div><div style={{fontWeight:700,color:'#dc2626'}}>Non disponible</div><div style={{fontSize:12,color:'#64748b'}}>Appelez le {CLINIQUE_TEL} pour confirmer.</div></div></div>}
            </div>
          </div>
        </div>
        <div style={{marginTop:28,background:'linear-gradient(135deg,#16a34a,#0d9488)',borderRadius:18,padding:24,textAlign:'center'}}>
          <h3 style={{color:'white',fontWeight:800,fontSize:'1.1rem',margin:'0 0 8px'}}>Besoin d'un examen ?</h3>
          <p style={{color:'rgba(255,255,255,0.8)',margin:'0 0 14px',fontSize:13}}>Lun–Sam 07h–17h · Dim 07h–15h · {CLINIQUE_TEL}</p>
          <Link href="/consultation" style={{background:'white',color:'#16a34a',textDecoration:'none',borderRadius:10,padding:'10px 24px',fontWeight:700,display:'inline-block'}}>Prendre rendez-vous</Link>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PHARMACIE
// ══════════════════════════════════════════════════════════════════════════
function PagePharmacie() {
  const [medsFromDB, setMedsFromDB] = useState<typeof MEDICAMENTS>([])
  useEffect(() => {
    fetch('https://clinique-rebecca-api.onrender.com/api/pharmacie/medicaments')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMedsFromDB(data.map((m: any) => ({
            nom: m.nom || m.name || String(m),
            cat: m.categorie || m.cat || 'Médicament',
            dispo: m.disponible !== false,
            inst: m.instructions || m.inst || 'Disponible sur ordonnance. Consultez notre pharmacien.',
          })))
        }
      })
      .catch(() => {})
  }, [])

  const allMeds = medsFromDB.length > 0 ? medsFromDB : MEDICAMENTS
  const MEDICAMENTS = [
    {nom:'Amoxicilline 500mg',cat:'Antibiotique',dispo:true,inst:'Avec nourriture toutes les 8h. Compléter le traitement.'},
    {nom:'Amoxicilline + Ac. Clavulanique',cat:'Antibiotique large spectre',dispo:true,inst:'Avec repas. Toutes les 8-12h. Compléter le traitement prescrit.'},
    {nom:'Azithromycine 500mg',cat:'Antibiotique macrolide',dispo:true,inst:'1 comprimé/jour pendant 3 jours. Ne pas prendre avec antiacides.'},
    {nom:'Ciprofloxacine 500mg',cat:'Antibiotique fluoroquinolone',dispo:true,inst:'2 prises/jour. Éviter les laitages et antiacides dans les 2h.'},
    {nom:'Cotrimoxazole 480mg',cat:'Antibiotique sulfamide',dispo:true,inst:'2 comprimés 2x/jour. Boire beaucoup d'eau. Éviter le soleil.'},
    {nom:'Métronidazole 250mg & 500mg',cat:'Antiprotozoaire',dispo:true,inst:'Avec repas. Éviter l'alcool pendant et 48h après le traitement.'},
    {nom:'Érythromycine 500mg',cat:'Antibiotique macrolide',dispo:true,inst:'4 prises/jour à intervalles réguliers. Peut causer des nausées.'},
    {nom:'Doxycycline 100mg',cat:'Antibiotique tétracycline',dispo:true,inst:'Avec grand verre d'eau en position assise. Éviter le soleil.'},
    {nom:'Nitrofurantoïne 100mg',cat:'Antiseptique urinaire',dispo:true,inst:'Avec repas. Urine peut brunir. Traitement 5-7 jours.'},
    {nom:'Paracétamol 500mg & 1g',cat:'Antalgique',dispo:true,inst:'Max 4g/jour adulte. Intervalle minimum 6h entre les prises.'},
    {nom:'Ibuprofène 400mg & 600mg',cat:'Anti-inflammatoire',dispo:true,inst:'Avec repas. Max 1200-1800mg/jour. Déconseillé en grossesse.'},
    {nom:'Diclofénac 50mg',cat:'Anti-inflammatoire AINS',dispo:true,inst:'Avec nourriture. Ne pas écraser. Déconseillé en IR.'},
    {nom:'Tramadol 50mg',cat:'Antalgique opioïde',dispo:false,inst:'Sur ordonnance stricte. Appelez pour vérifier le stock.'},
    {nom:'Colchicine 1mg',cat:'Anti-goutteux',dispo:true,inst:'En crise: 1cp toutes les 3h jusqu'à soulagement. Max 6/jour.'},
    {nom:'Metformine 500mg & 850mg',cat:'Antidiabétique',dispo:true,inst:'Pendant les repas. Surveiller la glycémie régulièrement.'},
    {nom:'Glibenclamide 5mg',cat:'Antidiabétique sulfamide',dispo:true,inst:'Avant repas. Surveiller hypoglycémie. Éviter l'alcool.'},
    {nom:'Insuline NPH (flacon)',cat:'Insuline intermédiaire',dispo:false,inst:'Sur ordonnance stricte. Réfrigérée. Appelez pour vérifier.'},
    {nom:'Amlodipine 5mg & 10mg',cat:'Antihypertenseur',dispo:true,inst:'1 prise/jour à heure fixe. Ne jamais arrêter brutalement.'},
    {nom:'Losartan 50mg & 100mg',cat:'Antihypertenseur ARA2',dispo:true,inst:'1 prise/jour. Surveiller la tension et la fonction rénale.'},
    {nom:'Captopril 25mg',cat:'Antihypertenseur IEC',dispo:true,inst:'À jeun 1h avant repas. Peut causer toux sèche.'},
    {nom:'Atenolol 50mg',cat:'Bêtabloquant',dispo:true,inst:'Le matin. Ne jamais arrêter brutalement. Surveiller le pouls.'},
    {nom:'Nifédipine 10mg',cat:'Inhibiteur calcique',dispo:true,inst:'Avaler entier. Ne pas croquer. Éviter le jus de pamplemousse.'},
    {nom:'Furosémide 40mg',cat:'Diurétique',dispo:true,inst:'Le matin. Surveiller kaliémie et tension artérielle.'},
    {nom:'Hydrochlorothiazide 25mg',cat:'Diurétique thiazidique',dispo:true,inst:'Le matin avec repas. Peut abaisser le potassium.'},
    {nom:'Spironolactone 25mg',cat:'Diurétique antialdostérone',dispo:true,inst:'Avec repas. Surveiller kaliémie. Traitement cardiaques/HTA.'},
    {nom:'Atorvastatine 10mg & 20mg',cat:'Hypolipémiant',dispo:true,inst:'Le soir de préférence. Surveiller douleurs musculaires.'},
    {nom:'Allopurinol 100mg & 300mg',cat:'Hypo-uricémiant (goutte)',dispo:true,inst:'Après repas. Début entre crises. Boire beaucoup d'eau.'},
    {nom:'Oméprazole 20mg & 40mg',cat:'Antiulcéreux IPP',dispo:true,inst:'30 min avant le repas. Protège l'estomac.'},
    {nom:'Ranitidine 150mg',cat:'Antiulcéreux anti-H2',dispo:true,inst:'2x/jour ou 1x la nuit. Peut être pris sans tenir compte des repas.'},
    {nom:'Métoclopramide 10mg',cat:'Antiémétique',dispo:true,inst:'30 min avant repas. Max 3/jour. Traitement court.'},
    {nom:'Domperidone 10mg',cat:'Antiémétique prokinétique',dispo:true,inst:'Avant repas et au coucher. Éviter chez cardiaques.'},
    {nom:'Artéméther + Luméfantrine',cat:'Antipaludéen',dispo:true,inst:'Avec repas gras. Compléter les 6 doses sur 3 jours. Ordonnance.'},
    {nom:'Chloroquine 250mg',cat:'Antipaludéen',dispo:true,inst:'Avec repas. Contrôle ophtalmologique si traitement long.'},
    {nom:'Mébendazole 100mg',cat:'Antiparasitaire',dispo:true,inst:'1cp 2x/jour pendant 3 jours. Traiter toute la famille.'},
    {nom:'Albendazole 400mg',cat:'Antiparasitaire large spectre',dispo:true,inst:'Dose unique avec nourriture grasse pour meilleure absorption.'},
    {nom:'Lévothyroxine 50-100µg',cat:'Hormones thyroïdiennes',dispo:true,inst:'À jeun 30 min avant le petit-déjeuner. Prise régulière essentielle.'},
    {nom:'TSH suivi + Bilan thyroïde',cat:'Bilan thyroïdien',dispo:true,inst:'Sur ordonnance. Test disponible au laboratoire attenant.'},
    {nom:'Prednisolone 5mg & 20mg',cat:'Corticoïde oral',dispo:true,inst:'Le matin après petit-déjeuner. Jamais arrêter brutalement.'},
    {nom:'Béclométasone spray nasal',cat:'Corticoïde nasal',dispo:true,inst:'1-2 pulvérisations/narine 1x/jour. Traitement au long cours OK.'},
    {nom:'Salbutamol inhalateur',cat:'Bronchodilatateur',dispo:true,inst:'Agiter avant. En crise d'asthme. Max 4 inhalations/jour.'},
    {nom:'Fluconazole 150mg',cat:'Antifongique systémique',dispo:true,inst:'Dose unique pour candidose vaginale. Sur ordonnance.'},
    {nom:'Clotrimazole crème 1%',cat:'Antifongique local',dispo:true,inst:'Application 2x/jour pendant 2-4 semaines. Éviter les yeux.'},
    {nom:'Nystatine suspension',cat:'Antifongique oral',dispo:true,inst:'Garder en bouche avant avaler. 4x/jour après repas. 7-14 jours.'},
    {nom:'Aciclovir 200mg & 400mg',cat:'Antiviral herpès',dispo:true,inst:'5 prises/jour en curatif. Commencer dès les premiers symptômes.'},
    {nom:'Amitriptyline 25mg',cat:'Antidépresseur tricyclique',dispo:true,inst:'Le soir. Effets secondaires en début de traitement normaux.'},
    {nom:'Fluoxétine 20mg',cat:'Antidépresseur ISRS',dispo:true,inst:'Le matin avec repas. Effets dès 2-4 semaines. Ne pas arrêter brutalement.'},
    {nom:'Carbamazépine 200mg',cat:'Antiépileptique',dispo:true,inst:'Prise régulière indispensable. Surveiller numération sanguine.'},
    {nom:'Cétirizine 10mg',cat:'Antihistaminique',dispo:true,inst:'1 comprimé/jour. Peu sédatif. Matin ou soir.'},
    {nom:'Loratadine 10mg',cat:'Antihistaminique non sédatif',dispo:true,inst:'1 comprimé/jour. Non sédatif. Idéal pour personnes actives.'},
    {nom:'Fer + Acide folique',cat:'Supplément grossesse',dispo:true,inst:'À jeun pour meilleure absorption. Recommandé pendant la grossesse.'},
    {nom:'Zinc + Vitamine C effervescent',cat:'Complément immunitaire',dispo:true,inst:'1 comprimé/jour dans eau. Renforce les défenses immunitaires.'},
    {nom:'Vitamine D3 1000 UI',cat:'Supplément vitaminique',dispo:true,inst:'1 comprimé/jour avec repas gras. Traitement de la carence en D3.'},
    {nom:'Magnésium 300mg',cat:'Complément minéral',dispo:true,inst:'1-2 comprimés/jour. Réduit crampes, anxiété et fatigue musculaire.'},
    {nom:'SRO (Sels de Réhydratation)',cat:'Réhydratation orale',dispo:true,inst:'1 sachet dans 1 litre d'eau potable. À boire par petites gorgées.'},
    {nom:'Amoxicilline Sirop Péd.',cat:'Antibiotique enfant',dispo:true,inst:'Selon poids. Compléter le traitement. Conserver au réfrigérateur.'},
    {nom:'Ibuprofène Sirop Péd.',cat:'Anti-inflammatoire enfant',dispo:true,inst:'Selon poids. Max 4 doses/jour. Avec repas.'},
    {nom:'Zinc Sirop Péd.',cat:'Supplément zinc enfant',dispo:true,inst:'Pendant/après repas. Réduit durée et sévérité des diarrhées.'},
    {nom:'Gentamicine collyre',cat:'Antibiotique oculaire',dispo:true,inst:'1-2 gouttes toutes les 4h dans l'œil atteint. Pencher la tête.'},
    {nom:'Métronidazole gel vaginal',cat:'Antiprotozoaire local',dispo:true,inst:'1 applicateur/jour pendant 5 jours. Le soir au coucher.'},
  ]

  const [idx, setIdx] = useState(0)
  const [search, setSearch] = useState('')
  const [resultSearch, setResultSearch] = useState<'dispo'|'non'|null>(null)

  useEffect(() => {
    const t = setInterval(()=>setIdx(p=>(p+1)%allMeds.length), 2500)
    return ()=>clearInterval(t)
  }, [allMeds.length])

  const med = allMeds[idx] || allMeds[0] || MEDICAMENTS[0]

  const chercher = () => {
    if (!search.trim()) return
    const ok = allMeds.some(m=>m.nom.toLowerCase().includes(search.toLowerCase())||m.cat.toLowerCase().includes(search.toLowerCase()))
    setResultSearch(ok?'dispo':'non')
    const found = allMeds.findIndex(m=>m.nom.toLowerCase().includes(search.toLowerCase()))
    if (found >= 0) setIdx(found)
  }

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      <Navbar variant="public"/>
      <Hero titre="Pharmacie" icon="💊" gradient="linear-gradient(135deg,#0f1e3d,#7c3aed)"
        desc="Médicaments génériques et de marque · Lun–Sam 07h–17h · Dim 07h–15h"/>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'36px 20px'}}>
        <div style={{background:'#7c3aed',borderRadius:14,padding:'14px 20px',marginBottom:24,display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:22}}>📞</span>
          <div style={{color:'white'}}><div style={{fontWeight:700}}>Commander par téléphone</div><div style={{fontSize:13,opacity:0.85}}>{CLINIQUE_TEL} · Lun–Sam 07h–17h · Dim 07h–15h</div></div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          {/* Carrousel */}
          <div>
            <h2 style={{fontWeight:800,color:'#0f172a',fontSize:'1.1rem',marginBottom:16}}>💊 Médicaments disponibles</h2>
            <div style={{background:'white',borderRadius:20,padding:28,border:`2px solid ${med.dispo?'#7c3aed':'#dc2626'}`,position:'relative'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <div style={{fontWeight:900,fontSize:'1.2rem',color:'#0f172a',marginBottom:4}}>{med.nom}</div>
                  <span style={{background:'#f5f3ff',color:'#7c3aed',borderRadius:50,padding:'3px 12px',fontSize:12,fontWeight:600}}>{med.cat}</span>
                </div>
                <span style={{background:med.dispo?'#f0fdf4':'#fef2f2',color:med.dispo?'#16a34a':'#dc2626',borderRadius:50,padding:'5px 14px',fontSize:13,fontWeight:700,flexShrink:0}}>
                  {med.dispo?'✓ Disponible':'✗ Indisponible'}
                </span>
              </div>
              <p style={{color:'#475569',fontSize:13,lineHeight:1.7,margin:'0 0 10px'}}>{med.inst}</p>
              {med.dispo&&<div style={{fontSize:11,color:'#94a3b8'}}>📅 Exp: {med.exp}</div>}
              <div style={{display:'flex',gap:5,marginTop:16}}>
                {allMeds.map((_,i)=>(
                  <button key={i} onClick={()=>setIdx(i)} style={{width:i===idx?24:6,height:6,borderRadius:3,background:i===idx?'#7c3aed':'#e2e8f0',border:'none',cursor:'pointer',transition:'all 0.3s',padding:0}}/>
                ))}
              </div>
              <div style={{fontSize:11,color:'#94a3b8',textAlign:'right',marginTop:6}}>{idx+1} / {allMeds.length}</div>
            </div>
          </div>

          {/* Recherche */}
          <div>
            <h2 style={{fontWeight:800,color:'#0f172a',fontSize:'1.1rem',marginBottom:16}}>🔍 Vérifier la disponibilité</h2>
            <div style={{background:'white',borderRadius:18,padding:24,border:'1px solid #e2e8f0'}}>
              <p style={{color:'#64748b',fontSize:13,marginBottom:14}}>Cherchez un médicament ou une catégorie.</p>
              <div style={{display:'flex',gap:8,marginBottom:14}}>
                <input value={search} onChange={e=>{setSearch(e.target.value);setResultSearch(null)}}
                  onKeyDown={e=>e.key==='Enter'&&chercher()}
                  placeholder="Ex: Amoxicilline, antibiotique..."
                  style={{flex:1,padding:'11px 14px',borderRadius:10,border:'1px solid #d1d5db',fontSize:14,outline:'none'}}/>
                <button onClick={chercher} style={{background:'#7c3aed',color:'white',border:'none',borderRadius:10,padding:'11px 18px',fontWeight:700,cursor:'pointer',fontSize:13}}>Chercher</button>
              </div>
              {resultSearch==='dispo'&&<div style={{background:'#f5f3ff',border:'1px solid #ddd6fe',borderRadius:10,padding:'12px 16px',display:'flex',gap:10}}><span style={{fontSize:20}}>✅</span><div><div style={{fontWeight:700,color:'#7c3aed'}}>Disponible</div><div style={{fontSize:12,color:'#64748b'}}>Consultez le carrousel pour les détails et instructions.</div></div></div>}
              {resultSearch==='non'&&<div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:10,padding:'12px 16px',display:'flex',gap:10}}><span style={{fontSize:20}}>❌</span><div><div style={{fontWeight:700,color:'#dc2626'}}>Non trouvé</div><div style={{fontSize:12,color:'#64748b'}}>Appelez le {CLINIQUE_TEL} — nous commandons pour vous.</div></div></div>}
              <div style={{marginTop:16,padding:'12px 14px',background:'#f5f3ff',borderRadius:10}}>
                {['Médicaments sur et sans ordonnance','Conseils pharmaceutiques gratuits','Commande par téléphone possible'].map((i,k)=>(
                  <div key={k} style={{fontSize:13,color:'#475569',display:'flex',gap:8,marginTop:k?6:0}}><span style={{color:'#7c3aed'}}>✓</span>{i}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGES SERVICES avec contenu statique riche
// ══════════════════════════════════════════════════════════════════════════
const SERVICES_CONTENT: Record<string,{
  titre:string;icon:string;couleur:string;gradient:string;
  desc:string;items:{titre:string;desc:string}[];
  medecin?:{nom:string;email:string;specialite:string;emoji:string};
  infos:string[];
}> = {
  dentisterie:{
    titre:'Dentisterie',icon:'🦷',couleur:'#0d9488',gradient:'linear-gradient(135deg,#0f1e3d,#0d9488)',
    desc:'Soins dentaires complets dans un cabinet moderne équipé aux standards internationaux.',
    medecin:{nom:'Dr Wolf Charlie Cajuste',email:'wc.cajuste@cliniquerebecca.ht',specialite:'Chirurgien-Dentiste',emoji:'🦷'},
    items:[
      {titre:'Consultation & Diagnostic',desc:'Examen complet de la bouche, radiographies dentaires et bilan bucco-dentaire. Recommandé tous les 6 mois.'},
      {titre:'Détartrage & Prophylaxie',desc:'Nettoyage professionnel pour éliminer le tartre et prévenir les caries et maladies des gencives.'},
      {titre:'Extraction simple',desc:'Extraction d\'une dent abîmée, décalée ou infectée sous anesthésie locale. Procédure rapide et sans douleur.'},
      {titre:'Extraction complexe / Dent de sagesse',desc:'Extraction chirurgicale pour dents incluses ou impactées, sous anesthésie locale ou générale.'},
      {titre:'Obturation (Plombage)',desc:'Traitement des caries par amalgame ou résine composite. Restaure la fonction et l\'esthétique de la dent.'},
      {titre:'Dévitalisation (Endodontie)',desc:'Traitement de canal pour sauver une dent infectée en profondeur. Élimine la douleur et préserve la dent.'},
      {titre:'Couronne dentaire',desc:'Prothèse fixe qui recouvre une dent abîmée, fracturée ou dévitalisée. En porcelaine ou zirconium.'},
      {titre:'Orthodontie & Appareils',desc:'Correction des malocclusions et alignement des dents par bagues ou gouttières transparentes.'},
      {titre:'Blanchiment dentaire',desc:'Éclaircissement professionnel des dents en une séance. Résultats visibles immédiatement.'},
      {titre:'Prothèse dentaire',desc:'Dentier partiel ou complet pour remplacer les dents manquantes et restaurer la mastication et le sourire.'},
    ],
    infos:['Lun–Sam 07h–17h · Dim 07h–15h',Anesthésie locale disponible','Radiographies sur place','Urgences dentaires acceptées'],
  },
  physiotherapie:{
    titre:'Physiothérapie',icon:'🏥',couleur:'#d97706',gradient:'linear-gradient(135deg,#0f1e3d,#d97706)',
    desc:'Rééducation fonctionnelle et traitement des douleurs dans notre salle équipée d\'appareils modernes.',
    medecin:{nom:'Mme Fredia Fleurival',email:'f.fleurival@cliniquerebecca.ht',specialite:'Physiothérapeute',emoji:'🏥'},
    items:[
      {titre:'Bilan Initial & Évaluation',desc:'Évaluation complète de vos capacités fonctionnelles, douleurs et limitations pour établir un programme personnalisé.'},
      {titre:'Rééducation Post-Opératoire',desc:'Récupération après chirurgie orthopédique, prothèse de hanche ou genou, opération du rachis ou chirurgie cardiaque.'},
      {titre:'Électrostimulation (TENS)',desc:'Courant électrique de basse fréquence pour soulager les douleurs chroniques et aiguës sans médicaments.'},
      {titre:'Ultrason Thérapeutique',desc:'Ondes ultrasonores pour traiter tendinites, bursites, cicatrices et inflammations articulaires en profondeur.'},
      {titre:'Massage Thérapeutique',desc:'Techniques de massage pour libérer les contractures musculaires, améliorer la circulation et réduire les tensions.'},
      {titre:'Thermothérapie & Cryothérapie',desc:'Chaleur pour les contractures chroniques, glace pour les inflammations aiguës et entorses récentes.'},
      {titre:'Mobilisation Articulaire',desc:'Techniques manuelles pour restaurer la mobilité des articulations raides ou bloquées (épaule, genou, colonne).'},
      {titre:'Traction Lombaire & Cervicale',desc:'Décompression vertébrale par traction douce pour hernies discales et radiculalgies (sciatique, névralgie cervicale).'},
      {titre:'Exercices de Rééducation',desc:'Programme d\'exercices progressifs adaptés pour renforcer les muscles, améliorer l\'équilibre et l\'endurance.'},
      {titre:'Rééducation Neurologique',desc:'Pour patients ayant subi un AVC, traumatisme crânien ou atteinte du système nerveux — récupération motrice et fonctionnelle.'},
    ],
    infos:['Salle équipée appareils modernes','Programme sur mesure','Rééducation enfants et adultes','Suivi post-chirurgical'],
  },
  optometrie:{
    titre:'Optométrie',icon:'👁️',couleur:'#dc2626',gradient:'linear-gradient(135deg,#0f1e3d,#dc2626)',
    desc:'Examen complet de la vue et prescription de lunettes ou lentilles adaptées à vos besoins.',
    medecin:{nom:'Dr Gilles Abraham',email:'g.abraham@cliniquerebecca.ht',specialite:'Optométriste',emoji:'👁️'},
    items:[
      {titre:'Examen de la Vue Complet',desc:'Bilan visuel complet incluant acuité visuelle, réfraction, tension oculaire et fond d\'œil. Durée 30-45 min.'},
      {titre:'Réfraction & Prescription',desc:'Détermination précise de votre correction visuelle (myopie, hypermétropie, astigmatisme, presbytie).'},
      {titre:'Prescription Lunettes',desc:'Ordonnance de lunettes adaptée à vos activités : lecture, conduite, écran d\'ordinateur, sport.'},
      {titre:'Verre Progressif',desc:'Verres multifocaux pour corriger simultanément vision de loin et de près, idéaux après 45 ans.'},
      {titre:'Adaptation Lentilles de Contact',desc:'Essai et adaptation de lentilles souples ou rigides, journalières ou mensuelles, selon votre mode de vie.'},
      {titre:'Bilan Vision Enfant',desc:'Dépistage précoce des troubles visuels chez l\'enfant. Recommandé dès 3 ans et avant l\'entrée scolaire.'},
      {titre:'Dépistage Glaucome',desc:'Mesure de la tension oculaire et examen du champ visuel pour détecter un glaucome débutant avant tout symptôme.'},
      {titre:'Fond d\'Œil',desc:'Examen de la rétine pour détecter diabète oculaire, hypertension, DMLA et autres pathologies rétiniennes.'},
    ],
    infos:['Équipements de précision','Lunettes disponibles sur place','Lentilles en stock','Enfants dès 3 ans'],
  },
  maternite:{
    titre:'Maternité',icon:'🍼',couleur:'#ec4899',gradient:'linear-gradient(135deg,#0f1e3d,#ec4899)',
    desc:'Accompagnement complet de votre grossesse, de la conception à la naissance et au suivi postnatal.',
    items:[
      {titre:'Consultation Prénatale 1er Trimestre',desc:'Bilan complet de début de grossesse : échographie, prise de sang, bilan infectieux (TORCH, HIV, hépatites), groupe sanguin.'},
      {titre:'Échographie Obstétricale',desc:'Suivi échographique de la croissance du bébé, du placenta et du liquide amniotique à chaque trimestre.'},
      {titre:'Suivi 2e & 3e Trimestre',desc:'Consultations régulières pour surveiller la tension, le poids, la position du bébé et prévenir les complications.'},
      {titre:'Préparation à l\'Accouchement',desc:'Séances de préparation : respiration, positions d\'accouchement, allaitement et soins du nouveau-né.'},
      {titre:'Accouchement Voie Basse',desc:'Accouchement naturel accompagné par notre équipe médicale. Péridurale disponible. Surveillance continue mère et bébé.'},
      {titre:'Césarienne Programmée',desc:'Intervention chirurgicale planifiée pour causes médicales : présentation par le siège, placenta praevia, cicatrice utérine.'},
      {titre:'Césarienne en Urgence',desc:'Intervention rapide en cas de souffrance fœtale, dystocie ou complications inattendues lors du travail.'},
      {titre:'Soins Néonataux',desc:'Soins immédiats du nouveau-né : pesée, mesures, APGAR, vaccination, dépistage néonatal et surveillance thermique.'},
      {titre:'Consultation Post-Natale',desc:'Visite à 6 semaines pour évaluer la récupération maternelle, l\'allaitement et le développement du nourrisson.'},
      {titre:'Planification Familiale',desc:'Conseil et prescription contraceptive adaptée après l\'accouchement : pilule, implant, stérilet ou progestérone injectable.'},
    ],
    infos:['Suivi prénatal complet','Salle d\'accouchement équipée','Soins néonataux immédiats','Accompagnant accepté'],
  },
  'salle-sop':{
    titre:'Salle Opératoire (SOP)',icon:'⚕️',couleur:'#475569',gradient:'linear-gradient(135deg,#0f1e3d,#374151)',
    desc:'Bloc opératoire moderne équipé pour chirurgies générales, orthopédiques, gynécologiques et neurochirurgicales.',
    items:[
      {titre:'Chirurgie Laparoscopique',desc:'Chirurgie mini-invasive par petites incisions. Moins douloureux, récupération rapide : vésicule, appendice, hernies.'},
      {titre:'Appendicectomie',desc:'Ablation de l\'appendice en urgence ou programmée. Intervention standard en 30-60 min, hospitalisation 24-48h.'},
      {titre:'Herniorraphie',desc:'Réparation des hernies inguinales, ombilicales ou de la paroi abdominale. Avec ou sans filet prothétique.'},
      {titre:'Cholécystectomie',desc:'Ablation de la vésicule biliaire pour calculs ou cholécystite chronique. Faisable en laparoscopie.'},
      {titre:'Arthroscopie',desc:'Chirurgie mini-invasive des articulations (genou, épaule, cheville) pour ménisques, ligaments et cartilages.'},
      {titre:'Arthroplastie',desc:'Pose de prothèse de hanche ou de genou pour arthrose sévère invalidante. Rééducation post-opératoire incluse.'},
      {titre:'Réduction de Fracture & Ostéosynthèse',desc:'Traitement chirurgical des fractures complexes avec plaques, vis ou clou centromédullaire.'},
      {titre:'Césarienne',desc:'Accouchement par voie chirurgicale en urgence ou programmé. Sous anesthésie rachidienne, durée 45-60 min.'},
      {titre:'Myomectomie',desc:'Ablation des fibromes utérins en préservant l\'utérus. Indiquée chez la femme souhaitant une grossesse future.'},
      {titre:'Biopsie Chirurgicale',desc:'Prélèvement de tissu pour analyse anatomopathologique. Essentiel pour diagnostic des tumeurs et masses suspectes.'},
    ],
    infos:['Bloc opératoire aux normes','Anesthésie générale et locorégionale','Chirurgies programmées et urgences','Surveillance post-opératoire'],
  },
  'gestes-medicaux':{
    titre:'Gestes Médicaux',icon:'💉',couleur:'#f59e0b',gradient:'linear-gradient(135deg,#0f1e3d,#d97706)',
    desc:'Actes médicaux courants réalisés par notre équipe infirmière et médicale, sans rendez-vous requis.',
    items:[
      {titre:'Injection Intramusculaire',desc:'Administration de médicaments (antibiotiques, vitamines, vaccins) par voie IM dans le muscle deltoïde ou fessier.'},
      {titre:'Perfusion Intraveineuse',desc:'Traitement par voie veineuse pour hydratation, antibiotiques IV, antalgiques ou solutés nutritifs.'},
      {titre:'Pose de Cathéter Veineux',desc:'Voie d\'accès veineuse périphérique pour traitements prolongés. Pose aseptique et surveillance rigoureuse.'},
      {titre:'Prise de Sang',desc:'Prélèvement veineux pour analyses biologiques. Réalisé le matin à jeun. Résultats disponibles sous 24-48h.'},
      {titre:'ECG 12 Dérivations',desc:'Électrocardiogramme pour surveiller le rythme cardiaque, détecter troubles du rythme et infarctus. Résultat immédiat.'},
      {titre:'Suture de Plaie',desc:'Fermeture chirurgicale des plaies cutanées par points ou agrafes. Sous anesthésie locale, asepsie stricte.'},
      {titre:'Pansement & Soins de Plaie',desc:'Nettoyage, désinfection et pansement des plaies chroniques, escarres, brûlures et plaies post-opératoires.'},
      {titre:'Pose Sonde Urinaire',desc:'Cathéterisme vésical pour rétention urinaire ou surveillance du débit urinaire en contexte médical.'},
      {titre:'Surveillance & Monitoring',desc:'Mesure régulière des signes vitaux : tension artérielle, fréquence cardiaque, température, SpO2 et glycémie.'},
      {titre:'Test de Grossesse & TDR',desc:'Tests rapides de grossesse, paludisme, HIV, hépatites. Résultat en 15 minutes sur place.'},
    ],
    infos:['Sans rendez-vous la plupart du temps','Infirmiers diplômés','Matériel stérile à usage unique','Disponible Lun–Sam'],
  },
  hospitalisation:{
    titre:'Hospitalisation & Observation',icon:'🏥',couleur:'#0369a1',gradient:'linear-gradient(135deg,#0f1e3d,#0369a1)',
    desc:'Chambres individuelles équipées pour hospitalisation courte et longue durée avec suivi médical continu 24h/24.',
    items:[
      {titre:'Admission & Bilan Initial',desc:'Accueil par l\'équipe médicale, évaluation complète, ouverture du dossier et mise en place du plan de soins.'},
      {titre:'Chambre Individuelle',desc:'Chambre privée équipée avec lit médicalisé, climatisation, TV, salle de bain individuelle et appel infirmier.'},
      {titre:'Observation Courte Durée',desc:'Surveillance intensive de 6 à 24h pour douleurs thoraciques, convulsions, malaises ou après gestes invasifs.'},
      {titre:'Soins Infirmiers Continus',desc:'Équipe infirmière présente 24h/24 pour administrer les traitements, surveiller les constantes et assurer les soins.'},
      {titre:'Surveillance Médicale 24h',desc:'Visites médicales pluriquotidiennes, garde médicale la nuit, adaptation du traitement selon l\'évolution clinique.'},
      {titre:'Nutrition Clinique',desc:'Alimentation adaptée à la pathologie (diabète, insuffisance rénale, post-opératoire) ou nutrition entérale/parentérale.'},
      {titre:'Kinésithérapie en Chambre',desc:'Séances de physiothérapie au lit pour prévenir les complications de décubitus et préparer la mobilisation précoce.'},
      {titre:'Soins Post-Opératoires',desc:'Surveillance post-anesthésique, gestion de la douleur, soins de cicatrice et prévention des infections nosocomiales.'},
      {titre:'Préparation à la Sortie',desc:'Planification du retour à domicile, ordonnances, arrêt de travail, rendez-vous de suivi et recommandations.'},
      {titre:'Suivi Post-Hospitalisation',desc:'Consultation de contrôle dans les 7-14 jours suivant la sortie pour s\'assurer de la bonne récupération.'},
    ],
    infos:['Chambres individuelles climatisées','Garde médicale 24h/24','Visites familles autorisées','Accompagnant possible'],
  },
}

function PageService({slug}:{slug:string}) {
  const cfg = SERVICES_CONTENT[slug]
  if (!cfg) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <p style={{color:'#64748b',fontSize:'1.1rem'}}>Service introuvable</p>
        <Link href="/services" style={{color:'#1641C8',fontWeight:700}}>← Retour aux services</Link>
      </div>
    </div>
  )
  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      <Navbar variant="public"/>
      <Hero titre={cfg.titre} icon={cfg.icon} gradient={cfg.gradient} desc={cfg.desc}/>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'36px 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:24}}>
          <div>
            <h2 style={{fontWeight:800,color:'#0f172a',fontSize:'1.1rem',marginBottom:16}}>{cfg.icon} Services & interventions</h2>
            <Carrousel items={cfg.items} couleur={cfg.couleur} vitesse={4000}/>
            <div style={{marginTop:16,background:'#f8fafc',borderRadius:12,padding:'12px 16px',border:'1px solid #e2e8f0'}}>
              {cfg.infos.map((info,k)=>(
                <div key={k} style={{fontSize:13,color:'#475569',display:'flex',gap:8,marginTop:k?6:0}}><span style={{color:cfg.couleur}}>✓</span>{info}</div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {cfg.medecin&&(
              <div style={{background:'white',borderRadius:16,padding:18,border:'1px solid #e2e8f0'}}>
                <h3 style={{fontWeight:700,fontSize:14,color:'#0f172a',marginBottom:12}}>Notre spécialiste</h3>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:44,height:44,borderRadius:12,background:`${cfg.couleur}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{cfg.medecin.emoji}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13}}>{cfg.medecin.nom}</div>
                    <div style={{color:cfg.couleur,fontSize:12,fontWeight:600}}>{cfg.medecin.specialite}</div>
                    <a href={`mailto:${cfg.medecin.email}`} style={{color:'#94a3b8',fontSize:11,display:'block',marginTop:3,textDecoration:'none'}}>✉️ {cfg.medecin.email}</a>
                    <div style={{color:'#94a3b8',fontSize:11,marginTop:2}}>📞 {CLINIQUE_TEL}</div>
                  </div>
                </div>
              </div>
            )}
            <SidebarCTA couleur={cfg.couleur}/>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// ROUTER
// ══════════════════════════════════════════════════════════════════════════
export default function ServiceDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  if (slug==='clinique-externe') return <PageCliniqueExterne/>
  if (slug==='laboratoire')      return <PageLaboratoire/>
  if (slug==='pharmacie')        return <PagePharmacie/>
  return <PageService slug={slug}/>
}
