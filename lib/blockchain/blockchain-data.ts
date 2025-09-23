'use client'

import { SuiClient } from '@mysten/sui/client'
import { 
  WalletBalance, 
  WalletTransaction, 
  UserNFT, 
  DeFiInteraction, 
  EnhancedBlockchainData,
  BlockchainDataFetcher 
} from '@/types'

// Sui client configuration
const suiClient = new SuiClient({
  url: process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet' 
    ? 'https://fullnode.mainnet.sui.io:443'
    : 'https://fullnode.testnet.sui.io:443'
})

// Known token types and their metadata
const KNOWN_TOKENS = {
  '0x2::sui::SUI': {
    symbol: 'SUI',
    decimals: 9,
    name: 'Sui',
    coingeckoId: 'sui'
  },
  // Add more tokens as needed
}

// Known DeFi protocols on Sui
const DEFI_PROTOCOLS = {
  // Cetus DEX
  '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb': {
    name: 'Cetus',
    type: 'DEX'
  },
  // Turbos Finance
  '0x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4f38c1109f8f37': {
    name: 'Turbos',
    type: 'DEX'
  },
  // Sui Name Service
  '0xd22b24490e0bae52676651b4f56660a5ff8022a2576e0089f79b3c88d44e08f0': {
    name: 'SuiNS',
    type: 'Domain'
  }
}

class SuiBlockchainDataFetcher implements BlockchainDataFetcher {
  private readonly maxRetries = 3
  private readonly retryDelay = 1000 // 1 second
  private readonly requestTimeout = 30000 // 30 seconds

