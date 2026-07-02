# Graph Report - Lotm-sim-balls  (2026-07-02)

## Corpus Check
- 57 files · ~43,110 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 238 nodes · 390 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 72 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6bd2cc4f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Beyonder Pathway Definitions|Beyonder Pathway Definitions]]
- [[_COMMUNITY_Rendering & HUD Drawing|Rendering & HUD Drawing]]
- [[_COMMUNITY_Game Loop & Config|Game Loop & Config]]
- [[_COMMUNITY_Abilities, Doors & Status Effects|Abilities, Doors & Status Effects]]
- [[_COMMUNITY_Physics World & Collisions|Physics World & Collisions]]
- [[_COMMUNITY_Ability Definitions & Registry|Ability Definitions & Registry]]
- [[_COMMUNITY_Combat & Visual FX|Combat & Visual FX]]
- [[_COMMUNITY_Ball Model & Sequence Parsing|Ball Model & Sequence Parsing]]
- [[_COMMUNITY_Pathway Generation Script|Pathway Generation Script]]
- [[_COMMUNITY_Fool Pathway Sprites|Fool Pathway Sprites]]
- [[_COMMUNITY_App Bootstrap & Entry|App Bootstrap & Entry]]
- [[_COMMUNITY_Door Pathway Sprites|Door Pathway Sprites]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]

## God Nodes (most connected - your core abstractions)
1. `render()` - 15 edges
2. `Config` - 11 edges
3. `PhysicsWorld` - 7 edges
4. `Ball` - 6 edges
5. `bounds()` - 5 edges
6. `airBullet()` - 4 edges
7. `paperFigurineSubstitution()` - 4 edges
8. `drawAbilityPanel()` - 4 edges
9. `foolSequence7Magician()` - 3 edges
10. `applyImpact()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Magician Beyonder Character` --conceptually_related_to--> `Fool Pathway`  [INFERRED]
  src/assets/Fool/Magician.webp → src/assets/Fool/Clown.webp
- `foolSequence7Magician()` --calls--> `airBullet()`  [EXTRACTED]
  src/engine/abilities/roster.js → src/engine/abilities/defs/airBullet.js
- `foolSequence7Magician()` --calls--> `paperFigurineSubstitution()`  [EXTRACTED]
  src/engine/abilities/roster.js → src/engine/abilities/defs/paperFigurineSubstitution.js

## Import Cycles
- None detected.

## Communities (13 total, 2 thin omitted)

### Community 0 - "Beyonder Pathway Definitions"
Cohesion: 0.06
Nodes (23): Abyss, BlackEmperor, Chained, Darkness, Death, Demoness, Door, Error (+15 more)

### Community 1 - "Rendering & HUD Drawing"
Cohesion: 0.11
Nodes (30): drawAbilityPanel(), drawAbilityPanels(), drawAbilityRow(), drawArenaBounds(), drawBackground(), drawBall(), drawBallAt(), drawChargeRow() (+22 more)

### Community 2 - "Game Loop & Config"
Cohesion: 0.09
Nodes (16): Config, registry, Ball, balls, GameLoop, resolveStatusEffects(), start(), tick() (+8 more)

### Community 3 - "Abilities, Doors & Status Effects"
Cohesion: 0.11
Nodes (11): songOfCourage(), applyImpact(), land(), outgoing(), audioFor(), cache, global, play() (+3 more)

### Community 4 - "Physics World & Collisions"
Cohesion: 0.10
Nodes (8): wallLink(), createWalls(), init(), PhysicsWorld, registerCollisionHandling(), resize(), walls, projectiles

### Community 5 - "Ability Definitions & Registry"
Cohesion: 0.16
Nodes (8): acrobaticDodge(), airBullet(), dashStrike(), doorMaker(), impactDamage(), paperFigurineSubstitution(), foolSequence7Magician(), queue

### Community 7 - "Ball Model & Sequence Parsing"
Cohesion: 0.17
Nodes (9): advanceTransit(), ballInDoorZone(), bounds(), doorPoint(), doors, spawnWallDoor(), balls, isDecided() (+1 more)

### Community 8 - "Pathway Generation Script"
Cohesion: 0.25
Nodes (6): __dirname, FILLED, OUT_DIR, PATHWAYS, serializeAbilities(), serializeSequence()

### Community 10 - "Fool Pathway Sprites"
Cohesion: 0.38
Nodes (7): Clown (Fool Pathway Sequence 8 Beyonder), Glass Potion Vial with Fiery Orange-Red Liquid, Clown Sprite (Fool Pathway), Magician Beyonder Character, Glowing Potion Bottle, Magician Sprite, Fool Pathway

### Community 11 - "App Bootstrap & Entry"
Cohesion: 0.83
Nodes (4): Arena Canvas Element, Pathway Simulation HTML Entry, Main Boot Module (src/main.js), Matter.js Physics Engine (CDN)

### Community 12 - "Door Pathway Sprites"
Cohesion: 0.67
Nodes (3): Apprentice (Door Pathway Beyonder), Door Pathway, Apprentice Sprite (Door Pathway)

## Knowledge Gaps
- **24 isolated node(s):** `__dirname`, `OUT_DIR`, `PATHWAYS`, `FILLED`, `particles` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Config` connect `Game Loop & Config` to `Rendering & HUD Drawing`, `Physics World & Collisions`, `Ability Definitions & Registry`, `Ball Model & Sequence Parsing`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `PhysicsWorld` connect `Physics World & Collisions` to `Game Loop & Config`, `Ball Model & Sequence Parsing`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `render()` (e.g. with `draw.js` and `drawBall()`) actually correct?**
  _`render()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `__dirname`, `OUT_DIR`, `PATHWAYS` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Beyonder Pathway Definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.0647342995169082 - nodes in this community are weakly interconnected._
- **Should `Rendering & HUD Drawing` be split into smaller, more focused modules?**
  _Cohesion score 0.11397849462365592 - nodes in this community are weakly interconnected._
- **Should `Game Loop & Config` be split into smaller, more focused modules?**
  _Cohesion score 0.08571428571428572 - nodes in this community are weakly interconnected._