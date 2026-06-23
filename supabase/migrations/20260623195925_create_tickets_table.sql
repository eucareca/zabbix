/*
# Create tickets table for Zabbix alert chamados

1. New Tables
- `tickets`
  - `id` (uuid, primary key)
  - `ticket_number` (text, unique) - Auto-generated ticket number like #NOC-20240101-001
  - `alert_id` (text) - Zabbix trigger/event ID
  - `host` (text) - Host name from Zabbix alert
  - `problem` (text) - Problem name/description
  - `severity` (text) - Alert severity level
  - `category` (text) - cpu | memory | disk
  - `alert_time` (timestamptz) - When the alert was triggered in Zabbix
  - `description` (text) - Alert description
  - `created_at` (timestamptz) - When the ticket was generated

2. Security
- Enable RLS on `tickets`
- Allow anon + authenticated CRUD since this is a single-tenant NOC tool (no auth required)

3. Notes
- Ticket numbers are unique per alert but can be regenerated
- alert_id is the Zabbix event/trigger ID for deduplication reference
*/

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  alert_id text NOT NULL,
  host text NOT NULL,
  problem text NOT NULL,
  severity text NOT NULL,
  category text NOT NULL,
  alert_time timestamptz,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tickets" ON tickets;
CREATE POLICY "anon_select_tickets" ON tickets FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tickets" ON tickets;
CREATE POLICY "anon_insert_tickets" ON tickets FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tickets" ON tickets;
CREATE POLICY "anon_update_tickets" ON tickets FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tickets" ON tickets;
CREATE POLICY "anon_delete_tickets" ON tickets FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS tickets_alert_id_idx ON tickets(alert_id);
CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON tickets(created_at DESC);
