# Déploiement Frontend — Vercel

## Corrections appliquées

### Bug critique : Erreur 500 sur /register
- `telephone` envoyé comme `null` au lieu de `""` (chaîne vide rejetée par le backend FastAPI)
- Proxy route masque l'URL interne du backend dans les réponses d'erreur

### Bug critique : Boucle infinie sur /admin après connexion
- `app/admin/login/page.tsx` utilisait `useAuthStore` (clé localStorage `token`)
- `app/admin/layout.tsx` utilisait `useAuth`/`AuthContext` (clé localStorage `rb_token`)
- Ces deux systèmes étaient incompatibles → l'admin restait déconnecté même après login
- **Fix** : `admin/login` migré vers `useAuth` (AuthContext) comme tout le reste

### Sécurité
- Token JWT : vérification d'expiration côté client avant utilisation
- Redirection 401 protégée (évite boucle si déjà sur /login)
- En-têtes de sécurité HTTP ajoutés dans `next.config.js` (X-Frame-Options, HSTS, etc.)
- URL interne du backend masquée dans les messages d'erreur du proxy
- `lib/store.ts` (zustand) déprécié — évite le split-brain d'authentification
- Variable `BACKEND_API_URL` côté serveur uniquement (ne commence pas par `NEXT_PUBLIC_`)

## Variables d'environnement Vercel
| Variable | Valeur | Visibilité |
|----------|--------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://clinique-rebecca-api.onrender.com` | Client (dev local seulement) |
| `BACKEND_API_URL` | `https://clinique-rebecca-api.onrender.com` | Serveur uniquement |

## Commandes
```bash
npm install
npm run build   # Vérifier que le build passe
npm run dev     # Développement local
```
