// src/engine/abilities/defs/songOfCourage.js
//
// Sun Bard's support song. On its own cooldown (needs no enemy — a Bard sings
// regardless of whether anyone's in range) it opens a stationary, sun-colored
// zone at the Bard's position that lasts `zoneDuration` ms. Every frame, each
// ally standing inside (the Bard is always its own ally) is healed at
// `healPerSecond` and has the "Courage" damage buff refreshed; the buff's
// duration is `courageLinger`, so it keeps running that long after the ball
// steps out of the circle (or the zone closes).
//
// It fires from the per-frame `tick` upkeep hook rather than the normal
// `trigger: "cooldown"` execute path, because that path only runs when there's
// a nearest enemy to aim at — and a self/team buff has no target. tickCooldowns
// still drains `cooldownRemaining` for us and calls `tick` every frame, so the
// HUD renders a proper cooldown bar all the same.
//
// Every knob is a passable param so it can be tuned per sequence entry:
//   cooldown         ms between songs
//   radius           logical-unit radius of the zone
//   zoneDuration     ms the zone stays open once sung
//   healPerSecond    hp restored per second to each ally inside the zone
//   courageLinger    ms the Courage buff persists after leaving the zone
//   courageBonusPct  % outgoing-damage increase while Courage is active

import StatusEffects from "../../statusEffects.js";
import VisualFx from "../fx/visualFx.js";
import Sound from "../../sound.js";

const SUN = "#f4a261"; // Sun pathway tint — warm amber
const SUN_BRIGHT = "#ffd27f"; // brighter opening wave

export default function songOfCourage({
  cooldown = 6000,
  radius = 200,
  zoneDuration = 4000,
  healPerSecond = 8,
  courageLinger = 3000,
  courageBonusPct = 25,
} = {}) {
  const damageMult = 1 + courageBonusPct / 100;
  // Live zones for this ability instance: { x, y, remaining }. Usually 0 or 1,
  // but if cooldown < zoneDuration several can overlap safely.
  const zones = [];

  return {
    id: "songOfCourage",
    name: "Song of Courage",
    // Not "cooldown": that trigger requires a nearest-enemy target. This song
    // is fired from tick() below, so it also works with no one else around.
    trigger: "aura",
    cooldown,
    cooldownRemaining: cooldown, // first song lands after one full cooldown
    radius,

    // Called every frame by tickCooldowns (regardless of trigger type). When
    // the cooldown (drained for us upstream) runs out, sing a new zone; then
    // let every open zone heal + embolden the allies inside it.
    tick(dtMs, self, balls) {
      if (!self.dead && this.cooldownRemaining <= 0) {
        this.cooldownRemaining = cooldown;
        openZone(self);
        // `sound` is attached by the parser from the sequence entry's `sound:`
        // field — the singing SFX, played once each time the song fires.
        if (this.sound) Sound.play(this.sound);
      }

      for (let i = zones.length - 1; i >= 0; i--) {
        const zone = zones[i];
        zone.remaining -= dtMs;
        if (zone.remaining <= 0) {
          zones.splice(i, 1);
          continue;
        }
        empower(zone, self, balls, dtMs);
      }
    },
  };

  function openZone(self) {
    const { x, y } = self.position;
    zones.push({ x, y, remaining: zoneDuration });

    // The zone itself: a translucent sun-colored circle that holds for the
    // full duration (painted under the balls — see drawZones in
    // render/draw.js), announced by one expanding "sound wave" ring.
    VisualFx.spawnZone({ x, y, color: SUN, radius, maxAge: zoneDuration });
    VisualFx.spawnRing({
      x,
      y,
      color: SUN_BRIGHT,
      maxRadius: radius,
      maxAge: 700,
    });
  }

  function empower(zone, self, balls, dtMs) {
    balls.forEach((ball) => {
      if (ball.dead || !isAlly(ball, self)) return;
      const d = Math.hypot(
        ball.position.x - zone.x,
        ball.position.y - zone.y,
      );
      if (d > radius) return;

      ball.hp = Math.min(ball.maxHp, ball.hp + healPerSecond * (dtMs / 1000));
      // Refreshed every frame while inside, so the buff outlives the zone by
      // exactly `courageLinger` ms once the ball leaves (or the zone closes).
      StatusEffects.apply(ball, "courage", {
        duration: courageLinger,
        data: { damageMult },
      });
    });
  }

  // The Bard is always its own ally. `team` doesn't exist on balls yet — once
  // a team system lands, balls sharing the Bard's team count automatically.
  function isAlly(ball, self) {
    return ball === self || (ball.team != null && ball.team === self.team);
  }
}
