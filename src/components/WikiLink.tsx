"use client";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { BookOpen, CornerDownLeft } from "lucide-react";
import type { Lesson } from "@/lib/lesson";
import {
  createLessonLookup,
  parseWikiLink,
  previewDefinition,
  tokenizeLessonText,
} from "@/lib/wikiLinks";
import { MathFormula } from "./MathFormula";
import "./WikiLink.css";

const Context = createContext<{
  lookup: Map<string, Lesson>;
  onOpen: (lesson: Lesson) => void;
} | null>(null);
export function LessonLinksProvider({
  lessons,
  onOpen,
  children,
}: {
  lessons: Lesson[];
  onOpen: (lesson: Lesson) => void;
  children: ReactNode;
}) {
  const lookup = useMemo(() => createLessonLookup(lessons), [lessons]);
  return (
    <Context.Provider value={{ lookup, onOpen }}>{children}</Context.Provider>
  );
}

export default function WikiLink({ value }: { value: string }) {
  const context = useContext(Context);
  const { target, label } = parseWikiLink(value);
  const lesson = context?.lookup.get(target);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const trigger = useRef<HTMLButtonElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const closing = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewOnly = useRef(false);
  const id = useId();
  const cancelClose = () => {
    if (closing.current) clearTimeout(closing.current);
  };
  const show = () => {
    cancelClose();
    setOpen(true);
  };
  const hide = () => {
    cancelClose();
    setOpen(false);
  };
  const leave = () => {
    cancelClose();
    closing.current = setTimeout(() => {
      if (document.activeElement !== trigger.current) setOpen(false);
    }, 140);
  };
  useEffect(() => () => cancelClose(), []);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        hide();
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !trigger.current?.contains(event.target) &&
        !preview.current?.contains(event.target)
      )
        hide();
    };
    window.addEventListener("keydown", dismiss, true);
    document.addEventListener("pointerdown", outside, true);
    return () => {
      window.removeEventListener("keydown", dismiss, true);
      document.removeEventListener("pointerdown", outside, true);
    };
  }, [open]);
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect();
      const bubble = preview.current?.getBoundingClientRect();
      if (!anchor || !bubble) return;
      const below = anchor.bottom + 12;
      setPosition({
        left: Math.max(
          10,
          Math.min(innerWidth - bubble.width - 10, anchor.left),
        ),
        top: Math.max(
          10,
          below + bubble.height < innerHeight - 10
            ? below
            : anchor.top - bubble.height - 12,
        ),
      });
    };
    place();
    const observer = new ResizeObserver(place);
    if (preview.current) observer.observe(preview.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);
  if (!lesson || !context)
    return (
      <span className="wiki-unresolved" title="Brak podglądu tej notatki">
        {label}
      </span>
    );
  return (
    <>
      <button
        type="button"
        role="link"
        ref={trigger}
        className="wiki-link"
        aria-describedby={open ? id : undefined}
        onMouseEnter={show}
        onPointerDown={(event) => {
          previewOnly.current = event.pointerType !== "mouse" && !open;
        }}
        onPointerCancel={() => {
          previewOnly.current = false;
        }}
        onMouseLeave={leave}
        onFocus={show}
        onBlur={hide}
        onClick={(event) => {
          if (previewOnly.current && event.detail !== 0) {
            previewOnly.current = false;
            show();
            return;
          }
          hide();
          context.onOpen(lesson);
        }}
      >
        {label}
      </button>
      {open &&
        createPortal(
          <motion.div
            id={id}
            ref={preview}
            role="tooltip"
            className="wiki-preview panel"
            style={position}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={cancelClose}
            onMouseLeave={leave}
          >
            <div className="wiki-preview-kicker">
              <BookOpen size={13} />
              <span>POŁĄCZONE W TWOIM VAULCIE</span>
            </div>
            <h3>{lesson.title}</h3>
            <p className="wiki-preview-definition">
              {tokenizeLessonText(previewDefinition(lesson)).map((token, i) =>
                token.kind === "math" || token.kind === "displayMath" ? (
                  <MathFormula key={i} value={token.value} />
                ) : (
                  <span key={i}>
                    {token.kind === "wiki"
                      ? parseWikiLink(token.value).label
                      : token.value}
                  </span>
                ),
              )}
            </p>
            <MathFormula value={lesson.formula} block />
            <div className="wiki-preview-footer">
              <span>{lesson.category}</span>
              <span>
                <CornerDownLeft size={12} /> Kliknij pojęcie · na dotyku dotknij
                ponownie
              </span>
            </div>
          </motion.div>,
          document.body,
        )}
    </>
  );
}
