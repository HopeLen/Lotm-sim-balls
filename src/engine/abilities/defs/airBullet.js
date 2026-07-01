// src/engine/abilities/defs/airBullet.js
//
// Magician-flavored ranged poke: every `cooldown` ms, fire a small
// sensor-body projectile at the nearest enemy. Damage/removal on impact
// is resolved centrally in combat.js, not here — this file only decides
// WHEN and WHERE a bullet is launched.

import CommandQueue from "../../commandQueue.js";

export default function airBullet({
  cooldown = 3000,
  damage = 8,
  speed = 12,
  radius = 9,
  knockback = 7, // slight shove on hit
} = {}) {
  return {
    id: "airBullet",
    name: "Air Bullet",
    trigger: "cooldown",
    cooldown,
    // Stagger the very first cast so two Magician-type balls don't fire
    // in lockstep — otherwise both would shoot on frame 1.
    cooldownRemaining: cooldown * Math.random(),

    execute({ self, target }) {
      const dx = target.position.x - self.position.x;
      const dy = target.position.y - self.position.y;
      const dist = Math.hypot(dx, dy) || 1;
      const dirX = dx / dist;
      const dirY = dy / dist;

      CommandQueue.push({
        type: "spawnProjectile",
        // spawn just outside the caster's own body so it doesn't
        // immediately register a collision against itself
        x: self.position.x + dirX * (self.radius + radius + 2),
        y: self.position.y + dirY * (self.radius + radius + 2),
        vx: dirX * speed,
        vy: dirY * speed,
        radius,
        color: self.color,
        owner: self,
        damage,
        knockback,
      });
    },
  };
}
