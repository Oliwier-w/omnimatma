"use client";
import { createPortal } from "react-dom";
import { Bot, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { OmniPracticeSpec } from "@/lib/omnikumpelTypes";
import { useModalFocus } from "@/lib/useModalFocus";
import { useOmniKumpel } from "./OmniKumpelContext";
import { useScratchpad } from "./ScratchpadContext";
import OmniKumpel from "./OmniKumpel";
import "./OmniKumpelDock.css";

function HelperPanel({ onPractice }: { onPractice: (spec: OmniPracticeSpec) => void }) {
  const { question, helperMode, setHelperOpen } = useOmniKumpel();
  const { notes } = useScratchpad();
  useModalFocus(true);
  const reduced = useReducedMotion();
  return createPortal(<div className="ok-dock-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setHelperOpen(false); }}>
    <motion.aside className="ok-dock-panel" role="dialog" aria-modal="true" aria-label="OmniKumpel — pomoc do zadania"
      initial={reduced ? false : { x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 32 }}
      onKeyDown={(event) => { if (event.key === "Escape" && !event.defaultPrevented) { event.stopPropagation(); setHelperOpen(false); } }}>
      <div className="ok-dock-heading"><span><Bot size={20} /> Pomoc bez gubienia wątku</span><button type="button" className="icon-button" aria-label="Zamknij pomoc OmniKumpla" onClick={() => setHelperOpen(false)}><X size={20} /></button></div>
      <OmniKumpel key={`${question?.id ?? "blank"}-${helperMode}`} context={question} initialMode={helperMode} scratchpadNotes={notes} compact onPractice={(spec) => { setHelperOpen(false); onPractice(spec); }} onClose={() => setHelperOpen(false)} />
    </motion.aside>
  </div>, document.body);
}
export default function OmniKumpelDock({ onPractice, showTrigger = true }: { onPractice: (spec: OmniPracticeSpec) => void; showTrigger?: boolean }) {
  const { question, helperOpen, openHelper } = useOmniKumpel();
  const { setOpen: setScratchOpen } = useScratchpad();
  return <>
    {showTrigger && <button type="button" className="ok-dock-trigger" disabled={!question} aria-label="Zapytaj OmniKumpel o ten krok" title="Zapytaj OmniKumpel o ten krok" aria-haspopup="dialog" aria-expanded={helperOpen}
      onClick={() => { setScratchOpen(false); openHelper("tutor"); }}><Bot size={19} /><span>Zapytaj o ten krok</span><b>AI</b></button>}
    {helperOpen && <HelperPanel onPractice={onPractice} />}
  </>;
}
