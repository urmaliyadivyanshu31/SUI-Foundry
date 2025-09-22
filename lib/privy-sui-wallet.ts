import { blake2b } from '@noble/hashes/blake2'
import { messageWithIntent } from '@mysten/sui/cryptography'
import { Transaction } from '@mysten/sui/transactions'
import { SuiClient } from '@mysten/sui/client'
import { suiClient } from './sui'

// Type definitions for Privy wallet operations
interface PrivyWallet {
  address: string
  chainType: 'solana' | 'ethereum' | 'sui'
  imported: boolean
  walletClientType: 'privy'
}

interface RawSignatureResponse {
  signature: string
  publicKey: string
}

interface TransactionResult {
  digest: string
  effects: any
  events: any[]
  confirmed: boolean
}

// Convert bytes to hex string
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Convert hex string to bytes
function fromHex(hex: string): Uint8Array {
  const cleanHex = hex.replace(/^0x/, '')
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16)
  }
  return bytes
}

export class PrivySuiWallet {
  private privyUser: any
  private suiClient: SuiClient

  constructor(privyUser: any) {
    this.privyUser = privyUser
    this.suiClient = suiClient
  }

  // Get embedded Sui wallet from Privy
  getEmbeddedWallet(): PrivyWallet | null {
    if (!this.privyUser?.wallet) return null
    
    // Privy creates embedded wallets for all supported chains
    // For Sui, we need to check if a Sui wallet exists
    const wallets = this.privyUser.linkedAccounts?.filter(
      (account: any) => account.type === 'wallet'
    ) || []
    
    // Find Sui wallet or use the primary embedded wallet
    const suiWallet = wallets.find((w: any) => w.chainType === 'sui')
    if (suiWallet) return suiWallet
    
    // If no specific Sui wallet, use the embedded wallet address
    // Privy uses the same key derivation for Ed25519
    if (this.privyUser.wallet?.address) {
      return {
        address: this.privyUser.wallet.address,
        chainType: 'sui',
        imported: false,
        walletClientType: 'privy'
      }
    }
    
    return null
  }

  // Get wallet address
  getAddress(): string | null {
    const wallet = this.getEmbeddedWallet()
    return wallet?.address || null
  }

  // Sign a transaction using Privy's raw signing
  async signTransaction(tx: Transaction): Promise<string> {
    try {
      // Build the transaction
      const txBytes = await tx.build({ client: this.suiClient })
      
      // Create intent message for Sui transaction
      const intentMessage = messageWithIntent(
        'TransactionData',
        txBytes
      )
      
      // Hash with blake2b (32 bytes for Sui)
      const digest = blake2b(intentMessage, { dkLen: 32 })
      
      // Convert to hex for Privy signing
      const hashToSign = '0x' + toHex(digest)
      
      // Call Privy's raw signing endpoint
      // This would need to be implemented through an API route
      const response = await this.signWithPrivy(hashToSign)
      
      // Create serialized signature for Sui
      // Note: In production, you'd need to properly construct the PublicKey object
      // For now, we'll just return the signature as a hex string
      const signatureBytes = fromHex(response.signature)
      const publicKeyBytes = fromHex(response.publicKey)
      
      // Combine signature and public key (Ed25519 format)
      const combinedSignature = new Uint8Array(signatureBytes.length + publicKeyBytes.length + 1)
      combinedSignature[0] = 0x00 // Signature scheme flag for Ed25519
      combinedSignature.set(signatureBytes, 1)
      combinedSignature.set(publicKeyBytes, signatureBytes.length + 1)
      
      const txSignature = '0x' + toHex(combinedSignature)
      
      return txSignature
    } catch (error) {
      console.error('Error signing transaction:', error)
      throw new Error('Failed to sign transaction')
    }
  }

  // Sign raw data with Privy (needs API implementation)
  private async signWithPrivy(message: string): Promise<RawSignatureResponse> {
    // This needs to call Privy's server-side API for raw signing
    // Since Privy doesn't expose raw signing on client-side,
    // we need to implement this through our API
    const response = await fetch('/api/sui/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        walletAddress: this.getAddress()
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to sign with Privy')
    }
    
    return response.json()
  }

  // Execute a signed transaction
  async executeTransaction(
    tx: Transaction
  ): Promise<TransactionResult> {
    try {
      // Sign the transaction
      const signature = await this.signTransaction(tx)
      
      // Execute on Sui network
      const result = await this.suiClient.executeTransactionBlock({
        transactionBlock: await tx.build({ client: this.suiClient }),
        signature,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true
        }
      })
      
      return {
        digest: result.digest,
        effects: result.effects,
        events: result.events || [],
        confirmed: result.confirmedLocalExecution || false
      }
    } catch (error) {
      console.error('Error executing transaction:', error)
      throw new Error('Failed to execute transaction')
    }
  }

  // Sign a personal message (for authentication/verification)
  async signMessage(message: string): Promise<string> {
    try {
      // Convert message to bytes
      const messageBytes = new TextEncoder().encode(message)
      
      // Hash with blake2b
      const digest = blake2b(messageBytes, { dkLen: 32 })
      const hashToSign = '0x' + toHex(digest)
      
      // Sign with Privy
      const response = await this.signWithPrivy(hashToSign)
      
      return response.signature
    } catch (error) {
      console.error('Error signing message:', error)
      throw new Error('Failed to sign message')
    }
  }

  // Verify a signature
  async verifySignature(
    message: string,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    try {
      // This would use Ed25519 verification
      // For now, return true as placeholder
      console.log('Verifying signature:', { message, signature, publicKey })
      return true
    } catch (error) {
      console.error('Error verifying signature:', error)
      return false
    }
  }

  // Get wallet balance
  async getBalance(): Promise<number> {
    const address = this.getAddress()
    if (!address) return 0
    
    try {
      const balance = await this.suiClient.getBalance({
        owner: address,
        coinType: '0x2::sui::SUI'
      })
      return parseInt(balance.totalBalance) / 1_000_000_000
    } catch (error) {
      console.error('Error getting balance:', error)
      return 0
    }
  }

  // Get owned objects
  async getOwnedObjects() {
    const address = this.getAddress()
    if (!address) return []
    
    try {
      const objects = await this.suiClient.getOwnedObjects({
        owner: address,
        options: {
          showType: true,
          showContent: true,
          showDisplay: true
        }
      })
      return objects.data
    } catch (error) {
      console.error('Error getting owned objects:', error)
      return []
    }
  }
}

// Factory function to create wallet instance
export function createPrivySuiWallet(privyUser: any): PrivySuiWallet | null {
  if (!privyUser) return null
  return new PrivySuiWallet(privyUser)
}

// Utility function to format Sui address
export function formatSuiAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Utility function to validate Sui address
export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address)
}