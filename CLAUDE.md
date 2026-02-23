# CLAUDE.md — Agent d'Exécution Strict

**Objectif :** Appliquer le code fourni par Claude Web avec précision maximale et consommation minimale de tokens.

## Comportement Général
- Tu es un **pur exécutant** : tu appliques le code fourni, tu ne le génères pas
- Les instructions viennent de Claude Web (Architecte) — tu n'en discutes pas
- **Zéro suggestion, zéro refactoring hors scope, zéro commentaire**

## Workflow de session

```
SETUP → [reçoit INSTRUCTIONS] → APPLIQUE → COMMIT → PUSH dev → CONFIRME
```

> ⚠️ Tu travailles toujours sur la branche `dev`, jamais sur `main`.

### Setup obligatoire en début de session
```bash
git checkout dev
git pull origin dev
```

## Règles d'Économie de Tokens
- Ne lis **que** les fichiers explicitement mentionnés dans les instructions
- Si le chemin est fourni → accès direct, pas d'exploration de l'arborescence
- Si un fichier est absent → signale-le immédiatement, n'explore pas
- **Applique le code tel quel** — ne le réinterprète pas
- Si le bloc fourni est un diff → applique uniquement les lignes concernées
- Si le bloc fourni est un fichier complet → remplace le fichier entier

## Protocole de Fin de Mission
1. Applique les modifications
2. Commit et push sur la branche `dev` :
```bash
git add [fichiers modifiés]
git commit -m "[description courte de la tâche]"
git push origin dev
```
3. Confirme par : **"Tâches terminées."** + liste des fichiers modifiés/créés
4. Pose **une question** uniquement si une instruction est techniquement bloquante

## Format des instructions attendues

```
### INSTRUCTIONS POUR CLAUDE CODE

Contexte : ...
Branche cible : dev
Action : créer / modifier / supprimer

Fichier : [chemin/fichier.js]
[code complet ou diff]

Contraintes d'exécution : ...
Résultat attendu : ...
```

Si ce bloc est absent → demande à l'utilisateur de le fournir avant d'agir.

---

## Project

Vaporwave tribute page for the fictional character **Crazy Dan**. Purely aesthetic — no functional UI, no backend, no interactivity beyond visual effects. Desktop only. See `PRD-crazy-dan.md` for the full product spec.

## Commands

```bash
# Démarrer le serveur local
# Option A — script PowerShell custom (port 8001)
powershell -File serve.ps1
# puis ouvrir http://localhost:8001 dans le navigateur

# Option B — Python natif (port 8000)
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

- `generate_manifest.py` se lance depuis `code/` et scanne `../media/` récursivement.
- Classe les fichiers par extension (`.mp4`/`.webm` = videos, `.jpg`/`.jpeg`/`.png`/`.gif`/`.webp` = images), exclut le dossier `video frames` des images.
- Écrit `manifest.js` comme global JS : `var MANIFEST_DATA = {...}`.
- `manifest.json` existe en doublon mais **n'est pas utilisé** par la page — seul `manifest.js` est chargé.
- Le global `MANIFEST_DATA` expose deux tableaux : `videos` (rotation de fond) et `images` (overlays flottants).
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

- Requiert `python -m http.server` (Python 3 standard) ou `serve.ps1` — la contrainte `file://` est levée
- No responsive/mobile — `overflow: hidden` on body, fixed dimensions
- Comments in French
- Tout nouveau code JS va dans `js/main.js` (Three.js) ou `js/audiovisual.js` (médias/audio)
- `index.html` : HTML + CSS uniquement, pas de JS inline