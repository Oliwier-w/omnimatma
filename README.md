# OmniMatma

Interaktywna platforma matematyczna po polsku. Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, KaTeX i Math.js. Treść pochodzi bezpośrednio z notatek Obsidiana — bez bazy danych i kluczy API.

## Uruchomienie

Wymagany Node.js 24 LTS i npm.

```powershell
cd . # katalog projektu OmniMatma
npm ci
npm run dev
```

Otwórz http://localhost:3000. Obsidian nadal otwiera cały katalog projektu OmniMatma jako vault. Usunięto wyłącznie nadmiarowe drugie rozszerzenie `.md` trzech oryginalnych plików.

```powershell
npm run check        # TypeScript + testy jednostkowe
npm run build        # build produkcyjny i walidacja wszystkich notatek
npm start            # serwer produkcyjny
npx playwright install chromium --no-shell
npm run test:e2e     # testy przeglądarkowe; wymagają wcześniejszego builda
npm run test:stress  # 60 generatorów × 50 ziaren × 5 poziomów + rodziny OmniKumpel AI
npm run test:smoke   # 13 publicznych tras: HTTP 200, SSR i niepuste kontenery ARIA
```

Zatrzymaj `dev` przed `build` — oba korzystają z `.next`. Testy E2E uruchamiają własny serwer produkcyjny na porcie 3100. Nie są częścią szybkiego `check`.

## Co działa

- **Etap 2 — centralny walidator:** `validateMathAnswer` obsługuje przecinek dziesiętny, jawne zbiory rozwiązań, dokładną równoważność ograniczonych wielomianów i testy punktowe pozostałych obsługiwanych wyrażeń symbolicznych. Nieskrócony poprawny ułamek jest zaliczany na zielono z poradą. `commonTraps` daje bursztynową diagnozę błędu wyliczoną z operandów; macierze i współrzędne zachowują kolejność. Wspólny `formatCleanLatex`, konstrukcje wsteczne i stress-test. Zakres, niejednoznaczności i granice Monte Carlo: [`docs/math-validation.md`](docs/math-validation.md).

- **OmniKumpel AI** pod `/omnikumpel`: lokalny solver, korepetytor bez ujawniania wyniku i sprawdzanie kroków. Panel przy zadaniu/lekcji zna kontekst; przycisk „🤖 Zapytaj OmniKumpla o ten krok” przekazuje treść zadania i wybrany krok. Tekst notatek można wysłać z brudnopisu. Ujawnienie wyniku wyłącza XP za zadanie w bieżącej sesji. Ściąga zapisuje lokalne kopie rozwiązań osobno od profilu; obsługiwane rodziny mają trening 5 podobnych zadań z seedem w URL.
- Silnik OmniKumpla: ułamki, równania liniowe/kwadratowe w liczbach rzeczywistych, macierze 2×2, zespolone, pochodne wielomianów i statystyka populacyjna. Przykłady: `x^2-5*x+6=0`, `inv([1,2;3,4])`, `(3+4i)*(2-i)`, `derivative(x^3-2*x,x)`, `stats([1,2,3,4])`. Ułamki `a/b`, nie zapis dziesiętny; do 1500 znaków, stopnia/potęgi 8 i 50 obserwacji. Nie rozpoznaje dowolnych zadań tekstowych ani dowodów. Trening pochodnych sprawdza wskazany liczbowy punkt kontrolny, nie dowolny zapis funkcji.
- Opcjonalny Gemini / OpenRouter / OpenAI / OpenCode przez `/api/omnibot`: własny klucz domyślnie tylko w pamięci, zapis na urządzeniu wyłącznie opt-in. Zdjęcie do 2 MB trafia do dostawcy dopiero po kliknięciu; odczyt wymaga edycji/potwierdzenia. Komentarz LLM nie jest matematycznie zweryfikowany; korepetytor działa deterministycznie lokalnie. Konfiguracja, koszty dostawców i granice bezpieczeństwa: [`docs/omnikumpel-ai.md`](docs/omnikumpel-ai.md). Bez live testów dostawców — testy używają mocków. Backup profilu nie obejmuje przypięć ani kluczy AI.

