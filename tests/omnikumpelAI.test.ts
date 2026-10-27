import test from "node:test";
import assert from "node:assert/strict";
import { POST, GET, HEAD, PUT, PATCH, DELETE, OPTIONS } from "../src/app/api/omnibot/route";
import { solveOmniProblem } from "../src/lib/omnikumpelEngine";
import { OMNI_AI_ERRORS, OMNI_MAX_IMAGE_BYTES, requestOmniAI } from "../src/lib/omnikumpelAI";
import type { OmniAISettings } from "../src/lib/omnikumpelTypes";

const settings: OmniAISettings = { provider: "openai", model: "test-model", apiKey: "test-only-secret-key", remember: false };
const payload = (extra: Record<string, unknown> = {}) => ({ provider: settings.provider, model: settings.model, apiKey: settings.apiKey, mode: "explain", input: "2+3", ...extra });
function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://omni.example/api/omnibot", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://omni.example", ...headers }, body: JSON.stringify(body) });
}
const chat = (text = "Wyjaśnienie lokalnego wyniku.") => Response.json({ choices: [{ message: { content: text } }] });
const png = { mimeType: "image/png", data: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]).toString("base64") };

test("Omni AI: isolated mocked providers and bounded transport", async (t) => {
  // Expire process-local rate buckets without adding test-only exports to a Next route.
  let clock = 0;
  t.mock.method(Date, "now", () => { clock += 60001; return clock; });

  await t.test("all four allowlisted endpoints; local truth is recomputed into the system prompt", async (t) => {
    for (const [provider, url] of [
      ["openai", "https://api.openai.com/v1/chat/completions"],
      ["openrouter", "https://openrouter.ai/api/v1/chat/completions"],
      ["opencode", "https://opencode.ai/inference/openai/v1/chat/completions"],
      ["gemini", "https://generativelanguage.googleapis.com/v1beta/models/test-model:generateContent"],
    ]) {
      const mock = t.mock.method(globalThis, "fetch", async (urlValue: string | URL | Request, init?: RequestInit) => {
        assert.equal(String(urlValue), url);
        assert.equal(init?.redirect, "error");
        assert.equal(init?.cache, "no-store");
        const body = JSON.parse(String(init?.body));
        const system = provider === "gemini" ? body.systemInstruction.parts[0].text : body.messages[0].content;
        const local = solveOmniProblem("2+3");
        assert.ok(system.includes(JSON.stringify(local.steps)));
        assert.ok(system.includes(JSON.stringify(local.answer)));
        assert.ok(!system.includes(settings.apiKey));
        return provider === "gemini" ? Response.json({ candidates: [{ content: { parts: [{ text: "Wyjaśnienie." }] } }] }) : chat();
      });
      const response = await POST(request(payload({ provider })));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal((await response.json()).verified, false);
      assert.equal(mock.mock.callCount(), 1);
      mock.mock.restore();
    }
  });

  await t.test("unsafe URLs, model IDs, forged results, and invalid input never reach fetch", async (t) => {
    const mock = t.mock.method(globalThis, "fetch", async () => { throw new Error("must not call"); });
    for (const extra of [{ baseURL: "http://127.0.0.1" }, { provider: "http://127.0.0.1" }, { provider: "__proto__" }, { model: "https://evil.example" }, { model: "../metadata" }, { model: "x".repeat(101) }, { model: "a?key=x" }, { provider: "gemini", model: "a/b" }, { answer: "999" }, { input: "a".repeat(1501) }, { apiKey: "key\nheader" }]) {
      const response = await POST(request(payload(extra)));
      assert.equal(response.status, 400);
      assert.equal((await response.json()).error, OMNI_AI_ERRORS.invalid);
    }
    assert.equal(mock.mock.callCount(), 0);
  });

  await t.test("tutor never calls a provider or returns the final answer", async (t) => {
    const mock = t.mock.method(globalThis, "fetch", async () => chat());
    const response = await POST(request(payload({ mode: "tutor", input: "9999+8888", apiKey: "" })));
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.verified, true);
    assert.ok(!data.text.includes("18887"));
    assert.equal(mock.mock.callCount(), 0);
  });

  await t.test("unsupported problems and absent key fail gracefully without remote calls", async (t) => {
    const mock = t.mock.method(globalThis, "fetch", async () => chat());
    const unsupported = await POST(request(payload({ input: "udowodnij hipotezę Riemanna" })));
    assert.equal(unsupported.status, 422);
    assert.equal((await unsupported.json()).error, OMNI_AI_ERRORS.unsupported);
    // An empty key is not replaced by environment secrets unless explicitly enabled.
    const previous = process.env.OMNIKUMPEL_ALLOW_SERVER_KEY;
    process.env.OMNIKUMPEL_ALLOW_SERVER_KEY = "false";
    try {
      const response = await POST(request(payload({ apiKey: "" })));
      assert.equal((await response.json()).error, OMNI_AI_ERRORS.key);
    } finally {
      if (previous === undefined) delete process.env.OMNIKUMPEL_ALLOW_SERVER_KEY;
      else process.env.OMNIKUMPEL_ALLOW_SERVER_KEY = previous;
    }
    assert.equal(mock.mock.callCount(), 0);
  });

  await t.test("upstream errors and reflected keys cannot leak secrets", async (t) => {
    for (const result of [() => Response.json({ error: settings.apiKey }, { status: 401 }), () => chat(settings.apiKey), () => { throw new Error(settings.apiKey); }, () => Response.json({ nope: true })]) {
      const mock = t.mock.method(globalThis, "fetch", async () => result());
      const response = await POST(request(payload()));
      assert.equal(response.status, 502);
      const text = await response.text();
      assert.ok(!text.includes(settings.apiKey));
      assert.equal(JSON.parse(text).error, OMNI_AI_ERRORS.provider);
      mock.mock.restore();
    }
  });

  await t.test("upstream response and text caps include chunked responses", async (t) => {
    for (const result of [
      () => chat("x".repeat(12001)),
      () => new Response("{}", { headers: { "Content-Length": String(128 * 1024 + 1) } }),
      () => new Response(new ReadableStream({ start(c) { c.enqueue(new Uint8Array(70000)); c.enqueue(new Uint8Array(70000)); c.close(); } })),
    ]) {
      const mock = t.mock.method(globalThis, "fetch", async () => result());
      const response = await POST(request(payload()));
      assert.equal(response.status, 502);
      assert.equal((await response.json()).error, OMNI_AI_ERRORS.provider);
      mock.mock.restore();
    }
  });

  await t.test("20-second deadline bounds fetch even if a mock ignores abort", async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let signal: AbortSignal | null | undefined;
    let started!: () => void;
    const ready = new Promise<void>((resolve) => { started = resolve; });
    t.mock.method(globalThis, "fetch", async (_url: string | URL | Request, init?: RequestInit) => { signal = init?.signal; started(); return new Promise<Response>(() => {}); });
    const pending = POST(request(payload()));
    await ready;
    t.mock.timers.tick(20000);
    const response = await pending;
    assert.equal(response.status, 504);
    assert.equal((await response.json()).error, OMNI_AI_ERRORS.timeout);
    assert.equal(signal?.aborted, true);
  });

  await t.test("OCR requires validated signatures, bounded raw bytes and valid base64", async (t) => {
    const mock = t.mock.method(globalThis, "fetch", async () => chat());
    for (const image of [{ ...png, data: "aGVsbG8=" }, { ...png, mimeType: "image/jpeg" }, { ...png, data: "%%%=" }, { ...png, data: "data:image/png;base64," + png.data }, { ...png, data: Buffer.alloc(OMNI_MAX_IMAGE_BYTES + 1).toString("base64") }]) {
      const response = await POST(request(payload({ mode: "ocr", image, input: undefined })));
      assert.ok([400, 413].includes(response.status));
    }
    assert.equal(mock.mock.callCount(), 0);
  });

  await t.test("OCR only transcribes, in Gemini and OpenAI-compatible image formats", async (t) => {
    for (const provider of ["openai", "gemini"]) {
      const mock = t.mock.method(globalThis, "fetch", async (_url: string | URL | Request, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body));
        if (provider === "gemini") {
          assert.match(body.systemInstruction.parts[0].text, /Nie rozwiązuj/);
          assert.deepEqual(body.contents[0].parts[1].inlineData, png);
          return Response.json({ candidates: [{ content: { parts: [{ text: "2+3" }] } }] });
        }
        assert.match(body.messages[0].content, /Nie rozwiązuj/);
        assert.equal(body.messages[1].content[1].image_url.url, `data:image/png;base64,${png.data}`);
        assert.ok(!JSON.stringify(body).includes("666"));
        return chat("2+3");
      });
      const response = await POST(request(payload({ provider, mode: "ocr", image: png, input: "666" })));
      assert.deepEqual(await response.json(), { text: "2+3", verified: false });
      mock.mock.restore();
    }
  });

  await t.test("request streaming cap applies without Content-Length", async () => {
    const stream = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new Uint8Array(1600000)); c.enqueue(new Uint8Array(1600000)); c.close(); } });
    const init: RequestInit & { duplex: string } = { method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half" };
    const response = await POST(new Request("https://omni.example/api/omnibot", init));
    assert.equal(response.status, 413);
    assert.equal(response.headers.get("cache-control"), "no-store");
  });

  await t.test("cross-site and mismatching origins are rejected", async () => {
    for (const headers of [{ Origin: "https://evil.example" }, { "Sec-Fetch-Site": "cross-site" }] as Record<string, string>[]) {
      const response = await POST(request(payload(), headers));
      assert.equal(response.status, 403);
    }
  });

  await t.test("unsupported HTTP methods also carry no-store", () => {
    for (const method of [GET, HEAD, PUT, PATCH, DELETE, OPTIONS]) {
      const response = method();
      assert.equal(response.status, 405);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal(response.headers.get("allow"), "POST");
    }
  });

  await t.test("process-local bucket limits one credential to ten requests a minute", async (t) => {
    t.mock.method(Date, "now", () => 99999999999);
    t.mock.method(globalThis, "fetch", async () => chat());
    for (let i = 0; i < 10; i++) assert.equal((await POST(request(payload({ apiKey: "rate-test-only" })))).status, 200);
    const response = await POST(request(payload({ apiKey: "rate-test-only" })));
    assert.equal(response.status, 429);
    assert.equal((await response.json()).error, OMNI_AI_ERRORS.rate);
  });

  await t.test("client uses only same-origin proxy and strips remember", async (t) => {
    t.mock.method(globalThis, "fetch", async (url: string | URL | Request, init?: RequestInit) => {
      assert.equal(url, "/api/omnibot");
      assert.equal(init?.cache, "no-store");
      assert.equal(init?.credentials, "same-origin");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.apiKey, settings.apiKey);
      assert.ok(!("remember" in body));
      return Response.json({ text: "Opis", verified: false });
    });
    assert.deepEqual(await requestOmniAI({ settings, mode: "explain", input: "2+3" }), { text: "Opis", verified: false });
  });

  await t.test("client sanitizes unknown server errors and preserves user cancellation", async (t) => {
    const mock = t.mock.method(globalThis, "fetch", async () => Response.json({ error: settings.apiKey }, { status: 502 }));
    await assert.rejects(requestOmniAI({ settings, mode: "explain", input: "2+3" }), { message: OMNI_AI_ERRORS.network });
    mock.mock.restore();
    t.mock.method(globalThis, "fetch", async () => { throw new Error(settings.apiKey); });
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(requestOmniAI({ settings, mode: "explain", input: "2+3" }, controller.signal), { name: "AbortError" });
  });
});
