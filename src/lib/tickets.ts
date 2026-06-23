import { supabase, Ticket } from "./supabase";
import { Alert } from "./types";

function generateTicketNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = now.getTime().toString().slice(-5);
  return `NOC-${date}-${time}`;
}

export async function createTicket(alert: Alert): Promise<Ticket> {
  const ticketNumber = generateTicketNumber();

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      ticket_number: ticketNumber,
      alert_id: alert.id,
      host: alert.host,
      problem: alert.name,
      severity: alert.severity,
      category: alert.category,
      alert_time: alert.timestamp,
      description: alert.description,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Ticket;
}

export async function fetchTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return (data ?? []) as Ticket[];
}

export async function getTicketForAlert(alertId: string): Promise<Ticket | null> {
  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("alert_id", alertId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as Ticket | null;
}

export function buildMessage(ticket: Ticket): string {
  const date = new Date(ticket.created_at).toLocaleString("pt-BR");
  const alertDate = ticket.alert_time
    ? new Date(ticket.alert_time).toLocaleString("pt-BR")
    : date;

  return `ALERTA ZABBIX - CHAMADO #${ticket.ticket_number}
Host: ${ticket.host}
Problema: ${ticket.problem}
Severidade: ${ticket.severity}
Data: ${alertDate}
Descrição: ${ticket.description || "Sem descrição"}`;
}
