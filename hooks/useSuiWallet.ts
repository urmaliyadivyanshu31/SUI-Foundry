'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Transaction } from '@mysten/sui/transactions'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { useZkLogin } from '@/lib/providers'
import { blockchainDataFetcher, getCompleteUserData } from '@/lib/blockchain/blockchain-data'
import { normalizeAddress } from '@mysten/sui/utils'

interface WalletBalance {
  sui: number
  formattedSui: string
  allBalances: Array<{
    coinType: string
    symbol: string
    totalBalance: number
    balanceUsd?: number
  }>
}

// Utility functions for address formatting (replacing zklogin utils)
export function formatSuiAddress(address: string): string {
  if (!address) return ''
  try {
    const normalized = normalizeAddress(address)
    return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`
  } catch {
    return address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address
  }
}

export function isValidSuiAddress(address: string): boolean {
  try {
    normalizeAddress(address)
    return true
  } catch {
    return false
  }
}

interface SuiWalletHook {
  balance: WalletBalance | null
  isLoadingBalance: boolean
  balanceError: Error | null
  address: string | null
  isConnected: boolean
  signAndExecuteTransaction: (transaction: Transaction) => Promise<any>
  refreshBalance: () => void
  formatAddress: (addr: string) => string
  validateAddress: (addr: string) => boolean
  blockchainData: any
  isLoadingBlockchainData: boolean
  refreshBlockchainData: () => void
}

export function useSuiWallet(): SuiWalletHook {
  const { user, isAuthenticated } = useZkLogin()
  const currentAccount = useCurrentAccount()
  const { mutateAsync: executeTransaction } = useSignAndExecuteTransaction()
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const queryClient = useQueryClient()

  // Use address from current account (Enoki) or fallback to user wallet address
  const address = currentAccount?.address || user?.walletAddress || null

  // Fetch wallet balance
  const { 
    data: balance, 
    error: balanceError, 
    refetch: refreshBalance,
    isLoading: isQueryLoadingBalance
  } = useQuery({
    queryKey: ['walletBalance', address],
    queryFn: async () => {
      if (!address || !isValidSuiAddress(address)) {
        throw new Error('Invalid or missing wallet address')
      }

      try {
        const data = await blockchainDataFetcher.fetchUserBalance(address)
        return data
      } catch (error) {
        console.error('❌ Error fetching wallet balance:', error)
        throw error
      }
    },
    enabled: !!address && isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute
  })

  // Fetch blockchain data
  const { 
    data: blockchainData, 
    isLoading: isLoadingBlockchainData,
    refetch: refreshBlockchainData
  } = useQuery({
    queryKey: ['blockchainData', address],
    queryFn: async () => {
      if (!address || !isValidSuiAddress(address)) {
        throw new Error('Invalid or missing wallet address')
      }

      try {
        return await getCompleteUserData(address)
      } catch (error) {
        console.error('❌ Error fetching blockchain data:', error)
        throw error
      }
    },
    enabled: !!address && isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Sign and execute transaction using dapp-kit
  const signAndExecuteTransaction = useCallback(async (transaction: Transaction) => {
    try {
      if (!currentAccount) {
        throw new Error('No wallet connected')
      }

      console.log('📝 Executing transaction with Enoki...')
      const result = await executeTransaction({
        transaction,
      })

      console.log('✅ Transaction executed successfully:', result.digest)
      
      // Refresh balance after transaction
      setTimeout(() => {
        refreshBalance()
        refreshBlockchainData()
      }, 2000)

      return result
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      throw error
    }
  }, [currentAccount, executeTransaction, refreshBalance, refreshBlockchainData])

  return {
    balance: balance || null,
    isLoadingBalance: isQueryLoadingBalance || isLoadingBalance,
    balanceError: balanceError as Error | null,
    address,
    isConnected: !!currentAccount,
    signAndExecuteTransaction,
    refreshBalance: () => refreshBalance(),
    formatAddress: formatSuiAddress,
    validateAddress: isValidSuiAddress,
    blockchainData: blockchainData || null,
    isLoadingBlockchainData,
    refreshBlockchainData: () => refreshBlockchainData(),
  }
}