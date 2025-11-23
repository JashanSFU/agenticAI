import { NextResponse } from "next/server";
import { db, Note } from "@/lib/db";
import { createId } from "@/lib/utils";
import { autoLink } from "@/lib/autolink";

export async function POST(req: Request) {
  const { title, content, tags = [] } = await req.json();

  if (!title || !content) {
    return NextResponse.json({
      error: "Missing title or content",
      data: null,
    });
  }

  const now = new Date().toISOString();

  const note: Note = {
    id: createId(),
    title,
    content,
    tags,
    createdAt: now,
    updatedAt: now,
  };

  db.notes.push(note);
  const linking = await autoLink("note", note.id, `${note.title} ${note.content}`);

  // return NextResponse.json({ data: note });
  return NextResponse.json({
  data: {
    note,
    linksCreated: linking
  }
});
}
