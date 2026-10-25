---
id: matura-geometria-graniastoslup
tytul: "Objętość graniastosłupa sześciokątnego"
poziom: liceum
dzial: "Matura · Geometria i dane"
wymagane_wczesniej: ['[[matura-geometria-proste-rownolegle]]']
generator_id: matura-geometria-graniastoslup
status: gotowe
minutes: 9
description: "Obliczanie objętości graniastosłupa prawidłowego sześciokątnego o krawędzi a."
formula: 'V=\frac{3\sqrt{3}}{2}a^3'
---
# Objętość graniastosłupa sześciokątnego

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wyobraź sobie sześciokątne pudełko na ciastka, na przykład plastikową foremkę. Aby policzyć, ile do niego wchodzi, najpierw obliczamy pole sześciokątnego dna, a potem mnożymy je przez wysokość pudełka. Foremny sześciokąt można podzielić na sześć identycznych trójkątów równobocznych, więc jego pole jest sześć razy większe od pola jednego takiego trójkąta.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Graniastosłup prawidłowy sześciokątny ma w podstawie sześciokąt foremny, a jego krawędzie boczne są prostopadłe do podstaw. Pole sześciokąta foremnego o boku $a$ to suma pól sześciu trójkątów równobocznych:
$$P_p=6\cdot\frac{a^2\sqrt3}{4}=\frac{3\sqrt3}{2}a^2$$
Objętość graniastosłupa obliczamy jako iloczyn pola podstawy i wysokości $H$:
$$V=P_p\cdot H=\frac{3\sqrt3}{2}a^2H$$
Gdy wszystkie krawędzie bryły mają długość $a$, w szczególności $H=a$, otrzymujemy $V=\frac{3\sqrt3}{2}a^3$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Graniastosłup prawidłowy sześciokątny ma wszystkie krawędzie długości $2$. Oblicz jego objętość.
**Krok 1:** Pole podstawy to $6\cdot\frac{2^2\sqrt3}{4}=6\sqrt3$.
**Krok 2:** Wysokość jest równa $2$, więc $V=6\sqrt3\cdot2=12\sqrt3$.
**Wynik:** $V=12\sqrt3$, czyli około $20{,}78$ jednostki sześciennej.

## 4. Typowe Pułapki i Błędy
Nie używaj wzoru na pole sześciokąta jako $a^2\sqrt3$ bez współczynnika $6$, bo to pole tylko jednego z sześciu trójkątów. Pamiętaj o wysokości: samo pole podstawy to jeszcze nie objętość. Częsty błąd to podstawienie długości krótszej przekątnej lub apothemu zamiast boku $a$; w sześciokącie foremnym apothem ma długość $\frac{a\sqrt3}{2}$ i nie jest równe $a$.

## 5. Powiązane Tematy
Wcześniej: [[matura-geometria-proste-rownolegle]]. Dalej: [[matura-geometria-ostroslup-kat]].

## 6. Tryb szkolny
Ustal, czy w zadaniu podano tylko bok podstawy, czy również wysokość. Oblicz pole sześciokąta foremnego, dzieląc go na sześć trójkątów równobocznych i korzystając ze wzoru $P=\frac{a^2\sqrt3}{4}$ dla jednego z nich. Pomnóż otrzymane pole przez wysokość graniastosłupa. Jeśli wszystkie krawędzie są równe $a$, podstaw $H=a$ i uprość współczynnik przed pierwiastkiem.

## 7. Tryb wizualny
Narysuj sześciokąt foremny i poprowadź odcinki od środka do wszystkich wierzchołków. Powstanie sześć trójkątów równobocznych o boku $a$. Ich łączna powierzchnia to pole podstawy, a po przesunięciu tej figury w górę o wysokość $H$ otrzymujemy graniastosłup. Model z patyczków pokazuje, że zwiększenie boku $a$ zmienia objętość aż z trzecią potęgą.
