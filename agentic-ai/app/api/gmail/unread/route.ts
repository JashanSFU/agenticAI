import { NextResponse } from "next/server";
import { getGmail } from "@/lib/gmail";

export async function GET() {
  try {
    const gmail = getGmail();

    const res = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",   // Gmail search query
      maxResults: 10,
    });

    return NextResponse.json({
      ok: true,
      messages: res.data.messages ?? [],
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
