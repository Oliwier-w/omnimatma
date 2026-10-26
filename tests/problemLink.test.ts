import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProblemLink, problemPath } from "../src/lib/problemLink";
import { generateMasterProblem } from "../src/generators/masterGenerator";
import { generateSmartPractice, smartPracticeTopicId, type SmartPracticeSpec } from "../src/lib/smartMath";
import { lessonPath, readWorkspacePath, WORKSPACE_PATHS } from "../src/lib/workspaceRoutes";

test("workspace routes are real reversible paths", () => {
  for (const [page, path] of Object.entries(WORKSPACE_PATHS)) assert.equal(readWorkspacePath(path).page, page);
  assert.deepEqual(readWorkspacePath(lessonPath("matrix-add")), { page: "lesson", lessonId: "matrix-add" });
});
test("shared topic, difficulty and uint32 seed reconstruct exactly the same problem", () => {
  for (const topicId of ["fractions-add", "matrix-det", "complex-modulus"]) {
    for (const seed of [0, 42, 4294967295]) {
      const path = problemPath({ topicId, difficulty: 3, seed });
      const parsed = parseProblemLink(new URL(path, "https://example.test").searchParams, [topicId]);
      assert.ok(parsed.value);
      assert.deepEqual(generateMasterProblem(topicId, 3, seed), generateMasterProblem(parsed.value.topicId, parsed.value.difficulty as 3, parsed.value.seed));
    }
  }
});
test("smart family and series mode survive sharing without serializing answers", () => {
  for (const smart of [{ kind: "linear-equation" }, { kind: "rational", operation: "+" }, { kind: "determinant2x2" }] as SmartPracticeSpec[]) {
    const topicId = smartPracticeTopicId(smart);
    const path = problemPath({ topicId, difficulty: 2, seed: 55, smart, mode: "series10" });
    const parsed = parseProblemLink(new URL(path, "https://example.test").searchParams, [topicId]);
    assert.ok(parsed.value?.smart);
    assert.deepEqual(parsed.value.smart, smart);
    assert.equal(parsed.value.mode, "series10");
    assert.deepEqual(generateSmartPractice(smart, 55, 2), generateSmartPractice(parsed.value.smart, parsed.value.seed, parsed.value.difficulty));
    assert.equal(path.includes("answer"), false);
  }
});
test("invalid, tampered or unsupported share links fail safely", () => {
  for (const query of ["v=999&topic=matrix-det&difficulty=1&seed=5", "v=1&topic=unknown&difficulty=1&seed=5", "v=1&topic=matrix-det&difficulty=6&seed=5", "v=1&topic=matrix-det&difficulty=1&seed=-1", "v=1&topic=matrix-det&difficulty=1&seed=1e9", "v=1&topic=matrix-det&difficulty=1&seed=4294967296", "v=1&topic=matrix-det&difficulty=1&seed=5&practice=%7Bbad", "v=1&topic=matrix-det&difficulty=1&seed=5&mode=bad"]) {
    const result = parseProblemLink(new URLSearchParams(query), ["matrix-det"]);
    assert.equal(result.value, null); assert.ok(result.error);
  }
  assert.deepEqual(parseProblemLink(new URLSearchParams(), ["matrix-det"]), { value: null });
});
