import { NextResponse } from "next/server";
import { db, MemoryVector } from "@/lib/db";
import { embedText } from "@/lib/embeddings";

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(req: Request) {
  const { query, limit = 5 } = await req.json();

  if (!query)
    return NextResponse.json({ error: "Missing query", data: null });

  const queryEmbedding = await embedText(query);

  const results = db.memoryVectors
    .map((v) => ({
      ...v,
      score: cosineSimilarity(queryEmbedding, v.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json({ data: results });
}