  // Enhanced error handling and retry logic
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallback?: T
  ): Promise<T> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`${operationName} timeout`)), this.requestTimeout)
        })
        
        const result = await Promise.race([operation(), timeoutPromise])
        return result
      } catch (error: any) {
        const isLastAttempt = attempt === this.maxRetries
        
        console.warn(`${operationName} attempt ${attempt}/${this.maxRetries} failed:`, {
          error: error.message,
          code: error.code,
          isNetworkError: this.isNetworkError(error),
          isRateLimited: this.isRateLimited(error)
        })

        if (isLastAttempt) {
          console.error(`${operationName} failed after ${this.maxRetries} attempts:`, error)
          if (fallback !== undefined) {
            console.info(`Using fallback value for ${operationName}`)
            return fallback
          }
          throw new Error(`${operationName} failed: ${error.message}`)
        }

        // Wait before retry with exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw new Error(`${operationName} exhausted all retries`)
  }

  private isNetworkError(error: any): boolean {
    return error.code === 'NETWORK_ERROR' || 
           error.message?.includes('network') ||
           error.message?.includes('timeout') ||
           error.message?.includes('ECONNRESET')
  }

  private isRateLimited(error: any): boolean {
    return error.status === 429 || 
           error.message?.includes('rate limit') ||
           error.message?.includes('too many requests')
  }

  async getUserBalance(address: string): Promise<WalletBalance[]> {
    return this.executeWithRetry(async () => {
      if (!this.isValidAddress(address)) {
        throw new Error(`Invalid Sui address: ${address}`)
      }

      const balances: WalletBalance[] = []
      
      // Get all coin balances with error handling
      const coinBalances = await suiClient.getAllBalances({
        owner: address
      })

      if (!coinBalances || !Array.isArray(coinBalances)) {
        console.warn(`No balance data returned for address: ${address}`)
        return []
      }

      for (const balance of coinBalances) {
        try {
          const tokenInfo = KNOWN_TOKENS[balance.coinType as keyof typeof KNOWN_TOKENS]
          const symbol = tokenInfo?.symbol || this.extractTokenSymbol(balance.coinType)
          const decimals = tokenInfo?.decimals || 9
          
          // Validate balance data
          if (!balance.totalBalance || isNaN(parseInt(balance.totalBalance))) {
            console.warn(`Invalid balance data for ${balance.coinType}:`, balance)
            continue
          }
          
          // Convert balance to human readable format
          const humanBalance = parseInt(balance.totalBalance) / Math.pow(10, decimals)
          
          // Get USD price with error handling
          let balanceUsd: number | undefined
          try {
            balanceUsd = await this.getTokenPriceUSD(balance.coinType, humanBalance)
          } catch (priceError) {
            console.warn(`Failed to get USD price for ${balance.coinType}:`, priceError)
            balanceUsd = undefined
          }

          balances.push({
            id: `${address}_${balance.coinType}`,
            user_id: '', // Will be set by the calling function
            wallet_address: address,
            token_type: balance.coinType,
            token_symbol: symbol,
            balance: humanBalance,
            balance_usd: balanceUsd,
            last_updated: new Date().toISOString()
          })
        } catch (balanceError) {
          console.warn(`Failed to process balance for ${balance.coinType}:`, balanceError)
          continue
        }
      }

      return balances
    }, 'getUserBalance', [])
  }

  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(address)
  }

  async getUserTransactions(address: string, limit = 50): Promise<WalletTransaction[]> {
    return this.executeWithRetry(async () => {
      if (!this.isValidAddress(address)) {
        throw new Error(`Invalid Sui address: ${address}`)
      }

      // Validate limit parameter
      const validLimit = Math.min(Math.max(1, limit), 100) // Clamp between 1-100
      const transactions: WalletTransaction[] = []
      
      // Get transaction blocks for the address
      const txBlocks = await suiClient.queryTransactionBlocks({
        filter: {
          FromOrToAddress: {
            addr: address
          }
        },
        limit: validLimit,
        order: 'descending',
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: true
        }
      })

      if (!txBlocks?.data || !Array.isArray(txBlocks.data)) {
        console.warn(`No transaction data returned for address: ${address}`)
        return []
      }

      for (const tx of txBlocks.data) {
        try {
          // Validate transaction data
          if (!tx.digest) {
            console.warn('Transaction missing digest, skipping:', tx)
            continue
          }

          const txType = this.determineTransactionType(tx, address)
          const amount = this.extractTransactionAmount(tx, address)
          const gasUsed = this.calculateGasUsed(tx)
          
          transactions.push({
            id: tx.digest,
            user_id: '', // Will be set by the calling function
            transaction_digest: tx.digest,
            transaction_type: txType,
            amount: amount,
            token_type: '0x2::sui::SUI', // Most transactions involve SUI for gas
            from_address: this.extractFromAddress(tx),
            to_address: this.extractToAddress(tx),
            gas_used: gasUsed,
            gas_price: 0, // Simplified
            status: tx.effects?.status?.status === 'success' ? 'success' : 'failed',
            block_number: this.parseBlockNumber(tx.checkpoint),
            timestamp_ms: this.parseTimestamp(tx.timestampMs),
            sui_timestamp: tx.timestampMs ? new Date(parseInt(tx.timestampMs)).toISOString() : undefined,
            events: tx.events || [],
            raw_data: tx,
            indexed_at: new Date().toISOString()
          })
        } catch (txError) {
          console.warn(`Failed to process transaction ${tx.digest}:`, txError)
          continue
        }
      }

      return transactions
    }, 'getUserTransactions', [])
  }

  private calculateGasUsed(tx: any): number {
    try {
      if (!tx.effects?.gasUsed) return 0
      
      const computation = parseInt(tx.effects.gasUsed.computationCost || '0')
      const storage = parseInt(tx.effects.gasUsed.storageCost || '0')
      
      return (computation + storage) / 1e9 // Convert to SUI
    } catch (error) {
      console.warn('Failed to calculate gas used:', error)
      return 0
    }
  }

  private parseBlockNumber(checkpoint: string | undefined): number {
    try {
      return parseInt(checkpoint || '0')
    } catch (error) {
      return 0
    }
  }

  private parseTimestamp(timestampMs: string | undefined): number {
    try {
      return parseInt(timestampMs || '0')
    } catch (error) {
      return 0
    }
  }

  async getUserNFTs(address: string): Promise<UserNFT[]> {
    try {
      const nfts: UserNFT[] = []
      
      // Get all objects owned by the address
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: address,
        filter: {
          StructType: '0x2::display::Display'
        },
        options: {
          showType: true,
          showContent: true,
          showDisplay: true
        }
      })

      for (const obj of ownedObjects.data) {
        if (obj.data?.content?.dataType === 'moveObject') {
          const display = obj.data.display?.data
          const content = obj.data.content
          
          nfts.push({
            id: obj.data.objectId,
            user_id: '', // Will be set by the calling function
            object_id: obj.data.objectId,
            collection_name: display?.collection || this.extractCollectionName(content.type),
            nft_name: display?.name || 'Unknown NFT',
            description: display?.description,
            image_url: display?.image_url,
            creator_address: display?.creator,
            owner_address: address,
            nft_type: content.type,
            attributes: this.parseNFTAttributes(display),
            rarity_score: undefined,
            floor_price: undefined,
            last_sale_price: undefined,
            acquired_at: undefined,
            last_updated: new Date().toISOString(),
            is_owned: true
          })
        }
      }

      return nfts
    } catch (error) {
      console.error('Error fetching user NFTs:', error)
      return []
    }
  }

  async getUserDeFiActivity(address: string): Promise<DeFiInteraction[]> {
    try {
      const defiActivities: DeFiInteraction[] = []
      
      // Get transactions and filter for DeFi interactions
      const transactions = await this.getUserTransactions(address, 100)
      
      for (const tx of transactions) {
        if (this.isDeFiTransaction(tx)) {
          const protocolInfo = this.identifyDeFiProtocol(tx)
          
          if (protocolInfo) {
            defiActivities.push({
              id: tx.transaction_digest,
              user_id: '',
              protocol_name: protocolInfo.name,
              protocol_address: protocolInfo.address,
              interaction_type: this.getDeFiInteractionType(tx),
              transaction_digest: tx.transaction_digest,
              input_tokens: this.extractInputTokens(tx),
              output_tokens: this.extractOutputTokens(tx),
              pool_address: this.extractPoolAddress(tx),
              fees_paid: tx.gas_used,
              volume_usd: await this.calculateVolumeUSD(tx),
              timestamp_ms: tx.timestamp_ms,
              sui_timestamp: tx.sui_timestamp,
              indexed_at: new Date().toISOString()
            })
          }
        }
      }

      return defiActivities
    } catch (error) {
      console.error('Error fetching DeFi activity:', error)
      return []
    }
  }

  async calculateReputationScore(data: EnhancedBlockchainData): Promise<number> {
    let score = 300 // Base score

    // Balance factor (0-100 points)
    const totalBalanceUSD = data.realTimeBalance?.reduce((sum, balance) => 
      sum + (balance.balance_usd || 0), 0) || 0
    score += Math.min(100, Math.floor(totalBalanceUSD / 100)) // 1 point per $100, max 100 points

    // Transaction history factor (0-150 points)
    const txCount = data.transactionHistory?.length || 0
    score += Math.min(150, txCount * 2) // 2 points per transaction, max 150 points

    // NFT ownership factor (0-100 points)
    const nftCount = data.nftCollection?.length || 0
    score += Math.min(100, nftCount * 10) // 10 points per NFT, max 100 points

    // DeFi activity factor (0-200 points)
    const defiCount = data.defiActivity?.length || 0
    score += Math.min(200, defiCount * 5) // 5 points per DeFi interaction, max 200 points

    // Diversity bonus (0-100 points)
    const protocolsUsed = new Set(data.defiActivity?.map(d => d.protocol_name)).size
    score += Math.min(100, protocolsUsed * 20) // 20 points per unique protocol

    // Time factor - bonus for long-term activity
    const oldestTx = data.transactionHistory?.reduce((oldest, tx) => 
      tx.timestamp_ms < oldest ? tx.timestamp_ms : oldest, Date.now())
    if (oldestTx) {
      const daysSinceFirst = (Date.now() - oldestTx) / (1000 * 60 * 60 * 24)
      score += Math.min(100, Math.floor(daysSinceFirst / 30)) // 1 point per month, max 100 points
    }

    return Math.min(850, Math.max(300, score)) // Clamp between 300-850
  }

  // Helper methods
  private extractTokenSymbol(tokenType: string): string {
    const parts = tokenType.split('::')
    return parts[parts.length - 1].toUpperCase()
  }

  private async getTokenPriceUSD(tokenType: string, amount: number): Promise<number | undefined> {
    // Simplified price fetching - in production, use a real price API
    if (tokenType === '0x2::sui::SUI') {
      // Mock SUI price - in production, fetch from CoinGecko or similar
      return amount * 2.5 // Placeholder $2.5 per SUI
    }
    return undefined
  }

  private determineTransactionType(tx: any, userAddress: string): WalletTransaction['transaction_type'] {
    // Simplified transaction type detection
    if (tx.transaction?.data?.messageVersion === 'v1') {
      return 'contract_call'
    }
    return 'sent' // Default
  }

  private extractTransactionAmount(tx: any, userAddress: string): number | undefined {
    // Extract transaction amount from balance changes
    const balanceChanges = tx.effects?.balanceChanges
    if (balanceChanges) {
      for (const change of balanceChanges) {
        if (change.owner?.AddressOwner === userAddress) {
          return Math.abs(parseInt(change.amount)) / 1e9 // Convert to SUI
        }
      }
    }
    return undefined
  }

  private extractFromAddress(tx: any): string | undefined {
    return tx.transaction?.data?.sender
  }

  private extractToAddress(tx: any): string | undefined {
    // Extract recipient from transaction data
    const gasPayment = tx.transaction?.data?.gasData?.payment
    return gasPayment?.[0]?.owner?.AddressOwner
  }

  private extractCollectionName(nftType: string): string {
    const parts = nftType.split('::')
    return parts[1] || 'Unknown Collection'
  }

  private parseNFTAttributes(display: any): any {
    // Parse NFT attributes from display data
    const attributes: any = {}
    if (display) {
      Object.keys(display).forEach(key => {
        if (!['name', 'description', 'image_url', 'creator'].includes(key)) {
          attributes[key] = display[key]
        }
      })
    }
    return attributes
  }

  private isDeFiTransaction(tx: WalletTransaction): boolean {
    // Check if transaction involves known DeFi protocols
    return tx.to_address ? Object.keys(DEFI_PROTOCOLS).includes(tx.to_address) : false
  }

  private identifyDeFiProtocol(tx: WalletTransaction): { name: string; address: string } | null {
    if (tx.to_address && DEFI_PROTOCOLS[tx.to_address as keyof typeof DEFI_PROTOCOLS]) {
      return {
        name: DEFI_PROTOCOLS[tx.to_address as keyof typeof DEFI_PROTOCOLS].name,
        address: tx.to_address
      }
    }
    return null
  }

  private getDeFiInteractionType(tx: WalletTransaction): DeFiInteraction['interaction_type'] {
    // Simplified interaction type detection
    return 'swap' // Default
  }

  private extractInputTokens(tx: WalletTransaction): any[] {
    return [] // Simplified
  }

  private extractOutputTokens(tx: WalletTransaction): any[] {
    return [] // Simplified
  }

  private extractPoolAddress(tx: WalletTransaction): string | undefined {
    return undefined // Simplified
  }

  private async calculateVolumeUSD(tx: WalletTransaction): Promise<number | undefined> {
    if (tx.amount && tx.token_type === '0x2::sui::SUI') {
      return tx.amount * 2.5 // Simplified USD calculation
    }
    return undefined
  }
}

