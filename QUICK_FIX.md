# Quick Fix for Migration Constraint Error

## The Problem
You're getting this error: "there is no unique or exclusion constraint matching the ON CONFLICT specification"

This happens because your Supabase database doesn't have the unique constraints set up yet.

## Quick Solution (Choose One):

### Option 1: Run the Constraint SQL (Recommended)
1. Go to your Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Copy and paste the contents of `database/add_constraints.sql`
4. Click "Run" to execute
5. Try migration again

### Option 2: Use Simple Migration (No Database Changes Needed)
The migration dialog will now automatically retry with a simpler method if constraints fail.

### Option 3: Manual Database Setup
1. Go to Supabase Dashboard > SQL Editor
2. Run the complete `database/schema.sql` file
3. This will create all tables with proper constraints

## What Each Option Does:

**Option 1** - Adds just the missing constraints to existing tables
**Option 2** - Uses individual inserts that ignore duplicates
**Option 3** - Recreates everything from scratch (loses existing data)

## Recommended Steps:
1. Try the migration again - it should now work automatically
2. If it still fails, use Option 1 to add constraints
3. Then try migration again

The system will now handle constraint errors gracefully and retry with a different approach.

