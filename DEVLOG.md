# DEVLOG — dan-immersive-experience

## Session 1 — Workflow & Setup GitHub

**Décisions :**
- Workflow retenu : Claude Web génère le code complet → Claude Code applique + push (économie tokens API)
- Claude Code travaille exclusivement sur la branche `dev` — merge manuel vers `main` après validation visuelle
- `CLAUDE.md` = comportement Claude Code (instructions) / fichiers projet = contexte technique
- Intégration GitHub native dans les Projets Claude : sync via bouton "Sync" avant chaque session

**Corrections apportées à CLAUDE.md :**
- Port : `serve.ps1` → 8001, `python -m http.server` → 8000
- `manifest.js` utilise `var MANIFEST_DATA` (pas `const`)
- `generate_manifest.py` doit être lancé depuis `code/`, avec `MEDIA_DIR = "../media"`

**TODO :** aucun.

---

## Session 2 — Optimisations GPU + TextGeometry + Visualiseur Audio

**Décisions :**
- Suppression du bloom sélectif (double composer) → composer unique
- Titre HTML masqué (`display:none`) — remplacé par TextGeometry Three.js

**Paramètres modifiés :**
- `antialias` : `true` → `false`, `pixelRatio` : devicePixelRatio → `1`
- Grille : `80×50` → `30×20` segments
- Particules : `2500` → `1200`
- Pipeline : bloomComposer + finalComposer → RenderPass → RGBShift → GlitchPass → OutputPass

**Bugs résolus :**
- WebGL context lost / CPU 100% : causé par le double composer → supprimé
- CSS orphelin `#bg-current` / `#bg-next` : règles supprimées de `index.html`

**TODO :**
- Supprimer le marker sphère rouge (debug) dans `main.js`
- Distribuer les barres du visualiseur en arc
- Affiner position/taille du titre TextGeometry si besoin

---

## Session 3 — Consolidation DEVLOG + Mise à jour workflow

**Décisions :**
- Les trois fichiers `contexte-conversation_*.md` remplacés par un unique `DEVLOG.md` consolidé
- Nouveau workflow : DEVLOG.md régénéré en fin de chaque session + livré à Claude Code pour commit/push
- Instructions projet mises à jour avec la section "Fin de session"

**TODO :** Supprimer les trois anciens fichiers `contexte-conversation_*.md` du repo.

---

## Session 4 — Restructuration instructions projet + bonnes pratiques workflow

**Décisions :**
- Instructions projet restructurées en deux parties : Partie 1 (bonnes pratiques) / Partie 2 (specs techniques)
- Dossier local renommé `dan-immersive-experience`
- Incident : instructions Claude Code transmises au mauvais projet → rollback `git reset --hard HEAD~1 --force`

**TODO :**
- Supprimer les trois anciens fichiers `contexte-conversation_*.md` du repo (reporté depuis session 3)

---

## Session 5 — Refonte workflow GitHub + création CLAUDE_WEB.md

**Décisions :**
- 1 seule branche dans les fichiers du projet Claude Web : toujours `dev` uniquement
- Exploration GitHub via API publique + copier-coller URL : Claude Web génère l'URL, l'utilisateur la colle
- `REPO.md` abandonné — remplacé par l'approche API GitHub à la demande (plus fiable, zéro maintenance)
- Création `CLAUDE_WEB.md` : instructions architecte Claude Web, séparées de `CLAUDE.md` (Claude Code)
- Règle explicite : `CLAUDE.md` = Claude Code uniquement, jamais de workflow architecte dedans
- `CLAUDE_WEB.md` et `CLAUDE.md` reformatés en style dense/machine (optimisé pour lecture agent)
- Format des blocs "INSTRUCTIONS POUR CLAUDE CODE" optimisé pour parsing agent

**TODO :**
- Supprimer les trois anciens fichiers `contexte-conversation_*.md` du repo (reporté depuis session 3)
- Supprimer le marker sphère rouge (debug) dans `main.js`
- Distribuer les barres du visualiseur en arc

---

## Session 6 — Reprise projet + nettoyage TODO + schéma workflow

**Décisions :**
- Reprise après pause — récap complet du projet et du workflow via DEVLOG
- Rôle de `CLAUDE_WEB.md` clarifié : référence statique (stack, conventions, format livrable) ≠ `DEVLOG.md` (mémoire chronologique)
- Schéma workflow HTML produit dans l'esthétique vaporwave du projet (4 sections : agents, déroulé session, fichiers de référence, TODO)
- TODO vidée intégralement :
  - `contexte-conversation_*.md` : absents du repo et du projet → supprimés du TODO
  - Marker sphère rouge : fait
  - Barres visualiseur en arc : plus d'actualité

**TODO :** aucun.

---

## Paramètres scène actuels (référence)

```
camera.position : (0, 5, 12) — lookAt(0, -1, -5)
renderer        : antialias=false, pixelRatio=1
grille          : PlaneGeometry(60, 40, 30, 20), position (0, -2, -10)
particules      : 1200
visualiseur     : 32 barres
pipeline        : RenderPass → RGBShift → GlitchPass → OutputPass
```
