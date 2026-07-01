// config.js
// Single source of truth for tunable constants. Other files should never
// hardcode numbers that belong here — import from this file instead.

const Config = {
  // --- view mode ----------------------------------------------------------
  // "mobile"  → portrait 9:16 column (Instagram Reels / YouTube Shorts).
  // "desktop" → full landscape window (longer-form videos).
  // Only affects how the arena is LAID OUT ON SCREEN — never the simulation.
  _mode: "mobile",
  get MODE() {
    return this._mode;
  },
  setMode(m) {
    if (m === "mobile" || m === "desktop") this._mode = m;
  },
  toggleMode() {
    this._mode = this._mode === "mobile" ? "desktop" : "mobile";
  },

  // Full canvas size (the whole browser window), in CSS pixels.
  get WIDTH() {
    return window.innerWidth;
  },
  get HEIGHT() {
    return window.innerHeight;
  },

  // --- LOGICAL arena ------------------------------------------------------
  // The simulation ALWAYS runs in this fixed, resolution-independent square.
  // Physics, spawning, abilities, projectile sizes/speeds, teleport ranges —
  // every gameplay number is in these logical units, not on-screen pixels.
  // draw.js scales this space onto the screen (see VIEWPORT/SCALE), so
  // switching modes or resizing the window never perturbs the simulation.
  ARENA_X: 0,
  ARENA_Y: 0,
  ARENA_SIZE: 600,

  // --- on-screen placement ------------------------------------------------
  // FRAME is the content region for the current mode: the whole window in
  // desktop, or a centered portrait 9:16 column in mobile (letterboxed).
  get FRAME() {
    const W = this.WIDTH;
    const H = this.HEIGHT;
    if (this._mode === "desktop") return { x: 0, y: 0, w: W, h: H };

    const ratio = 9 / 16; // portrait
    let h = H;
    let w = h * ratio;
    if (w > W) {
      w = W;
      h = w / ratio;
    }
    return { x: (W - w) / 2, y: (H - h) / 2, w, h };
  },

  // VIEWPORT is where the logical arena is drawn on screen (CSS px). Recomputed
  // from the window + mode every frame; nothing caches it.
  get VIEWPORT() {
    const f = this.FRAME;
    if (this._mode === "desktop") {
      // Centered square, leaving side gutters for the HUD.
      const size = Math.max(200, Math.min(600, Math.min(f.w, f.h) * 0.72));
      return { x: f.x + (f.w - size) / 2, y: f.y + (f.h - size) / 2, size };
    }
    // Mobile: a title band on top and a HUD strip at the bottom, arena between.
    const margin = f.w * 0.06;
    const titleBand = f.h * 0.09;
    const size = Math.min(f.w - margin * 2, f.h * 0.6);
    return { x: f.x + (f.w - size) / 2, y: f.y + titleBand, size };
  },

  // Logical-units → on-screen-pixels scale factor.
  get SCALE() {
    return this.VIEWPORT.size / this.ARENA_SIZE;
  },

  WALL_THICKNESS: 32, // logical units; generous relative to ball radius

  BALL_RADIUS: 48, // logical units
  BALL_INITIAL_SPEED: 4, // logical units/tick-ish, tuned empirically
  BALL_COUNT: 2,

  FIXED_DELTA_MS: 1000 / 60, // physics step size, independent of frame time

  COLORS: [
    "#e63946", // Magician
    "#457b9d", // Judge
    "#2a9d8f", // Visionary
    "#f4a261", // Sailor
    "#9d4edd", // Marionettist
  ],
};

export default Config;
