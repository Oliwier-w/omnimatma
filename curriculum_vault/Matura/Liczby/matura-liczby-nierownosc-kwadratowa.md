---
id: matura-liczby-nierownosc-kwadratowa
tytul: "Nierówność kwadratowa i największa liczba całkowita"
poziom: liceum
dzial: "Matura · Liczby i algebra"
wymagane_wczesniej: ["[[matura-liczby-wyrazenia-wymierne]]"]
generator_id: matura-liczby-nierownosc-kwadratowa
status: gotowe
minutes: 9
description: "Rozwiązywanie nierówności kwadratowej zapisanej w postaci iloczynowej i wybieranie największej liczby całkowitej."
formula: 'a(x-r_1)(x-r_2)\le0\ \Longleftrightarrow\ x\in[r_1,r_2]\quad(a>0,\ r_1\lt r_2)'
---

# Nierówność kwadratowa i największa liczba całkowita

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Nierówność kwadratowa pyta, po której stronie paraboli znajdują się punkty. Gdy parabola ma ramiona do góry i przecina oś w dwóch miejscach, między tymi miejscami leży pod osią. Dla $(x-2)(x-5)\le0$ rozwiązaniem jest przedział od $2$ do $5$, bo tam iloczyn jest ujemny lub zerowy. Największa liczba całkowita w tym przedziale to $5$. Trzeba tylko sprawdzić, czy końce przedziału są domknięte.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla $a>0$ i pierwiastków $r_1\lt r_2$ funkcja kwadratowa
$$f(x)=a(x-r_1)(x-r_2)$$
ma ramiona skierowane do góry. Znak iloczynu zależy od znaków czynników:
$$f(x)<0 \Longleftrightarrow x\in(r_1,r_2),$$
$$f(x)\le0 \Longleftrightarrow x\in[r_1,r_2].$$
Poza przedziałem oba czynniki mają ten sam znak, więc iloczyn jest dodatni. Dla $a<0$ ramiona są skierowane do dołu i znaki się odwracają. Największa liczba całkowita w przedziale domkniętym $[r_1,r_2]$ to $\lfloor r_2\rfloor$; w przedziale otwartym $(r_1,r_2)$ to $\lceil r_2\rceil-1$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Wyznacz największą liczbę całkowitą spełniającą nierówność $(3x-14)(x+6)\le0$.
**Krok 1:** Wyznaczamy pierwiastki: $3x-14=0$ daje $x=\frac{14}{3}=4\frac23$, a $x+6=0$ daje $x=-6$.
**Krok 2:** Współczynnik przy $x^2$ jest dodatni, więc parabola ma ramiona do góry, a nierówność $\le0$ jest spełniona między pierwiastkami: $x\in[-6,\frac{14}{3}]$.
**Krok 3:** Największa liczba całkowita nie większa od $4\frac23$ to $4$.
**Wynik:** $4$.

## 4. Typowe Pułapki i Błędy
Nie wystarczy odczytać pierwiastków — trzeba ustalić, czy rozwiązaniem jest przedział między nimi, czy suma dwóch półprostych. Dla ramion do góry i znaku $<0$ lub $\le0$ bierzemy przedział między pierwiastkami; dla $>0$ lub $\ge0$ bierzemy zewnętrzne części. Częsty błąd to pominięcie znaku współczynnika przy $x^2$: przy ujemnym współczynniku kierunek się odwraca. Przy wyborze liczby całkowitej pamiętaj, że dla przedziału otwartego prawy koniec nie należy do zbioru, więc nie można go zaokrąglać w górę bez sprawdzenia.

## 5. Powiązane Tematy
- Wcześniej: [[matura-liczby-wyrazenia-wymierne]]
- Co dalej: [[matura-liczby-uklad-rownan]]

## 6. Tryb szkolny
Zapisz nierówność w postaci iloczynowej lub znajdź pierwiastki z delty. Zaznacz pierwiastki na osi liczbowej i ustal znak współczynnika przy $x^2$. Naszkicuj parabolę: ramiona do góry lub do dołu. Odczytaj przedział, w którym parabola znajduje się po właściwej stronie osi, pamiętając o domknięciu lub otwarciu końców. Na końcu wybierz największą liczbę całkowitą z otrzymanego przedziału i sprawdź ją w pierwotnej nierówności.

## 7. Tryb Wizualny
Narysuj parabolę przecinającą oś $OX$ w punktach $-6$ i $4\frac23$. Między tymi punktami wykres leży pod osią lub na niej, więc tam iloczyn jest niedodatni. Zaznacz ten fragment kolorem i nanieś na oś liczby całkowite: $-6,-5,\ldots,4$. Największa z nich to $4$. Gdyby nierówność była ostra, punkt $4\frac23$ nadal byłby wyłączony, ale liczba $4$ pozostałaby rozwiązaniem, bo leży ściśle wewnątrz przedziału.
