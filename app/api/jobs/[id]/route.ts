import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/core/supabase'

// GET /api/jobs/[id] - Get specific job with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createServerSupabaseClient()

    // Get job with all related data
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        company:companies(*),
        required_skills_details:job_skills!jobs_required_skills_fkey(*),
        preferred_skills_details:job_skills!jobs_preferred_skills_fkey(*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Increment view count
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    // Record the view
    if (userId) {
      await supabase
        .from('job_views')
        .insert({
          job_id: id,
          user_id: userId,
          ip_address: request.ip || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
        .select()
        .single()
    }

    // Check if user has applied (if user_id provided)
    let userApplied = false
    let userSaved = false
    
    if (userId) {
      const [applicationResult, savedResult] = await Promise.all([
        supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', id)
          .eq('applicant_id', userId)
          .single(),
        supabase
          .from('job_saved')
          .select('id')
          .eq('job_id', id)
          .eq('user_id', userId)
          .single()
      ])
      
      userApplied = !!applicationResult.data
      userSaved = !!savedResult.data
    }

    return NextResponse.json({
      success: true,
      data: {
        ...job,
        user_applied: userApplied,
        user_saved: userSaved
      }
    })
  } catch (error) {
    console.error('Get job error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/jobs/[id] - Update job (for company owners)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const supabase = await createServerSupabaseClient()

    // Get current user for authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get job with company info to check ownership
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if user owns the company
    if (job.company.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - only company owners can update jobs' },
        { status: 403 }
      )
    }

    // Prepare update data - filter allowed fields
    const allowedFields = [
      'title', 'description', 'requirements', 'job_type', 'experience_level',
      'location_type', 'location', 'salary_min', 'salary_max', 'salary_currency',
      'min_reputation_score', 'required_skills', 'preferred_skills', 'benefits',
      'application_deadline', 'is_active', 'remote_friendly', 'equity_offered',
      'crypto_payment', 'sui_payment', 'featured'
    ]

    const updates: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      )
    }

    // Update the job
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        company:companies(*),
        required_skills_details:job_skills!jobs_required_skills_fkey(*),
        preferred_skills_details:job_skills!jobs_preferred_skills_fkey(*)
      `)
      .single()

    if (updateError) {
      console.error('Error updating job:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update job' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    })
  } catch (error) {
    console.error('Update job error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/jobs/[id] - Delete job (for company owners)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createServerSupabaseClient()

    // Get current user for authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get job with company info to check ownership
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if user owns the company
    if (job.company.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - only company owners can delete jobs' },
        { status: 403 }
      )
    }

    // Soft delete - just mark as inactive
    const { data: deletedJob, error: deleteError } = await supabase
      .from('jobs')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()

    if (deleteError) {
      console.error('Error deleting job:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete job' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    })
  } catch (error) {
    console.error('Delete job error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}