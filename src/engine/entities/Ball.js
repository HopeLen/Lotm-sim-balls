// src/entities/Ball.js
//
// A Ball is a plain data structure that points to a physics body and
// holds whatever ability data is attached to it. It does NOT know how
// its abilities work — that logic lives in the pathway files (added later).

class Ball {
  constructor({ name, color, body, abilities = [], hp = 100 }) {
    this.name = name;
    this.color = color;
    this.body = body; // the Matter.js physics body
    this.abilities = abilities; // array of ability defs (empty for now)
    this.statusEffects = []; // active buffs/debuffs (empty for now)
    this.hp = hp;

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
