'use client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const CLINIQUE_TEL = '(509) 4858-5757'
const CLINIQUE_EMAIL = 'contact@cliniquerebecca.ht'

// ── Branches clinique externe ─────────────────────────────────────────────
const BRANCHES_CLINIQUE = [
  { slug:'medecin-interne',     label:'Médecine Interne',         icon:'🩺', email:'medecine@cliniquerebecca.ht',    medecins:['Dr Vania Louissaint','Dr Christelle Philippe'] },
  { slug:'gynecologie',          label:'Gynécologie',              icon:'👩‍⚕️', email:'gyneco@cliniquerebecca.ht',       medecins:['Dr Eliode Pierre','Dr Delvalès Doccy','Dr Bob-Hallen Treisma','Dr Jean Daniel','Dr Enold Lubin','Dr Dauphin Roolandro'] },
  { slug:'pediatrie',            label:'Pédiatrie',                icon:'👶', email:'pediatrie@cliniquerebecca.ht',    medecins:['Dr Mikerline Charles','Dr Duvivier','Dr Rose Stephanie Joseph'] },
  { slug:'neurologie',           label:'Neurologie',               icon:'🧠', email:'neurologie@cliniquerebecca.ht',   medecins:['Dr Lemoine Lafleur'] },
  { slug:'neurochirurgie',       label:'Neurochirurgie',           icon:'🧠', email:'neurochir@cliniquerebecca.ht',    medecins:['Dr Bernard Pierre'] },
  { slug:'orthopedie',           label:'Orthopédie',               icon:'🦴', email:'ortho@cliniquerebecca.ht',        medecins:['Dr Peterly PHILIPPE','Dr Brunot Simon','Dr Clifford Edouard','Dr Auguste Samy'] },
  { slug:'chirurgie-generale',   label:'Chirurgie Générale',       icon:'🔬', email:'chirurgie@cliniquerebecca.ht',    medecins:['Dr Wisly Joseph','Dr Jean Berldine','Dr Jeff Tesnor'] },
  { slug:'chirurgie-pediatrique',label:'Chirurgie Pédiatrique',    icon:'👶', email:'chirpediatrie@cliniquerebecca.ht',medecins:['Dr Jenh Robert'] },
  { slug:'dermatologie',         label:'Dermatologie',             icon:'🧬', email:'dermato@cliniquerebecca.ht',      medecins:['Dr Sophie Beaujour'] },
  { slug:'orl',                  label:'ORL',                      icon:'👂', email:'orl@cliniquerebecca.ht',          medecins:['Dr Kaina Michaud'] },
  { slug:'urologie',             label:'Urologie',                 icon:'🩺', email:'urologie@cliniquerebecca.ht',     medecins:['Dr Pierre Billy Lemaus'] },
  { slug:'anesthesiologie',      label:'Anesthésiologie',          icon:'💉', email:'anesth@cliniquerebecca.ht',       medecins:['Dr Marie Kerline Pierre'] },
  { slug:'radiologie',           label:'Radiologie',               icon:'🩻', email:'radio@cliniquerebecca.ht',        medecins:['Dr Jean Luc Mathurin'] },
  { slug:'psychologie',          label:'Psychologie',              icon:'🧬', email:'psy@cliniquerebecca.ht',          medecins:['Mr Reginald Volcy'] },
]

