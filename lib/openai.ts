import OpenAI from 'openai'

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

export interface BlockchainData {
  walletAddress: string
  suiTransactions?: number
  suiBalance?: number
  nftsOwned?: number
  defiProtocolsUsed?: string[]
  transactionHistory?: any[]
}

export async function calculateReputationScore(
  socialData: UserSocialData,
  blockchainData: BlockchainData
): Promise<ReputationAnalysis> {
  const prompt = `
You are an AI reputation analyst for a Web3 identity platform. Analyze the following user data and calculate a comprehensive reputation score on a scale of 300-850 (like a credit score).

Social Media Data:
${JSON.stringify(socialData, null, 2)}

Blockchain Data:
${JSON.stringify(blockchainData, null, 2)}

Calculate scores for each category (0-100 each):

1. DEFI_SCORE: Based on blockchain activity, transaction history, DeFi protocol usage, wallet age, and balance
2. SOCIAL_SCORE: Based on social media presence, followers, engagement, account age, and verification status
3. DEVELOPER_SCORE: Based on GitHub activity, repositories, contributions, and technical skills

SCORING GUIDELINES:
- DeFi Score: Active DeFi usage (20-30), High transaction volume (15-25), Old wallet (10-15), Good balance (10-15), Multi-protocol usage (10-15)
- Social Score: High followers (15-25), Long account age (10-20), Verified accounts (10-15), Regular activity (15-25), Professional presence (10-15)
- Developer Score: Many repos (20-30), High contributions (20-30), Good code quality (15-25), Active commits (15-25), Open source involvement (10-15)

Total Score = 300 + (DeFi_Score * 2) + (Social_Score * 2) + (Developer_Score * 1.5)

Provide your response in this exact JSON format:
{
  "totalScore": 450,
  "defiScore": 65,
  "socialScore": 75,
  "developerScore": 80,
  "analysis": {
    "summary": "Brief 1-2 sentence overview of the user's overall reputation",
    "strengths": ["List", "of", "key", "strengths"],
    "improvements": ["Areas", "for", "improvement"],
    "reasoning": "Detailed explanation of how scores were calculated and what factors influenced the rating"
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

export { openai }