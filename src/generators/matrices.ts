import { finish, fraction, mat, type RNG } from "./shared";

type Matrix = number[][];
const map = (
  a: Matrix,
  fn: (x: number, i: number, j: number) => number | string,
) => a.map((row, i) => row.map((x, j) => fn(x, i, j)));
export function determinant(a: Matrix): number {
  if (a.length === 1) return a[0][0];
  return a[0].reduce(
    (s, x, j) =>
      s +
      (j % 2 ? -1 : 1) *
        x *
        determinant(a.slice(1).map((row) => row.filter((_, k) => k !== j))),
    0,
  );
}
function cofactor(a: Matrix, i: number, j: number) {
  return (i + j) % 2
    ? -determinant(
        a.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j)),
      )
    : determinant(
        a.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j)),
      );
}
export function matrixProblem(
  id: string,
  level: number,
  seed: number,
  rng: RNG,
) {
  const size = level >= 4 ? 3 : 2;
  const low = level >= 2 ? -level * 2 : 0,
    high = level * 3;
  const create = (rows = size, cols = size): Matrix =>
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => rng(low, high)),
    );
  let a = create(),
    b = create();
  // Strict diagonal dominance ensures invertibility without unbounded rejection loops.
  if (id === "matrix-inverse" || id === "matrix-equation")
    a = a.map((row, i) =>
      row.map((x, j) =>
        i === j
          ? row.reduce((s, v, k) => s + (k === i ? 0 : Math.abs(v)), 0) +
            rng(1, level + 1)
          : x,
      ),
    );
  if (id === "matrix-transpose" && level >= 3) a = create(size, size + 1);
  const A = mat(a),
    B = mat(b);
  let prompt = "",
    expression = "",
    expanded = "",
    answer = "",
    formula = "",
    detail = "";
  switch (id) {
    case "matrix-entry": {
      const i = rng(0, size - 1),
        j = rng(0, size - 1);
      prompt = `W macierzy A=${A} odczytaj element w wierszu ${i + 1}, kolumnie ${j + 1}.`;
      answer = String(a[i][j]);
      expression = `${answer}+0`;
      expanded = `(${answer})*1`;
      formula =
        "Pierwszy indeks wskazuje wiersz, drugi kolumnę; numerujemy od 1.";
      detail = `Wiersz ${i + 1} to [${a[i].join(",")}]; jego element ${j + 1} ma wartość ${answer}.`;
      break;
    }
    case "matrix-add":
    case "matrix-subtract": {
      const sign = id === "matrix-add" ? "+" : "-";
      prompt = `Oblicz A ${sign} B dla A=${A}, B=${B}.`;
      expression = `${A}${sign}${B}`;
      expanded = mat(map(a, (x, i, j) => `(${x})${sign}(${b[i][j]})`));
      answer = mat(map(a, (x, i, j) => x + (sign === "+" ? 1 : -1) * b[i][j]));
      formula = "Działanie wykonujemy na elementach o tych samych indeksach.";
      detail = `Obie macierze mają rozmiar ${size} na ${size}; zachowaj położenie każdego elementu.`;
      break;
    }
    case "matrix-scale": {
      const k =
        level >= 4 ? `${rng(-5, -1)}/${rng(2, 5)}` : String(rng(2, level + 3));
      prompt = `Pomnóż macierz A=${A} przez skalar ${k}.`;
      expression = `(${k})*${A}`;
      expanded = mat(map(a, (x) => `(${k})*(${x})`));
      answer = mat(
        map(a, (x) =>
          k.includes("/")
            ? fraction(x * Number(k.split("/")[0]), Number(k.split("/")[1]))
            : Number(k) * x,
        ),
      );
      formula = "Skalar mnoży każdy element macierzy, nie tylko przekątną.";
      detail = `W każdym polu wykonaj mnożenie przez ${k}.`;
      break;
    }
    case "matrix-transpose":
      prompt = `Wyznacz transpozycję A=${A}.`;
      expression = `transpose(${A})`;
      expanded = mat(a[0].map((_, j) => a.map((row) => `(${row[j]})`)));
      answer = mat(a[0].map((_, j) => a.map((row) => row[j])));
      formula = "Wiersze macierzy stają się kolumnami: (Aᵀ)ij = Aji.";
      detail = `Rozmiar ${a.length} na ${a[0].length} zmienia się na ${a[0].length} na ${a.length}.`;
      break;
    case "matrix-multiply":
      prompt = `Oblicz A razy B dla A=${A}, B=${B}.`;
      expression = `${A}*${B}`;
      expanded = mat(
        map(a, (_, i, j) =>
          a[i].map((x, k) => `(${x})*(${b[k][j]})`).join("+"),
        ),
      );
      answer = mat(
        map(a, (_, i, j) => a[i].reduce((sum, x, k) => sum + x * b[k][j], 0)),
      );
      formula = "Element iloczynu to iloczyn skalarny wiersza A i kolumny B.";
      detail = `Każde pole jest sumą ${size} iloczynów; nie mnożymy macierzy element po elemencie.`;
      break;
    case "matrix-det":
      prompt = `Oblicz wyznacznik macierzy A=${A}.`;
      expression = `det(${A})`;
      expanded = a[0].map((x, j) => `(${x})*(${cofactor(a, 0, j)})`).join("+");
      answer = String(determinant(a));
      formula =
        size === 2
          ? "Dla macierzy 2×2 wyznacznik wynosi ad − bc."
          : "Rozwiń wyznacznik wzdłuż pierwszego wiersza, stosując znaki +, −, +.";
      detail = `Dopełnienia algebraiczne pierwszego wiersza: ${a[0].map((_, j) => cofactor(a, 0, j)).join(", ")}.`;
      break;
    case "matrix-inverse": {
      const determinantA = determinant(a);
      prompt = `Wyznacz macierz odwrotną do A=${A}.`;
      expression = `inv(${A})`;
      expanded = mat(
        map(a, (_, i, j) => `(${cofactor(a, j, i)})/(${determinantA})`),
      );
      answer = mat(
        map(a, (_, i, j) => fraction(cofactor(a, j, i), determinantA)),
      );
      formula = "A⁻¹ = adj(A)/det(A); macierz dopełnień trzeba transponować.";
      detail = `Wyznacznik wynosi ${determinantA}, więc odwrotność istnieje.`;
      break;
    }
    case "matrix-trace":
      prompt = `Oblicz ślad macierzy A=${A}.`;
      expression = `trace(${A})`;
      expanded = a.map((row, i) => `(${row[i]})`).join("+");
      answer = String(a.reduce((s, row, i) => s + row[i], 0));
      formula = "Ślad to suma elementów głównej przekątnej.";
      detail = `Dodaj ${a.map((row, i) => row[i]).join(", ")}; pozostałe elementy nie wchodzą do śladu.`;
      break;
    default: {
      const x = b;
      b = a.map((row) =>
        x[0].map((_, j) => row.reduce((s, v, k) => s + v * x[k][j], 0)),
      );
      const D = determinant(a);
      prompt = `Rozwiąż równanie AX=B dla A=${A}, B=${mat(b)}. Podaj samą macierz X.`;
      expression = `inv(${A})*${mat(b)}`;
      expanded = mat(
        map(a, (_, i, j) =>
          a
            .map((_, k) => `((${cofactor(a, k, i)})/(${D}))*(${b[k][j]})`)
            .join("+"),
        ),
      );
      answer = mat(x);
      formula =
        "Pomnóż obie strony z lewej przez A⁻¹: X=A⁻¹B; kolejność ma znaczenie.";
      detail = `det(A)=${D} ≠ 0. W każdym polu X zsumuj iloczyny wiersza A⁻¹ i kolumny B.`;
    }
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
      "Obliczamy wszystkie wskazane działania i zapisujemy wynik w poprawnym układzie wierszy i kolumn.",
    ],
    [formula, detail, `Wynik: ${answer}. Sprawdź każde pole osobno.`],
  );
  if (id === "matrix-entry") {
    const indices = [...prompt.matchAll(/(?:wierszu|kolumnie) (\d+)/g)].map(
      (match) => match[1],
    );
    problem.latex = `A=\\begin{bmatrix}${a.map((row) => row.join("&")).join("\\\\")}\\end{bmatrix},\\quad a_{${indices[0]}${indices[1]}}=?`;
  }
  return problem;
}
