import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/core/supabase'

interface LeaderboardUser {
  id: string
  username: string
  wallet_address: string
  profile_picture: string | null
  reputation_score: number
  defi_score: number
  social_score: number
  developer_score: number
  rank: number
  total_tips_received: number
  total_tips_sent: number
  social_connections_count: number
}

// GET /api/leaderboard - Get reputation leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category') // 'total', 'defi', 'social', 'developer'

    const supabase = await createServerSupabaseClient()

    // Select the score column based on category
    let scoreColumn = 'rs.total_score'
    switch (category) {
      case 'defi':
        scoreColumn = 'rs.defi_score'
        break
      case 'social':
        scoreColumn = 'rs.social_score'
        break
      case 'developer':
        scoreColumn = 'rs.developer_score'
        break
      default:
        scoreColumn = 'rs.total_score'
    }

    // First get users with reputation scores
    const { data: usersWithScores, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        username,
        wallet_address,
        profile_picture,
        reputation_scores!inner (
          total_score,
          defi_score,
          social_score,
          developer_score,
          calculated_at
        )
      `)
      .not('username', 'is', null)
      .limit(200) // Get more data to sort properly

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Sort users by reputation score
    const sortedUsers = usersWithScores.sort((a, b) => {
      const aScore = (a as any).reputation_scores?.[0]?.total_score || 300
      const bScore = (b as any).reputation_scores?.[0]?.total_score || 300
      return bScore - aScore
    })

    // Apply pagination
    const paginatedUsers = sortedUsers.slice(offset, offset + limit)

    // Get additional data for each user
    const leaderboardData = await Promise.all(
      paginatedUsers.map(async (user) => {
        // Get social connections count
        const { count: socialCount } = await supabase
          .from('social_connections')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', (user as any).id)
          .eq('verified', true)

        // Get tips data
        const { data: tipsSent } = await supabase
          .from('tips')
          .select('amount')
          .eq('from_user_id', (user as any).id)

        const { data: tipsReceived } = await supabase
          .from('tips')
          .select('amount')
          .eq('to_user_id', (user as any).id)

        return {
          ...(user as any),
          social_connections: socialCount || 0,
          tips_sent: tipsSent || [],
          tips_received: tipsReceived || []
        }
      })
    )

    const error = null

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Process and rank the data
    const processedLeaderboard: LeaderboardUser[] = leaderboardData.map((user, index) => {
      const latestReputation = user.reputation_scores?.[0] || {
        total_score: 300,
        defi_score: 0,
        social_score: 0,
        developer_score: 0
      }

      const totalTipsSent = user.tips_sent?.reduce((sum: number, tip: any) => sum + (tip.amount || 0), 0) || 0
      const totalTipsReceived = user.tips_received?.reduce((sum: number, tip: any) => sum + (tip.amount || 0), 0) || 0

      return {
        id: (user as any).id,
        username: user.username || 'Anonymous',
        wallet_address: user.wallet_address,
        profile_picture: user.profile_picture,
        reputation_score: latestReputation.total_score,
        defi_score: latestReputation.defi_score,
        social_score: latestReputation.social_score,
        developer_score: latestReputation.developer_score,
        rank: offset + index + 1,
        total_tips_received: totalTipsReceived,
        total_tips_sent: totalTipsSent,
        social_connections_count: user.social_connections || 0
      }
    })

    // Get total count for pagination (use the sorted users count)
    const count = sortedUsers.length
    const countError = null

    if (countError) {
      console.error('Error getting leaderboard count:', countError)
    }

    // Get current user's rank (if authenticated)
    let currentUserRank = null
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Find user's rank in the sorted list
      const userIndex = sortedUsers.findIndex(u => (u as any).id === (user as any).id)
      if (userIndex !== -1) {
        currentUserRank = userIndex + 1
      }
    }

    // Calculate platform statistics from current data
    const platformStats = {
      total_users: count || 0,
      total_reputation_calculated: sortedUsers.length,
      average_score: Math.round(
        sortedUsers.reduce((sum, u) => sum + ((u as any).reputation_scores?.[0]?.total_score || 300), 0) / 
        Math.max(sortedUsers.length, 1)
      ),
      top_score: (sortedUsers[0] as any)?.reputation_scores?.[0]?.total_score || 300
    }

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: processedLeaderboard,
        total_count: count || 0,
        current_user_rank: currentUserRank,
        has_more: (offset + limit) < (count || 0),
        platform_stats: platformStats,
        category: category || 'total'
      }
    })
  } catch (error) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}