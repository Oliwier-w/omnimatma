# OmniKumpel — opcjonalne AI / BYOK

Lokalny silnik jest źródłem prawdy. AI nie jest wymagane do obliczeń. Integracja nie uruchamia OpenCode, lokalnego serwisu ani SDK i nie instaluje zależności.

## Kontrakt UI

```ts
import { requestOmniAI, OMNI_MAX_IMAGE_BYTES } from "@/lib/omnikumpelAI";
import type { OmniAISettings, OmniAIMode } from "@/lib/omnikumpelTypes";

const result = await requestOmniAI({
  settings, // { provider: 'gemini'|'openrouter'|'openai'|'opencode', model, apiKey, remember }
  mode,     // 'explain' | 'tutor' | 'ocr'
  input,    // tekst, maks. 600 znaków; wymagany w explain/tutor
  image,    // tylko OCR: { mimeType: 'image/png'|'image/jpeg'|'image/webp', data: surowyBase64 }
}, abortController.signal);
// Promise<{ text: string; verified: boolean }>
```

Helper wykonuje tylko `POST /api/omnibot`, bez zewnętrznych żądań i bez zapisu ustawień. `remember` nie jest wysyłane. Domyślnie trzymaj BYOK wyłącznie w pamięci sesji komponentu, nie w sessionStorage/localStorage. Ewentualne zapamiętywanie wymaga osobnej świadomej zgody UI i ostrzeżenia o ryzyku dostępu skryptów do klucza. Klucz trafia przez HTTPS do serwera aplikacji, następnie wyłącznie do wybranego dostawcy. Nigdy nie umieszczaj go w URL ani logach.

### Prawda i podpowiedzi

- `explain`: serwer ponownie wywołuje `solveOmniProblem(input)`, odmawia dla wyniku nieobsługiwanego, niepoprawnego lub nieścisłego. Dokładny wynik i lokalne kroki trafiają do system promptu. LLM dostarcza **nieweryfikowaną narrację** (`verified: false`), nie nowy wynik. UI musi nadal osobno pokazywać kanoniczny wynik lokalny i ostrzeżenie, że opis AI może zawierać błędy. Nie renderuj odpowiedzi jako HTML.
- `tutor`: także przelicza zadanie lokalnie. Zwraca stałą lokalną wskazówkę bez odpowiedzi, bez pełnego rozwiązania, bez żądania do dostawcy i bez wymogu klucza (`verified: true`). To oznacza deterministyczną lokalną wskazówkę, a nie zweryfikowany tekst LLM. Ta celowo ogólna wskazówka nie korzysta z `tutorHint`, które mogłoby zdradzić wynik.
- `ocr`: wyłącznie transkrypcja, nigdy automatyczne rozwiązanie (`verified: false`). **Wyślij obraz dopiero po osobnym kliknięciu przycisku z jawną zgodą na przekazanie go dostawcy**. Nie wysyłaj przy wyborze pliku ani renderowaniu komponentu. Pokaż edytowalną transkrypcję jako niezaufaną i wymagaj osobnego zatwierdzenia przed lokalnym obliczeniem. `input` nie jest przesyłane dostawcy w tym trybie.

`OMNI_MAX_IMAGE_BYTES = 2 * 1024 * 1024` ogranicza rozmiar surowego pliku przed kodowaniem. Bez prefiksu `data:`. Serwer sprawdza kanoniczny base64, MIME i sygnaturę PNG/JPEG/WebP; nie jest to pełny dekoder ani skaner bezpieczeństwa obrazu.

## Dostawcy

Wyłącznie stała allowlista, bez `baseURL`, własnych adresów, proxy ani podążania za przekierowaniami:

| provider | endpoint | opcjonalny sekret serwera |
| --- | --- | --- |
| gemini | `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent` | `GEMINI_API_KEY` |
| openrouter | `https://openrouter.ai/api/v1/chat/completions` | `OPENROUTER_API_KEY` |
| openai | `https://api.openai.com/v1/chat/completions` | `OPENAI_API_KEY` |
| opencode | `https://opencode.ai/inference/openai/v1/chat/completions` | `OPENCODE_API_KEY` |

