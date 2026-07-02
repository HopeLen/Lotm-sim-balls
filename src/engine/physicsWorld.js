// src/engine/physicsWorld.js
//
// Owns the Matter.js engine, world, and arena walls.
// This file answers exactly one question: "what are the physical rules
// of this arena?" It knows nothing about balls' abilities, colors, or
// drawing — just bodies, bounds, and motion rules.

import Config from "../config.js";
import Triggers from "./triggers.js";

// Matter.js is loaded via a classic (non-module) <script> tag in index.html,
// so it attaches itself to `window.Matter` rather than being import-able.
// Classic scripts always run before deferred module scripts, so by the
// time this file executes, the global is guaranteed to exist.
const { Engine, World, Bodies, Body, Events } = Matter;

let engine = null;
let world = null;
let walls = [];

// Collision categories. Walls get their own bit so a ball can be made to
// PASS THROUGH walls (while still colliding with other balls) by clearing
// that bit from its mask — see phaseThroughWalls(), used by the wall-wrap
// ability. Everything else uses Matter's default category (0x0001).
const WALL_CATEGORY = 0x0002;

/**
 * Creates the engine + world and adds the arena boundary.
 * arenaX/arenaY = top-left corner of the playable square, in canvas space.
 * arenaSize = side length of that square.
 */
function init(arenaX, arenaY, arenaSize) {
  engine = Engine.create();
  engine.gravity.y = 0; // top-down arena — no falling, ever

  // Default solver passes (position: 6, velocity: 4) are tuned for
  // typical games, not perfectly-elastic (restitution: 1) collisions.
  // Raising both gives the solver more passes to converge on a clean
  // bounce instead of leaving residual overlap/velocity that reads as
  // a ball "sticking" to a wall for a frame or two.
  engine.positionIterations = 10;
  engine.velocityIterations = 8;

  world = engine.world;

  walls = createWalls(arenaX, arenaY, arenaSize);
  World.add(world, walls);

  registerCollisionHandling();

  return { engine, world };
}

/**
 * Contact detection lives here (physicsWorld only knows "these two bodies
 * touched"); deciding what that MEANS gameplay-wise is deliberately kept
 * out of this file — see combat.js, which is what actually listens for
 * the "projectileHit"/"projectileExpire" triggers fired below.
 *
 * Projectiles are sensor bodies (see spawner.js), so they still raise
 * collisionStart against everything they overlap without physically
 * bouncing off it — that's what lets a bullet travel in a straight line
 * and still be detected hitting a ball or a wall.
 */
function registerCollisionHandling() {
  Events.on(engine, "collisionStart", (evt) => {
    evt.pairs.forEach(({ bodyA, bodyB }) => {
      const projBody = bodyA.projectileRef
        ? bodyA
        : bodyB.projectileRef
          ? bodyB
          : null;

      if (projBody) {
        const other = projBody === bodyA ? bodyB : bodyA;
        const projectile = projBody.projectileRef;

        // Skip the projectile's own owner — it's spawned just outside
        // their body, but this guards against any edge-case overlap.
        if (other.ballRef && other.ballRef !== projectile.owner) {
          Triggers.fire("projectileHit", { projectile, target: other.ballRef });
        } else if (other.isStatic) {
          Triggers.fire("projectileExpire", { projectile });
        }
        return;
      }

      if (bodyA.ballRef && bodyB.ballRef) {
        Triggers.fire("collision", { a: bodyA.ballRef, b: bodyB.ballRef });
      }
    });
  });
}

/**
 * Four separate static wall bodies (NOT merged into one compound body).
 *
 * Note: an earlier version of this file merged these into a single
 * compound body via Body.create({ parts, isStatic: true }) to avoid
 * corner-trapping. That triggered a real Matter.js solver bug — a crash
 * inside SAT.js's narrow-phase collision check (_findSupports) when a
 * ball contacts exactly at the seam between two parts of a compound
 * static body. The crash is worse than the bug it was meant to fix, so
 * we're back to four independent bodies and relying on solver iterations
 * + maintainSpeed() (below) to handle the occasional sticking instead.
 */
function createWalls(x, y, size) {
  const t = Config.WALL_THICKNESS;
  const opts = {
    isStatic: true,
    restitution: 1,
    friction: 0,
    collisionFilter: { category: WALL_CATEGORY },
  };
  return [
    Bodies.rectangle(x + size / 2, y - t / 2, size + t * 2, t, opts), // top
    Bodies.rectangle(x + size / 2, y + size + t / 2, size + t * 2, t, opts), // bottom
    Bodies.rectangle(x - t / 2, y + size / 2, t, size + t * 2, opts), // left
    Bodies.rectangle(x + size + t / 2, y + size / 2, t, size + t * 2, opts), // right
  ];
}

/**
 * Rebuilds the arena boundary to match a new size/position
 * (call on window resize).
 */
function resize(arenaX, arenaY, arenaSize) {
  World.remove(world, walls);
  walls = createWalls(arenaX, arenaY, arenaSize);
  World.add(world, walls);
}

/**
 * Spawns a physics body for a ball at a given position, with a random
 * initial velocity direction so balls don't all move identically.
 */