- Prawdziwe adresy App Router: `/`, `/sciezka`, `/zadania`, `/powtorki`, `/laboratorium`, `/sprawdzian`, `/lekcja/<id>`. Sidebar używa `next/link` z prefetchingiem; Wstecz/Dalej i bezpośrednie wejście odtwarzają właściwy widok. Wspólny layout zachowuje brudnopis i aktywną szybką powtórkę. Menu, poziomy nauki i cztery perspektywy są w HTML od razu; nie ma blokady `mounted` dla tej struktury.
- Dostępność i mobile: `<main id="main" tabIndex={-1}>`, poprawny `progressbar` XP, grupa poziomów nauki, `nav` „Odkrywaj matematykę” z linkiem do wszystkich 60 lekcji, przycisk menu z `aria-expanded` oraz dolny pasek 5 skrótów na ekranach do 768 px. Karta sprawdzianu ma bezpośredni link do trybu ratunkowego.
- Bezpieczeństwo i SEO: nagłówki `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` i `Referrer-Policy` dla wszystkich tras; sekrety wyłącznie po stronie serwera. `/robots.txt` zezwala na indeksację, a `/sitemap.xml` zawiera 7 głównych tras i wszystkie 60 mikro-lekcji. KaTeX renderuje z `trust: false`.
- Kopia zapasowa z nagłówka: bezpośredni modal obok serii dni. Eksport do `.json` albo kodu Base64, import z wklejonego kodu lub pliku. Pełna walidacja przed zastąpieniem postępu; ten sam wersjonowany format co w profilu.
- Smart Math Bar na Dashboardzie i w Ctrl/Cmd+K: dokładna arytmetyka ułamków, równania liniowe z `x` i wyznaczniki 2×2 (`det([1,2;3,4])`), objaśnione kroki i seria 10 faktycznie podobnych przykładów. To ograniczony, bezpieczny solver, nie uniwersalny CAS. Potęgi, funkcje, równania nieliniowe i zapis dziesiętny nie są obsługiwane w tym pasku; ułamki wpisuj jako `a/b`.
- „Kopiuj link” w Zadaniach zapisuje temat, trudność i ziarno w URL. Aktualna wersja `v=2` odtwarza ten sam przykład po przeładowaniu i na drugim urządzeniu, również dla rodzin Smart Math i OmniKumpla. Stare `v=1` są jawnie odrzucane po zmianie generatorów, zamiast odtwarzać inne zadanie. Link nie zapisuje odpowiedzi ani danych profilu; wadliwy link wyświetla komunikat i umożliwia nowy trening.
- Tłumacz 29 symboli w Laboratorium oraz podręczny widżet w lekcjach i zadaniach: wymowa po polsku, proste znaczenie i konkretny przykład.
- „Rentgen Wzoru” w lekcji i kartach wzorów: domyślnie wyłączony przełącznik, kolorowe symbole i zgodna legenda. Adnotacje nie zmieniają struktury matematycznej wzoru; nieznane symbole mają ostrożny opis zależny od kontekstu, nie pozorną definicję.
- Audyt 60 generatorów: poprawione konstrukcje wsteczne na poziomach 1–3 tam, gdzie wcześniej powstawały niepotrzebnie niewygodne wyniki, wspólny cleaner LaTeX i komunikaty typowych pułapek (dodawanie ułamków, znak wyznacznika, brak składnika `2ab`). Szczegóły i świadomie zachowane ułamki/π/√2/√3: [`docs/generator-audit.md`](docs/generator-audit.md).

