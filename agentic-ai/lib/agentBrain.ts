// // ====================================================================
// // AgenticAI — Fully Upgraded Smart Agent (SAFE + TIMEZONE AWARE VERSION)
// // ====================================================================

// import Groq from "groq-sdk";

// // -------------------------------------------------------------
// // STATE MEMORY
// // -------------------------------------------------------------
// let memory: ChatMessage[] = [];

// type ChatMessage = {
//   role: "system" | "assistant" | "user";
//   content: string;
// };

// // -------------------------------------------------------------
// // USER TIMEZONE CONTEXT
// // -------------------------------------------------------------
// function getTimeContext() {
//   const now = new Date();

//   const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
//   const userLocal = new Intl.DateTimeFormat("en-US", {
//     timeZone: userTZ,
//     hour12: false,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   }).format(now);

//   return `
// TIME CONTEXT:
// UTC now: ${now.toISOString()}
// User timezone: ${userTZ}
// User local time: ${userLocal}
// `;
// }

// // -------------------------------------------------------------
// // SAFE TOOL CALL WRAPPER
// // -------------------------------------------------------------
// async function callMCPTool(tool: string, args: any) {
//   if (!args || typeof args !== "object") {
//     return {
//       ok: false,
//       error: `Invalid Action Input for tool '${tool}'.`,
//     };
//   }

//   const res = await fetch("http://localhost:3000/api/mcp", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ tool, args }),
//   });

//   const json = await res.json();
//   return json.result;
// }

// // -------------------------------------------------------------
// // CONTEXT LOADER — Prevents hallucination
// // -------------------------------------------------------------
// async function gatherContext() {
//   const [events, leads, docs] = await Promise.all([
//     callMCPTool("calendar.list", {}),
//     callMCPTool("crm.queryLeads", { filter: {} }),
//     callMCPTool("docs.listDocuments", {}),
//   ]);

//   return {
//     meetings: events?.ok ? events.data.events : [],
//     leads: leads?.ok ? leads.data.leads : [],
//     docs: docs?.ok ? docs.data.docs : [],
//   };
// }

// // -------------------------------------------------------------
// // ROBUST PARSERS — tolerate multiline JSON
// // -------------------------------------------------------------
// function extractThought(out: string) {
//   const idx = out.indexOf("Thought:");
//   if (idx === -1) return "";
//   const after = out.slice(idx + 8);
//   const finalIdx = after.indexOf("Final Answer:");
//   return (finalIdx === -1 ? after : after.slice(0, finalIdx))
//     .replace(/Action:[\s\S]*/m, "")
//     .trim();
// }

// function extractAction(out: string) {
//   const match = out.match(/Action:\s*([^\n]+)/);
//   return match ? match[1].trim() : null;
// }

// function extractActionInput(out: string) {
//   const marker = "Action Input:";
//   const idx = out.indexOf(marker);
//   if (idx === -1) return null;

//   const chunk = out.slice(idx + marker.length).trim();
//   const start = chunk.indexOf("{");
//   const end = chunk.lastIndexOf("}");

//   if (start === -1 || end === -1 || end <= start) return null;

//   try {
//     return JSON.parse(chunk.slice(start, end + 1));
//   } catch {
//     return null;
//   }
// }

// function extractFinal(out: string) {
//   const idx = out.indexOf("Final Answer:");
//   return idx === -1 ? "" : out.slice(idx + 13).trim();
// }

// // -------------------------------------------------------------
// // SYSTEM PROMPT (UPGRADED SAFE + TIMEZONE VERSION)
// // -------------------------------------------------------------
// const SYSTEM_PROMPT = `
// You are AgenticAI — a smart, context-aware business assistant.

// STRICT RULES:

// 1. NEVER invent meetings, leads, or documents.
// 2. NEVER compute dates manually.
// 3. ALWAYS use dates.parseNatural for:
//    - "in 5 days"
//    - "next Monday"
//    - "this Friday at 6pm PST"
//    - "tomorrow evening"
// 4. ALWAYS account for user timezone (provided in TIME CONTEXT).
// 5. Calendar events REQUIRE:
//    {
//      "title": "...",
//      "description": "...?",
//      "start_time": "YYYY-MM-DD HH:mm:ss",
//      "end_time": "YYYY-MM-DD HH:mm:ss",
//      "attendees": []
//    }
// 6. If "end_time" is missing → DEFAULT duration = 1 hour.
// 7. If ANY required field missing:
//    → DO NOT call the tool.
//    → Ask the user for missing details.
// 8. When rescheduling → ALWAYS use calendar.reschedule.
// 9. NEVER output placeholders like {{now}}, {{date}}, {{current_date}}.
// 10. Always verify the meeting exists before modifying it.

