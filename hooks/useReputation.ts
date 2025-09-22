'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AIInsights } from '@/lib/ai-reputation'

interface ReputationBreakdown {
  developer: number
  social: number
  defi: number
  verification: number
}

interface ReputationLevel {
  level: string
  color: string
  description: string
  range: string
}

interface ReputationData {
  score: number
  level: ReputationLevel
  percentageOfMax: number
  breakdown: ReputationBreakdown
  trend: 'up' | 'down' | 'stable'
  percentile: number
  aiInsights?: AIInsights
  calculatedAt: string
}

interface ImprovementData {
  maxPossible: number
  improvement: number
  quickWins: string[]
  effort: 'low' | 'medium' | 'high'
}

interface UseReputationReturn {
  // Data
  reputation: ReputationData | null
  improvement: ImprovementData | null
  
  // Loading states
  isLoading: boolean
  isAnalyzing: boolean
  
  // Actions
  analyzeReputation: (forceRefresh?: boolean) => Promise<void>
  refreshReputation: () => void
  
  // Status
  error: string | null
  cacheAge: number // in minutes
  needsUpdate: boolean
  tokenUsage: number
  
  // AI insights
  hasAIInsights: boolean
  lastAnalysisDate: Date | null
}

export function useReputation(userId: string): UseReputationReturn {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [tokenUsage, setTokenUsage] = useState(0)

  // Query for cached reputation data
  const {
    data: cachedData,
    isLoading: isCacheLoading,
    error: cacheError,
    refetch: refetchCache
  } = useQuery({
    queryKey: ['reputation', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const response = await fetch(`/api/reputation/analyze?userId=${userId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // No cached score available
          return null
        }
        throw new Error('Failed to fetch reputation data')
      }
      
      const data = await response.json()
      return data
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry 404s (no cached score)
      if (error?.message?.includes('404')) return false
      return failureCount < 2
    }
  })

  // Mutation for analyzing reputation (with AI)
  const analyzeReputationMutation = useMutation({
    mutationFn: async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
      const response = await fetch('/api/reputation/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, forceRefresh })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze reputation')
      }

      return response.json()
    },
    onSuccess: (data) => {
      setError(null)
      setTokenUsage(data.tokenUsage || 0)
      
      // Show appropriate success message
      if (data.cached) {
        toast.success('Reputation data retrieved from cache')
      } else {
        toast.success(
          data.tokenUsage > 0 
            ? `Reputation analyzed with AI (${data.tokenUsage} tokens)`
            : 'Reputation calculated successfully'
        )
      }
      
      // Invalidate and refetch cache
      queryClient.invalidateQueries({ queryKey: ['reputation', userId] })
    },
    onError: (error: Error) => {
      console.error('Reputation analysis error:', error)
      setError(error.message)
      toast.error('Failed to analyze reputation')
    }
  })

  // Process the data from either cache or fresh analysis
  const processedData = cachedData || analyzeReputationMutation.data

  // Extract reputation data
  const reputation: ReputationData | null = processedData?.reputation || null
  const improvement: ImprovementData | null = processedData?.improvement || null
  const cacheAge = processedData?.cacheAge || 0
  const needsUpdate = processedData?.needsUpdate || false

  // Handle errors
  useEffect(() => {
    if (cacheError && !cacheError.message.includes('404')) {
      console.error('Reputation cache error:', cacheError)
      setError('Failed to load reputation data')
    }
  }, [cacheError])

  // Action functions
  const analyzeReputation = useCallback(async (forceRefresh = false) => {
    try {
      await analyzeReputationMutation.mutateAsync({ forceRefresh })
    } catch (error) {
      console.error('Analyze reputation error:', error)
    }
  }, [analyzeReputationMutation])

  const refreshReputation = useCallback(() => {
    refetchCache()
    if (analyzeReputationMutation.data) {
      queryClient.invalidateQueries({ queryKey: ['reputation', userId] })
    }
  }, [refetchCache, analyzeReputationMutation.data, queryClient, userId])

  // Calculate derived values
  const hasAIInsights = !!(reputation?.aiInsights && Object.keys(reputation.aiInsights).length > 0)
  const lastAnalysisDate = reputation?.calculatedAt ? new Date(reputation.calculatedAt) : null

  return {
    // Data
    reputation,
    improvement,
    
    // Loading states
    isLoading: isCacheLoading && !processedData,
    isAnalyzing: analyzeReputationMutation.isPending,
    
    // Actions
    analyzeReputation,
    refreshReputation,
    
    // Status
    error,
    cacheAge,
    needsUpdate,
    tokenUsage,
    
    // AI insights
    hasAIInsights,
    lastAnalysisDate
  }
}

// Helper hook for reputation status and actions
export function useReputationActions(userId: string) {
  const { 
    reputation, 
    analyzeReputation, 
    isAnalyzing, 
    hasAIInsights,
    needsUpdate,
    cacheAge 
  } = useReputation(userId)

  // Determine what action the user should take
  const getRecommendedAction = useCallback(() => {
    if (!reputation) {
      return {
        action: 'analyze',
        label: 'Analyze Reputation',
        description: 'Get your first reputation score',
        variant: 'default' as const,
        urgent: true
      }
    }

    if (needsUpdate || cacheAge > 1440) { // > 24 hours
      return {
        action: 'refresh',
        label: 'Update Score',
        description: 'Refresh your reputation analysis',
        variant: 'outline' as const,
        urgent: false
      }
    }

    if (!hasAIInsights) {
      return {
        action: 'enhance',
        label: 'Get AI Insights',
        description: 'Add AI-powered personality analysis',
        variant: 'secondary' as const,
        urgent: false
      }
    }

    return {
      action: 'view',
      label: 'View Details',
      description: 'Your reputation is up to date',
      variant: 'ghost' as const,
      urgent: false
    }
  }, [reputation, needsUpdate, cacheAge, hasAIInsights])

  const executeAction = useCallback(async () => {
    const action = getRecommendedAction()
    
    switch (action.action) {
      case 'analyze':
      case 'refresh':
        await analyzeReputation(action.action === 'refresh')
        break
      case 'enhance':
        await analyzeReputation(true) // Force refresh to get AI insights
        break
      case 'view':
        // Could navigate to detailed view
        break
    }
  }, [getRecommendedAction, analyzeReputation])

  return {
    recommendedAction: getRecommendedAction(),
    executeAction,
    isExecuting: isAnalyzing,
    reputation
  }
}

// Hook for comparing reputation with others (future feature)
export function useReputationComparison(userId: string) {
  // Placeholder for future implementation
  return {
    percentile: 50,
    similarUsers: [],
    averageInCategory: 500,
    isLoading: false
  }
}

// Hook for reputation history tracking (future feature)
export function useReputationHistory(userId: string) {
  // Placeholder for future implementation
  return {
    history: [],
    trend: 'stable' as const,
    isLoading: false
  }
}