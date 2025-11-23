import { db } from "@/lib/db";
import { embedText } from "@/lib/embeddings";
import { createId } from "@/lib/utils";

// simple cosine sim
function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function autoLink(refType: string, refId: string, text: string) {
  // STEP 1. embed new text
  const embedding = await embedText(text);

  // STEP 2. find similar items
  const scored = db.memoryVectors.map(v => ({
    ...v,
    score: cosine(embedding, v.embedding)
  }));

  // sort by similarity
  scored.sort((a, b) => b.score - a.score);

  // STEP 3. only consider > 0.55 similarity (tweakable)
  const threshold = 0.55;
  const similar = scored.filter(v => v.score >= threshold);

  // STEP 4. create graph nodes for the current item
  const newNodeId = createId();
  db.graphNodes.push({
    id: newNodeId,
    type: refType,
    label: `${refType}:${refId}`,
    refId,
  });

  // STEP 5. connect similar items
  for (const match of similar) {
    // find node for matched item
    const existingNode = db.graphNodes.find(n => n.refId === match.refId);
    if (!existingNode) continue;

    let kind: string = "related-to";

    if (match.score > 0.75) {
      kind = "duplicate-of"; // strong semantic match
    }

    db.graphEdges.push({
      id: createId(),
      from: newNodeId,
      to: existingNode.id,
      kind,
    });
  }

  // STEP 6. store the memory vector
  db.memoryVectors.push({
    id: createId(),
    refType,
    refId,
    text,
    embedding,
  });

  return {
    newNodeId,
    linked: similar.map(s => ({
      refId: s.refId,
      score: s.score,
    }))
  };
}
