// Load environment variables
require('dotenv').config()

async function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('Environment check:')
    console.log('- Supabase URL:', supabaseUrl ? 'Present' : 'Missing')
    console.log('- Service Key:', supabaseServiceKey ? 'Present' : 'Missing')
    console.log('- URL length:', supabaseUrl?.length || 0)
    console.log('- Key length:', supabaseServiceKey?.length || 0)
    console.log('- URL prefix:', supabaseUrl?.substring(0, 20) || 'none')
    console.log('- Key prefix:', supabaseServiceKey?.substring(0, 10) || 'none')

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase admin environment variables')
    }

    // Import createClient directly for admin usage
    const { createClient } = await import('@supabase/supabase-js')
    
    // Create admin client without SSR wrapper
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

async function testConnection(supabase) {
  try {
    console.log('\n=== Testing Supabase Connection ===')
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('Connection test failed:', testError)
      return false
    }

    console.log('✅ Connection successful')
    return true
  } catch (error) {
    console.error('Connection failed:', error.message)
    return false
  }
}

async function findUser(supabase) {
  try {
    console.log('\n=== Finding User ===')
    const email = 'ahmedmuhmmed239@gmail.com'
    
    // Try to find the user
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error finding user:', error)
      
      // Get all profiles for debugging
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .limit(10)
      
      console.log('Available profiles:')
      allProfiles?.forEach(p => {
        console.log(`- ${p.email} (${p.display_name}) - ID: ${p.id}`)
      })
      
      return null
    }

    console.log('✅ User found:', profile)
    return profile
  } catch (error) {
    console.error('Error in findUser:', error.message)
    return null
  }
}

async function updateSubscription(supabase, userId) {
  try {
    console.log('\n=== Updating Subscription ===')
    
    const subscriptionData = {
      user_id: userId,
      lemon_squeezy_id: 'order_7133753',
      status: 'active',
      tier: 'lifetime_launch',
      tier_name: 'lifetime_launch',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 100 years
      cancel_at: null,
      credits_limit: 1000,
      credits_used: 0,
      credits_reset_date: null,
      validity_days: null,
    }

    console.log('Subscription data:', subscriptionData)

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'lemon_squeezy_id',
      })
      .select()

    if (error) {
      console.error('Error updating subscription:', error)
      return false
    }

    console.log('✅ Subscription updated successfully:', data)
    return true
  } catch (error) {
    console.error('Error in updateSubscription:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Supabase connection test...')
  
  const supabase = await createAdminClient()
  
  const connected = await testConnection(supabase)
  if (!connected) {
    console.error('❌ Connection failed, exiting')
    process.exit(1)
  }

  const user = await findUser(supabase)
  if (!user) {
    console.error('❌ User not found, exiting')
    process.exit(1)
  }

  const updated = await updateSubscription(supabase, user.id)
  if (!updated) {
    console.error('❌ Subscription update failed')
    process.exit(1)
  }

  console.log('\n🎉 All operations completed successfully!')
}

main().catch(console.error)