import { HardDrive, MemoryStick, Cpu, LayoutGrid } from "lucide-react";
import { AlertCategory } from "../lib/types";

type Props = {
  active: AlertCategory;
  counts: Record<AlertCategory, number>;
  onChange: (c: AlertCategory) => void;
};

const FILTERS: { key: AlertCategory; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { key: "all", label: "Todos", Icon: LayoutGrid },
  { key: "cpu", label: "CPU", Icon: Cpu },
  { key: "memory", label: "Memória", Icon: MemoryStick },
  { key: "disk", label: "Disco", Icon: HardDrive },
];

export function FilterBar({ active, counts, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
          >
            <Icon size={15} />
            {label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-bold
                ${isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
            >
              {counts[key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
