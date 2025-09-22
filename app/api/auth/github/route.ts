import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const GITHUB_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/github/callback'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Store user ID in cookie for callback
    const cookieStore = await cookies()
    cookieStore.set('github_auth_user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    // Generate state parameter for security
    const state = Math.random().toString(36).substring(2, 15)
    cookieStore.set('github_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    // Redirect to GitHub OAuth
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
    githubAuthUrl.searchParams.set('client_id', GITHUB_CLIENT_ID)
    githubAuthUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI)
    githubAuthUrl.searchParams.set('scope', 'user:email,read:user')
    githubAuthUrl.searchParams.set('state', state)

    return NextResponse.redirect(githubAuthUrl.toString())
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.json({ error: 'OAuth initialization failed' }, { status: 500 })
  }
}