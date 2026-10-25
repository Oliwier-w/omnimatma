---
id: matura-liczby-uklad-rownan
tytul: "Układ równań w zadaniu z dwiema cenami"
poziom: liceum
dzial: "Matura · Liczby i algebra"
wymagane_wczesniej: ["[[matura-liczby-nierownosc-kwadratowa]]"]
generator_id: matura-liczby-uklad-rownan
status: gotowe
minutes: 10
description: "Tłumaczenie zadania tekstowego o dwóch cenach na układ równań i rozwiązywanie go metodą podstawiania lub wyznaczników."
formula: '\begin{cases}ax+by=e\\cx+dy=f\end{cases}'
---

# Układ równań w zadaniu z dwiema cenami

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wyobraź sobie, że kupujesz dwa rodzaje rzeczy i za każdym razem znasz tylko łączną kwotę. Pojedyncza informacja nie wystarcza, bo ceny mogą się różnie uzupełniać. Dwie różne kombinacje zakupów dają dwa równania, a ich wspólne rozwiązanie wskazuje obie ceny. To jak dwie wskazówki na mapie: dopiero przecięcie dwóch linii pokazuje konkretny punkt.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Układ dwóch równań liniowych z niewiadomymi $x,y$ ma postać
$$\begin{cases}ax+by=e\\cx+dy=f\end{cases}.$$
Jego wyznacznik główny to $W=ad-bc$. Jeśli $W\ne0$, układ ma dokładnie jedno rozwiązanie:
$$x=\frac{ed-fb}{W},\qquad y=\frac{af-ce}{W}.$$
Można też użyć metody podstawiania: z jednego równania wyznaczamy jedną zmienną i wstawiamy do drugiego. W zadaniu tekstowym $x$ i $y$ oznaczają ceny jednostkowe, a współczynniki — liczby kupionych rzeczy. Po rozwiązaniu trzeba sprawdzić, czy obie ceny są dodatnie i czy spełniają oba równania.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Za $4$ zeszyty i $3$ długopisy zapłacono $66$ zł. Za $2$ zeszyty i $4$ długopisy zapłacono $48$ zł. Ile kosztuje jeden zeszyt?
**Krok 1:** Oznaczamy cenę zeszytu przez $x$, a długopisu przez $y$. Powstaje układ $\begin{cases}4x+3y=66\\2x+4y=48\end{cases}$.
**Krok 2:** Mnożymy drugie równanie przez $2$: $4x+8y=96$, a następnie odejmujemy pierwsze: $5y=30$, więc $y=6$.
**Krok 3:** Podstawiamy $y=6$ do drugiego równania: $2x+24=48$, więc $2x=24$ i $x=12$.
**Krok 4:** Sprawdzamy: $4\cdot12+3\cdot6=66$ oraz $2\cdot12+4\cdot6=48$.
**Wynik:** Zeszyt kosztuje $12$ zł.

## 4. Typowe Pułapki i Błędy
Najczęstszy błąd to pomylenie, która cena odpowiada której zmiennej — warto od razu zapisać legendę „$x$ — zeszyt, $y$ — długopis”. Przy odejmowaniu równań trzeba pamiętać o znakach przy wszystkich wyrazach, nie tylko przy współczynniku, który chcemy wyeliminować. Jeśli wyznacznik $W=ad-bc$ jest równy zero, układ może nie mieć rozwiązania albo mieć ich nieskończenie wiele; w zadaniu z cenami zwykle oczekujemy jednoznacznego wyniku. Na końcu zawsze sprawdzaj oba równania, nie tylko jedno.

## 5. Powiązane Tematy
- Wcześniej: [[matura-liczby-nierownosc-kwadratowa]]

## 6. Tryb szkolny
Przeczytaj zadanie i ustal, co oznaczają dwie niewiadome. Zapisz dwa równania: każde zdanie z kwotą daje jedno równanie. Wybierz metodę podstawiania albo przeciwnych współczynników. Doprowadź układ do jednej niewiadomej, oblicz ją, a potem wstaw do jednego z równań. Sprawdź oba równania i sensowność wyniku: ceny powinny być dodatnie, a jednostki zgodne z treścią. Na końcu odpowiedz pełnym zdaniem na konkretne pytanie.

## 7. Tryb Wizualny
Każde równanie liniowe przedstawia prostą na płaszczyźnie $xOy$. Pierwsze równanie $4x+3y=66$ i drugie $2x+4y=48$ przecinają się w punkcie $(12,6)$, który jest jedynym rozwiązaniem. Gdy proste są równoległe, układ nie ma rozwiązania; gdy się pokrywają, rozwiązań jest nieskończenie wiele. Na wykresie można też odczytać, że zwiększanie ceny zeszytu przy stałej kwocie wymaga zmniejszenia ceny długopisu — to pomaga intuicyjnie kontrolować wynik.
