"use client";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Dumbbell,
  Flame,
  GraduationCap,
  Home,
  Infinity as InfinityIcon,
  Layers3,
  Menu,
  Network,
  Orbit,
  Palette,
  Search,
  Sparkles,
  Target,
  Trophy,
  Wrench,
  Zap,
  PencilRuler,
  Sigma,
  FunctionSquare,
  Ruler,
  Bot,
  Archive,
} from "lucide-react";
import type { Lesson } from "@/lib/lesson";
import {
  award,
  emptyProgress,
  loadProgress,
  miss,
  streak,
  type Progress,
} from "@/lib/progress";
import dynamic from "next/dynamic";
import MathText, { MathFormula } from "./MathText";
import InfinitePractice from "./InfinitePractice";
import Tools from "./Tools";
import { isReviewDue } from "@/lib/review";
import CommandPalette from "./CommandPalette";
import ProfileDialog from "./ProfileDialog";
import BackupDialog from "./BackupDialog";
import { DashboardCircleDemo, DashboardPerspectives } from "./DashboardDemos";
import { LessonLinksProvider } from "./WikiLink";
import "./WorkspaceQoL.css";
import "./WorkspaceRefresh.css";
import { ScratchpadProvider, useScratchpad } from "./ScratchpadContext";
import { WORKSPACE_PATHS, lessonPath, readWorkspacePath, type WorkspacePage } from "@/lib/workspaceRoutes";
import SmartMathBar from "./SmartMathBar";
import type { SmartPracticeSpec } from "@/lib/smartMath";
import { smartPracticeTopicId } from "@/lib/smartMath";
import { problemPath } from "@/lib/problemLink";
import { SYNC_PARAM, parseSyncLink } from "@/lib/progressBackup";
import SymbolTranslator from "./SymbolTranslator";
import FormulaXray from "./FormulaXray";
import { OmniKumpelProvider, useOmniKumpel, useOmniQuestion } from "./OmniKumpelContext";
import type { OmniPracticeSpec } from "@/lib/omnikumpelTypes";
import { omniPracticeTopicId } from "@/lib/omnikumpelEngine";

/**
 * Heavy route views are split into their own chunks. They keep server rendering
 * (the default), so the no-JavaScript dashboard still exposes real HTML.
 */
const Visualizer = dynamic(() => import("./Visualizer"));
const SkillTree = dynamic(() => import("./SkillTree"));
const TasksRoute = dynamic(() => import("./TasksRoute"));
const CrashCourse = dynamic(() => import("./CrashCourse"));
const OmniKumpel = dynamic(() => import("./OmniKumpel"));
const OmniKumpelDock = dynamic(() => import("./OmniKumpelDock"));

type Page = WorkspacePage;
const tracks = [
  {
    key: "fractions",
    label: "Ułamki zwykłe",
    subtitle: "Małe części. Wielkie możliwości.",
    tag: "PODSTAWÓWKA",
    icon: Layers3,
    color: "violet",
    symbol: "¾",
  },
  {
    key: "matrix",
    label: "Świat macierzy",
    subtitle: "Odkryj porządek w liczbach.",
    tag: "STUDIA · ALGEBRA LINIOWA",
    icon: Network,
    color: "mint",
    symbol: "[aᵢⱼ]",
  },
  {
    key: "complex",
    label: "Liczby zespolone",
    subtitle: "Wyjdź poza oś rzeczywistą.",
    tag: "STUDIA · ALGEBRA",
    icon: Orbit,
    color: "peach",
    symbol: "a + bi",
  },
  {
    key: "matura-liczby",
    label: "Matura · Liczby i algebra",
    subtitle: "Pewne podstawy. Każdy punkt się liczy.",
    tag: "LICEUM · MATURA PODSTAWOWA",
    icon: Sigma,
    color: "blue",
    symbol: "x²",
  },
  {
    key: "matura-funkcje",
    label: "Matura · Funkcje i ciągi",
    subtitle: "Zależności, które widać w wykresie.",
    tag: "LICEUM · MATURA PODSTAWOWA",
    icon: FunctionSquare,
    color: "violet",
    symbol: "f(x)",
  },
  {
    key: "matura-geometria",
    label: "Matura · Geometria i dane",
    subtitle: "Kształty, dane i decyzje pod presją.",
    tag: "LICEUM · MATURA PODSTAWOWA",
    icon: Ruler,
    color: "peach",
    symbol: "△",
  },
];
const modes = [
  { id: "eli5", label: "Jak dla 5-latka", short: "ELI5", color: "mint" },
  { id: "school", label: "Krok po kroku", short: "Szkolny", color: "blue" },
  { id: "visual", label: "Zobacz to", short: "Wizualny", color: "violet" },
  {
    id: "academic",
    label: "Ściśle i formalnie",
    short: "Akademicki",
    color: "peach",
  },
] as const;

