'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Transaction } from '@mysten/sui/transactions'
import { 
  createPrivySuiWallet, 
  PrivySuiWallet,
  formatSuiAddress 
} from '@/lib/privy-sui-wallet'
import { 
  suiQuery, 
  suiFormat, 
  suiTransactionBuilder,
  MIST_PER_SUI 
} from '@/lib/sui-enhanced'

interface WalletBalance {
  sui: number
  formattedSui: string
  allBalances: Array<{
    coinType: string
    symbol: string
    totalBalance: number
  }>
}

interface TransactionOptions {
  onSuccess?: (digest: string) => void
  onError?: (error: Error) => void
  showToast?: boolean
}

interface UseSuiWalletReturn {
  // Wallet state
  address: string | null
  formattedAddress: string
  isConnected: boolean
  wallet: PrivySuiWallet | null
  
  // Balance
  balance: WalletBalance | null
  isLoadingBalance: boolean
  refreshBalance: () => void
  
  // Transactions
  sendSui: (recipient: string, amount: number, options?: TransactionOptions) => Promise<string | null>
  executeTransaction: (tx: Transaction, options?: TransactionOptions) => Promise<string | null>
  isTransacting: boolean
  
  // Utilities
  canAfford: (amount: number) => boolean
  getNFTs: () => Promise<any[]>
  getTransactionHistory: (limit?: number) => Promise<any[]>
  
  // Network
  network: 'mainnet' | 'testnet'
  explorerUrl: string
}

export function useSuiWallet(): UseSuiWalletReturn {
  const { user, authenticated, ready } = usePrivy()
  const queryClient = useQueryClient()
  const [wallet, setWallet] = useState<PrivySuiWallet | null>(null)
  const [isTransacting, setIsTransacting] = useState(false)

  // Network configuration
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
  const explorerUrl = network === 'mainnet' 
    ? 'https://suiscan.xyz/mainnet'
    : 'https://suiscan.xyz/testnet'

  // Initialize wallet when user is authenticated
  useEffect(() => {
    if (authenticated && user && ready) {
      const privyWallet = createPrivySuiWallet(user)
      setWallet(privyWallet)
    } else {
      setWallet(null)
    }
  }, [authenticated, user, ready])

  // Get wallet address
  const address = wallet?.getAddress() || null
  const formattedAddress = address ? formatSuiAddress(address) : ''
  const isConnected = !!address

  // Query for balance
  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refreshBalance
  } = useQuery({
    queryKey: ['sui-balance', address],
    queryFn: async () => {
      if (!address) return null
      
      const detailedBalance = await suiQuery.getDetailedBalance(address)
      
      return {
        sui: detailedBalance.sui,
        formattedSui: suiFormat.formatSuiAmount(detailedBalance.sui),
        allBalances: detailedBalance.allBalances
      }
    },
    enabled: !!address,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000 // Refetch every minute
  })

  // Send SUI tokens
  const sendSui = useCallback(async (
    recipient: string,
    amount: number,
    options: TransactionOptions = {}
  ): Promise<string | null> => {
    const { onSuccess, onError, showToast = true } = options

    if (!wallet || !address) {
      if (showToast) toast.error('Wallet not connected')
      return null
    }

    // Validate recipient address
    if (!/^0x[a-fA-F0-9]{64}$/.test(recipient)) {
      if (showToast) toast.error('Invalid recipient address')
      return null
    }

    // Check balance
    const canAffordTx = await suiQuery.canAffordTransaction(address, amount)
    if (!canAffordTx) {
      if (showToast) toast.error('Insufficient balance')
      return null
    }

    setIsTransacting(true)
    
    try {
      if (showToast) toast.loading('Preparing transaction...')

      // Build transaction
      const tx = suiTransactionBuilder()
        .transferSui(recipient, amount)
        .setSender(address)
        .setGasBudget(10_000_000) // 0.01 SUI
        .getTransaction()

      // Execute transaction
      const result = await wallet.executeTransaction(tx)
      
      if (showToast) {
        toast.dismiss()
        toast.success(`Transaction successful! ${suiFormat.formatDigest(result.digest)}`)
      }

      // Refresh balance after transaction
      setTimeout(() => refreshBalance(), 2000)

      // Call success callback
      if (onSuccess) onSuccess(result.digest)

      return result.digest
    } catch (error) {
      console.error('Transaction error:', error)
      
      if (showToast) {
        toast.dismiss()
        toast.error('Transaction failed')
      }

      if (onError) onError(error as Error)
      return null
    } finally {
      setIsTransacting(false)
    }
  }, [wallet, address, refreshBalance])

  // Execute a custom transaction
  const executeTransaction = useCallback(async (
    tx: Transaction,
    options: TransactionOptions = {}
  ): Promise<string | null> => {
    const { onSuccess, onError, showToast = true } = options

    if (!wallet || !address) {
      if (showToast) toast.error('Wallet not connected')
      return null
    }

    setIsTransacting(true)

    try {
      if (showToast) toast.loading('Executing transaction...')

      // Set sender if not set
      tx.setSender(address)

      // Execute transaction
      const result = await wallet.executeTransaction(tx)
      
      if (showToast) {
        toast.dismiss()
        toast.success(`Transaction successful!`)
      }

      // Refresh balance
      setTimeout(() => refreshBalance(), 2000)

      if (onSuccess) onSuccess(result.digest)
      return result.digest
    } catch (error) {
      console.error('Transaction error:', error)
      
      if (showToast) {
        toast.dismiss()
        toast.error('Transaction failed')
      }

      if (onError) onError(error as Error)
      return null
    } finally {
      setIsTransacting(false)
    }
  }, [wallet, address, refreshBalance])

  // Check if user can afford amount
  const canAfford = useCallback((amount: number): boolean => {
    if (!balanceData) return false
    // Account for gas fees (add 0.01 SUI buffer)
    return balanceData.sui >= (amount + 0.01)
  }, [balanceData])

  // Get NFTs
  const getNFTs = useCallback(async () => {
    if (!address) return []
    return suiQuery.getNFTs(address)
  }, [address])

  // Get transaction history
  const getTransactionHistory = useCallback(async (limit = 20) => {
    if (!address) return []
    return suiQuery.getTransactionHistory(address, limit)
  }, [address])

  return {
    // Wallet state
    address,
    formattedAddress,
    isConnected,
    wallet,
    
    // Balance
    balance: balanceData || null,
    isLoadingBalance,
    refreshBalance,
    
    // Transactions
    sendSui,
    executeTransaction,
    isTransacting,
    
    // Utilities
    canAfford,
    getNFTs,
    getTransactionHistory,
    
    // Network
    network,
    explorerUrl
  }
}

// Hook for monitoring transaction status
export function useTransactionStatus(digest: string | null) {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | null>(null)

  useEffect(() => {
    if (!digest) {
      setStatus(null)
      return
    }

    setStatus('pending')

    // Poll for transaction status
    const checkStatus = async () => {
      try {
        const result = await suiQuery.client.getTransactionBlock({
          digest,
          options: { showEffects: true }
        })

        if (result.effects?.status.status === 'success') {
          setStatus('success')
        } else {
          setStatus('failed')
        }
      } catch (error) {
        // Transaction might not be available yet
        setTimeout(checkStatus, 2000)
      }
    }

    checkStatus()
  }, [digest])

  return status
}