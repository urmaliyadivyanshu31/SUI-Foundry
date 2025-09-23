import { supabaseAdmin } from '@/lib/core/supabase'

export async function GET() {
  try {
    // Check RLS policies on users table
    const { data: policies, error } = await supabaseAdmin.rpc('pg_policies', {}, {
      count: 'exact'
    })

    if (error) {
      console.error('Error fetching policies:', error)
    }

    // Also try to check if service role has the right permissions
    const { data: testInsert, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        wallet_address: 'test-address-' + Date.now(),
        username: 'test-user-' + Date.now(),
        email: 'test@example.com'
      })
      .select()

    return Response.json({
      policies: policies || 'Could not fetch policies',
      policiesError: error,
      testInsert: testInsert || 'Insert failed',
      insertError: insertError
    })

  } catch (error) {
    return Response.json({
      error: 'Debug endpoint error',
      details: error
    })
  }
}