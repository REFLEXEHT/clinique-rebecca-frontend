# Déploiement Frontend — Vercel

## Corrections appliquées

### Bug critique (page blanche)
- `app/layout.tsx` contenait le code du layout admin — remplacé par le layout racine correct avec `<html>`, `<body>`, `AuthProvider` et `Toaster`
- `app/page.tsx` contenait le code d'une page spécialités — remplacé par l'import de `HomeContent`

### Sécurité
- Token JWT : vérification d'expiration côté client avant utilisation
- Redirection 401 protégée (évite boucle si déjà sur /login)
- En-têtes de sécurité ajoutés (X-Frame-Options, X-Content-Type-Options, etc.)

### Performance
- Police Inter chargée via `next/font/google` (optimisation automatique Next.js)
- Font Awesome chargé depuis CDN avec `crossOrigin`

## Variables d'environnement Vercel
| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://clinique-rebecca-api.onrender.com` |

## Commandes
```bash
npm install
npm run build   # Vérifier que le build passe
npm run dev     # Développement local
```
