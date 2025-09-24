-- Job Board System Tables
-- Adding comprehensive job posting and application system

-- Create companies table (for HR/founders posting jobs)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
    industry TEXT,
    location TEXT,
    wallet_address TEXT, -- For receiving applications and payments
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create job_skills table (predefined skills for matching)
CREATE TABLE IF NOT EXISTS public.job_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('blockchain', 'programming', 'design', 'marketing', 'business', 'other')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
    experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
    location_type TEXT NOT NULL CHECK (location_type IN ('remote', 'on-site', 'hybrid')),
    location TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    min_reputation_score INTEGER DEFAULT 300,
    required_skills UUID[] DEFAULT '{}', -- Array of skill IDs
    preferred_skills UUID[] DEFAULT '{}', -- Array of skill IDs
    benefits TEXT[],
    application_deadline TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false, -- For premium job posts
    remote_friendly BOOLEAN DEFAULT false,
    equity_offered BOOLEAN DEFAULT false,
    crypto_payment BOOLEAN DEFAULT false,
    sui_payment BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'interviewed', 'rejected', 'hired')),
    cover_letter TEXT,
    resume_url TEXT,
    portfolio_url TEXT,
    github_url TEXT,
    expected_salary INTEGER,
    availability TEXT,
    ai_match_score INTEGER DEFAULT 0, -- AI calculated match score 0-100
    reputation_at_application INTEGER DEFAULT 0, -- User's reputation when they applied
    skills_match_count INTEGER DEFAULT 0, -- Number of matching skills
    hr_rating INTEGER CHECK (hr_rating >= 1 AND hr_rating <= 5), -- HR rating after review
    hr_notes TEXT,
    interview_scheduled_at TIMESTAMP WITH TIME ZONE,
    response_deadline TIMESTAMP WITH TIME ZONE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(job_id, applicant_id) -- Prevent duplicate applications
);

-- Create user_skills table (linking users to their skills)
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.job_skills(id) ON DELETE CASCADE,
    proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    verified BOOLEAN DEFAULT false, -- Verified through GitHub analysis, etc.
    verification_source TEXT, -- 'github', 'portfolio', 'self-reported'
    years_experience INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, skill_id)
);

-- Create job_views table (for analytics)
CREATE TABLE IF NOT EXISTS public.job_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL for anonymous views
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address TEXT,
    user_agent TEXT
);

-- Create job_saved table (users can save jobs)
CREATE TABLE IF NOT EXISTS public.job_saved (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(job_id, user_id)
);

-- Create interview_schedules table
CREATE TABLE IF NOT EXISTS public.interview_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
    scheduled_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    interview_type TEXT NOT NULL CHECK (interview_type IN ('phone', 'video', 'in-person', 'technical')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    location TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON public.companies(verified);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON public.jobs(featured);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_min_reputation ON public.jobs(min_reputation_score);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON public.job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_company_id ON public.job_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_ai_match_score ON public.job_applications(ai_match_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_reputation ON public.job_applications(reputation_at_application DESC);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_verified ON public.user_skills(verified);
CREATE INDEX IF NOT EXISTS idx_job_views_job_id ON public.job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_user_id ON public.job_views(user_id);
CREATE INDEX IF NOT EXISTS idx_job_saved_user_id ON public.job_saved(user_id);

-- Create updated_at trigger for companies
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for jobs
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for job_applications
CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for interview_schedules
CREATE TRIGGER update_interview_schedules_updated_at
    BEFORE UPDATE ON public.interview_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_saved ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Companies policies
CREATE POLICY "Users can read all companies" ON public.companies
    FOR SELECT USING (true);
CREATE POLICY "Users can create companies" ON public.companies
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);
CREATE POLICY "Company creators can update their companies" ON public.companies
    FOR UPDATE USING (auth.uid()::text = created_by::text);
CREATE POLICY "Service role can do everything on companies" ON public.companies
    FOR ALL USING (auth.role() = 'service_role');

-- Job skills policies (public read)
CREATE POLICY "Anyone can read job skills" ON public.job_skills
    FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can do everything on job_skills" ON public.job_skills
    FOR ALL USING (auth.role() = 'service_role');

-- Jobs policies
CREATE POLICY "Users can read active jobs" ON public.jobs
    FOR SELECT USING (is_active = true);
CREATE POLICY "Company creators can create jobs" ON public.jobs
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.companies 
        WHERE companies.id = jobs.company_id 
        AND companies.created_by::text = auth.uid()::text
    ));
