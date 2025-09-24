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

// Job Board System Types

export interface Company {
  id: string
  name: string
  description?: string
  website?: string
  logo_url?: string
  company_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'
  industry?: string
  location?: string
  wallet_address?: string
  created_by: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface JobSkill {
  id: string
  name: string
  category: 'blockchain' | 'programming' | 'design' | 'marketing' | 'business' | 'other'
  description?: string
  is_active: boolean
  created_at: string
}

export interface Job {
  id: string
  company_id: string
  title: string
  description: string
  requirements: string
  job_type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  location_type: 'remote' | 'on-site' | 'hybrid'
  location?: string
  salary_min?: number
  salary_max?: number
  salary_currency: string
  min_reputation_score: number
  required_skills: string[] // Array of skill IDs
  preferred_skills: string[] // Array of skill IDs
  benefits?: string[]
  application_deadline?: string
  is_active: boolean
  view_count: number
  application_count: number
  featured: boolean
  remote_friendly: boolean
  equity_offered: boolean
  crypto_payment: boolean
  sui_payment: boolean
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  job_id: string
  applicant_id: string
  company_id: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'rejected' | 'hired'
  cover_letter?: string
  resume_url?: string
  portfolio_url?: string
  github_url?: string
  expected_salary?: number
  availability?: string
  ai_match_score: number
  reputation_at_application: number
  skills_match_count: number
  hr_rating?: number // 1-5
  hr_notes?: string
  interview_scheduled_at?: string
  response_deadline?: string
  applied_at: string
  updated_at: string
}

export interface UserSkill {
  id: string
  user_id: string
  skill_id: string
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  verified: boolean
  verification_source?: string
  years_experience?: number
  created_at: string
}

export interface JobView {
  id: string
  job_id: string
  user_id?: string
  viewed_at: string
  ip_address?: string
  user_agent?: string
}

export interface JobSaved {
  id: string
  job_id: string
  user_id: string
  saved_at: string
}

export interface InterviewSchedule {
  id: string
  application_id: string
  scheduled_by: string
  interview_type: 'phone' | 'video' | 'in-person' | 'technical'
  scheduled_at: string
  duration_minutes: number
  meeting_link?: string
  location?: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  feedback?: string
  rating?: number // 1-5
  created_at: string
  updated_at: string
}

// Extended job types with relations
export interface JobWithDetails extends Job {
  company: Company
  required_skills_details: JobSkill[]
  preferred_skills_details: JobSkill[]
  applications?: JobApplication[]
  user_saved?: boolean
  user_applied?: boolean
}

export interface JobApplicationWithDetails extends JobApplication {
  job: JobWithDetails
  applicant: UserProfile
  company: Company
  interview_schedules?: InterviewSchedule[]
}

export interface CompanyWithJobs extends Company {
  jobs: Job[]
  total_jobs: number
  active_jobs: number
}

export interface UserWithSkills extends UserProfile {
  user_skills: (UserSkill & { skill: JobSkill })[]
  job_applications?: JobApplicationWithDetails[]
}

// Job form types
export interface JobPostForm {
  title: string
  description: string
  requirements: string
  job_type: Job['job_type']
  experience_level: Job['experience_level']
  location_type: Job['location_type']
  location?: string
  salary_min?: number
  salary_max?: number
  salary_currency: string
  min_reputation_score: number
  required_skills: string[]
  preferred_skills: string[]
  benefits?: string[]
  application_deadline?: string
  remote_friendly: boolean
  equity_offered: boolean
  crypto_payment: boolean
  sui_payment: boolean
}

export interface JobApplicationForm {
  cover_letter?: string
  resume_url?: string
  portfolio_url?: string
  github_url?: string
  expected_salary?: number
  availability?: string
}

export interface CompanyForm {
  name: string
  description?: string
  website?: string
  logo_url?: string
  company_size?: Company['company_size']
  industry?: string
  location?: string
  wallet_address?: string
}

// Job search and filtering
export interface JobSearchFilters {
  search?: string
  job_type?: Job['job_type'][]
  experience_level?: Job['experience_level'][]
  location_type?: Job['location_type'][]
  skills?: string[]
  salary_min?: number
  salary_max?: number
  company_size?: Company['company_size'][]
  remote_friendly?: boolean
  crypto_payment?: boolean
  sui_payment?: boolean
  featured_only?: boolean
}

export interface JobSearchResults {
  jobs: JobWithDetails[]
  total_count: number
  has_more: boolean
  filters_applied: JobSearchFilters
}

// HR Dashboard types
export interface ApplicationStats {
  total_applications: number
  pending: number
  reviewed: number
  shortlisted: number
  interviewed: number
  rejected: number
  hired: number
}

export interface HRDashboardData {
  company: CompanyWithJobs
  recent_applications: JobApplicationWithDetails[]
  application_stats: ApplicationStats
  top_candidates: JobApplicationWithDetails[]
  job_performance: {
    job: JobWithDetails
    application_count: number
    avg_match_score: number
    view_to_application_ratio: number
  }[]
}

export default User