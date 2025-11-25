import { NextResponse } from "next/server";
import { getGmail } from "@/lib/gmail";

export async function GET() {
  try {
    const gmail = getGmail();

    const labelsRes = await gmail.users.labels.list({
      userId: "me",
    });

    return NextResponse.json({ ok: true, labels: labelsRes.data.labels });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
