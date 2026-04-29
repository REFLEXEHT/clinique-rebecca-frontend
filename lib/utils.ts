// lib/utils.ts — Utilitaires partagés

/** Génère un code patient unique ex: #RB-00142 */
export function genererCodePatient(): string {
  const num = Math.floor(Math.random() * 90000) + 10000
  return `#RB-${num}`
}

/** Génère un numéro de reçu ex: REC-20260422-0042 */
export function genererNumeroRecu(): string {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  const seq = String(Math.floor(Math.random()*9000)+1000)
  return `REC-${date}-${seq}`
}

/** Calcule l'âge à partir de la date de naissance */
export function calculerAge(dateNaissance: string): number {
  const naissance = new Date(dateNaissance)
  const auj = new Date()
  let age = auj.getFullYear() - naissance.getFullYear()
  const m = auj.getMonth() - naissance.getMonth()
  if (m < 0 || (m === 0 && auj.getDate() < naissance.getDate())) age--
  return age
}

/** Formate montant en HTG */
export function formatHTG(montant: number): string {
  return montant.toLocaleString('fr') + ' HTG'
}

/** Formate date en français */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

/** Imprime un reçu HTML dans une nouvelle fenêtre */
export function imprimerRecu(data: {
  numero: string
  date: string
  patient_nom: string
  patient_code: string
  patient_tel: string
  service: string
  items: { label: string; prix: number }[]
  total: number
  mode_paiement: string
  caissier: string
  copie?: 'patient' | 'clinique'
}) {
  const copieLabel = data.copie === 'clinique' ? 'COPIE CLINIQUE' : 'COPIE PATIENT'
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Reçu ${data.numero}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Courier New', monospace; font-size:12px; padding:20px; max-width:320px; margin:0 auto; color:#111; }
  .header { text-align:center; border-bottom:2px solid #111; padding-bottom:10px; margin-bottom:10px; }
  .header h1 { font-size:16px; font-weight:bold; }
  .header p { font-size:10px; color:#555; }
  .copie { text-align:center; font-size:10px; font-weight:bold; background:#f0f0f0; padding:3px; margin:6px 0; border:1px dashed #999; }
  .field { display:flex; justify-content:space-between; margin:3px 0; font-size:11px; }
  .field strong { font-weight:bold; }
  .separator { border-top:1px dashed #999; margin:8px 0; }
  .items { margin:8px 0; }
  .item { display:flex; justify-content:space-between; margin:2px 0; font-size:11px; }
  .total { display:flex; justify-content:space-between; font-weight:bold; font-size:13px; border-top:2px solid #111; padding-top:5px; margin-top:5px; }
  .footer { text-align:center; font-size:10px; color:#777; margin-top:10px; border-top:1px solid #ccc; padding-top:8px; }
  .code { text-align:center; font-size:18px; font-weight:bold; letter-spacing:2px; margin:8px 0; }
  @media print { body { max-width:100%; } }
</style>
</head>
<body>
  <div class="header">
    <h1>CLINIQUE DE LA REBECCA</h1>
    <p>Haïti · +509 3888-0000</p>
    <p>cliniquerebecca.ht</p>
  </div>
  <div class="copie">${copieLabel}</div>
  <div class="code">${data.patient_code}</div>
  <div class="separator"></div>
  <div class="field"><span>Reçu N°:</span><strong>${data.numero}</strong></div>
  <div class="field"><span>Date:</span><span>${data.date}</span></div>
  <div class="field"><span>Patient:</span><strong>${data.patient_nom}</strong></div>
  <div class="field"><span>Téléphone:</span><span>${data.patient_tel}</span></div>
  <div class="field"><span>Service:</span><span>${data.service}</span></div>
  <div class="separator"></div>
  <div class="items">
    ${data.items.map(i => `<div class="item"><span>${i.label}</span><span>${i.prix.toLocaleString('fr')} HTG</span></div>`).join('')}
  </div>
  <div class="total"><span>TOTAL</span><span>${data.total.toLocaleString('fr')} HTG</span></div>
  <div class="separator"></div>
  <div class="field"><span>Paiement:</span><span>${data.mode_paiement}</span></div>
  <div class="field"><span>Caissier:</span><span>${data.caissier}</span></div>
  <div class="footer">
    <p>Merci de votre confiance</p>
    <p>Conservez ce reçu comme justificatif</p>
    <p>— Clinique de la Rebecca —</p>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=380,height=600')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

/** Imprime les deux copies (patient + clinique) */
export function imprimerDeuxCopies(data: Parameters<typeof imprimerRecu>[0]) {
  imprimerRecu({ ...data, copie: 'patient' })
  setTimeout(() => imprimerRecu({ ...data, copie: 'clinique' }), 800)
}
