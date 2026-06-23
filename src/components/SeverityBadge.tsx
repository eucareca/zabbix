type Props = {
  severity: string;
  level: number;
};

const SEVERITY_STYLES: Record<number, string> = {
  0: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  1: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  2: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  3: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  4: "bg-red-500/20 text-red-400 border-red-500/30",
  5: "bg-red-700/30 text-red-300 border-red-600/40",
};

const SEVERITY_STYLES_LIGHT: Record<number, string> = {
  0: "bg-slate-100 text-slate-600 border-slate-200",
  1: "bg-sky-100 text-sky-700 border-sky-200",
  2: "bg-yellow-100 text-yellow-700 border-yellow-200",
  3: "bg-orange-100 text-orange-700 border-orange-200",
  4: "bg-red-100 text-red-700 border-red-200",
  5: "bg-red-200 text-red-800 border-red-300",
};

export function SeverityBadge({ severity, level }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
        dark:${SEVERITY_STYLES[level] ?? SEVERITY_STYLES[0]}
        ${SEVERITY_STYLES_LIGHT[level] ?? SEVERITY_STYLES_LIGHT[0]}`}
    >
      {severity}
    </span>
  );
}
