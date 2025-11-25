// app/api/mcp/route.ts
import { NextResponse } from "next/server";
import { callMcpTool } from "@/lib/mcpClient";

export async function POST(req: Request) {
  try {
    const { tool, args } = await req.json();

    const result = await callMcpTool(tool, args);

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.toString() },
      { status: 500 }
    );
  }
}
