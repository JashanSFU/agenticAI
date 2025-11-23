import { NextResponse } from "next/server";
import { db, Habit } from "@/lib/db";
import { createId } from "@/lib/utils";

export async function POST(req: Request) {
  const { name, description = "", targetPerWeek = null } = await req.json();

  if (!name) {
    return NextResponse.json({
      error: "Habit name is required",
      data: null,
    });
  }

  const habit: Habit = {
    id: createId(),
    name,
    description,
    targetPerWeek,
    createdAt: new Date().toISOString(),
  };

  db.habits.push(habit);

  return NextResponse.json({ data: habit });
}
