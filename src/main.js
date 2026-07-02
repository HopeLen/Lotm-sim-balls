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
import SequenceParser from "./engine/sequenceParser.js";
import { getSequence } from "./pathways/index.js";
import Sound from "./engine/sound.js";

const canvas = document.getElementById("arena");

// Warm up any sound files that have paths set (no-op for the empty ones).
Sound.preload();

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

  // Balls are built straight from pathway data — pick a sequence, run it
  // through the parser, push it. Right now it's the Fool pathway's Magician
  // (Seq. 7) vs its Clown (Seq. 8); any remaining balls spawn plain until
  // their sequence is filled in.
  let ball;
  if (i === 0) {
    ball = SequenceParser.toBall(getSequence("Door", 9), { x, y });
  } else if (i === 1) {
    ball = SequenceParser.toBall(getSequence("Sun", 9), { x, y });
  } else {
    const body = PhysicsWorld.createBallBody(x, y, Config.BALL_RADIUS);
    ball = new Ball({
      name: `Ball ${i + 1}`,
      color: Config.COLORS[i % Config.COLORS.length],
      body,
    });
  }

  // Fixed HUD slot, assigned once at spawn: the ball's panel always renders
  // in this slot even after another ball dies, so surviving HUDs never slide
  // around (which is disorienting for viewers following the balls).
  ball.hudSlot = i;
  balls.push(ball);
}

GameLoop.setBalls(balls);

// 4. Resize just re-fits the canvas. The simulation lives in a fixed logical
// arena (see config.js), so nothing about physics/walls depends on window
// size — only the render transform, which is recomputed every frame.
window.addEventListener("resize", () => {
  Draw.resize(canvas);
});

// 5. Switch layout modes with the "M" key (mobile ↔ desktop). Nothing else
// changes — same fight, re-laid-out for portrait or landscape recording.
window.addEventListener("keydown", (e) => {
  if (e.key === "m" || e.key === "M") Config.toggleMode();
});

// 6. Go
GameLoop.start();
