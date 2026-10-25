---
id: matura-geometria-podobienstwo
tytul: "Trójkąty podobne i skala obwodów"
poziom: liceum
dzial: "Matura · Geometria i dane"
wymagane_wczesniej: []
generator_id: matura-geometria-podobienstwo
status: gotowe
minutes: 8
description: "Obliczanie boku trójkąta podobnego na podstawie obwodu i skali podobieństwa."
formula: '\frac{P_{DEF}}{P_{ABC}}=k'
---
# Trójkąty podobne i skala obwodów

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wyobraź sobie, że masz mały trójkątny ludzik i powiększasz go na kopiarce. Wszystkie boki rosną tyle samo razy, więc także obwód rośnie właśnie tyle razy. Jeśli obwód większego trójkąta jest trzy razy dłuższy, to każdy jego bok też jest trzy razy dłuższy od odpowiedniego boku mniejszego trójkąta.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dwa trójkąty są podobne, gdy ich odpowiednie kąty są równe, a stosunki długości odpowiednich boków są jednakowe. Liczbę $k>0$ nazywamy skalą podobieństwa; spełnia ona zależność $k=\frac{a'}{a}=\frac{b'}{b}=\frac{c'}{c}$.

Dla obwodów zachodzi ta sama proporcja, ponieważ każdy składnik sumy mnożymy przez $k$:
$$\frac{P_{DEF}}{P_{ABC}}=k$$
Pole zmienia się inaczej: stosunek pól jest równy $k^2$, więc nie należy mieszać skali obwodu ze skalą pola.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Boki trójkąta ABC mają długości $3$, $4$ i $5$, a obwód podobnego trójkąta DEF jest równy $36$. Oblicz długość najkrótszego boku trójkąta DEF.
**Krok 1:** Obwód trójkąta ABC wynosi $3+4+5=12$, więc skala podobieństwa to $k=\frac{36}{12}=3$.
**Krok 2:** Najkrótszy bok ABC ma długość $3$; odpowiada mu najkrótszy bok DEF, czyli $3\cdot3=9$.
**Wynik:** Najkrótszy bok trójkąta DEF ma długość $9$.

## 4. Typowe Pułapki i Błędy
Najczęstszy błąd to porównanie obwodu z polem i użycie skali $k^2$ zamiast $k$. Trzeba też pilnować, który bok jest najkrótszy: w trójkącie podobnym kolejność długości boków się zachowuje, więc najkrótszemu bokowi pierwszego trójkąta odpowiada najkrótszy bok drugiego.

## 5. Powiązane Tematy
Dalej: [[matura-geometria-prosta]].

## 6. Tryb szkolny
Najpierw dodaj długości boków mniejszego trójkąta i zapisz jego obwód. Podziel podany obwód większego trójkąta przez obwód mniejszego; otrzymasz skalę $k$. Następnie znajdź najkrótszy bok w pierwszym trójkącie i pomnóż go przez $k$. Na końcu sprawdź, czy wynik jest mniejszy od obwodu większego trójkąta i czy wszystkie boki zwiększyły się w tej samej proporcji.

## 7. Tryb wizualny
Narysuj dwa trójkąty na kratkach: mniejszy o bokach $3,4,5$ i większy, którego każdy bok jest trzy razy dłuższy. Zaznacz kolorami odpowiadające sobie boki. Obwód większej figury to trzy obwody mniejszej, a najkrótszy bok wydłuża się z $3$ do $9$. Suwak skali $k$ pokazuje, że obwód zmienia się liniowo, natomiast pole rośnie kwadratowo.
