// src/engine/loop.js
//
// The single requestAnimationFrame loop. Step order is fixed and must
// never be reordered: physics -> status effects -> abilities -> visual fx
// -> render. At this build stage (engine only, no abilities yet), steps
// 2-3 are no-op stubs so the file structure is already correct for later.

import Config from "../config.js";
import PhysicsWorld from "./physicsWorld.js";
import Draw from "./render/draw.js";
import CommandQueue from "./commandQueue.js";
import Spawner from "./spawner.js";
import StatusEffects from "./statusEffects.js";
import Abilities from "./abilities/abilities.js";
import VisualFx from "./abilities/fx/visualFx.js";
import Triggers from "./triggers.js";
import Combat from "./combat.js";
import Dash from "./dash.js";
import Wrap from "./wrap.js";
import Doors from "./doors.js";
import Impact from "./impact.js";
import Survival from "./survival.js";

Combat.init(); // wires up the projectileHit/death listeners once, at boot

let balls = [];
let running = false;

function setBalls(list) {
  balls = list;
  Survival.setBalls(list); // so damage sites can spare the last survivor
}

function start() {
  running = true;
  requestAnimationFrame(tick);
}

function stop() {
  running = false;
}

function tick() {
  if (!running) return;

  // Impact frames: after a heavy hit, hold the current frame for a few ticks —
  // the simulation is paused (freezing the flash + everything mid-motion) while
  // we keep rendering, then it resumes. This is the "hitstop" that gives blows
  // their weight.
  if (Impact.frozen()) {
    Impact.stepFreeze();
    Draw.render(balls);
    requestAnimationFrame(tick);
    return;
  }

  const dt = Config.FIXED_DELTA_MS;

  // 1. advance physics — this is also where collisionStart fires, so any
  // "projectileHit"/"collision" Triggers for THIS frame happen inside here
  PhysicsWorld.step(dt);

  // 1.4. advance any in-progress dashes — this scripts the ball's position
  // for the frame, so it must run right after the physics step (its
  // setPosition is the final word) and before maintainSpeed/containBalls.
  Dash.tick(balls, dt);

  // 1.45. wrap wall-linked balls to the opposite side. Must run before
  // containBalls (which skips wrapping balls) so the two never fight.
  Wrap.tick(balls);

  // 1.5. safety net against solver-induced sticking (corners, fast walls)
  PhysicsWorld.maintainSpeed(balls, Config.BALL_INITIAL_SPEED);

  // 1.6. hard containment backstop — guarantees no ball ever ends up
  // outside the arena, regardless of any solver-level tunneling/escape
  PhysicsWorld.containBalls(
    balls,
    Config.ARENA_X,
    Config.ARENA_Y,
    Config.ARENA_SIZE,
  );

  // 2. apply everything queued during step 1 (projectile removal, deaths,
  // teleports from a dodge) — drained here, once, before anything below
  // reads ball state, so nothing acts on a stale position/hp this frame
  Spawner.process(CommandQueue.drain(), balls);
  Spawner.tickProjectiles(dt);

  // 3. ongoing effects (zones, pulls, slows) — stub until Zones/Links land
  resolveStatusEffects(balls);

  // 4. tick status effect instances (burn/decay/invincibility countdown)
  StatusEffects.tick(balls, dt);

  // 4.5. doors: age them out, and damage/teleport enemies passing through.
  // Runs before abilities so a door opened THIS frame first acts next frame.
  Doors.tick(balls, dt);

  // 5. cooldown-based abilities (e.g. Air Bullets) may fire this frame
  Abilities.tickCooldowns(balls, dt);

  // 6. per-ball frame upkeep: age out the impact "pop", then sweep for deaths
  // caused by anything above (projectiles, effects)
  balls.forEach((ball) => {
    if (ball.hitFlash > 0) ball.hitFlash--;
    if (ball.hp <= 0 && !ball.dead) {
      ball.dead = true;
      Triggers.fire("death", { ball });
    }
  });

  // 7. age out particles/rings
  VisualFx.tick(dt);

  // 8. draw the current frame — always last
  Draw.render(balls);

  requestAnimationFrame(tick);
}

// --- stub, to be replaced once Zones/Links land ---
function resolveStatusEffects(_balls) {}

const GameLoop = { setBalls, start, stop };

export default GameLoop;
