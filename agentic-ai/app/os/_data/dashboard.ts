import { db } from "@/lib/db";

export function getTodayDashboardData() {
  const today = new Date().toISOString().split("T")[0];

  const todaysJournal = db.journal.find(j => j.date === today) || null;
  const todaysTasks = db.tasks.filter(t => t.dueDate === today);
  const recentNotes = db.notes.slice(-5).reverse();
  const habits = db.habits;
  const habitLogsToday = db.habitLogs.filter(l => l.date === today);

  return {
    today,
    todaysJournal,
    todaysTasks,
    recentNotes,
    habits,
    habitLogsToday,
  };
}
