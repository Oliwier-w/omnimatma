---
id: matura-funkcje-kwadratowa
tytul: "Postać kanoniczna funkcji kwadratowej"
poziom: liceum
dzial: "Matura · Funkcje i ciągi"
wymagane_wczesniej: ['[[matura-funkcje-liniowa]]']
generator_id: matura-funkcje-kwadratowa
status: gotowe
minutes: 8
description: "Odczyt współczynnika c po rozwinięciu postaci kanonicznej oraz położenie wierzchołka paraboli."
formula: 'f(x)=a(x-h)^2+k,\quad c=ah^2+k'
---
# Postać kanoniczna funkcji kwadratowej

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Postać kanoniczna mówi, gdzie znajduje się wierzchołek paraboli. Liczba $h$ przesuwa parabolę w prawo lub w lewo, a $k$ podnosi ją lub opuszcza. Gdy chcemy poznać wyraz wolny $c$ zwykłej postaci $ax^2+bx+c$, wystarczy podstawić $x=0$: parabola przecina wtedy oś OY, a wysokość tego przecięcia to właśnie $c$.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Postać kanoniczna funkcji kwadratowej to
$$f(x)=a(x-h)^2+k,\qquad a\ne0.$$
Jej wierzchołek ma współrzędne $(h,k)$, a oś symetrii ma równanie $x=h$. Rozwijając kwadrat, otrzymujemy
$$f(x)=a(x^2-2hx+h^2)+k=ax^2-2ahx+ah^2+k.$$
Porównując z postacią ogólną $f(x)=ax^2+bx+c$, dostajemy
$$b=-2ah,\qquad c=ah^2+k.$$
Współczynnik $c$ jest więc wartością funkcji w zerze: $c=f(0)=a(0-h)^2+k$. Oś symetrii paraboli to prosta $x=h$, a nie $x=k$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Funkcja kwadratowa ma postać kanoniczną $f(x)=-2(x-3)^2+5$. Po rozwinięciu do postaci $f(x)=ax^2+bx+c$ wyznacz współczynnik $c$.

**Krok 1:** Rozwijamy kwadrat: $(x-3)^2=x^2-6x+9$.

**Krok 2:** Mnożymy przez $-2$ i dodajemy $5$: $f(x)=-2x^2+12x-18+5=-2x^2+12x-13$.

**Krok 3:** Odczytujemy wyraz wolny: $c=-13$. Ten sam wynik daje podstawienie $x=0$: $f(0)=-2\cdot(-3)^2+5=-18+5=-13$.

**Wynik:** $c=-13$, a osią symetrii paraboli jest prosta $x=3$.

## 4. Typowe Pułapki i Błędy
Najczęstszy błąd to zgubienie znaku przy $h$: w wyrażeniu $(x-h)^2$ wierzchołek ma współrzędną $x=h$, więc $(x+3)^2$ oznacza $h=-3$, a nie $h=3$. Pamiętaj, że $k$ nie jest wyrazem wolnym $c$; trzeba jeszcze dodać $ah^2$. Nie rozwijaj tylko kwadratu bez współczynnika $a$ i nie myl osi symetrii z wartością $k$. Przy ujemnym $a$ parabola ma ramiona skierowane w dół, ale $c$ nadal obliczasz tak samo.

## 5. Powiązane Tematy
- Wymagane wcześniej: [[matura-funkcje-liniowa]]
- Co dalej: [[matura-funkcje-ciag-geometryczny]]

## 6. Tryb szkolny
1. Odczytaj z postaci kanonicznej wartości $a$, $h$ oraz $k$.
2. Jeżeli pytają o $c$, podstaw $x=0$ do wzoru albo rozwiń kwadrat i uporządkuj wyrazy.
3. Oblicz $c=ah^2+k$, uważając na kwadrat liczby ujemnej.
4. Wyznacz $b=-2ah$, jeśli potrzebna jest pełna postać ogólna.
5. Sprawdź wynik, podstawiając $x=0$ do obu postaci funkcji.

## 7. Tryb wizualny
Narysuj parabolę o wierzchołku $(h,k)$. Przesunięcie $h$ zmienia położenie osi symetrii, a $k$ decyduje o wysokości wierzchołka. Punkt przecięcia z osią OY leży w $(0,c)$; jego wysokość można odczytać, idąc od wierzchołka o $|h|$ jednostek w bok i uwzględniając rozciągnięcie $a$. Gdy $a$ jest ujemne, ramiona paraboli skierowane są w dół, ale położenie punktu $(0,c)$ nadal wynika z tego samego wzoru.
