---
id: matura-geometria-prawdopodobienstwo
tytul: "Prawdopodobieństwo sumy oczek dwóch kostek"
poziom: liceum
dzial: "Matura · Geometria i dane"
wymagane_wczesniej: ['[[matura-geometria-ostroslup-krawedzie]]']
generator_id: matura-geometria-prawdopodobienstwo
status: gotowe
minutes: 8
description: "Obliczanie prawdopodobieństwa zdarzenia opisanego sumą oczek na dwóch kostkach."
formula: 'P(A)=\frac{|A|}{36}'
---
# Prawdopodobieństwo sumy oczek dwóch kostek

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Rzucasz czerwoną i niebieską kostką. To, że na jednej wypadnie $2$, a na drugiej $5$, to inny wynik niż $5$ i $2$, bo kostki są rozróżnialne. Wszystkich możliwych par jest więc $36$. Liczymy tylko te pary, w których suma oczek spełnia warunek z zadania, a potem dzielimy ich liczbę przez $36$.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Przestrzeń zdarzeń elementarnych dla dwóch rzutów sześcienną kostką ma $6\cdot6=36$ uporządkowanych wyników $(i,j)$, gdzie $i,j\in\{1,2,3,4,5,6\}$. Dla zdarzenia $A$ opisanego warunkiem na sumę oczek:
$$P(A)=\frac{|A|}{36}$$
Liczbę par o sumie równej $T$ można odczytać z tabeli: dla $T\in\{2,\dots,12\}$ wynosi ona $6-|T-7|$. Aby policzyć pary o sumie większej od $T$, dodajemy liczby par dla sum $T+1,T+2,\dots,12$. Otrzymany ułamek zawsze skracamy, a wynik musi należeć do przedziału od $0$ do $1$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Rzucamy dwiema kostkami. Oblicz prawdopodobieństwo, że suma oczek jest większa od $8$.
**Krok 1:** Interesują nas sumy $9,10,11,12$; odpowiada im kolejno $4,3,2,1$ par.
**Krok 2:** Liczba par sprzyjających to $4+3+2+1=10$, więc $P(A)=\frac{10}{36}$.
**Wynik:** $P(A)=\frac{5}{18}$ po skróceniu przez $2$.

## 4. Typowe Pułapki i Błędy
Nie traktuj par $(2,5)$ i $(5,2)$ jako jednego wyniku, bo kostki są rozróżnialne i takich par jest $36$. Uważaj na różnicę między „większa od $8$” a „co najmniej $8$”: pierwsze oznacza sumy $9$ i więcej, drugie dołącza sumę $8$. Nie zostawiaj ułamka nieskróconego, jeśli polecenie wymaga wyniku w najprostszej postaci.

## 5. Powiązane Tematy
Wcześniej: [[matura-geometria-ostroslup-krawedzie]]. Dalej: [[matura-geometria-statystyka]].

## 6. Tryb szkolny
Wypisz w tabeli $6$ na $6$ wszystkie pary i ich sumy albo skorzystaj z gotowych liczebności przekątnych. Zaznacz komórki spełniające warunek i policz je. Zapisz prawdopodobieństwo jako liczbę zaznaczonych komórek przez $36$. Skróć ułamek przez największy wspólny dzielnik i sprawdź, czy wynik jest dodatni i mniejszy od $1$.

## 7. Tryb wizualny
Narysuj kwadratową tablicę $6\times6$: wiersze to wynik pierwszej kostki, kolumny drugiej. W każdej komórce wpisz sumę. Komórki o tej samej sumie tworzą ukośne pasy. Warunek „suma większa od $T$” zaznacza wszystkie komórki po jednej stronie odpowiedniego pasa, więc liczenie par zamienia się w liczenie kratek.
