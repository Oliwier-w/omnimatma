---
id: matura-geometria-prosta
tytul: "Współczynnik kierunkowy prostej przez dwa punkty"
poziom: liceum
dzial: "Matura · Geometria i dane"
wymagane_wczesniej: ['[[matura-geometria-podobienstwo]]']
generator_id: matura-geometria-prosta
status: gotowe
minutes: 7
description: "Wyznaczanie współczynnika kierunkowego i tangensa kąta nachylenia prostej."
formula: 'm=\frac{y_2-y_1}{x_2-x_1}'
---
# Współczynnik kierunkowy prostej przez dwa punkty

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wyobraź sobie, że idziesz po zboczu góry. Współczynnik kierunkowy mówi, ile metrów w górę lub w dół pokonujesz, przesuwając się o jeden metr w prawo. Jeśli na każde dwa kroki w prawo wchodzisz jeden krok w górę, nachylenie wynosi jedną drugą. Gdy schodzisz, nachylenie jest ujemne.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla prostej przechodzącej przez dwa różne punkty $A=(x_1,y_1)$ i $B=(x_2,y_2)$, gdzie $x_1\ne x_2$, współczynnik kierunkowy definiujemy jako iloraz różnicy rzędnych i różnicy odciętych:
$$m=\frac{y_2-y_1}{x_2-x_1}=\tan\alpha$$
gdzie $\alpha$ jest kątem nachylenia prostej do osi $OX$. Prosta pozioma ma $m=0$, prosta rosnąca ma dodatni współczynnik $m$, a malejąca ujemny. Dla prostej pionowej $x_1=x_2$ współczynnik nie istnieje, bo nie można dzielić przez zero.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Prosta przechodzi przez punkty $A=(-2,1)$ i $B=(2,3)$. Podaj jej współczynnik kierunkowy.
**Krok 1:** Oblicz różnicę rzędnych: $3-1=2$.
**Krok 2:** Oblicz różnicę odciętych: $2-(-2)=4$.
**Wynik:** $m=\frac{2}{4}=\frac12$, więc tangens kąta nachylenia jest równy $\frac12$.

## 4. Typowe Pułapki i Błędy
Nie odwracaj kolejności: różnicę igreków dzielimy przez różnicę iksów, a nie odwrotnie. Uważaj na podwójny minus przy odejmowaniu współrzędnej ujemnej. Pamiętaj, że tangens kąta nachylenia jest równy współczynnikowi kierunkowemu tylko wtedy, gdy prosta nie jest pionowa.

## 5. Powiązane Tematy
Wcześniej: [[matura-geometria-podobienstwo]]. Dalej: [[matura-geometria-okrag]].

## 6. Tryb szkolny
Zapisz współrzędne obu punktów w jednej kolejności. Odejmij od siebie rzędne, potem odcięte, zachowując znaki. Podziel pierwszą różnicę przez drugą i skróć ułamek. Na końcu sprawdź wynik: jeśli prosta opada, współczynnik musi być ujemny, a jeśli różnica odciętych jest dodatnia, znak wyniku jest taki sam jak znak różnicy rzędnych.

## 7. Tryb wizualny
Zaznacz oba punkty na układzie współrzędnych i narysuj odcinek między nimi. Dorysuj poziomą i pionową przyprostokątną, tworząc trójkąt schodkowy. Stosunek wysokości tego trójkąta do jego podstawy to właśnie $m$. Przesuwając punkt $B$ w górę, zwiększasz nachylenie; przesuwając go w dół poniżej punktu $A$, otrzymujesz nachylenie ujemne.
