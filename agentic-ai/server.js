// mcp/server.js
import { Server } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebSocketServerTransport } from "@modelcontextprotocol/sdk/client/websocket.js";
import { z } from "zod";

// ----------------------------------------------------------------------
// 1. Create server instance (REAL API)
// ---------------------------------------------
const server = new Server({
  name: "agentic-ai-mcp",
  version: "1.0.0",
});

// ---------------------------------------------
// 2. Define tools (REAL API: server.tool(name, schema, handler))
// ---------------------------------------------

// Email listing example
server.tool(
  "email.list",
  {
    title: "List Emails",
    description: "Returns a mock inbox",
    inputSchema: {}, // no params
  },
  async () => {
    return {
      content: [
        {
          type: "json",
          data: {
            emails: [
              { id: 1, from: "client@example.com", subject: "Need a quote" },
              { id: 2, from: "billing@company.com", subject: "Invoice Reminder" },
            ],
          },
        },
      ],
    };
  }
);

// Add CRM lead
server.tool(
  "crm.addLead",
  {
    title: "Add CRM Lead",
    description: "Adds a lead (mock)",
    inputSchema: {
      name: z.string(),
      email: z.string().optional(),
      notes: z.string().optional(),
    },
  },
  async (args) => {
    return {
      content: [
        {
          type: "text",
          text: `Lead saved: ${args.name}`,
        },
      ],
    };
  }
);

// ---------------------------------------------
// 3. Attach WebSocket server (REAL transport)
// ---------------------------------------------
async function start() {
  const transport = new WebSocketServerTransport({
    port: 5005,
    path: "/mcp",
  });

  console.log("🔵 MCP WebSocket Server running at ws://localhost:5005/mcp");

  await server.connect(transport);
}

start().catch(console.error);
