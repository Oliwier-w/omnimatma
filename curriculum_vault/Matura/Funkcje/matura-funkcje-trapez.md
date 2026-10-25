---
id: matura-funkcje-trapez
tytul: "Trapez równoramienny — ramię z przekątnej i cosinusa"
poziom: liceum
dzial: "Matura · Funkcje i ciągi"
wymagane_wczesniej: ['[[matura-funkcje-katy-okregu]]']
generator_id: matura-funkcje-trapez
status: gotowe
minutes: 10
description: "Wyznaczanie długości ramienia trapezu równoramiennego z przekątnej, cosinusa kąta ostrego i różnicy podstaw."
formula: 'c=\sqrt{\left(\frac{a-b}{2}\right)^2+p^2\sin^2\alpha}'
---
# Trapez równoramienny — ramię z przekątnej i cosinusa

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Trapez równoramienny można rozciąć na prostokąt i dwa jednakowe trójkąty prostokątne przy bokach. Przekątna to ukośna linia biegnąca przez cały trapez. Jej poziomy fragment i wysokość można obliczyć z długości przekątnej oraz z cosinusa kąta, jaki tworzy z dłuższą podstawą. Gdy znamy wysokość i połowę różnicy podstaw, ramię wyliczamy z twierdzenia Pitagorasa.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Niech $ABCD$ będzie trapezem równoramiennym o dłuższej podstawie $AB=a$, krótszej podstawie $CD=b$ i ramionach $AD=BC=c$. Niech $p=AC$ będzie przekątną, a $\alpha=\angle BAC$ kątem ostrym między przekątną i dłuższą podstawą. Po opuszczeniu wysokości z $D$ i $C$ dłuższa podstawa dzieli się na odcinki
$$\frac{a-b}{2},\qquad b,\qquad \frac{a-b}{2}.$$
Rzut przekątnej na dłuższą podstawę ma długość
$$s=p\cos\alpha,$$
a wysokość trapezu wynosi
$$h=p\sin\alpha.$$
Połowa różnicy podstaw to
$$t=\frac{a-b}{2}.$$
Ramię, wysokość i odcinek $t$ tworzą trójkąt prostokątny, więc
$$c^2=t^2+h^2.$$
Ostatecznie
$$c=\sqrt{\left(\frac{a-b}{2}\right)^2+p^2\sin^2\alpha}.$$
W zadaniach często zamiast sinusa podany jest cosinus; wtedy korzystamy z jedynki trygonometrycznej $\sin^2\alpha=1-\cos^2\alpha$.

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** W trapezie równoramiennym $ABCD$ przekątna $AC$ ma długość $15$, cosinus kąta $BAC$ jest równy $\frac35$, a różnica długości podstaw wynosi $10$. Oblicz długość ramienia.

**Krok 1:** Połowa różnicy podstaw to $t=\frac{10}{2}=5$. Rzut przekątnej na dłuższą podstawę wynosi $s=15\cdot\frac35=9$.

**Krok 2:** Wysokość wyliczamy z trójkąta prostokątnego: $h=\sqrt{15^2-9^2}=\sqrt{225-81}=\sqrt{144}=12$. Można też użyć $\sin\alpha=\frac45$, wtedy $h=15\cdot\frac45=12$.

**Krok 3:** Ramię ma długość $c=\sqrt{t^2+h^2}=\sqrt{5^2+12^2}=\sqrt{25+144}=\sqrt{169}=13$.

**Wynik:** Ramię trapezu ma długość $13$.

## 4. Typowe Pułapki i Błędy
Nie bierz całej różnicy podstaw zamiast jej połowy: rzut ramienia na dłuższą podstawę to $\frac{a-b}{2}$, bo różnica rozkłada się symetrycznie na dwa końce trapezu. Nie traktuj przekątnej jako ramienia ani wysokości jako różnicy podstaw. Pamiętaj, że cosinus dotyczy kąta między przekątną i podstawą, więc rzut poziomy to $p\cos\alpha$, a wysokość to $p\sin\alpha$; zamiana tych funkcji daje błędny wynik. Przy wyciąganiu pierwiastka odrzuć rozwiązanie ujemne, bo długość jest dodatnia. Sprawdź, czy otrzymane ramię jest dłuższe od wysokości, co jest konieczne w trójkącie prostokątnym.

## 5. Powiązane Tematy
- Wymagane wcześniej: [[matura-funkcje-katy-okregu]]
- Co dalej: [[matura-funkcje-trojkat-prostokatny]]

## 6. Tryb szkolny
1. Oznacz długości podstaw, przekątną, kąt i szukane ramię; wykonaj rysunek z wysokościami.
2. Oblicz połowę różnicy podstaw $t=\frac{a-b}{2}$.
3. Wyznacz rzut przekątnej $s=p\cos\alpha$, a następnie wysokość $h=\sqrt{p^2-s^2}$ lub $h=p\sin\alpha$.
4. Zastosuj twierdzenie Pitagorasa do trójkąta złożonego z $t$, $h$ i ramienia: $c=\sqrt{t^2+h^2}$.
5. Sprawdź, czy długości są dodatnie i czy ramię jest większe od wysokości; zapisz wynik w wymaganej postaci.

## 7. Tryb wizualny
Narysuj trapez równoramienny i opuść obie wysokości z krótszej podstawy. Powstają dwa przystające trójkąty prostokątne oraz prostokąt. Przekątna jest przeciwprostokątną większego trójkąta, którego przyprostokątne to $s$ i $h$. Zmiana kąta $\alpha$ zmienia podział przekątnej na część poziomą i pionową, ale długość ramienia zależy od $t$ i $h$. Na rysunku można też zaznaczyć, że $a-b=2t$, co wyjaśnia, dlaczego w formule pojawia się połowa różnicy.
