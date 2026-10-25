---
id: complex-power
tytul: Potęgi naturalne liczb zespolonych
poziom: studia
dzial: Liczby zespolone
wymagane_wczesniej: ['[[Mnożenie liczb zespolonych]]']
generator_id: complex-power
status: gotowe
formula: 'i^{4k}=1,\quad i^{4k+1}=i,\quad i^{4k+2}=-1,\quad i^{4k+3}=-i'
---
# Potęgi naturalne liczb zespolonych
## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Potęgowanie to wielokrotne wykonanie tego samego mnożenia. Każde mnożenie przez $i$ to ćwierć obrotu. Po czterech wracasz na start, jak wskazówka zataczająca pełny obrót. Dla innej liczby zespolonej może zmieniać się również odległość od zera.
## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla $n\ge1$ definiujemy $z^n$ jako iloczyn $n$ czynników $z$. Dla $z\ne0$ przyjmujemy $z^0=1$. Mnożymy rozdzielnie i zastępujemy $i^2$ przez $-1$. Szczególnie z $i^2=-1$ wynikają $i^3=-i$ oraz $i^4=1$. Dla wykładnika całkowitego $n\ge0$ dzielenie $n$ przez 4 z resztą $r$ daje $i^n=i^r$. Poniżej $k\in\mathbb Z_{\ge0}$.
$$i^{4k}=1,\quad i^{4k+1}=i,\quad i^{4k+2}=-1,\quad i^{4k+3}=-i$$
## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Oblicz $i^{2026}$.
**Krok 1:** $2026=4\cdot506+2$.
**Krok 2:** $i^{2026}=(i^4)^{506}i^2=1^{506}(-1)$.
**Wynik:** $-1$.

### Przykład 2: potęga ogólnego z
**Zadanie:** Oblicz $(1+2i)^3$.
**Krok 1:** $(1+2i)^2=1+4i+4i^2=-3+4i$.
**Krok 2:** $(-3+4i)(1+2i)=-3-6i+4i+8i^2$.
**Wynik:** $-11-2i$.
## 4. Typowe Pułapki i Błędy
Cykl reszt z dzielenia przez 4 dotyczy potęg samego $i$, nie dowolnego $a+bi$. $(a+bi)^n$ nie jest na ogół równe $a^n+b^ni^n$. Ta lekcja nie wprowadza jeszcze wzoru de Moivre’a ani potęg o wykładnikach niecałkowitych.
## 5. Powiązane Tematy
Wcześniej: [[Mnożenie liczb zespolonych]]. Interpretacja: [[Płaszczyzna Gaussa]].
## 6. Tryb szkolny
Dla $z=a+bi$ mnoż kolejne potęgi przez $z$, za każdym razem redukując $i^2=-1$ i zbierając części rzeczywiste i urojone. Dla potęg samego $i$ podziel wykładnik przez 4 z resztą: reszty 0, 1, 2, 3 oznaczają odpowiednio 1, $i$, $-1$, $-i$. Przy ujemnym wykładniku i niezerowej podstawie najpierw użyj odwrotności.
## 7. Tryb wizualny
Zaznacz na okręgu jednostkowym kolejno $(1,0),(0,1),(-1,0),(0,-1)$. Kolejne potęgi $i$ odwiedzają te punkty cyklicznie w kierunku przeciwnym do wskazówek zegara.
