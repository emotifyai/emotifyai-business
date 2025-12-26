// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Environment check:')
console.log('- Supabase URL:', supabaseUrl)
console.log('- Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'Missing')

async function testDirectAPI() {
  try {
    console.log('\n=== Testing Direct Supabase REST API ===')
    
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      }
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const data = await response.text()
    console.log('Response body:', data)

    if (response.ok) {
      console.log('✅ Direct API call successful')
      return true
    } else {
      console.log('❌ Direct API call failed')
      return false
    }
  } catch (error) {
    console.error('Direct API call error:', error.message)
    return false
  }
}

async function testSupabaseJS() {
  try {
    console.log('\n=== Testing Supabase JS Client ===')
    
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Supabase JS error:', error)
      return false
    }

    console.log('✅ Supabase JS client successful')
    console.log('Data:', data)
    return true
  } catch (error) {
    console.error('Supabase JS client error:', error.message)
    return false
  }
}

async function updateUserSubscription() {
  try {
    console.log('\n=== Updating User Subscription ===')
    
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // First find the user
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'ahmedmuhmmed239@gmail.com')
      .single()

    if (userError) {
      console.error('User not found:', userError)
      return false
    }

    console.log('Found user:', user)

    // Update subscription
    const subscriptionData = {
      user_id: user.id,
      lemon_squeezy_id: 'order_7133753',
      status: 'active',
      tier: 'lifetime_launch',
      tier_name: 'lifetime_launch',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at: null,
      credits_limit: 1000,
      credits_used: 0,
      credits_reset_date: null,
      validity_days: null,
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'lemon_squeezy_id',
      })
      .select()

    if (subError) {
      console.error('Subscription update error:', subError)
      return false
    }

    console.log('✅ Subscription updated successfully:', subscription)
    return true
  } catch (error) {
    console.error('Update subscription error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting comprehensive Supabase test...')
  
  const directAPI = await testDirectAPI()
  const supabaseJS = await testSupabaseJS()
  
  if (directAPI && supabaseJS) {
    console.log('\n✅ Both tests passed, proceeding with subscription update...')
    const updated = await updateUserSubscription()
    
    if (updated) {
      console.log('\n🎉 All operations completed successfully!')
    } else {
      console.log('\n❌ Subscription update failed')
    }
  } else {
    console.log('\n❌ Connection tests failed')
  }
}

main().catch(console.error)