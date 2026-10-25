---
id: matrix-trace
tytul: Ślad macierzy
poziom: studia
dzial: Macierze
wymagane_wczesniej: ['[[Element i wymiar macierzy]]']
generator_id: matrix-trace
status: gotowe
formula: '\operatorname{tr}(A)=\sum_{i=1}^{n}a_{ii}'
---
# Ślad macierzy
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Idź po schodkach od lewego górnego do prawego dolnego rogu tabeli. Dodaj odwiedzone liczby: ta jedna suma to ślad.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla $A\in\mathbb R^{n\times n}$ ślad jest sumą elementów głównej przekątnej. Jest liniowy: $\operatorname{tr}(\lambda A+B)=\lambda\operatorname{tr}(A)+\operatorname{tr}(B)$ dla macierzy tego samego stopnia.
$$\operatorname{tr}(A)=\sum_{i=1}^{n}a_{ii}$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Oblicz ślad $\begin{pmatrix}2&7&0\\1&-3&5\\4&8&6\end{pmatrix}$.
**Krok 1:** Wybierz elementy $a_{11}=2$, $a_{22}=-3$, $a_{33}=6$.
**Krok 2:** Dodaj $2-3+6$.
**Wynik:** $\operatorname{tr}(A)=5$.
## 4. Typowe Pułapki i Błędy
Nie bierz drugiej przekątnej. Ślad nie jest wyznacznikiem: sumujemy, a nie mnożymy. W standardowej definicji używamy macierzy kwadratowej.
## 5. Powiązane Tematy
Wcześniej: [[Element i wymiar macierzy]]. Porównaj: [[Wyznacznik macierzy 2 na 2]].
## 6. Tryb szkolny
Sprawdź kwadratowość macierzy. Zaznacz tylko pola o równych indeksach. Dodaj ich wartości ze znakami. Wynik jest liczbą, nie macierzą.
## 7. Tryb wizualny
Na siatce rozświetl pola $(1,1),(2,2),\ldots,(n,n)$. Zmiana dowolnego innego pola nie zmienia śladu; zmiana pola przekątnej o 1 zwiększa ślad o 1.
