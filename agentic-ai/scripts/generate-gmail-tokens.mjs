import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { google } from "googleapis";
import readline from "readline";

// Required environment variables
const required = ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_REDIRECT_URI"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing env variables: ${missing.join(", ")}`);
  console.error("\nAdd these to .env.local:\n");
  console.error("GMAIL_CLIENT_ID=xxx");
  console.error("GMAIL_CLIENT_SECRET=xxx");
  console.error("GMAIL_REDIRECT_URI=http://localhost:3000/api/auth/callback");
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  // "https://www.googleapis.com/auth/gmail.metadata",
];

// Generate Google authorization URL
const url = oauth2.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

console.log("\n🔵 Gmail OAuth Token Generator\n");
console.log("1️⃣ Open this URL in your browser:\n");
console.log(url + "\n");
console.log("2️⃣ After login, Google redirects you to:");
console.log("   http://localhost:3000/api/auth/callback?code=XXXXX\n");
console.log("3️⃣ Copy ONLY the `code` value below.\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Paste authorization code: ", async (code) => {
  try {
    if (!code.trim()) throw new Error("No code entered!");

    const { tokens } = await oauth2.getToken(code);

    console.log("\n✅ Success! Tokens obtained:\n");
    console.log("Access Token:  ", tokens.access_token?.slice(0, 20) + "...");
    console.log("Refresh Token: ", tokens.refresh_token?.slice(0, 20) + "...\n");

    console.log("📝 Add to .env.local:\n");
    console.log(`GMAIL_ACCESS_TOKEN="${tokens.access_token}"`);
    console.log(`GMAIL_REFRESH_TOKEN="${tokens.refresh_token}"`);
    console.log(`GMAIL_TOKEN_EXPIRY="${tokens.expiry_date}"`);
  } catch (err) {
    console.error("❌ Error:", err.message || err);
  }

  rl.close();
});
