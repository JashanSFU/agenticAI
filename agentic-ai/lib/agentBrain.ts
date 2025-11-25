// ====================================================================
// AgenticAI — Smart Helper Agent (Multi-Action, Safe, Timezone-Aware)
// ====================================================================
import Groq from "groq-sdk";
import { getEmailContext } from "@/lib/agent/emailContext";

// -----------------------------------------------------------------------------
// Agent State
// -----------------------------------------------------------------------------
type ChatMessage = { role: "system" | "assistant" | "user"; content: string };
let memory: ChatMessage[] = [];

// -----------------------------------------------------------------------------
// Safe MCP Tool Caller
// -----------------------------------------------------------------------------
async function callMCPTool(tool: string, args: any) {
  if (!args || typeof args !== "object") {
    return { ok: false, error: `Invalid args for tool ${tool}` };
  }

  try {
    const res = await fetch("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, args }),
    });

    const json = await res.json();
    return json.result;
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// -----------------------------------------------------------------------------
// Context Snapshot Loader
// -----------------------------------------------------------------------------
async function gatherContext() {
  const [events, leads, docs] = await Promise.all([
    callMCPTool("calendar.list", {}),
    callMCPTool("crm.queryLeads", { filter: {} }),
    callMCPTool("docs.listDocuments", {}),
  ]);

  return {
    meetings: events?.ok ? events.data.events : [],
    leads: leads?.ok ? leads.data.leads : [],
    docs: docs?.ok ? docs.data.docs : [],
  };
}

// async function gatherContext() {
//   const [events, leads, docs, emails] = await Promise.all([
//     callMCPTool("calendar.list", {}),
//     callMCPTool("crm.queryLeads", { filter: {} }),
//     callMCPTool("docs.listDocuments", {}),
//     getEmailContext(10), // fetch 10 recent unread emails
//   ]);

//   return {
//     meetings: events?.ok ? events.data.events : [],
//     leads: leads?.ok ? leads.data.leads : [],
//     docs: docs?.ok ? docs.data.docs : [],
//     emails: emails || [],
//   };
// }

// -----------------------------------------------------------------------------
// Vancouver Time Context
// -----------------------------------------------------------------------------
function getTimeContext() {
  const now = new Date();

  const fmt: Intl.DateTimeFormatOptions = {
    timeZone: "America/Vancouver",
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const local = new Intl.DateTimeFormat("en-CA", fmt).format(now);

  return `
CURRENT TIME (Vancouver):
- Local: ${local}
- ISO: ${now.toISOString()}

Use this for "today", "tomorrow", "next Friday", "in 5 days", etc.
`;
}

// -----------------------------------------------------------------------------
// Natural JSON Extractor (robust)
// -----------------------------------------------------------------------------
function extractJSON(text: string): any | null {
  const match = text.match(/\{[\s\S]*\}$/m);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// Natural Date → Vancouver ISO conversion
// -----------------------------------------------------------------------------
async function parseToVancouverISO(natural: string) {
  const parsed = await callMCPTool("dates.parseNatural", { query: natural });
  if (!parsed?.ok) return null;

  const iso = parsed.data.iso;
  const dt = new Date(iso);

  const fmt: Intl.DateTimeFormatOptions = {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const parts = new Intl.DateTimeFormat("en-CA", fmt).formatToParts(dt);
  const g = (t: string) => parts.find((p) => p.type === t)?.value;

  // Start time
  const start = `${g("year")}-${g("month")}-${g("day")} ${g("hour")}:${g("minute")}:${g("second")}`;

  // End time (default meeting = 1 hour)
  const endDate = new Date(dt.getTime() + 3600000);
  const partsEnd = new Intl.DateTimeFormat("en-CA", fmt).formatToParts(endDate);
  const h = (t: string) => partsEnd.find((p) => p.type === t)?.value;

  const end = `${h("year")}-${h("month")}-${h("day")} ${h("hour")}:${h("minute")}:${h("second")}`;

  return { start, end };
}

// EMAILS:
// • You receive parsed Gmail emails in the context.
// • Use emails to detect:
//     - meetings or upcoming events
//     - reminders or tasks
//     - job leads / sales leads
//     - bills or important items
// • If user asks “do I have meetings?” or “any important emails?”
//   → analyze the emails in context.
// • You never invent emails. Only use the real Gmail context.
// -----------------------------------------------------------------------------
// SYSTEM PROMPT – Swarm Planner (Condensed Schema)
// -----------------------------------------------------------------------------
const SYSTEM_PROMPT = `
You are Business Support and AgenticAI — a deterministic, safe, multi-action planning agent.

Your job is to translate user requests into a SEQUENCE OF TOOL CALLS
to help them manage their calendar, CRM leads, and documents.
If you can answer directly without tools, do so.

====================================================================
GENERAL INSTRUCTIONS
====================================================================
Your job is to translate the user's request into a minimal set of valid tool
calls. You NEVER add unnecessary actions, NEVER invent data, and NEVER chain
dependent operations unless the user explicitly tells you to.

### LISTING DATA FROM CONTEXT (NO TOOL CALLS)
• If the user asks things like:
    - "list all leads"
    - "show my leads"
    - "what appointments do I have"
    - "any meetings today?"
    - "show documents"
  → DO NOT call any tools.
  → Use ONLY the data in CONTEXT to answer.
  → Output:
      { "plan": [], "final": "Here is the list..." }

You are free to question the user for missing information if you cannot
proceed. Always aim to minimize tool calls and avoid unnecessary actions.

You ALWAYS respond in the OUTPUT FORMAT below. 

if you cannot understand the request, output an empty plan and
ask the user to rephrase.

Never leave a final response empty. Always provide a human-friendly summary.
====================================================================
OUTPUT FORMAT
====================================================================

You ALWAYS output valid JSON:

{
  "plan": [
    { "tool": "toolName", "args": { ... } }
  ],
  "final": "Human-friendly summary"
}

If no tool is needed:
{
  "plan": [],
  "final": "Helpful natural-language response"
}

If required information is missing:
{
  "plan": [],
  "final": "A clarifying question to the user"
}

====================================================================
CRITICAL SAFETY RULES
====================================================================

### 1. NEVER invent IDs
• If a tool requires an "id" and it is not provided and not available in context,
  you MUST ask the user for the ID.
• You NEVER create placeholder IDs (e.g. “123”, “new-lead-id”, "generated-id").

### 2. NO dependent multi-step sequences
• Tools cannot use the result of another tool in the same plan.
  Example (NOT ALLOWED):
    - Add a lead
    - Immediately update it
• If the user wants chained actions, you MUST ask them to specify the real ID.

### 3. MINIMAL TOOL CALLS ONLY
• Only call tools when absolutely necessary.
• If the user asks for a meeting and a lead, create exactly those two actions.
• NO redundant actions.

### 4. DO NOT INVENT EMAILS, MEETINGS, LEADS OR DOCUMENTS
• You rely ONLY on the provided context.
• If something isn’t found in context, don’t guess — ask.

### 5. TIME & DATE RULES
• ALWAYS use dates.parseNatural for natural-language dates.
• ALWAYS convert timestamps to America/Vancouver.
• Meetings default to 1 hour unless user says otherwise.

====================================================================
TOOL SCHEMA (Reference)
====================================================================

crm.addLead:
  required → name
  optional → email, phone, company, status, notes

crm.updateLead:
  required → id
  optional → name, email, phone, company, status, notes

crm.queryLeads:
  filter: { name?, email?, company?, status? }

calendar.create:
  required → title, start_time, end_time
  optional → attendees, description
  defaults:
    title = "General Meeting"
    duration = 1 hour

calendar.reschedule:
  required → id, title, start_time, end_time

calendar.cancel:
  required → id

docs.addDocument:
  required → name, content

docs.listDocuments: {}

dates.parseNatural:
  required → query

====================================================================
HOW TO THINK (REASONING STRATEGY)
====================================================================

1. Understand the user request.
2. Determine if any tools are needed.
3. For each required action:
   • Identify missing information
   • Ask clarifying questions ONLY if needed
4. Produce the minimal plan (never more)
5. Produce a simple final summary.

====================================================================
EXAMPLES
====================================================================

User: "make a meeting and add as lead John from Las Vegas"
→ VALID:
{
  "plan": [
    { "tool": "crm.addLead", "args": { "name": "John", "company": "Las Vegas" }},
    {
      "tool": "calendar.create",
      "args": {
        "title": "Meeting with John",
        "natural": "today",
        "attendees": []
      }
    }
  ],
  "final": "Added John as a lead and created your meeting."
}

User: "update the lead"
→ INVALID (missing ID)
→ Ask: "Which lead ID would you like to update?"

====================================================================
END OF SYSTEM PROMPT
====================================================================
`;

// -----------------------------------------------------------------------------
// MAIN AGENT EXECUTION
// -----------------------------------------------------------------------------
export async function runAgent(message: string) {
  // Load context + time context
  const ctx = await gatherContext();
  const ctxBlock = `
CONTEXT:
${JSON.stringify(ctx, null, 2)}
`;

  const timeBlock = getTimeContext();

  memory.push({ role: "system", content: ctxBlock });
  memory.push({ role: "system", content: timeBlock });
  memory.push({ role: "user", content: message });

  // Call LLM
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.35,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...memory],
  });

  const out = completion.choices[0].message.content || "";

  // Extract JSON plan
  const json = extractJSON(out);

  if (!json) {
    return {
      plan: [],
      results: [],
      final: "I couldn't understand your request. Could you rephrase?",
    };
  }

  const plan = json.plan || [];
  const results: any[] = [];
// console.log("🧪 RAW PLAN FROM LLM:", JSON.stringify(plan, null, 2));

  // ---------------------------------------------------------------------------
  // Execute all actions in order
  // ---------------------------------------------------------------------------
  for (const step of plan) {
    const { tool, args } = step;

    // -------------------------------------
  // 🔧 FIX: Resolve lead name → ID (UUID)
  // -------------------------------------
  if (tool === "crm.updateLead" && args.name && !args.id) {
    const normalized = args.name.toLowerCase().trim();

    const match = ctx.leads.find((l: any) =>
      l.name.toLowerCase().trim() === normalized
    );

    if (match) {
      args.id = match.id;   // inject UUID
      delete args.name;     // prevent MCP confusion
    } else {
      // Ask user for ID if lead not found
      return {
        plan: [],
        results: [],
        final: `I couldn’t find a lead named "${args.name}". Can you provide the lead ID?`,
      };
    }
  }
    // Natural-date → Vancouver conversion
    if (
      (tool === "calendar.create" || tool === "calendar.reschedule") &&
      args?.natural
    ) {
      const parsed = await parseToVancouverISO(args.natural);

      if (!parsed) {
        results.push({ ok: false, error: "Failed to parse date" });
        continue;
      }

      args.start_time = parsed.start;
      args.end_time = parsed.end;
      delete args.natural;
    }

    // Defaults for meeting creation
    if (tool === "calendar.create") {
      if (!args.title) args.title = "General Meeting";
      if (!args.attendees) args.attendees = [];
    }

    const res = await callMCPTool(tool, args);
    results.push(res);
  }

  memory.push({ role: "assistant", content: json.final });
console.log("🧪 AGENT RESULT:", { plan, results, final: json.final });

  return {
    plan,
    results,
    final: json.final,
  };
}
