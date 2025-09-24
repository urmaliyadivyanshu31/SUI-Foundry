import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/core/supabase'
import { openai } from '@/lib/ai/openai'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  size: number
  created_at: string
  updated_at: string
  pushed_at: string
  topics: string[]
  has_wiki: boolean
  has_pages: boolean
  has_projects: boolean
  archived: boolean
  disabled: boolean
  fork: boolean
}

interface CodeSample {
  filename: string
  content: string
  language: string
}

interface RepositoryAnalysis {
  repository: GitHubRepo
  codeQuality: number
  architectureScore: number
  documentationScore: number
  testingScore: number
  securityScore: number
  innovationScore: number
  overallScore: number
  feedback: string
  skillsIdentified: string[]
  improvementSuggestions: string[]
}

interface UserAnalysis {
  totalScore: number
  developerScore: number // Code quality score (0-100)
  repositoryCount: number
  languageDistribution: Record<string, number>
  skillsProfile: string[]
  repositories: RepositoryAnalysis[]
  overallFeedback: string
  careerRecommendations: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin

    // Get user's GitHub connection
    const { data: githubConnection, error: connectionError } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'github')
      .single()

    if (connectionError || !githubConnection) {
      return NextResponse.json(
        { success: false, error: 'GitHub connection not found' },
        { status: 404 }
      )
    }

    const githubData = githubConnection.profile_data
    const accessToken = githubData.access_token

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'GitHub access token not found' },
        { status: 401 }
      )
    }

    console.log(`🔍 Starting AI analysis for GitHub user: ${githubData.login}`)

    // Fetch user's repositories
    const reposResponse = await fetch(
      `https://api.github.com/user/repos?type=owner&sort=updated&per_page=10`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repositories')
    }

    const repositories: GitHubRepo[] = await reposResponse.json()
    console.log(`📦 Found ${repositories.length} repositories`)

    // Filter out forks and focus on original repositories
    const originalRepos = repositories.filter(repo => !repo.fork && !repo.archived)
    
    if (originalRepos.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalScore: 0,
          repositoryCount: 0,
          languageDistribution: {},
          skillsProfile: [],
          repositories: [],
          overallFeedback: "No original repositories found to analyze. Consider creating some original projects to showcase your skills.",
          careerRecommendations: [
            "Create original projects in your preferred programming language",
            "Contribute to open source projects",
            "Document your projects with clear README files"
          ]
        }
      })
    }

    // Analyze top repositories (up to 5 for performance)
    const reposToAnalyze = originalRepos.slice(0, 5)
    const repositoryAnalyses: RepositoryAnalysis[] = []

    for (const repo of reposToAnalyze) {
      console.log(`🔬 Analyzing repository: ${repo.name}`)
      
      try {
        const analysis = await analyzeRepository(repo, accessToken)
        repositoryAnalyses.push(analysis)
      } catch (error) {
        console.error(`❌ Failed to analyze ${repo.name}:`, error)
        // Continue with other repositories
      }
    }

    // Generate overall user analysis
    const userAnalysis = await generateUserAnalysis(repositoryAnalyses, githubData)

    // Store analysis results in database
    await storeAnalysisResults(supabase, userId, userAnalysis)

    console.log(`✅ Analysis complete for ${githubData.login}. Total score: ${userAnalysis.totalScore}`)

    return NextResponse.json({
      success: true,
      data: userAnalysis
    })

  } catch (error) {
    console.error('GitHub analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    )
  }
}

async function analyzeRepository(repo: GitHubRepo, accessToken: string): Promise<RepositoryAnalysis> {
  // Fetch repository contents
  const codeSamples = await fetchCodeSamples(repo.full_name, accessToken)
  
  // Get repository README
  const readme = await fetchReadme(repo.full_name, accessToken)
  
  // Prepare analysis prompt for AI
  const analysisPrompt = `
Analyze this GitHub repository for production-level code quality:

Repository: ${repo.name}
Description: ${repo.description || 'No description'}
Language: ${repo.language || 'Multiple/Unknown'}
Stars: ${repo.stargazers_count}
Forks: ${repo.forks_count}
Topics: ${repo.topics.join(', ')}

README Content:
${readme}

Code Samples:
${codeSamples.map(sample => `
File: ${sample.filename}
Language: ${sample.language}
\`\`\`${sample.language}
${sample.content}
\`\`\`
`).join('\n')}

