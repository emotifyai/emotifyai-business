# Lemon Squeezy — إعداد الأسعار والخطط

دليل لتكوين منتجات Lemon Squeezy لمطابقة صفحة الأسعار العربية (`/pricing`) في EmotifyAI.

---

## نظرة عامة

| الخطة (العرض) | نوع الدفع | التكامل في التطبيق |
|---|---|---|
| تجربة فورية | مجاني | منطق التطبيق — بدون Lemon Squeezy |
| تجربة مسجلة | مجاني | تسجيل + `trial` في قاعدة البيانات |
| Pro شهري | اشتراك شهري | `pro_monthly` + `LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID` |
| Pro سنوي | اشتراك سنوي | `pro_annual` + `LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID` |
| حزمة صغيرة | دفعة واحدة | **مطلوب إعداد جديد** (انظر أدناه) |
| حزمة كبيرة | دفعة واحدة | **مطلوب إعداد جديد** (انظر أدناه) |

بيانات العرض (SAR / USD التقريبي) موجودة في:

`apps/web/lib/pricing/plans.ts`

الصفحة تعرض **الريال** كعملة أساسية و**الدولار** كتقريب (`≈`) باستخدام نسبة **1 USD ≈ 3.75 SAR** للعرض فقط.

---

## 1. إنشاء المتجر والمفاتيح

