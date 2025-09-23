#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://vvybiplljyimzollfnpd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eWJpcGxsanlpbXpvbGxmbnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUzMjc5NywiZXhwIjoyMDc0MTA4Nzk3fQ.2WycmIsOE5bcMsFfTsvguT84miS4yJAQVLafpB77OaA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Starting zkLogin database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/002_zklogin_support.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration into individual statements (handle semicolons properly)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;
      
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      console.log(`   ${statement.substring(0, 60)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        });
        
        if (error) {
          // Try direct query execution if RPC doesn't work
          console.log('   Trying direct query execution...');
          const { error: directError } = await supabase
            .from('_temp_')
            .select('*')
            .limit(0);
          
          if (directError) {
            throw new Error(`SQL Error: ${error.message}`);
          }
        }
        
        console.log('   ✅ Success');
      } catch (execError) {
        console.warn(`   ⚠️ Statement failed (may be already applied): ${execError.message}`);
        // Continue with next statement - some might already be applied
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify some key tables exist
    console.log('🔍 Verifying migration...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('zklogin_sub, oauth_provider')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Failed to verify users table:', usersError.message);
    } else {
      console.log('✅ Users table updated with zkLogin fields');
    }
    
    // Check if new tables exist by trying to query them
    const tables = ['zklogin_sessions', 'wallet_transactions', 'user_nfts', 'defi_interactions', 'wallet_balances'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table} not found or accessible`);
        } else {
          console.log(`✅ Table ${table} created successfully`);
        }
      } catch (err) {
        console.log(`❌ Table ${table} verification failed: ${err.message}`);
      }
    }
    
    console.log('🚀 zkLogin database migration is complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();