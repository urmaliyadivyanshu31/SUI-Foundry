-- Functions for tip calculations and statistics

-- Function to get user tip totals
CREATE OR REPLACE FUNCTION get_user_tip_totals(user_id UUID)
RETURNS TABLE(
    total_sent NUMERIC,
    total_received NUMERIC,
    tips_sent_count BIGINT,
    tips_received_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(sent.total_sent, 0) as total_sent,
        COALESCE(received.total_received, 0) as total_received,
        COALESCE(sent.tips_sent_count, 0) as tips_sent_count,
        COALESCE(received.tips_received_count, 0) as tips_received_count
    FROM 
        (SELECT 1) as dummy
    LEFT JOIN (
        SELECT 
            SUM(amount) as total_sent,
            COUNT(*) as tips_sent_count
        FROM public.tips 
        WHERE from_user_id = user_id
    ) as sent ON true
    LEFT JOIN (
        SELECT 
            SUM(amount) as total_received,
            COUNT(*) as tips_received_count
        FROM public.tips 
        WHERE to_user_id = user_id
    ) as received ON true;
END;
$$ LANGUAGE plpgsql;

-- Function to get top tippers (users who send the most tips)
CREATE OR REPLACE FUNCTION get_top_tippers(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    profile_picture TEXT,
    total_sent NUMERIC,
    tips_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username,
        u.profile_picture,
        SUM(t.amount) as total_sent,
        COUNT(t.*) as tips_count
    FROM public.tips t
    JOIN public.users u ON t.from_user_id = u.id
    GROUP BY u.id, u.username, u.profile_picture
    ORDER BY total_sent DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get top recipients (users who receive the most tips)
CREATE OR REPLACE FUNCTION get_top_recipients(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    profile_picture TEXT,
    total_received NUMERIC,
    tips_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username,
        u.profile_picture,
        SUM(t.amount) as total_received,
        COUNT(t.*) as tips_count
    FROM public.tips t
    JOIN public.users u ON t.to_user_id = u.id
    GROUP BY u.id, u.username, u.profile_picture
    ORDER BY total_received DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent tips (public activity feed)
CREATE OR REPLACE FUNCTION get_recent_tips_feed(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
    id UUID,
    amount NUMERIC,
    token_type TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    from_username TEXT,
    to_username TEXT,
    from_profile_picture TEXT,
    to_profile_picture TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.amount,
        t.token_type,
        t.message,
        t.created_at,
        from_user.username as from_username,
        to_user.username as to_username,
        from_user.profile_picture as from_profile_picture,
        to_user.profile_picture as to_profile_picture
    FROM public.tips t
    JOIN public.users from_user ON t.from_user_id = from_user.id
    JOIN public.users to_user ON t.to_user_id = to_user.id
    ORDER BY t.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Notifications table (if not already exists)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('quest_completed', 'badge_earned', 'tip_received', 'reputation_updated', 'job_application_update')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Enable Row Level Security for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can read their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can do everything on notifications" ON public.notifications
    FOR ALL USING (auth.role() = 'service_role');