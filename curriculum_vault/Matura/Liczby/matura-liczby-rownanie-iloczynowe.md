---
id: matura-liczby-rownanie-iloczynowe
tytul: "Równanie iloczynowe i suma rozwiązań"
poziom: liceum
dzial: "Matura · Liczby i algebra"
wymagane_wczesniej: ["[[matura-liczby-nierownosc-liniowa]]"]
generator_id: matura-liczby-rownanie-iloczynowe
status: gotowe
minutes: 8
description: "Rozwiązywanie równań w postaci iloczynu czynników liniowych i obliczanie sumy wszystkich pierwiastków."
formula: '(x-a)(bx-c)=0\ \Longleftrightarrow\ x=a\ \text{lub}\ x=\frac cb'
---

# Równanie iloczynowe i suma rozwiązań

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Jeśli iloczyn kilku liczb wynosi zero, to przynajmniej jedna z tych liczb musi być zerem. To jak mnożenie w sklepie: jeśli cały rachunek ma być zerowy, któryś składnik musi być darmowy. Dlatego równanie $(x-3)(x+5)=0$ rozwiązujemy, przyrównując każdy nawias do zera: $x=3$ albo $x=-5$. Gdy czynników jest więcej, po prostu zbieramy wszystkie rozwiązania i dodajemy je.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla liczb rzeczywistych $a_1,\dots,a_k$ zachodzi
$$a_1a_2\cdots a_k=0 \quad\Longleftrightarrow\quad a_1=0\ \text{lub}\ a_2=0\ \text{lub}\ \dots\ \text{lub}\ a_k=0.$$
Równanie w postaci iloczynowej rozwiązujemy, przyrównując każdy czynnik liniowy do zera. Czynnik $x-a$ daje rozwiązanie $x=a$, a czynnik $bx-c$ daje $x=c/b$ dla $b\ne0$. Suma rozwiązań to suma wszystkich otrzymanych liczb; dla równania kwadratowego $x^2-px+q=0$ można ją też odczytać ze wzoru Viète'a: $x_1+x_2=p$. Uważaj na znak przy czynniku $x+a$: daje on rozwiązanie $-a$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Oblicz sumę rozwiązań równania $(3x-5)(x+8)=0$.
**Krok 1:** Przyrównujemy pierwszy czynnik do zera: $3x-5=0$, więc $x=\frac53$.
**Krok 2:** Przyrównujemy drugi czynnik: $x+8=0$, więc $x=-8$.
**Krok 3:** Dodajemy rozwiązania: $\frac53+(-8)=\frac53-\frac{24}{3}=-\frac{19}{3}$.
**Wynik:** $-\frac{19}{3}$.

## 4. Typowe Pułapki i Błędy
Nie wystarczy odczytać liczb z nawiasów bez zmiany znaku: z $(x+5)$ wynika $x=-5$, a nie $x=5$. Przy czynniku z współczynnikiem, np. $(3x-5)$, rozwiązaniem jest $\frac53$, a nie $5$. Kolejny błąd to liczenie iloczynu rozwiązań zamiast ich sumy — polecenie wyraźnie mówi o sumie. Jeśli któryś pierwiastek się powtarza, trzeba ustalić, czy suma ma uwzględniać wielokrotność; w typowym zadaniu maturalnym czynniki są różne, ale warto to sprawdzić.

## 5. Powiązane Tematy
- Wcześniej: [[matura-liczby-nierownosc-liniowa]]
- Co dalej: [[matura-liczby-wyrazenia-wymierne]]

## 6. Tryb szkolny
Zapisz równanie jako iloczyn równy zero. Przyrównaj każdy czynnik do zera i rozwiąż otrzymane równania liniowe, pamiętając o znakach i współczynnikach. Zbierz wszystkie rozwiązania w jednym miejscu, usuń duplikaty tylko wtedy, gdy pytanie dotyczy różnych pierwiastków. Dodaj liczby, sprowadzając ułamki do wspólnego mianownika. Na końcu sprawdź, czy podstawienie każdego rozwiązania zeruje odpowiedni czynnik.

## 7. Tryb Wizualny
Wykres funkcji $y=(x-3)(x+5)$ przecina oś $OX$ w punktach $x=-5$ i $x=3$. Suma tych miejsc zerowych jest równa przesunięciu osi symetrii paraboli pomnożonemu przez $2$; w tym przykładzie oś symetrii to $x=-1$, a suma wynosi $-2$. Dla trzech czynników wykres przecina oś w trzech punktach, a suma ich współrzędnych zależy od znaków i współczynników. Zaznaczanie pierwiastków na osi pomaga nie pomylić sumy z iloczynem.
