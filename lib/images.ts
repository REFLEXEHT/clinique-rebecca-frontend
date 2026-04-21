// lib/images.ts
// Placez vos images dans /public/ et référencez-les ici
// OU remplacez par les chaînes base64 depuis /tmp/logo_b64.txt et /tmp/reception_b64.txt

export const LOGO_SRC = '/logo.png'         // Mettre logo dans /public/logo.png
export const LOGO_DARK_SRC = '/logo.png'    // Même logo (blanc sur fond sombre via CSS filter)
export const RECEPTION_SRC = '/reception.jpg' // Photo réception dans /public/reception.jpg

// Fallback SVG logo si l'image ne charge pas
export const LOGO_FALLBACK_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='48' viewBox='0 0 180 48'%3E%3Crect width='36' height='36' x='0' y='6' rx='8' fill='%231641C8'/%3E%3Crect x='14' y='10' width='8' height='28' rx='3' fill='white'/%3E%3Crect x='6' y='18' width='24' height='8' rx='3' fill='rgba(255,255,255,0.7)'/%3E%3Ctext x='44' y='22' font-family='Inter,sans-serif' font-size='11' font-weight='700' fill='%23475569'%3ECLINIQUE DE LA%3C/text%3E%3Ctext x='44' y='38' font-family='Inter,sans-serif' font-size='16' font-weight='900' fill='%231641C8'%3EREBECCA%3C/text%3E%3C/svg%3E`

// Couleurs de la charte graphique
export const BRAND = {
  blue: '#1641C8',
  blue2: '#0f2fa3',
  blueLight: 'rgba(22,65,200,0.09)',
  green: '#22c55e',
  green2: '#16a34a',
  navy: '#0f172a',
}
