"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
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
import MathText, { MathFormula } from "./MathText";
import InfinitePractice from "./InfinitePractice";
import Visualizer from "./Visualizer";
import Tools from "./Tools";
import SkillTree from "./SkillTree";
import TasksCenter from "./TasksCenter";
import { isReviewDue } from "@/lib/review";
import CommandPalette from "./CommandPalette";
import ProfileDialog from "./ProfileDialog";
import { DashboardCircleDemo, DashboardPerspectives } from "./DashboardDemos";
import { LessonLinksProvider } from "./WikiLink";
import CrashCourse from "./CrashCourse";
import "./WorkspaceQoL.css";
import "./WorkspaceRefresh.css";
import { ScratchpadProvider, useScratchpad } from "./ScratchpadContext";

type Page = "home" | "path" | "tasks" | "lesson" | "tools" | "review" | "crash";
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

export default function Workspace({ lessons }: { lessons: Lesson[] }) {
  return (
    <ScratchpadProvider>
      <WorkspaceContent lessons={lessons} />
    </ScratchpadProvider>
  );
}
function WorkspaceContent({ lessons }: { lessons: Lesson[] }) {
  const { open: scratchOpen, setOpen: setScratchOpen, size: scratchSize } =
    useScratchpad();
  const [page, setPage] = useState<Page>("home");
  const [crashVisited, setCrashVisited] = useState(false);
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("eli5");
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [settings, setSettings] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [trackLevel, setTrackLevel] = useState("all");
  const [practiceTopic, setPracticeTopic] = useState<string>();
  const [practiceRequest, setPracticeRequest] = useState(0);
  const [toolTab, setToolTab] = useState<"formula" | "matrix" | "graph" | "exam">("formula");
  const [toolRequest, setToolRequest] = useState(0);
  useEffect(() => {
    try {
      const saved = loadProgress(localStorage.getItem("omnimatma-v1"));
      setProgress(saved);
      if (lessons.some((item) => item.id === saved.lastLessonId))
        setLessonId(saved.lastLessonId!);
    } catch {
      setStorageError(true);
    }
    setReady(true);
  }, [lessons]);
  useEffect(() => {
    if (!ready) return;
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
        setSettings(false);
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSettings(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];
  const solved = Object.values(progress.solved).reduce((a, b) => a + b, 0);
  const completed = Object.values(progress.solved).filter((n) => n >= 5).length;
  const level = Math.floor(progress.xp / 500) + 1;
  const due = lessons.filter(
    (l) => progress.reviews[l.id] && isReviewDue(progress.reviews[l.id]),
  );
  const jump = (p: Page) => {
    if (p === "crash") setCrashVisited(true);
    setPage(p);
    setScratchOpen(false);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const openLesson = (l: Lesson) => {
    if (!l) return;
    setLessonId(l.id);
    setProgress((previous) => ({ ...previous, lastLessonId: l.id }));
    setMode("eli5");
    jump("lesson");
    setSearchOpen(false);
  };
  const nav = [
    { page: "home" as Page, label: "Twoja przestrzeń", icon: Home },
    { page: "path" as Page, label: "Ścieżka nauki", icon: Network },
    { page: "tasks" as Page, label: "Zadania", icon: Dumbbell },
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
            <button
              className="brand"
              onClick={() => jump("home")}
              aria-label="OmniMatma — strona główna"
            >
              <span className="brand-symbol">
                <InfinityIcon size={26} />
              </span>
              <span>
                omni<span className="brand-light">matma</span>
                <sup>β</sup>
              </span>
            </button>
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
                <button
                  key={n.page}
                  onClick={() => jump(n.page)}
                  className={`nav-item ${page === n.page ? "active" : ""}`}
                  aria-current={page === n.page ? "page" : undefined}
                >
                  <n.icon size={19} />
                  <span>{n.label}</span>
                  {n.page === "review" && due.length > 0 && <b>{due.length}</b>}
                  {n.page === "home" && <span className="nav-dot" />}
                </button>
              ))}
            </nav>
            <div className="sidebar-divider" />
            <span className="nav-label">ODKRYWAJ MATEMATYKĘ</span>
            <div className="track-nav">
              {tracks.map((t) => (
                <button
                  key={t.key}
                  onClick={() =>
                    openLesson(lessons.find((l) => l.id.startsWith(t.key))!)
                  }
                >
                  <span className={`tiny-dot ${t.color}`} />
                  {t.label}
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
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
                  aria-label="Otwórz menu"
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
              {storageError && (
                <p className="storage-warning" role="status">
                  Przeglądarka blokuje zapis. Postęp działa w tej sesji, ale nie
                  zostanie zachowany.
                </p>
              )}
              <AnimatePresence initial={false}>
                <motion.div
                  className="workspace-page"
                  key={page + (page === "lesson" ? lessonId : "")}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  {page === "home" && (
                    <>
                      <div className="welcome-line">
                        <span>
                          <span className="status-dot" /> TWOJE MIEJSCE NA
                          WIELKIE „AHA!”
                        </span>
                        <span className="version-tag">OMNIMATMA / 01</span>
                      </div>
                      <section className="resume-card panel" aria-label="Twój następny krok">
                        <span className="resume-icon"><BookOpen size={23} /></span>
                        <div>
                          <span className="eyebrow">{progress.xp > 0 ? "DOBRZE CIĘ ZNOWU WIDZIEĆ" : "MAŁY KROK. WIELKIE AHA."}</span>
                          <h2>{progress.xp > 0 ? `Wróć do nauki: ${resumeLesson?.title}` : "Odkrywaj we własnym tempie."}</h2>
                          <p>{progress.xp > 0 ? "Twój postęp czeka. Kontynuuj od ostatniego tematu." : "Zacznij od podstaw — niczego nie blokujemy i nigdzie się nie spieszymy."}</p>
                        </div>
                        <button className="button primary" onClick={() => openLesson(resumeLesson)}>
                          {progress.xp > 0 ? "Kontynuuj lekcję" : "Otwórz pierwszą lekcję"}<ArrowRight size={16} />
                        </button>
                      </section>
                      <section className="hero panel">
                        <div className="hero-copy">
                          <span className="chip hero-chip">
                            <Sparkles size={13} /> Wiedza, która zostaje z Tobą
                          </span>
                          <h1>
                            Matematyka.
                            <br />
                            <span>W końcu po Twojemu.</span>
                          </h1>
                          <p>
                            Nie musisz mieć „ścisłego umysłu”. Wystarczy
                            ciekawość.
                            <br className="desktop-break" /> Zrozum idee,
                            eksperymentuj i odkrywaj krok po kroku.
                          </p>
                          <button
                            className="button primary"
                            onClick={() => openLesson(resumeLesson)}
                          >
                            {solved ? "Wróć do nauki" : "Zacznij odkrywać"}
                            <ArrowRight size={17} />
                          </button>
                          <div className="hero-footnote">
                            <span className="tiny-dot mint" /> Bez opłat. Bez
                            limitów. Od absolutnego zera.
                          </div>
                        </div>
                        <OrbitalArt />
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
                          <div className="mini-progress">
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
                      <section className="panel crash-entry">
                        <div className="crash-entry-icon">
                          <Zap size={24} />
                        </div>
                        <div>
                          <span className="eyebrow">
                            MNIEJ PANIKI. WIĘCEJ KONKRETÓW.
                          </span>
                          <h2>Kolokwium / Sprawdzian jutro</h2>
                          <p>
                            Wzory, pułapki i szybki test z wybranych działów — w
                            jednym miejscu.
                          </p>
                        </div>
                        <button
                          className="button primary"
                          onClick={() => jump("crash")}
                        >
                          Ułóż szybką powtórkę <ArrowRight size={16} />
                        </button>
                      </section>
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
                      <div className="bottom-bento">
                        <DashboardPerspectives />
                        <DashboardCircleDemo onOpenTools={() => { setToolTab("graph"); setToolRequest((n) => n + 1); jump("tools"); }} />
                      </div>
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
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={mode}
                                id="mode-panel"
                                role="tabpanel"
                                aria-labelledby={`tab-${mode}`}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
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
                    <TasksCenter
                      key={`${practiceTopic ?? "all"}-${practiceRequest}`}
                      initialTopicId={practiceTopic}
                      lessons={lessons}
                      onSolved={(problemId, difficulty) => {
                        const target = lessons.find((item) =>
                          problemId.startsWith(`${item.generatorId}-`),
                        );
                        if (!target) return false;
                        const granted = !progress.awarded.includes(problemId);
                        setProgress((previous) =>
                          award(previous, target.id, problemId, difficulty),
                        );
                        return granted;
                      }}
                    />
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
          {searchOpen && (
            <CommandPalette lessons={lessons} onLesson={openLesson}
              onPractice={(item) => { setPracticeTopic(item.id); setPracticeRequest((n) => n + 1); setProgress((p) => ({ ...p, lastLessonId: item.id })); jump("tasks"); }}
              onTool={(tool) => { setToolTab(tool); setToolRequest((n) => n + 1); jump("tools"); }}
              onClose={() => setSearchOpen(false)} />
          )}
          {settings && (
            <ProfileDialog progress={progress} onChange={setProgress} onClose={() => setSettings(false)} />
          )}
        </div>
      </MotionConfig>
    </LessonLinksProvider>
  );
}
function RotateIcon({ size = 18 }: { size?: number }) {
  return <GraduationCap size={size} />;
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
