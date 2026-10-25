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
```

Zatrzymaj `dev` przed `build` — oba korzystają z `.next`. Testy E2E uruchamiają własny serwer produkcyjny na porcie 3100. Nie są częścią szybkiego `check`.

## Co działa

- Responsywny dashboard Bento/Glass, nawigacja, wyszukiwarka Ctrl/Cmd+K, pięć motywów, ograniczenie animacji zgodnie z preferencją systemową.
- 30 mikro-lekcji w trzech działach: ułamki zwykłe, macierze, liczby zespolone. Każda: ELI5, tryb szkolny, wizualny i akademicki, przykład, pułapki, generator z 5 poziomami, podpowiedzi i rozwiązanie.
- Interaktywne modele ułamka, indeksów macierzy i płaszczyzny Gaussa. To modele podstawowe wspólne dla działu; opis konkretnej operacji znajduje się w notatce.
- Proceduralne losowanie, sprawdzanie wartości, wymuszanie postaci skróconej tam, gdzie wymaga jej zadanie, klawiatura matematyczna i brudnopis.
- Drzewo umiejętności z rzeczywistymi zależnościami `[[Wikilinks]]`, bez blokowania lekcji.
- Tablice wzorów z przykładami, kalkulator macierzy 2×2, wykres funkcji kwadratowej/liniowej ze sliderami, konfigurowalny egzamin z czasem i analizą tematów.
- XP, poziomy, seria dni nauki i powtórki rozłożone w czasie. Opanowanie lekcji oznacza 5 samodzielnie rozwiązanych zadań; ujawnienie rozwiązania wyłącza XP za dane zadanie. Jeden problem nie daje XP wielokrotnie.
- Manifest PWA, ikony i service worker dla wersji produkcyjnej. Fonty Inter i JetBrains Mono są lokalne, z dołączonymi licencjami OFL.

## Ważne granice pierwszej wersji

**To nie jest uniwersalny CAS ani Photomath.** Sprawdzamy wartości ograniczonych wyrażeń liczbowych, macierzowych i zespolonych. Brudnopis porównuje każdy wiersz z wartością wyniku; nie dowodzi poprawności przekształceń równań ani zachowania dziedziny. Obsługiwane są m.in. `sqrt`, `abs`, `conj`, `det`, `inv`, `transpose`, `trace`, stałe `i`, `pi`, `e`. Nie wykonujemy kodu użytkownika ani dowolnego `mathjs.evaluate`. Symbole α i ∫ na klawiaturze nie oznaczają obsługi całkowania.

**„Nieskończone” oznacza brak limitu losowań**, nie matematycznie nieskończony zbiór w obrębie poziomu. Parametry są ograniczone; zadania mogą się powtarzać. Poziomy 4–5 macierzy obejmują również 3×3; szczegółowe notatki o wyznacznikach i odwrotności uczą na 2×2, a hinty wyjaśniają rozwinięcie przez dopełnienia. W przyszłości potrzebne są odrębne lekcje metod 3×3.

**Pamięć jest lokalna.** `localStorage` przechowuje postęp i motyw tylko w tej przeglądarce; brak kont, synchronizacji między urządzeniami i backendu. Wyczyszczenie danych przeglądarki usuwa postęp. Powtórki: pierwszy sukces za 1 dzień, drugi udany dzień za 3, kolejne odstępy rosną do roku; błędna odpowiedź resetuje odstęp do dnia. Wiele zadań tego samego dnia nie przyspiesza harmonogramu. Wyniki egzaminów są sesyjne i nie przyznają XP.

**Offline wymaga pierwszego uruchomienia online w produkcji.** Poczekaj na instalację service workera i pobranie zasobów; dopiero wtedy aplikacja i zawarte w niej lekcje działają bez sieci. Nieukończona instalacja może pokazać jedynie ekran offline. W trybie developerskim SW jest wyłączony. Aktualizacje treści wymagają połączenia i ponownego builda; przeglądarka może usunąć cache.

To startowy zbiór, nie pełny program matematyki. Źródła i luki: [`docs/curriculum-sources.md`](docs/curriculum-sources.md).

## Edycja notatek

```
curriculum_vault/
  Ulamki/      # 10 notatek
  Macierze/    # 10 notatek
  Zespolone/   # 10 notatek
src/generators/   # rodziny generatorów i rejestr
src/lib/vaultParser.ts
inbox_materialy/  # prywatne materiały użytkownika, ignorowane przez Git
```

Korzystaj z `SZABLON_LEKCJI.md`. Parser wymaga frontmatter, sekcji 1–7, istniejącego `generator_id`, poprawnych wikilinków i braku cykli wymagań. Nazwy notatek, tytuły i ID mogą być celami wikilinków. Nowy temat wymaga dodania generatora i jego ID do rejestru oraz walidatora. Błąd notatki przerywa build zamiast wyświetlać niekompletną lekcję.

Notatki są czytane po stronie serwera podczas builda. **Vercel nie czyta Twojego dysku ani aplikacji Obsidian.** Commit/push notatek z repo i nowy deployment aktualizują treść na stronie. Lokalnie po edycji notatki odśwież stronę w `dev`.

## GitHub i Vercel

Repozytorium Git jest zainicjowane lokalnie na `main`; nie utworzono zdalnego repo ani deploymentu.

```powershell
git add .
git commit -m "Initial commit: OmniMatma app ready"
git remote add origin https://github.com/TWOJ_LOGIN/omnimatma.git
git push -u origin main
```

W Vercel wybierz **Import Git Repository → Next.js**, katalog główny repo, Node.js 24.x, build `npm run build`. Nie są wymagane zmienne środowiskowe. `.obsidian`, prywatny inbox, `node_modules` i `.next` są ignorowane. Przed publikacją sprawdź treści edukacyjne; jest to autorski starter, nie certyfikowany kurs.

## Decyzje techniczne

- `gray-matter`: YAML i czytelny błąd frontmatter; prosty renderer treści obsługuje akapity, pogrubienie, nagłówki i matematykę, bez surowego HTML/wykonywania Markdown.
- `mathjs`: parser AST i wybrane operacje; własna lista dozwolonych węzłów i limity. Nie używamy ogólnego evaluator/solver.
- `framer-motion`, `lucide-react`, `canvas-confetti`, Tailwind: animacje, ikony, feedback i warstwa prezentacji. KaTeX renderuje matematykę z `trust: false`.
- Playwright jest wyłącznie zależnością developerską do regresji UI/offline. Brak zewnętrznych wywołań podczas nauki i testów jednostkowych.
