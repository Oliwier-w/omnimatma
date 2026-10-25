import assert from "node:assert/strict";
import test from "node:test";
import { acquireInert, acquireScrollLock } from "../src/lib/interactionLock";
test("overlapping inert locks restore the original state independent of release order", () => {
  const main = { inert: false },
    existing = { inert: true };
  const releasePad = acquireInert([main, main, existing]);
  const releaseModal = acquireInert([main]);
  releasePad();
  releasePad();
  assert.equal(main.inert, true);
  assert.equal(existing.inert, true);
  releaseModal();
  assert.equal(main.inert, false);
});
test("scroll locks are nested and clean up idempotently", () => {
  const body = { style: { overflow: "auto" } };
  const releasePad = acquireScrollLock(body),
    releaseModal = acquireScrollLock(body);
  releaseModal();
  releaseModal();
  assert.equal(body.style.overflow, "hidden");
  releasePad();
  assert.equal(body.style.overflow, "auto");
});
