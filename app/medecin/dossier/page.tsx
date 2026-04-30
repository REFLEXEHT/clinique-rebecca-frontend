'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { FileText, LogOut, ChevronLeft, Printer, Save } from 'lucide-react'

// ─── Types de documents disponibles selon le cas ──────────────────────────
const DOCUMENTS = [
  { id: 'consultation',        label: '1ère Consultation',         icon: '🏥', services: ['clinique','dentiste','optometrie','physio'] },
  { id: 'observation_infirmiere', label: 'Observation Infirmière', icon: '👩‍⚕️', services: ['clinique','hospit'] },
  { id: 'prescription',        label: 'Ordonnance / Prescription', icon: '💊', services: ['clinique','dentiste','optometrie','physio'] },
  { id: 'examen_labo',         label: 'Requête Examen Labo',       icon: '🔬', services: ['clinique'] },
  { id: 'requete_sang',        label: 'Réquisition de Sang',       icon: '🩸', services: ['clinique','hospit'] },
  { id: 'ecg',                 label: 'Compte rendu ECG',          icon: '❤️', services: ['clinique'] },
  { id: 'echographie',         label: 'Compte rendu Échographie',  icon: '🤰', services: ['clinique','maternite'] },
  { id: 'ordonnance_rpm',      label: 'Ordonnance RPM',            icon: '🍼', services: ['maternite'] },
  { id: 'ordonnance_eclampsie',label: 'Ordonnance Éclampsie',      icon: '⚠️', services: ['maternite'] },
  { id: 'ordonnance_postop',   label: 'Ordonnance Post-Op OBGYN',  icon: '🏨', services: ['maternite','sop'] },
  { id: 'consentement',        label: 'Consentement Éclairé',      icon: '✍️', services: ['clinique','sop','dentiste','physio'] },
  { id: 'certificat',          label: 'Certificat Médical',        icon: '📋', services: ['clinique'] },
  { id: 'exeat',               label: "Note d'Exéat (Sortie)",     icon: '🚪', services: ['clinique','hospit','maternite','sop'] },
  { id: 'sortie_contre_avis',  label: 'Sortie Contre Avis Médical', icon: '🚫', services: ['clinique','hospit'] },
  { id: 'etat_compte',         label: 'État de Compte Patient',    icon: '💰', services: ['clinique','hospit','maternite','sop'] },
]

