// ====================================================================
// MCP SERVER — SMART & SAFE (Supports Smart Helper Agent)
// ====================================================================

import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import * as chrono from "chrono-node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// ====================================================================
// SUPABASE CLIENT (SERVICE ROLE) — single instance
// ====================================================================
let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error("❌ Missing Supabase credentials in mcp/.env");
    }

    supabase = createClient(url, key, { auth: { persistSession: false } });
  }

  return supabase;
}

// ====================================================================
// SAFE WRAPPER — prevents mass deletes or invalid calls
// ====================================================================
function safeTool(handler) {
  return async (args) => {
    if (!args || typeof args !== "object") {
      return { ok: false, error: "Invalid or missing tool arguments." };
    }

    try {
      return await handler(args);
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };
}

// ====================================================================
// MCP SERVER INSTANCE
// ====================================================================
const server = new McpServer(
  { name: "agentic-ai-mcp", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

// ====================================================================
// CRM TOOLS
// ====================================================================

// ------------------------ ADD LEAD ------------------------
server.registerTool(
  "crm.addLead",
  {
    title: "Add CRM Lead",
    inputSchema: z.object({
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      status: z.string().optional(),
      notes: z.string().optional(),
    }),
  },
  safeTool(async (args) => {
    const { data, error } = await getSupabaseClient()
      .from("crm_leads")
      .insert(args)
      .select()
      .single();

    return error ? { ok: false, error: error.message } : { ok: true, data };
  })
);

// ------------------------ UPDATE LEAD ------------------------
server.registerTool(
  "crm.updateLead",
  {
    title: "Update Lead",
    inputSchema: z.object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      status: z.string().optional(),
      notes: z.string().optional(),
    }),
  },
  safeTool(async ({ id, ...fields }) => {
    if (!id) return { ok: false, error: "Missing id" };

    const { data, error } = await getSupabaseClient()
      .from("crm_leads")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    return error ? { ok: false, error: error.message } : { ok: true, data };
  })
);

// ------------------------ QUERY ------------------------
server.registerTool(
  "crm.queryLeads",
  {
    title: "Query CRM Leads",
    inputSchema: z.object({
      filter: z.object({
        name: z.string().optional(),
        company: z.string().optional(),
        email: z.string().optional(),
        status: z.string().optional(),
      }),
    }),
  },
  safeTool(async ({ filter }) => {
    let q = getSupabaseClient().from("crm_leads").select("*");

    for (const [k, v] of Object.entries(filter)) {
      if (v) q = q.ilike(k, `%${v}%`);
    }

    const { data, error } = await q;
    return error ? { ok: false, error: error.message } : { ok: true, data: { leads: data } };
  })
);

// ====================================================================
// CALENDAR TOOLS
// ====================================================================

// ------------------------ CREATE ------------------------
server.registerTool(
  "calendar.create",
  {
    title: "Create Calendar Event",
    inputSchema: z.object({
      title: z.string(),
      description: z.string().optional(),
      start_time: z.string(),
      end_time: z.string(),
      attendees: z.array(z.string()).optional(),
    }),
  },
  safeTool(async (args) => {
    const required = ["title", "start_time", "end_time"];
    for (const r of required) {
      if (!args[r]) return { ok: false, error: `Missing required field: ${r}` };
    }

    const { data, error } = await getSupabaseClient()
      .from("calendar_events")
      .insert({
        ...args,
        attendees: args.attendees ?? [],
      })
      .select()
      .single();

    return error ? { ok: false, error: error.message } : { ok: true, data: { event: data } };
  })
);

// ------------------------ LIST ------------------------
server.registerTool(
  "calendar.list",
  { title: "List Events", inputSchema: z.object({}) },
  safeTool(async () => {
    const { data, error } = await getSupabaseClient()
      .from("calendar_events")
      .select("*")
      .order("start_time", { ascending: true });

    return error ? { ok: false, error: error.message } : { ok: true, data: { events: data } };
  })
);

// ------------------------ CANCEL ------------------------
server.registerTool(
  "calendar.cancel",
  { title: "Cancel Event", inputSchema: z.object({ id: z.string() }) },
  safeTool(async ({ id }) => {
    if (!id) return { ok: false, error: "Missing id" };

    const { error } = await getSupabaseClient()
      .from("calendar_events")
      .delete()
      .eq("id", id);

    return error ? { ok: false, error: error.message } : { ok: true, data: { canceled: true, id } };
  })
);

// ------------------------ RESCHEDULE ------------------------
server.registerTool(
  "calendar.reschedule",
  {
    title: "Reschedule Event",
    inputSchema: z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      start_time: z.string(),
      end_time: z.string(),
      attendees: z.array(z.string()).optional(),
    }),
  },
  safeTool(async (args) => {
    const { id, ...newEvent } = args;

    const required = ["title", "start_time", "end_time"];
    for (const r of required) {
      if (!newEvent[r]) return { ok: false, error: `Missing ${r}` };
    }

    const client = getSupabaseClient();

    // Delete old
    const { error: delErr } = await client
      .from("calendar_events")
      .delete()
      .eq("id", id);

    if (delErr) return { ok: false, error: delErr.message };

    // Create new
    const { data, error: createErr } = await client
      .from("calendar_events")
      .insert({
        ...newEvent,
        attendees: newEvent.attendees ?? [],
      })
      .select()
      .single();

    return createErr
      ? { ok: false, error: createErr.message }
      : { ok: true, data: { old: id, new: data } };
  })
);

// ====================================================================
// NATURAL DATE PARSER
// ====================================================================
server.registerTool(
  "dates.parseNatural",
  {
    title: "Parse Natural Language Date",
    inputSchema: z.object({ query: z.string() }),
  },
  safeTool(async ({ query }) => {
    const parsed = chrono.parseDate(query);

    if (!parsed) {
      return { ok: false, error: "Could not parse date." };
    }

    const iso = parsed.toISOString().replace(".000Z", "+00:00");

    return { ok: true, data: { iso } };
  })
);

// ====================================================================
// TIMEZONE CONVERTER (optional but useful)
// ====================================================================
server.registerTool(
  "utils.convertTimeZone",
  {
    title: "Convert ISO datetime between timezones",
    inputSchema: z.object({
      iso: z.string(),
      target: z.string(), // e.g., "America/Vancouver"
    }),
  },
  safeTool(async ({ iso, target }) => {
    try {
      const dt = new Date(iso);
      if (isNaN(dt.getTime())) return { ok: false, error: "Invalid ISO" };

      const opts = {
        timeZone: target,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };

      const parts = new Intl.DateTimeFormat("en-CA", opts).formatToParts(dt);
      const g = (t) => parts.find((p) => p.type === t)?.value;

      const converted = `${g("year")}-${g("month")}-${g("day")} ${g("hour")}:${g("minute")}:${g("second")}`;

      return { ok: true, data: { converted } };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  })
);
// console.log("🧩 MCP TOOL CALLED:", tool, args);

// ====================================================================
// START MCP SERVER
// ====================================================================
async function start() {
  const transport = new StdioServerTransport();
  console.log("🔵 MCP Smart Server Started");
  await server.connect(transport);
}

start().catch(console.error);
