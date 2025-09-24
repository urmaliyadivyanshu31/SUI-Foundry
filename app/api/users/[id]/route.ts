import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/core/supabase'
import { isValidSuiAddress } from '@mysten/sui/utils'

// GET /api/users/[id] - Get user profile
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

    // Get user profile
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      console.error('Database error fetching user:', userError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Get social connections
    const { data: socialConnections } = await supabaseAdmin
      .from('social_connections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Get reputation scores
    const { data: reputationScores } = await supabaseAdmin
      .from('reputation_scores')
      .select('*')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false })
      .limit(1)

    // Get identity NFTs
    const { data: identityNfts } = await supabaseAdmin
      .from('identity_nfts')
      .select('*')
      .eq('user_id', userId)

    const profile = {
      ...user,
      social_connections: socialConnections || [],
      reputation_scores: reputationScores || [],
      identity_nfts: identityNfts || []
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const updates = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // First check if user exists
    console.log('🔍 Checking if user exists with ID:', userId)
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, wallet_address, email, username')
      .eq('id', userId)
      .single()

    console.log('📊 User lookup result:', { existingUser, fetchError })

    if (!existingUser) {
      console.log('❌ User not found in database with ID:', userId)
      
      // Let's also search by wallet address to see if the user exists with a different ID
      const { data: userByWallet } = await supabaseAdmin
        .from('users')
        .select('id, wallet_address, email, username')
        .limit(5)
        .order('created_at', { ascending: false })
      
      console.log('🔍 Recent users in database:', userByWallet)
      
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Validate username if being updated
    if (updates.username) {
      const { data: existingUsername } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', updates.username)
        .neq('id', userId)
        .single()

      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        )
      }
    }

    // Update user
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: updatedUser })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}