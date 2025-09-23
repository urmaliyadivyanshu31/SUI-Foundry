import { NextRequest, NextResponse } from 'next/server'

interface TokenExchangeRequest {
  code: string
  provider: string
  redirectUri: string
  clientId: string
}

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope: string
  token_type: string
  id_token?: string
}

interface GitHubTokenResponse {
  access_token: string
  scope: string
  token_type: string
}

interface TwitterTokenResponse {
  token_type: string
  expires_in: number
  access_token: string
  scope: string
  refresh_token?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TokenExchangeRequest = await request.json()
    const { code, provider, redirectUri, clientId } = body

    if (!code || !provider || !redirectUri || !clientId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    let tokenResponse: any
    let jwt: string | null = null

    switch (provider) {
      case 'google':
        tokenResponse = await exchangeGoogleToken(code, redirectUri, clientId)
        jwt = tokenResponse.id_token
        break
        
      case 'github':
        tokenResponse = await exchangeGitHubToken(code, redirectUri, clientId)
        // GitHub doesn't provide JWT ID tokens, so we'll need to fetch user info
        jwt = await getGitHubUserJWT(tokenResponse.access_token)
        break
        
      case 'twitter':
        tokenResponse = await exchangeTwitterToken(code, redirectUri, clientId)
        jwt = await getTwitterUserJWT(tokenResponse.access_token)
        break
        
      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider}` },
          { status: 400 }
        )
    }

    if (!jwt) {
      return NextResponse.json(
        { error: 'Failed to obtain JWT token' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      jwt,
      access_token: tokenResponse.access_token,
      provider
    })

  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function exchangeGoogleToken(
  code: string,
  redirectUri: string,
  clientId: string
): Promise<GoogleTokenResponse> {
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientSecret) {
    throw new Error('Google client secret not configured')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri
  })

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google token exchange failed: ${error}`)
  }

  return response.json()
}

async function exchangeGitHubToken(
  code: string,
  redirectUri: string,
  clientId: string
): Promise<GitHubTokenResponse> {
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!clientSecret) {
    throw new Error('GitHub client secret not configured')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri
  })

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub token exchange failed: ${error}`)
  }

  return response.json()
}

async function exchangeTwitterToken(
  code: string,
  redirectUri: string,
  clientId: string
): Promise<TwitterTokenResponse> {
  const clientSecret = process.env.TWITTER_CLIENT_SECRET
  if (!clientSecret) {
    throw new Error('Twitter client secret not configured')
  }

  // Twitter OAuth 2.0 with PKCE
  const codeVerifier = getStoredCodeVerifier() // You'll need to implement this
  
  const params = new URLSearchParams({
    client_id: clientId,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  })

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twitter token exchange failed: ${error}`)
  }

  return response.json()
}

async function getGitHubUserJWT(accessToken: string): Promise<string> {
  // Fetch user info from GitHub
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  })

  if (!userResponse.ok) {
    throw new Error('Failed to fetch GitHub user info')
  }

  const userData = await userResponse.json()

  // Create a JWT-like token (this is simplified - in production you'd use proper JWT)
  const payload = {
    iss: 'https://github.com',
    sub: userData.id.toString(),
    aud: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    iat: Math.floor(Date.now() / 1000),
    email: userData.email,
    name: userData.name || userData.login,
    picture: userData.avatar_url,
    login: userData.login
  }

  // In production, sign this with a private key
  return createSimpleJWT(payload)
}

async function getTwitterUserJWT(accessToken: string): Promise<string> {
  // Fetch user info from Twitter
  const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  })

  if (!userResponse.ok) {
    throw new Error('Failed to fetch Twitter user info')
  }

  const { data: userData } = await userResponse.json()

  // Create a JWT-like token
  const payload = {
    iss: 'https://twitter.com',
    sub: userData.id,
    aud: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    iat: Math.floor(Date.now() / 1000),
    name: userData.name,
    username: userData.username,
    picture: userData.profile_image_url
  }

  return createSimpleJWT(payload)
}

function createSimpleJWT(payload: any): string {
  // Simplified JWT creation (in production, use a proper JWT library with signing)
  const header = {
    alg: 'none',
    typ: 'JWT'
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  
  return `${encodedHeader}.${encodedPayload}.`
}

function getStoredCodeVerifier(): string {
  // In production, implement proper code verifier storage/retrieval
  // For now, return a placeholder
  return 'placeholder_code_verifier'
}