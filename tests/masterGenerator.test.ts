import test from "node:test";
import assert from "node:assert/strict";
import { getLessons } from "../src/lib/vaultParser";
import { checkProblemAnswer } from "../src/generators";
import {
  assertMasterCatalog,
  auditMasterCatalog,
  buildMasterCatalog,
  filterMasterTopics,
  generateMasterProblem,
  randomMasterSeed,
  type MasterTopic,
} from "../src/generators/masterGenerator";

const lessons = getLessons();
const catalog = buildMasterCatalog(lessons);

const byGenerator = (generatorId: string): MasterTopic => {
  const topic = catalog.find((item) => item.generatorId === generatorId);
  assert.ok(topic, `Brak tematu dla generatora ${generatorId}`);
  return topic;
};

test("katalog obejmuje cały vault, zachowuje kolejność i unikalne identyfikatory", () => {
  assert.equal(lessons.length, 60);
  assert.equal(catalog.length, 60);
  assert.equal(new Set(catalog.map((topic) => topic.id)).size, 60);
  assert.deepEqual(
    catalog.map((topic) => topic.lessonId),
    lessons.map((lesson) => lesson.id),
  );
  assert.deepEqual(
    catalog.map((topic) => topic.generatorId),
    lessons.map((lesson) => lesson.generatorId),
  );

  const levels = catalog.reduce<Record<string, number>>((counts, topic) => {
    counts[topic.level] = (counts[topic.level] ?? 0) + 1;
    return counts;
  }, {});
  assert.deepEqual(levels, { podstawowka: 10, studia: 20, liceum: 30 });

  assert.equal(filterMasterTopics(catalog, "all", "all").length, 60);
  assert.equal(filterMasterTopics(catalog, "podstawowka", "all").length, 10);
  assert.equal(filterMasterTopics(catalog, "liceum", "all").length, 30);
  assert.equal(filterMasterTopics(catalog, "studia", "all").length, 20);
  assert.equal(
    filterMasterTopics(catalog, "all", "Ułamki").length,
    10,
  );
  assert.equal(
    filterMasterTopics(catalog, "studia", "Macierze").length,
    10,
  );
  assert.equal(
    filterMasterTopics(catalog, "liceum", "Macierze").length,
    0,
  );
});

test("poziom jest wnioskowany, gdy pole jest puste lub nieoczywiste", () => {
  const base = lessons[0];
  const inferred = buildMasterCatalog([
    {
      ...base,
      id: "probe-fractions",
      generatorId: "fractions-add",
      level: "",
      category: "Ułamki",
    },
    {
      ...base,
      id: "probe-matura",
      generatorId: "matura-liczby-podzielnosc",
      level: "nieznany",
      category: "Matura · Liczby i algebra",
    },
    {
      ...base,
      id: "probe-matrix",
      generatorId: "matrix-add",
      level: "",
      category: "Macierze",
    },
  ]);
  assert.deepEqual(
    inferred.map((topic) => topic.level),
    ["podstawowka", "liceum", "studia"],
  );
});

test("każdy temat generuje poprawny problem na poziomach 1 i 5", () => {
  for (const [index, topic] of catalog.entries()) {
    for (const difficulty of [1, 5] as const) {
      const seed = 100_000 + index * 10 + difficulty;
      const generated = generateMasterProblem(topic.id, difficulty, seed);
      assert.deepEqual(
        generated,
        generateMasterProblem(topic.id, difficulty, seed),
        `${topic.id} / ${difficulty}: to samo ziarno musi dać ten sam problem`,
      );
      assert.equal(generated.topic.id, topic.id);
      assert.equal(generated.topic.generatorId, topic.generatorId);
      assert.equal(generated.topic.level, topic.level);
      assert.equal(generated.effectiveDifficulty, difficulty);

      const problem = generated.problem;
      assert.equal(problem.generatorId, topic.generatorId);
      assert.equal(problem.difficulty, difficulty);
      assert.equal(typeof problem.id, "string");
      assert.ok(problem.id.length > 0);
      assert.ok(problem.prompt.trim().length > 0);
      assert.ok(problem.latex.trim().length > 0);
      assert.ok(problem.answer.trim().length > 0);
      assert.ok(problem.hints.length >= 3);
      assert.ok(problem.steps.length >= 3);
      for (const step of problem.steps) {
        assert.ok(step.expression.trim().length > 0);
        assert.ok(step.explanation.trim().length > 0);
      }
      assert.ok(
        checkProblemAnswer(problem, problem.answer).correct,
        `${topic.id} / ${difficulty}: własna odpowiedź musi przejść walidację`,
      );
      assert.equal(generated.deepSteps.length, problem.steps.length);
    }
  }
});

