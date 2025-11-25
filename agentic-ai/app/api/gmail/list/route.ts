import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Validate environment variables
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const redirectUri = process.env.GMAIL_REDIRECT_URI;
    const accessToken = process.env.GMAIL_ACCESS_TOKEN;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !redirectUri || !accessToken || !refreshToken) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing Gmail configuration. Run: node scripts/generate-gmail-tokens.mjs",
        },
        { status: 400 }
      );
    }

    // Create OAuth2 client
    const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    // Set credentials
    client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: client });

    const res = await gmail.users.messages.list({
      userId: "me",
      q: "newer_than:7d",
      maxResults: 50,
    });

    return NextResponse.json({ ok: true, messages: res.data.messages ?? [] });
  } catch (err: any) {
    console.error("Gmail API Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
