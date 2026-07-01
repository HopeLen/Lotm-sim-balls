// src/engine/impact.js
//
// "Game feel" for landed hits: a brief hitstop (impact frames), a white flash
// at the point of contact, and a quick scale-pop on the struck ball. All of it
// scales with the hit's `strength` (its knockback magnitude), so a big dash
// slam freezes and flashes harder than a light air-bullet tap, and zero-impact
// damage (e.g. door damage-over-time) triggers none of it.
//
// Hitstop is counted in whole frames: while freezeFrames > 0 the loop skips the
// simulation but keeps rendering, holding the frame (see loop.js).

import VisualFx from "./abilities/fx/visualFx.js";

let freezeFrames = 0; // remaining hitstop frames
let shake = 0; // current arena-shake magnitude, in screen px

const SHAKE_MAX = 16;

// Register a landed hit on `target` at (x, y). `strength` is the knockback
// magnitude; `color` tints the flash. Everything here scales with strength, so
// a heavy dash slam freezes/flashes/shakes hard and a light tap barely does.
function hit(target, { x, y, color, strength = 0 }) {
  const s = Math.max(0, strength);

  VisualFx.spawnImpact({ x, y, color, maxRadius: 30 + s * 1.2 });

  // white pop on the struck ball, held ~6 frames (see draw.js drawBallAt)
  target.hitFlash = Math.max(target.hitFlash || 0, 6);

  // Hitstop: the "couple frames of pause" on a solid hit. Heavier hits pause
  // longer; a light tap is 1–2 frames. Tune the divisor to taste.
  const frames = Math.min(8, Math.round(s / 4));
  if (frames > freezeFrames) freezeFrames = frames;

  // Arena shake proportional to the hit's power.
  shake = Math.min(SHAKE_MAX, Math.max(shake, s * 0.6));
}

function frozen() {
  return freezeFrames > 0;
}

function stepFreeze() {
  if (freezeFrames > 0) freezeFrames--;
}

// The current per-frame shake offset (screen px), applied by draw.js to the
// arena viewport. Decays a little each call, so calling it once per rendered
// frame animates the shake settling. Returns {x:0,y:0} once it's spent.
function shakeVector() {
  if (shake < 0.15) {
    shake = 0;
    return { x: 0, y: 0 };
  }
  const offset = {
    x: (Math.random() * 2 - 1) * shake,
    y: (Math.random() * 2 - 1) * shake,
  };
  shake *= 0.82;
  return offset;
}

export default { hit, frozen, stepFreeze, shakeVector };
