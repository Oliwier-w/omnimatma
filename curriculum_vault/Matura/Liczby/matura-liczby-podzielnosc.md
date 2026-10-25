---
id: matura-liczby-podzielnosc
tytul: "Dowodzenie podzielności dla nieparzystego n"
poziom: liceum
dzial: "Matura · Liczby i algebra"
wymagane_wczesniej: ["[[matura-liczby-wzory-skrocone]]"]
generator_id: matura-liczby-podzielnosc
status: gotowe
minutes: 10
description: "Uzasadnianie podzielności wyrażeń algebraicznych dla nieparzystych n i obliczanie konkretnego ilorazu."
formula: '\frac{3n^2+6n+15}{12}\in\mathbb{Z}\quad(n\text{ nieparzyste})'
---

# Dowodzenie podzielności dla nieparzystego n

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Gdy mówimy, że liczba jest podzielna przez $12$, mamy na myśli, że można ją rozłożyć na $12$ równych części bez reszty. Dowód polega na pokazaniu, że w wyrażeniu z literą $n$ zawsze ukrywa się czynnik $12$, niezależnie od tego, jaką nieparzystą liczbę wstawimy. Nie wystarczy sprawdzić kilku przykładów — trzeba pokazać, że struktura wyrażenia gwarantuje podzielność.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Mówimy, że liczba całkowita $d\ne0$ dzieli $a$, i piszemy $d\mid a$, gdy istnieje liczba całkowita $k$ taka, że $a=dk$. Każdą liczbę nieparzystą można zapisać jako
$$n=2k+1,\qquad k\in\mathbb{Z}.$$
Wtedy $n+1=2(k+1)$ jest parzysta, a $n-1=2k$ również jest parzysta. Jeśli $d_1\mid a$ i $d_2\mid a$ oraz $\gcd(d_1,d_2)=1$, to $d_1d_2\mid a$. Dla liczby pierwszej $p$ zachodzi twierdzenie Fermata $p\mid n^p-n$; w szczególności $n^5-n$ dzieli się przez $2$, $3$ i $5$. Kluczowe rozkłady:
$$n^3-n=(n-1)n(n+1),$$
$$n^5-n=n(n-1)(n+1)(n^2+1),$$
$$3n^2+6n+15=3\left((n+1)^2+4\right),$$
$$n^4-1=(n-1)(n+1)(n^2+1).$$

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Uzasadnij, że dla każdej nieparzystej liczby całkowitej $n$ liczba $3n^2+6n+15$ jest podzielna przez $12$, a następnie oblicz iloraz dla $n=5$.
**Krok 1:** Wyłączamy $3$: $3n^2+6n+15=3(n^2+2n+5)=3\left((n+1)^2+4\right)$.
**Krok 2:** Dla nieparzystego $n$ liczba $n+1$ jest parzysta, więc $(n+1)^2$ dzieli się przez $4$. Także $4$ dzieli się przez $4$, więc $(n+1)^2+4$ dzieli się przez $4$.
**Krok 3:** Iloczyn liczby podzielnej przez $3$ i liczby podzielnej przez $4$ dzieli się przez $12$, bo $\gcd(3,4)=1$.
**Krok 4:** Dla $n=5$ mamy $(75+30+15)/12=120/12=10$.
**Wynik:** Wyrażenie jest podzielne przez $12$, a dla $n=5$ iloraz wynosi $10$.

## 4. Typowe Pułapki i Błędy
Sprawdzenie trzech przykładów nie jest dowodem — trzeba uzasadnić, że podzielność wynika z postaci wyrażenia dla dowolnego nieparzystego $n$. Częsty błąd to założenie, że jeśli liczba dzieli się przez $3$ i przez $4$, to automatycznie dzieli się przez $12$ bez sprawdzenia, że $3$ i $4$ są względnie pierwsze; tutaj na szczęście są. Nie wolno też mylić ilorazu z resztą: pytanie o iloraz wymaga wyniku dzielenia, a nie samej informacji „dzieli się”. Przy podstawianiu konkretnego $n$ trzeba pilnować kolejności działań i znaku.

## 5. Powiązane Tematy
- Wcześniej: [[matura-liczby-wzory-skrocone]]
- Co dalej: [[matura-liczby-nierownosc-liniowa]]

## 6. Tryb szkolny
Zapisz $n=2k+1$ lub od razu korzystaj z parzystości $n-1$ i $n+1$. Rozłóż wyrażenie na czynniki i wskaż, które z nich są podzielne przez potrzebne liczby. Jeśli dzielnik jest złożony, rozbij go na czynniki względnie pierwsze i uzasadnij każdy osobno. Na końcu podstaw podane $n$, wykonaj działania i podaj iloraz. Sprawdź wynik, mnożąc go przez dzielnik — powinno wrócić pierwotne wyrażenie.

## 7. Tryb Wizualny
Zbuduj tabelę dla kilku nieparzystych $n$: w kolumnach umieść $n$, $n-1$, $n+1$, $(n+1)^2+4$ oraz iloraz. Dla $n=1,3,5,7$ widać, że drugi i trzeci czynnik są parzyste, a wyrażenie w nawiasie dzieli się przez $4$. Drzewo czynników pokazuje, jak $12$ rozpada się na $3$ i $4$, a $240$ na $16$, $3$ i $5$. Tabela nie zastępuje dowodu, ale pomaga zobaczyć, skąd biorą się czynniki.