// TOOLS AVAILABLE:
// - crm.addLead
// - crm.updateLead
// - crm.queryLeads
// - calendar.create
// - calendar.cancel
// - calendar.reschedule
// - calendar.list
// - docs.addDocument
// - docs.listDocuments
// - dates.parseNatural

// REQUIRED FORMAT:

// If NO tool:
// Thought: ...
// Final Answer: ...

// If TOOL IS REQUIRED:
// Thought: ...
// Action: tool_name
// Action Input: { ...valid JSON... }
// Final Answer: ...
// `;

// // -------------------------------------------------------------
// // RUN AGENT
// // -------------------------------------------------------------
// export async function runAgent(message: string) {
//   const context = await gatherContext();

//   const ctx = `
// ${getTimeContext()}

// CONTEXT SNAPSHOT:
// Meetings:
// ${JSON.stringify(context.meetings, null, 2)}

// Leads:
// ${JSON.stringify(context.leads, null, 2)}

// Documents:
// ${JSON.stringify(context.docs, null, 2)}
// `;

//   memory.push({ role: "system", content: ctx });
//   memory.push({ role: "user", content: message });

//   const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

//   const completion = await groq.chat.completions.create({
//     model: "llama-3.1-8b-instant",
//     temperature: 0.25,
//     messages: [{ role: "system", content: SYSTEM_PROMPT }, ...memory],
//   });

//   const out = completion.choices[0].message.content || "";

//   const thought = extractThought(out);
//   const action = extractAction(out);
//   const actionInput = extractActionInput(out);
//   let final = extractFinal(out);

//   // If tool is required but missing data → ask user
//   if (action && (!actionInput || typeof actionInput !== "object")) {
//     const ask = 
// `I can do that, but I need a bit more information first.

// What should I name this meeting?`;
    
//     memory.push({ role: "assistant", content: ask });

//     return {
//       toolUsed: null,
//       toolArgs: null,
//       toolResult: null,
//       agentThought: thought,
//       final: ask,
//     };
//   }

//   // If no tool is required
//   if (!action) {
//     memory.push({ role: "assistant", content: final });
//     return { toolUsed: null, toolArgs: null, toolResult: null, agentThought: thought, final };
//   }

//   // Otherwise execute tool
//   const result = await callMCPTool(action, actionInput);

//   if (final.includes("{{toolResult}}")) {
//     final = final.replace("{{toolResult}}", JSON.stringify(result, null, 2));
//   }

//   memory.push({ role: "assistant", content: final });

//   return {
//     toolUsed: action,
//     toolArgs: actionInput,
//     toolResult: result,
//     agentThought: thought,
//     final,
//   };
// }
// ====================================================================
// AgenticAI — Smart Helper Agent (Multi-Action, Safe, Timezone-Aware)
// ====================================================================

// ====================================================================
// AgenticAI — Smart Helper Agent (Multi-Action, Safe, Timezone-Aware)
// ====================================================================
import Groq from "groq-sdk";

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

// -----------------------------------------------------------------------------
// SYSTEM PROMPT – Swarm Planner (Condensed Schema)
// -----------------------------------------------------------------------------
const SYSTEM_PROMPT = `
You are AgenticAI — a Swarm-style planner.

You ALWAYS output valid JSON:

{
  "plan": [
    { "tool": "toolName", "args": { ... } }
  ],
  "final": "Human-friendly summary"
}

If a tool cannot be executed yet, return:

{
  "plan": [],
  "final": "A clarifying question to user"
}

If no tool is needed:

{
  "plan": [],
  "final": "A normal helpful response"
}

====================================================================
TOOL SCHEMA (Condensed)
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
  required → query (raw natural text)

====================================================================
RULES
====================================================================

• ALWAYS use dates.parseNatural for natural language dates.
• ALWAYS convert timestamps to America/Vancouver.
• NEVER invent meetings, leads, or documents.
• ALWAYS ask clarifying questions when required fields missing.
• MULTI-ACTION:
    "Add 5 leads" → 5 plan entries
    "Create 3 meetings" → 3 plan entries

====================================================================
END RULES
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

  // ---------------------------------------------------------------------------
  // Execute all actions in order
  // ---------------------------------------------------------------------------
  for (const step of plan) {
    const { tool, args } = step;

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

  return {
    plan,
    results,
    final: json.final,
  };
}
