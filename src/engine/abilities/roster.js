// src/engine/abilities/roster.js
//
// Each function here returns the `abilities` array for a named pathway
// build. main.js picks which balls get which roster entry when spawning.
// This is the layer where lore-flavored kits get assembled out of the
// generic primitives (cooldown/onHit abilities, status effects, fx) —
// nothing pathway-specific leaks into the engine files themselves.

import airBullet from "./defs/airBullet.js";
import paperFigurineSubstitution from "./defs/paperFigurineSubstitution.js";

// Fool pathway, Sequence 7 — Magician.
// Kit: a steady ranged poke (Air Bullets) plus a defensive reaction
// (Paper Figurine Substitution) that can turn a killing blow into a
// reposition + brief invincibility window instead.
function foolSequence7Magician() {
  return [
    airBullet({ cooldown: 3000, damage: 8, speed: 7 }),
    paperFigurineSubstitution({ chance: 0.35, invincibilityMs: 2000 }),
  ];
}

export default { foolSequence7Magician };
