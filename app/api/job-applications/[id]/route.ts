import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/core/supabase'

// GET /api/job-applications/[id] - Get specific job application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const supabase = await createServerSupabaseClient()

    // Get current user for authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: application, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:jobs(*,
          company:companies(*)
        ),
        applicant:users(*,
          reputation_scores(*),
          social_connections(*),
          user_skills(*, skill:job_skills(*))
        ),
        interview_schedules(*)
      `)
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check authorization - user can view their own application or HR can view applications to their jobs
    const isApplicant = application.applicant_id === user.id
    const isCompanyOwner = application.job.company.created_by === user.id

    if (!isApplicant && !isCompanyOwner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: application
    })
  } catch (error) {
    console.error('Get job application error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/job-applications/[id] - Update job application (for HR)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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

    // Get application with job and company info
    const { data: application, error: fetchError } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:jobs(*,
          company:companies(*)
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if user owns the company (only HR can update applications)
    if (application.job.company.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - only company owners can update applications' },
        { status: 403 }
      )
    }

    // Prepare update data - only allow certain fields
    const allowedUpdates: any = {}
    
    if (body.status && ['pending', 'reviewed', 'shortlisted', 'interviewed', 'rejected', 'hired'].includes(body.status)) {
      allowedUpdates.status = body.status
    }
    
    if (body.hr_rating && body.hr_rating >= 1 && body.hr_rating <= 5) {
      allowedUpdates.hr_rating = body.hr_rating
    }
    
    if (body.hr_notes !== undefined) {
      allowedUpdates.hr_notes = body.hr_notes
    }
    
    if (body.interview_scheduled_at !== undefined) {
      allowedUpdates.interview_scheduled_at = body.interview_scheduled_at
    }
    
    if (body.response_deadline !== undefined) {
      allowedUpdates.response_deadline = body.response_deadline
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      )
    }

    // Update the application
    const { data: updatedApplication, error: updateError } = await supabase
      .from('job_applications')
      .update(allowedUpdates)
      .eq('id', id)
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

    if (updateError) {
      console.error('Error updating application:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: 'Application updated successfully'
    })
  } catch (error) {
    console.error('Update job application error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/job-applications/[id] - Withdraw job application (for applicants)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const supabase = await createServerSupabaseClient()

    // Get current user for authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get application to check ownership
    const { data: application, error: fetchError } = await supabase
      .from('job_applications')
      .select('applicant_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if user owns the application
    if (application.applicant_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - can only withdraw your own applications' },
        { status: 403 }
      )
    }

    // Prevent withdrawal if application is in final stages
    if (['interviewed', 'hired'].includes(application.status)) {
      return NextResponse.json(
        { success: false, error: 'Cannot withdraw application in current status' },
        { status: 400 }
      )
    }

    // Delete the application
    const { error: deleteError } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting application:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to withdraw application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Application withdrawn successfully'
    })
  } catch (error) {
    console.error('Delete job application error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}