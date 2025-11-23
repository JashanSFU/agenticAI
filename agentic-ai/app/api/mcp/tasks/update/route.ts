import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { id, ...fields } = await req.json();

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

  const now = new Date().toISOString();

  Object.assign(task, fields, {
    updatedAt: now,
  });

  return NextResponse.json({ data: task });
}
