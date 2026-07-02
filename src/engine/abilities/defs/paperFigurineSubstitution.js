// src/engine/abilities/defs/paperFigurineSubstitution.js
//
// Reactive dodge: rolled by Abilities.tryInterceptHit() whenever this ball
// is about to take a hit. On success, swaps a paper figurine in for the
// real body — the incoming hit is voided entirely (no partial damage),
// the ball reappears away from whoever hit it, and gets a short window of
// hard invincibility so it can't just get re-hit the instant it lands.

import CommandQueue from "../../commandQueue.js";
import StatusEffects from "../../statusEffects.js";
import VisualFx from "../fx/visualFx.js";
import Config from "../../../config.js";

// `rechargeMs` is the time to regenerate ONE spent charge — the knob to tune
// how fast substitutions come back. `maxCharges` is how many can be banked.
export default function paperFigurineSubstitution({
  maxCharges = 2,
  rechargeMs = 7500,
  invincibilityMs = 2000,
  minDistance = 280,
  maxDistance = 420,
} = {}) {
  return {
    id: "paperFigurineSubstitution",
    name: "Paper Figurine",
    trigger: "onHit",

    // Consumable charges: every incoming hit spends one (guaranteed dodge —
    // no chance roll). Spent charges refill one at a time, `rechargeMs` apart.
    // Starts full.
    maxCharges,
    charges: maxCharges,
    rechargeMs,
    rechargeRemaining: rechargeMs, // countdown to the NEXT charge (while < max)

    // Per-frame upkeep, driven by abilities.tickCooldowns. Refills one charge
    // whenever the timer elapses and we're below max; sits topped-off at max.
    tick(dtMs) {
      if (this.charges >= this.maxCharges) {
        this.rechargeRemaining = this.rechargeMs;
        return;
      }
      this.rechargeRemaining -= dtMs;
      if (this.rechargeRemaining <= 0) {
        this.charges += 1;
        this.rechargeRemaining = this.rechargeMs;
      }
    },

    onHit({ self, attackerPos }) {
      if (this.charges <= 0) return false; // out of substitutions — hit lands
      this.charges -= 1;

      const from = { x: self.position.x, y: self.position.y };
      const to = pickEscapePosition(
        from,
        attackerPos,
        minDistance,
        maxDistance,
      );

      // Substitution animation: a paper "poof" at the old spot, a streak
      // tracing the swap across to the new spot, and a ring bloom on arrival.
      VisualFx.spawnBurst({
        x: from.x,
        y: from.y,
        color: "#f4a261",
        count: 16,
        maxAge: 400,
      });
      VisualFx.spawnStreak({ from, to, color: "#f4a261", maxAge: 260 });
      VisualFx.spawnRing({
        x: to.x,
        y: to.y,
        color: "#f4a261",
        maxAge: 380,
        maxRadius: 70,
      });

      CommandQueue.push({ type: "teleport", ball: self, to });
      // Invincibility lives purely as a status effect (see statusEffects.js),
      // not a flag on the ball.
      StatusEffects.apply(self, "invincible", { duration: invincibilityMs });

      return true; // hit fully voided
    },
  };
}

function pickEscapePosition(from, attackerPos, minDistance, maxDistance) {
  const awayAngle = Math.atan2(from.y - attackerPos.y, from.x - attackerPos.x);
  const jitter = (Math.random() - 0.5) * 1.2; // +-~34 degrees of spread
  const angle = awayAngle + jitter;
  const dist = minDistance + Math.random() * (maxDistance - minDistance);

  const margin = Config.BALL_RADIUS * 1.5;
  const minX = Config.ARENA_X + margin;
  const maxX = Config.ARENA_X + Config.ARENA_SIZE - margin;
  const minY = Config.ARENA_Y + margin;
  const maxY = Config.ARENA_Y + Config.ARENA_SIZE - margin;

  const x = Math.max(minX, Math.min(maxX, from.x + Math.cos(angle) * dist));
  const y = Math.max(minY, Math.min(maxY, from.y + Math.sin(angle) * dist));
  return { x, y };
}
