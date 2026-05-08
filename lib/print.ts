'use client'

/**
 * lib/print.ts — Module d'impression universel Clinique de la Rebecca
 * Tous les documents imprimables passent par ce module.
 */

const CLINIQUE = {
  nom:     'CLINIQUE DE LA REBECCA',
  adresse: '#44 Rue Rebecca, Pétion-Ville, Haïti',
  tel:     '(509) 4858-5757',
  tel_wa:  'https://wa.me/50948585757',
  tel_call:'tel:+50948585757',
  email:   'clinique.rebecca@gmail.com',
}

const BASE_STYLE = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;color:#1e293b;font-size:13px;line-height:1.5}
.page{max-width:800px;margin:0 auto;padding:24px}
.header{text-align:center;border-bottom:3px double #1641C8;padding-bottom:14px;margin-bottom:18px}
.clinic-name{font-size:20px;font-weight:900;color:#1641C8;letter-spacing:.5px}
.clinic-sub{font-size:10px;color:#64748b;margin-top:3px}
.doc-title{font-size:15px;font-weight:800;color:#374151;margin-top:10px;text-transform:uppercase;letter-spacing:1px}
.doc-ref{font-size:11px;color:#94a3b8;margin-top:3px;font-family:monospace}
.section{margin:14px 0}
.section-title{font-size:11px;font-weight:700;color:#1641C8;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #dbeafe;padding-bottom:4px;margin-bottom:8px}
.row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dotted #e5e7eb;font-size:12px}
.row-key{color:#64748b;flex:1}
.row-val{font-weight:600;text-align:right;flex:1}
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
.kpi{border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center;background:#f8fafc}
.kpi-val{font-size:17px;font-weight:900}.kpi-lbl{font-size:9px;color:#64748b;margin-top:3px;text-transform:uppercase}
.total-box{background:#f0fdf4;border:2px solid #16a34a;border-radius:8px;padding:12px;text-align:center;margin:12px 0}
.total-htg{font-size:24px;font-weight:900;color:#16a34a;font-family:monospace}
.total-lbl{font-size:10px;color:#16a34a;font-weight:700;text-transform:uppercase;margin-bottom:3px}
table{width:100%;border-collapse:collapse;font-size:12px;margin-top:6px}
thead tr{background:#1641C8;color:white}
th{padding:8px 10px;text-align:left;font-size:11px;font-weight:700}
td{padding:7px 10px;border-bottom:1px solid #f1f5f9}
tr:nth-child(even) td{background:#f8fafc}
.badge{display:inline-block;padding:2px 10px;border-radius:99px;font-size:10px;font-weight:700}
.badge-green{background:#dcfce7;color:#16a34a}
.badge-blue{background:#dbeafe;color:#1641C8}
.badge-red{background:#fee2e2;color:#dc2626}
.badge-yellow{background:#fef9c3;color:#854d0e}
.signature-box{border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
.sig-line{border-bottom:1px solid #374151;margin-top:32px;font-size:10px;color:#64748b;text-align:center;padding-top:4px}
.footer{text-align:center;font-size:9px;color:#94a3b8;margin-top:20px;padding-top:10px;border-top:1px solid #e2e8f0;line-height:1.9}
.watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;color:rgba(22,65,200,0.04);font-weight:900;pointer-events:none;z-index:0;white-space:nowrap}
.btn-print{display:block;width:100%;padding:11px;background:#1641C8;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:700;margin-top:16px}
@media print{.btn-print{display:none!important}.page{padding:8px}body{font-size:12px}}
`

function openPrint(html: string, width = 820, height = 1050) {
  const w = window.open('', '_blank', `width=${width},height=${height},scrollbars=yes`)
  if (!w) {
    alert(" Autorisez les popups pour ce site afin d'imprimer les documents.")
    return
  }
  w.document.write(html)
  w.document.close()
  w.focus()
  // Délai pour laisser les styles se charger
  setTimeout(() => w.print(), 600)
}

function clinicHeader(titre: string, refDoc?: string) {
  return `
<div class="header">
  <div class="clinic-name">${CLINIQUE.nom}</div>
  <div class="clinic-sub">${CLINIQUE.adresse} · ${CLINIQUE.tel} · ${CLINIQUE.email}</div>
  <div class="doc-title">${titre}</div>
  ${refDoc ? `<div class="doc-ref">${refDoc}</div>` : ''}
</div>`
}

function clinicFooter(extra = '') {
  const now = new Date().toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
  return `
<div class="footer">
  ${extra ? `${extra}<br>` : ''}
  Document généré le ${now} · ${CLINIQUE.nom}<br>
  ${CLINIQUE.adresse} · Tél: ${CLINIQUE.tel}<br>
  <em>Document officiel — toute modification est interdite</em>
</div>`
}

// 
// REÇU D'ENREGISTREMENT (caissier → nouveau patient)
// 
export function imprimerRecuEnregistrement(data: {
  patient: { id: number; numero: string; nom: string; telephone?: string; is_premiere_visite?: boolean }
  ticket: string
  service: string
  montant: number
  mode_paiement: string
  medecin_nom?: string
  priorite?: string
  rdv_id?: number
  recu_numero?: string
}) {
  const modeLabel: Record<string, string> = {
    especes: ' Espèces', moncash: ' MonCash', natcash: ' NatCash',
    carte: ' Carte bancaire', zelle: ' Zelle (USD)'
  }
  const mode = data.mode_paiement || 'especes'
  const now = new Date().toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reçu ${data.patient.numero}</title>
<style>
${BASE_STYLE}
body{width:80mm;max-width:80mm;font-size:12px}
.ticket-box{text-align:center;background:#dbeafe;border:2px solid #1641C8;border-radius:8px;padding:10px;margin:8px 0}
.ticket-num{font-size:36px;font-weight:900;color:#1641C8;font-family:monospace;letter-spacing:3px}
.id-box{text-align:center;background:#0f172a;color:white;border-radius:7px;padding:7px;margin:8px 0}
.id-num{font-size:24px;font-weight:900;font-family:monospace;letter-spacing:2px}
.id-lbl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px}
</style></head><body>
<div style="font-size:14px;font-weight:900;color:#1641C8;text-align:center;margin-bottom:2px">${CLINIQUE.logo} CLINIQUE DE LA REBECCA</div>
<div style="font-size:9px;color:#666;text-align:center;margin-bottom:6px">${CLINIQUE.tel} · ${now}</div>
<hr style="border:none;border-top:1px dashed #ccc;margin:6px 0">

<div class="id-box">
  <div class="id-lbl">Dossier Patient ${data.patient.is_premiere_visite ? '(Nouveau)' : '(Retour)'}</div>
  <div class="id-num">${data.patient.numero}</div>
</div>

<div class="ticket-box">
  <div style="font-size:9px;font-weight:700;color:#1641C8;text-transform:uppercase;margin-bottom:3px"> Ticket Infirmière</div>
  <div class="ticket-num">#${data.ticket}</div>
</div>

<hr style="border:none;border-top:1px dashed #ccc;margin:6px 0">
<div class="row"><span class="row-key">Patient</span><span class="row-val">${data.patient.nom?.toUpperCase()}</span></div>
<div class="row"><span class="row-key">Tél.</span><span class="row-val">${data.patient.telephone || '—'}</span></div>
<div class="row"><span class="row-key">Service</span><span class="row-val">${data.service}</span></div>
${data.medecin_nom ? `<div class="row"><span class="row-key">Praticien</span><span class="row-val">${data.medecin_nom}</span></div>` : ''}
<div class="row"><span class="row-key">Priorité</span><span class="row-val">${data.priorite === 'urgent' ? ' URGENT' : '🟢 Normal'}</span></div>
<div class="row"><span class="row-key">Mode paiement</span><span class="row-val">${modeLabel[mode] || mode}</span></div>
${data.recu_numero ? `<div class="row"><span class="row-key">N° Reçu</span><span class="row-val" style="font-family:monospace">${data.recu_numero}</span></div>` : ''}

<hr style="border:none;border-top:1px dashed #ccc;margin:6px 0">
${data.montant > 0 ? `
<div class="total-box">
  <div class="total-lbl">Montant Payé</div>
  <div class="total-htg">${Number(data.montant).toLocaleString('fr-FR')} HTG</div>
</div>` : `
<div style="text-align:center;font-size:10px;color:#d97706;font-weight:700;margin:8px 0;padding:8px;background:#fef9c3;border-radius:6px">
   Paiement à effectuer à la caisse
</div>`}
<hr style="border:none;border-top:1px dashed #ccc;margin:6px 0">
<div style="text-align:center;font-size:9px;color:#94a3b8;line-height:1.7">
  Présentez ce ticket à l'infirmière<br>
  Conservez ce reçu comme justificatif<br>
  Merci de votre confiance
</div>
<button class="btn-print" onclick="window.print()"> Imprimer ce reçu</button>
</body></html>`

  openPrint(html, 420, 720)
}

// 
// REÇU DE PAIEMENT (transaction isolée)
// 
export function imprimerRecuPaiement(p: {
  recu_numero?: string; numero_piece?: string
  service?: string; description?: string
  montant?: number
  mode_paiement?: string
  reference?: string
  patient_nom?: string
  patient_numero?: string
  date?: string
}) {
  const modeLabel: Record<string, string> = {
    especes: ' Espèces', moncash: ' MonCash', natcash: ' NatCash',
    carte: ' Carte bancaire', zelle: ' Zelle (USD)'
  }
  const refNum = (p.recu_numero || p.numero_piece || '—').toString().replace(/JournalEnum\./g,'').replace(/[<>]/g,'').trim()
  const now = new Date().toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reçu ${refNum}</title>
<style>${BASE_STYLE}body{width:80mm;max-width:80mm;font-size:12px}</style></head><body>
<div style="font-size:14px;font-weight:900;color:#1641C8;text-align:center">${CLINIQUE.logo} CLINIQUE DE LA REBECCA</div>
<div style="font-size:9px;color:#666;text-align:center;margin-bottom:4px">${CLINIQUE.tel}</div>
<div style="font-size:10px;font-weight:700;text-align:center;color:#374151;margin-bottom:6px"> REÇU DE PAIEMENT · ${now}</div>
<div style="text-align:center;font-family:monospace;font-size:13px;font-weight:900;color:#1641C8;background:#eff6ff;border-radius:6px;padding:6px;margin:6px 0">🧾 ${refNum}</div>
<hr style="border:none;border-top:1px dashed #ccc;margin:6px 0">
${p.patient_nom ? `<div class="row"><span class="row-key">Patient</span><span class="row-val">${p.patient_nom}</span></div>` : ''}
${p.patient_numero ? `<div class="row"><span class="row-key">Dossier</span><span class="row-val" style="font-family:monospace">${p.patient_numero}</span></div>` : ''}
<div class="row"><span class="row-key">Service</span><span class="row-val">${p.service || p.description || '—'}</span></div>
<div class="row"><span class="row-key">Mode</span><span class="row-val">${modeLabel[p.mode_paiement || 'especes'] || p.mode_paiement || 'Espèces'}</span></div>
${p.reference ? `<div class="row"><span class="row-key">Référence</span><span class="row-val" style="font-family:monospace;font-size:10px">${p.reference}</span></div>` : ''}
<hr style="border:none;border-top:1px dashed #ccc;margin:6px 0">
<div class="total-box">
  <div class="total-lbl">Montant Encaissé</div>
  <div class="total-htg">${Number(p.montant || 0).toLocaleString('fr-FR')} HTG</div>
</div>
<hr style="border:none;border-top:1px dashed #ccc;margin:6px 0">
<div style="text-align:center;font-size:9px;color:#94a3b8;line-height:1.7">
  Ce reçu constitue votre justificatif officiel<br>
  Clinique de la Rebecca · Pétion-Ville, Haïti<br>
  Tél: ${CLINIQUE.tel}
</div>
<button class="btn-print" onclick="window.print()"> Imprimer le reçu</button>
</body></html>`

  openPrint(html, 420, 640)
}

// 
// FACTURE OFFICIELLE (A4 — pour remboursement assurance)
// 
export function imprimerFactureOfficielle(data: {
  patient: { numero: string; nom: string; telephone?: string; adresse?: string; age?: number }
  service: string
  medecin_nom?: string
  montant: number
  mode_paiement: string
  recu_numero?: string
  date?: string
}) {
  const modeLabel: Record<string, string> = {
    especes: 'Espèces', moncash: 'MonCash', natcash: 'NatCash',
    carte: 'Carte bancaire', zelle: 'Zelle (USD)'
  }
  const dateDoc = data.date ? new Date(data.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')
  const now = new Date().toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' })

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Facture ${data.recu_numero || ''}</title>
<style>${BASE_STYLE}</style></head><body>
<div class="page">
  <div class="watermark">CLINIQUE REBECCA</div>
  ${clinicHeader('FACTURE OFFICIELLE DE SOINS', data.recu_numero ? `Réf: ${data.recu_numero} · Date: ${dateDoc}` : `Date: ${dateDoc}`)}

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:14px">
    <div style="background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0">
      <div class="section-title">Informations Patient</div>
      <div class="row"><span class="row-key">Dossier</span><span class="row-val" style="font-family:monospace">${data.patient.numero}</span></div>
      <div class="row"><span class="row-key">Nom</span><span class="row-val">${data.patient.nom?.toUpperCase()}</span></div>
      ${data.patient.telephone ? `<div class="row"><span class="row-key">Téléphone</span><span class="row-val">${data.patient.telephone}</span></div>` : ''}
      ${data.patient.adresse ? `<div class="row"><span class="row-key">Adresse</span><span class="row-val">${data.patient.adresse}</span></div>` : ''}
      ${data.patient.age ? `<div class="row"><span class="row-key">Âge</span><span class="row-val">${data.patient.age} ans</span></div>` : ''}
    </div>
    <div style="background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0">
      <div class="section-title">Prestataire</div>
      <div class="row"><span class="row-key">Établissement</span><span class="row-val">${CLINIQUE.nom}</span></div>
      <div class="row"><span class="row-key">Adresse</span><span class="row-val">${CLINIQUE.adresse}</span></div>
      ${data.medecin_nom ? `<div class="row"><span class="row-key">Praticien</span><span class="row-val">${data.medecin_nom}</span></div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Détail des Soins</div>
    <table>
      <thead><tr><th>#</th><th>Désignation</th><th>Praticien</th><th style="text-align:right">Montant HTG</th></tr></thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>${data.service}</strong></td>
          <td>${data.medecin_nom || '—'}</td>
          <td style="text-align:right;font-weight:700">${Number(data.montant).toLocaleString('fr-FR')} HTG</td>
        </tr>
        <tr style="background:#f0fdf4">
          <td colspan="3" style="text-align:right;font-weight:700;color:#16a34a">TOTAL DÛ</td>
          <td style="text-align:right;font-weight:900;font-size:16px;color:#16a34a">${Number(data.montant).toLocaleString('fr-FR')} HTG</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Paiement</div>
    <div class="row"><span class="row-key">Mode de paiement</span><span class="row-val">${modeLabel[data.mode_paiement] || data.mode_paiement}</span></div>
    <div class="row"><span class="row-key">Date</span><span class="row-val">${dateDoc}</span></div>
    <div class="row"><span class="row-key">Statut</span><span class="row-val"><span class="badge badge-green"> ACQUITTÉ</span></span></div>
  </div>

  <div class="signature-box">
    <div>
      <div style="font-size:10px;font-weight:700;color:#374151;margin-bottom:4px">Le Caissier</div>
      <div class="sig-line">Signature &amp; Cachet</div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:700;color:#374151;margin-bottom:4px">Le Praticien / Médecin Chef</div>
      <div class="sig-line">Signature &amp; Cachet</div>
    </div>
  </div>

  ${clinicFooter('Soins médicaux exonérés de la TCA selon la loi haïtienne')}
  <button class="btn-print" onclick="window.print()"> Imprimer la facture officielle</button>
</div>
</body></html>`

  openPrint(html, 820, 1100)
}

// 
// CERTIFICAT MÉDICAL
// 
export function imprimerCertificatMedical(data: {
  patient: { numero: string; nom: string; age?: number; telephone?: string }
  medecin_nom: string
  medecin_specialite?: string
  contenu: string
  date?: string
  recu_numero?: string
}) {
  const dateDoc = data.date ? new Date(data.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }) : new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Certificat Médical — ${data.patient.nom}</title>
<style>${BASE_STYLE}
.content{background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:18px;margin:14px 0;min-height:180px;line-height:1.9;font-size:13px;white-space:pre-wrap}
</style></head><body>
<div class="page">
  ${clinicHeader('CERTIFICAT MÉDICAL', `Réf: CERT-${data.patient.numero}-${new Date().getFullYear()}`)}

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px">
    <div>
      <div class="section-title">Patient</div>
      <div class="row"><span class="row-key">Dossier</span><span class="row-val" style="font-family:monospace">${data.patient.numero}</span></div>
      <div class="row"><span class="row-key">Nom</span><span class="row-val">${data.patient.nom?.toUpperCase()}</span></div>
      ${data.patient.age ? `<div class="row"><span class="row-key">Âge</span><span class="row-val">${data.patient.age} ans</span></div>` : ''}
    </div>
    <div>
      <div class="section-title">Médecin</div>
      <div class="row"><span class="row-key">Nom</span><span class="row-val">${data.medecin_nom}</span></div>
      ${data.medecin_specialite ? `<div class="row"><span class="row-key">Spécialité</span><span class="row-val">${data.medecin_specialite}</span></div>` : ''}
      <div class="row"><span class="row-key">Date</span><span class="row-val">${dateDoc}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Attestation médicale</div>
    <div class="content">${data.contenu || 'Le médecin soussigné certifie avoir examiné le patient susmentionné.'}</div>
  </div>

  <div class="signature-box">
    <div>
      <div style="font-size:10px;font-weight:700;color:#374151">Le Médecin Soussigné</div>
      <div style="font-size:11px;color:#64748b;margin:4px 0">${data.medecin_nom}</div>
      ${data.medecin_specialite ? `<div style="font-size:10px;color:#94a3b8">${data.medecin_specialite}</div>` : ''}
      <div class="sig-line">Signature &amp; Cachet</div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:700;color:#374151">Le Directeur Médical</div>
      <div class="sig-line">Signature &amp; Cachet</div>
    </div>
  </div>

  ${clinicFooter('Ce certificat est établi à la demande de l\'intéressé(e) pour faire valoir ce que de droit.')}
  <button class="btn-print" onclick="window.print()"> Imprimer le certificat</button>
</div>
</body></html>`

  openPrint(html, 820, 1100)
}

// 
// RAPPORT COMPTABLE A4 (avec données IA)
// 
export function imprimerRapportComptable(data: {
  moisNom: string; annee: number
  totalProduits: number; totalCharges: number; resultatNet: number
  ratioMarge: number; ratioCharges: number
  nbPatients: number; nbTransactions: number
  recettesParService: Record<string, number>
  chargesParCategorie: Record<string, number>
  tresorerieParMode: Record<string, number>
  anomalies: string[]
  rapport: string
  typeRapport: string
}) {
  const now = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
  const isPositif = data.resultatNet >= 0

  const lignesProduits = Object.entries(data.recettesParService)
    .sort(([,a],[,b]) => b - a)
    .map(([k,v]) => `<tr><td>${k}</td><td style="text-align:right;font-weight:700;color:#16a34a">${v.toLocaleString('fr')} HTG</td><td style="text-align:right;color:#64748b">${data.totalProduits > 0 ? ((v/data.totalProduits)*100).toFixed(1) : 0}%</td></tr>`)
    .join('')

  const lignesCharges = Object.entries(data.chargesParCategorie)
    .sort(([,a],[,b]) => b - a)
    .map(([k,v]) => `<tr><td>${k}</td><td style="text-align:right;font-weight:700;color:#dc2626">${v.toLocaleString('fr')} HTG</td></tr>`)
    .join('')

  const lignesTreso = Object.entries(data.tresorerieParMode)
    .map(([k,v]) => `<tr><td>${k}</td><td style="text-align:right;font-weight:700;color:${v>=0?'#16a34a':'#dc2626'}">${v>=0?'+':''}${v.toLocaleString('fr')} HTG</td></tr>`)
    .join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Rapport Comptable ${data.moisNom} ${data.annee}</title>
<style>${BASE_STYLE}</style></head><body>
<div class="page">
  <div class="watermark">CONFIDENTIEL</div>
  ${clinicHeader(
    `RAPPORT COMPTABLE — ${data.moisNom.toUpperCase()} ${data.annee}`,
    `PCN Haïti · IFRS PME · Généré le ${now} · Assistant IA Comptable`
  )}

  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-val" style="color:#16a34a">+${data.totalProduits.toLocaleString('fr')} HTG</div><div class="kpi-lbl">Total Produits (Cl. 7)</div></div>
    <div class="kpi"><div class="kpi-val" style="color:#dc2626">-${data.totalCharges.toLocaleString('fr')} HTG</div><div class="kpi-lbl">Total Charges (Cl. 6)</div></div>
    <div class="kpi"><div class="kpi-val" style="color:${isPositif?'#16a34a':'#dc2626'}">${isPositif?'+':''}${data.resultatNet.toLocaleString('fr')} HTG</div><div class="kpi-lbl">Résultat Net (${data.ratioMarge}%)</div></div>
    <div class="kpi"><div class="kpi-val" style="color:#1641C8">${data.nbPatients}</div><div class="kpi-lbl">Nouveaux Patients</div></div>
    <div class="kpi"><div class="kpi-val" style="color:#1641C8">${data.nbTransactions}</div><div class="kpi-lbl">Transactions</div></div>
    <div class="kpi"><div class="kpi-val" style="color:${data.ratioCharges<=85?'#16a34a':'#dc2626'}">${data.ratioCharges}%</div><div class="kpi-lbl">Ratio Charges/Produits</div></div>
  </div>

  ${data.anomalies?.length > 0 ? `
  <div class="section" style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:12px">
    <div class="section-title" style="color:#dc2626"> Anomalies Comptables (${data.anomalies.length})</div>
    ${data.anomalies.map(a => `<div style="font-size:12px;color:#dc2626;margin:3px 0">• ${a}</div>`).join('')}
  </div>` : `
  <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px;margin-bottom:14px;font-size:12px;color:#16a34a;font-weight:700">
     Aucune anomalie comptable détectée — Écritures conformes PCN
  </div>`}

  <div class="section">
    <div class="section-title">🤖 Analyse de l'Assistant Comptable IA</div>
    <div style="white-space:pre-wrap;line-height:1.9;font-size:12px;color:#1e293b;background:#f8fafc;border-radius:8px;padding:14px;border:1px solid #e2e8f0">${data.rapport}</div>
  </div>

  ${lignesProduits ? `
  <div class="section">
    <div class="section-title">Produits par Service — Classe 7 PCN</div>
    <table><thead><tr><th>Service / Compte</th><th style="text-align:right">Montant HTG</th><th style="text-align:right">Part %</th></tr></thead>
    <tbody>${lignesProduits}</tbody></table>
  </div>` : ''}

  ${lignesCharges ? `
  <div class="section">
    <div class="section-title">Charges par Catégorie — Classe 6 PCN</div>
    <table><thead><tr><th>Catégorie / Compte</th><th style="text-align:right">Montant HTG</th></tr></thead>
    <tbody>${lignesCharges}</tbody></table>
  </div>` : ''}

  ${lignesTreso ? `
  <div class="section">
    <div class="section-title">Trésorerie par Mode de Paiement — Classe 5 PCN</div>
    <table><thead><tr><th>Mode</th><th style="text-align:right">Solde Net HTG</th></tr></thead>
    <tbody>${lignesTreso}</tbody></table>
  </div>` : ''}

  <div class="signature-box">
    <div>
      <div style="font-size:10px;font-weight:700;color:#374151">Le Comptable / DAF</div>
      <div class="sig-line">Signature &amp; Date</div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:700;color:#374151">La Direction Générale</div>
      <div class="sig-line">Signature &amp; Cachet</div>
    </div>
  </div>

  ${clinicFooter('Document confidentiel · Usage interne uniquement · PCN Haïti + IFRS PME')}
  <button class="btn-print" onclick="window.print()"> Imprimer le rapport</button>
</div>
</body></html>`

  openPrint(html, 870, 1150)
}

// 
// RÉSULTATS DE LABORATOIRE (A4)
// 
export function imprimerResultatLabo(data: {
  patient: { numero: string; nom: string; age?: number; sexe?: string; telephone?: string }
  examens: Array<{
    code?: string; libelle: string; valeur: string
    unite?: string; reference?: string; critique?: boolean; methode?: string
  }>
  prescripteur?: string          // médecin prescripteur (affiché seulement)
  technicien: string             // technicien labo — OBLIGATOIRE — signe le document
  signature_technicien?: string  // base64 PNG signature du technicien
  date?: string
  recu_numero?: string
  notes?: string
}) {
  const dateDoc = data.date
    ? new Date(data.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
    : new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })

  const lignes = data.examens.map(e => `
<tr style="${e.critique ? 'background:#fff0f0;' : ''}">
  ${e.code ? `<td style="font-family:monospace;font-size:11px;color:#64748b">${e.code}</td>` : '<td style="color:#94a3b8">—</td>'}
  <td style="font-weight:600">${e.libelle}</td>
  <td style="font-weight:800;font-family:monospace;font-size:13px;${e.critique ? 'color:#dc2626;' : 'color:#0f172a;'}">${e.valeur}${e.critique ? ' ' : ''}</td>
  <td style="color:#64748b;font-size:12px">${e.unite || '—'}</td>
  <td style="color:#94a3b8;font-size:11px;white-space:nowrap">${e.reference || '—'}</td>
  ${e.methode ? `<td style="color:#94a3b8;font-size:10px">${e.methode}</td>` : ''}
</tr>`).join('')

  const hasCritique = data.examens.some(e => e.critique)
  const now = new Date().toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Résultats Labo — ${data.patient.nom}</title>
<style>
${BASE_STYLE}
.critique-banner{background:#dc2626;color:white;border-radius:8px;padding:10px 16px;margin:12px 0;font-weight:900;font-size:13px;letter-spacing:.5px;text-align:center}
.tech-box{background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:14px 18px;margin-top:18px;display:flex;align-items:center;gap:18px}
.tech-sig{flex:1;text-align:center;border:1px dashed #16a34a;border-radius:8px;padding:10px;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}
.tech-name{font-weight:800;color:#15803d;font-size:13px}
.tech-title{font-size:10px;color:#16a34a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
</style></head><body>
<div class="page">

  <!-- EN-TÊTE OFFICIELLE -->
  <div class="header">
    <div style="display:flex;align-items:center;gap:16px;justify-content:center;margin-bottom:8px">
      <div style="font-size:36px"></div>
      <div>
        <div class="clinic-name">${CLINIQUE.nom}</div>
        <div class="clinic-sub">${CLINIQUE.adresse}</div>
        <div class="clinic-sub">Tél: ${CLINIQUE.tel} · ${CLINIQUE.email}</div>
      </div>
    </div>
    <div style="border-top:2px solid #16a34a;padding-top:10px;text-align:center">
      <div class="doc-title">RÉSULTATS D'ANALYSES DE LABORATOIRE</div>
      <div class="doc-ref">${data.recu_numero ? `Réf: ${data.recu_numero} · ` : ''}Émis le ${now}</div>
    </div>
  </div>

  <!-- INFOS PATIENT + LABO -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
    <div style="background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0">
      <div class="section-title">Patient</div>
      <div class="row"><span class="row-key">N° Dossier</span><span class="row-val" style="font-family:monospace;font-weight:900">${data.patient.numero}</span></div>
      <div class="row"><span class="row-key">Nom</span><span class="row-val">${(data.patient.nom || '').toUpperCase()}</span></div>
      ${data.patient.sexe ? `<div class="row"><span class="row-key">Sexe</span><span class="row-val">${data.patient.sexe}</span></div>` : ''}
      ${data.patient.age ? `<div class="row"><span class="row-key">Âge</span><span class="row-val">${data.patient.age} ans</span></div>` : ''}
      ${data.patient.telephone ? `<div class="row"><span class="row-key">Tél.</span><span class="row-val">${data.patient.telephone}</span></div>` : ''}
    </div>
    <div style="background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0">
      <div class="section-title">Analyse</div>
      <div class="row"><span class="row-key">Date prélèvement</span><span class="row-val">${dateDoc}</span></div>
      <div class="row"><span class="row-key">Technicien</span><span class="row-val">${data.technicien}</span></div>
      ${data.prescripteur ? `<div class="row"><span class="row-key">Prescripteur</span><span class="row-val">${data.prescripteur}</span></div>` : ''}
      <div class="row"><span class="row-key">Nb examens</span><span class="row-val">${data.examens.length}</span></div>
    </div>
  </div>

  <!-- BANNIÈRE VALEURS CRITIQUES -->
  ${hasCritique ? '<div class="critique-banner"> VALEURS CRITIQUES DÉTECTÉES — CONTACTER LE PRESCRIPTEUR IMMÉDIATEMENT</div>' : ''}

  <!-- TABLEAU DES RÉSULTATS -->
  <div class="section">
    <div class="section-title" style="color:#16a34a">Résultats des Analyses</div>
    <table>
      <thead>
        <tr>
          <th style="width:70px">Code</th>
          <th>Examen</th>
          <th style="width:110px">Résultat</th>
          <th style="width:70px">Unité</th>
          <th style="width:120px">Valeurs réf.</th>
        </tr>
      </thead>
      <tbody>${lignes}</tbody>
    </table>
  </div>

  ${data.notes ? `<div style="background:#fef9c3;border-radius:8px;padding:10px 14px;margin-top:10px;font-size:12px;color:#92400e"><strong>Notes:</strong> ${data.notes}</div>` : ''}

  <!-- SIGNATURE TECHNICIEN UNIQUEMENT -->
  <div class="tech-box">
    <div style="flex:1">
      <div class="tech-title"> Document émis par le laboratoire</div>
      <div class="tech-name">${data.technicien}</div>
      <div style="font-size:11px;color:#16a34a;margin-top:2px">Technicien de Laboratoire · ${CLINIQUE.nom}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:4px">Ce document certifie l'exactitude des résultats analysés</div>
    </div>
    <div class="tech-sig">
      <div style="font-size:9px;color:#16a34a;font-weight:700;text-transform:uppercase;margin-bottom:6px">Signature du Technicien</div>
      ${data.signature_technicien
        ? `<img src="${data.signature_technicien}" style="height:55px;max-width:160px;object-fit:contain;margin-bottom:4px" />`
        : '<div style="height:50px;border-bottom:1px solid #16a34a;width:140px;margin-bottom:4px"></div>'}
      <div style="font-size:10px;color:#374151;font-weight:600">${data.technicien}</div>
    </div>
  </div>

  ${clinicFooter('Document confidentiel · Résultats valables 3 mois · Signé par le technicien de laboratoire uniquement')}
  <button class="btn-print" onclick="window.print()"> Imprimer les résultats</button>
</div>
</body></html>`

  openPrint(html, 860, 1150)
}

export function imprimerDocumentMedecin(data: {
  type: 'ordonnance' | 'requete_labo' | 'requete_imagerie' | 'compte_rendu_ecg' | 'compte_rendu_examen' | 'certificat_aptitude' | 'autre'
  titre?: string
  patient: { numero: string; nom: string; age?: number; sexe?: string; telephone?: string; adresse?: string }
  medecin_nom: string
  medecin_specialite?: string
  medecin_email?: string
  signature_medecin?: string   // base64 PNG — OBLIGATOIRE pour valider le document
  contenu: string
  date?: string
  recu_numero?: string
  urgence?: boolean
  notes_pied?: string
}) {
  const TITRES: Record<string, string> = {
    ordonnance:            'ORDONNANCE MÉDICALE',
    requete_labo:          "REQUÊTE D'ANALYSES DE LABORATOIRE",
    requete_imagerie:      "REQUÊTE D'IMAGERIE MÉDICALE",
    compte_rendu_ecg:      'COMPTE RENDU — ÉLECTROCARDIOGRAMME (ECG)',
    compte_rendu_examen:   "COMPTE RENDU D'EXAMEN",
    certificat_aptitude:   "CERTIFICAT D'APTITUDE MÉDICALE",
    autre:                 data.titre || 'DOCUMENT MÉDICAL',
  }
  const titre = TITRES[data.type] || data.titre || 'DOCUMENT MÉDICAL'
  const dateDoc = data.date
    ? new Date(data.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
    : new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
  const now = new Date().toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })

  const isEcg = data.type === 'compte_rendu_ecg' || data.type === 'compte_rendu_examen'
  const isOrd = data.type === 'ordonnance'

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${titre} — ${data.patient.nom}</title>
<style>
${BASE_STYLE}
.rx-symbol{font-size:48px;color:#1641C8;font-weight:900;opacity:0.15;position:absolute;top:160px;right:40px;pointer-events:none}
.content-box{background:#fafafa;border:1px solid #e2e8f0;border-left:4px solid #1641C8;border-radius:0 8px 8px 0;padding:20px 24px;min-height:180px;white-space:pre-wrap;font-size:13px;line-height:2;position:relative}
.urgence-band{background:#dc2626;color:white;border-radius:8px;padding:10px 16px;margin-bottom:12px;text-align:center;font-weight:900;font-size:14px;letter-spacing:1px}
.medecin-sig-box{background:#eff6ff;border:2px solid #1641C8;border-radius:10px;padding:16px 20px;margin-top:20px;display:flex;align-items:flex-start;gap:20px}
.sig-area{flex:0 0 200px;text-align:center}
.sig-img-wrap{border:1px solid #bfdbfe;border-radius:8px;padding:6px;background:white;min-height:75px;display:flex;align-items:center;justify-content:center;margin-bottom:6px}
.medecin-info{flex:1}
.medecin-name{font-size:15px;font-weight:900;color:#1e40af}
.medecin-spec{font-size:12px;color:#3b82f6;margin-top:2px}
.cachet-note{font-size:10px;color:#94a3b8;margin-top:6px;font-style:italic}
.no-sig-warning{background:#fef9c3;border:1px solid #fcd34d;border-radius:6px;padding:6px 10px;font-size:11px;color:#92400e;margin-top:8px;text-align:center}
</style></head><body>
<div class="page" style="position:relative">

  <!-- EN-TÊTE OFFICIELLE -->
  <div class="header">
    <div style="display:flex;align-items:center;gap:16px;justify-content:center;margin-bottom:8px">
      <div style="font-size:36px"></div>
      <div>
        <div class="clinic-name">${CLINIQUE.nom}</div>
        <div class="clinic-sub">${CLINIQUE.adresse}</div>
        <div class="clinic-sub">Tél: ${CLINIQUE.tel} · ${CLINIQUE.email}</div>
      </div>
    </div>
    <div style="border-top:3px solid #1641C8;padding-top:10px;text-align:center">
      <div class="doc-title">${titre}</div>
      <div class="doc-ref">${data.recu_numero ? `Réf: ${data.recu_numero} · ` : ''}${now}</div>
    </div>
  </div>

  ${data.urgence ? '<div class="urgence-band"> URGENT — TRAITEMENT PRIORITAIRE IMMÉDIAT</div>' : ''}

  <!-- INFOS PATIENT + MÉDECIN -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
    <div style="background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0">
      <div class="section-title">Patient</div>
      <div class="row"><span class="row-key">N° Dossier</span><span class="row-val" style="font-family:monospace;font-weight:900">${data.patient.numero}</span></div>
      <div class="row"><span class="row-key">Nom</span><span class="row-val">${(data.patient.nom || '').toUpperCase()}</span></div>
      ${data.patient.sexe ? `<div class="row"><span class="row-key">Sexe</span><span class="row-val">${data.patient.sexe}</span></div>` : ''}
      ${data.patient.age ? `<div class="row"><span class="row-key">Âge</span><span class="row-val">${data.patient.age} ans</span></div>` : ''}
      ${data.patient.telephone ? `<div class="row"><span class="row-key">Tél.</span><span class="row-val">${data.patient.telephone}</span></div>` : ''}
    </div>
    <div style="background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0">
      <div class="section-title">Médecin prescripteur</div>
      <div class="row"><span class="row-key">Médecin</span><span class="row-val">${data.medecin_nom}</span></div>
      ${data.medecin_specialite ? `<div class="row"><span class="row-key">Spécialité</span><span class="row-val">${data.medecin_specialite}</span></div>` : ''}
      <div class="row"><span class="row-key">Date</span><span class="row-val">${dateDoc}</span></div>
    </div>
  </div>

  <!-- CONTENU DU DOCUMENT -->
  <div class="section">
    ${isOrd ? '<div style="font-size:42px;color:#1641C8;opacity:0.12;font-weight:900;margin-bottom:-20px;padding-left:4px">℞</div>' : ''}
    ${isEcg ? '<div class="section-title" style="color:#1641C8">Résultats et Interprétation</div>' : ''}
    <div class="content-box">${data.contenu}</div>
  </div>

  ${data.notes_pied ? `<div style="background:#fef3c7;border-radius:8px;padding:8px 14px;margin-top:8px;font-size:11px;color:#92400e"><em>${data.notes_pied}</em></div>` : ''}

  <!-- SIGNATURE MÉDECIN UNIQUEMENT -->
  <div class="medecin-sig-box">
    <div class="medecin-info">
      <div style="font-size:10px;color:#1641C8;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">
        Document établi et signé par
      </div>
      <div class="medecin-name">${data.medecin_nom}</div>
      ${data.medecin_specialite ? `<div class="medecin-spec">${data.medecin_specialite}</div>` : ''}
      <div style="font-size:11px;color:#64748b;margin-top:6px">${CLINIQUE.nom}</div>
      <div style="font-size:11px;color:#64748b">${CLINIQUE.tel}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:8px;font-style:italic">
        Ce document est valide uniquement avec la signature et le cachet du médecin.
      </div>
    </div>
    <div class="sig-area">
      <div style="font-size:9px;color:#1641C8;font-weight:700;text-transform:uppercase;margin-bottom:4px">Signature &amp; Cachet</div>
      <div class="sig-img-wrap">
        ${data.signature_medecin
          ? `<img src="${data.signature_medecin}" style="height:65px;max-width:175px;object-fit:contain" />`
          : `<div style="text-align:center;color:#94a3b8;font-size:11px;padding:10px">
              <div style="font-size:24px;opacity:0.3"></div>
              <div>Signature requise</div>
             </div>`}
      </div>
      <div style="border-top:1px solid #1641C8;padding-top:4px;font-size:10px;font-weight:700;color:#1e40af">${data.medecin_nom}</div>
      ${!data.signature_medecin ? '<div class="no-sig-warning"> Document non signé</div>' : ''}
    </div>
  </div>

  ${clinicFooter(isOrd
    ? 'Ordonnance valable 1 mois · Document valide uniquement avec signature et cachet du médecin'
    : isEcg
      ? "Compte rendu médical confidentiel · Valide uniquement avec signature du médecin"
      : "Document médical confidentiel · Valide uniquement avec signature et cachet du médecin"
  )}
  <button class="btn-print" onclick="window.print()"> Imprimer</button>
</div>
</body></html>`

  openPrint(html, 860, 1150)
}

// Alias rétrocompatible
export function imprimerOrdonnance(data: Parameters<typeof imprimerDocumentMedecin>[0]) {
  return imprimerDocumentMedecin({ ...data, type: data.type || 'ordonnance' })
}


// 
// TICKET RAPIDE (80mm) — générique pour tout reçu thermique
// 
export function imprimerTicket80mm(data: {
  titre: string
  lignes: Array<{ label: string; valeur: string; gras?: boolean }>
  totalLabel?: string
  totalValeur?: string
  footer?: string
  qrData?: string
}) {
  const now = new Date().toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${data.titre}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;width:80mm;max-width:80mm;margin:0 auto;padding:8px;font-size:11px;color:#111}
.logo{font-size:13px;font-weight:900;color:#1641C8;text-align:center}
.sub{font-size:9px;color:#666;text-align:center;margin-bottom:6px}
.sep{border:none;border-top:1px dashed #ccc;margin:5px 0}
.titre{text-align:center;font-size:13px;font-weight:900;color:#374151;margin:6px 0;text-transform:uppercase}
.row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dotted #e5e7eb;font-size:11px}
.row-key{color:#64748b;flex:1}
.row-val{font-weight:600;text-align:right;flex:1}
.total{background:#f0fdf4;border:2px solid #16a34a;border-radius:6px;padding:7px;text-align:center;margin:7px 0}
.total-val{font-size:18px;font-weight:900;color:#16a34a;font-family:monospace}
.footer-txt{text-align:center;font-size:9px;color:#94a3b8;margin-top:7px;line-height:1.6}
.btn-print{display:block;width:100%;padding:8px;background:#1641C8;color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;font-weight:700;margin-top:8px}
@media print{.btn-print{display:none!important}}
</style></head><body>
<div class="logo"> CLINIQUE DE LA REBECCA</div>
<div class="sub">#44 Rue Rebecca, Pétion-Ville · <a href="tel:+50948585757" className="contact-link">(509) 4858-5757</a><br>${now}</div>
<hr class="sep">
<div class="titre">${data.titre}</div>
<hr class="sep">
${data.lignes.map(l => `<div class="row"><span class="row-key">${l.label}</span><span class="row-val" style="${l.gras ? 'font-weight:900' : ''}">${l.valeur}</span></div>`).join('')}
${data.totalLabel ? `
<hr class="sep">
<div class="total">
  <div style="font-size:9px;font-weight:700;color:#16a34a;text-transform:uppercase;margin-bottom:2px">${data.totalLabel}</div>
  <div class="total-val">${data.totalValeur || ''}</div>
</div>` : ''}
<hr class="sep">
<div class="footer-txt">${data.footer || 'Merci de votre confiance — Clinique de la Rebecca'}</div>
<button class="btn-print" onclick="window.print()"> Imprimer</button>
</body></html>`

  openPrint(html, 420, 700)
}
