---
id: matrix-transpose
tytul: Transpozycja macierzy
poziom: studia
dzial: Macierze
wymagane_wczesniej: ['[[Element i wymiar macierzy]]']
generator_id: matrix-transpose
status: gotowe
formula: '(A^{T})_{ij}=a_{ji}'
---
# Transpozycja macierzy
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Zamień role wierszy i kolumn w tabeli: lista ocen jednego ucznia ułożona poziomo stanie się pionowa. Żadna liczba nie znika.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Jeśli $A\in\mathbb R^{m\times n}$, to $A^T\in\mathbb R^{n\times m}$. Transpozycja zamienia indeksy; dwukrotna transpozycja daje $A$.
$$(A^T)_{ij}=a_{ji}$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Transponuj $A=\begin{pmatrix}1&2&3\\4&5&6\end{pmatrix}$.
**Krok 1:** Pierwszy wiersz staje się kolumną $(1,2,3)^T$.
**Krok 2:** Drugi wiersz staje się kolumną $(4,5,6)^T$.
**Wynik:** $A^T=\begin{pmatrix}1&4\\2&5\\3&6\end{pmatrix}$.
## 4. Typowe Pułapki i Błędy
Transpozycja nie jest obrotem o $90^\circ$. Dla macierzy zespolonych zwykła transpozycja nie zmienia znaków części urojonych.
## 5. Powiązane Tematy
Wcześniej: [[Element i wymiar macierzy]]. Dalej: [[Mnożenie macierzy]].
## 6. Tryb szkolny
Zamień wymiary miejscami. Przepisuj kolejne wiersze jako kolejne kolumny. Kontrolnie sprawdź, że element o indeksie $(i,j)$ trafił na $(j,i)$.
## 7. Tryb wizualny
Dla kwadratowej siatki odbij pola względem głównej przekątnej. Pola przekątnej pozostają na miejscu. Dla prostokątnej siatki ta sama zamiana współrzędnych zmienia jej kształt.
