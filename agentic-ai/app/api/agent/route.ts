import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// -------------------------------------------------------
// TOOL MAP
// -------------------------------------------------------
const TOOL_ENDPOINTS: Record<string, string> = {
  "create-meeting": "/api/mcp/calendar/create",
  "list-meetings": "/api/mcp/calendar/list",
  "cancel-meeting": "/api/mcp/calendar/cancel",

  "add-lead": "/api/mcp/crm/add-lead",
  "update-lead": "/api/mcp/crm/update-lead",
  "query-leads": "/api/mcp/crm/query-leads",

  "create-note": "/api/mcp/notes/create",
  "list-notes": "/api/mcp/notes/list",
  "get-note": "/api/mcp/notes/get",

  "create-task": "/api/mcp/tasks/create",
  "list-tasks": "/api/mcp/tasks/list",
  "update-task": "/api/mcp/tasks/update",
  "complete-task": "/api/mcp/tasks/complete",

  "add-journal": "/api/mcp/journal/add",
  "list-journal": "/api/mcp/journal/list",
  "get-journal-by-date": "/api/mcp/journal/by-date",

  "create-habit": "/api/mcp/habits/create",
  "list-habits": "/api/mcp/habits/list",
  "log-habit": "/api/mcp/habits/log",
  "habit-logs": "/api/mcp/habits/logs-by-habit",

  "graph-add-node": "/api/mcp/graph/add-node",
  "graph-add-edge": "/api/mcp/graph/add-edge",
  "graph-list": "/api/mcp/graph/list",
  "graph-related": "/api/mcp/graph/get-related",

  "memory-add-vector": "/api/mcp/memory/add-vector",
  "memory-search": "/api/mcp/memory/search",

  "insights": "/api/mcp/insights",

  "reflection-daily": "/api/mcp/reflection/daily",
  "reflection-weekly": "/api/mcp/reflection/weekly",
  "autoschedule": "/api/mcp/reflection/autoschedule",
};

// -------------------------------------------------------
// SAFE callTool()
// -------------------------------------------------------
async function callTool(tool: string, args: any) {
  const endpoint = TOOL_ENDPOINTS[tool];
  if (!endpoint) throw new Error(`Unknown tool: ${tool}`);

  const res = await fetch(`http://localhost:3000${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args || {}),
  });

  let json: any = {};

  try {
    json = await res.json();
  } catch {
    json = {}; // prevent JSON parse crash
  }

  return json.data ?? null;
}

// -------------------------------------------------------
// STRICT SYSTEM PROMPT (corrected)
// -------------------------------------------------------
const systemPrompt = `
You are an AI Business Assistant.

You MUST respond ONLY using the following JSON structure:

{
  "tool": "create-meeting" | "list-meetings" | "cancel-meeting" |
           "add-lead" | "update-lead" | "query-leads" | 
           "create-note" | "list-notes" | "get-note" | 
           "create-task" | "list-tasks" | "update-task" | "complete-task" | 
           "add-journal" | "list-journal" | "get-journal-by-date" |
           "create-habit" | "list-habits" | "log-habit" | "habit-logs" |
           "graph-add-node" | "graph-add-edge" | "graph-list" | "graph-related" |
           "memory-add-vector" | "memory-search" | 
           "insights" |
           "reflection-daily" | "reflection-weekly" | "autoschedule" |
           null,
  "args": object,
  "final": string
}

TOOL DEFINITIONS (exact):

create-meeting({
  title: string,
  attendees?: string[],
  date_phrase?: string,
  time_phrase?: string
})

list-meetings()

cancel-meeting({ id: string })

add-lead({
  name: string,
  company?: string,
  email?: string,
  phone?: string,
  status?: string,
  notes?: string
})

update-lead({
  id: string,
  ...fields
})

query-leads({
  filter: {
    name?: string,
    company?: string,
    email?: string,
    status?: string
  }
})

create-note({
  title: string,
  content: string,
  tags?: string[]
})

list-notes()

get-note({
  id: string
})

create-task({
  title: string,
  description?: string,
  priority?: "low" | "medium" | "high",
  dueDate?: string,
  projectId?: string
})

list-tasks()

update-task({
  id: string,
  ...fields
})

complete-task({
  id: string
})

add-journal({
  content: string,
  mood?: "great" | "good" | "okay" | "bad" | "awful",
  topics?: string[]
})

list-journal()

get-journal-by-date({
  date: string
})

create-habit({
  name: string,
  description?: string,
  targetPerWeek?: number
})

list-habits()

log-habit({
  habitId: string,
  note?: string,
  value?: number
})

habit-logs({
  habitId: string
})

graph-add-node({
  type: string,
  label: string,
  refId?: string
})

graph-add-edge({
  from: string,
  to: string,
  kind?: "related-to" | "mentioned-in" | "depends-on" | "part-of" | "duplicate-of" | "causes" | "blocks"
})

graph-list()

graph-related({
  id: string
})

memory-add-vector({
  refType: string,
  refId: string,
  text: string
})

memory-search({
  query: string,
  limit?: number
})

insights()

reflection-daily()

reflection-weekly()

autoschedule()

STRICT RULES:
- ALWAYS wrap lead filters inside { "filter": { ... } }.
- NEVER output text outside JSON.
- NEVER invent new tools or categories.
- If missing fields, ask for them with tool = null.
`;

// -------------------------------------------------------
// MAIN HANDLER
// -------------------------------------------------------
export async function POST(req: Request) {
  const { message } = await req.json();

  //
  // STEP 1 — Ask model what to do
  //
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
    temperature: 0,
  });

  const raw = completion.choices[0].message.content || "{}";

  let parsed: any;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({
      type: "error",
      error: "Model returned invalid JSON",
      raw,
    });
  }

  // If no tool needed → answer directly
  if (!parsed.tool) {
    return NextResponse.json({
      type: "response",
      data: parsed.final,
    });
  }

  //
  // STEP 2 — Execute the selected tool
  //
  const toolResult = await callTool(parsed.tool, parsed.args);

  //
  // STEP 3 — Ask model to summarize result naturally
  //
  const finalCompletion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant. Return ONLY a clean natural-language summary of the tool result. No JSON. No quotes.",
      },
      {
        role: "assistant",
        content: JSON.stringify({ toolResult }),
      },
      {
        role: "user",
        content: "Summarize the result in one friendly business sentence.",
      },
    ],
    temperature: 0,
  });

  return NextResponse.json({
    type: "response",
    data: finalCompletion.choices[0].message.content,
    toolUsed: parsed.tool,
    toolArgs: parsed.args,
    toolResult,
  });
}
