import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/core/supabase'
import { getCompleteUserData } from '@/lib/blockchain/blockchain-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin

    // Get user by username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's social connections
    const { data: socialConnections } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id)

    // Get user's reputation score
    const { data: reputation } = await supabase
      .from('reputation_scores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get user's GitHub data for repositories
    const githubConnection = socialConnections?.find(conn => conn.platform === 'github')
    let repositories = []
    let githubStats = null

    if (githubConnection?.profile_data) {
      try {
        // Fetch repositories from GitHub
        const reposResponse = await fetch(
          `https://api.github.com/users/${githubConnection.profile_data.login}/repos?type=owner&sort=stars&per_page=3`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        )

        if (reposResponse.ok) {
          repositories = await reposResponse.json()
        }

        // Get GitHub user stats
        const userResponse = await fetch(
          `https://api.github.com/users/${githubConnection.profile_data.login}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        )

        if (userResponse.ok) {
          githubStats = await userResponse.json()
        }
      } catch (error) {
        console.error('Error fetching GitHub data:', error)
      }
    }

    // Get blockchain data (NFTs and balances)
    let blockchainData = null
    let nfts = []

    if (user.wallet_address) {
      try {
        blockchainData = await getCompleteUserData(user.wallet_address)
        nfts = blockchainData.nftCollection || []
      } catch (error) {
        console.error('Error fetching blockchain data:', error)
      }
    }

    // Get tip statistics
    const { data: tipStats } = await supabase
      .rpc('get_user_tip_totals', { user_id: user.id })

    const portfolioData = {
      user: {
        id: user.id,
        username: user.username,
        profile_picture: user.profile_picture,
        wallet_address: user.wallet_address,
        created_at: user.created_at
      },
      socialConnections: socialConnections || [],
      reputation: reputation || {
        total_score: 300,
        developer_score: 0,
        social_score: 0,
        defi_score: 0,
        ai_analysis: null
      },
      repositories: repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        topics: repo.topics || [],
        html_url: repo.html_url,
        created_at: repo.created_at,
        updated_at: repo.updated_at
      })),
      githubStats: githubStats ? {
        public_repos: githubStats.public_repos,
        followers: githubStats.followers,
        following: githubStats.following,
        created_at: githubStats.created_at,
        location: githubStats.location,
        bio: githubStats.bio
      } : null,
      nfts: nfts.slice(0, 12), // Limit to 12 NFTs for performance
      blockchain: blockchainData ? {
        balance: parseFloat(blockchainData.realTimeBalance?.find(b => b.token_symbol === 'SUI')?.balance?.toFixed(4) || '0'),
        nftCount: blockchainData.totalNFTs || 0,
        transactionCount: blockchainData.totalTransactions || 0
      } : null,
      tipStats: tipStats?.[0] || {
        total_received: 0,
        tips_received_count: 0
      }
    }

    return NextResponse.json({
      success: true,
      data: portfolioData
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio data' },
      { status: 500 }
    )
  }
}

// POST /api/portfolio/[username]/tip - Send tip to user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { amount, message, transaction_hash } = await request.json()

    if (!username || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Username and positive amount are required' },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin

    // Get recipient by username
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('id, username, wallet_address')
      .eq('username', username)
      .single()

    if (recipientError || !recipient) {
      return NextResponse.json(
        { success: false, error: 'Recipient not found' },
        { status: 404 }
      )
    }

    // For now, we'll create an anonymous tip record
    // In a full implementation, you'd want to authenticate the sender
    const { data: tip, error: tipError } = await supabase
      .from('tips')
      .insert({
        from_user_id: null, // Anonymous tip
        to_user_id: recipient.id,
        amount,
        token_type: 'SUI',
        transaction_hash,
        message: message || null
      })
      .select()
      .single()

    if (tipError) {
      console.error('Error creating tip:', tipError)
      return NextResponse.json(
        { success: false, error: 'Failed to send tip' },
        { status: 500 }
      )
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