// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

// export async function POST(req: Request) {
//   const { id } = await req.json();

//   const before = db.meetings.length;
//   db.meetings = db.meetings.filter(m => m.id !== id);

//   if (db.meetings.length === before)
//     return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

//   return NextResponse.json({ data: { success: true } });
// }
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { id } = await req.json();

  if (!id) return NextResponse.json({ data: null });

  // Try direct match
  let index = db.meetings.findIndex(m => m.id === id);

  // Fuzzy match: name inside title
  if (index === -1) {
    const cleaned = id.toLowerCase().trim();
    index = db.meetings.findIndex(m =>
      m.title.toLowerCase().includes(cleaned)
    );
  }

  if (index === -1)
    return NextResponse.json({ data: null, error: "Meeting not found" });

  const removed = db.meetings[index];
  db.meetings.splice(index, 1);

  return NextResponse.json({ data: removed });
}
