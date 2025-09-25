import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, type Database } from '@/lib/core/supabase'
import { Transaction } from '@mysten/sui/transactions'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { SuiClient } from '@mysten/sui/client'

type User = Database['public']['Tables']['users']['Row']

// GET /api/tips - Get tips (sent or received)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type') // 'sent' or 'received'
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

    // Build query based on type
    let query = supabase
      .from('tips')
      .select(`
        *,
        from_user:users!tips_from_user_id_fkey(id, username, profile_picture),
        to_user:users!tips_to_user_id_fkey(id, username, profile_picture)
      `)

    // Apply user filter
    const targetUserId = userId || user.id
    
    if (type === 'sent') {
      query = query.eq('from_user_id', targetUserId)
    } else if (type === 'received') {
      query = query.eq('to_user_id', targetUserId)
    } else {
      // Both sent and received
      query = query.or(`from_user_id.eq.${targetUserId},to_user_id.eq.${targetUserId}`)
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: tips, error, count } = await query

    if (error) {
      console.error('Error fetching tips:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tips' },
        { status: 500 }
      )
    }

    // Calculate totals for user
    const { data: totals } = await (supabase as any)
      .rpc('get_user_tip_totals', { user_id: targetUserId as string })

    return NextResponse.json({
      success: true,
      data: {
        tips,
        total_count: count || 0,
        has_more: (offset + limit) < (count || 0),
        totals: totals?.[0] || {
          total_sent: 0,
          total_received: 0,
          tips_sent_count: 0,
          tips_received_count: 0
        }
      }
    })
  } catch (error) {
    console.error('Tips API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/tips - Send a tip
export async function POST(request: NextRequest) {
  try {
    const { 
      to_user_id, 
      amount, 
      token_type = 'SUI', 
      message,
      transaction_data 
    } = await request.json()

    // Validate required fields
    if (!to_user_id || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Recipient and positive amount are required' },
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

    // Prevent self-tipping
    if (to_user_id === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot tip yourself' },
        { status: 400 }
      )
    }

    // Verify recipient exists
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('id, username, wallet_address')
      .eq('id', to_user_id)
      .single() as { data: Partial<User> | null, error: any }

    if (recipientError || !recipient) {
      return NextResponse.json(
        { success: false, error: 'Recipient not found' },
        { status: 404 }
      )
    }

    // Get sender wallet address
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('wallet_address, username')
      .eq('id', user.id)
      .single() as { data: Partial<User> | null, error: any }

    if (senderError || !sender) {
      return NextResponse.json(
        { success: false, error: 'Sender profile not found' },
        { status: 404 }
      )
    }

    // Validate transaction data if provided
    let transactionHash = null
    if (transaction_data) {
      try {
        // Here you would validate the Sui transaction
        // For now, we'll accept the provided transaction hash
        transactionHash = transaction_data.digest || transaction_data.transactionHash
      } catch (error) {
        console.error('Transaction validation error:', error)
        return NextResponse.json(
          { success: false, error: 'Invalid transaction data' },
          { status: 400 }
        )
      }
    }

    // Create the tip record
    const { data: tip, error: tipError } = await (supabase
      .from('tips') as any)
      .insert({
        from_user_id: user.id,
        to_user_id,
        amount,
        token_type,
        transaction_hash: transactionHash,
        message: message || null
      })
      .select(`
        *,
        from_user:users!tips_from_user_id_fkey(id, username, profile_picture),
        to_user:users!tips_to_user_id_fkey(id, username, profile_picture)
      `)
      .single()

    if (tipError) {
      console.error('Error creating tip:', tipError)
      return NextResponse.json(
        { success: false, error: 'Failed to send tip' },
        { status: 500 }
      )
    }

    // Create notification for recipient
    try {
      await (supabase
        .from('notifications') as any)
        .insert({
          user_id: to_user_id,
          type: 'tip_received',
          title: 'Tip Received!',
          message: `@${sender?.username || 'Anonymous'} sent you ${amount} ${token_type}${message ? `: "${message}"` : ''}`,
          data: {
            tip_id: (tip as any).id,
            amount,
            token_type,
            from_username: sender?.username
          }
        })
    } catch (notificationError) {
      // Don't fail the tip if notification fails
      console.log('Could not create notification:', notificationError)
    }

    return NextResponse.json({
      success: true,
      data: tip,
      message: 'Tip sent successfully!'
    })

  } catch (error) {
    console.error('Send tip error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to create Sui transaction for tip
export async function createSuiTipTransaction(
  senderAddress: string,
  recipientAddress: string,
  amount: number // in MIST (1 SUI = 1,000,000,000 MIST)
) {
  try {
    const suiClient = new SuiClient({
      url: process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet' 
        ? 'https://fullnode.mainnet.sui.io:443'
        : 'https://fullnode.testnet.sui.io:443'
    })

    const tx = new Transaction()

    // Split coins for exact amount
    const [coin] = tx.splitCoins(tx.gas, [amount])
    
    // Transfer to recipient
    tx.transferObjects([coin], recipientAddress)

    // Set sender
    tx.setSender(senderAddress)

    return {
      transaction: tx,
      suiClient
    }
  } catch (error) {
    console.error('Error creating Sui transaction:', error)
    throw error
  }
}