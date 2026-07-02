// src/engine/doors.js
//
// Wall "doors" dropped by the Door-pathway Apprentice as it phases through the
// arena walls (see wrap.js, which calls spawnWallDoor on each crossing). A door
// is an opening on a wall — a span along the wall reaching `depth` inward.
//
// For an enemy ball overlapping a door:
//   - it takes DAMAGE OVER TIME the whole time it's "in the wall" (in the zone);
//   - on first entering, it rolls the door's `chance` for PASSAGE — on success
//     it briefly phases through that wall (and wraps to the far side like the
//     Apprentice), which is what makes it linger in the wall and take the DoT;
//     on failure it simply bounces off the wall as normal.
//
// Like spawner.js/dash.js this owns its entities and mutates bodies directly,
// from one safe loop step (Doors.tick) — never mid-collision.

import Config from "../config.js";
import VisualFx from "./abilities/fx/visualFx.js";
import StatusEffects from "./statusEffects.js";
import PhysicsWorld from "./physicsWorld.js";
import Abilities from "./abilities/abilities.js";
import Survival from "./survival.js";

let doors = [];
const MAX_DOORS = 20;

function bounds() {
  const min = Config.ARENA_X;
  return { min, max: min + Config.ARENA_SIZE };
}

// Open a door on `wall` ("left"|"right"|"top"|"bottom") centered at `pos`
// (the coordinate ALONG that wall). `cfg` = { chance, dps, ttlMs, half, depth }.
function spawnWallDoor(wall, pos, cfg, owner) {
  const { min, max } = bounds();
  const p = Math.max(min + cfg.half, Math.min(max - cfg.half, pos));

  // Don't stack a fresh door on top of one already there (from this owner).
  const overlaps = doors.some(
    (d) =>
      d.owner === owner && d.wall === wall && Math.abs(d.pos - p) < cfg.half,
  );
  if (overlaps) return;

  doors.push({
    wall,
    pos: p,
    half: cfg.half,
    depth: cfg.depth,
    chance: cfg.chance,
    dps: cfg.dps,
    ttl: cfg.ttlMs,
    age: 0,
    owner,
    color: owner.color,
    rolled: new Set(), // balls already rolled for passage during THIS occupancy
  });
  if (doors.length > MAX_DOORS) doors.shift();
}

// Is the ball currently "in the wall" at this door — within `depth` of the wall
// on the perpendicular axis, and within the opening's span along the wall?
function ballInDoorZone(ball, door) {
  const { min, max } = bounds();
  const { x, y } = ball.position;

  let perpIn;
  let along;
  if (door.wall === "left") {
    perpIn = x <= min + door.depth;
    along = y;
  } else if (door.wall === "right") {
    perpIn = x >= max - door.depth;
    along = y;
  } else if (door.wall === "top") {
    perpIn = y <= min + door.depth;
    along = x;
  } else {
    perpIn = y >= max - door.depth; // bottom
    along = x;
  }

  return perpIn && Math.abs(along - door.pos) <= door.half;
}

// A point on the wall at the door's center — used as the "attacker position"
// so a reacting dodge (Paper Figurine / Acrobatic Dodge) flees away from it.
function doorPoint(door) {
  const { min, max } = bounds();
  if (door.wall === "left") return { x: min, y: door.pos };
  if (door.wall === "right") return { x: max, y: door.pos };
  if (door.wall === "top") return { x: door.pos, y: min };
  return { x: door.pos, y: max }; // bottom
}

function tick(balls, dtMs) {
  doors.forEach((d) => (d.age += dtMs));
  doors = doors.filter((d) => d.age < d.ttl);

  // Once the match is decided, the lone survivor takes no door DoT and gets no
  // new passage/dodge interactions — but an in-progress transit still finishes.
  const decided = Survival.isDecided();

  balls.forEach((ball) => {
    if (ball.dead) return;
    const invincible = StatusEffects.has(ball, "invincible");
    let zoneDps = 0;
    let bailed = false; // a reactive dodge fired — skip this ball's DoT this frame

    for (const door of doors) {
      if (ball === door.owner) continue;
      if (!ballInDoorZone(ball, door)) {
        door.rolled.delete(ball); // left the opening — may roll again on re-entry
        continue;
      }
      zoneDps = Math.max(zoneDps, door.dps);

      // First frame in this door: offer it to the ball's reactive dodges, then
      // (if it didn't bail and isn't already phasing) roll passage.
      if (!door.rolled.has(ball) && !invincible && !decided) {
        door.rolled.add(ball);

        // A door is a hit like any other — Paper Figurine / Acrobatic Dodge get
        // a chance to void it and reposition away from the wall.
        if (
          Abilities.tryInterceptHit(ball, {
            attacker: door.owner,
            attackerPos: doorPoint(door),
            damage: door.dps,
          })
        ) {
          bailed = true;
          break;
        }

        if (!ball.wraps && !ball._transit && Math.random() < door.chance) {
          startTransit(ball, door);
        }
      }
    }

    // Damage over time while in any wall door (unless a dodge just bailed out,
    // or the match is already decided).
    if (!bailed && zoneDps > 0 && !invincible && !decided) {
      ball.hp -= zoneDps * (dtMs / 1000);
      if (Math.random() < 0.18) {
        VisualFx.spawnBurst({
          x: ball.position.x,
          y: ball.position.y,
          color: "#c0392b",
          count: 3,
          speed: 2,
          maxAge: 200,
        });
      }
    }

    if (ball._transit) advanceTransit(ball, dtMs);
  });
}

// Passage: let the ball phase through the wall and wrap to the far side. It
// keeps its velocity, so it carries straight through the opening.
function startTransit(ball, door) {
  ball._transit = { color: door.color, elapsed: 0, max: 1500 };
  ball.wraps = true; // wrap.js carries it across; containBalls skips it
  PhysicsWorld.phaseThroughWalls(ball.body);
  VisualFx.spawnBurst({
    x: ball.position.x,
    y: ball.position.y,
    color: door.color,
    count: 10,
    maxAge: 260,
  });
}

// End the passage once the ball is clear of every wall band (or on timeout, so
// a ball grinding tangentially along a door can't phase forever).
function advanceTransit(ball, dtMs) {
  const t = ball._transit;
  t.elapsed += dtMs;

  const { min, max } = bounds();
  const m = ball.radius * 1.3;
  const p = ball.position;
  const clear =
    p.x > min + m && p.x < max - m && p.y > min + m && p.y < max - m;

  if (t.elapsed >= t.max || clear) {
    ball._transit = null;
    ball.wraps = false;
    PhysicsWorld.restoreWallCollision(ball.body);
    VisualFx.spawnBurst({
      x: p.x,
      y: p.y,
      color: t.color,
      count: 10,
      maxAge: 260,
    });
  }
}

function list() {
  return doors;
}

function reset() {
  doors = [];
}

export default { spawnWallDoor, tick, list, reset };
