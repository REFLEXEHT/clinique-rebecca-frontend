/**
 * lib/print.ts — Module d'impression universel Clinique de la Rebecca
 * Tous les documents imprimables passent par ce module.
 */

const CLINIQUE = {
  nom:       'CLINIQUE DE LA REBECCA',
  adresse:   '#44 Rue Rebecca, Pétion-Ville, Haïti',
  tel:       '(509) 4858-5757',
  email:     'clinique.rebecca@gmail.com',
  nif:       'NIF: 006-240-1234-5',
  logo:      '🏥',
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
    alert("⚠️ Autorisez les popups pour ce site afin d'imprimer les documents.")
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
  <div class="clinic-name">${CLINIQUE.logo} ${CLINIQUE.nom}</div>
  <div class="clinic-sub">${CLINIQUE.adresse} · ${CLINIQUE.tel} · ${CLINIQUE.email}</div>
  <div class="clinic-sub">${CLINIQUE.nif}</div>
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

// ─────────────────────────────────────────────────────────────────────────────
// REÇU D'ENREGISTREMENT (caissier → nouveau patient)
// ─────────────────────────────────────────────────────────────────────────────
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
    especes: '💵 Espèces', moncash: '📱 MonCash', natcash: '📲 NatCash',
    carte: '💳 Carte bancaire', zelle: '🇺🇸 Zelle (USD)'
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
  <div style="font-size:9px;font-weight:700;color:#1641C8;text-transform:uppercase;margin-bottom:3px">🎫 Ticket Infirmière</div>
  <div class="ticket-num">#${data.ticket}</div>
</div>

<hr style="border:none;border-top:1px dashed #ccc;margin:6px 0">
<div class="row"><span class="row-key">Patient</span><span class="row-val">${data.patient.nom?.toUpperCase()}</span></div>
<div class="row"><span class="row-key">Tél.</span><span class="row-val">${data.patient.telephone || '—'}</span></div>
<div class="row"><span class="row-key">Service</span><span class="row-val">${data.service}</span></div>
${data.medecin_nom ? `<div class="row"><span class="row-key">Praticien</span><span class="row-val">${data.medecin_nom}</span></div>` : ''}
<div class="row"><span class="row-key">Priorité</span><span class="row-val">${data.priorite === 'urgent' ? '🔴 URGENT' : '🟢 Normal'}</span></div>
<div class="row"><span class="row-key">Mode paiement</span><span class="row-val">${modeLabel[mode] || mode}</span></div>
${data.recu_numero ? `<div class="row"><span class="row-key">N° Reçu</span><span class="row-val" style="font-family:monospace">${data.recu_numero}</span></div>` : ''}

<hr style="border:none;border-top:1px dashed #ccc;margin:6px 0">
${data.montant > 0 ? `
<div class="total-box">
  <div class="total-lbl">Montant Payé</div>
  <div class="total-htg">${Number(data.montant).toLocaleString('fr-FR')} HTG</div>
</div>` : `
<div style="text-align:center;font-size:10px;color:#d97706;font-weight:700;margin:8px 0;padding:8px;background:#fef9c3;border-radius:6px">
  ⚠️ Paiement à effectuer à la caisse
</div>`}
<hr style="border:none;border-top:1px dashed #ccc;margin:6px 0">
<div style="text-align:center;font-size:9px;color:#94a3b8;line-height:1.7">
  Présentez ce ticket à l'infirmière<br>
  Conservez ce reçu comme justificatif<br>
  Merci de votre confiance
</div>
<button class="btn-print" onclick="window.print()">🖨 Imprimer ce reçu</button>
</body></html>`

  openPrint(html, 420, 720)
}

// ─────────────────────────────────────────────────────────────────────────────
// REÇU DE PAIEMENT (transaction isolée)
// ─────────────────────────────────────────────────────────────────────────────
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
    especes: '💵 Espèces', moncash: '📱 MonCash', natcash: '📲 NatCash',
    carte: '💳 Carte bancaire', zelle: '🇺🇸 Zelle (USD)'
  }
  const refNum = p.recu_numero || p.numero_piece || '—'
  const now = new Date().toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reçu ${refNum}</title>
<style>${BASE_STYLE}body{width:80mm;max-width:80mm;font-size:12px}</style></head><body>
<div style="font-size:14px;font-weight:900;color:#1641C8;text-align:center">${CLINIQUE.logo} CLINIQUE DE LA REBECCA</div>
<div style="font-size:9px;color:#666;text-align:center;margin-bottom:4px">${CLINIQUE.tel}</div>
<div style="font-size:10px;font-weight:700;text-align:center;color:#374151;margin-bottom:6px">📋 REÇU DE PAIEMENT · ${now}</div>
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
<button class="btn-print" onclick="window.print()">🖨 Imprimer le reçu</button>
</body></html>`

  openPrint(html, 420, 640)
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTURE OFFICIELLE (A4 — pour remboursement assurance)
// ─────────────────────────────────────────────────────────────────────────────
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
      <div class="row"><span class="row-key">NIF</span><span class="row-val">${CLINIQUE.nif}</span></div>
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
    <div class="row"><span class="row-key">Statut</span><span class="row-val"><span class="badge badge-green">✅ ACQUITTÉ</span></span></div>
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
  <button class="btn-print" onclick="window.print()">🖨 Imprimer la facture officielle</button>
</div>
</body></html>`

  openPrint(html, 820, 1100)
}

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICAT MÉDICAL
// ─────────────────────────────────────────────────────────────────────────────
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
  <button class="btn-print" onclick="window.print()">🖨 Imprimer le certificat</button>
</div>
</body></html>`

  openPrint(html, 820, 1100)
}

// ─────────────────────────────────────────────────────────────────────────────
// RAPPORT COMPTABLE A4 (avec données IA)
// ─────────────────────────────────────────────────────────────────────────────
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
    <div class="section-title" style="color:#dc2626">⚠️ Anomalies Comptables (${data.anomalies.length})</div>
    ${data.anomalies.map(a => `<div style="font-size:12px;color:#dc2626;margin:3px 0">• ${a}</div>`).join('')}
  </div>` : `
  <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px;margin-bottom:14px;font-size:12px;color:#16a34a;font-weight:700">
    ✅ Aucune anomalie comptable détectée — Écritures conformes PCN
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
  <button class="btn-print" onclick="window.print()">🖨 Imprimer le rapport</button>
</div>
</body></html>`

  openPrint(html, 870, 1150)
}
