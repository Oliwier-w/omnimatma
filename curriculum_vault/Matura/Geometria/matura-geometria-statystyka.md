---
id: matura-geometria-statystyka
tytul: "Mediana, dominanta i częstości w tabeli"
poziom: liceum
dzial: "Matura · Geometria i dane"
wymagane_wczesniej: ['[[matura-geometria-prawdopodobienstwo]]']
generator_id: matura-geometria-statystyka
status: gotowe
minutes: 9
description: "Odczyt mediany, dominanty i prawdopodobieństwa z tabeli wartości i częstości."
formula: 'M=x_{\frac{N+1}{2}}'
---
# Mediana, dominanta i częstości w tabeli

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wyobraź sobie, że wszyscy w klasie podają, ile mają rodzeństwa. Mediana to odpowiedź osoby stojącej dokładnie w środku, gdy ustawimy wszystkich od najmniejszej do największej liczby. Dominanta to najczęściej powtarzająca się odpowiedź. Tabela z częstościami mówi, ile osób udzieliło każdej odpowiedzi, więc nie trzeba wypisywać całej listy.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Niech dane będą przedstawione w tabeli: wartość $x_i$ występuje $n_i$ razy, a łączna liczba obserwacji wynosi $N=\sum n_i$. Medianę dla nieparzystego $N$ definiujemy jako wartość na pozycji $\frac{N+1}{2}$ w uporządkowanym ciągu obserwacji:
$$M=x_{\frac{N+1}{2}}$$
Dla parzystego $N$ medianą jest średnia arytmetyczna dwóch środkowych wartości. Dominanta $D$ to wartość o największej częstości:
$$D=x_{\max n_x}$$
Prawdopodobieństwo wylosowania obserwacji o wartości $x$ (przy losowaniu każdej obserwacji z jednakowym prawdopodobieństwem) wynosi:
$$P(X=x)=\frac{n_x}{N}$$
Wszystkie częstości trzeba najpierw zsumować; dopiero potem ustalamy pozycję mediany i mianownik prawdopodobieństwa.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** W tabeli wartości $1,2,3,4,5$ mają częstości odpowiednio $2,3,5,4,1$. Podaj medianę, dominantę i prawdopodobieństwo wylosowania wartości $3$.
**Krok 1:** Łączna liczba obserwacji to $2+3+5+4+1=15$, więc mediana jest na pozycji $8$.
**Krok 2:** Sumy narastające częstości: $2$, potem $5$, potem $10$; pozycja $8$ wpada w wartość $3$. Największa częstość to $5$, więc dominanta również wynosi $3$.
**Wynik:** Mediana $=3$, dominanta $=3$, a $P(X=3)=\frac{5}{15}=\frac13$.

## 4. Typowe Pułapki i Błędy
Nie wyznaczaj mediany jako średniej wartości z pierwszej kolumny; liczy się pozycja w pełnym, uporządkowanym zbiorze obserwacji. Przy parzystej liczbie obserwacji nie wybieraj jednej ze środkowych wartości bez uśrednienia. Pamiętaj, że dominanta to wartość o największej częstości, a nie największa wartość w tabeli. Prawdopodobieństwo licz jako udział częstości w całkowitej liczbie obserwacji.

## 5. Powiązane Tematy
Wcześniej: [[matura-geometria-prawdopodobienstwo]]. Dalej: [[matura-geometria-optymalizacja]].

## 6. Tryb szkolny
Zsumuj wszystkie częstości i zapisz $N$. Dla mediany oblicz pozycję środkową, a następnie dodawaj częstości kolejnych wartości, aż suma osiągnie tę pozycję. Dla dominanty znajdź największą częstość i odpowiadającą jej wartość. Dla prawdopodobieństwa podziel częstość wybranej wartości przez $N$ i skróć ułamek. Na końcu sprawdź, czy prawdopodobieństwo mieści się między $0$ a $1$.

## 7. Tryb wizualny
Narysuj wykres słupkowy, w którym wysokość słupka odpowiada częstości danej wartości. Dominanta to najwyższy słupek. Mediana to miejsce, w którym suma pól słupków po lewej stronie osiąga połowę wszystkich obserwacji. Zaznacz na osi poziomej pozycję środkową i przesuwaj ją w prawo, dodając kolejne słupki, aż znajdziesz wartość mediany.
