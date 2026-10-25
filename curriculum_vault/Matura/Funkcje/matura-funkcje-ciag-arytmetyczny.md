---
id: matura-funkcje-ciag-arytmetyczny
tytul: "Ciąg arytmetyczny — suma i średnia wyznaczają a1 i r"
poziom: liceum
dzial: "Matura · Funkcje i ciągi"
wymagane_wczesniej: ['[[matura-funkcje-ciag-geometryczny]]']
generator_id: matura-funkcje-ciag-arytmetyczny
status: gotowe
minutes: 9
description: "Rozwiązywanie układu równań z sumą pierwszych dziesięciu wyrazów i średnią wybranych wyrazów ciągu arytmetycznego."
formula: 'S_n=\frac n2\left(2a_1+(n-1)r\right),\quad a_n=a_1+(n-1)r'
---
# Ciąg arytmetyczny — suma i średnia wyznaczają a1 i r

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
W ciągu arytmetycznym idziesz po osi liczbowej stałymi krokami. Pierwszy wyraz to miejsce startu, a różnica $r$ to długość jednego kroku. Suma wielu wyrazów rozkłada się symetrycznie wokół ich średniej, dlatego znając sumę i średnią kilku wyrazów, możemy odtworzyć zarówno start, jak i długość kroku.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Ciąg $(a_n)$ jest arytmetyczny, gdy istnieje stała $r$ taka, że
$$a_{n+1}=a_n+r.$$
Wówczas
$$a_n=a_1+(n-1)r,$$
a suma $n$ początkowych wyrazów wynosi
$$S_n=\frac n2\left(2a_1+(n-1)r\right).$$
Dla $n=10$ otrzymujemy
$$S_{10}=5(2a_1+9r)=10a_1+45r.$$
Średnia wyrazów $a_1,a_7,a_8$ to
$$\frac{a_1+a_7+a_8}{3}
=\frac{a_1+(a_1+6r)+(a_1+7r)}{3}
=a_1+\frac{13r}{3}.$$
Dwie niezależne informacje o sumie i średniej dają układ dwóch równań liniowych z niewiadomymi $a_1$ i $r$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** W ciągu arytmetycznym $S_{10}=175$, a średnia wyrazów $a_1,a_7,a_8$ jest równa $17$. Wyznacz $a_1$ i $r$.

**Krok 1:** Zapisujemy sumę: $10a_1+45r=175$, czyli $2a_1+9r=35$.

**Krok 2:** Zapisujemy średnią: $a_1+\frac{13r}{3}=17$, czyli $3a_1+13r=51$.

**Krok 3:** Rozwiązujemy układ. Mnożymy pierwsze równanie przez $3$, a drugie przez $2$: $6a_1+27r=105$ oraz $6a_1+26r=102$. Odejmujemy stronami i otrzymujemy $r=3$. Wtedy $2a_1+9\cdot3=35$, więc $2a_1=8$ i $a_1=4$. Sprawdzenie: $S_{10}=40+135=175$ oraz $4+13=17$.

**Wynik:** $a_1=4$, $r=3$, czyli wektor $[4,3]$.

## 4. Typowe Pułapki i Błędy
Uważaj, żeby we wzorze na sumę nie użyć $n$ zamiast $n-1$ w wyrazie $a_n$. Średnia wyrazów $a_1,a_7,a_8$ nie jest średnią całego ciągu ani średnią pierwszych ośmiu wyrazów. Podstawiając do wzoru, pamiętaj, że $a_7=a_1+6r$, a $a_8=a_1+7r$. Często ginie współczynnik $\frac n2$ albo znak przy przenoszeniu wyrazów. Na końcu sprawdź oba warunki, bo jedno równanie może przypadkowo spełniać błędna para.

## 5. Powiązane Tematy
- Wymagane wcześniej: [[matura-funkcje-ciag-geometryczny]]
- Co dalej: [[matura-funkcje-ciag-trzywyrazowy]]

## 6. Tryb szkolny
1. Zapisz $a_7$ i $a_8$ za pomocą $a_1$ oraz $r$.
2. Ułóż równanie na sumę $S_{10}$ i równanie na średnią trzech wskazanych wyrazów.
3. Doprowadź oba równania do postaci liniowej i rozwiąż układ metodą podstawiania lub przeciwnych współczynników.
4. Zapisz odpowiedź w żądanej kolejności, np. jako wektor $[a_1,r]$.
5. Sprawdź, czy otrzymane $a_1$ i $r$ dają podaną sumę i średnią.

## 7. Tryb wizualny
Narysuj punkty $(n,a_n)$ ciągu arytmetycznego. Leżą one na jednej prostej o nachyleniu $r$; pierwszy punkt ma wysokość $a_1$. Suma $S_{10}$ jest związana z polem pod wykresem, a średnia wybranych wyrazów odpowiada przecięciu prostej z pionową osią w środku ich numerów. Zmiana $r$ obraca prostą, a zmiana $a_1$ przesuwa ją w górę lub w dół.
