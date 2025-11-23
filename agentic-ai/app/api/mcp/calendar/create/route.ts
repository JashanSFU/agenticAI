// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { createId } from "@/lib/utils";

// export async function POST(req: Request) {
//   const { title, date, time, attendees = [] } = await req.json();

//   const meeting = {
//     id: createId(),
//     title,
//     date,
//     time,
//     attendees,
//   };

//   db.meetings.push(meeting);

//   return NextResponse.json({ data: meeting });
// }
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createId } from "@/lib/utils";
import { parseDate, parseTimePhrase, hasConflict, findNextAvailable } from "@/lib/calendar";

export async function POST(req: Request) {
  const body = await req.json();

  const { title, attendees, date_phrase, time_phrase } = body;

  if (!title)
    return NextResponse.json({ error: "Missing title", data: null });

  // Parse natural language date (“tomorrow”, “next friday”)
  const dateObj = parseDate(date_phrase);
  if (!dateObj)
    return NextResponse.json({ error: "Invalid date phrase", data: null });

  const date = dateObj.toISOString().split("T")[0];

  // Parse time phrase
  let time = parseTimePhrase(time_phrase);

  if (!time) {
    // No specific time → choose best open slot
    time = findNextAvailable(date);
    if (!time)
      return NextResponse.json({ error: "No available time slots", data: null });
  }

  // Conflict detection
  if (hasConflict(date, time)) {
    const next = findNextAvailable(date);
    if (!next) {
      return NextResponse.json({
        error: "Conflict with all available times",
        data: null,
      });
    }
    time = next;
  }

  // Create meeting
  const meeting = {
    id: createId(),
    title,
    attendees: attendees || [],
    date,
    time,
  };

  db.meetings.push(meeting);

  return NextResponse.json({ data: meeting });
}
