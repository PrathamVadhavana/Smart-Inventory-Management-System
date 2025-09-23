# FIX: Google OAuth Redirect URI Mismatch Error

## Error You're Seeing

```
Access blocked: Smart-Inventory-Management's request is invalid
Error 400: redirect_uri_mismatch
```

## Root Cause

The redirect URI in your Google Cloud Console OAuth client doesn't exactly match what Supabase is sending.

## IMMEDIATE FIX - Step by Step

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/apis/credentials
2. Find your OAuth client ID (should be named "Smart Inventory Web Client" or similar)
3. Click the pencil icon to edit it

### Step 2: Fix the Redirect URI

In the "Authorized redirect URIs" section, make sure you have EXACTLY this URI:

```
https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback
```

**IMPORTANT**:

- ✅ Copy and paste this EXACTLY: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`
- ❌ Don't type it manually (easy to make typos)
- ❌ Don't add extra spaces or characters
- ❌ Don't forget the `s` in `https`
- ❌ Don't add trailing slashes

### Step 3: Also Add Development URLs (Optional)

For completeness, you can also add these for development:

```
http://localhost:8081
http://127.0.0.1:8081
```

### Step 4: Save Changes

1. Click "Save" in Google Cloud Console
2. Wait a few seconds for changes to propagate

### Step 5: Test Again

1. Go to your app: http://localhost:8081/login
2. Click the "Google" button
3. Should now work without the redirect URI error

## Common Mistakes That Cause This Error

❌ **Wrong Protocol**: `http://` instead of `https://`
❌ **Wrong Domain**: Using your app domain instead of Supabase callback URL
❌ **Typos**: Small spelling mistakes in the URL
❌ **Extra Characters**: Spaces, slashes, or other characters
❌ **Missing Path**: Forgetting `/auth/v1/callback` at the end

## Correct vs Incorrect Examples

✅ **CORRECT**:

```
https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback
```

❌ **INCORRECT**:

```
http://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback  (missing 's' in https)
https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback/  (extra slash)
https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1  (missing /callback)
http://localhost:8081/auth/v1/callback  (wrong domain entirely)
```

## Quick Verification

After making the change, your Google OAuth client should show:

**Authorized redirect URIs:**

- `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`
- `http://localhost:8081` (optional, for dev)

The redirect URI mismatch should be fixed immediately after saving in Google Cloud Console.
