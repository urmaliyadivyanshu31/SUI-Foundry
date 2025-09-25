import { NextRequest, NextResponse } from 'next/server'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { Transaction } from '@mysten/sui/transactions'
import { suiClient } from '@/lib/core/sui'
import { withErrorHandler, ValidationError, BlockchainError } from '@/lib/core/error-handler'
import { DatabaseManager } from '@/lib/db/db-functions'

// POST /api/nft/mint-sponsored - Mint NFT with admin wallet paying gas fees
export const POST = withErrorHandler(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { name, profileImage, description = 'SuiDentity Reputation Card', userAddress, userContext } = body
    
    if (!name || !profileImage || !userAddress) {
      throw new ValidationError('Name, profile image, and user address are required')
    }

    if (!userContext || !userContext.id) {
      throw new ValidationError('User context is required')
    }

    // Get admin credentials from environment
    const adminPrivateKey = process.env.SUI_ADMIN_PRIVATE_KEY
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID
    const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID

    if (!adminPrivateKey || !packageId || !registryId) {
      throw new BlockchainError('Admin wallet or contract configuration not found')
    }

    // Create admin keypair from private key
    const adminKeypair = Ed25519Keypair.fromSecretKey(adminPrivateKey)
    const adminAddress = adminKeypair.getPublicKey().toSuiAddress()

    console.log('Admin address:', adminAddress)
    console.log('Minting NFT for user:', userAddress)

    // Create transaction
    const tx = new Transaction()
    
    // Set the recipient to the user's address
    tx.setSender(adminAddress)

    // Get admin cap ID from environment  
    const adminCapId = process.env.NEXT_PUBLIC_ADMIN_CAP_ID

    if (!adminCapId) {
      throw new BlockchainError('Admin capability ID not configured')
    }

    // Create empty VecMap by constructing it via Move call
    const emptySocialLinks = tx.moveCall({
      target: '0x2::vec_map::empty',
      typeArguments: ['0x1::string::String', '0x1::string::String']
    })

    const emptyMetadata = tx.moveCall({
      target: '0x2::vec_map::empty', 
      typeArguments: ['0x1::string::String', '0x1::string::String']
    })

    // Call the mint_reputation_card_for_user function with admin capabilities
    tx.moveCall({
      target: `${packageId}::reputation_nft::mint_reputation_card_for_user`,
      arguments: [
        tx.object(adminCapId), // admin_cap
        tx.pure.address(userAddress), // user_address
        tx.pure.string(name), // name
        tx.pure.string(profileImage), // profile_image
        tx.pure.string(description), // description
        tx.pure.u64(500), // initial_score (default 500)
        tx.pure.vector('string', []), // initial_tags (empty for now)
        emptySocialLinks, // initial_social_links (empty VecMap)
        tx.pure.vector('string', []), // initial_achievements (empty for now)
        emptyMetadata, // initial_metadata (empty VecMap)
        tx.sharedObjectRef({
          objectId: '0x6', // Clock object
          initialSharedVersion: '1',
          mutable: false
        }),
        tx.object(registryId) // Card registry
      ]
    })

    // Sign and execute transaction with admin wallet
    const txResult = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: adminKeypair,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true
      }
    })

    console.log('Transaction result:', txResult)

    if (txResult.effects?.status?.status !== 'success') {
      throw new BlockchainError(`Transaction failed: ${txResult.effects?.status?.error}`)
    }

    // Extract NFT object ID from transaction effects
    let nftObjectId = null
    if (txResult.effects?.created) {
      for (const created of txResult.effects.created) {
        if (created.reference?.objectId) {
          // Check if this is the NFT by examining the object changes
          const objectChange = txResult.objectChanges?.find(
            change => change.type === 'created' && change.objectId === created.reference?.objectId
          )
          if (objectChange && objectChange.type === 'created' && 
              objectChange.objectType?.includes('ReputationCard')) {
            nftObjectId = created.reference.objectId
            break
          }
        }
      }
    }

    // Fallback: try to get from object changes
    if (!nftObjectId && txResult.objectChanges) {
      for (const change of txResult.objectChanges) {
        if (change.type === 'created' && change.objectType?.includes('ReputationCard')) {
          nftObjectId = change.objectId
          break
        }
      }
    }

    if (!nftObjectId) {
      console.warn('Could not extract NFT object ID from transaction result')
    }

    // Store NFT record in database using userContext
    let nftStored = false
    if (nftObjectId) {
      try {
        nftStored = await DatabaseManager.addIdentityNFT(userContext.id, {
          nftId: nftObjectId,
          objectId: nftObjectId,
          metadataUri: `ipfs://metadata/${nftObjectId}` // Placeholder metadata URI
        })
      } catch (dbError) {
        console.warn('Failed to store NFT in database:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        nft_id: nftObjectId,
        transaction_digest: txResult.digest,
        admin_address: adminAddress,
        recipient_address: userAddress,
        stored_locally: nftStored,
        gas_paid_by: 'admin'
      }
    })

  } catch (error) {
    console.error('Sponsored minting error:', error)
    throw error
  }
})