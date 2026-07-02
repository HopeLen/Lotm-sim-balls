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
import StatusEffects from "./statusEffects.js";

const { Body } = Matter;

// Scale an attacker's outgoing damage by any active buff it holds. Right now
// that's the Sun Bard's "Courage" (Song of Courage), which stores its
// multiplier in inst.data.damageMult; applied at every damage source below so
// the buff boosts a fighter's whole offense, not one specific ability.
function outgoing(attacker, base) {
  const courage = attacker?.statusEffects?.find((e) => e.type === "courage");
  return courage ? base * courage.data.damageMult : base;
}

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
      damage: outgoing(projectile.owner, projectile.damage),
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
  Triggers.on(
    "meleeHit",
    ({ attacker, target, attackerPos, damage, knockback }) => {
      const from = attackerPos ?? { ...attacker.position };
      const dodged = Abilities.tryInterceptHit(target, {
        attacker,
        attackerPos: from,
        damage,
      });
      if (dodged) return;

      // Knock away from where the strike came in.
      land(target, {
        damage: outgoing(attacker, damage),
        knockback: knockback || 0,
        dirX: target.position.x - from.x,
        dirY: target.position.y - from.y,
        color: attacker.color,
      });
    },
  );

  // Ball-to-ball contact. physicsWorld fires this once per collisionStart (each
  // discrete bounce), so a ball carrying an `impactDamage` config (Sun Bard's
  // Dissonant Touch) hurts whatever it touches. Both directions are offered so
  // two impact-damage balls each hit the other.
  Triggers.on("collision", ({ a, b }) => {
    applyImpact(a, b);
    applyImpact(b, a);
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

// Resolve one ball's impact damage against another. Goes through the same
// dodge (tryInterceptHit) + land() path as projectiles and melee, so a
// target's Paper Figurine / Acrobatic Dodge can still void the touch and the
// Courage multiplier still applies. No-op unless `attacker` has an
// `impactDamage` config (stamped by the impactDamage ability at spawn).
function applyImpact(attacker, target) {
  const cfg = attacker.impactDamage;
  if (!cfg || attacker.dead || target.dead) return;
  if (Survival.isDecided()) return;

  const dodged = Abilities.tryInterceptHit(target, {
    attacker,
    attackerPos: { ...attacker.position },
    damage: cfg.damage,
  });
  if (dodged) return;

  land(target, {
    damage: outgoing(attacker, cfg.damage),
    knockback: cfg.knockback || 0,
    // Shove away from the attacker (only matters when knockback > 0; the
    // elastic bounce already separates them otherwise).
    dirX: target.position.x - attacker.position.x,
    dirY: target.position.y - attacker.position.y,
    color: attacker.color,
  });

  // Optional per-ability impact SFX (from the sequence entry's `sound:` slot),
  // on top of the universal impact sound land() already plays.
  if (cfg.sound) Sound.play(cfg.sound);
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
