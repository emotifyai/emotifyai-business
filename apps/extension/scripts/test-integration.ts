#!/usr/bin/env bun

/**
 * Integration Test Script
 * Tests the API directly without browser extension dependencies
 */

import ky from 'ky';

// Test cases
const testCases = [
  {
    name: 'Professional Email',
    text: 'hey can you send me the report? need it asap',
    options: { tone: 'professional' as const, language: 'en' as const }
  },
  {
    name: 'Casual Message',
    text: 'thanks for helping me out yesterday!',
    options: { tone: 'casual' as const, language: 'en' as const }
  },
  {
    name: 'Formal Document',
    text: 'this research shows interesting results',
    options: { tone: 'formal' as const, language: 'en' as const }
  }
];

async function testDirectAPI() {
  console.log('🧪 Starting Direct API Integration Test');
  console.log('=======================================');

  // Check if web server is running
  // Web app always runs on port 3000
  const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
  // for now we use 3000 
  // const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
  console.log(`🌐 API URL: ${apiUrl}`);

  try {
    // Test if server is accessible
    await ky.get(`${apiUrl}/api/health`).json();
    console.log('✅ Web server is running');
  } catch (error) {
    console.log('❌ Web server is not running');
    console.log('💡 Please start the web server first:');
    console.log('   cd apps/web && bun run dev');
    process.exit(1);
  }

  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}/${totalTests}: ${testCase.name}`);
    console.log(`Original: "${testCase.text}"`);

    try {
      const startTime = Date.now();

      // Call test API endpoint (no auth required)
      const response = await ky.post(`${apiUrl}/api/test-enhance`, {
        json: {
          text: testCase.text,
          language: testCase.options.language,
          tone: testCase.options.tone
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }).json<{
        success: boolean;
        data?: {
          enhancedText: string;
          tokensUsed: number;
          language: string;
        };
        error?: {
          code: string;
          message: string;
        };
      }>();

      const duration = Date.now() - startTime;

      if (response.success && response.data) {
        console.log(`✨ Enhanced: "${response.data.enhancedText}"`);
        console.log(`📊 Stats: ${response.data.tokensUsed} tokens, ${duration}ms, ${response.data.language}`);

        // Validate purification
        const text = response.data.enhancedText.toLowerCase();
        const isPurified = !text.includes('here') &&
          !text.includes('improved') &&
          !text.includes('enhanced') &&
          !text.includes('version');

        if (isPurified) {
          console.log('✅ Output is properly purified');
          passedTests++;
        } else {
          console.log('❌ Output contains impurities');
          console.log(`   Impure text: "${response.data.enhancedText}"`);
        }
      } else {
        console.log(`❌ API Error: ${response.error?.message || 'Unknown error'}`);
      }

    } catch (error: any) {
      if (error.response) {
        const errorData = await error.response.json().catch(() => ({}));
        console.log(`❌ API Error (${error.response.status}): ${errorData.error?.message || error.message}`);
      } else {
        console.log(`❌ Test failed: ${error.message}`);
      }
    }
  }

  console.log('\n=======================================');
  console.log(`🎯 Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All integration tests passed!');
    console.log('✅ Direct API → Claude AI → Purification → Clean Response');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

async function testMockMode() {
  console.log('🧪 Starting Mock Mode Test');
  console.log('===========================');

  // Test with mock responses
  const mockTests = [
    {
      name: 'Mock Professional',
      enhancedText: 'Dear Sir/Madam, I would appreciate if you could send me the quarterly report at your earliest convenience.',
      original: 'hey send me the report'
    },
    {
      name: 'Mock Casual',
      enhancedText: 'Thanks so much for all your help yesterday! Really appreciate it.',
      original: 'thanks for helping yesterday'
    }
  ];

  let passedTests = 0;

  for (const test of mockTests) {
    console.log(`\n📝 ${test.name}`);
    console.log(`Original: "${test.original}"`);
    console.log(`Enhanced: "${test.enhancedText}"`);

    // Validate purification
    const text = test.enhancedText.toLowerCase();
    const isPurified = !text.includes('here') &&
      !text.includes('improved') &&
      !text.includes('enhanced') &&
      !text.includes('version');

    if (isPurified) {
      console.log('✅ Mock output is properly purified');
      passedTests++;
    } else {
      console.log('❌ Mock output contains impurities');
    }
  }

  console.log(`\n🎯 Mock Results: ${passedTests}/${mockTests.length} tests passed`);
  return passedTests === mockTests.length;
}

if (import.meta.main) {
  const mode = process.argv[2] || 'api';

  if (mode === 'mock') {
    testMockMode().then(success => {
      process.exit(success ? 0 : 1);
    });
  } else {
    testDirectAPI().catch(error => {
      console.error('Integration test failed:', error);
      process.exit(1);
    });
  }
}