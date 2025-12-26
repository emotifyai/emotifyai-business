// Load environment variables
require('dotenv').config()

async function debugSubscription() {
  try {
    console.log('🔍 Debugging subscription data...')
    
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Find Ahmed's user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'ahmedmuhmmed239@gmail.com')
      .single()

    if (profileError) {
      console.error('❌ Profile error:', profileError)
      return
    }

    console.log('✅ Found profile:', {
      id: profile.id,
      email: profile.email,
      display_name: profile.display_name
    })

    // Get all subscriptions for this user
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profile.id)

    if (subError) {
      console.error('❌ Subscription error:', subError)
      return
    }

    console.log('📊 Subscriptions found:', subscriptions?.length || 0)
    
    if (subscriptions && subscriptions.length > 0) {
      subscriptions.forEach((sub, index) => {
        console.log(`\n📋 Subscription ${index + 1}:`)
        console.log('- ID:', sub.id)
        console.log('- Lemon Squeezy ID:', sub.lemon_squeezy_id)
        console.log('- Status:', sub.status)
        console.log('- Tier:', sub.tier)
        console.log('- Tier Name:', sub.tier_name)
        console.log('- Credits Limit:', sub.credits_limit)
        console.log('- Credits Used:', sub.credits_used)
        console.log('- Current Period End:', sub.current_period_end)
        console.log('- Created:', sub.created_at)
        console.log('- Updated:', sub.updated_at)
      })
    } else {
      console.log('❌ No subscriptions found for this user')
    }

    // Test the API endpoint directly
    console.log('\n🌐 Testing API endpoint...')
    
    // First get the user's auth token (we'll simulate this)
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/subscription`, {
      headers: {
        'Authorization': `Bearer fake-token-for-testing`,
        'Content-Type': 'application/json'
      }
    })

    console.log('API Response Status:', response.status)
    const apiData = await response.text()
    console.log('API Response:', apiData)

  } catch (error) {
    console.error('💥 Debug error:', error.message)
  }
}

debugSubscription().catch(console.error)