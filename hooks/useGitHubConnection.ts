'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { GitHubProfileAnalysis } from '@/lib/ai/github'

interface UseGitHubConnectionReturn {
  // Connection actions
  connectGitHub: (userId: string) => void
  analyzeGitHubProfile: (userId: string) => Promise<void>
  
  // Loading states
  isConnecting: boolean
  isAnalyzing: boolean
  
  // Data
  analysisData: GitHubProfileAnalysis | null
  developerScore: number | null
  
  // Status
  error: string | null
}

export function useGitHubConnection(): UseGitHubConnectionReturn {
  const queryClient = useQueryClient()
  const [analysisData, setAnalysisData] = useState<GitHubProfileAnalysis | null>(null)
  const [developerScore, setDeveloperScore] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // GitHub profile analysis mutation
  const analyzeProfileMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze GitHub profile')
      }

      return response.json()
    },
    onSuccess: (data) => {
      setAnalysisData(data.analysis)
      setDeveloperScore(data.developerScore)
      setError(null)
      toast.success('GitHub profile analyzed successfully!')
      
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      queryClient.invalidateQueries({ queryKey: ['socialConnections'] })
    },
    onError: (error: Error) => {
      console.error('GitHub analysis error:', error)
      setError(error.message)
      toast.error('Failed to analyze GitHub profile')
    }
  })

  // Connect to GitHub (initiates OAuth flow)
  const connectGitHub = useCallback((userId: string) => {
    setIsConnecting(true)
    setError(null)
    
    try {
      // Redirect to GitHub OAuth endpoint
      const authUrl = `/api/auth/github?userId=${encodeURIComponent(userId)}`
      window.location.href = authUrl
    } catch (error) {
      console.error('GitHub connection error:', error)
      setError('Failed to initiate GitHub connection')
      setIsConnecting(false)
      toast.error('Failed to connect to GitHub')
    }
  }, [])

  // Analyze GitHub profile
  const analyzeGitHubProfile = useCallback(async (userId: string) => {
    try {
      await analyzeProfileMutation.mutateAsync(userId)
    } catch (error) {
      console.error('Analysis error:', error)
    }
  }, [analyzeProfileMutation])

  return {
    // Connection actions
    connectGitHub,
    analyzeGitHubProfile,
    
    // Loading states
    isConnecting,
    isAnalyzing: analyzeProfileMutation.isPending,
    
    // Data
    analysisData,
    developerScore,
    
    // Status
    error
  }
}

// Helper hook for GitHub connection status
export function useGitHubConnectionStatus(socialConnections: any[]) {
  const githubConnection = socialConnections?.find(conn => conn.platform === 'github')
  
  return {
    isConnected: !!githubConnection,
    connection: githubConnection,
    username: githubConnection?.username,
    profileData: githubConnection?.profile_data,
    lastAnalyzed: githubConnection?.profile_data?.last_analyzed,
    developerScore: githubConnection?.profile_data?.developer_score,
    needsAnalysis: !githubConnection?.profile_data?.analysis || 
      !githubConnection?.profile_data?.last_analyzed ||
      (new Date().getTime() - new Date(githubConnection.profile_data.last_analyzed).getTime()) > 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}