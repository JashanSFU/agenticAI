import { db } from "@/lib/db";
import { embedText } from "@/lib/embeddings";

export function getMoodStats() {
  const entries = db.journal.filter(j => j.mood);
  if (entries.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const e of entries) {
    counts[e.mood!] = (counts[e.mood!] || 0) + 1;
  }

  return counts;
}

export function getFrequentTopics() {
  const allTopics = db.journal.flatMap(j => j.topics || []);
  if (allTopics.length === 0) return [];

  const freq: Record<string, number> = {};
  for (const t of allTopics) {
    freq[t] = (freq[t] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }));
}

export function getTaskStats() {
  const total = db.tasks.length;
  const done = db.tasks.filter(t => t.status === "done").length;
  const pending = total - done;

  return { total, done, pending };
}

export function getHabitStats() {
  const habits = db.habits;
  if (!habits.length) return [];

  return habits.map(h => {
    const logs = db.habitLogs.filter(l => l.habitId === h.id);
    return {
      habitId: h.id,
      name: h.name,
      entries: logs.length,
    };
  });
}

export async function getSemanticClusters() {
  const vectors = db.memoryVectors;

  if (vectors.length < 3) return [];

  const clusters: Record<string, any[]> = {};

  for (const v of vectors) {
    // embed original text
    const emb = v.embedding;

    // find nearest neighbor
    let best = null;

    for (const other of vectors) {
      if (v.id === other.id) continue;

      let dot = 0, na = 0, nb = 0;
      for (let i = 0; i < emb.length; i++) {
        dot += emb[i] * other.embedding[i];
        na += emb[i] * emb[i];
        nb += other.embedding[i] * other.embedding[i];
      }
      const sim = dot / (Math.sqrt(na) * Math.sqrt(nb));

      if (!best || sim > best.sim) {
        best = { id: other.id, sim };
      }
    }

    if (best && best.sim > 0.65) {
      const key = `${v.refType}-${v.refId}`;
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(best);
    }
  }

  return clusters;
}
