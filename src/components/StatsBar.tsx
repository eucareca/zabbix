import { ShieldAlert, ShieldX, Shield, ShieldCheck } from "lucide-react";
import { Alert } from "../lib/types";

type Props = { alerts: Alert[] };

export function StatsBar({ alerts }: Props) {
  const disaster = alerts.filter((a) => a.severityLevel === 5).length;
  const high = alerts.filter((a) => a.severityLevel === 4).length;
  const average = alerts.filter((a) => a.severityLevel === 3).length;
  const other = alerts.filter((a) => a.severityLevel <= 2).length;

  const stats = [
    { label: "Desastre", count: disaster, icon: ShieldX, color: "text-red-400", bg: "bg-red-500/10 dark:bg-red-500/10 border-red-200 dark:border-red-500/20" },
    { label: "Alta", count: high, icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-200 dark:border-orange-500/20" },
    { label: "Média", count: average, icon: Shield, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20" },
    { label: "Outras", count: other, icon: ShieldCheck, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-200 dark:border-sky-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, count, icon: Icon, color, bg }) => (
        <div
          key={label}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} bg-white dark:bg-slate-800`}
        >
          <Icon size={22} className={color} />
          <div>
            <p className="text-xl font-bold text-slate-800 dark:text-white leading-none">{count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
