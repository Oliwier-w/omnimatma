---
id: complex-equation
tytul: Równanie liniowe zespolone
poziom: studia
dzial: Liczby zespolone
wymagane_wczesniej: ['[[Dzielenie liczb zespolonych]]', '[[Odejmowanie liczb zespolonych]]']
generator_id: complex-equation
status: gotowe
formula: '\alpha z+\beta=\gamma\implies z=\frac{\gamma-\beta}{\alpha}\quad(\alpha\ne0)'
---
# Równanie liniowe zespolone
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Zagadkowa liczba przeszła przez dwie maszyny: mnożenie, a potem dodawanie. Cofnij czynności w odwrotnej kolejności: najpierw odejmij, potem podziel.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla $\alpha,\beta,\gamma\in\mathbb C$ i $\alpha\ne0$ równanie $\alpha z+\beta=\gamma$ ma dokładnie jedno rozwiązanie. Jeśli $\alpha=0$, ma wszystkie liczby zespolone jako rozwiązania dla $\beta=\gamma$, a w przeciwnym razie żadnego.
$$z=\frac{\gamma-\beta}{\alpha}\quad(\alpha\ne0)$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Rozwiąż $(1+i)z+2=4+2i$.
**Krok 1:** Odejmij 2: $(1+i)z=2+2i$.
**Krok 2:** Podziel przez niezerowe $1+i$: $z=(2+2i)/(1+i)$.
**Wynik:** $z=2$. Kontrola: $(1+i)\cdot2+2=4+2i$.
## 4. Typowe Pułapki i Błędy
Sprawdź niezerowość współczynnika przed dzieleniem. Wynik może być rzeczywisty. Równania z $\overline z$ nie są automatycznie tego samego typu; ta lekcja nie obejmuje równań wielomianowych.
## 5. Powiązane Tematy
Wcześniej: [[Dzielenie liczb zespolonych]], [[Odejmowanie liczb zespolonych]]. Kontrola: [[Mnożenie liczb zespolonych]].
## 6. Tryb szkolny
Wyizoluj składnik z $z$. Rozpatrz przypadek zerowego współczynnika. Przy niezerowym podziel, używając sprzężenia mianownika, jeżeli potrzeba. Podstaw odpowiedź do oryginalnego równania.
## 7. Tryb wizualny
Mnożenie przez $1+i$ obraca i skaluje wektor, a dodanie 2 przesuwa koniec w prawo. Cofając przesunięcie oraz obrót i skalę, z punktu $(4,2)$ wracasz do $(2,0)$.
