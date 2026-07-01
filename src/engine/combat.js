// src/engine/combat.js
//
// The single place damage actually gets applied. physicsWorld.js only
// detects contact and fires triggers — it doesn't know what a "hit" means
// gameplay-wise. This file owns that: check for a dodge, apply hp loss,
// spawn the impact fx, queue projectile cleanup. Call init() once at boot.

import Triggers from "./triggers.js";
import Abilities from "./abilities/abilities.js";
import CommandQueue from "./commandQueue.js";
import VisualFx from "./abilities/fx/visualFx.js";
import Impact from "./impact.js";
import Sound from "./sound.js";
import Survival from "./survival.js";

const { Body } = Matter;

function init() {
  Triggers.on("projectileHit", ({ projectile, target }) => {
    CommandQueue.push({ type: "removeProjectile", body: projectile.body });

    const dodged = Abilities.tryInterceptHit(target, {
      attacker: projectile.owner,
      attackerPos: { ...projectile.owner.position },
      damage: projectile.damage,
    });
    if (dodged) return;

    // Knock in the direction the bullet was travelling.
    const v = projectile.body.velocity;
    land(target, {
      damage: projectile.damage,
      knockback: projectile.knockback || 0,
      dirX: v.x,
      dirY: v.y,
      color: projectile.color,
    });
  });

  Triggers.on("projectileExpire", ({ projectile }) => {
    CommandQueue.push({ type: "removeProjectile", body: projectile.body });
  });

  // Melee/dash hits go through the same interception + damage path as
  // projectiles, so a target's dodge (e.g. Paper Figurine) still gets to
  // react. `attackerPos` is where the strike lands from — used by dodges
  // that reposition away from the attacker.
  Triggers.on("meleeHit", ({ attacker, target, attackerPos, damage, knockback }) => {
    const from = attackerPos ?? { ...attacker.position };
    const dodged = Abilities.tryInterceptHit(target, {
      attacker,
      attackerPos: from,
      damage,
    });
    if (dodged) return;

    // Knock away from where the strike came in.
    land(target, {
      damage,
      knockback: knockback || 0,
      dirX: target.position.x - from.x,
      dirY: target.position.y - from.y,
      color: attacker.color,
    });
  });

  Triggers.on("death", ({ ball }) => {
    VisualFx.spawnBurst({
      x: ball.position.x,
      y: ball.position.y,
      color: ball.color,
      count: 24,
      speed: 5,
      maxAge: 600,
    });
    Sound.play("death");
    CommandQueue.push({ type: "remove", ball });
  });
}

// Apply one landed hit: hp loss, knockback impulse (a burst of speed in the
// hit direction that maintainSpeed then decays back to cruise), and the impact
// feedback (flash + hitstop, scaled by knockback). Damage sources that pass
// knockback: 0 (e.g. doors) still deal damage but cause no shove or hitstop.
function land(target, { damage, knockback, dirX, dirY, color }) {
  // Match already decided: the lone survivor is damage-proof, so a remnant hit
  // (a still-in-flight projectile or arriving dash) just fizzles on it.
  if (Survival.isDecided()) return;

  target.hp -= damage;

  if (knockback > 0) {
    const len = Math.hypot(dirX, dirY) || 1;
    Body.setVelocity(target.body, {
      x: (dirX / len) * knockback,
      y: (dirY / len) * knockback,
    });
  }

  VisualFx.spawnBurst({
    x: target.position.x,
    y: target.position.y,
    color,
    count: 9,
    maxAge: 280,
  });
  Impact.hit(target, {
    x: target.position.x,
    y: target.position.y,
    color,
    strength: knockback,
  });
  Sound.play("impact");
}

export default { init };
