# Generator audit — Etap A

Scope: all 60 public `GENERATOR_IDS`, especially levels 1–3. This is a targeted
audit, **not a claim that all 60 algorithms were rewritten as reverse generators**.
Integer arithmetic and educational rational/symbolic answers were retained where
already clean. IDs, mathematical operations and value-equivalent scratchpad
semantics remain unchanged, apart from the wording correction described below.
Selected seeded operands change before the first publication of version-1 seed
links; later algorithm changes must increment the link version or preserve a legacy generator.

## Per-family coverage (10 generators each)

### Fractions — retain exact rational practice

| ID suffix (`fractions-`) | Construction / decision |
| --- | --- |
| meaning | Positive part count and positive denominator; exact fraction, not forced integer. |
| simplify | Already reverse: small base fraction enlarged by a common factor. |
| common | Positive denominators, NWW constructed exactly; integer vector. |
| add | Bounded rational operands, common denominator; keep fraction result. Structured numerator-plus-denominator trap added. |
| subtract | Same construction, zero/negative results are legitimate. |
| multiply | Exact products and gcd reduction; rational result intentional. |
| divide | Divisor numerator is strictly positive; exact inverse multiplication. |
| mixed | Already reverse: whole and proper fractional part, then improper fraction. |
| compare | Cross products choose -1/0/1; equality explicitly avoids division by zero. |
| compound | Nonzero inner divisor, exact reduced fraction; no integer-only rewrite. |

### Matrices

| ID suffix (`matrix-`) | Construction / decision |
| --- | --- |
| entry | Bounded integer matrix; read selected entry (no algebraic rewrite needed). |
| add | Integer matrix operands guarantee integer output. |
| subtract | Integer matrix operands guarantee integer output. |
| scale | Levels 1–3 integer scalar; levels 4–5 intentionally allow rational scalar. |
| transpose | Integer input/output; rectangular input from level 3 retained. |
| multiply | Integer dot products; sizes and operation retained. |
| det | Integer determinant; 2×2 traps for bc−ad and ad+bc added from actual entries. |
| inverse | **Changed levels 1–3:** choose integral inverse `[[1+uv,-u],[-v,1]]`, construct its inverse, optionally swap rows. Determinant ±1; clean integral answer. Levels 4–5 retain strictly diagonally dominant 3×3 matrices and rational answers. |
| trace | Integer diagonal sum; no radical or denominator issue. |
| equation | Already reverse: select integer X, construct B=AX; diagonal dominance guarantees A invertible. |

### Complex numbers

| ID suffix (`complex-`) | Construction / decision |
| --- | --- |
| parts | Bounded exact coordinates; denominator 1 on levels 1–4, rational coordinates on level 5. |
| add | Integer-coordinate arithmetic on levels 1–3; no reverse rewrite needed. |
| subtract | Same; sign practice retained. |
| multiply | Exact integer real/imaginary parts on levels 1–3. |
| divide | **Changed levels 1–3:** choose integer quotient first, multiply by nonzero divisor to create dividend. Levels 4–5 retain rational quotient practice. |
| conjugate | Exact coordinate sign change. |
| modulus | **Changed levels 1–3:** scaled 3–4–5 triples, with existing sign progression; integral modulus. Level-specific scale ranges retain five distinguishable seeded difficulties. Levels 4–5 retain general square-root answers. |
| power | Exact integer-coordinate multiplication; exponent level+1 retained. |
| gauss | Exact coordinate interpretation; no need for algebraic reverse generation. |
| equation | Already reverse: choose z and nonzero coefficient w, construct wz. |

### Matura — numbers and algebra

| ID suffix (`matura-liczby-`) | Construction / decision |
| --- | --- |
| pierwiastki | Already reverse: select roots, construct perfect cubes/fifth powers/squares. |
| potegi | Perfect powers for rational exponent exercises; negative exponents intentionally yield rational reciprocals. |
| logarytmy | Already reverse: choose exponents, build powers of a valid positive base ≠1. |
| wzory-skrocone | Exact `4ab` with π/√2 is the intended symbolic lesson, not unwanted noise. Added missing-2ab trap (answer 0) for the actual difference-of-squares exercise on all levels. |
| podzielnosc | Bounded odd n, exact divisible polynomial families; integer quotient. |
| nierownosc-liniowa | Already reverse: choose integer bound and construct constant; strict cases intentionally use nonintegral boundary. |
| rownanie-iloczynowe | Choose roots/factors; level 3 rational root intentionally retained. |
| wyrazenia-wymierne | Construct factorable polynomials; retain domain restrictions. Corrected level-3 wording to ask for the constant term c, not the coefficient 2 of x. |
| nierownosc-kwadratowa | Already reverse: choose roots/bound, construct factors; fractional endpoint exercises floor reasoning. |
| uklad-rownan | Already reverse: choose integral prices, construct totals with nonzero coefficient determinant. Existing rejection loop unchanged. |

### Matura — functions

