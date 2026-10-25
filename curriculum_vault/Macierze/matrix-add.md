---
id: matrix-add
tytul: Dodawanie macierzy
poziom: studia
dzial: Macierze
wymagane_wczesniej: ['[[Element i wymiar macierzy]]']
generator_id: matrix-add
status: gotowe
formula: '(A+B)_{ij}=a_{ij}+b_{ij}'
---
# Dodawanie macierzy
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Dwie tabele pokazują sprzedaż rano i wieczorem. Aby dostać sumę dnia, dodajesz liczby w tych samych polach, nie mieszasz produktów ani sklepów.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla $A,B\in\mathbb R^{m\times n}$ suma ma ten sam wymiar i elementy będące sumami odpowiadających elementów. Działanie jest przemienne i łączne.
$$(A+B)_{ij}=a_{ij}+b_{ij}$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Dodaj $A=\begin{pmatrix}1&-2\\3&4\end{pmatrix}$ i $B=\begin{pmatrix}5&2\\-1&6\end{pmatrix}$.
**Krok 1:** Obie mają wymiar $2\times2$.
**Krok 2:** Policz $1+5$, $-2+2$, $3-1$, $4+6$.
**Wynik:** $\begin{pmatrix}6&0\\2&10\end{pmatrix}$.
## 4. Typowe Pułapki i Błędy
Nie dodawaj macierzy o różnych wymiarach. Nie sumuj wszystkich pól do jednej liczby.
## 5. Powiązane Tematy
Wcześniej: [[Element i wymiar macierzy]]. Dalej: [[Odejmowanie macierzy]].
## 6. Tryb szkolny
Porównaj oba wymiary. Przygotuj pustą tabelę tego samego rozmiaru. W każdej pozycji wpisz sumę liczb z tej samej pozycji w danych.
## 7. Tryb wizualny
Nałóż dwie przezroczyste siatki jednakowego rozmiaru. Każda para nakładających się pól daje jedno pole wyniku. Kolor może wskazywać dodatnią lub ujemną sumę.
