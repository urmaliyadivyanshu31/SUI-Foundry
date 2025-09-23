import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/core/supabase'
import { isValidSuiAddress } from '@mysten/sui/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      wallet_address,
      email,
      username,
      zklogin_sub,
      oauth_provider,
      profile_picture,
      salt_value,
      max_epoch,
      ephemeral_public_key,
      jwt_token
    } = body

    // Validate required fields
    if (!wallet_address || !isValidSuiAddress(wallet_address)) {
      return NextResponse.json(
        { error: 'Invalid or missing wallet address' },
        { status: 400 }
      )
    }

    // Check if user already exists by wallet address or zklogin_sub
    let query = `wallet_address.eq.${wallet_address}`
    if (zklogin_sub) {
      query += `,zklogin_sub.eq.${zklogin_sub}`
    }
    
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(query)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json(
        { error: 'Database error during user lookup' },
        { status: 500 }
      )
    }

    if (existingUser) {
      // Update existing user
      const updateData = {
        email,
        zklogin_sub,
        oauth_provider,
        salt_value,
        max_epoch,
        jwt_token,
        profile_picture,
        updated_at: new Date().toISOString()
      }
      
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        )
      }

      return NextResponse.json({ user: updatedUser, created: false })
    } else {
      // Create new user
      const userData = {
        wallet_address,
        username: username || null,
        email: email || null,
        zklogin_sub: zklogin_sub || null,
        oauth_provider: oauth_provider || null,
        salt_value: salt_value || null,
        max_epoch: max_epoch || null,
        ephemeral_public_key: ephemeral_public_key || null,
        jwt_token: jwt_token || null,
        profile_picture: profile_picture || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      return NextResponse.json({ user: newUser, created: true })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}