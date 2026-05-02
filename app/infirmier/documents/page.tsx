'use client'
import { useState } from 'react'
import SignaturePad from '@/components/ui/SignaturePad'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { DOCUMENTS, getDocsForContext, getServiceGroup } from '@/lib/documents'
import { MEDECINS } from '@/lib/medecins'
import toast from 'react-hot-toast'
import { Search, Printer, Eye, Lock } from 'lucide-react'
import Link from 'next/link'

// ── Entête clinique ────────────────────────────────────────────────────────
function EnteteClinique({ titre, couleur = '#1641C8' }: { titre: string; couleur?: string }) {
  return (
    <div style={{ textAlign: 'center', borderBottom: `2px solid ${couleur}`, paddingBottom: 14, marginBottom: 20 }}>
      <div style={{ fontWeight: 900, fontSize: 15, color: '#1641C8' }}>CLINIQUE DE LA REBECCA</div>
      <div style={{ fontSize: 12, color: '#64748b' }}>#44, Rue Rebecca, Pétion-Ville · (509) 4858-5757</div>
      <div style={{ fontWeight: 800, fontSize: 14, marginTop: 8, color: couleur, textTransform: 'uppercase' }}>{titre}</div>
    </div>
  )
}

function ligne(label: string, valeur?: string) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 13 }}>
      <strong style={{ minWidth: 140, flexShrink: 0 }}>{label} :</strong>
      <div style={{ flex: 1, borderBottom: '1px solid #d1d5db', paddingBottom: 2, minWidth: 120 }}>
        {valeur || ''}
      </div>
    </div>
  )
}

function ligneVide(height = 24) {
  return <div style={{ borderBottom: '1px solid #d1d5db', marginBottom: 10, height }} />
}

