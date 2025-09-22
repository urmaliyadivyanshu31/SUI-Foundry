import { OpenAI } from 'openai'
import type { GitHubProfileAnalysis } from './github'

// Initialize OpenAI with GPT-4o-mini for cost efficiency
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Compressed profile data for AI analysis (reduces tokens by 80%)
export interface CompressedProfile {
  userId: string
  githubData?: {
    repos: number
    stars: number
    forks: number
    commits: number
    languages: string[]
    topRepos: Array<{
      name: string
      stars: number
      language: string
      description?: string
    }>
    accountAge: number
    consistencyScore: number
    diversityScore: number
  }
  socialData?: {
    twitterFollowers?: number
    twitterVerified?: boolean
    linkedinConnections?: number
  }
  accountData: {
    email: string
    emailVerified: boolean
    accountAge: number
    username: string
  }
}

// AI insights structure for efficient caching
export interface AIInsights {
  personalityProfile: {
    traits: string[]
    strengths: string[]
    workStyle: string
  }
  reputationAnalysis: {
    summary: string
    credibilityFactors: string[]
    trustworthiness: number // 0-100
    expertise: string[]
  }
  improvementSuggestions: {
    immediate: string[]
    longTerm: string[]
    priority: 'high' | 'medium' | 'low'
  }
  marketPositioning: {
    category: string
    competitiveAdvantage: string[]
    targetAudience: string
  }
  tokenUsage: number
  generatedAt: string
  cacheUntil: string
}

// Reputation score breakdown
export interface ReputationScore {
  total: number // 300-850 (credit score style)
  breakdown: {
    developer: number // 40% weight
    social: number // 30% weight
    defi: number // 20% weight
    verification: number // 10% weight
  }
  trend: 'up' | 'down' | 'stable'
  percentile: number // vs all users
  aiInsights?: AIInsights
}

export class SmartReputationAI {
  private static readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
  private static readonly MAX_TOKENS_PER_REQUEST = 1000 // Cost control

