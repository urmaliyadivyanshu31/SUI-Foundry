import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/core/supabase'
import { JobApplicationForm } from '@/types'

// GET /api/job-applications - Get job applications (filtered by user or company)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('job_id')
    const applicantId = searchParams.get('applicant_id')
    const companyId = searchParams.get('company_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createServerSupabaseClient()

    // Get current user for authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    let query = supabase
      .from('job_applications')
      .select(`
        *,
        job:jobs(*,
          company:companies(*)
        ),
        applicant:users(*,
          reputation_scores(*),
          social_connections(*)
        )
      `)

    // Apply filters based on user permissions
    if (applicantId) {
      // Users can only see their own applications
      if (applicantId !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized access' },
          { status: 403 }
        )
      }
      query = query.eq('applicant_id', applicantId)
    } else if (companyId) {
      // Verify user owns the company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('created_by')
        .eq('id', companyId)
        .eq('created_by', user.id)
        .single()

      if (companyError || !company) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized access to company applications' },
          { status: 403 }
        )
      }
      query = query.eq('company_id', companyId)
    } else {
      // Default to user's own applications
      query = query.eq('applicant_id', user.id)
    }

    if (jobId) {
      query = query.eq('job_id', jobId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination and ordering
    query = query
      .order('ai_match_score', { ascending: false })
      .order('applied_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: applications, error, count } = await query

    if (error) {
      console.error('Error fetching job applications:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        applications,
        total_count: count || 0,
        has_more: (offset + limit) < (count || 0)
      }
    })
  } catch (error) {
    console.error('Job applications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/job-applications - Submit a new job application
export async function POST(request: NextRequest) {
  try {
    const body: JobApplicationForm & { job_id: string } = await request.json()

    // Validate required fields
    if (!body.job_id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile to check reputation
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*, reputation_scores(*)')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get job details and verify it exists and is active
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        company:companies(*),
        required_skills_details:job_skills!jobs_required_skills_fkey(*),
        preferred_skills_details:job_skills!jobs_preferred_skills_fkey(*)
      `)
      .eq('id', body.job_id)
      .eq('is_active', true)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found or no longer active' },
        { status: 404 }
      )
    }

    // Check if user meets minimum reputation requirement
    const userReputation = profile.reputation_scores?.[0]?.total_score || 300
    if (userReputation < job.min_reputation_score) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Minimum reputation score of ${job.min_reputation_score} required. Your score: ${userReputation}` 
        },
        { status: 400 }
      )
    }

    // Check if user already applied
    const { data: existingApplication } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', body.job_id)
      .eq('applicant_id', user.id)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied for this job' },
        { status: 400 }
      )
    }

    // Get user's skills to calculate match score
    const { data: userSkills } = await supabase
      .from('user_skills')
      .select('skill_id')
      .eq('user_id', user.id)

    const userSkillIds = userSkills?.map(us => us.skill_id) || []
    
    // Calculate skills match count
    const requiredSkillsMatch = job.required_skills?.filter(skillId => 
      userSkillIds.includes(skillId)
    ).length || 0
    
    const preferredSkillsMatch = job.preferred_skills?.filter(skillId => 
      userSkillIds.includes(skillId)
    ).length || 0
    
    const totalSkillsMatch = requiredSkillsMatch + (preferredSkillsMatch * 0.5) // Weight preferred skills less

    // Create the job application
    const { data: application, error: applicationError } = await supabase
      .from('job_applications')
      .insert({
        job_id: body.job_id,
        applicant_id: user.id,
        company_id: job.company_id,
        cover_letter: body.cover_letter,
        resume_url: body.resume_url,
        portfolio_url: body.portfolio_url,
        github_url: body.github_url,
        expected_salary: body.expected_salary,
        availability: body.availability,
        reputation_at_application: userReputation,
        skills_match_count: Math.round(totalSkillsMatch)
      })
      .select(`
        *,
        job:jobs(*,
          company:companies(*)
        ),
        applicant:users(*,
          reputation_scores(*),
          social_connections(*)
        )
      `)
      .single()

    if (applicationError) {
      console.error('Error creating application:', applicationError)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // Calculate AI match score using the database function
    try {
      await supabase.rpc('calculate_job_match_score', {
        p_application_id: application.id
      })
    } catch (error) {
      console.error('Error calculating match score:', error)
      // Don't fail the application if AI scoring fails
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    })
  } catch (error) {
    console.error('Job application error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}