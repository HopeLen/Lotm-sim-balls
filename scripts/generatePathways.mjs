// scripts/generatePathways.mjs
//
// One-time scaffold generator for src/pathways/*.js — run with:
//     node scripts/generatePathways.mjs
//
// It writes one file per standard pathway, each exporting an array of the
// pathway's 10 sequences (Sequence 9 down to Sequence 0) as data objects
// that the sequence parser turns into playable balls.
//
// IDEMPOTENT: it will NOT overwrite a pathway file that already exists, so
// re-running after you've hand-edited a pathway is safe (it only fills in
// missing files). Delete a file and re-run to regenerate just that one.

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "src", "pathways");

// --- the canonical data table --------------------------------------------
// sequences are listed Sequence 9 first ... Sequence 0 last.
// `file` is the PascalCase module/filename; `name` is the display name.
const PATHWAYS = [
  { file: "Fool", name: "Fool", group: "Lord of Mysteries", color: "#e63946",
    sequences: ["Seer", "Clown", "Magician", "Faceless", "Marionettist", "Bizarro Sorcerer", "Scholar of Yore", "Miracle Invoker", "Attendant of Mysteries", "Fool"] },
  { file: "Error", name: "Error", group: "Lord of Mysteries", color: "#6d597a",
    sequences: ["Marauder", "Swindler", "Cryptologist", "Prometheus", "Dream Stealer", "Parasite", "Mentor of Deceit", "Trojan Horse of Destiny", "Worm of Time", "Error"] },
  { file: "Door", name: "Door", group: "Lord of Mysteries", color: "#4361ee",
    sequences: ["Apprentice", "Trickmaster", "Astrologer", "Scribe", "Traveler", "Secrets Sorcerer", "Wanderer", "Planeswalker", "Key of Stars", "Door"] },
  { file: "Visionary", name: "Visionary", group: "God Almighty", color: "#7209b7",
    sequences: ["Spectator", "Telepathist", "Psychiatrist", "Hypnotist", "Dreamwalker", "Manipulator", "Dream Weaver", "Discerner", "Author", "Visionary"] },
  { file: "Sun", name: "Sun", group: "God Almighty", color: "#f4a261",
    sequences: ["Bard", "Light Suppliant", "Solar High Priest", "Notary", "Priest of Light", "Unshadowed", "Justice Mentor", "Lightseeker", "White Angel", "Sun"] },
  { file: "Tyrant", name: "Tyrant", group: "God Almighty", color: "#0096c7",
    sequences: ["Sailor", "Folk of Rage", "Seafarer", "Wind-blessed", "Ocean Songster", "Cataclysmic Interrer", "Sea King", "Calamity", "Thunder God", "Tyrant"] },
  { file: "WhiteTower", name: "White Tower", group: "God Almighty", color: "#8ecae6",
    sequences: ["Reader", "Student of Ratiocination", "Detective", "Polymath", "Mysticism Magister", "Prophet", "Cognizer", "Wisdom Angel", "Omniscient Eye", "White Tower"] },
  { file: "HangedMan", name: "Hanged Man", group: "God Almighty", color: "#6c757d",
    sequences: ["Secrets Suppliant", "Listener", "Shadow Ascetic", "Rose Bishop", "Shepherd", "Black Knight", "Trinity Templar", "Profane Presbyter", "Dark Angel", "Hanged Man"] },
  { file: "Darkness", name: "Darkness", group: "Eternal Darkness", color: "#5c677d",
    sequences: ["Sleepless", "Midnight Poet", "Nightmare", "Soul Assurer", "Spirit Warlock", "Nightwatcher", "Horror Bishop", "Servant of Concealment", "Knight of Misfortune", "Darkness"] },
  { file: "Death", name: "Death", group: "Eternal Darkness", color: "#8d99ae",
    sequences: ["Corpse Collector", "Gravedigger", "Spirit Medium", "Spirit Guide", "Gatekeeper", "Undying", "Ferryman", "Death Consul", "Pale Emperor", "Death"] },
  { file: "TwilightGiant", name: "Twilight Giant", group: "Eternal Darkness", color: "#d4a373",
    sequences: ["Warrior", "Pugilist", "Weapon Master", "Dawn Paladin", "Guardian", "Demon Hunter", "Silver Knight", "Glory", "Hand of God", "Twilight Giant"] },
  { file: "Demoness", name: "Demoness", group: "Calamity of Destruction", color: "#d00000",
    sequences: ["Assassin", "Instigator", "Witch", "Pleasure", "Affliction", "Despair", "Unaging", "Catastrophe", "Apocalypse", "Demoness"] },
  { file: "RedPriest", name: "Red Priest", group: "Calamity of Destruction", color: "#9d0208",
    sequences: ["Hunter", "Provoker", "Pyromaniac", "Conspirer", "Reaper", "Iron-blooded Knight", "War Bishop", "Weather Warlock", "Conqueror", "Red Priest"] },
  { file: "Hermit", name: "Hermit", group: "Demon of Knowledge", color: "#3a5a40",
    sequences: ["Mystery Pryer", "Melee Scholar", "Warlock", "Scrolls Professor", "Constellations Master", "Mysticologist", "Clairvoyant", "Sage", "Knowledge Emperor", "Hermit"] },
  { file: "Paragon", name: "Paragon", group: "Demon of Knowledge", color: "#ffb703",
    sequences: ["Savant", "Archaeologist", "Appraiser", "Artisan", "Astronomer", "Alchemist", "Arcane Scholar", "Knowledge Magister", "Illuminator", "Paragon"] },
  { file: "WheelOfFortune", name: "Wheel of Fortune", group: "Key of Light", color: "#52b788",
    sequences: ["Monster", "Robot", "Lucky One", "Calamity Priest", "Winner", "Misfortune Mage", "Chaoswalker", "Soothsayer", "Snake of Mercury", "Wheel of Fortune"] },
  { file: "Mother", name: "Mother", group: "Goddess of Origin", color: "#588157",
    sequences: ["Planter", "Doctor", "Harvest Priest", "Biologist", "Druid", "Classical Alchemist", "Pallbearer", "Desolate Matriarch", "Naturewalker", "Mother"] },
  { file: "Moon", name: "Moon", group: "Goddess of Origin", color: "#b5179e",
    sequences: ["Apothecary", "Beast Tamer", "Vampire", "Potions Professor", "Scarlet Scholar", "Shaman King", "High Summoner", "Life-Giver", "Beauty Goddess", "Moon"] },
  { file: "Abyss", name: "Abyss", group: "Father of Devils", color: "#7b2cbf",
    sequences: ["Criminal", "Unwinged Angel", "Serial Killer", "Devil", "Desire Apostle", "Demon", "Blatherer", "Bloody Archduke", "Filthy Monarch", "Abyss"] },
  { file: "Chained", name: "Chained", group: "Father of Devils", color: "#6a4c93",
    sequences: ["Prisoner", "Lunatic", "Werewolf", "Zombie", "Wraith", "Puppet", "Disciple of Silence", "Ancient Bane", "Abomination", "Chained"] },
  { file: "BlackEmperor", name: "Black Emperor", group: "The Anarchy", color: "#5a189a",
    sequences: ["Lawyer", "Barbarian", "Briber", "Baron of Corruption", "Mentor of Disorder", "Earl of the Fallen", "Frenzied Mage", "Duke of Entropy", "Prince of Abolition", "Black Emperor"] },
  { file: "Justiciar", name: "Justiciar", group: "The Anarchy", color: "#1d3557",
    sequences: ["Arbiter", "Sheriff", "Interrogator", "Judge", "Disciplinary Paladin", "Imperative Mage", "Chaos Hunter", "Balancer", "Hand of Order", "Justiciar"] },
];

