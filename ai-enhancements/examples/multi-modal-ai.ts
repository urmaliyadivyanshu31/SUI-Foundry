/**
 * Multi-Modal AI Analysis Examples
 * 
 * Demonstrates how to integrate image, video, and text analysis
 * into the SuiDentity reputation system.
 */

import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface MultiModalAnalysis {
  profileImageAnalysis?: ImageAnalysis
  contentAnalysis?: ContentAnalysis
  videoAnalysis?: VideoAnalysis
  combinedInsights: CombinedInsights
}

export interface ImageAnalysis {
  professionalScore: number // 0-100
  authenticity: number // 0-100
  style: 'professional' | 'casual' | 'artistic' | 'meme'
  elements: string[]
  trustworthiness: number
}

export interface ContentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative'
  topics: string[]
  expertise: string[]
  communication: 'technical' | 'accessible' | 'educational'
  qualityScore: number
}

export interface VideoAnalysis {
  presentationStyle: string
  expertise: string[]
  engagement: number
  authenticity: number
}

export interface CombinedInsights {
  overallAuthenticity: number
  professionalBrand: string
  trustSignals: string[]
  riskFactors: string[]
  recommendations: string[]
}

/**
 * Analyze profile image for professionalism and authenticity
 */
export async function analyzeProfileImage(imageUrl: string): Promise<ImageAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this profile image for Web3 professional reputation assessment:

1. Professionalism (0-100): How professional does this image appear?
2. Authenticity (0-100): Does this appear to be a real person vs AI/stock photo?
3. Style category: professional, casual, artistic, or meme
4. Visual elements present (list key elements)
5. Trustworthiness indicators (0-100)

Respond in JSON format:
{
  "professionalScore": 85,
  "authenticity": 90,
  "style": "professional",
  "elements": ["business attire", "clean background"],
  "trustworthiness": 85
}`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 500
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from vision API')

    return JSON.parse(content)
  } catch (error) {
    console.error('Image analysis error:', error)
    
    // Fallback analysis
    return {
      professionalScore: 50,
      authenticity: 70,
      style: 'casual',
      elements: ['basic profile image'],
      trustworthiness: 60
    }
  }
}

/**
 * Analyze text content for expertise and communication style
 */
export async function analyzeTextContent(
  texts: string[],
  context: 'tweets' | 'github' | 'blog' | 'comments'
): Promise<ContentAnalysis> {
  const combinedText = texts.join('\n---\n').substring(0, 4000) // Limit for cost control

  const prompt = `
Analyze this ${context} content for Web3 reputation assessment:

Content:
${combinedText}

Provide analysis in JSON format:
{
  "sentiment": "positive|neutral|negative",
  "topics": ["topic1", "topic2"],
  "expertise": ["expertise_area1", "expertise_area2"],
  "communication": "technical|accessible|educational",
  "qualityScore": 85
}

Consider:
- Technical depth and accuracy
- Communication clarity
- Thought leadership indicators
- Community engagement quality
- Knowledge sharing value
`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert content analyst specializing in Web3 and technical communication."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from content analysis')

    return JSON.parse(content)
  } catch (error) {
    console.error('Content analysis error:', error)
    
    return {
      sentiment: 'neutral',
      topics: ['general'],
      expertise: ['emerging'],
      communication: 'accessible',
      qualityScore: 60
    }
  }
}

/**
 * Analyze video content (requires video processing setup)
 */
export async function analyzeVideoContent(
  videoUrl: string,
  transcript?: string
): Promise<VideoAnalysis> {
  // Note: This is a simplified example. Real implementation would need:
  // 1. Video frame extraction
  // 2. Audio transcription (if transcript not provided)
  // 3. Frame-by-frame analysis
  
  if (!transcript) {
    console.warn('Video analysis requires transcript - using placeholder')
    return {
      presentationStyle: 'informative',
      expertise: ['blockchain'],
      engagement: 70,
      authenticity: 80
    }
  }

  const prompt = `
Analyze this video transcript for Web3 reputation assessment:

Transcript:
${transcript.substring(0, 2000)}

Assess:
1. Presentation style and quality
2. Technical expertise demonstrated
3. Engagement and communication effectiveness
4. Authenticity and credibility

