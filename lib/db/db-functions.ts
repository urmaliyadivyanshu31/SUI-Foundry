import { supabase, supabaseAdmin, isSupabaseConfigured, type Database } from '../core/supabase'
import { isValidSuiAddress } from '@mysten/sui/utils'
import type { User, SocialConnection, ReputationScore, UserProfile, EnhancedBlockchainData } from '@/types'
import { getCompleteUserData } from '../blockchain/blockchain-data'

// Utility function to safely log error objects
function logError(prefix: string, error: any, additionalData: any = {}) {
  const errorInfo = {
    message: error?.message || 'Unknown error',
    code: error?.code || 'NO_CODE',
    details: error?.details || 'No details available',
    hint: error?.hint || 'No hint available',
    name: error?.name || 'Unknown error name',
    stack: error?.stack || 'No stack trace',
    ...additionalData
  }
  
  // Try to extract any other properties from the error
  try {
    const errorKeys = Object.getOwnPropertyNames(error || {})
    for (const key of errorKeys) {
      if (!errorInfo[key] && error[key] !== undefined) {
        errorInfo[key] = String(error[key])
      }
    }
  } catch (e) {
    errorInfo.extractionError = 'Could not extract error properties'
  }
  
  console.error(prefix, errorInfo)
}

// User Profile Management Functions

export class UserService {
  // Enhanced Enoki user creation with blockchain data integration
  static async createOrUpdateEnokiUserWithBlockchainData(enokiUserData: any): Promise<{
    user: User | null
    blockchainData?: EnhancedBlockchainData
    error?: string
  }> {
    try {
      console.log('🔄 Creating/updating Enoki user with blockchain data:', {
        wallet_address: enokiUserData.address || enokiUserData.walletAddress,
        provider: enokiUserData.provider || 'google'
      })

      const walletAddress = enokiUserData.address || enokiUserData.walletAddress

      // Validate wallet address first
      if (!walletAddress || !isValidSuiAddress(walletAddress)) {
        const error = `Invalid Sui wallet address: ${walletAddress}`
        console.error('❌', error)
        return { user: null, error }
      }

      // Convert Enoki data to our expected format
      const userData = {
        wallet_address: walletAddress,
        email: enokiUserData.email,
        username: null, // Will be set during onboarding
        zklogin_sub: enokiUserData.sub,
        oauth_provider: enokiUserData.provider || 'google',
        profile_picture: enokiUserData.picture,
        // Enoki handles zkLogin internally, so these fields are not needed
        salt_value: null,
        max_epoch: null,
        ephemeral_public_key: null,
        jwt_token: null
      }

      // First, create or update the user
      const user = await this.createOrUpdateZkLoginUser(userData)
      if (!user) {
        return { user: null, error: 'Failed to create or update user' }
      }

      // Fetch complete blockchain data for the user's wallet
      let blockchainData: EnhancedBlockchainData | undefined
      try {
        console.log('🔍 Fetching blockchain data for wallet:', zkLoginUserData.wallet_address)
        blockchainData = await getCompleteUserData(zkLoginUserData.wallet_address)
        
        // Store blockchain data in database if available
        if (isSupabaseConfigured() && blockchainData) {
          await this.storeBlockchainData(user.id, blockchainData)
        }
      } catch (blockchainError) {
        console.warn('⚠️ Failed to fetch blockchain data, continuing with user creation:', blockchainError)
        // Don't fail user creation if blockchain data fails
      }

      return { 
        user, 
        blockchainData,
        error: undefined 
      }
    } catch (error) {
      console.error('❌ Error in createOrUpdateZkLoginUserWithBlockchainData:', error)
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Store blockchain data in database tables
  private static async storeBlockchainData(userId: string, data: EnhancedBlockchainData): Promise<void> {
    try {
      console.log('💾 Storing blockchain data for user:', userId)

      // Store wallet balances
      if (data.realTimeBalance && data.realTimeBalance.length > 0) {
        const balancesToStore = data.realTimeBalance.map(balance => ({
          ...balance,
          user_id: userId
        }))

        const { error: balanceError } = await supabaseAdmin
          .from('wallet_balances')
          .upsert(balancesToStore, {
            onConflict: 'user_id,wallet_address,token_type'
          })

        if (balanceError) {
          console.warn('⚠️ Failed to store wallet balances:', balanceError)
        } else {
          console.log('✅ Stored wallet balances:', balancesToStore.length)
        }
      }

      // Store transaction history
      if (data.transactionHistory && data.transactionHistory.length > 0) {
        const transactionsToStore = data.transactionHistory.map(tx => ({
          ...tx,
          user_id: userId
        }))

        const { error: txError } = await supabaseAdmin
          .from('wallet_transactions')
          .upsert(transactionsToStore, {
            onConflict: 'transaction_digest'
          })

        if (txError) {
          console.warn('⚠️ Failed to store transactions:', txError)
        } else {
          console.log('✅ Stored transactions:', transactionsToStore.length)
        }
      }

      // Store NFT collection
      if (data.nftCollection && data.nftCollection.length > 0) {
        const nftsToStore = data.nftCollection.map(nft => ({
          ...nft,
          user_id: userId
        }))

        const { error: nftError } = await supabaseAdmin
          .from('user_nfts')
          .upsert(nftsToStore, {
            onConflict: 'object_id'
          })

        if (nftError) {
          console.warn('⚠️ Failed to store NFTs:', nftError)
        } else {
          console.log('✅ Stored NFTs:', nftsToStore.length)
        }
      }

      // Store DeFi interactions
      if (data.defiActivity && data.defiActivity.length > 0) {
        const defiToStore = data.defiActivity.map(defi => ({
          ...defi,
          user_id: userId
        }))

        const { error: defiError } = await supabaseAdmin
          .from('defi_interactions')
          .upsert(defiToStore, {
            onConflict: 'transaction_digest'
          })

        if (defiError) {
          console.warn('⚠️ Failed to store DeFi interactions:', defiError)
        } else {
          console.log('✅ Stored DeFi interactions:', defiToStore.length)
        }
      }

      console.log('✅ Blockchain data storage completed')
    } catch (error) {
      console.error('❌ Error storing blockchain data:', error)
      // Don't throw - this is not critical for user creation
    }
  }

  // Create or update user profile from zkLogin authentication via API route
  static async createOrUpdateZkLoginUser(zkLoginUserData: any): Promise<User | null> {
    try {
      const walletAddress = zkLoginUserData.wallet_address

      // Validate wallet address before any operations
      if (!walletAddress || !isValidSuiAddress(walletAddress)) {
        console.error('❌ Invalid Sui wallet address:', walletAddress)
        return null
      }

      console.log('📝 Creating user via API route:', {
        wallet_address: walletAddress,
        email: zkLoginUserData.email,
        oauth_provider: zkLoginUserData.oauth_provider
      })

      // Call the API route for user creation
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zkLoginUserData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API error creating user:', errorData)
        return null
      }

      const data = await response.json()
      console.log('✅ User created/updated successfully via API:', data.user.id)
      
      return data.user as User
    } catch (error) {
      console.error('❌ Unexpected error in createOrUpdateZkLoginUser:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userWalletAddress: zkLoginUserData.wallet_address
      })
      return null
    }
  }

