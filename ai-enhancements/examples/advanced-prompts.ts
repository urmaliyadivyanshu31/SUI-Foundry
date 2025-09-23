/**
 * Advanced AI Prompt Examples for SuiDentity
 * 
 * This file contains enhanced prompt engineering examples that your teammate
 * can use to improve AI analysis quality and cost-effectiveness.
 */

import { OpenAI } from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Enhanced data types for better AI analysis
export interface AdvancedUserData {
  // Core identity
  userId: string
  username: string
  walletAddress: string
  
  // Social presence
  github?: {
    username: string
    repos: number
    stars: number
    commits: number
    languages: string[]
    repoTopics: string[]
    contributionPattern: 'consistent' | 'sporadic' | 'intense'
    codeQuality: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }
  
  twitter?: {
    username: string
    followers: number
    engagement: number
    topics: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    influence: number
  }
  
  // Blockchain activity
  blockchain?: {
    transactionCount: number
    defiProtocols: string[]
    nftCollections: number
    governanceParticipation: number
    stakingActivity: boolean
  }
  
  // Community involvement
  community?: {
    discordServers: string[]
    forumPosts: number
    eventAttendance: number
    mentorshipActivity: boolean
  }
}

/**
 * 1. Chain-of-Thought Reasoning Prompt
 * Guides AI through step-by-step analysis for better accuracy
 */
export async function chainOfThoughtAnalysis(userData: AdvancedUserData): Promise<string> {
  const prompt = `
You are an expert Web3 reputation analyst. Analyze this user's profile using chain-of-thought reasoning.

User Data:
${JSON.stringify(userData, null, 2)}

Please follow this analysis framework:

STEP 1 - Data Assessment:
- What data sources are available?
- What's the quality and recency of the data?
- Are there any data gaps or inconsistencies?

STEP 2 - Technical Skills Analysis:
- Based on GitHub data, what's their technical competency level?
- What programming languages and frameworks do they use?
- How consistent is their development activity?

STEP 3 - Social Influence Evaluation:
- What's their reach and engagement on social platforms?
- Are they thought leaders or followers in the space?
- How authentic does their social presence appear?

STEP 4 - Web3 Engagement Assessment:
- How actively do they participate in DeFi?
- What's their NFT and governance participation like?
- Are they builders, users, or speculators?

STEP 5 - Community Contribution Review:
- Do they contribute to open source projects?
- Are they mentors or knowledge sharers?
- How do they engage with the broader community?

STEP 6 - Risk Factor Analysis:
- Are there any red flags or concerning patterns?
- How diversified is their Web3 activity?
- What's their reputation consistency across platforms?

STEP 7 - Final Reputation Score:
- Synthesize all factors into scores (0-100 each):
  * Technical: ___/100
  * Social: ___/100  
  * DeFi: ___/100
  * Community: ___/100
- Calculate weighted total (300-850 scale)
- Provide confidence level in the assessment

Think through each step carefully and show your reasoning.
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a systematic analyst. Work through each step methodically and show your reasoning process."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 1500,
    temperature: 0.3
  })

  return response.choices[0]?.message?.content || 'Analysis failed'
}

/**
 * 2. Few-Shot Learning with Examples
 * Provides examples of different user types for better classification
 */
export async function fewShotClassification(userData: AdvancedUserData): Promise<string> {
  const prompt = `
Classify this Web3 user into one of the following archetypes based on these examples:

EXAMPLE 1 - "Protocol Builder":
- 50+ repos, 500+ stars, Solidity expert
- Low social following but high technical respect
- Active in governance, builds DeFi protocols
- Score: Developer: 95, Social: 40, DeFi: 90, Community: 80
- Classification: Expert Protocol Builder

EXAMPLE 2 - "Social Influencer":
- 10k+ followers, high engagement, educational content
- Moderate technical skills, active in NFTs
- Strong community presence, hosts events
- Score: Developer: 60, Social: 95, DeFi: 70, Community: 85
- Classification: Community Leader & Educator

EXAMPLE 3 - "DeFi Yield Farmer":
- Limited coding, moderate social presence
- Extensive DeFi usage across 10+ protocols
- High transaction volume, complex strategies
- Score: Developer: 30, Social: 50, DeFi: 95, Community: 40
- Classification: Advanced DeFi User

EXAMPLE 4 - "NFT Creator":
- Artistic background, growing technical skills
- Strong social presence in art communities
- Creates and trades NFTs, builds communities
- Score: Developer: 45, Social: 85, DeFi: 60, Community: 90
- Classification: Creative Community Builder

NEW USER TO CLASSIFY:
${JSON.stringify(userData, null, 2)}

Based on the patterns above, classify this user and explain your reasoning. Include:
1. Primary archetype and confidence level
2. Secondary characteristics
3. Recommended development areas
4. Predicted reputation trajectory
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert at pattern recognition and user classification. Use the examples to guide your analysis."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 800,
    temperature: 0.4
  })

  return response.choices[0]?.message?.content || 'Classification failed'
}

