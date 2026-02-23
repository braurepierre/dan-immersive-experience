import * as THREE from 'three';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass }      from 'three/addons/postprocessing/ShaderPass.js';
import { GlitchPass }      from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass }      from 'three/addons/postprocessing/OutputPass.js';
import { FontLoader }      from 'three/addons/loaders/FontLoader.js';
import { TextGeometry }    from 'three/addons/geometries/TextGeometry.js';
import {
  shuffle,
  initLayers,
  startMedia,
  initMusicToggle,
  analyser,
  freqData,
} from './audiovisual.js';

// ═══════════════════════════════════════════════
//  CONSTANTES & GLOBALS
// ═══════════════════════════════════════════════

const ROSE   = 0xff2d78;
const CYAN   = 0x00f5ff;
const VIOLET = 0xb400ff;

let mouseX    = window.innerWidth  / 2;
let mouseY    = window.innerHeight / 2;
let mouseNDCx = 0;
let mouseNDCy = 0;

document.addEventListener('mousemove', (e) => {
  mouseX    = e.clientX;
  mouseY    = e.clientY;
  mouseNDCx =  (e.clientX / window.innerWidth)  * 2 - 1;
  mouseNDCy = -(e.clientY / window.innerHeight)  * 2 + 1;
});

// Manifest chargé depuis manifest.js (variable globale — compatible http.server)
const manifest = window.MANIFEST_DATA || { videos: [], images: [] };

// ═══════════════════════════════════════════════
//  THREE.JS — SCENE SETUP
// ═══════════════════════════════════════════════

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 5, 12);
camera.lookAt(0, -1, -5);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1);
renderer.domElement.style.cssText = 'position:fixed;top:0;left:0;z-index:1;pointer-events:none;';
document.body.appendChild(renderer.domElement);

// ═══════════════════════════════════════════════
//  THREE.JS — GRILLE 3D RÉACTIVE
// ═══════════════════════════════════════════════

const gridGeo = new THREE.PlaneGeometry(60, 40, 30, 20);
gridGeo.rotateX(-Math.PI / 2);
const gridMat = new THREE.MeshBasicMaterial({
  color:       VIOLET,
  wireframe:   true,
  transparent: true,
  opacity:     0.25,
});
const grid = new THREE.Mesh(gridGeo, gridMat);
grid.position.set(0, -2, -10);
scene.add(grid);

// Stocker les positions d'origine pour le scroll seamless
const gridOrigZ = new Float32Array(gridGeo.attributes.position.count);
for (let i = 0; i < gridOrigZ.length; i++) gridOrigZ[i] = gridGeo.attributes.position.getZ(i);

const gridOrigX = new Float32Array(gridGeo.attributes.position.count);
for (let i = 0; i < gridOrigX.length; i++) gridOrigX[i] = gridGeo.attributes.position.getX(i);

// Taille d'une cellule pour le scroll seamless
const gridCellZ = 40 / 20;

// ═══════════════════════════════════════════════
//  THREE.JS — IMAGES FLOTTANTES 3D
// ═══════════════════════════════════════════════

const floatingPlanes = [];
const textureLoader  = new THREE.TextureLoader();

function createFloatingImages(imagePaths) {
  const picked = shuffle(imagePaths).slice(0, Math.min(imagePaths.length, 5));

  picked.forEach((src) => {
    textureLoader.load(src, (texture) => {
      const aspect = texture.image.width / texture.image.height;
      const height = 1.5 + Math.random() * 1;
      const width  = height * aspect;

      const geo = new THREE.PlaneGeometry(width, height);
      const mat = new THREE.MeshBasicMaterial({
        map:         texture,
        transparent: true,
        opacity:     0.7,
        side:        THREE.DoubleSide,
        depthWrite:  false,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 4 + 2,
        (Math.random() - 0.5) * 8 - 2
      );

      // Bordure néon cyan
      const border = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.4 })
      );
      mesh.add(border);

      mesh.userData = {
        basePos:  mesh.position.clone(),
        phase:    Math.random() * Math.PI * 2,
        speed:    0.3 + Math.random() * 0.4,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        driftX:   0.5 + Math.random() * 1.5,
        driftY:   0.3 + Math.random() * 0.8,
      };

      scene.add(mesh);
      floatingPlanes.push(mesh);
    });
  });
}

// ═══════════════════════════════════════════════
//  THREE.JS — PARTICULES NÉON
// ═══════════════════════════════════════════════

const PARTICLE_COUNT    = 1200;
const particleGeo       = new THREE.BufferGeometry();
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
const particleColors    = new Float32Array(PARTICLE_COUNT * 3);
const particleSpeeds    = new Float32Array(PARTICLE_COUNT);

