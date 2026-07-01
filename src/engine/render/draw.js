// src/render/draw.js
//
// Every ctx.* call in the entire project lives here, and nowhere else.
// This file only ever READS body.position — it never mutates physics
// state. If you find yourself wanting to nudge a ball's position "just
// to fix a visual glitch" inside this file, stop: that belongs in
// physicsWorld.js or an ability file instead.

import Config from "../../config.js";
import Spawner from "../spawner.js";
import VisualFx from "../abilities/fx/visualFx.js";
import StatusEffects from "../statusEffects.js";
import Doors from "../doors.js";
import Impact from "../impact.js";

let ctx = null;
let dpr = 1;

// The current logical→screen mapping, refreshed at the top of every render.
// Screen-space overlays (health bars) project logical ball coords through it.
let view = { x: 0, y: 0, scale: 1 };

// A stable record of every fighter that has appeared, keyed by hudSlot. Built
// up on the first frames and never pruned, so the "X vs Y" title keeps showing
// both fighters (and HUD slots stay put) even after one ball dies.
const roster = new Map(); // hudSlot -> { label, color }
function updateRoster(balls) {
  balls.forEach((b) => {
    if (!roster.has(b.hudSlot)) roster.set(b.hudSlot, { label: b.label, color: b.color });
  });
}

// Ball portraits load asynchronously. We cache one HTMLImageElement per src
// and only start drawing it once it has finished loading — until then (or if
// it fails), drawBall falls back to a flat color fill. Keyed by URL so two
// balls sharing an image share one download.
const imageCache = new Map();
function getImage(src) {
  if (!src) return null;
  let entry = imageCache.get(src);
  if (!entry) {
    const img = new Image();
    entry = { img, ready: false };
    img.onload = () => {
      entry.ready = true;
    };
    img.onerror = () => {
      console.warn(`[draw] failed to load ball image: ${src}`);
    };
    img.src = src;
    imageCache.set(src, entry);
  }
  return entry.ready ? entry.img : null;
}

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
  updateRoster(balls);

  const w = Config.WIDTH;
  const h = Config.HEIGHT;
  const vp = Config.VIEWPORT;
  const scale = Config.SCALE;

  // Arena shake: a decaying jitter applied to the whole arena viewport after a
  // hit (see impact.js). Only the arena shakes — the HUD/title stay put. The
  // health-bar projection uses the same shaken origin so bars track the balls.
  const shake = Impact.shakeVector();
  const ox = vp.x + shake.x;
  const oy = vp.y + shake.y;
  view = { x: ox, y: oy, scale };

  ctx.clearRect(0, 0, w, h);
  drawBackground(w, h);
  if (Config.MODE === "mobile") drawFrameOutline();

  // Arena + everything living inside it is drawn in LOGICAL coordinates,
  // scaled/positioned onto the screen by this one transform. Switching modes
  // or resizing only changes vp/scale — the simulation numbers never move.
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);
  drawArenaBounds();

  // Clip arena contents to the arena square. Besides keeping stray fx inside,
  // this is what makes wall-wrapping look seamless: a straddling ball is cut
  // off at the wall it's exiting while its ghost is cut off at the wall it's
  // entering, so together they read as one ball passing through.
  ctx.save();
  ctx.beginPath();
  ctx.rect(Config.ARENA_X, Config.ARENA_Y, Config.ARENA_SIZE, Config.ARENA_SIZE);
  ctx.clip();
  drawDoors(Doors.list()); // under the balls
  balls.forEach(drawBall);
  balls.forEach(drawStatusRings);
  drawProjectiles(Spawner.listProjectiles());
  drawParticles(VisualFx.list());
  ctx.restore();
  ctx.restore();

  // Screen-space overlays (crisp at any scale), drawn on top.
  balls.forEach(drawHealthBar);
  drawTitle();
  drawAbilityPanels(balls);
  drawModeHint();
}

