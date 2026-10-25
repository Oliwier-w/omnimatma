import type { Lesson } from "../lib/lesson";
import { GENERATOR_IDS, generateProblem, type Problem } from "./index";

export type MasterLevel = "podstawowka" | "liceum" | "studia";
export type MasterDifficulty = 1 | 2 | 3 | 4 | 5 | "mixed";

export type MasterTopic = {
  id: string;
  lessonId: string;
  generatorId: string;
  label: string;
  category: string;
  level: MasterLevel;
};

export type MasterProblem = {
  problem: Problem;
  topic: MasterTopic;
  effectiveDifficulty: number;
  deepSteps: string[];
};

const catalogRegistry = new Map<string, MasterTopic>();

function inferLevel(lesson: Lesson): MasterLevel {
  const declared = lesson.level?.trim().toLowerCase();
  if (/podstaw/.test(declared)) return "podstawowka";
  if (/liceum|średnia|srednia/.test(declared)) return "liceum";
  if (/studia|wyższa|wyzsza|uniwersytet/.test(declared)) return "studia";

  const haystack = `${lesson.category} ${lesson.generatorId}`.toLowerCase();
  if (/liceum|matura/.test(haystack)) return "liceum";
  if (/studia|matrix|macierz|complex|zespol|algebra/.test(haystack))
    return "studia";
  if (/podstaw|ułam|ulam|fraction/.test(haystack)) return "podstawowka";
  return "podstawowka";
}

/** Stable catalog in the exact order delivered by the vault. */
export function buildMasterCatalog(lessons: Lesson[]): MasterTopic[] {
  const catalog = lessons.map<MasterTopic>((lesson) => ({
    id: lesson.id,
    lessonId: lesson.id,
    generatorId: lesson.generatorId,
    label: lesson.title,
    category: lesson.category,
    level: inferLevel(lesson),
  }));
  catalog.forEach((topic) => catalogRegistry.set(topic.id, topic));
  return catalog;
}

function fallbackTopic(topicId: string): MasterTopic {
  if (!(GENERATOR_IDS as readonly string[]).includes(topicId))
    throw new Error(`Nieznany temat treningu: ${topicId}`);
  const level: MasterLevel = topicId.startsWith("fractions-")
    ? "podstawowka"
    : topicId.startsWith("matura-")
      ? "liceum"
      : "studia";
  return {
    id: topicId,
    lessonId: topicId,
    generatorId: topicId,
    label: topicId,
    category: "Inne",
    level,
  };
}

export function randomMasterSeed(): number {
  return Math.floor(Math.random() * 4294967296);
}

export function filterMasterTopics(
  topics: MasterTopic[],
  level: MasterLevel | "all",
  category: string | "all",
): MasterTopic[] {
  return topics.filter(
    (topic) =>
      (level === "all" || topic.level === level) &&
      (category === "all" || topic.category === category),
  );
}

function operationLabel(expression: string, generatorId: string): string {
  const text = expression.replace(/\s+/g, " ");
  if (text.includes("det(")) return "obliczanie wyznacznika";
  if (text.includes("inv(")) return "wyznaczanie macierzy odwrotnej";
  if (text.includes("transpose(") || text.includes("^T"))
    return "transpozycja macierzy";
  if (generatorId === "matrix-trace") return "sumowanie przekątnej";
  if (text.includes("log")) return "logarytmowanie";
  if (text.includes("sqrt")) return "pierwiastkowanie";
  if (text.includes("^")) return "potęgowanie";
  if (generatorId.startsWith("complex") && text.includes("i"))
    return "działanie na liczbach zespolonych";
  if (text.includes("[[")) return "praca na macierzy";
  if (generatorId.startsWith("fractions")) {
    if (text.includes("*") && text.includes("/"))
      return "sprowadzanie do wspólnego mianownika i skracanie";
    return "praca z ułamkami";
  }
  if (text.includes("+") && text.includes("-")) return "dodawanie i odejmowanie";
  if (text.includes("+")) return "dodawanie";
  if (text.includes("-")) return "odejmowanie";
  if (text.includes("*")) return "mnożenie";
  if (text.includes("/")) return "dzielenie";
  return "przekształcenie algebraiczne";
}

