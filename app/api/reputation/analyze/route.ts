import { NextRequest, NextResponse } from 'next/server'
import { UserService, SocialConnectionService, ReputationService } from '@/lib/db-functions'
import { GitHubService } from '@/lib/github'
import { SmartReputationAI, ReputationUtils, type CompressedProfile } from '@/lib/ai-reputation'

export async function POST(request: NextRequest) {
  try {
    const { userId, forceRefresh = false } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user profile and social connections
    const [userProfile, socialConnections] = await Promise.all([
      UserService.getUserProfile(userId),
      SocialConnectionService.getUserSocialConnections(userId)
    ])

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if we have a cached reputation score (unless force refresh)
    if (!forceRefresh) {
      const existingScore = await ReputationService.getUserReputationScore(userId)
      if (existingScore) {
        const cacheAge = Date.now() - new Date(existingScore.calculated_at).getTime()
        const maxCacheAge = 24 * 60 * 60 * 1000 // 24 hours
        
        if (cacheAge < maxCacheAge) {
          // Return cached score with formatted data
          const formattedScore = ReputationUtils.formatScore(existingScore.total_score)
          const improvement = ReputationUtils.calculateImprovementPotential({
            total: existingScore.total_score,
            breakdown: {
              developer: existingScore.developer_score,
              social: existingScore.social_score,
              defi: existingScore.defi_score,
              verification: Math.round((existingScore.total_score - existingScore.developer_score - existingScore.social_score - existingScore.defi_score) / 0.1)
            },
            trend: 'stable' as const,
            percentile: 50 // Would be calculated from all users
          })

          return NextResponse.json({
            success: true,
            cached: true,
            reputation: {
              ...formattedScore,
              breakdown: {
                developer: existingScore.developer_score,
                social: existingScore.social_score,
                defi: existingScore.defi_score,
                verification: Math.round((existingScore.total_score - existingScore.developer_score - existingScore.social_score - existingScore.defi_score) / 0.1)
              },
              aiInsights: existingScore.ai_analysis,
              calculatedAt: existingScore.calculated_at
            },
            improvement,
            cacheAge: Math.round(cacheAge / 1000 / 60) // minutes
          })
        }
      }
    }

    // Prepare compressed profile for AI analysis
    const compressedProfile: CompressedProfile = {
      userId,
      accountData: {
        email: userProfile.email || '',
        emailVerified: !!userProfile.email,
        accountAge: Math.floor((Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        username: userProfile.username || 'anonymous'
      }
    }

    // Add GitHub data if available
    const githubConnection = socialConnections.find(conn => conn.platform === 'github')
    if (githubConnection?.profile_data?.analysis) {
      compressedProfile.githubData = SmartReputationAI.compressGitHubData(githubConnection.profile_data.analysis)
    }

    // Add social media data
    const twitterConnection = socialConnections.find(conn => conn.platform === 'twitter')
    if (twitterConnection) {
      compressedProfile.socialData = {
        twitterFollowers: twitterConnection.profile_data?.followers || 0,
        twitterVerified: twitterConnection.verified || false
      }
    }

    // Perform complete reputation analysis
    console.log('Starting reputation analysis for user:', userId)
    const reputationScore = await SmartReputationAI.analyzeCompleteReputation(compressedProfile)

    // Store the updated reputation score in database
    await ReputationService.upsertReputationScore(userId, {
      totalScore: reputationScore.total,
      defiScore: reputationScore.breakdown.defi,
      socialScore: reputationScore.breakdown.social,
      developerScore: reputationScore.breakdown.developer,
      aiAnalysis: reputationScore.aiInsights || {}
    })

    // Format response with additional insights
    const formattedScore = ReputationUtils.formatScore(reputationScore.total)
    const improvement = ReputationUtils.calculateImprovementPotential(reputationScore)

    // Log token usage for monitoring
    if (reputationScore.aiInsights?.tokenUsage) {
      console.log(`AI Analysis completed. Tokens used: ${reputationScore.aiInsights.tokenUsage}`)
    }

    return NextResponse.json({
      success: true,
      cached: false,
      reputation: {
        ...formattedScore,
        breakdown: reputationScore.breakdown,
        trend: reputationScore.trend,
        percentile: reputationScore.percentile,
        aiInsights: reputationScore.aiInsights,
        calculatedAt: new Date().toISOString()
      },
      improvement,
      tokenUsage: reputationScore.aiInsights?.tokenUsage || 0,
      message: 'Reputation analysis completed successfully'
    })

  } catch (error) {
    console.error('Reputation analysis error:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze reputation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint for quick reputation check (cached only)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get cached reputation score only
    const existingScore = await ReputationService.getUserReputationScore(userId)
    
    if (!existingScore) {
      return NextResponse.json({ 
        error: 'No reputation score found',
        message: 'Run POST /api/reputation/analyze to generate initial score'
      }, { status: 404 })
    }

    const formattedScore = ReputationUtils.formatScore(existingScore.total_score)
    const cacheAge = Date.now() - new Date(existingScore.calculated_at).getTime()

    return NextResponse.json({
      success: true,
      reputation: {
        ...formattedScore,
        breakdown: {
          developer: existingScore.developer_score,
          social: existingScore.social_score,
          defi: existingScore.defi_score,
          verification: Math.round((existingScore.total_score - existingScore.developer_score - existingScore.social_score - existingScore.defi_score) / 0.1)
        },
        aiInsights: existingScore.ai_analysis,
        calculatedAt: existingScore.calculated_at
      },
      cacheAge: Math.round(cacheAge / 1000 / 60), // minutes
      needsUpdate: cacheAge > 24 * 60 * 60 * 1000 // older than 24 hours
    })

  } catch (error) {
    console.error('Reputation fetch error:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch reputation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}