- Responsywny dashboard Bento/Glass, nawigacja, wyszukiwarka Ctrl/Cmd+K, pięć motywów, ograniczenie animacji zgodnie z preferencją systemową.
- Dashboard jest widoczny od pierwszego HTML, również bez JavaScriptu: menu, trzy poziomy nauki, sześć kierunków i podgląd perspektyw. Suwak promienia 1–10 zmienia okrąg SVG; Metafora / Przepis / Obraz / Definicja przełączają wyjaśnienie ułamka bez opuszczania strony.
- Wyszukiwarka w headerze obejmuje lekcje, ich generatory i narzędzia laboratorium. Strzałki i Enter wybierają wynik; wynik generatora otwiera konkretny podtemat, a wynik narzędzia właściwą zakładkę.
- Awatar otwiera profil: imię, inicjał, motywy, eksport/import postępów JSON i reset z potwierdzeniem. Import najpierw waliduje plik i pokazuje podgląd; niepoprawny plik nie nadpisuje danych. Powrót do ostatniej lekcji jest połączony z głównym Hero; poziomy i działy są zaraz pod statystykami XP.
- 60 mikro-lekcji w sześciu działach: ułamki zwykłe, macierze, liczby zespolone oraz trzy ścieżki maturalne (liczby i algebra, funkcje i ciągi, geometria i dane). Każda: ELI5, tryb szkolny, wizualny i akademicki, przykład, pułapki, generator z 5 poziomami, podpowiedzi i rozwiązanie.
- Interaktywne modele ułamka, indeksów macierzy i płaszczyzny Gaussa. To modele podstawowe wspólne dla działu; opis konkretnej operacji znajduje się w notatce. Lekcje maturalne mają opis wizualny w treści, bez podstawiania niepasującego widgetu z innego działu.
- Proceduralne losowanie, sprawdzanie wartości i równoważności obsługiwanego zapisu, podpowiedź najprostszej postaci zamiast odrzucania nieskróconego poprawnego ułamka, klawiatura matematyczna i brudnopis.
- „Zadania” w menu: centrum treningowe z filtrami poziomu, działu, podtematu, trudności 1–5 lub mieszanej oraz trybami pojedynczego zadania, serii 10/20 i nieskończonego treningu. Nowe zadania pochodzą z `masterGenerator` obejmującego wszystkie 60 mikro-tematów; każde ma walidację, podpowiedzi i pełne kroki z dodatkowym „Nie rozumiem tego kroku”.
- Drzewo umiejętności z rzeczywistymi zależnościami `[[Wikilinks]]`, bez blokowania lekcji.
- Tablice wzorów z przykładami, kalkulator macierzy 2×2, wykres funkcji kwadratowej/liniowej ze sliderami, konfigurowalny egzamin z czasem i analizą tematów.
- XP, poziomy, seria dni nauki i powtórki rozłożone w czasie. Opanowanie lekcji oznacza 5 samodzielnie rozwiązanych zadań; ujawnienie rozwiązania wyłącza XP za dane zadanie. Jeden problem nie daje XP wielokrotnie.
- Manifest PWA, ikony i service worker dla wersji produkcyjnej. Fonty Inter i JetBrains Mono są lokalne, z dołączonymi licencjami OFL.
- Brudnopis Pro v2: canvas HTML5 z DPR i `ResizeObserver`, wygładzaniem linii, kratką/kropkami/czystą tablicą, pisakiem, zakreślaczem, gumką, liniami, osiami, tekstem/wzorami, cofaniem i ponawianiem oraz pan/zoom. Panel można przełączyć na 50% / 70% / pełny ekran; na małym ekranie działa jako modal z blokadą tła i fokusu.
- Smooth Calculator w brudnopisie: tryb naukowy i akademicki, taśma historii, szablony macierzy/liczb zespolonych/statystyki, obsługa klawiatury i Framer Motion. Wynik jednym kliknięciem trafia do pola odpowiedzi albo notatek; kalkulator działa na zwalidowanym AST i białej liście funkcji, nie jest solverem równań symbolicznych.
- Podglądy `[[Wikilinks]]`: najedź lub ustaw fokus klawiaturą, aby zobaczyć definicję i wzór z powiązanej notatki. Enter/kliknięcie otwiera lekcję; na ekranie dotykowym pierwszy dotyk pokazuje podgląd, drugi otwiera lekcję. Escape zamyka dymek. Obsługiwane są ID, tytuły, nazwy plików oraz `[[cel#sekcja|etykieta]]` (podgląd całej notatki).
- „Kolokwium / Sprawdzian jutro” na Dashboardzie: wybór działów, wzory i pułapki z 12 podstawowych lekcji, po 2 losowane zadania na dział (maksymalnie 6), analiza po oddaniu i nowy zestaw. To powtórka fundamentów, nie prognoza egzaminu ani pełne pokrycie działu.
- Nowa partia maturalna powstała na podstawie arkusza CKE `MMAP-P0-100-2608` (poziom podstawowy, termin poprawkowy, 24.08.2026): 30 typów zadań, 30 mikro-lekcji i 30 osobnych generatorów. Mapa zadań i granice: [`docs/matura-2026-analiza.md`](docs/matura-2026-analiza.md).

