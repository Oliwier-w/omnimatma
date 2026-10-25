---
id: matura-funkcje-liniowa
tytul: "Funkcja liniowa, przecięcie z osią OY i parametr m"
poziom: liceum
dzial: "Matura · Funkcje i ciągi"
wymagane_wczesniej: ['[[matura-funkcje-przedzialami]]']
generator_id: matura-funkcje-liniowa
status: gotowe
minutes: 8
description: "Wyznaczanie dodatniego parametru m z danego punktu przecięcia wykresu funkcji liniowej z osią OY."
formula: 'f(x)=ax+m^2+bm,\quad f(0)=m^2+bm'
---
# Funkcja liniowa, przecięcie z osią OY i parametr m

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Oś OY to pionowa oś na wykresie. Wszystkie punkty na tej osi mają pierwszą współrzędną równą zero. Dlatego miejsce przecięcia wykresu z osią OY odczytujemy, podstawiając do wzoru $x=0$. Gdy we wzorze pojawia się nieznany parametr $m$, otrzymujemy równanie, z którego można go wyliczyć.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Funkcja liniowa ma postać $f(x)=ax+b$, gdzie $a\ne0$. Jej wykres przecina oś OY w punkcie $(0,b)$, ponieważ $f(0)=b$. W zadaniu mamy
$$f(x)=ax+m^2+bm,$$
więc przecięcie z osią OY opisuje równanie
$$m^2+bm=y_0.$$
Po przeniesieniu na jedną stronę dostajemy równanie kwadratowe
$$m^2+bm-y_0=0.$$
Jego wyróżnik jest równy $\Delta=b^2+4y_0$, a rozwiązania mają postać
$$m=\frac{-b\pm\sqrt{b^2+4y_0}}{2}.$$
Jeżeli w treści proszą o dodatnie $m$, wybieramy tylko pierwiastek dodatni i sprawdzamy, czy spełnia pierwotne równanie.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Funkcja liniowa $f(x)=2x+m^2+3m$ przecina oś OY w punkcie $(0,10)$. Wyznacz dodatnią wartość $m$.

**Krok 1:** Podstawiamy $x=0$: $f(0)=m^2+3m$, więc $m^2+3m=10$.

**Krok 2:** Przekształcamy do równania $m^2+3m-10=0$ i rozkładamy: $(m+5)(m-2)=0$. Zatem $m=-5$ lub $m=2$.

**Krok 3:** Warunek mówi o dodatnim $m$, więc odrzucamy $-5$ i zostaje $m=2$.

**Wynik:** $m=2$. Sprawdzenie: $2^2+3\cdot2=4+6=10$, czyli punkt przecięcia to rzeczywiście $(0,10)$.

## 4. Typowe Pułapki i Błędy
Nie utożsamiaj współczynnika $a$ kierunkowego z wyrazem wolnym: o przecięciu z osią OY decyduje $f(0)$, a nie $a$. Pamiętaj, że równanie kwadratowe może mieć dwa pierwiastki i trzeba wybrać ten zgodny z warunkiem dodatniości. Częstym błędem jest zgubienie wyrazu $m^2$ albo potraktowanie $m^2+bm$ jako liczby bez rozwiązania równania. Zawsze podstaw wyliczone $m$ z powrotem do wzoru.

## 5. Powiązane Tematy
- Wymagane wcześniej: [[matura-funkcje-przedzialami]]
- Co dalej: [[matura-funkcje-kwadratowa]]

## 6. Tryb szkolny
1. Zapisz warunek $f(0)=y_0$, podstawiając $x=0$ do wzoru funkcji.
2. Uporządkuj otrzymane równanie kwadratowe względem $m$.
3. Oblicz wyróżnik i pierwiastki albo rozłóż trójmian na czynniki.
4. Odrzuć rozwiązania niezgodne z warunkiem (np. ujemne, gdy proszą o dodatnie).
5. Sprawdź, czy wybrane $m$ daje właściwy punkt przecięcia z osią OY.

## 7. Tryb wizualny
Narysuj pionową oś OY i zaznacz na niej punkt $(0,y_0)$. Wszystkie proste postaci $f(x)=ax+m^2+bm$ przechodzą przez ten punkt wtedy, gdy ich wyraz wolny jest równy $y_0$. Zmieniając $m$, przesuwasz punkt przecięcia po osi OY; równanie $m^2+bm=y_0$ wyznacza te wartości $m$, dla których trafiamy w zadany punkt. Można też narysować parabolę $g(m)=m^2+bm$ i poprowadzić prostą poziomą $g=y_0$; punkty przecięcia dają rozwiązania.
