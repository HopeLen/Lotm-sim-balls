// src/engine/abilities/defs/acrobaticDodge.js
//
// Clown-flavored reaction: rolled by Abilities.tryInterceptHit() when this
// ball is about to be hit. On success it voids the hit and does a quick,
// short SIDESTEP — perpendicular to the incoming shot — rather than the
// Magician's long teleport-away. Unlike Paper Figurine it's gated by a
// cooldown (see the `cooldown`/`cooldownRemaining` fields, drained in
// abilities.js), so it can't dodge every single shot.

import CommandQueue from "../../commandQueue.js";
import VisualFx from "../fx/visualFx.js";
import Config from "../../../config.js";

export default function acrobaticDodge({
  chance = 0.5,
  cooldown = 4000,
  distance = 90,
} = {}) {
  return {
    id: "acrobaticDodge",
    name: "Acrobatic Dodge",
    trigger: "onHit",
    chance,
    cooldown,
    cooldownRemaining: 0, // ready on spawn

    onHit({ self, attackerPos }) {
      if (this.cooldownRemaining > 0) return false; // still recharging
      if (Math.random() >= this.chance) return false; // dodge roll missed

      const from = { x: self.position.x, y: self.position.y };
      const to = sidestep(from, attackerPos, distance);

      VisualFx.spawnStreak({ from, to, color: self.color, maxAge: 180 });
      VisualFx.spawnBurst({
        x: from.x,
        y: from.y,
        color: self.color,
        count: 8,
        maxAge: 250,
      });
      CommandQueue.push({ type: "teleport", ball: self, to });

      this.cooldownRemaining = this.cooldown; // start the recharge
      return true; // hit fully voided
    },
  };
}

// A short hop perpendicular to the incoming line (random left/right),
// clamped to stay inside the arena.
function sidestep(from, attackerPos, distance) {
  const inX = from.x - attackerPos.x;
  const inY = from.y - attackerPos.y;
  const len = Math.hypot(inX, inY) || 1;

  // rotate the incoming direction 90°, then randomly flip to the other side
  let px = -inY / len;
  let py = inX / len;
  if (Math.random() < 0.5) {
    px = -px;
    py = -py;
  }

  const margin = Config.BALL_RADIUS * 1.5;
  const minX = Config.ARENA_X + margin;
  const maxX = Config.ARENA_X + Config.ARENA_SIZE - margin;
  const minY = Config.ARENA_Y + margin;
  const maxY = Config.ARENA_Y + Config.ARENA_SIZE - margin;

  const x = Math.max(minX, Math.min(maxX, from.x + px * distance));
  const y = Math.max(minY, Math.min(maxY, from.y + py * distance));
  return { x, y };
}