function createBallBody(x, y, radius) {
  const body = Bodies.circle(x, y, radius, {
    restitution: 1, // perfectly elastic — no energy lost on bounce
    frictionAir: 0, // no air drag — motion never decays
    friction: 0, // no surface friction
    inertia: Infinity, // no spin from collisions — pure translation
    slop: 0.01, // tighter overlap tolerance than Matter's 0.05 default,
    // reduces the "settled into the wall" look on contact
  });

  const angle = Math.random() * Math.PI * 2;
  const speed = Config.BALL_INITIAL_SPEED;
  Body.setVelocity(body, {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed,
  });

  World.add(world, body);
  return body;
}

/**
 * Makes a body ignore the arena walls (it will phase straight through them)
 * while still colliding with other balls. Used by the wall-wrap ability,
 * which repositions the ball to the opposite side itself (see wrap.js).
 */
function phaseThroughWalls(body) {
  // Clear the wall bit from the body's collision mask (default mask is all-1s).
  body.collisionFilter.mask = 0xffffffff & ~WALL_CATEGORY;
}

/**
 * Re-enables wall collision for a body previously passed to
 * phaseThroughWalls() — used when an enemy's temporary door "passage" ends.
 */
function restoreWallCollision(body) {
  body.collisionFilter.mask = 0xffffffff;
}

/**
 * Safety net + knockback decay. Every frame, after the physics step:
 *  - a ball that lost speed (solver imprecision) is rescaled back up to cruise;
 *  - a ball that's FASTER than cruise (a knockback shove) is eased back down,
 *    keeping its direction — so a hit sends it flying, then it settles.
 * It's a no-op for any ball already at cruise speed.
 */
function maintainSpeed(balls, targetSpeed) {
  balls.forEach((ball) => {
    const v = ball.body.velocity;
    const speed = Math.hypot(v.x, v.y);

    if (speed < 0.05) {
      // Fully stuck — direction is meaningless, so pick a fresh one.
      const angle = Math.random() * Math.PI * 2;
      Body.setVelocity(ball.body, {
        x: Math.cos(angle) * targetSpeed,
        y: Math.sin(angle) * targetSpeed,
      });
    } else if (speed < targetSpeed * 0.9) {
      // Lost some speed to solver imprecision — rescale, keep direction.
      const scale = targetSpeed / speed;
      Body.setVelocity(ball.body, { x: v.x * scale, y: v.y * scale });
    } else if (speed > targetSpeed * 1.05) {
      // Above cruise (knockback) — decay ~10%/frame back toward cruise.
      const next = Math.max(targetSpeed, speed * 0.9);
      const scale = next / speed;
      Body.setVelocity(ball.body, { x: v.x * scale, y: v.y * scale });
    }
  });
}

/**
 * Hard containment backstop. Wall collisions handle normal bouncing, but
 * at corners a ball can briefly touch two separate wall bodies in the
 * same step, and Matter's solver can occasionally resolve that into an
 * amplified velocity rather than a clean bounce — fast enough to tunnel
 * straight through the wall thickness in a single step, with nothing on
 * the far side to catch it. Rather than chase that solver edge case
 * further (we've already hit a crash trying to "fix" it at the geometry
 * level), this makes containment a deterministic guarantee instead of a
 * hope: if a ball's position is ever outside the arena for any reason,
 * snap it back inside and flip the offending velocity component.
 */
function containBalls(balls, arenaX, arenaY, arenaSize) {
  balls.forEach((ball) => {
    if (ball.wraps) return; // wrapping balls are handled by wrap.js, not clamped
    const r = ball.radius;
    const minX = arenaX + r;
    const maxX = arenaX + arenaSize - r;
    const minY = arenaY + r;
    const maxY = arenaY + arenaSize - r;

    const pos = ball.body.position;
    const vel = ball.body.velocity;
    let { x, y } = pos;
    let { x: vx, y: vy } = vel;
    let outOfBounds = false;

    if (x < minX) {
      x = minX;
      vx = Math.abs(vx);
      outOfBounds = true;
    } else if (x > maxX) {
      x = maxX;
      vx = -Math.abs(vx);
      outOfBounds = true;
    }

    if (y < minY) {
      y = minY;
      vy = Math.abs(vy);
      outOfBounds = true;
    } else if (y > maxY) {
      y = maxY;
      vy = -Math.abs(vy);
      outOfBounds = true;
    }

    if (outOfBounds) {
      Body.setPosition(ball.body, { x, y });
      Body.setVelocity(ball.body, { x: vx, y: vy });
    }
  });
}

/**
 * Advances the simulation by one fixed timestep.
 * This must be the very first thing that happens each loop iteration.
 */
function step(fixedDelta) {
  Engine.update(engine, fixedDelta);
}

function getWorld() {
  return world;
}

function getEngine() {
  return engine;
}

const PhysicsWorld = {
  init,
  resize,
  createBallBody,
  phaseThroughWalls,
  restoreWallCollision,
  maintainSpeed,
  containBalls,
  step,
  getWorld,
  getEngine,
};

export default PhysicsWorld;
