# Etap 2 — walidacja odpowiedzi i generatory

## Jeden kontrakt odpowiedzi

`src/lib/mathValidator.ts` eksportuje `validateMathAnswer(input, expected, commonTraps?)`.
Wynik ma `status`, `correct`, `message` i opcjonalny `method`:

- `correct` / `correct_unsimplified`: zielone zaliczenie, również XP według zwykłych zasad. Nieskrócony ułamek dostaje wskazówkę, nie karę.
- `trap`: błędna odpowiedź pasująca do pułapki wyliczonej z konkretnych operandów; bursztynowa diagnoza. Poprawność ma pierwszeństwo przed pułapką.
- `incorrect`, `invalid`, `unsupported`: odpowiednio inna wartość, wadliwy zapis/wartość lub zapis poza obsługiwanym zakresem.

Ćwiczenia i oba tryby egzaminów używają `checkProblemAnswer`, delegującego do tego kontraktu. Numeryczne punkty kontrolne brudnopisu i dokładny checker przekształceń OmniKumpla pozostają osobnymi narzędziami — porównanie z końcowym wynikiem nie dowodzi poprawności całego rozwiązania.

## Zapis i niejednoznaczności

- `0,5` oznacza `0.5`; `3, 2`, `2; 3`, `{2,3}` i `x=2 lub x=3` oznaczają zbiory rozwiązań. Powtórzenia i kolejność nie zmieniają zbioru.
- Przecinki wewnątrz macierzy/wektorów nie są zamieniane na kropki. Do elementów dziesiętnych użyj tam kropki lub ułamka.
- Wektory i macierze są uporządkowane. Generator pierwiastków oznacza wynik przez `answerKind: "set"`; współrzędne i wektor statystyk nie mają takiego oznaczenia. Integracja nie pozwala obejść kolejności współrzędnych zapisem ze średnikiem.
- `x=2` jest dopuszczalnym zapisem pojedynczego rozwiązania; ogólne przypisania i równania nie są wykonywane jako kod.

## Dokładność, próbkowanie i bezpieczeństwo

Wielomiany wymierne porównywane są przez dokładne współczynniki odczytane z oryginalnych literałów, bez tolerancji usuwającej małe niezerowe składniki. Certyfikat dokładności nie jest odrzucany z powodu numerycznej utraty cyfr przy odejmowaniu dużych liczb. Porównanie zwykłych wartości ma tolerancję absolutną `1e-9` (całkowite odpowiedzi są porównywane dokładnie), nie rosnący z wielkością wyniku margines błędu. Pozostałe obsługiwane wyrażenia ze zmiennymi sprawdzane są w trzech losowych niecałkowitych punktach, z tolerancją `1e-7`; maksymalnie 12 prób znalezienia wspólnej dziedziny. `method: "sampling"` i komunikat wyniku oznaczają test punktowy, **nie dowód tożsamości ani równości dziedzin**. W szczególności `x/x` i `1` mają różne dziedziny. Narzędzie nie jest uniwersalnym CAS i nie daje matematycznej gwarancji „niezniszczalności”.

Dozwolone są tylko węzły AST z białej listy. Brak dowolnego `evaluate`, przypisań, accessorów, jednostek, importów i wywołań kodu. Limity: 2048 znaków, 512 węzłów, głębokość 24, wykładniki całkowite od −12 do 12, do trzech zmiennych spośród `x,y,z,a,b,c`, macierze do 16×16 i skończone wartości o module do `1e15`. Rozwinięcie wielomianu ma osobne limity stopnia 36, 256 składników i rozmiaru liczb dokładnych. Nieobsługiwane funkcje są jawnie odrzucane.

## Generatory i formatowanie

`commonTraps` pochodzi z operandów generatora, nigdy z odgadywania liczb w treści. Pusta tablica oznacza brak przygotowanej diagnozy dla danego działania, a nie nieomylność użytkownika. Zachowano zgodność starszego pola `mistakes` przez mapowanie do nowego kontraktu.

Poziomy 1–3 używają konstrukcji wstecznych w rodzinach, w których celem są pierwiastki całkowite, małe wyznaczniki, całkowita odwrotność lub iloraz zespolony. Nie usuwamy ułamków z nauki ułamków ani naturalnych stałych π i pierwiastków z geometrii. Zadania na poziomach 4–5 mogą celowo wymagać trudniejszych rachunków.

`formatCleanLatex` służy do prezentacji, nie zmienia dziedziny ani kolejności działań. Chroni polecenia LaTeX i ich tekstowe argumenty. Stary import `cleanMathLatex` pozostaje aliasem tej samej funkcji.

Nowe linki z ziarnem mają `v=2`. Linki `v=1` otrzymują komunikat o nieobsługiwanej wersji zamiast po cichu pokazywać inne zadanie po zmianie algorytmu. Zapisy XP i przypięte rozwiązania nie są migrowane ani usuwane.

## Powtarzalny stress-test

```powershell
npm run test:stress
```

Skrypt sprawdza każdy z 60 generatorów na 50 ziarnach × 5 poziomów (15 000 zadań), dodatkowo rodziny OmniKumpla/Smart Math. Kontroluje niedozwolone wartości/fragmenty tekstu, KaTeX, wynik i numeryczne punkty kontrolne. To test skończonej próbki — nie formalny dowód poprawności wszystkich możliwych ziaren.
