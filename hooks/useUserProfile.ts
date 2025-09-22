'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserService, SocialConnectionService, ProfileUtils } from '@/lib/db-functions'
import type { User, UserProfile, SocialConnection } from '@/types'
import { toast } from 'sonner'

interface UseUserProfileReturn {
  // Data
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  
  // Profile completion
  profileCompletion: number
  isProfileComplete: boolean
  
  // Actions
  updateProfile: (updates: Partial<User>) => Promise<boolean>
  refreshProfile: () => void
  checkUsernameAvailability: (username: string) => Promise<boolean>
  
  // Social connections
  socialConnections: SocialConnection[]
  addSocialConnection: (platform: string, username: string, profileData?: any) => Promise<boolean>
  removeSocialConnection: (platform: string) => Promise<boolean>
  
  // Status
  isNewUser: boolean
  needsOnboarding: boolean
}

export function useUserProfile(): UseUserProfileReturn {
  const { user: privyUser, authenticated, ready } = usePrivy()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  // Query for user profile data
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ['userProfile', privyUser?.id],
    queryFn: async () => {
      if (!privyUser) return null

      // First, create or update user from Privy data
      const user = await UserService.createOrUpdateUser(privyUser)
      if (!user) throw new Error('Failed to create/update user')

      // Then fetch complete profile
      const profile = await UserService.getUserProfile(user.id)
      if (!profile) throw new Error('Failed to fetch user profile')

      return profile
    },
    enabled: authenticated && ready && !!privyUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Query for social connections
  const {
    data: socialConnections = [],
    refetch: refetchSocialConnections
  } = useQuery({
    queryKey: ['socialConnections', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return []
      return await SocialConnectionService.getUserSocialConnections(profile.id)
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000,
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (!profile?.id) throw new Error('No user profile found')
      
      const updatedUser = await UserService.updateUserProfile(profile.id, updates)
      if (!updatedUser) throw new Error('Failed to update profile')
      
      return updatedUser
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
    onError: (error) => {
      console.error('Update profile error:', error)
      toast.error('Failed to update profile')
      setError('Failed to update profile')
    }
  })

  // Add social connection mutation
  const addSocialConnectionMutation = useMutation({
    mutationFn: async ({
      platform,
      username,
      profileData
    }: {
      platform: string
      username: string
      profileData?: any
    }) => {
      if (!profile?.id) throw new Error('No user profile found')
      
      const connection = await SocialConnectionService.upsertSocialConnection(
        profile.id,
        platform as SocialConnection['platform'],
        { username, profileData, verified: false }
      )
      
      if (!connection) throw new Error('Failed to add social connection')
      return connection
    },
    onSuccess: () => {
      toast.success('Social account connected!')
      refetchSocialConnections()
      refetchProfile()
    },
    onError: (error) => {
      console.error('Add social connection error:', error)
      toast.error('Failed to connect social account')
    }
  })

  // Remove social connection mutation
  const removeSocialConnectionMutation = useMutation({
    mutationFn: async (platform: string) => {
      if (!profile?.id) throw new Error('No user profile found')
      
      const success = await SocialConnectionService.removeSocialConnection(profile.id, platform)
      if (!success) throw new Error('Failed to remove social connection')
      
      return success
    },
    onSuccess: () => {
      toast.success('Social account disconnected!')
      refetchSocialConnections()
      refetchProfile()
    },
    onError: (error) => {
      console.error('Remove social connection error:', error)
      toast.error('Failed to disconnect social account')
    }
  })

  // Calculate profile completion
  const profileCompletion = profile ? ProfileUtils.calculateProfileCompletion(profile) : 0
  const isProfileComplete = profileCompletion >= 80

  // Check if user is new (created in last 24 hours)
  const isNewUser = profile ? 
    (new Date().getTime() - new Date(profile.created_at).getTime()) < 24 * 60 * 60 * 1000 : 
    false

  // Check if user needs onboarding
  const needsOnboarding = profile ? (!profile.username || socialConnections.length === 0) : false

  // Handle errors
  useEffect(() => {
    if (profileError) {
      console.error('Profile error:', profileError)
      setError('Failed to load profile')
    }
  }, [profileError])

  // Action functions
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    try {
      await updateProfileMutation.mutateAsync(updates)
      return true
    } catch (error) {
      console.error('Update profile error:', error)
      return false
    }
  }, [updateProfileMutation])

  const refreshProfile = useCallback(() => {
    refetchProfile()
    refetchSocialConnections()
  }, [refetchProfile, refetchSocialConnections])

  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    try {
      return await UserService.isUsernameAvailable(username, profile?.id)
    } catch (error) {
      console.error('Username check error:', error)
      return false
    }
  }, [profile?.id])

  const addSocialConnection = useCallback(async (
    platform: string,
    username: string,
    profileData?: any
  ): Promise<boolean> => {
    try {
      await addSocialConnectionMutation.mutateAsync({ platform, username, profileData })
      return true
    } catch (error) {
      console.error('Add social connection error:', error)
      return false
    }
  }, [addSocialConnectionMutation])

  const removeSocialConnection = useCallback(async (platform: string): Promise<boolean> => {
    try {
      await removeSocialConnectionMutation.mutateAsync(platform)
      return true
    } catch (error) {
      console.error('Remove social connection error:', error)
      return false
    }
  }, [removeSocialConnectionMutation])

  return {
    // Data
    user: profile || null,
    profile: profile || null,
    isLoading: isProfileLoading || updateProfileMutation.isPending,
    error,
    
    // Profile completion
    profileCompletion,
    isProfileComplete,
    
    // Actions
    updateProfile,
    refreshProfile,
    checkUsernameAvailability,
    
    // Social connections
    socialConnections,
    addSocialConnection,
    removeSocialConnection,
    
    // Status
    isNewUser,
    needsOnboarding
  }
}

// Additional hook for username validation
export function useUsernameValidator() {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateUsername = useCallback(async (username: string, excludeUserId?: string) => {
    setIsChecking(true)
    setValidationError(null)
    setIsAvailable(null)

    try {
      // Basic validation
      if (!username || username.length < 3) {
        setValidationError('Username must be at least 3 characters')
        setIsAvailable(false)
        return false
      }

      if (username.length > 20) {
        setValidationError('Username must be less than 20 characters')
        setIsAvailable(false)
        return false
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setValidationError('Username can only contain letters, numbers, and underscores')
        setIsAvailable(false)
        return false
      }

      // Check availability
      const available = await UserService.isUsernameAvailable(username, excludeUserId)
      setIsAvailable(available)
      
      if (!available) {
        setValidationError('Username is already taken')
      }

      return available
    } catch (error) {
      console.error('Username validation error:', error)
      setValidationError('Error checking username availability')
      setIsAvailable(false)
      return false
    } finally {
      setIsChecking(false)
    }
  }, [])

  return {
    validateUsername,
    isChecking,
    isAvailable,
    validationError
  }
}