import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import {
  EXTENDED_GENERATOR_IDS,
  checkProblemAnswer,
  generateProblem,
} from "../src/generators";

const levels = [1, 2, 3, 4, 5] as const;

test("rozszerzone generatory generują poprawne zadania na każdym poziomie", () => {
  assert.equal(EXTENDED_GENERATOR_IDS.length, 8);
  assert.equal(new Set(EXTENDED_GENERATOR_IDS).size, 8);

  for (const id of EXTENDED_GENERATOR_IDS) {
    for (const level of levels) {
      const problem = generateProblem(id, level, 1234);
      assert.equal(problem.generatorId, id);
      assert.equal(problem.difficulty, level);
      assert.ok(problem.prompt.trim(), `${id} L${level}: pusty prompt`);
      assert.ok(problem.answer.trim(), `${id} L${level}: pusta odpowiedź`);
      assert.ok(problem.hints.length >= 2, `${id} L${level}: za mało podpowiedzi`);
      assert.ok(problem.steps.length >= 1, `${id} L${level}: brak kroków`);

      const checked = checkProblemAnswer(problem, problem.answer);
      assert.equal(
        checked.correct,
        true,
        `${id} L${level}: własna odpowiedź odrzucona (${checked.status})`,
      );

      assert.doesNotThrow(
        () => katex.renderToString(problem.latex, { throwOnError: true, trust: false }),
        `${id} L${level}: nieprawidłowy LaTeX`,
      );
    }
  }
});

test("rozszerzone generatory są deterministyczne dla tego samego ziarna", () => {
  for (const id of EXTENDED_GENERATOR_IDS) {
    const first = generateProblem(id, 3, 99);
    const second = generateProblem(id, 3, 99);
    assert.deepEqual(second, first, `${id}: wynik zależy od losowości globalnej`);
  }
});

test("rozszerzone generatory dają różne warianty zadań", () => {
  for (const id of EXTENDED_GENERATOR_IDS) {
    const prompts = new Set(
      Array.from({ length: 30 }, (_, seed) => generateProblem(id, 4, seed).prompt),
    );
    assert.ok(prompts.size >= 2, `${id}: tylko jeden wariant zadania`);
  }
});
