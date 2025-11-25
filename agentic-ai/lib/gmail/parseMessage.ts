import type { gmail_v1 } from "googleapis";

export function parseMessage(msg: gmail_v1.Schema$Message) {
  const headers = msg.payload?.headers || [];

  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

  const result: any = {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet,
    subject: getHeader("subject"),
    from: getHeader("from"),
    to: getHeader("to"),
    date: getHeader("date"),
    text: "",
    html: "",
    attachments: [],
  };

  function walk(part: any) {
    if (!part) return;

    if (part.mimeType === "text/plain" && part.body?.data) {
      result.text = Buffer.from(part.body.data, "base64").toString("utf8");
    }

    if (part.mimeType === "text/html" && part.body?.data) {
      result.html = Buffer.from(part.body.data, "base64").toString("utf8");
    }

    if (part.filename && part.body?.attachmentId) {
      result.attachments.push({
        filename: part.filename,
        mimeType: part.mimeType,
        attachmentId: part.body.attachmentId,
        size: part.body.size || 0,
      });
    }

    if (part.parts) {
      part.parts.forEach(walk);
    }
  }

  walk(msg.payload);

  return result;
}
