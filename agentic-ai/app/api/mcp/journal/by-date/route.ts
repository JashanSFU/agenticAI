import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { date } = await req.json(); // yyyy-mm-dd

  if (!date)
    return NextResponse.json({ error: "Missing date", data: null });

  const entries = db.journal.filter(j => j.date === date);

  return NextResponse.json({
    data: entries,
  });
}
