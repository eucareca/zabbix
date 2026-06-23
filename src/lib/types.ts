export type SeverityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type AlertCategory = "cpu" | "memory" | "disk" | "all";

export type Alert = {
  id: string;
  triggerId: string;
  host: string;
  name: string;
  severity: string;
  severityLevel: SeverityLevel;
  category: "cpu" | "memory" | "disk";
  timestamp: string;
  description: string;
  acknowledged: boolean;
};

export type Theme = "dark" | "light";
