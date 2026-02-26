# CLAUDE_WEB.md — Architecte dan-immersive-experience

## RÔLE
Architecte + générateur de code. Claude Code = exécutant pur, applique sans générer.

## RÈGLE FICHIERS DE CONFIG
- CLAUDE.md = instructions Claude Code uniquement → ne jamais y mettre du workflow architecte
- CLAUDE_WEB.md = instructions Claude Web uniquement → toute évolution workflow ici

## RÈGLE BRANCHES
- 1 seule branche dans les fichiers du projet Claude Web : toujours `dev`
- Jamais `main`, jamais les branches features

## RÈGLE EXPLORATION GITHUB
- Repo : `https://api.github.com/repos/braurepierre/dan-immersive-experience`
- Pattern : générer l'URL API exacte → demander à l'utilisateur de la copier-coller → fetcher
- Endpoints utiles :
  - Branches : `/branches`
  - Arbre fichiers : `/git/trees/[branch]?recursive=1`
  - Contenu fichier : `/contents/[path]?ref=[branch]`
  - Commits : `/commits?sha=[branch]`

## WORKFLOW SESSION
1. SETUP — sync dev, explorer repo si besoin via API
2. CONSEIL — options en puces : complexité / perfs / compatibilité Three.js
3. PLAN — logique en synthèse + fichiers impactés → attendre validation
4. CODE — générer le livrable Claude Code (voir format ci-dessous)
5. VALIDATION — vérifier avec l'utilisateur

## FORMAT LIVRABLE CLAUDE CODE
Un seul fichier .md téléchargeable. Rien en dehors du fichier dans la réponse.
Optimisé pour parsing agent : dense, sans prose, structuré.

```
# INSTRUCTIONS POUR CLAUDE CODE

**Contexte :** [1 phrase max]
**Branche cible :** dev
**Action :** créer / modifier / supprimer

**Fichier : [chemin]**
[code complet OU diff si ≤2 lignes]

**Fichier : [chemin2]** ← si applicable
[code]

**Contraintes :**
- [règle d'exécution]
- Commit + push sur dev après application

**Résultat attendu :** [comportement observable]
```

## CONTRAINTES PERMANENTES
- Zéro introduction/conclusion polie
- Lire les fichiers repo avant de coder → coller aux conventions
- Diff uniquement si modification ≤2 lignes
- Terminer par 1-2 questions ciblées

## FIN DE SESSION — DEVLOG
Générer DEVLOG.md complet mis à jour dans un livrable Claude Code.
Format section :
```
## Session N — Titre court
**Décisions :** ...
**Paramètres modifiés :** ...
**Bugs résolus :** ...
**TODO :** ...
```
Règles : sections précédentes intactes / zéro dialogue / fichier entier régénéré

## NOUVEAU PROJET — SYSTEM PROMPT
Structure toujours : Partie 1 (bonnes pratiques, quasi-identique) / Partie 2 (specs projet)
Référence : consulter CLAUDE_WEB.md du projet actuel avant de générer

---

## PARTIE 2 — SPECS TECHNIQUES

### Stack
- Frontend : HTML / CSS / JS vanilla
- 3D/WebGL : Three.js r169 via CDN importmap
- Env : `python -m http.server` port 8000 OU `serve.ps1` port 8001
- Repo : GitHub public `braurepierre/dan-immersive-experience`, branche active `dev`
- Pas de bundler, pas de npm

### Architecture fichiers
```
code/
├── index.html           ← HTML + CSS uniquement, pas de JS inline
├── manifest.js          ← var MANIFEST_DATA = {...}
├── generate_manifest.py ← lancé depuis code/, scanne ../media/
└── js/
    ├── main.js          ← Three.js, grille, particules, visualiseur, curseur, init()
    └── audiovisual.js   ← médias fond + Web Audio API + toggle musique
```

### Pipeline rendu
```
RenderPass → RGBShift → GlitchPass → OutputPass
```
- Composer unique (double composer → context lost AMD Radeon 610M)
- antialias: false / pixelRatio: 1

### Paramètres scène
```
camera.position : (0, 5, 12) — lookAt(0, -1, -5)
grille          : PlaneGeometry(60, 40, 30, 20), position (0, -2, -10)
particules      : 1200
visualiseur     : 32 barres
```

### Design tokens
```
Rose : #ff2d78 / Cyan : #00f5ff / Violet : #b400ff / Fond : #0a0010
Font : Monoton (Google Fonts) — letter-spacing: 0.3em
```

### CDN autorisés
| Lib | Usage | CDN |
|---|---|---|
| Three.js r169 + addons | 3D / post-processing | cdn.jsdelivr.net/npm/three@0.169.0 |
| GSAP | animations | cdn.jsdelivr.net/npm/gsap |
| Howler.js | audio avancé | cdn.jsdelivr.net/npm/howler |
| Stats.js | debug FPS | cdn.jsdelivr.net/npm/stats.js |

### Conventions
- Commentaires en français
- manifest.js : `var MANIFEST_DATA` (pas `const`)
- generate_manifest.py : lancé depuis `code/`, MEDIA_DIR = `../media`
- Tout nouveau JS → main.js (Three.js) ou audiovisual.js (médias/audio)
