import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/core/supabase'

// GET /api/users/[id]/social-connections - Get user's social connections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: connections, error } = await supabaseAdmin
      .from('social_connections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching social connections:', error)
      return NextResponse.json(
        { error: 'Failed to fetch social connections' },
        { status: 500 }
      )
    }

    return NextResponse.json({ connections: connections || [] })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users/[id]/social-connections - Add a social connection
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const { platform, username, profileData, verified } = await request.json()

    if (!userId || !platform || !username) {
      return NextResponse.json(
        { error: 'User ID, platform, and username are required' },
        { status: 400 }
      )
    }

    // Check if connection already exists
    const { data: existing } = await supabaseAdmin
      .from('social_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform)
      .single()

    if (existing) {
      // Update existing connection
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('social_connections')
        .update({
          username,
          profile_data: profileData || null,
          verified: verified || false,
          verified_at: verified ? new Date().toISOString() : null
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update social connection' },
          { status: 500 }
        )
      }

      return NextResponse.json({ connection: updated })
    } else {
      // Create new connection
      const { data: created, error: createError } = await supabaseAdmin
        .from('social_connections')
        .insert({
          user_id: userId,
          platform,
          username,
          profile_data: profileData || null,
          verified: verified || false,
          verified_at: verified ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (createError) {
        console.error('Create error:', createError)
        return NextResponse.json(
          { error: 'Failed to create social connection' },
          { status: 500 }
        )
      }

      return NextResponse.json({ connection: created })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id]/social-connections - Remove a social connection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    if (!userId || !platform) {
      return NextResponse.json(
        { error: 'User ID and platform are required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('social_connections')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete social connection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}