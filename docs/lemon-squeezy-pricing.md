# Lemon Squeezy — إعداد الأسعار والخطط

دليل تقني لتكوين منتجات Lemon Squeezy لمطابقة صفحة الأسعار (`/pricing`) في EmotifyAI.

---

## نظرة عامة

| الخطة (العرض) | نوع الدفع | `tier` | متغير البيئة |
|---|---|---|---|
| تجربة فورية | مجاني | — | — (منطق التطبيق) |
| تجربة مسجلة | مجاني | `trial` | — |
| Pro شهري | اشتراك شهري | `pro_monthly` | `LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID` |
| Pro سنوي | اشتراك سنوي | `pro_annual` | `LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID` |
| حزمة صغيرة | دفعة واحدة | `small_bundle` | `LEMONSQUEEZY_SMALL_BUNDLE_VARIANT_ID` |
| حزمة كبيرة | دفعة واحدة | `large_bundle` | `LEMONSQUEEZY_LARGE_BUNDLE_VARIANT_ID` |

مصدر الحقيقة الواحد: `packages/config/src/pricing.ts`  
إعادة التصدير في الويب: `apps/web/lib/pricing/plans.ts` و `apps/web/lib/pricing/credits.ts`

---

## 1. إنشاء المتجر والمفاتيح

1. [لوحة Lemon Squeezy](https://app.lemonsqueezy.com/) → إنشاء متجر.
2. **Settings → API** → مفتاح API → `LEMONSQUEEZY_API_KEY`
3. **Settings → Stores** → Store ID → `LEMONSQUEEZY_STORE_ID`
4. **Settings → Webhooks**:
   - URL: `https://<your-domain>/api/webhooks/lemonsqueezy`
   - أحداث: `subscription_*` و `order_created`
   - Signing Secret → `LEMONSQUEEZY_WEBHOOK_SECRET`

---

## 2. Pro (اشتراك)

### Pro شهري — ٤٥ ريال (≈ $12/شهر)

1. **Products → New Product**
2. **Pricing**: Subscription, every **month**
3. السعر في LS: **$12.00/month** (أو ما يعادل 45÷3.75)
4. Variant ID → `LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID`

### Pro سنوي — ٣٧١ ريال (≈ $99/سنة)

1. Subscription, every **year**, **$99.00/year**
2. Variant ID → `LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID`

**Webhook:** `subscription_created` / `subscription_updated` → صف في `subscriptions` بـ 300 تحويل/شهر (`credits_limit`).

---

## 3. الحزم (دفعة واحدة)

| الحزمة | SAR (عرض) | USD في LS | التحويلات |
|---|---|---|---|
| صغيرة | ١٩ ريال | $5 | 50 — لا تنتهي بتاريخ |
| كبيرة | ٣٧ ريال | $10 | 100 — لا تنتهي بتاريخ |

1. **Products → New Product** لكل حزمة
2. **Pricing model**: **Single payment** (one-time)
3. Variant IDs:

```env
LEMONSQUEEZY_SMALL_BUNDLE_VARIANT_ID=
LEMONSQUEEZY_LARGE_BUNDLE_VARIANT_ID=
```

**Webhook:** `order_created` → صف جديد `lemon_squeezy_id = order_<id>`، `tier` = `small_bundle` أو `large_bundle`، `credits_reset_date = null`.

**الاستهلاك:** دوال `can_use_credits` / `consume_credits` تجمع كل الاشتراكات النشطة (راجع `docs/sql/project.sql` — قسم Bundle credits).

---

## 4. خطط التجربة (بدون Lemon Squeezy)

| الخطة | التحويلات | الآلية |
|---|---|---|
| فورية | 10 بدون تسجيل | حد ضيف في API |
| مسجلة | 50 / 14 يوم | `trial` عند التسجيل (`/api/auth/login`) |

---

## 5. متغيرات البيئة

```env
# أساسي (مطلوب للدفع)
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=

# صفحة الأسعار الحالية
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=
LEMONSQUEEZY_SMALL_BUNDLE_VARIANT_ID=
LEMONSQUEEZY_LARGE_BUNDLE_VARIANT_ID=

# خطط قديمة (لا تزال في webhook إن وُجدت)
LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID=
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=
LEMONSQUEEZY_BUSINESS_ANNUAL_VARIANT_ID=
```

`POST /api/checkout` يتحقق من variant الخاص بالـ `tier` المطلوب فقط (لا يشترط كل المتغيرات).

---

## 6. مزامنة SAR (عرض) مع USD (الدفع)

| العرض | ≈ USD | إعداد LS |
|---|---|---|
| ٤٥ ريال/شهر | $12 | $12/month subscription |
| ٣٧١ ريال/سنة | $99 | $99/year subscription |
| ١٩ ريال | $5 | $5 one-time |
| ٣٧ ريال | $10 | $10 one-time |

تعديل السعر في LS لا يغيّر Variant ID — حدّث `plans.ts` للعرض فقط.

---

## 7. Webhooks وقاعدة البيانات

| الحدث | ما يُكتب في DB |
|---|---|
| `subscription_created` / `updated` | `subscriptions` — `lemon_squeezy_id` = معرف الاشتراك LS |
| `order_created` (حزمة) | صف جديد — `order_<id>`، رصيد ثابت |
| `order_created` (lifetime) | صف + `lifetime_subscribers` |

Custom data في Checkout:

```json
{ "user_id": "<uuid>", "tier": "pro_monthly" }
```

**توقعات DB:** انظر `docs/sql/project.sql` — enum `subscription_tier` يتضمن `small_bundle` و `large_bundle`.

---

## 8. اختبار

1. Test mode في Lemon Squeezy
2. Variant IDs في `.env.local`
3. تسجيل دخول → `/pricing` → اشترك / حزمة
4. تحقق من webhook و `subscriptions` في Supabase

---

## 9. تحديث الأسعار على الموقع

1. عدّل السعر في Lemon Squeezy (نفس Variant IDs)
2. حدّث `PRICING_DISPLAY_PLANS` و `TIER_DEFINITIONS` في `packages/config/src/pricing.ts`
4. أعد النشر

---

## 10. ملفات مرجعية

| الملف | الغرض |
|---|---|
| `apps/web/app/pricing/page.tsx` | صفحة الأسعار |
| `apps/web/components/pricing/pricing-plans-table.tsx` | بطاقات الخطط |
| `packages/config/src/pricing.ts` | خطط، أسعار، حدود، Lemon env keys |
| `apps/web/lib/pricing/plans.ts` | إعادة تصدير عرض /pricing |
| `apps/web/lib/pricing/credits.ts` | إعادة تصدير حدود التحويلات |
| `apps/web/lib/lemonsqueezy/config.ts` | tier → `process.env` variant |
| `apps/web/app/api/checkout/route.ts` | إنشاء checkout |
| `apps/web/app/api/webhooks/lemonsqueezy/route.ts` | معالجة الأحداث |
