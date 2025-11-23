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