/**
 * 3. Dynamic Context-Aware Prompts
 * Adapts analysis based on available data and user context
 */
export async function contextAwareAnalysis(userData: AdvancedUserData): Promise<string> {
  // Analyze what data we have
  const hasGitHub = !!userData.github
  const hasTwitter = !!userData.twitter
  const hasBlockchain = !!userData.blockchain
  const hasCommunity = !!userData.community

  // Create context-specific analysis
  let focusAreas: string[] = []
  let analysisDepth = 'basic'

  if (hasGitHub && userData.github!.repos > 20) {
    focusAreas.push('technical_expertise')
    analysisDepth = 'advanced'
  }
  
  if (hasTwitter && userData.twitter!.followers > 1000) {
    focusAreas.push('social_influence')
  }
  
  if (hasBlockchain && userData.blockchain!.defiProtocols.length > 5) {
    focusAreas.push('defi_sophistication')
  }
  
  if (hasCommunity && userData.community!.eventAttendance > 10) {
    focusAreas.push('community_leadership')
  }

  // Dynamic prompt based on available data
  const prompt = `
You are analyzing a Web3 user with ${analysisDepth} data availability.

DATA SUMMARY:
- GitHub: ${hasGitHub ? '✓ Available' : '✗ Missing'}
- Twitter: ${hasTwitter ? '✓ Available' : '✗ Missing'}  
- Blockchain: ${hasBlockchain ? '✓ Available' : '✗ Missing'}
- Community: ${hasCommunity ? '✓ Available' : '✗ Missing'}

FOCUS AREAS: ${focusAreas.join(', ') || 'general_assessment'}

User Data:
${JSON.stringify(userData, null, 2)}

ANALYSIS INSTRUCTIONS:
${focusAreas.includes('technical_expertise') ? 
  '- Perform deep technical analysis of coding patterns, language choices, and project complexity' : 
  '- Provide basic technical assessment based on available data'}

${focusAreas.includes('social_influence') ? 
  '- Analyze social reach, engagement quality, and thought leadership indicators' : 
  '- Note limited social data and focus on other reputation factors'}

${focusAreas.includes('defi_sophistication') ? 
  '- Evaluate DeFi strategy complexity, protocol diversity, and yield optimization' : 
  '- Assess basic DeFi participation if data available'}

${focusAreas.includes('community_leadership') ? 
  '- Analyze community building, mentorship, and ecosystem contribution' : 
  '- Focus on individual achievements and potential'}

COMPENSATION STRATEGY:
For missing data areas, extrapolate insights from available data and suggest data collection priorities.

Provide a comprehensive reputation analysis that accounts for data limitations while maximizing insights from available information.
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an adaptive analyst who adjusts analysis depth based on available data quality and quantity."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 1200,
    temperature: 0.3
  })

  return response.choices[0]?.message?.content || 'Context analysis failed'
}

/**
 * 4. Multi-Perspective Analysis
 * Analyzes user from different stakeholder perspectives
 */
export async function multiPerspectiveAnalysis(userData: AdvancedUserData): Promise<{
  employerView: string
  investorView: string
  communityView: string
  peerView: string
}> {
  const perspectives = [
    {
      role: "Web3 startup hiring manager",
      focus: "technical skills, reliability, culture fit, growth potential",
      key: "employerView"
    },
    {
      role: "VC partner evaluating founders",
      focus: "vision, execution ability, network, market understanding",
      key: "investorView"
    },
    {
      role: "DAO community member",
      focus: "governance participation, values alignment, contribution quality",
      key: "communityView"
    },
    {
      role: "Fellow Web3 developer",
      focus: "technical competence, collaboration style, reputation authenticity",
      key: "peerView"
    }
  ]

  const results: any = {}

  for (const perspective of perspectives) {
    const prompt = `
You are a ${perspective.role} evaluating this Web3 user for potential collaboration.

User Profile:
${JSON.stringify(userData, null, 2)}

As a ${perspective.role}, you primarily care about: ${perspective.focus}

Please provide:
1. Overall impression (positive/neutral/negative)
2. Key strengths from your perspective
3. Potential concerns or weaknesses
4. Specific recommendations for this user
5. Likelihood of successful collaboration (1-10)

Focus on insights most relevant to your role and be candid about both opportunities and risks.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a ${perspective.role}. Evaluate users from your specific professional perspective.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.4
    })

    results[perspective.key] = response.choices[0]?.message?.content || 'Analysis failed'
  }

  return results
}

