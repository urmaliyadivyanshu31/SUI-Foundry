import { supabaseAdmin, isSupabaseConfigured } from '../core/supabase'

export interface DatabaseStatus {
  configured: boolean
  connected: boolean
  tablesExist: boolean
  initialDataLoaded: boolean
  errors: string[]
  warnings: string[]
}

export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    configured: false,
    connected: false,
    tablesExist: false,
    initialDataLoaded: false,
    errors: [],
    warnings: []
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    status.errors.push('Supabase environment variables not configured')
    status.warnings.push('Set up NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY')
    return status
  }

  status.configured = true

  // Test connection
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      if (error.message.includes('relation "public.users" does not exist')) {
        status.errors.push('Database tables not created')
        status.warnings.push('Run the migration: supabase/migrations/001_initial_schema.sql')
      } else {
        status.errors.push(`Connection error: ${error.message}`)
      }
      return status
    }

    status.connected = true
    status.tablesExist = true

    // Check if initial data is loaded
    const [questsResult, badgesResult] = await Promise.all([
      supabaseAdmin.from('quests').select('count'),
      supabaseAdmin.from('badges').select('count')
    ])

    const questCount = questsResult.data?.length || 0
    const badgeCount = badgesResult.data?.length || 0

    if (questCount > 0 && badgeCount > 0) {
      status.initialDataLoaded = true
    } else {
      status.warnings.push('Initial quest and badge data not loaded')
    }

  } catch (error) {
    status.errors.push(`Unexpected error: ${error}`)
  }

  return status
}

export function getDatabaseStatusMessage(status: DatabaseStatus): string {
  if (!status.configured) {
    return '🔧 Database not configured. Set up environment variables.'
  }
  
  if (!status.connected) {
    return '❌ Database connection failed. Check your Supabase configuration.'
  }
  
  if (!status.tablesExist) {
    return '📋 Database tables not found. Run the SQL migration.'
  }
  
  if (!status.initialDataLoaded) {
    return '⚠️ Database connected but initial data missing.'
  }
  
  return '✅ Database fully configured and ready!'
}

export function isDatabaseReady(status: DatabaseStatus): boolean {
  return status.configured && status.connected && status.tablesExist
}