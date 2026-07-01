// src/engine/commandQueue.js
//
// Matter.js collision callbacks fire mid-solve. Adding/removing bodies or
// snapping positions from inside one of those callbacks is asking for
// trouble. So instead, anything that wants to spawn a projectile, remove a
// ball, or teleport something pushes a command here — and the loop drains
// the queue at one fixed, safe point per tick (see loop.js).

let queue = [];

function push(cmd) {
  queue.push(cmd);
}

function drain() {
  const batch = queue;
  queue = [];
  return batch;
}

export default { push, drain };