Respond in JSON:
{
  "presentationStyle": "description",
  "expertise": ["area1", "area2"],
  "engagement": 85,
  "authenticity": 90
}
`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a video content analyst specializing in educational and technical presentations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from video analysis')

    return JSON.parse(content)
  } catch (error) {
    console.error('Video analysis error:', error)
    
    return {
      presentationStyle: 'standard',
      expertise: ['general'],
      engagement: 60,
      authenticity: 70
    }
  }
}

/**
 * Combine multi-modal analysis results
 */
export async function combineMultiModalAnalysis(
  profileImage?: ImageAnalysis,
  content?: ContentAnalysis,
  video?: VideoAnalysis
): Promise<CombinedInsights> {
  const analysisData = {
    profileImage,
    content,
    video,
    hasImage: !!profileImage,
    hasContent: !!content,
    hasVideo: !!video
  }

  const prompt = `
Synthesize these multi-modal analysis results into comprehensive reputation insights:

Analysis Data:
${JSON.stringify(analysisData, null, 2)}

Provide combined insights in JSON format:
{
  "overallAuthenticity": 85,
  "professionalBrand": "Technical Educator",
  "trustSignals": ["consistent expertise", "professional presentation"],
  "riskFactors": ["limited data", "inconsistent messaging"],
  "recommendations": ["increase video content", "improve image quality"]
}

Consider:
- Consistency across modalities
- Professional brand coherence
- Trust and authenticity signals
- Areas for improvement
- Reputation enhancement strategies
`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a reputation analyst expert at synthesizing multi-modal data into actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.4,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from synthesis analysis')

    return JSON.parse(content)
  } catch (error) {
    console.error('Multi-modal synthesis error:', error)
    
    return {
      overallAuthenticity: 70,
      professionalBrand: 'Web3 Enthusiast',
      trustSignals: ['verified accounts'],
      riskFactors: ['limited multi-modal data'],
      recommendations: ['improve content consistency', 'add professional imagery']
    }
  }
}

/**
 * Complete multi-modal reputation analysis
 */
export async function performMultiModalAnalysis(
  data: {
    profileImageUrl?: string
    textContent?: string[]
    videoUrl?: string
    videoTranscript?: string
    contentContext?: 'tweets' | 'github' | 'blog' | 'comments'
  }
): Promise<MultiModalAnalysis> {
  const results: MultiModalAnalysis = {
    combinedInsights: {
      overallAuthenticity: 50,
      professionalBrand: 'Unknown',
      trustSignals: [],
      riskFactors: ['insufficient data'],
      recommendations: ['add more content sources']
    }
  }

  try {
    // Analyze profile image if available
    if (data.profileImageUrl) {
      console.log('Analyzing profile image...')
      results.profileImageAnalysis = await analyzeProfileImage(data.profileImageUrl)
    }

    // Analyze text content if available
    if (data.textContent && data.textContent.length > 0) {
      console.log('Analyzing text content...')
      results.contentAnalysis = await analyzeTextContent(
        data.textContent,
        data.contentContext || 'comments'
      )
    }

    // Analyze video if available
    if (data.videoUrl && data.videoTranscript) {
      console.log('Analyzing video content...')
      results.videoAnalysis = await analyzeVideoContent(data.videoUrl, data.videoTranscript)
    }

    // Combine all analyses
    console.log('Synthesizing multi-modal insights...')
    results.combinedInsights = await combineMultiModalAnalysis(
      results.profileImageAnalysis,
      results.contentAnalysis,
      results.videoAnalysis
    )

    return results
  } catch (error) {
    console.error('Multi-modal analysis error:', error)
    return results
  }
}

/**
 * Example usage and testing
 */
export async function testMultiModalAnalysis() {
  console.log('Testing Multi-Modal AI Analysis...\n')

  const testData = {
    profileImageUrl: 'https://example.com/profile.jpg', // Replace with actual image
    textContent: [
      'Building the future of DeFi with zero-knowledge proofs',
      'Just shipped a new smart contract optimization that reduces gas by 40%',
      'Speaking at @EthGlobal about scaling solutions. The future is multi-chain!'
    ],
    contentContext: 'tweets' as const,
    videoTranscript: 'Hello everyone, today I want to talk about the latest developments in Layer 2 scaling solutions...'
  }

  try {
    const analysis = await performMultiModalAnalysis(testData)
    
    console.log('Multi-Modal Analysis Results:')
    console.log('==============================')
    
    if (analysis.profileImageAnalysis) {
      console.log('\n📸 Profile Image Analysis:')
      console.log(`Professional Score: ${analysis.profileImageAnalysis.professionalScore}/100`)
      console.log(`Authenticity: ${analysis.profileImageAnalysis.authenticity}/100`)
      console.log(`Style: ${analysis.profileImageAnalysis.style}`)
      console.log(`Trust Score: ${analysis.profileImageAnalysis.trustworthiness}/100`)
    }
    
    if (analysis.contentAnalysis) {
      console.log('\n📝 Content Analysis:')
      console.log(`Sentiment: ${analysis.contentAnalysis.sentiment}`)
      console.log(`Quality Score: ${analysis.contentAnalysis.qualityScore}/100`)
      console.log(`Communication Style: ${analysis.contentAnalysis.communication}`)
      console.log(`Expertise Areas: ${analysis.contentAnalysis.expertise.join(', ')}`)
    }
    
    if (analysis.videoAnalysis) {
      console.log('\n🎥 Video Analysis:')
      console.log(`Presentation Style: ${analysis.videoAnalysis.presentationStyle}`)
      console.log(`Engagement: ${analysis.videoAnalysis.engagement}/100`)
      console.log(`Authenticity: ${analysis.videoAnalysis.authenticity}/100`)
    }
    
    console.log('\n🎯 Combined Insights:')
    console.log(`Overall Authenticity: ${analysis.combinedInsights.overallAuthenticity}/100`)
    console.log(`Professional Brand: ${analysis.combinedInsights.professionalBrand}`)
    console.log(`Trust Signals: ${analysis.combinedInsights.trustSignals.join(', ')}`)
    console.log(`Risk Factors: ${analysis.combinedInsights.riskFactors.join(', ')}`)
    console.log('\n💡 Recommendations:')
    analysis.combinedInsights.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`)
    })
    
    console.log('\n✅ Multi-modal analysis completed successfully!')
    
  } catch (error) {
    console.error('❌ Multi-modal analysis test failed:', error)
  }
}

