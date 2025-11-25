import { getGmail } from "@/lib/gmail";
import { parseMessage } from "@/lib/gmail/parseMessage";

export async function getEmailContext(limit = 10) {
  try {
    const gmail = getGmail();

    const list = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread -category:promotions -category:social -label:spam",
      maxResults: limit,
    });

    const raw = list.data.messages || [];
    if (!Array.isArray(raw) || raw.length === 0) return [];

    const out = [];

    for (const m of raw) {
      if (!m?.id) continue;

      try {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: m.id,
          format: "full",
        });

        if (!detail?.data) continue;

        const parsed = parseMessage(detail.data) || {};

        out.push({
          id: detail.data.id,
          snippet: parsed.text || "",
          html: parsed.html || "",
          from: parsed.from || "",
          subject: parsed.subject || "",
        });
      } catch (err) {
        console.warn("⚠️ Skipping malformed Gmail message:", err);
        continue;
      }
    }

    return out;
  } catch (err) {
    console.error("❌ Gmail context error:", err);
    return [];
  }
}
