---
id: matura-funkcje-trojkat-prostokatny
tytul: "Trójkąt prostokątny równoramienny — obwód"
poziom: liceum
dzial: "Matura · Funkcje i ciągi"
wymagane_wczesniej: ['[[matura-funkcje-trapez]]']
generator_id: matura-funkcje-trojkat-prostokatny
status: gotowe
minutes: 7
description: "Obliczanie obwodu trójkąta prostokątnego równoramiennego, gdy dana jest jego przeciwprostokątna."
formula: 'L=c\,(1+\sqrt2)'
---
# Trójkąt prostokątny równoramienny — obwód

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Trójkąt prostokątny równoramienny to połowa kwadratu przeciętego po przekątnej. Dwie przyprostokątne są jednakowe, a przeciwprostokątna jest dłuższa. Jeśli znamy przeciwprostokątną, możemy najpierw policzyć długość przyprostokątnej, a potem dodać wszystkie trzy boki, żeby otrzymać obwód.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
W trójkącie prostokątnym równoramiennym przyprostokątne mają długość $a$, a przeciwprostokątna długość $c$. Z twierdzenia Pitagorasa:
$$a^2+a^2=c^2,$$
czyli
$$2a^2=c^2.$$
Ponieważ $a>0$, otrzymujemy
$$a=\frac{c}{\sqrt2}=\frac{c\sqrt2}{2}.$$
Obwód wynosi więc
$$L=c+2a=c+\frac{2c}{\sqrt2}=c+c\sqrt2=c(1+\sqrt2).$$
Warto zapamiętać, że przyprostokątna jest $\sqrt2$ razy krótsza od przeciwprostokątnej. Jeżeli dana jest przyprostokątna $a$, to przeciwprostokątna ma długość $a\sqrt2$, a obwód $a(2+\sqrt2)$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Trójkąt prostokątny równoramienny ma przeciwprostokątną długości $8$. Oblicz jego obwód.

**Krok 1:** Z twierdzenia Pitagorasa $2a^2=8^2=64$, więc $a^2=32$ i $a=\sqrt{32}=4\sqrt2$.

**Krok 2:** Przyprostokątne mają po $4\sqrt2$, więc suma dwóch przyprostokątnych to $8\sqrt2$.

**Krok 3:** Dodajemy przeciwprostokątną: $L=8+8\sqrt2$.

**Wynik:** Obwód jest równy $8+8\sqrt2$. Postać przybliżona to około $19{,}31$, ale w zadaniu maturalnym zostawiamy wynik dokładny.

## 4. Typowe Pułapki i Błędy
Nie dodawaj tylko jednej przyprostokątnej: obwód obejmuje obie przyprostokątne i przeciwprostokątną. Nie zakładaj, że przeciwprostokątna jest równa przyprostokątnej pomnożonej przez $2$; poprawny stosunek to $\sqrt2$. Przy wyliczaniu $a$ z równania $2a^2=c^2$ pamiętaj o podzieleniu przez $2$ przed pierwiastkowaniem. Nie zamieniaj $c(1+\sqrt2)$ na $c\sqrt3$ ani nie zaokrąglaj wyniku, jeśli treść nie prosi o przybliżenie. Sprawdź, czy obwód jest większy od $2c$, bo dwie przyprostokątne razem dają $c\sqrt2>c$.

## 5. Powiązane Tematy
- Wymagane wcześniej: [[matura-funkcje-trapez]]
- Co dalej: samodzielne zadania powtórkowe z całego działu funkcji i ciągów.

## 6. Tryb szkolny
1. Oznacz przyprostokątne przez $a$, a przeciwprostokątną przez $c$.
2. Zapisz twierdzenie Pitagorasa $a^2+a^2=c^2$.
3. Wyznacz $a=\frac{c}{\sqrt2}$ i uprość pierwiastek, jeśli to możliwe.
4. Oblicz obwód $L=c+2a$ i doprowadź do postaci $c(1+\sqrt2)$.
5. Sprawdź, czy wynik ma sens: obwód musi być większy od $2c$ i mniejszy od $3c$.

## 7. Tryb wizualny
Narysuj kwadrat o boku $a$ i poprowadź przekątną. Powstają dwa przystające trójkąty prostokątne równoramienne. Przekątna kwadratu ma długość $a\sqrt2$, więc jeśli jest ona znana, bok kwadratu jest $\sqrt2$ razy krótszy. Obwód jednego z tych trójkątów to bok kwadratu plus bok kwadratu plus przekątna, czyli $2a+a\sqrt2$. Na rysunku widać też, dlaczego nie można po prostu dodać $c$ do $c$: dwie przyprostokątne są krótsze od przeciwprostokątnej.
