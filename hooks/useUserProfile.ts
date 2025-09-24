'use client'

import { useState, useEffect, useCallback } from 'react'
import { useZkLogin } from '@/lib/providers'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserService, SocialConnectionService, ProfileUtils } from '@/lib/db/db-functions'
import type { User, UserProfile, SocialConnection } from '@/types'
import { toast } from 'sonner'

// Generate a proper UUID for mock users
function generateMockUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

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
  const { user: zkLoginUser, isAuthenticated } = useZkLogin()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  // Query for user profile data
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ['userProfile', zkLoginUser?.sub],
    queryFn: async () => {
      if (!zkLoginUser) return null

      try {
        console.log('🔍 Debug - zkLoginUser data:', zkLoginUser)
        
        // Extract wallet address from various possible sources
        const walletAddress = zkLoginUser.walletAddress || zkLoginUser.address
        
        console.log('🔍 Debug - extracted wallet address:', walletAddress)
        
        // If no wallet address is available, return mock profile
        if (!walletAddress) {
          console.warn('⚠️ No wallet address available, returning mock profile')
          return {
            id: generateMockUUID(),
            username: zkLoginUser.name || 'Anonymous',
            email: zkLoginUser.email || null,
            wallet_address: null,
            zklogin_sub: zkLoginUser.sub,
            oauth_provider: zkLoginUser.provider,
            profile_picture: zkLoginUser.picture,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as User
        }
        
        // Create zkLogin user data for database
        const zkLoginUserData = {
          address: walletAddress,
          walletAddress: walletAddress,
          email: zkLoginUser.email,
          name: zkLoginUser.name,
          picture: zkLoginUser.picture,
          provider: zkLoginUser.provider || 'google',
          sub: zkLoginUser.sub || zkLoginUser.email
        }
        
        console.log('🔍 Debug - processed zkLoginUserData:', zkLoginUserData)

        // Create or update user with blockchain data integration
        const result = await UserService.createOrUpdateEnokiUserWithBlockchainData(zkLoginUserData)
        
        if (!result.user) {
          // This is expected for new users - they'll complete setup in dashboard
          // Return minimal profile without error logging
          return {
            id: generateMockUUID(),
            username: zkLoginUser.name || 'Anonymous',
            email: zkLoginUser.email || null,
            wallet_address: zkLoginUser.walletAddress,
            zklogin_sub: zkLoginUser.sub,
            oauth_provider: zkLoginUser.provider,
            profile_picture: zkLoginUser.picture,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }

        const user = result.user

        // Then fetch complete profile
        const profile = await UserService.getUserProfile(user.id)
        if (!profile) {
          return {
            ...user,
            social_connections: [],
            reputation_scores: [],
            identity_nfts: [],
            user_badges: [],
            quest_progress: []
          }
        }

        return profile
      } catch (error) {
        console.warn('Database error, using mock profile for demo:', error)
        // Return mock profile for development when DB is not available
        return {
          id: generateMockUUID(),
          username: zkLoginUser.name || 'Anonymous',
          email: zkLoginUser.email || null,
          wallet_address: zkLoginUser.walletAddress,
          zklogin_sub: zkLoginUser.sub,
          oauth_provider: zkLoginUser.provider,
          profile_picture: zkLoginUser.picture,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          social_connections: [],
          reputation_scores: [],
          identity_nfts: [],
          user_badges: [],
          quest_progress: []
        }
      }
    },
    enabled: isAuthenticated && !!zkLoginUser,
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
      if (!zkLoginUser) {
        throw new Error('No authentication found - please log in again')
      }
      
      let userId = profile?.id
      
      // If no profile exists, create user first
      if (!userId) {
        console.log('🔄 No profile found, creating user first...')
        console.log('📍 zkLoginUser data:', {
          walletAddress: zkLoginUser.walletAddress,
          email: zkLoginUser.email,
          name: zkLoginUser.name,
          provider: zkLoginUser.provider,
          sub: zkLoginUser.sub
        })
        
        const zkLoginUserData = {
          walletAddress: zkLoginUser.walletAddress,
          email: zkLoginUser.email,
          name: zkLoginUser.name,
          picture: zkLoginUser.picture,
          provider: zkLoginUser.provider || 'google',
          sub: zkLoginUser.sub || zkLoginUser.email
        }
        
        console.log('🚀 Calling createOrUpdateEnokiUserWithBlockchainData...')
        const result = await UserService.createOrUpdateEnokiUserWithBlockchainData(zkLoginUserData)
        console.log('📦 Create result:', JSON.stringify(result, null, 2))
        
        if (!result || !result.user) {
          console.error('❌ User creation failed:', result)
          throw new Error('Failed to create user profile - database operation failed')
        }
        
        userId = result.user.id
        console.log('✅ User created with ID:', userId)
        console.log('🔍 Profile data before invalidation:', {
          currentProfileId: profile?.id,
          newUserId: userId,
          profileExists: !!profile
        })
        
        // Refresh the profile query to get the new user
        await queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      }
      
      if (!userId) {
        throw new Error('No user ID available after creation attempt')
      }
      
      console.log('🔄 Updating profile with ID:', userId, 'and data:', updates)
      console.log('🔍 Current profile state before update:', {
        profileId: profile?.id,
        userIdToUpdate: userId,
        profileIsNull: profile === null,
        profileUndefined: profile === undefined
      })
      
      const updatedUser = await UserService.updateUserProfile(userId, updates)
      if (!updatedUser) {
        console.error('❌ Profile update failed for user ID:', userId)
        throw new Error('Failed to update profile - user may not exist in database')
      }
      
      console.log('✅ Profile updated successfully:', updatedUser)
      return updatedUser
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
    onError: (error: any) => {
      console.error('❌ Update profile error:', {
        message: error?.message || 'Unknown error',
        name: error?.name || 'Unknown error name',
        stack: error?.stack || 'No stack trace',
        code: error?.code || 'NO_CODE',
        details: error?.details || 'No details available',
        errorString: String(error)
      })
      const errorMessage = error.message || 'Failed to update profile - please try again'
      toast.error(errorMessage)
      setError(errorMessage)
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
    } catch (error: any) {
      console.error('❌ Username validation error:', {
        message: error.message || 'Unknown validation error',
        stack: error.stack,
        username: username,
        excludeUserId: excludeUserId,
        error: error
      })
      setValidationError('Error checking username availability - please try again')
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