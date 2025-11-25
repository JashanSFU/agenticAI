# Gmail API Setup Guide

## Step 1: Create Gmail OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the **Gmail API**:

   - Search for "Gmail API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:

   - Go to **Credentials** (left sidebar)
   - Click **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback` (development)
     - Your production URL later

5. Copy the **Client ID** and **Client Secret**

## Step 2: Add to .env.local

```env
# Gmail OAuth Configuration
GMAIL_CLIENT_ID=your-client-id-here
GMAIL_CLIENT_SECRET=your-client-secret-here
GMAIL_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

## Step 3: Generate Access Tokens

Run the token generation script:

```bash
node scripts/generate-gmail-tokens.mjs
```

This will:

1. Open your browser to authorize the app
2. Redirect you back with an authorization code
3. Exchange the code for Access & Refresh tokens

Copy the tokens and add them to `.env.local`:

```env
GMAIL_ACCESS_TOKEN=your-access-token
GMAIL_REFRESH_TOKEN=your-refresh-token
```

## Step 4: Verify Setup

Start the development server:

```bash
npm run dev
```

Test the Gmail API endpoint:

```bash
curl http://localhost:3000/api/gmail/list
```

You should see your recent emails (from the last 7 days).

## Troubleshooting

### "Missing Gmail configuration" error

- Make sure all 5 Gmail env vars are set in `.env.local`
- Refresh your browser after updating `.env.local`

### "Invalid grant" error when fetching emails

- Your refresh token may have expired
- Re-run: `node scripts/generate-gmail-tokens.mjs`

### Can't get authorization code

- Make sure `GMAIL_REDIRECT_URI` matches exactly in Google Cloud Console
- Clear browser cookies and try again

## Using the Gmail API in MCP

The Gmail list endpoint is available through the MCP server:

```bash
echo '{ "jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": { "name": "gmail.list", "arguments": {} } }' | node mcp/server.mjs
```

Or fetch via HTTP:

```bash
curl http://localhost:3000/api/gmail/list
```
