'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ── Branches clinique externe ─────────────────────────────────────────────
const BRANCHES_CLINIQUE = [
  { slug:'medecine-interne',    label:'Médecine Interne',        icon:'🩺', medecins:['Dr Vania Louissaint','Dr Christelle Philippe'] },
  { slug:'gynecologie',         label:'Gynécologie',             icon:'👩‍⚕️', medecins:['Dr Eliode Pierre','Dr Delvalès Doccy','Dr Bob-Hallen Treisma','Dr Jean Daniel','Dr Enold Lubin','Dr Dauphin Roolandro'] },
  { slug:'pediatrie',           label:'Pédiatrie',               icon:'👶', medecins:['Dr Mikerline Charles','Dr Duvivier','Dr Rose Stephanie Joseph'] },
  { slug:'neurologie',          label:'Neurologie',              icon:'🧠', medecins:['Dr Lemoine Lafleur'] },
  { slug:'neurochirurgie',      label:'Neurochirurgie',          icon:'🧠', medecins:['Dr Bernard Pierre'] },
  { slug:'orthopedie',          label:'Orthopédie',              icon:'🦴', medecins:['Dr Peterly PHILIPPE','Dr Brunot Simon','Dr Clifford Edouard','Dr Auguste Samy'] },
  { slug:'chirurgie-generale',  label:'Chirurgie Générale',      icon:'🔬', medecins:['Dr Wisly Joseph','Dr Jean Berldine','Dr Jeff Tesnor'] },
  { slug:'chirurgie-pediatrique',label:'Chirurgie Pédiatrique',  icon:'👶', medecins:['Dr Jenh Robert'] },
  { slug:'dermatologie',        label:'Dermatologie',            icon:'🧬', medecins:['Dr Sophie Beaujour'] },
  { slug:'orl',                 label:'ORL',                     icon:'👂', medecins:['Dr Kaina Michaud'] },
  { slug:'urologie',            label:'Urologie',                icon:'🩺', medecins:['Dr Pierre Billy Lemaus'] },
  { slug:'anesthesiologie',     label:'Anesthésiologie',         icon:'💉', medecins:['Dr Marie Kerline Pierre'] },
  { slug:'cardiologie',         label:'Cardiologie',             icon:'❤️', medecins:[] },
  { slug:'radiologie',          label:'Radiologie',              icon:'🩻', medecins:['Dr Jean Luc Mathurin'] },
  { slug:'psychologie',         label:'Psychologie',             icon:'🧬', medecins:['Mr Reginald Volcy'] },
]

