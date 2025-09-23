import OpenAI from 'openai'
import type { EnhancedBlockchainData, WalletTransaction, UserNFT, DeFiInteraction } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface ReputationAnalysis {
  totalScore: number
  defiScore: number
  socialScore: number
  developerScore: number
  analysis: {
    summary: string
    strengths: string[]
    improvements: string[]
    reasoning: string
  }
}

export interface UserSocialData {
  github?: {
    username: string
    public_repos: number
    followers: number
    following: number
    created_at: string
    bio?: string
    company?: string
    location?: string
    contributions?: number
  }
  twitter?: {
    username: string
    followers_count: number
    following_count: number
    tweet_count: number
    created_at: string
    bio?: string
    verified?: boolean
  }
  linkedin?: {
    username: string
    connections?: number
    bio?: string
  }
}

// Using EnhancedBlockchainData from types instead of local interface

export async function calculateReputationScore(
  socialData: UserSocialData,
  blockchainData: EnhancedBlockchainData
): Promise<ReputationAnalysis> {
  // Prepare enhanced blockchain summary for AI analysis
  const blockchainSummary = {
    walletAddress: blockchainData.walletAddress,
    totalBalanceUSD: blockchainData.realTimeBalance?.reduce((sum, b) => sum + (b.balance_usd || 0), 0) || 0,
    totalSuiBalance: blockchainData.realTimeBalance?.find(b => b.token_symbol === 'SUI')?.balance || 0,
    tokenDiversity: blockchainData.realTimeBalance?.length || 0,
    totalTransactions: blockchainData.totalTransactions || 0,
    totalVolume: blockchainData.totalVolume || 0,
    totalNFTs: blockchainData.totalNFTs || 0,
    defiProtocolsCount: blockchainData.defiProtocolsCount || 0,
    recentTransactionTypes: blockchainData.transactionHistory?.slice(0, 10).map(tx => tx.transaction_type) || [],
    nftCollections: [...new Set(blockchainData.nftCollection?.map(nft => nft.collection_name).filter(Boolean))],
    defiProtocols: [...new Set(blockchainData.defiActivity?.map(d => d.protocol_name))],
    avgTransactionValue: blockchainData.totalTransactions ? (blockchainData.totalVolume || 0) / blockchainData.totalTransactions : 0,
    walletAge: blockchainData.transactionHistory?.length ? 
      Math.floor((Date.now() - Math.min(...blockchainData.transactionHistory.map(tx => tx.timestamp_ms))) / (1000 * 60 * 60 * 24)) : 0
  }

  const prompt = `
You are an AI reputation analyst for a Web3 identity platform. Analyze the following user data and calculate a comprehensive reputation score on a scale of 300-850 (like a credit score).

Social Media Data:
${JSON.stringify(socialData, null, 2)}

Enhanced Blockchain Data Summary:
${JSON.stringify(blockchainSummary, null, 2)}

Calculate scores for each category (0-100 each):

1. DEFI_SCORE: Based on real blockchain activity, transaction patterns, DeFi protocol usage, wallet age, balance diversity, and transaction volume
2. SOCIAL_SCORE: Based on social media presence, followers, engagement, account age, and verification status  
3. DEVELOPER_SCORE: Based on GitHub activity, repositories, contributions, and technical skills

ENHANCED SCORING GUIDELINES:

DeFi Score (0-100):
- Protocol Diversity (0-25): Multiple DeFi protocols used (5 points per protocol, max 25)
- Transaction Volume (0-25): High USD transaction volume (1 point per $1000, max 25) 
- Balance Score (0-20): Total portfolio value (1 point per $100, max 20)
- Activity Consistency (0-15): Regular transaction patterns over time
- Wallet Age (0-15): Older wallets show commitment (1 point per month, max 15)

Social Score (0-100):
- Follower Count (0-30): GitHub + Twitter followers (logarithmic scale)
- Account Age (0-25): Older accounts more trustworthy (1 point per 6 months)
- Verification Status (0-20): Verified accounts get full points
- Engagement Quality (0-25): Follower-to-following ratio, bio quality, activity

Developer Score (0-100):
- Repository Count (0-25): Public repositories (1 point per repo, max 25)
- Contribution Activity (0-30): GitHub contributions and commits
- Code Quality (0-25): Repository stars, forks, project diversity
- Open Source Impact (0-20): Community engagement, collaboration

Total Score = 300 + (DeFi_Score * 2.2) + (Social_Score * 1.8) + (Developer_Score * 2.0)

IMPORTANT: Use the actual data values provided. If someone has 50 transactions worth $10,000 total, use those real numbers in your calculations.

Provide your response in this exact JSON format:
{
  "totalScore": 450,
  "defiScore": 65,
  "socialScore": 75,
  "developerScore": 80,
  "analysis": {
    "summary": "Brief 1-2 sentence overview of the user's overall reputation based on real data",
    "strengths": ["List", "of", "key", "strengths", "with", "specific", "numbers"],
    "improvements": ["Areas", "for", "improvement", "with", "actionable", "suggestions"],
    "reasoning": "Detailed explanation of how scores were calculated using the actual data values provided"
  }
}
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a precise AI analyst. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse and validate the JSON response
    const analysis: ReputationAnalysis = JSON.parse(content)
    
    // Ensure scores are within valid ranges
    analysis.totalScore = Math.max(300, Math.min(850, analysis.totalScore))
    analysis.defiScore = Math.max(0, Math.min(100, analysis.defiScore))
    analysis.socialScore = Math.max(0, Math.min(100, analysis.socialScore))
    analysis.developerScore = Math.max(0, Math.min(100, analysis.developerScore))

    return analysis
  } catch (error) {
    console.error('Error calculating reputation score:', error)
    
    // Return default scores if AI fails
    return {
      totalScore: 350,
      defiScore: 20,
      socialScore: 15,
      developerScore: 15,
      analysis: {
        summary: 'Basic reputation score based on limited data',
        strengths: ['Account created', 'Basic profile setup'],
        improvements: ['Add more social connections', 'Increase blockchain activity', 'Build developer portfolio'],
        reasoning: 'Default scoring applied due to limited data or analysis error'
      }
    }
  }
}

export async function generateProfileSummary(userData: any): Promise<string> {
  const prompt = `
Generate a compelling 2-3 sentence profile summary for this Web3 user based on their data:

${JSON.stringify(userData, null, 2)}

Focus on their strongest aspects (social presence, developer skills, DeFi activity). Keep it professional but engaging.
Respond with only the summary text, no additional formatting.
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    return response.choices[0]?.message?.content || 'Web3 enthusiast building their digital identity'
  } catch (error) {
    console.error('Error generating profile summary:', error)
    return 'Web3 enthusiast building their digital identity'
  }
}

// Helper function to get comprehensive reputation analysis using real blockchain data
export async function getCompleteReputationAnalysis(
  walletAddress: string,
  socialData: UserSocialData
): Promise<ReputationAnalysis> {
  try {
    // Import here to avoid circular dependencies
    const { getCompleteUserData } = await import('../blockchain/blockchain-data')
    
    // Get real blockchain data
    const blockchainData = await getCompleteUserData(walletAddress)
    
    // Calculate reputation using AI with real data
    return await calculateReputationScore(socialData, blockchainData)
  } catch (error) {
    console.error('Error getting complete reputation analysis:', error)
    
    // Return fallback analysis
    return {
      totalScore: 350,
      defiScore: 20,
      socialScore: 15,
      developerScore: 15,
      analysis: {
        summary: 'Basic reputation score based on available data',
        strengths: ['Account created', 'Basic profile setup'],
        improvements: ['Connect more social accounts', 'Increase blockchain activity', 'Build developer portfolio'],
        reasoning: 'Fallback scoring applied due to data fetching error'
      }
    }
  }
}

export { openai }