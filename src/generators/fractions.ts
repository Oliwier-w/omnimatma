import { finish, fraction, gcd, type RNG } from "./shared";

export function fractionProblem(
  id: string,
  level: number,
  seed: number,
  rng: RNG,
) {
  const max = [4, 9, 15, 25, 40][level - 1];
  const a = rng(1, max) * (level >= 4 ? -1 : 1),
    b = rng(2, max + 2);
  const c = rng(1, max),
    d = level === 1 ? b : rng(2, max + 3);
  const f = `(${a}/${b})`,
    g = `(${c}/${d})`,
    lcm = (b * d) / gcd(b, d);
  let prompt = "",
    expression = "",
    expanded = "",
    answer = "",
    formula = "",
    detail = "";
  switch (id) {
    case "fractions-meaning":
      prompt = `Zapisz jako ułamek: ${Math.abs(a)} zaznaczonych części, gdy jedna całość ma ${b} równych części.${a < 0 ? " Podaj wartość przeciwną." : ""}`;
      expression = `${a}/${b}`;
      expanded = `(${a / gcd(a, b)})/(${b / gcd(a, b)})`;
      answer = fraction(a, b);
      formula =
        "Licznik liczy części, mianownik mówi, ile części tworzy całość.";
      detail = `Dzielimy licznik i mianownik przez ${gcd(a, b)}.`;
      break;
    case "fractions-simplify": {
      const k = rng(level + 1, level * 3 + 3);
      prompt = `Skróć ułamek ${a * k}/${b * k}.`;
      expression = `(${a * k})/(${b * k})`;
      expanded = f;
      answer = fraction(a, b);
      formula = "Podziel licznik i mianownik przez ten sam niezerowy dzielnik.";
      detail = `Najpierw skracamy przez ${k}, następnie przez ${gcd(a, b)}.`;
      break;
    }
    case "fractions-common":
      prompt = `Sprowadź ${a}/${b} i ${c}/${d} do najmniejszego wspólnego mianownika. Podaj wektor [pierwszy licznik, drugi licznik, mianownik].`;
      expression = `[${a}*(${lcm}/${b}),${c}*(${lcm}/${d}),${lcm}]`;
      expanded = `[${a}*${lcm / b},${c}*${lcm / d},${lcm}]`;
      answer = `[${(a * lcm) / b},${(c * lcm) / d},${lcm}]`;
      formula = "Wspólny mianownik to NWW mianowników.";
      detail = `NWW(${b},${d}) = ${lcm}; mnożniki to ${lcm / b} oraz ${lcm / d}.`;
      break;
    case "fractions-add":
    case "fractions-subtract": {
      const sign = id === "fractions-add" ? "+" : "-";
      const n = a * d + (sign === "+" ? 1 : -1) * c * b;
      prompt = `Oblicz ${a}/${b} ${sign} ${c}/${d}.`;
      expression = `${f}${sign}${g}`;
      expanded = `(${a}*${d}${sign}${c}*${b})/(${b}*${d})`;
      answer = fraction(n, b * d);
      formula =
        "Sprowadź ułamki do wspólnego mianownika i wykonaj działanie na licznikach.";
      detail = `W mianowniku ${b * d}, w liczniku ${n}.`;
      break;
    }
    case "fractions-multiply":
      prompt = `Oblicz ${a}/${b} razy ${c}/${d}.`;
      expression = `${f}*${g}`;
      expanded = `(${a}*${c})/(${b}*${d})`;
      answer = fraction(a * c, b * d);
      formula = "Pomnóż liczniki i pomnóż mianowniki.";
      detail = `Licznik ${a * c}, mianownik ${b * d}; skróć wspólny dzielnik.`;
      break;
    case "fractions-divide":
      prompt = `Oblicz ${a}/${b} podzielone przez ${c}/${d}.`;
      expression = `${f}/${g}`;
      expanded = `${f}*(${d}/${c})`;
      answer = fraction(a * d, b * c);
      formula =
        "Dzielenie przez niezerowy ułamek to mnożenie przez jego odwrotność.";
      detail = `Odwrotność dzielnika to ${d}/${c}.`;
      break;
    case "fractions-mixed": {
      const whole = rng(level, level * 4);
      const numerator = Math.abs(a) % b || 1;
      const sign = level >= 4 ? -1 : 1;
      prompt = `Zamień ${sign < 0 ? "ujemną " : ""}liczbę mieszaną ${whole} i ${numerator}/${b} na ułamek niewłaściwy.`;
      expression = `${sign}*(${whole}+${numerator}/${b})`;
      expanded = `${sign}*(${whole}*${b}+${numerator})/${b}`;
      answer = fraction(sign * (whole * b + numerator), b);
      formula =
        "Całość pomnóż przez mianownik, a następnie dodaj licznik części ułamkowej.";
      detail = `Wartość bezwzględna licznika to ${whole * b + numerator}; znak dotyczy całej liczby.`;
      break;
    }
    case "fractions-compare": {
      const diff = a * d - c * b;
      prompt = `Porównaj ${a}/${b} i ${c}/${d}. Podaj -1, gdy pierwszy jest mniejszy, 0 gdy równy, 1 gdy większy.`;
      expression = diff ? `((${f}-${g})/abs(${f}-${g}))` : `${f}-${g}`;
      expanded = diff ? `(${diff})/abs(${diff})` : "0";
      answer = String(Math.sign(diff));
      formula = "Dodatnie mianowniki pozwalają porównać iloczyny krzyżowe.";
      detail = `Różnica iloczynów krzyżowych to ${diff}; jej znak rozstrzyga porównanie.`;
      break;
    }
    default:
      prompt = `Oblicz ułamek piętrowy (${a}/${b} + ${c}/${d}) / (${c}/${b}).`;
      expression = `(${f}+${g})/(${c}/${b})`;
      expanded = `((${a}*${d}+${c}*${b})/(${b}*${d}))*(${b}/${c})`;
      answer = fraction(a * d + c * b, d * c);
      formula =
        "Najpierw oblicz licznik piętrowy, potem pomnóż przez odwrotność mianownika.";
      detail = `Dzielnik ${c}/${b} jest niezerowy; po skróceniu mianownik wynosi ${d * c}.`;
  }
  const problem = finish(
    id,
    level,
    seed,
    prompt,
    answer,
    [expression, expanded, answer],
    [
      formula,
      detail,
      "Zapisujemy wynik po wykonaniu działań i skróceniu wspólnych czynników.",
    ],
    [formula, detail, `Pełny wynik: ${answer}. ${formula}`],
  );
  if (id === "fractions-meaning") problem.latex = "\\frac{?}{?}";
  return problem;
}
