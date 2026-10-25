---
id: matrix-multiply
tytul: Mnożenie macierzy
poziom: studia
dzial: Macierze
wymagane_wczesniej: ['[[Element i wymiar macierzy]]']
generator_id: matrix-multiply
status: gotowe
formula: '(AB)_{ij}=\sum_{k=1}^{n}a_{ik}b_{kj}'
---
# Mnożenie macierzy
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wiersz z liczbą kupionych produktów spotyka kolumnę z cenami. Mnożysz każdą ilość przez cenę, a potem dodajesz: otrzymujesz jeden koszt.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla $A\in\mathbb R^{m\times n}$ i $B\in\mathbb R^{n\times p}$ iloczyn $AB$ ma wymiar $m\times p$. Liczba kolumn $A$ musi równać się liczbie wierszy $B$. Zwykle $AB\ne BA$.
$$(AB)_{ij}=\sum_{k=1}^{n}a_{ik}b_{kj}$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Pomnóż $A=\begin{pmatrix}1&2\\0&3\end{pmatrix}$ przez $B=\begin{pmatrix}4&1\\5&2\end{pmatrix}$.
**Krok 1:** Pierwszy wiersz wyniku: $(1\cdot4+2\cdot5,1\cdot1+2\cdot2)=(14,5)$.
**Krok 2:** Drugi wiersz: $(0\cdot4+3\cdot5,0\cdot1+3\cdot2)=(15,6)$.
**Wynik:** $\begin{pmatrix}14&5\\15&6\end{pmatrix}$.
## 4. Typowe Pułapki i Błędy
Nie mnożymy pól element po elemencie. Nie zmieniaj kolejności czynników. Nawet gdy $AB$ istnieje, $BA$ może nie istnieć.
## 5. Powiązane Tematy
Wcześniej: [[Element i wymiar macierzy]]. Dalej: [[Macierz odwrotna 2 na 2]].
## 6. Tryb szkolny
Sprawdź wymiary wewnętrzne. Wybierz wiersz z lewej macierzy i kolumnę z prawej. Pomnóż odpowiadające liczby i zsumuj. Powtórz dla każdej pozycji wyniku.
## 7. Tryb wizualny
Podświetl jeden wiersz $A$ i jedną kolumnę $B$. Połącz odpowiadające elementy parami. Ich iloczyny zbierz w jednym polu wyniku na przecięciu wybranego wiersza i kolumny.