const MEDECINS_INFO: Record<string,any> = {
  'Dr Vania Louissaint':      { email:'v.louissaint@cliniquerebecca.ht',    specialite:'Médecine interne',    emoji:'🩺' },
  'Dr Christelle Philippe':   { email:'c.philippe@cliniquerebecca.ht',      specialite:'Médecine interne',    emoji:'🩺' },
  'Dr Eliode Pierre':         { email:'e.pierre@cliniquerebecca.ht',        specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Delvalès Doccy':        { email:'d.doccy@cliniquerebecca.ht',         specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Bob-Hallen Treisma':    { email:'b.treisma@cliniquerebecca.ht',       specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Jean Daniel':           { email:'j.daniel@cliniquerebecca.ht',        specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Enold Lubin':           { email:'e.lubin@cliniquerebecca.ht',         specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Dauphin Roolandro':     { email:'d.roolandro@cliniquerebecca.ht',     specialite:'Gynécologie',         emoji:'👩‍⚕️' },
  'Dr Mikerline Charles':     { email:'m.charles@cliniquerebecca.ht',       specialite:'Pédiatrie',           emoji:'👶' },
  'Dr Duvivier':              { email:'duvivier@cliniquerebecca.ht',        specialite:'Pédiatrie',           emoji:'👶' },
  'Dr Rose Stephanie Joseph': { email:'r.joseph@cliniquerebecca.ht',        specialite:'Pédiatrie',           emoji:'👶' },
  'Dr Lemoine Lafleur':       { email:'l.lafleur@cliniquerebecca.ht',       specialite:'Neurologie',          emoji:'🧠' },
  'Dr Bernard Pierre':        { email:'b.pierre@cliniquerebecca.ht',        specialite:'Neurochirurgie',      emoji:'🧠' },
  'Dr Peterly PHILIPPE':      { email:'p.philippe@cliniquerebecca.ht',      specialite:'Orthopédie',          emoji:'🦴' },
  'Dr Brunot Simon':          { email:'b.simon@cliniquerebecca.ht',         specialite:'Orthopédie',          emoji:'🦴' },
  'Dr Clifford Edouard':      { email:'c.edouard@cliniquerebecca.ht',       specialite:'Orthopédie',          emoji:'🦴' },
  'Dr Auguste Samy':          { email:'a.samy@cliniquerebecca.ht',          specialite:'Orthopédie',          emoji:'🦴' },
  'Dr Wisly Joseph':          { email:'w.joseph@cliniquerebecca.ht',        specialite:'Chirurgie Générale',  emoji:'🔬' },
  'Dr Jean Berldine':         { email:'j.berldine@cliniquerebecca.ht',      specialite:'Chirurgie Générale',  emoji:'🔬' },
  'Dr Jeff Tesnor':           { email:'j.tesnor@cliniquerebecca.ht',        specialite:'Chirurgie Générale',  emoji:'🔬' },
  'Dr Jenh Robert':           { email:'j.robert@cliniquerebecca.ht',        specialite:'Chir. Pédiatrique',   emoji:'👶' },
  'Dr Sophie Beaujour':       { email:'s.beaujour@cliniquerebecca.ht',      specialite:'Dermatologie',        emoji:'🧬' },
  'Dr Kaina Michaud':         { email:'k.michaud@cliniquerebecca.ht',       specialite:'ORL',                 emoji:'👂' },
  'Dr Pierre Billy Lemaus':   { email:'p.lemaus@cliniquerebecca.ht',        specialite:'Urologie',            emoji:'🩺' },
  'Dr Marie Kerline Pierre':  { email:'mk.pierre@cliniquerebecca.ht',       specialite:'Anesthésiologie',     emoji:'💉' },
  'Dr Jean Luc Mathurin':     { email:'jl.mathurin@cliniquerebecca.ht',     specialite:'Radiologie',          emoji:'🩻' },
  'Mr Reginald Volcy':        { email:'r.volcy@cliniquerebecca.ht',         specialite:'Psychologie',         emoji:'🧬' },
  'Dr Wolf Charlie Cajuste':  { email:'wc.cajuste@cliniquerebecca.ht',      specialite:'Dentisterie',         emoji:'🦷' },
  'Mme Fredia Fleurival':     { email:'f.fleurival@cliniquerebecca.ht',     specialite:'Physiothérapie',      emoji:'🏥' },
  'Dr Gilles Abraham':        { email:'g.abraham@cliniquerebecca.ht',       specialite:'Optométrie',          emoji:'👁️' },
}

// ── Bouton Retour ─────────────────────────────────────────────────────────
function BackButton({ label = 'Tous les services', href = '/services' }: { label?: string; href?: string }) {
  const router = useRouter()
  return (
    <button onClick={() => router.back()} style={{
      background:'none', border:'none', cursor:'pointer',
      color:'rgba(255,255,255,0.75)', fontSize:13, display:'inline-flex',
      alignItems:'center', gap:6, marginBottom:20, padding:0,
      textDecoration:'none', fontWeight:600,
    }}>
      ← {label}
    </button>
  )
}

// ── Carrousel auto ────────────────────────────────────────────────────────
function Carrousel({ items, couleur, vitesse = 4000 }: { items:{titre:string;desc:string}[]; couleur:string; vitesse?:number }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => setIdx(p => (p+1) % items.length), vitesse)
    return () => clearInterval(t)
  }, [items.length, vitesse])
  if (!items.length) return null
  const item = items[idx]
  return (
    <div style={{ background:'white', borderRadius:18, padding:28, border:'1px solid #e2e8f0', position:'relative', overflow:'hidden', minHeight:150 }}>
      <div style={{ position:'absolute', top:0, left:0, width:4, height:'100%', background:couleur }} />
      <div style={{ fontSize:12, color:couleur, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>{idx+1} / {items.length}</div>
      <div style={{ fontWeight:800, fontSize:'1.05rem', color:'#0f172a', marginBottom:10 }}>{item.titre}</div>
      <div style={{ color:'#64748b', fontSize:14, lineHeight:1.7 }}>{item.desc}</div>
      <div style={{ display:'flex', gap:5, marginTop:16 }}>
        {items.map((_,i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width:i===idx?24:8, height:8, borderRadius:4, background:i===idx?couleur:'#e2e8f0', border:'none', cursor:'pointer', transition:'all 0.3s', padding:0 }} />
        ))}
      </div>
    </div>
  )
}