Dokumentacja V2: [providers](https://opencode.ai/v2/docs/providers/), [index](https://opencode.ai/v2/llms.txt), [hostowane inference](https://opencode.ai/v2/docs/console/api/inference/). Aktualna V2 opisuje hostowane Console inference zamiast starszego nazewnictwa Zen. Używamy udokumentowanej zgodności Chat Completions, nie starszego `/zen/v1` ani lokalnego API OpenCode. Wybierz model obsługujący **Chat Completions**, nie GPT/Claude/Gemini obsługiwane przez inne rodziny endpointów OpenCode. Darmowe modele OpenCode są według dokumentacji dostępne tylko wewnątrz OpenCode; ten zewnętrzny klient może wymagać płatnego modelu/salda lub Go. BYOK nie oznacza darmowych usług zewnętrznych. OCR wymaga modelu ze wsparciem obrazów. Błędy modeli nie powodują automatycznego przełączenia dostawcy.

Model: maks. 100 znaków, segmenty `[A-Za-z0-9][A-Za-z0-9_.:-]*` rozdzielone `/`; Gemini dopuszcza tylko jeden segment. Nie przyjmujemy pełnych URL. Wybór modelu nie zmienia hosta. Warianty modeli i ich dostępność zależą od konta dostawcy.

Serwerowe sekrety są domyślnie **wyłączone**. Wyłącznie jawne `OMNIKUMPEL_ALLOW_SERVER_KEY=true` włącza odczyt odpowiedniej zmiennej z tabeli, jeśli użytkownik nie podał BYOK. Nie stosuj `NEXT_PUBLIC_*`. Publiczne wdrożenie ze wspólnym kluczem wymaga dodatkowej kontroli dostępu i limitów wydatków po stronie operatora — sam ten endpoint nie jest systemem autoryzacji.

## Ograniczenia transportu

- POST JSON: `{ provider, model, apiKey?, mode, input?, image? }`. Nieznane pola (także przesłana odpowiedź lokalna) są odrzucane.
- Body odczytywane strumieniowo do 3 MiB również bez Content-Length, przed JSON.parse. Maks. 2 MiB obrazu, 600 znaków wejścia, 512 znaków klucza.
- 20 sekund na całe żądanie zewnętrzne wraz z odczytem body; AbortSignal użytkownika przekazywany do zewnętrznego fetch.
- Body dostawcy maks. 128 KiB; tekst maks. 12000 znaków; brak streamowania odpowiedzi AI do przeglądarki.
- Odpowiedzi sukces/błąd i odmowy innych metod HTTP mają `Cache-Control: no-store`. Błędy `{ error: stabilnyPolskiKomunikat }`, bez surowych wyjątków, odpowiedzi dostawcy i sekretów. Helper rzuca `Error` ze stabilnym komunikatem lub `AbortError` przy anulowaniu.
- Odrzucane obce Origin i `Sec-Fetch-Site: cross-site`. Brak Origin pozostaje dopuszczalny dla klientów nieprzeglądarkowych; to nie uwierzytelnianie.
- Prosty limit 10 żądań/min na skrót klucza w pamięci procesu (bez klucza wspólny koszyk). Maks. 10000 koszyków; stare usuwane przy żądaniu. Nie przechowuje surowego klucza, wejścia ani obrazu. Limit nie jest rozproszony, resetuje się z procesem i jest możliwy do obejścia zmianą klucza. Wspólny klucz serwera ma wspólny limit. Produkcja powinna dodać zewnętrzne limity i autoryzację; nie ufamy spoofowalnym nagłówkom IP.
- Żadne klucze, obrazy ani prompty nie są logowane przez implementację; operator musi także wyłączyć rejestrowanie body w infrastrukturze. Retencja u dostawcy podlega jego zasadom.

## Testy bez kluczy i połączeń z dostawcami

`npx tsx --test tests/omnikumpelAI.test.ts` — testy przechwytują fetch, sprawdzają allowlistę, lokalną prawdę w system prompt, deterministyczny tutor, OCR, limity body/odpowiedzi, deadline, origin, limit procesu, błędy i redakcję sekretów. Nie wymagają prawdziwych kluczy.
