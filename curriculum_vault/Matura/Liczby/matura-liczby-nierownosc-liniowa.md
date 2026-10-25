---
id: matura-liczby-nierownosc-liniowa
tytul: "Nierówność liniowa i najmniejsza liczba całkowita"
poziom: liceum
dzial: "Matura · Liczby i algebra"
wymagane_wczesniej: ["[[matura-liczby-podzielnosc]]"]
generator_id: matura-liczby-nierownosc-liniowa
status: gotowe
minutes: 8
description: "Rozwiązywanie nierówności liniowej i wybieranie najmniejszej liczby całkowitej spełniającej warunek."
formula: 'ax+b\ge c\ \Longrightarrow\ x\ge\frac{c-b}{a}\quad(a>0)'
---

# Nierówność liniowa i najmniejsza liczba całkowita

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Nierówność liniowa to warunek typu „od pewnej liczby w górę” albo „do pewnej liczby w dół”. Jeśli $3x+5\ge20$, to po odjęciu $5$ mamy $3x\ge15$, czyli $x\ge5$. Rozwiązaniem jest cała półprosta od $5$ w prawo. Najmniejsza liczba całkowita w tej półprostej to $5$. Gdy nierówność jest ostra, koniec przedziału nie należy do rozwiązań, więc trzeba wybrać następną liczbę całkowitą.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Nierówność liniowa ma postać $ax+b\ge c$, $ax+b>c$, $ax+b\le c$ lub $ax+b$ jest mniejsze od $c$, gdzie $a\ne0$. Dodanie lub odjęcie tej samej liczby od obu stron nie zmienia zbioru rozwiązań. Mnożenie lub dzielenie przez liczbę dodatnią zachowuje znak nierówności, a przez liczbę ujemną — odwraca go:
$$a>0:\quad ax\ge d \Longleftrightarrow x\ge\frac da,$$
$$a<0:\quad ax\ge d \Longleftrightarrow x\le\frac da.$$
Dla $a>0$ zbiorem rozwiązań jest półprosta $[d/a,\infty)$ lub $(d/a,\infty)$. Najmniejsza liczba całkowita w takim zbiorze to odpowiednio $\lceil d/a\rceil$ lub $\lfloor d/a\rfloor+1$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Znajdź najmniejszą liczbę całkowitą spełniającą nierówność $3x-8>5$.
**Krok 1:** Dodajemy $8$ do obu stron: $3x>13$.
**Krok 2:** Dzielimy przez dodatnie $3$: $x>\frac{13}{3}=4\frac13$.
**Krok 3:** Najmniejsza liczba całkowita większa od $4\frac13$ to $5$.
**Wynik:** $5$.

## 4. Typowe Pułapki i Błędy
Najczęstszy błąd to odwrócenie znaku nierówności przy dzieleniu przez liczbę dodatnią — wtedy znak zostaje bez zmian. Odwracamy go tylko przy mnożeniu lub dzieleniu przez liczbę ujemną. Trzeba też odróżnić nierówność ostrą od nieostrej: dla $x>5$ liczba $5$ nie należy do rozwiązań, a dla $x\ge5$ należy. Przy wyniku ułamkowym nie zaokrąglaj „po swojemu”: dla warunku $x>4{,}2$ najmniejsza liczba całkowita to $5$, a dla $x\ge4{,}2$ również $5$, ale dla $x\ge4$ to $4$.

## 5. Powiązane Tematy
- Wcześniej: [[matura-liczby-podzielnosc]]
- Co dalej: [[matura-liczby-rownanie-iloczynowe]]

## 6. Tryb szkolny
Przenieś wszystkie wyrazy z $x$ na jedną stronę, a liczby na drugą. Zredukuj obie strony i podziel przez współczynnik przy $x$. Jeśli współczynnik jest ujemny, odwróć znak nierówności. Zapisz granicę jako ułamek, a następnie ustal, czy przedział jest domknięty, czy otwarty. Wybierz najmniejszą liczbę całkowitą: przy domkniętym końcu wystarczy zaokrąglenie w górę, przy otwartym trzeba przejść do kolejnej liczby. Sprawdź wynik, podstawiając go do pierwotnej nierówności.

## 7. Tryb wizualny
Na osi liczbowej zaznacz granicę, np. $4\frac13$. Przy nierówności $x>4\frac13$ rysujesz otwarte kółko i pogrubiasz część na prawo; przy $x\ge4\frac13$ kółko jest zamalowane. Najmniejsza liczba całkowita to pierwszy węzeł siatki całkowitej po prawej stronie kółka. Dla $4\frac13$ jest to $5$. Ta sama oś pozwala szybko sprawdzić, czy nie wybrano liczby spoza zaznaczonego zbioru.
