# SYSTEM DIRECTIVE: PROJEKT "OMNIMATMA" (ULTRA-PREMIUM ZERO-TO-UNIVERSITY MATH PLATFORM)

## 1. WIZJA PROJEKTU I ROLA AGENTA
Tworzysz "OmniMatma" – najbardziej zaawansowaną, w 100% darmową, pozbawioną reklam i jakichkolwiek limitów platformę do nauki matematyki od absolutnego zera (przedszkole/klasa 1) aż po pełny program studiów wyższych (matematyka, informatyka, politechnika). 
Aplikacja ma łączyć najlepsze cechy: **Brilliant.org** (interaktywne wizualizacje), **Khan Academy** (kompletne drzewo wiedzy), **Photomath/Symbolab** (rozwiązania krok po kroku), **GeoGebra/Desmos** (żywe wykresy) oraz **Anki/Duolingo** (grywalizacja, serie dni, powtórki) – ale bez żadnych płatności, serduszek i blokad.

## 2. PREMIUM AESTHETIC & UI/UX DESIGN SYSTEM (BEZWZGLĘDNY WYMÓG)
Strona NIE MOŻE wyglądać jak surowy projekt studencki ani nudny podręcznik. Musi wyglądać jak produkt SaaS klasy Apple / Linear / Vercel / Brilliant / Raycast:
1. **Styl Wizualny (Glassmorphism & Bento Grids):**
   - Używaj kart w stylu **Bento Grid** z subtelnym obramowaniem (`border-white/10` w dark mode, `border-slate-200/80` w light mode), delikatnym rozmyciem tła (`backdrop-blur-xl`) i wielowarstwowymi cieniami.
   - Domyślny motyw: **Deep Space Dark Mode** (`bg-[#090A0F]`, karty `bg-[#12141D]/80`) z neonowo-pastelowymi akcentami (Indigo `#6366F1`, Violet `#8B5CF6`, Emerald `#10B981` dla sukcesu, Amber `#F59E0B` dla podpowiedzi).
   - Dodatkowe motywy do wyboru w ustawieniach: *Clean Paper Light* (ciepły kremowy jak książka), *Cyberpunk Neon*, *Matcha Cozy Lo-Fi* oraz *High-Contrast Dyslexia/ADHD Friendly*.
2. **Animacje i Mikro-interakcje (Framer Motion & Canvas):**
   - Każde przejście między kartami, rozwinięcie kroku rozwiązania i kliknięcie przycisku musi być płynnie animowane (`framer-motion`, sprężyste animacje `spring`).
   - Poprawna odpowiedź wywołuje efekt konfetti (`canvas-confetti`), dźwięk sukcesu (opcjonalny Web Audio API) oraz animację paska EXP.
3. **Typografia:**
   - Tekst główny: `Plus Jakarta Sans` lub `Inter`.
   - Kod i parametry: `JetBrains Mono`.
   - Matematyka: `KaTeX` ze zwiększoną czytelnością, kolorowaniem zmiennych (Color-Coded Math – np. zmienna $x$ zawsze ma ten sam kolor w równaniu i na wykresie!).
4. **Zero Ścian Tekstu:**
   - Teoria musi być podzielona na interaktywne slajdy/kafelki (bite-sized cards), suwaki, ukryte podpowiedzi (accordions) i wizualne symulacje, które użytkownik może przesuwać myszką.