const MEDECINS_INFO: Record<string, any> = {
  'Dr Vania Louissaint':     { tel:'4217-8031', specialite:'Médecine interne',   emoji:'🩺' },
  'Dr Christelle Philippe':  { tel:'3894-8400', specialite:'Médecine interne',   emoji:'🩺' },
  'Dr Eliode Pierre':        { tel:'3774-9416', specialite:'Gynécologie',        emoji:'👩‍⚕️' },
  'Dr Delvalès Doccy':       { tel:'3493-6533', specialite:'Gynécologie',        emoji:'👩‍⚕️' },
  'Dr Bob-Hallen Treisma':   { tel:'3816-5368', specialite:'Gynécologie',        emoji:'👩‍⚕️' },
  'Dr Jean Daniel':          { tel:'3634-3265', specialite:'Gynécologie',        emoji:'👩‍⚕️' },
  'Dr Enold Lubin':          { tel:'4853-4651', specialite:'Gynécologie',        emoji:'👩‍⚕️' },
  'Dr Dauphin Roolandro':    { tel:'3106-4936', specialite:'Gynécologie',        emoji:'👩‍⚕️' },
  'Dr Mikerline Charles':    { tel:'3673-8631', specialite:'Pédiatrie',          emoji:'👶' },
  'Dr Duvivier':             { tel:'3325-9190', specialite:'Pédiatrie',          emoji:'👶' },
  'Dr Rose Stephanie Joseph':{ tel:'3614-4332', specialite:'Pédiatrie',          emoji:'👶' },
  'Dr Lemoine Lafleur':      { tel:'4869-0495', specialite:'Neurologie',         emoji:'🧠' },
  'Dr Bernard Pierre':       { tel:'3719-2362', specialite:'Neurochirurgie',     emoji:'🧠' },
  'Dr Peterly PHILIPPE':     { tel:'3780-4789', specialite:'Orthopédie',         emoji:'🦴' },
  'Dr Brunot Simon':         { tel:'3889-3720', specialite:'Orthopédie',         emoji:'🦴' },
  'Dr Clifford Edouard':     { tel:'3327-3689', specialite:'Orthopédie',         emoji:'🦴' },
  'Dr Auguste Samy':         { tel:'3833-2358', specialite:'Orthopédie',         emoji:'🦴' },
  'Dr Wisly Joseph':         { tel:'3865-5254', specialite:'Chirurgie Générale', emoji:'🔬' },
  'Dr Jean Berldine':        { tel:'3685-7346', specialite:'Chirurgie Générale', emoji:'🔬' },
  'Dr Jeff Tesnor':          { tel:'3459-4612', specialite:'Chirurgie Générale', emoji:'🔬' },
  'Dr Jenh Robert':          { tel:'3406-0998', specialite:'Chir. Pédiatrique',  emoji:'👶' },
  'Dr Sophie Beaujour':      { tel:'3294-3481', specialite:'Dermatologie',       emoji:'🧬' },
  'Dr Kaina Michaud':        { tel:'3891-1659', specialite:'ORL',                emoji:'👂' },
  'Dr Pierre Billy Lemaus':  { tel:'3663-8503', specialite:'Urologie',           emoji:'🩺' },
  'Dr Marie Kerline Pierre': { tel:'3780-6951', specialite:'Anesthésiologie',    emoji:'💉' },
  'Dr Jean Luc Mathurin':    { tel:'4007-6328', specialite:'Radiologie',         emoji:'🩻' },
  'Mr Reginald Volcy':       { tel:'4308-9457', specialite:'Psychologie',        emoji:'🧬' },
  'Dr Wolf Charlie Cajuste': { tel:'3810-7562', specialite:'Dentisterie',        emoji:'🦷' },
  'Mme Fredia Fleurival':    { tel:'3368-8796', specialite:'Physiothérapie',     emoji:'🏥' },
  'Dr Gilles Abraham':       { tel:'3627-1021', specialite:'Optométrie',         emoji:'👁️' },
}

// ── Carrousel générique ───────────────────────────────────────────────────
function Carrousel({ items, couleur }: { items: { titre: string; desc: string }[]; couleur: string }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % items.length), 3500)
    return () => clearInterval(t)
  }, [items.length])
  const item = items[idx]
  return (
    <div style={{ background: 'white', borderRadius: 18, padding: 28, border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', minHeight: 140 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: couleur }} />
      <div style={{ fontSize: 13, color: couleur, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        {idx + 1} / {items.length}
      </div>
      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: 8 }}>{item.titre}</div>
      <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{item.desc}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
        {items.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? couleur : '#e2e8f0', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
        ))}
      </div>
    </div>
  )
}

