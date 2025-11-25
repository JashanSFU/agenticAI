export function decodeEmailBody(message: any) {
  let data =
    message?.payload?.body?.data ||
    message?.payload?.parts?.find((p: any) => p.mimeType === "text/html")?.body?.data ||
    message?.payload?.parts?.find((p: any) => p.mimeType === "text/plain")?.body?.data;

  if (!data) return "";

  return Buffer.from(data, "base64").toString("utf8");
}
