import { complex, finish, fraction, type RNG } from "./shared";

export function complexProblem(
  id: string,
  level: number,
  seed: number,
  rng: RNG,
) {
  const limit = level * 3;
  const denom = level === 5 ? rng(2, 5) : 1;
  const a = rng(level >= 2 ? -limit : 1, limit),
    b = rng(1, limit) * (level >= 3 ? -1 : 1),
    c = rng(1, limit),
    d = rng(level >= 2 ? -limit : 1, limit);
  const z = complex(fraction(a, denom), fraction(b, denom)),
    w = complex(c, d);
  let prompt = "",
    expression = "",
    expanded = "",
    answer = "",
    formula = "",
    detail = "";
  switch (id) {
    case "complex-parts":
      prompt = `Dla z=${z} podaj wektor [część rzeczywista, część urojona].`;
      expression = `[re(${z}),im(${z})]`;
      expanded = `[${a}/${denom},${b}/${denom}]`;
      answer = `[${fraction(a, denom)},${fraction(b, denom)}]`;
      formula =
        "Dla z=a+bi część rzeczywista to a, a część urojona to liczba b, bez i.";
      detail = `Współczynnik bez i to ${fraction(a, denom)}, a przy i stoi ${fraction(b, denom)}.`;
      break;
    case "complex-add":
    case "complex-subtract": {
      const sign = id === "complex-add" ? "+" : "-";
      const s = sign === "+" ? 1 : -1;
      prompt = `Oblicz ${z} ${sign} ${w}.`;
      expression = `${z}${sign}${w}`;
      expanded = complex(
        `(${a}/${denom})${sign}(${c})`,
        `(${b}/${denom})${sign}(${d})`,
      );
      answer = complex(
        fraction(a + s * c * denom, denom),
        fraction(b + s * d * denom, denom),
      );
      formula =
        "Wykonaj działanie osobno na częściach rzeczywistych i urojonych.";
      detail = `Przy odejmowaniu nawiasu zmieniają się oba znaki; wspólny mianownik to ${denom}.`;
      break;
    }
    case "complex-multiply":
      prompt = `Oblicz ${z} razy ${w}.`;
      expression = `${z}*${w}`;
      expanded = complex(
        `(${a}*${c}-${b}*${d})/${denom}`,
        `(${a}*${d}+${b}*${c})/${denom}`,
      );
      answer = complex(
        fraction(a * c - b * d, denom),
        fraction(a * d + b * c, denom),
      );
      formula = "Rozmnóż nawiasy i użyj i²=−1: (a+bi)(c+di)=(ac−bd)+(ad+bc)i.";
      detail = `Po uwzględnieniu mianownika ${denom} liczniki wynoszą ${a * c - b * d} i ${a * d + b * c}.`;
      break;
    case "complex-divide": {
      const norm = c * c + d * d;
      prompt = `Oblicz ${z} podzielone przez ${w}.`;
      expression = `${z}/${w}`;
      expanded = complex(
        `(${a}*${c}+${b}*${d})/(${denom}*${norm})`,
        `(${b}*${c}-${a}*${d})/(${denom}*${norm})`,
      );
      answer = complex(
        fraction(a * c + b * d, denom * norm),
        fraction(b * c - a * d, denom * norm),
      );
      formula = "Pomnóż licznik i mianownik przez sprzężenie dzielnika.";
      detail = `Mianownik po usunięciu i to ${denom}·(${c}²+${d}²)=${denom * norm}.`;
      break;
    }
    case "complex-conjugate":
      prompt = `Wyznacz sprzężenie z=${z}.`;
      expression = `conj(${z})`;
      expanded = `(${a}/${denom})-(${b}/${denom})*i`;
      answer = complex(fraction(a, denom), fraction(-b, denom));
      formula =
        "Sprzężenie zachowuje część rzeczywistą i zmienia znak części urojonej.";
      detail = `Zmieniamy współczynnik ${fraction(b, denom)} na ${fraction(-b, denom)}.`;
      break;
    case "complex-modulus":
      prompt = `Oblicz moduł z=${z}.`;
      expression = `abs(${z})`;
      expanded = `sqrt((${a}/${denom})^2+(${b}/${denom})^2)`;
      answer = `sqrt(${a * a + b * b})/${denom}`;
      formula = "Moduł to odległość od zera: |a+bi|=sqrt(a²+b²).";
      detail = `Suma kwadratów liczników wynosi ${a * a + b * b}; moduł jest nieujemny.`;
      break;
    case "complex-power": {
      const n = level + 1;
      let real = 1,
        imag = 0;
      for (let k = 0; k < n; k++)
        [real, imag] = [real * a - imag * b, real * b + imag * a];
      prompt = `Oblicz (${z}) do potęgi ${n}.`;
      expression = `${z}^${n}`;
      expanded = Array.from({ length: n }, () => z).join("*");
      answer = complex(fraction(real, denom ** n), fraction(imag, denom ** n));
      formula =
        "Potęga naturalna jest iloczynem jednakowych czynników; przy każdym mnożeniu i²=−1.";
      detail = `Wykonaj ${n - 1} mnożeń, grupując osobno części rzeczywiste i urojone.`;
      break;
    }
    case "complex-gauss":
      prompt = `Punkt P=(${fraction(a, denom)}, ${fraction(b, denom)}) leży na płaszczyźnie Gaussa. Podaj odpowiadającą mu liczbę zespoloną.`;
      expression = `(${a}/${denom})+i*(${b}/${denom})`;
      expanded = complex(`${a}/${denom}`, `${b}/${denom}`);
      answer = z;
      formula =
        "Oś pozioma oznacza część rzeczywistą, a pionowa współczynnik przy i.";
      detail = `Współrzędna pozioma ${fraction(a, denom)} jest częścią rzeczywistą; pionowa ${fraction(b, denom)} mnoży i.`;
      break;
    default: {
      const real = a * c - b * d,
        imag = a * d + b * c;
      prompt = `Rozwiąż równanie ${w}·z = ${complex(fraction(real, denom), fraction(imag, denom))}. Podaj samą wartość z.`;
      expression = `${complex(fraction(real, denom), fraction(imag, denom))}/${w}`;
      expanded = complex(
        `(${real}*${c}+${imag}*${d})/(${denom}*${c * c + d * d})`,
        `(${imag}*${c}-${real}*${d})/(${denom}*${c * c + d * d})`,
      );
      answer = z;
      formula =
        "Podziel obie strony przez niezerowy współczynnik przy z, następnie użyj sprzężenia.";
      detail = `Kwadrat modułu dzielnika wynosi ${c * c + d * d}>0, więc rozwiązanie jest jednoznaczne.`;
    }
  }
  return finish(
    id,
    level,
    seed,
    prompt,
    answer,
    [expression, expanded, answer],
    [
      formula,
      detail,
      "Po zebraniu składników zapisujemy końcową wartość, nie równanie z niewiadomą.",
    ],
    [
      formula,
      detail,
      `Wynik: ${answer}. Podstaw go do pierwotnego działania, aby sprawdzić.`,
    ],
  );
}
