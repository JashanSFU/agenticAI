import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  const pending = db.tasks.filter(t => t.status !== "done");

  const high = pending.filter(t => t.priority === "high");
  const medium = pending.filter(t => t.priority === "medium");
  const low = pending.filter(t => t.priority === "low");

  const today = new Date().toISOString().split("T")[0];

  return NextResponse.json({
    data: {
      today,
      suggestion: {
        morning: high.slice(0, 2),
        midday: medium.slice(0, 2),
        evening: low.slice(0, 2),
      },
      pendingCounts: {
        high: high.length,
        medium: medium.length,
        low: low.length,
      },
    },
  });
}