function OrbitalArt() {
  return (
    <div className="orbital-art" aria-hidden="true">
      <svg viewBox="0 0 520 360">
        <defs>
          <radialGradient id="orb-glow">
            <stop stopColor="#8b77ff" stopOpacity=".28" />
            <stop offset="1" stopColor="#8b77ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="orb-line">
            <stop stopColor="#6551f0" stopOpacity=".15" />
            <stop offset=".5" stopColor="#b3a6ff" />
            <stop offset="1" stopColor="#6551f0" stopOpacity=".15" />
          </linearGradient>
        </defs>
        <circle cx="260" cy="185" r="170" fill="url(#orb-glow)" />
        {Array.from({ length: 11 }, (_, i) => (
          <ellipse
            key={i}
            cx="260"
            cy="185"
            rx={150}
            ry={25 + i * 10}
            fill="none"
            stroke="url(#orb-line)"
            strokeWidth=".65"
            transform={`rotate(${i * 16} 260 185)`}
          />
        ))}
        <ellipse
          cx="260"
          cy="185"
          rx="190"
          ry="67"
          fill="none"
          stroke="#a498ff"
          opacity=".6"
          transform="rotate(-27 260 185)"
        />
        <circle cx="423" cy="106" r="5" fill="#c6bbff" />
        <circle cx="143" cy="263" r="4" fill="#5edbb7" />
      </svg>
      <span className="floating-equation eq-one">∞</span>
      <span className="floating-equation eq-two">
        e<sup>iπ</sup> + 1 = 0
      </span>
      <span className="art-label">CIEKAWOŚĆ NIE MA GRANIC</span>
    </div>
  );
}

