import type { SubscriptionStatus, SubscriptionTier } from '@/types/database'

export type BillingPaymentType = 'subscription' | 'renewal' | 'one_time' | 'bundle'

export interface BillingInvoice {
  id: string
  date: string
  amountFormatted: string
  status: string
  statusLabel: string
  planName: string
  downloadUrl: string | null
  source: 'subscription_invoice' | 'order'
}

export interface BillingPayment {
  id: string
  date: string
  amountFormatted: string
  status: string
  statusLabel: string
  planName: string
  paymentType: BillingPaymentType
  paymentTypeLabel: string
  receiptUrl: string | null
}

export interface BillingSubscriptionRecord {
  id: string
  lemonSqueezyId: string
  tier: SubscriptionTier
  tierName: string
  status: SubscriptionStatus
  statusLabel: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAt: string | null
  creditsLimit: number
  creditsUsed: number
  isRecurring: boolean
}

export interface BillingSummary {
  planName: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  statusLabel: string
  nextBillingDate: string | null
  currentPeriodEnd: string
  creditsUsed: number
  creditsLimit: number
  portalAvailable: boolean
}

export interface BillingHistoryResponse {
  success: boolean
  isPaid: boolean
  lemonConfigured: boolean
  message?: string
  summary: BillingSummary | null
  subscriptions: BillingSubscriptionRecord[]
  invoices: BillingInvoice[]
  payments: BillingPayment[]
}

/** خطة (subscription) vs حزمة (bundle) */
export type InvoicePurchaseType = 'plan' | 'bundle'

export interface BillingInvoiceRow {
  id: string
  date: string
  amountFormatted: string
  currency: string
  status: string
  statusLabel: string
  planName: string
  tier: SubscriptionTier | null
  purchaseType: InvoicePurchaseType
  purchaseTypeLabel: string
  documentUrl: string | null
  source: 'subscription_invoice' | 'order' | 'subscription_row'
}

export interface BillingInvoicesResponse {
  success: boolean
  hasBillingHistory: boolean
  lemonConfigured: boolean
  message?: string
  invoices: BillingInvoiceRow[]
}
