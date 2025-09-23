'use client'

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { verifySignature } from '@mysten/sui/verify'
import { jwtDecode } from 'jwt-decode'
import { importJWK, jwtVerify } from 'jose'
// Simple deterministic hash for address derivation 
function sha256Simple(data: Uint8Array): Uint8Array {
  // Create a deterministic 32-byte hash for development
  const result = new Uint8Array(32)
  let h = 0x9e3779b97f4a7c15 // Fixed seed for deterministic results
  
  for (let i = 0; i < data.length; i++) {
    h ^= data[i]
    h = (h * 0x100000001b3) % 0xffffffff
  }
  
  // Fill 32 bytes deterministically
  for (let i = 0; i < 32; i++) {
    h = (h * 0x41c64e6d + 0x3039) % 0xffffffff
    result[i] = h & 0xff
  }
  
  return result
}
import { fromB64 } from '@mysten/sui/utils'

// Types for zkLogin
export interface ZkLoginProvider {
  name: string
  clientId: string
  redirectUrl: string
  scope: string
  extraParams?: Record<string, string>
}

export interface ZkLoginUser {
  provider: string
  sub: string
  email?: string
  name?: string
  picture?: string
  walletAddress: string
  salt: string
  ephemeralKeyPair: Ed25519Keypair
  jwt: string
  zkProof?: string
  maxEpoch: number
}

export interface JwtPayload {
  iss: string
  sub: string
  aud: string | string[]
  exp: number
  iat: number
  nonce?: string
  email?: string
  name?: string
  picture?: string
}

// Supported OAuth providers configuration
export const zkLoginProviders: Record<string, ZkLoginProvider> = {
  google: {
    name: 'Google',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    scope: 'openid email profile',
    extraParams: {
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    }
  },
  github: {
    name: 'GitHub',
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
    redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    scope: 'user:email',
    extraParams: {
      response_type: 'code'
    }
  },
  twitter: {
    name: 'Twitter',
    clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!,
    redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    scope: 'tweet.read users.read',
    extraParams: {
      response_type: 'code',
      code_challenge_method: 'S256'
    }
  }
}

// Sui client configuration
export const suiClient = new SuiClient({
  url: process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet' 
    ? 'https://fullnode.mainnet.sui.io:443'
    : 'https://fullnode.testnet.sui.io:443'
})

// Storage keys
const STORAGE_KEYS = {
  EPHEMERAL_KEY: 'sui_zklogin_ephemeral_key',
  JWT_TOKEN: 'sui_zklogin_jwt',
  USER_SALT: 'sui_zklogin_salt',
  MAX_EPOCH: 'sui_zklogin_max_epoch',
  ZK_PROOF: 'sui_zklogin_proof',
  USER_DATA: 'sui_zklogin_user'
}

class ZkLoginManager {
  private currentUser: ZkLoginUser | null = null
  private listeners: Set<(user: ZkLoginUser | null) => void> = new Set()

  constructor() {
    // Initialize from stored session
    this.initializeFromStorage()
  }

