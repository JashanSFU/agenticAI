// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

// export async function POST(req: Request) {
//   const { id, ...updates } = await req.json();

//   const lead = db.leads.find(l => l.id === id);
//   if (!lead)
//     return NextResponse.json({ error: "Lead not found" }, { status: 404 });

//   Object.assign(lead, updates);

//   return NextResponse.json({ data: lead });
// }
import { NextResponse } from "next/server";
import { db } from "@/lib/db";  // <-- your existing in-memory DB

// Helper: check if string is a UUID
function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Helper: normalize agent placeholder text → actual name
function cleanIdentifier(str: string) {
  return str
    .toLowerCase()
    .replace(/'s id$/, "")        // "Sarah Wilson's ID"
    .replace(/ id$/, "")          // "Sarah Wilson ID"
    .replace(/^id for /, "")      // "ID for Sarah Wilson"
    .replace(/^lead for /, "")    // "Lead for Sarah Wilson"
    .replace(/^update /, "")      // "Update Sarah Wilson"
    .trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { data: null, error: "Missing id" },
        { status: 400 }
      );
    }

    // --------------------------------------------------------
    // ⭐ NEW LOGIC: If id is NOT a UUID → treat it as a NAME
    // --------------------------------------------------------
    if (!isUUID(id)) {
      const cleaned = cleanIdentifier(id);

      const match = db.leads.find(
        (l) => l.name.toLowerCase() === cleaned
      );

      if (!match) {
        return NextResponse.json({
          data: null,
          error: `No lead found matching: ${id}`,
        });
      }

      id = match.id; // Use real UUID
    }

    // --------------------------------------------------------
    // Find lead by actual UUID
    // --------------------------------------------------------
    const lead = db.leads.find((l) => l.id === id);

    if (!lead) {
      return NextResponse.json({
        data: null,
        error: `Lead not found with id: ${id}`,
      });
    }

    // --------------------------------------------------------
    // Apply updates safely
    // --------------------------------------------------------
    Object.assign(lead, fields);

    return NextResponse.json({
      data: lead,
    });
  } catch {
    return NextResponse.json({
      data: null,
      error: "Invalid request.",
    });
  }
}
