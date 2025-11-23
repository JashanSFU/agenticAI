import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMoodStats, getFrequentTopics, getTaskStats } from "@/lib/insights";

export async function POST() {
  const today = new Date().toISOString().split("T")[0];

  const todaysJournal = db.journal.filter(j => j.date === today);
  const todaysTasks = db.tasks.filter(t => t.updatedAt.startsWith(today));
  const moodStats = getMoodStats();
  const topicStats = getFrequentTopics();
  const taskStats = getTaskStats();

  const payload = {
    date: today,
    journalEntries: todaysJournal,
    tasks: todaysTasks,
    moodStats,
    topicStats,
    taskStats,
  };

  return NextResponse.json({ data: payload });
}
