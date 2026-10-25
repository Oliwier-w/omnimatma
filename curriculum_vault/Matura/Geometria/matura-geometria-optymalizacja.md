---
id: matura-geometria-optymalizacja
tytul: "Optymalizacja pola bocznego walca"
poziom: liceum
dzial: "Matura · Geometria i dane"
wymagane_wczesniej: ['[[matura-geometria-statystyka]]']
generator_id: matura-geometria-optymalizacja
status: gotowe
minutes: 10
description: "Wyznaczanie promienia walca maksymalizującego pole powierzchni bocznej przy ustalonej sumie średnicy i wysokości."
formula: 'P_b=2\pi r(S-2r)'
---
# Optymalizacja pola bocznego walca

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wyobraź sobie, że z prostokątnego kawałka metalu zwijasz bok puszki. Średnica puszki i jej wysokość muszą razem dać ustaloną długość, więc jeśli zrobisz puszkę szerszą, będzie niższa, a jeśli węższą, będzie wyższa. Pole powierzchni bocznej zależy od obu tych wymiarów. Okazuje się, że największe pole otrzymamy wtedy, gdy promień jest równy jednej czwartej całej sumy średnicy i wysokości.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Rozważmy walec o promieniu podstawy $r$ i wysokości $h$. Średnica podstawy wynosi $d=2r$. Z warunku $d+h=S$ otrzymujemy:
$$h=S-2r$$
Pole powierzchni bocznej walca to $P_b=2\pi rh$, więc po podstawieniu wysokości:
$$P_b(r)=2\pi r(S-2r)=-4\pi r^2+2\pi Sr$$
Jest to funkcja kwadratowa zmiennej $r$ o ujemnym współczynniku przy $r^2$, czyli parabola z ramionami skierowanymi w dół. Jej maksimum leży w wierzchołku:
$$r=\frac{-2\pi S}{2\cdot(-4\pi)}=\frac{S}{4}$$
Dziedzina ma sens geometryczny, gdy $r>0$ oraz $h=S-2r>0$; promień musi być mniejszy od połowy $S$. Otrzymany promień $r=\frac S4$ leży w tej dziedzinie, a odpowiadająca mu wysokość wynosi $h=\frac S2$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Walec ma średnicę podstawy $d$ i wysokość $h$, przy czym $d+h=20$. Jaki promień maksymalizuje pole powierzchni bocznej?
**Krok 1:** Podstaw $d=2r$, więc $h=20-2r$ i $P_b=2\pi r(20-2r)$.
**Krok 2:** Wierzchołek paraboli $P_b=-4\pi r^2+40\pi r$ jest w $r=\frac{40\pi}{8\pi}=5$.
**Wynik:** $r=5$, wtedy $h=10$, a maksymalne pole boczne wynosi $2\pi\cdot5\cdot10=100\pi$.

## 4. Typowe Pułapki i Błędy
Częsty błąd to podstawienie $h=S-r$ zamiast $h=S-2r$, bo średnica to dwa promienie. Nie maksymalizuj samego promienia ani samej wysokości: optymalizujemy pole, czyli iloczyn $2\pi rh$. Po wyznaczeniu wierzchołka sprawdź, czy otrzymany promień należy do dziedziny i czy wysokość jest dodatnia. Pamiętaj, że współczynnik przy $r^2$ jest ujemny, więc wierzchołek daje maksimum, a nie minimum.

## 5. Powiązane Tematy
Wcześniej: [[matura-geometria-statystyka]].

## 6. Tryb szkolny
Zapisz zależność między średnicą, promieniem i wysokością: $d=2r$ oraz $h=S-2r$. Wstaw $h$ do wzoru na pole boczne i uporządkuj wyrażenie jako funkcję kwadratową zmiennej $r$. Odczytaj współczynniki $a$ i $b$, a następnie oblicz pierwszą współrzędną wierzchołka ze wzoru $r=-\frac{b}{2a}$. Sprawdź, czy wynik spełnia warunki geometryczne, i oblicz odpowiadającą mu wysokość.

## 7. Tryb wizualny
Narysuj wykres $P_b(r)$ jako parabolę otwartą w dół. Oś pozioma to promień, a pionowa to pole boczne. Zaznacz wierzchołek paraboli i zrzutuj go na oś promienia; otrzymasz $r=\frac S4$. Suwak zmieniający $r$ pokazuje, że przy zbyt małym promieniu walec jest bardzo wysoki, a przy zbyt dużym staje się płaski — w obu przypadkach pole boczne maleje.
