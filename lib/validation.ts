import { z } from 'zod'

// Sui blockchain validation schemas
export const suiAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Sui address format')

export const objectIdSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Sui object ID format')

export const packageIdSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid package ID format')

// User profile validation
export const userProfileSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address').optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
  wallet_address: suiAddressSchema.optional(),
  reputation_score: z.number()
    .min(0, 'Reputation score cannot be negative')
    .max(1000, 'Reputation score cannot exceed 1000')
    .default(0),
  is_verified: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

// Social connection validation
export const socialConnectionSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid('Invalid user ID'),
  platform: z.enum(['github', 'twitter', 'discord', 'linkedin'], {
    errorMap: () => ({ message: 'Platform must be one of: github, twitter, discord, linkedin' })
  }),
  platform_user_id: z.string().min(1, 'Platform user ID is required'),
  username: z.string().min(1, 'Username is required'),
  is_verified: z.boolean().default(false),
  verification_data: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional()
})

// NFT validation schemas
export const nftMetadataSchema = z.object({
  name: z.string().min(1, 'NFT name is required').max(100, 'NFT name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  image: z.string().url('Invalid image URL'),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.union([z.string(), z.number()])
  })).optional(),
  reputation_score: z.number().min(0).max(1000),
  level: z.number().min(1).max(100),
  social_connections: z.array(z.string()).default([]),
  badges: z.array(z.string()).default([])
})

export const identityNFTSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid('Invalid user ID'),
  nft_id: z.string().min(1, 'NFT ID is required'),
  object_id: objectIdSchema,
  metadata_uri: z.string().url('Invalid metadata URI'),
  reputation_score: z.number().min(0).max(1000),
  level: z.number().min(1).max(100),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

// Quest validation schemas
export const questSchema = z.object({
  id: z.string().min(1, 'Quest ID is required'),
  title: z.string().min(1, 'Quest title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long'),
  type: z.enum(['onboarding', 'social', 'github', 'reputation', 'nft', 'defi', 'engagement', 'verification']),
  xp_reward: z.number().min(0, 'XP reward cannot be negative'),
  sui_reward: z.number().min(0, 'SUI reward cannot be negative'),
  requirements: z.array(z.string()).min(1, 'Quest must have at least one requirement'),
  is_active: z.boolean().default(true),
  progress: z.number().min(0).max(100).default(0),
  completed: z.boolean().default(false)
})

export const userQuestProgressSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid('Invalid user ID'),
  quest_id: z.string().min(1, 'Quest ID is required'),
  progress: z.number().min(0).max(100),
  completed: z.boolean().default(false),
  completed_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

// Transaction validation schemas
export const transactionSchema = z.object({
  digest: z.string().min(1, 'Transaction digest is required'),
  sender: suiAddressSchema,
  gas_used: z.number().min(0),
  status: z.enum(['success', 'failure']),
  type: z.enum(['mint_nft', 'update_reputation', 'complete_quest', 'transfer']),
  block_height: z.number().min(0).optional(),
  timestamp: z.string().datetime().optional()
})

// API request validation
export const mintNFTRequestSchema = z.object({
  wallet_address: suiAddressSchema,
  metadata: nftMetadataSchema
})

export const updateReputationRequestSchema = z.object({
  nft_id: z.string().min(1, 'NFT ID is required'),
  new_score: z.number().min(0).max(1000, 'Reputation score must be between 0 and 1000')
})

export const completeQuestRequestSchema = z.object({
  quest_id: z.string().min(1, 'Quest ID is required'),
  wallet_address: suiAddressSchema
})

// Environment validation
export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1, 'Privy app ID is required'),
  NEXT_PUBLIC_SUI_NETWORK: z.enum(['devnet', 'testnet', 'mainnet']),
  NEXT_PUBLIC_PACKAGE_ID: packageIdSchema.optional(),
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required').optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  TWITTER_CLIENT_ID: z.string().optional(),
  TWITTER_CLIENT_SECRET: z.string().optional()
})

// Validation helper functions
export function validateEnv() {
  try {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
      NEXT_PUBLIC_SUI_NETWORK: process.env.NEXT_PUBLIC_SUI_NETWORK,
      NEXT_PUBLIC_PACKAGE_ID: process.env.NEXT_PUBLIC_PACKAGE_ID,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
      TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET
    }
    
    return envSchema.parse(env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      throw new Error(`Environment validation failed: ${issues}`)
    }
    throw error
  }
}

export function createValidationError(field: string, message: string) {
  return {
    field,
    message,
    code: 'VALIDATION_ERROR'
  }
}

export function formatValidationErrors(error: z.ZodError) {
  return error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: 'VALIDATION_ERROR'
  }))
}

// Type exports for TypeScript
export type UserProfile = z.infer<typeof userProfileSchema>
export type SocialConnection = z.infer<typeof socialConnectionSchema>
export type IdentityNFT = z.infer<typeof identityNFTSchema>
export type NFTMetadata = z.infer<typeof nftMetadataSchema>
export type Quest = z.infer<typeof questSchema>
export type UserQuestProgress = z.infer<typeof userQuestProgressSchema>
export type Transaction = z.infer<typeof transactionSchema>
export type MintNFTRequest = z.infer<typeof mintNFTRequestSchema>
export type UpdateReputationRequest = z.infer<typeof updateReputationRequestSchema>
export type CompleteQuestRequest = z.infer<typeof completeQuestRequestSchema>
export type ValidationError = ReturnType<typeof createValidationError>