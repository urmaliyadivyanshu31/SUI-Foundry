import { NextRequest, NextResponse } from 'next/server'
import { GitHubService } from '@/lib/github'
import { SocialConnectionService } from '@/lib/db-functions'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's GitHub connection
    const connections = await SocialConnectionService.getUserSocialConnections(userId)
    const githubConnection = connections.find(conn => conn.platform === 'github')

    if (!githubConnection) {
      return NextResponse.json({ error: 'GitHub account not connected' }, { status: 404 })
    }

    const { username, profile_data } = githubConnection
    const accessToken = profile_data?.access_token

    // Analyze GitHub profile
    const analysis = await GitHubService.analyzeGitHubProfile(username, accessToken)
    const developerScore = GitHubService.calculateDeveloperScore(analysis)

    // Update the social connection with fresh analysis data
    const updatedProfileData = {
      ...profile_data,
      analysis,
      developer_score: developerScore,
      last_analyzed: new Date().toISOString()
    }

    await SocialConnectionService.upsertSocialConnection(
      userId,
      'github',
      {
        username,
        profileData: updatedProfileData,
        verified: true
      }
    )

    return NextResponse.json({
      success: true,
      analysis,
      developerScore,
      message: 'GitHub profile analyzed successfully'
    })

  } catch (error) {
    console.error('GitHub analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze GitHub profile' },
      { status: 500 }
    )
  }
}