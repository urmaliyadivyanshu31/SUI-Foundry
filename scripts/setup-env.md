# SuiDentity Environment Setup Guide

## Quick Setup

1. **Copy environment template:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Configure Supabase:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings > API
   - Copy your values:
     - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project API Key)
     - `SUPABASE_SERVICE_ROLE_KEY` (Service Role Key)

3. **Set up Privy Authentication:**
   - Go to [privy.io](https://privy.io)
   - Create an app
   - Configure Sui blockchain in settings
   - Copy your:
     - `NEXT_PUBLIC_PRIVY_APP_ID`
     - `PRIVY_APP_SECRET`

4. **Run Database Migrations:**
   ```bash
   # In your Supabase SQL Editor, run:
   # /supabase/schema.sql
   ```

5. **Start Development:**
   ```bash
   npm run dev
   ```

## Troubleshooting

- **Empty error objects `{}`**: Check if environment variables are set
- **"table does not exist"**: Run the SQL schema in Supabase
- **Authentication errors**: Verify Privy configuration
- **Hydration mismatches**: These are now fixed with suppressHydrationWarning

## Optional APIs

- **OpenAI**: For AI reputation analysis
- **GitHub**: For social verification  
- **BlockVision**: For Sui blockchain indexing

## Status Check

The app will show clear error messages in the console if:
- ❌ Missing environment variables
- ❌ Database connection issues
- ❌ Table creation needed

All errors now provide actionable guidance instead of empty objects.