// Create singleton instance
export const blockchainDataFetcher = new SuiBlockchainDataFetcher()

// Utility function to get complete user blockchain data with comprehensive error handling
export async function getCompleteUserData(address: string): Promise<EnhancedBlockchainData> {
  console.log(`🔍 Fetching complete blockchain data for address: ${address}`)
  
  if (!address || !/^0x[a-fA-F0-9]{64}$/.test(address)) {
    throw new Error(`Invalid Sui address format: ${address}`)
  }

  // Fetch data with individual error handling to ensure partial success
  const results = await Promise.allSettled([
    blockchainDataFetcher.getUserBalance(address),
    blockchainDataFetcher.getUserTransactions(address),
    blockchainDataFetcher.getUserNFTs(address),
    blockchainDataFetcher.getUserDeFiActivity(address)
  ])

  // Extract results with fallbacks
  const balances = results[0].status === 'fulfilled' ? results[0].value : []
  const transactions = results[1].status === 'fulfilled' ? results[1].value : []
  const nfts = results[2].status === 'fulfilled' ? results[2].value : []
  const defiActivity = results[3].status === 'fulfilled' ? results[3].value : []

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const operations = ['getUserBalance', 'getUserTransactions', 'getUserNFTs', 'getUserDeFiActivity']
      console.error(`❌ ${operations[index]} failed for ${address}:`, result.reason)
    }
  })

  // Calculate derived metrics safely
  let totalVolume = 0
  try {
    totalVolume = transactions.reduce((sum, tx) => {
      const amount = tx.amount || 0
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  } catch (error) {
    console.warn('Failed to calculate total volume:', error)
  }

  let defiProtocolsCount = 0
  try {
    defiProtocolsCount = new Set(
      defiActivity
        .map(d => d.protocol_name)
        .filter(name => name && typeof name === 'string')
    ).size
  } catch (error) {
    console.warn('Failed to calculate DeFi protocols count:', error)
  }

  // Calculate reputation score with error handling
  let reputationScore = 300 // Default base score
  try {
    reputationScore = await blockchainDataFetcher.calculateReputationScore({
      walletAddress: address,
      realTimeBalance: balances,
      transactionHistory: transactions,
      nftCollection: nfts,
      defiActivity: defiActivity
    } as EnhancedBlockchainData)
  } catch (error) {
    console.error('Failed to calculate reputation score:', error)
  }

  const enhancedData: EnhancedBlockchainData = {
    walletAddress: address,
    realTimeBalance: balances,
    transactionHistory: transactions,
    nftCollection: nfts,
    defiActivity: defiActivity,
    totalTransactions: transactions.length,
    totalVolume,
    totalNFTs: nfts.length,
    defiProtocolsCount,
    reputationScore
  }

  console.log(`✅ Blockchain data fetch completed for ${address}:`, {
    balances: balances.length,
    transactions: transactions.length,
    nfts: nfts.length,
    defiActivity: defiActivity.length,
    reputationScore
  })

  return enhancedData
}

export default blockchainDataFetcher