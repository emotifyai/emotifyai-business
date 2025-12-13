#!/usr/bin/env bun

/**
 * Find Available Claude Models Script
 * Queries the Anthropic API to find available Claude models
 */

import '@anthropic-ai/sdk/shims/node'
import Anthropic from '@anthropic-ai/sdk'

// Common Claude model names to test
const POTENTIAL_MODELS = [
  // Claude 3.5 Sonnet variants
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-sonnet-latest',
  'claude-3-5-sonnet',
  
  // Claude 3.5 Haiku variants
  'claude-3-5-haiku-20241022',
  'claude-3-5-haiku-latest',
  'claude-3-5-haiku',
  
  // Claude 3 variants
  'claude-3-sonnet-20240229',
  'claude-3-opus-20240229',
  'claude-3-haiku-20240307',
  
  // Generic names
  'claude-3-sonnet',
  'claude-3-opus',
  'claude-3-haiku',
]

async function testModel(anthropic: Anthropic, modelName: string): Promise<boolean> {
  try {
    console.log(`🧪 Testing model: ${modelName}`)
    
    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Hi'
        }
      ]
    })
    
    console.log(`✅ Model ${modelName} works!`)
    console.log(`   Response: ${response.content[0]?.type === 'text' ? response.content[0].text : 'N/A'}`)
    console.log(`   Usage: ${response.usage.input_tokens} input + ${response.usage.output_tokens} output tokens`)
    return true
    
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`❌ Model ${modelName} not found (404)`)
    } else if (error.status === 400) {
      console.log(`⚠️  Model ${modelName} bad request (400) - ${error.message}`)
    } else if (error.status === 401) {
      console.log(`🔑 Authentication error - check your API key`)
      return false
    } else if (error.status === 429) {
      console.log(`⏱️  Rate limited for ${modelName} - waiting...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      return false
    } else {
      console.log(`❓ Model ${modelName} error: ${error.status} - ${error.message}`)
    }
    return false
  }
}

async function findWorkingModels() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is required')
    console.log('💡 Set your API key: export ANTHROPIC_API_KEY="your-key-here"')
    process.exit(1)
  }
  
  console.log('🔍 Finding available Claude models...')
  console.log(`🔑 Using API key: ${apiKey.substring(0, 20)}...`)
  console.log('')
  
  const anthropic = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true, // Allow in Node.js environment
  })
  
  const workingModels: string[] = []
  
  for (const model of POTENTIAL_MODELS) {
    const works = await testModel(anthropic, model)
    if (works) {
      workingModels.push(model)
    }
    
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('\n📋 Summary:')
  console.log('=' .repeat(50))
  
  if (workingModels.length === 0) {
    console.log('❌ No working models found!')
    console.log('💡 This might indicate:')
    console.log('   - Invalid API key')
    console.log('   - Account access issues')
    console.log('   - All tested model names are incorrect')
  } else {
    console.log(`✅ Found ${workingModels.length} working model(s):`)
    workingModels.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model}`)
    })
    
    console.log('\n🔧 Recommended .env configuration:')
    console.log(`ANTHROPIC_MODEL=${workingModels[0]}`)
    
    if (workingModels.length > 1) {
      console.log('\n📝 Alternative models:')
      workingModels.slice(1).forEach(model => {
        console.log(`# ANTHROPIC_MODEL=${model}`)
      })
    }
  }
  
  console.log('\n🚀 Next steps:')
  console.log('1. Update your .env file with the working model name')
  console.log('2. Run your tests: bun run test:claude:real')
}

// Also try to get model info from Anthropic API if available
async function getModelInfo() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return
  
  try {
    console.log('\n🔍 Attempting to get model information...')
    
    // Note: Anthropic doesn't have a public models endpoint like OpenAI
    // So we'll just test the most likely candidates
    
    const anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    })
    
    // Try the most common current model
    const testModel = 'claude-3-5-sonnet-20241022'
    
    try {
      const response = await anthropic.messages.create({
        model: testModel,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Test' }]
      })
      
      console.log(`✅ Default model ${testModel} works`)
      return testModel
    } catch (error: any) {
      console.log(`❌ Default model ${testModel} failed: ${error.status}`)
    }
    
  } catch (error) {
    console.log('❌ Could not get model information')
  }
}

async function main() {
  console.log('🤖 Claude Model Finder')
  console.log('=' .repeat(30))
  
  await getModelInfo()
  await findWorkingModels()
}

if (import.meta.main) {
  main().catch(console.error)
}