// ─── Formulaire Première Consultation ─────────────────────────────────────
function FormConsultation({ data, onChange }: any) {
  const f = (k: string) => <input value={data[k]||''} onChange={e=>onChange(k,e.target.value)}
    style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}} />
  const ta = (k: string, rows=3) => <textarea value={data[k]||''} onChange={e=>onChange(k,e.target.value)}
    rows={rows} style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,resize:'vertical',boxSizing:'border-box' as const}} />
  const label = (txt: string) => <label style={{display:'block',fontWeight:600,fontSize:12,color:'#374151',marginBottom:4}}>{txt}</label>
  const row = (children: any) => <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>{children}</div>

  return (
    <div>
      <div style={{background:'#1641C8',color:'white',padding:'12px 16px',borderRadius:'10px 10px 0 0',fontWeight:700,fontSize:14,marginBottom:16,textAlign:'center'}}>
        CLINIQUE DE LA REBECCA · #44, Rue Rebecca, Pétion-Ville · (509) 4858-5757
        <div style={{fontWeight:400,fontSize:12,marginTop:4}}>FEUILLE DE PREMIÈRE CONSULTATION</div>
      </div>
      {row(<>
        <div>{label('Nom et Prénom')}{f('nom_prenom')}</div>
        <div>{label('Date de naissance')}{f('date_naissance')}</div>
        <div>{label('Sexe')}<select value={data.sexe||''} onChange={e=>onChange('sexe',e.target.value)} style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13}}><option value="">--</option><option>M</option><option>F</option></select></div>
      </>)}
      {row(<>
        <div>{label('Téléphone')}{f('telephone')}</div>
        <div>{label('Adresse')}{f('adresse')}</div>
        <div>{label('Personne contact')}{f('contact')}</div>
      </>)}
      {row(<>
        <div>{label('Date de visite')}{f('date_visite')}</div>
        <div>{label('Médecin')}{f('medecin')}</div>
        <div>{label('# Dossier')}{f('dossier_id')}</div>
      </>)}
      <div style={{marginBottom:12}}>{label('Motif de consultation')}{f('motif')}</div>
      <div style={{marginBottom:12}}>{label('Antécédents personnels / Allergies')}{ta('antecedents',2)}</div>
      <div style={{marginBottom:12}}>{label('Histoire de la maladie')}{ta('histoire',3)}</div>
      <div style={{marginBottom:12}}>
        {label('Signes vitaux')}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
          {[['TA','ta'],['FC','fc'],['T°','temperature'],['SpO2','spo2'],['Poids','poids']].map(([l,k])=>(
            <div key={k}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:3}}>{l}</label>{f(k)}</div>
          ))}
        </div>
      </div>
      <div style={{marginBottom:12}}>{label('Examen physique')}{ta('examen',4)}</div>
      <div style={{marginBottom:12}}>{label('Diagnostic')}{ta('diagnostic',2)}</div>
      <div style={{marginBottom:12}}>{label('Plan de traitement / Prescription')}{ta('prescription',3)}</div>
      <div style={{marginBottom:12}}>
        {label('Examens paracliniques demandés')}
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
          {['Hémogramme','Glycémie','Créatinine','Échographie','ECG','RX Thorax','HIV','Hépatite B'].map(ex=>(
            <label key={ex} style={{display:'flex',alignItems:'center',gap:4,fontSize:12,cursor:'pointer'}}>
              <input type="checkbox" checked={data[`ex_${ex}`]||false} onChange={e=>onChange(`ex_${ex}`,e.target.checked)} />
              {ex}
            </label>
          ))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>{label('Signature médecin')}<div style={{border:'1px solid #d1d5db',borderRadius:8,height:60,marginTop:4}} /></div>
        <div>{label('Date')}{f('date_signature')}</div>
      </div>
    </div>
  )
}

// ─── Ordonnance générale ───────────────────────────────────────────────────
function FormPrescription({ data, onChange }: any) {
  const f = (k: string, ph='') => <input value={data[k]||''} onChange={e=>onChange(k,e.target.value)} placeholder={ph}
    style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}} />
  const label = (txt: string) => <label style={{display:'block',fontWeight:600,fontSize:12,color:'#374151',marginBottom:4}}>{txt}</label>

  const meds = data.medicaments || ['','','','','']
  return (
    <div>
      <div style={{background:'#1641C8',color:'white',padding:'12px 16px',borderRadius:'10px 10px 0 0',fontWeight:700,fontSize:14,marginBottom:16,textAlign:'center'}}>
        CLINIQUE DE LA REBECCA · ORDONNANCE MÉDICALE
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
        <div>{label('Date')}{f('date','JJ/MM/AAAA')}</div>
        <div>{label('# Dossier')}{f('dossier_id')}</div>
        <div>{label('Heure')}{f('heure','HH:MM')}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
        <div>{label('Nom et Prénom patient')}{f('patient_nom')}</div>
        <div>{label('Âge / Parité')}{f('age_parite')}</div>
      </div>
      <div style={{marginBottom:12}}>{label('Diagnostic')}{f('diagnostic')}</div>
      <div style={{marginBottom:8,fontWeight:600,fontSize:13,color:'#374151'}}>Médicaments prescrits :</div>
      {meds.map((_: any, i: number) => (
        <div key={i} style={{display:'grid',gridTemplateColumns:'3fr 1fr 2fr',gap:8,marginBottom:8}}>
          <input value={data[`med_nom_${i}`]||''} onChange={e=>onChange(`med_nom_${i}`,e.target.value)} placeholder={`Médicament ${i+1}`}
            style={{padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13}} />
          <input value={data[`med_dose_${i}`]||''} onChange={e=>onChange(`med_dose_${i}`,e.target.value)} placeholder="Dose"
            style={{padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13}} />
          <input value={data[`med_duree_${i}`]||''} onChange={e=>onChange(`med_duree_${i}`,e.target.value)} placeholder="Durée / Instructions"
            style={{padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13}} />
        </div>
      ))}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:16}}>
        <div>{label('Nom du médecin')}{f('medecin_nom')}</div>
        <div>{label('Signature')}<div style={{border:'1px solid #d1d5db',borderRadius:8,height:60,marginTop:4}} /></div>
      </div>
    </div>
  )
}

