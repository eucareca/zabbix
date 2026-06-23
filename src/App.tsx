import { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw, History, Settings, AlertTriangle, Wifi, WifiOff,
  Activity, Zap
} from "lucide-react";
import { Alert, AlertCategory, Theme } from "./lib/types";
import { Ticket } from "./lib/supabase";
import { fetchAlerts } from "./lib/api";
import { getTicketForAlert } from "./lib/tickets";
import { AlertCard } from "./components/AlertCard";
import { FilterBar } from "./components/FilterBar";
import { StatsBar } from "./components/StatsBar";
import { ThemeToggle } from "./components/ThemeToggle";
import { TicketHistory } from "./components/TicketHistory";
import { SettingsModal } from "./components/SettingsModal";

const REFRESH_INTERVAL = 30_000;

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [ticketsMap, setTicketsMap] = useState<Record<string, Ticket | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AlertCategory>("all");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const loadAlerts = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const { alerts: data } = await fetchAlerts();
      setAlerts(data);
      setLastRefresh(new Date());

      const entries = await Promise.all(
        data.map(async (a) => {
          const t = await getTicketForAlert(a.id);
          return [a.id, t] as [string, Ticket | null];
        })
      );
      setTicketsMap(Object.fromEntries(entries));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts(true);
  }, [loadAlerts]);

  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL / 1000 : c - 1));
    }, 1000);

    refreshRef.current = setInterval(() => {
      setCountdown(REFRESH_INTERVAL / 1000);
      loadAlerts(false);
    }, REFRESH_INTERVAL);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [loadAlerts]);

  function handleManualRefresh() {
    setCountdown(REFRESH_INTERVAL / 1000);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL / 1000 : c - 1));
    }, 1000);
    loadAlerts(false);
  }

  function handleTicketCreated(alertId: string, ticket: Ticket) {
    setTicketsMap((prev) => ({ ...prev, [alertId]: ticket }));
    setHistoryRefreshKey((k) => k + 1);
  }

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.category === filter);

  const counts: Record<AlertCategory, number> = {
    all: alerts.length,
    cpu: alerts.filter((a) => a.category === "cpu").length,
    memory: alerts.filter((a) => a.category === "memory").length,
    disk: alerts.filter((a) => a.category === "disk").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/30">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-none text-slate-900 dark:text-white">
                Zabbix NOC
              </h1>
              <p className="text-xs text-slate-400 leading-none mt-0.5">Monitor de Alertas</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {lastRefresh && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 mr-2">
                <Activity size={12} className="text-emerald-500 animate-pulse" />
                <span>Próximo refresh em {countdown}s</span>
              </div>
            )}

            <button
              onClick={handleManualRefresh}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              title="Atualizar agora"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={() => setHistoryOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              title="Histórico de chamados"
            >
              <History size={16} />
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              title="Configurações"
            >
              <Settings size={16} />
            </button>

            <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Connection status */}
        {error ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-300">
            <WifiOff size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Erro ao conectar na API do Zabbix</p>
              <p className="text-xs mt-0.5 opacity-80">{error}</p>
              <p className="text-xs mt-2 opacity-70">
                Verifique se os secrets <strong>ZABBIX_API_URL</strong> e <strong>ZABBIX_API_TOKEN</strong> estão configurados na Edge Function.
              </p>
            </div>
          </div>
        ) : lastRefresh && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Wifi size={13} className="text-emerald-500" />
            <span>Conectado · Última atualização: {lastRefresh.toLocaleTimeString("pt-BR")}</span>
          </div>
        )}

        {/* Stats */}
        {!loading && alerts.length > 0 && <StatsBar alerts={alerts} />}

        {/* Filters */}
        <FilterBar active={filter} counts={counts} onChange={setFilter} />

        {/* Alerts grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
              <AlertTriangle size={24} className="text-emerald-500" />
            </div>
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              {error ? "Sem dados disponíveis" : "Nenhum alerta ativo"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {filter !== "all"
                ? `Não há alertas de ${filter === "cpu" ? "CPU" : filter === "memory" ? "memória" : "disco"} no momento`
                : "Todos os sistemas estão operando normalmente"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                existingTicket={ticketsMap[alert.id] ?? null}
                onTicketCreated={(ticket) => handleTicketCreated(alert.id, ticket)}
              />
            ))}
          </div>
        )}
      </main>

      <TicketHistory
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        refreshKey={historyRefreshKey}
      />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
