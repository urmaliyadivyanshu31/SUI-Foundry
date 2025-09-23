-- Add zkLogin support to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS zklogin_sub TEXT,
ADD COLUMN IF NOT EXISTS oauth_provider TEXT CHECK (oauth_provider IN ('google', 'github', 'twitter')),
ADD COLUMN IF NOT EXISTS salt_value TEXT,
ADD COLUMN IF NOT EXISTS max_epoch INTEGER,
ADD COLUMN IF NOT EXISTS ephemeral_public_key TEXT,
ADD COLUMN IF NOT EXISTS jwt_token TEXT,
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Create index for zkLogin lookups
CREATE INDEX IF NOT EXISTS idx_users_zklogin_sub ON public.users(zklogin_sub);
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON public.users(oauth_provider);
CREATE INDEX IF NOT EXISTS idx_users_salt_value ON public.users(salt_value);

-- Create table for storing user sessions (zkLogin specific)
CREATE TABLE IF NOT EXISTS public.zklogin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    ephemeral_private_key_encrypted TEXT NOT NULL,
    max_epoch INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for session management
CREATE INDEX IF NOT EXISTS idx_zklogin_sessions_user_id ON public.zklogin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_zklogin_sessions_token ON public.zklogin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_zklogin_sessions_expires ON public.zklogin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_zklogin_sessions_active ON public.zklogin_sessions(is_active);

-- Create table for tracking OAuth provider data
CREATE TABLE IF NOT EXISTS public.oauth_provider_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'github', 'twitter')),
    provider_user_id TEXT NOT NULL,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    scope TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    provider_data JSONB, -- Store additional provider-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, provider),
    UNIQUE(provider, provider_user_id)
);

-- Create indexes for OAuth data
CREATE INDEX IF NOT EXISTS idx_oauth_data_user_id ON public.oauth_provider_data(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_data_provider ON public.oauth_provider_data(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_data_provider_user_id ON public.oauth_provider_data(provider_user_id);

-- Create table for wallet transaction history (real blockchain data)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_digest TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- 'sent', 'received', 'contract_call', 'nft_mint', etc.
    amount NUMERIC(20, 9), -- SUI amount in MIST (supports up to billions of SUI with nano precision)
    token_type TEXT DEFAULT 'SUI',
    from_address TEXT,
    to_address TEXT,
    gas_used NUMERIC(20, 9),
    gas_price NUMERIC(20, 9),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    block_number BIGINT,
    timestamp_ms BIGINT NOT NULL,
    sui_timestamp TIMESTAMP WITH TIME ZONE,
    events JSONB, -- Store transaction events
    raw_data JSONB, -- Store complete transaction data
    indexed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for transaction queries
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_digest ON public.wallet_transactions(transaction_digest);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_timestamp ON public.wallet_transactions(sui_timestamp);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_from_address ON public.wallet_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_to_address ON public.wallet_transactions(to_address);

-- Create table for tracking user's NFT ownership (real blockchain data)
CREATE TABLE IF NOT EXISTS public.user_nfts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    object_id TEXT NOT NULL,
    collection_name TEXT,
    nft_name TEXT,
    description TEXT,
    image_url TEXT,
    creator_address TEXT,
    owner_address TEXT NOT NULL,
    nft_type TEXT,
    attributes JSONB,
    rarity_score NUMERIC(10, 4),
    floor_price NUMERIC(20, 9),
    last_sale_price NUMERIC(20, 9),
    acquired_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_owned BOOLEAN DEFAULT true,
    UNIQUE(object_id)
);

-- Create indexes for NFT queries
CREATE INDEX IF NOT EXISTS idx_user_nfts_user_id ON public.user_nfts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_nfts_object_id ON public.user_nfts(object_id);
CREATE INDEX IF NOT EXISTS idx_user_nfts_collection ON public.user_nfts(collection_name);
CREATE INDEX IF NOT EXISTS idx_user_nfts_owner ON public.user_nfts(owner_address);
CREATE INDEX IF NOT EXISTS idx_user_nfts_owned ON public.user_nfts(is_owned);

-- Create table for DeFi protocol interactions (real blockchain data)
CREATE TABLE IF NOT EXISTS public.defi_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    protocol_name TEXT NOT NULL, -- 'Sui Swap', 'Cetus', 'Turbos', etc.
    protocol_address TEXT NOT NULL,
    interaction_type TEXT NOT NULL, -- 'swap', 'liquidity_add', 'liquidity_remove', 'stake', 'unstake', etc.
    transaction_digest TEXT NOT NULL,
    input_tokens JSONB, -- [{"type": "0x2::sui::SUI", "amount": "1000000000"}]
    output_tokens JSONB,
    pool_address TEXT,
    fees_paid NUMERIC(20, 9),
    volume_usd NUMERIC(15, 4),
    timestamp_ms BIGINT NOT NULL,
    sui_timestamp TIMESTAMP WITH TIME ZONE,
    indexed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for DeFi queries
CREATE INDEX IF NOT EXISTS idx_defi_interactions_user_id ON public.defi_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_defi_interactions_protocol ON public.defi_interactions(protocol_name);
CREATE INDEX IF NOT EXISTS idx_defi_interactions_type ON public.defi_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_defi_interactions_timestamp ON public.defi_interactions(sui_timestamp);
CREATE INDEX IF NOT EXISTS idx_defi_interactions_digest ON public.defi_interactions(transaction_digest);

-- Create table for real-time balance tracking
CREATE TABLE IF NOT EXISTS public.wallet_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    token_type TEXT NOT NULL, -- '0x2::sui::SUI', '0x123::usdc::USDC', etc.
    token_symbol TEXT NOT NULL, -- 'SUI', 'USDC', etc.
    balance NUMERIC(30, 9) NOT NULL, -- Large precision for various token decimals
    balance_usd NUMERIC(15, 4),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, token_type)
);