| ID suffix (`matura-funkcje-`) | Construction / decision |
| --- | --- |
| przedzialami | Bounded piecewise-linear functions, integer endpoint extrema; distinct slopes. |
| liniowa | Already reverse: choose positive m, construct intercept; perfect-square discriminant. |
| kwadratowa | Canonical parameters produce integer coefficient c. |
| ciag-geometryczny | Exact prescribed integer/rational quotients; integer outputs on levels 1–3. |
| ciag-arytmetyczny | Already reverse: select a1 and difference divisible by 3, construct sum and mean. |
| ciag-trzywyrazowy | Already reverse: select x and integer q, construct remaining coefficients. |
| trygonometria | Exact c/a from identity cancellation; rational tangent is intentional. |
| katy-okregu | Construct supplementary opposite angles; integral valid angles. |
| trapez | Already clean: prescribed consistent Pythagorean configurations, scaled by an integer. |
| trojkat-prostokatny | `c+c√2` is essential to right-isosceles geometry; retained exactly. |

### Matura — geometry, probability and statistics

| ID suffix (`matura-geometria-`) | Construction / decision |
| --- | --- |
| podobienstwo | Already reverse: integer similarity scale constructs perimeter and target side; valid triangles. |
| prosta | Nonzero horizontal difference; exact rational slope intentional. |
| okrag | Integer displacement; asks for r² rather than arbitrary radical radius. |
| proste-rownolegle | Choose coefficients, m=a+c integral; retained templates. |
| graniastoslup | √3 is intrinsic to the regular hexagon; exact symbolic volume retained. |
| ostroslup-kat | Special angles 30°/45°/60° and even lateral edge; clean integer or √2/√3 multiple. |
| ostroslup-krawedzie | Integer combinatorial counts, valid polygon size. |
| prawdopodobienstwo | Enumerate 36 equiprobable outcomes; reduced fraction retained (0 or 1 can be legitimate). |
| statystyka | Construct unique mode and odd sample count; median/mode integral, relative frequency rational. |
| optymalizacja | Already reverse: choose sum divisible by 4, target radius integral. |

## Presentation and diagnostic safety

- `cleanMathLatex` is applied only to public `generateProblem(...).latex` after
  per-generator overrides. It does not alter answers, checkpoint expressions,
  prompts, or hints. Direct factory calls are intentionally not a second public
  cleaning boundary.
- It removes bare `+ -number`, a boundary-delimited coefficient `1x`/`-1x`,
  and characteristic floating-point tails only when within two relative machine
  epsilons of a decimal with at most 12 places. Arbitrary high precision, tiny
  values, scientific notation, 11x/21x, indices, powers and fraction grouping are
  preserved. Text/operator/font arguments are opaque. `+(-3)` is intentionally
  retained: unwrapping it is unsafe in `+(-3)^2` and `+(-3)x`.
- `Problem.mistakes` is optional structured metadata created alongside actual
  operands. Nothing is appended to the prompt. Classifier uses existing bounded
  `checkAnswer`, never prompt parsing, `eval`, or unrestricted mathjs evaluation.
- Correct numerical answers always win; equal-to-correct trap values are ignored.
  Representation-only errors still use existing fraction-format diagnostics.
- Diagnostics recognize only the three explicit trap families above. Matching a
  trap value is evidence of a common pattern, not a complete reconstruction of
  the learner's reasoning. Arbitrary errors retain the generic checker response.

## Verification

- Integrated `npm run check`: **176/176 passed** (including original independent arithmetic,
  complex-coordinate, Gaussian-elimination matrix and matura oracles).
- `npm run typecheck` and production `npm run build`: passed. Full browser regression: **40/40 desktop/mobile**.
- New quality sweep: **4,320** generated problems = 60 IDs × 3 levels × 24 seeds;
  KaTeX with `throwOnError`, reproducibility, IDs, finite answers/checkpoints,
  equivalent steps and explicit nonzero evaluated divisors.
- Additional all-five-level repeatability on three signed/large seeds:
  **900** cases. Existing tests cover finite equivalent steps across all levels.
- **720** targeted reverse-construction cases (three changed generators × three
  levels × 80 seeds), plus cleaner edge cases, malicious inputs, fixed seeded
  arithmetic diagnostics, symbolic π/√2 traps and collision protection.
- `inbox_materialy/` contains only `.gitkeep` and `przetworzone/`; no new top-level
  material was consumed in this generator-only task.

## Wording correction found during integration

`matura-liczby-wyrazenia-wymierne`, level 3, previously asked for the coefficient
of x in `2x+c`, but expected c. Integration corrected the prompt to ask for the
constant term and explicitly explains that the coefficient of x is 2. Answers,
factorization and independent numeric oracles remain valid. This illustrates why
numeric-equivalence tests complement, but cannot replace, semantic review.

`PROJECT_STATE.md`, seed-link versioning, master/custom generators and UI are owned
by the integrating session and were not edited here.
