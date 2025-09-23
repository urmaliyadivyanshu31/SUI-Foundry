import { NextRequest, NextResponse } from 'next/server'
import { UserService, SocialConnectionService, ReputationService } from '@/lib/db/db-functions'
import { SmartReputationAI, type CompressedProfile } from '@/lib/ai/ai-reputation'

export async function POST(request: NextRequest) {
  try {
    const { userIds, adminKey } = await request.json()

    // Basic security check (in production, use proper admin authentication)
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'User IDs array is required' }, { status: 400 })
    }

    if (userIds.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 users per batch' }, { status: 400 })
    }

    console.log(`Starting batch reputation analysis for ${userIds.length} users`)

    // Prepare compressed profiles for all users
    const compressedProfiles: CompressedProfile[] = []
    const userDataMap = new Map()

    for (const userId of userIds) {
      try {
        const [userProfile, socialConnections] = await Promise.all([
          UserService.getUserProfile(userId),
          SocialConnectionService.getUserSocialConnections(userId)
        ])

        if (!userProfile) {
          console.warn(`User not found: ${userId}`)
          continue
        }

        // Store user data for later database updates
        userDataMap.set(userId, { userProfile, socialConnections })

        // Prepare compressed profile
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

        compressedProfiles.push(compressedProfile)
      } catch (error) {
        console.error(`Error preparing profile for user ${userId}:`, error)
      }
    }

    if (compressedProfiles.length === 0) {
      return NextResponse.json({ error: 'No valid users found' }, { status: 400 })
    }

    // Perform batch AI analysis (cost-optimized)
    console.log(`Performing batch AI analysis for ${compressedProfiles.length} users`)
    const aiInsightsMap = await SmartReputationAI.batchAnalyzeUsers(compressedProfiles)

    // Calculate algorithmic scores and store results
    const results = []
    let totalTokenUsage = 0

    for (const profile of compressedProfiles) {
      try {
        // Calculate algorithmic score
        const algorithmicScore = SmartReputationAI.calculateAlgorithmicScore(profile)
        
        // Get AI insights if available
        const aiInsights = aiInsightsMap.get(profile.userId)
        
        const reputationScore = {
          ...algorithmicScore,
          aiInsights
        }

        // Store in database
        await ReputationService.upsertReputationScore(profile.userId, {
          totalScore: reputationScore.total,
          defiScore: reputationScore.breakdown.defi,
          socialScore: reputationScore.breakdown.social,
          developerScore: reputationScore.breakdown.developer,
          aiAnalysis: reputationScore.aiInsights || {}
        })

        // Track token usage
        if (aiInsights?.tokenUsage) {
          totalTokenUsage += aiInsights.tokenUsage
        }

        results.push({
          userId: profile.userId,
          success: true,
          score: reputationScore.total,
          breakdown: reputationScore.breakdown,
          aiGenerated: !!aiInsights,
          tokenUsage: aiInsights?.tokenUsage || 0
        })

      } catch (error) {
        console.error(`Error processing user ${profile.userId}:`, error)
        results.push({
          userId: profile.userId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    console.log(`Batch analysis completed. Success: ${successCount}, Failures: ${failureCount}, Total tokens: ${totalTokenUsage}`)

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful: successCount,
      failed: failureCount,
      totalTokenUsage,
      averageTokensPerUser: results.length > 0 ? Math.round(totalTokenUsage / results.length) : 0,
      results: results.slice(0, 10), // Return first 10 for brevity
      fullResults: results.length <= 10 ? results : undefined,
      message: `Batch analysis completed for ${results.length} users`
    })

  } catch (error) {
    console.error('Batch reputation analysis error:', error)
    
    return NextResponse.json({
      error: 'Failed to perform batch analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check batch processing status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const adminKey = searchParams.get('adminKey')

    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stats about recent reputation scores
    // This would typically query recent records from the database
    // For now, return a basic status

    return NextResponse.json({
      success: true,
      status: 'ready',
      message: 'Batch processing service is ready',
      limits: {
        maxUsersPerBatch: 50,
        recommendedBatchSize: 20,
        estimatedCostPer100Users: '$0.50-$2.00' // Estimated based on GPT-4o-mini pricing
      },
      usage: {
        dailyLimit: 10000, // Example limit
        currentUsage: 0 // Would be tracked in database
      }
    })

  } catch (error) {
    console.error('Batch status error:', error)
    
    return NextResponse.json({
      error: 'Failed to get batch status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}