CREATE POLICY "Company creators can update their jobs" ON public.jobs
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.companies 
        WHERE companies.id = jobs.company_id 
        AND companies.created_by::text = auth.uid()::text
    ));
CREATE POLICY "Service role can do everything on jobs" ON public.jobs
    FOR ALL USING (auth.role() = 'service_role');

-- Job applications policies
CREATE POLICY "Users can read their own applications" ON public.job_applications
    FOR SELECT USING (auth.uid()::text = applicant_id::text);
CREATE POLICY "Company creators can read applications to their jobs" ON public.job_applications
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.companies 
        WHERE companies.id = job_applications.company_id 
        AND companies.created_by::text = auth.uid()::text
    ));
CREATE POLICY "Users can create applications" ON public.job_applications
    FOR INSERT WITH CHECK (auth.uid()::text = applicant_id::text);
CREATE POLICY "Users can update their own applications" ON public.job_applications
    FOR UPDATE USING (auth.uid()::text = applicant_id::text);
CREATE POLICY "Company creators can update applications to their jobs" ON public.job_applications
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.companies 
        WHERE companies.id = job_applications.company_id 
        AND companies.created_by::text = auth.uid()::text
    ));
CREATE POLICY "Service role can do everything on job_applications" ON public.job_applications
    FOR ALL USING (auth.role() = 'service_role');

-- User skills policies
CREATE POLICY "Users can read their own skills" ON public.user_skills
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Anyone can read verified skills" ON public.user_skills
    FOR SELECT USING (verified = true);
CREATE POLICY "Users can manage their own skills" ON public.user_skills
    FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can do everything on user_skills" ON public.user_skills
    FOR ALL USING (auth.role() = 'service_role');

-- Job views policies
CREATE POLICY "Anyone can create job views" ON public.job_views
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read their own job views" ON public.job_views
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can do everything on job_views" ON public.job_views
    FOR ALL USING (auth.role() = 'service_role');

-- Job saved policies
CREATE POLICY "Users can manage their saved jobs" ON public.job_saved
    FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can do everything on job_saved" ON public.job_saved
    FOR ALL USING (auth.role() = 'service_role');

-- Interview schedules policies
CREATE POLICY "Applicants can read their interview schedules" ON public.interview_schedules
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.job_applications 
        WHERE job_applications.id = interview_schedules.application_id 
        AND job_applications.applicant_id::text = auth.uid()::text
    ));
CREATE POLICY "Company creators can manage interview schedules" ON public.interview_schedules
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.job_applications ja
        JOIN public.companies c ON ja.company_id = c.id
        WHERE ja.id = interview_schedules.application_id 
        AND c.created_by::text = auth.uid()::text
    ));
CREATE POLICY "Service role can do everything on interview_schedules" ON public.interview_schedules
    FOR ALL USING (auth.role() = 'service_role');

