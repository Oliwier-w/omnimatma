---
id: matrix-subtract
tytul: Odejmowanie macierzy
poziom: studia
dzial: Macierze
wymagane_wczesniej: ['[[Dodawanie macierzy]]']
generator_id: matrix-subtract
status: gotowe
formula: '(A-B)_{ij}=a_{ij}-b_{ij}'
---
# Odejmowanie macierzy
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Tabela planowanych wydatków minus tabela faktycznych wydatków pokazuje oszczędności w każdej kategorii osobno. Ujemne pole oznacza przekroczenie planu.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla macierzy $A,B$ tego samego wymiaru różnica jest sumą $A$ i macierzy przeciwnej do $B$. Odejmowanie nie jest przemienne.
$$(A-B)_{ij}=a_{ij}-b_{ij}$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Odejmij $(2,-3)$ od $(5,1)$, traktując je jako macierze $1\times2$.
**Krok 1:** Pierwsze pole: $5-2=3$.
**Krok 2:** Drugie pole: $1-(-3)=4$.
**Wynik:** $(3,4)$.
## 4. Typowe Pułapki i Błędy
Minus przed całą macierzą zmienia znak każdego elementu. Szczególnie uważaj na odejmowanie liczb ujemnych.
## 5. Powiązane Tematy
Wcześniej: [[Dodawanie macierzy]]. Związek: [[Mnożenie macierzy przez skalar]].
## 6. Tryb szkolny
Sprawdź zgodność wymiarów. Zachowaj kolejność $A-B$. W każdym polu odejmij element drugiej macierzy od elementu pierwszej. Sprawdź wynik przez dodanie $B$.
## 7. Tryb wizualny
Przedstaw każde pole jako skierowany słupek. Odjęcie dodatniego słupka obniża wynik, a odjęcie ujemnego podnosi go. Pola przetwarzaj niezależnie.
