-- SuiDentity Database Schema
-- Execute this in your Supabase SQL editor

-- Users table to store basic user information
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Social connections table to store verified social media accounts
CREATE TABLE social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'github', 'twitter', 'linkedin', 'discord'
  username TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  profile_data JSONB, -- Store additional profile information
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Reputation scores table to store AI-calculated reputation data
CREATE TABLE reputation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 300, -- Scale from 300-850 (like credit score)
  defi_score INTEGER DEFAULT 0,
  social_score INTEGER DEFAULT 0,
  developer_score INTEGER DEFAULT 0,
  ai_analysis JSONB, -- Store OpenAI analysis and reasoning
  calculated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1 -- For tracking score updates
);

-- Identity NFTs table to track minted NFTs
CREATE TABLE identity_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nft_id TEXT UNIQUE NOT NULL,
  object_id TEXT UNIQUE NOT NULL, -- Sui object ID
  metadata_uri TEXT,
  minted_at TIMESTAMP DEFAULT NOW()
);

-- Quests table for gamification
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quest_type TEXT NOT NULL, -- 'social', 'defi', 'developer', 'community'
  xp_reward INTEGER DEFAULT 0,
  requirements JSONB, -- Criteria for completion
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User quest progress table
CREATE TABLE user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  progress JSONB, -- Track progress towards completion
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Badges table for achievements
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_type TEXT NOT NULL, -- 'social', 'defi', 'developer', 'milestone'
  image_url TEXT,
  requirements JSONB, -- Criteria for earning
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User badges table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Tips/donations table for social features
CREATE TABLE tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL, -- Amount in smallest unit (MIST for SUI)
  token_type TEXT DEFAULT 'SUI',
  transaction_hash TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data and public profiles of others
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Social connections - users can manage their own connections
CREATE POLICY "Users can view own social connections" ON social_connections
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own social connections" ON social_connections
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Reputation scores - public read, system write
CREATE POLICY "Anyone can view reputation scores" ON reputation_scores
  FOR SELECT USING (true);

-- Identity NFTs - public read, owner write
CREATE POLICY "Anyone can view identity NFTs" ON identity_nfts
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own NFTs" ON identity_nfts
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Quest progress - users can view and update their own progress
CREATE POLICY "Users can view own quest progress" ON user_quest_progress
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own quest progress" ON user_quest_progress
  FOR ALL USING (auth.uid()::text = user_id::text);

-- User badges - public read, system write
CREATE POLICY "Anyone can view user badges" ON user_badges
  FOR SELECT USING (true);

-- Tips - public read for transparency
CREATE POLICY "Anyone can view tips" ON tips
  FOR SELECT USING (true);

CREATE POLICY "Users can send tips" ON tips
  FOR INSERT WITH CHECK (auth.uid()::text = from_user_id::text);

-- Create indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX idx_social_connections_platform ON social_connections(platform);
CREATE INDEX idx_reputation_scores_user_id ON reputation_scores(user_id);
CREATE INDEX idx_identity_nfts_user_id ON identity_nfts(user_id);
CREATE INDEX idx_user_quest_progress_user_id ON user_quest_progress(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_tips_to_user_id ON tips(to_user_id);
CREATE INDEX idx_tips_from_user_id ON tips(from_user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to users table
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial quest data
INSERT INTO quests (title, description, quest_type, xp_reward, requirements) VALUES 
('First Steps', 'Complete your profile setup', 'social', 50, '{"profile_complete": true}'),
('Social Butterfly', 'Connect 3 social media accounts', 'social', 100, '{"social_connections": 3}'),
('Verified Human', 'Get your first AI reputation score', 'social', 75, '{"reputation_calculated": true}'),
('NFT Pioneer', 'Mint your first identity NFT', 'defi', 150, '{"nft_minted": true}'),
('Community Helper', 'Send your first tip to another user', 'community', 25, '{"tips_sent": 1}');

-- Insert initial badge data
INSERT INTO badges (name, description, badge_type, requirements) VALUES 
('Early Adopter', 'One of the first 100 users on SuiDentity', 'milestone', '{"user_count": 100}'),
('Social Connector', 'Connected 5+ social media accounts', 'social', '{"social_connections": 5}'),
('High Reputation', 'Achieved 700+ reputation score', 'social', '{"reputation_score": 700}'),
('NFT Collector', 'Minted 3+ identity NFTs', 'defi', '{"nfts_minted": 3}'),
('Generous Tipper', 'Sent 10+ tips to other users', 'community', '{"tips_sent": 10}');