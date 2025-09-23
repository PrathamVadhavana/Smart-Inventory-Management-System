# Google OAuth Setup - Step by Step Guide

## Current Issue

You're getting validation errors in Supabase because you need to create OAuth credentials in Google Cloud Console first.

## Step 1: Create Google Cloud Project & OAuth Credentials

### 1.1 Go to Google Cloud Console

- Visit: https://console.cloud.google.com/
- Sign in with your Google account (vadhavanapratham1947@gmail.com)

### 1.2 Create or Select Project

- Click the project dropdown at the top
- Either select existing project or click "New Project"
- Project name: "Smart Inventory System"
- Click "Create"

### 1.3 Enable Google+ API (Required for OAuth)

- In the search bar, type "Google+ API"
- Click on "Google+ API" result
- Click "Enable" button
- Wait for it to be enabled

### 1.4 Create OAuth Credentials

- Go to "APIs & Services" > "Credentials" (left sidebar)
- Click "Create Credentials" > "OAuth 2.0 Client ID"
- If prompted, configure OAuth consent screen first:
  - Click "Configure Consent Screen"
  - Choose "External" (unless you have Google Workspace)
  - Fill required fields:
    - App name: "Smart Inventory System"
    - User support email: vadhavanapratham1947@gmail.com
    - Developer email: vadhavanapratham1947@gmail.com
  - Click "Save and Continue" through all steps

### 1.5 Create OAuth Client ID

- Application type: "Web application"
- Name: "Smart Inventory Web Client"
- Authorized JavaScript origins:
  - `http://localhost:8081` (for development)
  - `https://yourdomain.com` (for production - add your actual domain later)
- Authorized redirect URIs:
  - `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`
- Click "Create"

### 1.6 Copy Credentials

- You'll see a popup with:
  - **Client ID**: Something like `123456789-abcdef.apps.googleusercontent.com`
  - **Client Secret**: Something like `GOCSPX-abcdef123456`
- Copy both values (don't close the popup yet!)

## Step 2: Configure in Supabase

### 2.1 Go to Supabase Dashboard

- Visit: https://supabase.com/dashboard
- Go to your project: smart-inventory-system
- Click "Authentication" > "Providers"

### 2.2 Configure Google Provider

- Find "Google" in the list
- Toggle it to "Enabled"
- **Client ID**: Paste the long string like `123456789-abcdef.apps.googleusercontent.com`
- **Client Secret**: Paste the string like `GOCSPX-abcdef123456`
- Click "Save"

## Step 3: Test the Integration

### 3.1 Test in Development

- Go to your app: http://localhost:8081/login
- Click "Google" button
- Should redirect to Google OAuth
- After authorization, should redirect back to dashboard

### 3.2 Expected Client ID Format

```
✅ Correct: 123456789012-abc123def456ghi789.apps.googleusercontent.com
❌ Wrong: vadhavanapratham1947@gmail.com
```

### 3.3 Expected Client Secret Format

```
✅ Correct: GOCSPX-abc123def456ghi789jkl012
❌ Wrong: \ (single backslash)
```

## Troubleshooting

**Error: "Invalid Client ID"**

- Make sure you copied the full Client ID from Google Cloud Console
- It should end with `.apps.googleusercontent.com`

**Error: "Invalid redirect URI"**

- In Google Cloud Console, add: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`
- Make sure there are no extra spaces or characters

**Error: "OAuth consent screen not configured"**

- Go back to Google Cloud Console > OAuth consent screen
- Fill in all required fields and publish the app

## Quick Reference

**Your Supabase Callback URL**:

```
https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback
```

**Google Cloud Console URL**:

```
https://console.cloud.google.com/apis/credentials
```

Once you complete these steps, the Google OAuth button in your app will work correctly!
