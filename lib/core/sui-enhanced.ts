import { Transaction } from '@mysten/sui/transactions'
import { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client'
import { suiClient } from './sui'

// Constants
export const SUI_DECIMALS = 9
export const MIST_PER_SUI = 1_000_000_000
export const DEFAULT_GAS_BUDGET = 10_000_000 // 0.01 SUI

// Transaction builder utilities
export class SuiTransactionBuilder {
  private tx: Transaction
  private client: SuiClient

  constructor() {
    this.tx = new Transaction()
    this.client = suiClient
  }

  // Transfer SUI tokens
  transferSui(recipient: string, amount: number): SuiTransactionBuilder {
    // Convert SUI to MIST
    const amountInMist = Math.floor(amount * MIST_PER_SUI)
    
    // Split coins and transfer
    const [coin] = this.tx.splitCoins(this.tx.gas, [amountInMist])
    this.tx.transferObjects([coin], recipient)
    
    return this
  }

  // Transfer specific object
  transferObject(objectId: string, recipient: string): SuiTransactionBuilder {
    this.tx.transferObjects([this.tx.object(objectId)], recipient)
    return this
  }

  // Set gas budget
  setGasBudget(budget: number): SuiTransactionBuilder {
    this.tx.setGasBudget(budget)
    return this
  }

  // Set sender
  setSender(address: string): SuiTransactionBuilder {
    this.tx.setSender(address)
    return this
  }

  // Build the transaction
  async build(): Promise<Transaction> {
    return this.tx
  }

  // Get transaction for direct use
  getTransaction(): Transaction {
    return this.tx
  }
}

// Query utilities
export class SuiQueryUtils {
  public client: SuiClient

  constructor() {
    this.client = suiClient
  }

  // Get detailed balance info
  async getDetailedBalance(address: string) {
    try {
      const balances = await this.client.getAllBalances({ owner: address })
      
      // Process each coin type
      const processedBalances = balances.map(balance => ({
        coinType: balance.coinType,
        symbol: this.getCoinSymbol(balance.coinType),
        totalBalance: parseInt(balance.totalBalance) / MIST_PER_SUI,
        lockedBalance: balance.lockedBalance 
          ? parseInt(balance.lockedBalance.toString()) / MIST_PER_SUI 
          : 0
      }))
      
      // Get SUI balance specifically
      const suiBalance = processedBalances.find(
        b => b.coinType === '0x2::sui::SUI'
      )
      
      return {
        sui: suiBalance?.totalBalance || 0,
        allBalances: processedBalances,
        totalValueInSui: suiBalance?.totalBalance || 0 // Could calculate USD value
      }
    } catch (error) {
      console.error('Error getting detailed balance:', error)
      return {
        sui: 0,
        allBalances: [],
        totalValueInSui: 0
      }
    }
  }

  // Get coin symbol from type
  private getCoinSymbol(coinType: string): string {
    if (coinType === '0x2::sui::SUI') return 'SUI'
    
    // Extract symbol from type (simplified)
    const match = coinType.match(/::([^:]+)::/g)
    if (match && match.length > 0) {
      return match[match.length - 1].replace(/::/g, '').toUpperCase()
    }
    
    return 'UNKNOWN'
  }

  // Get transaction history with details
  async getTransactionHistory(
    address: string,
    limit = 20
  ): Promise<SuiTransactionBlockResponse[]> {
    try {
      const { data } = await this.client.queryTransactionBlocks({
        filter: { FromAddress: address },
        limit,
        options: {
          showEffects: true,
          showEvents: true,
          showInput: true,
          showObjectChanges: true
        }
      })
      
      return data
    } catch (error) {
      console.error('Error getting transaction history:', error)
      return []
    }
  }

  // Get staking information
  async getStakingInfo(address: string) {
    try {
      const stakes = await this.client.getStakes({ owner: address })
      
      const totalStaked = stakes.reduce((sum, stake) => {
        return sum + (parseInt((stake as any).principal || '0') / MIST_PER_SUI)
      }, 0)
      
      const rewards = stakes.reduce((sum, stake) => {
        const estimatedReward = parseInt((stake as any).estimatedReward || '0')
        return sum + (estimatedReward / MIST_PER_SUI)
      }, 0)
      
      return {
        totalStaked,
        estimatedRewards: rewards,
        activeStakes: stakes.length,
        stakes: stakes.map(stake => ({
          validatorAddress: (stake as any).validatorAddress,
          principal: parseInt((stake as any).principal || '0') / MIST_PER_SUI,
          estimatedReward: parseInt((stake as any).estimatedReward || '0') / MIST_PER_SUI,
          stakeActiveEpoch: (stake as any).stakeActiveEpoch,
          stakeRequestEpoch: (stake as any).stakeRequestEpoch
        }))
      }
    } catch (error) {
      console.error('Error getting staking info:', error)
      return {
        totalStaked: 0,
        estimatedRewards: 0,
        activeStakes: 0,
        stakes: []
      }
    }
  }

  // Get NFTs owned by address
  async getNFTs(address: string) {
    try {
      const objects = await this.client.getOwnedObjects({
        owner: address,
        filter: {
          MatchNone: [
            { StructType: '0x2::coin::Coin' }
          ]
        },
        options: {
          showType: true,
          showContent: true,
          showDisplay: true
        }
      })
      
      // Filter for likely NFTs (non-coin objects with display)
      const nfts = objects.data.filter(obj => {
        const hasDisplay = obj.data?.display?.data
        const isNotCoin = !obj.data?.type?.includes('::coin::Coin')
        return hasDisplay && isNotCoin
      })
      
      return nfts.map(nft => ({
        objectId: nft.data?.objectId || '',
        type: nft.data?.type || '',
        name: nft.data?.display?.data?.name || 'Unknown NFT',
        description: nft.data?.display?.data?.description || '',
        image: nft.data?.display?.data?.image_url || '',
        attributes: nft.data?.content?.fields || {}
      }))
    } catch (error) {
      console.error('Error getting NFTs:', error)
      return []
    }
  }

  // Check if address has enough balance for transaction
  async canAffordTransaction(
    address: string,
    amount: number,
    gasBudget = DEFAULT_GAS_BUDGET
  ): Promise<boolean> {
    const balance = await this.getDetailedBalance(address)
    const totalNeeded = amount + (gasBudget / MIST_PER_SUI)
    return balance.sui >= totalNeeded
  }

  // Estimate gas for transaction
  async estimateGas(tx: Transaction): Promise<number> {
    try {
      // Dry run the transaction to get gas estimate
      const result = await this.client.dryRunTransactionBlock({
        transactionBlock: await tx.build({ client: this.client })
      })
      
      const gasUsed = result.effects.gasUsed
      const totalGas = parseInt(gasUsed.computationCost) + 
                      parseInt(gasUsed.storageCost) - 
                      parseInt(gasUsed.storageRebate)
      
      // Add 20% buffer
      return Math.ceil(totalGas * 1.2)
    } catch (error) {
      console.error('Error estimating gas:', error)
      return DEFAULT_GAS_BUDGET
    }
  }
}

// Format utilities
export class SuiFormatUtils {
  // Format SUI amount with proper decimals
  static formatSuiAmount(amount: number | string, decimals = 4): string {
    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
    
    if (amountNum < 0.0001) {
      return '<0.0001 SUI'
    }
    
    return `${amountNum.toFixed(decimals)} SUI`
  }

  // Format MIST to SUI
  static mistToSui(mist: number | string): number {
    const mistNum = typeof mist === 'string' ? parseInt(mist) : mist
    return mistNum / MIST_PER_SUI
  }

  // Format SUI to MIST
  static suiToMist(sui: number): number {
    return Math.floor(sui * MIST_PER_SUI)
  }

  // Format address for display
  static formatAddress(address: string, length = 6): string {
    if (!address) return ''
    if (address.length <= length * 2) return address
    return `${address.slice(0, length)}...${address.slice(-length)}`
  }

  // Format transaction digest
  static formatDigest(digest: string): string {
    if (!digest) return ''
    return `${digest.slice(0, 8)}...${digest.slice(-6)}`
  }

  // Format timestamp
  static formatTimestamp(timestamp: number | string): string {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
    return new Date(ts).toLocaleString()
  }

  // Format gas cost
  static formatGasCost(gasUsed: any): string {
    const computationCost = parseInt(gasUsed.computationCost || '0')
    const storageCost = parseInt(gasUsed.storageCost || '0')
    const storageRebate = parseInt(gasUsed.storageRebate || '0')
    
    const totalCost = computationCost + storageCost - storageRebate
    const costInSui = totalCost / MIST_PER_SUI
    
    return `${costInSui.toFixed(6)} SUI`
  }
}

// Export singleton instances
export const suiTransactionBuilder = () => new SuiTransactionBuilder()
export const suiQuery = new SuiQueryUtils()
export const suiFormat = SuiFormatUtils