## Ważne granice

**Brudnopis, kalkulator i szybki test są sesyjne.** Notatki, rysunek i bloki tekstowe pozostają po zamknięciu panelu, zmianie zadania i przejściu do innej lekcji, ale znikają po odświeżeniu. Rysunek nie jest rozpoznawany jako matematyka. Tekstowy checker porównuje wartości tylko przy aktywnym zadaniu ćwiczeniowym; w laboratorium i szybkiej powtórce brudnopis służy do swobodnych notatek. Dla płynności: do 400 kresek (do 3200 punktów każda), 16 000 znaków notatek, 160 znaków na blok tekstowy i sprawdzanie pierwszych 100 wierszy. Kalkulator ma limit 500 znaków i 16 wpisów historii; jego stan nie jest zapisywany trwale. Szybki test nie przyznaje XP, zachowuje odpowiedzi przy otwieraniu lekcji i wracaniu do powtórki; odświeżenie strony je usuwa. Wybór działów jest zablokowany w trakcie testu, a zmiana wyboru po oddaniu zaczyna nową powtórkę.

**To nie jest uniwersalny CAS ani Photomath.** Sprawdzamy wartości ograniczonych wyrażeń liczbowych, macierzowych i zespolonych. Brudnopis porównuje każdy wiersz z wartością wyniku; nie dowodzi poprawności przekształceń równań ani zachowania dziedziny. Obsługiwane są m.in. `sqrt`, `abs`, `conj`, `det`, `inv`, `transpose`, `trace`, stałe `i`, `pi`, `e`. Checker nie wykonuje kodu użytkownika ani dowolnego `mathjs.evaluate`; kalkulator używa `evaluate` wyłącznie po walidacji AST i na białej liście funkcji, z limitem 500 znaków. Nie rozwiązuje równań symbolicznych, nie przyjmuje przypisań, importów ani jednostek. Symbole α i ∫ na klawiaturze nie oznaczają obsługi całkowania.

**„Nieskończone” oznacza brak limitu losowań**, nie matematycznie nieskończony zbiór w obrębie poziomu. Parametry są ograniczone; zadania mogą się powtarzać. Poziomy 4–5 macierzy obejmują również 3×3; szczegółowe notatki o wyznacznikach i odwrotności uczą na 2×2, a hinty wyjaśniają rozwinięcie przez dopełnienia. W przyszłości potrzebne są odrębne lekcje metod 3×3.

**Pamięć jest lokalna, backup jest przenośny.** `localStorage` przechowuje postęp, profil i motyw tylko w tej przeglądarce; brak kont, automatycznej synchronizacji i serwerowego magazynu postępów. Opcjonalne AI korzysta z serwerowego gatewaya, nie przechowuje tam profilu. Przed wyczyszczeniem danych lub zmianą urządzenia wybierz awatar → „Eksportuj postępy (.json)”; na drugim urządzeniu wybierz „Importuj postępy” i potwierdź zastąpienie. Backup obejmuje XP, rozwiązane zadania, historię przyznanego XP, dni aktywności, powtórki, profil, motyw i ostatnią lekcję — nie sesyjne notatki/rysunki ani wyniki egzaminów. Powtórki: pierwszy sukces za 1 dzień, drugi udany dzień za 3, kolejne odstępy rosną do roku; błędna odpowiedź resetuje odstęp do dnia. Wiele zadań tego samego dnia nie przyspiesza harmonogramu. Wyniki egzaminów są sesyjne i nie przyznają XP.

