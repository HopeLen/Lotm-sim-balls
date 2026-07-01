// src/engine/wrap.js
//
// Toroidal wall-linking for balls flagged `ball.wraps` (set by the wall-wrap
// ability). Left↔right and top↔bottom edges are connected: when such a ball's
// center crosses a boundary it is repositioned to the symmetric point on the
// opposite wall (same coordinate on the other axis), keeping its velocity —
// so it appears to travel straight through and re-enter the far side.
//
// Runs as a loop step right after the physics step (and Dash.tick), before
// containBalls — which deliberately skips wrapping balls. The two axes are
// wrapped independently in the same pass, so a ball leaving through a CORNER
// (out of bounds on both axes at once) re-enters at the opposite corner
// correctly. Draw.js renders the straddling ball on both sides (see the wrap
// ghosts there) so the crossing looks seamless.

import Config from "../config.js";
import Doors from "./doors.js";
import Sound from "./sound.js";

const { Body } = Matter;

function tick(balls) {
  const min = Config.ARENA_X;
  const size = Config.ARENA_SIZE;
  const max = min + size;

  balls.forEach((ball) => {
    if (!ball.wraps) return;

    let { x, y } = ball.body.position;
    let crossedX = false;
    let crossedY = false;

    if (x < min) {
      x += size;
      crossedX = true;
    } else if (x >= max) {
      x -= size;
      crossedX = true;
    }

    if (y < min) {
      y += size;
      crossedY = true;
    } else if (y >= max) {
      y -= size;
      crossedY = true;
    }

    if (!crossedX && !crossedY) return;
    Body.setPosition(ball.body, { x, y });

    // Door-droppers (the Apprentice) leave a linked pair of wall doors on the
    // axis they just crossed, at the crossing coordinate. Other wrapping balls
    // (e.g. an enemy mid-passage) have no doorDrop and leave nothing.
    if (ball.doorDrop) {
      if (crossedX) {
        Doors.spawnWallDoor("left", y, ball.doorDrop, ball);
        Doors.spawnWallDoor("right", y, ball.doorDrop, ball);
      }
      if (crossedY) {
        Doors.spawnWallDoor("top", x, ball.doorDrop, ball);
        Doors.spawnWallDoor("bottom", x, ball.doorDrop, ball);
      }
      Sound.play(ball.doorDrop.sound); // one open sound per crossing (from sequence data)
    }
  });
}

export default { tick };
