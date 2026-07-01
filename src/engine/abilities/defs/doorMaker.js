// src/engine/abilities/defs/doorMaker.js
//
// Apprentice-flavored passive: as the ball phases through walls (Wall Link, see
// wrap.js), it leaves a "door" on each wall it crosses. This ability doesn't
// act on a timer — it just stamps the door configuration onto the ball at
// spawn; wrap.js reads `ball.doorDrop` and opens the doors, and doors.js runs
// their behavior (damage-over-time + chance-based passage — see doors.js).
//
//   chance  probability a passing enemy is granted passage (phases through)
//   dps     damage per second dealt while an enemy is inside the wall door
//   ttlMs   how long each door lasts
//   half    half-length of the opening along the wall
//   depth   how far the door reaches inward from the wall

export default function doorMaker({
  chance = 0.5,
  dps = 45,
  ttlMs = 6000,
  half = 60,
  depth = 70,
} = {}) {
  return {
    id: "doorMaker",
    name: "Wall Doors",
    trigger: "passive", // inert in tickCooldowns / tryInterceptHit; see onSpawn

    onSpawn(self) {
      // `sound` is attached by the parser from the sequence entry; wrap.js
      // plays it each time a door opens.
      self.doorDrop = { chance, dps, ttlMs, half, depth, sound: this.sound || null };
    },
  };
}
