import type { OmniAIMode, OmniAISettings } from "./omnikumpelTypes";

export const OMNI_MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export type OmniAIImage = { mimeType: "image/png" | "image/jpeg" | "image/webp"; data: string };
export type OmniAIResponse = { text: string; verified: boolean };

export const OMNI_AI_ERRORS = {
  invalid: "Nieprawidłowe dane żądania AI.",
  size: "Przekroczono dozwolony rozmiar danych AI.",
  origin: "Żądanie AI musi pochodzić z tej samej strony.",
  rate: "Zbyt wiele żądań AI. Spróbuj ponownie za minutę.",
  key: "Dodaj własny klucz API w ustawieniach AI. Lokalny kalkulator nadal działa.",
  unsupported: "Nie mogę zweryfikować tego zadania lokalnie. Wybierz obsługiwany zapis zadania.",
  timeout: "Upłynął czas oczekiwania na AI. Spróbuj ponownie.",
  provider: "Dostawca AI nie odpowiedział poprawnie. Sprawdź klucz i model lub spróbuj później.",
  network: "Nie udało się połączyć z AI. Lokalny kalkulator nadal działa.",
} as const;

/** No persistence: settings.remember is deliberately not transmitted or acted upon. */
export async function requestOmniAI(
  { settings, mode, input, image }: {
    settings: OmniAISettings; mode: OmniAIMode; input?: string; image?: OmniAIImage;
  },
  signal?: AbortSignal,
): Promise<OmniAIResponse> {
  try {
    const response = await fetch("/api/omnibot", {
      method: "POST", signal, cache: "no-store", credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: settings.provider, model: settings.model, apiKey: settings.apiKey, mode, input, image }),
    });
    const body: unknown = await response.json();
    if (!response.ok) {
      const error = body && typeof body === "object" && "error" in body ? body.error : undefined;
      throw new Error(Object.values(OMNI_AI_ERRORS).includes(error as never) ? String(error) : OMNI_AI_ERRORS.network);
    }
    if (!body || typeof body !== "object" || !("text" in body) || typeof body.text !== "string"
      || body.text.length > 12000 || !("verified" in body) || typeof body.verified !== "boolean") {
      throw new Error(OMNI_AI_ERRORS.network);
    }
    return { text: body.text, verified: body.verified };
  } catch (error) {
    if (signal?.aborted) throw new DOMException("Anulowano żądanie AI.", "AbortError");
    if (error instanceof Error && Object.values(OMNI_AI_ERRORS).includes(error.message as never)) throw error;
    throw new Error(OMNI_AI_ERRORS.network);
  }
}
