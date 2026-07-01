// src/engine/sound.js
//
// Sound-effect bones.
//
// Two kinds of sound:
//   - GLOBAL, universal outcomes (impact, death) — configured right here,
//     played by combat.js as Sound.play("impact") / Sound.play("death").
//   - PER-SEQUENCE attack sounds — NOT configured here. Each ability entry in a
//     sequence carries its own `sound:` path (see the pathway files); the parser
//     attaches it to the ability and the engine plays it on trigger. So the same
//     ability can sound different per ball, and sounds aren't tied to abilities.
//
// play() takes either a global key ("impact"/"death") or a direct path, and is
// a silent no-op if there's no path — so the game runs fine with no audio.
//
// Note on browsers: audio won't actually play until the page has had a user
// gesture (a click or keypress). Since the arena is 0-player, the first sounds
// may be silent until you interact with the window once — this is a browser
// autoplay policy, not a bug here.

const assets = "/src/assets/Sound/";

// Universal, sequence-independent sounds.
const global = {
  impact: assets + "Impact.mp3",
  death: assets + "Death.mp3",
};

let masterVolume = 0.2;
let muted = false;

// One preloaded base Audio per PATH; play() clones it so the same sound can
// overlap with itself (e.g. rapid air bullets).
const cache = new Map();

function audioFor(path) {
  if (!path) return null;
  let audio = cache.get(path);
  if (!audio) {
    audio = new Audio(path);
    audio.preload = "auto";
    cache.set(path, audio);
  }
  return audio;
}

// A spec is either a global key ("impact") or a direct file path.
function resolve(spec) {
  return global[spec] || spec || "";
}

// Warm up sounds. No arg → the global ones; a path → just that path (the parser
// calls this for each sequence attack sound as it builds a ball).
function preload(path) {
  if (path) {
    audioFor(resolve(path));
    return;
  }
  Object.values(global).forEach((p) => audioFor(p));
}

// Play the sound for `spec` (global key or path). Silent no-op if empty.
function play(spec, { volume = 1 } = {}) {
  if (muted) return;
  const b = audioFor(resolve(spec));
  if (!b) return;

  const node = b.cloneNode(); // independent instance so plays can overlap
  node.volume = Math.max(0, Math.min(1, masterVolume * volume));
  // play() can reject (autoplay blocked before first gesture, decode error) —
  // that's expected and harmless here, so swallow it.
  node.play?.().catch(() => {});
}

function setVolume(v) {
  masterVolume = Math.max(0, Math.min(1, v));
}

function setMuted(m) {
  muted = !!m;
}

export default { play, preload, setVolume, setMuted, global };
