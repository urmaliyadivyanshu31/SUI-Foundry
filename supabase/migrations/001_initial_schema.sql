-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create social_connections table
CREATE TABLE IF NOT EXISTS public.social_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('github', 'twitter', 'linkedin', 'discord')),
    username TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    profile_data JSONB,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, platform)
);

-- Create reputation_scores table
CREATE TABLE IF NOT EXISTS public.reputation_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 300 CHECK (total_score >= 300 AND total_score <= 850),
    defi_score INTEGER DEFAULT 0,
    social_score INTEGER DEFAULT 0,
    developer_score INTEGER DEFAULT 0,
    ai_analysis JSONB,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    version INTEGER DEFAULT 1,
    UNIQUE(user_id)
);

-- Create identity_nfts table
CREATE TABLE IF NOT EXISTS public.identity_nfts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    nft_id TEXT UNIQUE NOT NULL,
    object_id TEXT UNIQUE NOT NULL,
    metadata_uri TEXT,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create quests table
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    quest_type TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    requirements JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_quest_progress table
CREATE TABLE IF NOT EXISTS public.user_quest_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    progress JSONB,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, quest_id)
);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_type TEXT NOT NULL,
    image_url TEXT,
    requirements JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- Create tips table
CREATE TABLE IF NOT EXISTS public.tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(20, 9) NOT NULL CHECK (amount > 0),
    token_type TEXT DEFAULT 'SUI',
    transaction_hash TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON public.social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON public.social_connections(platform);
CREATE INDEX IF NOT EXISTS idx_reputation_scores_user_id ON public.reputation_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_scores_total_score ON public.reputation_scores(total_score);
CREATE INDEX IF NOT EXISTS idx_identity_nfts_user_id ON public.identity_nfts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_user_id ON public.user_quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_tips_from_user ON public.tips(from_user_id);
CREATE INDEX IF NOT EXISTS idx_tips_to_user ON public.tips(to_user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service role (full access)
-- Users policies
CREATE POLICY "Service role can do everything on users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Social connections policies  
CREATE POLICY "Service role can do everything on social_connections" ON public.social_connections
    FOR ALL USING (auth.role() = 'service_role');

-- Reputation scores policies
CREATE POLICY "Service role can do everything on reputation_scores" ON public.reputation_scores
    FOR ALL USING (auth.role() = 'service_role');

-- Identity NFTs policies
CREATE POLICY "Service role can do everything on identity_nfts" ON public.identity_nfts
    FOR ALL USING (auth.role() = 'service_role');

-- Quests policies (public read, service role full access)
CREATE POLICY "Anyone can read quests" ON public.quests
    FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can do everything on quests" ON public.quests
    FOR ALL USING (auth.role() = 'service_role');

-- User quest progress policies
CREATE POLICY "Service role can do everything on user_quest_progress" ON public.user_quest_progress
    FOR ALL USING (auth.role() = 'service_role');

-- Badges policies (public read, service role full access)
CREATE POLICY "Anyone can read badges" ON public.badges
    FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can do everything on badges" ON public.badges
    FOR ALL USING (auth.role() = 'service_role');

-- User badges policies
CREATE POLICY "Service role can do everything on user_badges" ON public.user_badges
    FOR ALL USING (auth.role() = 'service_role');

-- Tips policies
CREATE POLICY "Service role can do everything on tips" ON public.tips
    FOR ALL USING (auth.role() = 'service_role');

-- Insert some initial quests
INSERT INTO public.quests (title, description, quest_type, xp_reward, requirements) VALUES
    ('First Steps', 'Complete your profile setup by adding a username', 'onboarding', 50, '{"username": true}'),
    ('Social Butterfly', 'Connect at least 1 social media account', 'social', 100, '{"social_connections": 1}'),
    ('GitHub Developer', 'Connect your GitHub account and analyze your profile', 'github', 150, '{"github_connected": true, "github_analyzed": true}'),
    ('Reputation Builder', 'Achieve a reputation score of 400 or higher', 'reputation', 200, '{"min_reputation": 400}'),
    ('NFT Pioneer', 'Mint your first identity NFT', 'nft', 250, '{"identity_nft": true}')
ON CONFLICT DO NOTHING;

-- Insert some initial badges
INSERT INTO public.badges (name, description, badge_type, requirements) VALUES
    ('Early Adopter', 'One of the first 100 users to join SuiDentity', 'special', '{"user_rank": 100}'),
    ('GitHub Expert', 'Connected GitHub account with 500+ reputation score', 'github', '{"github_reputation": 500}'),
    ('Social Connector', 'Connected 3 or more social accounts', 'social', '{"social_connections": 3}'),
    ('Reputation Master', 'Achieved maximum reputation score of 850', 'reputation', '{"reputation_score": 850}'),
    ('NFT Collector', 'Minted 5 or more identity NFTs', 'nft', '{"nft_count": 5}')
ON CONFLICT DO NOTHING;