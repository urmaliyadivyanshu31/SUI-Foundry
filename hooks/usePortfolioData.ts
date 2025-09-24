'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface PortfolioUser {
  id: string
  username: string
  profile_picture: string | null
  wallet_address: string | null
  created_at: string
}

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
  html_url: string
  created_at: string
  updated_at: string
}

interface GitHubStats {
  public_repos: number
  followers: number
  following: number
  created_at: string
  location: string | null
  bio: string | null
}

interface NFT {
  id: string
  name: string
  image_url: string | null
  collection_name: string
  network: 'mainnet' | 'testnet'
}

interface SocialConnection {
  platform: string
  username: string
  verified: boolean
  profile_data: any
}

interface Reputation {
  total_score: number
  developer_score: number
  social_score: number
  defi_score: number
  ai_analysis: {
    repositoryCount: number
    skillsProfile: string[]
    languageDistribution: Record<string, number>
    overallFeedback: string
    careerRecommendations: string[]
  } | null
}

interface BlockchainData {
  balance: number
  nftCount: number
  transactionCount: number
}

interface TipStats {
  total_received: number
  tips_received_count: number
}

interface PortfolioData {
  user: PortfolioUser
  socialConnections: SocialConnection[]
  reputation: Reputation
  repositories: Repository[]
  githubStats: GitHubStats | null
  nfts: NFT[]
  blockchain: BlockchainData | null
  tipStats: TipStats
}

interface UsePortfolioDataReturn {
  data: PortfolioData | null
  isLoading: boolean
  error: string | null
  sendTip: (amount: number, message?: string, transactionHash?: string) => Promise<boolean>
  refetch: () => void
}

export function usePortfolioData(username: string): UsePortfolioDataReturn {
  const queryClient = useQueryClient()

  // Fetch portfolio data
  const {
    data: portfolioData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['portfolio', username],
    queryFn: async () => {
      if (!username) throw new Error('Username is required')

      console.log('🔍 Fetching portfolio data for:', username)
      const start = Date.now()
      
      const response = await fetch(`/api/portfolio/${encodeURIComponent(username)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch portfolio data')
      }

      const result = await response.json()
      const duration = Date.now() - start
      console.log(`✅ Portfolio data fetched in ${duration}ms for:`, username)
      
      return result.data as PortfolioData
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })

  // Send tip mutation
  const sendTipMutation = useMutation({
    mutationFn: async ({
      amount,
      message,
      transactionHash
    }: {
      amount: number
      message?: string
      transactionHash?: string
    }) => {
      if (!username) throw new Error('Username is required')

      const response = await fetch(`/api/portfolio/${encodeURIComponent(username)}/tip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          message,
          transaction_hash: transactionHash
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send tip')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Tip sent successfully!')
      // Refetch portfolio data to update tip stats
      queryClient.invalidateQueries({ queryKey: ['portfolio', username] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send tip')
    }
  })

  const sendTip = async (
    amount: number,
    message?: string,
    transactionHash?: string
  ): Promise<boolean> => {
    try {
      await sendTipMutation.mutateAsync({ amount, message, transactionHash })
      return true
    } catch (error) {
      console.error('Send tip error:', error)
      return false
    }
  }

  return {
    data: portfolioData || null,
    isLoading,
    error: error?.message || null,
    sendTip,
    refetch
  }
}

export type { PortfolioData, Repository, GitHubStats, NFT, Reputation, BlockchainData, TipStats }