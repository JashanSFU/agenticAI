import { NextResponse } from "next/server";
import { db, GraphNode } from "@/lib/db";
import { createId } from "@/lib/utils";

export async function POST(req: Request) {
  const { type, label, refId = null } = await req.json();

  if (!type || !label) {
    return NextResponse.json({
      error: "Missing type or label",
      data: null,
    });
  }

  const node: GraphNode = {
    id: createId(),
    type,
    label,
    refId,
  };

  db.graphNodes.push(node);

  return NextResponse.json({ data: node });
}