export default function Workspace({ lessons, children }: { lessons: Lesson[]; children?: ReactNode }) {
  return (
    <OmniKumpelProvider>
    <ScratchpadProvider>
      <WorkspaceContent lessons={lessons}>{children}</WorkspaceContent>
    </ScratchpadProvider>
    </OmniKumpelProvider>
  );
}
function WorkspaceContent({ lessons, children }: { lessons: Lesson[]; children?: ReactNode }) {
  const { open: scratchOpen, setOpen: setScratchOpen, size: scratchSize } =
    useScratchpad();
  const { question: omniQuestion, helperOpen, setHelperOpen } = useOmniKumpel();
  const [showDemos, setShowDemos] = useState(false);
  useEffect(() => { if (scratchOpen) setHelperOpen(false); }, [scratchOpen, setHelperOpen]);
  useEffect(() => { if (helperOpen) setScratchOpen(false); }, [helperOpen, setScratchOpen]);
  const { notes: scratchpadNotes } = useScratchpad();
  const pathname = usePathname();
  const router = useRouter();
  const route = readWorkspacePath(pathname);
  const page = route.page;
  const [crashVisited, setCrashVisited] = useState(page === "crash");
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("eli5");
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const [settings, setSettings] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [trackLevel, setTrackLevel] = useState("all");
  const [toolTab, setToolTab] = useState<"formula" | "matrix" | "graph" | "exam" | "symbols">("formula");
  const [toolRequest, setToolRequest] = useState(0);
  useEffect(() => {
    let loaded = emptyProgress;
    try {
      loaded = loadProgress(localStorage.getItem("omnimatma-v1"));
    } catch {
      setStorageError(true);
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const imported = parseSyncLink(params.get(SYNC_PARAM));
      if (imported) {
        loaded = imported;
        params.delete(SYNC_PARAM);
        const query = params.toString();
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
        );
      }
    } catch {
      // A malformed sync link never blocks the locally stored progress.
    }
    setProgress(loaded);
    if (lessons.some((item) => item.id === loaded.lastLessonId))
      setLessonId(loaded.lastLessonId!);
    setReady(true);
  }, [lessons]);
  useEffect(() => {
    if (!ready) return;
    // Signal used by E2E tests: input sent before this point would beat hydration.
    document.documentElement.dataset.hydrated = "true";
    document.documentElement.dataset.theme = progress.theme;
    try {
      localStorage.setItem("omnimatma-v1", JSON.stringify(progress));
    } catch {
      setStorageError(true);
    }
  }, [progress, ready]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !e.repeat) {
        e.preventDefault();
        setSearchQuery("");
        setSettings(false);
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSettings(false);
        setBackupOpen(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const currentLessonId = route.lessonId ?? lessonId;
  const lesson = lessons.find((l) => l.id === currentLessonId);
  const solved = Object.values(progress.solved).reduce((a, b) => a + b, 0);
  const completed = Object.values(progress.solved).filter((n) => n >= 5).length;
  const level = Math.floor(progress.xp / 500) + 1;
  const due = lessons.filter(
    (l) => progress.reviews[l.id] && isReviewDue(progress.reviews[l.id]),
  );
  const prepareNavigation = () => {
    setScratchOpen(false);
    setMobile(false);
    setSearchOpen(false);
    setBackupOpen(false);
    setMode("eli5");
    setHelperOpen(false);
  };
  const navigate = (href: string) => {
    prepareNavigation();
    if (!navigator.onLine) { window.history.pushState(null, "", href); window.scrollTo({ top: 0, behavior: "instant" }); }
    else router.push(href);
  };
  const followLink = (href: string) => (event: { preventDefault: () => void }) => {
    prepareNavigation();
    if (!navigator.onLine) { event.preventDefault(); window.history.pushState(null, "", href); window.scrollTo({ top: 0, behavior: "instant" }); }
  };
  const jump = (p: Page) => {
    if (p === "crash") setCrashVisited(true);
    navigate(p === "lesson" ? lessonPath(currentLessonId) : WORKSPACE_PATHS[p]);
  };
  const openLesson = (l: Lesson) => {
    if (!l) return;
    setLessonId(l.id);
    setProgress((previous) => ({ ...previous, lastLessonId: l.id }));
    setMode("eli5");
    navigate(lessonPath(l.id));
    setSearchOpen(false);
  };
  useEffect(() => {
    if (page === "crash") setCrashVisited(true);
    if (route.lessonId && lessons.some((item) => item.id === route.lessonId)) {
      setProgress((previous) => previous.lastLessonId === route.lessonId ? previous : { ...previous, lastLessonId: route.lessonId });
    }
    setMobile(false);
    setScratchOpen(false);
    setHelperOpen(false);
  }, [pathname, page, route.lessonId, lessons, setScratchOpen, setHelperOpen]);
  const startSmartPractice = (spec: SmartPracticeSpec) => navigate(problemPath({ topicId: smartPracticeTopicId(spec), difficulty: 1, seed: Math.floor(Math.random() * 4294967296), smart: spec, mode: "series10" }));
  const startOmniPractice = (spec: OmniPracticeSpec) => navigate(problemPath({ topicId: omniPracticeTopicId(spec), difficulty: 1, seed: Math.floor(Math.random() * 4294967296), omni: spec, mode: "series5" }));
  const nav = [
    { page: "home" as Page, label: "Twoja przestrzeń", icon: Home },
    { page: "path" as Page, label: "Ścieżka nauki", icon: Network },
    { page: "tasks" as Page, label: "Zadania", icon: Dumbbell },
    { page: "kumpel" as Page, label: "OmniKumpel AI", icon: Bot },
    { page: "review" as Page, label: "Powtórki", icon: RotateIcon },
    { page: "tools" as Page, label: "Laboratorium", icon: Wrench },
    { page: "crash" as Page, label: "Sprawdzian jutro", icon: Zap },
  ];
  const resumeLesson = lessons.find((item) => item.id === progress.lastLessonId)
    ?? lessons.find((item) => (progress.solved[item.id] ?? 0) > 0)
    ?? lessons.find((item) => item.id === "fractions-meaning")
    ?? lessons[0];
  const profileName = progress.displayName || "Odkrywca";
  const profileInitial = progress.initial || "O";
  return (
    <LessonLinksProvider lessons={lessons} onOpen={openLesson}>
      <MotionConfig reducedMotion="user">
        <div
          className={`app-shell ${scratchOpen ? `has-scratchpad scratch-${scratchSize}` : ""}`}
        >
          <a className="skip-link" href="#main">
            Przejdź do treści
          </a>
          {mobile && (
            <button
              className="sidebar-shade"
              aria-label="Zamknij menu"
              onClick={() => setMobile(false)}
            />
          )}
          <aside className={`sidebar ${mobile ? "is-open" : ""}`}>
            <Link
              href="/"
              className="brand"
              onNavigate={followLink("/")}
              aria-label="OmniMatma — strona główna"
            >
              <span className="brand-symbol">
                <InfinityIcon size={26} />
              </span>
              <span>
                omni<span className="brand-light">matma</span>
                <sup>β</sup>
              </span>
            </Link>
            <button
              className="search-trigger"
              onClick={() => { setSettings(false); setSearchOpen(true); }}
            >
              <Search size={16} />
              <span>Znajdź swój temat</span>
              <kbd>⌘ K</kbd>
            </button>
            <span className="nav-label">TWOJA PRZESTRZEŃ</span>
            <nav aria-label="Menu główne">
              {nav.map((n) => (
                <Link
                  key={n.page}
                  href={WORKSPACE_PATHS[n.page as Exclude<Page, "lesson">]}
                  onNavigate={followLink(WORKSPACE_PATHS[n.page as Exclude<Page, "lesson">])}
                  className={`nav-item ${page === n.page ? "active" : ""}`}
                  aria-current={page === n.page ? "page" : undefined}
                >
                  <n.icon size={19} />
                  <span>{n.label}</span>
                  {n.page === "kumpel" && <b className="nav-ai-badge">AI</b>}
                  {n.page === "review" && due.length > 0 && <b>{due.length}</b>}
                  {n.page === "home" && <span className="nav-dot" />}
                </Link>
              ))}
            </nav>
            <div className="sidebar-divider" />
            <span className="nav-label">ODKRYWAJ MATEMATYKĘ</span>
            <nav aria-label="Odkrywaj matematykę">
              <div className="track-nav">
                {tracks.map((t) => (
                  <Link
                    key={t.key}
                    href={lessonPath(lessons.find((l) => l.id.startsWith(t.key))?.id ?? "fractions-meaning")}
                    onNavigate={followLink(lessonPath(lessons.find((l) => l.id.startsWith(t.key))?.id ?? "fractions-meaning"))}
                  >
                    <span className={`tiny-dot ${t.color}`} />
                    {t.label}
                    <ChevronRight size={14} />
                  </Link>
                ))}
              </div>
              <Link className="track-nav-all" href="/sciezka" onNavigate={followLink("/sciezka")}>
                Zobacz wszystkie 60 lekcji <ArrowRight size={14} />
              </Link>
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-note">
                <Sparkles size={19} />
                <strong>
                  Własne tempo.
                  <br />
                  Nieograniczone możliwości.
                </strong>
                <p>
                  Bez reklam, limitów i presji.
                  <br />
                  Po prostu Ty i matematyka.
                </p>
                <span>
                  ZAWSZE BEZPŁATNIE <ArrowUpRight size={13} />
                </span>
              </div>
              <button
                className="profile-button"
                onClick={() => setSettings(true)}
              >
                <span className="avatar">{profileInitial}</span>
                <span>
                  <strong>{profileName}</strong>
                  <small>
                    Poziom {level} · {progress.xp} XP
                  </small>
                </span>
                <Palette size={17} />
              </button>
            </div>
          </aside>
          <div className="main-shell">
            <header className="topbar">
              <div className="breadcrumb">
                <button
                  className="icon-button mobile-menu"
                  aria-label="Otwórz menu nawigacji"
                  aria-expanded={mobile}
                  onClick={() => setMobile(true)}
                >
                  <Menu size={21} />
                </button>
                <span>Workspace</span>
                <ChevronRight size={13} />
                <strong>
                  {page === "lesson"
                    ? lesson?.title
                    : nav.find((n) => n.page === page)?.label}
                </strong>
              </div>
              <button
                type="button"
                className="header-search"
                onClick={() => { setSettings(false); setSearchOpen(true); }}
                aria-label="Szukaj tematu, wzoru lub zadania"
                aria-haspopup="dialog"
                aria-expanded={searchOpen}
              >
                <Search size={16} aria-hidden="true" />
                <span>Szukaj tematu, wzoru lub zadania…</span>
                <kbd>Ctrl+K</kbd>
              </button>
              <div className="topbar-actions">
                {["lesson", "tasks", "tools", "crash"].includes(page) && (
                  <button
                    className="icon-button"
                    aria-label="Brudnopis w kratkę"
                    title="Brudnopis w kratkę"
                    aria-expanded={scratchOpen}
                    onClick={() => setScratchOpen((v) => !v)}
                  >
                    <PencilRuler size={18} />
                  </button>
                )}
                <span className="streak">
                  <Flame size={16} />
                  {streak(progress.activity)} <span>dni nauki</span>
                </span>
                <button
                  type="button"
                  className="icon-button backup-trigger"
                  aria-label="Kopia zapasowa postępów"
                  aria-haspopup="dialog"
                  aria-expanded={backupOpen}
                  onClick={() => { setSearchOpen(false); setSettings(false); setBackupOpen(true); }}
                >
                  <Archive size={18} />
                </button>
                <span className="topbar-separator" />
                <button
                  className="icon-button"
                  aria-label="Wybierz motyw"
                  onClick={() => setSettings(true)}
                >
                  <Palette size={18} />
                </button>
                <button
                  type="button"
                  className="avatar small profile-trigger"
                  aria-label={`Profil: ${profileName}`}
                  aria-haspopup="dialog"
                  aria-expanded={settings}
                  onClick={() => { setSearchOpen(false); setSettings(true); }}
                >{profileInitial}</button>
              </div>
            </header>
            <main id="main" tabIndex={-1}>
              {children}
              {storageError && (
                <p className="storage-warning" role="status">
                  Przeglądarka blokuje zapis. Postęp działa w tej sesji, ale nie
                  zostanie zachowany.
                </p>
              )}
              <AnimatePresence initial={false}>
                <motion.div
                  className="workspace-page"
                  key={page + (page === "lesson" ? currentLessonId : "")}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  {page === "home" && (
                    <>
                      <section className="panel zen-welcome">
                      <div className="welcome-line">
                        <span>
                          <span className="status-dot" /> TWOJE MIEJSCE NA
                          WIELKIE „AHA!”
                        </span>
                        <span className="version-tag">OMNIMATMA / 01</span>
                      </div>
                      <div className="hero">
                        <div className="hero-copy">
                          <span className="chip hero-chip">
                            <Sparkles size={13} /> {progress.xp > 0 ? "DOBRZE CIĘ ZNOWU WIDZIEĆ" : "MAŁY KROK. WIELKIE AHA."}
                          </span>
                          <h1>
                            Matematyka.
                            <br />
                            <span>W końcu po Twojemu.</span>
                          </h1>
                          <div className="hero-resume">
                            {progress.xp > 0 ? <p title={resumeLesson?.title}>Wróć do nauki: <strong>{resumeLesson?.title}</strong></p> : <p>Nie musisz mieć „ścisłego umysłu”. Wystarczy ciekawość.</p>}
                          </div>
                          <button
                            className="button primary"
                            onClick={() => openLesson(resumeLesson)}
                          >
                            {progress.xp > 0 ? "Kontynuuj lekcję" : "Zacznij odkrywać"}
                            <ArrowRight size={17} />
                          </button>
                          <div className="hero-footnote">
                            <span className="tiny-dot mint" /> Bez opłat. Bez
                            limitów. Od absolutnego zera.
                          </div>
                        </div>
                      </div>
                      <SmartMathBar compact onPractice={startSmartPractice} onSearch={(query) => { setSearchQuery(query); setSearchOpen(true); }} onSolvedExample={(id) => setProgress((previous) => award(previous, "fractions-add", id, 1))} />
                      </section>
                      <div className="stats-grid">
                        <div className="stat">
                          <span className="stat-icon violet">
                            <Zap size={20} />
                          </span>
                          <div>
                            <small>Twoje doświadczenie</small>
                            <strong>
                              {progress.xp}
                              <span> XP</span>
                            </strong>
                          </div>
                          <div
                            className="mini-progress"
                            role="progressbar"
                            aria-label="Postęp do następnego poziomu"
                            aria-valuenow={(progress.xp % 500) / 5}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuetext={`${progress.xp % 500} z 500 XP do poziomu ${level + 1}`}
                          >
                            <div
                              style={{ width: `${(progress.xp % 500) / 5}%` }}
                            />
                          </div>
                        </div>
                        <div className="stat">
                          <span className="stat-icon mint">
                            <Target size={20} />
                          </span>
                          <div>
                            <small>Rozwiązane zadania</small>
                            <strong>
                              {solved}
                              <span> dobrych kroków</span>
                            </strong>
                          </div>
                        </div>
                        <div className="stat">
                          <span className="stat-icon peach">
                            <Trophy size={20} />
                          </span>
                          <div>
                            <small>Opanowane mikro-lekcje</small>
                            <strong>
                              {completed}
                              <span> / {lessons.length}</span>
                            </strong>
                          </div>
                          <span className="stat-caption">
                            5 zadań = 1 lekcja
                          </span>
                        </div>
                      </div>
                      <div className="section-heading path-heading">
                        <div>
                          <span className="eyebrow">
                            OD CIEKAWOŚCI DO PEWNOŚCI
                          </span>
                          <h2>
                            Wybierz swój kierunek
                            <span className="heading-dot">.</span>
                          </h2>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => jump("path")}
                        >
                          Cała ścieżka <ArrowRight size={16} />
                        </button>
                      </div>
                      <div className="learning-levels" role="group" aria-label="Poziom nauki">
                        {[
                          ["primary", "Podstawówka", "Solidne fundamenty, krok po kroku."],
                          ["secondary", "Liceum", "Zrozum zależności. Przygotuj się do matury."],
                          ["university", "Studia", "Macierze i świat liczb zespolonych."],
                        ].map(([value, title, description]) => (
                          <button key={value} className="learning-level-card" aria-pressed={trackLevel === value}
                            onClick={() => setTrackLevel(trackLevel === value ? "all" : value)}>
                            <GraduationCap size={20} /><strong>{title}</strong><span>{description}</span><ArrowUpRight size={16} />
                          </button>
                        ))}
                      </div>
                      {trackLevel !== "all" && <button className="text-button show-all-tracks" onClick={() => setTrackLevel("all")}>Pokaż wszystkie kierunki</button>}
                      <div className="track-grid">
                        {tracks.filter((t) => trackLevel === "all" || (trackLevel === "primary" ? t.key === "fractions" : trackLevel === "secondary" ? t.key.startsWith("matura") : ["matrix", "complex"].includes(t.key))).map((t, i) => {
                          const group = lessons.filter((l) =>
                            l.id.startsWith(t.key),
                          );
                          const count = group.filter(
                            (l) => (progress.solved[l.id] ?? 0) >= 5,
                          ).length;
                          return (
                            <motion.button
                              whileHover={{ y: -5 }}
                              key={t.key}
                              className={`track-card ${t.color}`}
                              onClick={() => openLesson(group[0])}
                            >
                              <div className="track-card-top">
                                <span className="track-icon">
                                  <t.icon size={24} />
                                </span>
                                <span className="track-index">0{i + 1}</span>
                              </div>
                              <div className="track-art">
                                <span>{t.symbol}</span>
                                <i />
                                <i />
                              </div>
                              <span className="eyebrow">{t.tag}</span>
                              <h3>{t.label}</h3>
                              <p>{t.subtitle}</p>
                              <div className="track-progress">
                                <span
                                  style={{
                                    width: `${group.length ? (count / group.length) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                              <div className="track-card-bottom">
                                <span>
                                  {count} / {group.length} mikro-lekcji
                                </span>
                                <span className="circle-arrow">
                                  <ArrowUpRight size={18} />
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                      <button className="text-button" aria-expanded={showDemos} aria-controls="dashboard-demos" onClick={() => setShowDemos((value) => !value)}>Pokaż jak działają 4 perspektywy i interaktywne wzory</button>
                      {showDemos && <div className="bottom-bento" id="dashboard-demos">
                        <DashboardPerspectives />
                        <DashboardCircleDemo onOpenTools={() => { setToolTab("graph"); setToolRequest((n) => n + 1); jump("tools"); }} />
                      </div>}
                      <footer className="page-footer">
                        <span>
                          <InfinityIcon size={17} /> Matematyka jest dla
                          każdego.
                        </span>
                        <span>
                          Zbudowane na ciekawości. Połączone z Obsidianem.
                        </span>
                      </footer>
                    </>
                  )}
                  {page === "path" && (
                    <>
                      <PageTitle
                        eyebrow="TWOJA MAPA ODKRYĆ"
                        title="Wszystko się łączy."
                        description="Każda kropka to nowa umiejętność. Linie pokazują, od czego warto zacząć. Niczego nie blokujemy — wybór należy do Ciebie."
                      />
                      <div className="skill-legend">
                        <span className="tiny-dot mint" /> Opanowane{" "}
                        <span className="tiny-dot violet" /> Do odkrycia{" "}
                        <span className="muted">Kliknij lekcję, aby wejść</span>
                      </div>
                      <div className="skill-columns">
                        {tracks.map((t) => (
                          <section className="panel skill-track" key={t.key}>
                            <div className={`skill-track-title ${t.color}`}>
                              <t.icon size={20} />
                              <h2>{t.label}</h2>
                            </div>
                            <SkillTree
                              lessons={lessons.filter((l) =>
                                l.id.startsWith(t.key),
                              )}
                              solved={progress.solved}
                              onOpen={openLesson}
                            />
                          </section>
                        ))}
                      </div>
                    </>
                  )}
                  {page === "lesson" && lesson && (
                    <>
                      <LessonOmniContext lesson={lesson} />
                      <div className="lesson-breadcrumb">
                        <button
                          className="text-button"
                          onClick={() => jump("path")}
                        >
                          Ścieżka nauki
                        </button>
                        <ChevronRight size={14} />
                        <span>{lesson.category}</span>
                      </div>
                      <PageTitle
                        eyebrow={`${lesson.level === "studia" ? "STUDIA" : lesson.level === "liceum" ? "LICEUM" : "SZKOŁA PODSTAWOWA"} · MIKRO-LEKCJA · ${lesson.minutes} MIN`}
                        title={lesson.title}
                        description={lesson.description}
                      />
                      <div className="lesson-layout">
                        <div>
                          <section className="panel theory-panel">
                            <div
                              className="mode-tabs"
                              role="tablist"
                              aria-label="Sposób wyjaśniania"
                            >
                              {modes.map((m) => (
                                <button
                                  role="tab"
                                  aria-selected={mode === m.id}
                                  aria-controls="mode-panel"
                                  id={`tab-${m.id}`}
                                  key={m.id}
                                  className={
                                    mode === m.id ? `active ${m.color}` : ""
                                  }
                                  onClick={() => setMode(m.id)}
                                >
                                  <span className={`tiny-dot ${m.color}`} />
                                  {m.short}
                                </button>
                              ))}
                            </div>
                            <AnimatePresence initial={false}>
                              <motion.div
                                key={mode}
                                id="mode-panel"
                                role="tabpanel"
                                aria-labelledby={`tab-${mode}`}
                                initial={false}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <h2>
                                  {modes.find((m) => m.id === mode)?.label}
                                </h2>
                                <MathText text={lesson.modes[mode]} />
                                {mode === "visual" &&
                                  ["fractions", "matrix", "complex"].includes(
                                    lesson.id.split("-")[0],
                                  ) && (
                                    <Visualizer
                                      key={lesson.id}
                                      family={lesson.id.split("-")[0]}
                                    />
                                  )}
                              </motion.div>
                            </AnimatePresence>
                            <FormulaXray formula={lesson.formula} topicId={lesson.generatorId} title={lesson.title} />
                            <details className="example-detail">
                              <summary>Przykład krok po kroku</summary>
                              <MathText text={lesson.example} />
                            </details>
                            <details className="example-detail">
                              <summary>Na co uważać?</summary>
                              <MathText text={lesson.pitfalls} />
                            </details>
                            {lesson.related && (
                              <section
                                className="lesson-connections"
                                aria-label="Pojęcia powiązane"
                              >
                                <span className="eyebrow">POŁĄCZ KROPKI</span>
                                <p className="muted">
                                  Najedź na pojęcie lub zaznacz je klawiaturą,
                                  aby podejrzeć notatkę. Dotknij, aby otworzyć
                                  lekcję.
                                </p>
                                <MathText text={lesson.related} />
                              </section>
                            )}
                          </section>
                          <InfinitePractice
                            key={lesson.id}
                            lesson={lesson}
                            onSolved={(problemId, difficulty) => {
                              const granted =
                                !progress.awarded.includes(problemId);
                              setProgress((p) =>
                                award(p, lesson.id, problemId, difficulty),
                              );
                              return granted;
                            }}
                            onMiss={() =>
                              setProgress((p) => miss(p, lesson.id))
                            }
                          />
                          <SymbolTranslator compact />
                        </div>
                        <aside className="lesson-side">
                          <section className="panel">
                            <span className="eyebrow">TWÓJ POSTĘP</span>
                            <h3>{progress.solved[lesson.id] ?? 0} / 5 zadań</h3>
                            <div className="track-progress">
                              <span
                                style={{
                                  width: `${Math.min(100, (progress.solved[lesson.id] ?? 0) * 20)}%`,
                                }}
                              />
                            </div>
                            <p className="muted">
                              Pięć samodzielnych rozwiązań oznacza opanowaną
                              lekcję. Potem warto do niej wrócić.
                            </p>
                          </section>
                          <section className="panel">
                            <span className="eyebrow">WARTO MIEĆ POD RĘKĄ</span>
                            <MathFormula value={lesson.formula} block />
                            <p className="muted">
                              Wzory są pomocą, nie zamiennikiem zrozumienia.
                            </p>
                          </section>
                          <section className="panel">
                            <span className="eyebrow">POŁĄCZENIA</span>
                            {lesson.prerequisites.length ? (
                              lesson.prerequisites.map((id) => {
                                const pre = lessons.find((l) => l.id === id);
                                return pre ? (
                                  <button
                                    className="related-link"
                                    key={id}
                                    onClick={() => openLesson(pre)}
                                  >
                                    {pre.title}
                                    <ArrowUpRight size={15} />
                                  </button>
                                ) : null;
                              })
                            ) : (
                              <p className="muted">
                                Ta lekcja nie wymaga wcześniejszych modułów.
                              </p>
                            )}
                            <span className="source-tag">
                              <span className="tiny-dot mint" /> Źródło:
                              Obsidian Vault
                            </span>
                          </section>
                        </aside>
                      </div>
                    </>
                  )}
                  {page === "tasks" && (
                    <Suspense fallback={<section className="panel tasks-loading" role="status"><h1>Zadania</h1><p>Przygotowujemy Twój trening…</p></section>}>
                    <TasksRoute
                      lessons={lessons}
                      onSolved={(problemId, difficulty, topicId) => {
                        const target = lessons.find((item) =>
                          topicId ? item.id === topicId : problemId.startsWith(`${item.generatorId}-`),
                        );
                        if (!target) return false;
                        const granted = !progress.awarded.includes(problemId);
                        setProgress((previous) =>
                          award(previous, target.id, problemId, difficulty),
                        );
                        return granted;
                      }}
                    />
                    </Suspense>
                  )}
                  {page === "tools" && (
                    <>
                      <PageTitle
                        eyebrow="EKSPERYMENTUJ BEZ OBAW"
                        title="Twoje laboratorium."
                        description="Sprawdź pomysł, zobacz zależność, przygotuj się do egzaminu. Tu możesz się mylić."
                      />
                      <Tools lessons={lessons} initialTab={toolTab} navigationKey={toolRequest} />
                    </>
                  )}
                  {page === "kumpel" && <OmniKumpel context={omniQuestion} scratchpadNotes={scratchpadNotes} onPractice={startOmniPractice} />}
                  {page === "review" && (
                    <>
                      <PageTitle
                        eyebrow="MAŁE POWROTY. TRWAŁA WIEDZA."
                        title="Daj wiedzy zostać."
                        description="Po udanym dniu nauki wróć za 1 dzień, potem za 3 dni i coraz rzadziej. Błąd skraca odstęp do dnia. Postęp zostaje tylko w tej przeglądarce."
                      />
                      <div className="panel review-summary">
                        <span className="stat-icon mint">
                          <RotateIcon size={26} />
                        </span>
                        <div>
                          <h2>
                            {due.length
                              ? `${due.length} lekcji czeka na powtórkę`
                              : "Na dziś wszystko gotowe."}
                          </h2>
                          <p className="muted">
                            {Object.keys(progress.reviews).length
                              ? "Możesz wrócić wcześniej do dowolnego tematu poniżej."
                              : "Rozwiąż pierwsze zadanie, a powtórki pojawią się tutaj."}
                          </p>
                        </div>
                      </div>
                      <div className="review-grid">
                        {lessons
                          .filter((l) => progress.reviews[l.id])
                          .map((l) => (
                            <button
                              className="panel review-card"
                              key={l.id}
                              onClick={() => openLesson(l)}
                            >
                              <span className="eyebrow">
                                {isReviewDue(progress.reviews[l.id])
                                  ? "NA DZIŚ"
                                  : `POWRÓT: ${new Date(progress.reviews[l.id].dueAt).toLocaleDateString("pl-PL")}`}
                              </span>
                              <h3>{l.title}</h3>
                              <span className="text-button">
                                Przećwicz ponownie <ArrowRight size={16} />
                              </span>
                            </button>
                          ))}
                      </div>
                      {!Object.keys(progress.reviews).length && (
                        <button
                          className="button primary"
                          onClick={() => openLesson(lessons[0])}
                        >
                          Odkryj pierwszą lekcję <ArrowRight size={17} />
                        </button>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
              {/* Retain in-progress answers when opening a lesson from the review. */}
              {crashVisited && (
                <div hidden={page !== "crash"}>
                  <CrashCourse lessons={lessons} onOpenLesson={openLesson} />
                </div>
              )}
            </main>
          </div>
          <nav className="mobile-bottom-bar" aria-label="Nawigacja mobilna">
            {[
              { href: "/", label: "Start", icon: Home, page: "home" },
              { href: "/sciezka", label: "Ścieżka", icon: Network, page: "path" },
              { href: "/zadania", label: "Zadania", icon: Dumbbell, page: "tasks" },
              { href: "/omnikumpel", label: "OmniKumpel", icon: Bot, page: "kumpel" },
              { href: "/sprawdzian", label: "Sprawdzian", icon: Zap, page: "crash" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onNavigate={followLink(item.href)}
                className={page === item.page ? "active" : ""}
                aria-current={page === item.page ? "page" : undefined}
              >
                <item.icon size={19} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          {(helperOpen || ["lesson", "tasks"].includes(page)) && <OmniKumpelDock showTrigger={["lesson", "tasks"].includes(page)} onPractice={startOmniPractice} />}
          {searchOpen && (
            <CommandPalette lessons={lessons} initialQuery={searchQuery} onLesson={openLesson} onSmartPractice={startSmartPractice}
              onPractice={(item) => { setProgress((p) => ({ ...p, lastLessonId: item.id })); navigate(problemPath({ topicId: item.id, difficulty: 1, seed: Math.floor(Math.random() * 4294967296) })); }}
              onTool={(tool) => { setToolTab(tool); setToolRequest((n) => n + 1); jump("tools"); }}
              onClose={() => { setSearchOpen(false); setSearchQuery(""); }} />
          )}
          {settings && (
            <ProfileDialog progress={progress} onChange={setProgress} onClose={() => setSettings(false)} />
          )}
          {backupOpen && (
            <BackupDialog progress={progress} onChange={setProgress} onClose={() => setBackupOpen(false)} />
          )}
        </div>
      </MotionConfig>
    </LessonLinksProvider>
  );
}
function RotateIcon({ size = 18 }: { size?: number }) {
  return <GraduationCap size={size} />;
}
function LessonOmniContext({ lesson }: { lesson: Lesson }) {
  useOmniQuestion({ id: `lesson:${lesson.id}`, title: lesson.title, prompt: `Pomóż mi zrozumieć: ${lesson.title}. Wzór z lekcji: ${lesson.formula}`, lessonHint: lesson.modes.eli5 });
  return null;
}
function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
