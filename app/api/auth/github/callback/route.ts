import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SocialConnectionService } from '@/lib/db/db-functions'

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!

interface GitHubTokenResponse {
  access_token: string
  token_type: string
  scope: string
}

interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  bio: string | null
  location: string | null
  company: string | null
  blog: string | null
  twitter_username: string | null
}

interface GitHubEmail {
  email: string
  primary: boolean
  verified: boolean
  visibility: string | null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('GitHub OAuth error:', error)
      return NextResponse.redirect(new URL('/profile/setup?error=github_denied', request.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/profile/setup?error=invalid_callback', request.url))
    }

    const cookieStore = await cookies()
    const storedState = cookieStore.get('github_auth_state')?.value
    const userId = cookieStore.get('github_auth_user_id')?.value

    if (!storedState || !userId || storedState !== state) {
      return NextResponse.redirect(new URL('/profile/setup?error=invalid_state', request.url))
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData: GitHubTokenResponse = await tokenResponse.json()

    // Fetch user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data')
    }

    const userData: GitHubUser = await userResponse.json()

    // Fetch user emails
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    let primaryEmail = userData.email
    if (emailsResponse.ok) {
      const emailsData: GitHubEmail[] = await emailsResponse.json()
      const primary = emailsData.find(email => email.primary && email.verified)
      if (primary) {
        primaryEmail = primary.email
      }
    }

    // Store GitHub connection in database
    const profileData = {
      id: userData.id,
      login: userData.login,
      name: userData.name,
      email: primaryEmail,
      avatar_url: userData.avatar_url,
      html_url: userData.html_url,
      public_repos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      bio: userData.bio,
      location: userData.location,
      company: userData.company,
      blog: userData.blog,
      twitter_username: userData.twitter_username,
      access_token: tokenData.access_token, // Store for future API calls
      scope: tokenData.scope,
      connected_at: new Date().toISOString()
    }

    const connection = await SocialConnectionService.upsertSocialConnection(
      userId,
      'github',
      {
        username: userData.login,
        profileData: profileData,
        verified: true // GitHub OAuth automatically verifies
      }
    )

    if (!connection) {
      throw new Error('Failed to save GitHub connection')
    }

    // Clean up cookies
    cookieStore.delete('github_auth_state')
    cookieStore.delete('github_auth_user_id')

    // Redirect back to profile setup with success
    return NextResponse.redirect(new URL('/profile/setup?github=connected', request.url))

  } catch (error) {
    console.error('GitHub callback error:', error)
    
    // Clean up cookies on error
    const cookieStore = await cookies()
    cookieStore.delete('github_auth_state')
    cookieStore.delete('github_auth_user_id')
    
    return NextResponse.redirect(new URL('/profile/setup?error=github_failed', request.url))
  }
}