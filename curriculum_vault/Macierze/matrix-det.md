---
id: matrix-det
tytul: Wyznacznik macierzy 2 na 2
poziom: studia
dzial: Macierze
wymagane_wczesniej: ['[[Element i wymiar macierzy]]']
generator_id: matrix-det
status: gotowe
formula: '\det\begin{pmatrix}a&b\\c&d\end{pmatrix}=ad-bc'
---
# Wyznacznik macierzy 2 na 2
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Dwie kolumny macierzy wyznaczają dwa boki równoległoboku. Wyznacznik mówi o jego polu i orientacji; zero oznacza, że kształt spłaszczył się do odcinka lub punktu.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla rzeczywistej macierzy kwadratowej stopnia 2 wyznacznik jest liczbą $ad-bc$. Wartość bezwzględna wyznacznika jest polem równoległoboku rozpiętego na kolumnach; znak opisuje orientację uporządkowanej pary kolumn.
$$\det\begin{pmatrix}a&b\\c&d\end{pmatrix}=ad-bc$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Oblicz wyznacznik $\begin{pmatrix}2&3\\1&4\end{pmatrix}$.
**Krok 1:** Iloczyn głównej przekątnej: $2\cdot4=8$.
**Krok 2:** Iloczyn drugiej przekątnej: $3\cdot1=3$.
**Wynik:** $8-3=5$.
## 4. Typowe Pułapki i Błędy
Odejmuj, nie dodawaj iloczynów. Wyznacznik może być ujemny. Ta formuła dotyczy tylko $2\times2$, a wyznacznik definiuje się tylko dla macierzy kwadratowych.
## 5. Powiązane Tematy
Wcześniej: [[Element i wymiar macierzy]]. Dalej: [[Macierz odwrotna 2 na 2]].
## 6. Tryb szkolny
Sprawdź wymiar $2\times2$. Oblicz iloczyny obu przekątnych. Od głównego odejmij drugi, zachowując znaki ujemnych liczb.
## 7. Tryb wizualny
Zaznacz kolumny $(2,1)$ i $(3,4)$ jako wektory ze wspólnego początku. Domknij równoległobok. Jego pole wynosi 5; zamiana kolumn zmienia znak, lecz nie pole.
