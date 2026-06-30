// src/main.js
//
// The boot sequence. Creates the engine, spawns balls, starts the loop.
// This is the only file that wires the other modules together — it
// shouldn't contain physics rules, drawing calls, or ability logic itself.
//
// This is the entry point and the ONLY file index.html loads directly
// (as type="module"). Every other file above is reached purely through
// the import statements below — the browser resolves the whole dependency
// graph itself, so there's nothing left to keep in sync in index.html.

import Config from "./config.js";
import PhysicsWorld from "./engine/physicsWorld.js";
import GameLoop from "./engine/loop.js";
import Draw from "./engine/render/draw.js";
import Ball from "./engine/entities/Ball.js";

const canvas = document.getElementById("arena");

// 1. Engine + walls — sized to the arena square, NOT the full canvas
PhysicsWorld.init(Config.ARENA_X, Config.ARENA_Y, Config.ARENA_SIZE);

// 2. Renderer
Draw.init(canvas);

// 3. Spawn balls at random positions WITHIN the arena square
const balls = [];
for (let i = 0; i < Config.BALL_COUNT; i++) {
  const margin = Config.BALL_RADIUS * 3;
  const x =
    Config.ARENA_X + margin + Math.random() * (Config.ARENA_SIZE - margin * 2);
  const y =
    Config.ARENA_Y + margin + Math.random() * (Config.ARENA_SIZE - margin * 2);

  const body = PhysicsWorld.createBallBody(x, y, Config.BALL_RADIUS);
  const ball = new Ball({
    name: `Ball ${i + 1}`,
    color: Config.COLORS[i % Config.COLORS.length],
    body,
  });
  balls.push(ball);
}

GameLoop.setBalls(balls);

// 4. Handle resize: arena re-centers itself (ARENA_X/Y/SIZE are getters
// that recompute from the new window size), so just rebuild walls + canvas
window.addEventListener("resize", () => {
  PhysicsWorld.resize(Config.ARENA_X, Config.ARENA_Y, Config.ARENA_SIZE);
  Draw.resize(canvas);
});

// 5. Go
GameLoop.start();
