// src/pathways/index.js
//
// Aggregates every pathway file into one lookup so callers don't have to
// import 22 modules by hand. `Pathways` maps a pathway's display name to
// its array of 10 sequence objects; getSequence() pulls out a single
// sequence by pathway name + sequence number.

import Fool from "./Fool.js";
import Error from "./Error.js";
import Door from "./Door.js";
import Visionary from "./Visionary.js";
import Sun from "./Sun.js";
import Tyrant from "./Tyrant.js";
import WhiteTower from "./WhiteTower.js";
import HangedMan from "./HangedMan.js";
import Darkness from "./Darkness.js";
import Death from "./Death.js";
import TwilightGiant from "./TwilightGiant.js";
import Demoness from "./Demoness.js";
import RedPriest from "./RedPriest.js";
import Hermit from "./Hermit.js";
import Paragon from "./Paragon.js";
import WheelOfFortune from "./WheelOfFortune.js";
import Mother from "./Mother.js";
import Moon from "./Moon.js";
import Abyss from "./Abyss.js";
import Chained from "./Chained.js";
import BlackEmperor from "./BlackEmperor.js";
import Justiciar from "./Justiciar.js";

// Keyed by the pathway's display `name` field (matches sequence.pathway).
const Pathways = {
  Fool,
  Error,
  Door,
  Visionary,
  Sun,
  Tyrant,
  "White Tower": WhiteTower,
  "Hanged Man": HangedMan,
  Darkness,
  Death,
  "Twilight Giant": TwilightGiant,
  Demoness,
  "Red Priest": RedPriest,
  Hermit,
  Paragon,
  "Wheel of Fortune": WheelOfFortune,
  Mother,
  Moon,
  Abyss,
  Chained,
  "Black Emperor": BlackEmperor,
  Justiciar,
};

// Look up one sequence, e.g. getSequence("Fool", 7) -> the Magician object.
function getSequence(pathwayName, sequenceNumber) {
  const pathway = Pathways[pathwayName];
  if (!pathway) {
    console.warn(`[pathways] unknown pathway "${pathwayName}"`);
    return null;
  }
  const seq = pathway.find((s) => s.sequence === sequenceNumber);
  if (!seq) {
    console.warn(`[pathways] ${pathwayName} has no Sequence ${sequenceNumber}`);
    return null;
  }
  return seq;
}

export { Pathways, getSequence };
export default Pathways;
