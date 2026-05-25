import { getTierPriorityMap } from '@emotifyai/config/pricing'
import {
  listOrders,
  listSubscriptionInvoices,
  listSubscriptions,
} from '@lemonsqueezy/lemonsqueezy.js'
import { configureLemonSqueezy } from '@/lib/lemonsqueezy/client'
import { LEMONSQUEEZY_CONFIG } from '@/lib/lemonsqueezy/config'
import type { Subscription } from '@/types/database'
import { SubscriptionStatus, SubscriptionTier } from '@/types/database'
import {
  hasActivePaidSubscription,
  isPaidTier,
} from '@/lib/billing/paid-tier'
import {
  getInvoiceStatusLabelAr,
  getPaymentTypeLabelAr,
  getStatusLabelAr,
  getTierLabelAr,
} from '@/lib/billing/tier-labels'
import { getTierFromVariantId, isRecurringTier } from '@/lib/billing/variant-tier'
import type {
  BillingHistoryResponse,
  BillingInvoice,
  BillingPayment,
  BillingSubscriptionRecord,
  BillingSummary,
} from '@/lib/billing/types'

function isLemonConfigured(): boolean {
  const key = process.env.LEMONSQUEEZY_API_KEY
  return !!key && key.length > 0 && !!process.env.LEMONSQUEEZY_STORE_ID
}

function mapSupabaseSubscription(row: Subscription): BillingSubscriptionRecord {
  const tier = row.tier as SubscriptionTier
  return {
    id: row.id,
    lemonSqueezyId: row.lemon_squeezy_id,
    tier,
    tierName: getTierLabelAr(tier),
    status: row.status,
    statusLabel: getStatusLabelAr(row.status),
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAt: row.cancel_at,
    creditsLimit: row.credits_limit,
    creditsUsed: row.credits_used,
    isRecurring: isRecurringTier(tier),
  }
}

function buildSummary(
  primary: Subscription,
  portalAvailable: boolean
): BillingSummary {
  const tier = primary.tier as SubscriptionTier
  const recurring = isRecurringTier(tier)
  return {
    planName: getTierLabelAr(tier),
    tier,
    status: primary.status,
    statusLabel: getStatusLabelAr(primary.status),
    nextBillingDate: recurring && primary.status === SubscriptionStatus.ACTIVE
      ? primary.current_period_end
      : null,
    currentPeriodEnd: primary.current_period_end,
    creditsUsed: primary.credits_used,
    creditsLimit: primary.credits_limit,
    portalAvailable,
  }
}

function supabasePaymentsFromRows(rows: Subscription[]): BillingPayment[] {
  return rows
    .filter((r) => isPaidTier(r.tier as SubscriptionTier))
    .map((r) => {
      const tier = r.tier as SubscriptionTier
      const isOrder = r.lemon_squeezy_id.startsWith('order_')
      const paymentType = tier === SubscriptionTier.SMALL_BUNDLE || tier === SubscriptionTier.LARGE_BUNDLE
        ? 'bundle'
        : tier === SubscriptionTier.LIFETIME_LAUNCH || isOrder
          ? 'one_time'
          : 'subscription'

      return {
        id: r.lemon_squeezy_id,
        date: r.created_at,
        amountFormatted: '—',
        status: r.status,
        statusLabel: getStatusLabelAr(r.status),
        planName: getTierLabelAr(tier),
        paymentType,
        paymentTypeLabel: getPaymentTypeLabelAr(paymentType),
        receiptUrl: null,
      }
    })
}

function pickPrimarySubscription(rows: Subscription[]): Subscription | null {
  if (rows.length === 0) return null

  const tierPriority = getTierPriorityMap()

  const active = rows.filter((r) =>
    ['active', 'past_due', 'paused', 'trial'].includes(r.status)
  )
  const pool = active.length > 0 ? active : rows

  return pool.reduce((best, current) => {
    const currentP = tierPriority[current.tier] ?? 0
    const bestP = tierPriority[best.tier] ?? 0
    if (currentP > bestP) return current
    if (currentP === bestP && new Date(current.created_at) > new Date(best.created_at)) {
      return current
    }
    return best
  })
}

