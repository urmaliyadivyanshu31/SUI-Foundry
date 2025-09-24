import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/core/supabase'
import { openai } from '@/lib/ai/openai'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
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

    // Get user profile with comprehensive data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        reputation_scores(*),
        social_connections(*),
        user_skills(*, skill:job_skills(*)),
        job_applications(*, job:jobs(*, company:companies(*))),
        identity_nfts(*)
      `)
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get user's blockchain data summary
    let blockchainSummary = {}
    try {
      // Import blockchain data functions
      const { getCompleteUserData } = await import('@/lib/blockchain/blockchain-data')
      const blockchainData = await getCompleteUserData(profile.wallet_address)
      
      blockchainSummary = {
        totalTransactions: blockchainData.totalTransactions || 0,
        totalVolume: blockchainData.totalVolume || 0,
        totalNFTs: blockchainData.totalNFTs || 0,
        defiProtocolsCount: blockchainData.defiProtocolsCount || 0,
        suiBalance: blockchainData.realTimeBalance?.find(b => b.token_symbol === 'SUI')?.balance || 0,
        tokenDiversity: blockchainData.realTimeBalance?.length || 0
      }
    } catch (error) {
      console.log('Could not fetch blockchain data:', error)
      // Continue without blockchain data
    }

    // Prepare user context for AI
    const userContext = {
      username: profile.username,
      reputationScore: profile.reputation_scores?.[0]?.total_score || 300,
      defiScore: profile.reputation_scores?.[0]?.defi_score || 0,
      socialScore: profile.reputation_scores?.[0]?.social_score || 0,
      developerScore: profile.reputation_scores?.[0]?.developer_score || 0,
      socialConnections: profile.social_connections?.length || 0,
      connectedPlatforms: profile.social_connections?.map(sc => sc.platform) || [],
      skills: profile.user_skills?.map(us => ({
        name: us.skill.name,
        category: us.skill.category,
        proficiency: us.proficiency_level,
        verified: us.verified
      })) || [],
      jobApplications: profile.job_applications?.length || 0,
      recentApplications: profile.job_applications?.slice(0, 3).map(app => ({
        jobTitle: app.job.title,
        company: app.job.company.name,
        status: app.status,
        matchScore: app.ai_match_score
      })) || [],
      memberSince: profile.created_at,
      blockchain: blockchainSummary
    }

    // Create conversation context based on the current page/context
    let systemPrompt = `You are SuiDentity AI, an intelligent career coach and reputation advisor for Web3 developers and creators. You help users improve their on-chain reputation, find better job opportunities, and advance their careers in the blockchain space.

USER PROFILE CONTEXT:
- Username: @${userContext.username}
- Current Reputation Score: ${userContext.reputationScore}/850
- Breakdown: DeFi(${userContext.defiScore}), Social(${userContext.socialScore}), Developer(${userContext.developerScore})
- Connected Platforms: ${userContext.connectedPlatforms.join(', ') || 'None'}
- Skills: ${userContext.skills.slice(0, 8).map(s => `${s.name}(${s.proficiency})`).join(', ')}
- Job Applications: ${userContext.jobApplications}
- Blockchain Activity: ${userContext.blockchain.totalTransactions} transactions, ${userContext.blockchain.totalNFTs} NFTs, ${userContext.blockchain.defiProtocolsCount} DeFi protocols

CONVERSATION CONTEXT: ${context || 'General career coaching'}

GUIDELINES:
1. Be conversational, encouraging, and specific to their profile
2. Always provide actionable advice based on their current stats
3. Suggest concrete steps to improve reputation scores
4. Recommend relevant jobs, skills to learn, or platforms to connect
5. Use Web3/blockchain terminology naturally
6. Keep responses under 200 words but comprehensive
7. If they ask about jobs, consider their skills and reputation level
8. If they ask about reputation, analyze their weak areas and suggest improvements
9. Always end with a specific next step they can take

BE ENCOURAGING: Frame advice positively, showing them what they can achieve.`

    // Adjust system prompt based on context
    if (context === 'job_search') {
      systemPrompt += `\n\nFOCUS: Job search advice, application strategies, and career opportunities based on their reputation and skills.`
    } else if (context === 'reputation_improvement') {
      systemPrompt += `\n\nFOCUS: Specific strategies to improve their reputation score in DeFi, Social, and Developer categories.`
    } else if (context === 'skill_development') {
      systemPrompt += `\n\nFOCUS: Skill recommendations, learning paths, and professional development for their career level.`
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 300,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { success: false, error: 'No response from AI' },
        { status: 500 }
      )
    }

    // Log the conversation (optional - for analytics)
    try {
      await supabase
        .from('ai_chat_logs')
        .insert({
          user_id: user.id,
          user_message: message,
          ai_response: aiResponse,
          context: context || 'general',
          user_reputation_at_time: userContext.reputationScore
        })
    } catch (logError) {
      // Don't fail the response if logging fails
      console.log('Could not log chat:', logError)
    }

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse,
        context: {
          reputation: userContext.reputationScore,
          recommendations: generateQuickRecommendations(userContext)
        }
      }
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate quick recommendations based on user profile
function generateQuickRecommendations(userContext: any) {
  const recommendations = []

  // Reputation-based recommendations
  if (userContext.reputationScore < 500) {
    recommendations.push({
      type: 'reputation',
      title: 'Connect More Platforms',
      description: 'Link GitHub and Twitter to boost your social score',
      action: 'Go to Social Connections'
    })
  }

  // Social connections
  if (userContext.socialConnections < 2) {
    recommendations.push({
      type: 'social',
      title: 'Boost Social Presence',
      description: 'Connect at least 2 platforms for better job matching',
      action: 'Add Social Accounts'
    })
  }

  // Skills
  if (userContext.skills.length < 3) {
    recommendations.push({
      type: 'skills',
      title: 'Add Technical Skills',
      description: 'List your programming languages and tools',
      action: 'Update Skills Profile'
    })
  }

  // Blockchain activity
  if (userContext.blockchain.totalTransactions < 10) {
    recommendations.push({
      type: 'blockchain',
      title: 'Increase On-chain Activity',
      description: 'More transactions improve your DeFi reputation',
      action: 'Explore DeFi Protocols'
    })
  }

  // Job applications
  if (userContext.jobApplications === 0 && userContext.reputationScore >= 400) {
    recommendations.push({
      type: 'career',
      title: 'Apply to Jobs',
      description: 'Your reputation qualifies for many positions',
      action: 'Browse Job Board'
    })
  }

  return recommendations.slice(0, 3) // Return top 3 recommendations
}