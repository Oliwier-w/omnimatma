---
id: matura-liczby-pierwiastki
tytul: "Pierwiastki stopnia trzeciego i piątego"
poziom: liceum
dzial: "Matura · Liczby i algebra"
wymagane_wczesniej: []
generator_id: matura-liczby-pierwiastki
status: gotowe
minutes: 8
description: "Obliczanie pierwiastków nieparzystego stopnia z liczb ujemnych i dodatnich oraz łączenie ich w działaniach."
formula: '\sqrt[3]{a}+\sqrt[5]{b}'
---

# Pierwiastki stopnia trzeciego i piątego

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wyobraź sobie sześcian o objętości $27$. Jego krawędź ma długość $3$, bo $3\cdot3\cdot3=27$. Pierwiastek trzeciego stopnia cofa więc podnoszenie do trzeciej potęgi. Gdy objętość jest ujemna, np. $-27$, krawędź też jest ujemna: $-3$. Przy piątym stopniu działa to tak samo, bo $5$ jest liczbą nieparzystą.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla nieparzystego $n$ i liczby rzeczywistej $a$ symbol $\sqrt[n]{a}$ oznacza jedyną liczbę rzeczywistą $b$, dla której $b^n=a$. W szczególności
$$\sqrt[3]{-a}=-\sqrt[3]{a},\qquad \sqrt[5]{-a}=-\sqrt[5]{a}.$$
Dla nieparzystych $n$ pierwiastek jest określony także dla $a<0$. Zachodzą wzory
$$\sqrt[n]{ab}=\sqrt[n]{a}\sqrt[n]{b},\qquad \sqrt[n]{a^n}=a,$$
a pierwiastek nie rozdziela się na sumę: na ogół $\sqrt[n]{a+b}\ne\sqrt[n]{a}+\sqrt[n]{b}$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Oblicz $\sqrt[3]{-27}+\sqrt[5]{-32}$.
**Krok 1:** Szukamy liczby, której trzecia potęga wynosi $-27$. Ponieważ $(-3)^3=-27$, mamy $\sqrt[3]{-27}=-3$.
**Krok 2:** Podobnie $(-2)^5=-32$, więc $\sqrt[5]{-32}=-2$.
**Krok 3:** Dodajemy wyniki: $-3+(-2)=-5$.
**Wynik:** $-5$.

## 4. Typowe Pułapki i Błędy
Najczęstszy błąd to zgubienie minusa i potraktowanie $\sqrt[3]{-27}$ jako $+3$. Pierwiastek stopnia nieparzystego z liczby ujemnej jest ujemny. Drugi błąd to dodawanie pierwiastków przez dodanie liczb podpierwiastkowych, np. $\sqrt[3]{-27}+\sqrt[5]{-32}\ne\sqrt[3]{-59}$. Nie można też rozdzielać pierwiastka na sumę.

## 5. Powiązane Tematy
- Co dalej: [[matura-liczby-potegi]]

## 6. Tryb szkolny
Najpierw rozpoznaj stopień pierwiastka i znak liczby podpierwiastkowej. Zapisz liczbę podpierwiastkową jako potęgę liczby całkowitej, np. $-27=(-3)^3$ oraz $-32=(-2)^5$. Wyciągnij pierwiastek, pamiętając, że przy stopniu nieparzystym znak pozostaje ten sam. Następnie wykonaj mnożenie przez współczynnik i dodawanie lub odejmowanie. Na końcu sprawdź wynik, podnosząc go do właściwej potęgi: $(-5)^3=-125$, więc dla samego pierwiastka trzeba osobno kontrolować znak.

## 7. Tryb wizualny
Na osi liczbowej zaznacz liczby $-3$, $0$ i $3$. Podniesienie do trzeciej potęgi zachowuje znak, dlatego wykres $y=x^3$ przechodzi przez zero i rośnie od lewej do prawej. Pierwiastek trzeciego stopnia to odczytanie z tego wykresu argumentu dla danej wartości $y$. Dla liczby $-27$ szukamy punktu o drugiej współrzędnej $-27$; odpowiada mu argument $-3$. Przy piątym stopniu wykres $y=x^5$ jest jeszcze bardziej stromy, ale nadal przechodzi przez wszystkie wartości, także ujemne.
