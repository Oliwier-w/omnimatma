---
id: matura-funkcje-przedzialami
tytul: "Funkcja kawałkami liniowa i największa wartość"
poziom: liceum
dzial: "Matura · Funkcje i ciągi"
wymagane_wczesniej: []
generator_id: matura-funkcje-przedzialami
status: gotowe
minutes: 8
description: "Badanie największej wartości funkcji złożonej z dwóch liniowych kawałków na domkniętym przedziale."
formula: 'f(x)=\begin{cases}ax+b & x\le 0\\ cx+d & x>0\end{cases}'
---
# Funkcja kawałkami liniowa i największa wartość

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wyobraź sobie dwa prostoliniowe odcinki drogi połączone w jednym punkcie. Na każdym odcinku wysokość zmienia się równomiernie, więc najwyższy punkt całej trasy może wypaść tylko na jednym z końców albo dokładnie w miejscu połączenia. Nie musisz sprawdzać nieskończenie wielu punktów: wystarczy porównać kilka kandydatów.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Funkcja kawałkami liniowa jest określona osobnym wzorem liniowym na każdym przedziale. Dla
$$f(x)=\begin{cases}m_1x+c_1 & \text{dla } x\le 0\\ m_2x+c_2 & \text{dla } x>0\end{cases}$$
na przedziale $[L,R]$, gdzie $L\lt0\lt R$, funkcja jest liniowa na każdym z przedziałów $[L,0]$ i $[0,R]$. Funkcja liniowa na domkniętym przedziale jest monotoniczna lub stała, więc jej największa wartość leży na końcu tego przedziału. Zatem
$$\max_{x\in[L,R]} f(x)=\max\{f(L),f(0),f(R)\}.$$
Jeżeli funkcja ma różne wzory po obu stronach zera, trzeba pamiętać, że wartość $f(0)$ liczymy z wzoru obowiązującego w przedziale domkniętym zawierającym zero.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Dana jest funkcja
$$f(x)=\begin{cases}-2x+7 & \text{dla } x\le 0\\ 3x+7 & \text{dla } x>0.\end{cases}$$
Wyznacz największą wartość $f$ w przedziale $[-4,5]$.

**Krok 1:** Sprawdzamy końce przedziału i punkt połączenia: $f(-4)=-2\cdot(-4)+7=15$, $f(0)=7$, $f(5)=3\cdot5+7=22$.

**Krok 2:** Porównujemy kandydatów: $15$, $7$ oraz $22$. Największa jest $22$.

**Wynik:** Największa wartość funkcji w przedziale $[-4,5]$ wynosi $22$.

## 4. Typowe Pułapki i Błędy
Nie sprawdzaj wyłącznie wartości w zerze: dla funkcji rosnącej na prawym kawałku maksimum może wypaść na prawym końcu przedziału. Pamiętaj o domkniętości przedziału i o tym, że nachylenie ujemne oznacza, iż wartość rośnie w lewo, a nie w prawo. Częstym błędem jest także podstawienie złego wzoru po lewej i prawej stronie zera oraz zgubienie minusa przy mnożeniu liczby ujemnej przez ujemną.

## 5. Powiązane Tematy
- Wymagane wcześniej: brak, to pierwsza lekcja działu.
- Co dalej: [[matura-funkcje-liniowa]]

## 6. Tryb szkolny
1. Odczytaj z wzoru przedziały i osobne wzory liniowe.
2. Policz wartości na końcach całego przedziału oraz w punkcie zmiany wzoru.
3. Ustal, czy dany kawałek rośnie, czy maleje, i sprawdź, czy kandydat jest zgodny z kierunkiem zmiany.
4. Porównaj otrzymane liczby i zapisz największą z nich jako odpowiedź.
5. Sprawdź wynik, podstawiając punkt, w którym według Ciebie występuje maksimum.

## 7. Tryb wizualny
Narysuj dwie półproste: lewą o nachyleniu $m_1$ i prawą o nachyleniu $m_2$, połączone w punkcie $(0,c)$. Najwyższy punkt wykresu na przedziale $[L,R]$ to albo koniec lewej półprostej, albo wierzchołek połączenia, albo koniec prawej półprostej. Zmiana znaku nachylenia powoduje, że maksimum „przeskakuje” między tymi trzema punktami, co łatwo zaobserwować na wykresie.