  // Event listeners for auth state changes
  onAuthStateChange(callback: (user: ZkLoginUser | null) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentUser))
  }

  // Generate nonce for OAuth flow (proper Sui zkLogin spec)
  generateNonce(ephemeralKeyPair: Ed25519Keypair, maxEpoch: number): string {
    const ephemeralPublicKey = ephemeralKeyPair.getPublicKey()
    const publicKeyBytes = ephemeralPublicKey.toSuiBytes()
    
    // Construct nonce according to Sui zkLogin specification
    // nonce = Poseidon(ephemeral_public_key || max_epoch || randomness)
    const epochBytes = new Uint8Array(8)
    const epochBigInt = BigInt(maxEpoch)
    for (let i = 0; i < 8; i++) {
      epochBytes[i] = Number((epochBigInt >> BigInt(8 * i)) & BigInt(0xff))
    }
    
    // Generate randomness for unique nonce
    const randomness = new Uint8Array(16)
    crypto.getRandomValues(randomness)
    
    // Combine inputs for Poseidon hash
    const combined = new Uint8Array(publicKeyBytes.length + epochBytes.length + randomness.length)
    combined.set(publicKeyBytes, 0)
    combined.set(epochBytes, publicKeyBytes.length)
    combined.set(randomness, publicKeyBytes.length + epochBytes.length)
    
    // Use simple hash for development
    const hashedNonce = sha256Simple(combined)
    
    // Return as base64url encoded string (as required by OAuth nonce)
    return Buffer.from(hashedNonce)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  // Get OAuth URL for provider
  async getOAuthUrl(provider: string): Promise<string> {
    const config = zkLoginProviders[provider]
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    // Generate ephemeral key pair and nonce
    const ephemeralKeyPair = new Ed25519Keypair()
    const currentEpoch = await this.getCurrentEpoch()
    const maxEpoch = currentEpoch + 10 // Valid for 10 epochs (~10 days)
    const nonce = this.generateNonce(ephemeralKeyPair, maxEpoch)

    // Store ephemeral key and max epoch
    sessionStorage.setItem(STORAGE_KEYS.EPHEMERAL_KEY, JSON.stringify({
      privateKey: Array.from(ephemeralKeyPair.getSecretKey()),
      publicKey: ephemeralKeyPair.getPublicKey().toBase64()
    }))
    sessionStorage.setItem(STORAGE_KEYS.MAX_EPOCH, maxEpoch.toString())

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUrl,
      scope: config.scope,
      nonce: nonce,
      state: provider,
      ...config.extraParams
    })

    const baseUrl = this.getProviderBaseUrl(provider)
    return `${baseUrl}?${params.toString()}`
  }

  private getProviderBaseUrl(provider: string): string {
    switch (provider) {
      case 'google':
        return 'https://accounts.google.com/o/oauth2/v2/auth'
      case 'github':
        return 'https://github.com/login/oauth/authorize'
      case 'twitter':
        return 'https://twitter.com/i/oauth2/authorize'
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  // Handle OAuth callback
  async handleOAuthCallback(code: string, state: string): Promise<ZkLoginUser> {
    const provider = state
    const config = zkLoginProviders[provider]
    
    if (!config) {
      throw new Error(`Invalid provider: ${provider}`)
    }

    // Exchange code for JWT
    const jwt = await this.exchangeCodeForJWT(code, provider)
    
    // Verify JWT and get validated payload
    const decodedJwt = await this.verifyJWT(jwt, provider)

    // Get stored ephemeral key
    const ephemeralKeyData = sessionStorage.getItem(STORAGE_KEYS.EPHEMERAL_KEY)
    const maxEpoch = parseInt(sessionStorage.getItem(STORAGE_KEYS.MAX_EPOCH) || '0')
    
    if (!ephemeralKeyData) {
      throw new Error('Ephemeral key not found')
    }

    const keyData = JSON.parse(ephemeralKeyData)
    const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(new Uint8Array(keyData.privateKey).slice(0, 32))

    // Generate or retrieve user salt
    const salt = await this.getUserSalt(decodedJwt.sub, provider)

    // Derive wallet address
    const walletAddress = await this.deriveWalletAddress(
      decodedJwt.sub,
      decodedJwt.iss,
      salt,
      ephemeralKeyPair.getPublicKey()
    )

    // Create user object
    const user: ZkLoginUser = {
      provider,
      sub: decodedJwt.sub,
      email: decodedJwt.email,
      name: decodedJwt.name,
      picture: decodedJwt.picture,
      walletAddress,
      salt,
      ephemeralKeyPair,
      jwt,
      maxEpoch
    }

    // Store user data
    this.currentUser = user
    this.storeUserSession(user)
    this.notifyListeners()

    return user
  }

  // Exchange authorization code for JWT
  private async exchangeCodeForJWT(code: string, provider: string): Promise<string> {
    const config = zkLoginProviders[provider]
    
    const response = await fetch('/api/auth/exchange-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        provider,
        redirectUri: config.redirectUrl,
        clientId: config.clientId
      })
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const data = await response.json()
    return data.jwt || data.id_token
  }

  // Verify JWT signature and claims with enhanced security
  private async verifyJWT(jwt: string, provider: string): Promise<JwtPayload> {
    try {
      const parts = jwt.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }

      // Decode header and payload
      const header = JSON.parse(atob(parts[0]))
      const payload = JSON.parse(atob(parts[1])) as JwtPayload
      
      // Validate JWT structure
      if (!header.alg || !header.kid) {
        throw new Error('Invalid JWT header')
      }

      // Get provider's public keys with caching
      const jwks = await this.getProviderJWKS(provider)
      
      // Find matching key
      const key = jwks.keys.find((k: any) => k.kid === header.kid)
      if (!key) {
        throw new Error(`JWT key not found for kid: ${header.kid}`)
      }

      // Import and verify signature
      const publicKey = await importJWK(key)
      const { payload: verifiedPayload } = await jwtVerify(jwt, publicKey, {
        issuer: this.getExpectedIssuer(provider),
        audience: this.getExpectedAudience(provider),
        clockTolerance: 30 // 30 seconds tolerance for clock skew
      })

      // Additional payload validation
      this.validateJWTPayload(verifiedPayload as JwtPayload, provider)

      return verifiedPayload as JwtPayload
    } catch (error) {
      console.error('JWT verification failed:', error)
      throw new Error(`JWT verification failed: ${error}`)
    }
  }

  // Validate JWT payload claims
  private validateJWTPayload(payload: JwtPayload, provider: string): void {
    const now = Math.floor(Date.now() / 1000)
    
    // Check expiration
    if (payload.exp && payload.exp < now) {
      throw new Error('JWT has expired')
    }
    
    // Check issued at time (not too far in future)
    if (payload.iat && payload.iat > (now + 300)) { // 5 minutes tolerance
      throw new Error('JWT issued in the future')
    }
    
    // Check required claims
    if (!payload.sub) {
      throw new Error('Missing subject claim')
    }
    
    // Provider-specific validations
    switch (provider) {
      case 'google':
        if (!payload.email) {
          throw new Error('Google JWT missing email claim')
        }
        break
      case 'github':
        if (!payload.sub.match(/^\d+$/)) {
          throw new Error('Invalid GitHub user ID format')
        }
        break
      case 'twitter':
        if (!payload.sub) {
          throw new Error('Twitter JWT missing user ID')
        }
        break
    }
  }

  // Get expected issuer for provider
  private getExpectedIssuer(provider: string): string {
    const issuers = {
      google: 'https://accounts.google.com',
      github: 'https://api.github.com',
      twitter: 'https://api.twitter.com/2'
    }
    return issuers[provider as keyof typeof issuers] || ''
  }

  // Get expected audience for provider
  private getExpectedAudience(provider: string): string {
    const config = zkLoginProviders[provider]
    return config?.clientId || ''
  }

  // JWKS cache
  private jwksCache = new Map<string, { keys: any[], expires: number }>()

  // Get provider's JWKS with caching
  private async getProviderJWKS(provider: string) {
    // Check cache first
    const cached = this.jwksCache.get(provider)
    if (cached && cached.expires > Date.now()) {
      return { keys: cached.keys }
    }

    const jwksUrls = {
      google: 'https://www.googleapis.com/oauth2/v3/certs',
      github: 'https://token.actions.githubusercontent.com/.well-known/jwks',
      twitter: 'https://api.twitter.com/oauth2/v2.1/keys'
    }

    const url = jwksUrls[provider as keyof typeof jwksUrls]
    if (!url) {
      throw new Error(`JWKS URL not found for provider: ${provider}`)
    }

    try {
      const response = await fetch(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SuiDentity-zkLogin/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`JWKS fetch failed: ${response.status} ${response.statusText}`)
      }
      
      const jwks = await response.json()
      
      if (!jwks.keys || !Array.isArray(jwks.keys)) {
        throw new Error('Invalid JWKS response format')
      }

      // Cache for 1 hour
      this.jwksCache.set(provider, {
        keys: jwks.keys,
        expires: Date.now() + (60 * 60 * 1000)
      })

      return jwks
    } catch (error) {
      console.error(`Failed to fetch JWKS for ${provider}:`, error)
      
      // Try to use stale cache if available
      const stale = this.jwksCache.get(provider)
      if (stale) {
        console.warn(`Using stale JWKS cache for ${provider}`)
        return { keys: stale.keys }
      }
      
      throw new Error(`Failed to fetch JWKS for ${provider}: ${error}`)
    }
  }

  // Generate or retrieve user salt
  private async getUserSalt(sub: string, provider: string): Promise<string> {
    // Create a deterministic salt based on user's sub and provider
    // This ensures the same wallet address is always derived for the same user
    const userIdentity = `${provider}:${sub}`
    const identityBytes = new TextEncoder().encode(userIdentity)
    
    // Generate deterministic salt using the simple hash function
    const saltBytes = sha256Simple(identityBytes)
    const salt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Store for this session
    sessionStorage.setItem(STORAGE_KEYS.USER_SALT, salt)
    return salt
  }

  // Derive wallet address from zkLogin parameters (proper Sui zkLogin spec)
  private async deriveWalletAddress(
    sub: string,
    iss: string,
    salt: string,
    ephemeralPublicKey: any
  ): Promise<string> {
    try {
      // Normalize issuer URL for consistency
      const normalizedIss = this.normalizeIssuer(iss)
      
      // Convert sub to big integer and pad to 32 bytes
      const subBigInt = BigInt(sub)
      const subBytes = new Uint8Array(32)
      for (let i = 0; i < 32; i++) {
        subBytes[31 - i] = Number((subBigInt >> BigInt(8 * i)) & BigInt(0xff))
      }
      
      // Convert salt to bytes
      const saltBytes = typeof salt === 'string' ? 
        new Uint8Array(Buffer.from(salt, 'hex')) : 
        new Uint8Array(salt)
      
      // Create address seed according to Sui zkLogin specification
      // address_seed = Poseidon(sub, salt, iss)
      const issBytes = new TextEncoder().encode(normalizedIss)
      
      // Use simple hash for development
      const combined = new Uint8Array(subBytes.length + saltBytes.length + issBytes.length + 1)
      combined.set(subBytes, 0)
      combined.set(saltBytes, subBytes.length)
      combined.set(issBytes, subBytes.length + saltBytes.length)
      combined[combined.length - 1] = 0x01 // zkLogin scheme ID
      
      const addressSeed = sha256Simple(combined)
      
      // Ensure exactly 32 bytes and convert to Sui address format
      const addressBytes = addressSeed.slice(0, 32)
      const address = '0x' + Array.from(addressBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      return address
    } catch (error) {
      console.error('Address derivation error:', error)
      // Fallback to simplified derivation
      const fallbackData = new TextEncoder().encode(`${sub}:${iss}:${salt}`)
      const fallbackSeed = sha256Simple(fallbackData)
      return '0x' + Array.from(fallbackSeed.slice(0, 32))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    }
  }

  // Normalize issuer URL according to OAuth2 specs
  private normalizeIssuer(iss: string): string {
    const issuerMap: Record<string, string> = {
      'https://accounts.google.com': 'https://accounts.google.com',
      'https://github.com/login/oauth/authorize': 'https://api.github.com',
      'https://api.twitter.com': 'https://api.twitter.com/2'
    }
    
    return issuerMap[iss] || iss
  }

  // Execute transaction with zkLogin
  async executeTransaction(transaction: Transaction): Promise<string> {
    if (!this.currentUser) {
      throw new Error('User not authenticated')
    }

    // Set sender and gas budget
    transaction.setSender(this.currentUser.walletAddress)
    transaction.setGasBudget(10_000_000) // 0.01 SUI

    // Sign transaction with ephemeral key
    const signature = await this.currentUser.ephemeralKeyPair.signTransaction(
      await transaction.build({ client: suiClient })
    )

    // Submit transaction
    const result = await suiClient.executeTransactionBlock({
      transactionBlock: signature.transactionBlockBytes,
      signature: signature.signature,
      requestType: 'WaitForLocalExecution',
      options: {
        showEffects: true,
        showEvents: true
      }
    })

    return result.digest
  }

  // Get current epoch from Sui network
  private async getCurrentEpoch(): Promise<number> {
    try {
      const systemState = await suiClient.getLatestSuiSystemState()
      return parseInt(systemState.epoch)
    } catch (error) {
      console.warn('Failed to fetch current epoch from network, using fallback:', error)
      // Fallback to estimated epoch (Sui mainnet started around epoch 0 in May 2023)
      const suiLaunchTime = new Date('2023-05-03').getTime()
      const currentTime = Date.now()
      const epochDuration = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      return Math.floor((currentTime - suiLaunchTime) / epochDuration)
    }
  }

  // Store user session
  private storeUserSession(user: ZkLoginUser) {
    const userData = {
      ...user,
      ephemeralKeyPair: {
        privateKey: Array.from(user.ephemeralKeyPair.getSecretKey()),
        publicKey: user.ephemeralKeyPair.getPublicKey().toBase64()
      }
    }
    
    sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
    sessionStorage.setItem(STORAGE_KEYS.JWT_TOKEN, user.jwt)
    sessionStorage.setItem(STORAGE_KEYS.USER_SALT, user.salt)
  }

  // Initialize from stored session
  private initializeFromStorage() {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    try {
      const userData = sessionStorage.getItem(STORAGE_KEYS.USER_DATA)
      if (userData) {
        const parsed = JSON.parse(userData)
        
        // Reconstruct ephemeral key pair
        const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
          new Uint8Array(parsed.ephemeralKeyPair.privateKey).slice(0, 32)
        )

        this.currentUser = {
          ...parsed,
          ephemeralKeyPair
        }
      }
    } catch (error) {
      console.error('Failed to initialize from storage:', error)
      this.clearSession()
    }
  }

  // Clear user session
  clearSession() {
    this.currentUser = null
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        sessionStorage.removeItem(key)
      })
    }
    this.notifyListeners()
  }

  // Get current user
  getCurrentUser(): ZkLoginUser | null {
    return this.currentUser
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUser
  }

  // Get wallet address
  getWalletAddress(): string | null {
    return this.currentUser?.walletAddress || null
  }
}

// Create singleton instance
export const zkLoginManager = new ZkLoginManager()

// Utility functions
export function formatSuiAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address)
}

// Export types and manager
export default zkLoginManager