import { APIClient, BlockchainError, ExternalServiceError, retryWithBackoff } from '../core/error-handler'
import { validateEnv } from '../core/validation'
import type { NFTMetadata, IdentityNFT, Transaction } from '../core/validation'

// Configuration for existing backend integration
interface BackendConfig {
  apiUrl: string
  apiKey?: string
  contractPackageId?: string
  network: 'testnet' | 'mainnet' | 'devnet'
}

// Backend API response types (adapt these to match your existing backend)
interface BackendNFTResponse {
  success: boolean
  data: {
    nft_id: string
    object_id: string
    owner: string
    metadata_uri: string
    reputation_score: number
    level: number
    social_connections: string[]
    badges: string[]
    created_at: string
  }
  transaction_digest?: string
  error?: string
}

interface BackendMintRequest {
  wallet_address: string
  metadata: {
    name: string
    description?: string
    image: string
    reputation_score: number
    level: number
    social_connections: string[]
    badges: string[]
  }
}

interface BackendUpdateRequest {
  nft_id: string
  reputation_score?: number
  social_connections?: string[]
  badges?: string[]
}

// Main adapter class for existing NFT backend
export class NFTBackendAdapter {
  private apiClient: APIClient
  private config: BackendConfig

  constructor(config: BackendConfig) {
    this.config = config
    this.apiClient = new APIClient(config.apiUrl)
  }

  // Initialize the adapter with environment configuration
  static async createFromEnv(): Promise<NFTBackendAdapter> {
    try {
      // Try to use existing backend configuration
      const existingBackendUrl = process.env.NEXT_PUBLIC_NFT_BACKEND_URL
      const existingApiKey = process.env.NFT_BACKEND_API_KEY
      const existingPackageId = process.env.NEXT_PUBLIC_EXISTING_PACKAGE_ID

      if (existingBackendUrl) {
        return new NFTBackendAdapter({
          apiUrl: existingBackendUrl,
          apiKey: existingApiKey,
          contractPackageId: existingPackageId,
          network: (process.env.NEXT_PUBLIC_SUI_NETWORK as any) || 'testnet'
        })
      }

      // Fallback to local configuration
      const env = validateEnv()
      return new NFTBackendAdapter({
        apiUrl: '/api', // Use local API endpoints
        contractPackageId: env.NEXT_PUBLIC_PACKAGE_ID,
        network: env.NEXT_PUBLIC_SUI_NETWORK
      })
    } catch (error) {
      throw new ExternalServiceError('NFT Backend', 'Failed to initialize backend adapter', error)
    }
  }

  // Mint a new Identity NFT through existing backend
  async mintIdentityNFT(
    walletAddress: string,
    metadata: NFTMetadata
  ): Promise<{ nftId: string; objectId: string; transactionDigest: string }> {
    try {
      const request: BackendMintRequest = {
        wallet_address: walletAddress,
        metadata: {
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          reputation_score: metadata.reputation_score,
          level: metadata.level,
          social_connections: metadata.social_connections,
          badges: metadata.badges
        }
      }

      const response = await retryWithBackoff(async () => {
        return await this.makeRequest<BackendNFTResponse>('POST', '/nft/mint', request)
      })

      if (!response.success || !response.data) {
        throw new BlockchainError(response.error || 'Failed to mint NFT')
      }

      return {
        nftId: response.data.nft_id,
        objectId: response.data.object_id,
        transactionDigest: response.transaction_digest || ''
      }
    } catch (error) {
      throw new BlockchainError('Failed to mint Identity NFT', error)
    }
  }