// ── Hero commun ───────────────────────────────────────────────────────────
function Hero({ titre, icon, gradient, desc }: any) {
  return (
    <div style={{ background:gradient, padding:'56px 20px 40px' }}>
      <div style={{ maxWidth:1000, margin:'0 auto' }}>
        <BackButton />
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:64, height:64, borderRadius:18, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>{icon}</div>
          <div>
            <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.6rem,4vw,2.4rem)', margin:0 }}>{titre}</h1>
            {desc && <p style={{ color:'rgba(255,255,255,0.75)', margin:'8px 0 0', fontSize:14, maxWidth:600 }}>{desc}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CTA Sidebar ───────────────────────────────────────────────────────────
function SidebarCTA({ couleur }: { couleur:string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <Link href="/specialites" style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:14, padding:'16px', textDecoration:'none', display:'block', textAlign:'center' }}>
        <div style={{ fontSize:24, marginBottom:6 }}>👨‍⚕️</div>
        <div style={{ fontWeight:700, color:'#0f172a', fontSize:14 }}>Voir nos spécialistes</div>
        <div style={{ color:'#64748b', fontSize:12, marginTop:4 }}>30 médecins disponibles</div>
      </Link>
      <div style={{ background:`linear-gradient(135deg,${couleur},#0d9488)`, borderRadius:14, padding:20, textAlign:'center' }}>
        <p style={{ color:'white', fontWeight:700, margin:'0 0 6px', fontSize:14 }}>Prendre rendez-vous</p>
        <p style={{ color:'rgba(255,255,255,0.8)', fontSize:12, margin:'0 0 14px' }}>{CLINIQUE_TEL}</p>
        <Link href="/consultation" style={{ background:'white', color:couleur, textDecoration:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, fontSize:13, display:'inline-block' }}>
          Réserver
        </Link>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE CLINIQUE EXTERNE
// ══════════════════════════════════════════════════════════════════════════
function PageCliniqueExterne() {
  const [branche, setBranche] = useState<string|null>(null)
  const router = useRouter()
  const b = BRANCHES_CLINIQUE.find(x => x.slug === branche)

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Navbar variant="public" />
      <Hero titre="Clinique Externe" icon="🩺" gradient="linear-gradient(135deg,#0f1e3d,#1641C8)"
        desc="15 spécialités médicales — sélectionnez une branche pour voir les médecins disponibles" />
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'36px 20px' }}>
        {!branche ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
            {BRANCHES_CLINIQUE.map(b => (
              <button key={b.slug} onClick={() => setBranche(b.slug)} style={{
                background:'white', borderRadius:16, padding:'18px 14px', border:'1px solid #e2e8f0',
                cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:12, transition:'all 0.2s'
              }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#1641C8';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(22,65,200,0.12)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#e2e8f0';(e.currentTarget as HTMLElement).style.boxShadow='none'}}>
                <span style={{ fontSize:26 }}>{b.icon}</span>
                <div>
                  <div style={{ fontWeight:700, color:'#0f172a', fontSize:14 }}>{b.label}</div>
                  <div style={{ color:'#64748b', fontSize:12, marginTop:2 }}>{b.medecins.length} médecin{b.medecins.length>1?'s':''}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            <button onClick={() => setBranche(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#1641C8', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', gap:6, marginBottom:24, padding:0 }}>
              ← Toutes les spécialités
            </button>
            <h2 style={{ fontWeight:900, fontSize:'1.3rem', color:'#0f172a', marginBottom:6 }}>{b?.icon} {b?.label}</h2>
            <p style={{ color:'#64748b', fontSize:14, marginBottom:20 }}>Contact : <a href={`mailto:${b?.email}`} style={{ color:'#1641C8' }}>{b?.email}</a> · {CLINIQUE_TEL}</p>
            {!b?.medecins.length ? (
              <div style={{ background:'white', borderRadius:16, padding:32, textAlign:'center', border:'1px solid #e2e8f0' }}>
                <p style={{ color:'#64748b' }}>Disponible sur demande — appelez le {CLINIQUE_TEL}</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:14 }}>
                {b?.medecins.map(nom => {
                  const info = MEDECINS_INFO[nom] || {}
                  return (
                    <div key={nom} style={{ background:'white', borderRadius:16, padding:20, border:'1px solid #e2e8f0', display:'flex', gap:14, alignItems:'center' }}>
                      <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#1641C8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{info.emoji||'👨‍⚕️'}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:800, color:'#0f172a', fontSize:14 }}>{nom}</div>
                        <div style={{ color:'#0d9488', fontWeight:600, fontSize:12, marginTop:2 }}>{info.specialite}</div>
                        {info.email && <a href={`mailto:${info.email}`} style={{ color:'#94a3b8', fontSize:11, marginTop:4, display:'block', textDecoration:'none' }}>✉️ {info.email}</a>}
                        <Link href="/consultation" style={{ background:'#eff6ff', color:'#1641C8', textDecoration:'none', borderRadius:8, padding:'5px 12px', fontWeight:700, fontSize:12, display:'inline-block', marginTop:10 }}>Prendre RDV</Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE LABORATOIRE — 165 examens en carrousel + recherche
// ══════════════════════════════════════════════════════════════════════════
function PageLaboratoire() {
  const TOUS_EXAMENS_CARR = [
    {titre:'Hémogramme complet (NFS)',desc:'Analyse des globules rouges, blancs et plaquettes. Détecte anémie, infections et troubles de coagulation. Résultat sous 4h.'},
    {titre:'Glycémie à jeun',desc:'Mesure du taux de sucre dans le sang à jeun. Indispensable pour le dépistage et suivi du diabète.'},
    {titre:'Sérologie HIV 1 & 2',desc:'Dépistage des anticorps VIH. Résultat confidentiel sous 24h. Conseil pré et post-test inclus.'},
    {titre:'Hépatite B (AgHBs)',desc:'Détection du virus de l\'hépatite B. Recommandé avant vaccination ou suivi de traitement antiviral.'},
    {titre:'Hépatite C (Ac anti-VHC)',desc:'Dépistage de l\'hépatite C, souvent asymptomatique. Traitement curatif disponible si détecté tôt.'},
    {titre:'Bilan Rénal (Urée + Créatinine)',desc:'Évalue le fonctionnement des reins. Essentiel pour diabétiques, hypertendus et patients sous médicaments néphrotoxiques.'},
    {titre:'HBA1C (Hémoglobine glyquée)',desc:'Reflète la glycémie moyenne des 3 derniers mois. Outil clé pour le suivi à long terme du diabète.'},
    {titre:'TORCH (5 pathogènes)',desc:'Toxoplasmose, Rubéole, CMV, Herpès I & II. Bilan recommandé en début de grossesse pour protéger mère et bébé.'},
    {titre:'TSH (Thyroïde)',desc:'Hormone de stimulation thyroïdienne. Dépiste hypo et hyperthyroïdie. Recommandé en cas de fatigue chronique inexpliquée.'},
    {titre:'Bilan Lipidique complet',desc:'Cholestérol total, HDL, LDL, VLDL et triglycérides. Évalue le risque cardiovasculaire. À faire à jeun.'},
    {titre:'Widal O/H (Typhoïde)',desc:'Diagnostic sérologique de la fièvre typhoïde. Recommandé après 5 jours de fièvre avec troubles digestifs.'},
    {titre:'βHCG quantitatif (Grossesse)',desc:'Détection de la grossesse dès 10 jours après conception. Plus fiable que le test urinaire.'},
    {titre:'PSA (Prostate)',desc:'Antigène prostatique spécifique. Dépistage du cancer de la prostate recommandé après 45 ans.'},
    {titre:'Ferritine + Fer sérique',desc:'Évalue les réserves en fer. Indispensable pour diagnostiquer et suivre l\'anémie ferriprive.'},
    {titre:'Bilan Hépatique (SGOT, SGPT, GGT)',desc:'Évalue la santé du foie. Requis avant traitement médical prolongé et pour les porteurs de l\'hépatite.'},
    {titre:'Frottis Vaginal + Antibiogramme',desc:'Détecte infections bactériennes, fongiques et parasitaires. Antibiogramme inclus pour traitement ciblé.'},
    {titre:'Culture d\'urine (ECBU)',desc:'Identification des bactéries responsables d\'infection urinaire avec antibiogramme pour guider le traitement.'},
    {titre:'Groupe Sanguin + Rhésus',desc:'Détermination du groupe ABO et facteur Rhésus. Obligatoire avant toute transfusion ou chirurgie.'},
    {titre:'D-Dimères',desc:'Marqueur de thrombose et embolie pulmonaire. Demandé en urgence en cas de douleur thoracique ou jambe gonflée.'},
    {titre:'Interleukine 6 (IL-6)',desc:'Marqueur inflammatoire avancé. Utilisé pour évaluer la sévérité des infections et maladies auto-immunes.'},
    {titre:'Procalcitonine (PCT)',desc:'Marqueur précoce et spécifique des infections bactériennes graves. Aide à guider l\'antibiothérapie.'},
    {titre:'HB Electrophorèse',desc:'Détecte les hémoglobinopathies comme la drépanocytose (sickling). Recommandé avant toute grossesse en Haïti.'},
    {titre:'Cortisol (8h)',desc:'Évalue la fonction surrénalienne. Prescrit en cas de fatigue intense, prise de poids inexpliquée ou suspicion d\'Addison.'},
    {titre:'Prolactine',desc:'Hormone hypophysaire. Prescrite en cas d\'aménorrhée, galactorrhée ou difficultés de fertilité.'},
    {titre:'FSH & LH',desc:'Hormones de fertilité. Évaluent la réserve ovarienne chez la femme et la production de sperme chez l\'homme.'},
    {titre:'Testostérone totale',desc:'Évalue la fonction hormonale masculine. Prescrite en cas de baisse de libido, infertilité ou suspicion d\'hypogonadisme.'},
    {titre:'Malaria (Goutte épaisse)',desc:'Détection du paludisme par microscopie. Résultat en 1h. Traitement urgent si positif.'},
    {titre:'CRP (Protéine C Réactive)',desc:'Marqueur inflammatoire rapide. Distingue infection bactérienne de virale. Résultat en 2h.'},
    {titre:'VDRL/RPR (Syphilis)',desc:'Dépistage de la syphilis. Recommandé pendant la grossesse et bilan IST complet.'},
    {titre:'RA-Latex (Polyarthrite)',desc:'Facteur rhumatoïde. Aide au diagnostic de la polyarthrite rhumatoïde et autres maladies auto-immunes.'},
  ]

  const TOUS_EXAMENS_SEARCH = [
    'Hémogramme','NFS','Glycémie','Urée','Créatinine','Cholestérol','HDL','LDL','VLDL','Triglycérides',
    'SGOT','SGPT','Gamma GT','Bilirubine','Albumine','TSH','T3','T4','HIV','Hépatite B','Hépatite C',
    'VDRL','RPR','Widal','CRP','RA-Latex','ASO','H.Pylori','PSA','HBA1C','BHCG','Ferritine','Fer sérique',
    'Calcium','Phosphore','Acide urique','Hémoglobine','Réticulocytes','Plaquettes','TS','TC','PT/INR',
    'D-Dimères','Groupe sanguin','Sickling','Électrophorèse','Malaria','Monotest','TORCH','Toxoplasmose',
    'Rubéole','CMV','Herpès','Frottis vaginal','Frottis urétral','Crachats','Culture urine','Culture selles',
    'Culture pus','Goutte pendante','Leucocytes','Nitrite','Albumine urinaire','Glucose urinaire',
    'Interleukine 6','Procalcitonine','Cortisol','DHEA','Testostérone','Progestérone','Estradiol','FSH','LH',
    'Prolactine','Insuline','Peptide C','Microalbuminurie','Créatinine urinaire','Acide valproïque',
    'Digoxine','Phénobarbital','Cyclosporine','Tacrolimus','Lithium','Valproate','Troponine','BNP','NT-proBNP',
    'Amylase','Lipase','LDH','CPK','Uricémie','Magnésium','Potassium','Sodium','Chlorures','Bicarbonates',
    'Zinc','Cuivre','Sélénium','Vitamine D','Vitamine B12','Acide folique','B9','Rétinol','Fer','Transferrine',
    'TPHA','FTA-ABS','Western Blot','PCR','ELISA','RAI','Coombs direct','Coombs indirect',
    'Examen direct selles','Parasitologie selles','Amibes','Oxyures','Ascaris','Ankylostome',
    'Numération globulaire','Formule sanguine','Hématocrite','MCHC','MCV','MCH','RDW',
    'Antigène HBs','Anticorps HBs','Anticorps HBc','Charge virale','CD4','CD8',
    'Thyroglobuline','Anti-TPO','Anti-TG','T3 libre','T4 libre',
  ]

  const [search, setSearch] = useState('')
  const [result, setResult] = useState<'dispo'|'non'|null>(null)

  const chercher = () => {
    if (!search.trim()) return
    const q = search.toLowerCase()
    const ok = TOUS_EXAMENS_SEARCH.some(e => e.toLowerCase().includes(q))
    setResult(ok ? 'dispo' : 'non')
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Navbar variant="public" />
      <Hero titre="Laboratoire" icon="🔬" gradient="linear-gradient(135deg,#0f1e3d,#16a34a)"
        desc="165 analyses biologiques complètes · Résultats envoyés par WhatsApp sous 24-48h" />
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'36px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          <div>
            <h2 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.1rem', marginBottom:16 }}>🔬 Nos examens ({TOUS_EXAMENS_CARR.length}+)</h2>
            <Carrousel items={TOUS_EXAMENS_CARR} couleur="#16a34a" vitesse={3500} />
          </div>
          <div>
            <h2 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.1rem', marginBottom:16 }}>🔍 Vérifier la disponibilité</h2>
            <div style={{ background:'white', borderRadius:18, padding:24, border:'1px solid #e2e8f0' }}>
              <p style={{ color:'#64748b', fontSize:13, marginBottom:14 }}>Entrez le nom d'un examen pour vérifier s'il est disponible.</p>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                <input value={search} onChange={e=>{setSearch(e.target.value);setResult(null)}}
                  onKeyDown={e=>e.key==='Enter'&&chercher()}
                  placeholder="Ex: Glycémie, HIV, TSH..."
                  style={{ flex:1, padding:'11px 14px', borderRadius:10, border:'1px solid #d1d5db', fontSize:14, outline:'none' }} />
                <button onClick={chercher} style={{ background:'#16a34a', color:'white', border:'none', borderRadius:10, padding:'11px 18px', fontWeight:700, cursor:'pointer', fontSize:13 }}>
                  Vérifier
                </button>
              </div>
              {result==='dispo' && (
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', display:'flex', gap:10 }}>
                  <span style={{ fontSize:20 }}>✅</span>
                  <div><div style={{ fontWeight:700, color:'#16a34a' }}>Disponible</div><div style={{ fontSize:12, color:'#64748b' }}>Cet examen est disponible dans notre laboratoire.</div></div>
                </div>
              )}
              {result==='non' && (
                <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:10, padding:'12px 16px', display:'flex', gap:10 }}>
                  <span style={{ fontSize:20 }}>❌</span>
                  <div><div style={{ fontWeight:700, color:'#dc2626' }}>Non disponible</div><div style={{ fontSize:12, color:'#64748b' }}>Appelez le {CLINIQUE_TEL} pour confirmer.</div></div>
                </div>
              )}
              <div style={{ marginTop:16, padding:'12px 14px', background:'#f0fdf4', borderRadius:10 }}>
                {['Résultats envoyés par WhatsApp','Horaires : Lun–Sam 07h–15h','Prélèvement sans RDV requis'].map((i,k)=>(
                  <div key={k} style={{ fontSize:13, color:'#475569', display:'flex', gap:8, marginTop:k?6:0 }}><span style={{ color:'#16a34a' }}>✓</span>{i}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop:32, background:'linear-gradient(135deg,#16a34a,#0d9488)', borderRadius:18, padding:28, textAlign:'center' }}>
          <h3 style={{ color:'white', fontWeight:800, fontSize:'1.1rem', margin:'0 0 8px' }}>Besoin d'un examen ?</h3>
          <p style={{ color:'rgba(255,255,255,0.8)', margin:'0 0 16px', fontSize:13 }}>Lun–Sam 07h–15h · {CLINIQUE_TEL}</p>
          <Link href="/consultation" style={{ background:'white', color:'#16a34a', textDecoration:'none', borderRadius:10, padding:'11px 26px', fontWeight:700, display:'inline-block' }}>Prendre rendez-vous</Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE PHARMACIE — carrousel en boucle infinie
// ══════════════════════════════════════════════════════════════════════════
function PagePharmacie() {
  const MEDICAMENTS = [
    {nom:'Amoxicilline 500mg',cat:'Antibiotique',dispo:true,exp:'12/2026',inst:'Sur ordonnance. À prendre avec de la nourriture toutes les 8h. Compléter le traitement même si amélioration.'},
    {nom:'Metformine 500mg & 850mg',cat:'Antidiabétique',dispo:true,exp:'06/2026',inst:'Pendant les repas. Surveiller la glycémie régulièrement. Ne pas écraser le comprimé.'},
    {nom:'Amlodipine 5mg & 10mg',cat:'Antihypertenseur',dispo:true,exp:'09/2026',inst:'Une prise par jour à heure fixe. Ne jamais arrêter brutalement. Surveiller la tension.'},
    {nom:'Oméprazole 20mg',cat:'Antiulcéreux',dispo:true,exp:'03/2027',inst:'30 minutes avant le repas du matin. Protège l\'estomac des brûlures et ulcères.'},
    {nom:'Ibuprofène 400mg',cat:'Anti-inflammatoire',dispo:true,exp:'11/2026',inst:'Avec de la nourriture. Max 3 comprimés/jour. Déconseillé en grossesse et insuffisance rénale.'},
    {nom:'Paracétamol 500mg & 1g',cat:'Antalgique',dispo:true,exp:'08/2027',inst:'Max 4g/jour adulte. Intervalle minimum 6h entre les prises. À éviter avec alcool.'},
    {nom:'Azithromycine 500mg',cat:'Antibiotique macrolide',dispo:true,exp:'07/2026',inst:'Sur ordonnance. 1 comprimé/jour pendant 3 jours. Ne pas prendre avec antiacides.'},
    {nom:'Clotrimazole crème 1%',cat:'Antifongique',dispo:true,exp:'05/2026',inst:'Application 2x/jour pendant 2-4 semaines. Éviter le contact avec les yeux.'},
    {nom:'Salbutamol inhalateur',cat:'Bronchodilatateur',dispo:true,exp:'04/2026',inst:'En cas de crise d\'asthme. Agiter avant usage. Max 4 inhalations/jour en crise.'},
    {nom:'Zinc + Vitamine C',cat:'Complément',dispo:true,exp:'01/2027',inst:'Dissoudre dans l\'eau. 1 comprimé/jour. Renforce l\'immunité. Ne pas dépasser la dose.'},
    {nom:'Fer + Acide folique',cat:'Supplément grossesse',dispo:true,exp:'10/2026',inst:'À jeun pour meilleure absorption. Recommandé pendant toute la grossesse.'},
    {nom:'Lévothyroxine 50-100µg',cat:'Hormones thyroïdiennes',dispo:true,exp:'08/2026',inst:'À jeun 30 min avant le petit-déjeuner. Prise régulière essentielle.'},
    {nom:'Metronidazole 250mg',cat:'Antiprotozoaire',dispo:true,exp:'06/2026',inst:'Avec repas pour éviter nausées. Éviter l\'alcool pendant et 48h après le traitement.'},
    {nom:'Ranitidine 150mg',cat:'Anti-acide',dispo:true,exp:'09/2026',inst:'Avant les repas ou au coucher. Soulage les brûlures gastriques et reflux.'},
    {nom:'Doxycycline 100mg',cat:'Antibiotique',dispo:true,exp:'05/2026',inst:'Avec grand verre d\'eau en position assise. Éviter le soleil pendant le traitement.'},
    {nom:'Captopril 25mg',cat:'Antihypertenseur (IEC)',dispo:true,exp:'11/2026',inst:'À prendre à jeun 1h avant les repas. Peut causer une toux sèche.'},
    {nom:'Prednisolone 5mg',cat:'Corticoïde',dispo:false,exp:'—',inst:'Sur ordonnance stricte. Ne jamais arrêter brutalement. Appelez-nous pour disponibilité.'},
    {nom:'Tramadol 50mg',cat:'Antalgique opioïde',dispo:false,exp:'—',inst:'Sur ordonnance médicale uniquement. Appelez le {CLINIQUE_TEL} pour vérifier le stock.'},
  ]
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p+1) % MEDICAMENTS.length), 2500)
    return () => clearInterval(t)
  }, [MEDICAMENTS.length])
  const med = MEDICAMENTS[idx]
  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Navbar variant="public" />
      <Hero titre="Pharmacie" icon="💊" gradient="linear-gradient(135deg,#0f1e3d,#7c3aed)"
        desc="Médicaments génériques et de marque · Commander par téléphone" />
      <div style={{ maxWidth:900, margin:'0 auto', padding:'36px 20px' }}>
        <div style={{ background:'#7c3aed', borderRadius:14, padding:'14px 20px', marginBottom:28, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:22 }}>📞</span>
          <div style={{ color:'white' }}>
            <div style={{ fontWeight:700 }}>Commander ou vérifier la disponibilité</div>
            <div style={{ fontSize:13, opacity:0.85 }}>{CLINIQUE_TEL} · Lun–Ven 07h–17h, Sam 07h–12h</div>
          </div>
        </div>

        {/* Carrousel principal en vedette */}
        <div style={{ background:'white', borderRadius:20, padding:32, border:'1px solid #e2e8f0', marginBottom:28, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, width:6, height:'100%', background:med.dispo?'#7c3aed':'#dc2626' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
            <div>
              <div style={{ fontWeight:900, fontSize:'1.3rem', color:'#0f172a', marginBottom:4 }}>{med.nom}</div>
              <div style={{ display:'inline-block', background:'#f5f3ff', color:'#7c3aed', borderRadius:50, padding:'3px 12px', fontSize:12, fontWeight:600 }}>{med.cat}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <span style={{ background:med.dispo?'#f0fdf4':'#fef2f2', color:med.dispo?'#16a34a':'#dc2626', borderRadius:50, padding:'6px 14px', fontSize:13, fontWeight:700 }}>
                {med.dispo?'✓ Disponible':'✗ Indisponible'}
              </span>
              {med.dispo && <div style={{ fontSize:11, color:'#94a3b8', marginTop:6 }}>Exp: {med.exp}</div>}
            </div>
          </div>
          <p style={{ color:'#475569', fontSize:14, lineHeight:1.7, margin:'0 0 16px' }}>{med.inst}</p>
          <div style={{ display:'flex', gap:5 }}>
            {MEDICAMENTS.map((_,i)=>(
              <button key={i} onClick={()=>setIdx(i)} style={{ width:i===idx?24:6, height:6, borderRadius:3, background:i===idx?'#7c3aed':'#e2e8f0', border:'none', cursor:'pointer', transition:'all 0.3s', padding:0 }} />
            ))}
          </div>
          <div style={{ fontSize:12, color:'#94a3b8', marginTop:10, textAlign:'right' }}>{idx+1} / {MEDICAMENTS.length}</div>
        </div>

        <div style={{ background:'linear-gradient(135deg,#7c3aed,#0d9488)', borderRadius:18, padding:28, textAlign:'center' }}>
          <h3 style={{ color:'white', fontWeight:800, margin:'0 0 8px' }}>Médicament non listé ?</h3>
          <p style={{ color:'rgba(255,255,255,0.8)', margin:'0 0 16px', fontSize:13 }}>Appelez-nous — nous commandons pour vous ou orientons vers le partenaire le plus proche.</p>
          <a href={`tel:+50948585757`} style={{ background:'white', color:'#7c3aed', textDecoration:'none', borderRadius:12, padding:'12px 28px', fontWeight:700, display:'inline-block' }}>📞 {CLINIQUE_TEL}</a>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE GÉNÉRIQUE IA — dentisterie, physio, optometrie, maternite, sop, gestes, hospit
// ══════════════════════════════════════════════════════════════════════════
const CONFIGS: Record<string,any> = {
  dentisterie:    { titre:'Dentisterie',                icon:'🦷', couleur:'#0d9488', gradient:'linear-gradient(135deg,#0f1e3d,#0d9488)', prompt:'Génère 12 gestes dentaires courants en JSON [{titre,desc}]. Inclure: consultation, détartrage, extraction simple, extraction compliquée, obturation (plombage), couronne, bridge, prothèse, implant, blanchiment, orthodontie, parodontologie. Chaque desc: 2 phrases expliquant le geste et quand il est recommandé. JSON UNIQUEMENT, pas de markdown.' },
  physiotherapie: { titre:'Physiothérapie',             icon:'🏥', couleur:'#d97706', gradient:'linear-gradient(135deg,#0f1e3d,#d97706)', prompt:'Génère 10 techniques de physiothérapie en JSON [{titre,desc}]. Inclure: bilan initial, rééducation motrice, électrostimulation, ultrason thérapeutique, massage thérapeutique, thermothérapie, cryothérapie, mobilisation articulaire, traction lombaire, exercices AVP. Chaque desc: 2 phrases. JSON UNIQUEMENT.' },
  optometrie:     { titre:'Optométrie',                 icon:'👁️', couleur:'#dc2626', gradient:'linear-gradient(135deg,#0f1e3d,#dc2626)', prompt:'Génère 8 services d\'optométrie en JSON [{titre,desc}]. Inclure: examen de la vue complet, réfraction, prescription lunettes, verres progressifs, verres bifocaux, bilan vision enfant, dépistage glaucome, fond d\'oeil. Chaque desc: 2 phrases. JSON UNIQUEMENT.' },
  maternite:      { titre:'Maternité',                  icon:'🍼', couleur:'#ec4899', gradient:'linear-gradient(135deg,#0f1e3d,#ec4899)', prompt:'Génère 10 services de maternité en JSON [{titre,desc}]. Inclure: consultation prénatale 1er trimestre, échographie obstétricale, suivi 2e trimestre, préparation accouchement, accouchement voie basse, césarienne programmée, césarienne urgente, soins néonataux, consultation postnatale, planification familiale. Chaque desc: 2 phrases. JSON UNIQUEMENT.' },
  'salle-sop':    { titre:'Salle Opératoire (SOP)',     icon:'🔪', couleur:'#475569', gradient:'linear-gradient(135deg,#0f1e3d,#374151)', prompt:'Génère 10 types de chirurgies pratiquées en JSON [{titre,desc}]. Inclure: appendicectomie, herniorraphie inguinale, cholécystectomie, laparotomie exploratrice, chirurgie laparoscopique, arthroplastie genou, réduction fracture, ostéosynthèse, césarienne, myomectomie. Chaque desc: 2 phrases. JSON UNIQUEMENT.' },
  'gestes-medicaux':{ titre:'Gestes Médicaux',          icon:'💉', couleur:'#f59e0b', gradient:'linear-gradient(135deg,#0f1e3d,#d97706)', prompt:'Génère 10 gestes médicaux courants en JSON [{titre,desc}]. Inclure: injection intramusculaire, injection intraveineuse directe, perfusion IV, pose cathéter veineux, suture plaie simple, suture plaie complexe, pansement, ECG 12 dérivations, prise de sang, pose sonde urinaire. Chaque desc: 2 phrases. JSON UNIQUEMENT.' },
  hospitalisation:{ titre:'Hospitalisation & Observation',icon:'🏥', couleur:'#0369a1', gradient:'linear-gradient(135deg,#0f1e3d,#0369a1)', prompt:'Génère 10 aspects de l\'hospitalisation médicale en JSON [{titre,desc}]. Inclure: admission et bilan initial, chambre individuelle, observation courte durée, soins infirmiers continus, surveillance 24h/24, nutrition clinique, kinésithérapie en chambre, préparation sortie, ordonnance de sortie, suivi post-hospitalisation. Chaque desc: 2 phrases. JSON UNIQUEMENT.' },
}

function PageServiceIA({ slug }: { slug:string }) {
  const [items, setItems] = useState<{titre:string;desc:string}[]>([])
  const [loading, setLoading] = useState(true)
  const cfg = CONFIGS[slug]

  useEffect(() => {
    if (!cfg) { setLoading(false); return }
    fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514', max_tokens:1500,
        messages:[{role:'user',content:cfg.prompt}]
      })
    })
    .then(r=>r.json())
    .then(d=>{
      const text = d.content?.[0]?.text||'[]'
      try { setItems(JSON.parse(text.replace(/```json|```/g,'').trim())) }
      catch { setItems([]) }
    })
    .catch(()=>setItems([]))
    .finally(()=>setLoading(false))
  },[slug])

  if (!cfg) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <p style={{color:'#64748b',fontSize:'1.1rem'}}>Service introuvable</p>
        <Link href="/services" style={{color:'#1641C8',fontWeight:700}}>← Retour aux services</Link>
      </div>
    </div>
  )

  const medecin = slug==='dentisterie' ? MEDECINS_INFO['Dr Wolf Charlie Cajuste'] :
                  slug==='physiotherapie' ? MEDECINS_INFO['Mme Fredia Fleurival'] :
                  slug==='optometrie' ? MEDECINS_INFO['Dr Gilles Abraham'] : null
  const medecinNom = slug==='dentisterie' ? 'Dr Wolf Charlie Cajuste' :
                     slug==='physiotherapie' ? 'Mme Fredia Fleurival' :
                     slug==='optometrie' ? 'Dr Gilles Abraham' : null

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      <Navbar variant="public" />
      <Hero titre={cfg.titre} icon={cfg.icon} gradient={cfg.gradient} desc={null} />
      <div style={{maxWidth:1000,margin:'0 auto',padding:'36px 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:24}}>
          <div>
            <h2 style={{fontWeight:800,color:'#0f172a',fontSize:'1.1rem',marginBottom:16}}>{cfg.icon} Services & interventions</h2>
            {loading ? (
              <div style={{background:'white',borderRadius:18,padding:48,border:'1px solid #e2e8f0',textAlign:'center'}}>
                <div style={{width:36,height:36,borderRadius:'50%',border:`3px solid ${cfg.couleur}`,borderTopColor:'transparent',animation:'spin 1s linear infinite',margin:'0 auto 12px'}} />
                <p style={{color:'#64748b',margin:0,fontSize:13}}>Chargement en cours...</p>
              </div>
            ) : items.length ? (
              <Carrousel items={items} couleur={cfg.couleur} vitesse={4000} />
            ) : (
              <div style={{background:'white',borderRadius:18,padding:28,border:'1px solid #e2e8f0'}}>
                <p style={{color:'#64748b'}}>Contactez-nous au {CLINIQUE_TEL} pour plus d\'informations.</p>
              </div>
            )}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {medecin && medecinNom && (
              <div style={{background:'white',borderRadius:16,padding:18,border:'1px solid #e2e8f0'}}>
                <h3 style={{fontWeight:700,fontSize:14,color:'#0f172a',marginBottom:12}}>Notre spécialiste</h3>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:44,height:44,borderRadius:12,background:`${cfg.couleur}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{medecin.emoji}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13}}>{medecinNom}</div>
                    <div style={{color:cfg.couleur,fontSize:12,fontWeight:600}}>{medecin.specialite}</div>
                    <a href={`mailto:${medecin.email}`} style={{color:'#94a3b8',fontSize:11,display:'block',marginTop:3,textDecoration:'none'}}>✉️ {medecin.email}</a>
                    <div style={{color:'#94a3b8',fontSize:11,marginTop:2}}>📞 {CLINIQUE_TEL}</div>
                  </div>
                </div>
              </div>
            )}
            <SidebarCTA couleur={cfg.couleur} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// ROUTER PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════
export default function ServiceDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  if (slug==='clinique-externe') return <PageCliniqueExterne />
  if (slug==='laboratoire')      return <PageLaboratoire />
  if (slug==='pharmacie')        return <PagePharmacie />
  return <PageServiceIA slug={slug} />
}
