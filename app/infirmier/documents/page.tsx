'use client'
import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ChevronLeft, Search, Printer, FileText, AlertCircle, Lock } from 'lucide-react'

interface DocInfo {
  type: string; label: string; icone: string; disponible: boolean
  nb_resultats?: number; derniere_date?: string
}
interface SearchResult {
  patient_numero: string; patient_nom: string; documents: DocInfo[]
}

const COLORS: Record<string, string> = {
  certificat:        '#374151',
  exeat:             '#0369a1',
  ecg:               '#dc2626',
  sortie_contre_avis:'#b91c1c',
  resultats_labo:    '#16a34a',
}

function PrintModal({ title, couleur, children, onClose }: any) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'white', borderRadius:18, width:'100%', maxWidth:680, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid #e2e8f0' }}>
          <h3 style={{ fontWeight:800, color:'#0f172a', margin:0, fontSize:15 }}>{title}</h3>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => window.print()} style={{ background:couleur, color:'white', border:'none', borderRadius:10, padding:'8px 18px', fontWeight:700, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
              <Printer size={13} /> Imprimer
            </button>
            <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', borderRadius:10, padding:'8px 14px', cursor:'pointer', fontWeight:600, color:'#374151', fontSize:13 }}>
              Fermer
            </button>
          </div>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  )
}

function EnteteClinique({ titre, couleur }: { titre: string; couleur: string }) {
  return (
    <div style={{ textAlign:'center', borderBottom:`2px solid ${couleur}`, paddingBottom:14, marginBottom:20 }}>
      <div style={{ fontWeight:900, fontSize:17, color:'#1641C8' }}>CLINIQUE DE LA REBECCA</div>
      <div style={{ fontSize:12, color:'#64748b' }}>#44, Rue Rebecca, Pétion-Ville · (509) 4858-5757</div>
      <div style={{ fontWeight:800, fontSize:14, marginTop:8, color:couleur, textTransform:'uppercase' }}>{titre}</div>
    </div>
  )
}

