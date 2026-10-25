---
id: matura-geometria-ostroslup-krawedzie
tytul: "Krawędzie i wierzchołki ostrosłupa"
poziom: liceum
dzial: "Matura · Geometria i dane"
wymagane_wczesniej: ['[[matura-geometria-ostroslup-kat]]']
generator_id: matura-geometria-ostroslup-krawedzie
status: gotowe
minutes: 7
description: "Wyznaczanie liczby boków podstawy ostrosłupa z różnicy liczby krawędzi i wierzchołków."
formula: 'K=2n,\quad W=n+1,\quad K-W=n-1'
---
# Krawędzie i wierzchołki ostrosłupa

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Wyobraź sobie namiot rozpięty na wielokątnej podłodze. Każdy bok podłogi to jedna krawędź, a od każdego narożnika biegnie patyczek do czubka namiotu. Wierzchołki to wszystkie narożniki podłogi plus jeden czubek. Dzięki temu możemy policzyć krawędzie i wierzchołki, nie rysując całej bryły.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Niech podstawą ostrosłupa będzie $n$-kąt. Podstawa ma $n$ krawędzi, a od każdego z $n$ wierzchołków podstawy biegnie jedna krawędź boczna do wspólnego wierzchołka zwanego wierzchołkiem ostrosłupa. Łącznie:
$$K=n+n=2n$$
Wierzchołki to $n$ wierzchołków podstawy oraz jeden wierzchołek ostrosłupa, więc $W=n+1$. Różnica między liczbą krawędzi a liczbą wierzchołków wynosi:
$$K-W=2n-(n+1)=n-1$$
Jeśli krawędzi jest o $d$ więcej niż wierzchołków, to $n-1=d$, czyli $n=d+1$. Dla porównania graniastosłup o podstawie $n$-kąta ma $3n$ krawędzi i $2n$ wierzchołków, więc różnica wynosi tam $n$; nie mieszaj obu wzorów.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Ostrosłup prawidłowy ma krawędź podstawy długości $5$. Liczba wszystkich krawędzi jest o $7$ większa od liczby wierzchołków. Oblicz liczbę boków podstawy.
**Krok 1:** Oznacz liczbę boków podstawy przez $n$; wtedy $K=2n$, a $W=n+1$.
**Krok 2:** Różnica $K-W=2n-(n+1)=n-1$ jest równa $7$, więc $n=8$.
**Wynik:** Podstawa ma $8$ boków; długość krawędzi $5$ jest informacją dodatkową.

## 4. Typowe Pułapki i Błędy
Nie zapomnij dodać jednego wierzchołka ostrosłupa do wierzchołków podstawy. Nie stosuj wzoru dla graniastosłupa: tam różnica jest równa liczbie boków podstawy, a w ostrosłupie jest o jeden mniejsza. Uważaj też na pytanie: czasem trzeba podać liczbę krawędzi lub wierzchołków, a nie liczbę boków podstawy.

## 5. Powiązane Tematy
Wcześniej: [[matura-geometria-ostroslup-kat]]. Dalej: [[matura-geometria-prawdopodobienstwo]].

## 6. Tryb szkolny
Oznacz liczbę boków podstawy przez $n$. Wypisz liczbę krawędzi jako $2n$, a liczbę wierzchołków jako $n+1$. Zapisz podaną różnicę jako równanie $2n-(n+1)=d$, a następnie uprość je do $n-1=d$. Dodaj $1$ do obu stron i otrzymaj $n=d+1$. Na końcu sprawdź, czy liczba boków jest co najmniej równa $3$, oraz czy odpowiedź odpowiada dokładnie na pytanie.

## 7. Tryb wizualny
Narysuj ostrosłup o podstawie trójkąta, potem czworokąta i pięciokąta. W każdym przypadku pokoloruj krawędzie podstawy jednym kolorem, a krawędzie boczne drugim. Zobaczysz, że krawędzi jest dwa razy tyle co boków podstawy, a wierzchołków o jeden więcej. Przy każdym dodatkowym boku różnica między krawędziami i wierzchołkami rośnie dokładnie o $1$.
