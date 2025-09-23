# OAuth Authentication Setup Guide

## Current Issue

Google and Microsoft authentication buttons are not working because OAuth providers haven't been configured in Supabase.

## Step-by-Step Fix

### 1. Configure OAuth Providers in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Navigate to your project: `smart-inventory-system`

2. **Go to Authentication Settings**
   - Click "Authentication" in left sidebar
   - Click "Providers" tab

3. **Configure Google OAuth**
   - Find "Google" in the provider list
   - Toggle it to "Enabled"
   - You'll need to set up Google OAuth credentials:
     - Go to [Google Cloud Console](https://console.cloud.google.com/)
     - Create a new project or select existing one
     - Enable Google+ API
     - Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
     - Application type: "Web application"
     - Authorized redirect URIs: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`
     - Copy Client ID and Client Secret to Supabase

4. **Configure Microsoft OAuth**
   - Find "Azure" in the provider list (Microsoft uses Azure AD)
   - Toggle it to "Enabled"
   - You'll need to set up Microsoft Azure AD:
     - Go to [Azure Portal](https://portal.azure.com/)
     - Navigate to "Azure Active Directory" > "App registrations"
     - Click "New registration"
     - Name: "Smart Inventory System"
     - Redirect URI: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`
     - Copy Application (client) ID and create a client secret
     - Copy these to Supabase Azure provider settings

### 2. Update Redirect URLs in Code

The current code has the correct redirect URL setup, but make sure it matches your domain:

```javascript
// For development
window.location.origin + '/dashboard' = 'http://localhost:8081/dashboard'

// For production, this should be your actual domain
'https://yourdomain.com/dashboard'
```

### 3. Test the OAuth Flow

After configuring the providers:

1. Go to login/signup page
2. Click Google or Microsoft button
3. Should redirect to respective OAuth provider
4. After authorization, should redirect back to your app

### 4. Troubleshooting Common Issues

**Error: "OAuth provider not enabled"**

- Make sure you enabled the provider in Supabase dashboard

**Error: "Invalid redirect URI"**

- Ensure the redirect URI in Google/Microsoft console matches exactly: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`

**Error: "Invalid client ID/secret"**

- Double-check the client credentials in Supabase settings

**Error: "Unauthorized domain"**

- In Google Console, add your domain to authorized domains
- In Azure, ensure the redirect URI includes your domain

### 5. Environment Variables (Already Correct)

Your current .env file has the correct Supabase configuration:

```
VITE_SUPABASE_URL=https://qoqjtcpnlpifyshrfwet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Quick Test Without Full Setup

If you want to test OAuth without setting up your own Google/Microsoft apps, you can:

1. Temporarily comment out the social buttons in Login.tsx and SignUp.tsx
2. Use email/password authentication which should work fine
3. Set up OAuth providers later when ready for production

## Code Files That Handle OAuth

- `client/pages/Login.tsx` - Lines 242-249 (handleSocialAuth function)
- `client/pages/SignUp.tsx` - Lines 345-352 (handleSocialAuth function)
- `client/lib/supabase.ts` - Supabase client configuration

The OAuth implementation in the code is correct - the issue is just the missing provider configuration in Supabase dashboard.
