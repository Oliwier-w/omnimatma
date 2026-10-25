---
id: matrix-scale
tytul: Mnożenie macierzy przez skalar
poziom: studia
dzial: Macierze
wymagane_wczesniej: ['[[Element i wymiar macierzy]]']
generator_id: matrix-scale
status: gotowe
formula: '(\lambda A)_{ij}=\lambda a_{ij}'
---
# Mnożenie macierzy przez skalar
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Jeżeli przepis na ciasto zapisano w tabeli, podwojenie porcji podwaja każdą liczbę w tabeli. Skalar to pojedyncza liczba, nie kolejna tabela.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla $\lambda\in\mathbb R$ oraz $A\in\mathbb R^{m\times n}$ macierz $\lambda A$ ma wymiar $m\times n$. Mnożenie jest rozdzielne względem dodawania macierzy.
$$(\lambda A)_{ij}=\lambda a_{ij}$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Oblicz $-2\begin{pmatrix}1&-3\\0&4\end{pmatrix}$.
**Krok 1:** Pomnóż pierwszy wiersz: $(-2,6)$.
**Krok 2:** Pomnóż drugi wiersz: $(0,-8)$.
**Wynik:** $\begin{pmatrix}-2&6\\0&-8\end{pmatrix}$.
## 4. Typowe Pułapki i Błędy
Pomnóż wszystkie pola, nie tylko przekątną. To inne działanie niż mnożenie dwóch macierzy.
## 5. Powiązane Tematy
Wcześniej: [[Element i wymiar macierzy]]. Porównaj: [[Mnożenie macierzy]].
## 6. Tryb szkolny
Zachowaj rozmiar tabeli. Pomnóż każdy element przez skalar. Dla skalaru ujemnego sprawdź znaki, a dla zera otrzymasz macierz zerową.
## 7. Tryb wizualny
Traktuj kolumny jako wektory. Skalar 2 podwaja długość każdej kolumny; skalar $-1$ odwraca jej zwrot. Liczba wierszy i kolumn pozostaje stała.
