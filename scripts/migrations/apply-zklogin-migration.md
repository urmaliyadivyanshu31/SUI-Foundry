# zkLogin Database Migration Guide

Since Docker is not available for local Supabase CLI, apply the zkLogin migration manually:

## Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/002_zklogin_support.sql`
4. Execute the migration

## Option 2: Using psql (if you have database URL)

```bash
psql "your_database_connection_string" -f supabase/migrations/002_zklogin_support.sql
```

## Option 3: Remote Supabase CLI

```bash
# Link to your remote project
supabase link --project-ref your-project-ref

# Push migrations to remote
supabase db push
```

## Migration Summary

The `002_zklogin_support.sql` migration adds:

### New User Fields:
- `zklogin_sub` - OAuth subject identifier
- `oauth_provider` - 'google' | 'github' | 'twitter'
- `salt_value` - zkLogin salt for address derivation
- `max_epoch` - Maximum epoch for key validity
- `ephemeral_public_key` - Public key for verification
- `jwt_token` - Stored JWT token
- `profile_picture` - OAuth profile picture URL

### New Tables:
- `zklogin_sessions` - Session management
- `oauth_provider_data` - OAuth provider information
- `wallet_transactions` - Real blockchain transaction history
- `user_nfts` - Real NFT ownership tracking
- `defi_interactions` - DeFi protocol interaction history
- `wallet_balances` - Real-time balance tracking

### Indexes and Policies:
- Performance indexes for zkLogin lookups
- RLS policies for data security
- Helper functions for session management

## Verification

After running the migration, verify with:

```sql
-- Check new columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name LIKE '%zklogin%';

-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('zklogin_sessions', 'wallet_transactions', 'user_nfts');
```