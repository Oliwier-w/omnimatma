import type { Problem } from "./shared";
import { finish, gcd, type RNG } from "./shared";

const rational = (a: number, b: number): string => {
  const sign = Math.sign(a) * Math.sign(b) || 1;
  const g = gcd(Math.abs(a), Math.abs(b)) || 1;
  const numerator = (Math.abs(a) / g) * sign;
  const denominator = Math.abs(b) / g;
  return denominator === 1 ? `${numerator}` : `${numerator}/${denominator}`;
};

export const PERCENT_GENERATOR_IDS = ["extra-percent"] as const;
export const ALGEBRA_GENERATOR_IDS = [
  "extra-powers",
  "extra-linear-equations",
] as const;

export function percentProblem(
  generatorId: string,
  difficulty: number,
  seed: number,
  rng: RNG,
): Problem {
  const percent = rng(2, 9) * 5;
  const base = rng(4, 20 + difficulty * 10) * 10;
  const variant = rng(1, 3);
  let prompt: string;
  let answer: string;
  let expression: string;
  let explanation: string;

  if (difficulty === 1 || variant === 1) {
    const value = (base * percent) / 100;
    prompt = `Ile wynosi ${percent}% z ${base}?`;
    answer = rational(value, 1);
    expression = `(${percent}/100)*${base}`;
    explanation = `Zamieniamy procent na ułamek: ${percent}% = ${percent}/100, a potem mnożymy przez ${base}.`;
  } else if (variant === 2) {
    const value = base - (base * percent) / 100;
    prompt = `Cena ${base} zł spada o ${percent}%. Jaka jest nowa cena?`;
    answer = rational(value, 1);
    expression = `${base}-(${percent}/100)*${base}`;
    explanation = `Obniżka to ${percent}% z ${base}, więc od ceny wyjściowej odejmujemy obliczoną kwotę.`;
  } else {
    const value = base + (base * percent) / 100;
    prompt = `Cena ${base} zł rośnie o ${percent}%. Jaka jest nowa cena?`;
    answer = rational(value, 1);
    expression = `${base}+(${percent}/100)*${base}`;
    explanation = `Podwyżka to ${percent}% z ${base}; dodajemy ją do ceny wyjściowej.`;
  }

  const problem = finish(generatorId, difficulty, seed, prompt, answer, [expression], [explanation], [
    `Zapisz procent jako ułamek: ${percent}% = ${percent}/100.`,
    `Pomnóż przez wielkość bazową i wykonaj działanie na liczbach.`,
  ]);
  problem.mistakes = [
    { answer: rational(Number(answer) + 10, 1), message: `Pomyłka rachunkowa. Policz dokładnie ${percent}% z ${base}.` },
    { answer: rational(Number(answer) + base, 1), message: "Sprawdź, czy do ceny nie dodano (lub odjęto) całą wielkość bazową zamiast samego procentu." },
  ];
  return problem;
}

export function algebraProblem(
  generatorId: string,
  difficulty: number,
  seed: number,
  rng: RNG,
): Problem {
  if (generatorId === "extra-powers") {
    const a = rng(2, 5 + difficulty);
    const exponent = rng(2, 2 + Math.min(3, difficulty));
    const value = Math.pow(a, exponent);
    const rootBase = rng(2, 4 + difficulty);
    const square = rootBase * rootBase;
    const chooseRoot = difficulty >= 3 && rng(1, 2) === 1;
    const prompt = chooseRoot
      ? `Oblicz pierwiastek: √${square}.`
      : `Oblicz potęgę: ${a}^${exponent}.`;
    const answer = chooseRoot ? rootBase : value;
    const expression = chooseRoot ? `sqrt(${square})` : `${a}^${exponent}`;
    const problem = finish(generatorId, difficulty, seed, prompt, `${answer}`, [expression], [
      chooseRoot
        ? `Szukamy liczby, której kwadrat wynosi ${square}.`
        : `Podstawa ${a} występuje ${exponent} razy, więc mnożymy ją przez siebie.`,
    ], [
      chooseRoot ? `Sprawdź, że ${rootBase} · ${rootBase} = ${square}.` : `Rozpisz potęgę jako iloczyn i licz krok po kroku.`,
      chooseRoot ? "Pierwiastek drugiego stopnia to liczba nieujemna, której kwadrat daje liczbę podpierwiastkową." : `Wynik to iloczyn ${exponent} czynników równych ${a}.`,
    ]);
    problem.mistakes = [
      { answer: `${chooseRoot ? square : a * exponent}`, message: chooseRoot ? "To kwadrat liczby, a nie pierwiastek." : "To iloczyn podstawy i wykładnika, a nie potęga." },
    ];
    return problem;
  }

  const x = rng(-9, 9);
  const a = rng(2, 4 + difficulty);
  const b = rng(-12, 12);
  const c = a * x + b;
  const prompt = `Rozwiąż równanie: ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${c}.`;
  const problem = finish(generatorId, difficulty, seed, prompt, `${x}`, [`(${c}-(${b}))/${a}`], [
    `Najpierw przenosimy wyraz wolny na prawą stronę, potem dzielimy przez współczynnik ${a}.`,
  ], [
    `Od obu stron odejmij ${b}.`,
    `Podziel obie strony przez ${a}, aby zostało samo x.`,
  ]);
  problem.mistakes = [
    { answer: `${c - b}`, message: "Zapomniałeś podzielić przez współczynnik przy x." },
    { answer: `${-x}`, message: "Sprawdź znak po przeniesieniu wyrazu wolnego." },
  ];
  return problem;
}