// ─── Requête examen labo ───────────────────────────────────────────────────
function FormExamenLabo({ data, onChange }: any) {
  const EXAMENS = {
    'HÉMATOLOGIE': ['Hémogramme complet','Vitesse sédimentation','Malaria test','Sickling test','Électrophorèse HB','Plaquettes','Réticulocytes','TS','TC','PT/INR','Groupe sanguin','D-Dimères'],
    'SÉROLOGIE': ['RA-LATEX','VDRL-RPR','Widal O/H','Élisa HIV1,2','CRP','Monotest','ASO','H.Pylori sang/selles','BHCG','PSA','Facteur Rhumatoïde'],
    'BIOCHIMIE': ['Glycémie','Urée','Créatinine','Cholestérol','HDL','LDL','VLDL','Triglycérides','SGOT','SGPT','Gamma GT','Bilirubine','Albumine','TSH','T3','T4'],
    'URINE': ['Aspect/Densité/PH','Albumine','Glucose','Acétone','Nitrite','Leucocytes','Hématies','Bactéries'],
    'BACTÉRIOLOGIE': ['Goutte pendante','Frottis Vaginal','Frottis Urétral','Crachats série','Culture selles','Culture urine','Culture pus'],
    'TORCH': ['Toxoplasmose IgM/IgG','Rubéole IgM/IgG','CMV IgM/IgG','Herpès I IgM/IgG','Herpès II IgM/IgG'],
  }
  const f = (k: string, ph='') => <input value={data[k]||''} onChange={e=>onChange(k,e.target.value)} placeholder={ph}
    style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:12,boxSizing:'border-box' as const}} />
  return (
    <div>
      <div style={{background:'#16a34a',color:'white',padding:'12px 16px',borderRadius:'10px 10px 0 0',fontWeight:700,fontSize:14,marginBottom:16,textAlign:'center'}}>
        CLINIQUE DE LA REBECCA · EXAMEN DE LABORATOIRE
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
        <div><label style={{fontSize:11,fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Nom patient</label>{f('patient_nom')}</div>
        <div><label style={{fontSize:11,fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Âge</label>{f('age')}</div>
        <div><label style={{fontSize:11,fontWeight:600,color:'#374151',display:'block',marginBottom:3}}># Dossier</label>{f('dossier_id')}</div>
      </div>
      {Object.entries(EXAMENS).map(([cat, items]) => (
        <div key={cat} style={{marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:12,color:'#16a34a',marginBottom:6,textTransform:'uppercase'}}>{cat}</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {items.map(ex => (
              <label key={ex} style={{display:'flex',alignItems:'center',gap:4,fontSize:12,cursor:'pointer',minWidth:160}}>
                <input type="checkbox" checked={data[`labo_${ex}`]||false} onChange={e=>onChange(`labo_${ex}`,e.target.checked)} />
                {ex}
              </label>
            ))}
          </div>
        </div>
      ))}
      <div style={{marginTop:12}}>
        <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>Autres examens</label>
        <input value={data.autres||''} onChange={e=>onChange('autres',e.target.value)}
          style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:12,boxSizing:'border-box' as const}} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
        <div><label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>Médecin</label>{f('medecin_nom')}</div>
        <div><label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>Signature</label><div style={{border:'1px solid #d1d5db',borderRadius:8,height:50}} /></div>
      </div>
    </div>
  )
}

// ─── Consentement éclairé ─────────────────────────────────────────────────
function FormConsentement({ data, onChange }: any) {
  const f = (k: string, ph='') => <input value={data[k]||''} onChange={e=>onChange(k,e.target.value)} placeholder={ph}
    style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}} />
  return (
    <div>
      <div style={{background:'#64748b',color:'white',padding:'12px 16px',borderRadius:'10px 10px 0 0',fontWeight:700,fontSize:14,marginBottom:16,textAlign:'center'}}>
        CLINIQUE DE LA REBECCA · CONSENTEMENT ÉCLAIRÉ CHIRURGICAL
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
        <div><label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Nom et Prénom</label>{f('patient_nom')}</div>
        <div><label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Sexe</label>{f('sexe')}</div>
        <div><label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Âge</label>{f('age')}</div>
      </div>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Intervention chirurgicale</label>{f('intervention')}
      </div>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Chirurgien</label>{f('chirurgien')}
      </div>
      <div style={{background:'#f8fafc',borderRadius:10,padding:16,fontSize:12,color:'#475569',lineHeight:1.7,marginBottom:16}}>
        <p>Je soussigné(e) <strong>{data.patient_nom || '_______________'}</strong> autorise le Dr <strong>{data.chirurgien || '_______________'}</strong> à me pratiquer l'intervention indiquée.</p>
        <p>J'atteste avoir été informé(e) de la nature, des bénéfices, risques et alternatives à l'intervention. J'ai eu la possibilité de poser des questions.</p>
        <p>Je consens à l'anesthésie jugée nécessaire et à toute procédure additionnelle que le chirurgien peut considérer nécessaire.</p>
        <p>Je consens à la transfusion de sang ou dérivés si jugé nécessaire.</p>
        <p>Je comprends qu'aucune garantie ne peut m'être faite concernant le résultat attendu.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:12}}>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>Signature du patient</label>
          <div style={{border:'1px solid #d1d5db',borderRadius:8,height:70}} />
          <div style={{fontSize:11,color:'#64748b',marginTop:4}}>Date : {f('date_patient')}</div>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>Signature du représentant légal</label>
          <div style={{border:'1px solid #d1d5db',borderRadius:8,height:70}} />
        </div>
      </div>
      <div style={{background:'#fffbeb',borderRadius:10,padding:12,fontSize:12}}>
        <div style={{fontWeight:700,color:'#374151',marginBottom:8}}>Médecin — Je certifie avoir expliqué :</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <div><label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Nom médecin</label>{f('medecin_nom')}</div>
          <div><label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:3}}>Signature</label><div style={{border:'1px solid #d1d5db',borderRadius:8,height:50}} /></div>
        </div>
      </div>
    </div>
  )
}

