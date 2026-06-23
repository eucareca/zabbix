import { useState, useEffect } from "react";
import { History, X, Copy, CheckCircle } from "lucide-react";
import { Ticket } from "../lib/supabase";
import { fetchTickets, buildMessage } from "../lib/tickets";
import { SeverityBadge } from "./SeverityBadge";

const SEVERITY_LEVELS: Record<string, number> = {
  "Not classified": 0,
  "Information": 1,
  "Warning": 2,
  "Average": 3,
  "High": 4,
  "Disaster": 5,
};

type Props = {
  open: boolean;
  onClose: () => void;
  refreshKey: number;
};

export function TicketHistory({ open, onClose, refreshKey }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchTickets()
      .then(setTickets)
      .finally(() => setLoading(false));
  }, [open, refreshKey]);

  async function handleCopy(ticket: Ticket) {
    await navigator.clipboard.writeText(buildMessage(ticket));
    setCopiedId(ticket.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div
        className="relative h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <History size={18} className="text-blue-500" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Histórico de Chamados</h2>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
              {tickets.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          )}
          {!loading && tickets.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-sm">Nenhum chamado gerado ainda.</p>
          )}
          {!loading && tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700/60"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  #{ticket.ticket_number}
                </span>
                <SeverityBadge
                  severity={ticket.severity}
                  level={SEVERITY_LEVELS[ticket.severity] ?? 0}
                />
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-white mb-0.5">{ticket.problem}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{ticket.host}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {new Date(ticket.created_at).toLocaleString("pt-BR")}
                </span>
                <button
                  onClick={() => handleCopy(ticket)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-300 transition-colors"
                >
                  {copiedId === ticket.id ? (
                    <><CheckCircle size={11} className="text-emerald-500" /> Copiado</>
                  ) : (
                    <><Copy size={11} /> Copiar</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
