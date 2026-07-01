// src/pathways/Death.js
//
// Death pathway — "Eternal Darkness" group.
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

const COLOR = "#8d99ae"; // per-pathway default tint

const Death = [
  {
    // --- identity ---
    pathway: "Death",
    sequence: 9,
    name: "Corpse Collector",

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
    pathway: "Death",
    sequence: 8,
    name: "Gravedigger",

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
    pathway: "Death",
    sequence: 7,
    name: "Spirit Medium",

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
    pathway: "Death",
    sequence: 6,
    name: "Spirit Guide",

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
    pathway: "Death",
    sequence: 5,
    name: "Gatekeeper",

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
    pathway: "Death",
    sequence: 4,
    name: "Undying",

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
    pathway: "Death",
    sequence: 3,
    name: "Ferryman",

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
    pathway: "Death",
    sequence: 2,
    name: "Death Consul",

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
    pathway: "Death",
    sequence: 1,
    name: "Pale Emperor",

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
    pathway: "Death",
    sequence: 0,
    name: "Death",

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

export default Death;