  // Update NFT reputation and metadata
  async updateNFTReputation(
    nftId: string,
    reputationScore: number,
    socialConnections?: string[],
    badges?: string[]
  ): Promise<{ transactionDigest: string }> {
    try {
      const request: BackendUpdateRequest = {
        nft_id: nftId,
        reputation_score: reputationScore,
        social_connections: socialConnections,
        badges: badges
      }

      const response = await retryWithBackoff(async () => {
        return await this.makeRequest<BackendNFTResponse>('PUT', `/nft/${nftId}/reputation`, request)
      })

      if (!response.success) {
        throw new BlockchainError(response.error || 'Failed to update NFT reputation')
      }

      return {
        transactionDigest: response.transaction_digest || ''
      }
    } catch (error) {
      throw new BlockchainError('Failed to update NFT reputation', error)
    }
  }

  // Get NFT data by ID
  async getNFTById(nftId: string): Promise<IdentityNFT | null> {
    try {
      const response = await this.makeRequest<BackendNFTResponse>('GET', `/nft/${nftId}`)

      if (!response.success || !response.data) {
        return null
      }

      return {
        id: undefined, // Will be set by database
        user_id: '', // Will be populated by caller
        nft_id: response.data.nft_id,
        object_id: response.data.object_id,
        metadata_uri: response.data.metadata_uri,
        reputation_score: response.data.reputation_score,
        level: response.data.level,
        is_active: true,
        created_at: response.data.created_at
      }
    } catch (error) {
      console.error('Failed to get NFT by ID:', error)
      return null
    }
  }

  // Get all NFTs for a wallet address
  async getNFTsByOwner(walletAddress: string): Promise<IdentityNFT[]> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: any[] }>('GET', `/nft/owner/${walletAddress}`)

      if (!response.success || !response.data) {
        return []
      }

      return response.data.map(nft => ({
        id: undefined,
        user_id: '',
        nft_id: nft.nft_id,
        object_id: nft.object_id,
        metadata_uri: nft.metadata_uri,
        reputation_score: nft.reputation_score,
        level: nft.level,
        is_active: true,
        created_at: nft.created_at
      }))
    } catch (error) {
      console.error('Failed to get NFTs by owner:', error)
      return []
    }
  }

  // Add social connection to NFT
  async addSocialConnection(
    nftId: string,
    platform: string,
    username: string
  ): Promise<{ transactionDigest: string }> {
    try {
      const request = {
        nft_id: nftId,
        platform,
        username
      }

      const response = await retryWithBackoff(async () => {
        return await this.makeRequest<BackendNFTResponse>('POST', `/nft/${nftId}/social`, request)
      })

      if (!response.success) {
        throw new BlockchainError(response.error || 'Failed to add social connection')
      }

      return {
        transactionDigest: response.transaction_digest || ''
      }
    } catch (error) {
      throw new BlockchainError('Failed to add social connection to NFT', error)
    }
  }

  // Award badge to NFT
  async awardBadge(
    nftId: string,
    badgeType: string,
    badgeData: any
  ): Promise<{ transactionDigest: string }> {
    try {
      const request = {
        nft_id: nftId,
        badge_type: badgeType,
        badge_data: badgeData
      }

      const response = await retryWithBackoff(async () => {
        return await this.makeRequest<BackendNFTResponse>('POST', `/nft/${nftId}/badge`, request)
      })

      if (!response.success) {
        throw new BlockchainError(response.error || 'Failed to award badge')
      }

      return {
        transactionDigest: response.transaction_digest || ''
      }
    } catch (error) {
      throw new BlockchainError('Failed to award badge to NFT', error)
    }
  }

  // Get platform statistics
  async getPlatformStats(): Promise<{
    totalNFTs: number
    totalUsers: number
    averageReputation: number
    topUsers: Array<{ address: string; reputation: number }>
  }> {
    try {
      const response = await this.makeRequest<{
        success: boolean
        data: {
          total_nfts: number
          total_users: number
          average_reputation: number
          top_users: Array<{ address: string; reputation: number }>
        }
      }>('GET', '/stats')

      if (!response.success || !response.data) {
        return {
          totalNFTs: 0,
          totalUsers: 0,
          averageReputation: 0,
          topUsers: []
        }
      }

      return {
        totalNFTs: response.data.total_nfts,
        totalUsers: response.data.total_users,
        averageReputation: response.data.average_reputation,
        topUsers: response.data.top_users
      }
    } catch (error) {
      console.error('Failed to get platform stats:', error)
      return {
        totalNFTs: 0,
        totalUsers: 0,
        averageReputation: 0,
        topUsers: []
      }
    }
  }

  // Check if backend is available
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ success: boolean; status: string }>('GET', '/health')
      return response.success && response.status === 'ok'
    } catch (error) {
      console.error('Backend health check failed:', error)
      return false
    }
  }

  // Private method to make API requests with authentication
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
      headers['X-API-Key'] = this.config.apiKey
    }

    const url = `${this.config.apiUrl}${endpoint}`
    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new ExternalServiceError(
        'NFT Backend',
        `HTTP ${response.status}: ${errorText}`,
        { status: response.status, url, method }
      )
    }

    return response.json()
  }
}

