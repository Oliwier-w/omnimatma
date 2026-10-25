---
id: matrix-entry
tytul: Element i wymiar macierzy
poziom: studia
dzial: Macierze
wymagane_wczesniej: []
generator_id: matrix-entry
status: gotowe
formula: 'A=(a_{ij})\in\mathbb R^{m\times n}'
---
# Element i wymiar macierzy
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Macierz to tabela liczb, jak rozkład miejsc w kinie. Adres miejsca ma numer rzędu i numer fotela: najpierw wiersz, potem kolumna.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Macierz rzeczywista wymiaru $m\times n$ to prostokątna tablica $a_{ij}$, gdzie $1\le i\le m$, $1\le j\le n$, a $m,n$ są dodatnimi liczbami całkowitymi. Dwie macierze są równe, gdy mają te same wymiary i równe odpowiadające elementy.
$$A=(a_{ij})\in\mathbb R^{m\times n}$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Dla $A=\begin{pmatrix}2&5&7\\1&-3&4\end{pmatrix}$ odczytaj $a_{23}$.
**Krok 1:** Wybierz drugi wiersz: $(1,-3,4)$.
**Krok 2:** Wybierz jego trzeci element.
**Wynik:** $a_{23}=4$; wymiar $A$ to $2\times3$.
## 4. Typowe Pułapki i Błędy
Nie odwracaj kolejności indeksów. Liczba elementów $mn$ nie jest wymiarem macierzy. W notacji tej lekcji numeracja zaczyna się od 1.
## 5. Powiązane Tematy
Dalej: [[Dodawanie macierzy]], [[Transpozycja macierzy]].
## 6. Tryb szkolny
Policz poziome wiersze i pionowe kolumny. Zapisz wymiar w tej kolejności. Dla $a_{ij}$ znajdź przecięcie wiersza $i$ z kolumną $j$.
## 7. Tryb wizualny
Narysuj siatkę $2\times3$. Podświetl drugi wiersz i trzecią kolumnę. Ich jedno wspólne pole wskazuje $a_{23}$.