Please analyze this repository on the following criteria (score each 0-100):

1. Code Quality: Structure, readability, best practices
2. Architecture: Design patterns, organization, scalability
3. Documentation: README quality, code comments, API docs
4. Testing: Test coverage, test quality, CI/CD practices
5. Security: Security practices, vulnerability handling
6. Innovation: Uniqueness, complexity, problem-solving approach

For each criterion, provide:
- Score (0-100)
- Brief explanation (1-2 sentences)

Also identify:
- Programming skills demonstrated
- Improvement suggestions (2-3 specific recommendations)

Respond in JSON format:
{
  "codeQuality": {"score": number, "explanation": "string"},
  "architecture": {"score": number, "explanation": "string"},
  "documentation": {"score": number, "explanation": "string"},
  "testing": {"score": number, "explanation": "string"},
  "security": {"score": number, "explanation": "string"},
  "innovation": {"score": number, "explanation": "string"},
  "skillsIdentified": ["skill1", "skill2", ...],
  "improvementSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "overallFeedback": "comprehensive feedback paragraph"
}
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a senior software engineer and code reviewer. Analyze code repositories for production readiness and provide constructive feedback.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No AI response received')
    }

    const analysisResult = JSON.parse(aiResponse)

    return {
      repository: repo,
      codeQuality: analysisResult.codeQuality.score,
      architectureScore: analysisResult.architecture.score,
      documentationScore: analysisResult.documentation.score,
      testingScore: analysisResult.testing.score,
      securityScore: analysisResult.security.score,
      innovationScore: analysisResult.innovation.score,
      overallScore: Math.round((
        analysisResult.codeQuality.score +
        analysisResult.architecture.score +
        analysisResult.documentation.score +
        analysisResult.testing.score +
        analysisResult.security.score +
        analysisResult.innovation.score
      ) / 6),
      feedback: analysisResult.overallFeedback,
      skillsIdentified: analysisResult.skillsIdentified,
      improvementSuggestions: analysisResult.improvementSuggestions
    }

  } catch (error) {
    console.error(`AI analysis failed for ${repo.name}:`, error)
    // Return basic analysis based on repository metadata
    return {
      repository: repo,
      codeQuality: Math.min(repo.stargazers_count * 10, 80),
      architectureScore: repo.language ? 60 : 40,
      documentationScore: repo.description ? 50 : 30,
      testingScore: 40,
      securityScore: 50,
      innovationScore: Math.min(repo.topics.length * 15, 70),
      overallScore: 50,
      feedback: "Repository analysis completed using metadata. Connect with better access for detailed code analysis.",
      skillsIdentified: repo.language ? [repo.language] : [],
      improvementSuggestions: [
        "Add comprehensive documentation",
        "Implement automated testing",
        "Add security best practices"
      ]
    }
  }
}

