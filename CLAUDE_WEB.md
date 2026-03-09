# CLAUDE_WEB.md — dan-immersive-experience
# Partie 1 générique → voir https://github.com/braurepierre/claude-workflow

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
