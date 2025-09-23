import { NextRequest } from 'next/server'
import { AuthenticationError, AuthorizationError } from '../core/error-handler'
import { DatabaseManager } from '../db/db-functions'

// Types for user authentication
export interface AuthenticatedUser {
  id: string
  wallet_address?: string
  username?: string
  email?: string
  is_verified: boolean
  created_at: string
}

// Extract user from request headers (Privy integration)
export async function getUserFromRequest(req: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Check for Privy auth token in headers
    const authHeader = req.headers.get('authorization')
    const privyToken = req.headers.get('x-privy-token')
    
    if (!authHeader && !privyToken) {
      return null
    }

    // Extract token from Authorization header or X-Privy-Token header
    const token = authHeader?.replace('Bearer ', '') || privyToken
    
    if (!token) {
      return null
    }

    // In a real implementation, you would verify the Privy JWT token here
    // For now, we'll extract user info from the token payload (unsafe for production)
    const user = await verifyPrivyToken(token)
    
    if (!user) {
      return null
    }

    // Get or create user in database
    const dbUser = await DatabaseManager.getUserByWalletAddress(user.wallet_address)
    
    if (dbUser) {
      return {
        id: dbUser.id,
        wallet_address: dbUser.wallet_address,
        username: dbUser.username,
        email: dbUser.email,
        is_verified: false,
        created_at: dbUser.created_at
      }
    }

    // Create new user if not exists
    const newUser = await DatabaseManager.createUser({
      wallet_address: user.wallet_address,
      username: user.username || `user_${Date.now()}`,
      email: user.email
    })

    if (!newUser) {
      throw new AuthenticationError('Failed to create user account')
    }

    return {
      id: newUser.id,
      wallet_address: newUser.wallet_address,
      username: newUser.username,
      email: newUser.email,
      is_verified: false,
      created_at: newUser.created_at
    }
  } catch (error) {
    console.error('Failed to get user from request:', error)
    return null
  }
}

// Verify Privy JWT token (placeholder implementation)
async function verifyPrivyToken(token: string): Promise<{
  wallet_address: string
  username?: string
  email?: string
} | null> {
  try {
    // This is a placeholder implementation
    // In production, you would verify the JWT with Privy's public key
    
    // For now, we'll decode the JWT payload (unsafe)
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    
    // Extract user information from payload
    return {
      wallet_address: payload.wallet_address || payload.sub,
      username: payload.username,
      email: payload.email
    }
  } catch (error) {
    console.error('Failed to verify Privy token:', error)
    return null
  }
}

// Middleware to require authentication
export function requireAuth<T>(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<T>
) {
  return async (req: NextRequest): Promise<T> => {
    const user = await getUserFromRequest(req)
    
    if (!user) {
      throw new AuthenticationError('Authentication required')
    }

    return handler(req, user)
  }
}

// Middleware to require specific permissions
export function requirePermission<T>(
  permission: string,
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<T>
) {
  return async (req: NextRequest): Promise<T> => {
    const user = await getUserFromRequest(req)
    
    if (!user) {
      throw new AuthenticationError('Authentication required')
    }

    // Check if user has required permission
    const hasPermission = await checkUserPermission(user.id, permission)
    
    if (!hasPermission) {
      throw new AuthorizationError(`Permission required: ${permission}`)
    }

    return handler(req, user)
  }
}

// Check if user has specific permission
async function checkUserPermission(userId: string, permission: string): Promise<boolean> {
  try {
    // For now, we'll implement basic permission checks
    // This could be extended with a full RBAC system
    
    const user = await DatabaseManager.getUserById(userId)
    if (!user) {
      return false
    }

    // Basic permission checks
    switch (permission) {
      case 'mint_nft':
        return true // For now, allow all users to mint
      case 'update_reputation':
        return true // For now, allow all users to update reputation
      case 'admin':
        return user.wallet_address === process.env.ADMIN_WALLET_ADDRESS
      default:
        return true
    }
  } catch (error) {
    console.error('Failed to check user permission:', error)
    return false
  }
}

// Rate limiting helper
export class RateLimiter {
  private static requests: Map<string, { count: number; resetTime: number }> = new Map()

  static async checkRateLimit(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000 // 1 minute
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    const record = this.requests.get(identifier) || { count: 0, resetTime: now + windowMs }

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0
      record.resetTime = now + windowMs
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }

    // Increment counter
    record.count++
    this.requests.set(identifier, record)

    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime
    }
  }

  static async enforceRateLimit(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000
  ): Promise<void> {
    const result = await this.checkRateLimit(identifier, maxRequests, windowMs)
    
    if (!result.allowed) {
      const waitTime = Math.ceil((result.resetTime - Date.now()) / 1000)
      throw new AuthorizationError(
        `Rate limit exceeded. Try again in ${waitTime} seconds.`
      )
    }
  }
}

// Session management helper
export class SessionManager {
  private static sessions: Map<string, {
    userId: string
    walletAddress: string
    createdAt: number
    lastActive: number
  }> = new Map()

  static createSession(userId: string, walletAddress: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()
    
    this.sessions.set(sessionId, {
      userId,
      walletAddress,
      createdAt: now,
      lastActive: now
    })

    return sessionId
  }

  static getSession(sessionId: string): {
    userId: string
    walletAddress: string
    createdAt: number
    lastActive: number
  } | null {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return null
    }

    // Check if session has expired (24 hours)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    if (Date.now() - session.lastActive > maxAge) {
      this.sessions.delete(sessionId)
      return null
    }

    // Update last active time
    session.lastActive = Date.now()
    this.sessions.set(sessionId, session)

    return session
  }

  static destroySession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  static cleanupExpiredSessions(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActive > maxAge) {
        this.sessions.delete(sessionId)
      }
    }
  }
}

// CSRF protection helper
export function generateCSRFToken(): string {
  return `csrf_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.startsWith('csrf_')
}

// Security headers helper
export function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}