"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  CircleDot,
  Crosshair,
  Eraser,
  Grid3X3,
  Highlighter,
  Minus,
  PenLine,
  Redo2,
  Scan,
  Square,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export type ScratchPoint = { x: number; y: number };
export type ScratchStroke = {
  id: string;
  points: ScratchPoint[];
  color: string;
  width: number;
  opacity: number;
  kind: "pen" | "highlighter" | "line" | "axes";
};
export type ScratchText = {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
};
export type ScratchBackground = "grid" | "dots" | "plain";
type Tool = "pen" | "highlighter" | "eraser" | "line" | "axes" | "text";
type View = { x: number; y: number; scale: number };

const TOOLS: {
  id: Tool;
  label: string;
  title: string;
  icon: typeof PenLine;
}[] = [
  { id: "pen", label: "Pisak", title: "Pisak (P)", icon: PenLine },
  {
    id: "highlighter",
    label: "Zakreślacz",
    title: "Zakreślacz (H)",
    icon: Highlighter,
  },
  { id: "eraser", label: "Gumka", title: "Gumka (E)", icon: Eraser },
  { id: "line", label: "Linia prosta", title: "Linia prosta (L)", icon: Minus },
  { id: "axes", label: "Osie układu", title: "Wstaw osie (A)", icon: Crosshair },
  { id: "text", label: "Tekst lub wzór", title: "Tekst / wzór (T)", icon: Type },
];

const COLORS = [
  { value: "var(--text)", label: "Kolor tekstu" },
  { value: "var(--accent)", label: "Fioletowy" },
  { value: "var(--green)", label: "Zielony" },
  { value: "var(--peach)", label: "Bursztynowy" },
  { value: "#70b7ff", label: "Błękitny" },
];

const BACKGROUNDS: {
  id: ScratchBackground;
  label: string;
  icon: typeof Grid3X3;
}[] = [
  { id: "grid", label: "Kratka matematyczna", icon: Grid3X3 },
  { id: "dots", label: "Kropki", icon: CircleDot },
  { id: "plain", label: "Czysta tablica", icon: Square },
];

const MAX_STROKES = 400;
const MAX_POINTS = 3200;
const GRID = 28;

