// src/pathways/Fool.js
//
// Fool pathway — "Lord of Mysteries" group.
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

const COLOR = "#A3A8AE"; // per-pathway default tint
const assets = "/src/assets/Fool/";
const sfx = "/src/assets/Sound/"; // per-ability attack sounds (see `sound:` fields)

const Fool = [
  {
    // --- identity ---
    pathway: "Fool",
    sequence: 9,
    name: "Seer",

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
    pathway: "Fool",
    sequence: 8,
    name: "Clown",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "Clown",
    description:
      "Fool Seq. 8 build: a nimble skirmisher. Acrobatic Dodge gives a " +
      "chance to sidestep an incoming shot on a short cooldown, while Dash " +
      "Strike blinks in to melee the nearest enemy when they close within range.",
    imageLink: assets + "Clown.webp", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: 100,
    speed: 10,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [
      {
        def: "acrobaticDodge",
        params: { chance: 0.5, cooldown: 4000, distance: 90 },
      },
      {
        def: "dashStrike",
        // knockback = heavy slam
        params: { cooldown: 5000, damage: 20, range: 340, knockback: 18 },
        sound: sfx + "Whoosh.mp3",
      },
    ],
  },

  {
    // --- identity ---
    pathway: "Fool",
    sequence: 7,
    name: "Magician",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "Magician",
    description:
      "Fool Seq. 7 build: a steady Air Bullet ranged poke backed by Paper Figurine Substitution — 2 stored charges that each void an incoming hit, reposition away from the attacker, and grant a brief invincibility window, regenerating one at a time.",
    imageLink: assets + "Magician.webp",
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: 100,
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [
      {
        def: "airBullet",
        // knockback = slight shove on hit (dash = heavy, doors = none)
        params: {
          cooldown: 3000,
          damage: 8,
          speed: 12,
          radius: 9,
          knockback: 7,
        },
        sound: sfx + "FingerSnapping.mp3",
      },
      {
        def: "paperFigurineSubstitution",
        // rechargeMs = ms to regenerate ONE spent charge — tune this to make
        // substitutions come back faster/slower. maxCharges = how many bank.
        params: { maxCharges: 2, rechargeMs: 8000, invincibilityMs: 1500 },
        sound: sfx + "PaperTearing.mp3",
      },
    ],
  },

  {
    // --- identity ---
    pathway: "Fool",
    sequence: 6,
    name: "Faceless",

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
    pathway: "Fool",
    sequence: 5,
    name: "Marionettist",

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
    pathway: "Fool",
    sequence: 4,
    name: "Bizarro Sorcerer",

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
    pathway: "Fool",
    sequence: 3,
    name: "Scholar of Yore",

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
    pathway: "Fool",
    sequence: 2,
    name: "Miracle Invoker",

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
    pathway: "Fool",
    sequence: 1,
    name: "Attendant of Mysteries",

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
    pathway: "Fool",
    sequence: 0,
    name: "Fool",

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

export default Fool;
