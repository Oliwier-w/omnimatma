---
id: matura-liczby-wyrazenia-wymierne
tytul: "Upraszczanie wyrażeń wymiernych"
poziom: liceum
dzial: "Matura · Liczby i algebra"
wymagane_wczesniej: ["[[matura-liczby-rownanie-iloczynowe]]"]
generator_id: matura-liczby-wyrazenia-wymierne
status: gotowe
minutes: 9
description: "Skracanie wyrażeń wymiernych po rozkładzie na czynniki i odczytywanie współczynników uproszczonego wyniku."
formula: '\frac{x^2-a^2}{x-a}=x+a\quad(x\ne a)'
---

# Upraszczanie wyrażeń wymiernych

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wyrażenie wymierne to ułamek, w którym w liczniku i mianowniku są wielomiany. Skracanie działa jak w zwykłych ułamkach: jeśli w liczniku i mianowniku jest ten sam czynnik, można go usunąć. Ważne, żeby najpierw rozłożyć oba wielomiany na czynniki — wtedy widać, co naprawdę się powtarza. Nie można skracać pojedynczych składników sumy, tylko całe czynniki.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dziedziną wyrażenia wymiernego $\frac{P(x)}{Q(x)}$ są wszystkie $x$, dla których $Q(x)\ne0$. Po rozkładzie na czynniki możemy skrócić wspólny czynnik:
$$\frac{P(x)\cdot R(x)}{Q(x)\cdot R(x)}=\frac{P(x)}{Q(x)},\qquad R(x)\ne0.$$
Przydatne rozkłady to
$$x^2-a^2=(x-a)(x+a),\qquad x^2+px+q=(x-r_1)(x-r_2)\quad(\text{gdy pierwiastki są rzeczywiste}),$$
$$x^3-a^3=(x-a)(x^2+ax+a^2),\qquad x^3+a^3=(x+a)(x^2-ax+a^2).$$
Po skróceniu otrzymujemy prostsze wyrażenie, ale dziedzina pozostaje taka sama jak przed skróceniem — skrócony czynnik nie może być zerem.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Uprość $\frac{x^2-36}{x-6}$ i podaj wyraz wolny otrzymanego dwumianu.
**Krok 1:** Rozkładamy licznik z wzoru na różnicę kwadratów: $x^2-36=(x-6)(x+6)$.
**Krok 2:** Skracamy wspólny czynnik $x-6$, pamiętając o dziedzinie $x\ne6$: $\frac{x^2-36}{x-6}=x+6$.
**Krok 3:** Otrzymany dwumian to $x+6$, więc jego wyraz wolny wynosi $6$.
**Wynik:** $6$.

## 4. Typowe Pułapki i Błędy
Najgroźniejszy błąd to skracanie składników sumy, np. uznanie, że $\frac{x^2-36}{x-6}=x^2$ albo $x-6$. Skracać można tylko całe czynniki, dlatego najpierw trzeba rozłożyć licznik i mianownik. Nie wolno zapominać o dziedzinie: po skróceniu funkcja ma „dziurę” w punkcie wykluczonym, mimo że wzór wygląda na prostą. Przy odczytywaniu współczynnika zwróć uwagę, czy pytanie dotyczy wyrazu wolnego, współczynnika przy $x$, czy licznika ułamka.

## 5. Powiązane Tematy
- Wcześniej: [[matura-liczby-rownanie-iloczynowe]]
- Co dalej: [[matura-liczby-nierownosc-kwadratowa]]

## 6. Tryb szkolny
Najpierw wyznacz dziedzinę, czyli miejsca zerowe mianownika. Rozłóż licznik i mianownik na czynniki: szukaj różnicy kwadratów, różnicy sześcianów lub trójmianu z pierwiastkami. Skróć wspólne czynniki i zapisz wynik w najprostszej postaci. Na końcu odczytaj żądany współczynnik lub licznik. Sprawdź wynik, mnożąc go przez mianownik — powinien dać pierwotny licznik dla wszystkich $x$ z dziedziny.

## 7. Tryb Wizualny
Wykres funkcji $y=\frac{x^2-36}{x-6}$ wygląda jak prosta $y=x+6$, ale w punkcie $x=6$ ma „dziurę” — pojedynczy punkt nie należy do wykresu. Na wykresie zaznacz otwarte kółko w $(6,12)$. To pokazuje, dlaczego skrócenie zmienia wzór, ale nie zmienia dziedziny. Przy wyrażeniu $\frac{(x^2-25)(x+4)}{(x-5)(x^2-16)}$ po skróceniu zostaje ułamek $\frac{x+5}{x-4}$; pionowa asymptota w $x=4$ nadal jest widoczna, mimo uproszczenia.
