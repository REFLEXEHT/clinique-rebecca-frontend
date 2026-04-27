/**
 * translator.ts — Moteur de traduction IA pour Clinique de la Rebecca
 *
 * Fonctionnement :
 * 1. L'utilisateur choisit une langue dans le sélecteur
 * 2. Le moteur collecte tous les textes visibles de la page
 * 3. Il envoie un batch à Claude via /api/translate
 * 4. Claude traduit avec précision médicale (créole haïtien officiel, termes médicaux exacts)
 * 5. Les traductions sont appliquées au DOM et mises en cache localStorage
 * 6. Les appels suivants utilisent le cache (pas de nouvelle requête API)
 */

export type Lang = 'fr' | 'en' | 'es' | 'ht' | 'zh' | 'pt' | 'ar'

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'ht', label: 'Kreyòl',     flag: '🇭🇹' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
]

// ── Cache ────────────────────────────────────────────────────────────────────
const CACHE_VERSION = 'rb_trad_v1'

function cacheKey(text: string, lang: Lang): string {
  // Clé courte : hash simple du texte + langue
  let h = 0
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h + text.charCodeAt(i)) | 0
  }
  return `${CACHE_VERSION}_${lang}_${Math.abs(h)}`
}

function getFromCache(text: string, lang: Lang): string | null {
  try {
    return localStorage.getItem(cacheKey(text, lang))
  } catch { return null }
}

function saveToCache(text: string, lang: Lang, translation: string): void {
  try {
    localStorage.setItem(cacheKey(text, lang), translation)
  } catch {}
}

// ── Sélecteur de nœuds à traduire ────────────────────────────────────────────
// On cible uniquement les nœuds texte visibles, pas les attributs techniques
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'INPUT', 'TEXTAREA', 'SELECT', 'SVG', 'IMG'])
const SKIP_ATTRS = ['data-no-translate', 'data-original']

function getTranslatableNodes(root: Element = document.body): Text[] {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT
      if (SKIP_ATTRS.some(a => parent.hasAttribute(a))) return NodeFilter.FILTER_REJECT
      // Ignorer les nœuds vides ou ne contenant que des espaces
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT
      // Ignorer les nœuds dans l'admin sidebar (textes de navigation)
      if (parent.closest('.goog-te-gadget')) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  let n: Node | null
  while ((n = walker.nextNode())) nodes.push(n as Text)
  return nodes
}

// ── Stockage des textes originaux ────────────────────────────────────────────
const originalTexts = new WeakMap<Text, string>()

function saveOriginals(nodes: Text[]) {
  nodes.forEach(n => {
    if (!originalTexts.has(n)) {
      originalTexts.set(n, n.textContent || '')
    }
  })
}

// ── Traducteur principal ──────────────────────────────────────────────────────
export async function translatePage(lang: Lang, apiBase = '/api'): Promise<void> {
  // Sauvegarder la langue choisie
  try { localStorage.setItem('rb_lang', lang) } catch {}

  if (lang === 'fr') {
    // Restaurer les textes originaux
    const nodes = getTranslatableNodes()
    nodes.forEach(n => {
      const orig = originalTexts.get(n)
      if (orig !== undefined) n.textContent = orig
    })
    document.documentElement.lang = 'fr'
    document.documentElement.dir = 'ltr'
    return
  }

  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'

  const nodes = getTranslatableNodes()
  saveOriginals(nodes)

  // Dédupliquer et filtrer les textes pour minimiser les appels API
  function shouldTranslate(text: string): boolean {
    const t = text.trim()
    if (!t || t.length < 2) return false
    // Numéros de téléphone, codes, prix, pourcentages
    if (/^[\+\d\s\-\.\(\)]+$/.test(t)) return false
    // Emails
    if (/^[\w\.-]+@[\w\.-]+\.[a-z]{2,}$/i.test(t)) return false
    // URLs
    if (/^https?:\/\//.test(t)) return false
    // Codes patient (RB-XXXXX)
    if (/^#?RB-\d+$/.test(t)) return false
    // Dates (2026-01-01, 01/01/2026)
    if (/^\d{1,4}[\-\/]\d{1,2}[\-\/]\d{1,4}$/.test(t)) return false
    // Montants (5 000 HTG, $100)
    if (/^[\$€£]?[\d\s,\.]+(?:\s*(?:HTG|USD|EUR|HTG))?$/.test(t)) return false
    // Noms propres de la clinique (jamais traduire)
    if (t === 'Clinique de la Rebecca' || t === 'Rebecca') return false
    // Heures (07:00, 17h00)
    if (/^\d{1,2}[h:]\d{2}$/.test(t)) return false
    return true
  }

  const uniqueTexts = [...new Set(nodes.map(n => originalTexts.get(n) || n.textContent || '')
    .filter(t => t.trim().length > 0 && shouldTranslate(t)))]

  // Séparer ceux qui sont en cache et ceux qui ne le sont pas
  const needTranslation: string[] = []
  const cached: Map<string, string> = new Map()

  for (const text of uniqueTexts) {
    const hit = getFromCache(text, lang)
    if (hit !== null) {
      cached.set(text, hit)
    } else {
      needTranslation.push(text)
    }
  }

  // Appeler l'API pour les textes non cachés (par batch de 80 max)
  const allTranslations = new Map<string, string>(cached)

  if (needTranslation.length > 0) {
    const BATCH = 80
    for (let i = 0; i < needTranslation.length; i += BATCH) {
      const batch = needTranslation.slice(i, i + BATCH)
      try {
        const res = await fetch(`${apiBase}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: batch, target_lang: lang }),
        })
        if (res.ok) {
          const data = await res.json()
          const translations: string[] = data.translations || batch
          batch.forEach((original, idx) => {
            const translation = translations[idx] || original
            allTranslations.set(original, translation)
            saveToCache(original, lang, translation)
          })
        }
      } catch {
        // En cas d'erreur réseau, utiliser les textes originaux
        batch.forEach(t => allTranslations.set(t, t))
      }
    }
  }

  // Appliquer les traductions au DOM
  nodes.forEach(node => {
    const original = originalTexts.get(node) || node.textContent || ''
    const translation = allTranslations.get(original)
    if (translation && translation !== original) {
      node.textContent = translation
    }
  })
}

/** Langue courante stockée en localStorage */
export function getCurrentLang(): Lang {
  if (typeof window === 'undefined') return 'fr'
  return (localStorage.getItem('rb_lang') as Lang) || 'fr'
}

/** Effacer tout le cache de traduction (utile si le contenu du site change) */
export function clearTranslationCache(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_VERSION))
    keys.forEach(k => localStorage.removeItem(k))
  } catch {}
}
