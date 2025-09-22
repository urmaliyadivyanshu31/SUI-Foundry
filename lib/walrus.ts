// Walrus Storage Integration for SuiDentity
// Walrus is a decentralized storage network for Sui

const PUBLISHER_URL = process.env.WALRUS_PUBLISHER_URL || 'https://walrus-testnet-publisher.natsai.xyz'
const AGGREGATOR_URL = process.env.WALRUS_AGGREGATOR_URL || 'https://walrus-testnet-aggregator.natsai.xyz'

export interface WalrusUploadResponse {
  blobId: string
  encodedSize: number
  cost: number
}

export interface WalrusMetadata {
  name: string
  description: string
  image?: string
  reputation_score: number
  social_connections: string[]
  wallet_address: string
  created_at: string
  updated_at: string
}

export class WalrusClient {
  // Upload data to Walrus storage
  static async store(data: any): Promise<WalrusUploadResponse | null> {
    try {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
      
      // Upload to Walrus publisher
      const response = await fetch(`${PUBLISHER_URL}/v1/store`, {
        method: 'POST',
        body: blob,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        blobId: result.blobId,
        encodedSize: result.encodedSize || blob.size,
        cost: result.cost || 0
      }
    } catch (error) {
      console.error('Error uploading to Walrus:', error)
      return null
    }
  }

  // Retrieve data from Walrus storage
  static async retrieve(blobId: string): Promise<any | null> {
    try {
      const response = await fetch(`${AGGREGATOR_URL}/v1/${blobId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error retrieving from Walrus:', error)
      return null
    }
  }

  // Upload image file to Walrus
  static async storeImage(file: File): Promise<WalrusUploadResponse | null> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      // Validate file size (max 10MB for testnet)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      const response = await fetch(`${PUBLISHER_URL}/v1/store`, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        blobId: result.blobId,
        encodedSize: result.encodedSize || file.size,
        cost: result.cost || 0
      }
    } catch (error) {
      console.error('Error uploading image to Walrus:', error)
      return null
    }
  }

  // Get public URL for a blob
  static getBlobUrl(blobId: string): string {
    return `${AGGREGATOR_URL}/v1/${blobId}`
  }

  // Store user profile metadata
  static async storeProfileMetadata(metadata: WalrusMetadata): Promise<string | null> {
    const result = await this.store(metadata)
    return result?.blobId || null
  }

  // Store NFT metadata
  static async storeNFTMetadata(
    name: string,
    description: string,
    imageUrl: string,
    attributes: any[]
  ): Promise<string | null> {
    const metadata = {
      name,
      description,
      image: imageUrl,
      attributes,
      created_at: new Date().toISOString(),
    }
    
    const result = await this.store(metadata)
    return result?.blobId || null
  }

  // Validate blob exists
  static async exists(blobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${AGGREGATOR_URL}/v1/${blobId}`, {
        method: 'HEAD'
      })
      return response.ok
    } catch (error) {
      return false
    }
  }
}

// Helper functions for NFT metadata
export function createNFTMetadata(
  user: {
    username: string
    walletAddress: string
    reputationScore: number
    socialConnections: string[]
  },
  avatarUrl?: string
) {
  return {
    name: `${user.username || 'Anonymous'} Identity`,
    description: `SuiDentity profile for ${user.username || user.walletAddress}. Reputation Score: ${user.reputationScore}/850`,
    image: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.walletAddress}`,
    attributes: [
      {
        trait_type: 'Reputation Score',
        value: user.reputationScore,
        max_value: 850
      },
      {
        trait_type: 'Wallet Address',
        value: user.walletAddress
      },
      {
        trait_type: 'Social Connections',
        value: user.socialConnections.length
      },
      {
        trait_type: 'Connected Platforms',
        value: user.socialConnections.join(', ')
      },
      {
        trait_type: 'Profile Level',
        value: user.reputationScore >= 700 ? 'Expert' : 
               user.reputationScore >= 500 ? 'Advanced' :
               user.reputationScore >= 400 ? 'Intermediate' : 'Beginner'
      }
    ],
    external_url: `https://suidentity.xyz/profile/${user.walletAddress}`,
    animation_url: null,
    created_at: new Date().toISOString()
  }
}

export default WalrusClient