  // Legacy function - kept for backward compatibility during migration
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
          message: fetchError.message || 'Unknown database error',
          code: fetchError.code || 'NO_CODE',
          details: fetchError.details || 'No details available',
          hint: fetchError.hint || 'No hint available',
          fullError: fetchError
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
          console.error('❌ Error updating existing user:', {
            message: updateError.message || 'Unknown update error',
            code: updateError.code || 'NO_CODE',
            details: updateError.details || 'No details available',
            hint: updateError.hint || 'No hint available',
            fullError: updateError
          })
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
          console.error('❌ Error creating new user:', {
            message: createError.message || 'Unknown create error',
            code: createError.code || 'NO_CODE',
            details: createError.details || 'No details available',
            hint: createError.hint || 'No hint available',
            insertData: insertData,
            fullError: createError
          })
          return null
        }

        return newUser
      }
    } catch (error: any) {
      console.error('❌ Unexpected error in createOrUpdateUser:', {
        message: error.message || 'Unknown error',
        stack: error.stack,
        privyUserId: privyUser?.id,
        error: error
      })
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
        console.error('❌ Error fetching user profile:', {
          message: userError.message || 'Unknown profile fetch error',
          code: userError.code || 'NO_CODE',
          details: userError.details || 'No details available',
          hint: userError.hint || 'No hint available',
          userId: userId,
          fullError: userError
        })
        return null
      }

      return user as UserProfile
    } catch (error: any) {
      console.error('❌ Unexpected error in getUserProfile:', {
        message: error.message || 'Unknown error',
        stack: error.stack,
        userId: userId,
        error: error
      })
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
        logError('❌ Error updating user profile:', error, {
          userId: userId,
          updateData: updateData
        })
        return null
      }

      return updatedUser
    } catch (error: any) {
      console.error('❌ Unexpected error in updateUserProfile:', {
        message: error.message || 'Unknown error',
        stack: error.stack,
        userId: userId,
        updates: updates,
        error: error
      })
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
        logError('❌ Error checking username availability:', error, {
          username: username,
          excludeUserId: excludeUserId
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
        logError('❌ Error fetching social connections:', error, {
          userId: userId
        })
        return []
      }

      return connections
    } catch (error: any) {
      console.error('❌ Unexpected error in getUserSocialConnections:', {
        message: error.message || 'Unknown error',
        stack: error.stack,
        userId: userId,
        error: error
      })
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