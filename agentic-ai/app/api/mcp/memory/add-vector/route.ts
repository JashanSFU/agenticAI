import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createId } from "@/lib/utils";
import { embedText } from "@/lib/embeddings";

export async function POST(req: Request) {
  const { refType, refId, text } = await req.json();

  if (!refType || !refId || !text) {
    return NextResponse.json({
      error: "Missing refType, refId, or text",
      data: null,
    });
  }

  const embedding = await embedText(text);

  const vec = {
    id: createId(),
    refType,
    refId,
    text,
    embedding,
  };

  db.memoryVectors.push(vec);

  return NextResponse.json({ data: vec });
}