// --- pre-filled sequences ---------------------------------------------------
// Anything already implemented gets a full object here, keyed by
// "<pathwayFile>:<sequenceNumber>". Everything else is emitted as a stub.
// This is where a finished sequence's real stats + ability kit live.
const FILLED = {
  "Fool:7": {
    potionName: "Magician",
    description:
      "Fool Seq. 7 build: a steady Air Bullet ranged poke backed by a " +
      "reactive Paper Figurine Substitution that can void a lethal hit, " +
      "reposition away from the attacker, and grant a brief invincibility " +
      "window.",
    hp: 100,
    abilities: [
      { def: "airBullet", params: { cooldown: 3000, damage: 8, speed: 7 } },
      { def: "paperFigurineSubstitution", params: { chance: 0.35, invincibilityMs: 2000 } },
    ],
  },
};

// --- serialization ----------------------------------------------------------

// JSON.stringify gives us valid JS for these plain data values; we only need
// to keep it readable. Inline (single-line) is fine for ability param objects.
function inlineJson(value) {
  return JSON.stringify(value).replace(/"([A-Za-z_$][\w$]*)":/g, "$1: ").replace(/,/g, ", ");
}

function serializeAbilities(abilities, indent) {
  if (!abilities || abilities.length === 0) return "[]";
  const lines = abilities.map(
    (a) => `${indent}  { def: ${JSON.stringify(a.def)}, params: ${inlineJson(a.params)} },`,
  );
  return `[\n${lines.join("\n")}\n${indent}]`;
}

