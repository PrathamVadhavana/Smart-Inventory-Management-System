# DETAILED OAuth Setup Guide - Complete Step-by-Step

## 🎯 Overview

This guide will walk you through setting up Google and Microsoft OAuth authentication for your Smart Inventory System. Follow each step exactly as written.

---

## 🔵 PART 1: GOOGLE OAUTH SETUP

### Step 1: Access Google Cloud Console

1. **Open your browser** and go to: https://console.cloud.google.com/
2. **Sign in** with your Google account: `vadhavanapratham1947@gmail.com`
3. **Wait for the dashboard to load**

### Step 2: Create or Select Project

1. **Look at the top left** - you'll see a project dropdown next to "Google Cloud Platform"
2. **Click the project dropdown**
3. **If you see existing projects**:
   - Look for "Smart Inventory System" or similar
   - If it exists, click on it
   - If not, continue to create new project
4. **To create new project**:
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

4. **If prompted about consent screen**:
   - Click "CONFIGURE CONSENT SCREEN"
   - Follow Step 4 above first

5. **Application Type**: Select "Web application"
6. **Name**: `Smart Inventory Web Client`

7. **Authorized JavaScript origins**:
   - Click "ADD URI"
   - Enter: `http://localhost:8081`
   - Click "ADD URI" again
   - Enter: `https://yourdomain.com` (replace with your production domain later)

8. **Authorized redirect URIs**:
   - Click "ADD URI"
   - **COPY AND PASTE EXACTLY**: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`
   - ⚠️ **CRITICAL**: Do not type this manually - copy and paste to avoid typos

9. **Click "CREATE"**

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

## 🔷 PART 2: MICROSOFT OAUTH SETUP

### Step 1: Access Azure Portal

1. **Open new tab** and go to: https://portal.azure.com/
2. **Sign in** with your Microsoft account
3. **Wait for Azure dashboard to load**

### Step 2: Navigate to Azure Active Directory

1. **In the search bar at top**, type: `Azure Active Directory`
2. **Click on "Azure Active Directory"** from results
3. **You'll see the Azure AD Overview page**

### Step 3: Create App Registration

1. **In left sidebar**, click "App registrations"
2. **Click "New registration"** (top of page)

3. **Fill Registration Form**:
   - **Name**: `Smart Inventory System`
   - **Supported account types**: Select "Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"
   - **Redirect URI**:
     - Platform dropdown: Select "Web"
     - URI field: **COPY AND PASTE EXACTLY**: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`
   - **Click "Register"**

### Step 4: Copy Application ID

1. **You'll be on the app Overview page**
2. **Find "Application (client) ID"**:
   - It looks like: `12345678-1234-1234-1234-123456789abc`
   - Click the copy button next to it
   - **Save this somewhere** - this is your Microsoft Client ID

### Step 5: Create Client Secret

1. **In left sidebar**, click "Certificates & secrets"
2. **Click "New client secret"**
3. **Add Client Secret**:
   - Description: `Supabase OAuth Secret`
   - Expires: Select "24 months"
   - Click "Add"

4. **Copy Secret Value**:
   - **IMMEDIATELY** copy the "Value" (not the Secret ID)
   - It looks like: `abc123def456ghi789jkl012mno345`
   - ⚠️ **CRITICAL**: This will only show once - copy it now!
   - **Save this somewhere safe**

---

## 🔧 PART 3: CONFIGURE SUPABASE

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
   - **Client ID**: Paste the Google Client ID from Step 1.6
     - Should look like: `123456789012-abcdefghijk.apps.googleusercontent.com`
   - **Client Secret**: Paste the Google Client Secret from Step 1.6
     - Should look like: `GOCSPX-abcdefghijklmnop`
   - **Click "Save"**

### Step 3: Configure Microsoft Provider

1. **Find "Azure" in the providers list** (this is Microsoft OAuth)
2. **Toggle it to "Enabled"** (switch should turn green)

3. **Enter Microsoft Credentials**:
   - **Client ID**: Paste the Azure Application ID from Step 2.4
     - Should look like: `12345678-1234-1234-1234-123456789abc`
   - **Client Secret**: Paste the Azure Secret Value from Step 2.5
     - Should look like: `abc123def456ghi789jkl012mno345`
   - **Click "Save"**

---

## 🧪 PART 4: TESTING THE SETUP

### Step 1: Test Google OAuth

1. **Go to your app**: http://localhost:8081/login
2. **Click "Google" button**
3. **Expected flow**:
   - Redirects to Google OAuth page
   - Shows "Smart Inventory System wants to access your Google Account"
   - Click "Continue" or "Allow"
   - Redirects back to your app dashboard
   - You should be logged in

### Step 2: Test Microsoft OAuth

1. **Go to your app**: http://localhost:8081/login
2. **Click "Microsoft" button**
3. **Expected flow**:
   - Redirects to Microsoft OAuth page
   - Shows "Smart Inventory System wants to access your Microsoft Account"
   - Click "Accept" or "Allow"
   - Redirects back to your app dashboard
   - You should be logged in

---

## 🚨 TROUBLESHOOTING

### Common Google Errors:

**"redirect_uri_mismatch"**:

- Check Step 1.5.8 - make sure redirect URI is exactly: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`

**"invalid_client"**:

- Check Client ID and Secret in Supabase match Google Cloud Console

**"access_denied"**:

- Make sure OAuth consent screen is properly configured

### Common Microsoft Errors:

**"Application not found"**:

- Check that you created the app registration in Step 2.3
- Make sure Client ID in Supabase matches Azure Application ID

**"invalid_client"**:

- Check that Client Secret in Supabase matches Azure secret value
- Make sure secret hasn't expired

**"redirect_uri_mismatch"**:

- Check redirect URI in Azure matches: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`

---

## 📝 QUICK REFERENCE

**Supabase Callback URL**: `https://qoqjtcpnlpifyshrfwet.supabase.co/auth/v1/callback`

**Google Cloud Console**: https://console.cloud.google.com/apis/credentials
**Azure Portal**: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
**Supabase Dashboard**: https://supabase.com/dashboard

**Your App URLs**:

- Development: http://localhost:8081
- Login: http://localhost:8081/login
- Dashboard: http://localhost:8081/dashboard

Follow these steps in order, and both Google and Microsoft OAuth should work perfectly!
