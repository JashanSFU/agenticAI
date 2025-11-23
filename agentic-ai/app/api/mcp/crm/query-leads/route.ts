// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

// export async function POST(req: Request) {
//   const { filter } = await req.json();

//   const matches = db.leads.filter(lead => {
//     return Object.entries(filter).every(([key, val]) =>
//       String(lead[key]).toLowerCase().includes(String(val).toLowerCase())
//     );
//   });

//   return NextResponse.json({ data: matches });
// }
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper for safe matching
function matches(value: string | undefined, query: string | undefined) {
  if (!value || !query) return true;
  return value.toLowerCase().includes(query.toLowerCase());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const filter = body.filter || {};

    const results = db.leads.filter((l) => {
      return (
        matches(l.name, filter.name) &&
        matches(l.company, filter.company) &&
        matches(l.email, filter.email) &&
        matches(l.status, filter.status)
      );
    });

    return NextResponse.json({ data: results });
  } catch (err) {
    return NextResponse.json({ data: null, error: "Invalid request" });
  }
}
