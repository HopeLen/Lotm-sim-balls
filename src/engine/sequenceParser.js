// src/engine/sequenceParser.js
//
// Turns a pathway sequence *data object* (see src/pathways/*.js) into a
// playable Ball that can be dropped straight into the balls array in
// main.js. This is the one place that knows how to translate the flat,
// serializable sequence description into live engine objects: it creates
// the physics body, resolves the string ability ids into real ability
// instances via the registry, and applies stat fallbacks from Config.
//
// It deliberately does NOT position the ball for you — main.js owns spawn
// placement — so you pass in the { x, y } where the ball should appear.

import Config from "../config.js";
import PhysicsWorld from "./physicsWorld.js";
import Ball from "./entities/Ball.js";
import abilityRegistry from "./abilities/registry.js";
import Sound from "./sound.js";

// Resolve a sequence's `abilities: [{ def, params, sound }]` list into the
// actual ability instances the engine ticks. Unknown ids are warned about and
// skipped rather than throwing, so a half-filled sequence stub is still
// spawnable while you're building it out. Each entry's optional `sound` (a file
// path) is attached to the ability and played by the engine when it triggers —
// so attack sounds live in the sequence data, not the ability code.
function buildAbilities(defs = []) {
  return defs
    .map(({ def, params, sound }) => {
      const factory = abilityRegistry[def];
      if (!factory) {
        console.warn(`[sequenceParser] unknown ability "${def}" — skipped`);
        return null;
      }
      const ability = factory(params || {});
      if (sound) {
        ability.sound = sound;
        Sound.preload(sound);
      }
      return ability;
    })
    .filter(Boolean);
}

// A readable in-arena label, e.g. "Magician (Fool, Seq. 7)".
function displayName(sequence) {
  return `${sequence.name} (${sequence.pathway}, Seq. ${sequence.sequence})`;
}

// Build a Ball from a sequence object at the given spawn position. Any stat
// left null/undefined in the data falls back to the Config default, so a
// bare stub still produces a valid, moving ball.
function toBall(sequence, { x, y }) {
  const radius = sequence.radius ?? Config.BALL_RADIUS;
  const body = PhysicsWorld.createBallBody(x, y, radius);

  const ball = new Ball({
    name: displayName(sequence),
    label: sequence.name, // short name (e.g. "Magician") for the versus title
    color: sequence.color ?? Config.COLORS[0],
    imageLink: sequence.imageLink || null,
    body,
    abilities: buildAbilities(sequence.abilities),
    hp: sequence.hp ?? 100,
    speedMult: sequence.speed,
  });

  // Let abilities do one-time, ball-aware setup (e.g. Wall Link marks the ball
  // as wrapping and reconfigures its body to phase through walls).
  ball.abilities.forEach((ability) => ability.onSpawn?.(ball));

  return ball;
}

export default { toBall, buildAbilities, displayName };