export async function fetchBillingHistory(
  userEmail: string,
  supabaseRows: Subscription[]
): Promise<BillingHistoryResponse> {
  const subscriptions = supabaseRows.map(mapSupabaseSubscription)
  const primary = pickPrimarySubscription(supabaseRows)
  const isPaidActive = primary
    ? hasActivePaidSubscription(primary.tier as SubscriptionTier, primary.status)
    : false

  const lemonConfigured = isLemonConfigured()

  if (!primary || !isPaidTier(primary.tier as SubscriptionTier)) {
    return {
      success: true,
      isPaid: false,
      lemonConfigured,
      summary: null,
      subscriptions,
      invoices: [],
      payments: [],
    }
  }

  const portalAvailable =
    lemonConfigured &&
    !primary.lemon_squeezy_id.startsWith('order_') &&
    primary.tier !== SubscriptionTier.LIFETIME_LAUNCH

  let summary = buildSummary(primary, portalAvailable)
  let invoices: BillingInvoice[] = []
  let payments: BillingPayment[] = supabasePaymentsFromRows(supabaseRows)

  if (!lemonConfigured) {
    return {
      success: true,
      isPaid: isPaidActive,
      lemonConfigured: false,
      message: 'تفاصيل الفواتير متاحة بعد تفعيل الاشتراك',
      summary,
      subscriptions,
      invoices,
      payments,
    }
  }

  configureLemonSqueezy()

  try {
    const storeId = LEMONSQUEEZY_CONFIG.storeId
    const email = userEmail.trim().toLowerCase()

    const [ordersResult, lsSubsResult] = await Promise.all([
      listOrders({
        filter: { storeId, userEmail: email },
        page: { size: 25, number: 1 },
      }),
      listSubscriptions({
        filter: { storeId, userEmail: email },
        page: { size: 10, number: 1 },
      }),
    ])

    if (ordersResult.data?.data) {
      for (const order of ordersResult.data.data) {
        const attrs = order.attributes
        const variantId = String(attrs.first_order_item?.variant_id ?? '')
        const tier = getTierFromVariantId(variantId)
        const isBundle =
          tier === SubscriptionTier.SMALL_BUNDLE || tier === SubscriptionTier.LARGE_BUNDLE

        payments.push({
          id: String(order.id),
          date: attrs.created_at,
          amountFormatted: attrs.total_formatted ?? formatCents(attrs.total, attrs.currency),
          status: attrs.status,
          statusLabel: getStatusLabelAr(attrs.status),
          planName:
            attrs.first_order_item?.product_name ??
            attrs.first_order_item?.variant_name ??
            getTierLabelAr(tier),
          paymentType: isBundle ? 'bundle' : 'one_time',
          paymentTypeLabel: getPaymentTypeLabelAr(isBundle ? 'bundle' : 'one_time'),
          receiptUrl: attrs.urls?.receipt ?? null,
        })
      }
    }

    const lsSubIds: string[] = []
    if (lsSubsResult.data?.data) {
      for (const lsSub of lsSubsResult.data.data) {
        lsSubIds.push(String(lsSub.id))
        const attrs = lsSub.attributes
        const variantId = String(attrs.variant_id ?? '')
        const tier = getTierFromVariantId(variantId)

        if (attrs.renews_at && summary.nextBillingDate === null && isRecurringTier(tier)) {
          summary = {
            ...summary,
            nextBillingDate: attrs.renews_at,
            currentPeriodEnd: attrs.renews_at,
          }
        }
      }
    }

    const subscriptionIds = new Set<string>([
      ...lsSubIds,
      ...supabaseRows
        .map((r) => r.lemon_squeezy_id)
        .filter((id) => id && !id.startsWith('order_')),
    ])

    for (const subId of subscriptionIds) {
      const invResult = await listSubscriptionInvoices({
        filter: { storeId, subscriptionId: subId },
        page: { size: 20, number: 1 },
      })

      if (!invResult.data?.data) continue

      for (const inv of invResult.data.data) {
        const attrs = inv.attributes
        const billingReason = attrs.billing_reason ?? 'initial'
        const paymentType: BillingPayment['paymentType'] =
          billingReason === 'renewal' ? 'renewal' : 'subscription'

        invoices.push({
          id: String(inv.id),
          date: attrs.created_at,
          amountFormatted: attrs.total_formatted ?? formatCents(attrs.total, attrs.currency),
          status: attrs.status,
          statusLabel: getInvoiceStatusLabelAr(attrs.status),
          planName: getTierLabelAr(summary.tier),
          downloadUrl: attrs.urls?.invoice_url ?? null,
          source: 'subscription_invoice',
        })

        payments.push({
          id: `inv_${inv.id}`,
          date: attrs.created_at,
          amountFormatted: attrs.total_formatted ?? formatCents(attrs.total, attrs.currency),
          status: attrs.status,
          statusLabel: getInvoiceStatusLabelAr(attrs.status),
          planName: getTierLabelAr(summary.tier),
          paymentType,
          paymentTypeLabel: getPaymentTypeLabelAr(paymentType),
          receiptUrl: attrs.urls?.invoice_url ?? null,
        })
      }
    }

    invoices = dedupeById(invoices).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    payments = dedupeById(payments).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  } catch (error) {
    console.error('[billing] Lemon Squeezy fetch failed:', error)
    return {
      success: true,
      isPaid: isPaidActive,
      lemonConfigured: true,
      message: 'تعذر تحميل تفاصيل الفواتير من مزود الدفع. يعرض السجل المحفوظ محلياً.',
      summary,
      subscriptions,
      invoices,
      payments,
    }
  }

  return {
    success: true,
    isPaid: isPaidActive,
    lemonConfigured: true,
    summary,
    subscriptions,
    invoices,
    payments,
  }
}

function formatCents(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`
  }
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}
