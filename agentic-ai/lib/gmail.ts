import { google } from "googleapis";

export function getOAuth2Client() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID!,
    process.env.GMAIL_CLIENT_SECRET!,
    process.env.GMAIL_REDIRECT_URI!
  );

  oauth2.setCredentials({
    access_token: process.env.GMAIL_ACCESS_TOKEN,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  // 🔄 Automatically refresh the access token if expired
  oauth2.on("tokens", (tokens) => {
    if (tokens.access_token) {
      console.log("🔄 Gmail: new access token issued:", tokens.access_token.slice(0, 20) + "…");
    }
    if (tokens.refresh_token) {
      console.log("🔄 Gmail: new refresh token issued:", tokens.refresh_token.slice(0, 20) + "…");
    }
  });

  return oauth2;
}

export function getGmail() {
  const auth = getOAuth2Client();
  return google.gmail({ version: "v1", auth });
}
