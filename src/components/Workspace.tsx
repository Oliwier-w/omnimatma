"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Command,
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
  X,
  Zap,
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
import { isReviewDue } from "@/lib/review";
import { useModalFocus } from "@/lib/useModalFocus";

type Page = "home" | "path" | "lesson" | "tools" | "review";
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
  const [page, setPage] = useState<Page>("home");
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("eli5");
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const [settings, setSettings] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useModalFocus(searchOpen || settings);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      setProgress(loadProgress(localStorage.getItem("omnimatma-v1")));
    } catch {
      setStorageError(true);
    }
    setReady(true);
  }, []);
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
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
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);
  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];
  const solved = Object.values(progress.solved).reduce((a, b) => a + b, 0);
  const completed = Object.values(progress.solved).filter((n) => n >= 5).length;
  const level = Math.floor(progress.xp / 500) + 1;
  const due = lessons.filter(
    (l) => progress.reviews[l.id] && isReviewDue(progress.reviews[l.id]),
  );
  const jump = (p: Page) => {
    setPage(p);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openLesson = (l: Lesson) => {
    setLessonId(l.id);
    setMode("eli5");
    jump("lesson");
    setSearchOpen(false);
  };
  const nav = [
    { page: "home" as Page, label: "Twoja przestrzeń", icon: Home },
    { page: "path" as Page, label: "Ścieżka nauki", icon: Network },
    { page: "review" as Page, label: "Powtórki", icon: RotateIcon },
    { page: "tools" as Page, label: "Laboratorium", icon: Wrench },
  ];
  const filtered = lessons.filter((l) =>
    `${l.title} ${l.category}`
      .toLocaleLowerCase("pl")
      .includes(query.toLocaleLowerCase("pl")),
  );
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
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
            onClick={() => setSearchOpen(true)}
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
              <span className="avatar">O</span>
              <span>
                <strong>Odkrywca</strong>
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
            <div className="topbar-actions">
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
              <span className="avatar small">O</span>
            </div>
          </header>
          <main id="main" tabIndex={-1}>
            {storageError && (
              <p className="storage-warning" role="status">
                Przeglądarka blokuje zapis. Postęp działa w tej sesji, ale nie
                zostanie zachowany.
              </p>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={page + (page === "lesson" ? lessonId : "")}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                {page === "home" && (
                  <>
                    <div className="welcome-line">
                      <span>
                        <span className="status-dot" /> TWOJE MIEJSCE NA WIELKIE
                        „AHA!”
                      </span>
                      <span className="version-tag">OMNIMATMA / 01</span>
                    </div>
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
                          onClick={() =>
                            openLesson(
                              lessons.find(
                                (l) => l.id === "fractions-meaning",
                              ) ?? lessons[0],
                            )
                          }
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
                        <span className="stat-caption">5 zadań = 1 lekcja</span>
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
                    <div className="track-grid">
                      {tracks.map((t, i) => {
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
                                  width: `${(count / group.length) * 100}%`,
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
                      <section className="panel approach-card">
                        <div className="section-heading">
                          <span className="icon-tile">
                            <BookOpen size={20} />
                          </span>
                          <span className="chip">
                            JEDEN TEMAT. CZTERY PERSPEKTYWY.
                          </span>
                        </div>
                        <h3>
                          Każdy rozumie inaczej.
                          <br />
                          Znajdź swoje „aha!”.
                        </h3>
                        <p className="muted">
                          Metafora, przepis, obraz czy definicja? Przełączaj
                          sposób wyjaśniania w dowolnej lekcji.
                        </p>
                        <div className="mode-preview">
                          {modes.map((m) => (
                            <button
                              className={m.color}
                              key={m.id}
                              onClick={() => {
                                openLesson(lesson);
                                setMode(m.id);
                              }}
                            >
                              <span className={`tiny-dot ${m.color}`} />
                              {m.short}
                            </button>
                          ))}
                        </div>
                      </section>
                      <section className="panel lab-card">
                        <span className="eyebrow">
                          MNIEJ WKUWANIA. WIĘCEJ ODKRYWANIA.
                        </span>
                        <div className="lab-formula">
                          <MathFormula
                            value={String.raw`\color{#a5a0ff}x^{2}\color{#8e91a7}{+}\color{#5edbb7}y^{2}\color{#8e91a7}{=}\color{#f5bd87}r^{2}`}
                          />
                        </div>
                        <h3>A co, jeśli zmienisz jedną liczbę?</h3>
                        <p className="muted">
                          Przesuwaj parametry. Sprawdzaj macierze.
                          <br />
                          Matematyka najlepiej działa w praktyce.
                        </p>
                        <button
                          className="text-button"
                          onClick={() => jump("tools")}
                        >
                          Otwórz laboratorium <ArrowUpRight size={16} />
                        </button>
                      </section>
                    </div>
                    <footer className="page-footer">
                      <span>
                        <InfinityIcon size={17} /> Matematyka jest dla każdego.
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
                      eyebrow={`${lesson.level === "studia" ? "STUDIA" : "SZKOŁA PODSTAWOWA"} · MIKRO-LEKCJA · ${lesson.minutes} MIN`}
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
                              <h2>{modes.find((m) => m.id === mode)?.label}</h2>
                              <MathText text={lesson.modes[mode]} />
                              {mode === "visual" && (
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
                        </section>
                        <InfinitePractice
                          key={lesson.id}
                          lesson={lesson}
                          onSolved={(problemId, difficulty) => {
                            const granted = !progress.awarded.includes(problemId);
                            setProgress((p) =>
                              award(p, lesson.id, problemId, difficulty),
                            );
                            return granted;
                          }}
                          onMiss={() => setProgress((p) => miss(p, lesson.id))}
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
                            <span className="tiny-dot mint" /> Źródło: Obsidian
                            Vault
                          </span>
                        </section>
                      </aside>
                    </div>
                  </>
                )}
                {page === "tools" && (
                  <>
                    <PageTitle
                      eyebrow="EKSPERYMENTUJ BEZ OBAW"
                      title="Twoje laboratorium."
                      description="Sprawdź pomysł, zobacz zależność, przygotuj się do egzaminu. Tu możesz się mylić."
                    />
                    <Tools lessons={lessons} />
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
          </main>
        </div>
        {searchOpen && (
          <div className="modal-backdrop" onClick={() => setSearchOpen(false)}>
            <section
              className="search-modal panel"
              role="dialog"
              aria-modal="true"
              aria-label="Wyszukaj lekcję"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  const nodes =
                    e.currentTarget.querySelectorAll<HTMLElement>(
                      "button,input",
                    );
                  if (e.shiftKey && document.activeElement === nodes[0]) {
                    e.preventDefault();
                    nodes[nodes.length - 1]?.focus();
                  } else if (
                    !e.shiftKey &&
                    document.activeElement === nodes[nodes.length - 1]
                  ) {
                    e.preventDefault();
                    nodes[0]?.focus();
                  }
                }
              }}
            >
              <div className="search-input">
                <Search size={21} />
                <input
                  ref={searchRef}
                  aria-label="Szukaj tematu"
                  placeholder="Czego chcesz się dziś nauczyć?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className="icon-button"
                  aria-label="Zamknij wyszukiwarkę"
                  onClick={() => setSearchOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="search-results">
                {filtered.map((l) => (
                  <button key={l.id} onClick={() => openLesson(l)}>
                    <BookOpen size={18} />
                    <span>
                      <strong>{l.title}</strong>
                      <small>{l.category}</small>
                    </span>
                    <ArrowUpRight size={17} />
                  </button>
                ))}
                {!filtered.length && (
                  <p className="muted">
                    Brak takiej lekcji. Spróbuj „ułamki”, „macierze” lub
                    „zespolone”.
                  </p>
                )}
              </div>
              <div className="search-footer">
                <Command size={13} /> K — otwórz · Esc — zamknij · Tab — wybierz
              </div>
            </section>
          </div>
        )}
        {settings && (
          <div className="modal-backdrop" onClick={() => setSettings(false)}>
            <section
              className="panel settings-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Wygląd aplikacji"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="section-heading">
                <h2>Twoja przestrzeń. Twój klimat.</h2>
                <button
                  autoFocus
                  className="icon-button"
                  aria-label="Zamknij ustawienia"
                  onClick={() => setSettings(false)}
                >
                  <X size={19} />
                </button>
              </div>
              <p className="muted">
                Motyw zapisuje się na tym urządzeniu. Animacje respektują
                ustawienie ograniczenia ruchu.
              </p>
              {[
                ["space", "Deep Space", "Ciemność, która pomaga się skupić."],
                ["paper", "Clean Paper", "Ciepły papier i spokojny kontrast."],
                ["neon", "Cyberpunk Neon", "Odrobina elektrycznej energii."],
                ["matcha", "Matcha Cozy", "Zieleń i wolniejsze tempo."],
                [
                  "contrast",
                  "Wysoki kontrast",
                  "Wyraźne granice i większe odstępy.",
                ],
              ].map(([id, name, desc]) => (
                <button
                  key={id}
                  className={`theme-option ${progress.theme === id ? "selected" : ""}`}
                  onClick={() => setProgress((p) => ({ ...p, theme: id }))}
                >
                  <span className={`theme-swatch swatch-${id}`} />
                  <span>
                    <strong>{name}</strong>
                    <small>{desc}</small>
                  </span>
                  {progress.theme === id && <Check size={18} />}
                </button>
              ))}
            </section>
          </div>
        )}
      </div>
    </MotionConfig>
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
