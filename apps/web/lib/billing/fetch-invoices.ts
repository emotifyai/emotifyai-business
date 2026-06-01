import type { Subscription } from '@/types/database'
import { SubscriptionTier } from '@/types/database'
import { fetchBillingHistory } from '@/lib/billing/fetch-billing'
import { isPaidTier } from '@/lib/billing/paid-tier'
import {
  getPurchaseTypeFromTier,
  getPurchaseTypeLabelAr,
} from '@/lib/billing/purchase-type'
import type {
  BillingInvoiceRow,
  BillingInvoicesResponse,
} from '@/lib/billing/types'

function guessCurrency(amountFormatted: string): string {
  if (amountFormatted.includes('ر.س') || amountFormatted.includes('SAR')) {
    return 'SAR'
  }
  if (amountFormatted.includes('$') || amountFormatted.includes('USD')) {
    return 'USD'
  }
  return 'SAR'
}

function tierFromPlanName(planName: string): SubscriptionTier | null {
  const entries: [string, SubscriptionTier][] = [
    ['حزمة صغيرة', SubscriptionTier.SMALL_BUNDLE],
    ['حزمة كبيرة', SubscriptionTier.LARGE_BUNDLE],
    ['Pro شهري', SubscriptionTier.PRO_MONTHLY],
    ['Pro سنوي', SubscriptionTier.PRO_ANNUAL],
    ['أساسي شهري', SubscriptionTier.BASIC_MONTHLY],
    ['أساسي سنوي', SubscriptionTier.BASIC_ANNUAL],
    ['أعمال شهري', SubscriptionTier.BUSINESS_MONTHLY],
    ['أعمال سنوي', SubscriptionTier.BUSINESS_ANNUAL],
  ]
  const match = entries.find(([label]) => planName.includes(label))
  return match?.[1] ?? null
}

function buildRow(partial: {
  id: string
  date: string
  amountFormatted: string
  currency: string
  status: string
  statusLabel: string
  planName: string
  tier?: SubscriptionTier | null
  documentUrl: string | null
  source: BillingInvoiceRow['source']
}): BillingInvoiceRow {
  const tier = partial.tier ?? tierFromPlanName(partial.planName)
  const purchaseType = getPurchaseTypeFromTier(tier)
  return {
    ...partial,
    tier,
    purchaseType,
    purchaseTypeLabel: getPurchaseTypeLabelAr(purchaseType),
  }
}

export async function fetchInvoices(
  userEmail: string,
  supabaseRows: Subscription[]
): Promise<BillingInvoicesResponse> {
  const hasBillingHistory = supabaseRows.some((r) =>
    isPaidTier(r.tier as SubscriptionTier)
  )

  if (!hasBillingHistory) {
    return {
      success: true,
      hasBillingHistory: false,
      lemonConfigured: !!process.env.LEMONSQUEEZY_API_KEY,
      invoices: [],
    }
  }

  const history = await fetchBillingHistory(userEmail, supabaseRows)
  const rows: BillingInvoiceRow[] = []
  const seenIds = new Set<string>()

  for (const inv of history.invoices) {
    seenIds.add(inv.id)
    rows.push(
      buildRow({
        id: inv.id,
        date: inv.date,
        amountFormatted: inv.amountFormatted,
        currency: guessCurrency(inv.amountFormatted),
        status: inv.status,
        statusLabel: inv.statusLabel,
        planName: inv.planName,
        tier: history.summary?.tier ?? null,
        documentUrl: inv.downloadUrl,
        source: inv.source,
      })
    )
  }

  for (const payment of history.payments) {
    if (payment.paymentType !== 'bundle') continue
    if (seenIds.has(payment.id) || seenIds.has(`order_${payment.id}`)) continue
    seenIds.add(payment.id)

    rows.push(
      buildRow({
        id: payment.id,
        date: payment.date,
        amountFormatted: payment.amountFormatted,
        currency: guessCurrency(payment.amountFormatted),
        status: payment.status,
        statusLabel: payment.statusLabel,
        planName: payment.planName,
        documentUrl: payment.receiptUrl,
        source: 'order',
      })
    )
  }

  if (rows.length === 0 && !history.lemonConfigured) {
    for (const sub of history.subscriptions.filter((s) =>
      isPaidTier(s.tier as SubscriptionTier)
    )) {
      const id = `sub_${sub.id}`
      if (seenIds.has(id)) continue
      seenIds.add(id)

      rows.push(
        buildRow({
          id,
          date: sub.currentPeriodStart,
          amountFormatted: '—',
          currency: 'SAR',
          status: sub.status,
          statusLabel: sub.statusLabel,
          planName: sub.tierName,
          tier: sub.tier,
          documentUrl: null,
          source: 'subscription_row',
        })
      )
    }
  }

  const invoices = rows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return {
    success: true,
    hasBillingHistory: true,
    lemonConfigured: history.lemonConfigured,
    message: history.message,
    invoices,
  }
}
