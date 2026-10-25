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
import Scratchpad from "./Scratchpad";

const Context = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setAnswer: Dispatch<SetStateAction<string | undefined>>;
} | null>(null);

export function ScratchpadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState<string>();
  return (
    <Context.Provider value={{ open, setOpen, setAnswer }}>
      {children}
      <Scratchpad open={open} onClose={() => setOpen(false)} answer={answer} />
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