function uid() {
  return `ink-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function tokenColor(token: string, style: CSSStyleDeclaration) {
  const match = token.match(/^var\((--[\w-]+)\)$/);
  if (!match) return token;
  return style.getPropertyValue(match[1]).trim() || "#eeedf5";
}

function distanceToSegment(
  point: ScratchPoint,
  a: ScratchPoint,
  b: ScratchPoint,
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (!dx && !dy) return Math.hypot(point.x - a.x, point.y - a.y);
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy),
    ),
  );
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

function strokeHits(stroke: ScratchStroke, point: ScratchPoint, radius: number) {
  if (stroke.points.length === 1)
    return Math.hypot(stroke.points[0].x - point.x, stroke.points[0].y - point.y) <= radius;
  return stroke.points.some((a, i) => {
    const b = stroke.points[i + 1];
    return b ? distanceToSegment(point, a, b) <= radius : false;
  });
}

function drawSmoothLine(
  ctx: CanvasRenderingContext2D,
  points: ScratchPoint[],
  width: number,
  color: string,
  opacity: number,
) {
  if (!points.length) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, Math.max(1, width / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    ctx.quadraticCurveTo(
      current.x,
      current.y,
      (current.x + next.x) / 2,
      (current.y + next.y) / 2,
    );
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.restore();
}

export default function ScratchpadCanvas({
  strokes,
  textBlocks,
  onStrokesChange,
  onTextBlocksChange,
  onNotice,
}: {
  strokes: ScratchStroke[];
  textBlocks: ScratchText[];
  onStrokesChange: (next: ScratchStroke[]) => void;
  onTextBlocksChange: (next: ScratchText[]) => void;
  onNotice: (message: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0].value);
  const [width, setWidth] = useState(3);
  const [background, setBackground] = useState<ScratchBackground>("grid");
  const [textValue, setTextValue] = useState("");
  const [historyTick, setHistoryTick] = useState(0);
  const viewRef = useRef(view);
  const strokesRef = useRef(strokes);
  const textRef = useRef(textBlocks);
  const backgroundRef = useRef(background);
  const draftRef = useRef<ScratchStroke | null>(null);
  const activeRef = useRef<{
    pointer: number;
    kind: "draw" | "pan" | "erase";
    startClient?: ScratchPoint;
    startView?: View;
  } | null>(null);
  const pastRef = useRef<{ strokes: ScratchStroke[]; texts: ScratchText[] }[]>(
    [],
  );
  const futureRef = useRef<{ strokes: ScratchStroke[]; texts: ScratchText[] }[]>(
    [],
  );
  const rafRef = useRef<number | null>(null);
  const drawRef = useRef<() => void>(() => undefined);
  const zoomAtRef = useRef<(factor: number, x?: number, y?: number) => void>(
    () => undefined,
  );
  const spaceRef = useRef(false);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);
  useEffect(() => {
    textRef.current = textBlocks;
  }, [textBlocks]);
  useEffect(() => {
    backgroundRef.current = background;
  }, [background]);

  const requestDraw = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      drawRef.current();
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !viewport.width || !viewport.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const pixelWidth = Math.max(1, Math.round(viewport.width * dpr));
    const pixelHeight = Math.max(1, Math.round(viewport.height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const style = getComputedStyle(canvas);
    const backgroundToken = style.getPropertyValue("--bg").trim() || "#090a0f";
    const lineToken = style.getPropertyValue("--line").trim() || "#2b2d3a";
    const accentToken =
      style.getPropertyValue("--accent").trim() || "#8b5cf6";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    ctx.fillStyle = backgroundToken;
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    const current = viewRef.current;
    const visible = {
      left: -current.x / current.scale,
      top: -current.y / current.scale,
      right: (viewport.width - current.x) / current.scale,
      bottom: (viewport.height - current.y) / current.scale,
    };
    ctx.save();
    ctx.translate(current.x, current.y);
    ctx.scale(current.scale, current.scale);
    if (backgroundRef.current === "grid") {
      const firstX = Math.floor(visible.left / GRID) * GRID;
      const firstY = Math.floor(visible.top / GRID) * GRID;
      ctx.lineWidth = 1 / current.scale;
      for (let x = firstX; x <= visible.right; x += GRID) {
        const major = Math.round(x / GRID) % 5 === 0;
        ctx.globalAlpha = major ? 0.34 : 0.16;
        ctx.strokeStyle = major ? accentToken : lineToken;
        ctx.beginPath();
        ctx.moveTo(x, visible.top);
        ctx.lineTo(x, visible.bottom);
        ctx.stroke();
      }
      for (let y = firstY; y <= visible.bottom; y += GRID) {
        const major = Math.round(y / GRID) % 5 === 0;
        ctx.globalAlpha = major ? 0.34 : 0.16;
        ctx.strokeStyle = major ? accentToken : lineToken;
        ctx.beginPath();
        ctx.moveTo(visible.left, y);
        ctx.lineTo(visible.right, y);
        ctx.stroke();
      }
    } else if (backgroundRef.current === "dots") {
      const radius = 1.15 / current.scale;
      ctx.fillStyle = lineToken;
      ctx.globalAlpha = 0.65;
      const firstX = Math.floor(visible.left / GRID) * GRID;
      const firstY = Math.floor(visible.top / GRID) * GRID;
      for (let x = firstX; x <= visible.right; x += GRID) {
        for (let y = firstY; y <= visible.bottom; y += GRID) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
    for (const stroke of strokesRef.current) {
      drawSmoothLine(
        ctx,
        stroke.points,
        stroke.width,
        tokenColor(stroke.color, style),
        stroke.opacity,
      );
      if (stroke.kind === "axes" && stroke.points.length > 1) {
        const a = stroke.points[0];
        const b = stroke.points[stroke.points.length - 1];
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const size = 9 / current.scale;
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = accentToken;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(
          b.x - size * Math.cos(angle - Math.PI / 6),
          b.y - size * Math.sin(angle - Math.PI / 6),
        );
        ctx.lineTo(
          b.x - size * Math.cos(angle + Math.PI / 6),
          b.y - size * Math.sin(angle + Math.PI / 6),
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    if (draftRef.current)
      drawSmoothLine(
        ctx,
        draftRef.current.points,
        draftRef.current.width,
        tokenColor(draftRef.current.color, style),
        draftRef.current.opacity,
      );
    for (const block of textRef.current) {
      ctx.save();
      ctx.globalAlpha = 0.96;
      ctx.fillStyle = tokenColor(block.color, style);
      ctx.font = `${block.size}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "middle";
      const lines = block.text.split("\n").slice(0, 4);
      lines.forEach((line, index) => {
        ctx.fillText(
          line.slice(0, 160),
          block.x,
          block.y + index * block.size * 1.35,
        );
      });
      ctx.restore();
    }
    ctx.restore();
  }, [viewport]);

  drawRef.current = draw;
  zoomAtRef.current = zoomAt;
  useEffect(() => {
    requestDraw();
  }, [
    requestDraw,
    strokes,
    textBlocks,
    background,
    view,
    viewport,
  ]);
  useEffect(() => {
    const element = surfaceRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = Math.max(1, Math.floor(entry.contentRect.width));
      const height = Math.max(1, Math.floor(entry.contentRect.height));
      setViewport((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomAtRef.current(
        Math.exp(-event.deltaY * 0.0015),
        event.clientX,
        event.clientY,
      );
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, []);

  useEffect(() => {
    const isEditable = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.matches("input, textarea, select") || target.isContentEditable);
    const down = (event: KeyboardEvent) => {
      if (event.code === "Space" && !isEditable(event.target)) {
        spaceRef.current = true;
        if (surfaceRef.current?.contains(document.activeElement))
          event.preventDefault();
      }
      if (isEditable(event.target)) return;
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (modifier && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "Space") spaceRef.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  });

  function pushSnapshot() {
    pastRef.current.push({
      strokes: strokesRef.current,
      texts: textRef.current,
    });
    if (pastRef.current.length > 80) pastRef.current.shift();
    futureRef.current = [];
    setHistoryTick((tick) => tick + 1);
  }

  function commit(nextStrokes: ScratchStroke[], nextTexts: ScratchText[]) {
    pushSnapshot();
    strokesRef.current = nextStrokes;
    textRef.current = nextTexts;
    onStrokesChange(nextStrokes);
    onTextBlocksChange(nextTexts);
    requestDraw();
  }

  function undo() {
    const previous = pastRef.current.pop();
    if (!previous) return;
    futureRef.current.push({
      strokes: strokesRef.current,
      texts: textRef.current,
    });
    strokesRef.current = previous.strokes;
    textRef.current = previous.texts;
    onStrokesChange(previous.strokes);
    onTextBlocksChange(previous.texts);
    setHistoryTick((tick) => tick + 1);
    requestDraw();
  }

  function redo() {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push({
      strokes: strokesRef.current,
      texts: textRef.current,
    });
    strokesRef.current = next.strokes;
    textRef.current = next.texts;
    onStrokesChange(next.strokes);
    onTextBlocksChange(next.texts);
    setHistoryTick((tick) => tick + 1);
    requestDraw();
  }

  function viewPoint(event: ReactPointerEvent<HTMLCanvasElement>): ScratchPoint {
    const rect = event.currentTarget.getBoundingClientRect();
    const current = viewRef.current;
    return {
      x: (event.clientX - rect.left - current.x) / current.scale,
      y: (event.clientY - rect.top - current.y) / current.scale,
    };
  }

  function beginPan(event: ReactPointerEvent<HTMLCanvasElement>) {
    activeRef.current = {
      pointer: event.pointerId,
      kind: "pan",
      startClient: { x: event.clientX, y: event.clientY },
      startView: { ...viewRef.current },
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function start(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!event.isPrimary || activeRef.current) return;
    surfaceRef.current?.focus({ preventScroll: true });
    if (event.button === 1 || spaceRef.current) {
      event.preventDefault();
      beginPan(event);
      return;
    }
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const point = viewPoint(event);
    if (tool === "text") {
      const text = textValue.trim();
      if (!text) {
        onNotice("Wpisz tekst lub wzór nad kartką, a potem kliknij kartkę.");
        return;
      }
      commit(strokesRef.current, [
        ...textRef.current,
        {
          id: uid(),
          x: point.x,
          y: point.y,
          text,
          color,
          size: width >= 5 ? 24 : 18,
        },
      ]);
      setTextValue("");
      onNotice("Notatka została wstawiona na kartkę.");
      return;
    }
    if (tool === "axes") {
      event.preventDefault();
      const current = viewRef.current;
      const left = -current.x / current.scale;
      const right = (viewport.width - current.x) / current.scale;
      const top = -current.y / current.scale;
      const bottom = (viewport.height - current.y) / current.scale;
      const axes: ScratchStroke[] = [
        {
          id: uid(),
          points: [
            { x: left, y: point.y },
            { x: right, y: point.y },
          ],
          color: "var(--accent)",
          width: 1.8,
          opacity: 0.72,
          kind: "axes",
        },
        {
          id: uid(),
          points: [
            { x: point.x, y: top },
            { x: point.x, y: bottom },
          ],
          color: "var(--accent)",
          width: 1.8,
          opacity: 0.72,
          kind: "axes",
        },
      ];
      commit([...strokesRef.current, ...axes], textRef.current);
      onNotice("Osie współrzędnych wstawione. Przeciągnij kartkę, aby je przesunąć.");
      return;
    }
    if (tool === "eraser") {
      event.preventDefault();
      pushSnapshot();
      activeRef.current = { pointer: event.pointerId, kind: "erase" };
      event.currentTarget.setPointerCapture(event.pointerId);
      eraseAt(point);
      return;
    }
    if (strokesRef.current.length >= MAX_STROKES) {
      onNotice("Kartka ma już 400 kresek. Cofnij lub wyczyść rysunek, aby pisać dalej.");
      return;
    }
    event.preventDefault();
    activeRef.current = { pointer: event.pointerId, kind: "draw" };
    event.currentTarget.setPointerCapture(event.pointerId);
    draftRef.current = {
      id: uid(),
      points: tool === "line" ? [point, point] : [point],
      color,
      width:
        tool === "highlighter" ? Math.max(12, width * 4) : Math.max(1, width),
      opacity: tool === "highlighter" ? 0.28 : 1,
      kind: tool === "line" ? "line" : tool === "highlighter" ? "highlighter" : "pen",
    };
    requestDraw();
  }

  function eraseAt(point: ScratchPoint) {
    const radius = 15 + width * 1.8;
    const nextStrokes = strokesRef.current.filter(
      (stroke) => !strokeHits(stroke, point, radius),
    );
    const nextTexts = textRef.current.filter(
      (block) => Math.hypot(block.x - point.x, block.y - point.y) > radius + 48,
    );
    if (nextStrokes.length === strokesRef.current.length && nextTexts.length === textRef.current.length)
      return;
    strokesRef.current = nextStrokes;
    textRef.current = nextTexts;
    onStrokesChange(nextStrokes);
    onTextBlocksChange(nextTexts);
    requestDraw();
  }

  function move(event: ReactPointerEvent<HTMLCanvasElement>) {
    const active = activeRef.current;
    if (!active || active.pointer !== event.pointerId) return;
    if (active.kind === "pan" && active.startClient && active.startView) {
      event.preventDefault();
      const next = {
        ...active.startView,
        x: active.startView.x + event.clientX - active.startClient.x,
        y: active.startView.y + event.clientY - active.startClient.y,
      };
      viewRef.current = next;
      setView(next);
      return;
    }
    const point = viewPoint(event);
    if (active.kind === "erase") {
      event.preventDefault();
      eraseAt(point);
      return;
    }
    const draft = draftRef.current;
    if (!draft) return;
    event.preventDefault();
    if (draft.kind === "line") {
      draftRef.current = { ...draft, points: [draft.points[0], point] };
    } else {
      const previous = draft.points[draft.points.length - 1];
      if (Math.hypot(point.x - previous.x, point.y - previous.y) < 1.4)
        return;
      if (draft.points.length >= MAX_POINTS) return;
      draftRef.current = { ...draft, points: [...draft.points, point] };
    }
    requestDraw();
  }

  function finish(event: ReactPointerEvent<HTMLCanvasElement>) {
    const active = activeRef.current;
    if (!active || active.pointer !== event.pointerId) return;
    if (active.kind === "draw") {
      const draft = draftRef.current;
      if (draft) {
        const point = viewPoint(event);
        const last = draft.points[draft.points.length - 1];
        const finished =
          draft.kind === "line"
            ? { ...draft, points: [draft.points[0], point] }
            : Math.hypot(point.x - last.x, point.y - last.y) > 0.8
              ? { ...draft, points: [...draft.points, point] }
              : draft;
        const next = [...strokesRef.current, finished];
        commit(next, textRef.current);
      }
    } else if (active.kind === "erase") {
      onNotice("Gumka usunęła fragment rysunku. Cofnij, jeśli to pomyłka.");
    }
    activeRef.current = null;
    draftRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    requestDraw();
  }

  function cancel(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (activeRef.current?.pointer !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    activeRef.current = null;
    draftRef.current = null;
    requestDraw();
  }

  function zoomAt(factor: number, clientX?: number, clientY?: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (clientY ?? rect.top + rect.height / 2) - rect.top;
    setView((current) => {
      const scale = Math.min(4, Math.max(0.3, current.scale * factor));
      const ratio = scale / current.scale;
      const next = {
        scale,
        x: x - (x - current.x) * ratio,
        y: y - (y - current.y) * ratio,
      };
      viewRef.current = next;
      return next;
    });
  }

  function keyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.code === "Space") {
      event.preventDefault();
      spaceRef.current = true;
      return;
    }
    const key = event.key.toLowerCase();
    if (key === "p") setTool("pen");
    else if (key === "h") setTool("highlighter");
    else if (key === "e") setTool("eraser");
    else if (key === "l") setTool("line");
    else if (key === "a") setTool("axes");
    else if (key === "t") setTool("text");
    else if (key === "+" || key === "=") zoomAt(1.15);
    else if (key === "-") zoomAt(1 / 1.15);
  }

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;
  void historyTick;

  return (
    <>
      <div className="scratchpad-ink-tools">
        <div
          className="scratchpad-tools"
          role="group"
          aria-label="Narzędzie brudnopisu"
        >
          {TOOLS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="scratchpad-tool-button"
                aria-pressed={tool === item.id}
                aria-label={item.label}
                title={item.title}
                onClick={() => {
                  draftRef.current = null;
                  activeRef.current = null;
                  setTool(item.id);
                  onNotice("");
                  surfaceRef.current?.focus({ preventScroll: true });
                }}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
        <div
          className="scratchpad-backgrounds"
          role="group"
          aria-label="Tło kartki"
        >
          {BACKGROUNDS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="scratchpad-tool-button"
                aria-pressed={background === item.id}
                aria-label={item.label}
                title={item.label}
                onClick={() => {
                  setBackground(item.id);
                  onNotice("");
                }}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>
        <div
          className="scratchpad-colors"
          role="group"
          aria-label="Kolor pisaka"
        >
          {COLORS.map((inkColor) => (
            <button
              key={inkColor.value}
              type="button"
              className="scratchpad-swatch"
              style={
                {
                  "--scratchpad-ink": inkColor.value,
                } as React.CSSProperties
              }
              aria-label={inkColor.label}
              aria-pressed={color === inkColor.value}
              onClick={() => {
                setColor(inkColor.value);
                onNotice("");
              }}
            />
          ))}
        </div>
        <label className="scratchpad-width">
          Grubość
          <select
            value={width}
            onChange={(event) => setWidth(Number(event.target.value))}
            aria-label="Grubość pisaka"
          >
            <option value={2}>Cienki</option>
            <option value={3}>Średni</option>
            <option value={6}>Gruby</option>
          </select>
        </label>
        <div className="scratchpad-history-tools">
          <button
            type="button"
            className="scratchpad-icon-button"
            disabled={!canUndo}
            aria-label="Cofnij ostatnią kreskę"
            title="Cofnij (Ctrl+Z)"
            onClick={undo}
          >
            <Undo2 size={17} />
          </button>
          <button
            type="button"
            className="scratchpad-icon-button"
            disabled={!canRedo}
            aria-label="Ponów ostatnią kreskę"
            title="Ponów (Ctrl+Y)"
            onClick={redo}
          >
            <Redo2 size={17} />
          </button>
          <button
            type="button"
            className="scratchpad-icon-button"
            disabled={!strokes.length && !textBlocks.length}
            aria-label="Wyczyść tylko rysunek"
            title="Wyczyść tylko rysunek"
            onClick={() => {
              commit([], []);
              onNotice("Rysunek wyczyszczony. Notatki pozostały bez zmian.");
            }}
          >
            <Trash2 size={17} />
          </button>
        </div>
        <div className="scratchpad-zoom-tools" role="group" aria-label="Zoom">
          <button
            type="button"
            className="scratchpad-icon-button"
            aria-label="Przybliż kartkę"
            title="Przybliż"
            onClick={() => zoomAt(1.15)}
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            className="scratchpad-icon-button"
            aria-label="Oddal kartkę"
            title="Oddal"
            onClick={() => zoomAt(1 / 1.15)}
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            className="scratchpad-icon-button"
            aria-label="Dopasuj widok kartki"
            title="Reset widoku"
            onClick={() => {
              const reset = { x: 0, y: 0, scale: 1 };
              viewRef.current = reset;
              setView(reset);
              onNotice("");
            }}
          >
            <Scan size={16} />
          </button>
        </div>
      </div>
      {tool === "text" && (
        <div className="scratchpad-text-entry">
          <Type size={15} aria-hidden="true" />
          <input
            value={textValue}
            maxLength={160}
            onChange={(event) => setTextValue(event.target.value)}
            placeholder="np. x² − 4 = 0 · wpisz i kliknij kartkę"
            aria-label="Tekst lub wzór do wstawienia"
          />
          <span>Kliknij kartkę, aby wstawić</span>
        </div>
      )}
      <div
        className="scratchpad-paper scratchpad-drawing"
        data-tool={tool}
        onKeyDown={keyDown}
      >
        <span className="scratchpad-paper-label">MIEJSCE NA TWÓJ POMYSŁ</span>
        <div
          ref={surfaceRef}
          className="scratchpad-canvas"
          tabIndex={0}
          role="application"
          aria-label="Kartka do rysowania. Pisak, zakreślacz, gumka, linie, osie i tekst. Spacja z przeciągnięciem przesuwa kartkę, kółko myszy przybliża."
        >
          <canvas
            ref={canvasRef}
            className="scratchpad-canvas-surface"
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={finish}
            onPointerCancel={cancel}
            onLostPointerCapture={cancel}
          />
          <svg
            className="scratchpad-canvas-mirror"
            viewBox={`0 0 ${Math.max(1, viewport.width)} ${Math.max(1, viewport.height)}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {strokes.map((stroke) =>
              stroke.points.length === 1 ? (
                <circle
                  key={stroke.id}
                  cx={stroke.points[0].x}
                  cy={stroke.points[0].y}
                  r={Math.max(0.5, stroke.width / 2)}
                  fill={stroke.color}
                />
              ) : (
                <polyline
                  key={stroke.id}
                  points={stroke.points
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                  fill="none"
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ),
            )}
          </svg>
        </div>
        {!strokes.length && (
          <span className="scratchpad-draw-placeholder">
            <PenLine size={25} aria-hidden="true" />
            Tu zaczyna się Twój pomysł.
            <small>Rysuj swobodnie. Spacja + przeciągnięcie przesuwa kartkę.</small>
          </span>
        )}
        <span className="scratchpad-zoom-badge">
          {Math.round(view.scale * 100)}% · {background === "grid" ? "kratka" : background === "dots" ? "kropki" : "czysta"}
        </span>
      </div>
      <div className="scratchpad-drawing-status">
        <span>
          {strokes.length} / {MAX_STROKES} kresek · {textBlocks.length} notatek
        </span>
        <span>
          {tool === "text"
            ? "Wpisz tekst, potem kliknij kartkę"
            : tool === "axes"
              ? "Kliknij, aby wstawić osie"
              : tool === "eraser"
                ? "Przeciągnij po kresce, aby ją usunąć"
                : "Spacja + przeciągnięcie · kółko myszy = zoom"}
        </span>
      </div>
    </>
  );
}
