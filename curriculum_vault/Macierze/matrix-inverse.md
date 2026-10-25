---
id: matrix-inverse
tytul: Macierz odwrotna 2 na 2
poziom: studia
dzial: Macierze
wymagane_wczesniej: ['[[Wyznacznik macierzy 2 na 2]]', '[[Mnożenie macierzy]]', '[[Mnożenie macierzy przez skalar]]']
generator_id: matrix-inverse
status: gotowe
formula: 'A^{-1}=\frac1{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}'
---
# Macierz odwrotna 2 na 2
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Macierz może rozciągać i przesuwać kierunki siatki wokół początku. Macierz odwrotna cofa liniowe przekształcenie. Jeśli siatkę spłaszczono, nie da się jednoznacznie odtworzyć punktów.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Odwrotność kwadratowej macierzy $A$ spełnia $AA^{-1}=A^{-1}A=I$. Dla $A=\begin{pmatrix}a&b\\c&d\end{pmatrix}$ istnieje wtedy i tylko wtedy, gdy $ad-bc\ne0$.
$$A^{-1}=\frac1{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Odwróć $A=\begin{pmatrix}2&1\\1&1\end{pmatrix}$.
**Krok 1:** $\det A=2-1=1\ne0$.
**Krok 2:** Zamień miejsca elementów przekątnej i zmień znaki pozostałych.
**Wynik:** $A^{-1}=\begin{pmatrix}1&-1\\-1&2\end{pmatrix}$. Iloczyn $AA^{-1}$ to $I$.
## 4. Typowe Pułapki i Błędy
Nie odwracaj każdego elementu osobno. Dla zerowego wyznacznika nie dziel przez zero: odwrotność nie istnieje. Formuła jest tylko dla $2\times2$.
## 5. Powiązane Tematy
Wcześniej: [[Wyznacznik macierzy 2 na 2]], [[Mnożenie macierzy]], [[Mnożenie macierzy przez skalar]]. Dalej: [[Równanie macierzowe AX równe B]].
## 6. Tryb szkolny
Oblicz wyznacznik i sprawdź jego niezerowość. W macierzy $2\times2$ zamień elementy głównej przekątnej, zaneguj pozostałe i pomnóż całość przez odwrotność wyznacznika. Sprawdź przez mnożenie.
## 7. Tryb wizualny
Narysuj kwadrat jednostkowy, potem jego obraz przez $A$. Zastosowanie $A^{-1}$ do obrazu przywraca kwadrat. Przy wyznaczniku zero obraz nie ma pola, więc utraconego kierunku nie da się odzyskać.
