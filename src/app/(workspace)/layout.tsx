import { getLessons } from "@/lib/vaultParser";
import Workspace from "@/components/Workspace";
import type { ReactNode } from "react";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <Workspace lessons={getLessons()}>{children}</Workspace>;
}
