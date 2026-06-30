// src/engine/loop.js
//
// The single requestAnimationFrame loop. Step order is fixed and must
// never be reordered: physics -> status effects -> abilities -> visual fx
// -> render. At this build stage (engine only, no abilities yet), steps
// 2-3 are no-op stubs so the file structure is already correct for later.

import Config from "../config.js";
import PhysicsWorld from "./physicsWorld.js";
import Draw from "./render/draw.js";

let balls = [];
let running = false;

function setBalls(list) {
  balls = list;
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

  // 1. advance physics
  PhysicsWorld.step(Config.FIXED_DELTA_MS);

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

  // 2. apply ongoing effects (zones, pulls, slows) — stub until §4.2 lands
  resolveStatusEffects(balls);

  // 3. maybe trigger a new ability — stub until §4.1 lands
  tickAbilityCooldowns(balls);

  // 4. age out particles/rings — stub until fx/visualFx.js lands
  tickVisualEffects();

  // 5. draw the current frame — always last
  Draw.render(balls);

  requestAnimationFrame(tick);
}

// --- stubs, to be replaced by real modules in later build steps ---
function resolveStatusEffects(_balls) {}
function tickAbilityCooldowns(_balls) {}
function tickVisualEffects() {}

const GameLoop = { setBalls, start, stop };

export default GameLoop;
