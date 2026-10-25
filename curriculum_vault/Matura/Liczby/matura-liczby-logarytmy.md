---
id: matura-liczby-logarytmy
tytul: "Logarytmy i działania na nich"
poziom: liceum
dzial: "Matura · Liczby i algebra"
wymagane_wczesniej: ["[[matura-liczby-potegi]]"]
generator_id: matura-liczby-logarytmy
status: gotowe
minutes: 9
description: "Obliczanie sum i różnic logarytmów o tej samej podstawie przez zamianę na wykładniki."
formula: '\log_a(xy)=\log_a x+\log_a y'
---

# Logarytmy i działania na nich

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Logarytm odpowiada na pytanie: „Do jakiej potęgi trzeba podnieść podstawę, żeby dostać daną liczbę?”. Na przykład $\log_2 8=3$, bo $2^3=8$. Logarytm jest więc odwrotnością potęgowania, podobnie jak pierwiastkowanie. Suma logarytmów o tej samej podstawie odpowiada mnożeniu liczb, a różnica — dzieleniu.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla $a>0$, $a\ne1$ i $x>0$ definiujemy
$$\log_a x=y \quad\Longleftrightarrow\quad a^y=x.$$
Podstawowe prawa dla dodatnich $x,y$ to
$$\log_a(xy)=\log_a x+\log_a y,\qquad \log_a\frac xy=\log_a x-\log_a y,$$
$$\log_a x^k=k\log_a x,\qquad \log_a a^k=k,\qquad \log_a\sqrt[n]{a}=\frac1n.$$
Logarytm jest określony tylko dla dodatniej liczby logarytmowanej. W zadaniach maturalnych często występuje ta sama podstawa we wszystkich składnikach; wtedy wystarczy dodawać i odejmować wykładniki.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Oblicz $\log_3\frac19+\log_3 81-\log_3\sqrt3$.
**Krok 1:** $\frac19=3^{-2}$, więc $\log_3\frac19=-2$.
**Krok 2:** $81=3^4$, więc $\log_3 81=4$; ponadto $\sqrt3=3^{1/2}$, więc $\log_3\sqrt3=\frac12$.
**Krok 3:** Wykonujemy działania: $-2+4-\frac12=\frac32$.
**Wynik:** $\frac32$.

## 4. Typowe Pułapki i Błędy
Nie wolno logarytmować liczby niedodatniej ani używać podstawy $1$. Częsty błąd to dodawanie liczb logarytmowanych zamiast wykładników: $\log_2 4+\log_2 8$ to $2+3=5$, a nie $\log_2 12$. Przy różnicy trzeba uważać na kolejność: $\log_a x-\log_a y$ odpowiada ilorazowi $x/y$, nie $y/x$. Warto też pamiętać, że $\log_a 1=0$ i $\log_a a=1$.

## 5. Powiązane Tematy
- Wcześniej: [[matura-liczby-potegi]]
- Co dalej: [[matura-liczby-wzory-skrocone]]

## 6. Tryb szkolny
Sprawdź, czy wszystkie logarytmy mają tę samą podstawę i czy liczby logarytmowane są dodatnie. Zamień każdą liczbę na potęgę podstawy, np. $25=5^2$, a następnie odczytaj wykładnik. Dodaj wykładniki przy sumie logarytmów i odejmij przy różnicy. Na końcu wykonaj działania na liczbach całkowitych lub ułamkach i sprawdź wynik, podstawiając go do definicji logarytmu.

## 7. Tryb wizualny
Na wykresie $y=\log_2 x$ punkt $(8,3)$ oznacza, że $\log_2 8=3$. Gdy $x$ rośnie od $1$ do $8$, wartość rośnie od $0$ do $3$, ale coraz wolniej. Suma logarytmów $\log_2 4+\log_2 8$ odpowiada przejściu od $x=1$ do $x=4$ i dalej do $x=32$; na wykresie widać, że wysokości się dodają. Różnica cofa nas w lewo, w stronę mniejszych ilorazów.
