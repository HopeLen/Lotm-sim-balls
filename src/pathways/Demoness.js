// src/pathways/Demoness.js
//
// Demoness pathway — "Calamity of Destruction" group.
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

const COLOR = "#d00000"; // per-pathway default tint

const Demoness = [
  {
    // --- identity ---
    pathway: "Demoness",
    sequence: 9,
    name: "Assassin",

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
    pathway: "Demoness",
    sequence: 8,
    name: "Instigator",

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
    pathway: "Demoness",
    sequence: 7,
    name: "Witch",

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
    pathway: "Demoness",
    sequence: 6,
    name: "Pleasure",

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
    pathway: "Demoness",
    sequence: 5,
    name: "Affliction",

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
    pathway: "Demoness",
    sequence: 4,
    name: "Despair",

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
    pathway: "Demoness",
    sequence: 3,
    name: "Unaging",

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
    pathway: "Demoness",
    sequence: 2,
    name: "Catastrophe",

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
    pathway: "Demoness",
    sequence: 1,
    name: "Apocalypse",

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
    pathway: "Demoness",
    sequence: 0,
    name: "Demoness",

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

export default Demoness;