export default function InfirmierDocumentsPage() {
  const [patientId, setPatientId] = useState('')
  const [result,    setResult]    = useState<SearchResult | null>(null)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [modal,     setModal]     = useState<{type:string; data:any} | null>(null)

  const chercher = async () => {
    const id = patientId.trim().toUpperCase()
    if (!id) return
    setLoading(true); setError(''); setResult(null)
    try {
      const r = await api.get(`/infirmier/documents-disponibles/${id}`)
      setResult(r.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Patient introuvable')
    } finally { setLoading(false) }
  }

  const ouvrirImpression = async (type: string) => {
    if (!result) return
    if (type === 'resultats_labo') {
      try {
        const r = await api.get(`/infirmier/imprimer-resultats-labo/${result.patient_numero}`)
        setModal({ type, data: r.data })
      } catch { alert('Erreur chargement résultats') }
    } else {
      setModal({ type, data: { patient_numero: result.patient_numero, patient_nom: result.patient_nom } })
    }
  }

  const ligne = (label: string, val = '') => (
    <div style={{ display:'flex', gap:8, marginBottom:8, fontSize:13 }}>
      <span style={{ fontWeight:600, color:'#374151', minWidth:160 }}>{label}</span>
      <span style={{ flex:1, borderBottom:'1px solid #d1d5db', minWidth:100, color: val ? '#0f172a' : 'transparent' }}>{val || '.'}</span>
    </div>
  )
  const ligneLongue = (label: string) => (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontWeight:600, fontSize:13, color:'#374151', marginBottom:4 }}>{label}</div>
      <div style={{ border:'1px solid #d1d5db', borderRadius:6, height:48 }} />
    </div>
  )

  const renderModal = () => {
    if (!modal) return null
    const { type, data } = modal
    const onClose = () => setModal(null)

    if (type === 'resultats_labo') {
      return (
        <PrintModal title="Résultats Laboratoire" couleur="#16a34a" onClose={onClose}>
          <EnteteClinique titre="Résultats d'examens de laboratoire" couleur="#16a34a" />
          {ligne('Patient', data.patient_nom)}
          {ligne('# Dossier', data.patient_numero)}
          {ligne('Date impression', new Date().toLocaleDateString('fr-FR'))}
          <div style={{ marginTop:16 }}>
            {data.resultats?.length > 0 ? data.resultats.map((r: any, i: number) => (
              <div key={i} style={{ background:'#f8fafc', borderRadius:10, padding:14, marginBottom:10, border:'1px solid #e2e8f0' }}>
                <div style={{ fontWeight:700, color:'#16a34a', marginBottom:6, fontSize:14 }}>{r.type_examen}</div>
                <div style={{ fontSize:13, whiteSpace:'pre-wrap', lineHeight:1.7 }}>{r.resultats}</div>
                {r.notes && <div style={{ fontSize:12, color:'#64748b', marginTop:6, fontStyle:'italic' }}>{r.notes}</div>}
                <div style={{ fontSize:11, color:'#94a3b8', marginTop:6 }}>{new Date(r.date_examen).toLocaleDateString('fr-FR')}</div>
              </div>
            )) : <p style={{ color:'#94a3b8' }}>Aucun résultat disponible.</p>}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:20 }}>
            <div><div style={{ fontSize:12, marginBottom:36 }}>Signature technicien</div><div style={{ borderBottom:'1px solid #374151', width:120 }} /></div>
            <div><div style={{ fontSize:12, marginBottom:36 }}>Cachet laboratoire</div><div style={{ borderBottom:'1px solid #374151', width:120 }} /></div>
          </div>
        </PrintModal>
      )
    }

    if (type === 'sortie_contre_avis') {
      return (
        <PrintModal title="Sortie Contre Avis Médical" couleur="#dc2626" onClose={onClose}>
          <EnteteClinique titre="Attestation de sortie contre avis médical" couleur="#dc2626" />
          <div style={{ fontSize:11, color:'#64748b', textAlign:'center', marginBottom:16 }}>★ À conserver dans le dossier médical ★</div>
          <div style={{ background:'#fef2f2', borderRadius:10, padding:16, marginBottom:14 }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>PARTIE A REMPLIR PAR LE PRATICIEN</div>
            {ligne('Je soussigné(e), Dr')}
            {ligne('Patient', data.patient_nom)}
            {ligne('# Dossier', data.patient_numero)}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>{ligne('Date de sortie')}</div><div>{ligne('Heure')}</div>
            </div>
            <div style={{ fontSize:12, color:'#64748b', margin:'10px 0', lineHeight:1.6 }}>
              J'ai personnellement informé le patient des risques médicaux. Ni ma responsabilité ni celle de l'établissement ne pourront être engagées.
            </div>
            <div style={{ marginTop:14 }}><div style={{ fontSize:12, marginBottom:36 }}>Signature du médecin</div><div style={{ borderBottom:'1px solid #374151', width:140 }} /></div>
          </div>
          <div style={{ background:'#fff7ed', borderRadius:10, padding:16 }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>PARTIE A REMPLIR PAR LE PATIENT</div>
            {ligne('Je soussigné(e)', data.patient_nom)}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>{ligne('Date de sortie')}</div><div>{ligne('Heure')}</div>
            </div>
            <div style={{ fontSize:12, color:'#64748b', margin:'10px 0', lineHeight:1.6 }}>
              Je reconnais avoir été informé(e) des risques. Cette décision est prise selon ma propre volonté. Je maintiens ma décision.
            </div>
            <div style={{ marginTop:14 }}><div style={{ fontSize:12, marginBottom:36 }}>Signature du patient</div><div style={{ borderBottom:'1px solid #374151', width:140 }} /></div>
          </div>
        </PrintModal>
      )
    }

    if (type === 'rdv_suivi') {
      return (
        <PrintModal title="Feuille de RDV de Suivi" couleur="#1641C8" onClose={onClose}>
          <EnteteClinique titre="Feuille de Rendez-vous de Suivi" couleur="#1641C8" />
          {ligne('Patient', data.patient_nom)}
          {ligne('# Dossier', data.patient_numero)}
          {ligne('Date 1ère consultation', new Date().toLocaleDateString('fr-FR'))}
          <p style={{ fontSize:13, marginBottom:16, marginTop:14, color:'#475569' }}>
            Suite à votre consultation, votre médecin vous recommande un rendez-vous de suivi.
          </p>
          <div style={{ border:'1px solid #e2e8f0', borderRadius:8, padding:16, marginBottom:12, fontSize:13 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div><strong>Prochain RDV :</strong><div style={{ borderBottom:'1px solid #374151', marginTop:22, width:'90%' }}/></div>
              <div><strong>Heure :</strong><div style={{ borderBottom:'1px solid #374151', marginTop:22, width:'90%' }}/></div>
              <div><strong>Médecin :</strong><div style={{ borderBottom:'1px solid #374151', marginTop:22, width:'90%' }}/></div>
              <div><strong>Service :</strong><div style={{ borderBottom:'1px solid #374151', marginTop:22, width:'90%' }}/></div>
            </div>
          </div>
          <div style={{ background:'#fffbeb', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#92400e', marginBottom:16 }}>
            ⚠️ Veuillez vous présenter 15 minutes avant l'heure du rendez-vous. Apportez ce document et votre carte patient.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:20 }}>
            <div><div style={{ fontSize:12, marginBottom:36 }}>Signature du médecin</div><div style={{ borderBottom:'1px solid #374151', width:140 }}/></div>
            <div><div style={{ fontSize:12, marginBottom:36 }}>Cachet clinique</div><div style={{ borderBottom:'1px solid #374151', width:120 }}/></div>
          </div>
        </PrintModal>
      )
    }
    if (type === 'certificat') {
      return (
        <PrintModal title="Certificat Médical" couleur="#374151" onClose={onClose}>
          <EnteteClinique titre="Certificat Médical" couleur="#374151" />
          <div style={{ fontSize:13, lineHeight:2 }}>
            <div>Je soussigné(e) Dr <span style={{ borderBottom:'1px solid #374151', display:'inline-block', width:180 }} /></div>
            <div>certifie que M./Mme <strong>{data.patient_nom}</strong> — #{data.patient_numero}</div>
            <div>a été examiné(e) et/ou hospitalisé(e) à la Clinique De La Rebecca</div>
            <div>le <span style={{ borderBottom:'1px solid #374151', display:'inline-block', width:100 }} /></div>
          </div>
          {ligneLongue('pour les symptômes suivants')}
          {ligneLongue('Les examens cliniques et paracliniques ont révélé')}
          {ligneLongue("L'impression clinique retenue")}
          <div style={{ fontSize:12, color:'#475569', marginTop:16, lineHeight:1.7 }}>
            En foi de quoi, ce certificat lui est délivré pour servir et valoir ce que de droit.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:16 }}>
            <div><div style={{ fontSize:12, marginBottom:36 }}>Date</div><div style={{ borderBottom:'1px solid #374151', width:120 }} /></div>
            <div><div style={{ fontSize:12, marginBottom:36 }}>Signature du médecin</div><div style={{ borderBottom:'1px solid #374151', width:140 }} /></div>
          </div>
        </PrintModal>
      )
    }

    if (type === 'exeat') {
      return (
        <PrintModal title="Note d'Exéat" couleur="#0369a1" onClose={onClose}>
          <EnteteClinique titre="Note d'Exéat" couleur="#0369a1" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:12 }}>
            <div>{ligne('Nom & Prénom', data.patient_nom)}</div>
            <div>{ligne('Chambre')}</div>
            <div>{ligne('# Dossier', data.patient_numero)}</div>
          </div>
          {ligne('Date / Heure sortie')}
          {ligneLongue('Motifs d\'admission')}
          <div style={{ marginBottom:10 }}>
            <div style={{ fontWeight:600, fontSize:13, marginBottom:6 }}>Signes vitaux à la sortie</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
              {['FC','TA','T°','SaO2','Poids'].map(sv => (
                <div key={sv}>
                  <div style={{ fontSize:11, color:'#64748b', marginBottom:3 }}>{sv}</div>
                  <div style={{ border:'1px solid #d1d5db', borderRadius:6, height:30 }} />
                </div>
              ))}
            </div>
          </div>
          {ligneLongue('Examen physique (trouvailles anormales)')}
          {ligneLongue('Paraclinique / Résultats')}
          {ligneLongue('Diagnostic final')}
          {ligneLongue('Médicaments prescrits + conseils')}
          {ligne('Rendez-vous')}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:16 }}>
            <div><div style={{ fontSize:12, marginBottom:36 }}>Médecin (Nom & Prénom)</div><div style={{ borderBottom:'1px solid #374151', width:140 }} /></div>
            <div><div style={{ fontSize:12, marginBottom:36 }}>Signature</div><div style={{ borderBottom:'1px solid #374151', width:120 }} /></div>
          </div>
        </PrintModal>
      )
    }

    if (type === 'ecg') {
      return (
        <PrintModal title="Compte Rendu ECG" couleur="#dc2626" onClose={onClose}>
          <EnteteClinique titre="Compte rendu de l'électrocardiogramme" couleur="#dc2626" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
            {ligne('Nom', data.patient_nom)}{ligne('Prénom')}
            {ligne('Âge')}{ligne('Sexe')}
            {ligne('# Dossier', data.patient_numero)}{ligne('Date')}
          </div>
          {ligneLongue('Histoire clinique')}
          <div style={{ background:'#fef2f2', borderRadius:10, padding:14, marginBottom:12 }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>Résultat du tracé ECG</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {['Rythme / Fréquence','PR','Axe QRS','Durée QRS','Morphologie QRS','Repolarisation ST/T'].map(champ => (
                <div key={champ}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:3 }}>{champ}</div>
                  <div style={{ border:'1px solid #d1d5db', borderRadius:6, height:28 }} />
                </div>
              ))}
            </div>
            {ligneLongue('Conclusion / Interprétation')}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div><div style={{ fontSize:12, marginBottom:36 }}>Médecin</div><div style={{ borderBottom:'1px solid #374151', width:140 }} /></div>
            <div><div style={{ fontSize:12, marginBottom:36 }}>Signature</div><div style={{ borderBottom:'1px solid #374151', width:120 }} /></div>
          </div>
        </PrintModal>
      )
    }

    return null
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      {/* Navbar */}
      <div style={{ background:'linear-gradient(135deg,#0f1e3d,#0d9488)', height:56, display:'flex', alignItems:'center', padding:'0 20px', gap:12 }}>
        <Link href="/infirmier" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
          <ChevronLeft size={14} /> Dashboard Infirmier
        </Link>
        <span style={{ color:'white', fontWeight:700 }}>| Documents Patient</span>
      </div>

      <div style={{ maxWidth:680, margin:'36px auto', padding:'0 20px' }}>
        {/* Bandeau avertissement */}
        <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:12, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'flex-start', gap:10 }}>
          <Lock size={16} style={{ color:'#d97706', flexShrink:0, marginTop:2 }} />
          <div style={{ fontSize:13, color:'#92400e', lineHeight:1.6 }}>
            <strong>Impression uniquement.</strong> Vous pouvez rechercher un patient par son ID et imprimer les documents disponibles.
            Vous n'avez <strong>pas accès</strong> au dossier médical complet.
          </div>
        </div>

        {/* Recherche */}
        <div style={{ background:'white', borderRadius:18, padding:24, border:'1px solid #e2e8f0', marginBottom:20 }}>
          <h2 style={{ fontWeight:800, fontSize:'1.1rem', color:'#0f172a', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <FileText size={18} color="#0d9488" /> Rechercher par ID patient
          </h2>
          <div style={{ display:'flex', gap:10 }}>
            <input
              value={patientId}
              onChange={e => setPatientId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && chercher()}
              placeholder="Ex: #RB-0042"
              style={{ flex:1, padding:'12px 16px', borderRadius:10, border:`2px solid ${error ? '#ef4444' : '#e2e8f0'}`, fontSize:16, fontFamily:'monospace', fontWeight:700, outline:'none' }}
            />
            <button onClick={chercher} disabled={loading} style={{ background:'linear-gradient(135deg,#0d9488,#0f766e)', color:'white', border:'none', borderRadius:10, padding:'12px 22px', fontWeight:700, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
              <Search size={16} /> {loading ? 'Recherche...' : 'Chercher'}
            </button>
          </div>
          {error && (
            <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8, color:'#dc2626', fontSize:13, background:'#fef2f2', padding:'10px 14px', borderRadius:8 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        {/* Documents disponibles */}
        {result && (
          <div style={{ background:'white', borderRadius:18, padding:24, border:'1px solid #e2e8f0' }}>
            {/* Info patient */}
            <div style={{ background:'#f0fdfa', borderRadius:12, padding:'14px 18px', marginBottom:20, border:'1px solid #99f6e4' }}>
              <div style={{ fontWeight:800, fontSize:16, color:'#0f172a' }}>{result.patient_nom}</div>
              <div style={{ fontFamily:'monospace', color:'#0d9488', fontWeight:700, fontSize:15, marginTop:2 }}>{result.patient_numero}</div>
            </div>

            {result.documents.filter(d => d.disponible).length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>
                <FileText size={36} style={{ marginBottom:10 }} />
                <p style={{ margin:0 }}>Aucun document disponible pour ce patient pour le moment.</p>
              </div>
            ) : (
              <>
                <div style={{ fontWeight:700, fontSize:12, color:'#64748b', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>
                  {result.documents.filter(d => d.disponible).length} document(s) disponible(s)
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {result.documents.filter(d => d.disponible).map(doc => (
                    <div key={doc.type} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14, border:'1px solid #e2e8f0', background:'#fafafa' }}>
                      <div style={{ width:46, height:46, borderRadius:12, background:`${COLORS[doc.type] || '#64748b'}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                        {doc.icone}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, color:'#0f172a', fontSize:14 }}>{doc.label}</div>
                        {doc.derniere_date && (
                          <div style={{ color:'#64748b', fontSize:12, marginTop:2 }}>
                            Disponible depuis le {new Date(doc.derniere_date).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                      <button onClick={() => ouvrirImpression(doc.type)} style={{
                        background:COLORS[doc.type] || '#64748b', color:'white', border:'none',
                        borderRadius:10, padding:'9px 18px', fontWeight:700, cursor:'pointer',
                        fontSize:13, display:'flex', alignItems:'center', gap:6, flexShrink:0
                      }}>
                        <Printer size={14} /> Imprimer
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16, padding:'10px 14px', background:'#fef2f2', borderRadius:8, fontSize:12, color:'#dc2626', display:'flex', alignItems:'center', gap:8 }}>
                  <Lock size={12} /> Le contenu médical ne s'affiche pas à l'écran — impression directe uniquement.
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {renderModal()}
    </div>
  )
}
