---
id: matura-geometria-okrag
tytul: "Równanie okręgu i kwadrat promienia"
poziom: liceum
dzial: "Matura · Geometria i dane"
wymagane_wczesniej: ['[[matura-geometria-prosta]]']
generator_id: matura-geometria-okrag
status: gotowe
minutes: 8
description: "Obliczanie kwadratu promienia okręgu znanego środka i punktu na okręgu."
formula: '(x-a)^2+(y-b)^2=r^2'
---
# Równanie okręgu i kwadrat promienia

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Okrąg to zbiór punktów leżących w tej samej odległości od środka. Wyobraź sobie środek miasta i promień dojazdu rowerem. Każdy punkt na granicy tego promienia jest dokładnie tak samo oddalony od centrum. Jeśli znamy środek i jeden punkt na granicy, możemy obliczyć długość promienia z twierdzenia Pitagorasa.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Okrąg o środku $S=(a,b)$ i promieniu $r>0$ tworzą wszystkie punkty $(x,y)$ spełniające równanie:
$$(x-a)^2+(y-b)^2=r^2$$
Jeśli punkt $P=(x,y)$ leży na okręgu, to jego odległość od środka jest równa $r$. Kwadrat tej odległości obliczamy jako sumę kwadratów różnic współrzędnych:
$$r^2=(x_P-a)^2+(y_P-b)^2$$
Znak różnicy nie ma znaczenia, ponieważ każdą różnicę podnosimy do kwadratu. Sam promień to pierwiastek z tej sumy, ale wiele zadań maturalnych prosi właśnie o $r^2$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Punkt $P=(4,2)$ leży na okręgu o środku $S=(1,-2)$. Oblicz $r^2$.
**Krok 1:** Oblicz różnice współrzędnych: $4-1=3$ oraz $2-(-2)=4$.
**Krok 2:** Podnieś różnice do kwadratu i dodaj: $3^2+4^2=9+16=25$.
**Wynik:** $r^2=25$, a promień ma długość $r=5$.

## 4. Typowe Pułapki i Błędy
Nie podawaj $r$ zamiast $r^2$, gdy polecenie wyraźnie prosi o kwadrat promienia. Uważaj na znak współrzędnej środka: dla środka $S=(1,-2)$ we wzorze pojawia się $y-(-2)$, czyli $y+2$. Nie dodawaj współrzędnych punktu i środka bez odejmowania, bo to daje zupełnie inną odległość.

## 5. Powiązane Tematy
Wcześniej: [[matura-geometria-prosta]]. Dalej: [[matura-geometria-proste-rownolegle]].

## 6. Tryb szkolny
Odczytaj ze wzoru lub treści współrzędne środka $a$ i $b$ oraz współrzędne punktu $P$. Odejmij od współrzędnych punktu odpowiednie współrzędne środka. Podnieś obie różnice do kwadratu, dodaj je i zapisz wynik. Jeśli potrzebny jest promień, wyciągnij pierwiastek; jeśli pytanie dotyczy $r^2$, zatrzymaj się na sumie kwadratów.

## 7. Tryb wizualny
Zaznacz środek $S$ i punkt $P$ na siatce. Dorysuj poziomy odcinek sięgający od $S$ do punktu o tej samej rzędnej co $P$ oraz pionowy odcinek do $P$. Powstaje trójkąt prostokątny o przyprostokątnych $3$ i $4$, którego przeciwprostokątna jest promieniem. Pole kwadratu na przeciwprostokątnej ma $25$ kratek, czyli $r^2=25$.
