// src/engine/abilities/defs/dashStrike.js
//
// Clown-flavored gap-closer: every `cooldown` ms, IF the nearest enemy is
// within `range`, DASH toward them — a visible glide (see dash.js), not a
// blink — and land a melee hit on arrival. Damage is dealt from dash.js via
// the "meleeHit" trigger, so the target's own dodge still gets to react. If
// no enemy is in range (or a dash is already underway) it returns false so
// abilities.js keeps it ready instead of burning the cooldown.

import Dash from "../../dash.js";

export default function dashStrike({
  cooldown = 5000,
  damage = 15,
  range = 340,
  duration = 240,
  knockback = 18, // heavy slam
} = {}) {
  return {
    id: "dashStrike",
    name: "Dash Strike",
    trigger: "cooldown",
    cooldown,
    // Stagger the first possible dash so mirrored Clowns don't lunge in lockstep.
    cooldownRemaining: cooldown * Math.random(),

    execute({ self, target }) {
      if (self.dash) return false; // already mid-dash

      const dx = target.position.x - self.position.x;
      const dy = target.position.y - self.position.y;
      if (Math.hypot(dx, dy) > range) return false; // enemy too far — hold it

      Dash.start(self, { target, damage, duration, knockback });
      return true;
    },
  };
}
