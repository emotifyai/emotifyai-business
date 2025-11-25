import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

// Initialize Lemon Squeezy
lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY || '',
    onError: (error) => {
        console.error('Lemon Squeezy error:', error)
    },
})

export { lemonSqueezySetup }
