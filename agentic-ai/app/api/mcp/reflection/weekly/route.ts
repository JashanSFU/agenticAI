import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMoodStats, getFrequentTopics, getTaskStats, getHabitStats } from "@/lib/insights";

export async function POST() {
  const now = new Date();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const inRange = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= weekAgo && d <= now;
  };

  const journalWeek = db.journal.filter(j => inRange(j.createdAt));
  const tasksWeek = db.tasks.filter(t => inRange(t.createdAt));
  const habits = getHabitStats();

  const moodStats = getMoodStats();
  const topics = getFrequentTopics();
  const tasks = getTaskStats();

  const payload = {
    journalWeek,
    tasksWeek,
    moodStats,
    topics,
    tasks,
    habits,
  };

  return NextResponse.json({ data: payload });
}
