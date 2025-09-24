import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/ai/openai'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, userContext, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Use userContext provided by client instead of server-side auth
    // This works with the zkLogin authentication system
    if (!userContext) {
      return NextResponse.json(
        { success: false, error: 'User context is required' },
        { status: 400 }
      )
    }

    // Build system prompt using userContext
    let systemPrompt = `You are SuiDentity AI, an expert Web3 career coach and reputation advisor. You help developers improve their on-chain reputation, find better opportunities, and advance in blockchain careers.

RESPONSE STYLE - BE CASUAL AND NATURAL:
**Visual Structure Requirements:**
- Start with a casual greeting using their username
- Use simple section headers WITHOUT emojis
- Keep it conversational and friendly
- Use bullet points for clarity but keep it natural
- Add line breaks between sections for readability
- End with one clear next step

**Content Structure Template:**
1. Start with: Hey @username!
2. Add profile section: Your Profile Right Now
3. Add improvement areas: Areas to Focus On  
4. End with action: What You Should Do This Week

**Tone & Language:**
- Talk like you're giving advice to a friend
- Be encouraging but honest
- Use "you" and "your" naturally in conversation
- Reference their actual numbers and data
- Make suggestions feel doable
- Keep it real and practical

USER PROFILE:`

    // Add user profile information if available
    if (userContext.profile) {
      systemPrompt += `
• Username: @${userContext.profile.username || 'Anonymous'}
• Wallet: ${userContext.profile.walletAddress || 'Not connected'}
• Reputation: ${userContext.profile.reputationScore || 300}/850 (${userContext.profile.tier || 'Beginner'} tier)
• GitHub: ${userContext.github ? 'Connected' : 'Not connected'}`

      // Add GitHub information if available
      if (userContext.github) {
        systemPrompt += `
• GitHub Profile: @${userContext.github.username} | ${userContext.github.repos} repos | ${userContext.github.followers || 0} followers`

        if (userContext.github.aiAnalysis) {
          systemPrompt += `
• AI ANALYSIS INSIGHTS:
  - Skills: ${userContext.github.aiAnalysis.skillsProfile?.join(', ') || 'None identified'}
  - Languages: ${Object.keys(userContext.github.aiAnalysis.languageDistribution || {}).join(', ') || 'None'}
  - Assessment: ${userContext.github.aiAnalysis.overallFeedback || 'No analysis available'}
  - Recommendations: ${userContext.github.aiAnalysis.careerRecommendations?.join(' | ') || 'None'}`
        } else {
          systemPrompt += `
• AI Analysis: Pending analysis - GitHub connected but code review not complete`
        }
      } else {
        systemPrompt += `
• GitHub: Not connected - recommend linking for enhanced reputation scoring`
      }

      // Add blockchain information
      systemPrompt += `
• Blockchain Activity: ${userContext.blockchain?.baseScore || 0}/100 points
• Wallet Status: ${userContext.blockchain?.hasWallet ? 'Connected' : 'Not connected'}`
    }

    // Add conversation context
    systemPrompt += `

CONTEXT: ${context || 'General career guidance'}`

    if (conversationHistory && conversationHistory.length > 0) {
      systemPrompt += `
CHAT HISTORY: ${conversationHistory.map(msg => `${msg.sender}: ${msg.text}`).join(' | ')}`
    }

    // Add enhanced guidelines
    systemPrompt += `

**RESPONSE FORMAT:**
1. **ALWAYS** start with casual greeting using @username
2. **ALWAYS** include "Your Profile Right Now" section with current status
3. **ALWAYS** create "Areas to Focus On" section with 2-3 specific areas
4. **ALWAYS** end with "What You Should Do This Week" with one clear next step
5. **NEVER** use emojis in headers or content
6. **ALWAYS** use bullet points naturally for lists
7. **ALWAYS** include specific data from their profile (scores, languages, etc.)
8. **ALWAYS** make it conversational and easy to read

**CRITICAL REQUIREMENTS:**
- Keep it under 250 words but make every word count
- Every suggestion must be specific and actionable
- Reference their actual GitHub analysis data
- Use their real reputation scores and blockchain activity
- Make sections clear but without emojis
- End with exactly ONE immediate action
- Sound like a knowledgeable friend giving advice
- Include specific metrics and numbers from their profile

**FORMATTING RULES:**
- Double line breaks between major sections
- Bold headers WITHOUT emojis
- Natural bullet points for lists
- Keep the tone conversational and friendly
- No fancy symbols or icons

BE CASUAL, FRIENDLY, AND HELPFUL - LIKE TALKING TO A FRIEND WHO KNOWS TECH.`

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
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 300,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    return NextResponse.json({
      success: true,
      response: aiResponse
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}