function familyAdvice(generatorId: string): string {
  if (generatorId.startsWith("fractions"))
    return "Pilnuj wspólnego mianownika, znaków w liczniku i tego, czy końcowy ułamek da się jeszcze skrócić.";
  if (generatorId.startsWith("matrix"))
    return "Sprawdź wymiary macierzy, a przy mnożeniu licz wiersz pierwszej macierzy razy kolumnę drugiej. Przy wyznaczniku pilnuj znaków dopełnień.";
  if (generatorId.startsWith("complex"))
    return "Pamiętaj, że i² = −1. Po uporządkowaniu osobno zbieraj część rzeczywistą i urojoną.";
  if (generatorId.startsWith("matura-liczby"))
    return "Uważaj na kolejność działań, dziedzinę oraz znak przy potęgach, pierwiastkach i logarytmach.";
  if (generatorId.startsWith("matura-funkcje"))
    return "Sprawdź, jaki argument podstawiasz i czy przepisałeś współczynniki wzoru funkcji bez zgubienia znaku.";
  if (generatorId.startsWith("matura-geometria"))
    return "Naszkicuj sytuację i sprawdź, czy używasz promienia, a nie średnicy, oraz czy długości są podniesione do właściwej potęgi.";
  return "Zapisz każdą operację osobno, a dopiero potem podstaw liczby. Łatwiej wtedy wychwycić zgubiony znak lub nawias.";
}

function checkAdvice(
  generatorId: string,
  expression: string,
  isLast: boolean,
): string {
  const text = expression.replace(/\s+/g, " ");
  if (text.includes("det("))
    return "Sprawdź wynik inną metodą: dla macierzy 2×2 policz ad − bc, a dla 3×3 porównaj z rozwinięciem Laplace'a.";
  if (text.includes("inv("))
    return "Pomnóż otrzymaną macierz przez wyjściową. Iloczyn powinien dać macierz jednostkową.";
  if (generatorId.startsWith("matrix"))
    return "Sprawdź, czy każdy wiersz ma tyle samo elementów i czy iloczyn wymiarów jest zgodny z działaniem.";
  if (generatorId.startsWith("complex"))
    return "Podstaw i² = −1 i porównaj osobno sumę części rzeczywistych oraz urojonych.";
  if (text.includes("log"))
    return "Podnieś podstawę logarytmu do otrzymanego wykładnika. Powinna wyjść liczba z polecenia.";
  if (text.includes("sqrt"))
    return "Podnieś wynik do kwadratu i porównaj z liczbą pod pierwiastkiem; pamiętaj o znaku pierwiastka.";
  if (generatorId.startsWith("fractions"))
    return "Policz przybliżenie dziesiętne albo pomnóż wynik przez mianownik, aby wrócić do wyjściowego licznika.";
  if (generatorId.startsWith("matura-geometria"))
    return "Podstaw otrzymaną długość do wzoru z polecenia i sprawdź, czy jednostki oraz kwadrat jednostki się zgadzają.";
  if (isLast)
    return "Wykonaj działanie odwrotne na wyniku i porównaj rząd wielkości z danymi z polecenia.";
  return "Przelicz ten sam krok jeszcze raz, zapisując każdą operację oddzielnie. To najszybciej wychwytuje błędy znaku i nawiasów.";
}

function buildDeepSteps(problem: Problem): string[] {
  const last = problem.steps.length - 1;
  return problem.steps.map((step, index) => {
    const isLast = index === last;
    const operation = operationLabel(step.expression, problem.generatorId);
    const previous =
      index > 0
        ? `Porównaj to z poprzednim krokiem (${problem.steps[index - 1].expression}): zmiana powinna wynikać dokładnie z operacji „${operation}”.`
        : `To pierwszy zapis rachunkowy. Upewnij się, że przepisałeś dane z polecenia bez skrótów myślowych.`;
    const ending = isLast
      ? "To wynik końcowy, więc sprawdź jeszcze, czy jego forma odpowiada temu, o co pyta zadanie."
      : "Nie przechodź dalej, dopóki nie potrafisz wskazać, skąd wzięła się każda liczba w tym zapisie.";
    const proof =
      isLast
        ? " To jest kontrola rachunkowa, a nie formalny dowód symboliczny."
        : "";
    return `Krok ${index + 1}: ${step.expression}. Wykorzystujesz tu ${operation}. ${previous} ${ending} ${familyAdvice(problem.generatorId)} ${checkAdvice(problem.generatorId, step.expression, isLast)}${proof}`;
  });
}

export function generateMasterProblem(
  topicId: string,
  difficulty: MasterDifficulty,
  seed?: number,
): MasterProblem {
  const topic = catalogRegistry.get(topicId) ?? fallbackTopic(topicId);
  const actualSeed = seed ?? randomMasterSeed();
  if (!Number.isSafeInteger(actualSeed))
    throw new Error("Ziarno musi być bezpieczną liczbą całkowitą.");
  const effectiveDifficulty =
    difficulty === "mixed"
      ? ((actualSeed >>> 0) % 5) + 1
      : difficulty;
  if (
    !Number.isInteger(effectiveDifficulty) ||
    effectiveDifficulty < 1 ||
    effectiveDifficulty > 5
  )
    throw new Error("Poziom trudności musi być liczbą całkowitą od 1 do 5.");
  const problem = generateProblem(
    topic.generatorId,
    effectiveDifficulty,
    actualSeed,
  );
  return {
    problem,
    topic,
    effectiveDifficulty,
    deepSteps: buildDeepSteps(problem),
  };
}
