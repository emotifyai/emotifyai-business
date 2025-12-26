#!/usr/bin/env node

/**
 * Script to test production Supabase credentials specifically
 */

import { createClient } from '@supabase/supabase-js'

// Credentials provided by the user
const prodEnv = {
    NEXT_PUBLIC_SUPABASE_URL: '', // Add them only for test then remove them
    NEXT_PUBLIC_SUPABASE_ANON_KEY: '', // Add them only for test then remove them
    SUPABASE_SERVICE_ROLE_KEY: '' // Add them only for test then remove them
}

async function testConnection() {
    console.log('🚀 Testing Production Supabase Connection...')
    console.log(`URL: ${prodEnv.NEXT_PUBLIC_SUPABASE_URL}\n`)

    // 1. Test Anon Client
    console.log('--- 1. Testing Anon Client (Public Access) ---')
    try {
        const anonClient = createClient(prodEnv.NEXT_PUBLIC_SUPABASE_URL, prodEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        const { data, error } = await anonClient.from('profiles').select('id').limit(1)

        if (error) {
            console.log(`❌ Anon Access failed: ${error.message}`)
            console.log(`Code: ${error.code}`)
        } else {
            console.log('✅ Anon Access successful (connection established)')
        }
    } catch (err) {
        console.log(`❌ Anon Access exception: ${err.message}`)
    }

    // 2. Test Service Role Client (Admin Access)
    console.log('\n--- 2. Testing Service Role Client (Admin Access) ---')
    try {
        const adminClient = createClient(prodEnv.NEXT_PUBLIC_SUPABASE_URL, prodEnv.SUPABASE_SERVICE_ROLE_KEY)

        // Test Table Access
        const tables = ['profiles', 'subscriptions', 'lifetime_subscribers']
        for (const table of tables) {
            const { error } = await adminClient.from(table).select('count', { count: 'exact', head: true })
            if (error) {
                console.log(`❌ Table ${table}: ${error.message}`)
            } else {
                console.log(`✅ Table ${table}: accessible`)
            }
        }

        // Test RPC Function Access
        console.log('\n--- 3. Testing RPC Functions ---')
        const functions = ['get_lifetime_slot_info', 'is_lifetime_offer_available']
        for (const func of functions) {
            const { data, error } = await adminClient.rpc(func)
            if (error) {
                console.log(`❌ RPC ${func}: ${error.message}`)
            } else {
                console.log(`✅ RPC ${func}: exists and callable`)
                if (data) console.log(`   Result: ${JSON.stringify(data)}`)
            }
        }

    } catch (err) {
        console.log(`❌ Service Role exception: ${err.message}`)
    }
}

testConnection()
