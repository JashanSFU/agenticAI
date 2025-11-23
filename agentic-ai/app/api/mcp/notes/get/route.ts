import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { id } = await req.json();

  if (!id)
    return NextResponse.json({ data: null, error: "Missing ID" });

  const note = db.notes.find((n) => n.id === id);

  return NextResponse.json({
    data: note ?? null,
  });
}
