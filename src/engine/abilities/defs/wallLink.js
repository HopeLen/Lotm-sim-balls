// src/engine/abilities/defs/wallLink.js
//
// Apprentice-flavored passive: the ball's arena becomes a torus. It phases
// through the walls and re-emerges from the opposite side (left↔right,
// top↔bottom), symmetrically. No cooldown, no activation — it's just how this
// ball moves. The actual per-frame wrapping lives in wrap.js; this ability
// only marks the ball and reconfigures its body once, at spawn.

import PhysicsWorld from "../../physicsWorld.js";

export default function wallLink() {
  return {
    id: "wallLink",
    name: "Wall Link",
    trigger: "passive", // inert in tickCooldowns / tryInterceptHit; see onSpawn

    // Called once by the sequence parser right after the ball is built.
    onSpawn(self) {
      self.wraps = true; // wrap.js repositions it; containBalls skips it
      PhysicsWorld.phaseThroughWalls(self.body); // stop bouncing off the walls
    },
  };
}
