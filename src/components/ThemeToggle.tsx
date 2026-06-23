import { Sun, Moon } from "lucide-react";
import { Theme } from "../lib/types";

type Props = {
  theme: Theme;
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg transition-colors duration-200 hover:bg-white/10 text-current"
      title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
