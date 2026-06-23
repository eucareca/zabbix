import { HardDrive, MemoryStick, Cpu } from "lucide-react";

type Props = {
  category: "cpu" | "memory" | "disk";
  size?: number;
};

export function CategoryIcon({ category, size = 16 }: Props) {
  if (category === "cpu") return <Cpu size={size} />;
  if (category === "memory") return <MemoryStick size={size} />;
  return <HardDrive size={size} />;
}

export function categoryLabel(category: string): string {
  if (category === "cpu") return "CPU";
  if (category === "memory") return "Memória";
  if (category === "disk") return "Disco";
  return "Outro";
}

export function categoryColor(category: string): string {
  if (category === "cpu") return "text-blue-400";
  if (category === "memory") return "text-purple-400";
  if (category === "disk") return "text-emerald-400";
  return "text-slate-400";
}