function serializeSequence(pathway, seqNumber, seqName) {
  const filled = FILLED[`${pathway.file}:${seqNumber}`] || {};
  const ind = "  ";
  const f = {
    potionName: filled.potionName ?? "",
    description: filled.description ?? "",
    hp: filled.hp ?? null,
    speed: filled.speed ?? null,
    radius: filled.radius ?? null,
    color: `COLOR`, // reference the module-level constant, not a literal
    abilities: serializeAbilities(filled.abilities, `${ind}  `),
  };

  return [
    `${ind}{`,
    `${ind}  // --- identity ---`,
    `${ind}  pathway: ${JSON.stringify(pathway.name)},`,
    `${ind}  sequence: ${seqNumber},`,
    `${ind}  name: ${JSON.stringify(seqName)},`,
    ``,
    `${ind}  // --- lore / display (fill in as you flesh this sequence out) ---`,
    `${ind}  potionName: ${JSON.stringify(f.potionName)},`,
    `${ind}  description: ${JSON.stringify(f.description)},`,
    `${ind}  imageLink: "", // <-- drop your own image URL / path here`,
    `${ind}  color: ${f.color},`,
    ``,
    `${ind}  // --- combat stats (null = fall back to Config defaults) ---`,
    `${ind}  hp: ${f.hp === null ? "null" : f.hp},`,
    `${ind}  speed: ${f.speed === null ? "null" : f.speed},`,
    `${ind}  radius: ${f.radius === null ? "null" : f.radius},`,
    ``,
    `${ind}  // --- ability kit ---`,
    `${ind}  // Each entry { def, params }: the parser looks up \`def\` in the`,
    `${ind}  // ability registry and calls that factory with \`params\`.`,
    `${ind}  abilities: ${f.abilities},`,
    `${ind}},`,
  ].join("\n");
}

function serializePathway(pathway) {
  const seqBlocks = pathway.sequences.map((seqName, i) =>
    serializeSequence(pathway, 9 - i, seqName),
  );

  return `// src/pathways/${pathway.file}.js
//
// ${pathway.name} pathway — "${pathway.group}" group.
//
// The 10 sequences of this pathway, ordered Sequence 9 (lowest / weakest)
// down to Sequence 0 (the pathway's ancient god). Each entry is a plain
// data object describing one sequence; feed any of them to the sequence
// parser (src/engine/sequenceParser.js) to get a playable Ball.
//
// This file was scaffolded by scripts/generatePathways.mjs. The names are
// filled in; everything else is a stub to complete over time. Follow the
// existing shape when you fill a sequence so the parser keeps understanding
// it — see the fully-filled Fool Seq. 7 (Magician) for a worked example.

const COLOR = ${JSON.stringify(pathway.color)}; // per-pathway default tint

const ${pathway.file} = [
${seqBlocks.join("\n\n")}
];

export default ${pathway.file};
`;
}

// --- run --------------------------------------------------------------------
mkdirSync(OUT_DIR, { recursive: true });

let created = 0;
let skipped = 0;
for (const pathway of PATHWAYS) {
  const path = join(OUT_DIR, `${pathway.file}.js`);
  if (existsSync(path)) {
    skipped++;
    console.log(`skip   ${pathway.file}.js (already exists)`);
    continue;
  }
  writeFileSync(path, serializePathway(pathway));
  created++;
  console.log(`create ${pathway.file}.js`);
}

console.log(`\nDone. ${created} created, ${skipped} skipped, ${PATHWAYS.length} total.`);
