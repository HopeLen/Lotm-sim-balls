// src/pathways/Sun.js
//
// Sun pathway — "God Almighty" group.
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

const COLOR = "#f4a261"; // per-pathway default tint
const assets = "/src/assets/Sun/";
const sfx = "/src/assets/Sound/"; // per-ability sounds (see `sound:` fields)

const Sun = [
  {
    // --- identity ---
    pathway: "Sun",
    sequence: 9,
    name: "Bard",

    // --- lore / display (fill in as you flesh this sequence out) ---
    potionName: "Bard",
    description:
      "Sun Seq. 9 build: a support with no true attack of its own — its very " +
      "touch strikes a Dissonant Touch, dealing flat impact damage to any ball " +
      "it collides with. Its Song of Courage opens a warm sun-lit zone that " +
      "steadily heals allies inside and grants Courage, a damage boost that " +
      "lingers a few seconds after leaving the light.",
    imageLink: assets + "Bard.webp", // <-- drop your own image URL / path here
    color: COLOR,

    // --- combat stats (null = fall back to Config defaults) ---
    hp: 100, // a sturdy support that wants to stay in the fight
    speed: null,
    radius: null,

    // --- ability kit ---
    // Each entry { def, params }: the parser looks up `def` in the
    // ability registry and calls that factory with `params`.
    abilities: [
      {
        // Flat damage on every ball-to-ball contact. knockback 0 lets the
        // elastic bounce separate them (and avoids per-collision hitstop).
        def: "impactDamage",
        params: { damage: 10, knockback: 0 },
        sound: "", // <-- drop a contact SFX here, e.g. sfx + "Impact.mp3"
      },
      {
        // Every `cooldown` ms: open a stationary zone of `radius` that lasts
        // `zoneDuration` ms. Allies inside (the Bard included) heal
        // `healPerSecond` hp/s and hold Courage (+`courageBonusPct`% damage),
        // which lingers `courageLinger` ms after leaving the circle.
        def: "songOfCourage",
        params: {
          cooldown: 7000,
          radius: 200,
          zoneDuration: 3000,
          healPerSecond: 6,
          courageLinger: 3000,
          courageBonusPct: 25,
        },
        sound: sfx + "SongOfCourage.mp3", // sung once per zone (see tick() in songOfCourage.js)
      },
    ],
  },

  {
    // --- identity ---
    pathway: "Sun",
    sequence: 8,
    name: "Light Suppliant",

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
    pathway: "Sun",
    sequence: 7,
    name: "Solar High Priest",

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
    pathway: "Sun",
    sequence: 6,
    name: "Notary",

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
    pathway: "Sun",
    sequence: 5,
    name: "Priest of Light",

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
    pathway: "Sun",
    sequence: 4,
    name: "Unshadowed",

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
    pathway: "Sun",
    sequence: 3,
    name: "Justice Mentor",

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
    pathway: "Sun",
    sequence: 2,
    name: "Lightseeker",

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
    pathway: "Sun",
    sequence: 1,
    name: "White Angel",

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
    pathway: "Sun",
    sequence: 0,
    name: "Sun",

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

export default Sun;
