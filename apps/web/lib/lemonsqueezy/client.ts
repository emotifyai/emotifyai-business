import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

// Initialize Lemon Squeezy
export function configureLemonSqueezy() {
    lemonSqueezySetup({
        apiKey: process.env.LEMONSQUEEZY_API_KEY || '',
        onError: (error) => {
            console.error('Lemon Squeezy error:', error)
        },
    })
}