// ─── Note d'exéat ─────────────────────────────────────────────────────────
function FormExeat({ data, onChange }: any) {
  const f = (k: string, ph='') => <input value={data[k]||''} onChange={e=>onChange(k,e.target.value)} placeholder={ph}
    style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}} />
  const ta = (k: string, rows=3) => <textarea value={data[k]||''} onChange={e=>onChange(k,e.target.value)} rows={rows}
    style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,resize:'vertical',boxSizing:'border-box' as const}} />
  return (
    <div>
      <div style={{background:'#0369a1',color:'white',padding:'12px 16px',borderRadius:'10px 10px 0 0',fontWeight:700,fontSize:14,marginBottom:16,textAlign:'center'}}>
        CLINIQUE DE LA REBECCA · NOTE D'EXÉAT
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Nom et Prénom</label>{f('patient_nom')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Âge / Sexe</label>{f('age_sexe')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Chambre / # Dossier</label>{f('chambre_dossier')}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Date / Heure sortie</label>{f('date_heure')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Nb jours hospitalisation</label>{f('nb_jours')}</div>
      </div>
      <div style={{marginBottom:10}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Motifs d'admission</label>{ta('motif_admission',2)}</div>
      <div style={{marginBottom:10}}>
        <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Signes vitaux à la sortie</label>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
          {[['FC','sv_fc'],['TA','sv_ta'],['T°','sv_temp'],['SaO2','sv_spo2'],['Poids','sv_poids']].map(([l,k])=>(
            <div key={k}><label style={{fontSize:10,color:'#64748b',display:'block',marginBottom:2}}>{l}</label>
            <input value={data[k]||''} onChange={e=>onChange(k,e.target.value)} style={{width:'100%',padding:'6px',borderRadius:6,border:'1px solid #d1d5db',fontSize:12,boxSizing:'border-box' as const}} /></div>
          ))}
        </div>
      </div>
      <div style={{marginBottom:10}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Examen physique (trouvailles anormales)</label>{ta('examen',3)}</div>
      <div style={{marginBottom:10}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Paraclinique / Résultats</label>{ta('paraclinique',2)}</div>
      <div style={{marginBottom:10}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Diagnostic final</label>{f('diagnostic')}</div>
      <div style={{marginBottom:10}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Médicaments prescrits + conseils</label>{ta('prescriptions',3)}</div>
      <div style={{marginBottom:10}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Rendez-vous</label>{f('rdv')}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Nom du médecin</label>{f('medecin_nom')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Signature</label><div style={{border:'1px solid #d1d5db',borderRadius:8,height:60}} /></div>
      </div>
    </div>
  )
}

// ─── Certificat médical ───────────────────────────────────────────────────
function FormCertificat({ data, onChange }: any) {
  const f = (k: string, ph='') => <input value={data[k]||''} onChange={e=>onChange(k,e.target.value)} placeholder={ph}
    style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}} />
  const ta = (k: string, rows=3) => <textarea value={data[k]||''} onChange={e=>onChange(k,e.target.value)} rows={rows}
    style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,resize:'vertical',boxSizing:'border-box' as const}} />
  return (
    <div>
      <div style={{background:'#374151',color:'white',padding:'12px 16px',borderRadius:'10px 10px 0 0',fontWeight:700,fontSize:14,marginBottom:16,textAlign:'center'}}>
        CLINIQUE DE LA REBECCA · CERTIFICAT MÉDICAL
      </div>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Médecin signataire (Dr)</label>{f('medecin_nom')}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Patient (M. / Mme)</label>{f('patient_nom')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Âge</label>{f('age')}</div>
      </div>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Date de consultation / hospitalisation</label>{f('date_consultation')}
      </div>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Symptômes présentés</label>{ta('symptomes',2)}
      </div>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Les examens cliniques et paracliniques ont révélé</label>{ta('examens_revelent',3)}
      </div>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Impression clinique retenue</label>{ta('impression',2)}
      </div>
      <div style={{background:'#f8fafc',borderRadius:10,padding:12,fontSize:12,color:'#475569',marginBottom:12,lineHeight:1.7}}>
        En foi de quoi, ce certificat lui est délivré pour servir et valoir ce que de droit.
        <div style={{marginTop:8}}>Fait à Pétion-Ville le <strong>{data.date_signature||'_______________'}</strong></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Date</label>{f('date_signature','JJ/MM/AAAA')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Signature du médecin</label><div style={{border:'1px solid #d1d5db',borderRadius:8,height:70}} /></div>
      </div>
    </div>
  )
}

// ─── Sortie contre avis médical ───────────────────────────────────────────
function FormSortieContreAvis({ data, onChange }: any) {
  const f = (k: string, ph='') => <input value={data[k]||''} onChange={e=>onChange(k,e.target.value)} placeholder={ph}
    style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}} />
  return (
    <div>
      <div style={{background:'#dc2626',color:'white',padding:'12px 16px',borderRadius:'10px 10px 0 0',fontWeight:700,fontSize:14,marginBottom:16,textAlign:'center'}}>
        CLINIQUE DE LA REBECCA · ATTESTATION DE SORTIE CONTRE AVIS MÉDICAL
        <div style={{fontSize:10,fontWeight:400,marginTop:4}}>★ À conserver dans le dossier médical ★</div>
      </div>
      <div style={{background:'#fef2f2',borderRadius:10,padding:16,marginBottom:16,fontSize:13}}>
        <div style={{fontWeight:700,color:'#374151',marginBottom:10}}>PARTIE A REMPLIR PAR LE PRATICIEN</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
          <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Dr (Nom & Prénom)</label>{f('medecin_nom')}</div>
          <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Qualité</label>{f('qualite')}</div>
        </div>
        <div style={{marginBottom:10}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Patient (M. / Mme)</label>{f('patient_nom_praticien')}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Date de sortie</label>{f('date_sortie_p')}</div>
          <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Heure</label>{f('heure_sortie_p')}</div>
        </div>
        <div style={{fontSize:12,color:'#64748b',marginTop:10,lineHeight:1.6}}>
          J'ai personnellement informé le patient des risques médicaux encourus et des alternatives. En conséquence, ni ma responsabilité civile et pénale ni celle de l'établissement ne pourra être engagée.
        </div>
        <div style={{marginTop:10}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Signature du médecin</label><div style={{border:'1px solid #d1d5db',borderRadius:8,height:60}} /></div>
      </div>
      <div style={{background:'#fff7ed',borderRadius:10,padding:16,fontSize:13}}>
        <div style={{fontWeight:700,color:'#374151',marginBottom:10}}>PARTIE A REMPLIR PAR LE PATIENT</div>
        <div style={{marginBottom:10}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Je soussigné(e)</label>{f('patient_nom_patient')}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
          <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Date de sortie</label>{f('date_sortie_pat')}</div>
          <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Heure</label>{f('heure_sortie_pat')}</div>
        </div>
        <div style={{fontSize:12,color:'#64748b',lineHeight:1.6}}>
          Je reconnais avoir été informé(e) des risques médicaux. Cette décision est prise selon ma propre volonté. Je maintiens néanmoins ma décision.
        </div>
        <div style={{marginTop:10}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Signature du patient</label><div style={{border:'1px solid #d1d5db',borderRadius:8,height:60}} /></div>
      </div>
    </div>
  )
}

// ─── ECG ──────────────────────────────────────────────────────────────────
function FormECG({ data, onChange }: any) {
  const f = (k: string, ph='') => <input value={data[k]||''} onChange={e=>onChange(k,e.target.value)} placeholder={ph}
    style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}} />
  const ta = (k: string, rows=2) => <textarea value={data[k]||''} onChange={e=>onChange(k,e.target.value)} rows={rows}
    style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,resize:'vertical',boxSizing:'border-box' as const}} />
  return (
    <div>
      <div style={{background:'#dc2626',color:'white',padding:'12px 16px',borderRadius:'10px 10px 0 0',fontWeight:700,fontSize:14,marginBottom:16,textAlign:'center'}}>
        CLINIQUE DE LA REBECCA · COMPTE RENDU ÉLECTROCARDIOGRAMME
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Date</label>{f('date')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Nom</label>{f('nom')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Prénom</label>{f('prenom')}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Âge</label>{f('age')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Sexe</label>{f('sexe')}</div>
      </div>
      <div style={{marginBottom:10}}>
        <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:4}}>Antécédents personnels</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
          {['HTA','Diabète','Dyslipidémie','Pathologie rénale chronique','Autres'].map(a=>(
            <label key={a} style={{display:'flex',alignItems:'center',gap:4,fontSize:12,cursor:'pointer'}}>
              <input type="checkbox" checked={data[`atcd_${a}`]||false} onChange={e=>onChange(`atcd_${a}`,e.target.checked)} /> {a}
            </label>
          ))}
        </div>
      </div>
      <div style={{marginBottom:10}}>
        <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:4}}>Habitudes</label>
        <div style={{display:'flex',gap:12}}>
          {['Tabac','Alcool','Drogue'].map(h=>(
            <label key={h} style={{display:'flex',alignItems:'center',gap:4,fontSize:12,cursor:'pointer'}}>
              <input type="checkbox" checked={data[`hab_${h}`]||false} onChange={e=>onChange(`hab_${h}`,e.target.checked)} /> {h}
            </label>
          ))}
        </div>
      </div>
      <div style={{marginBottom:10}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Histoire clinique</label>{ta('histoire',3)}</div>
      <div style={{background:'#fef2f2',borderRadius:10,padding:14,marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:10}}>Résultat du tracé ECG</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:8}}>
          <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Rythme / Fréquence</label>{f('rythme_freq')}</div>
          <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>PR</label>{f('pr')}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:8}}>
          <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Axe QRS</label>{f('axe_qrs')}</div>
          <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Durée QRS</label>{f('duree_qrs')}</div>
        </div>
        <div style={{marginBottom:8}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Morphologie QRS</label>{f('morphologie_qrs')}</div>
        <div style={{marginBottom:8}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Repolarisation (ST/T)</label>{ta('repolarisation',2)}</div>
        <div style={{marginBottom:8}}><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Conclusion / Interprétation</label>{ta('conclusion',3)}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Médecin</label>{f('medecin_nom')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Signature</label><div style={{border:'1px solid #d1d5db',borderRadius:8,height:60}} /></div>
      </div>
    </div>
  )
}

// ─── Réquisition sang ─────────────────────────────────────────────────────
function FormRequisitionSang({ data, onChange }: any) {
  const f = (k: string, ph='') => <input value={data[k]||''} onChange={e=>onChange(k,e.target.value)} placeholder={ph}
    style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #d1d5db',fontSize:13,boxSizing:'border-box' as const}} />
  return (
    <div>
      <div style={{background:'#dc2626',color:'white',padding:'12px 16px',borderRadius:'10px 10px 0 0',fontWeight:700,fontSize:14,marginBottom:16,textAlign:'center'}}>
        CLINIQUE DE LA REBECCA · FICHE DE RÉQUISITION DE SANG
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10,marginBottom:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Nom & Prénom</label>{f('nom_prenom')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Âge</label>{f('age')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Sexe</label>{f('sexe')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Date</label>{f('date')}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Groupe Sanguin</label>{f('groupe_sanguin')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Diagnostic</label>{f('diagnostic')}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>HB / HT</label>{f('hb_ht')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Motif de la demande</label>{f('motif')}</div>
      </div>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6}}>Type de produit sanguin</label>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {['Concentrés globulaires','Plasma frais congelé','Concentrés plaquettaires','Concentré de granulocytes','Cryoprécipité','Sang total'].map(p=>(
            <label key={p} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,cursor:'pointer'}}>
              <input type="checkbox" checked={data[`produit_${p}`]||false} onChange={e=>onChange(`produit_${p}`,e.target.checked)} /> {p}
            </label>
          ))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Médecin (Nom & Prénom)</label>{f('medecin_nom')}</div>
        <div><label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:3}}>Signature</label><div style={{border:'1px solid #d1d5db',borderRadius:8,height:60}} /></div>
      </div>
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────
const FORM_COMPONENTS: Record<string, any> = {
  consultation: FormConsultation,
  prescription: FormPrescription,
  examen_labo: FormExamenLabo,
  consentement: FormConsentement,
  exeat: FormExeat,
  certificat: FormCertificat,
  sortie_contre_avis: FormSortieContreAvis,
  ecg: FormECG,
  requete_sang: FormRequisitionSang,
}

export default function MedecinDossierPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [serviceActuel, setServiceActuel] = useState('clinique')
  const [docSelec, setDocSelec] = useState('consultation')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'medecin')) router.push('/login')
  }, [isAuthenticated, user, loading, router])

  const services = [
    {v:'clinique',l:'Clinique externe'},{v:'maternite',l:'Maternité'},
    {v:'hospit',l:'Hospitalisation'},{v:'sop',l:'Salle SOP'},
    {v:'dentiste',l:'Dentisterie'},{v:'optometrie',l:'Optométrie'},
    {v:'physio',l:'Physiothérapie'},
  ]

  const docsDispos = DOCUMENTS.filter(d => d.services.includes(serviceActuel))

  const onChange = (k: string, v: any) => setFormData(prev => ({...prev, [k]: v}))

  const sauvegarder = async () => {
    setSaving(true)
    try {
      await api.post('/labo/analyses', { ...formData, type_examen: docSelec, patient_nom: formData.patient_nom || formData.nom_prenom })
      toast.success('Formulaire sauvegardé ✓')
    } catch { toast.error('Erreur lors de la sauvegarde') }
    finally { setSaving(false) }
  }

  const imprimer = () => window.print()

  const FormComponent = FORM_COMPONENTS[docSelec]

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><p>Chargement...</p></div>

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      {/* Navbar */}
      <div style={{background:'linear-gradient(135deg,#0f1e3d,#1641C8)',height:56,display:'flex',alignItems:'center',padding:'0 20px',gap:12,flexShrink:0}}>
        <Link href="/medecin/dashboard" style={{color:'rgba(255,255,255,0.7)',textDecoration:'none',display:'flex',alignItems:'center',gap:6,fontSize:13}}>
          <ChevronLeft size={14} /> Dashboard
        </Link>
        <span style={{color:'rgba(255,255,255,0.4)'}}>|</span>
        <span style={{color:'white',fontWeight:700,fontSize:14}}>Formulaires Médicaux</span>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <button onClick={imprimer} style={{background:'rgba(255,255,255,0.15)',color:'white',border:'none',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}>
            <Printer size={13} /> Imprimer
          </button>
          <button onClick={sauvegarder} disabled={saving} style={{background:'#0d9488',color:'white',border:'none',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}>
            <Save size={13} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button onClick={() => {logout();router.push('/')}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </div>

      <div style={{display:'flex',height:'calc(100vh - 56px)'}}>
        {/* Sidebar */}
        <div style={{width:260,background:'white',borderRight:'1px solid #e2e8f0',overflowY:'auto',flexShrink:0}}>
          {/* Service */}
          <div style={{padding:'16px 14px 8px'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Service</div>
            {services.map(s => (
              <button key={s.v} onClick={() => {setServiceActuel(s.v); setDocSelec(docsDispos[0]?.id || 'consultation')}} style={{
                width:'100%', textAlign:'left', padding:'8px 12px', borderRadius:8, border:'none',
                background: serviceActuel===s.v ? '#eff6ff' : 'transparent',
                color: serviceActuel===s.v ? '#1641C8' : '#374151',
                fontWeight: serviceActuel===s.v ? 700 : 400, cursor:'pointer', fontSize:13, marginBottom:2
              }}>{s.l}</button>
            ))}
          </div>

          {/* Documents */}
          <div style={{padding:'16px 14px 8px', borderTop:'1px solid #f1f5f9'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>
              Documents disponibles
            </div>
            {docsDispos.map(d => (
              <button key={d.id} onClick={() => {setDocSelec(d.id); setFormData({})}} style={{
                width:'100%', textAlign:'left', padding:'10px 12px', borderRadius:8, border:'none',
                background: docSelec===d.id ? '#1641C8' : 'transparent',
                color: docSelec===d.id ? 'white' : '#374151',
                fontWeight: docSelec===d.id ? 700 : 400, cursor:'pointer', fontSize:13, marginBottom:3,
                display:'flex', alignItems:'center', gap:8
              }}>
                <span style={{fontSize:16}}>{d.icon}</span> {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu formulaire */}
        <div style={{flex:1, overflowY:'auto', padding:24}}>
          <div style={{maxWidth:800, margin:'0 auto'}}>
            {FormComponent ? (
              <div style={{background:'white', borderRadius:16, border:'1px solid #e2e8f0', padding:24}}>
                <FormComponent data={formData} onChange={onChange} />
              </div>
            ) : (
              <div style={{background:'white', borderRadius:16, border:'1px solid #e2e8f0', padding:48, textAlign:'center'}}>
                <FileText size={40} color="#94a3b8" style={{marginBottom:12}} />
                <p style={{color:'#64748b'}}>Ce formulaire est en cours d'implémentation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

