import { getLessons } from "@/lib/vaultParser";
import Workspace from "@/components/Workspace";

export default function Home() {
  return <Workspace lessons={getLessons()} />;
}
