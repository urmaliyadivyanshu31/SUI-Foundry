import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/core/supabase'

// GET /api/users/username-available?username=test&excludeUserId=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const excludeUserId = searchParams.get('excludeUserId')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)

    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }

    const { data: existingUser, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking username availability:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    const available = !existingUser
    return NextResponse.json({ available })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}