async function fetchCodeSamples(repoFullName: string, accessToken: string): Promise<CodeSample[]> {
  try {
    // Get repository contents
    const contentsResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/contents`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    if (!contentsResponse.ok) return []

    const contents = await contentsResponse.json()
    const codeSamples: CodeSample[] = []

    // Look for main files (limit to 3 files for token efficiency)
    const targetFiles = contents
      .filter((item: any) => item.type === 'file' && isCodeFile(item.name))
      .slice(0, 3)

    for (const file of targetFiles) {
      try {
        const fileResponse = await fetch(file.download_url)
        if (fileResponse.ok) {
          const content = await fileResponse.text()
          // Limit content size for AI processing
          const truncatedContent = content.length > 2000 
            ? content.substring(0, 2000) + '\n// ... (truncated)'
            : content

          codeSamples.push({
            filename: file.name,
            content: truncatedContent,
            language: getLanguageFromFilename(file.name)
          })
        }
      } catch (error) {
        console.error(`Failed to fetch file ${file.name}:`, error)
      }
    }

    return codeSamples
  } catch (error) {
    console.error('Failed to fetch code samples:', error)
    return []
  }
}

async function fetchReadme(repoFullName: string, accessToken: string): Promise<string> {
  try {
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/readme`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    if (!readmeResponse.ok) return 'No README found'

    const readmeData = await readmeResponse.json()
    const content = Buffer.from(readmeData.content, 'base64').toString('utf-8')
    
    // Limit README size for AI processing
    return content.length > 1500 
      ? content.substring(0, 1500) + '\n... (truncated)'
      : content

  } catch (error) {
    return 'README not accessible'
  }
}

async function generateUserAnalysis(repositories: RepositoryAnalysis[], githubData: any): Promise<UserAnalysis> {
  const totalRepos = repositories.length
  if (totalRepos === 0) {
    return {
      totalScore: 0,
      repositoryCount: 0,
      languageDistribution: {},
      skillsProfile: [],
      repositories: [],
      overallFeedback: "No repositories available for analysis.",
      careerRecommendations: ["Create original projects to showcase your skills"]
    }
  }

  // Calculate weighted scores
  const avgCodeQuality = repositories.reduce((sum, repo) => sum + repo.codeQuality, 0) / totalRepos
  const avgArchitecture = repositories.reduce((sum, repo) => sum + repo.architectureScore, 0) / totalRepos
  const avgDocumentation = repositories.reduce((sum, repo) => sum + repo.documentationScore, 0) / totalRepos
  const avgTesting = repositories.reduce((sum, repo) => sum + repo.testingScore, 0) / totalRepos
  const avgSecurity = repositories.reduce((sum, repo) => sum + repo.securityScore, 0) / totalRepos
  const avgInnovation = repositories.reduce((sum, repo) => sum + repo.innovationScore, 0) / totalRepos

  // Calculate developer score (0-100) based on CODE QUALITY, not vanity metrics
  // 90% weight on actual code quality
  const codeQualityWeight = 0.25
  const architectureWeight = 0.20
  const documentationWeight = 0.15
  const testingWeight = 0.15
  const securityWeight = 0.15
  const innovationWeight = 0.10

  // Calculate weighted average (0-100)
  const developerScore = Math.round(
    avgCodeQuality * codeQualityWeight +
    avgArchitecture * architectureWeight +
    avgDocumentation * documentationWeight +
    avgTesting * testingWeight +
    avgSecurity * securityWeight +
    avgInnovation * innovationWeight
  )

  // Map to database constraint range (300-850)
  // Base score: 300 (minimum, just for connecting GitHub)
  // Developer quality: up to 500 points (based on code quality 0-100 -> 0-500)
  // Activity bonus: up to 50 points (based on repo count)
  const baseScore = 300 // Minimum for connecting GitHub
  const qualityScore = Math.round((developerScore / 100) * 500) // 0-500 based on code quality
  const activityBonus = Math.min(50, Math.round((githubData.public_repos / 10) * 50)) // Max 50 points, scaled by repo count
  const totalScore = Math.min(850, baseScore + qualityScore + activityBonus) // Cap at 850

  // Aggregate skills
  const allSkills = repositories.flatMap(repo => repo.skillsIdentified)
  const uniqueSkills = [...new Set(allSkills)]

  // Language distribution
  const languageDistribution: Record<string, number> = {}
  repositories.forEach(repo => {
    const lang = repo.repository.language
    if (lang) {
      languageDistribution[lang] = (languageDistribution[lang] || 0) + 1
    }
  })

  return {
    totalScore,
    developerScore, // The actual code quality score (0-100)
    repositoryCount: totalRepos,
    languageDistribution,
    skillsProfile: uniqueSkills,
    repositories,
    overallFeedback: generateOverallFeedback(avgCodeQuality, avgArchitecture, avgDocumentation, avgTesting, avgSecurity, avgInnovation),
    careerRecommendations: generateCareerRecommendations(avgCodeQuality, avgArchitecture, avgDocumentation, avgTesting, avgSecurity, uniqueSkills)
  }
}

