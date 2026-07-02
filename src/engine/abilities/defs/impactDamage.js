// src/engine/abilities/defs/impactDamage.js
//
// Bard-flavored passive: the ball simply HURTS to touch. It deals a flat
// amount of damage to any other ball it physically collides with. Like
// doorMaker, this ability doesn't run on a timer — it just stamps its config
// onto the ball at spawn. physicsWorld.js fires a "collision" trigger whenever
// two balls' bodies touch, and combat.js reads `ball.impactDamage` there to
// resolve the hit (through the same dodge + land() path as every other hit),
// so damage/knockback/fx all behave consistently.
//
//   damage     flat hp removed from the other ball on each contact
//   knockback  shove applied on contact (0 = let the elastic bounce do it,
//              which also means no hitstop/shake — see impact.js)

export default function impactDamage({ damage = 12, knockback = 0 } = {}) {
  return {
    id: "impactDamage",
    name: "Dissonant Touch",
    trigger: "passive", // inert in tickCooldowns / tryInterceptHit; see onSpawn

    onSpawn(self) {
      // `sound` is attached by the parser from the sequence entry's `sound:`
      // field; combat.js plays it each time this ball's touch lands a hit.
      self.impactDamage = { damage, knockback, sound: this.sound || null };
    },
  };
}
