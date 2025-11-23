// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { createId } from "@/lib/utils";

// export async function POST(req: Request) {
//   const { name, company, email, phone, status = "new", notes = "" } =
//     await req.json();

//   const lead = {
//     id: createId(),
//     name,
//     company,
//     email,
//     phone,
//     status,
//     notes,
//   };

//   db.leads.push(lead);

//   return NextResponse.json({ data: lead });
// }
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, company, email, phone, status = "new", notes = "" } =
      await req.json();

    if (!name) {
      return NextResponse.json(
        { data: null, error: "Missing name" },
        { status: 400 }
      );
    }

    // Prevent duplicates
    const existing = db.leads.find(
      (l) =>
        l.name.toLowerCase() === name.toLowerCase() &&
        (email ? l.email === email : true)
    );

    if (existing) {
      return NextResponse.json({ data: existing });
    }

    const id = Math.random().toString(36).slice(2, 10);

    const lead = {
      id,
      name,
      company,
      email,
      phone,
      status,
      notes,
    };

    db.leads.push(lead);

    return NextResponse.json({ data: lead });
  } catch {
    return NextResponse.json({ data: null, error: "Invalid request" });
  }
}
