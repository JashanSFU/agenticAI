import { NextResponse } from "next/server";
import { db, JournalEntry } from "@/lib/db";
import { createId } from "@/lib/utils";
import { autoLink } from "@/lib/autolink";

export async function POST(req: Request) {
  const { content, mood = null, topics = [] } = await req.json();

  if (!content) {
    return NextResponse.json({
      error: "Missing journal content",
      data: null,
    });
  }

  const now = new Date();
  const entry: JournalEntry = {
    id: createId(),
    date: now.toISOString().split("T")[0], // always yyyy-mm-dd
    content,
    mood,
    topics,
    createdAt: now.toISOString(),
  };

  db.journal.push(entry);
  const linking = await autoLink("journal", entry.id, entry.content);

  // return NextResponse.json({ data: entry });
  return NextResponse.json({
  data: {
    entry,
    linksCreated: linking
  }
});
}
