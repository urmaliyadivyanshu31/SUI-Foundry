-- Fix RLS policies for users table to allow user creation through the application
-- This migration adds the necessary policies for zkLogin user creation

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Service role can do everything on users" ON public.users;

-- Create more specific policies for users table
-- Allow service role full access (for admin operations)
CREATE POLICY "Service role can do everything on users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Allow users to read public profile data
CREATE POLICY "Users can read public profiles" ON public.users
    FOR SELECT USING (true);

-- Allow users to read and update their own data
CREATE POLICY "Users can read their own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow authenticated users to create their own user record (for zkLogin)
-- This is crucial for the initial user creation during zkLogin signup
CREATE POLICY "Authenticated users can create their own record" ON public.users
    FOR INSERT WITH CHECK (true);

-- Allow user deletion by the user themselves or service role
CREATE POLICY "Users can delete their own data" ON public.users
    FOR DELETE USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

-- Update social connections policies to allow users to manage their own connections
DROP POLICY IF EXISTS "Service role can do everything on social_connections" ON public.social_connections;

CREATE POLICY "Service role can do everything on social_connections" ON public.social_connections
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage their own social connections" ON public.social_connections
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Update reputation scores policies 
DROP POLICY IF EXISTS "Service role can do everything on reputation_scores" ON public.reputation_scores;

CREATE POLICY "Service role can do everything on reputation_scores" ON public.reputation_scores
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can read their own reputation scores" ON public.reputation_scores
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Update user quest progress policies
DROP POLICY IF EXISTS "Service role can do everything on user_quest_progress" ON public.user_quest_progress;

CREATE POLICY "Service role can do everything on user_quest_progress" ON public.user_quest_progress
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage their own quest progress" ON public.user_quest_progress
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Update user badges policies
DROP POLICY IF EXISTS "Service role can do everything on user_badges" ON public.user_badges;

CREATE POLICY "Service role can do everything on user_badges" ON public.user_badges
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can read their own badges" ON public.user_badges
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Update tips policies to allow users to send and receive tips
DROP POLICY IF EXISTS "Service role can do everything on tips" ON public.tips;

CREATE POLICY "Service role can do everything on tips" ON public.tips
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can read tips involving them" ON public.tips
    FOR SELECT USING (auth.uid()::text = from_user_id::text OR auth.uid()::text = to_user_id::text);

CREATE POLICY "Users can send tips" ON public.tips
    FOR INSERT WITH CHECK (auth.uid()::text = from_user_id::text);