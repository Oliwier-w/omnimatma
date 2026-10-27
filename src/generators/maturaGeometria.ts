import {
  finish,
  fraction,
  gcd,
  type Problem,
  type RNG,
} from "./shared";

const reduce = (a: number, b: number): [number, number] => {
  const divisor = gcd(Math.abs(a), Math.abs(b)) || 1;
  return [a / divisor, b / divisor];
};

const signedTerm = (value: number): string =>
  `${value >= 0 ? "+" : "-"}${Math.abs(value)}`;

export function maturaGeometriaProblem(
  id: string,
  level: number,
  seed: number,
  rng: RNG,
): Problem {
  const commonTraps: { wrongAnswer: string; explanation: string }[] = [];
  const make = (
    prompt: string,
    answer: string,
    expressions: string[],
    explanations: string[],
    hints: string[],
    latex: string,
  ): Problem => {
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
    problem.commonTraps = commonTraps;
    return problem;
  };

  switch (id) {
    case "matura-geometria-podobienstwo": {
      const a = level + rng(1, 2);
      const b = a + level + rng(1, 2);
      const c = a + b - 1;
      const scale = level + rng(1, 2);
      const perimeterSmall = a + b + c;
      const perimeterBig = scale * perimeterSmall;
      const answer = String(scale * a);
      return make(
        `Trójkąty ABC i DEF są podobne. Boki trójkąta ABC mają długości ${a}, ${b} i ${c}. Obwód trójkąta DEF jest równy ${perimeterBig}. Jaką długość ma najkrótszy bok trójkąta DEF?`,
        answer,
        [
          `${a}*(${perimeterBig}/${perimeterSmall})`,
          `(${a}*${perimeterBig})/${perimeterSmall}`,
          `${scale}*${a}`,
        ],
        [
          `Skala podobieństwa to stosunek obwodów: ${perimeterBig} podzielone przez ${perimeterSmall} daje ${scale}.`,
          `Najkrótszy bok ABC ma długość ${a}, a w trójkącie podobnym odpowiada mu najkrótszy bok DEF.`,
          `Mnożymy ${a} przez skalę ${scale} i otrzymujemy szukaną długość ${scale * a}.`,
        ],
        [
          "Stosunek obwodów trójkątów podobnych jest równy skali podobieństwa, a nie jej kwadratowi.",
          `Obwód mniejszego trójkąta wynosi ${perimeterSmall}, więc skala to ${perimeterBig}/${perimeterSmall}.`,
          `Najkrótszy bok to ${a}; pomnóż go przez skalę i sprawdź, że wynik jest mniejszy od obwodu większego trójkąta.`,
        ],
        "\\frac{P_{DEF}}{P_{ABC}}=k",
      );
    }

    case "matura-geometria-prosta": {
      const x1 = -level + rng(0, 1);
      const y1 = level + rng(-1, 1);
      const dx = level + rng(1, 3);
      const dy = rng(1, level + 2) * (rng(0, 1) === 1 ? 1 : -1);
      const x2 = x1 + dx;
      const y2 = y1 + dy;
      const answer = fraction(dy, dx);
      if (dx * dx !== dy * dy) commonTraps.push({
        wrongAnswer: fraction(dx, dy),
        explanation: "Odwrócono iloraz przyrostów. Współczynnik kierunkowy to Δy/Δx, a nie Δx/Δy.",
      });
      return make(
        `Prosta przechodzi przez punkty A=(${x1}, ${y1}) i B=(${x2}, ${y2}). Podaj współczynnik kierunkowy tej prostej, czyli tangens jej kąta nachylenia do osi OX.`,
        answer,
        [
          `(${y2}-${y1})/(${x2}-${x1})`,
          `${dy}/${dx}`,
          `${dy * 2}/${dx * 2}`,
        ],
        [
          `Najpierw odejmujemy współrzędne: y2-y1 = ${y2}-${y1} = ${dy} oraz x2-x1 = ${x2}-${x1} = ${dx}.`,
          `Współczynnik kierunkowy to iloraz różnicy igreków przez różnicę iksów, czyli ${dy}/${dx}.`,
          `Po skróceniu przez wspólny dzielnik otrzymujemy ${answer}; ujemny wynik oznacza prostą opadającą.`,
        ],
        [
          "Współczynnik kierunkowy to zmiana y podzielona przez zmianę x, a nie odwrotnie.",
          `Różnica igreków wynosi ${dy}, a różnica iksów ${dx}; iloraz zachowuje znak różnicy igreków.`,
          "Sprawdź, że dla dodatniej różnicy iksów znak współczynnika jest taki sam jak znak różnicy igreków.",
        ],
        "m=\\frac{y_2-y_1}{x_2-x_1}",
      );
    }

    case "matura-geometria-okrag": {
      const centerX = -level + rng(0, 2);
      const centerY = level + rng(-1, 2);
      const dx = rng(1, level + 3) * (rng(0, 1) === 1 ? 1 : -1);
      const dy = rng(1, level + 2) * (rng(0, 1) === 1 ? 1 : -1);
      const pointX = centerX + dx;
      const pointY = centerY + dy;
      const radiusSquared = dx * dx + dy * dy;
      commonTraps.push({
        wrongAnswer: `sqrt(${radiusSquared})`,
        explanation: "Podano promień r, ale pytanie dotyczy jego kwadratu r². Suma kwadratów różnic współrzędnych jest już szukanym wynikiem.",
      });
      return make(
        `Punkt P=(${pointX}, ${pointY}) leży na okręgu o środku S=(${centerX}, ${centerY}). Podaj kwadrat promienia tego okręgu, czyli r^2.`,
        String(radiusSquared),
        [
          `(${pointX}-${centerX})^2+(${pointY}-${centerY})^2`,
          `(${dx})^2+(${dy})^2`,
          String(radiusSquared),
        ],
        [
          `Różnice współrzędnych punktu i środka wynoszą ${dx} oraz ${dy}.`,
          `Kwadrat promienia to suma kwadratów tych różnic: ${dx * dx} + ${dy * dy} = ${radiusSquared}.`,
          `Promień ma długość sqrt(${radiusSquared}), ale zadanie prosi o r^2, więc zostawiamy ${radiusSquared}.`,
        ],
        [
          "Od współrzędnych punktu odejmij współrzędne środka, a nie odwrotnie; kwadrat i tak usuwa znak.",
          `Podnieś do kwadratu obie różnice: (${dx})^2 = ${dx * dx} oraz (${dy})^2 = ${dy * dy}.`,
          "Dodaj oba kwadraty i sprawdź, że wynik jest dodatni; to jest właśnie r^2.",
        ],
        "r^2=(x-p)^2+(y-q)^2",
      );
    }

    case "matura-geometria-proste-rownolegle": {
      const a = level + rng(1, 2);
      const c = rng(1, level + 2);
      let b = rng(-2, level + 2);
      let d = rng(-level, level);
      const m = a + c;
      if (m + b === d) d += 1;
      return make(
        `Proste o równaniach y=(m-${a})x+(m${signedTerm(b)}) i y=${c}x${signedTerm(d)} są równoległe. Wyznacz m.`,
        String(m),
        [`(${c})+${a}`, `${a}+${c}`, String(m)],
        [
          `Proste w postaci kierunkowej są równoległe dokładnie wtedy, gdy mają równe współczynniki kierunkowe: m-${a} = ${c}.`,
          `Przenosimy ${a} na prawą stronę i otrzymujemy m = ${c} + ${a}.`,
          `Zatem m = ${m}; wyrazy wolne ${signedTerm(b)} i ${signedTerm(d)} nie wpływają na równoległość.`,
        ],
        [
          "Porównuj wyłącznie współczynniki przy x; wyrazy wolne decydują o przesunięciu, nie o kierunku.",
          `W pierwszej prostej współczynnik kierunkowy to m-${a}, a w drugiej ${c}.`,
          "Rozwiąż proste równanie m-a=c i sprawdź wynik, podstawiając go z powrotem do pierwszego równania.",
        ],
        "m-a=c",
      );
    }

    case "matura-geometria-graniastoslup": {
      const a = level + rng(2, 20);
      const answer = `(3*sqrt(3)/2)*${a}^3`;
      commonTraps.push({
        wrongAnswer: `(sqrt(3)/4)*${a}^3`,
        explanation: "Policzono objętość nad jednym trójkątem równobocznym. Podstawa sześciokątna składa się z sześciu takich trójkątów.",
      });
      return make(
        `Graniastosłup prawidłowy sześciokątny ma wszystkie krawędzie długości ${a}. Oblicz objętość tego graniastosłupa. Wynik możesz zapisać z pierwiastkiem.`,
        answer,
        [
          `6*(sqrt(3)/4)*${a}^2*${a}`,
          `(3*sqrt(3)/2)*${a}^3`,
          `3*sqrt(3)*${a}^3/2`,
        ],
        [
          `Podstawę dzielimy na sześć trójkątów równobocznych o boku ${a}; pole podstawy to 6 razy (sqrt(3)/4)*${a}^2.`,
          `Objętość graniastosłupa to pole podstawy razy wysokość, a wysokość również wynosi ${a}.`,
          `Po uproszczeniu otrzymujemy (3*sqrt(3)/2)*${a}^3, czyli około ${((3 * Math.sqrt(3)) / 2 * a ** 3).toFixed(2)}.`,
        ],
        [
          "Pole sześciokąta foremnego to sześć pól trójkątów równobocznych, a nie pole jednego trójkąta.",
          `Krawędź podstawy i wysokość są równe ${a}, więc w objętości występuje trzecia potęga tej liczby.`,
          "Sprawdź, że wynik ma jednostkę sześcienną i jest większy od samego pola podstawy.",
        ],
        "V=6\\cdot\\frac{a^2\\sqrt{3}}{4}\\cdot a=\\frac{3\\sqrt{3}}{2}a^3",
      );
    }

    case "matura-geometria-ostroslup-kat": {
      const lateral = 2 * (level + rng(1, 10));
      const angle = [30, 45, 60][rng(0, 2)];
      const answer =
        angle === 30
          ? String(lateral / 2)
          : `${lateral / 2}*sqrt(${angle === 45 ? 2 : 3})`;
      const expressions =
        angle === 30
          ? [`${lateral}/2`, `${lateral}*1/2`, `sqrt(${lateral}^2/4)`]
          : angle === 45
            ? [
                `${lateral}*sqrt(2)/2`,
                `${lateral}/sqrt(2)`,
                `sqrt(${lateral}^2/2)`,
              ]
            : [
                `${lateral}*sqrt(3)/2`,
                `sqrt(3*${lateral}^2/4)`,
                `${lateral}^2*sqrt(3)/(2*${lateral})`,
              ];
      if (angle !== 45) commonTraps.push({
        wrongAnswer: angle === 30 ? `${lateral}/2*sqrt(3)` : String(lateral / 2),
        explanation: "Użyto cosinusa zamiast sinusa kąta nachylenia do podstawy. Wysokość leży naprzeciw tego kąta, więc h=l·sin α.",
      });
      return make(
        `W ostrosłupie prawidłowym czworokątnym krawędź boczna ma długość ${lateral}, a kąt nachylenia tej krawędzi do płaszczyzny podstawy ma miarę ${angle}°. Oblicz wysokość ostrosłupa.`,
        answer,
        expressions,
        [
          `W przekroju przez wysokość i krawędź boczną powstaje trójkąt prostokątny, w którym krawędź boczna jest przeciwprostokątną.`,
          `Wysokość leży naprzeciw kąta ${angle}°, więc h = ${lateral} razy sinus ${angle}°.`,
          `Dla kąta ${angle}° sinus wynosi odpowiednio 1/2, sqrt(2)/2 lub sqrt(3)/2, co po pomnożeniu przez ${lateral} daje ${answer}.`,
        ],
        [
          "Kąt nachylenia krawędzi bocznej mierzony jest do płaszczyzny podstawy, a nie do wysokości ostrosłupa.",
          `Przeciwprostokątna ma długość ${lateral}; wysokość jest przyprostokątną naprzeciw kąta ${angle}°.`,
          "Użyj sinusa, a nie cosinusa, i sprawdź, że wysokość jest mniejsza od krawędzi bocznej.",
        ],
        "h=l\\sin\\alpha",
      );
    }

    case "matura-geometria-ostroslup-krawedzie": {
      const d = level + rng(2, 4);
      const edge = level + rng(2, 4);
      return make(
        `Ostrosłup prawidłowy ma krawędź podstawy długości ${edge}. Liczba wszystkich krawędzi tego ostrosłupa jest o ${d} większa od liczby jego wierzchołków. Oblicz liczbę boków podstawy.`,
        String(d + 1),
        [`${d}+1`, String(d + 1), `${d + 1}*1`],
        [
          `Jeśli podstawa ma n boków, to ostrosłup ma 2n krawędzi oraz n+1 wierzchołków.`,
          `Różnica jest równa 2n-(n+1) = n-1, a z treści wynosi ${d}.`,
          `Zatem n = ${d}+1 = ${d + 1}; długość krawędzi podstawy ${edge} jest informacją dodatkową.`,
        ],
        [
          "Policz krawędzie i wierzchołki osobno: w ostrosłupie o podstawie n-kąta jest ich odpowiednio 2n i n+1.",
          `Różnica 2n-(n+1) upraszcza się do n-1, więc n-1=${d}.`,
          "Nie zapomnij o wierzchołku, w którym spotykają się wszystkie krawędzie boczne.",
        ],
        "K=2n,\\quad W=n+1,\\quad K-W=n-1",
      );
    }

    case "matura-geometria-prawdopodobienstwo": {
      const mode = rng(0, 1) === 1 ? "rowna" : "wieksza";
      const threshold = level + rng(1, 6);
      const colors = [
        ["czerwoną", "niebieską"],
        ["zieloną", "żółtą"],
        ["białą", "czarną"],
      ][rng(0, 2)];
      let count = 0;
      for (let first = 1; first <= 6; first++)
        for (let second = 1; second <= 6; second++) {
          const sum = first + second;
          if (mode === "rowna" ? sum === threshold : sum > threshold) count++;
        }
      const [numerator, denominator] = reduce(count, 36);
      if (count !== 0) commonTraps.push({
        wrongAnswer: fraction(count, 12),
        explanation: "Dodano liczby wyników kostek zamiast je pomnożyć. Dwie rozróżnialne kostki dają 6·6=36 jednakowo prawdopodobnych par, a nie 12.",
      });
      return make(
        `Rzucamy dwiema kostkami do gry: ${colors[0]} i ${colors[1]}. Oblicz prawdopodobieństwo zdarzenia, że suma oczek będzie ${mode === "rowna" ? "równa" : "większa od"} ${threshold}. Wynik podaj jako ułamek.`,
        `${numerator}/${denominator}`,
        [
          `${count}/36`,
          `${numerator}/${denominator}`,
          `${numerator * 2}/${denominator * 2}`,
        ],
        [
          `Wszystkich uporządkowanych wyników dwóch kostek jest 6 razy 6, czyli 36.`,
          `Zdarzenie sprzyjające obejmuje ${count} par, więc prawdopodobieństwo wynosi ${count}/36.`,
          `Dzielimy licznik i mianownik przez ${gcd(count, 36)} i otrzymujemy ${numerator}/${denominator}.`,
        ],
        [
          "Kostki są rozróżnialne, więc para (2, 5) to inny wynik niż (5, 2).",
          `Wypisz sumy większe od ${threshold} lub równe ${threshold}, zależnie od polecenia, i policz pary.`,
          "Na końcu skróć ułamek i sprawdź, że prawdopodobieństwo jest między 0 a 1.",
        ],
        "P(A)=\\frac{|A|}{36}",
      );
    }

    case "matura-geometria-statystyka": {
      const base = level + 1 + rng(0, 1);
      const counts = [
        rng(1, level + 2),
        rng(1, level + 3),
        0,
        rng(1, level + 2),
        rng(1, level + 3),
      ];
      const top = Math.max(counts[0], counts[1], counts[3], counts[4]);
      counts[2] = top + rng(1, 2);
      let total = counts.reduce((sum, value) => sum + value, 0);
      if (total % 2 === 0) {
        counts[2] += 1;
        total += 1;
      }
      const values = [base, base + 1, base + 2, base + 3, base + 4];
      const table = values
        .map((value, index) => `wartość ${value} – częstość ${counts[index]}`)
        .join("; ");
      const kind = ["mediana", "dominanta", "prawdopodobienstwo"][rng(0, 2)];
      const position = (total + 1) / 2;
      let cumulative = 0;
      let median = values[0];
      for (let index = 0; index < values.length; index++) {
        cumulative += counts[index];
        if (cumulative >= position) {
          median = values[index];
          break;
        }
      }
      const selectedIndex = rng(0, 4);
      const selectedValue = values[selectedIndex];
      const selectedCount = counts[selectedIndex];
      const [probabilityNumerator, probabilityDenominator] = reduce(
        selectedCount,
        total,
      );
      const answer =
        kind === "mediana"
          ? String(median)
          : kind === "dominanta"
            ? String(values[2])
            : `${probabilityNumerator}/${probabilityDenominator}`;
      const question =
        kind === "mediana"
          ? "Podaj medianę tych danych."
          : kind === "dominanta"
            ? "Podaj dominantę tych danych."
            : `Wybieramy losowo jedną obserwację. Jakie jest prawdopodobieństwo, że ma ona wartość ${selectedValue}? Podaj ułamek.`;
      const expressions =
        kind === "prawdopodobienstwo"
          ? [
              `${selectedCount}/${total}`,
              `${probabilityNumerator}/${probabilityDenominator}`,
              `${probabilityNumerator * 2}/${probabilityDenominator * 2}`,
            ]
          : kind === "mediana"
            ? [`${median}`, `${median}+0`, `${median}*1`]
            : [`${values[2]}`, `${values[2]}+0`, `${values[2]}*1`];
      return make(
        `W tabeli zapisano częstości wyników pewnej obserwacji: ${table}. Liczba wszystkich obserwacji wynosi ${total}. ${question}`,
        answer,
        expressions,
        kind === "prawdopodobienstwo"
          ? [
              `Łączna liczba obserwacji to ${total}, a wartość ${selectedValue} występuje ${selectedCount} razy.`,
              `Prawdopodobieństwo to iloraz częstości tej wartości przez liczbę wszystkich obserwacji: ${selectedCount}/${total}.`,
              `Po skróceniu przez ${gcd(selectedCount, total)} otrzymujemy ${probabilityNumerator}/${probabilityDenominator}.`,
            ]
          : kind === "mediana"
            ? [
                `Liczba obserwacji jest nieparzysta i wynosi ${total}, więc mediana to wartość na pozycji ${position}.`,
                `Sumujemy częstości od najmniejszej wartości aż do pozycji ${position}.`,
                `Na tej pozycji znajduje się wartość ${median}, która jest medianą.`,
              ]
            : [
                `Dominanta to wartość o największej częstości, a nie największa wartość w tabeli.`,
                `Największa częstość wynosi ${counts[2]} i odpowiada wartości ${values[2]}.`,
                `Pozostałe częstości są mniejsze, więc dominanta jest jednoznaczna i równa ${values[2]}.`,
              ],
        [
          "Mediana zależy od liczby obserwacji, a nie od liczby różnych wartości w tabeli.",
          `Suma częstości wynosi ${total}; przy nieparzystej liczbie obserwacji mediana jest środkową obserwacją.`,
          "Prawdopodobieństwo zapisuj jako częstość względną, czyli udział n_x/N, i skracaj ułamek.",
        ],
        kind === "prawdopodobienstwo"
          ? "P(X=x)=\\frac{n_x}{N}"
          : kind === "mediana"
            ? "M=x_{\\frac{N+1}{2}}"
            : "D=x_{\\max n_x}",
      );
    }

    case "matura-geometria-optymalizacja": {
      const sum = 4 * (level + rng(2, 20));
      const answer = String(sum / 4);
      commonTraps.push({
        wrongAnswer: String(sum / 2),
        explanation: "Potraktowano średnicę jak promień. Warunek d+h=S oznacza 2r+h=S, dlatego maksimum pola bocznego wypada w r=S/4, nie S/2.",
      });
      return make(
        `Walec ma średnicę podstawy d i wysokość h, przy czym d+h=${sum}. Jaka długość promienia r maksymalizuje pole powierzchni bocznej tego walca?`,
        answer,
        [`${sum}/4`, `(2*${sum})/(2*4)`, `${sum}*1/4`],
        [
          `Średnica to dwa promienie, więc d=2r i wysokość h=${sum}-2r.`,
          `Pole powierzchni bocznej wynosi 2*pi*r*(${sum}-2r), czyli funkcja kwadratowa o ramionach skierowanych w dół.`,
          `Wierzchołek paraboli jest w r=${sum}/4, więc ten promień daje największe pole boczne.`,
        ],
        [
          "Podstaw za średnicę 2r, a nie r; wtedy wysokość wyraża się wzorem h=S-2r.",
          `Pole boczne to 2*pi*r*h; po podstawieniu h=${sum}-2r otrzymujesz funkcję kwadratową zmiennej r.`,
          "Maksimum paraboli o ramionach w dół leży w wierzchołku; sprawdź, że otrzymany promień jest dodatni i mniejszy od połowy sumy.",
        ],
        "P_b=2\\pi r(S-2r)",
      );
    }

    default:
      throw new Error(`Nieznany generator maturalny: ${id}`);
  }
}
