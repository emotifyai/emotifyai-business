import {
  getLemonVariantEnvKey,
  type SubscriptionTierId,
} from '@emotifyai/config/pricing'

export const LEMONSQUEEZY_CONFIG = {
  storeId: process.env.LEMONSQUEEZY_STORE_ID!,
  webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
}

export function getVariantId(tier: SubscriptionTierId): string | undefined {
  const envKey = getLemonVariantEnvKey(tier)
  if (!envKey) return undefined
  return process.env[envKey]
}