-- Insert initial job skills
INSERT INTO public.job_skills (name, category, description) VALUES
    -- Blockchain skills
    ('Move', 'blockchain', 'Sui Move smart contract programming language'),
    ('Solidity', 'blockchain', 'Ethereum smart contract programming'),
    ('Rust', 'blockchain', 'Systems programming language popular in blockchain'),
    ('Web3.js', 'blockchain', 'JavaScript library for blockchain interaction'),
    ('Smart Contracts', 'blockchain', 'Decentralized application contract development'),
    ('DeFi', 'blockchain', 'Decentralized Finance protocol development'),
    ('NFT Development', 'blockchain', 'Non-fungible token creation and management'),
    ('Blockchain Architecture', 'blockchain', 'Design and architecture of blockchain systems'),
    
    -- Programming skills
    ('JavaScript', 'programming', 'Popular web programming language'),
    ('TypeScript', 'programming', 'Typed superset of JavaScript'),
    ('Python', 'programming', 'Versatile programming language'),
    ('React', 'programming', 'Frontend JavaScript library'),
    ('Next.js', 'programming', 'React framework for production'),
    ('Node.js', 'programming', 'JavaScript runtime for backend'),
    ('Go', 'programming', 'Google programming language'),
    ('Java', 'programming', 'Enterprise programming language'),
    ('C++', 'programming', 'Systems programming language'),
    ('SQL', 'programming', 'Database query language'),
    
    -- Design skills
    ('UI/UX Design', 'design', 'User interface and experience design'),
    ('Figma', 'design', 'Design and prototyping tool'),
    ('Adobe Creative Suite', 'design', 'Professional design software suite'),
    ('Graphic Design', 'design', 'Visual communication and design'),
    ('Brand Design', 'design', 'Brand identity and visual design'),
    ('Motion Graphics', 'design', 'Animated visual design'),
    
    -- Marketing skills
    ('Digital Marketing', 'marketing', 'Online marketing and promotion'),
    ('Content Marketing', 'marketing', 'Content creation and strategy'),
    ('Social Media Marketing', 'marketing', 'Social media promotion and engagement'),
    ('SEO', 'marketing', 'Search engine optimization'),
    ('Community Management', 'marketing', 'Online community building and management'),
    ('Growth Hacking', 'marketing', 'Rapid growth strategies'),
    
    -- Business skills
    ('Product Management', 'business', 'Product strategy and development'),
    ('Project Management', 'business', 'Project planning and execution'),
    ('Business Development', 'business', 'Partnership and growth strategies'),
    ('Strategy', 'business', 'Business strategy and planning'),
    ('Analytics', 'business', 'Data analysis and insights'),
    ('Leadership', 'business', 'Team and organizational leadership')
ON CONFLICT (name) DO NOTHING;

-- Functions for job matching and AI scoring

-- Function to calculate AI match score for job application
CREATE OR REPLACE FUNCTION calculate_job_match_score(
    p_application_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_match_score INTEGER := 0;
    v_reputation_score INTEGER;
    v_skills_match INTEGER;
    v_experience_match INTEGER;
    v_total_score INTEGER;
BEGIN
    -- Get application details with job requirements
    SELECT 
        ja.reputation_at_application,
        ja.skills_match_count,
        CASE 
            WHEN j.experience_level = 'entry' THEN 20
            WHEN j.experience_level = 'mid' THEN 40  
            WHEN j.experience_level = 'senior' THEN 60
            WHEN j.experience_level = 'lead' THEN 80
            WHEN j.experience_level = 'executive' THEN 90
            ELSE 0
        END as exp_requirement
    INTO v_reputation_score, v_skills_match, v_experience_match
    FROM public.job_applications ja
    JOIN public.jobs j ON ja.job_id = j.id
    WHERE ja.id = p_application_id;

    -- Calculate weighted score (0-100)
    -- Reputation: 40% weight
    v_match_score := v_match_score + LEAST(40, (v_reputation_score - 300) * 40 / 550);
    
    -- Skills match: 35% weight  
    v_match_score := v_match_score + LEAST(35, v_skills_match * 7);
    
    -- Experience compatibility: 25% weight
    v_match_score := v_match_score + LEAST(25, v_experience_match * 25 / 100);

    -- Ensure score is between 0-100
    v_total_score := GREATEST(0, LEAST(100, v_match_score));

    -- Update the application with calculated score
    UPDATE public.job_applications 
    SET ai_match_score = v_total_score
    WHERE id = p_application_id;

    RETURN v_total_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update job application count
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.jobs 
        SET application_count = application_count + 1
        WHERE id = NEW.job_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.jobs 
        SET application_count = application_count - 1
        WHERE id = OLD.job_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update application count
CREATE TRIGGER job_application_count_trigger
    AFTER INSERT OR DELETE ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_job_application_count();

-- Function to update job view count
CREATE OR REPLACE FUNCTION update_job_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.jobs 
    SET view_count = view_count + 1
    WHERE id = NEW.job_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update view count
CREATE TRIGGER job_view_count_trigger
    AFTER INSERT ON public.job_views
    FOR EACH ROW
    EXECUTE FUNCTION update_job_view_count();