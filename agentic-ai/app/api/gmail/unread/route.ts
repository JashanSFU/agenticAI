import { NextResponse } from "next/server";
import { getGmail } from "@/lib/gmail";

export async function GET() {
  try {
    const gmail = getGmail();

    // --------------------------------------------------
    // 1. Fetch unread, but skip: promotions, social, spam
    // --------------------------------------------------
    const res = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread -category:promotions -category:social -label:spam",
      maxResults: 20,
    });

    const msgs = res.data.messages ?? [];
    if (msgs.length === 0) {
      return NextResponse.json({ ok: true, messages: [] });
    }

    // --------------------------------------------------
    // 2. Fetch each full email and apply filters
    // --------------------------------------------------
    const filtered = [];

    for (const m of msgs) {
      if (!m?.id) continue;

      const detail = await gmail.users.messages.get({
        userId: "me",
        id: m.id,
        format: "full",
      });

      const data = detail.data;

      // ---------------------------
      // 2a. Skip very large emails
      // ---------------------------
      const size = data.sizeEstimate ?? 0;

      // Skip anything over 500 KB (marketing flyers, huge HTML)
      if (size > 500_000) continue;

      // ---------------------------
      // 2b. Skip emails with giant HTML tables (flyers)
      // ---------------------------
      const snippet = data.snippet?.toLowerCase() ?? "";

      if (
        snippet.includes("<table") ||
        snippet.includes("promo") ||
        snippet.includes("unsubscribe") ||
        snippet.includes("newsletter")
      ) {
        continue;
      }

      filtered.push(data);
    }

    return NextResponse.json({
      ok: true,
      messages: filtered,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