function generateOverallFeedback(codeQuality: number, architecture: number, documentation: number, testing: number, security: number, innovation: number): string {
  const strengths = []
  const improvements = []

  if (codeQuality >= 70) strengths.push("strong code quality")
  else improvements.push("code structure and best practices")

  if (architecture >= 70) strengths.push("solid architecture")
  else improvements.push("software architecture and design patterns")

  if (documentation >= 70) strengths.push("excellent documentation")
  else improvements.push("project documentation and README quality")

  if (testing >= 70) strengths.push("good testing practices")
  else improvements.push("automated testing and test coverage")

  if (security >= 70) strengths.push("security awareness")
  else improvements.push("security practices and vulnerability handling")

  if (innovation >= 70) strengths.push("innovative problem-solving")
  else improvements.push("creative problem-solving and project uniqueness")

  let feedback = "Based on the analysis of your repositories, "

  if (strengths.length > 0) {
    feedback += `you demonstrate ${strengths.join(", ")}. `
  }

  if (improvements.length > 0) {
    feedback += `Areas for improvement include: ${improvements.join(", ")}. `
  }

  feedback += "Continue building diverse projects to showcase your full potential as a developer."

  return feedback
}

function generateCareerRecommendations(codeQuality: number, architecture: number, documentation: number, testing: number, security: number, skills: string[]): string[] {
  const recommendations = []

  if (codeQuality < 70) {
    recommendations.push("Focus on writing cleaner, more maintainable code following industry best practices")
  }

  if (architecture < 70) {
    recommendations.push("Study software design patterns and system architecture principles")
  }

  if (documentation < 60) {
    recommendations.push("Improve project documentation and create comprehensive README files")
  }

  if (testing < 60) {
    recommendations.push("Learn test-driven development and implement automated testing in your projects")
  }

  if (security < 60) {
    recommendations.push("Study application security fundamentals and implement security best practices")
  }

  if (skills.length < 3) {
    recommendations.push("Expand your technology stack by learning new programming languages and frameworks")
  }

  // Always include at least one recommendation
  if (recommendations.length === 0) {
    recommendations.push("Continue building innovative projects to further demonstrate your expertise")
  }

  return recommendations.slice(0, 5) // Limit to 5 recommendations
}

async function storeAnalysisResults(supabase: any, userId: string, analysis: UserAnalysis) {
  try {
    // Update or create reputation score record
    const { error: reputationError } = await supabase
      .from('reputation_scores')
      .upsert({
        user_id: userId,
        total_score: analysis.totalScore,
        developer_score: analysis.developerScore || 0, // Actual code quality score (0-100)
        social_score: 0, // Will be calculated separately
        defi_score: 0, // Will be calculated separately
        ai_analysis: {
          repositoryCount: analysis.repositoryCount,
          skillsProfile: analysis.skillsProfile,
          languageDistribution: analysis.languageDistribution,
          overallFeedback: analysis.overallFeedback,
          careerRecommendations: analysis.careerRecommendations,
          lastAnalyzed: new Date().toISOString()
        },
        calculated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (reputationError) {
      console.error('Failed to update reputation score:', reputationError)
    } else {
      console.log('✅ Reputation score updated successfully')
    }

    // Store detailed repository analyses (you might want to create a separate table for this)
    // For now, we'll store it in the ai_analysis JSON field above

  } catch (error) {
    console.error('Failed to store analysis results:', error)
  }
}

function isCodeFile(filename: string): boolean {
  const codeExtensions = ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt']
  return codeExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

function getLanguageFromFilename(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'jsx': 'javascript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin'
  }
  return languageMap[extension || ''] || 'text'
}