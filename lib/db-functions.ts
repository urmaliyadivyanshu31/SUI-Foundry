import { supabase, supabaseAdmin, type Database } from './supabase'
import type { User, SocialConnection, ReputationScore, UserProfile } from '@/types'

// User Profile Management Functions

export class UserService {
  // Create or update user profile from Privy authentication
  static async createOrUpdateUser(privyUser: any): Promise<User | null> {
    try {
      // Extract wallet address from Privy user
      const walletAddress = privyUser.wallet?.address || privyUser.id
      const email = privyUser.email?.address || null
      const name = privyUser.google?.name || privyUser.twitter?.name || null

      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', fetchError)
        return null
      }

      if (existingUser) {
        // Update existing user
        const updateData = {
          email: email,
          updated_at: new Date().toISOString()
        }
        const { data: updatedUser, error: updateError } = await (supabaseAdmin
          .from('users') as any)
          .update(updateData)
          .eq('id', (existingUser as any).id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating user:', updateError)
          return null
        }

        return updatedUser
      } else {
        // Create new user
        const insertData = {
          wallet_address: walletAddress,
          email,
          username: name ? this.generateUsername(name) : null
        }
        const { data: newUser, error: createError } = await (supabaseAdmin
          .from('users') as any)
          .insert(insertData)
          .select()
          .single()

        if (createError) {
          console.error('Error creating user:', createError)
          return null
        }

        return newUser
      }
    } catch (error) {
      console.error('Error in createOrUpdateUser:', error)
      return null
    }
  }

  // Get complete user profile with all related data
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          social_connections (*),
          reputation_scores (*),
          identity_nfts (*),
          user_badges (
            *,
            badge:badges (*)
          ),
          user_quest_progress (
            *,
            quest:quests (*)
          )
        `)
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error fetching user profile:', userError)
        return null
      }

      return user as UserProfile
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      return null
    }
  }

  // Update user profile information
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      const { data: updatedUser, error } = await (supabase
        .from('users') as any)
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return null
      }

      return updatedUser
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      return null
    }
  }

  // Check if username is available
  static async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())

      if (excludeUserId) {
        query = query.neq('id', excludeUserId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error checking username availability:', error)
        return false
      }

      return data.length === 0
    } catch (error) {
      console.error('Error in isUsernameAvailable:', error)
      return false
    }
  }

  // Generate unique username from name
  static generateUsername(name: string): string {
    const baseUsername = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15)
    
    const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `${baseUsername}${randomSuffix}`
  }

  // Get user by wallet address
  static async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user by wallet:', error)
        return null
      }

      return user
    } catch (error) {
      console.error('Error in getUserByWalletAddress:', error)
      return null
    }
  }
}

// Social Connection Management Functions

export class SocialConnectionService {
  // Add or update social connection
  static async upsertSocialConnection(
    userId: string,
    platform: SocialConnection['platform'],
    data: {
      username: string
      profileData?: any
      verified?: boolean
    }
  ): Promise<SocialConnection | null> {
    try {
      const upsertData = {
        user_id: userId,
        platform,
        username: data.username,
        profile_data: data.profileData || {},
        verified: data.verified || false,
        verified_at: data.verified ? new Date().toISOString() : null
      }
      const { data: connection, error } = await (supabase
        .from('social_connections') as any)
        .upsert(upsertData, {
          onConflict: 'user_id,platform'
        })
        .select()
        .single()

      if (error) {
        console.error('Error upserting social connection:', error)
        return null
      }

      return connection
    } catch (error) {
      console.error('Error in upsertSocialConnection:', error)
      return null
    }
  }

  // Get social connections for user
  static async getUserSocialConnections(userId: string): Promise<SocialConnection[]> {
    try {
      const { data: connections, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching social connections:', error)
        return []
      }

      return connections
    } catch (error) {
      console.error('Error in getUserSocialConnections:', error)
      return []
    }
  }

  // Remove social connection
  static async removeSocialConnection(userId: string, platform: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('user_id', userId)
        .eq('platform', platform)

      if (error) {
        console.error('Error removing social connection:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in removeSocialConnection:', error)
      return false
    }
  }

  // Verify social connection
  static async verifySocialConnection(userId: string, platform: string): Promise<boolean> {
    try {
      const updateData = {
        verified: true,
        verified_at: new Date().toISOString()
      }
      const { error } = await (supabase
        .from('social_connections') as any)
        .update(updateData)
        .eq('user_id', userId)
        .eq('platform', platform)

      if (error) {
        console.error('Error verifying social connection:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in verifySocialConnection:', error)
      return false
    }
  }
}

// Reputation Management Functions

export class ReputationService {
  // Create or update reputation score
  static async upsertReputationScore(
    userId: string,
    scores: {
      totalScore: number
      defiScore: number
      socialScore: number
      developerScore: number
      aiAnalysis?: any
    }
  ): Promise<ReputationScore | null> {
    try {
      const upsertData = {
        user_id: userId,
        total_score: scores.totalScore,
        defi_score: scores.defiScore,
        social_score: scores.socialScore,
        developer_score: scores.developerScore,
        ai_analysis: scores.aiAnalysis || {},
        calculated_at: new Date().toISOString(),
        version: 1
      }
      const { data: reputation, error } = await (supabase
        .from('reputation_scores') as any)
        .upsert(upsertData, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error upserting reputation score:', error)
        return null
      }

      return reputation
    } catch (error) {
      console.error('Error in upsertReputationScore:', error)
      return null
    }
  }

  // Get latest reputation score for user
  static async getUserReputationScore(userId: string): Promise<ReputationScore | null> {
    try {
      const { data: reputation, error } = await supabase
        .from('reputation_scores')
        .select('*')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching reputation score:', error)
        return null
      }

      return reputation
    } catch (error) {
      console.error('Error in getUserReputationScore:', error)
      return null
    }
  }
}

// Utility Functions

export class ProfileUtils {
  // Calculate profile completion percentage
  static calculateProfileCompletion(profile: UserProfile): number {
    let completed = 0
    const total = 6

    if (profile.username) completed++
    if (profile.email) completed++
    if (profile.social_connections?.length > 0) completed++
    if (profile.reputation_scores?.length > 0) completed++
    if (profile.identity_nfts?.length > 0) completed++
    if (profile.user_badges?.length > 0) completed++

    return Math.round((completed / total) * 100)
  }

  // Get user's primary social platform
  static getPrimarySocialPlatform(connections: SocialConnection[]): string {
    const platformPriority = ['github', 'twitter', 'linkedin', 'discord']
    
    for (const platform of platformPriority) {
      const connection = connections.find(c => c.platform === platform && c.verified)
      if (connection) return platform
    }

    return connections.length > 0 ? connections[0].platform : 'none'
  }

  // Format reputation score with color coding
  static getReputationScoreInfo(score: number): {
    level: string
    color: string
    description: string
  } {
    if (score >= 750) {
      return {
        level: 'Expert',
        color: 'text-purple-600',
        description: 'Outstanding Web3 reputation'
      }
    } else if (score >= 600) {
      return {
        level: 'Advanced',
        color: 'text-blue-600',
        description: 'Strong Web3 presence'
      }
    } else if (score >= 450) {
      return {
        level: 'Intermediate',
        color: 'text-green-600',
        description: 'Growing Web3 reputation'
      }
    } else if (score >= 350) {
      return {
        level: 'Beginner',
        color: 'text-yellow-600',
        description: 'Starting Web3 journey'
      }
    } else {
      return {
        level: 'New',
        color: 'text-gray-600',
        description: 'Welcome to Web3'
      }
    }
  }
}