// One ring per active status effect, stacked concentrically outward so
// e.g. invincibility + a future slow/burn stay simultaneously visible.
function drawStatusRings(ball) {
  ball.statusEffects.forEach((inst, i) => {
    const visual = StatusEffects.registry[inst.type]?.visual;
    if (!visual) return;

    const r = ball.radius + 6 + i * 5;
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = visual.color;
    ctx.lineWidth = 2;
    if (visual.style === "dash") ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

function drawProjectiles(projectiles) {
  projectiles.forEach((p) => {
    const { x, y } = p.body.position;
    ctx.beginPath();
    ctx.arc(x, y, p.body.circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });
}

function drawParticles(particles) {
  particles.forEach((p) => {
    const t = p.age / p.maxAge; // 0 -> 1 over its lifetime
    ctx.globalAlpha = 1 - t;

    if (p.type === "burst") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    } else if (p.type === "ring") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.maxRadius * t, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (p.type === "streak") {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.tx, p.ty);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (p.type === "impact") {
      // white shockwave ring + colored core, expanding as it fades
      const rr = p.maxRadius * t;
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = (1 - t) * 0.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rr * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });
}

// --- versus title -----------------------------------------------------------
// "<ball> vs <ball>" centered above the arena, each name in that ball's color.
// Built from the persistent roster so it stays complete after a ball dies.
function drawTitle() {
  const vp = Config.VIEWPORT;
  const entries = [...roster.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
  if (entries.length === 0) return;

  const fontSize = Math.max(16, Math.min(34, vp.size * 0.07));
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  const sep = "  vs  ";
  const sepW = ctx.measureText(sep).width;
  let total = 0;
  entries.forEach((e, i) => {
    total += ctx.measureText(e.label).width + (i < entries.length - 1 ? sepW : 0);
  });

  let x = vp.x + vp.size / 2 - total / 2;
  const y = vp.y - Math.max(10, fontSize * 0.4); // sits in the band above the arena

  entries.forEach((e, i) => {
    ctx.fillStyle = e.color;
    ctx.fillText(e.label, x, y);
    x += ctx.measureText(e.label).width;
    if (i < entries.length - 1) {
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(sep, x, y);
      x += sepW;
    }
  });
}

// A subtle outline around the portrait content frame (mobile only), so the
// 9:16 recording area reads clearly against the letterboxed background.
function drawFrameOutline() {
  const f = Config.FRAME;
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1);
}

// Tiny corner hint for the mode toggle. Delete this call in render() if you
// don't want it in recordings.
function drawModeHint() {
  const f = Config.FRAME;
  ctx.font = "11px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillText(`[M] ${Config.MODE}`, f.x + 8, f.y + 6);
}

// --- ability / cooldown HUD -------------------------------------------------
// One compact panel per ball. Panels are placed by each ball's FIXED hudSlot
// (not its live array index), so when a ball dies its slot simply empties and
// the survivors' panels stay exactly where they were. Desktop puts them in the
// side gutters; mobile lays them along the bottom of the frame.

function drawAbilityPanels(balls) {
  if (Config.MODE === "mobile") drawAbilityPanelsBottom(balls);
  else drawAbilityPanelsSides(balls);
}

// Desktop: even slots on the left gutter, odd on the right, stacked by row on
// a fixed stride so a death never shifts anyone.
function drawAbilityPanelsSides(balls) {
  const vp = Config.VIEWPORT;
  const margin = 14;
  const stride = 108;
  const panelW = Math.min(240, vp.x - margin * 2); // gutter width (symmetric)
  if (panelW < 90) return;

  const leftX = vp.x - margin - panelW;
  const rightX = vp.x + vp.size + margin;

  balls.forEach((ball) => {
    const slot = ball.hudSlot ?? 0;
    const x = slot % 2 === 0 ? leftX : rightX;
    const y = vp.y + Math.floor(slot / 2) * stride;
    drawAbilityPanel(ball, x, y, panelW);
  });
}

// Mobile: one column per slot along the bottom of the frame, bottom-aligned.
function drawAbilityPanelsBottom(balls) {
  const f = Config.FRAME;
  const slots = Math.max(1, Config.BALL_COUNT);
  const margin = f.w * 0.04;
  const gap = 10;
  const panelW = (f.w - margin * 2 - gap * (slots - 1)) / slots;
  if (panelW < 60) return;

  const bottomY = f.y + f.h - margin;
  balls.forEach((ball) => {
    const slot = ball.hudSlot ?? 0;
    const x = f.x + margin + slot * (panelW + gap);
    drawAbilityPanel(ball, x, bottomY - panelHeight(ball), panelW);
  });
}

function panelHeight(ball) {
  const pad = 8;
  const headerH = 18;
  const rowH = 24;
  return pad * 2 + headerH + Math.max(1, ball.abilities.length) * rowH;
}

// Draws one panel and returns its total height (so callers can stack them).
function drawAbilityPanel(ball, x, y, w) {
  const pad = 8;
  const headerH = 18;
  const rowH = 24;
  const h = panelHeight(ball);

  // backing plate
  ctx.fillStyle = "rgba(17,20,28,0.85)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  const innerX = x + pad;
  let cy = y + pad;

  // header: color dot + (truncated) ball name
  ctx.fillStyle = ball.color;
  ctx.beginPath();
  ctx.arc(innerX + 5, cy + 6, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e8eaf0";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(truncateText(ball.label, w - pad * 2 - 16), innerX + 16, cy);
  cy += headerH;

  if (ball.abilities.length === 0) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "italic 11px sans-serif";
    ctx.fillText("no abilities", innerX, cy + 2);
    return h;
  }

  ball.abilities.forEach((ability) => {
    drawAbilityRow(ability, innerX, cy, w - pad * 2, ball.color);
    cy += rowH;
  });

  return h;
}

function drawAbilityRow(ability, x, y, w, accent) {
  // ability name (left) — shared by every row type
  ctx.font = "11px sans-serif";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillStyle = "#c7cbd4";
  ctx.fillText(ability.name || ability.id, x, y);

  // consumable-charge abilities render as pips instead of a single bar
  if (typeof ability.maxCharges === "number") {
    drawChargeRow(ability, x, y, w, accent);
    return;
  }

  const hasCd = typeof ability.cooldown === "number" && ability.cooldown > 0;
  const remaining = Math.max(0, ability.cooldownRemaining || 0);
  const readyFrac = hasCd ? 1 - Math.min(1, remaining / ability.cooldown) : 1;
  const ready = !hasCd || remaining <= 0;

  ctx.textAlign = "right";
  if (!hasCd) {
    ctx.fillStyle = "rgba(147,197,253,0.9)";
    ctx.fillText("PASSIVE", x + w, y);
  } else if (ready) {
    ctx.fillStyle = "#4ade80";
    ctx.fillText("READY", x + w, y);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(`${(remaining / 1000).toFixed(1)}s`, x + w, y);
  }

  // recharge bar
  const barY = y + 14;
  const barH = 5;
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x, barY, w, barH);
  ctx.fillStyle = !hasCd
    ? "rgba(147,197,253,0.7)"
    : ready
      ? "#4ade80"
      : accent;
  ctx.fillRect(x, barY, w * readyFrac, barH);
}

// A row of pips for a consumable-charge ability: one pip per max charge, lit
// for banked charges, with the next pip partially filling as it regenerates.
function drawChargeRow(ability, x, y, w, accent) {
  const max = ability.maxCharges;
  const charges = ability.charges;

  // "n/max" status, right-aligned, matching the color of the ready state
  ctx.textAlign = "right";
  ctx.fillStyle = charges > 0 ? "#4ade80" : "rgba(255,255,255,0.55)";
  ctx.fillText(`${charges}/${max}`, x + w, y);

  const barY = y + 14;
  const barH = 7;
  const pipGap = 4;
  const pipW = (w - pipGap * (max - 1)) / max;
  const regenFrac =
    charges >= max
      ? 0
      : 1 - Math.min(1, (ability.rechargeRemaining || 0) / ability.rechargeMs);

  for (let i = 0; i < max; i++) {
    const px = x + i * (pipW + pipGap);

    // empty track for every slot
    roundRectPath(px, barY, pipW, barH, 3);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fill();

    if (i < charges) {
      // a banked, ready charge
      roundRectPath(px, barY, pipW, barH, 3);
      ctx.fillStyle = "#4ade80";
      ctx.fill();
    } else if (i === charges && regenFrac > 0) {
      // the charge currently regenerating — partial fill in the ball's accent
      roundRectPath(px, barY, Math.max(2, pipW * regenFrac), barH, 3);
      ctx.fillStyle = accent;
      ctx.fill();
    }
  }
}

// Trace a rounded-rectangle path (fill/stroke it yourself after calling).
function roundRectPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// Trim `text` with an ellipsis so it fits `maxWidth` at the current ctx.font.
function truncateText(text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) {
    t = t.slice(0, -1);
  }
  return `${t}…`;
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

// Apprentice doors: glowing openings on the arena walls. Each is a strip
// reaching inward from the wall it sits on, with a bright edge along the wall
// itself, fading in on spawn and out as its time-to-live runs down. Drawn in
// logical space (inside the transform + arena clip).
function drawDoors(doors) {
  const min = Config.ARENA_X;
  const max = min + Config.ARENA_SIZE;
  const thick = 16; // how far the glow reaches inward from the wall

  doors.forEach((d) => {
    const fadeIn = Math.min(1, d.age / 150);
    const fadeOut = Math.min(1, (d.ttl - d.age) / 500);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
    if (alpha <= 0) return;

    // strip rect (rx,ry,rw,rh) + the bright edge line along the wall (e*)
    let rx;
    let ry;
    let rw;
    let rh;
    let ex0;
    let ey0;
    let ex1;
    let ey1;
    if (d.wall === "left") {
      rx = min; ry = d.pos - d.half; rw = thick; rh = d.half * 2;
      ex0 = min; ey0 = ry; ex1 = min; ey1 = ry + rh;
    } else if (d.wall === "right") {
      rx = max - thick; ry = d.pos - d.half; rw = thick; rh = d.half * 2;
      ex0 = max; ey0 = ry; ex1 = max; ey1 = ry + rh;
    } else if (d.wall === "top") {
      rx = d.pos - d.half; ry = min; rw = d.half * 2; rh = thick;
      ex0 = rx; ey0 = min; ex1 = rx + rw; ey1 = min;
    } else {
      rx = d.pos - d.half; ry = max - thick; rw = d.half * 2; rh = thick;
      ex0 = rx; ey0 = max; ex1 = rx + rw; ey1 = max;
    }

    // inward glow
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = d.color;
    roundRectPath(rx, ry, rw, rh, 6);
    ctx.fill();

    // bright edge along the wall
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = d.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ex0, ey0);
    ctx.lineTo(ex1, ey1);
    ctx.stroke();

    ctx.globalAlpha = 1;
  });
}

// How much of the ball's diameter the portrait fills. < 1 leaves a colored
// margin around it; the (transparent) image sits on top of the color fill.
const IMAGE_FILL = 0.8;

// Duration (in frames) of a ball's white impact "pop" — must match the value
// impact.js seeds into ball.hitFlash.
const HITFLASH_FRAMES = 6;

function drawBall(ball) {
  // A wall-wrapping ball straddling an edge is drawn on the opposite side too
  // (and diagonally, at corners) so the crossing reads as continuous.
  wrapPositions(ball).forEach((p) => drawBallAt(ball, p.x, p.y));
}

// The ball's own position plus any wrap "ghosts": one horizontal and/or one
// vertical copy when it's within a radius of an edge, and the diagonal combo
// at a corner (so this returns 1, 2, or 4 positions).
function wrapPositions(ball) {
  const { x, y } = ball.position;
  if (!ball.wraps) return [{ x, y }];

  const r = ball.radius;
  const size = Config.ARENA_SIZE;
  const min = Config.ARENA_X;
  const max = min + size;

  const xs = [x];
  const ys = [y];
  if (x < min + r) xs.push(x + size);
  else if (x > max - r) xs.push(x - size);
  if (y < min + r) ys.push(y + size);
  else if (y > max - r) ys.push(y - size);

  const out = [];
  xs.forEach((px) => ys.forEach((py) => out.push({ x: px, y: py })));
  return out;
}

function drawBallAt(ball, x, y) {
  const img = getImage(ball.imageLink);

  // Impact pop: for a few frames after being hit the ball swells slightly and
  // is washed white, giving the strike weight (see impact.js / loop.js).
  const flash = Math.max(0, Math.min(1, (ball.hitFlash || 0) / HITFLASH_FRAMES));
  const r = ball.radius * (1 + 0.12 * flash);

  // Always fill the color circle first — for imageless balls it's the whole
  // look, and for portrait balls it shows through the transparent PNG/webp
  // and around it (since the image is scaled down, see IMAGE_FILL).
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();

  if (img) {
    // Draw the portrait "contain"-style: scaled to fit inside a fraction of
    // the circle, centered, aspect ratio preserved. Clipped to the circle as
    // a safety net so an oddly-proportioned image can never spill past it.
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();

    const box = 2 * r * IMAGE_FILL;
    const scale = Math.min(box / img.width, box / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, x - dw / 2, y - dh / 2, dw, dh);
    ctx.restore();
  }

  // white impact wash on top
  if (flash > 0) {
    ctx.globalAlpha = flash * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // thin light outline so balls read clearly against the dark background
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = flash > 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// A slim health bar with the numeric hp above each ball. Drawn in SCREEN space
// (projecting the ball's logical position through `view`) so the text stays
// crisp and readably-sized regardless of how far the arena is scaled down.
// Color shifts green -> yellow -> red as the ball's hp fraction drops.
function drawHealthBar(ball) {
  const x = view.x + ball.position.x * view.scale;
  const y = view.y + ball.position.y * view.scale;
  const r = ball.radius * view.scale;
  const hp = Math.max(0, ball.hp);
  const frac = ball.maxHp > 0 ? hp / ball.maxHp : 0;

  const barW = Math.max(36, r * 1.6);
  const barH = 6;
  const bx = x - barW / 2;
  const by = y - r - 16;

  // backing plate
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);

  // fill
  ctx.fillStyle = frac > 0.5 ? "#4ade80" : frac > 0.25 ? "#facc15" : "#ef4444";
  ctx.fillRect(bx, by, barW * frac, barH);

  // numeric hp, centered above the bar
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(String(Math.round(hp)), x, by - 2);
}

const Draw = { init, resize, render };

export default Draw;
