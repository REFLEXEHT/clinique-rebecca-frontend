'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLang } from '@/context/LangContext'

const SERVICES = [
  {
    slug:        'clinique-externe',
    image:       '/services/clinique_externe.jpg',
    couleur:     '#1641C8',
    icon:        'fa-stethoscope',
    titreKey:    'svc.cliExt',
    desc:        { fr:'Consultations avec 15 spécialistes — médecine interne, gynécologie, pédiatrie, neurologie et plus.', ht:'Konsiltasyon ak 15 espesyalis — medsin entèn, jinekologi, pediatri, nèwoloji ak plis.', en:'Consultations with 15 specialists — internal medicine, gynecology, pediatrics, neurology and more.' },
  },
  {
    slug:        'laboratoire',
    image:       '/services/laboratoire.avif',
    couleur:     '#16a34a',
    icon:        'fa-flask-vial',
    titreKey:    'svc.labo',
    desc:        { fr:'165 analyses biologiques complètes. Résultats envoyés par WhatsApp sous 24-48h.', ht:'165 analiz byolojik konplè. Rezilta voye pa WhatsApp anba 24-48h.', en:'165 complete biological tests. Results sent via WhatsApp within 24-48h.' },
  },
  {
    slug:        'pharmacie',
    image:       '/services/pharmacie.avif',
    couleur:     '#7c3aed',
    icon:        'fa-pills',
    titreKey:    'svc.pharma',
    desc:        { fr:'Médicaments génériques et de marque disponibles. Commander par téléphone.', ht:'Medikaman jenerik ak mak disponib. Komande pa telefòn.', en:'Generic and branded medications available. Order by phone.' },
  },
  {
    slug:        'dentisterie',
    image:       '/services/dentisterie.jpg',
    couleur:     '#0d9488',
    icon:        'fa-tooth',
    titreKey:    'svc.dent',
    desc:        { fr:'Soins dentaires complets : extraction, prophylaxie, orthodontie, prothèses et plus.', ht:'Swen dan konplè : ekstraksyon, pwofylaksi, òtodontik, pwotèz ak plis.', en:'Complete dental care: extraction, prophylaxis, orthodontics, prosthetics and more.' },
  },
  {
    slug:        'maternite',
    image:       '/services/maternite.jpg',
    couleur:     '#ec4899',
    icon:        'fa-baby',
    titreKey:    'svc.mat',
    desc:        { fr:'Suivi de grossesse, accouchement normal et par césarienne, soins néonataux.', ht:'Swivi gwosès, akouchman nòmal ak sezaryen, swen neyonatal.', en:'Pregnancy monitoring, normal and cesarean delivery, neonatal care.' },
  },
  {
    slug:        'salle-sop',
    image:       '/services/sop.jpg',
    couleur:     '#475569',
    icon:        'fa-scalpel',
    titreKey:    'svc.sop',
    desc:        { fr:'Bloc opératoire équipé pour chirurgies générales, orthopédiques et gynécologiques.', ht:'Blòk operatwa ekipe pou chiriji jeneral, òtopedik ak jinekologik.', en:'Operating room equipped for general, orthopedic and gynecological surgeries.' },
  },
  {
    slug:        'physiotherapie',
    image:       '/services/physiotherapie.png',
    couleur:     '#d97706',
    icon:        'fa-person-walking',
    titreKey:    'svc.physio',
    desc:        { fr:'Rééducation fonctionnelle, traitement des douleurs chroniques et récupération physique.', ht:'Reyabilitasyon fonksyonèl, tretman doulè kronik ak rekiperasyon fizik.', en:'Functional rehabilitation, treatment of chronic pain and physical recovery.' },
  },
  {
    slug:        'optometrie',
    image:       '/services/optometrie.avif',
    couleur:     '#dc2626',
    icon:        'fa-glasses',
    titreKey:    'svc.opto',
    desc:        { fr:'Examen de la vue complet, prescription de lunettes et vente de montures sur place.', ht:'Egzamen je konplè, preskripsyon linèt ak vant monti sou plas.', en:'Complete eye exam, glasses prescription and frames sold on site.' },
  },
  {
    slug:        'gestes-medicaux',
    image:       '/services/gestes_medicaux.jpg',
    couleur:     '#f59e0b',
    icon:        'fa-syringe',
    titreKey:    'svc.gestes',
    desc:        { fr:'Injections, perfusions, pansements, ECG et autres actes médicaux sans rendez-vous.', ht:'Enjesksyon, pèfizyon, panseman, ECG ak lòt zak medikal san randevou.', en:'Injections, infusions, dressings, ECG and other medical procedures without appointment.' },
  },
  {
    slug:        'hospitalisation',
    image:       '/services/hospitalisation.avif',
    couleur:     '#0369a1',
    icon:        'fa-bed-pulse',
    titreKey:    'svc.hospit',
    desc:        { fr:'Chambres individuelles, surveillance 24h/24, soins infirmiers continus.', ht:'Chanm endividyèl, siveyans 24h/24, swen enfimyè kontinyèl.', en:'Individual rooms, 24/7 monitoring, continuous nursing care.' },
  },
]

export default function ServicesPage() {
  const { t, lang } = useLang()
  const router = useRouter()

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <Navbar variant="public" />

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d,#1641C8,#0d9488)', padding:'64px 20px 48px', textAlign:'center' }}>
        <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.8rem,4vw,2.8rem)', margin:'0 0 12px' }}>
          {t('home.nosServices')}
        </h1>
        <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'1.05rem', maxWidth:500, margin:'0 auto' }}>
          {t('home.sousNos')}
        </p>
      </div>

      {/* Grille services */}
      <div style={{ maxWidth:1150, margin:'0 auto', padding:'40px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(330px,1fr))', gap:22 }}>
          {SERVICES.map(s => (
            <Link key={s.slug} href={`/services/${s.slug}`} style={{ textDecoration:'none', display:'block' }}>
              <div style={{
                background:'white', borderRadius:20, overflow:'hidden',
                border:'1px solid #e2e8f0', cursor:'pointer',
                transition:'all 0.25s', boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
                height:'100%'
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(-6px)'
                  el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.13)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                }}>

                {/* Photo cliquable */}
                <div style={{ height:200, overflow:'hidden', position:'relative' }}>
                  <img
                    src={s.image}
                    alt={t(s.titreKey)}
                    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.4s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  {/* Overlay gradient bas */}
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, background:`linear-gradient(to top, ${s.couleur}dd, transparent)` }} />
                  {/* Titre sur la photo */}
                  <div style={{ position:'absolute', bottom:14, left:16, display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <i className={`fa-solid ${s.icon}`} style={{ color:'white', fontSize:15 }} />
                    </div>
                    <span style={{ color:'white', fontWeight:800, fontSize:17, textShadow:'0 1px 4px rgba(0,0,0,0.3)' }}>
                      {t(s.titreKey)}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div style={{ padding:'16px 18px 20px' }}>
                  <p style={{ color:'#64748b', fontSize:14, lineHeight:1.7, margin:'0 0 14px' }}>
                    {s.desc[lang as 'fr'|'ht'|'en'] || s.desc.fr}
                  </p>
                  <div style={{ display:'flex', alignItems:'center', gap:6, color:s.couleur, fontWeight:700, fontSize:13 }}>
                    {lang === 'en' ? 'Learn more' : lang === 'ht' ? 'Aprann plis' : 'En savoir plus'}
                    <i className="fa-solid fa-arrow-right" style={{ fontSize:11 }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
