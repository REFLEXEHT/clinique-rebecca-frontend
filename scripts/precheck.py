#!/usr/bin/env python3
"""
precheck.py — Analyse preventive AVANT git push
Detecte: accolades, apostrophes JSX, fragments orphelins, imports dupliques,
         JSX hors return, const sans init, tableaux corrompus
"""
import re, sys, ast
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).parent.parent
PAGES = list(ROOT.glob("app/**/*.tsx")) + list(ROOT.glob("components/**/*.tsx"))
errors = []

def err(f, msg):
    errors.append(f"  [{f.relative_to(ROOT)}] {msg}")

for f in PAGES:
    src = f.read_text(encoding="utf-8", errors="replace")
    lines = src.splitlines()

    # ── 1. Balance accolades (ignore strings/templates)
    stripped = src
    stripped = re.sub(r'`[^`]*`', '``', stripped)         # template literals
    stripped = re.sub(r'"[^"\n]*"', '""', stripped)        # double quotes
    stripped = re.sub(r"'[^'\n]*'", "''", stripped)        # single quotes
    stripped = re.sub(r'//[^\n]*', '', stripped)           # line comments
    opens  = stripped.count('{')
    closes = stripped.count('}')
    if opens != closes:
        err(f, f"BRACES: {opens} '{{' vs {closes} '}}' (diff={opens-closes:+d})")

    # ── 2. Fragments JSX <> / </>
    open_frags  = len(re.findall(r'(?<![a-zA-Z/=])<>\s*$', src, re.MULTILINE))
    close_frags = len(re.findall(r'</>\s*$', src, re.MULTILINE))
    if open_frags != close_frags:
        err(f, f"FRAGMENT: {open_frags} '<>' vs {close_frags} '</>' (diff={open_frags-close_frags:+d})")

    # ── 3. Apostrophes non echappees dans texte JSX (entre > et <)
    for i, line in enumerate(lines, 1):
        jsxtexts = re.findall(r'>([^<{]+)<', line)
        for t in jsxtexts:
            if "'" in t and t.strip():
                # Allow common French contractions that are fine
                safe = re.sub(r"(d|l|n|j|c|m|qu|aujourd|jusqu)[']", '', t)
                if "'" in safe:
                    err(f, f"L{i}: apostrophe dans texte JSX: {t.strip()[:50]!r}")
                    break

    # ── 4. Imports apres du code (signe de corruption)
    code_started = False
    for i, line in enumerate(lines, 1):
        s = line.strip()
        if not s or s in ("'use client'", '"use client"'):
            continue
        if s.startswith('import '):
            if code_started:
                err(f, f"L{i}: import apres du code (fichier corrompu?): {s[:60]}")
        elif s.startswith('//') or s.startswith('/*') or s.startswith('*'):
            continue
        else:
            code_started = True

    # ── 5. Double declaration const majuscules (tableaux globaux)
    const_names = re.findall(r'\bconst\s+([A-Z_][A-Z_0-9]*)\s*=', src)
    for name, count in Counter(const_names).items():
        if count > 1:
            err(f, f"DUPLICATE: 'const {name}' declare {count} fois")

    # ── 6. Pattern "],<texte>" — fermeture tableau corrompue
    for i, line in enumerate(lines, 1):
        if re.match(r'\s*\],?\s*[a-z\'"]', line) and i > 2:
            prev = lines[i-2].strip()
            if any(k in prev for k in ['emoji', 'value:', 'label:', 'href:', 'icon:']):
                if not re.match(r'\s*\],?\s*(const|let|var|export|import|//)', line):
                    err(f, f"L{i}: tableau corrompu? {line.strip()[:60]!r}")

    # ── 7. JSX inside non-return function context (modal inserted in wrong place)
    # If mustChangePassword appears inside a component that's NOT CaissierPage/etc.
    fn_blocks = re.split(r'\nfunction ', src)
    for block in fn_blocks[1:]:  # skip first (before any function)
        fn_name = block.split('(')[0].strip()
        if fn_name and fn_name[0].isupper() and 'export default' not in fn_name:
            # It's a helper component — check it doesn't use top-level state
            if 'mustChangePassword' in block and 'setMustChangePassword' not in block[:50]:
                # Only flag if it uses mustChangePassword without defining it
                if 'const [mustChangePassword' not in block:
                    err(f, f"MODAL dans mauvais composant: {fn_name}() utilise mustChangePassword")

