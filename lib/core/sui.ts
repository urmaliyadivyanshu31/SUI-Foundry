import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { Transaction } from '@mysten/sui/transactions'

// Sui client configuration
const network = process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
export const suiClient = new SuiClient({ url: getFullnodeUrl(network) })

// Package configuration
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || ''

// Sui utilities
export class SuiUtils {
  static async getBalance(address: string): Promise<number> {
    try {
      const balance = await suiClient.getBalance({
        owner: address,
        coinType: '0x2::sui::SUI',
      })
      return parseInt(balance.totalBalance) / 1000000000 // Convert MIST to SUI
    } catch (error) {
      console.error('Error getting SUI balance:', error)
      return 0
    }
  }

  static async getOwnedObjects(address: string) {
    try {
      const objects = await suiClient.getOwnedObjects({
        owner: address,
        options: {
          showType: true,
          showContent: true,
          showDisplay: true,
        },
      })
      return objects.data
    } catch (error) {
      console.error('Error getting owned objects:', error)
      return []
    }
  }

  static async getTransactionHistory(address: string, limit = 10) {
    try {
      const transactions = await suiClient.queryTransactionBlocks({
        filter: {
          FromAddress: address,
        },
        limit,
        options: {
          showEffects: true,
          showInput: true,
          showEvents: true,
        },
      })
      return transactions.data
    } catch (error) {
      console.error('Error getting transaction history:', error)
      return []
    }
  }

  static async getTransactionCount(address: string): Promise<number> {
    try {
      const transactions = await suiClient.queryTransactionBlocks({
        filter: {
          FromAddress: address,
        },
        limit: 1000, // Get more for accurate count
      })
      return transactions.data.length
    } catch (error) {
      console.error('Error getting transaction count:', error)
      return 0
    }
  }

  static formatSuiAddress(address: string): string {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  static formatSuiAmount(amount: string | number): string {
    const amountNum = typeof amount === 'string' ? parseInt(amount) : amount
    return (amountNum / 1000000000).toFixed(4) // Convert MIST to SUI with 4 decimals
  }
}

// Identity NFT utilities
export class IdentityNFT {
  static async mint(
    userAddress: string,
    metadata: {
      name: string
      description: string
      image: string
      reputation_score: number
      social_connections: string[]
      wallet_address: string
    }
  ) {
    // This will be implemented when smart contracts are deployed
    console.log('Minting identity NFT for:', userAddress, metadata)
    
    // For now, return a mock NFT ID
    return {
      nftId: `identity_nft_${Date.now()}`,
      objectId: `0x${Math.random().toString(16).slice(2)}`,
      metadataUri: `https://api.suidentity.xyz/metadata/${userAddress}`
    }
  }

  static async updateMetadata(
    nftId: string,
    newMetadata: any
  ) {
    // This will be implemented when smart contracts are deployed
    console.log('Updating NFT metadata:', nftId, newMetadata)
    return true
  }

  static async transfer(
    nftId: string,
    fromAddress: string,
    toAddress: string
  ) {
    // This will be implemented when smart contracts are deployed
    console.log('Transferring NFT:', nftId, 'from', fromAddress, 'to', toAddress)
    return true
  }
}

// Tipping utilities with proper Sui Transaction implementation
export class TippingUtils {
  static async sendTip(
    fromAddress: string,
    toAddress: string,
    amount: number, // Amount in SUI
    message?: string
  ) {
    try {
      if (!this.validateSuiAddress(fromAddress) || !this.validateSuiAddress(toAddress)) {
        throw new Error('Invalid Sui address format')
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }

      // Convert SUI to MIST (1 SUI = 1_000_000_000 MIST)
      const amountInMist = Math.floor(amount * 1_000_000_000)

      // Create transaction block
      const tx = new Transaction()
      
      // Split coin for the exact amount if needed
      const [coin] = tx.splitCoins(tx.gas, [amountInMist])
      
      // Transfer the coin to recipient
      tx.transferObjects([coin], toAddress)
      
      // Add sender address for gas payment
      tx.setSender(fromAddress)

      console.log('✅ Transaction prepared:', {
        from: fromAddress,
        to: toAddress,
        amount: amount,
        amountInMist,
        message
      })
      
      // Return transaction for signing and execution
      return {
        transaction: tx,
        success: true,
        amountInMist,
        message
      }
    } catch (error: any) {
      console.error('❌ Error preparing tip transaction:', error)
      return {
        transaction: null,
        success: false,
        error: error.message
      }
    }
  }

  static async executeTipTransaction(
    transaction: Transaction,
    signAndExecute: (tx: Transaction) => Promise<any>
  ) {
    try {
      const result = await signAndExecute(transaction)
      
      return {
        transactionHash: result.digest,
        success: true,
        effects: result.effects,
        events: result.events
      }
    } catch (error: any) {
      console.error('❌ Error executing tip transaction:', error)
      return {
        transactionHash: null,
        success: false,
        error: error.message
      }
    }
  }

  static validateSuiAddress(address: string): boolean {
    // Basic Sui address validation
    return /^0x[a-fA-F0-9]{64}$/.test(address)
  }
}

export default SuiUtils