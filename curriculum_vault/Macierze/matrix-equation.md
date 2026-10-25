---
id: matrix-equation
tytul: Równanie macierzowe AX równe B
poziom: studia
dzial: Macierze
wymagane_wczesniej: ['[[Macierz odwrotna 2 na 2]]']
generator_id: matrix-equation
status: gotowe
formula: 'AX=B\implies X=A^{-1}B\quad(\det A\ne0)'
---
# Równanie macierzowe AX równe B
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Masz wynik działania maszyny $A$ i szukasz wejścia $X$. Gdy maszyna ma operację cofania, zastosuj ją do wyniku $B$.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Jeśli $A\in\mathbb R^{n\times n}$ jest odwracalna, $B\in\mathbb R^{n\times p}$, to równanie $AX=B$ ma dokładnie jedno rozwiązanie $X\in\mathbb R^{n\times p}$. Mnożymy z lewej przez $A^{-1}$. Dla osobnego równania $XA=B$ odwrotność mnożymy z prawej.
$$AX=B\implies X=A^{-1}B$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Rozwiąż $\begin{pmatrix}2&1\\1&1\end{pmatrix}X=\begin{pmatrix}5\\3\end{pmatrix}$.
**Krok 1:** Odwrotność $A$ to $\begin{pmatrix}1&-1\\-1&2\end{pmatrix}$.
**Krok 2:** $X=A^{-1}B=(5-3,-5+6)^T$.
**Wynik:** $X=(2,1)^T$. Kontrola: $AX=(5,3)^T$.
## 4. Typowe Pułapki i Błędy
Nie zapisuj „$B/A$”. Kolejność mnożenia ma znaczenie. Gdy $A$ jest osobliwa, równanie może mieć zero lub wiele rozwiązań; ten algorytm wtedy nie działa.
## 5. Powiązane Tematy
Wcześniej: [[Macierz odwrotna 2 na 2]]. Kontrola: [[Mnożenie macierzy]].
## 6. Tryb szkolny
Rozpoznaj, z której strony stoi znana macierz. Sprawdź wymiary i odwracalność. Dla $AX=B$ oblicz $A^{-1}B$. Podstaw wynik do pierwotnego równania.
## 7. Tryb wizualny
Traktuj kolumnę $X$ jako punkt, a $AX$ jako jego obraz. Znamy punkt docelowy $(5,3)$; odwrotne przekształcenie prowadzi do $(2,1)$.
