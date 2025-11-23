import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { id } = await req.json(); // GraphNode.id

  if (!id)
    return NextResponse.json({ error: "Missing id", data: null });

  const relatedEdges = db.graphEdges.filter(
    (e) => e.from === id || e.to === id
  );

  const relatedNodeIds = relatedEdges.map((e) =>
    e.from === id ? e.to : e.from
  );

  const relatedNodes = db.graphNodes.filter((n) =>
    relatedNodeIds.includes(n.id)
  );

  return NextResponse.json({
    data: {
      edges: relatedEdges,
      nodes: relatedNodes,
    },
  });
}
