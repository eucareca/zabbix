import { useState } from "react";
import { Copy, Mail, MessageCircle, Ticket, CheckCircle, Clock } from "lucide-react";
import { Alert } from "../lib/types";
import { Ticket as TicketType } from "../lib/supabase";
import { SeverityBadge } from "./SeverityBadge";
import { CategoryIcon, categoryLabel, categoryColor } from "./CategoryIcon";
import { createTicket, buildMessage } from "../lib/tickets";

type Props = {
  alert: Alert;
  existingTicket: TicketType | null;
  onTicketCreated: (ticket: TicketType) => void;
};

const SEVERITY_BORDER: Record<number, string> = {
  0: "border-l-slate-400",
  1: "border-l-sky-400",
  2: "border-l-yellow-400",
  3: "border-l-orange-400",
  4: "border-l-red-500",
  5: "border-l-red-600",
};

export function AlertCard({ alert, existingTicket, onTicketCreated }: Props) {
  const [ticket, setTicket] = useState<TicketType | null>(existingTicket);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const borderColor = SEVERITY_BORDER[alert.severityLevel] ?? SEVERITY_BORDER[0];

  async function handleGenerateTicket() {
    if (ticket) return;
    setLoading(true);
    setError(null);
    try {
      const t = await createTicket(alert);
      setTicket(t);
      onTicketCreated(t);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!ticket) return;
    const msg = buildMessage(ticket);
    await navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleEmail() {
    if (!ticket) return;
    const msg = buildMessage(ticket);
    const subject = encodeURIComponent(`ALERTA ZABBIX - CHAMADO #${ticket.ticket_number} - ${alert.host}`);
    const body = encodeURIComponent(msg);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  function handleWhatsApp() {
    if (!ticket) return;
    const msg = buildMessage(ticket);
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  }

  const alertDate = new Date(alert.timestamp).toLocaleString("pt-BR");

  return (
    <div
      className={`rounded-xl border-l-4 ${borderColor} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`flex-shrink-0 ${categoryColor(alert.category)}`}>
              <CategoryIcon category={alert.category} size={18} />
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {categoryLabel(alert.category)}
            </span>
            {alert.acknowledged && (
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <CheckCircle size={12} />
                ACK
              </span>
            )}
          </div>
          <SeverityBadge severity={alert.severity} level={alert.severityLevel} />
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug mb-1">
          {alert.name}
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          {alert.host}
        </p>

        {alert.description && alert.description !== alert.name && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
            {alert.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Clock size={12} />
          <span>{alertDate}</span>
        </div>

        {ticket && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 mb-4 border border-slate-100 dark:border-slate-600/40">
            <div className="flex items-center gap-2 text-xs">
              <Ticket size={12} className="text-emerald-500" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Chamado #{ticket.ticket_number}
              </span>
              <span className="text-slate-400">
                gerado em {new Date(ticket.created_at).toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerateTicket}
            disabled={!!ticket || loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
              ${ticket
                ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-blue-500/20 active:scale-95"
              } ${loading ? "opacity-60 cursor-wait" : ""}`}
          >
            <Ticket size={12} />
            {ticket ? "Chamado gerado" : loading ? "Gerando..." : "Gerar chamado"}
          </button>

          <button
            onClick={handleCopy}
            disabled={!ticket}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
              ${!ticket
                ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
                : copied
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95"
              }`}
          >
            <Copy size={12} />
            {copied ? "Copiado!" : "Copiar mensagem"}
          </button>

          <button
            onClick={handleEmail}
            disabled={!ticket}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
              ${!ticket
                ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95"
              }`}
          >
            <Mail size={12} />
            Email
          </button>

          <button
            onClick={handleWhatsApp}
            disabled={!ticket}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
              ${!ticket
                ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95"
              }`}
          >
            <MessageCircle size={12} />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
