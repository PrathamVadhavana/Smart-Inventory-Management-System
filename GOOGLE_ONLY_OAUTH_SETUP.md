# Simplified OAuth Setup Guide - Google Only

## 🎯 Overview

This simplified guide will walk you through setting up only Google OAuth authentication for your Smart Inventory System. Microsoft authentication has been removed to simplify the setup process.

---

## 🔵 GOOGLE OAUTH SETUP

### Step 1: Access Google Cloud Console

1. **Open your browser** and go to: https://console.cloud.google.com/
2. **Sign in** with your Google account: `vadhavanapratham1947@gmail.com`
3. **Wait for the dashboard to load**

### Step 2: Create or Select Project

1. **Look at the top left** - you'll see a project dropdown next to "Google Cloud Platform"
2. **Click the project dropdown**
3. **To create new project**:
   - Click "NEW PROJECT" (top right of project selector)
   - Project name: `Smart Inventory System`
   - Organization: Leave as default
   - Location: Leave as default
   - Click "CREATE"
   - **Wait 1-2 minutes** for project creation

### Step 3: Enable Required APIs

1. **In the search bar at top**, type: `Google Identity`
2. **Click on**: "Google Identity and Access Management (IAM) API"
3. **Click "ENABLE"** button
4. **Wait for it to enable** (green checkmark will appear)

### Step 4: Configure OAuth Consent Screen

1. **In left sidebar**, click "APIs & Services"
2. **Click "OAuth consent screen"**
3. **Choose User Type**:
   - Select "External" (unless you have Google Workspace)
   - Click "CREATE"

4. **Fill OAuth Consent Screen - App Information**:
   - App name: `Smart Inventory System`
   - User support email: `vadhavanapratham1947@gmail.com`
   - Upload app logo: Skip for now
   - App domain section: Leave empty for now
   - Developer contact information: `vadhavanapratham1947@gmail.com`
   - Click "SAVE AND CONTINUE"

5. **Scopes Page**:
   - Click "SAVE AND CONTINUE" (don't add scopes)

6. **Test Users Page**:
   - Add test users: `vadhavanapratham1947@gmail.com`
   - Click "ADD USERS"
   - Click "SAVE AND CONTINUE"

7. **Summary Page**:
   - Review information
   - Click "BACK TO DASHBOARD"

### Step 5: Create OAuth 2.0 Client ID

1. **In left sidebar**, click "Credentials"
2. **Click "CREATE CREDENTIALS"** (top of page)
3. **Select "OAuth 2.0 Client ID"**

4. **Application Type**: Select "Web application"
5. **Name**: `Smart Inventory Web Client`

6. **Authorized JavaScript origins**:
   - Click "ADD URI"
   - Enter: `http://localhost:8081`
   - Click "ADD URI" again
   - Enter: `https://yourdomain.com` (replace with your production domain later)

7. **Authorized redirect URIs**:
   - Click "ADD URI"
   - **COPY AND PASTE EXACTLY**: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`
   - ⚠️ **CRITICAL**: Do not type this manually - copy and paste to avoid typos

8. **Click "CREATE"**

### Step 6: Copy Google Credentials

1. **A popup will appear** with your credentials
2. **Copy Client ID**:
   - It looks like: `123456789012-abcdefghijk.apps.googleusercontent.com`
   - Click the copy button or select all and copy
3. **Copy Client Secret**:
   - It looks like: `GOCSPX-abcdefghijklmnop`
   - Click the copy button or select all and copy
4. **Keep this popup open** or save these somewhere safe

---

## 🔧 SUPABASE CONFIGURATION

### Step 1: Access Supabase Dashboard

1. **Open new tab** and go to: https://supabase.com/dashboard
2. **Sign in to your account**
3. **Click on your project**: `smart-inventory-system`

### Step 2: Configure Google Provider

1. **In left sidebar**, click "Authentication"
2. **Click "Providers" tab**
3. **Find "Google" in the list**
4. **Toggle it to "Enabled"** (switch should turn green)

5. **Enter Google Credentials**:
   - **Client ID**: Paste the Google Client ID from Step 6
     - Should look like: `123456789012-abcdefghijk.apps.googleusercontent.com`
   - **Client Secret**: Paste the Google Client Secret from Step 6
     - Should look like: `GOCSPX-abcdefghijklmnop`
   - **Click "Save"**

### Step 3: Disable Microsoft/Azure Provider (Optional)

1. **Find "Azure" in the providers list**
2. **Make sure it's toggled to "Disabled"** (switch should be gray)

---

## 🧪 TESTING THE SETUP

### Test Google OAuth

1. **Go to your app**: http://localhost:8081/login
2. **Click "Google" button** (should be the only social login button now)
3. **Expected flow**:
   - Redirects to Google OAuth page
   - Shows "Smart Inventory System wants to access your Google Account"
   - Click "Continue" or "Allow"
   - Redirects back to your app dashboard
   - You should be logged in

### What You Should See

✅ **Login Page**: Only shows Google button (no Microsoft button)  
✅ **SignUp Page**: Only shows Google button (no Microsoft button)  
✅ **Google OAuth**: Works correctly and redirects to dashboard  
✅ **Email/Password**: Still works as before

---

## 🚨 TROUBLESHOOTING

### Common Google Errors:

**"redirect_uri_mismatch"**:

- Check Step 5.7 - make sure redirect URI is exactly: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`

**"invalid_client"**:

- Check Client ID and Secret in Supabase match Google Cloud Console

**"access_denied"**:

- Make sure OAuth consent screen is properly configured

**"This app isn't verified"**:

- This is normal for development - click "Advanced" then "Go to Smart Inventory System (unsafe)"

---

## 📝 QUICK REFERENCE

**Supabase Callback URL**: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`

**Google Cloud Console**: https://console.cloud.google.com/apis/credentials  
**Supabase Dashboard**: https://supabase.com/dashboard

**Your App URLs**:

- Development: http://localhost:8081
- Login: http://localhost:8081/login
- Dashboard: http://localhost:8081/dashboard

## ✅ Benefits of Google-Only Setup

- **Simpler Configuration**: Only one OAuth provider to set up
- **No Azure Complexity**: Avoid Microsoft/Azure AD configuration
- **Faster Setup**: Less steps and fewer potential errors
- **Still Secure**: Google OAuth is widely trusted and secure
- **Fallback Available**: Email/password authentication still works

Your Smart Inventory System now has clean, simple authentication with Google OAuth and email/password options!
