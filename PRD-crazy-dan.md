# PRD — Crazy Dan Fan Page

> Document de référence destiné au développement. À transmettre tel quel à Claude Code.

---

## Vision

Page web tribut dédiée au personnage fictif **Crazy Dan** — purement esthétique, sans fonctionnalité utilitaire. L'objectif est de créer une expérience visuelle et sonore immersive dans l'univers **vaporwave**.

---

## Style

- Esthétique **vaporwave** — palette néons : rose `#ff2d78`, cyan `#00f5ff`, violet `#b400ff`
- Fond sombre quasi-noir `#0a0010`
- Scanlines (lignes horizontales semi-transparentes couvrant tout l'écran)
- Grille de perspective fuyante en bas de page
- Effets **glitch** (décalage chromatique, flicker aléatoire)
- Ambiance **uncanny valley** assumée
- **Desktop uniquement** — pas de responsive mobile

---

## Contenu affiché

Uniquement le nom **C R A Z Y   D A N** centré à l'écran, stylisé en grande typographie vaporwave.
Pas de bio, pas de liens, pas de navigation, pas de sections scrollables.

---

## Médias

### Fond (background)

- La page lit un fichier `manifest.json` au chargement pour connaître la liste des médias disponibles
- Rotation **aléatoire automatique** parmi les vidéos et photos du manifest
- Les **vidéos** (`.mp4`) jouent en entier avant de passer au média suivant
- Les **photos** s'affichent pendant **5 secondes** avant de passer au média suivant
- Transition **fondu enchaîné** (cross-fade) entre chaque média
- Les médias sont affichés en `object-fit: cover` plein écran avec filtre vaporwave (saturation élevée, légère rotation de teinte)

### Images flottantes

- Plusieurs images de Crazy Dan flottent sur la page par-dessus le fond
- Elles sont piochées **aléatoirement** dans la liste `images` du `manifest.json` à chaque chargement
- Elles dérivent lentement (animation CSS flottante) et réagissent légèrement au **mouvement de la souris** (parallaxe)

---

## Audio

- Titre : *t e l e p a t h テレパシー能力者 — 永遠に生きる (Live Forever)*
- URL : `https://youtu.be/HtLVMEjnoB8`
- Lecture automatique en fond via un **iframe YouTube caché** (hors viewport, `autoplay=1`, `controls=0`, `loop=1`)

---

## Effets JavaScript

- **Curseur custom** : le curseur natif est masqué, remplacé par un point néon rose
- **Traînée** : suite de points qui suivent le curseur avec un léger retard, dégradé rose → violet → noir, qui se dissipent progressivement
- **Glitch aléatoire** : toutes les quelques secondes, un bref flicker de la page entière (rotation de teinte, variation de luminosité) d'une durée de 50–100ms

---

## Architecture des fichiers

```
/crazy-dan/
│
├── index.html               ← page principale
├── manifest.json            ← généré automatiquement par le script Python
├── generate_manifest.py     ← script à relancer à chaque ajout de média
│
└── /medias                  ← banque de médias, arborescence libre
    ├── /videos
    │   ├── /rotations
    │   │   ├── rotation_1.mp4
    │   │   └── rotation_6.mp4
    │   └── /face_caméra
    │       ├── face_caméra_1.mp4
    │       └── ...
    └── /images
        ├── Simple.jpg
        ├── Original.png
        └── ...
```

---

## Script `generate_manifest.py`

- Scanne **récursivement** tout le dossier `/medias` et ses sous-dossiers, quelle que soit la profondeur
- Classe les fichiers trouvés en deux catégories selon leur extension :
  - **Vidéos** : `.mp4`, `.webm`
  - **Images** : `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Écrit le fichier `manifest.json` à la racine du projet avec les chemins relatifs

Format de sortie attendu :

```json
{
  "videos": [
    "medias/videos/rotations/rotation_1.mp4",
    "medias/videos/face_caméra/face_caméra_1.mp4"
  ],
  "images": [
    "medias/images/Simple.jpg",
    "medias/images/Original.png"
  ]
}
```

> **Workflow utilisateur** : déposer les nouveaux médias n'importe où dans `/medias` → relancer `python generate_manifest.py` → rafraîchir le navigateur.

---

## Contraintes techniques

| Contrainte | Valeur |
|---|---|
| Framework | Aucun — HTML / CSS / JS vanilla pur |
| Hébergement | Local — ouverture directe de `index.html` dans le navigateur |
| Compatibilité | Desktop uniquement |
| Fonts | Google Fonts via CDN |
| Dépendances JS | Aucune librairie externe |
| Audio | YouTube iframe embed |

---

## Hors scope

- Responsive / mobile
- Toute fonctionnalité interactive (boutons, formulaires, navigation)
- Backend, serveur ou base de données
- Analytics ou tracking