**Offline wymaga pierwszego uruchomienia online w produkcji.** Poczekaj na instalację service workera i pobranie zasobów; dopiero wtedy aplikacja i zawarte w niej lekcje działają bez sieci. Nieukończona instalacja może pokazać jedynie ekran offline. W trybie developerskim SW jest wyłączony. Aktualizacje treści wymagają połączenia i ponownego builda; przeglądarka może usunąć cache.

**Partia maturalna nie jest pełnym kursem do matury.** Obejmuje 30 typów z jednego arkusza CKE i uczy potrzebnej teorii, ale nie wyczerpuje całej podstawy programowej ani nie jest prognozą przyszłych egzaminów. Generator sprawdza liczbowy punkt kontrolny (np. najmniejszą liczbę całkowitą, sumę pierwiastków, współczynnik, długość, prawdopodobieństwo), a nie pełny dowód, przedział lub przekształcenie symboliczne. Zadania dowodowe są ćwiczone rachunkowo i wyjaśniane symbolicznie; aplikacja nie ocenia dowodu. Szczegóły: [`docs/matura-2026-analiza.md`](docs/matura-2026-analiza.md).

To nadal startowy zbiór, nie pełny program matematyki. Źródła i luki: [`docs/curriculum-sources.md`](docs/curriculum-sources.md).

## Edycja notatek

```
curriculum_vault/
  Ulamki/      # 10 notatek
  Macierze/    # 10 notatek
  Zespolone/   # 10 notatek
  Matura/
    Liczby/    # 10 notatek — liczby i algebra
    Funkcje/   # 10 notatek — funkcje i ciągi
    Geometria/ # 10 notatek — geometria i dane
src/generators/   # rodziny generatorów, rejestr i masterGenerator
src/lib/vaultParser.ts
inbox_materialy/  # prywatne materiały użytkownika, ignorowane przez Git
```

Korzystaj z `SZABLON_LEKCJI.md`. Parser wymaga frontmatter, sekcji 1–7, istniejącego `generator_id`, poprawnych wikilinków i braku cykli wymagań. Nazwy notatek, tytuły i ID mogą być celami wikilinków. Nowy temat wymaga dodania generatora i jego ID do rejestru oraz walidatora. Błąd notatki przerywa build zamiast wyświetlać niekompletną lekcję.

Notatki są czytane po stronie serwera podczas builda. **Vercel nie czyta Twojego dysku ani aplikacji Obsidian.** Commit/push notatek z repo i nowy deployment aktualizują treść na stronie. Lokalnie po edycji notatki odśwież stronę w `dev`.

## GitHub i Vercel

Repozytorium: https://github.com/Oliwier-w/omnimatma. Produkcja: https://omnimatma.vercel.app. Push na `main` uruchamia wdrożenie przez integrację Vercel z GitHubem.

```powershell
git add .
git commit -m "Update OmniMatma"
git push origin main
```

W Vercel wybierz **Import Git Repository → Next.js**, katalog główny repo, Node.js 24.x, build `npm run build`. Nie są wymagane zmienne środowiskowe. `.obsidian`, prywatny inbox, `node_modules` i `.next` są ignorowane. Przed publikacją sprawdź treści edukacyjne; jest to autorski starter, nie certyfikowany kurs.

## Decyzje techniczne

- `gray-matter`: YAML i czytelny błąd frontmatter; prosty renderer treści obsługuje akapity, pogrubienie, nagłówki i matematykę, bez surowego HTML/wykonywania Markdown.
- `mathjs`: parser AST i wybrane operacje; własna lista dozwolonych węzłów i limity. Checker nie używa ogólnego evaluatora; kalkulator dopuszcza `evaluate` tylko po walidacji AST i białej liście funkcji. Smart Math używa własnej dokładnej arytmetyki BigInt i rozwiązuje wyłącznie jawnie obsługiwane rodziny, w tym równania liniowe.
- `framer-motion`, `lucide-react`, `canvas-confetti`, Tailwind: animacje, ikony, feedback i warstwa prezentacji. KaTeX renderuje matematykę z `trust: false`.
- Playwright jest wyłącznie zależnością developerską do regresji UI/offline. Brak zewnętrznych wywołań podczas nauki i testów jednostkowych.