// ── Modal impression ───────────────────────────────────────────────────────
function PrintModal({ title, couleur, onClose, children }: any) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 18, width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => window.print()} style={{ background: '#1641C8', color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Printer size={13} /> Imprimer
            </button>
            <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontWeight: 600, color: '#374151', fontSize: 13 }}>Fermer</button>
          </div>
        </div>
        <div style={{ padding: 28 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Rendus des documents ────────────────────────────────────────────────────
function renderDocument(type: string, data: any, user: any, onClose: () => void) {
  const couleur = DOCUMENTS.find(d => d.type === type)?.couleur || '#1641C8'

  const baseInfo = (
    <>
      {ligne('Patient', data?.patient_nom)}
      {ligne('# Dossier', data?.patient_numero)}
      {ligne('Date', new Date().toLocaleDateString('fr-FR'))}
    </>
  )

  // Signature médecin — utilise la signature sauvegardée si disponible, sinon pad
  const sigMedecin = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
      <div>
        {signatures['medecin_saved'] ? (
          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Signature du médecin</div>
            <img src={signatures['medecin_saved']} alt="Signature" style={{ height: 70, border: '1px solid #e2e8f0', borderRadius: 8, background: 'white' }}/>
          </div>
        ) : (
          <SignaturePad label="Signature du médecin" onSign={(d) => setSignatures(s => ({...s, doc_medecin: d}))} width={220} height={110} />
        )}
      </div>
      <div>
        <div style={{ fontSize: 12, marginBottom: 36 }}>Cachet clinique</div>
        <div style={{ borderBottom: '1px solid #374151', width: 120 }} />
      </div>
    </div>
  )

  const docs: Record<string, JSX.Element> = {

    premiere_consultation: (
      <PrintModal title="Feuille de 1ère Consultation" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Feuille de Première Consultation" couleur={couleur} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
          {ligne('Nom et Prénom')} {ligne('Âge')} {ligne('Sexe')}
        </div>
        {ligne('Adresse')} {ligne('Téléphone')} {ligne('Contact urgence')}
        <div style={{ marginTop: 10, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Motif de consultation</div>
        {ligneVide(40)}
        <div style={{ marginTop: 10, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Antécédents personnels / familiaux</div>
        {ligneVide(40)}
        <div style={{ marginTop: 10, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Signes vitaux</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 10 }}>
          {['FC', 'TA', 'T°', 'SaO2', 'Poids'].map(v => ligne(v))}
        </div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Examen physique (trouvailles anormales)</div>
        {ligneVide(60)}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Paraclinique (résultats anormaux)</div>
        {ligneVide(40)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Diagnostic</div>{ligneVide(36)}</div>
          <div><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Médicaments prescrits</div>{ligneVide(36)}</div>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, marginTop: 10 }}>
          <span>Disposition :</span>
          {['À la maison', 'Observation', 'Hospitalisation'].map(d => (
            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" readOnly /> {d}
            </label>
          ))}
        </div>
        {ligne('Rendez-vous de suivi')}
        {ligne('Médecin (Nom & Prénom)', user?.nom)}
        {sigMedecin}
      </PrintModal>
    ),

    rdv_suivi: (
      <PrintModal title="Feuille RDV de Suivi" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Feuille de Rendez-vous de Suivi" couleur={couleur} />
        {baseInfo}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 12 }}>Nouvelle plainte / Évolution</div>
        {ligneVide(40)}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Signes vitaux</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 10 }}>
          {['FC', 'TA', 'T°', 'SaO2', 'Poids'].map(v => ligne(v))}
        </div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Examen physique</div>
        {ligneVide(50)}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Paraclinique</div>
        {ligneVide(40)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Diagnostic</div>{ligneVide(36)}</div>
          <div><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Médicaments prescrits</div>{ligneVide(36)}</div>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, marginTop: 10 }}>
          <span>Disposition :</span>
          {['À la maison', 'Observation', 'Hospitalisation'].map(d => (
            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" readOnly /> {d}
            </label>
          ))}
        </div>
        {ligne('Prochain RDV')} {ligne('Médecin', user?.nom)}
        {sigMedecin}
      </PrintModal>
    ),

    prescription: (
      <PrintModal title="Ordonnance / Prescription" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Ordonnance Médicale" couleur={couleur} />
        {baseInfo}
        {ligne('Médecin', user?.nom)} {ligne('Spécialité')}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 12 }}>Médicaments prescrits</div>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, marginBottom: 8, fontSize: 12 }}>
            <div style={{ borderBottom: '1px solid #d1d5db' }}></div>
            <div style={{ borderBottom: '1px solid #d1d5db', textAlign: 'center', color: '#94a3b8' }}>Posologie</div>
            <div style={{ borderBottom: '1px solid #d1d5db', textAlign: 'center', color: '#94a3b8' }}>Durée</div>
            <div style={{ borderBottom: '1px solid #d1d5db', textAlign: 'center', color: '#94a3b8' }}>Qté</div>
          </div>
        ))}
        <div style={{ marginTop: 12 }}>{ligne('Recommandations')}</div>
        {sigMedecin}
      </PrintModal>
    ),

    demande_labo: (
      <PrintModal title="Demande d'Examen Laboratoire" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Demande d'Examen de Laboratoire" couleur={couleur} />
        {baseInfo} {ligne('Médecin prescripteur', user?.nom)}
        <div style={{ marginTop: 14, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Examens demandés</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
          {['Hémogramme (NFS)', 'Glycémie', 'HbA1C', 'Créatinine/Urée', 'SGOT/SGPT', 'TSH',
            'HIV', 'Hépatite B', 'Hépatite C', 'VDRL/RPR', 'Widal', 'CRP',
            'Groupe sanguin', 'βHCG', 'Bilan lipidique', 'Malaria (GE/TDR)', 'TORCH', 'Autre:'
          ].map(ex => (
            <label key={ex} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
              <input type="checkbox" readOnly /> {ex}
            </label>
          ))}
        </div>
        {ligne('Autre(s) examen(s)')}
        {ligne('Renseignements cliniques / Urgence')}
        {sigMedecin}
      </PrintModal>
    ),

    certificat: (
      <PrintModal title="Certificat Médical" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Certificat Médical" couleur={couleur} />
        <div style={{ fontSize: 13, lineHeight: 2.2 }}>
          <div>Je soussigné(e) Dr <span style={{ borderBottom: '1px solid #374151', display: 'inline-block', width: 200 }} /></div>
          <div>certifie que M./Mme <strong>{data?.patient_nom || '_______________'}</strong> — #{data?.patient_numero || '___'}</div>
          <div>âgé(e) de <span style={{ borderBottom: '1px solid #374151', display: 'inline-block', width: 60 }} /> ans, a été examiné(e) et/ou hospitalisé(e)</div>
          <div>à la Clinique De La Rebecca le <span style={{ borderBottom: '1px solid #374151', display: 'inline-block', width: 100 }} /></div>
          <div style={{ marginTop: 10 }}>pour les symptômes suivants :</div>
          {ligneVide(36)}
          <div style={{ marginTop: 6 }}>Les examens cliniques et paracliniques ont révélé :</div>
          {ligneVide(60)}
          <div style={{ marginTop: 6 }}>Impression clinique retenue :</div>
          {ligneVide(36)}
        </div>
        <div style={{ fontSize: 13, marginTop: 12 }}>En foi de quoi, ce certificat lui est délivré pour servir et valoir ce que de droit.</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <SignaturePad label='Signature du médecin' onSign={(d) => setSignatures(s => ({...s, cert_medecin: d}))} width={240} height={110} />
        </div>
      </PrintModal>
    ),

    ecg: (
      <PrintModal title="Compte Rendu ECG" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Compte Rendu de l'Électrocardiogramme" couleur={couleur} />
        {baseInfo}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ligne('Nom')} {ligne('Prénom')} {ligne('Âge')} {ligne('Sexe')}
        </div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 10 }}>Antécédents</div>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          {['HTA', 'Diabète', 'Dyslipidémie', 'Pathologie rénale', 'Tabac', 'Alcool', 'Autres'].map(a => (
            <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" readOnly /> {a}
            </label>
          ))}
        </div>
        {ligne('Histoire clinique')} {ligneVide(40)}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 10 }}>Résultat du tracé ECG</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ligne('Rythme / Fréquence')} {ligne('PR')}
          {ligne('Axe QRS')} {ligne('Durée QRS')}
          {ligne('Morphologie QRS')} {ligne('ST / T')}
        </div>
        {ligne('Conclusion')} {ligneVide(36)}
        {sigMedecin}
      </PrintModal>
    ),

    echographie: (
      <PrintModal title="Compte Rendu Échographie" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Compte Rendu Échographique" couleur={couleur} />
        {baseInfo} {ligne('Médecin', user?.nom)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ligne('Type d\'échographie')} {ligne('Indication')}
        </div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 10 }}>Description / Résultats</div>
        {ligneVide(80)} {ligneVide(40)}
        {ligne('Conclusion')} {ligneVide(40)}
        {sigMedecin}
      </PrintModal>
    ),

    radiologie: (
      <PrintModal title="Interprétation Radiologie" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Rapport d'Interprétation Radiologique" couleur={couleur} />
        {baseInfo} {ligne('Médecin prescripteur')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ligne('Type d\'examen')} {ligne('Région anatomique')}
        </div>
        {ligne('Indication clinique')}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 10 }}>Description / Résultats</div>
        {ligneVide(80)} {ligneVide(40)}
        {ligne('Conclusion')} {ligneVide(36)}
        {sigMedecin}
      </PrintModal>
    ),

    feuille_blanche: (
      <PrintModal title="Note Libre" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Note Médicale" couleur={couleur} />
        {baseInfo}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 12 }}>Notes</div>
        {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} style={{ borderBottom: '1px solid #e2e8f0', marginBottom: 18 }} />)}
        {sigMedecin}
      </PrintModal>
    ),

    obs_infirmiere: (
      <PrintModal title="Feuille d'Observation Infirmière" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Feuille d'Observation de l'Infirmière" couleur={couleur} />
        {baseInfo}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, fontSize: 12, marginTop: 10 }}>
          {['Date', 'FC', 'TA', 'T°', 'SaO2', 'Poids', 'Diurèse', 'Observations'].map(h => (
            <div key={h} style={{ fontWeight: 700, borderBottom: '1px solid #1641C8', paddingBottom: 4 }}>{h}</div>
          ))}
        </div>
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 8 }}>
            {[1,2,3,4,5,6,7,8].map(j => <div key={j} style={{ borderBottom: '1px solid #e2e8f0', height: 20 }} />)}
          </div>
        ))}
        {sigMedecin}
      </PrintModal>
    ),

    controle_infirmiere: (
      <PrintModal title="Feuille de Contrôle Infirmière" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Feuille de Contrôle Infirmière" couleur={couleur} />
        {baseInfo}
        {ligne('Médecin traitant')}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 10 }}>Médicaments et soins administrés</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
          {['Médicament / Soin', 'Dose', 'Voie', 'Heure'].map(h => <div key={h} style={{ borderBottom: '1px solid #1641C8', paddingBottom: 4 }}>{h}</div>)}
        </div>
        {[1,2,3,4,5,6,7,8,9,10].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            {[1,2,3,4].map(j => <div key={j} style={{ borderBottom: '1px solid #e2e8f0', height: 20 }} />)}
          </div>
        ))}
        <div style={{ fontSize: 12, marginTop: 8 }}>{ligne('Signature infirmière')}</div>
      </PrintModal>
    ),

    consentement_eclaire: (
      <PrintModal title="Consentement Éclairé" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Formulaire de Consentement Éclairé" couleur={couleur} />
        {baseInfo}
        <div style={{ fontSize: 13, lineHeight: 1.8, marginTop: 12 }}>
          <p>Je soussigné(e) <strong>{data?.patient_nom || '_______________'}</strong>, ayant été pleinement informé(e) par le Dr <span style={{ borderBottom: '1px solid #374151', display: 'inline-block', width: 160 }} /> des risques, bénéfices et alternatives au geste/intervention ci-dessous, donne mon consentement libre et éclairé.</p>
        </div>
        {ligne('Acte / Intervention')} {ligneVide(36)}
        {ligne('Risques expliqués')} {ligneVide(50)}
        {ligne('Questions du patient / Réponses')} {ligneVide(36)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
          <div><div style={{ fontSize: 12, marginBottom: 36 }}>Signature du patient</div><div style={{ borderBottom: '1px solid #374151', width: 140 }} /></div>
          <div><div style={{ fontSize: 12, marginBottom: 36 }}>Signature du médecin</div><div style={{ borderBottom: '1px solid #374151', width: 140 }} /></div>
        </div>
      </PrintModal>
    ),

    exeat: (
      <PrintModal title="Note d'Exéat" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Note d'Exéat / Autorisation de Sortie" couleur={couleur} />
        {baseInfo}
        {ligne('Service / Unité')} {ligne('Date d\'admission')} {ligne('Date de sortie')}
        <div style={{ fontSize: 13, lineHeight: 1.8, marginTop: 10 }}>
          <p>Le patient <strong>{data?.patient_nom || '_______________'}</strong> est autorisé(e) à quitter la Clinique De La Rebecca.</p>
        </div>
        {ligne('Diagnostic retenu')} {ligneVide(36)}
        {ligne('Traitement de sortie')} {ligneVide(36)}
        {ligne('Recommandations')} {ligneVide(36)}
        {ligne('Prochain RDV de suivi')}
        <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 14px', fontSize: 12, marginTop: 12 }}>
          ✓ Le patient a été informé des signes d'alarme nécessitant une consultation urgente.
        </div>
        {sigMedecin}
      </PrintModal>
    ),

    requisition_sang: (
      <PrintModal title="Réquisition de Sang" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Fiche de Réquisition de Sang" couleur={couleur} />
        {baseInfo}
        {ligne('Médecin prescripteur', user?.nom)} {ligne('Service / Urgence')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ligne('Groupe sanguin')} {ligne('Rhésus')}
        </div>
        {ligne('Quantité demandée (poches)')} {ligne('Indication / Raison')}
        {ligneVide(36)}
        <div style={{ display: 'flex', gap: 20, fontSize: 12, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700 }}>Urgence :</span>
          {['Immédiate (< 30 min)', 'Urgente (< 2h)', 'Programmée'].map(u => (
            <label key={u} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" readOnly /> {u}
            </label>
          ))}
        </div>
        <div style={{ background: '#fef2f2', borderRadius: 8, padding: '8px 12px', marginTop: 12, fontSize: 12, color: '#dc2626' }}>
          ⚠️ Joindre le tube de prélèvement pour compatibilité croisée avant transfusion.
        </div>
        {sigMedecin}
      </PrintModal>
    ),

    sortie_contre_avis: (
      <PrintModal title="Sortie Contre Avis Médical" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Attestation de Sortie Contre Avis Médical" couleur={couleur} />
        {baseInfo}
        <div style={{ background: '#fef2f2', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>PARTIE À REMPLIR PAR LE PRATICIEN</div>
          {ligne('Je soussigné(e), Dr')}
          {ligne('certifie avoir informé le patient des risques')} {ligneVide(36)}
          {ligne('Date et heure de sortie')}
          <div style={{ fontSize: 12, color: '#64748b', margin: '10px 0', lineHeight: 1.6 }}>Ni ma responsabilité ni celle de l'établissement ne pourront être engagées suite à cette décision.</div>
          <div style={{ marginTop: 14 }}><SignaturePad label='Signature du médecin' onSign={(d) => setSignatures(s => ({...s, sca_medecin: d}))} width={240} height={110} /></div>
        </div>
        <div style={{ background: '#fff7ed', borderRadius: 10, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>PARTIE À REMPLIR PAR LE PATIENT</div>
          {ligne('Je soussigné(e)', data?.patient_nom)}
          <div style={{ fontSize: 12, color: '#64748b', margin: '10px 0', lineHeight: 1.6 }}>Je reconnais avoir été informé(e) des risques médicaux liés à ma sortie et maintiens ma décision en toute connaissance de cause.</div>
          {ligne('Date et heure')}
          <div style={{ marginTop: 14 }}><SignaturePad label='Signature du patient' onSign={(d) => setSignatures(s => ({...s, sca_patient: d}))} width={240} height={110} /></div>
        </div>
      </PrintModal>
    ),

    resultats_labo: (
      <PrintModal title="Résultats Laboratoire" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Résultats d'Examens de Laboratoire" couleur={couleur} />
        {baseInfo}
        <div style={{ marginTop: 16 }}>
          {data?.resultats?.length > 0 ? data.resultats.map((r: any, i: number) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: 14, marginBottom: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>{r.type_examen}</div>
              <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{r.resultats}</div>
              {r.notes && <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', marginTop: 4 }}>{r.notes}</div>}
            </div>
          )) : <p style={{ color: '#94a3b8' }}>Aucun résultat disponible.</p>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
          <div><div style={{ fontSize: 12, marginBottom: 36 }}>Signature technicien</div><div style={{ borderBottom: '1px solid #374151', width: 120 }} /></div>
          <div><div style={{ fontSize: 12, marginBottom: 36 }}>Cachet laboratoire</div><div style={{ borderBottom: '1px solid #374151', width: 120 }} /></div>
        </div>
      </PrintModal>
    ),

    etat_compte: (
      <PrintModal title="État de Compte Patient" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="État de Compte Patient" couleur={couleur} />
        {baseInfo}
        <div style={{ marginTop: 14, fontSize: 13, color: '#64748b', textAlign: 'center', padding: 20 }}>
          Données financières chargées depuis le système de caisse.
        </div>
        {sigMedecin}
      </PrintModal>
    ),

    // ── DENTISTERIE ────────────────────────────────────────────────────
    fiche_dentaire: (
      <PrintModal title="Fiche de Consultation Dentaire" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Fiche de Consultation Dentaire" couleur={couleur} />
        {baseInfo} {ligne('Médecin dentiste', user?.nom)}
        {ligne('Motif de consultation')} {ligneVide(36)}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 10 }}>Examen buccal</div>
        {ligne('Dents concernées')} {ligneVide(30)}
        {ligne('Diagnostic')} {ligneVide(36)}
        {ligne('Traitement effectué')} {ligneVide(36)}
        {ligne('Traitement prévu (prochain RDV)')} {ligneVide(36)}
        {sigMedecin}
      </PrintModal>
    ),

    prescription_dentaire: (
      <PrintModal title="Prescription Dentaire" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Prescription Dentaire" couleur={couleur} />
        {baseInfo} {ligne('Dentiste', user?.nom)}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 12 }}>Médicaments prescrits</div>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginBottom: 8, fontSize: 12 }}>
            <div style={{ borderBottom: '1px solid #d1d5db' }} />
            <div style={{ borderBottom: '1px solid #d1d5db', color: '#94a3b8', textAlign: 'center' }}>Posologie</div>
            <div style={{ borderBottom: '1px solid #d1d5db', color: '#94a3b8', textAlign: 'center' }}>Durée</div>
          </div>
        ))}
        {ligne('Instructions post-opératoires')} {ligneVide(40)}
        {sigMedecin}
      </PrintModal>
    ),

    devis_dentaire: (
      <PrintModal title="Devis / Plan de Traitement" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Plan de Traitement Dentaire" couleur={couleur} />
        {baseInfo} {ligne('Dentiste', user?.nom)}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 12 }}>Actes planifiés</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
          {['Acte / Traitement', 'Dent(s)', 'Prix (HTG)'].map(h => <div key={h} style={{ borderBottom: '1px solid #0d9488', paddingBottom: 4 }}>{h}</div>)}
        </div>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[1,2,3].map(j => <div key={j} style={{ borderBottom: '1px solid #e2e8f0', height: 20 }} />)}
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, fontSize: 14, fontWeight: 700 }}>
          Total : <span style={{ borderBottom: '1px solid #374151', display: 'inline-block', width: 100, marginLeft: 10 }} /> HTG
        </div>
        {sigMedecin}
      </PrintModal>
    ),

    // ── PHYSIOTHÉRAPIE ────────────────────────────────────────────────
    bilan_physio: (
      <PrintModal title="Bilan Initial Physiothérapie" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Bilan Initial de Physiothérapie" couleur={couleur} />
        {baseInfo} {ligne('Physiothérapeute', user?.nom)}
        {ligne('Médecin prescripteur')} {ligne('Motif de prise en charge')} {ligneVide(36)}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 10 }}>Évaluation fonctionnelle</div>
        {ligne('Bilan musculaire')} {ligneVide(30)} {ligne('Bilan articulaire')} {ligneVide(30)}
        {ligne('Douleur (0-10)')} {ligne('Limitations fonctionnelles')} {ligneVide(36)}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 10 }}>Plan de traitement</div>
        {ligne('Objectifs')} {ligneVide(36)} {ligne('Techniques prévues')} {ligneVide(36)}
        {ligne('Nombre de séances')} {ligne('Fréquence')}
        {sigMedecin}
      </PrintModal>
    ),

    seance_physio: (
      <PrintModal title="Fiche de Séance" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Fiche de Séance de Rééducation" couleur={couleur} />
        {baseInfo} {ligne('Physiothérapeute', user?.nom)}
        {ligne('N° de séance')} {ligne('Date')}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 10 }}>Bilan de séance</div>
        {ligne('Évolution / Plaintes')} {ligneVide(36)}
        {ligne('Techniques utilisées')} {ligneVide(36)}
        {ligne('Exercices effectués')} {ligneVide(36)}
        {ligne('Remarques')} {ligneVide(30)}
        {sigMedecin}
      </PrintModal>
    ),

    programme_physio: (
      <PrintModal title="Programme d'Exercices" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Programme d'Exercices à Domicile" couleur={couleur} />
        {baseInfo} {ligne('Physiothérapeute', user?.nom)}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 10 }}>Exercices prescrits</div>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Exercice {i}</div>
            {ligne('Description')} {ligne('Répétitions')} {ligne('Fréquence')}
          </div>
        ))}
        <div style={{ background: '#fffbeb', borderRadius: 8, padding: '10px 14px', fontSize: 12, marginTop: 8 }}>
          ⚠️ Arrêtez si douleur vive. Consultez votre physiothérapeute en cas de doute.
        </div>
        {sigMedecin}
      </PrintModal>
    ),

    // ── OPTOMÉTRIE ────────────────────────────────────────────────────
    examen_vue: (
      <PrintModal title="Fiche d'Examen de la Vue" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Fiche d'Examen Optométrique" couleur={couleur} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
          {ligne('Nom et Prénom')} {ligne('Âge')} {ligne('Sexe')}
        </div>
        {ligne('Motif de consultation')}
        {/* Acuité visuelle */}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 12, color: couleur }}>ACUITÉ VISUELLE</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['', 'Sans correction', 'Avec ancienne correction', 'Trou sténopéique'].map(h => (
                <th key={h} style={{ border: '1px solid #e2e8f0', padding: '7px 10px', fontWeight: 700, textAlign: 'center' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['Œil Droit (OD)', 'Œil Gauche (OG)', 'Binoculaire'].map(eye => (
              <tr key={eye}>
                <td style={{ border: '1px solid #e2e8f0', padding: '10px', fontWeight: 600 }}>{eye}</td>
                {[0,1,2].map(i => <td key={i} style={{ border: '1px solid #e2e8f0', padding: '10px' }} />)}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Réfraction */}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: couleur }}>RÉFRACTION OBJECTIVE / SUBJECTIVE</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['', 'Sphère', 'Cylindre', 'Axe', 'ADD', 'AV finale'].map(h => (
                <th key={h} style={{ border: '1px solid #e2e8f0', padding: '7px 10px', fontWeight: 700, textAlign: 'center' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['Œil Droit (OD)', 'Œil Gauche (OG)'].map(eye => (
              <tr key={eye}>
                <td style={{ border: '1px solid #e2e8f0', padding: '10px', fontWeight: 600 }}>{eye}</td>
                {[0,1,2,3,4].map(i => <td key={i} style={{ border: '1px solid #e2e8f0', padding: '10px' }} />)}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Examen biomicroscopique */}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: couleur }}>EXAMEN BIOMICROSCOPIQUE (Lampe à fente)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, marginBottom: 12 }}>
          {['Conjonctive OD', 'Conjonctive OG', 'Cornée OD', 'Cornée OG',
            'Chambre antérieure OD', 'Chambre antérieure OG', 'Cristallin OD', 'Cristallin OG'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ minWidth: 160 }}>{item} :</span>
              <div style={{ flex: 1, borderBottom: '1px solid #d1d5db' }} />
            </div>
          ))}
        </div>
        {/* Tension oculaire + Fond œil */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: couleur }}>TENSION OCULAIRE</div>
            {ligne('OD (mmHg)')} {ligne('OG (mmHg)')} {ligne('Méthode')}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: couleur }}>FOND D'ŒIL</div>
            {ligne('Papille OD')} {ligne('Papille OG')} {ligne('Rétine')}
          </div>
        </div>
        {/* Diagnostic + plan */}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, marginTop: 10, color: couleur }}>DIAGNOSTIC & PLAN</div>
        {ligne('Diagnostic')} {ligneVide(36)}
        {ligne('Traitement / Prescription')} {ligneVide(36)}
        {ligne('Prochain contrôle')}
        {sigMedecin}
      </PrintModal>
    ),

    prescription_lunettes: (
      <PrintModal title="Prescription Lunettes / Lentilles" couleur={couleur} onClose={onClose}>
        <EnteteClinique titre="Prescription Optique" couleur={couleur} />
        {baseInfo} {ligne('Optométriste', user?.nom)}
        <div style={{ marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['', 'Sphère', 'Cylindre', 'Axe', 'Prisme', 'ADD'].map(h => (
                  <th key={h} style={{ border: '1px solid #e2e8f0', padding: '8px 10px', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['Œil droit (OD)', 'Œil gauche (OG)'].map(eye => (
                <tr key={eye}>
                  <td style={{ border: '1px solid #e2e8f0', padding: '12px 10px', fontWeight: 600 }}>{eye}</td>
                  {[1,2,3,4,5].map(i => <td key={i} style={{ border: '1px solid #e2e8f0', padding: '12px 10px' }} />)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ligne('Écart pupillaire (EP)')} {ligne('Type de verres / monture recommandé')}
        {ligne('Validité de l\'ordonnance')}
        {sigMedecin}
      </PrintModal>
    ),
  }

  return docs[type] || null
}

// ── Page principale ────────────────────────────────────────────────────────
export default function InfirmierDocuments() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [patientData, setPatientData] = useState<any>(null)
  const [searchId, setSearchId] = useState('')
  const [modal, setModal] = useState<{ type: string; data: any } | null>(null)
  const [signatures, setSignatures] = useState<Record<string, string | null>>({})

  if (!loading && !isAuthenticated) { router.push('/login'); return null }

  // Get service group from user specialite
  const userSpecialite = user?.specialite || ''
  const serviceGroup = getServiceGroup(userSpecialite)
  const userRole = user?.role || 'infirmier'

  // Get relevant documents based on service and role
  const docsDispos = getDocsForContext(serviceGroup, userRole)
    .filter(d => d.label.toLowerCase().includes(search.toLowerCase()) || !search)

  const chercherPatient = async () => {
    if (!searchId.trim()) return
    try {
      const r = await api.get(`/patients/par-numero/${searchId.trim().toUpperCase()}`)
      setPatientData(r.data)
    } catch { toast.error('Patient introuvable') }
  }

  const ouvrirDoc = async (type: string) => {
    let data = patientData ? { patient_nom: patientData.nom, patient_numero: patientData.numero } : {}

    // Load medecin's signature if they are a medecin
    if (userRole === 'medecin' && !signatures['medecin_saved']) {
      try {
        const sigR = await api.get('/medecin/ma-signature')
        if (sigR.data?.signature) {
          setSignatures(s => ({ ...s, medecin_saved: sigR.data.signature }))
        }
      } catch { /* no signature yet */ }
    }

    // Load lab results if needed
    if (type === 'resultats_labo' && patientData) {
      try {
        const r = await api.get(`/infirmier/imprimer-resultats-labo/${patientData.numero}`)
        data = { ...data, ...r.data }
      } catch {}
    }
    setModal({ type, data })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Navbar */}
      <div style={{ background: 'linear-gradient(135deg,#0f1e3d,#1641C8)', height: 58, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14 }}>
        <Link href="/infirmier" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none' }}>← Retour</Link>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 14, marginLeft: 8 }}>
          Documents imprimables
          {userSpecialite && <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 8, opacity: 0.7 }}>— {userSpecialite}</span>}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>

        {/* Recherche patient */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🔍 Patient</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={searchId} onChange={e => setSearchId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && chercherPatient()}
              placeholder="#RB-0042 ou NOM PRÉNOM"
              style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'monospace' }} />
            <button onClick={chercherPatient} style={{ background: '#1641C8', color: 'white', border: 'none', borderRadius: 10, padding: '11px 20px', fontWeight: 700, cursor: 'pointer' }}>
              <Search size={14} />
            </button>
          </div>
          {patientData && (
            <div style={{ marginTop: 10, background: '#f0fdf4', borderRadius: 8, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{patientData.nom}</strong>
                <span style={{ fontFamily: 'monospace', color: '#16a34a', marginLeft: 10 }}>{patientData.numero}</span>
              </div>
              <button onClick={() => setPatientData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 12 }}>✕</button>
            </div>
          )}
        </div>

        {/* Recherche documents */}
        <div style={{ marginBottom: 16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Filtrer les documents..."
            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' as const }} />
        </div>

        {/* Grille documents */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
          {docsDispos.map(doc => (
            <div key={doc.type} style={{ background: 'white', borderRadius: 14, padding: 16, border: `1px solid #e2e8f0`, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${doc.couleur}22`; (e.currentTarget as HTMLElement).style.borderColor = doc.couleur }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${doc.couleur}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {doc.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', lineHeight: 1.3 }}>{doc.label}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => ouvrirDoc(doc.type)} style={{ flex: 1, background: `${doc.couleur}15`, color: doc.couleur, border: 'none', borderRadius: 8, padding: '7px 10px', fontWeight: 700, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Eye size={12} /> Aperçu
                </button>
                <button onClick={() => { ouvrirDoc(doc.type) }} style={{ flex: 1, background: doc.couleur, color: 'white', border: 'none', borderRadius: 8, padding: '7px 10px', fontWeight: 700, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Printer size={12} /> Imprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {docsDispos.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
            <Lock size={32} style={{ marginBottom: 12 }} />
            <p>Aucun document disponible pour votre service / rôle.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && renderDocument(modal.type, modal.data, user, () => setModal(null))}
    </div>
  )
}
