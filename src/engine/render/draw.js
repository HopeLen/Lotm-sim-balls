// src/render/draw.js
//
// Every ctx.* call in the entire project lives here, and nowhere else.
// This file only ever READS body.position — it never mutates physics
// state. If you find yourself wanting to nudge a ball's position "just
// to fix a visual glitch" inside this file, stop: that belongs in
// physicsWorld.js or an ability file instead.

import Config from "../../config.js";

let ctx = null;
let dpr = 1;

function init(canvas) {
  ctx = canvas.getContext("2d");
  dpr = window.devicePixelRatio || 1;
  resize(canvas);
}

function resize(canvas) {
  dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset before rescaling
  ctx.scale(dpr, dpr);
}

function render(balls) {
  const w = Config.WIDTH;
  const h = Config.HEIGHT;

  ctx.clearRect(0, 0, w, h);
  drawBackground(w, h);
  drawArenaBounds();

  balls.forEach(drawBall);
}

function drawBackground(w, h) {
  ctx.fillStyle = "#05060a"; // darker than the arena, so the arena reads
  ctx.fillRect(0, 0, w, h); // as a distinct "battlefield" floating in it
}

// Draws the playable square so it's visually obvious where the boundary
// is — independent of where the physics walls actually sit, this is
// purely cosmetic, which is exactly why it belongs here and not in
// physicsWorld.js.
function drawArenaBounds() {
  const { ARENA_X: x, ARENA_Y: y, ARENA_SIZE: size } = Config;

  ctx.fillStyle = "#11141c";
  ctx.fillRect(x, y, size, size);

  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, size, size);
}

function drawBall(ball) {
  const { x, y } = ball.position;
  const r = ball.radius;

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();

  // thin light outline so balls read clearly against the dark background
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

const Draw = { init, resize, render };

export default Draw;
