import type { Problem } from "./shared";
import { finish, gcd, type RNG } from "./shared";

export const STATISTICS_GENERATOR_IDS = ["extra-statistics"] as const;
export const ARCHITECTURE_GENERATOR_IDS = ["extra-architecture"] as const;

const rational = (a: number, b: number): string => {
  const g = gcd(Math.abs(a), Math.abs(b)) || 1;
  const denominator = Math.abs(b) / g;
  const numerator = (a / g) * Math.sign(b);
  return denominator === 1 ? `${numerator}` : `${numerator}/${denominator}`;
};

export function statisticsProblem(
  generatorId: string,
  difficulty: number,
  seed: number,
  rng: RNG,
): Problem {
  const count = 5 + Math.min(4, difficulty);
  const data = Array.from({ length: count }, () => rng(1, 4 + difficulty * 3));
  const sorted = [...data].sort((a, b) => a - b);
  const sum = data.reduce((total, value) => total + value, 0);
  const mean = rational(sum, count);
  const middle = Math.floor(count / 2);
  const median = count % 2 ? sorted[middle] : rational(sorted[middle - 1] + sorted[middle], 2);
  const variance = rational(
    data.reduce((total, value) => total + (value * count - sum) ** 2, 0),
    count * count * count,
  );

  const mode = difficulty >= 3 ? variance : difficulty === 2 ? median : mean;
  const label = difficulty >= 3 ? "wariancję populacji" : difficulty === 2 ? "medianę" : "średnią arytmetyczną";
  const prompt = `Dane są liczby: ${data.join(", ")}. Oblicz ${label}.`;
  const expression = difficulty >= 3 ? `(${data.map((value) => `(${value}-${sum}/${count})^2`).join("+")})/${count}` : `(${data.join("+")})/${count}`;
  const problem = finish(generatorId, difficulty, seed, prompt, `${mode}`, [expression], [
    difficulty >= 3
      ? `Najpierw oblicz średnią ${mean}, potem sumę kwadratów odchyleń i podziel przez liczbę obserwacji ${count}.`
      : difficulty === 2
        ? `Porządkujemy dane rosnąco i wybieramy wartość środkową (przy parzystej liczbie — średnią dwóch środkowych).`
        : `Dodajemy wszystkie liczby i dzielimy sumę ${sum} przez liczbę obserwacji ${count}.`,
  ], [
    `Uporządkuj dane: ${sorted.join(", ")}.`,
    `Liczba obserwacji wynosi ${count}; suma to ${sum}.`,
  ]);
  problem.mistakes = [
    { answer: `${sum}`, message: "To suma danych, a nie ich średnia." },
    { answer: rational(Number(mode) + 1, 1), message: "Sprawdź, czy wszystkie obserwacje zostały uwzględnione." },
  ];
  return problem;
}

function bin(value: number, bits: number) {
  return value.toString(2).padStart(bits, "0");
}

function hex(value: number) {
  return value.toString(16).toUpperCase();
}

export function architectureProblem(
  generatorId: string,
  difficulty: number,
  seed: number,
  rng: RNG,
): Problem {
  const bits = Math.min(8, 4 + difficulty);
  const max = Math.pow(2, bits) - 1;
  const value = rng(1, Math.min(max, 255));
  const variant = rng(1, 4);
  let prompt: string;
  let answer: string;
  let expression: string;
  let explanation: string;

  if (variant === 1) {
    const binary = bin(value, bits);
    prompt = `Liczba binarna ${binary} — ile wynosi jej wartość w systemie dziesiętnym?`;
    answer = `${value}`;
    expression = `${binary.split("").map((digit, index) => digit === "1" ? `2^${bits - 1 - index}` : "").filter(Boolean).join("+")}`;
    explanation = `Każda jedynka odpowiada potędze dwójki; sumujemy tylko pozycje z jedynką, co daje ${value}.`;
  } else if (variant === 2) {
    prompt = `Liczba szesnastkowa ${hex(value)} — ile wynosi jej wartość w systemie dziesiętnym?`;
    answer = `${value}`;
    expression = `${parseInt(hex(value), 16)}`;
    explanation = `Cyfry szesnastkowe mają wagi 16, 1, ...; po przeliczeniu otrzymujemy ${value}.`;
  } else if (variant === 3) {
    const binary = bin(value, bits);
    const ones = binary.split("").filter((digit) => digit === "1").length;
    prompt = `Zapis ${value} w systemie binarnym (${bits} bitów) — ile jedynek zawiera?`;
    answer = `${ones}`;
    expression = `${value}`;
    explanation = `Zamieniamy ${value} na ${bits}-bitowy zapis ${binary}; jedynek jest ${ones}.`;
  } else {
    const hexDigits = hex(value).length;
    prompt = `Zapis ${value} w systemie szesnastkowym — ile cyfr ma ten zapis?`;
    answer = `${hexDigits}`;
    expression = `${value}`;
    explanation = `Najpierw zamieniamy ${value} na ${hex(value)}; zapis ma ${hexDigits} cyfr.`;
  }

  if (difficulty >= 4 && rng(1, 2) === 1) {
    const negative = -rng(1, Math.min(40, value));
    const encoded = (negative + 256).toString(2).padStart(8, "0");
    prompt = `Ośmiobitowy kod U2 ${encoded} — jaka to liczba dziesiętna?`;
    answer = `${negative}`;
    expression = `${negative}`;
    explanation = `Najstarszy bit ma wagę −128. Po zsumowaniu wag jedynek otrzymujemy ${negative}.`;
  }

  const problem = finish(generatorId, difficulty, seed, prompt, answer, [expression], [explanation], [
    "Wypisz wagi kolejnych pozycji od lewej do prawej.",
    "Sumuj tylko te wagi, przy których stoi jedynka (w U2 najstarsza waga jest ujemna).",
  ]);
  problem.mistakes = [
    { answer: `${Number(answer) + 1}`, message: "Sprawdź wagi pozycji i znak najbardziej znaczącego bitu." },
  ];
  return problem;
}