/**
 * 5. Trend-Aware Reputation Analysis
 * Incorporates current Web3 trends and market conditions
 */
export async function trendAwareAnalysis(
  userData: AdvancedUserData, 
  currentTrends: string[]
): Promise<string> {
  const prompt = `
You are a forward-looking Web3 reputation analyst. Evaluate this user considering current market trends and future opportunities.

CURRENT WEB3 TRENDS (${new Date().getFullYear()}):
${currentTrends.map(trend => `- ${trend}`).join('\n')}

USER PROFILE:
${JSON.stringify(userData, null, 2)}

TREND-AWARE ANALYSIS:
1. How well-positioned is this user for current trends?
2. Which emerging opportunities align with their skills?
3. What skills should they develop to stay relevant?
4. How might their reputation evolve over the next 12 months?
5. What market risks might affect their reputation?

FUTURE-FOCUSED RECOMMENDATIONS:
- Immediate actions (next 30 days)
- Medium-term goals (3-6 months)  
- Long-term positioning (1-2 years)

Consider both bull and bear market scenarios in your analysis.
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a trend analyst and strategic advisor for Web3 professionals."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 1000,
    temperature: 0.5
  })

  return response.choices[0]?.message?.content || 'Trend analysis failed'
}

/**
 * Example Usage and Testing Functions
 */
export async function testAdvancedPrompts() {
  const sampleUser: AdvancedUserData = {
    userId: 'test-user-001',
    username: 'web3builder',
    walletAddress: '0x742d35Cc7aC295532E37Ac5a3e0a7a4B7C4D5432',
    github: {
      username: 'web3builder',
      repos: 35,
      stars: 420,
      commits: 1250,
      languages: ['TypeScript', 'Solidity', 'Rust', 'Python'],
      repoTopics: ['defi', 'nft', 'dao', 'blockchain'],
      contributionPattern: 'consistent',
      codeQuality: 'advanced'
    },
    twitter: {
      username: 'web3builder',
      followers: 2500,
      engagement: 75,
      topics: ['DeFi', 'Development', 'Education'],
      sentiment: 'positive',
      influence: 68
    },
    blockchain: {
      transactionCount: 850,
      defiProtocols: ['Uniswap', 'Aave', 'Compound', 'SushiSwap', 'Yearn'],
      nftCollections: 12,
      governanceParticipation: 15,
      stakingActivity: true
    },
    community: {
      discordServers: ['BuilderDAO', 'DeveloperDAO', 'EthGlobal'],
      forumPosts: 89,
      eventAttendance: 23,
      mentorshipActivity: true
    }
  }

  console.log('Testing Advanced AI Prompts...\n')
  
  try {
    // Test 1: Chain of Thought
    console.log('1. Chain of Thought Analysis:')
    const cotResult = await chainOfThoughtAnalysis(sampleUser)
    console.log(cotResult.substring(0, 200) + '...\n')
    
    // Test 2: Few-Shot Classification
    console.log('2. Few-Shot Classification:')
    const fewShotResult = await fewShotClassification(sampleUser)
    console.log(fewShotResult.substring(0, 200) + '...\n')
    
    // Test 3: Context-Aware Analysis
    console.log('3. Context-Aware Analysis:')
    const contextResult = await contextAwareAnalysis(sampleUser)
    console.log(contextResult.substring(0, 200) + '...\n')
    
    // Test 4: Multi-Perspective Analysis
    console.log('4. Multi-Perspective Analysis:')
    const multiPerspectiveResult = await multiPerspectiveAnalysis(sampleUser)
    console.log('Employer View:', multiPerspectiveResult.employerView.substring(0, 100) + '...\n')
    
    // Test 5: Trend-Aware Analysis
    console.log('5. Trend-Aware Analysis:')
    const currentTrends = [
      'AI integration in DeFi protocols',
      'Zero-knowledge proof adoption',
      'Real-world asset tokenization',
      'Cross-chain interoperability',
      'Sustainable blockchain development'
    ]
    const trendResult = await trendAwareAnalysis(sampleUser, currentTrends)
    console.log(trendResult.substring(0, 200) + '...\n')
    
    console.log('✅ All advanced prompt tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Error testing advanced prompts:', error)
  }
}

// Utility function to estimate token usage
export function estimateTokenUsage(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4)
}

// Cost calculation helper
export function calculatePromptCost(inputTokens: number, outputTokens: number): number {
  // GPT-4o-mini pricing: $0.150/1M input tokens, $0.600/1M output tokens
  const inputCost = (inputTokens / 1000000) * 0.150
  const outputCost = (outputTokens / 1000000) * 0.600
  return inputCost + outputCost
}