const palette = [
  new THREE.Color(ROSE),
  new THREE.Color(CYAN),
  new THREE.Color(VIOLET),
];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particlePositions[i * 3]     = (Math.random() - 0.5) * 40;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 25;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;

  const color = palette[Math.floor(Math.random() * palette.length)];
  particleColors[i * 3]     = color.r;
  particleColors[i * 3 + 1] = color.g;
  particleColors[i * 3 + 2] = color.b;

  particleSpeeds[i] = 0.2 + Math.random() * 0.8;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('color',    new THREE.BufferAttribute(particleColors,    3));

const particleMat = new THREE.PointsMaterial({
  size:            0.06,
  vertexColors:    true,
  transparent:     true,
  opacity:         0.75,
  blending:        THREE.AdditiveBlending,
  depthWrite:      false,
  sizeAttenuation: true,
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ═══════════════════════════════════════════════
//  THREE.JS — VISUALISEUR AUDIO
// ═══════════════════════════════════════════════

const BAR_COUNT      = 64;
const visualizerBars = [];

for (let i = 0; i < BAR_COUNT; i++) {
  const geo = new THREE.BoxGeometry(0.2, 1, 0.2);
  geo.translate(0, 0.5, 0); // origine en bas → scale depuis le bas

  const t     = i / BAR_COUNT;
  const color = new THREE.Color().lerpColors(new THREE.Color(ROSE), new THREE.Color(CYAN), t);
  const mat   = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 });

  const bar   = new THREE.Mesh(geo, mat);
  const angle = (t - 0.5) * Math.PI * 0.8;
  bar.position.set(Math.sin(angle) * 10, -3.5, Math.cos(angle) * 4 - 12);
  bar.lookAt(0, -3.5, -5);

  scene.add(bar);
  visualizerBars.push(bar);
}

// ═══════════════════════════════════════════════
//  THREE.JS — TITRE TEXTE 3D COURBÉ
// ═══════════════════════════════════════════════

const fontLoader = new FontLoader();
fontLoader.load(
  'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/helvetiker_bold.typeface.json',
  (font) => {
    // Lettres avec espacement vaporwave
    const letters = ['C', ' ', 'R', ' ', 'A', ' ', 'Z', ' ', 'Y', ' ', ' ', ' ', 'D', ' ', 'A', ' ', 'N'];
    const radius  = 7;   // même rayon que le visualiseur
    const yPos    = -4.2;   // sous le visualiseur
    const zBase   = -12;  // même profondeur que le visualiseur

    // Arc centré, même amplitude que le visualiseur (PI * 0.8)
    const totalAngle = Math.PI * 0.8;
    const step       = totalAngle / (letters.length - 1);

    letters.forEach((char, i) => {
      if (char === ' ') return; // ignorer les espaces

      const geo = new TextGeometry(char, {
        font,
        size:           0.9,
        depth:          0.15,
        curveSegments:  6,
        bevelEnabled:   false,
      });

      geo.computeBoundingBox();
      const centerOffset = (geo.boundingBox.max.x - geo.boundingBox.min.x) / 2;

      const mat  = new THREE.MeshBasicMaterial({ color: ROSE });
      const mesh = new THREE.Mesh(geo, mat);

      // Position sur l'arc
      const angle = (i / (letters.length - 1) - 0.5) * totalAngle;
      mesh.position.set(
        Math.sin(angle) * radius - centerOffset,
        yPos,
        Math.cos(angle) * 4 + zBase
      );

      // Rotation pour suivre la courbure de l'arc
      mesh.rotation.y = -angle;

      scene.add(mesh);
    });
  }
);

// ═══════════════════════════════════════════════
//  POST-PROCESSING — COMPOSER UNIQUE
//  UnrealBloom global + RGB shift + Glitch + Output
// ═══════════════════════════════════════════════

