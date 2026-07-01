// src/pathways/Door.js
//
// Door pathway — "Lord of Mysteries" group.
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

const COLOR = "#4361ee"; // per-pathway default tint
const assets = "/src/assets/Door/";
const sfx = "/src/assets/Sound/"; // per-ability attack sounds (see `sound:` fields)

const Door = [
  {
    // --- identity ---
    pathway: "Door",
    sequence: 9,
    name: "Apprentice",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "Traveler",
    description:
      "Door Seq. 9 build: a traveler. Wall Link makes the arena a torus — it " +
      "phases through each wall and re-emerges symmetrically from the opposite " +
      "side, leaving a Wall Door on every wall it crosses. Enemies inside a " +
      "wall door take damage over time and, by chance, get pulled through it.",
    imageLink: assets + "Apprentice.webp", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: 100,
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [
      { def: "wallLink", params: {} },
      // chance = passage probability; dps = damage/sec while inside the door;
      // ttlMs = door lifetime; half/depth = opening size + inward reach.
      {
        def: "doorMaker",
        params: { chance: 1, dps: 40, ttlMs: 6000, half: 60, depth: 70 },
        sound: sfx + "DoorOpening.mp3",
      },
    ],
  },

  {
    // --- identity ---
    pathway: "Door",
    sequence: 8,
    name: "Trickmaster",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "",
    description: "",
    imageLink: "", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: null,
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [],
  },

  {
    // --- identity ---
    pathway: "Door",
    sequence: 7,
    name: "Astrologer",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "",
    description: "",
    imageLink: "", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: null,
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [],
  },

  {
    // --- identity ---
    pathway: "Door",
    sequence: 6,
    name: "Scribe",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "",
    description: "",
    imageLink: "", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: null,
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [],
  },

  {
    // --- identity ---
    pathway: "Door",
    sequence: 5,
    name: "Traveler",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "",
    description: "",
    imageLink: "", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: null,
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [],
  },

  {
    // --- identity ---
    pathway: "Door",
    sequence: 4,
    name: "Secrets Sorcerer",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "",
    description: "",
    imageLink: "", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: null,
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [],
  },

  {
    // --- identity ---
    pathway: "Door",
    sequence: 3,
    name: "Wanderer",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "",
    description: "",
    imageLink: "", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: null,
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [],
  },

  {
    // --- identity ---
    pathway: "Door",
    sequence: 2,
    name: "Planeswalker",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "",
    description: "",
    imageLink: "", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: null,
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [],
  },

  {
    // --- identity ---
    pathway: "Door",
    sequence: 1,
    name: "Key of Stars",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "",
    description: "",
    imageLink: "", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: null,
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [],
  },

  {
    // --- identity ---
    pathway: "Door",
    sequence: 0,
    name: "Door",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "",
    description: "",
    imageLink: "", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: null,
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [],
  },
];

export default Door;
