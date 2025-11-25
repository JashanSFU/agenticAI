import { NextResponse } from "next/server";
import { getGmail } from "@/lib/gmail";
import { parseMessage } from "@/lib/gmail/parseMessage";

export async function GET(req: Request, { params }: any) {
  const { id } = await params;   // ← keep this, just remove incorrect await

  try {
    const gmail = getGmail();

    const res = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });

    const parsed = parseMessage(res.data); // ← This is the ONLY addition

    return NextResponse.json({ ok: true, data: parsed });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
