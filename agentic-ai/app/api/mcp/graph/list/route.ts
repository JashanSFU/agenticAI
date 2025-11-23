import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  return NextResponse.json({
    data: {
      nodes: db.graphNodes,
      edges: db.graphEdges,
    },
  });
}
