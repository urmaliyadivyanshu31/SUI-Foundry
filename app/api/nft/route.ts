import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler, ValidationError, AuthenticationError, BlockchainError } from '@/lib/core/error-handler'
import { mintNFTRequestSchema, updateReputationRequestSchema } from '@/lib/core/validation'
import { createNFTAdapter, checkBackendCompatibility } from '@/lib/blockchain/nft-backend-adapter'
import { DatabaseManager } from '@/lib/db/db-functions'
import { getUserFromRequest } from '@/lib/auth/auth-helpers'

// GET /api/nft - Get user's NFTs
export const GET = withErrorHandler(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('wallet')
    
    if (!walletAddress) {
      throw new ValidationError('Wallet address is required')
    }

    // Get user from request
    const user = await getUserFromRequest(req)
    if (!user) {
      throw new AuthenticationError('User not authenticated')
    }

    // Create adapter for existing backend
    const adapter = await createNFTAdapter()
    
    // Get NFTs from existing backend
    const backendNFTs = await adapter.getNFTsByOwner(walletAddress)
    
    // Get NFTs from local database
    const localNFTs = await DatabaseManager.getIdentityNFTs(user.id)
    
    // Merge and deduplicate NFTs
    const allNFTs = [...backendNFTs, ...localNFTs]
    const uniqueNFTs = allNFTs.filter((nft, index, self) => 
      index === self.findIndex(n => n.nft_id === nft.nft_id)
    )

    return NextResponse.json({
      success: true,
      data: {
        nfts: uniqueNFTs,
        total: uniqueNFTs.length,
        source: 'hybrid' // Both local and backend
      }
    })
  } catch (error) {
    throw error
  }
})

// POST /api/nft - Mint new NFT
export const POST = withErrorHandler(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const validatedData = mintNFTRequestSchema.parse(body)
    
    // Get user from request
    const user = await getUserFromRequest(req)
    if (!user) {
      throw new AuthenticationError('User not authenticated')
    }

    // Create adapter for existing backend
    const adapter = await createNFTAdapter()
    
    // Check backend health
    const isHealthy = await adapter.healthCheck()
    if (!isHealthy) {
      throw new BlockchainError('NFT backend service is currently unavailable')
    }

    // Mint NFT through existing backend
    const mintResult = await adapter.mintIdentityNFT(
      validatedData.wallet_address,
      validatedData.metadata
    )

    // Store NFT record in local database
    const nftStored = await DatabaseManager.addIdentityNFT(user.id, {
      nftId: mintResult.nftId,
      objectId: mintResult.objectId,
      metadataUri: `ipfs://metadata/${mintResult.nftId}` // Adjust based on your metadata storage
    })

    if (!nftStored) {
      console.warn('Failed to store NFT in local database, but minting succeeded')
    }

    return NextResponse.json({
      success: true,
      data: {
        nft_id: mintResult.nftId,
        object_id: mintResult.objectId,
        transaction_digest: mintResult.transactionDigest,
        stored_locally: nftStored
      }
    })
  } catch (error) {
    throw error
  }
})

// PUT /api/nft/[id]/reputation - Update NFT reputation
export const PUT = withErrorHandler(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const validatedData = updateReputationRequestSchema.parse(body)
    
    // Get user from request
    const user = await getUserFromRequest(req)
    if (!user) {
      throw new AuthenticationError('User not authenticated')
    }

    // Extract NFT ID from URL
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/')
    const nftId = pathSegments[pathSegments.indexOf('nft') + 1]
    
    if (!nftId) {
      throw new ValidationError('NFT ID is required')
    }

    // Create adapter for existing backend
    const adapter = await createNFTAdapter()
    
    // Update reputation through existing backend
    const updateResult = await adapter.updateNFTReputation(
      nftId,
      validatedData.new_score
    )

    // Update local database record
    await DatabaseManager.updateIdentityNFT(user.id, nftId, {
      reputation_score: validatedData.new_score,
      updated_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: {
        nft_id: nftId,
        new_reputation_score: validatedData.new_score,
        transaction_digest: updateResult.transactionDigest
      }
    })
  } catch (error) {
    throw error
  }
})