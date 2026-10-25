---
id: complex-divide
tytul: Dzielenie liczb zespolonych
poziom: studia
dzial: Liczby zespolone
wymagane_wczesniej: ['[[Sprzężenie liczby zespolonej]]']
generator_id: complex-divide
status: gotowe
formula: '\frac{a+bi}{c+di}=\frac{(a+bi)(c-di)}{c^2+d^2}'
---
# Dzielenie liczb zespolonych
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Sprzężenie jest pomocnikiem, który usuwa $i$ z mianownika. Pomnóż przez niego i górę, i dół, aby nie zmienić wartości liczby.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dzielenie przez $w=c+di$ jest dozwolone tylko dla $w\ne0$, czyli $(c,d)\ne(0,0)$. Wtedy $c^2+d^2>0$ i można rozszerzyć iloraz przez $\overline w$.
$$\frac{a+bi}{c+di}=\frac{(a+bi)(c-di)}{c^2+d^2}$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Oblicz $(3+i)/(1-i)$.
**Krok 1:** Pomnóż licznik i mianownik przez $1+i$.
**Krok 2:** Licznik: $(3+i)(1+i)=2+4i$; mianownik: $1^2+(-1)^2=2$.
**Wynik:** $1+2i$. Kontrola: $(1+2i)(1-i)=3+i$.
## 4. Typowe Pułapki i Błędy
Sprzęgamy mianownik, nie licznik. Nie dzielimy osobno części rzeczywistych i urojonych. Dzielenie przez zero jest zabronione.
## 5. Powiązane Tematy
Wcześniej: [[Sprzężenie liczby zespolonej]]. Dalej: [[Równanie liniowe zespolone]].
## 6. Tryb szkolny
Sprawdź niezerowość dzielnika. Rozszerz ułamek przez sprzężenie mianownika. Rozmnóż licznik, oblicz rzeczywisty mianownik i podziel przez niego obie części licznika.
## 7. Tryb wizualny
Mnożenie przez $1-i$ przekształca punkt $1+2i$ w $3+i$. Dzielenie przez $1-i$ cofa ten sam obrót i zmianę skali; początek nie może być dzielnikiem.
