// src/engine/abilities/fx/visualFx.js
//
// Ephemeral, purely-visual particle state. NO ctx calls here — per the
// header comment in render/draw.js, every ctx.* call lives there and
// nowhere else. This file only tracks what particles exist and for how
// long; draw.js is the only thing that paints them.

let particles = []; // { type, x, y, vx, vy, age, maxAge, color, ... }

function spawnBurst({ x, y, color, count = 12, speed = 3, maxAge = 400 }) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const s = speed * (0.5 + Math.random() * 0.5);
    particles.push({
      type: "burst",
      x,
      y,
      vx: Math.cos(angle) * s,
      vy: Math.sin(angle) * s,
      age: 0,
      maxAge,
      color,
      radius: 2 + Math.random() * 2,
    });
  }
}

function spawnRing({ x, y, color, maxAge = 350, maxRadius = 60 }) {
  particles.push({ type: "ring", x, y, age: 0, maxAge, color, maxRadius });
}

// A hit "flash": a white shockwave ring + a colored core that expand and fade
// fast. Used by impact.js to punctuate a landed hit.
function spawnImpact({ x, y, color, maxRadius = 46, maxAge = 220 }) {
  particles.push({ type: "impact", x, y, age: 0, maxAge, color, maxRadius });
}

// A persistent ground circle (e.g. Song of Courage's healing zone): full
// radius for its whole life, fading out near the end. Drawn under the balls
// in its own pass (drawZones), not by drawParticles.
function spawnZone({ x, y, color, radius, maxAge }) {
  particles.push({ type: "zone", x, y, age: 0, maxAge, color, radius });
}

function spawnStreak({ from, to, color, maxAge = 200 }) {
  particles.push({
    type: "streak",
    x: from.x,
    y: from.y,
    tx: to.x,
    ty: to.y,
    age: 0,
    maxAge,
    color,
  });
}

function tick(dtMs) {
  particles.forEach((p) => {
    p.age += dtMs;
    if (p.type === "burst") {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
    }
  });
  particles = particles.filter((p) => p.age < p.maxAge);
}

function list() {
  return particles;
}

export default {
  spawnBurst,
  spawnRing,
  spawnStreak,
  spawnImpact,
  spawnZone,
  tick,
  list,
};