/**
 * Integration with existing reputation system
 */
export function integrateMultiModalScore(
  baseReputationScore: number,
  multiModalAnalysis: MultiModalAnalysis,
  weight: number = 0.15 // 15% weight for multi-modal factors
): number {
  let multiModalScore = 0
  let factorCount = 0

  // Factor in profile image analysis
  if (multiModalAnalysis.profileImageAnalysis) {
    const imageScore = (
      multiModalAnalysis.profileImageAnalysis.professionalScore +
      multiModalAnalysis.profileImageAnalysis.authenticity +
      multiModalAnalysis.profileImageAnalysis.trustworthiness
    ) / 3
    multiModalScore += imageScore
    factorCount++
  }

  // Factor in content analysis
  if (multiModalAnalysis.contentAnalysis) {
    multiModalScore += multiModalAnalysis.contentAnalysis.qualityScore
    factorCount++
  }

  // Factor in video analysis
  if (multiModalAnalysis.videoAnalysis) {
    const videoScore = (
      multiModalAnalysis.videoAnalysis.engagement +
      multiModalAnalysis.videoAnalysis.authenticity
    ) / 2
    multiModalScore += videoScore
    factorCount++
  }

  // Calculate average multi-modal score
  const avgMultiModalScore = factorCount > 0 ? multiModalScore / factorCount : 50

  // Apply to base reputation score
  const adjustment = (avgMultiModalScore - 50) * weight // Neutral is 50
  const adjustedScore = baseReputationScore + adjustment

  // Ensure score stays within valid range (300-850)
  return Math.max(300, Math.min(850, Math.round(adjustedScore)))
}

/**
 * Cost estimation for multi-modal analysis
 */
export function estimateMultiModalCost(
  hasImage: boolean,
  textLength: number,
  hasVideo: boolean
): { totalCost: number; breakdown: Record<string, number> } {
  const costs = {
    image: hasImage ? 0.01 : 0, // GPT-4 Vision cost
    text: (textLength / 1000) * 0.0015, // GPT-4o-mini cost
    video: hasVideo ? 0.005 : 0, // Text analysis of transcript
    synthesis: 0.002 // Final combination
  }

  return {
    totalCost: Object.values(costs).reduce((a, b) => a + b, 0),
    breakdown: costs
  }
}

export default {
  analyzeProfileImage,
  analyzeTextContent,
  analyzeVideoContent,
  combineMultiModalAnalysis,
  performMultiModalAnalysis,
  integrateMultiModalScore,
  estimateMultiModalCost,
  testMultiModalAnalysis
}