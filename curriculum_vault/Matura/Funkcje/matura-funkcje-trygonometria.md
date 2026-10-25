---
id: matura-funkcje-trygonometria
tytul: "Tożsamość trygonometryczna i tangens kąta ostrego"
poziom: liceum
dzial: "Matura · Funkcje i ciągi"
wymagane_wczesniej: ['[[matura-funkcje-ciag-trzywyrazowy]]']
generator_id: matura-funkcje-trygonometria
status: gotowe
minutes: 8
description: "Upraszczanie równania z sinusem i cosinusem oraz obliczanie tangensa kąta ostrego."
formula: 'a\sin\alpha+b\sin^2\alpha=c\cos\alpha-b\cos^2\alpha+b\;\Rightarrow\;\tan\alpha=\frac ca'
---
# Tożsamość trygonometryczna i tangens kąta ostrego

## 1. Wyjaśnienie Intuicyjne (Od Zera / ELI5)
Sinus i cosinus tego samego kąta są jak dwie współrzędne punktu na okręgu. Ich kwadraty sumują się do jednej całości: $\sin^2\alpha+\cos^2\alpha=1$. W równaniu z zadania wyrazy z $b$ można dzięki temu połączyć i częściowo skrócić. Zostaje prosta zależność między sinusem i cosinusem, a tangens to właśnie iloraz sinusa przez cosinus.

## 2. Definicja Formalna i Wzory (Wersja Akademicka / Podręcznikowa)
Dla każdego kąta $\alpha$ zachodzi tożsamość
$$\sin^2\alpha+\cos^2\alpha=1.$$
W trójkącie prostokątnym dla kąta ostrego $\alpha$ przyprostokątna naprzeciw kąta ma długość $a$, przyprostokątna przy kącie $b$, a przeciwprostokątna $c$. Wtedy $\sin\alpha=\frac ac$, $\cos\alpha=\frac bc$ oraz
$$\tan\alpha=\frac{\sin\alpha}{\cos\alpha}=\frac ab.$$
Rozważmy równanie
$$a\sin\alpha+b\sin^2\alpha=c\cos\alpha-b\cos^2\alpha+b.$$
Prawą stronę przekształcamy:
$$c\cos\alpha-b\cos^2\alpha+b=c\cos\alpha+b(1-\cos^2\alpha)=c\cos\alpha+b\sin^2\alpha.$$
Po odjęciu $b\sin^2\alpha$ od obu stron zostaje
$$a\sin\alpha=c\cos\alpha.$$
Dla kąta ostrego $\cos\alpha\ne0$, więc
$$\tan\alpha=\frac{\sin\alpha}{\cos\alpha}=\frac ca.$$

## 3. Wzorcowe Przykłady Krok po Kroku
**Zadanie:** Kąt $\alpha$ jest ostry i spełnia równanie $2\sin\alpha+3\sin^2\alpha=5\cos\alpha-3\cos^2\alpha+3$. Oblicz $\tan\alpha$.

**Krok 1:** Przekształcamy prawą stronę: $5\cos\alpha-3\cos^2\alpha+3=5\cos\alpha+3(1-\cos^2\alpha)=5\cos\alpha+3\sin^2\alpha$.

**Krok 2:** Po podstawieniu równanie ma postać $2\sin\alpha+3\sin^2\alpha=5\cos\alpha+3\sin^2\alpha$. Skracamy $3\sin^2\alpha$ i otrzymujemy $2\sin\alpha=5\cos\alpha$.

**Krok 3:** Dzielimy obie strony przez $\cos\alpha$ (dla kąta ostrego jest on dodatni i niezerowy): $\tan\alpha=\frac{5}{2}$.

**Wynik:** $\tan\alpha=\frac52$.

## 4. Typowe Pułapki i Błędy
Najczęściej błędnie opuszcza się składnik $+b$ po prawej stronie albo zmienia się jego znak. Pamiętaj, że $-b\cos^2\alpha+b=b(1-\cos^2\alpha)=b\sin^2\alpha$, więc wyrazy z $b$ nie znikają same, tylko się upraszczają. Nie dziel przez $\cos\alpha$ bez uzasadnienia, że jest różny od zera; dla kąta ostrego jest to prawda, ale trzeba to zaznaczyć. Nie odwracaj tangensa: $\tan\alpha=\frac{\sin\alpha}{\cos\alpha}$, a nie $\frac{\cos\alpha}{\sin\alpha}$. Wynik warto sprawdzić, czy jest dodatni, bo kąt jest ostry.

## 5. Powiązane Tematy
- Wymagane wcześniej: [[matura-funkcje-ciag-trzywyrazowy]]
- Co dalej: [[matura-funkcje-katy-okregu]]

## 6. Tryb szkolny
1. Wypisz jedynkę trygonometryczną i zauważ, gdzie można zamienić $1-\cos^2\alpha$ na $\sin^2\alpha$.
2. Przekształć jedną stronę równania tak, aby pojawiły się te same wyrazy co po drugiej stronie.
3. Skróć identyczne składniki i zapisz zależność między $\sin\alpha$ i $\cos\alpha$.
4. Podziel przez $\cos\alpha$, uzasadniając, że dla kąta ostrego jest niezerowy.
5. Odczytaj $\tan\alpha$ jako iloraz współczynników i sprawdź, czy wynik jest dodatni.

## 7. Tryb wizualny
Narysuj okrąg jednostkowy i promień pod kątem $\alpha$. Jego koniec ma współrzędne $(\cos\alpha,\sin\alpha)$, a tangens jest nachyleniem tego promienia. Na trójkącie prostokątnym widać, że $\tan\alpha$ to stosunek przyprostokątnej naprzeciw kąta do przyprostokątnej przy kącie. Przekształcenie równania oznacza, że po dodaniu odpowiednich wielokrotności jedynki trygonometrycznej obie strony opisują ten sam stosunek boków.
