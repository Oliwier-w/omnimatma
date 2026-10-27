"use client";
import { createContext, useCallback, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { OmniContext } from "@/lib/omnikumpelTypes";

type HelperMode = "solver" | "tutor" | "check";
const Context = createContext<{
  question?: OmniContext;
  setQuestion: Dispatch<SetStateAction<OmniContext | undefined>>;
  helperOpen: boolean;
  setHelperOpen: Dispatch<SetStateAction<boolean>>;
  helperMode: HelperMode;
  openHelper: (mode?: HelperMode) => void;
  revealed: ReadonlySet<string>;
  reveal: (id: string) => void;
} | null>(null);

export function OmniKumpelProvider({ children }: { children: ReactNode }) {
  const [question, setQuestion] = useState<OmniContext>();
  const [helperOpen, setHelperOpen] = useState(false);
  const [helperMode, setHelperMode] = useState<HelperMode>("tutor");
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set());
  const reveal = useCallback((id: string) => setRevealed(previous => previous.has(id) ? previous : new Set([...previous, id])), []);
  return <Context.Provider value={{ question, setQuestion, helperOpen, setHelperOpen, helperMode, revealed, reveal, openHelper: (mode = "tutor") => { setHelperMode(mode); setHelperOpen(true); } }}>{children}</Context.Provider>;
}
export function useOmniKumpel() {
  const value = useContext(Context);
  if (!value) throw new Error("OmniKumpelProvider is required");
  return value;
}
/** Keep the most recent question in memory, including when opening the full helper. */
export function useOmniQuestion(question?: OmniContext) {
  const { setQuestion } = useOmniKumpel();
  useEffect(() => {
    if (question) setQuestion(question);
    // The immutable problem ID changes whenever its generated parameters change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id, setQuestion]);
}
