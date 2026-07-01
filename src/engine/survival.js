// src/engine/survival.js
//
// Tracks how many balls are still alive so the LAST remaining ball can be made
// damage-proof. Once a match is decided (one ball left), a lingering "remnant"
// from an already-dead ball — a projectile still in flight, a door's
// damage-over-time, a dash mid-arrival — must not be able to finish off the
// sole survivor and force an accidental tie.
//
// isDecided() recomputes from live HP (not a cached per-frame count), so it's
// correct even when two balls would otherwise drop in the same frame: whichever
// lethal hit resolves first wins, and the second is blocked.

let balls = [];

// Share the (in-place-mutated) balls array once; nothing to update per frame.
function setBalls(list) {
  balls = list;
}

function livingCount() {
  let n = 0;
  for (const b of balls) if (!b.dead && b.hp > 0) n++;
  return n;
}

// True when the match is over bar the shouting — at most one ball still alive.
// Damage sites check this and skip applying damage when it's true.
function isDecided() {
  return livingCount() <= 1;
}

export default { setBalls, isDecided, livingCount };
