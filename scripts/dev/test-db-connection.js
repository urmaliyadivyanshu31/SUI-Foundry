#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests Supabase connection and verifies tables are created
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testDatabaseConnection() {
  console.log('🧪 Testing SuiDentity Database Connection...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    process.exit(1)
  }
  
  if (!supabaseKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
    process.exit(1)
  }

  console.log('✅ Environment variables found')
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test connection by querying a simple table
  try {
    console.log('🔗 Testing connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('\n💡 Hint: Run the database migration first!')
        console.log('   1. Go to your Supabase dashboard')
        console.log('   2. Open SQL Editor')
        console.log('   3. Run the contents of: supabase/migrations/001_initial_schema.sql')
      }
      
      process.exit(1)
    }
    
    console.log('✅ Database connection successful!')
    
    // Test each table
    const tables = [
      'users', 'social_connections', 'reputation_scores', 
      'identity_nfts', 'quests', 'user_quest_progress', 
      'badges', 'user_badges', 'tips'
    ]
    
    console.log('\n📋 Checking tables...')
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1)
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`)
        } else {
          console.log(`✅ Table '${table}': OK`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`)
      }
    }
    
    // Check initial data
    console.log('\n📊 Checking initial data...')
    
    const { data: quests } = await supabase.from('quests').select('count')
    const { data: badges } = await supabase.from('badges').select('count')
    
    console.log(`✅ Quests: ${quests?.length || 0} initial quests loaded`)
    console.log(`✅ Badges: ${badges?.length || 0} initial badges loaded`)
    
    console.log('\n🎉 Database setup is complete and working!')
    console.log('You can now start the development server with: npm run dev')
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    process.exit(1)
  }
}

testDatabaseConnection()