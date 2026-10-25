---
id: matura-funkcje-ciag-geometryczny
tytul: "Ciąg geometryczny — wyraz ogólny"
poziom: liceum
dzial: "Matura · Funkcje i ciągi"
wymagane_wczesniej: ['[[matura-funkcje-kwadratowa]]']
generator_id: matura-funkcje-ciag-geometryczny
status: gotowe
minutes: 7
description: "Obliczanie dowolnego wyrazu ciągu geometrycznego ze wzoru a_n = a_1 razy q do potęgi n-1."
formula: 'a_n=a_1q^{\,n-1}'
---
# Ciąg geometryczny — wyraz ogólny

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
W ciągu geometrycznym każdy następny wyraz powstaje przez pomnożenie poprzedniego przez tę samą liczbę $q$. To jak składanie kartki: po każdym złożeniu grubość zmienia się o ten sam czynnik. Aby dotrzeć do wyrazu numer $n$, zaczynamy od pierwszego wyrazu i mnożymy przez $q$ dokładnie $n-1$ razy, bo pierwszy wyraz już jest na miejscu numer jeden.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Ciąg $(a_n)$ nazywamy geometrycznym, gdy istnieje stała $q\ne0$ taka, że dla każdego $n\ge1$
$$a_{n+1}=a_n\cdot q.$$
Iloraz $q$ nazywamy ilorazem ciągu. Z definicji wynika wzór na wyraz ogólny:
$$a_n=a_1q^{\,n-1}.$$
Dla $q>0$ wszystkie wyrazy mają znak pierwszego wyrazu. Dla $q\lt0$ znaki wyrazów zmieniają się naprzemiennie. Jeżeli $q=\frac12$, to wyrazy maleją, ale pozostają dodatnie, gdy $a_1>0$. Przy $q=1$ ciąg jest stały, a przy $q=-1$ wyrazy przyjmują naprzemiennie dwie wartości.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** W ciągu geometrycznym $a_1=3$ oraz $q=-2$. Oblicz $a_6$.

**Krok 1:** Korzystamy ze wzoru $a_n=a_1q^{n-1}$ i podstawiamy $n=6$: $a_6=3\cdot(-2)^{6-1}$.

**Krok 2:** Obliczamy potęgę: $(-2)^5=-32$.

**Krok 3:** Mnożymy: $a_6=3\cdot(-32)=-96$.

**Wynik:** $a_6=-96$. Sprawdzenie: kolejne wyrazy to $3,-6,12,-24,48,-96$.

## 4. Typowe Pułapki i Błędy
Najczęściej myli się wykładnik: dla wyrazu $a_n$ mnożymy przez $q$ dokładnie $n-1$ razy, a nie $n$ razy. Przy ujemnym ilorazie trzeba koniecznie wziąć podstawę w nawias, bo $(-2)^4$ i $-2^4$ mają różne znaki. Uważaj na ułamki: $(\frac12)^3=\frac18$, a nie $\frac12\cdot3$. Nie dodawaj ilorazu do wyrazu i nie zakładaj, że kolejne wyrazy zawsze rosną; dla $0\lt q\lt1$ maleją, a dla $q\lt0$ zmieniają znak.

## 5. Powiązane Tematy
- Wymagane wcześniej: [[matura-funkcje-kwadratowa]]
- Co dalej: [[matura-funkcje-ciag-arytmetyczny]]

## 6. Tryb szkolny
1. Odczytaj pierwszy wyraz $a_1$, iloraz $q$ oraz numer szukanego wyrazu $n$.
2. Zapisz $a_n=a_1q^{n-1}$; nie podstawiaj $n$ zamiast $n-1$.
3. Oblicz potęgę, pamiętając o nawiasie przy ujemnej podstawie i o potęgowaniu ułamka.
4. Pomnóż wynik przez $a_1$ i uprość ułamek, jeśli jest taka potrzeba.
5. Sprawdź, czy znak i rząd wielkości wyniku pasują do znaku $q$ oraz do liczby kroków.

## 7. Tryb wizualny
Zaznacz wyrazy ciągu na osi liczbowej: każdy kolejny punkt powstaje przez rozciągnięcie lub odwrócenie poprzedniego względem zera o czynnik $|q|$. Dla $|q|>1$ punkty oddalają się od zera, dla $|q|\lt1$ zbliżają się do zera, a dla $q\lt0$ przeskakują na drugą stronę osi. Na wykresie punktów $(n,a_n)$ widać, że dla $q>0$ leżą one na jednej krzywej wykładniczej, a dla $q\lt0$ tworzą dwa naprzemienne ciągi.
