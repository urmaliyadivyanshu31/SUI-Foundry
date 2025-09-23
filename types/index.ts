// Global type definitions for SuiDentity

export interface User {
  id: string
  wallet_address: string
  username?: string
  email?: string
  created_at: string
  updated_at: string
  // zkLogin fields
  zklogin_sub?: string
  oauth_provider?: 'google' | 'github' | 'twitter'
  salt_value?: string
  max_epoch?: number
  ephemeral_public_key?: string
  jwt_token?: string
  profile_picture?: string
}

export interface SocialConnection {
  id: string
  user_id: string
  platform: 'github' | 'twitter' | 'linkedin' | 'discord'
  username: string
  verified: boolean
  profile_data?: any
  verified_at?: string
  created_at: string
}

export interface ReputationScore {
  id: string
  user_id: string
  total_score: number
  defi_score: number
  social_score: number
  developer_score: number
  ai_analysis?: any
  calculated_at: string
  version: number
}

export interface IdentityNFT {
  id: string
  user_id: string
  nft_id: string
  object_id: string
  metadata_uri?: string
  minted_at: string
}

export interface Quest {
  id: string
  title: string
  description: string
  quest_type: 'social' | 'defi' | 'developer' | 'community'
  xp_reward: number
  requirements: any
  is_active: boolean
  created_at: string
}

export interface UserQuestProgress {
  id: string
  user_id: string
  quest_id: string
  completed: boolean
  progress?: any
  completed_at?: string
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  badge_type: 'social' | 'defi' | 'developer' | 'milestone'
  image_url?: string
  requirements: any
  is_active: boolean
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

export interface Tip {
  id: string
  from_user_id: string
  to_user_id: string
  amount: number
  token_type: string
  transaction_hash?: string
  message?: string
  created_at: string
}

// Extended types with relations
export interface UserProfile extends User {
  social_connections: SocialConnection[]
  reputation_scores: ReputationScore[]
  identity_nfts: IdentityNFT[]
  user_badges: (UserBadge & { badge: Badge })[]
  quest_progress: (UserQuestProgress & { quest: Quest })[]
}

export interface SocialPlatformData {
  github?: {
    username: string
    public_repos: number
    followers: number
    following: number
    created_at: string
    bio?: string
    company?: string
    location?: string
    contributions?: number
  }
  twitter?: {
    username: string
    followers_count: number
    following_count: number
    tweet_count: number
    created_at: string
    bio?: string
    verified?: boolean
  }
  linkedin?: {
    username: string
    connections?: number
    bio?: string
  }
}

export interface BlockchainData {
  walletAddress: string
  suiTransactions?: number
  suiBalance?: number
  nftsOwned?: number
  defiProtocolsUsed?: string[]
  transactionHistory?: any[]
}

// UI State types
export interface AuthState {
  isAuthenticated: boolean
  user?: User
  loading: boolean
  error?: string
}

export interface ProfileState {
  profile?: UserProfile
  loading: boolean
  error?: string
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

// Sui transaction types
export interface SuiTransaction {
  digest: string
  timestampMs: string
  checkpoint?: string
  effects?: any
  events?: any[]
}

// Walrus storage types
export interface WalrusBlob {
  blobId: string
  encodedSize: number
  cost: number
  url: string
}

// NFT Metadata standard
export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: NFTAttribute[]
  external_url?: string
  animation_url?: string
  created_at: string
}

export interface NFTAttribute {
  trait_type: string
  value: string | number
  max_value?: number
  display_type?: string
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number
  user: User
  score: number
  change: number // Position change from last period
}

// Quest system types
export interface QuestRequirement {
  type: 'social_connections' | 'reputation_score' | 'nft_minted' | 'tips_sent' | 'profile_complete'
  target: number
  current?: number
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  type: 'quest_completed' | 'badge_earned' | 'tip_received' | 'reputation_updated'
  title: string
  message: string
  read: boolean
  created_at: string
  data?: any
}

// Form types
export interface ProfileUpdateForm {
  username?: string
  email?: string
  bio?: string
}

export interface SocialConnectionForm {
  platform: SocialConnection['platform']
  username: string
}

export interface TipForm {
  recipient_address: string
  amount: number
  message?: string
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Analytics types
export interface UserAnalytics {
  total_users: number
  active_users: number
  total_nfts_minted: number
  total_tips_sent: number
  average_reputation: number
}

export interface PlatformStats {
  total_quests: number
  completed_quests: number
  active_badges: number
  total_social_connections: number
}

// zkLogin specific types
export interface ZkLoginSession {
  id: string
  user_id: string
  session_token: string
  ephemeral_private_key_encrypted: string
  max_epoch: number
  created_at: string
  expires_at: string
  last_used: string
  is_active: boolean
}

export interface OAuthProviderData {
  id: string
  user_id: string
  provider: 'google' | 'github' | 'twitter'
  provider_user_id: string
  access_token_encrypted?: string
  refresh_token_encrypted?: string
  scope?: string
  token_expires_at?: string
  provider_data?: any
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  user_id: string
  transaction_digest: string
  transaction_type: 'sent' | 'received' | 'contract_call' | 'nft_mint' | 'swap' | 'stake' | 'unstake'
  amount?: number
  token_type: string
  from_address?: string
  to_address?: string
  gas_used?: number
  gas_price?: number
  status: 'success' | 'failed' | 'pending'
  block_number?: number
  timestamp_ms: number
  sui_timestamp?: string
  events?: any
  raw_data?: any
  indexed_at: string
}

export interface UserNFT {
  id: string
  user_id: string
  object_id: string
  collection_name?: string
  nft_name?: string
  description?: string
  image_url?: string
  creator_address?: string
  owner_address: string
  nft_type?: string
  attributes?: any
  rarity_score?: number
  floor_price?: number
  last_sale_price?: number
  acquired_at?: string
  last_updated: string
  is_owned: boolean
}

export interface DeFiInteraction {
  id: string
  user_id: string
  protocol_name: string
  protocol_address: string
  interaction_type: 'swap' | 'liquidity_add' | 'liquidity_remove' | 'stake' | 'unstake' | 'farm' | 'claim'
  transaction_digest: string
  input_tokens?: any[]
  output_tokens?: any[]
  pool_address?: string
  fees_paid?: number
  volume_usd?: number
  timestamp_ms: number
  sui_timestamp?: string
  indexed_at: string
}

export interface WalletBalance {
  id: string
  user_id: string
  wallet_address: string
  token_type: string
  token_symbol: string
  balance: number
  balance_usd?: number
  last_updated: string
}

// Enhanced blockchain data types
export interface EnhancedBlockchainData extends BlockchainData {
  realTimeBalance?: WalletBalance[]
  transactionHistory?: WalletTransaction[]
  nftCollection?: UserNFT[]
  defiActivity?: DeFiInteraction[]
  totalTransactions?: number
  totalVolume?: number
  totalNFTs?: number
  defiProtocolsCount?: number
  reputationScore?: number
}

// Real-time data fetching types
export interface BlockchainDataFetcher {
  getUserBalance(address: string): Promise<WalletBalance[]>
  getUserTransactions(address: string, limit?: number): Promise<WalletTransaction[]>
  getUserNFTs(address: string): Promise<UserNFT[]>
  getUserDeFiActivity(address: string): Promise<DeFiInteraction[]>
  calculateReputationScore(data: EnhancedBlockchainData): Promise<number>
}

export default User