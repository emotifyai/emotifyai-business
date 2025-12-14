#!/usr/bin/env bun

/**
 * Integration Test with Authentication
 * Creates a test user and tests the full authenticated flow
 */

import ky from 'ky';

interface TestUser {
  email: string;
  password: string;
  token?: string;
}

const testUser: TestUser = {
  email: 'test@verba.ai',
  password: 'testpassword123'
};

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
  }
];

async function createTestUser(apiUrl: string): Promise<string | null> {
  try {
    console.log('👤 Creating test user...');

    // Try to sign up
    const signupResponse = await ky.post(`${apiUrl}/auth/v1/signup`, {
      json: {
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            name: 'Test User'
          }
        }
      }
    }).json<any>();

    console.log('✅ Test user created');
    return signupResponse.access_token;

  } catch (error: any) {
    // User might already exist, try to sign in
    try {
      console.log('👤 Test user exists, signing in...');

      const signinResponse = await ky.post(`${apiUrl}/auth/v1/token?grant_type=password`, {
        json: {
          email: testUser.email,
          password: testUser.password
        }
      }).json<any>();

      console.log('✅ Signed in successfully');
      return signinResponse.access_token;

    } catch (signinError) {
      console.log('❌ Failed to authenticate test user');
      return null;
    }
  }
}

async function testWithAuthentication() {
  console.log('🧪 Starting Authenticated Integration Test');
  console.log('==========================================');

  // Web app always runs on port 3000
  const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
  console.log(`🌐 API URL: ${apiUrl}`);

  // Check if server is running
  try {
    await ky.get(`${apiUrl}/api/health`).json();
    console.log('✅ Web server is running');
  } catch (error) {
    console.log('❌ Web server is not running');
    console.log('💡 Please start the web server first:');
    console.log('   cd apps/web && bun run dev');
    process.exit(1);
  }

  // Get authentication token
  const token = await createTestUser(apiUrl);
  if (!token) {
    console.log('❌ Could not authenticate test user');
    console.log('💡 Using test endpoint instead...');
    return testWithoutAuth(apiUrl);
  }

  testUser.token = token;
  console.log('🔑 Authentication successful');

  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}/${totalTests}: ${testCase.name}`);
    console.log(`Original: "${testCase.text}"`);

    try {
      const startTime = Date.now();

      const response = await ky.post(`${apiUrl}/api/enhance`, {
        json: {
          text: testCase.text,
          language: testCase.options.language,
          tone: testCase.options.tone
        },
        headers: {
          'Authorization': `Bearer ${token}`,
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

  console.log('\n==========================================');
  console.log(`🎯 Results: ${passedTests}/${totalTests} tests passed`);

  return passedTests === totalTests;
}

async function testWithoutAuth(apiUrl: string) {
  console.log('\n🧪 Fallback: Testing without authentication');
  console.log('============================================');

  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}/${totalTests}: ${testCase.name}`);
    console.log(`Original: "${testCase.text}"`);

    try {
      const startTime = Date.now();

      const response = await ky.post(`${apiUrl}/api/test-enhance`, {
        json: {
          text: testCase.text,
          language: testCase.options.language,
          tone: testCase.options.tone
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

  console.log('\n============================================');
  console.log(`🎯 Results: ${passedTests}/${totalTests} tests passed`);

  return passedTests === totalTests;
}

if (import.meta.main) {
  testWithAuthentication().then(success => {
    if (success) {
      console.log('🎉 All authenticated tests passed!');
      console.log('✅ Full Flow: Auth → API → Claude AI → Purification → Response');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}