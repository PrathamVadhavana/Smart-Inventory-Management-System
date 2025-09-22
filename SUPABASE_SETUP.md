# Supabase Setup Guide for Smart Inventory System

This guide will walk you through setting up Supabase for your Smart Inventory System, including database creation, configuration, and data migration.

## 📋 Prerequisites

- A Supabase account (free tier available)
- Node.js and pnpm installed
- Basic understanding of databases

## 🚀 Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com](https://supabase.com)
   - Sign up or log in to your account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - **Name**: `smart-inventory-system`
     - **Database Password**: Create a strong password (save this!)
     - **Region**: Choose closest to your location
   - Click "Create new project"

3. **Wait for Setup**
   - Project creation takes 1-2 minutes
   - You'll see a progress indicator

## 🗄️ Step 2: Set Up Database Schema

1. **Go to SQL Editor**
   - In your Supabase dashboard, click "SQL Editor" in the left sidebar

2. **Create Tables**
   - Click "New Query"
   - Copy and paste the entire contents of `database/schema.sql`
   - Click "Run" to execute the SQL

3. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `products`
     - `customers` 
     - `orders`
     - `activities`

## 🔑 Step 3: Get API Keys

1. **Go to Project Settings**
   - Click the gear icon (⚙️) in the left sidebar
   - Select "API" from the settings menu

2. **Copy Your Keys**
   - **Project URL**: Copy the URL (looks like `https://xxxxx.supabase.co`)
   - **anon public key**: Copy the long key starting with `eyJ...`

## ⚙️ Step 4: Configure Environment Variables

1. **Create Environment File**
   - In your project root, create a `.env` file
   - Copy the contents from `env.example`

2. **Add Your Keys**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_APP_ENV=development
   ```

3. **Replace Placeholder Values**
   - Replace `your-project-id` with your actual project ID
   - Replace `your-anon-key-here` with your actual anon key

## 📦 Step 5: Install Dependencies

The Supabase client is already installed, but if you need to reinstall:

```bash
pnpm add @supabase/supabase-js
```

## 🔄 Step 6: Migrate Your Data

1. **Start Your Application**
   ```bash
   pnpm dev
   ```

2. **Access Migration Dialog**
   - Go to the Dashboard
   - Click "Migrate to Supabase" button
   - This will open the migration dialog

3. **Run Migration**
   - Click "Start Migration"
   - The system will:
     - Create a backup of your local data
     - Transfer products to Supabase
     - Transfer customers to Supabase
     - Transfer orders to Supabase
     - Show migration results

4. **Verify Migration**
   - Check your Supabase dashboard
   - Go to "Table Editor"
   - Verify data appears in all tables

## 🛠️ Step 7: Configure Row Level Security (Optional)

For production use, you should configure proper security:

1. **Go to Authentication**
   - In Supabase dashboard, click "Authentication"
   - Configure your preferred auth method

2. **Update RLS Policies**
   - Go to "Authentication" > "Policies"
   - Modify the policies in `database/schema.sql` based on your needs

## 🔍 Step 8: Test the Integration

1. **Add a Product**
   - Go to Inventory page
   - Add a new product
   - Check if it appears in Supabase

2. **Create a Sale**
   - Go to POS page
   - Process a sale
   - Verify order appears in Supabase

3. **Check Activities**
   - Go to Dashboard
   - Verify recent activities are logged

## 🚨 Troubleshooting

### Common Issues:

1. **"Failed to resolve import @supabase/supabase-js"**
   - Run: `pnpm add @supabase/supabase-js`
   - Restart your dev server

2. **"Invalid API key"**
   - Check your `.env` file
   - Ensure keys are copied correctly
   - No extra spaces or quotes

3. **"Table doesn't exist"**
   - Run the SQL schema again
   - Check table names match exactly

4. **Migration fails with constraint errors**
   - The updated migration handles duplicates
   - Try running migration again

5. **CORS errors**
   - Add your domain to Supabase settings
   - Go to Settings > API > CORS

### Database Connection Issues:

1. **Check Project Status**
   - Ensure project is not paused
   - Free tier projects pause after inactivity

2. **Verify Network**
   - Check internet connection
   - Try accessing Supabase dashboard

3. **Check API Limits**
   - Free tier has request limits
   - Check usage in dashboard

## 📊 Monitoring and Maintenance

### View Data:
- **Table Editor**: Browse and edit data
- **SQL Editor**: Run custom queries
- **Logs**: View API request logs

### Backup Data:
- **Database Backups**: Automatic daily backups
- **Export Data**: Use SQL Editor to export
- **Migration Tool**: Built-in backup before migration

### Performance:
- **Indexes**: Already created for optimal performance
- **Query Optimization**: Use Supabase dashboard to monitor
- **Scaling**: Upgrade plan as needed

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use different keys for dev/prod

2. **API Keys**
   - Use anon key for client-side
   - Use service role key only server-side

3. **Row Level Security**
   - Enable RLS for production
   - Create proper policies

4. **Database Access**
   - Use strong passwords
   - Enable 2FA on Supabase account

## 📈 Next Steps

1. **Customize Schema**
   - Add new fields as needed
   - Modify existing tables

2. **Add Authentication**
   - Implement user login
   - Add user-specific data

3. **Set Up Real-time**
   - Enable real-time subscriptions
   - Update UI automatically

4. **Deploy to Production**
   - Use production Supabase project
   - Configure proper security

## 🆘 Support

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Community**: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Discord**: [https://discord.supabase.com](https://discord.supabase.com)

---

## Quick Reference

### Environment Variables:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Key Files:
- `client/lib/supabase.ts` - Supabase client configuration
- `client/hooks/useSupabase.ts` - React hooks for data operations
- `client/lib/migration.ts` - Data migration utilities
- `database/schema.sql` - Database schema

### Important URLs:
- **Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
- **Project Settings**: Dashboard > Settings > API
- **Table Editor**: Dashboard > Table Editor
- **SQL Editor**: Dashboard > SQL Editor