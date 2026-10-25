---
id: matura-liczby-wzory-skrocone
tytul: "Wzory skróconego mnożenia z π i √2"
poziom: liceum
dzial: "Matura · Liczby i algebra"
wymagane_wczesniej: ["[[matura-liczby-logarytmy]]"]
generator_id: matura-liczby-wzory-skrocone
status: gotowe
minutes: 8
description: "Upraszczanie wyrażeń typu (a+b)^2-(a-b)^2 i obliczanie ich wartości dla a równego π lub √2."
formula: '(a+b)^2-(a-b)^2=4ab'
---

# Wzory skróconego mnożenia z π i √2

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wyobraź sobie kwadrat o boku $a+b$ i drugi, mniejszy, o boku $a-b$. Różnica ich pól wygląda na skomplikowaną, ale po rozłożeniu na prostokąty okazuje się równa czterem prostokątom o bokach $a$ i $b$. Dlatego całe wyrażenie można obliczyć bez podnoszenia $\pi$ do kwadratu — wystarczy pomnożyć $4ab$.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla dowolnych liczb rzeczywistych $a,b$ zachodzą wzory
$$(a+b)^2=a^2+2ab+b^2,\qquad (a-b)^2=a^2-2ab+b^2.$$
Odejmując stronami, otrzymujemy
$$(a+b)^2-(a-b)^2=4ab.$$
Przydatne są także
$$a^2-b^2=(a-b)(a+b),\qquad (a+b)^2+(a-b)^2=2a^2+2b^2.$$
W zadaniach maturalnych $a$ może być liczbą niewymierną, np. $\pi$ lub $\sqrt2$; traktujemy ją wtedy jak zwykły czynnik symboliczny.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Oblicz $(\pi+3)^2-(\pi-3)^2$.
**Krok 1:** Rozpoznajemy wzór $(a+b)^2-(a-b)^2=4ab$ dla $a=\pi$ i $b=3$.
**Krok 2:** Podstawiamy: $4\cdot\pi\cdot3=12\pi$.
**Krok 3:** Sprawdzamy przez rozwinięcie: $(\pi^2+6\pi+9)-(\pi^2-6\pi+9)=12\pi$.
**Wynik:** $12\pi$.

## 4. Typowe Pułapki i Błędy
Nie należy podstawiać przybliżenia $\pi\approx3{,}14$ na początku, bo łatwo wtedy zgubić dokładną postać wyniku. Częsty błąd to dodanie kwadratów zamiast ich odjęcia albo zgubienie podwojonego iloczynu $2ab$. Trzeba też uważać na znak przy drugim nawiasie: odejmowanie całego wyrażenia zmienia znaki wszystkich jego składników. Wynik z $\pi$ lub $\sqrt2$ zostawiamy w postaci dokładnej, chyba że polecenie wyraźnie prosi o przybliżenie.

## 5. Powiązane Tematy
- Wcześniej: [[matura-liczby-logarytmy]]
- Co dalej: [[matura-liczby-podzielnosc]]

## 6. Tryb szkolny
Najpierw sprawdź, czy wyrażenie pasuje do wzoru skróconego mnożenia. Rozwiń oba nawiasy albo skorzystaj od razu z gotowej różnicy $4ab$. Wykonaj mnożenie współczynników i pozostaw $\pi$ lub $\sqrt2$ w wyniku. Na końcu sprawdź, czy nie da się wyłączyć wspólnego czynnika; np. $12\pi$ jest już prostszą postacią niż $4\cdot3\cdot\pi$.

## 7. Tryb wizualny
Narysuj duży kwadrat o boku $a+b$ i wpisz w niego kwadrat $a-b$ tak, aby boki były równoległe. Obszar między nimi składa się z czterech prostokątów o wymiarach $a\times b$, co daje pole $4ab$. Gdy $a=\pi$, a $b=3$, każdy prostokąt ma pole $3\pi$, a cztery takie prostokąty mają $12\pi$. Rysunek pokazuje, dlaczego kwadraty $a^2$ i $b^2$ się redukują.
