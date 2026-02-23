// ═══════════════════════════════════════════════════════════════════════
//  AUDIOVISUAL.JS — Gestion du contenu audiovisuel
//  Rotation des médias de fond (vidéo/image) + Web Audio API + toggle
// ═══════════════════════════════════════════════════════════════════════

// ── Utilitaire : mélange de tableau (Fisher-Yates) ──
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Utilitaire : détection de fichier vidéo ──
function isVideo(path) {
  return /\.(mp4|webm)$/i.test(path);
}

// ═══════════════════════════════════════════════════════════════════════
//  ROTATION MÉDIAS DE FOND
// ═══════════════════════════════════════════════════════════════════════

let layerA, layerB;
let currentLayer = 'A';
let mediaIndex   = 0;
let allMedia     = [];
let photoTimeout = null;

// Initialise le système de double couche pour les transitions de fond
export function initLayers() {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:5vh;left:5vw;width:90vw;height:90vh;z-index:0;overflow:hidden;border:2px solid rgba(0,245,255,0.2);box-shadow:0 0 30px rgba(180,0,255,0.3), inset 0 0 30px rgba(0,0,0,0.5);';
  document.body.insertBefore(container, document.body.firstChild);

  // Supprimer les placeholders HTML (remplacés par les layers dynamiques)
  ['bg-current', 'bg-next-img', 'bg-next-vid'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  layerA = _createLayer();
  layerB = _createLayer();
  container.appendChild(layerA.container);
  container.appendChild(layerB.container);

  layerA.container.style.opacity = '1';
  layerB.container.style.opacity = '0';
}

// Crée un objet layer avec son conteneur div, sa vidéo et son image
function _createLayer() {
  const div = document.createElement('div');
  div.style.cssText = 'position:absolute;top:0;left:0;width:100vw;height:100vh;transition:opacity 1.5s ease-in-out;overflow:hidden;';

  const video = document.createElement('video');
  video.muted      = true;
  video.playsInline = true;
  video.style.cssText = 'position:absolute;top:50%;left:50%;min-width:100vw;min-height:100vh;width:auto;height:auto;transform:translate(-50%,-50%);object-fit:cover;filter:saturate(1.8) hue-rotate(15deg) brightness(0.7);display:none;';

  const img = document.createElement('img');
  img.style.cssText = 'position:absolute;top:50%;left:50%;min-width:100vw;min-height:100vh;width:auto;height:auto;transform:translate(-50%,-50%);object-fit:cover;filter:saturate(1.8) hue-rotate(15deg) brightness(0.7);display:none;';
  img.alt = '';

  div.appendChild(video);
  div.appendChild(img);

  return { container: div, video, img };
}

// Charge et lance un média (vidéo ou image) sur le layer cible
function _playOnLayer(layer, path) {
  if (isVideo(path)) {
    layer.img.style.display   = 'none';
    layer.video.style.display = 'block';
    layer.video.src = path;
    layer.video.load();
    layer.video.play().catch(() => {});
  } else {
    layer.video.style.display = 'none';
    layer.video.pause();
    layer.img.style.display = 'block';
    layer.img.src = path;
  }
}

// Avance au média suivant avec fondu croisé entre les deux layers
function _advanceMedia() {
  if (allMedia.length === 0) return;
  clearTimeout(photoTimeout);

  mediaIndex = (mediaIndex + 1) % allMedia.length;
  const path = allMedia[mediaIndex];

  const incoming = currentLayer === 'A' ? layerB : layerA;
  const outgoing  = currentLayer === 'A' ? layerA : layerB;

  _playOnLayer(incoming, path);

  incoming.container.style.zIndex  = '1';
  outgoing.container.style.zIndex  = '0';
  incoming.container.offsetHeight;           // force reflow → déclenche la transition CSS
  incoming.container.style.opacity = '1';
  outgoing.container.style.opacity  = '0';

  setTimeout(() => { outgoing.video.pause(); }, 1600);

  if (isVideo(path)) {
    incoming.video.onended = () => _advanceMedia();
  } else {
    photoTimeout = setTimeout(() => _advanceMedia(), 5000);
  }

  currentLayer = currentLayer === 'A' ? 'B' : 'A';
}

// Lance la rotation des médias à partir d'une liste de chemins (mélangée)
export function startMedia(paths) {
  allMedia = shuffle([...paths]);
  if (allMedia.length === 0) return;

  const firstPath = allMedia[0];
  _playOnLayer(layerA, firstPath);
  layerA.container.style.opacity = '1';

  if (isVideo(firstPath)) {
    layerA.video.onended = () => _advanceMedia();
  } else {
    photoTimeout = setTimeout(() => _advanceMedia(), 5000);
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  WEB AUDIO API
// ═══════════════════════════════════════════════════════════════════════

let _audioCtx = null;

// Live bindings exportés — mis à jour après initAudioAnalyser()
// main.js les lit directement sans les réassigner
export let analyser = null;
export let freqData = null;

// Initialise l'AnalyserNode — doit être appelé après une interaction utilisateur
export function initAudioAnalyser() {
  if (_audioCtx) return; // déjà initialisé

  _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser  = _audioCtx.createAnalyser();
  analyser.fftSize               = 128; // → 64 bins de fréquence
  analyser.smoothingTimeConstant = 0.8;

  const source = _audioCtx.createMediaElementSource(document.getElementById('bg-audio'));
  source.connect(analyser);
  analyser.connect(_audioCtx.destination);

  freqData = new Uint8Array(analyser.frequencyBinCount);
}

// ═══════════════════════════════════════════════════════════════════════
//  TOGGLE MUSIQUE
// ═══════════════════════════════════════════════════════════════════════

// Branche le listener click sur le bouton music-toggle
export function initMusicToggle() {
  const musicToggle = document.getElementById('music-toggle');
  const bgAudio     = document.getElementById('bg-audio');

  musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();

    // Initialiser l'AudioContext au premier clic (politique autoplay navigateur)
    initAudioAnalyser();
    if (_audioCtx && _audioCtx.state === 'suspended') {
      _audioCtx.resume();
    }

    if (bgAudio.paused) {
      bgAudio.play().catch(() => {});
      musicToggle.classList.add('playing');
    } else {
      bgAudio.pause();
      musicToggle.classList.remove('playing');
    }
  });
}
