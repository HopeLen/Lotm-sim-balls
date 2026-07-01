// src/engine/triggers.js
//
// A minimal pub/sub bus for "something happened, react if you care" events:
// collision, death, projectileHit, projectileExpire. Listeners run in
// registration order and none of them return a value the caller depends on
// — if an ability needs to CHANGE the outcome of a hit (dodge/block), that
// goes through Abilities.tryInterceptHit instead, which is synchronous and
// returns a boolean on purpose. Keeping those two mechanisms separate avoids
// subtle bugs where two listeners race to decide the same outcome.

const listeners = {
  collision: [],
  projectileHit: [],
  projectileExpire: [],
  meleeHit: [],
  death: [],
};

function on(event, fn) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(fn);
}

function fire(event, payload) {
  (listeners[event] || []).forEach((fn) => fn(payload));
}

export default { on, fire };
