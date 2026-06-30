// config.js
// Single source of truth for tunable constants. Other files should never
// hardcode numbers that belong here — import from this file instead.

const Config = {
  // Full canvas size (the whole window). Used for the background and
  // for centering the arena — walls/spawning should NOT use this directly.
  get WIDTH() {
    return window.innerWidth;
  },
  get HEIGHT() {
    return window.innerHeight;
  },

  // The playable battlefield: a square, centered in the canvas.
  // Capped at 600px so it doesn't sprawl on huge monitors, but shrinks
  // to fit smaller windows (80% of the limiting dimension).
  get ARENA_SIZE() {
    // Clamped to a minimum of 200px so a momentarily-tiny or zero window
    // size (e.g. an embedded preview panel mid-layout) can't produce a
    // degenerate (near-zero-area) arena and feed bad geometry to Matter.
    const ideal = Math.min(this.WIDTH, this.HEIGHT) * 0.8;
    return Math.max(200, Math.min(600, ideal));
  },
  get ARENA_X() {
    return (this.WIDTH - this.ARENA_SIZE) / 2;
  },
  get ARENA_Y() {
    return (this.HEIGHT - this.ARENA_SIZE) / 2;
  },

  WALL_THICKNESS: 32, // generous relative to ball radius, scaled down
  // a bit from before since the arena is smaller now

  BALL_RADIUS: 48,
  BALL_INITIAL_SPEED: 4, // px/tick-ish, tuned empirically
  BALL_COUNT: 2,

  FIXED_DELTA_MS: 1000 / 60, // physics step size, independent of actual frame time

  COLORS: [
    "#e63946", // Magician
    "#457b9d", // Judge
    "#2a9d8f", // Visionary
    "#f4a261", // Sailor
    "#9d4edd", // Marionettist
  ],
};

export default Config;
