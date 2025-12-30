#!/usr/bin/env node

/**
 * Script to check the current Supabase database schema
 * This helps us understand what tables and functions actually exist
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: 'apps/web/.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Required:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
    console.log('🔍 Checking Supabase Schema...\n')

    try {
        // Check if tables exist
        console.log('📋 Checking Tables:')
        const tables = ['profiles', 'subscriptions', 'api_keys', 'lifetime_subscribers']
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1)
                
                if (error) {
                    console.log(`❌ ${table}: ${error.message}`)
                } else {
                    console.log(`✅ ${table}: exists (${data?.length || 0} sample records)`)
                }
            } catch (err) {
                console.log(`❌ ${table}: ${err.message}`)
            }
        }

        console.log('\n🔧 Checking Database Functions:')
        const functions = [
            'can_use_credits',
            'get_user_credit_status', 
            'consume_credits',
            'get_lifetime_subscriber_count',
            'reserve_lifetime_subscriber_slot',
            'is_lifetime_offer_available'
        ]

        for (const func of functions) {
            try {
                // Try to call the function with a test UUID
                const testUuid = '00000000-0000-0000-0000-000000000000'
                const { data, error } = await supabase.rpc(func, 
                    func.includes('user') || func.includes('credits') ? { user_uuid: testUuid } : {}
                )
                
                if (error) {
                    console.log(`❌ ${func}: ${error.message}`)
                } else {
                    console.log(`✅ ${func}: exists`)
                }
            } catch (err) {
                console.log(`❌ ${func}: ${err.message}`)
            }
        }

        console.log('\n📊 Sample Data Check:')
        
        // Check subscriptions table structure
        try {
            const { data: subs, error } = await supabase
                .from('subscriptions')
                .select('*')
                .limit(1)
            
            if (!error && subs && subs.length > 0) {
                console.log('✅ Subscriptions table structure:')
                console.log(Object.keys(subs[0]).join(', '))
            } else {
                console.log('ℹ️  No subscription records found')
            }
        } catch (err) {
            console.log(`❌ Error checking subscriptions: ${err.message}`)
        }

        // Check profiles table
        try {
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .limit(1)
            
            if (!error && profiles && profiles.length > 0) {
                console.log('✅ Profiles table structure:')
                console.log(Object.keys(profiles[0]).join(', '))
            } else {
                console.log('ℹ️  No profile records found')
            }
        } catch (err) {
            console.log(`❌ Error checking profiles: ${err.message}`)
        }

    } catch (error) {
        console.error('❌ Schema check failed:', error.message)
    }
}

checkSchema()