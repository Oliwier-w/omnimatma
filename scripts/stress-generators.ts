import katex from "katex";
import { GENERATOR_IDS, generateProblem, checkProblemAnswer, checkAnswer, type Problem } from "../src/generators";
import { generateOmniPractice } from "../src/lib/omnikumpelEngine";
import type { OmniPracticeSpec } from "../src/lib/omnikumpelTypes";

const seeds = 50;
const levels = 5;
const diagnostics: { problem: string; check: string; detail: string }[] = [];
const checks = { total: 0, passed: 0, failed: 0 };
const failuresByCheck: Record<string, number> = {};
const counts = {
  generators: { specs: GENERATOR_IDS.length, attempted: 0, generated: 0, passed: 0, failed: 0 },
  omni: { specs: 0, attempted: 0, generated: 0, passed: 0, failed: 0 },
};

function verify(problem: string, check: string, run: () => boolean | void) {
  checks.total++;
  try {
    if (run() === false) throw new Error("Assertion failed");
    checks.passed++;
  } catch (error) {
    checks.failed++;
    failuresByCheck[check] = (failuresByCheck[check] ?? 0) + 1;
    if (diagnostics.length < 20) diagnostics.push({ problem, check, detail: String(error).slice(0, 600) });
  }
}

function strings(problem: string, path: string, value: unknown) {
  if (typeof value === "string") {
    verify(problem, path, () => {
      const invalid = /NaN|undefined|Infinity|\+\s*-/.exec(value);
      if (invalid) throw new Error(`${invalid[0]} in ${JSON.stringify(value).slice(0, 450)}`);
    });
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => strings(problem, `${path}[${index}]`, item));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) strings(problem, `${path}.${key}`, item);
  } else {
    verify(problem, path, () => { throw new Error(`Expected a string/container, got ${String(value)}`); });
  }
}

function audit(problem: Problem) {
  for (const key of ["prompt", "latex", "answer", "hints", "steps"] as const) strings(problem.id, key, problem[key]);
  verify(problem.id, "commonTraps:present", () => Array.isArray(problem.commonTraps));
  strings(problem.id, "commonTraps", problem.commonTraps);
  for (const [index, trap] of (problem.commonTraps ?? []).entries()) {
    verify(problem.id, `commonTraps[${index}]:classification`, () => {
      const result = checkProblemAnswer(problem, trap.wrongAnswer);
      if (!result.correct && result.status !== "trap") throw new Error(`Undiagnosed trap: ${result.message}`);
    });
  }
  verify(problem.id, "latex:KaTeX", () => {
    katex.renderToString(problem.latex, { throwOnError: true, trust: false });
  });
  verify(problem.id, "answer:checkProblemAnswer", () => {
    const result = checkProblemAnswer(problem, problem.answer);
    if (!result.correct) throw new Error(result.message);
  });
  // These are Problem numeric checkpoints, not the solver's symbolic OmniStep
  // derivations. Derivative practice explicitly substitutes x before emitting
  // its checkpoints. Do not compare intermediate symbolic derivations to a value.
  for (const [index, step] of problem.steps.entries()) {
    verify(problem.id, `steps[${index}]:numeric-equivalence`, () => {
      const result = checkAnswer(step.expression, problem.answer);
      if (!result.correct) throw new Error(`${step.expression} != ${problem.answer}: ${result.message}`);
    });
  }
}

function sample(group: keyof typeof counts, label: string, factory: () => Problem) {
  const count = counts[group];
  count.attempted++;
  const failures = checks.failed;
  let problem: Problem | undefined;
  verify(label, "generation", () => { problem = factory(); });
  if (problem) {
    count.generated++;
    audit(problem);
  }
  if (checks.failed === failures) count.passed++;
  else count.failed++;
}

const specs: OmniPracticeSpec[] = [
  { kind: "quadratic" },
  { kind: "derivative" },
  ...(["inverse", "add", "multiply", "transpose"] as const).map((operation) => ({ kind: "matrix" as const, operation })),
  ...(["add", "multiply", "divide", "conjugate", "modulus"] as const).map((operation) => ({ kind: "complex" as const, operation })),
  ...(["mean", "median", "variance", "std", "all"] as const).map((statistic) => ({ kind: "statistics" as const, statistic })),
  { kind: "smart", spec: { kind: "linear-equation" } },
  { kind: "smart", spec: { kind: "determinant2x2" } },
  ...(["+", "-", "*", "/"] as const).map((operation) => ({ kind: "smart" as const, spec: { kind: "rational" as const, operation } })),
];
counts.omni.specs = specs.length;

for (const id of GENERATOR_IDS)
  for (let level = 1; level <= levels; level++)
    for (let seed = 0; seed < seeds; seed++)
      sample("generators", `${id}-${level}-${seed}`, () => generateProblem(id, level, seed));

for (const spec of specs)
  for (let level = 1; level <= levels; level++)
    for (let seed = 0; seed < seeds; seed++)
      sample("omni", `${JSON.stringify(spec)}-${level}-${seed}`, () => generateOmniPractice(spec, seed, level));

console.log(JSON.stringify({
  ok: checks.failed === 0,
  seeds,
  levels,
  ...counts,
  totalProblems: counts.generators.attempted + counts.omni.attempted,
  checks,
  failuresByCheck,
  diagnostics,
  diagnosticsTruncated: checks.failed > diagnostics.length,
}, null, 2));
if (checks.failed) process.exitCode = 1;
