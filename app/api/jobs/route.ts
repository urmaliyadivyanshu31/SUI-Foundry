import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/core/supabase'
import { JobPostForm, JobWithDetails } from '@/types'

// GET /api/jobs - Get jobs with filtering and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const jobType = searchParams.getAll('job_type')
    const experienceLevel = searchParams.getAll('experience_level')
    const locationType = searchParams.getAll('location_type')
    const skills = searchParams.getAll('skills')
    const salaryMin = searchParams.get('salary_min')
    const salaryMax = searchParams.get('salary_max')
    const remoteFriendly = searchParams.get('remote_friendly') === 'true'
    const cryptoPayment = searchParams.get('crypto_payment') === 'true'
    const suiPayment = searchParams.get('sui_payment') === 'true'
    const featuredOnly = searchParams.get('featured_only') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createServerSupabaseClient()

    // Start building the query
    let query = supabase
      .from('jobs')
      .select(`
        *,
        company:companies(*),
        required_skills_details:job_skills!jobs_required_skills_fkey(*),
        preferred_skills_details:job_skills!jobs_preferred_skills_fkey(*)
      `)
      .eq('is_active', true)

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,requirements.ilike.%${search}%`)
    }

    if (jobType.length > 0) {
      query = query.in('job_type', jobType)
    }

    if (experienceLevel.length > 0) {
      query = query.in('experience_level', experienceLevel)
    }

    if (locationType.length > 0) {
      query = query.in('location_type', locationType)
    }

    if (salaryMin) {
      query = query.gte('salary_min', parseInt(salaryMin))
    }

    if (salaryMax) {
      query = query.lte('salary_max', parseInt(salaryMax))
    }

    if (remoteFriendly) {
      query = query.eq('remote_friendly', true)
    }

    if (cryptoPayment) {
      query = query.eq('crypto_payment', true)
    }

    if (suiPayment) {
      query = query.eq('sui_payment', true)
    }

    if (featuredOnly) {
      query = query.eq('featured', true)
    }

    // Apply pagination and ordering
    query = query
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: jobs, error, count } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobs as JobWithDetails[],
        total_count: count || 0,
        has_more: (offset + limit) < (count || 0),
        filters_applied: {
          search,
          job_type: jobType,
          experience_level: experienceLevel,
          location_type: locationType,
          skills,
          salary_min: salaryMin ? parseInt(salaryMin) : undefined,
          salary_max: salaryMax ? parseInt(salaryMax) : undefined,
          remote_friendly: remoteFriendly,
          crypto_payment: cryptoPayment,
          sui_payment: suiPayment,
          featured_only: featuredOnly
        }
      }
    })
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Create a new job posting
export async function POST(request: NextRequest) {
  try {
    const body: JobPostForm & { company_id: string } = await request.json()

    // Validate required fields
    if (!body.title || !body.description || !body.requirements || !body.company_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    // Verify user owns the company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, created_by')
      .eq('id', body.company_id)
      .eq('created_by', user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, error: 'Company not found or unauthorized' },
        { status: 403 }
      )
    }

    // Create the job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        company_id: body.company_id,
        title: body.title,
        description: body.description,
        requirements: body.requirements,
        job_type: body.job_type,
        experience_level: body.experience_level,
        location_type: body.location_type,
        location: body.location,
        salary_min: body.salary_min,
        salary_max: body.salary_max,
        salary_currency: body.salary_currency,
        min_reputation_score: body.min_reputation_score,
        required_skills: body.required_skills,
        preferred_skills: body.preferred_skills,
        benefits: body.benefits,
        application_deadline: body.application_deadline,
        remote_friendly: body.remote_friendly,
        equity_offered: body.equity_offered,
        crypto_payment: body.crypto_payment,
        sui_payment: body.sui_payment
      } as any)
      .select(`
        *,
        company:companies(*),
        required_skills_details:job_skills!jobs_required_skills_fkey(*),
        preferred_skills_details:job_skills!jobs_preferred_skills_fkey(*)
      `)
      .single()

    if (jobError) {
      console.error('Error creating job:', jobError)
      return NextResponse.json(
        { success: false, error: 'Failed to create job' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: job,
      message: 'Job created successfully'
    })
  } catch (error) {
    console.error('Job creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}