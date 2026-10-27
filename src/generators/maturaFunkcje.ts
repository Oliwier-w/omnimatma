import { finish, fraction, gcd, type Problem, type RNG } from "./shared";

/** Ułamek w postaci nieskracalnej; liczby całkowite bez mianownika 1. */
function rational(numerator: number, denominator: number): string {
  const divisor = gcd(numerator, denominator);
  if (denominator / divisor === 1) return String(numerator / divisor);
  return fraction(numerator, denominator);
}

const qLatex = (numerator: number, denominator: number): string =>
  denominator === 1
    ? String(numerator)
    : `\\frac{${numerator}}{${denominator}}`;

export function maturaFunkcjeProblem(
  id: string,
  level: number,
  seed: number,
  rng: RNG,
): Problem {
  let prompt = "";
  let latex = "";
  let answer = "";
  let first = "";
  let second = "";
  let explanations: string[] = [];
  let hints: string[] = [];
  const commonTraps: { wrongAnswer: string; explanation: string }[] = [];

  switch (id) {
    /* 11. Funkcja kawałkami liniowa — największa wartość w przedziale. */
    case "matura-funkcje-przedzialami": {
      const left = -(rng(2, 5) + level);
      const right = rng(2, 5) + level;
      const constant = rng(1, 5) + 2 * level;
      const slopeLeft =
        (rng(0, 1) ? 1 : -1) * (rng(1, 3) + Math.floor(level / 2));
      let slopeRight =
        (rng(0, 1) ? 1 : -1) * (rng(1, 3) + Math.floor(level / 2));
      // Ten sam wzór po obu stronach zera nie pokazywałby istoty funkcji kawałkowej.
      if (slopeRight === slopeLeft) slopeRight = -slopeLeft;
      const atLeft = slopeLeft * left + constant;
      const atZero = constant;
      const atRight = slopeRight * right + constant;
      const maximum = Math.max(atLeft, atZero, atRight);
      const edge =
        maximum === atLeft
          ? { slope: slopeLeft, x: left }
          : maximum === atRight
            ? { slope: slopeRight, x: right }
            : { slope: slopeLeft, x: 0 };

      prompt = `Funkcja f jest określona wzorem f(x) = { ${slopeLeft}x + ${constant} dla x <= 0; ${slopeRight}x + ${constant} dla x > 0 }. Wyznacz największą wartość funkcji f w przedziale [${left}, ${right}].`;
      answer = String(maximum);
      first = `${edge.slope}*(${edge.x})+${constant}`;
      second = `${edge.slope * edge.x}+${constant}`;
      explanations = [
        "Na każdym z dwóch przedziałów funkcja jest liniowa, więc największa wartość może wystąpić tylko na końcu przedziału albo w punkcie x = 0.",
        `Porównujemy wartości: f(${left}) = ${atLeft}, f(0) = ${atZero}, f(${right}) = ${atRight}. Największa z nich to ${maximum}.`,
        `Szukana największa wartość funkcji f w podanym przedziale jest równa ${maximum}.`,
      ];
      hints = [
        "Rozbij dziedzinę na dwa przedziały i zbadaj, czy każdy liniowy kawałek rośnie, czy maleje.",
        `Policz trzy wartości kontrolne: f(${left}), f(0) oraz f(${right}).`,
        `Największa z wartości kontrolnych to ${maximum}.`,
      ];
      latex = `f(x)=\\begin{cases}${slopeLeft}x+${constant} & \\text{dla } x\\le 0\\\\${slopeRight}x+${constant} & \\text{dla } x>0\\end{cases},\\quad x\\in[${left},${right}]`;
      break;
    }

    /* 12. Funkcja liniowa — dodatnie m z przecięcia z osią OY. */
    case "matura-funkcje-liniowa": {
      const b = rng(1, 5) + level;
      const m = rng(1, 7) + level;
      const yIntercept = m * (m + b);
      const a = (rng(0, 1) ? 1 : -1) * (rng(1, 4) + level);

      prompt = `Funkcja liniowa f(x) = ${a}x + m^2 + ${b}m przecina oś OY w punkcie (0, ${yIntercept}). Wyznacz dodatnią wartość m.`;
      answer = String(m);
      first = `(sqrt(${b * b}+4*${yIntercept})-${b})/2`;
      second = `${yIntercept}/${m + b}`;
      explanations = [
        "Punkt przecięcia z osią OY ma pierwszą współrzędną zero, więc jego druga współrzędna to f(0) = m^2 + b m.",
        `Rozwiązujemy równanie m^2 + ${b}m - ${yIntercept} = 0. Wzór kwadratowy daje pierwiastek dodatni m = ${m}.`,
        `Drugi pierwiastek jest ujemny (wynosi -${m + b}), więc dodatnia wartość m jest wyznaczona jednoznacznie i równa ${m}.`,
      ];
      hints = [
        "Przecięcie z osią OY odczytujemy, podstawiając x = 0 do wzoru funkcji.",
        `Otrzymujesz równanie m^2 + ${b}m = ${yIntercept}; przenieś wyraz wolny na lewą stronę.`,
        `Dodatni pierwiastek równania kwadratowego to ${m}.`,
      ];
      latex = `f(x)=${a}x+m^2+${b}m,\\quad f(0)=${yIntercept},\\quad m>0`;
      break;
    }

    /* 13. Postać kanoniczna — współczynnik c po rozwinięciu. */
    case "matura-funkcje-kwadratowa": {
      const a = (rng(0, 1) ? 1 : -1) * (rng(1, 3) + Math.floor(level / 2));
      const h = rng(-4, 5) + level;
      const k = rng(-6, 6) + level;
      const c = a * h * h + k;
      if (k !== 0) commonTraps.push({
        wrongAnswer: String(a * h * h - k),
        explanation: "Zmieniono znak przesunięcia pionowego k. Wyraz wolny to f(0)=ah²+k; składnik k zachowuje swój znak.",
      });
      if (a !== 1 && h !== 0) commonTraps.push({
        wrongAnswer: String(h * h + k),
        explanation: "Nie pomnożono h² przez a. Współczynnik a mnoży cały kwadrat (x−h)², także jego wyraz wolny h².",
      });

      prompt = `Funkcja kwadratowa ma postać kanoniczną f(x) = a(x - h)^2 + k, gdzie a = ${a}, h = ${h}, k = ${k}. Po rozwinięciu do postaci f(x) = ax^2 + bx + c wyznacz współczynnik c.`;
      answer = String(c);
      first = `${a}*(${h})^2+${k}`;
      second = `${a * h * h}+${k}`;
      explanations = [
        "Rozwijamy kwadrat: a(x - h)^2 = a(x^2 - 2hx + h^2), a następnie dodajemy k.",
        `Wyraz wolny powstaje wyłącznie z części a*h^2 oraz z k, więc c = ${a}*(${h})^2 + (${k}).`,
        `Po wykonaniu działań otrzymujemy c = ${c}; współczynnik przy x nie wpływa na wyraz wolny.`,
      ];
      hints = [
        "Współczynnik c to wartość funkcji w punkcie x = 0, czyli f(0).",
        `Podstaw x = 0 do postaci kanonicznej: c = a*(0 - h)^2 + k.`,
        `Stąd c = ${a}*(${h})^2 + (${k}) = ${c}.`,
      ];
      latex = `f(x)=${a}\\left(x-(${h})\\right)^2+${k},\\quad c=?`;
      break;
    }

    /* 14. Ciąg geometryczny — wyraz ogólny. */
    case "matura-funkcje-ciag-geometryczny": {
      const quotients: [number, number][] = [
        [2, 1],
        [3, 1],
        [-2, 1],
        [1, 2],
        [4, 1],
      ];
      const [qNumerator, qDenominator] = quotients[level - 1];
      const linear = rng(1, 4) + (level >= 3 ? 1 : 0);
      const n = rng(3, 5) + level;
      const numerator = linear * qNumerator ** (n - 1);
      const denominator = qDenominator ** (n - 1);
      const quotientText =
        qDenominator === 1
          ? String(qNumerator)
          : `${qNumerator}/${qDenominator}`;
      commonTraps.push({
        wrongAnswer: rational(linear * qNumerator ** n, qDenominator ** n),
        explanation: "Użyto wykładnika n zamiast n−1. Od pierwszego do n-tego wyrazu wykonujemy n−1 mnożeń przez iloraz q.",
      });

      prompt = `W ciągu geometrycznym (a_n) pierwszy wyraz jest równy ${linear}, a iloraz q = ${quotientText}. Oblicz wyraz a_${n}.`;
      answer = rational(numerator, denominator);
      first = `${linear}*(${qNumerator}/${qDenominator})^${n - 1}`;
      second = `${numerator}/${denominator}`;
      explanations = [
        "Wyraz ogólny ciągu geometrycznego ma postać a_n = a_1 * q^(n-1).",
        `Podstawiamy a_1 = ${linear}, q = ${quotientText} oraz n = ${n}.`,
        `Po podniesieniu ilorazu do potęgi ${n - 1} i uproszczeniu otrzymujemy a_${n} = ${answer}.`,
      ];
      hints = [
        "Skorzystaj ze wzoru na n-ty wyraz ciągu geometrycznego.",
        `Najpierw policz q^(n-1), czyli (${quotientText})^${n - 1}.`,
        `Pomnóż otrzymaną potęgę przez pierwszy wyraz ${linear}; wynik to ${answer}.`,
      ];
      latex = `a_{${n}}=${linear}\\cdot\\left(${qLatex(qNumerator, qDenominator)}\\right)^{${n - 1}}`;
      break;
    }

    /* 15. Ciąg arytmetyczny — suma i średnia dają układ na a1 oraz r. */
    case "matura-funkcje-ciag-arytmetyczny": {
      const step = rng(1, 2) + level;
      const difference = 3 * step;
      const firstTerm = rng(-4, 6) + 2 * level;
      const sum = 10 * firstTerm + 45 * difference;
      const mean = firstTerm + 13 * step;

      prompt = `W ciągu arytmetycznym (a_n) suma pierwszych dziesięciu wyrazów wynosi ${sum}, a średnia arytmetyczna wyrazów a1, a7 i a8 wynosi ${mean}. Podaj wektor [a1, r].`;
      answer = `[${firstTerm},${difference}]`;
      first = `[(135*${mean}-13*${sum})/5,(3*${sum}-30*${mean})/5]`;
      second = `[${firstTerm},${difference}]`;
      explanations = [
        "Suma dziesięciu początkowych wyrazów ciągu arytmetycznego to S10 = 10a1 + 45r.",
        "Średnia wyrazów a1, a7 i a8 jest równa (a1 + (a1+6r) + (a1+7r))/3 = a1 + 13r/3.",
        `Rozwiązując układ równań, otrzymujemy a1 = ${firstTerm} oraz r = ${difference}, czyli wektor [${firstTerm},${difference}].`,
      ];
      hints = [
        "Zapisz a7 i a8 za pomocą a1 oraz różnicy r, a następnie uprość średnią.",
        "Otrzymasz układ dwóch równań liniowych: 10a1 + 45r = S10 oraz a1 + 13r/3 = średnia.",
        `Po rozwiązaniu układu a1 = ${firstTerm}, r = ${difference}.`,
      ];
      latex = `S_{10}=${sum},\\quad \\frac{a_1+a_7+a_8}{3}=${mean},\\quad [a_1,r]=?`;
      break;
    }

    /* 16. Trzywyrazowy ciąg geometryczny z niewiadomą x. */
    case "matura-funkcje-ciag-trzywyrazowy": {
      const quotient = [2, 2, 3, 3, 4][level - 1];
      const x = rng(1, 5) + level;
      const a = (quotient - 1) * x;
      const b = rng(1, quotient * quotient - 1);
      const c = (quotient * quotient - b) * x;

      prompt = `Liczby x, x + ${a}, ${b}x + ${c} są dodatnie i tworzą w podanej kolejności ciąg geometryczny. Wyznacz iloraz q tego ciągu.`;
      answer = String(quotient);
      first = `(${x + a})/${x}`;
      second = `(${b * x + c})/${x + a}`;
      explanations = [
        "W ciągu geometrycznym iloraz jest stały: q = a2/a1 = a3/a2.",
        `Pierwszy i drugi wyraz to x oraz x + ${a}, więc q = (x + ${a})/x. Warunek geometryczności pozwala wyznaczyć dodatnie x = ${x}.`,
        `Wtedy q = ${x + a}/${x} = ${quotient}; trzeci wyraz ${b}x + ${c} daje ten sam iloraz.`,
      ];
      hints = [
        "Zapisz warunek ciągu geometrycznego: (x + a)^2 = x*(bx + c).",
        "Rozwiąż otrzymane równanie kwadratowe i odrzuć niedodatnie x.",
        `Dodatnie rozwiązanie to x = ${x}; iloraz q = (x + ${a})/x = ${quotient}.`,
      ];
      latex = `x,\\quad x+${a},\\quad ${b}x+${c}\\quad\\text{(ciąg geometryczny)}`;
      break;
    }

    /* 17. Tożsamość trygonometryczna — tangens kąta ostrego. */
    case "matura-funkcje-trygonometria": {
      const a = rng(1, 4) + level;
      const b = rng(1, 5) + level;
      const c = rng(1, 6) + level;

      prompt = `Kąt α jest ostry i spełnia równanie ${a} sin α + ${b} sin^2 α = ${c} cos α - ${b} cos^2 α + ${b}. Oblicz tan α.`;
      answer = rational(c, a);
      first = `${c}/${a}`;
      second = `(${c}*${a})/(${a}*${a})`;
      explanations = [
        "Prawą stronę przekształcamy: c cosα - b cos^2α + b = c cosα + b(1 - cos^2α) = c cosα + b sin^2α.",
        "Składniki b sin^2α występują po obu stronach, więc po skróceniu zostaje a sinα = c cosα.",
        "Dla kąta ostrego cosα > 0, zatem tanα = sinα/cosα = c/a. Ostatecznie tanα = " + answer + ".",
      ];
      hints = [
        "Zamień 1 - cos^2α na sin^2α po prawej stronie równania.",
        "Zauważ, że wyrazy z sin^2α się skracają; zostaje zależność między sinusem i cosinusem.",
        `Podziel obie strony przez cosα i odczytaj tanα = ${c}/${a} = ${answer}.`,
      ];
      latex = `${a}\\sin\\alpha+${b}\\sin^2\\alpha=${c}\\cos\\alpha-${b}\\cos^2\\alpha+${b},\\quad \\tan\\alpha=?`;
      break;
    }

    /* 18. Czworokąt wpisany w okrąg — kąty przeciwległe. */
    case "matura-funkcje-katy-okregu": {
      const angleA = rng(30, 80) + 2 * level;
      const angleC = 180 - angleA;
      const angleB = rng(50, 100) + 2 * level;
      const angleD = 180 - angleB;

      prompt = `Czworokąt ABCD jest wpisany w okrąg. Kąty przy wierzchołkach A, B i C mają miary odpowiednio ${angleA}°, ${angleB}°, ${angleC}°. Wyznacz miarę kąta przy wierzchołku D w stopniach.`;
      answer = String(angleD);
      first = `180-${angleB}`;
      second = `${180}-${angleB}`;
      explanations = [
        "W czworokącie wpisanym w okrąg suma miar przeciwległych kątów jest równa 180°.",
        `Kąty przy wierzchołkach B i D są przeciwległe, więc ich miary spełniają równanie B + D = 180°.`,
        `Stąd D = 180° - ${angleB}° = ${angleD}°. Kąty A i C także sumują się do 180°, co potwierdza poprawność danych.`,
      ];
      hints = [
        "Wykorzystaj twierdzenie o sumie przeciwległych kątów czworokąta wpisanego w okrąg.",
        "Kąt D jest przeciwległy do kąta B, a nie do kąta A ani C.",
        `Policz 180° - ${angleB}° = ${angleD}°.`,
      ];
      latex = `\\angle A=${angleA}^\\circ,\\quad \\angle B=${angleB}^\\circ,\\quad \\angle C=${angleC}^\\circ,\\quad \\angle D=?`;
      break;
    }

    /* 19. Trapez równoramienny — ramię z przekątnej, cosinusa i różnicy podstaw. */
    case "matura-funkcje-trapez": {
      const shapes = [
        { halfDifference: 5, height: 12, offset: 9, diagonal: 15, cosNumerator: 3, cosDenominator: 5, leg: 13 },
        { halfDifference: 8, height: 15, offset: 20, diagonal: 25, cosNumerator: 4, cosDenominator: 5, leg: 17 },
        { halfDifference: 10, height: 24, offset: 18, diagonal: 30, cosNumerator: 3, cosDenominator: 5, leg: 26 },
        { halfDifference: 15, height: 20, offset: 21, diagonal: 29, cosNumerator: 21, cosDenominator: 29, leg: 25 },
        { halfDifference: 9, height: 12, offset: 16, diagonal: 20, cosNumerator: 4, cosDenominator: 5, leg: 15 },
      ];
      const shape = shapes[level - 1];
      const scale = rng(1, 12);
      const halfDifference = shape.halfDifference * scale;
      const height = shape.height * scale;
      const offset = shape.offset * scale;
      const diagonal = shape.diagonal * scale;
      const difference = 2 * halfDifference;
      const leg = shape.leg * scale;
      commonTraps.push({
        wrongAnswer: `sqrt(${difference}^2+${height}^2)`,
        explanation: "Użyto całej różnicy podstaw jako rzutu ramienia. W trapezie równoramiennym rzut ramienia jest połową tej różnicy.",
      });

      prompt = `W trapezie równoramiennym ABCD dłuższa podstawa AB jest równoległa do krótszej podstawy CD. Przekątna AC ma długość ${diagonal}, cosinus kąta BAC jest równy ${shape.cosNumerator}/${shape.cosDenominator}, a różnica długości podstaw wynosi ${difference}. Oblicz długość ramienia tego trapezu.`;
      answer = String(leg);
      first = `sqrt((${difference}/2)^2+(${diagonal}^2-(${diagonal}*${shape.cosNumerator}/${shape.cosDenominator})^2))`;
      second = `sqrt(${halfDifference}^2+${height}^2)`;
      explanations = [
        "W trapezie równoramiennym rzut ramienia na dłuższą podstawę ma długość równą połowie różnicy podstaw.",
        `Rzut przekątnej na podstawę to s = ${diagonal} * ${shape.cosNumerator}/${shape.cosDenominator} = ${offset}, a wysokość h = sqrt(${diagonal}^2 - ${offset}^2) = ${height}.`,
        `Ramię tworzy z wysokością trójkąt prostokątny o przyprostokątnych ${halfDifference} i ${height}, więc jego długość to sqrt(${halfDifference}^2 + ${height}^2) = ${leg}.`,
      ];
      hints = [
        "Narysuj wysokości z końców krótszej podstawy; podzielą one dłuższą podstawę na trzy odcinki.",
        "Połowa różnicy podstaw to rzut ramienia na dłuższą podstawę.",
        `Cosinus pozwala znaleźć rzut przekątnej, potem wysokość, a na końcu ramię. Wynik to ${leg}.`,
      ];
      latex = `|AC|=${diagonal},\\quad \\cos\\angle BAC=\\frac{${shape.cosNumerator}}{${shape.cosDenominator}},\\quad |AB|-|CD|=${difference},\\quad |AD|=?`;
      break;
    }

    /* 20. Trójkąt prostokątny równoramienny — obwód z przeciwprostokątnej. */
    case "matura-funkcje-trojkat-prostokatny": {
      const hypotenuse = rng(3, 30) + 2 * level;

      prompt = `Trójkąt prostokątny równoramienny ma przeciwprostokątną długości ${hypotenuse}. Oblicz obwód tego trójkąta.`;
      answer = `${hypotenuse}+${hypotenuse}*sqrt(2)`;
      first = `${hypotenuse}*(1+sqrt(2))`;
      second = `${hypotenuse}+sqrt(2*${hypotenuse * hypotenuse})`;
      explanations = [
        "W trójkącie prostokątnym równoramiennym obie przyprostokątne mają tę samą długość a.",
        `Z twierdzenia Pitagorasa 2a^2 = ${hypotenuse}^2, więc a = ${hypotenuse}/sqrt(2).`,
        `Obwód to ${hypotenuse} + 2a = ${hypotenuse} + ${hypotenuse}*sqrt(2), czyli dokładnie ${answer}.`,
      ];
      hints = [
        "Oznacz długość przyprostokątnej przez a i zapisz twierdzenie Pitagorasa.",
        `Z równania 2a^2 = ${hypotenuse}^2 wyznacz a, a następnie dodaj dwie przyprostokątne i przeciwprostokątną.`,
        `Obwód wynosi ${answer}.`,
      ];
      latex = `a^2+a^2=${hypotenuse}^2,\\quad a>0,\\quad \\text{Obwód}=?`;
      break;
    }

    default:
      throw new Error(`Nieznany generator maturalny: ${id}`);
  }

  const problem = finish(
    id,
    level,
    seed,
    prompt,
    answer,
    [first, second, answer],
    explanations,
    hints,
  );
  problem.latex = latex;
  problem.commonTraps = commonTraps;
  return problem;
}