## 3. AUTONOMICZNY ROZrost BAZY WIEDZY (DEEP CURRICULUM EXPANSION PROTOCOL)
Lista w `PROJECT_STATE.md` to tylko główne kategorie. Jako Agent AI masz **BEZWZGLĘDNY OBOWIĄZEK** samodzielnie doszukiwać i dopisywać brakujące mikro-tematy, twierdzenia, metody i wzory!
1. **Zasada Atomowości:** Nigdy nie wrzucaj dużego działu (np. "Macierze" albo "Ułamki") do jednej notatki. Rozbij go automatycznie na 10-20 pojedynczych mikro-lekcji (np. osobno: *Pojęcie macierzy*, *Dodawanie macierzy*, *Mnożenie macierzy przez skalar*, *Mnożenie macierzy przez macierz*, *Wyznacznik 2x2*, *Metoda Sarrusa 3x3*, *Rozwinięcie Laplace'a*, *Macierz dopełnień*, *Macierz odwrotna*, *Rząd macierzy*, *Metoda eliminacji Gaussa*).
2. **Samodzielny Research (Brakujące Ogniwa):** Zanim zaczniesz pisać kod danego działu, przeanalizuj polską podstawę programową (CKE: szkoła podstawowa, liceum podstawa + rozszerzenie) oraz sylabusy akademickie (Algebra Liniowa, Analiza Matematyczna 1 i 2, Matematyka Dyskretna, Statystyka, Logika). Jeśli w `PROJECT_STATE.md` brakuje jakiegoś podtematu – **SAMODZIELNIE GO DOPISZ** do pliku `PROJECT_STATE.md` i utwórz dla niego pliki!
3. **Human-in-the-Loop (Folder `inbox_materialy/`):** Zawsze sprawdzaj folder `inbox_materialy/`. Jeśli użytkownik wrzucił tam zdjęcia zadań, PDF lub skrypt – potraktuj to jako najwyższy priorytet i przerób na interaktywne moduły. Jeśli potrzebujesz dodatkowych materiałów z konkretnej książki – poproś użytkownika.

## 4. ARSENAL FUNKCJI (WSZYSTKO ZA DARMO I BEZ LIMITÓW)
Każdy moduł i cała aplikacja mają zawierać:
1. **Nieskończony Generator Zadań (Procedural Problem Engine w `src/generators/`):**
   - 5 poziomów trudności dla KAŻDEGO mikro-tematu (1: Rozgrzewka na małych liczbach -> 3: Poziom egzaminacyjny/maturalny -> 5: Hardcore / Zadania z haczykiem).
   - Nielimitowane podpowiedzi (Hint 1: Z jakiego wzoru skorzystać, Hint 2: Podstawienie danych, Hint 3: Pełne rozwiązanie Krok po Kroku z wytłumaczeniem "Dlaczego tak?").
2. **Tryb "Sprawdź Mój Krok" (Step-by-Step Scratchpad):** Użytkownik może pisać swoje przekształcenia linijka pod linijką, a silnik (`mathjs` / `nerdamer`) sprawdza, w której dokładnie linijce popełnił błąd (np. zgubiony minus)!
3. **Przełącznik Tłumaczenia (4 Tryby w każdej lekcji):**
   - 🟢 **ELI5 (Jak dla 5-latka):** Na pizzy, klockach, grach i życiowych metaforach.
   - 🔵 **Szkolny / Krok po kroku:** Konkretny algorytm "jak rozwiązać zadanie na sprawdzianie".
   - 🟣 **Wizualny / Geometryczny:** Interaktywny wykres, suwaki, animacja 2D/3D.
   - 🔴 **Akademicki (Ścisły):** Formalne definicje, kwantyfikatory, dowody twierdzeń.
4. **Ściągi i Karty Wzorów (Interactive Cheat Sheets):** Generator pięknych kart wzorów (jak tablice maturalne/akademickie, ale interaktywne – po kliknięciu we wzór otwiera się przykład użycia).
5. **Symulator Egzaminów i Kolokwiów:** Wybór działów -> generowanie arkusza testowego z licznikiem czasu -> szczegółowa analiza po teście, czego jeszcze nie umiesz.
6. **Grywalizacja (RPG Math System):** Poziomy doświadczenia (XP), drzewko umiejętności jak w grach RPG, odznaki, serie dni (Streaks - nigdy nie tracisz ich za brak płatności!), tryb "Boss Fight" (trudne zadanie łączące kilka tematów na koniec działu).

## 5. INTEGRACJA Z OBSIDIANEM, GITHUBEM I DEPLOYMENTEM
1. **Obsidian Vault:** Wszystkie teorie trzymaj w `/curriculum_vault/` z nagłówkiem YAML (Frontmatter) i linkami `[[Wikilinks]]`.
2. **Git & GitHub Ready:** Twórz czysty plik `.gitignore`. Po każdym ukończonym etapie przygotuj projekt tak, aby działał bez błędów przy `npm run build` (gotowy pod automatyczny deployment na **Vercel** jako aplikacja **PWA** działająca też offline).
3. **Aktualizacja Stanu:** Zawsze aktualizuj `PROJECT_STATE.md` po wykonaniu zadania.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
