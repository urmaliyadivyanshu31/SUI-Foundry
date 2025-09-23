import { supabase, supabaseAdmin, isSupabaseConfigured, type Database } from './supabase'
import type { User, SocialConnection, ReputationScore, UserProfile } from '@/types'

// User Profile Management Functions

export class UserService {
  // Create or update user profile from Privy authentication
  static async createOrUpdateUser(privyUser: any): Promise<User | null> {
    try {
      if (!isSupabaseConfigured()) {
        console.error('❌ Supabase is not properly configured. Please check your environment variables.')
        console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY')
        return null
      }
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
        console.error('❌ Error fetching user:', {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          hint: fetchError.hint
        })
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
      if (!isSupabaseConfigured()) {
        console.warn('⚠️ Supabase is not properly configured. Using fallback validation.')
        // Fallback: Allow any valid username when DB is not configured
        return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username)
      }
      
      let query = supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())

      if (excludeUserId) {
        query = query.neq('id', excludeUserId)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error checking username availability:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        // Fallback: Allow valid usernames if DB query fails
        return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username)
      }

      return data.length === 0
    } catch (error) {
      console.error('Error in isUsernameAvailable:', error)
      // Fallback: Allow valid usernames if function fails
      return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username)
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

  // Add Identity NFT record
  static async addIdentityNFT(
    userId: string,
    nftData: {
      nftId: string
      objectId: string
      metadataUri: string
    }
  ): Promise<boolean> {
    try {
      if (!isSupabaseConfigured()) {
        console.error('❌ Supabase is not properly configured for NFT storage.')
        return false
      }

      const { error } = await (supabase
        .from('identity_nfts') as any)
        .insert({
          user_id: userId,
          nft_id: nftData.nftId,
          object_id: nftData.objectId,
          metadata_uri: nftData.metadataUri,
          minted_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Error storing NFT record:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        return false
      }

      console.log('✅ NFT record stored successfully:', nftData.nftId)
      return true
    } catch (error) {
      console.error('Error in addIdentityNFT:', error)
      return false
    }
  }

  // Get user's Identity NFTs
  static async getUserIdentityNFTs(userId: string) {
    try {
      if (!isSupabaseConfigured()) {
        console.error('❌ Supabase is not properly configured.')
        return []
      }

      const { data: nfts, error } = await supabase
        .from('identity_nfts')
        .select('*')
        .eq('user_id', userId)
        .order('minted_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching user NFTs:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        return []
      }

      return nfts || []
    } catch (error) {
      console.error('Error in getUserIdentityNFTs:', error)
      return []
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

// Database Manager - Main interface for all database operations
export class DatabaseManager {
  // User Management
  static async createUser(userData: {
    wallet_address: string
    username?: string
    email?: string
  }): Promise<User | null> {
    return UserService.createOrUpdateUser({
      wallet: { address: userData.wallet_address },
      email: userData.email ? { address: userData.email } : null,
      google: userData.username ? { name: userData.username } : null
    })
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user by ID:', error)
        return null
      }

      return user
    } catch (error) {
      console.error('Error in getUserById:', error)
      return null
    }
  }

  static async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    return UserService.getUserByWalletAddress(walletAddress)
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    return UserService.updateUserProfile(userId, updates)
  }

  // NFT Management
  static async addIdentityNFT(
    userId: string,
    nftData: {
      nftId: string
      objectId: string
      metadataUri: string
    }
  ): Promise<boolean> {
    return UserService.addIdentityNFT(userId, nftData)
  }

  static async getIdentityNFTs(userId: string) {
    return UserService.getUserIdentityNFTs(userId)
  }

  static async updateIdentityNFT(
    userId: string,
    nftId: string,
    updates: {
      reputation_score?: number
      level?: number
      metadata_uri?: string
      updated_at?: string
    }
  ): Promise<boolean> {
    try {
      if (!isSupabaseConfigured()) {
        console.error('❌ Supabase is not properly configured.')
        return false
      }

      const { error } = await (supabase
        .from('identity_nfts') as any)
        .update(updates)
        .eq('user_id', userId)
        .eq('nft_id', nftId)

      if (error) {
        console.error('❌ Error updating NFT:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateIdentityNFT:', error)
      return false
    }
  }

  // Social Connections
  static async addSocialConnection(
    userId: string,
    platform: SocialConnection['platform'],
    data: {
      username: string
      profileData?: any
      verified?: boolean
    }
  ): Promise<SocialConnection | null> {
    return SocialConnectionService.upsertSocialConnection(userId, platform, data)
  }

  static async getSocialConnections(userId: string): Promise<SocialConnection[]> {
    return SocialConnectionService.getUserSocialConnections(userId)
  }

  static async verifySocialConnection(userId: string, platform: string): Promise<boolean> {
    return SocialConnectionService.verifySocialConnection(userId, platform)
  }

  // Reputation Management
  static async updateReputationScore(
    userId: string,
    scores: {
      totalScore: number
      defiScore: number
      socialScore: number
      developerScore: number
      aiAnalysis?: any
    }
  ): Promise<ReputationScore | null> {
    return ReputationService.upsertReputationScore(userId, scores)
  }

  static async getReputationScore(userId: string): Promise<ReputationScore | null> {
    return ReputationService.getUserReputationScore(userId)
  }

  // Profile Management
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    return UserService.getUserProfile(userId)
  }

  static async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    return UserService.isUsernameAvailable(username, excludeUserId)
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