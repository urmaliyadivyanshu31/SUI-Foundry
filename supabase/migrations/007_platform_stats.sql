-- Platform statistics function for leaderboard
CREATE OR REPLACE FUNCTION get_platform_statistics()
RETURNS TABLE(
    total_users BIGINT,
    total_reputation_calculated BIGINT,
    average_score NUMERIC,
    top_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.users WHERE username IS NOT NULL) as total_users,
        (SELECT COUNT(*) FROM public.reputation_scores) as total_reputation_calculated,
        COALESCE(AVG(rs.total_score), 300) as average_score,
        COALESCE(MAX(rs.total_score), 300) as top_score
    FROM public.reputation_scores rs;
END;
$$ LANGUAGE plpgsql;

-- Create index for better leaderboard performance
CREATE INDEX IF NOT EXISTS idx_reputation_scores_total_score_desc ON public.reputation_scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_scores_user_calculated ON public.reputation_scores(user_id, calculated_at DESC);

-- Function to get user's current rank
CREATE OR REPLACE FUNCTION get_user_rank(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_score INTEGER;
    user_rank INTEGER;
BEGIN
    -- Get user's current score
    SELECT rs.total_score INTO user_score
    FROM public.reputation_scores rs
    WHERE rs.user_id = target_user_id
    ORDER BY rs.calculated_at DESC
    LIMIT 1;

    -- If no score found, return null
    IF user_score IS NULL THEN
        RETURN NULL;
    END IF;

    -- Count users with higher scores
    SELECT COUNT(*) + 1 INTO user_rank
    FROM public.users u
    JOIN public.reputation_scores rs ON u.id = rs.user_id
    WHERE u.username IS NOT NULL
    AND rs.total_score > user_score;

    RETURN user_rank;
END;
$$ LANGUAGE plpgsql;

-- Function to get leaderboard with better performance
CREATE OR REPLACE FUNCTION get_leaderboard_optimized(
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
    score_category TEXT DEFAULT 'total'
)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    wallet_address TEXT,
    profile_picture TEXT,
    reputation_score INTEGER,
    defi_score INTEGER,
    social_score INTEGER,
    developer_score INTEGER,
    rank_position INTEGER,
    social_connections_count BIGINT,
    total_tips_sent NUMERIC,
    total_tips_received NUMERIC
) AS $$
DECLARE
    score_column TEXT;
BEGIN
    -- Determine which score column to use for ranking
    CASE score_category
        WHEN 'defi' THEN score_column := 'defi_score';
        WHEN 'social' THEN score_column := 'social_score';
        WHEN 'developer' THEN score_column := 'developer_score';
        ELSE score_column := 'total_score';
    END CASE;

    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username,
        u.wallet_address,
        u.profile_picture,
        rs.total_score as reputation_score,
        rs.defi_score,
        rs.social_score,
        rs.developer_score,
        (ROW_NUMBER() OVER (ORDER BY 
            CASE 
                WHEN score_category = 'defi' THEN rs.defi_score
                WHEN score_category = 'social' THEN rs.social_score
                WHEN score_category = 'developer' THEN rs.developer_score
                ELSE rs.total_score
            END DESC
        ) + offset_count)::INTEGER as rank_position,
        COALESCE(sc_count.count, 0) as social_connections_count,
        COALESCE(tips_sent.total, 0) as total_tips_sent,
        COALESCE(tips_received.total, 0) as total_tips_received
    FROM public.users u
    JOIN public.reputation_scores rs ON u.id = rs.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as count
        FROM public.social_connections
        WHERE verified = true
        GROUP BY user_id
    ) sc_count ON u.id = sc_count.user_id
    LEFT JOIN (
        SELECT from_user_id, SUM(amount) as total
        FROM public.tips
        GROUP BY from_user_id
    ) tips_sent ON u.id = tips_sent.from_user_id
    LEFT JOIN (
        SELECT to_user_id, SUM(amount) as total
        FROM public.tips
        GROUP BY to_user_id
    ) tips_received ON u.id = tips_received.to_user_id
    WHERE u.username IS NOT NULL
    ORDER BY 
        CASE 
            WHEN score_category = 'defi' THEN rs.defi_score
            WHEN score_category = 'social' THEN rs.social_score
            WHEN score_category = 'developer' THEN rs.developer_score
            ELSE rs.total_score
        END DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;