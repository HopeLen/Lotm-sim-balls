// src/engine/abilities/registry.js
//
// Maps an ability's string id (as referenced by `def` in a sequence's
// `abilities` array) to the factory that builds it. This is the bridge
// between the pure-data pathway files and the code in defs/ — a sequence
// says `{ def: "airBullet", params: {...} }` and the parser resolves
// "airBullet" here, so the data files never import engine code directly.
//
// To wire up a new ability: write its factory in defs/, import it here,
// and add it to the map. Nothing else needs to change.

import airBullet from "./defs/airBullet.js";
import paperFigurineSubstitution from "./defs/paperFigurineSubstitution.js";
import acrobaticDodge from "./defs/acrobaticDodge.js";
import dashStrike from "./defs/dashStrike.js";
import wallLink from "./defs/wallLink.js";
import doorMaker from "./defs/doorMaker.js";
import impactDamage from "./defs/impactDamage.js";
import songOfCourage from "./defs/songOfCourage.js";

const registry = {
  airBullet,
  paperFigurineSubstitution,
  acrobaticDodge,
  dashStrike,
  wallLink,
  doorMaker,
  impactDamage,
  songOfCourage,
};

export default registry;
