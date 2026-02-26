# DEVLOG — dan-immersive-experience

---

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
- Instructions projet mises à jour avec la section "Fin de session" — précision ajoutée : le fichier markdown livré à Claude Code doit contenir l'intégralité du message (header "INSTRUCTIONS POUR CLAUDE CODE" inclus)

**TODO :** Supprimer les trois anciens fichiers `contexte-conversation_*.md` du repo.

---

## Session 4 — Restructuration instructions projet + bonnes pratiques workflow

**Décisions :**
- Instructions projet restructurées en deux parties distinctes : Partie 1 (bonnes pratiques transversales) / Partie 2 (spécifications techniques du projet)
- Même restructuration appliquée au projet `voice-input-extension`
- Stratégie retenue pour la maintenance multi-projets : duplication assumée de la Partie 1, mise à jour manuelle en cas d'évolution des bonnes pratiques
- Dossier local renommé `dan-immersive-experience` (sans impact Git)
- Incident : instructions Claude Code transmises au mauvais projet (`voice-input-extension`) → rollback `git reset --hard HEAD~1 --force` appliqué

**TODO :**
- Supprimer les trois anciens fichiers `contexte-conversation_*.md` du repo (reporté depuis session 3)
- Mettre à jour les instructions projet dans Claude avec le nouveau format Partie 1 / Partie 2

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
