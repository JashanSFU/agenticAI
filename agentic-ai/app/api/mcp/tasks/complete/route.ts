import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({
      error: "Missing ID",
      data: null,
    });
  }

  const task = db.tasks.find((t) => t.id === id);

  if (!task) {
    return NextResponse.json({
      error: "Task not found",
      data: null,
    });
  }

  task.status = "done";
  task.updatedAt = new Date().toISOString();

  return NextResponse.json({ data: task });
}