// ── Page Clinique Externe ─────────────────────────────────────────────────
function PageCliniqueExterne() {
  const [brancheActive, setBrancheActive] = useState<string | null>(null)
  const branche = BRANCHES_CLINIQUE.find(b => b.slug === brancheActive)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar variant="public" />
      <div style={{ background: 'linear-gradient(135deg,#0f1e3d,#1641C8)', padding: '56px 20px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Link href="/services" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            ← Tous les services
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🩺</div>
            <div>
              <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.4rem)', margin: 0 }}>Clinique Externe</h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: 14 }}>15 spécialités · Consultez les médecins disponibles par branche</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 20px' }}>
        {!brancheActive ? (
          <>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: 20 }}>Choisissez une spécialité</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
              {BRANCHES_CLINIQUE.map(b => (
                <button key={b.slug} onClick={() => setBrancheActive(b.slug)} style={{
                  background: 'white', borderRadius: 16, padding: '18px 16px', border: '1px solid #e2e8f0',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 12
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1641C8'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(22,65,200,0.1)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
                  <span style={{ fontSize: 26 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{b.label}</div>
                    <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{b.medecins.length} médecin{b.medecins.length > 1 ? 's' : ''}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setBrancheActive(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1641C8', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: 0 }}>
              ← Toutes les spécialités
            </button>
            <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#0f172a', marginBottom: 6 }}>
              {branche?.icon} {branche?.label}
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              {branche?.medecins.length ? `${branche.medecins.length} médecin${branche.medecins.length > 1 ? 's' : ''} disponible${branche.medecins.length > 1 ? 's' : ''}` : 'Spécialité disponible sur demande'}
            </p>
            {branche?.medecins.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 16, padding: 32, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b' }}>Médecins disponibles sur rendez-vous. Contactez-nous au (509) 4858-5757.</p>
                <Link href="/consultation" style={{ background: '#1641C8', color: 'white', textDecoration: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, display: 'inline-block', marginTop: 16 }}>
                  Prendre rendez-vous
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
                {branche?.medecins.map(nom => {
                  const info = MEDECINS_INFO[nom] || {}
                  return (
                    <div key={nom} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#1641C8,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                        {info.emoji || '👨‍⚕️'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>{nom}</div>
                        <div style={{ color: '#0d9488', fontWeight: 600, fontSize: 13, marginTop: 2 }}>{info.specialite}</div>
                        {info.tel && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>📞 {info.tel}</div>}
                        <Link href="/consultation" style={{ background: '#eff6ff', color: '#1641C8', textDecoration: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontSize: 12, display: 'inline-block', marginTop: 10 }}>
                          Prendre RDV
                        </Link>
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

// ── Page Laboratoire ──────────────────────────────────────────────────────
function PageLaboratoire() {
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<'disponible' | 'indisponible' | null>(null)

  const EXAMENS_CARROUSEL = [
    { titre: 'Hémogramme Complet (NFS)', desc: 'Analyse complète de votre sang : globules rouges, blancs, plaquettes. Indispensable pour détecter anémie, infection et troubles de la coagulation.' },
    { titre: 'Glycémie à jeun', desc: 'Mesure du taux de sucre dans le sang. Essentiel pour le dépistage et le suivi du diabète de type 1 et 2.' },
    { titre: 'Sérologie HIV 1 & 2', desc: 'Dépistage des anticorps contre le VIH. Résultat confidentiel et disponible sous 24h. Conseil avant et après test inclus.' },
    { titre: 'Hépatite B (AgHBs)', desc: 'Détection de l\'antigène de surface du virus de l\'hépatite B. Recommandé avant toute vaccination ou suivi de traitement.' },
    { titre: 'Bilan Rénal Complet', desc: 'Créatinine, urée et clairance. Évalue le fonctionnement des reins. Indispensable pour les patients diabétiques et hypertendus.' },
    { titre: 'HBA1C (Hémoglobine glyquée)', desc: 'Reflète la glycémie moyenne des 3 derniers mois. Outil clé pour le suivi à long terme du diabète.' },
    { titre: 'TORCH (5 antigènes)', desc: 'Toxoplasmose, Rubéole, CMV, Herpès I et II. Bilan recommandé pendant la grossesse pour protéger mère et bébé.' },
    { titre: 'TSH (Thyroïde)', desc: 'Hormone de stimulation thyroïdienne. Dépiste l\'hypothyroïdie et l\'hyperthyroïdie. Recommandé en cas de fatigue chronique ou prise de poids inexpliquée.' },
    { titre: 'Cholestérol Total & Fractions', desc: 'HDL, LDL, VLDL et triglycérides. Bilan cardiovasculaire complet pour évaluer votre risque d\'infarctus ou d\'AVC.' },
    { titre: 'Widal O/H', desc: 'Diagnostic sérologique de la typhoïde. Recommandé en présence de fièvre prolongée et troubles digestifs.' },
    { titre: 'Test de Grossesse (βHCG)', desc: 'Détection quantitative de l\'hormone de grossesse dans le sang. Plus fiable que le test urinaire, disponible dès 10 jours après conception.' },
    { titre: 'Frottis Vaginal', desc: 'Recherche d\'infections bactériennes, fongiques et parasitaires. Résultats disponibles en 24-48h avec antibiogramme si nécessaire.' },
  ]

  const TOUS_EXAMENS = [
    'Hémogramme','NFS','Glycémie','Urée','Créatinine','Cholestérol','HDL','LDL','VLDL','Triglycérides',
    'SGOT','SGPT','Gamma GT','Bilirubine','Albumine','TSH','T3','T4','HIV','Hépatite B','Hépatite C',
    'VDRL','RPR','Widal','CRP','RA-Latex','ASO','H.Pylori','PSA','HBA1C','BHCG','Ferritine','Fer sérique',
    'Calcium','Phosphore','Acide urique','Hémoglobine','Réticulocytes','Plaquettes','TS','TC','PT/INR',
    'D-Dimères','Groupe sanguin','Sickling','Électrophorèse','Malaria','Monotest','TORCH','Toxoplasmose',
    'Rubéole','CMV','Herpès','Frottis vaginal','Frottis urétral','Crachats','Culture urine','Culture selles',
    'Culture pus','Goutte pendante','Leucocytes','Nitrite','Albumine urinaire','Glucose urinaire',
    'Interleukine 6','Procalcitonine','Cortisol','DHEA','Testostérone','Progestérone','Estradiol','FSH','LH',
    'Prolactine','Insuline','Peptide C','Microalbuminurie','Créatinine urinaire','Acide valproïque',
    'Digoxine','Phénobarbital','Cyclosporine','Tacrolimus','Lithium','Valproate',
  ]

  const chercher = () => {
    if (!search.trim()) return
    const q = search.toLowerCase().trim()
    const trouve = TOUS_EXAMENS.some(e => e.toLowerCase().includes(q))
    setSearchResult(trouve ? 'disponible' : 'indisponible')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar variant="public" />
      <div style={{ background: 'linear-gradient(135deg,#0f1e3d,#16a34a)', padding: '56px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link href="/services" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>← Tous les services</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🔬</div>
            <div>
              <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.4rem)', margin: 0 }}>Laboratoire</h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: 14 }}>165 analyses biologiques · Résultats par WhatsApp</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Carrousel examens */}
          <div>
            <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: 16 }}>🔬 Examens disponibles</h2>
            <Carrousel items={EXAMENS_CARROUSEL} couleur="#16a34a" />
          </div>

          {/* Recherche examen */}
          <div>
            <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: 16 }}>🔍 Vérifier la disponibilité</h2>
            <div style={{ background: 'white', borderRadius: 18, padding: 24, border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>Entrez le nom d'un examen pour vérifier s'il est disponible dans notre laboratoire.</p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <input value={search} onChange={e => { setSearch(e.target.value); setSearchResult(null) }}
                  onKeyDown={e => e.key === 'Enter' && chercher()}
                  placeholder="Ex: Glycémie, HIV, TSH..."
                  style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
                <button onClick={chercher} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, padding: '11px 18px', fontWeight: 700, cursor: 'pointer' }}>
                  Vérifier
                </button>
              </div>
              {searchResult === 'disponible' && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#16a34a' }}>Disponible</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Cet examen est disponible dans notre laboratoire.</div>
                  </div>
                </div>
              )}
              {searchResult === 'indisponible' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>❌</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#dc2626' }}>Non disponible</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Appelez le (509) 4858-5757 pour confirmer ou commander.</div>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 20, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10 }}>
                <div style={{ fontWeight: 700, color: '#16a34a', marginBottom: 6, fontSize: 14 }}>ℹ️ Informations pratiques</div>
                {['Résultats envoyés par WhatsApp sous 24-48h','Horaires : Lun–Sam 07h–15h','Prélèvement sur place, pas de RDV requis'].map((info, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#475569', display: 'flex', gap: 8, marginTop: 4 }}>
                    <span style={{ color: '#16a34a' }}>✓</span> {info}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, background: 'linear-gradient(135deg,#16a34a,#0d9488)', borderRadius: 18, padding: 28, textAlign: 'center' }}>
          <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', margin: '0 0 10px' }}>Besoin d'un examen ?</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 18px', fontSize: 14 }}>Nos techniciens vous accueillent du lundi au samedi de 7h à 15h.</p>
          <Link href="/consultation" style={{ background: 'white', color: '#16a34a', textDecoration: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, display: 'inline-block' }}>
            Prendre rendez-vous
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ── Page Pharmacie ────────────────────────────────────────────────────────
function PagePharmacie() {
  const MEDICAMENTS = [
    { nom: 'Amoxicilline 500mg', categorie: 'Antibiotique', dispo: true, expiration: '12/2026', instruction: 'Sur ordonnance médicale. À prendre avec de la nourriture. Ne pas arrêter le traitement avant la fin.' },
    { nom: 'Metformine 500mg & 850mg', categorie: 'Antidiabétique', dispo: true, expiration: '06/2026', instruction: 'À prendre pendant les repas. Surveiller la glycémie régulièrement. Ne pas écraser.' },
    { nom: 'Amlodipine 5mg & 10mg', categorie: 'Antihypertenseur', dispo: true, expiration: '09/2026', instruction: 'À prendre à heure fixe chaque jour. Ne pas arrêter brutalement sans avis médical.' },
    { nom: 'Oméprazole 20mg', categorie: 'Antiulcéreux', dispo: true, expiration: '03/2027', instruction: 'À prendre 30 minutes avant le repas. Convient au traitement du reflux gastro-oesophagien.' },
    { nom: 'Ibuprofène 400mg', categorie: 'Anti-inflammatoire', dispo: true, expiration: '11/2026', instruction: 'À prendre avec de la nourriture. Ne pas dépasser 3 comprimés par jour. Déconseillé en grossesse.' },
    { nom: 'Paracétamol 500mg & 1g', categorie: 'Antalgique / Antipyrétique', dispo: true, expiration: '08/2027', instruction: 'Maximum 4g par jour chez l\'adulte. Respecter un intervalle de 6 heures entre les prises.' },
    { nom: 'Ciprofibrate 100mg', categorie: 'Hypolipémiant', dispo: true, expiration: '05/2026', instruction: 'À prendre le soir au coucher. Surveiller les transaminases hépatiques tous les 3 mois.' },
    { nom: 'Clotrimazole crème 1%', categorie: 'Antifongique', dispo: true, expiration: '07/2026', instruction: 'Application cutanée 2 fois par jour pendant 2 à 4 semaines. Éviter les muqueuses.' },
    { nom: 'Salbutamol inhalateur', categorie: 'Bronchodilatateur', dispo: true, expiration: '04/2026', instruction: 'En cas de crise d\'asthme. Agiter avant usage. Maximum 4 inhalations par jour en crise.' },
    { nom: 'Zinc + Vitamine C (effervescent)', categorie: 'Complément alimentaire', dispo: true, expiration: '01/2027', instruction: 'Dissoudre dans un verre d\'eau. 1 comprimé par jour. Renforce l\'immunité.' },
    { nom: 'Fer + Acide folique', categorie: 'Supplément grossesse', dispo: true, expiration: '10/2026', instruction: 'Recommandé pendant la grossesse. À prendre à jeun pour une meilleure absorption.' },
    { nom: 'Azithromycine 500mg', categorie: 'Antibiotique macrolide', dispo: false, expiration: '—', instruction: 'Sur ordonnance. Appelez pour vérifier la disponibilité avant votre déplacement.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar variant="public" />
      <div style={{ background: 'linear-gradient(135deg,#0f1e3d,#7c3aed)', padding: '56px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link href="/services" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>← Tous les services</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>💊</div>
            <div>
              <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.4rem)', margin: 0 }}>Pharmacie</h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: 14 }}>Médicaments génériques et de marque · Commande par téléphone</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ background: '#7c3aed', borderRadius: 14, padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>📞</span>
          <div style={{ color: 'white' }}>
            <div style={{ fontWeight: 700 }}>Commander par téléphone</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Appelez le <strong>(509) 4858-5757</strong> — Lun–Ven 07h–17h, Sam 07h–12h</div>
          </div>
        </div>

        <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: 18 }}>💊 Médicaments disponibles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {MEDICAMENTS.map((m, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: 18, border: `1px solid ${m.dispo ? '#e2e8f0' : '#fca5a5'}`, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, flex: 1 }}>{m.nom}</div>
                <span style={{ background: m.dispo ? '#f0fdf4' : '#fef2f2', color: m.dispo ? '#16a34a' : '#dc2626', borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 700, marginLeft: 8, flexShrink: 0 }}>
                  {m.dispo ? '✓ Dispo' : '✗ Indispo'}
                </span>
              </div>
              <div style={{ background: '#f5f3ff', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#7c3aed', fontWeight: 600, display: 'inline-block', marginBottom: 8 }}>{m.categorie}</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 8 }}>{m.instruction}</div>
              {m.dispo && m.expiration !== '—' && (
                <div style={{ fontSize: 11, color: '#94a3b8' }}>📅 Exp: {m.expiration}</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, background: 'linear-gradient(135deg,#7c3aed,#0d9488)', borderRadius: 18, padding: 28, textAlign: 'center' }}>
          <h3 style={{ color: 'white', fontWeight: 800, margin: '0 0 8px' }}>Médicament non listé ?</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 16px', fontSize: 14 }}>Appelez-nous — nous commandons pour vous ou orientons vers la pharmacie partenaire la plus proche.</p>
          <a href="tel:+50948585757" style={{ background: 'white', color: '#7c3aed', textDecoration: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, display: 'inline-block' }}>
            📞 (509) 4858-5757
          </a>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ── Page générique avec contenu IA ────────────────────────────────────────
function PageServiceGenerique({ slug }: { slug: string }) {
  const [content, setContent] = useState<{ intro: string; items: { titre: string; desc: string }[] } | null>(null)
  const [loading, setLoading] = useState(true)

  const CONFIGS: Record<string, any> = {
    dentisterie: {
      titre: 'Dentisterie', icon: '🦷', couleur: '#0d9488',
      gradient: 'linear-gradient(135deg,#0f1e3d,#0d9488)',
      medecins: [{ nom: 'Dr Wolf Charlie Cajuste', tel: '3810-7562', specialite: 'Chirurgien-Dentiste', emoji: '🦷' }],
      prompt: 'Génère 8 gestes dentaires courants sous forme de liste JSON: [{titre, desc}]. Chaque desc explique en 1-2 phrases ce qu\'est ce geste et quand il est recommandé. Exemples: consultation, détartrage, extraction, obturation, couronne, prothèse, orthodontie, blanchiment. Réponds UNIQUEMENT en JSON valide, sans markdown.',
    },
    physiotherapie: {
      titre: 'Physiothérapie', icon: '🏥', couleur: '#d97706',
      gradient: 'linear-gradient(135deg,#0f1e3d,#d97706)',
      medecins: [{ nom: 'Mme Fredia Fleurival', tel: '3368-8796', specialite: 'Physiothérapeute', emoji: '🏥' }],
      prompt: 'Génère 8 techniques et traitements de physiothérapie sous forme de JSON: [{titre, desc}]. Exemples: rééducation motrice, électrostimulation, ultrason, massage thérapeutique, exercices AVP, thermothérapie, mobilisation articulaire, traction lombaire. Réponds UNIQUEMENT en JSON valide.',
    },
    optometrie: {
      titre: 'Optométrie', icon: '👁️', couleur: '#dc2626',
      gradient: 'linear-gradient(135deg,#0f1e3d,#dc2626)',
      medecins: [{ nom: 'Dr Gilles Abraham', tel: '3627-1021', specialite: 'Optométriste', emoji: '👁️' }],
      prompt: 'Génère 6 services d\'optométrie sous JSON: [{titre, desc}]. Exemples: examen complet de la vue, prescription lunettes, verres progressifs, correction myopie, bilan vision enfant, adaptation lentilles. Réponds UNIQUEMENT en JSON valide.',
    },
    maternite: {
      titre: 'Maternité', icon: '🍼', couleur: '#ec4899',
      gradient: 'linear-gradient(135deg,#0f1e3d,#ec4899)',
      medecins: [],
      prompt: 'Génère 8 services de maternité sous JSON: [{titre, desc}]. Inclure: suivi prénatal, accouchement voie normale, césarienne, échographie obstétricale, consultation postnatale, soins néonataux, planification familiale, préparation accouchement. Réponds UNIQUEMENT en JSON valide.',
    },
    'salle-sop': {
      titre: 'Salle Opératoire (SOP)', icon: '🔪', couleur: '#64748b',
      gradient: 'linear-gradient(135deg,#0f1e3d,#374151)',
      medecins: [],
      prompt: 'Génère 8 types de chirurgies pratiquées en salle opératoire sous JSON: [{titre, desc}]. Inclure: appendicectomie, herniorraphie, chirurgie laparoscopique, césarienne, arthroplastie, réduction fracture, cholécystectomie, biopsie. Réponds UNIQUEMENT en JSON valide.',
    },
    'gestes-medicaux': {
      titre: 'Gestes Médicaux', icon: '💉', couleur: '#f59e0b',
      gradient: 'linear-gradient(135deg,#0f1e3d,#d97706)',
      medecins: [],
      prompt: 'Génère 8 gestes médicaux courants sous JSON: [{titre, desc}]. Exemples: injection intramusculaire, perfusion IV, pose sonde urinaire, pansement, ECG, prise de sang, suture plaie, prise de tension. Explique chaque geste en 1-2 phrases. Réponds UNIQUEMENT en JSON valide.',
    },
    hospitalisation: {
      titre: 'Hospitalisation & Observation', icon: '🏥', couleur: '#0369a1',
      gradient: 'linear-gradient(135deg,#0f1e3d,#0369a1)',
      medecins: [],
      prompt: 'Génère 8 aspects de l\'hospitalisation et observation médicale sous JSON: [{titre, desc}]. Inclure: chambre individuelle, surveillance 24h, soins infirmiers continus, observation courte durée, nutrition clinique, accompagnement famille, sortie médicalisée, soins post-opératoires. Réponds UNIQUEMENT en JSON valide.',
    },
  }

  const config = CONFIGS[slug]

  useEffect(() => {
    if (!config) { setLoading(false); return }
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: config.prompt }],
      }),
    })
      .then(r => r.json())
      .then(data => {
        const text = data.content?.[0]?.text || '[]'
        try {
          const items = JSON.parse(text.replace(/```json|```/g, '').trim())
          setContent({ intro: '', items })
        } catch { setContent({ intro: '', items: [] }) }
      })
      .catch(() => setContent({ intro: '', items: [] }))
      .finally(() => setLoading(false))
  }, [slug])

  if (!config) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Service introuvable</p>
        <Link href="/services" style={{ color: '#1641C8', fontWeight: 700 }}>← Retour aux services</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar variant="public" />
      <div style={{ background: config.gradient, padding: '56px 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link href="/services" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>← Tous les services</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{config.icon}</div>
            <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.4rem)', margin: 0 }}>{config.titre}</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: content?.items.length ? '2fr 1fr' : '1fr', gap: 24 }}>
          {/* Carrousel */}
          <div>
            <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: 16 }}>
              {config.icon} Services & interventions
            </h2>
            {loading ? (
              <div style={{ background: 'white', borderRadius: 18, padding: 40, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${config.couleur}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Chargement des informations...</p>
              </div>
            ) : content?.items.length ? (
              <Carrousel items={content.items} couleur={config.couleur} />
            ) : (
              <div style={{ background: 'white', borderRadius: 18, padding: 28, border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b' }}>Contactez-nous pour plus d'informations sur ce service.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Médecins si présents */}
            {config.medecins?.length > 0 && (
              <div style={{ background: 'white', borderRadius: 16, padding: 18, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 12 }}>Notre spécialiste</h3>
                {config.medecins.map((m: any) => (
                  <div key={m.nom} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${config.couleur}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{m.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{m.nom}</div>
                      <div style={{ color: config.couleur, fontSize: 12, fontWeight: 600 }}>{m.specialite}</div>
                      <div style={{ color: '#94a3b8', fontSize: 11 }}>📞 {m.tel}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bouton spécialistes */}
            <Link href="/specialites" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px', textDecoration: 'none', display: 'block', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>👨‍⚕️</div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>Voir tous nos spécialistes</div>
              <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>30 médecins disponibles</div>
            </Link>

            {/* CTA RDV */}
            <div style={{ background: `linear-gradient(135deg,${config.couleur},#0d9488)`, borderRadius: 14, padding: 18, textAlign: 'center' }}>
              <p style={{ color: 'white', fontWeight: 700, margin: '0 0 12px', fontSize: 14 }}>Prendre rendez-vous</p>
              <Link href="/consultation" style={{ background: 'white', color: config.couleur, textDecoration: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, display: 'inline-block' }}>
                Réserver
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ── Router principal ───────────────────────────────────────────────────────
export default function ServiceDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  if (slug === 'clinique-externe') return <PageCliniqueExterne />
  if (slug === 'laboratoire')      return <PageLaboratoire />
  if (slug === 'pharmacie')        return <PagePharmacie />

  // All others: dentisterie, physiotherapie, optometrie, maternite, salle-sop, gestes-medicaux, hospitalisation
  return <PageServiceGenerique slug={slug} />
}