  // Compress GitHub data to reduce AI tokens by 80%
  static compressGitHubData(analysis: GitHubProfileAnalysis): CompressedProfile['githubData'] {
    return {
      repos: analysis.totalRepos,
      stars: analysis.totalStars,
      forks: analysis.totalForks,
      commits: analysis.totalCommits,
      languages: Object.keys(analysis.languageStats).slice(0, 5), // Top 5 only
      topRepos: analysis.topRepositories.slice(0, 3).map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count,
        language: repo.language || 'Unknown',
        description: repo.description?.substring(0, 100) // Truncate descriptions
      })),
      accountAge: analysis.accountAge,
      consistencyScore: analysis.consistencyScore,
      diversityScore: analysis.diversityScore
    }
  }

  // Calculate algorithmic reputation score (80% of system - no AI needed)
  static calculateAlgorithmicScore(profile: CompressedProfile): Omit<ReputationScore, 'aiInsights'> {
    let developerScore = 0
    let socialScore = 0
    let defiScore = 0
    let verificationScore = 0

    // Developer Score (0-100) - 40% weight
    if (profile.githubData) {
      const { repos, stars, forks, consistencyScore, diversityScore, accountAge } = profile.githubData
      
      // Repository quantity (max 20 points)
      developerScore += Math.min(repos * 2, 20)
      
      // Quality indicators (max 30 points)
      developerScore += Math.min(stars * 0.5 + forks * 0.3, 30)
      
      // Activity consistency (max 25 points)
      developerScore += (consistencyScore / 100) * 25
      
      // Diversity and experience (max 25 points)
      developerScore += (diversityScore / 100) * 15
      developerScore += Math.min(accountAge / 365, 2) * 5 // 2 years = max 10 points
    }

    // Social Score (0-100) - 30% weight
    if (profile.socialData) {
      const { twitterFollowers = 0, twitterVerified = false, linkedinConnections = 0 } = profile.socialData
      
      // Twitter influence (max 60 points)
      socialScore += Math.min(Math.log10(twitterFollowers + 1) * 10, 50)
      socialScore += twitterVerified ? 10 : 0
      
      // LinkedIn network (max 40 points)
      socialScore += Math.min(Math.log10(linkedinConnections + 1) * 8, 40)
    }

    // DeFi Score (0-100) - 20% weight (placeholder for future DeFi integration)
    defiScore = 50 // Base score, will be enhanced with actual DeFi data

    // Verification Score (0-100) - 10% weight
    const { emailVerified, accountAge } = profile.accountData
    verificationScore += emailVerified ? 50 : 0
    verificationScore += Math.min(accountAge / 365, 1) * 30 // 1 year = 30 points
    verificationScore += profile.githubData ? 20 : 0 // GitHub connected

    // Weighted total score (300-850 range)
    const weightedScore = 
      (developerScore * 0.4) + 
      (socialScore * 0.3) + 
      (defiScore * 0.2) + 
      (verificationScore * 0.1)

    // Scale to 300-850 range (like credit scores)
    const total = Math.round(300 + (weightedScore * 5.5))

    // Calculate percentile (mock for now)
    const percentile = Math.min(Math.round((total - 300) / 550 * 100), 99)

    // Determine trend (placeholder - would use historical data)
    const trend: 'up' | 'down' | 'stable' = total > 600 ? 'up' : total < 400 ? 'down' : 'stable'

    return {
      total: Math.min(total, 850),
      breakdown: {
        developer: Math.round(developerScore),
        social: Math.round(socialScore),
        defi: Math.round(defiScore),
        verification: Math.round(verificationScore)
      },
      trend,
      percentile
    }
  }

  // AI analysis with token optimization (20% of system)
  static async generateAIInsights(profile: CompressedProfile): Promise<AIInsights> {
    try {
      // Create compressed prompt to minimize tokens
      const prompt = this.createOptimizedPrompt(profile)
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // 90% cheaper than GPT-4
        messages: [
          {
            role: "system",
            content: "You are a Web3 reputation analyst. Provide concise, actionable insights. Respond in JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: this.MAX_TOKENS_PER_REQUEST,
        temperature: 0.3, // Lower temperature for consistency
        response_format: { type: "json_object" }
      })

      const insights = JSON.parse(response.choices[0].message.content || '{}')
      const tokenUsage = response.usage?.total_tokens || 0

      return {
        personalityProfile: {
          traits: insights.personality?.traits || ["analytical", "detail-oriented"],
          strengths: insights.personality?.strengths || ["technical expertise"],
          workStyle: insights.personality?.workStyle || "collaborative"
        },
        reputationAnalysis: {
          summary: insights.reputation?.summary || "Emerging developer with solid technical foundation",
          credibilityFactors: insights.reputation?.credibilityFactors || ["verified accounts", "consistent activity"],
          trustworthiness: insights.reputation?.trustworthiness || 75,
          expertise: insights.reputation?.expertise || ["software development"]
        },
        improvementSuggestions: {
          immediate: insights.improvements?.immediate || ["increase GitHub activity"],
          longTerm: insights.improvements?.longTerm || ["build larger project portfolio"],
          priority: insights.improvements?.priority || "medium"
        },
        marketPositioning: {
          category: insights.positioning?.category || "Developer",
          competitiveAdvantage: insights.positioning?.advantages || ["technical skills"],
          targetAudience: insights.positioning?.audience || "tech companies"
        },
        tokenUsage,
        generatedAt: new Date().toISOString(),
        cacheUntil: new Date(Date.now() + this.CACHE_DURATION).toISOString()
      }
    } catch (error) {
      console.error('AI analysis error:', error)
      
      // Fallback insights if AI fails
      return {
        personalityProfile: {
          traits: ["reliable", "growth-oriented"],
          strengths: ["technical foundation", "learning mindset"],
          workStyle: "independent"
        },
        reputationAnalysis: {
          summary: "Building Web3 reputation with verified accounts and growing activity",
          credibilityFactors: ["account verification", "platform engagement"],
          trustworthiness: 70,
          expertise: ["blockchain technology"]
        },
        improvementSuggestions: {
          immediate: ["connect more social accounts", "increase platform engagement"],
          longTerm: ["develop signature projects", "build thought leadership"],
          priority: "medium" as const
        },
        marketPositioning: {
          category: "Web3 Enthusiast",
          competitiveAdvantage: ["early adoption", "technical interest"],
          targetAudience: "DeFi protocols and Web3 startups"
        },
        tokenUsage: 0,
        generatedAt: new Date().toISOString(),
        cacheUntil: new Date(Date.now() + this.CACHE_DURATION).toISOString()
      }
    }
  }

  // Create token-optimized prompt
  private static createOptimizedPrompt(profile: CompressedProfile): string {
    const { githubData, socialData, accountData } = profile

    // Compress data into minimal prompt
    let prompt = `Analyze Web3 reputation for user "${accountData.username}":\n\n`

    if (githubData) {
      prompt += `GitHub: ${githubData.repos} repos, ${githubData.stars} stars, ${githubData.commits} commits. `
      prompt += `Languages: ${githubData.languages.slice(0, 3).join(', ')}. `
      prompt += `Top project: ${githubData.topRepos[0]?.name || 'None'} (${githubData.topRepos[0]?.stars || 0} stars). `
      prompt += `Activity: ${githubData.consistencyScore}% consistent, ${githubData.diversityScore}% diverse. `
    }

    if (socialData) {
      prompt += `Social: ${socialData.twitterFollowers || 0} Twitter followers${socialData.twitterVerified ? ' (verified)' : ''}. `
    }

    prompt += `Account: ${accountData.accountAge} days old, ${accountData.emailVerified ? 'verified' : 'unverified'} email.\n\n`

    prompt += `Provide JSON with:
{
  "personality": {"traits": ["trait1", "trait2"], "strengths": ["strength1"], "workStyle": "style"},
  "reputation": {"summary": "brief analysis", "credibilityFactors": ["factor1"], "trustworthiness": 85, "expertise": ["area1"]},
  "improvements": {"immediate": ["action1"], "longTerm": ["goal1"], "priority": "high|medium|low"},
  "positioning": {"category": "Developer|Creator|Investor", "advantages": ["advantage1"], "audience": "target"}
}`

    return prompt
  }

  // Batch process multiple users for efficiency
  static async batchAnalyzeUsers(profiles: CompressedProfile[]): Promise<Map<string, AIInsights>> {
    const results = new Map<string, AIInsights>()
    
    // Process in batches of 5 to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (profile) => {
        const insights = await this.generateAIInsights(profile)
        return { userId: profile.userId, insights }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.set(result.value.userId, result.value.insights)
        }
      })

      // Small delay between batches to respect rate limits
      if (i + batchSize < profiles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }

  // Complete reputation analysis (algorithmic + AI)
  static async analyzeCompleteReputation(profile: CompressedProfile): Promise<ReputationScore> {
    // Always calculate algorithmic score (instant, free)
    const algorithmicScore = this.calculateAlgorithmicScore(profile)

    try {
      // Add AI insights for enhanced analysis
      const aiInsights = await this.generateAIInsights(profile)
      
      return {
        ...algorithmicScore,
        aiInsights
      }
    } catch (error) {
      console.error('Failed to generate AI insights:', error)
      
      // Return algorithmic score without AI (graceful degradation)
      return algorithmicScore
    }
  }
}

