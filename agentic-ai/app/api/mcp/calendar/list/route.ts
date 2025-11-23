// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

// export async function POST() {
//   return NextResponse.json({ data: db.meetings });
// }
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  return NextResponse.json({
    data: db.meetings,
  });
}