// Factory function to create the appropriate adapter
export async function createNFTAdapter(): Promise<NFTBackendAdapter> {
  return NFTBackendAdapter.createFromEnv()
}

// Helper function to check backend compatibility
export async function checkBackendCompatibility(): Promise<{
  isCompatible: boolean
  version?: string
  features: string[]
  recommendations: string[]
}> {
  try {
    const adapter = await createNFTAdapter()
    const isHealthy = await adapter.healthCheck()

    if (!isHealthy) {
      return {
        isCompatible: false,
        features: [],
        recommendations: ['Check backend service availability', 'Verify API credentials']
      }
    }

    // You can extend this to check specific API endpoints and features
    return {
      isCompatible: true,
      version: '1.0.0', // This would come from your backend
      features: [
        'NFT Minting',
        'Reputation Updates',
        'Social Connections',
        'Badge System',
        'Statistics API'
      ],
      recommendations: []
    }
  } catch (error) {
    return {
      isCompatible: false,
      features: [],
      recommendations: [
        'Verify backend configuration',
        'Check API credentials',
        'Ensure network connectivity'
      ]
    }
  }
}

// Migration helper for existing NFT data
export class NFTMigrationHelper {
  private adapter: NFTBackendAdapter

  constructor(adapter: NFTBackendAdapter) {
    this.adapter = adapter
  }

  // Sync existing NFTs to local database
  async syncExistingNFTs(walletAddress: string, userId: string): Promise<IdentityNFT[]> {
    try {
      const existingNFTs = await this.adapter.getNFTsByOwner(walletAddress)
      
      // Update each NFT with local user ID
      return existingNFTs.map(nft => ({
        ...nft,
        user_id: userId
      }))
    } catch (error) {
      console.error('Failed to sync existing NFTs:', error)
      return []
    }
  }

  // Validate NFT data consistency
  async validateNFTConsistency(nftId: string, localData: IdentityNFT): Promise<{
    isConsistent: boolean
    differences: string[]
    recommendations: string[]
  }> {
    try {
      const backendData = await this.adapter.getNFTById(nftId)
      
      if (!backendData) {
        return {
          isConsistent: false,
          differences: ['NFT not found in backend'],
          recommendations: ['Remove from local database or re-mint']
        }
      }

      const differences: string[] = []
      
      if (backendData.reputation_score !== localData.reputation_score) {
        differences.push(`Reputation score mismatch: local=${localData.reputation_score}, backend=${backendData.reputation_score}`)
      }
      
      if (backendData.level !== localData.level) {
        differences.push(`Level mismatch: local=${localData.level}, backend=${backendData.level}`)
      }

      return {
        isConsistent: differences.length === 0,
        differences,
        recommendations: differences.length > 0 ? ['Sync NFT data from backend'] : []
      }
    } catch (error) {
      return {
        isConsistent: false,
        differences: [`Validation failed: ${error}`],
        recommendations: ['Check backend connectivity']
      }
    }
  }
}