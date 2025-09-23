'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { extractUserDataFromAccount, validateEnokiConfig } from './auth/enoki'
import { useState, createContext, useContext, useEffect, type ReactNode } from 'react'
import { useCurrentAccount, useConnectWallet, useDisconnectWallet } from '@mysten/dapp-kit'
import { Toaster } from '@/components/ui/sonner'
import '@mysten/dapp-kit/dist/index.css'

interface ProvidersProps {
  children: ReactNode
}

// Network configuration for Sui
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
})

// Query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// Authentication Context for backward compatibility
interface AuthContextType {
  user: any | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component using dapp-kit
function AuthProvider({ children }: { children: ReactNode }) {
  const currentAccount = useCurrentAccount()
  const { mutate: connect } = useConnectWallet()
  const { mutate: disconnect } = useDisconnectWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Extract user data when account changes
  useEffect(() => {
    if (currentAccount) {
      const userData = extractUserDataFromAccount(currentAccount)
      setUser({
        ...userData,
        walletAddress: currentAccount.address,
      })
    } else {
      setUser(null)
    }
  }, [currentAccount])

  const login = async () => {
    try {
      setIsLoading(true)
      console.log('🔐 Initiating Google login...')
      // The actual wallet connection will be handled by the UI components
      // This function is kept for compatibility
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    disconnect()
    setUser(null)
  }

  const refreshUser = async () => {
    // User data is automatically refreshed when currentAccount changes
    // This function is kept for compatibility with existing code
  }

  const value = {
    user,
    isAuthenticated: !!currentAccount,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Legacy hook name for backward compatibility
export const useZkLogin = useAuth

// Validate configuration on load
if (typeof window !== 'undefined') {
  if (!validateEnokiConfig()) {
    console.warn('⚠️ Enoki configuration is incomplete. Authentication may not work properly.')
  }
}

// Main Providers Component
export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}