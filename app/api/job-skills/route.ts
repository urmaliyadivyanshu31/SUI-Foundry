import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/core/supabase'

// GET /api/job-skills - Get all active job skills
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('job_skills')
      .select('*')
      .eq('is_active', true)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Order by category and name
    query = query.order('category').order('name')

    const { data: skills, error } = await query

    if (error) {
      console.error('Error fetching job skills:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch job skills' },
        { status: 500 }
      )
    }

    // Group skills by category for easier use in frontend
    const skillsByCategory = skills?.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<string, typeof skills>) || {}

    return NextResponse.json({
      success: true,
      data: {
        skills,
        skills_by_category: skillsByCategory,
        categories: Object.keys(skillsByCategory)
      }
    })
  } catch (error) {
    console.error('Job skills API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}