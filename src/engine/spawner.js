// src/engine/spawner.js
//
// Consumes commands pushed onto commandQueue.js and is the only place
// (besides physicsWorld.js's own init/resize) that adds, removes, or
// snaps the position of a physics body. Keeping that mutation surface in
// one file is what lets abilities/triggers push commands from inside a
// collision callback without ever touching Matter directly mid-solve.

import PhysicsWorld from "./physicsWorld.js";
import VisualFx from "./abilities/fx/visualFx.js";

const { Bodies, Body, World } = Matter;

let projectiles = [];
const PROJECTILE_MAX_LIFETIME_MS = 4000; // safety net, see tickProjectiles

function process(commands, balls) {
  commands.forEach((cmd) => {
    if (cmd.type === "teleport") {
      Body.setPosition(cmd.ball.body, cmd.to);
    } else if (cmd.type === "remove") {
      World.remove(PhysicsWorld.getWorld(), cmd.ball.body);
      const i = balls.indexOf(cmd.ball);
      if (i >= 0) balls.splice(i, 1);
    } else if (cmd.type === "spawnProjectile") {
      spawnProjectile(cmd);
    } else if (cmd.type === "removeProjectile") {
      removeProjectile(cmd.body);
    }
  });
}

function spawnProjectile({ x, y, vx, vy, radius, color, owner, damage, knockback = 0 }) {
  // isSensor: true — projectiles report overlaps (so collisionStart still
  // fires) but never physically push or bounce off anything. That means
  // no special-casing needed to keep them from deflecting off walls or
  // shoving the balls they're about to damage.
  const body = Bodies.circle(x, y, radius, {
    isSensor: true,
    frictionAir: 0,
    label: "projectile",
  });
  Body.setVelocity(body, { x: vx, y: vy });

  const projectile = { body, color, owner, damage, knockback, age: 0 };
  body.projectileRef = projectile;

  World.add(PhysicsWorld.getWorld(), body);
  projectiles.push(projectile);
}

function removeProjectile(body) {
  World.remove(PhysicsWorld.getWorld(), body);
  projectiles = projectiles.filter((p) => p.body !== body);
}

// Safety net matching the style of maintainSpeed/containBalls in
// physicsWorld.js: a projectile SHOULD always hit a wall or a ball, but if
// something slips through (e.g. spawned pointing exactly along a seam),
// this guarantees it can't circle the arena forever.
function tickProjectiles(dtMs) {
  projectiles.forEach((p) => (p.age += dtMs));
  const expired = projectiles.filter((p) => p.age >= PROJECTILE_MAX_LIFETIME_MS);
  expired.forEach((p) => removeProjectile(p.body));
}

function listProjectiles() {
  return projectiles;
}

export default { process, tickProjectiles, listProjectiles };
