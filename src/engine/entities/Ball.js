// src/entities/Ball.js
//
// A Ball is a plain data structure that points to a physics body and
// holds whatever ability data is attached to it. It does NOT know how
// its abilities work — that logic lives in the pathway files (added later).

class Ball {
  constructor({
    name,
    label,
    color,
    body,
    abilities = [],
    hp = 100,
    imageLink = null,
    speedMult = 1,
  }) {
    this.name = name;
    this.label = label || name; // short display name (e.g. "Magician") for the versus title
    this.color = color;
    this.imageLink = imageLink; // optional portrait drawn inside the ball
    this.body = body; // the Matter.js physics body
    this.abilities = abilities; // array of ability defs (empty for now)
    this.statusEffects = []; // active buffs/debuffs (empty for now)
    this.hp = hp;
    this.maxHp = hp; // starting hp, kept so the health bar knows its full width

    this.dead = false; // set true once, right when hp hits 0 (see loop.js)
    this.speedMult = speedMult; // toggled by effects like "slow"
    this.hitFlash = 0; // frames of white impact "pop" remaining (see impact.js)

    // Invincibility is NOT a field here — it's expressed purely as an active
    // "invincible" status effect. Ask StatusEffects.has(ball, "invincible").

    // Lets collision handlers / Matter events map a raw body back to this
    // entity without maintaining a separate lookup table.
    body.ballRef = this;
  }

  get position() {
    return this.body.position;
  }

  get radius() {
    return this.body.circleRadius;
  }
}

window.Ball = Ball;

export default Ball;
