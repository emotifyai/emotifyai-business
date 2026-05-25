#!/usr/bin/env bun

/**
 * Simple Claude AI Demo - Real Content Enhancement
 * Shows actual Claude AI output with real-world examples
 */

import '@anthropic-ai/sdk/shims/node'
import { enhanceText, type EnhanceOptions } from '../lib/ai/claude'

// Real content examples that users would actually enhance
const realExamples = [
  {
    title: "📧 Email to Boss",
    text: "hey can you approve my vacation request for next week? i really need the time off",
    language: 'en' as const,
    tone: 'marketing' as const
  },
  {
    title: "📱 Customer Support Response", 
    text: "sorry your order is delayed. we're working on it. will update you soon",
    language: 'en' as const,
    tone: 'marketing' as const
  },
  {
    title: "💼 LinkedIn Post",
    text: "just got promoted to senior developer! excited for new challenges ahead",
    language: 'en' as const,
    tone: 'marketing' as const
  },
  {
    title: "🌍 Arabic Business Message",
    text: "أريد أن أحجز اجتماع معك الأسبوع القادم لمناقشة المشروع",
    language: 'ar' as const,
    tone: 'marketing' as const
  },
  {
    title: "🇫🇷 French Casual Text",
    text: "salut! on se voit demain pour le projet? dis moi si ca marche pour toi",
    language: 'fr' as const,
    tone: 'marketing' as const
  }
]

function printHeader(title: string) {
  console.log('\n' + '='.repeat(60))
  console.log(`🤖 ${title}`)
  console.log('='.repeat(60))
}

function printExample(index: number, total: number, title: string) {
  console.log(`\n📝 ${index}/${total} ${title}`)
  console.log('-'.repeat(50))
}

async function runDemo() {
  printHeader('Claude AI Real Content Demo')
  
  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is required')
    console.log('💡 Set it with: export ANTHROPIC_API_KEY="your-key"')
    process.exit(1)
  }
  
  console.log('🔑 API Key: ✅ Ready')
  console.log('🎯 Model: claude-3-5-haiku-20241022')
  
  for (let i = 0; i < realExamples.length; i++) {
    const example = realExamples[i]
    
    printExample(i + 1, realExamples.length, example.title)
    
    console.log('📥 ORIGINAL:')
    console.log(`"${example.text}"`)
    console.log(`\n🌍 Language: ${example.language} | 🎨 Tone: ${example.tone}`)
    
    try {
      console.log('\n⏳ Enhancing with Claude AI...')
      
      const startTime = Date.now()
      const result = await enhanceText({
        text: example.text,
        outputLanguage: example.language === 'ar' ? 'ar_gulf' : 'en',
        tone: example.tone,
        platform: 'store',
      })
      const duration = Date.now() - startTime
      
      console.log('\n✨ ENHANCED (PURIFIED):')
      console.log(`"${result.enhancedText}"`)
      
      console.log(`\n📊 Stats: ${result.tokensUsed} tokens | ${duration}ms | ${result.language}`)
      
      // Show purification info
      if (result.purification) {
        const { wasImpure, issues, confidence } = result.purification
        if (wasImpure) {
          console.log(`🧹 Purification: Removed ${issues.length} impurities (${confidence} confidence)`)
        } else {
          console.log('🧹 Purification: Output was already clean')
        }
      }
      
    } catch (error: any) {
      console.log(`\n❌ Error: ${error.message}`)
    }
    
    // Wait between requests
    if (i < realExamples.length - 1) {
      console.log('\n⏳ Waiting 2 seconds...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('🎉 Demo Complete!')
  console.log('💡 Claude AI is enhancing real content successfully!')
  console.log('='.repeat(60))
}

// Run the demo
if (import.meta.main) {
  runDemo().catch(error => {
    console.error('\n❌ Demo failed:', error.message)
    process.exit(1)
  })
}