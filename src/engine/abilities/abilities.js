// src/engine/abilities/abilities.js
//
// Two kinds of ability live on ball.abilities:
//
//  - trigger: "cooldown"  → fires on its own timer (e.g. Air Bullets).
//    tickCooldowns() drains these every frame.
//
//  - trigger: "onHit"     → reactive, rolled when the ball is about to take
//    a hit (e.g. Paper Figurine Substitution). These are NOT run through
//    Triggers — they need a synchronous true/false answer ("did this
//    consume the hit?") before damage is applied, which a fire-and-forget
//    event bus can't give you cleanly. Whatever resolves damage (see
//    combat.js) calls tryInterceptHit() first and only applies hp loss if
//    it returns false.

import StatusEffects from "../statusEffects.js";
import Sound from "../sound.js";

function tickCooldowns(balls, dtMs) {
  balls.forEach((ball) => {
    if (ball.dead) return;
    ball.abilities.forEach((ability) => {
      // Drain any ability that's mid-cooldown, whatever its trigger type.
      // onHit abilities (e.g. a dodge) reuse this same timer as a recharge
      // gate — the ability sets it in its own onHit and checks it there.
      if (ability.cooldownRemaining > 0) ability.cooldownRemaining -= dtMs;

      // Optional per-frame upkeep — e.g. charge regeneration on a consumable
      // ability. Most abilities don't define this.
      ability.tick?.(dtMs, ball);

      if (ability.trigger !== "cooldown") return;
      if (ability.cooldownRemaining > 0) return;

      const target = nearestEnemy(ball, balls);
      if (!target) return;

      // execute() may return false to say "I chose not to fire this tick"
      // (e.g. no enemy in range). Only start the cooldown on a real cast, so
      // it retries next frame instead of wasting the whole cooldown.
      const fired = ability.execute({ self: ball, target, balls });
      ability.cooldownRemaining = fired === false ? 0 : ability.cooldown;

      // Attack sound (from the sequence data) plays on a real trigger.
      if (fired !== false && ability.sound) Sound.play(ability.sound);
    });
  });
}

// Returns true if some onHit ability consumed the hit (attacker deals no
// damage this time). Hard invincibility (from a prior dodge, etc.) always
// wins without even rolling.
function tryInterceptHit(target, event) {
  if (StatusEffects.has(target, "invincible")) return true;

  // Offer the incoming hit to each reactive ability in turn. The ability
  // itself decides whether it fires — rolling a chance, spending a charge,
  // checking its own cooldown — and returns false to let the hit through.
  // The first one to consume the hit wins.
  for (const ability of target.abilities) {
    if (ability.trigger !== "onHit") continue;
    if (ability.onHit({ self: target, ...event }) !== false) {
      if (ability.sound) Sound.play(ability.sound); // reaction sound from sequence data
      return true;
    }
  }
  return false;
}

function nearestEnemy(self, balls) {
  let best = null;
  let bestDist = Infinity;
  balls.forEach((b) => {
    if (b === self || b.dead) return;
    const d = Math.hypot(b.position.x - self.position.x, b.position.y - self.position.y);
    if (d < bestDist) {
      bestDist = d;
      best = b;
    }
  });
  return best;
}

export default { tickCooldowns, tryInterceptHit };
