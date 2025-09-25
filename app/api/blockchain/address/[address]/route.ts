import { NextRequest, NextResponse } from 'next/server'
import { getCompleteUserData } from '@/lib/blockchain/blockchain-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params

    // Validate address parameter
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    // Validate Sui address format
    if (!/^0x[a-fA-F0-9]{64}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Sui address format' },
        { status: 400 }
      )
    }

    console.log(`🔍 Fetching on-chain data for address: ${address}`)

    // Fetch complete blockchain data
    const blockchainData = await getCompleteUserData(address)

    // Calculate total SUI balance
    const suiBalance = blockchainData.realTimeBalance?.find(b => b.token_symbol === 'SUI')?.balance || 0

    // Get all NFTs
    const allNFTs = blockchainData.nftCollection || []

    // Get most recent transaction timestamp
    const lastActivity = blockchainData.transactionHistory?.[0]?.sui_timestamp

    // Calculate total USD value
    const balanceUsd = blockchainData.realTimeBalance?.find(b => b.token_symbol === 'SUI')?.balance_usd || 0

    // Format response for dashboard display
    const response = {
      address,
      balance: suiBalance.toFixed(4),
      transactionCount: blockchainData.totalTransactions,
      nftCount: blockchainData.totalNFTs,
      balanceUsd: balanceUsd.toFixed(2),
      
      // Other metrics
      lastActivity,
      reputationScore: blockchainData.reputationScore,
      defiProtocolsCount: blockchainData.defiProtocolsCount,
      totalVolume: blockchainData.totalVolume?.toFixed(4) || '0',
      
      // Include actual NFT data for display
      nfts: blockchainData.nftCollection || [],
      
      // Metadata
      metadata: {
        fetchedAt: new Date().toISOString(),
        dataCompleteness: {
          balance: (blockchainData.realTimeBalance?.length || 0) > 0,
          transactions: (blockchainData.transactionHistory?.length || 0) > 0,
          nfts: (blockchainData.nftCollection?.length || 0) > 0,
          defi: (blockchainData.defiActivity?.length || 0) > 0
        }
      }
    }

    console.log(`✅ Successfully fetched on-chain data for ${address}`)
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })

  } catch (error: any) {
    console.error(`❌ Error fetching blockchain data:`, {
      error: error.message,
      stack: error.stack,
      address: (await params)?.address
    })

    // Return a more specific error based on the type
    if (error.message?.includes('Invalid')) {
      return NextResponse.json(
        { 
          error: 'Invalid address format',
          details: error.message 
        },
        { status: 400 }
      )
    }

    if (error.message?.includes('network') || error.message?.includes('timeout')) {
      return NextResponse.json(
        { 
          error: 'Network error - please try again later',
          details: 'Unable to connect to Sui network' 
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch blockchain data',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}