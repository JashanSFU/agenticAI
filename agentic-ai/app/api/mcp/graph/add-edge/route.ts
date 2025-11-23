import { NextResponse } from "next/server";
import { db, GraphEdge } from "@/lib/db";
import { createId } from "@/lib/utils";

export async function POST(req: Request) {
  const { from, to, kind = "related-to" } = await req.json();

  if (!from || !to) {
    return NextResponse.json({
      error: "Missing from/to",
      data: null,
    });
  }

  const edge: GraphEdge = {
    id: createId(),
    from,
    to,
    kind,
  };

  db.graphEdges.push(edge);

  return NextResponse.json({ data: edge });
}
