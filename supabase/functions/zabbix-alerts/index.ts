import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ZABBIX_KEYWORDS = {
  cpu: ["cpu", "processor", "processador", "load", "carga", "utilization", "utilizacao", "usage"],
  memory: ["memory", "memória", "memoria", "ram", "swap", "heap", "available memory", "free memory"],
  disk: ["disk", "disco", "storage", "armazenamento", "filesystem", "volume", "inode", "partition", "space", "espaço", "espaco", "write", "read speed"],
};

function detectCategory(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(ZABBIX_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return "other";
}

const SEVERITY_MAP: Record<number, string> = {
  0: "Not classified",
  1: "Information",
  2: "Warning",
  3: "Average",
  4: "High",
  5: "Disaster",
};

async function zabbixCall(url: string, token: string, method: string, params: unknown, id: number) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, auth: token, id }),
  });
  if (!res.ok) throw new Error(`Zabbix HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`Zabbix: ${data.error.message} — ${data.error.data}`);
  return data.result ?? [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const zabbixUrl = Deno.env.get("ZABBIX_API_URL");
    const zabbixToken = Deno.env.get("ZABBIX_API_TOKEN");

    if (!zabbixUrl || !zabbixToken) {
      return new Response(
        JSON.stringify({ error: "ZABBIX_API_URL e ZABBIX_API_TOKEN precisam estar configurados como secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const url = new URL(req.url);
    const categoryFilter = url.searchParams.get("category");

    // Step 1: fetch active problems
    const problems = await zabbixCall(zabbixUrl, zabbixToken, "problem.get", {
      output: ["eventid", "objectid", "name", "severity", "clock", "acknowledged"],
      recent: false,
      sortfield: ["eventid"],
      sortorder: "DESC",
      limit: 200,
    }, 1);

    if (!problems.length) {
      return new Response(
        JSON.stringify({ alerts: [], total: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const triggerIds: string[] = problems
      .map((p: Record<string, unknown>) => p.objectid as string)
      .filter(Boolean);

    // Step 2: fetch triggers with hosts + description
    const triggers = await zabbixCall(zabbixUrl, zabbixToken, "trigger.get", {
      output: ["triggerid", "description", "comments"],
      selectHosts: ["hostid", "name"],
      triggerids: triggerIds,
    }, 2);

    const triggersMap: Record<string, { description: string; comments: string; host: string }> = {};
    for (const t of triggers) {
      const hostName =
        Array.isArray(t.hosts) && t.hosts.length > 0
          ? t.hosts[0].name
          : "Unknown";
      triggersMap[t.triggerid] = {
        description: t.description ?? "",
        comments: t.comments ?? "",
        host: hostName,
      };
    }

    const alerts = problems.map((p: Record<string, unknown>) => {
      const severity = SEVERITY_MAP[Number(p.severity)] ?? "Unknown";
      const trigger = triggersMap[p.objectid as string] ?? { description: "", comments: "", host: "Unknown" };
      const name = (p.name as string) || trigger.description || "Unknown problem";
      const description = trigger.comments || trigger.description || name;
      const category = detectCategory(name, description);

      return {
        id: p.eventid as string,
        triggerId: p.objectid as string,
        host: trigger.host,
        name,
        severity,
        severityLevel: Number(p.severity),
        category,
        timestamp: new Date(Number(p.clock) * 1000).toISOString(),
        description,
        acknowledged: Number(p.acknowledged) > 0,
      };
    });

    const relevantCategories = ["cpu", "memory", "disk"];
    let result = alerts.filter((a: Record<string, unknown>) =>
      relevantCategories.includes(a.category as string)
    );

    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter((a: Record<string, unknown>) => a.category === categoryFilter);
    }

    return new Response(
      JSON.stringify({ alerts: result, total: result.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
