import { NextResponse } from "next/server";
import { db, HabitLog } from "@/lib/db";
import { createId } from "@/lib/utils";

export async function POST(req: Request) {
  const { habitId, note = "", value = null } = await req.json();

  if (!habitId) {
    return NextResponse.json({
      error: "Missing habitId",
      data: null,
    });
  }

  const habitExists = db.habits.some(h => h.id === habitId);
  if (!habitExists) {
    return NextResponse.json({
      error: "Habit does not exist",
      data: null,
    });
  }

  const entry: HabitLog = {
    id: createId(),
    habitId,
    date: new Date().toISOString().split("T")[0],
    value,
    note,
  };

  db.habitLogs.push(entry);

  return NextResponse.json({ data: entry });
}
