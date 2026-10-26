import { finish, fraction, gcd, type RNG } from "./shared";
import type { Problem } from "./shared";

/** Ułamek w postaci nieskracalnej; całkowite wyniki zapisujemy bez mianownika 1. */
function niceFraction(a: number, b: number): string {
  const g = gcd(a, b) || 1;
  const value = fraction(a, b);
  return Math.abs(b) / g === 1 ? String((a / g) * Math.sign(b)) : value;
}

function oddIn(rng: RNG, min: number, max: number): number {
  const value = rng(min, max);
  if (value % 2 === 1) return value;
  return value + 1 <= max ? value + 1 : value - 1;
}

function signedTerm(value: number, variable = ""): string {
  return `${value < 0 ? "−" : "+"} ${Math.abs(value)}${variable}`;
}

/**
 * Zadania 1–10 z arkusza CKE (matura poprawkowa, poziom podstawowy).
 * Każdy krok jest liczbowo równoważny końcowej odpowiedzi, więc scratchpad
 * może sprawdzać przekształcenia bez parsera symbolicznego.
 */
export function maturaLiczbyProblem(
  id: string,
  level: number,
  seed: number,
  rng: RNG,
): Problem {
  let prompt = "";
  let answer = "";
  let latex = "";
  let expressions: string[] = [];
  let explanations: string[] = [];
  let hints: string[] = [];
  let mistakes: Problem["mistakes"];

  switch (id) {
    case "matura-liczby-pierwiastki": {
      if (level === 1) {
        const k = rng(1, 6);
        const cube = -(k ** 3);
        answer = String(-k);
        prompt = `Oblicz ∛(${cube}). Podaj wynik jako liczbę całkowitą.`;
        latex = `\\sqrt[3]{${cube}}=?`;
        expressions = [`-${k}`, `0-${k}`, answer];
        explanations = [
          `Szukamy liczby, której trzecia potęga wynosi ${cube}.`,
          `Ponieważ (-${k})^3=${cube}, pierwiastek stopnia nieparzystego jest ujemny.`,
          `Wynik to ${answer}; znak pierwiastka jest taki sam jak znak liczby podpierwiastkowej.`,
        ];
        hints = [
          "Pierwiastek stopnia nieparzystego z liczby ujemnej jest liczbą ujemną.",
          `Sprawdź, jaka liczba podniesiona do trzeciej potęgi daje ${cube}.`,
          `Wynik jest równy -${k}, bo (-${k})·(-${k})·(-${k})=${cube}.`,
        ];
      } else if (level === 2) {
        const k = rng(1, 5);
        const m = rng(1, 3);
        const cube = -(k ** 3);
        const fifth = -(m ** 5);
        answer = String(-k - m);
        prompt = `Oblicz ∛(${cube}) + ⁵√(${fifth}). Podaj wynik jako liczbę całkowitą.`;
        latex = `\\sqrt[3]{${cube}}+\\sqrt[5]{${fifth}}=?`;
        expressions = [`-${k}-${m}`, `-(${k}+${m})`, answer];
        explanations = [
          `Pierwiastek trzeciego stopnia z ${cube} to -${k}.`,
          `Pierwiastek piątego stopnia z ${fifth} to -${m}, bo stopień jest nieparzysty.`,
          `Sumujemy liczby ujemne: -${k}+(-${m})=${answer}.`,
        ];
        hints = [
          "Oba pierwiastki mają nieparzysty stopień, więc wynik każdego z nich jest ujemny.",
          `Zamień ∛(${cube}) na -${k}, a ⁵√(${fifth}) na -${m}.`,
          "Dodawanie dwóch liczb ujemnych daje liczbę o większym module i znaku minus.",
        ];
      } else if (level === 3) {
        const k = rng(1, 5);
        const m = rng(1, 3);
        const c = rng(2, 4);
        const cube = k ** 3;
        const fifth = -(m ** 5);
        answer = String(c * k + m);
        prompt = `Oblicz ${c}·∛(${cube}) − ⁵√(${fifth}). Podaj wynik jako liczbę całkowitą.`;
        latex = `${c}\\cdot\\sqrt[3]{${cube}}-\\sqrt[5]{${fifth}}=?`;
        expressions = [`${c}*${k}+${m}`, `${c * k}+${m}`, answer];
        explanations = [
          `∛(${cube})=${k}, ponieważ ${k}^3=${cube}.`,
          `⁵√(${fifth})=-${m}; odejmowanie liczby ujemnej zamieniamy na dodawanie.`,
          `Stąd ${c}·${k}-(-${m})=${c * k}+${m}=${answer}.`,
        ];
        hints = [
          "Najpierw oblicz osobno każdy pierwiastek, dopiero potem wykonaj działania.",
          `Pamiętaj, że −(−${m}) to +${m}.`,
          `Iloczyn ${c}·${k} wynosi ${c * k}; dodaj do niego ${m}.`,
        ];
      } else if (level === 4) {
        const k = rng(1, 5);
        const m = rng(1, 3);
        let s = rng(2, 8);
        let value = -k + s - m;
        if (value === 0) {
          s += 1;
          value = -k + s - m;
        }
        const cube = -(k ** 3);
        const fifth = m ** 5;
        const square = s ** 2;
        answer = String(value);
        prompt = `Oblicz ∛(${cube}) + √(${square}) − ⁵√(${fifth}). Podaj wynik jako liczbę całkowitą.`;
        latex = `\\sqrt[3]{${cube}}+\\sqrt{${square}}-\\sqrt[5]{${fifth}}=?`;
        expressions = [`-${k}+${s}-${m}`, `${s - k}-${m}`, answer];
        explanations = [
          `∛(${cube})=-${k}, a √(${square})=${s}.`,
          `⁵√(${fifth})=${m}, więc odejmujemy ${m}.`,
          `Obliczamy -${k}+${s}-${m}=${answer}; kolejność dodawania nie zmienia wyniku.`,
        ];
        hints = [
          "Oblicz każdy pierwiastek oddzielnie, zwracając uwagę na znak liczby podpierwiastkowej.",
          `Pierwiastek kwadratowy z ${square} jest dodatni i wynosi ${s}.`,
          `Wykonaj działania od lewej do prawej: -${k}+${s}-${m}.`,
        ];
      } else {
        const k = rng(1, 4);
        const m = rng(1, 3);
        const c = rng(2, 4);
        const d = rng(2, 3);
        let s = rng(3, 10);
        let value = -c * k - d * m + s;
        if (value === 0) {
          s += 1;
          value = -c * k - d * m + s;
        }
        const cube = -(k ** 3);
        const fifth = m ** 5;
        const square = s ** 2;
        answer = String(value);
        prompt = `Oblicz ${c}·∛(${cube}) − ${d}·⁵√(${fifth}) + √(${square}). Podaj wynik jako liczbę całkowitą.`;
        latex = `${c}\\cdot\\sqrt[3]{${cube}}-${d}\\cdot\\sqrt[5]{${fifth}}+\\sqrt{${square}}=?`;
        expressions = [
          `-${c}*${k}-${d}*${m}+${s}`,
          `${-c * k - d * m}+${s}`,
          answer,
        ];
        explanations = [
          `∛(${cube})=-${k}, dlatego pierwszy składnik to ${c}·(-${k})=${-c * k}.`,
          `⁵√(${fifth})=${m}, więc drugi składnik po odjęciu to ${-d * m}.`,
          `Dodajemy √(${square})=${s}: ${-c * k}+(${-d * m})+${s}=${answer}.`,
        ];
        hints = [
          "Wyznacz znak każdego pierwiastka, zanim pomnożysz go przez współczynnik.",
          `Współczynnik ${c} mnoży wynik -${k}, a współczynnik ${d} mnoży wynik ${m}.`,
          `Na końcu dodaj ${s} i sprawdź znak całej sumy.`,
        ];
      }
      break;
    }

    case "matura-liczby-potegi": {
      if (level === 1) {
        const a = rng(2, 5);
        const n = rng(1, 4);
        answer = niceFraction(1, a ** n);
        prompt = `Oblicz ${a}^(-${n}). Wynik podaj jako ułamek lub liczbę.`;
        latex = `${a}^{-${n}}=?`;
        expressions = [`1/(${a}^${n})`, `1/${a ** n}`, answer];
        explanations = [
          "Potęga o wykładniku ujemnym jest odwrotnością potęgi o wykładniku dodatnim.",
          `${a}^(-${n})=1/${a}^${n}=1/${a ** n}.`,
          `Po wykonaniu dzielenia otrzymujemy ${answer}.`,
        ];
        hints = [
          "Zastosuj wzór a^(-n)=1/(a^n); minus w wykładniku nie oznacza liczby ujemnej.",
          `Najpierw oblicz ${a}^${n}=${a ** n}.`,
          `Wynik jest odwrotnością ${a ** n}, więc mianownik jest większy od licznika.`,
        ];
      } else if (level === 2) {
        let p = rng(2, 5);
        let q = rng(2, 5);
        if (p === q) q = q === 5 ? 4 : q + 1;
        const n = rng(1, 3);
        answer = niceFraction(q ** n, p ** n);
        prompt = `Oblicz (${p}/${q})^(-${n}). Wynik podaj jako ułamek lub liczbę.`;
        latex = `\\left(\\frac{${p}}{${q}}\\right)^{-${n}}=?`;
        expressions = [
          `(${q}^${n})/(${p}^${n})`,
          `${q ** n}/${p ** n}`,
          answer,
        ];
        explanations = [
          "Potęgowanie ułamka obejmuje osobno licznik i mianownik.",
          `Odwrotność ułamka ${p}/${q} to ${q}/${p}, a wykładnik ${n} dotyczy całej odwrotności.`,
          `Stąd (${q}/${p})^${n}=${q ** n}/${p ** n}=${answer}.`,
        ];
        hints = [
          "Najpierw zamień podstawę na odwrotność, potem podnieś licznik i mianownik do potęgi.",
          `Wykładnik -${n} oznacza, że licznik i mianownik zamieniają się miejscami.`,
          `Sprawdź, czy ułamek ${q ** n}/${p ** n} da się skrócić; wynik ma być nieskracalny.`,
        ];
      } else if (level === 3) {
        const n = rng(2, 3);
        const b = rng(2, 4);
        const m = rng(1, n - 1);
        const a = b ** n;
        answer = String(b ** m);
        prompt = `Oblicz ${a}^(${m}/${n}). Podaj wynik jako liczbę całkowitą.`;
        latex = `${a}^{\\frac{${m}}{${n}}}=?`;
        expressions = [`${b}^${m}`, `${b ** m}`, answer];
        explanations = [
          `Wykładnik ${m}/${n} oznacza pierwiastek stopnia ${n}, a następnie potęgę ${m}.`,
          `Ponieważ ${b}^${n}=${a}, mamy ${a}^(1/${n})=${b}.`,
          `Podnosimy ${b} do potęgi ${m}: ${b}^${m}=${answer}.`,
        ];
        hints = [
          "Zamień wykładnik ułamkowy na pierwiastek: a^(m/n) to pierwiastek n-tego stopnia z a^m.",
          `Liczba ${a} jest ${n}. potęgą liczby ${b}.`,
          `Po wyciągnięciu pierwiastka zostaje potęga ${b}^${m}.`,
        ];
      } else if (level === 4) {
        const n = rng(2, 3);
        const b = rng(2, 4);
        const m = rng(1, n - 1);
        const a = b ** n;
        const c = rng(2, 4);
        const k = rng(1, 3);
        answer = niceFraction(b ** m, c ** k);
        prompt = `Oblicz ${a}^(${m}/${n}) · ${c}^(-${k}). Wynik podaj jako ułamek lub liczbę.`;
        latex = `${a}^{\\frac{${m}}{${n}}}\\cdot ${c}^{-${k}}=?`;
        expressions = [
          `(${b}^${m})/(${c}^${k})`,
          `${b ** m}/${c ** k}`,
          answer,
        ];
        explanations = [
          `Pierwszy czynnik to ${a}^(${m}/${n})=${b}^${m}=${b ** m}.`,
          `Drugi czynnik ${c}^(-${k}) zamieniamy na 1/${c ** k}.`,
          `Iloczyn ${b ** m}·1/${c ** k} daje ${answer}.`,
        ];
        hints = [
          "Rozłóż zadanie na dwa czynniki i osobno zastosuj wykładnik ułamkowy oraz ujemny.",
          `Liczba ${a} jest ${n}. potęgą liczby ${b}, więc pierwiastek znika.`,
          `Ujemny wykładnik ${c}^(-${k}) przenosi potęgę do mianownika.`,
        ];
      } else {
        const n = rng(2, 3);
        const b = rng(2, 4);
        const m = rng(1, n - 1);
        const a = b ** n;
        const c = rng(2, 3);
        const k = rng(1, 2);
        let d = rng(2, 4);
        if (d === c) d = d === 4 ? 3 : d + 1;
        const r = rng(1, 3);
        answer = niceFraction(b ** m * d ** r, c ** k);
        prompt = `Oblicz (${a}^(${m}/${n}) · ${c}^(-${k})) / ${d}^(-${r}). Wynik podaj jako ułamek lub liczbę.`;
        latex = `\\frac{${a}^{\\frac{${m}}{${n}}}\\cdot ${c}^{-${k}}}{${d}^{-${r}}}=?`;
        expressions = [
          `(${b}^${m}*${d}^${r})/(${c}^${k})`,
          `${b ** m * d ** r}/${c ** k}`,
          answer,
        ];
        explanations = [
          `Pierwszy czynnik upraszczamy do ${b}^${m}=${b ** m}.`,
          `Dzielenie przez ${d}^(-${r}) to mnożenie przez ${d ** r}.`,
          `Ostatecznie (${b ** m}·${d ** r})/${c ** k}=${answer}.`,
        ];
        hints = [
          "Najpierw uprość każdą potęgę, a dopiero potem wykonaj mnożenie i dzielenie.",
          `Dzielenie przez potęgę o wykładniku -${r} zamień na mnożenie przez ${d ** r}.`,
          `Sprawdź, czy licznik ${b ** m * d ** r} i mianownik ${c ** k} mają wspólny dzielnik.`,
        ];
      }
      break;
    }

    case "matura-liczby-logarytmy": {
      if (level <= 4) {
        const base = [2, 3, 5, 10][level - 1];
        const p = rng(1, level === 1 ? 2 : 3);
        const q = rng(1, level === 1 ? 2 : 3);
        const r = rng(1, level === 1 ? 2 : 3);
        const x = base ** p;
        const y = base ** q;
        const z = base ** r;
        answer = String(p + q - r);
        prompt = `Oblicz log_${base} ${x} + log_${base} ${y} − log_${base} ${z}.`;
        latex = `\\log_{${base}} ${x}+\\log_{${base}} ${y}-\\log_{${base}} ${z}=?`;
        expressions = [`${p}+${q}-${r}`, `${p + q}-${r}`, answer];
        explanations = [
          `log_${base} ${x}=${p}, bo ${base}^${p}=${x}.`,
          `log_${base} ${y}=${q} oraz log_${base} ${z}=${r}.`,
          `Suma logarytmów o tej samej podstawie odpowiada logarytmowi iloczynu, a różnica — ilorazu; wynik to ${answer}.`,
        ];
        hints = [
          "Zamień każdy logarytm na wykładnik, do którego trzeba podnieść podstawę.",
          `Korzystaj z wzorów log_a(xy)=log_a x+log_a y oraz log_a(x/y)=log_a x−log_a y.`,
          `Wystarczy obliczyć ${p}+${q}-${r}; podstawa logarytmu pozostaje ta sama.`,
        ];
      } else {
        const base = rng(2, 3);
        const k = rng(1, 3);
        let p = rng(2, 4);
        if (p === k) p += 1;
        answer = niceFraction(2 * (p - k) - 1, 2);
        prompt = `Oblicz log_${base} (1/${base ** k}) + log_${base} ${base ** p} − log_${base} √${base}.`;
        latex = `\\log_{${base}} \\frac{1}{${base}^{${k}}}+\\log_{${base}} ${base ** p}-\\log_{${base}} \\sqrt{${base}}=?`;
        expressions = [`-${k}+${p}-1/2`, `${2 * (p - k) - 1}/2`, answer];
        explanations = [
          `log_${base}(1/${base ** k})=-${k}, bo odwrotność potęgi zmienia znak wykładnika.`,
          `log_${base} ${base ** p}=${p}, a log_${base}√${base}=1/2.`,
          `Stąd -${k}+${p}-1/2=${answer}; część ułamkowa wynika z pierwiastka kwadratowego.`,
        ];
        hints = [
          "Zamień 1/a^k na a^(-k); logarytm zwraca wtedy ujemny wykładnik.",
          `Pierwiastek kwadratowy z ${base} to ${base}^(1/2), więc jego logarytm wynosi 1/2.`,
          `Wykonaj działania na wykładnikach: -${k}+${p}-1/2.`,
        ];
      }
      break;
    }

    case "matura-liczby-wzory-skrocone": {
      mistakes = [{
        answer: "0",
        message: "Pominięto wyraz mieszany 2ab. Kwadrat sumy to (a+b)²=a²+2ab+b², a kwadrat różnicy to (a−b)²=a²−2ab+b². Po odjęciu zostaje 4ab, nie zero — także dla a=π lub a=√2.",
      }];
      if (level === 1 || level === 2) {
        const b = level === 1 ? rng(1, 10) : rng(11, 20);
        const left = level === 1 ? `(π + b)` : `(b + π)`;
        const right = level === 1 ? `(π − b)` : `(b − π)`;
        answer = `${4 * b}*pi`;
        prompt = `Oblicz ${left}^2 − ${right}^2 dla b = ${b}.`;
        latex =
          level === 1
            ? `(\\pi+b)^2-(\\pi-b)^2,\\quad b=${b}`
            : `(b+\\pi)^2-(b-\\pi)^2,\\quad b=${b}`;
        expressions = [`4*pi*${b}`, `${4 * b}*pi`, answer];
        explanations = [
          "Rozwiń oba kwadraty: (a+b)^2=a^2+2ab+b^2 oraz (a-b)^2=a^2-2ab+b^2.",
          "Po odjęciu kwadratów składniki a^2 i b^2 się redukują, zostaje 4ab.",
          `Dla a=π i b=${b} otrzymujemy 4·π·${b}=${4 * b}π=${answer}.`,
        ];
        hints = [
          "Nie musisz podstawiać π od razu — najpierw uprość całe wyrażenie.",
          "Różnica kwadratów (a+b)^2−(a−b)^2 jest równa 4ab.",
          `Podstaw a=π oraz b=${b} do uproszczonego wzoru.`,
        ];
      } else if (level === 3 || level === 4) {
        const b = level === 3 ? rng(1, 10) : rng(11, 20);
        const left = level === 3 ? `(√2 + b)` : `(b + √2)`;
        const right = level === 3 ? `(√2 − b)` : `(b − √2)`;
        answer = `${4 * b}*sqrt(2)`;
        prompt = `Oblicz ${left}^2 − ${right}^2 dla b = ${b}.`;
        latex =
          level === 3
            ? `(\\sqrt{2}+b)^2-(\\sqrt{2}-b)^2,\\quad b=${b}`
            : `(b+\\sqrt{2})^2-(b-\\sqrt{2})^2,\\quad b=${b}`;
        expressions = [`4*${b}*sqrt(2)`, `${4 * b}*sqrt(2)`, answer];
        explanations = [
          "Zastosuj wzory skróconego mnożenia do obu nawiasów.",
          "Wyrażenie zawsze redukuje się do 4ab, niezależnie od wartości a i b.",
          `Tutaj a=√2 i b=${b}, więc wynik to 4·${b}·√2=${4 * b}√2.`,
        ];
        hints = [
          "Uprość symbolicznie, zanim wstawisz √2; większość składników się skróci.",
          "Otrzymasz 4ab, gdzie a=√2, a b jest podane w treści.",
          `Pomnóż 4·${b} i pozostaw √2 w wyniku.`,
        ];
      } else {
        const choices = [2, 3, 5, 6, 7, 8];
        const b = choices[rng(0, choices.length - 1)];
        answer = `4*pi*sqrt(${b})`;
        prompt = `Oblicz (π + √b)^2 − (π − √b)^2 dla b = ${b}.`;
        latex = `(\\pi+\\sqrt{b})^2-(\\pi-\\sqrt{b})^2,\\quad b=${b}`;
        expressions = [
          `4*pi*sqrt(${b})`,
          `4*sqrt(${b})*pi`,
          answer,
        ];
        explanations = [
          "Po rozwinięciu obu kwadratów wyrazy π^2 oraz b redukują się.",
          "Pozostaje 4ab, gdzie a=π, a b=√b; iloczyn wynosi 4π√b.",
          `Dla b=${b} otrzymujemy 4π√${b}, czyli ${answer}.`,
        ];
        hints = [
          "Traktuj √b jak jedną liczbę i zastosuj wzór (a+c)^2−(a−c)^2=4ac.",
          "W tym zadaniu a=π oraz c=√b.",
          `Wynik ma postać 4π√b; podstaw b=${b}.`,
        ];
      }
      break;
    }

    case "matura-liczby-podzielnosc": {
      let n = 0;
      let divisor = 1;
      let expressionText = "";
      let quotient = 0;
      let algebra = "";
      if (level === 1) {
        n = oddIn(rng, 3, 15);
        divisor = 24;
        expressionText = "n^3 − n";
        quotient = (n ** 3 - n) / divisor;
        algebra =
          "n^3−n=(n−1)n(n+1); wśród trzech kolejnych liczb jedna dzieli się przez 3, a iloczyn dwóch liczb parzystych sąsiadujących z nieparzystym n dzieli się przez 8.";
      } else if (level === 2) {
        n = oddIn(rng, 1, 15);
        divisor = 12;
        expressionText = "3n^2 + 6n + 15";
        quotient = (3 * n ** 2 + 6 * n + 15) / divisor;
        algebra =
          "3n^2+6n+15=3[(n+1)^2+4]; dla nieparzystego n liczba n+1 jest parzysta, więc (n+1)^2+4 dzieli się przez 4.";
      } else if (level === 3) {
        n = oddIn(rng, 3, 9);
        divisor = 30;
        expressionText = "n^5 − n";
        quotient = (n ** 5 - n) / divisor;
        algebra =
          "n^5−n=n(n−1)(n+1)(n^2+1); z twierdzenia Fermata liczba n^5−n dzieli się przez 2, 3 i 5, a te liczby są parami względnie pierwsze, więc dzieli się przez 30.";
      } else if (level === 4) {
        n = oddIn(rng, 3, 11);
        divisor = 16;
        expressionText = "n^4 − 1";
        quotient = (n ** 4 - 1) / divisor;
        algebra =
          "n^4−1=(n−1)(n+1)(n^2+1); dla n=2k+1 liczby n−1 i n+1 są kolejnymi liczbami parzystymi, a n^2+1 jest parzyste, co daje czynnik 16.";
      } else {
        n = oddIn(rng, 3, 9);
        divisor = 240;
        expressionText = "n^5 − n";
        quotient = (n ** 5 - n) / divisor;
        algebra =
          "n^5−n=n(n−1)(n+1)(n^2+1); dla nieparzystego n iloczyn jest podzielny przez 16, 3 i 5, a te liczby są parami względnie pierwsze, więc przez 240.";
      }
      answer = String(quotient);
      prompt = `Uzasadnij, że dla każdej nieparzystej liczby całkowitej n liczba ${expressionText} jest podzielna przez ${divisor}. Następnie oblicz iloraz dla n = ${n}.`;
      latex =
        level === 1 || level === 3 || level === 5
          ? `\\frac{${level === 1 ? "n^3-n" : "n^5-n"}}{${divisor}},\\quad n=${n}\\text{ nieparzyste}`
          : `\\frac{${level === 2 ? "3n^2+6n+15" : "n^4-1"}}{${divisor}},\\quad n=${n}\\text{ nieparzyste}`;
      if (level === 1)
        expressions = [
          `(${n}^3-${n})/${divisor}`,
          `${n ** 3 - n}/${divisor}`,
          answer,
        ];
      else if (level === 2)
        expressions = [
          `(3*${n}^2+6*${n}+15)/${divisor}`,
          `${3 * n ** 2 + 6 * n + 15}/${divisor}`,
          answer,
        ];
      else if (level === 3)
        expressions = [
          `(${n}^5-${n})/${divisor}`,
          `${n ** 5 - n}/${divisor}`,
          answer,
        ];
      else if (level === 4)
        expressions = [
          `(${n}^4-1)/${divisor}`,
          `${n ** 4 - 1}/${divisor}`,
          answer,
        ];
      else
        expressions = [
          `(${n}^5-${n})/${divisor}`,
          `${n ** 5 - n}/${divisor}`,
          answer,
        ];
      explanations = [
        algebra,
        `Podstawiamy n=${n}; otrzymujemy iloraz ${quotient}.`,
        `Iloraz jest liczbą całkowitą, co potwierdza podzielność dla wybranej liczby nieparzystej.`,
      ];
      hints = [
        "Zapisz n=2k+1 i wykorzystaj parzystość oraz rozkład na czynniki.",
        `Rozłóż wyrażenie ${expressionText} na iloczyn, a następnie sprawdź, które czynniki są podzielne przez ${divisor}.`,
        `Dla n=${n} wystarczy podstawić do wyrażenia i podzielić przez ${divisor}; wynik to ${quotient}.`,
      ];
      break;
    }

    case "matura-liczby-nierownosc-liniowa": {
      if (level === 1) {
        const a = rng(2, 4);
        const b = rng(1, 9);
        const k = rng(-2, 6);
        const c = a * k + b;
        answer = String(k);
        prompt = `Znajdź najmniejszą liczbę całkowitą spełniającą nierówność ${a}x + ${b} ≥ ${c}.`;
        latex = `${a}x+${b}\\ge ${c}=?`;
        expressions = [`(${c}-${b})/${a}`, answer, answer];
        explanations = [
          `Odejmujemy ${b} od obu stron: ${a}x ≥ ${c - b}.`,
          `Dzielimy przez dodatnią liczbę ${a}: x ≥ ${k}.`,
          `Zbiór rozwiązań to przedział [${k},∞), więc najmniejsza liczba całkowita to ${k}.`,
        ];
        hints = [
          "Przenieś wyraz wolny na prawą stronę, zmieniając jego znak.",
          `Po odjęciu ${b} otrzymasz ${a}x ≥ ${c - b}.`,
          `Podziel obie strony przez ${a}; współczynnik jest dodatni, więc znak nierówności się nie zmienia.`,
        ];
      } else if (level === 2 || level === 4) {
        const a = level === 2 ? rng(2, 4) : rng(5, 7);
        const k = rng(1, level === 2 ? 8 : 7);
        const b = rng(1, 9);
        const c = a * k + 1 - b;
        answer = String(k + 1);
        prompt = `Znajdź najmniejszą liczbę całkowitą spełniającą nierówność ${a}x − ${b} > ${c}.`;
        latex = `${a}x-${b}\\gt ${c}=?`;
        expressions = [
          `(${c}+${b}+${a}-1)/${a}`,
          answer,
          answer,
        ];
        explanations = [
          `Dodajemy ${b} do obu stron: ${a}x > ${c + b}.`,
          `Dzielimy przez ${a}: x > ${k}+1/${a}, czyli x jest większe od ${k}+${1}/${a}.`,
          `Najmniejsza liczba całkowita większa od ${k}+1/${a} to ${k + 1}.`,
        ];
        hints = [
          "Najpierw przenieś stałą na prawą stronę, aby odizolować wyraz z x.",
          `Otrzymasz ${a}x > ${c + b}; podziel przez ${a}.`,
          "Granica nie jest liczbą całkowitą, więc najmniejsza liczba całkowita jest o 1 większa od części całkowitej granicy.",
        ];
      } else if (level === 3) {
        const a = rng(3, 5);
        const b = rng(2, 9);
        const k = rng(-1, 6);
        const c = a * k + b;
        answer = String(k);
        prompt = `Znajdź najmniejszą liczbę całkowitą spełniającą nierówność ${b} + ${a}x ≥ ${c}.`;
        latex = `${b}+${a}x\\ge ${c}=?`;
        expressions = [`(${c}-${b})/${a}`, answer, answer];
        explanations = [
          `Odejmujemy ${b}: ${a}x ≥ ${c - b}.`,
          `Dzielimy przez ${a}: x ≥ ${k}.`,
          `Najmniejszą liczbą całkowitą w przedziale [${k},∞) jest ${k}.`,
        ];
        hints = [
          "Kolejność składników nie ma znaczenia — najpierw usuń wyraz wolny.",
          `Nierówność jest równoważna ${a}x ≥ ${c - b}.`,
          `Podziel przez ${a}; wynik jest dokładnie liczbą całkowitą ${k}.`,
        ];
      } else {
        const a = rng(6, 9);
        const b = rng(1, 9);
        const k = rng(0, 8);
        const c = a * k + b;
        answer = String(k);
        prompt = `Znajdź najmniejszą liczbę całkowitą spełniającą nierówność ${c} ≤ ${a}x + ${b}.`;
        latex = `${c}\\le ${a}x+${b}=?`;
        expressions = [`(${c}-${b})/${a}`, answer, answer];
        explanations = [
          `Odejmujemy ${b} od obu stron: ${c - b} ≤ ${a}x.`,
          `Dzielimy przez ${a}: ${k} ≤ x, czyli x ≥ ${k}.`,
          `Najmniejsza liczba całkowita spełniająca warunek to ${k}.`,
        ];
        hints = [
          "Zapisz nierówność w wygodnej kolejności: wyrażenie z x po lewej stronie.",
          `Po odjęciu ${b} otrzymasz ${c - b} ≤ ${a}x.`,
          `Podziel obie strony przez ${a}; znak nierówności pozostaje bez zmian.`,
        ];
      }
      break;
    }

    case "matura-liczby-rownanie-iloczynowe": {
      if (level === 1) {
        let p = rng(1, 9);
        let q = rng(2, 12);
        if (p === q) q = q === 12 ? 11 : q + 1;
        answer = String(p + q);
        prompt = `Oblicz sumę rozwiązań równania (x − ${p})(x − ${q}) = 0.`;
        latex = `(x-${p})(x-${q})=0`;
        expressions = [`${p}+${q}`, answer, answer];
        explanations = [
          "Iloczyn jest równy zero wtedy i tylko wtedy, gdy co najmniej jeden czynnik jest zerem.",
          `Rozwiązaniami są x=${p} oraz x=${q}.`,
          `Suma rozwiązań to ${p}+${q}=${answer}.`,
        ];
        hints = [
          "Przyrównaj każdy nawias do zera osobno.",
          `Otrzymasz równania x−${p}=0 oraz x−${q}=0.`,
          `Dodaj otrzymane rozwiązania: ${p}+${q}.`,
        ];
      } else if (level === 2) {
        const p = rng(1, 9);
        const q = rng(10, 20);
        answer = String(q - p);
        prompt = `Oblicz sumę rozwiązań równania (x + ${p})(x − ${q}) = 0.`;
        latex = `(x+${p})(x-${q})=0`;
        expressions = [`${q}-${p}`, answer, answer];
        explanations = [
          "Każdy czynnik przyrównujemy do zera.",
          `Pierwszy daje x=-${p}, drugi x=${q}.`,
          `Suma wynosi -${p}+${q}=${answer}.`,
        ];
        hints = [
          "Z nawiasu x+a otrzymujemy rozwiązanie x=-a.",
          `Rozwiązaniami są -${p} oraz ${q}.`,
          `Dodaj liczbę ujemną i dodatnią, pamiętając o znaku.`,
        ];
      } else if (level === 3) {
        const a = rng(2, 4);
        const p = rng(1, 9);
        const q = rng(1, 9);
        answer = niceFraction(p - a * q, a);
        prompt = `Oblicz sumę rozwiązań równania (${a}x − ${p})(x + ${q}) = 0.`;
        latex = `(${a}x-${p})(x+${q})=0`;
        expressions = [`${p}/${a}-${q}`, `${p - a * q}/${a}`, answer];
        explanations = [
          `Pierwszy czynnik zeruje się dla x=${p}/${a}.`,
          `Drugi czynnik zeruje się dla x=-${q}.`,
          `Suma to ${p}/${a}-${q}=${answer}.`,
        ];
        hints = [
          "Rozwiąż osobno równania a x−p=0 oraz x+q=0.",
          `Pierwsze rozwiązanie to ${p}/${a}, drugie to -${q}.`,
          `Sprowadź sumę do wspólnego mianownika ${a}.`,
        ];
      } else if (level === 4) {
        const p = rng(2, 9);
        const q = rng(1, 8);
        let r = rng(1, 9);
        const a = rng(2, 4);
        if (r === a * p) r = r === 9 ? 8 : r + 1;
        answer = niceFraction(a * (p - q) + r, a);
        prompt = `Oblicz sumę rozwiązań równania (x − ${p})(x + ${q})(${a}x − ${r}) = 0.`;
        latex = `(x-${p})(x+${q})(${a}x-${r})=0`;
        expressions = [
          `${p}-${q}+${r}/${a}`,
          `${a * (p - q) + r}/${a}`,
          answer,
        ];
        explanations = [
          `Rozwiązania to x=${p}, x=-${q} oraz x=${r}/${a}.`,
          "Sumujemy je, pamiętając o znakach przy drugim pierwiastku.",
          `Otrzymujemy ${p}-${q}+${r}/${a}=${answer}.`,
        ];
        hints = [
          "Każdy z trzech czynników może być zerem — daj trzy rozwiązania.",
          `Trzeci czynnik daje x=${r}/${a}.`,
          `Suma: ${p}+(-${q})+${r}/${a}; sprowadź ułamek do wspólnego mianownika.`,
        ];
      } else {
        const p = rng(1, 7);
        let r = rng(2, 8);
        if (r === p) r = r === 8 ? 7 : r + 1;
        const q = rng(1, 7);
        let s = rng(2, 8);
        if (s === q) s = s === 8 ? 7 : s + 1;
        answer = String(q + s - p - r);
        prompt = `Oblicz sumę rozwiązań równania (x + ${p})(x − ${q})(x + ${r})(x − ${s}) = 0.`;
        latex = `(x+${p})(x-${q})(x+${r})(x-${s})=0`;
        expressions = [`-${p}+${q}-${r}+${s}`, answer, answer];
        explanations = [
          `Rozwiązaniami są x=-${p}, x=${q}, x=-${r} oraz x=${s}.`,
          "Sumujemy wszystkie cztery rozwiązania, uwzględniając znaki.",
          `Suma wynosi -${p}+${q}-${r}+${s}=${answer}.`,
        ];
        hints = [
          "Cztery czynniki liniowe dają cztery rozwiązania.",
          `Zapisujesz rozwiązania jako -${p}, ${q}, -${r}, ${s}.`,
          `Dodawanie wykonaj parami, aby nie zgubić znaku.`,
        ];
      }
      break;
    }

    case "matura-liczby-wyrazenia-wymierne": {
      if (level === 1) {
        const a = rng(2, 9);
        answer = String(a);
        prompt = `Uprość wyrażenie (x^2 − ${a ** 2})/(x − ${a}), a następnie podaj wyraz wolny otrzymanego dwumianu (dla x ≠ ${a}).`;
        latex = `\\frac{x^2-${a ** 2}}{x-${a}}`;
        expressions = [`${a}`, `${a}`, answer];
        explanations = [
          `Licznik rozkładamy ze wzoru a^2−b^2: x^2−${a ** 2}=(x−${a})(x+${a}).`,
          `Skracamy wspólny czynnik x−${a}, otrzymując x+${a}.`,
          `Wyraz wolny tego dwumianu to ${a}.`,
        ];
        hints = [
          "Zastosuj wzór na różnicę kwadratów w liczniku.",
          `x^2−${a ** 2}=(x−${a})(x+${a}).`,
          "Po skróceniu odczytaj liczbę, która nie jest pomnożona przez x.",
        ];
      } else if (level === 2) {
        let a = rng(1, 7);
        let b = rng(2, 9);
        if (a === b) b = b === 9 ? 8 : b + 1;
        answer = String(b);
        prompt = `Uprość wyrażenie (x^2 + ${a + b}x + ${a * b})/(x + ${a}), a następnie podaj wyraz wolny otrzymanego dwumianu (dla x ≠ -${a}).`;
        latex = `\\frac{x^2+${a + b}x+${a * b}}{x+${a}}`;
        expressions = [`${b}`, `${b}`, answer];
        explanations = [
          `Licznik to (x+${a})(x+${b}), co można sprawdzić, mnożąc nawiasy.`,
          `Skracamy x+${a} i zostaje x+${b}.`,
          `Wyraz wolny otrzymanego dwumianu to ${b}.`,
        ];
        hints = [
          "Znajdź dwie liczby, których iloczyn jest wyrazem wolnym, a suma — współczynnikiem przy x.",
          `Szukane liczby to ${a} i ${b}.`,
          `Po skróceniu nawiasu x+${a} pozostaje x+${b}.`,
        ];
      } else if (level === 3) {
        const a = rng(2, 6);
        let c = rng(1, 7);
        if (c === 2 * a) c = c === 7 ? 6 : c + 1;
        const bCoef = c - 2 * a;
        const constant = -a * c;
        answer = String(c);
        prompt = `Uprość wyrażenie (2x^2 ${signedTerm(bCoef, "x")} ${signedTerm(constant)})/(x − ${a}), a następnie podaj wyraz wolny otrzymanego dwumianu (dla x ≠ ${a}).`;
        latex = `\\frac{2x^2${bCoef >= 0 ? "+" : "-"}${Math.abs(bCoef)}x${constant >= 0 ? "+" : "-"}${Math.abs(constant)}}{x-${a}}`;
        expressions = [`${c}`, `${c}`, answer];
        explanations = [
          `Dzielimy 2x^2 przez x, otrzymując 2x; mnożymy (x−${a})·2x i odejmujemy od licznika.`,
          `Reszta daje składnik ${c}, więc iloraz to 2x+${c}.`,
          `Wyraz wolny otrzymanego dwumianu 2x+${c} wynosi ${c}; współczynnik przy x to 2.`,
        ];
        hints = [
          "Wykonaj dzielenie wielomianów albo sprawdź, jaki dwumian pomnożony przez x−a daje licznik.",
          `Szukany iloraz ma postać 2x+c; porównaj wyrazy wolne.`,
          `Iloczyn (x−${a})(2x+c) ma wyraz wolny -${a}c, więc c=${c}.`,
        ];
      } else if (level === 4) {
        const a = rng(2, 6);
        answer = String(-a);
        prompt = `Uprość wyrażenie (x^3 − ${a ** 3})/(x^2 + ${a}x + ${a ** 2}), a następnie podaj wyraz wolny otrzymanego dwumianu.`;
        latex = `\\frac{x^3-${a ** 3}}{x^2+${a}x+${a ** 2}}`;
        expressions = [`${-a}`, `${-a}`, answer];
        explanations = [
          `Korzystamy ze wzoru a^3−b^3=(a−b)(a^2+ab+b^2).`,
          `Mianownik jest równy x^2+${a}x+${a ** 2}, więc skracamy go z drugim nawiasem.`,
          `Zostaje x−${a}, którego wyraz wolny to -${a}.`,
        ];
        hints = [
          "Rozpoznaj wzór na różnicę sześcianów w liczniku.",
          `x^3−${a ** 3}=(x−${a})(x^2+${a}x+${a ** 2}).`,
          "Po skróceniu odczytaj stałą z dwumianu x−a.",
        ];
      } else {
        let a = rng(2, 6);
        let b = rng(2, 7);
        if (a === b) b = b === 7 ? 6 : b + 1;
        answer = String(a);
        prompt = `Uprość wyrażenie ((x^2 − ${a ** 2})(x + ${b}))/((x − ${a})(x^2 − ${b ** 2})), a następnie podaj wyraz wolny licznika otrzymanego ułamka.`;
        latex = `\\frac{(x^2-${a ** 2})(x+${b})}{(x-${a})(x^2-${b ** 2})}`;
        expressions = [`${a}`, `${a}`, answer];
        explanations = [
          `Rozkładamy x^2−${a ** 2}=(x−${a})(x+${a}) oraz x^2−${b ** 2}=(x−${b})(x+${b}).`,
          `Skracamy (x−${a}) oraz (x+${b}); zostaje (x+${a})/(x−${b}).`,
          `Wyraz wolny licznika to ${a}.`,
        ];
        hints = [
          "Rozłóż obie różnice kwadratów na iloczyny nawiasów.",
          "Zauważ, że x+b występuje w liczniku i mianowniku — można go skrócić.",
          `Po skróceniu licznik ma postać x+${a}.`,
        ];
      }
      break;
    }

    case "matura-liczby-nierownosc-kwadratowa": {
      if (level === 1) {
        const p = rng(0, 5);
        const q = p + rng(2, 8);
        answer = String(q);
        prompt = `Wyznacz największą liczbę całkowitą spełniającą nierówność (x − ${p})(x − ${q}) ≤ 0.`;
        latex = `(x-${p})(x-${q})\\le 0`;
        expressions = [`${q}`, answer, answer];
        explanations = [
          `Pierwiastki to ${p} i ${q}; parabola ma ramiona skierowane do góry.`,
          `Wyrażenie jest niedodatnie między pierwiastkami, więc x ∈ [${p},${q}].`,
          `Największa liczba całkowita w tym przedziale to ${q}.`,
        ];
        hints = [
          "Naszkicuj parabolę i ustal, w których przedziałach jest poniżej osi OX.",
          `Miejsca zerowe to ${p} oraz ${q}.`,
          `Przedział domknięty zawiera oba końce, więc prawy koniec jest największą liczbą całkowitą.`,
        ];
      } else if (level === 2) {
        const p = rng(1, 8);
        const q = rng(5, 15);
        answer = String(q - 1);
        prompt = `Wyznacz największą liczbę całkowitą spełniającą nierówność (x + ${p})(x − ${q}) < 0.`;
        latex = `(x+${p})(x-${q})\\lt 0`;
        expressions = [`${q}-1`, answer, answer];
        explanations = [
          `Miejsca zerowe to -${p} oraz ${q}; ramiona paraboli są skierowane do góry.`,
          `Wyrażenie jest ujemne w przedziale (-${p},${q}).`,
          `Przedział jest otwarty, więc największa liczba całkowita to ${q - 1}.`,
        ];
        hints = [
          "Ustal znak wyrażenia poza przedziałem i między pierwiastkami.",
          `Rozwiązaniem jest x ∈ (-${p},${q}).`,
          "Prawy koniec nie należy do zbioru, więc zmniejsz go o 1.",
        ];
      } else if (level === 3) {
        const a = rng(2, 4);
        const k = rng(1, 7);
        const remainder = rng(1, a - 1);
        const n = a * k + remainder;
        const p = rng(1, 8);
        answer = String(k);
        prompt = `Wyznacz największą liczbę całkowitą spełniającą nierówność (${a}x − ${n})(x + ${p}) ≤ 0.`;
        latex = `(${a}x-${n})(x+${p})\\le 0`;
        expressions = [`(${n}-${remainder})/${a}`, answer, answer];
        explanations = [
          `Pierwiastki to x=-${p} oraz x=${n}/${a}=${k}+${remainder}/${a}.`,
          `Parabola ma ramiona do góry, a nierówność jest nieostra, więc rozwiązanie to przedział [-${p},${n}/${a}].`,
          `Największa liczba całkowita nie większa od ${n}/${a} to ${k}.`,
        ];
        hints = [
          "Wyznacz oba miejsca zerowe i naszkicuj parabolę.",
          `Drugi pierwiastek to ${n}/${a}, czyli liczba między ${k} a ${k + 1}.`,
          "Ponieważ przedział jest domknięty, wybierz największą liczbę całkowitą nie większą od prawego końca.",
        ];
      } else if (level === 4) {
        const a = rng(2, 4);
        const k = rng(1, 7);
        const n = a * k + 1;
        const b = rng(2, 4);
        const m = rng(1, 8);
        answer = String(k);
        prompt = `Wyznacz największą liczbę całkowitą spełniającą nierówność (${a}x − ${n})(${b}x + ${m}) < 0.`;
        latex = `(${a}x-${n})(${b}x+${m})\\lt 0`;
        expressions = [`(${n}-1)/${a}`, answer, answer];
        explanations = [
          `Pierwiastki to x=-${m}/${b} oraz x=${n}/${a}=${k}+1/${a}.`,
          `Parabola ma ramiona do góry, a nierówność jest ostra, więc x ∈ (-${m}/${b},${n}/${a}).`,
          `Największa liczba całkowita mniejsza od ${k}+1/${a} to ${k}.`,
        ];
        hints = [
          "Znajdź miejsca zerowe obu nawiasów i ustal przedział, w którym parabola jest pod osią.",
          `Prawy pierwiastek to ${n}/${a}, czyli ${k}+1/${a}.`,
          "Prawy koniec jest otwarty, więc liczba całkowita ${k} jest jeszcze dopuszczalna.",
        ];
      } else {
        const a = rng(2, 5);
        const k = rng(1, 8);
        const remainder = rng(1, a - 1);
        const n = a * k + remainder;
        const b = rng(2, 4);
        const m = rng(1, 9);
        answer = String(k);
        prompt = `Wyznacz największą liczbę całkowitą spełniającą nierówność (${a}x − ${n})(${b}x + ${m}) ≤ 0.`;
        latex = `(${a}x-${n})(${b}x+${m})\\le 0`;
        expressions = [`(${n}-${remainder})/${a}`, answer, answer];
        explanations = [
          `Miejsca zerowe to -${m}/${b} oraz ${n}/${a}=${k}+${remainder}/${a}.`,
          `Ramiona paraboli są skierowane do góry, a nierówność nieostra, więc rozwiązaniem jest przedział [-${m}/${b},${n}/${a}].`,
          `Największa liczba całkowita w tym przedziale to ${k}.`,
        ];
        hints = [
          "Wyznacz pierwiastki i pamiętaj, że przy nierówności ≤ 0 rozwiązaniem jest przedział między nimi.",
          `Prawy koniec to ${n}/${a}; leży on między ${k} a ${k + 1}.`,
          "Ponieważ przedział jest domknięty i prawy koniec nie jest całkowity, największa liczba całkowita to jego część całkowita.",
        ];
      }
      break;
    }

    case "matura-liczby-uklad-rownan": {
      const contexts = [
        {
          item1: ["zeszyt", "zeszyty", "zeszytów"],
          item2: ["długopis", "długopisy", "długopisów"],
          maxCoefficient: 4,
          question: "Ile kosztuje jeden zeszyt?",
        },
        {
          item1: ["bilet ulgowy", "bilety ulgowe", "biletów ulgowych"],
          item2: ["bilet normalny", "bilety normalne", "biletów normalnych"],
          maxCoefficient: 5,
          question: "Ile kosztuje jeden bilet ulgowy?",
        },
        {
          item1: ["kawa", "kawy", "kaw"],
          item2: ["herbata", "herbaty", "herbat"],
          maxCoefficient: 4,
          question: "Ile kosztuje jedna kawa?",
        },
        {
          item1: ["kilogram jabłek", "kilogramy jabłek", "kilogramów jabłek"],
          item2: ["kilogram gruszek", "kilogramy gruszek", "kilogramów gruszek"],
          maxCoefficient: 5,
          question: "Ile kosztuje kilogram jabłek?",
        },
        {
          item1: ["kanapka", "kanapki", "kanapek"],
          item2: ["sok", "soki", "soków"],
          maxCoefficient: 9,
          question: "Ile kosztuje jedna kanapka?",
        },
      ];
      const context = contexts[level - 1];
      const plural = (value: number, forms: string[]) =>
        value === 1 ? forms[0] : value <= 4 ? forms[1] : forms[2];
      let a = 0;
      let b = 0;
      let c = 0;
      let d = 0;
      let determinant = 0;
      do {
        a = rng(2, context.maxCoefficient);
        b = rng(2, context.maxCoefficient);
        c = rng(2, context.maxCoefficient);
        d = rng(2, context.maxCoefficient);
        determinant = a * d - b * c;
      } while (determinant === 0);
      const price1 = rng(3, 15);
      const price2 = rng(3, 15);
      const firstTotal = a * price1 + b * price2;
      const secondTotal = c * price1 + d * price2;
      answer = String(price1);
      prompt = `Za ${a} ${plural(a, context.item1)} i ${b} ${plural(b, context.item2)} zapłacono ${firstTotal} zł. Za ${c} ${plural(c, context.item1)} i ${d} ${plural(d, context.item2)} zapłacono ${secondTotal} zł. ${context.question}`;
      latex = `\\begin{cases}${a}x+${b}y=${firstTotal}\\\\${c}x+${d}y=${secondTotal}\\end{cases}`;
      expressions = [
        `(${firstTotal}*${d}-${secondTotal}*${b})/(${a}*${d}-${b}*${c})`,
        `${firstTotal * d - secondTotal * b}/${determinant}`,
        answer,
      ];
      explanations = [
        `Oznaczamy cenę pierwszego towaru przez x, a drugiego przez y; powstaje układ dwóch równań.`,
        `Metoda wyznaczników daje x=(${firstTotal}·${d}-${secondTotal}·${b})/(${a}·${d}-${b}·${c}).`,
        `Po obliczeniu otrzymujemy x=${price1} zł; można sprawdzić, że drugie równanie też jest spełnione.`,
      ];
      hints = [
        "Oznacz dwie nieznane ceny literami x i y, a następnie zapisz dwa równania z treści.",
        `Pierwsze równanie to ${a}x+${b}y=${firstTotal}, drugie ${c}x+${d}y=${secondTotal}.`,
        "Odejmij równania stronami po odpowiednim pomnożeniu albo użyj metody podstawiania; szukasz ceny pierwszego towaru.",
      ];
      break;
    }

    default:
      throw new Error(`Nieznany generator maturalny: ${id}`);
  }

  if (expressions.length !== explanations.length || expressions.length < 3)
    throw new Error(`Generator ${id} ma niespójne kroki.`);
  const problem = finish(
    id,
    level,
    seed,
    prompt,
    answer,
    expressions,
    explanations,
    hints,
  );
  problem.latex = latex;
  if (mistakes) problem.mistakes = mistakes;
  return problem;
}
