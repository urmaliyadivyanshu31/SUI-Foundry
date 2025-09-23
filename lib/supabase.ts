import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}
if (!supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}
if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

// Use defaults for development if missing
const defaultUrl = supabaseUrl || 'https://placeholder.supabase.co'
const defaultAnonKey = supabaseAnonKey || 'placeholder-anon-key'
const defaultServiceKey = supabaseServiceKey || 'placeholder-service-key'

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          username: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          username?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          username?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      social_connections: {
        Row: {
          id: string
          user_id: string
          platform: string
          username: string
          verified: boolean
          profile_data: any | null
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          username: string
          verified?: boolean
          profile_data?: any | null
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          username?: string
          verified?: boolean
          profile_data?: any | null
          verified_at?: string | null
          created_at?: string
        }
      }
      reputation_scores: {
        Row: {
          id: string
          user_id: string
          total_score: number
          defi_score: number
          social_score: number
          developer_score: number
          ai_analysis: any | null
          calculated_at: string
          version: number
        }
        Insert: {
          id?: string
          user_id: string
          total_score?: number
          defi_score?: number
          social_score?: number
          developer_score?: number
          ai_analysis?: any | null
          calculated_at?: string
          version?: number
        }
        Update: {
          id?: string
          user_id?: string
          total_score?: number
          defi_score?: number
          social_score?: number
          developer_score?: number
          ai_analysis?: any | null
          calculated_at?: string
          version?: number
        }
      }
      identity_nfts: {
        Row: {
          id: string
          user_id: string
          nft_id: string
          object_id: string
          metadata_uri: string | null
          minted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nft_id: string
          object_id: string
          metadata_uri?: string | null
          minted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nft_id?: string
          object_id?: string
          metadata_uri?: string | null
          minted_at?: string
        }
      }
      quests: {
        Row: {
          id: string
          title: string
          description: string
          quest_type: string
          xp_reward: number
          requirements: any
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          quest_type: string
          xp_reward?: number
          requirements: any
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          quest_type?: string
          xp_reward?: number
          requirements?: any
          is_active?: boolean
          created_at?: string
        }
      }
      user_quest_progress: {
        Row: {
          id: string
          user_id: string
          quest_id: string
          completed: boolean
          progress: any | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quest_id: string
          completed?: boolean
          progress?: any | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quest_id?: string
          completed?: boolean
          progress?: any | null
          completed_at?: string | null
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          badge_type: string
          image_url: string | null
          requirements: any
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          badge_type: string
          image_url?: string | null
          requirements: any
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          badge_type?: string
          image_url?: string | null
          requirements?: any
          is_active?: boolean
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      tips: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          amount: number
          token_type: string
          transaction_hash: string | null
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          amount: number
          token_type?: string
          transaction_hash?: string | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          amount?: number
          token_type?: string
          transaction_hash?: string | null
          message?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Client-side Supabase client
export const supabase = createClient<Database>(defaultUrl, defaultAnonKey)

// Server-side Supabase client for API routes
export const createServerSupabaseClient = async () => {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  return createServerClient<Database>(
    defaultUrl,
    defaultAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Admin client with service role key
export const supabaseAdmin = createClient<Database>(defaultUrl, defaultServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Client component helper
export const createClientSupabaseClient = () => {
  return createBrowserClient<Database>(defaultUrl, defaultAnonKey)
}

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey)
}