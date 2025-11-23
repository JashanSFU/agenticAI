import { NextResponse } from "next/server";
import { db, Task } from "@/lib/db";
import { createId } from "@/lib/utils";
import { autoLink } from "@/lib/autolink";

export async function POST(req: Request) {
  const { title, description = "", priority = "medium", dueDate = null, projectId = null } =
    await req.json();

  if (!title) {
    return NextResponse.json({
      error: "Missing title",
      data: null,
    });
  }

  const now = new Date().toISOString();

  const task: Task = {
    id: createId(),
    title,
    description,
    status: "todo",
    priority,
    dueDate,
    projectId,
    createdAt: now,
    updatedAt: now,
  };

  db.tasks.push(task);
const linking = await autoLink("task", task.id, `${task.title} ${task.description}`);

  // return NextResponse.json({ data: task });
  return NextResponse.json({
  data: {
    task,
    linksCreated: linking
  }
});
}