// Aberration chromatique permanente
const rgbShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount:   { value: 0.0025 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    varying vec2 vUv;
    void main() {
      vec2 offset = amount * vec2(1.0, 0.0);
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;
      float a = texture2D(tDiffuse, vUv).a;
      gl_FragColor = vec4(r, g, b, a);
    }
  `,
};

const rgbPass    = new ShaderPass(rgbShiftShader);
const glitchPass = new GlitchPass();
glitchPass.enabled = false;

// Composer unique — 1 seul rendu par frame
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(rgbPass);
composer.addPass(glitchPass);
composer.addPass(new OutputPass());

// ═══════════════════════════════════════════════
//  GLITCH ALÉATOIRE
// ═══════════════════════════════════════════════

function triggerGlitch() {
  glitchPass.enabled = true;
  glitchPass.goWild  = true;

  const duration = 50 + Math.random() * 100;
  setTimeout(() => {
    glitchPass.enabled = false;
    glitchPass.goWild  = false;
  }, duration);

  setTimeout(triggerGlitch, 2000 + Math.random() * 6000);
}
setTimeout(triggerGlitch, 3000);

// ═══════════════════════════════════════════════
//  CURSEUR CUSTOM & TRAÎNÉE
// ═══════════════════════════════════════════════

const cursorDot    = document.getElementById('cursor-dot');
const trailDots    = [];
const TRAIL_LENGTH = 15;

for (let i = 0; i < TRAIL_LENGTH; i++) {
  const dot = document.createElement('div');
  dot.className = 'trail-dot';
  const t     = i / TRAIL_LENGTH;
  const r     = Math.round(255 - t * 75);
  const g     = Math.round(45  - t * 45);
  const b     = Math.round(120 + t * 135);
  const alpha = 1 - t * 0.9;
  dot.style.background = `rgba(${r}, ${g}, ${b}, ${alpha})`;
  dot.style.boxShadow  = `0 0 ${4 - t * 3}px rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`;
  dot.style.width  = (8 - t * 5) + 'px';
  dot.style.height = (8 - t * 5) + 'px';
  document.body.appendChild(dot);
  trailDots.push({ el: dot, x: mouseX, y: mouseY });
}

function animateCursor() {
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';

  let prevX = mouseX;
  let prevY = mouseY;

  for (let i = 0; i < trailDots.length; i++) {
    const dot  = trailDots[i];
    const ease = 0.3 - (i * 0.015);
    dot.x += (prevX - dot.x) * ease;
    dot.y += (prevY - dot.y) * ease;
    dot.el.style.left = dot.x + 'px';
    dot.el.style.top  = dot.y + 'px';
    prevX = dot.x;
    prevY = dot.y;
  }

  requestAnimationFrame(animateCursor);
}
animateCursor();

// ═══════════════════════════════════════════════
//  BOUCLE D'ANIMATION PRINCIPALE
// ═══════════════════════════════════════════════

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  // ── Données audio (live bindings depuis audiovisual.js) ──
  let avgAudio = 0;
  if (analyser && freqData) {
    analyser.getByteFrequencyData(freqData);
    for (let i = 0; i < freqData.length; i++) avgAudio += freqData[i];
    avgAudio /= freqData.length * 255; // normalisé 0–1
  }

  // ── Grille 3D : scroll + vagues sinusoïdales + réactivité souris + audio ──
  const gridPos      = grid.geometry.attributes.position;
  const scrollOffset = (time * 3) % gridCellZ;
  grid.position.z    = -10 + scrollOffset;

  for (let i = 0; i < gridPos.count; i++) {
    const ox = gridOrigX[i];
    const oz = gridOrigZ[i];

    const wave           = Math.sin(ox * 0.25 + time * 1.5) * Math.cos(oz * 0.15 + time) * 0.6;
    const mouseInfluence = Math.sin(ox * 0.3 + mouseNDCx * 3 + time * 2) * mouseNDCy * 0.4;
    const audioPulse     = avgAudio * 1.5;

    gridPos.setY(i, wave + mouseInfluence + audioPulse);
  }
  gridPos.needsUpdate = true;

  // ── Images flottantes : dérive sinusoïdale + rotation douce + parallaxe souris ──
  floatingPlanes.forEach((mesh) => {
    const d = mesh.userData;
    mesh.position.x = d.basePos.x + Math.sin(time * d.speed + d.phase) * d.driftX + mouseNDCx * 0.8;
    mesh.position.y = d.basePos.y + Math.cos(time * d.speed * 0.7 + d.phase) * d.driftY + mouseNDCy * 0.5;
    mesh.rotation.y = Math.sin(time * d.rotSpeed + d.phase) * 0.3;
    mesh.rotation.x = Math.cos(time * d.rotSpeed * 0.5) * 0.1;
  });

  // ── Particules : rotation globale lente + dérive verticale individuelle ──
  particles.rotation.y = time * 0.03;
  particles.rotation.x = Math.sin(time * 0.02) * 0.1;

  const pPos = particleGeo.attributes.position;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let y = pPos.getY(i) + particleSpeeds[i] * 0.005;
    if (y > 12.5) y = -12.5; // boucle verticale
    pPos.setY(i, y);
  }
  pPos.needsUpdate = true;

  // Taille des particules pulsée par l'audio
  particleMat.size = 0.06 + avgAudio * 0.1;

  // ── Visualiseur audio : hauteur et opacité des barres ──
  for (let i = 0; i < BAR_COUNT; i++) {
    const val         = freqData ? freqData[i] / 255 : 0;
    const targetScale = 0.1 + val * 4;
    visualizerBars[i].scale.y         += (targetScale - visualizerBars[i].scale.y) * 0.15;
    visualizerBars[i].material.opacity = 0.2 + val * 0.6;
  }

  // ── Aberration chromatique modulée par l'audio ──
  rgbPass.uniforms.amount.value = 0.002 + avgAudio * 0.008;

  // ── Rendu — 1 seul composer ──
  composer.render();
}

// ═══════════════════════════════════════════════
//  RESIZE
// ═══════════════════════════════════════════════

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  // bloomPass.resolution fixe — pas de resize
});

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════

function init() {
  initLayers();
  startMedia(manifest.videos);

  if (manifest.images.length > 0) {
    createFloatingImages(manifest.images);
  }

  initMusicToggle();
  animate();
}

init();
