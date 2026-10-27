"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import Scratchpad, { type ScratchpadSize } from "./Scratchpad";

const Context = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setAnswer: Dispatch<SetStateAction<string | undefined>>;
  size: ScratchpadSize;
  setSize: Dispatch<SetStateAction<ScratchpadSize>>;
  notes: string;
  setNotes: Dispatch<SetStateAction<string>>;
} | null>(null);

export function ScratchpadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState<string>();
  const [size, setSize] = useState<ScratchpadSize>("half");
  const [notes, setNotes] = useState("");
  return (
    <Context.Provider value={{ open, setOpen, setAnswer, size, setSize, notes, setNotes }}>
      {children}
      <Scratchpad
        open={open}
        onClose={() => setOpen(false)}
        answer={answer}
        size={size}
        onSizeChange={setSize}
        notes={notes}
        onNotesChange={setNotes}
      />
    </Context.Provider>
  );
}
export function useScratchpad() {
  const context = useContext(Context);
  if (!context) throw new Error("ScratchpadProvider is required");
  return context;
}
export function useScratchpadAnswer(answer: string) {
  const { setAnswer } = useScratchpad();
  useEffect(() => {
    setAnswer(answer);
    return () => setAnswer(undefined);
  }, [answer, setAnswer]);
}
