import { NextResponse } from "next/server";
import { getMoodStats, getFrequentTopics, getTaskStats, getHabitStats, getSemanticClusters } from "@/lib/insights";

export async function POST() {

  const mood = getMoodStats();
  const topics = getFrequentTopics();
  const tasks = getTaskStats();
  const habits = getHabitStats();
  const clusters = await getSemanticClusters();

  return NextResponse.json({
    data: {
      mood,
      topics,
      tasks,
      habits,
      clusters
    }
  });
}
