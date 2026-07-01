// src/engine/dash.js
//
// Scripted "dash" motion: a ball glides visibly from where it started to a
// point in contact with its target over a short duration, instead of blinking
// there. While a dash is active the ball's position is driven here each frame
// (overriding normal physics integration), a motion trail is emitted, and on
// arrival a melee hit is dealt. Then the ball is handed back to normal
// constant-speed physics.
//
// Like spawner.js, this is one of the few places allowed to touch Matter
// bodies directly — it runs as its own fixed loop step (see loop.js), never
// from inside a collision callback, so direct Body mutation is safe.

import VisualFx from "./abilities/fx/visualFx.js";
import Triggers from "./triggers.js";
import Config from "../config.js";

const { Body } = Matter;

// Begin a dash on `ball` toward `target`. Safe to ignore if already dashing.
function start(ball, { target, damage, duration = 240, knockback = 0 }) {
  if (ball.dash) return;
  ball.dash = {
    fromX: ball.position.x,
    fromY: ball.position.y,
    prevX: ball.position.x,
    prevY: ball.position.y,
    elapsed: 0,
    duration,
    target,
    damage,
    knockback,
    hit: false,
  };
}

// Advance every active dash by one fixed step. Runs right after the physics
// step so the scripted position is the final word for a dashing ball.
function tick(balls, dtMs) {
  balls.forEach((ball) => {
    const d = ball.dash;
    if (!d) return;

    // Target died or was removed mid-lunge — stop cleanly, no hit.
    if (d.target.dead || balls.indexOf(d.target) === -1) {
      end(ball);
      return;
    }

    d.elapsed += dtMs;
    const t = Math.min(1, d.elapsed / d.duration);
    const e = easeOutCubic(t);

    // Re-aim at the (still moving) target each frame; land just in contact.
    const dx = d.target.position.x - d.fromX;
    const dy = d.target.position.y - d.fromY;
    const dist = Math.hypot(dx, dy) || 1;
    const stop = Math.max(0, dist - ball.radius - d.target.radius - 2);
    const landX = d.fromX + (dx / dist) * stop;
    const landY = d.fromY + (dy / dist) * stop;

    const x = d.fromX + (landX - d.fromX) * e;
    const y = d.fromY + (landY - d.fromY) * e;

    Body.setPosition(ball.body, { x, y });
    // Point velocity along the dash so maintainSpeed() leaves it alone; the
    // scripted setPosition above is what actually moves it.
    const dirX = landX - d.fromX;
    const dirY = landY - d.fromY;
    const len = Math.hypot(dirX, dirY) || 1;
    const s = Config.BALL_INITIAL_SPEED * 2;
    Body.setVelocity(ball.body, { x: (dirX / len) * s, y: (dirY / len) * s });

    // Motion trail from last frame's position to this one.
    VisualFx.spawnStreak({
      from: { x: d.prevX, y: d.prevY },
      to: { x, y },
      color: ball.color,
      maxAge: 160,
    });
    d.prevX = x;
    d.prevY = y;

    if (!d.hit && t >= 1) {
      d.hit = true;
      VisualFx.spawnBurst({ x, y, color: ball.color, count: 10, maxAge: 300 });
      Triggers.fire("meleeHit", {
        attacker: ball,
        target: d.target,
        attackerPos: { x, y },
        damage: d.damage,
        knockback: d.knockback,
      });
      end(ball);
    }
  });
}

// Clear the dash and resume normal motion, continuing in the dash direction
// at the regular arena speed.
function end(ball) {
  const d = ball.dash;
  ball.dash = null;
  if (!d) return;

  const dirX = d.prevX - d.fromX;
  const dirY = d.prevY - d.fromY;
  const len = Math.hypot(dirX, dirY) || 1;
  const s = Config.BALL_INITIAL_SPEED;
  Body.setVelocity(ball.body, { x: (dirX / len) * s, y: (dirY / len) * s });
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default { start, tick };