-- Create indexes for balance queries
CREATE INDEX IF NOT EXISTS idx_wallet_balances_user_id ON public.wallet_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_balances_address ON public.wallet_balances(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_balances_token ON public.wallet_balances(token_type);
CREATE INDEX IF NOT EXISTS idx_wallet_balances_updated ON public.wallet_balances(last_updated);

-- Update trigger for oauth_provider_data
CREATE TRIGGER update_oauth_provider_data_updated_at
    BEFORE UPDATE ON public.oauth_provider_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE public.zklogin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_provider_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defi_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
-- zkLogin sessions policies
CREATE POLICY "Users can read their own sessions" ON public.zklogin_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can do everything on sessions" ON public.zklogin_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- OAuth provider data policies
CREATE POLICY "Users can read their own OAuth data" ON public.oauth_provider_data
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can do everything on OAuth data" ON public.oauth_provider_data
    FOR ALL USING (auth.role() = 'service_role');

-- Wallet transactions policies
CREATE POLICY "Users can read their own transactions" ON public.wallet_transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can do everything on transactions" ON public.wallet_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- User NFTs policies
CREATE POLICY "Users can read their own NFTs" ON public.user_nfts
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can do everything on NFTs" ON public.user_nfts
    FOR ALL USING (auth.role() = 'service_role');

-- DeFi interactions policies
CREATE POLICY "Users can read their own DeFi data" ON public.defi_interactions
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can do everything on DeFi data" ON public.defi_interactions
    FOR ALL USING (auth.role() = 'service_role');

-- Wallet balances policies
CREATE POLICY "Users can read their own balances" ON public.wallet_balances
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can do everything on balances" ON public.wallet_balances
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.zklogin_sessions 
    WHERE expires_at < timezone('utc'::text, now());
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance(
    p_user_id UUID,
    p_wallet_address TEXT,
    p_token_type TEXT,
    p_token_symbol TEXT,
    p_balance NUMERIC,
    p_balance_usd NUMERIC DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.wallet_balances (
        user_id, wallet_address, token_type, token_symbol, balance, balance_usd
    ) VALUES (
        p_user_id, p_wallet_address, p_token_type, p_token_symbol, p_balance, p_balance_usd
    )
    ON CONFLICT (user_id, token_type) 
    DO UPDATE SET
        balance = EXCLUDED.balance,
        balance_usd = EXCLUDED.balance_usd,
        last_updated = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql;