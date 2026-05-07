#!/usr/bin/env python3
"""
precheck.py — Vérification locale avant push vers GitHub
Usage: python3 scripts/precheck.py
Détecte: apostrophes non échappées, braces déséquilibrées, fonctions renommées,
         ternaires Python malformés, attributs de modèle invalides.
"""
import re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FRONTEND_FILES = [
    'app/caissier/page.tsx',
    'app/admin/comptabilite/page.tsx',
    'app/admin/depenses/page.tsx',
    'app/admin/specialistes/page.tsx',
    'app/infirmier/page.tsx',
    'app/labo/page.tsx',
    'app/medecin/dashboard/page.tsx',
    'components/ui/RdvModal.tsx',
    'components/ui/PaiementFlow.tsx',
    'components/ui/SignaturePad.tsx',
    'lib/print.ts',
    'lib/api.ts',
]

# Fonctions renommées — (ancien_nom, nouveau_nom)
RENAMED_FUNCTIONS = [
    ('imprimerFacture',       'imprimerRecuEnregistrement ou imprimerFactureOf'),
    ('imprimerRecu',          'imprimerRecuPaiement'),
    ('imprimerOrdonnance',    'imprimerDocumentMedecin  (ou alias imprimerOrdonnance OK)'),
]

errors = []

# ── Frontend TypeScript / TSX ────────────────────────────────────────────────
for rel in FRONTEND_FILES:
    path = os.path.join(ROOT, rel)
    if not os.path.exists(path):
        continue
    content = open(path, encoding='utf-8').read()
    lines   = content.split('\n')

    # 1. Braces équilibrées { }
    o = content.count('{')
    c = content.count('}')
    if o != c:
        errors.append(f"[BRACES] {rel}: {o} '{{' vs {c} '}}' (diff={o-c:+d})")

    # 2. Backticks équilibrés
    bt = content.count('`')
    if bt % 2 != 0:
        errors.append(f"[BACKTICK] {rel}: nombre impair de backticks ({bt})")

    # 3. Apostrophes dans strings JS single-quoted (ex: 'don't', "d'abord" dans '')
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        # Skip commentaires et texte JSX pur (entre > et <)
        if stripped.startswith('//') or stripped.startswith('*'):
            continue
        # Cherche pattern: 'mot d'autre' — apostrophe casse la string JS
        if re.search(r"(?<!')(?<![>])'[^'<>\n]{0,60}\w'\w[^'<>\n]{0,60}'", stripped):
            # Exclure JSX text content (lignes qui commencent par du JSX)
            if not re.match(r'^[A-Z]|^[a-z](?![^=]*=>)', stripped):
                errors.append(f"[APOSTROPHE] {rel}:{i}: {stripped[:90]}")

    # 4. Fonctions utilisées sous leur ancien nom
    for bad, good in RENAMED_FUNCTIONS:
        if 'imprimerOrdonnance' in bad:
            continue  # alias conservé intentionnellement
        for i, line in enumerate(lines, 1):
            lstripped = line.strip()
            if (bad + '(') in line and \
               not lstripped.startswith('//') and \
               'import' not in line and \
               ('const ' + bad) not in line and \
               ('function ' + bad) not in line and \
               ('export function ' + bad) not in line:
                errors.append(f"[RENAME] {rel}:{i}: '{bad}()' trouvé — utiliser '{good}'")

# ── Backend Python ───────────────────────────────────────────────────────────
BACKEND_ROOT = ROOT.replace('frontend', 'backend')

BACKEND_FILES = [
    'app/routers.py',
    'app/models.py',
    'app/schemas.py',
]

# Attributs qui n'existent pas dans les modèles SQLAlchemy
INVALID_MODEL_ATTRS = [
    ('montant_credit',  'Mouvement — utiliser montant'),
    ('montant_debit',   'Mouvement — utiliser montant'),
    ('nom_medecin',     'TarifMedecin — utiliser medecin_nom'),
]

for rel in BACKEND_FILES:
    path = os.path.join(BACKEND_ROOT, rel)
    if not os.path.exists(path):
        continue
    content = open(path, encoding='utf-8').read()
    lines   = content.split('\n')

    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith('#'):
            continue

        # Ternaire Python double-if malformé
        # Pattern invalide: "val" if condA if condB else y (manque else entre les deux if)
        # Valid: ("sain" if x else "élevé") if cond else "N/A" — on ne le signale pas
        raw_ternaire = re.search(r'["\'\\"]\\s+if\\s+[^(\\n]+\\bif\\b[^(\\n]+\\belse\\b', line)
        is_valid_nested = re.search(r'\\([^)]+\\bif\\b[^)]+\\belse\\b[^)]+\\)\\s+if', line)
        is_in_fstring = '{' in line and '}' in line
        if raw_ternaire and not is_valid_nested and not is_in_fstring:
            errors.append(f"[PY-TERNAIRE] {rel}:{i}: ternaire enchaîné potentiellement invalide")

        # Attributs de modèle invalides
# Attributs de modèle invalides
        for attr, note in INVALID_MODEL_ATTRS:
            if attr in line and '=' not in line.split(attr)[0][-5:]:
                # Ignorer les définitions de colonnes et les commentaires
                if 'Column' not in line and '#' not in line.split(attr)[0]:
                    errors.append(f"[PY-ATTR] {rel}:{i}: '{attr}' — {note}")

# ── Rapport final ────────────────────────────────────────────────────────────
if errors:
    print(f"\n❌  {len(errors)} problème(s) détecté(s) avant push :\n")
    for e in errors:
        print(f"  {e}")
    print("\n→ Corrigez ces erreurs avant git push.\n")
    sys.exit(1)
else:
    print("✅  Vérification OK — tous les fichiers sont propres.")
    sys.exit(0)
