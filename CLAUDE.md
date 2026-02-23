# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vaporwave tribute page for the fictional character **Crazy Dan**. Purely aesthetic — no functional UI, no backend, no interactivity beyond visual effects. Desktop only. See `PRD-crazy-dan.md` for the full product spec.

## Commands

```bash
# Démarrer le serveur local (requis — remplace l'ouverture directe via file://)
cd code
python -m http.server 8000
# puis ouvrir http://localhost:8000 dans le navigateur

# Régénérer le manifeste après ajout/suppression de fichiers dans media/
cd code
python generate_manifest.py
```

## Architecture

Le code est organisé en modules ES séparés servis via `python -m http.server`. Pas de build step.

### Structure des fichiers

```
code/
├── index.html          ← HTML + CSS + importmap (pas de JS inline)
├── manifest.js         ← Manifeste média global (généré par generate_manifest.py)
├── generate_manifest.py
└── js/
    ├── main.js         ← Scène Three.js, grille, particules, visualiseur, bloom, cursor, init()
    └── audiovisual.js  ← Rotation médias de fond (vidéo/image) + Web Audio API + toggle musique
```

### Media pipeline

`media/` → `generate_manifest.py` → `manifest.js` → chargé par `index.html` via `<script>` (non-module)

- `generate_manifest.py` scans `media/` recursively, classifies files by extension (`.mp4`/`.webm` = videos, `.jpg`/`.jpeg`/`.png`/`.gif`/`.webp` = images), excludes the `video frames` directory from images, and writes `manifest.js` as a JS global `const MANIFEST_DATA = {...}`.
- `manifest.json` exists as a duplicate but is **not used** by the page — only `manifest.js` is loaded.
- The JS global `MANIFEST_DATA` has two arrays: `videos` (used for background rotation) and `images` (used for floating overlays).
- `manifest.js` est chargé comme script non-module (`<script src="manifest.js">`) avant `js/main.js`, rendant `window.MANIFEST_DATA` disponible globalement.

### Rendering layers (z-index order)

1. **Background media** (z:0) — Two-layer swap system (`layerA`/`layerB`) for cross-fade transitions. Videos play to completion, photos display for 5s. Only videos from `manifest.videos` are used.
2. **Three.js scene** (z:1) — Full-viewport WebGL canvas containing: 3D reactive grid, floating image planes, neon particle system, and audio visualizer. Post-processing via EffectComposer (glitch/RGB shift shaders + UnrealBloomPass).
3. **Floating images** (z:5) — Rendered as `PlaneGeometry` in the Three.js scene, with 3D rotation and mouse parallax.
4. **Vignette** (z:8) — Radial gradient overlay.
5. **Scanlines** (z:10) — Repeating horizontal lines.
6. **Title** (z:20) — "C R A Z Y  D A N" centered, neon glow, pulse animation.
7. **Custom cursor + trail** (z:9998–9999) — Replaces native cursor with neon dot and trailing particles.

### Audio

Local MP3 file loaded via `<audio>` tag. Playback toggled via pill-style ON/OFF button (bottom-right). Web Audio API `AnalyserNode` connected for real-time frequency data driving the audio visualizer.

### F1 — Bloom (implémenté)

Selective bloom via deux EffectComposers :
- `bloomComposer` (renderToScreen=false) : rend uniquement les objets sur `BLOOM_LAYER` (layer 1) → grille, particules, barres audio
- `finalComposer` : scène complète + `mixPass` (fusion bloom) + RGB shift + GlitchPass + OutputPass
- `bloomPass.strength` modulé par `avgAudio` à chaque frame

## Design tokens

```
Rose:    #ff2d78
Cyan:    #00f5ff
Violet:  #b400ff
Fond:    #0a0010
```

Font: `Monoton` (Google Fonts). All text uses `letter-spacing: 0.3em`.

## Dependencies

- **Three.js** (r169) — loaded via CDN importmap (`three` + `three/addons/`), includes addons:
  - EffectComposer, RenderPass, ShaderPass, GlitchPass, OutputPass
  - **UnrealBloomPass** — bloom volumétrique (F1, implémenté)
  - **Reflector** — sol réfléchissant miroir (F4, à venir)
  - **TextGeometry** + **FontLoader** — titre 3D (F7, à venir)
- Any additional Three.js addon available via `three/addons/` is **allowed and encouraged**
- No build tools, no npm — CDN `<script>` / importmap only

## Allowed external libraries (CDN)

| Librairie | Usage | CDN |
|---|---|---|
| Three.js + all addons | Scène 3D, post-processing | `cdn.jsdelivr.net/npm/three@0.169.0` |
| GSAP | Animations complexes, timelines | `cdn.jsdelivr.net/npm/gsap` |
| Howler.js | Audio avancé (si besoin) | `cdn.jsdelivr.net/npm/howler` |
| Stats.js | Debug FPS (dev only) | `cdn.jsdelivr.net/npm/stats.js` |

> **Règle** : toute librairie doit être chargée via `<script>` CDN ou déclarée dans l'importmap. Aucun `npm install`, aucun fichier local ajouté.

## Constraints

- Requiert `python -m http.server` (Python 3 standard) — la contrainte `file://` est levée
- No responsive/mobile — `overflow: hidden` on body, fixed dimensions
- Comments in French
- Tout nouveau code JS va dans `js/main.js` (Three.js) ou `js/audiovisual.js` (médias/audio)
- `index.html` : HTML + CSS uniquement, pas de JS inline