test("poziom mieszany jest deterministyczny i zawsze mieści się w 1–5", () => {
  const topic = byGenerator("matrix-multiply");
  for (const seed of [0, 1, 7, 42, 999, 4_294_967_295]) {
    const first = generateMasterProblem(topic.id, "mixed", seed);
    const second = generateMasterProblem(topic.id, "mixed", seed);
    assert.deepEqual(first, second);
    assert.ok(Number.isInteger(first.effectiveDifficulty));
    assert.ok(first.effectiveDifficulty >= 1);
    assert.ok(first.effectiveDifficulty <= 5);
    assert.equal(first.problem.difficulty, first.effectiveDifficulty);
  }

  const levels = new Set(
    Array.from({ length: 40 }, (_, seed) =>
      generateMasterProblem(topic.id, "mixed", seed).effectiveDifficulty,
    ),
  );
  assert.deepEqual([...levels].sort(), [1, 2, 3, 4, 5]);
});

test("generator daje szeroką różnorodność zadań", () => {
  const topics = [
    byGenerator("fractions-add"),
    byGenerator("matrix-det"),
    byGenerator("complex-multiply"),
    byGenerator("matura-funkcje-kwadratowa"),
    byGenerator("matura-geometria-okrag"),
  ];
  const signatures = new Set<string>();
  for (let round = 0; round < 100; round++) {
    const topic = topics[round % topics.length];
    const generated = generateMasterProblem(topic.id, 3, 20_000 + round);
    signatures.add(`${generated.problem.prompt}|${generated.problem.latex}`);
  }
  assert.ok(
    signatures.size >= 80,
    `Oczekiwano co najmniej 80 wariantów, otrzymano ${signatures.size}`,
  );
});

test("deepSteps wyjaśniają każdy krok i nie udają dowodu", () => {
  for (const topic of catalog.slice(0, 12)) {
    const generated = generateMasterProblem(topic.id, 4, 777);
    assert.equal(generated.deepSteps.length, generated.problem.steps.length);
    generated.deepSteps.forEach((deepStep, index) => {
      assert.ok(
        deepStep.length > 20,
        `${topic.id}, krok ${index + 1}: wyjaśnienie jest zbyt krótkie`,
      );
      assert.ok(
        deepStep.includes(generated.problem.steps[index].expression),
        `${topic.id}, krok ${index + 1}: brak odniesienia do wyrażenia`,
      );
    });
  }
  const last = generateMasterProblem(byGenerator("fractions-add").id, 2, 5);
  assert.match(
    last.deepSteps.at(-1) ?? "",
    /kontrola rachunkowa, a nie formalny dowód/,
  );
});

test("ziarno losowe jest nieujemną liczbą 32-bitową", () => {
  for (let index = 0; index < 50; index++) {
    const seed = randomMasterSeed();
    assert.ok(Number.isInteger(seed));
    assert.ok(seed >= 0);
    assert.ok(seed <= 4_294_967_295);
  }
});

test("nieznany temat jest odrzucany czytelnym błędem", () => {
  assert.throws(
    () => generateMasterProblem("nie-ma-takiego-tematu", 1, 1),
    /Nieznany temat treningu/,
  );
});

test("każda lekcja ma dedykowany generator i pięć wariantów trudności", () => {
  const coverage = auditMasterCatalog(lessons);
  assert.equal(coverage.lessons, 60);
  assert.equal(coverage.generators, 60);
  assert.deepEqual(coverage.missing, []);
  assert.deepEqual(coverage.duplicates, []);
  assert.deepEqual(coverage.unused, []);
  assert.doesNotThrow(() => assertMasterCatalog(lessons));

  for (const topic of catalog) {
    const prompts = new Set<string>();
    for (let level = 1 as 1 | 2 | 3 | 4 | 5; level <= 5; level++) {
      const master = generateMasterProblem(topic.id, level, 7);
      assert.equal(master.topic.id, topic.id);
      assert.ok(master.problem.prompt.trim().length > 0);
      assert.ok(master.problem.steps.length > 0);
      prompts.add(master.problem.prompt);
    }
    assert.ok(prompts.size >= 2, `Jeden wariant dla ${topic.id}`);
  }
});

test("audyt katalogu wykrywa brak szablonu, duplikat i osierocony generator", () => {
  const [first, second] = lessons;
  const duplicate = lessons.map((lesson) =>
    lesson.id === second.id
      ? { ...lesson, generatorId: first.generatorId }
      : lesson,
  );
  const gaps = auditMasterCatalog(duplicate);
  assert.deepEqual(gaps.missing, []);
  assert.deepEqual(gaps.duplicates, [first.generatorId]);
  assert.ok(gaps.unused.includes(second.generatorId));

  const unknown = lessons.map((lesson) =>
    lesson.id === first.id ? { ...lesson, generatorId: "brak-takiego" } : lesson,
  );
  const broken = auditMasterCatalog(unknown);
  assert.deepEqual(broken.missing, [
    { lessonId: first.id, generatorId: "brak-takiego" },
  ]);
  assert.ok(broken.unused.includes(first.generatorId));
  assert.throws(() => assertMasterCatalog(unknown), /Brak szablonu dla lekcji/);
});
