import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { habitId } = await req.json();

  if (!habitId)
    return NextResponse.json({ error: "Missing habitId", data: null });

  const logs = db.habitLogs.filter(l => l.habitId === habitId);

  return NextResponse.json({ data: logs });
}
