import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/core/supabase'
import { CompanyForm } from '@/types'

// GET /api/companies - Get companies (public read)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const verified_only = searchParams.get('verified_only') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('companies')
      .select('*')

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,industry.ilike.%${search}%`)
    }

    if (verified_only) {
      query = query.eq('verified', true)
    }

    // Apply pagination and ordering
    query = query
      .order('verified', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: companies, error, count } = await query

    if (error) {
      console.error('Error fetching companies:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch companies' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        companies,
        total_count: count || 0,
        has_more: (offset + limit) < (count || 0)
      }
    })
  } catch (error) {
    console.error('Companies API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    const body: CompanyForm = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
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

    // Check if user already has a company (optional business rule)
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('created_by', user.id)
      .single()

    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: 'You already have a company. Contact support to create additional companies.' },
        { status: 400 }
      )
    }

    // Create the company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: body.name,
        description: body.description,
        website: body.website,
        logo_url: body.logo_url,
        company_size: body.company_size,
        industry: body.industry,
        location: body.location,
        wallet_address: body.wallet_address,
        created_by: user.id
      } as any)
      .select('*')
      .single()

    if (companyError) {
      console.error('Error creating company:', companyError)
      return NextResponse.json(
        { success: false, error: 'Failed to create company' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: company,
      message: 'Company created successfully'
    })
  } catch (error) {
    console.error('Company creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}