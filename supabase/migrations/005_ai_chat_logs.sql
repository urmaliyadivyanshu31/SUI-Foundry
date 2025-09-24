-- AI Chat Logs Table
-- For tracking AI conversations and analytics

CREATE TABLE IF NOT EXISTS public.ai_chat_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context TEXT DEFAULT 'general',
    user_reputation_at_time INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_user_id ON public.ai_chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_created_at ON public.ai_chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_context ON public.ai_chat_logs(context);

-- Enable Row Level Security
ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read their own chat logs" ON public.ai_chat_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own chat logs" ON public.ai_chat_logs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can do everything on ai_chat_logs" ON public.ai_chat_logs
    FOR ALL USING (auth.role() = 'service_role');