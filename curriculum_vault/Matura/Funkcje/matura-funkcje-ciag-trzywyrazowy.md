---
id: matura-funkcje-ciag-trzywyrazowy
tytul: "Trzywyrazowy ciąg geometryczny z niewiadomą x"
poziom: liceum
dzial: "Matura · Funkcje i ciągi"
wymagane_wczesniej: ['[[matura-funkcje-ciag-arytmetyczny]]']
generator_id: matura-funkcje-ciag-trzywyrazowy
status: gotowe
minutes: 9
description: "Wykorzystanie warunku środkowego wyrazu do znalezienia ilorazu trzywyrazowego ciągu geometrycznego."
formula: '(x+a)^2=x(bx+c),\quad q=\frac{x+a}{x}'
---
# Trzywyrazowy ciąg geometryczny z niewiadomą x

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
W ciągu geometrycznym środkowy wyraz jest „średnią geometryczną” skrajnych: podniesiony do kwadratu daje iloczyn sąsiadów. Jeśli trzy liczby są opisane wyrażeniami z $x$, ten warunek zamienia się w równanie. Rozwiązujemy je, a potem dzielimy drugi wyraz przez pierwszy, żeby dostać iloraz.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Trzy liczby $u,v,w$ tworzą w podanej kolejności ciąg geometryczny wtedy i tylko wtedy, gdy istnieje niezerowy iloraz $q$ spełniający $v=uq$ oraz $w=vq$. Równoważnie
$$v^2=uw,$$
przy założeniu, że $u\ne0$. Dla wyrazów
$$u=x,\qquad v=x+a,\qquad w=bx+c$$
warunek przyjmuje postać
$$(x+a)^2=x(bx+c).$$
Po uporządkowaniu otrzymujemy równanie kwadratowe
$$(1-b)x^2+(2a-c)x+a^2=0.$$
Jeżeli wszystkie wyrazy są dodatnie, to $x>0$ oraz $q=\frac{x+a}{x}>0$. Dodatni pierwiastek wybieramy zgodnie z treścią zadania, a następnie liczymy
$$q=\frac{x+a}{x}=\frac{bx+c}{x+a}.$$
Obie postaci ilorazu powinny dać ten sam wynik; jest to dobre sprawdzenie.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Liczby $x$, $x+4$ oraz $2x+14$ są dodatnie i tworzą w podanej kolejności ciąg geometryczny. Wyznacz iloraz $q$.

**Krok 1:** Zapisujemy warunek środkowego wyrazu: $(x+4)^2=x(2x+14)$.

**Krok 2:** Rozwijamy i porządkujemy: $x^2+8x+16=2x^2+14x$, czyli $x^2+6x-16=0$. Rozkładamy: $(x+8)(x-2)=0$, więc $x=-8$ lub $x=2$. Ponieważ wyrazy mają być dodatnie, zostaje $x=2$.

**Krok 3:** Obliczamy wyrazy: $2$, $6$, $18$. Iloraz to $q=\frac{6}{2}=3$; drugi iloraz $\frac{18}{6}$ również wynosi $3$.

**Wynik:** $q=3$.

## 4. Typowe Pułapki i Błędy
Nie używaj średniej arytmetycznej zamiast warunku geometrycznego: dla trzech liczb $u,v,w$ trzeba mieć $v^2=uw$, a nie $2v=u+w$. Pamiętaj, że równanie kwadratowe może dać pierwiastek ujemny, który należy odrzucić, jeśli wyrazy mają być dodatnie. Nie dziel przez $x$ bez sprawdzenia, że $x\ne0$. Iloraz licz z pary pierwszy–drugi, a nie z pary pierwszy–trzeci. Na końcu podstaw otrzymane $x$ do wszystkich trzech wyrażeń, aby wykluczyć rozwiązanie pozorne.

## 5. Powiązane Tematy
- Wymagane wcześniej: [[matura-funkcje-ciag-arytmetyczny]]
- Co dalej: [[matura-funkcje-trygonometria]]

## 6. Tryb szkolny
1. Oznacz trzy wyrazy jako $u$, $v$, $w$ i zapisz warunek $v^2=uw$.
2. Podstaw wyrażenia z $x$ i doprowadź równanie do postaci kwadratowej.
3. Rozwiąż równanie i odrzuć pierwiastki sprzeczne z warunkami zadania (np. niedodatnie wyrazy).
4. Oblicz iloraz $q=\frac{v}{u}$ dla dopuszczalnego $x$.
5. Sprawdź iloraz na parze $w$ i $v$; oba wyniki muszą być równe.

## 7. Tryb wizualny
Zaznacz trzy wyrazy jako kolejne punkty na osi liczbowej. W ciągu geometrycznym odległość od zera zmienia się o stały czynnik, więc stosunek wysokości kolejnych punktów jest taki sam. Na wykresie punktów $(n,a_n)$ leżą one na krzywej wykładniczej; szukany iloraz to stały mnożnik między sąsiednimi wysokościami. Warunek $v^2=uw$ oznacza, że pole kwadratu o boku $v$ jest równe polu prostokąta o bokach $u$ i $w$.
