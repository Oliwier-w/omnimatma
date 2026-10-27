"use client";

import { useEffect, useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, CheckCheck, ImagePlus, Lightbulb, Pin, Settings2, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
import { MathFormula } from "./MathFormula";
import MathText from "./MathText";
import { checkOmniSteps, solutionFromProblem, solveOmniProblem } from "@/lib/omnikumpelEngine";
import { OMNI_MAX_IMAGE_BYTES, requestOmniAI, type OmniAIImage } from "@/lib/omnikumpelAI";
import type { OmniAISettings, OmniContext, OmniLineCheck, OmniPracticeSpec, OmniSolution } from "@/lib/omnikumpelTypes";
import { clearOmniSettings, createOmniPin, loadOmniPins, loadOmniSettings, OMNI_DEFAULT_SETTINGS, saveOmniPins, saveOmniSettings, type OmniPin } from "@/lib/omnikumpelStore";
import "./OmniKumpel.css";
import { useOmniKumpel } from "./OmniKumpelContext";

export type OmniKumpelMode = "solver" | "tutor" | "check";
export type OmniKumpelProps = {
  context?: OmniContext;
  scratchpadNotes?: string;
  compact?: boolean;
  initialMode?: OmniKumpelMode;
  onPractice: (spec: OmniPracticeSpec) => void;
  onClose?: () => void;
};
const MODES = [
  { id: "solver", label: "Rozwiąż krok po kroku (Solver)", icon: Sparkles },
  { id: "tutor", label: "Naprowadź mnie (Korepetytor)", icon: Lightbulb },
  { id: "check", label: "Sprawdź moje rozwiązanie", icon: CheckCheck },
] as const;
const OMNI_INPUT_MAX = 1500;
const OMNI_INPUT_WARN = 1200;
const TEMPLATES = [
  ["Równanie liniowe", "2*x+3=11"], ["Równanie kwadratowe", "x^2-5*x+6=0"],
  ["Macierz odwrotna", "inv([1,2;3,4])"], ["Statystyka", "stats([1,2,3,4])"],
] as const;

function SolutionSteps({ solution }: { solution: OmniSolution }) {
  return <>
    <p className="ok-summary">{solution.summary}</p>
    {solution.status === "solved" && <>
      <div className="ok-answer"><span>{solution.exact ? "Wynik dokładny" : "Wynik"}</span>
        {solution.answerLatex ? <MathFormula value={solution.answerLatex} block /> : <p>{solution.answer}</p>}
      </div>
      <ol className="ok-steps">{solution.steps.map((step, index) => <li key={index}>
        <h3><span className="ok-number">{index + 1}</span>{step.title}</h3>
        <MathFormula value={step.latex} block />
        <details><summary>Dlaczego tak?</summary><p>{step.why}</p></details>
      </li>)}</ol>
    </>}
  </>;
}

export default function OmniKumpel({ context, scratchpadNotes = "", compact = false, initialMode = "solver", onPractice, onClose }: OmniKumpelProps) {
  const uid = useId();
  const { reveal } = useOmniKumpel();
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<OmniKumpelMode>(initialMode);
  const [input, setInput] = useState(() => (context?.prompt ?? "").slice(0, 1500));
  const [work, setWork] = useState(() => initialMode === "check" ? scratchpadNotes : "");
  const [solution, setSolution] = useState<OmniSolution | null>(null);
  const [checks, setChecks] = useState<OmniLineCheck[] | null>(null);
  const [settings, setSettings] = useState<OmniAISettings>({ ...OMNI_DEFAULT_SETTINGS });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pins, setPins] = useState<OmniPin[]>([]);
  const [pinsReady, setPinsReady] = useState(false);
  const [pinsError, setPinsError] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [settingsStatus, setSettingsStatus] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiError, setAiError] = useState("");
  const [pending, setPending] = useState<"explain" | "ocr" | null>(null);
  const [image, setImage] = useState<OmniAIImage | null>(null);
  const [imageError, setImageError] = useState("");
  const [ocrDraft, setOcrDraft] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const fileVersion = useRef(0);
  const contextId = useRef(context?.id);
  const fileInput = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function cancelAI() {
    controller.current?.abort(); controller.current = null; setPending(null);
  }
  function clearResult() {
    cancelAI(); setSolution(null); setChecks(null); setAiText(""); setAiError(""); setStatus("");
  }
  function changeInput(next: string) { clearResult(); setInput(next.slice(0, 1500)); }
  function changeMode(next: OmniKumpelMode) {
    cancelAI(); setAiText(""); setAiError(""); setChecks(null); setMode(next);
  }

  useEffect(() => {
    const storedPins = loadOmniPins();
    if (storedPins.ok) { setPins(storedPins.value); setPinsReady(true); }
    else { setStatus(storedPins.error); setPinsError(storedPins.error); }
    const storedSettings = loadOmniSettings();
    if (storedSettings.ok) setSettings(storedSettings.value);
    else setSettingsStatus(storedSettings.error);
    const updateNetwork = () => setOffline(!navigator.onLine);
    updateNetwork();
    window.addEventListener("online", updateNetwork); window.addEventListener("offline", updateNetwork);
    return () => {
      controller.current?.abort(); fileVersion.current++;
      window.removeEventListener("online", updateNetwork); window.removeEventListener("offline", updateNetwork);
    };
  }, []);

  useEffect(() => {
    if (contextId.current === context?.id) return;
    contextId.current = context?.id;
    controller.current?.abort(); controller.current = null; fileVersion.current++;
    setPending(null); setInput((context?.prompt ?? "").slice(0, 1500)); setWork("");
    setSolution(null); setChecks(null); setAiText(""); setAiError(""); setImage(null); setOcrDraft(null); setImageError(""); setStatus("");
  }, [context?.id, context?.prompt]);

  function localSolution(value = input): OmniSolution {
    return context?.problem && value === context.prompt ? solutionFromProblem(context.problem) : solveOmniProblem(value);
  }
  function solve(value = input) {
    cancelAI(); setAiText(""); setAiError(""); setChecks(null);
    try { setSolution(localSolution(value)); }
    catch { setSolution(null); setStatus("Nie udało się sprawdzić tego zapisu lokalnie. Spróbuj prostszego wyrażenia."); }
  }
  function check() {
    cancelAI(); setAiText(""); setAiError("");
    try {
      const result = localSolution(); setSolution(result);
      const trusted = context?.problem && input === context.prompt ? { answer: context.problem.answer } : undefined;
      setChecks(checkOmniSteps(input, work, trusted));
    } catch { setChecks(null); setStatus("Nie mogę zweryfikować tych obliczeń. To nie oznacza, że są poprawne."); }
  }

  async function callAI(kind: "explain" | "ocr") {
    if (mode === "tutor" || (kind === "explain" && solution?.status !== "solved") || (kind === "ocr" && !image)) return;
    cancelAI(); setAiError(""); setAiText("");
    if (offline) { setAiError("Jesteś offline. Obliczenia lokalne nadal działają; AI wymaga połączenia."); return; }
    if (!settings.apiKey.trim() || !settings.model.trim()) { setAiError("Uzupełnij własny klucz API i nazwę modelu w ustawieniach AI."); setSettingsOpen(true); return; }
    const request = new AbortController(); controller.current = request; setPending(kind);
    if (kind === "explain" && context?.problem && input === context.prompt) reveal(context.id);
    try {
      const response = await requestOmniAI({ settings, mode: kind, ...(kind === "ocr" ? { image: image! } : { input: solution!.normalized }) }, request.signal);
      if (request.signal.aborted || controller.current !== request) return;
      if (kind === "ocr") setOcrDraft(response.text.slice(0, 1500)); else setAiText(response.text);
    } catch {
      if (!request.signal.aborted) setAiError("Nie udało się uzyskać odpowiedzi AI. Sprawdź połączenie, klucz i model. Lokalny solver nadal działa.");
    } finally {
      if (controller.current === request) { controller.current = null; setPending(null); }
    }
  }

  function selectImage(file?: File) {
    if (!file) return;
    cancelAI(); setOcrDraft(null); setImage(null); setImageError("");
    const version = ++fileVersion.current;
    if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/webp") { setImageError("Wybierz zdjęcie PNG, JPEG lub WebP."); return; }
    if (file.size > OMNI_MAX_IMAGE_BYTES || !file.size) { setImageError("Zdjęcie musi mieć od 1 bajta do 2 MB."); return; }
    const mimeType = file.type;
    const reader = new FileReader();
    reader.onload = () => {
      if (version !== fileVersion.current) return;
      if (typeof reader.result !== "string") { setImageError("Nie można odczytać zdjęcia."); return; }
      setImage({ mimeType, data: reader.result.slice(reader.result.indexOf(",") + 1) });
    };
    reader.onerror = () => { if (version === fileVersion.current) setImageError("Nie można odczytać zdjęcia."); };
    reader.readAsDataURL(file);
  }
  function paste(event: ClipboardEvent<HTMLDivElement>) {
    const item = Array.from(event.clipboardData.items).find(item => item.kind === "file" && item.type.startsWith("image/"));
    if (item) { event.preventDefault(); selectImage(item.getAsFile() ?? undefined); }
  }
  function pinSolution() {
    if (!solution || solution.status !== "solved" || !pinsReady) return;
    if (context?.problem && input === context.prompt) reveal(context.id);
    const pin = createOmniPin(input, solution, crypto.randomUUID());
    if (!pin) { setStatus("Nie można zapisać tego rozwiązania."); return; }
    const saved = saveOmniPins([pin, ...pins]);
    if (saved.ok) { setPins(saved.value); setStatus("Przypięto niezmienną kopię rozwiązania. XP pozostaje bez zmian."); }
    else setStatus(saved.error);
  }
  function removePin(id: string) {
    const saved = saveOmniPins(pins.filter(pin => pin.id !== id));
    if (saved.ok) { setPins(saved.value); setRemoveId(null); setStatus("Usunięto przypięcie."); }
    else setStatus(saved.error);
  }
  function saveSettings() {
    cancelAI(); const saved = saveOmniSettings(settings);
    setSettingsStatus(saved.ok ? settings.remember ? "Ustawienia i klucz zapisano na tym urządzeniu." : "Klucz tylko w pamięci tej sesji. Trwały zapis usunięto." : saved.error);
  }
  function clearSettings() {
    cancelAI(); setSettings({ ...OMNI_DEFAULT_SETTINGS }); setAiText("");
    const cleared = clearOmniSettings(); setSettingsStatus(cleared.ok ? "Usunięto ustawienia i klucz AI." : cleared.error);
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % 3 : event.key === "ArrowLeft" ? (index + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : -1;
    if (next >= 0) { event.preventDefault(); changeMode(MODES[next].id); tabRefs.current[next]?.focus(); }
  }
  const firstFailure = checks?.findIndex(line => line.status === "incorrect" || line.status === "unsupported") ?? -1;
  const visibleChecks = firstFailure >= 0 ? checks?.slice(0, firstFailure + 1) : checks;
  const solved = solution?.status === "solved";
  useEffect(() => {
    if (mode === "solver" && solved && context?.problem && input === context.prompt) reveal(context.id);
  }, [mode, solved, context?.id, context?.problem, context?.prompt, input, reveal]);

  return <motion.section className={`ok-root${compact ? " ok-compact" : ""}`} aria-label="OmniKumpel AI" onPaste={paste}
    initial={false} animate={{ opacity: 1 }} transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 28 }}>
    <header className="ok-header">
      <div className="ok-brand-icon"><Sparkles aria-hidden="true" size={25} /></div>
      <div className="ok-heading"><span className="ok-eyebrow">TWÓJ MATEMATYCZNY PARTNER</span><h1>OmniKumpel AI</h1><p>Rozumiesz więcej. Liczysz samodzielnie.</p></div>
      <button type="button" className="ok-icon" aria-label="Ustawienia AI" aria-expanded={settingsOpen} aria-controls={`${uid}-settings`} onClick={() => setSettingsOpen(!settingsOpen)}><Settings2 size={20} /></button>
      {onClose && <button type="button" className="ok-icon" aria-label="Zamknij OmniKumpla" onClick={onClose}><X size={20} /></button>}
    </header>
    <div className="ok-trust"><ShieldCheck size={16} aria-hidden="true" /> Lokalny silnik bez klucza, reklam i limitów. AI tylko na Twoje życzenie.</div>
    {offline && <p className="ok-notice" role="status">Tryb offline — lokalne obliczenia działają. AI jest niedostępne.</p>}

    {settingsOpen && <section className="ok-card ok-settings" id={`${uid}-settings`} aria-label="Ustawienia AI">
      <h2>Twoje AI, Twoja decyzja</h2><p>Opcjonalne. Model i ewentualne opłaty zależą od dostawcy. Klucz jest przesyłany wyłącznie przy Twoim żądaniu przez serwer aplikacji.</p>
      <div className="ok-settings-grid"><label>Dostawca<select value={settings.provider} onChange={e => { cancelAI(); setSettings({ ...settings, provider: e.target.value as OmniAISettings["provider"] }); }}>
        <option value="gemini">Gemini</option><option value="openrouter">OpenRouter</option><option value="openai">OpenAI</option><option value="opencode">OpenCode</option>
      </select></label><label>Model<input value={settings.model} maxLength={300} placeholder="Nazwa modelu u dostawcy" onChange={e => { cancelAI(); setSettings({ ...settings, model: e.target.value }); }} /></label></div>
      <label>Klucz API<input type="password" autoComplete="off" spellCheck={false} value={settings.apiKey} maxLength={4096} onChange={e => { cancelAI(); setSettings({ ...settings, apiKey: e.target.value }); }} /></label>
      <label className="ok-checkbox"><input type="checkbox" checked={settings.remember} onChange={e => setSettings({ ...settings, remember: e.target.checked })} />Zapamiętaj klucz na tym urządzeniu (opcjonalnie)</label>
      <p className="ok-small">Domyślnie klucz żyje tylko w pamięci otwartej sesji. Nie zapisuj go na wspólnym urządzeniu. Przypięcia nigdy nie zawierają ustawień ani kluczy.</p>
      <div className="ok-actions"><button type="button" onClick={saveSettings}>Zapisz ustawienia AI</button><button type="button" onClick={clearSettings}>Wyczyść klucz i ustawienia</button></div>
      <p role="status" className="ok-small">{settingsStatus}</p>
    </section>}

    <div className="ok-tabs" role="tablist" aria-label="Tryb OmniKumpla">{MODES.map((tab, i) => <button type="button" role="tab" id={`${uid}-tab-${tab.id}`} key={tab.id} ref={node => { tabRefs.current[i] = node; }} aria-selected={mode === tab.id} aria-controls={`${uid}-panel`} tabIndex={mode === tab.id ? 0 : -1} onKeyDown={e => tabKey(e, i)} onClick={() => changeMode(tab.id)}><tab.icon size={17} aria-hidden="true" />{tab.label}</button>)}</div>
    <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${mode}`} className="ok-main">
      <section className="ok-card ok-composer">
        <h2>{mode === "solver" ? "Od zadania do zrozumienia" : mode === "tutor" ? "Mała podpowiedź. Twój następny krok." : "Prześledźmy Twoje obliczenia"}</h2>
        {context && <p className="ok-context"><BookOpen size={16} aria-hidden="true" />{context.title}</p>}
        {mode === "tutor" && context?.lessonHint && !context.problem && input === context.prompt && <div className="ok-lesson-hint"><p className="ok-small">Objaśnienie z lekcji — do sprawdzenia rachunków wpisz konkretny przykład.</p><MathText text={context.lessonHint} /></div>}
        <form onSubmit={e => { e.preventDefault(); if (mode === "check") check(); else solve(); }}>
          <label htmlFor={`${uid}-input`}>Co dziś rozgryzamy?</label>
          <textarea id={`${uid}-input`} aria-label="Treść zadania dla OmniKumpla" value={input} maxLength={1500} rows={4} placeholder="Np. x^2-5*x+6=0" onChange={e => changeInput(e.target.value)} />
          <div className="ok-input-meta"><span>Zapisz działania za pomocą +, −, *, /.</span><span className={`ok-char-count${input.length >= OMNI_INPUT_WARN ? " is-near" : ""}`}>Liczba znaków: {input.length} / {OMNI_INPUT_MAX}</span></div>
          <details className="ok-small"><summary>Obsługiwany zapis i granice</summary><p>Ułamki a/b; równania liniowe i kwadratowe (pierwiastki rzeczywiste); macierze 2×2; zespolone; derivative(x^3-2*x,x); stats([1,2,3,4]) lub mean, median, variance, std. Wariancja populacyjna. Do 50 obserwacji i potęg 8. Liczby dziesiętne zapisz jako ułamek. Nie rozwiązuję dowolnych zadań tekstowych ani dowodów.</p></details>
          <div className="ok-templates" aria-label="Przykładowe zadania">{TEMPLATES.map(([label, value]) => <button key={value} type="button" onClick={() => changeInput(value)}>{label}</button>)}
            <button type="button" onClick={() => { changeMode("tutor"); if (!input.trim()) changeInput("3/4+1/2"); }}>Wytłumacz jak dla 5-latka</button>
          </div>
          {mode !== "check" && <button className="ok-primary" type="submit" disabled={!input.trim()}><Sparkles size={17} aria-hidden="true" />{mode === "solver" ? "Rozwiąż zadanie" : "Rozpocznij naprowadzanie"}</button>}
          {mode === "check" && <>
            <label htmlFor={`${uid}-work`}>Moje obliczenia — jeden krok w każdej linii</label>
            <textarea id={`${uid}-work`} aria-label="Moje obliczenia" rows={6} value={work} maxLength={12000} onChange={e => { setWork(e.target.value); setChecks(null); }} />
            <div className="ok-actions"><button type="button" disabled={!scratchpadNotes} onClick={() => { setWork(scratchpadNotes); setChecks(null); }}>Wczytaj z brudnopisu</button><button className="ok-primary" type="submit" disabled={!input.trim() || !work.trim()}>Sprawdź rozwiązanie</button></div>
          </>}
        </form>
        {mode !== "solver" && <p className="ok-notice">Sprawdzam obsługiwane przekształcenia algebraiczne i obliczenia liczbowe, nie dowody ogólne. Brak wykrytego błędu nie jest dowodem poprawności całego rozumowania.</p>}
        {mode === "check" && context?.problem && input === context.prompt && <p className="ok-small">Zadanie z generatora: kontrola odpowiedzi to wyłącznie liczbowy punkt kontrolny, nie weryfikacja dowodu.</p>}
      </section>

      {mode === "tutor" && solution && <section className="ok-card ok-tutor" aria-label="Podpowiedź korepetytora"><h2><Lightbulb size={21} aria-hidden="true" />Twój następny krok</h2>
        <p>{solution.tutorHint || "Nie mam bezpiecznej lokalnej podpowiedzi do tego zapisu. Spróbuj jednego z przykładowych zadań."}</p>
        <label htmlFor={`${uid}-attempt`}>Twoja próba</label><textarea id={`${uid}-attempt`} aria-label="Moja próba rozwiązania" value={work} rows={4} maxLength={12000} onChange={e => { setWork(e.target.value); setChecks(null); }} />
        <div className="ok-actions"><button type="button" disabled={!work.trim()} onClick={check}>Sprawdź mój krok</button><button type="button" onClick={() => changeMode("solver")}>Pokaż pełne rozwiązanie</button></div>
      </section>}
      {checks && mode !== "solver" && <section className="ok-card" aria-label="Sprawdzenie obliczeń"><h2>Informacja o Twoich krokach</h2>
        {!checks.some(line => line.status !== "skipped") && <p>Wpisz przynajmniej jeden krok do sprawdzenia.</p>}
        <ol className="ok-checks">{visibleChecks?.map((line, index) => <li key={index} className={`ok-line-${line.status}`}>
          <strong>Linia {line.line}: </strong>{mode === "tutor" ? line.status === "incorrect" ? "Ten krok wymaga poprawy. Sprawdź znaki i wykonaj tę samą operację po obu stronach." : line.status === "correct" ? "Ten krok przeszedł lokalne sprawdzenie. Spróbuj kolejnego samodzielnie." : line.status === "skipped" ? "Pusta linia — pominięto." : "Nie mogę zweryfikować tego kroku. To nie potwierdza jego poprawności." : line.message}
        </li>)}</ol>
      </section>}
      {mode === "solver" && solution && <section className="ok-card ok-result" aria-label="Rozwiązanie krok po kroku"><h2>Rozwiązanie lokalne</h2><SolutionSteps solution={solution} /></section>}
      {mode === "check" && solution && !solved && <p className="ok-notice">{solution.summary}</p>}
      {mode !== "tutor" && solution && <section className="ok-card ok-next"><h2>Zabierz zrozumienie dalej</h2><div className="ok-actions">
        <button type="button" className="ok-primary" disabled={!solved || !solution.practice} onClick={() => { if (solution.practice) onPractice(solution.practice); }}>Wygeneruj 5 podobnych zadań</button>
        <button type="button" disabled={!solved || !pinsReady} onClick={pinSolution}><Pin size={16} aria-hidden="true" />Przypnij do mojej ściągi</button>
      </div>{!solution.practice && <p className="ok-small">Dla tego zadania nie ma zgodnego generatora. Nie zastępuję go niezwiązanymi ćwiczeniami.</p>}
        {solved && <button type="button" className="ok-ai-button" disabled={!!pending || offline} onClick={() => void callAI("explain")}>Poproś AI o dodatkowe wyjaśnienie</button>}
      </section>}
    </div>

    <section className="ok-card ok-photo" aria-label="Zdjęcie zadania"><h2><ImagePlus size={20} aria-hidden="true" />Masz zadanie na zdjęciu?</h2>
      <p>Wybierz lub wklej PNG, JPEG albo WebP do 2 MB. Podgląd pozostaje lokalny do momentu świadomego wysłania.</p>
      <input className="ok-file" type="file" ref={fileInput} aria-label="Wybierz zdjęcie zadania" accept="image/png,image/jpeg,image/webp" onChange={e => { selectImage(e.target.files?.[0]); e.target.value = ""; }} />
      <button type="button" onClick={() => fileInput.current?.click()}><ImagePlus size={16} aria-hidden="true" />Wrzuć zdjęcie zadania</button>
      {imageError && <p role="alert" className="ok-error">{imageError}</p>}
      {image && <div className="ok-photo-preview">
        {/* A local data URL deliberately bypasses image optimization and never leaves the browser. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:${image.mimeType};base64,${image.data}`} alt="Lokalny podgląd zdjęcia zadania" />
        <p className="ok-notice">Po kliknięciu dostawca AI otrzyma to zdjęcie. Odczyt OCR nie jest zweryfikowanym rozwiązaniem matematycznym.</p>
        {mode === "tutor" ? <p>Odczyt AI jest wyłączony w korepetytorze, aby nie ujawnić odpowiedzi. Przepisz zadanie albo przejdź do Solver.</p> : <button type="button" disabled={!!pending || offline} onClick={() => void callAI("ocr")}>Odczytaj zdjęcie przez AI</button>}
        <button type="button" onClick={() => { cancelAI(); fileVersion.current++; setImage(null); setOcrDraft(null); }}>Usuń zdjęcie</button>
      </div>}
      {ocrDraft !== null && mode !== "tutor" && <div className="ok-ocr"><label htmlFor={`${uid}-ocr`}>Odczytana treść zdjęcia — sprawdź i popraw zapis</label><textarea id={`${uid}-ocr`} aria-label="Odczytana treść zdjęcia" value={ocrDraft} maxLength={1500} rows={4} onChange={e => setOcrDraft(e.target.value)} /><button type="button" className="ok-primary" disabled={!ocrDraft.trim()} onClick={() => { changeInput(ocrDraft); changeMode("solver"); solve(ocrDraft); }}>Potwierdź treść i rozwiąż lokalnie</button></div>}
    </section>
    {pending && <div className="ok-notice" role="status">{pending === "ocr" ? "Odczytuję zdjęcie…" : "Czekam na komentarz AI…"}<button type="button" onClick={cancelAI}>Anuluj żądanie AI</button></div>}
    {aiError && <p className="ok-error" role="alert">{aiError}</p>}
    {aiText && mode !== "tutor" && <section className="ok-card ok-ai"><h2>Komentarz AI — niezweryfikowany, wynik lokalny pozostaje źródłem prawdy</h2><p>{aiText}</p></section>}
    <p className="ok-status" role="status" aria-live="polite">{status}</p>

    <section className="ok-card ok-pins" aria-label="Moja ściąga OmniKumpla"><h2><Pin size={20} aria-hidden="true" />Moja ściąga <span className="ok-count">{pins.length}/100</span></h2><p className="ok-small">Lokalne kopie przypiętych rozwiązań, niezależne od XP. Bez kluczy i ustawień AI.</p>
      {pinsError && <p className="ok-error" role="alert">{pinsError} Przypinanie jest zablokowane, aby chronić wcześniejsze dane.</p>}
      {pinsReady && !pins.length && <p>Przypnij pierwsze rozwiązanie, aby łatwo do niego wrócić.</p>}
      {pins.map(pin => <article key={pin.id} className="ok-pin">{mode === "tutor" ? <p>{pin.input} — rozwiązanie dostępne w trybie Solver.</p> : <details><summary>{pin.input}</summary><SolutionSteps solution={pin.solution} /></details>}
        {removeId === pin.id ? <div className="ok-confirm" role="group" aria-label="Potwierdzenie usunięcia przypięcia"><p>Usunąć tę kopię ze ściągi?</p><button type="button" onClick={() => removePin(pin.id)}>Tak, usuń przypięcie</button><button type="button" onClick={() => setRemoveId(null)}>Zachowaj</button></div> : <button type="button" className="ok-remove" onClick={() => setRemoveId(pin.id)} aria-label={`Usuń przypięcie: ${pin.input}`}><Trash2 size={15} aria-hidden="true" />Usuń</button>}
      </article>)}
    </section>
  </motion.section>;
}
