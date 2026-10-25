---
id: matura-liczby-potegi
tytul: "Potęgi o wykładnikach ujemnych i ułamkowych"
poziom: liceum
dzial: "Matura · Liczby i algebra"
wymagane_wczesniej: ["[[matura-liczby-pierwiastki]]"]
generator_id: matura-liczby-potegi
status: gotowe
minutes: 9
description: "Stosowanie praw działań na potęgach, w tym wykładników ujemnych i ułamkowych, oraz porządkowanie wyniku."
formula: 'a^{-n}=\frac{1}{a^n}'
---

# Potęgi o wykładnikach ujemnych i ułamkowych

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Potęga dodatnia mówi, ile razy mnożymy podstawę przez siebie: $2^3=2\cdot2\cdot2$. Potęga ujemna nie oznacza liczby ujemnej — oznacza odwrotność: $2^{-3}=1/8$. Wykładnik ułamkowy, np. $1/2$, oznacza pierwiastek: $9^{1/2}=3$. Można to traktować jak dwie różne instrukcje: „odwróć” oraz „wyciągnij pierwiastek”.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla $a\ne0$ i całkowitego $n$ przyjmujemy
$$a^{-n}=\frac{1}{a^n},\qquad a^0=1.$$
Dla $a>0$, liczb całkowitych $m,n$ i $n>0$ określamy
$$a^{m/n}=\sqrt[n]{a^m}=\left(\sqrt[n]{a}\right)^m.$$
Obowiązują prawa
$$a^m\cdot a^n=a^{m+n},\qquad \frac{a^m}{a^n}=a^{m-n},\qquad (a^m)^n=a^{mn},\qquad (ab)^n=a^n b^n.$$
Dla ułamka $\left(\frac ab\right)^{-n}=\left(\frac ba\right)^n$, gdzie $a,b\ne0$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Oblicz $\left(27^{2/3}\cdot 4^{-1}\right)$.
**Krok 1:** Zamieniamy wykładnik ułamkowy: $27^{2/3}=(27^{1/3})^2=3^2=9$.
**Krok 2:** Wykładnik ujemny zamieniamy na odwrotność: $4^{-1}=1/4$.
**Krok 3:** Mnożymy: $9\cdot\frac14=\frac94$.
**Wynik:** $\frac94$.

## 4. Typowe Pułapki i Błędy
Nie należy dodawać wykładników przy mnożeniu różnych podstaw ani mnożyć podstaw, gdy wykładniki są różne. Częsty błąd to uznanie $2^{-3}$ za liczbę ujemną; tymczasem wynik jest dodatni i równy $1/8$. Przy wykładniku ułamkowym trzeba uważać na kolejność: $a^{m/n}$ to najpierw pierwiastek, potem potęga, ale dla $a>0$ obie kolejności dają ten sam wynik. Nie wolno też stosować wzoru na pierwiastek z liczby ujemnej przy parzystym mianowniku wykładnika.

## 5. Powiązane Tematy
- Wcześniej: [[matura-liczby-pierwiastki]]
- Co dalej: [[matura-liczby-logarytmy]]

## 6. Tryb szkolny
Zapisz każdą potęgę w jednej postaci: dodatniej, ujemnej lub ułamkowej. Zamień wykładniki ujemne na odwrotności, a ułamkowe na pierwiastki. Sprowadź czynniki do tej samej podstawy, jeśli to możliwe, i połącz wykładniki zgodnie z prawami działań. Na końcu wykonaj potęgowanie liczb i skróć ułamek. Sprawdź wynik, podstawiając przybliżoną wartość albo porównując rząd wielkości z czynnikami.

## 7. Tryb wizualny
Na wykresie funkcji $y=2^x$ widać, że dla $x=3$ wartość wynosi $8$, a dla $x=-3$ — $\frac18$. Ujemny wykładnik przesuwa punkt na lewą stronę osi, ale wykres pozostaje nad osią $OX$, więc wynik jest dodatni. Wykładnik ułamkowy $1/2$ odpowiada punktowi, w którym $2^x=\sqrt2$; to około $1{,}41$. Oś pozioma reprezentuje wykładnik, a oś pionowa wartość potęgi — to pomaga odróżnić wykładnik od wyniku.
