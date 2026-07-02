// src/engine/statusEffects.js
//
// `registry` holds effect *types* (behavior + how it should look).
// `ball.statusEffects` holds *instances* of those types with a remaining
// duration. Zones/Links/abilities all just call StatusEffects.apply(...);
// this file owns what actually happens each tick and when an effect
// expires. New effect types go in the registry — nothing else needs to
// change to support them (see draw.js, which reads `visual` generically).

import Survival from "./survival.js";

const registry = {
  invincible: {
    // No onApply/onExpire needed — being "invincible" is simply having this
    // effect active. Code that cares asks StatusEffects.has(ball,
    // "invincible") rather than reading a boolean flag off the ball.
    visual: { color: "#ffd60a", style: "pulse" },
  },

  burn: {
    visual: { color: "#ff6b35", style: "ring" },
    onTick(ball, inst, dtMs) {
      if (Survival.isDecided()) return; // don't let a lingering burn tie the match
      ball.hp -= inst.data.dps * (dtMs / 1000);
    },
  },

  courage: {
    // Sun Bard's Song of Courage buff. No onTick — being "courageous" is just
    // having this effect active; combat.js reads inst.data.damageMult at each
    // damage source and scales the holder's outgoing damage by it.
    visual: { color: "#ffcf5c", style: "pulse" },
  },

  slow: {
    visual: { color: "#5aa9e6", style: "dash" },
    onApply(ball) {
      ball.speedMult = ball.speedMult ?? 1;
    },
    onTick(ball, inst) {
      ball.speedMult = inst.data.factor;
    },
    onExpire(ball) {
      ball.speedMult = 1;
    },
  },
};

function apply(ball, type, { duration, data = {}, stacking = "refresh" } = {}) {
  const existing = ball.statusEffects.find((e) => e.type === type);
  if (existing) {
    if (stacking === "ignore") return;
    existing.remaining = duration; // "refresh" (default)
    Object.assign(existing.data, data);
    return;
  }

  const inst = { type, remaining: duration, data };
  ball.statusEffects.push(inst);
  registry[type]?.onApply?.(ball, inst);
}

// True while `ball` currently has an active instance of `type`. This is the
// single source of truth for "is this effect on?" — no mirrored boolean
// fields on the ball to keep in sync.
function has(ball, type) {
  return ball.statusEffects.some((inst) => inst.type === type);
}

function tick(balls, dtMs) {
  balls.forEach((ball) => {
    if (ball.dead) return;
    ball.statusEffects = ball.statusEffects.filter((inst) => {
      registry[inst.type]?.onTick?.(ball, inst, dtMs);
      inst.remaining -= dtMs;
      if (inst.remaining <= 0) {
        registry[inst.type]?.onExpire?.(ball, inst);
        return false;
      }
      return true;
    });
  });
}

export default { apply, tick, has, registry };
