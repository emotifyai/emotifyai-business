// Test the subscription API directly
require('dotenv').config()

async function testAPI() {
  try {
    console.log('🧪 Testing subscription API directly...')
    
    // Import the route handler
    const { GET } = await import('./app/api/subscription/route.ts')
    
    // Create a mock request
    const mockRequest = {
      headers: new Map(),
      url: 'http://localhost:3000/api/subscription'
    }
    
    // Call the API
    const response = await GET(mockRequest)
    const data = await response.json()
    
    console.log('API Response Status:', response.status)
    console.log('API Response Data:', JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.error('💥 API test error:', error.message)
    console.error('Stack:', error.stack)
  }
}

testAPI().catch(console.error)