// Utility functions for reputation scoring
export class ReputationUtils {
  // Get reputation level from score
  static getReputationLevel(score: number): {
    level: string
    color: string
    description: string
    range: string
  } {
    if (score >= 750) {
      return {
        level: 'Expert',
        color: 'text-purple-600',
        description: 'Outstanding Web3 reputation',
        range: '750-850'
      }
    } else if (score >= 650) {
      return {
        level: 'Advanced',
        color: 'text-blue-600',
        description: 'Strong Web3 presence',
        range: '650-749'
      }
    } else if (score >= 550) {
      return {
        level: 'Intermediate',
        color: 'text-green-600',
        description: 'Growing Web3 reputation',
        range: '550-649'
      }
    } else if (score >= 450) {
      return {
        level: 'Developing',
        color: 'text-yellow-600',
        description: 'Building Web3 presence',
        range: '450-549'
      }
    } else if (score >= 350) {
      return {
        level: 'Beginner',
        color: 'text-orange-600',
        description: 'Starting Web3 journey',
        range: '350-449'
      }
    } else {
      return {
        level: 'New',
        color: 'text-gray-600',
        description: 'Welcome to Web3',
        range: '300-349'
      }
    }
  }

  // Format score with appropriate styling
  static formatScore(score: number): {
    score: number
    level: ReturnType<typeof ReputationUtils.getReputationLevel>
    percentageOfMax: number
  } {
    const level = this.getReputationLevel(score)
    const percentageOfMax = Math.round(((score - 300) / 550) * 100)

    return {
      score,
      level,
      percentageOfMax
    }
  }

  // Calculate improvement potential
  static calculateImprovementPotential(current: ReputationScore): {
    maxPossible: number
    improvement: number
    quickWins: string[]
    effort: 'low' | 'medium' | 'high'
  } {
    const { breakdown } = current
    
    // Calculate theoretical maximum based on current data
    let maxPossible = 300
    maxPossible += Math.min(breakdown.developer * 1.5, 100) * 0.4 * 5.5
    maxPossible += Math.min(breakdown.social * 1.3, 100) * 0.3 * 5.5
    maxPossible += Math.min(breakdown.defi * 2, 100) * 0.2 * 5.5
    maxPossible += Math.min(breakdown.verification * 1.2, 100) * 0.1 * 5.5
    
    const improvement = Math.round(Math.min(maxPossible, 850) - current.total)
    
    // Suggest quick wins based on current scores
    const quickWins: string[] = []
    if (breakdown.verification < 80) quickWins.push("Verify email and connect more accounts")
    if (breakdown.social < 60) quickWins.push("Increase social media presence")
    if (breakdown.developer < 70) quickWins.push("Contribute more to GitHub projects")
    if (breakdown.defi < 60) quickWins.push("Engage with DeFi protocols")

    const effort: 'low' | 'medium' | 'high' = improvement < 50 ? 'low' : improvement < 150 ? 'medium' : 'high'

    return {
      maxPossible: Math.round(Math.min(maxPossible, 850)),
      improvement,
      quickWins: quickWins.slice(0, 3),
      effort
    }
  }
}