1. [لوحة Lemon Squeezy](https://app.lemonsqueezy.com/) → إنشاء متجر.
2. **Settings → API** → إنشاء مفتاح → `LEMONSQUEEZY_API_KEY`
3. **Settings → Stores** → نسخ Store ID → `LEMONSQUEEZY_STORE_ID`
4. **Settings → Webhooks**:
   - URL: `https://<your-domain>/api/webhooks/lemonsqueezy`
   - أحداث الاشتراك والطلبات (subscription + order)
   - Signing Secret → `LEMONSQUEEZY_WEBHOOK_SECRET`

مرجع إضافي: `docs/api-setup-guide.md`

---

## 2. منتجات Pro (اشتراك)

### Pro شهري — ٤٥ ريال (≈ $12/شهر)

1. **Products → New Product**
2. الاسم: `EmotifyAI Pro Monthly` (أو بالعربية في وصف المتجر)
3. **Pricing**: Subscription, billed every **month**
4. السعر في LS:
   - إذا كان المتجر بالدولار: ضع **$12.00/month** (أو القيمة التي تطابق 45÷3.75)
   - LS لا يدعم SAR مباشرة في كل المناطق — العرض على الموقع بالريال، والفوترة حسب عملة المتجر
5. بعد الحفظ: **Variants** → انسخ **Variant ID** → `.env`:

```env
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=123456
```

6. في التطبيق: `tier` = `pro_monthly`، 300 تحويل/شهر (حدّ الاستخدام يُضبط في `SUBSCRIPTION_TIERS` / قاعدة البيانات).

### Pro سنوي — ٣٧١ ريال (≈ $99/سنة)

1. منتج جديد أو variant سنوي على نفس المنتج
2. **Subscription**, billed every **year**, **$99.00/year**
3. Variant ID →:

```env
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=123457
```

4. `tier` = `pro_annual`

الخريطة في الكود:

- `apps/web/lib/lemonsqueezy/config.ts` → `getVariantId()`
- `apps/web/app/api/webhooks/lemonsqueezy/route.ts` → `getSubscriptionTier()`

---

## 3. الحزم (دفعة واحدة)

| الحزمة | SAR (عرض) | USD تقريبي | التحويلات |
|---|---|---|---|
| صغيرة | ١٩ ريال | ≈ $5 | 50 — لا تنتهي بتاريخ |
| كبيرة | ٣٧ ريال | ≈ $10 | 100 — لا تنتهي بتاريخ |

### في Lemon Squeezy

1. **Products → New Product** لكل حزمة (أو منتج واحد مع variantين)
2. **Pricing model**: **Single payment** (one-time), ليس subscription
3. الأسعار المقترحة في LS: **$5** و **$10** (أو ما يعادل 19÷3.75 و 37÷3.75)
4. انسخ Variant IDs — **أضفها إلى المشروع** (غير مفعّلة في الكود حالياً على صفحة الأسعار):

```env
# مقترح — أضف عند تفعيل الحزم
LEMONSQUEEZY_SMALL_BUNDLE_VARIANT_ID=
LEMONSQUEEZY_LARGE_BUNDLE_VARIANT_ID=
```

### في التطبيق (خطوات لاحقة)

1. توسيع `SubscriptionTier` أو نوع `credit_pack` في `apps/web/lib/subscription/types.ts`
2. إضافة case في `getVariantId()` و `getSubscriptionTier()` في webhook
3. توسيع `CheckoutSchema` في `apps/web/app/api/checkout/route.ts`
4. معالجة حدث `order_created` في webhook (موجود جزئياً لـ lifetime) لتفعيل رصيد لا ينتهي

حتى التفعيل، أزرار الحزم على `/pricing` تعرض «قريباً».

---

## 4. خطط التجربة (بدون Lemon Squeezy)

### تجربة فورية

- 10 تحويلات بدون تسجيل
- **لا variant في LS** — منطق API / حد ضيف في `apps/web/app/api/enhance/route.ts` (إن وُجد)

### تجربة مسجلة

- 50 تحويل، 14 يوماً
- عند التسجيل: `trial` في `subscriptions` (مثلاً `apps/web/app/api/auth/login/route.ts` ينشئ `lemon_squeezy_id: trial-...`)
- **لا دفع** عبر LS

---

## 5. متغيرات البيئة الكاملة (الحالية)

```env
# أساسي
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=

# Pro (مستخدمة في صفحة الأسعار)
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=

# خطط قديمة / إضافية (لا تزال في الكود والـ webhook)
LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID=
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=
LEMONSQUEEZY_BUSINESS_ANNUAL_VARIANT_ID=

# حزم (مقترح عند التفعيل)
LEMONSQUEEZY_SMALL_BUNDLE_VARIANT_ID=
LEMONSQUEEZY_LARGE_BUNDLE_VARIANT_ID=
```

التحقق من الحقول: `apps/web/lib/env.ts`

التحقق عند الدفع: `POST /api/checkout` مع `{ "tier": "pro_monthly" | "pro_annual" | ... }`

---

## 6. مزامنة SAR (عرض) مع USD (الدفع)

| العرض على الموقع | حساب تقريبي | إعداد LS شائع |
|---|---|---|
| ٤٥ ريال/شهر | ≈ $12 | $12/month subscription |
| ٣٧١ ريال/سنة | ≈ $99 | $99/year subscription |
| ١٩ ريال | ≈ $5 | $5 one-time |
| ٣٧ ريال | ≈ $10 | $10 one-time |

**مهم:**

- الموقع يعرض الريال للمستخدم العربي.
- Lemon Squeezy يحصّل عادة بعملة المتجر (غالباً USD).
- حدّث `apps/web/lib/pricing/plans.ts` عند تغيير الأسعار في LS حتى يبقى العرض متسقاً.
- لا حاجة لتغيير Variant ID عند تعديل السعر فقط — نفس الـ variant، سعر جديد في لوحة LS.

---

## 7. Webhooks والاشتراكات

| المسار | الوظيفة |
|---|---|
| `POST /api/webhooks/lemonsqueezy` | تحديث `subscriptions` من أحداث LS |
| `POST /api/checkout` | إنشاء جلسة دفع للمستخدم المسجّل |
| `GET /api/billing/portal` | رابط بوابة إدارة الاشتراك |

عند `subscription_created` / `subscription_updated`: يُستخرج `variant_id` ويُحوَّل إلى `tier` عبر `getSubscriptionTier()`.

Custom data في Checkout (`apps/web/lib/lemonsqueezy/checkout.ts`):

```json
{ "user_id": "<uuid>", "tier": "pro_monthly" }
```

---

## 8. اختبار

1. **Test mode** في Lemon Squeezy
2. مفاتيح و variant IDs من بيئة الاختبار في `.env.local`
3. تسجيل دخول → `/pricing` → اشترك Pro → إكمال الدفع التجريبي
4. تحقق من webhook (ngrok محلياً) وسجل `subscriptions` في Supabase

---

## 9. ملفات مرجعية في المستودع

| الملف | الغرض |
|---|---|
| `apps/web/app/pricing/page.tsx` | صفحة الأسعار العربية |
| `apps/web/lib/pricing/plans.ts` | نصوص وأسعار العرض |
| `apps/web/lib/lemonsqueezy/config.ts` | ربط tier → variant ID |
| `apps/web/lib/lemonsqueezy/checkout.ts` | إنشاء checkout |
| `apps/web/app/api/webhooks/lemonsqueezy/route.ts` | معالجة الأحداث |
| `apps/web/lib/subscription/types.ts` | حدود التحويلات لكل tier |

---

## 10. تحديث الأسعار على الموقع

1. عدّل الأسعار في Lemon Squeezy (نفس Variant IDs).
2. حدّث `PRICING_PLANS` في `apps/web/lib/pricing/plans.ts` (SAR + `usdApprox`).
3. إن تغيّرت حدود التحويلات، حدّث `SUBSCRIPTION_TIERS` ومنطق الاستخدام.
4. أعد النشر وأخبر المستخدمين إن لزم.
