import { env } from '@/lib/env'

export async function sendEmailWithZeptoMail(to: string, subject: string, htmlBody: string) {
    if (!env.ZEPTOMAIL_SMTP_TOKEN) {
        console.warn('[ZeptoMail] Token not configured. Skipping email to:', to)
        return false
    }

    // ZeptoMail API requires the token in the format "Zoho-enczapikey <token>"
    const response = await fetch('https://api.zeptomail.com/v1.1/email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Zoho-enczapikey ${env.ZEPTOMAIL_SMTP_TOKEN}`,
        },
        body: JSON.stringify({
            from: {
                address: 'noreply@emotifyai.com',
                name: 'إيموتيفاي',
            },
            to: [
                {
                    email_address: {
                        address: to,
                    },
                },
            ],
            subject: subject,
            htmlbody: htmlBody,
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error('[ZeptoMail] Failed to send email:', errorText)
        return false
    }

    return true
}

export async function sendTrialEndedEmail(email: string) {
    const htmlBody = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>انتهت فترة تجربتك المجانية</title>
  <style>
    body { margin:0; padding:0; background-color:#0f1117; font-family:'Segoe UI', Tahoma, Arial, sans-serif; direction:rtl; color:#f1f0ff; }
    .container { max-width:560px; margin:40px auto; background:linear-gradient(145deg,#1a1d2e,#12151f); border:1px solid rgba(167,139,250,0.15); border-radius:16px; padding:40px 36px; text-align:center; }
    .logo { font-size:28px; font-weight:800; background:linear-gradient(135deg,#a78bfa,#7c3aed); -webkit-background-clip:text; -webkit-text-fill-color:transparent; letter-spacing:-0.5px; margin-bottom:32px; }
    h1 { font-size:24px; font-weight:700; margin:0 0 16px; }
    p { font-size:16px; color:#9ca3af; line-height:1.6; margin:0 0 28px; }
    .button { display:inline-block; background:linear-gradient(135deg,#7c3aed,#6d28d9); color:#fff; text-decoration:none; font-size:16px; font-weight:600; padding:14px 36px; border-radius:10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">إيموتيف<span style="-webkit-text-fill-color:#a78bfa;">اي</span></div>
    <h1>انتهت فترة تجربتك المجانية</h1>
    <p>انتهت تجربتك — استمر بـ ٤٥ ريال فقط شهرياً</p>
    <a href="${env.NEXT_PUBLIC_APP_URL}/pricing#pro_monthly" class="button">اشترك الآن</a>
  </div>
</body>
</html>
`
    return sendEmailWithZeptoMail(email, 'انتهت فترة تجربتك المجانية - إيموتيفاي', htmlBody)
}

export async function sendPaymentConfirmationEmail(email: string, creditsTotal: number) {
    const htmlBody = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تأكيد الدفع</title>
  <style>
    body { margin:0; padding:0; background-color:#0f1117; font-family:'Segoe UI', Tahoma, Arial, sans-serif; direction:rtl; color:#f1f0ff; }
    .container { max-width:560px; margin:40px auto; background:linear-gradient(145deg,#1a1d2e,#12151f); border:1px solid rgba(167,139,250,0.15); border-radius:16px; padding:40px 36px; text-align:center; }
    .logo { font-size:28px; font-weight:800; background:linear-gradient(135deg,#a78bfa,#7c3aed); -webkit-background-clip:text; -webkit-text-fill-color:transparent; letter-spacing:-0.5px; margin-bottom:32px; }
    h1 { font-size:24px; font-weight:700; margin:0 0 16px; }
    p { font-size:16px; color:#9ca3af; line-height:1.6; margin:0 0 28px; }
    .highlight { font-weight:bold; color:#a78bfa; font-size:20px; }
    .button { display:inline-block; background:linear-gradient(135deg,#7c3aed,#6d28d9); color:#fff; text-decoration:none; font-size:16px; font-weight:600; padding:14px 36px; border-radius:10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">إيموتيف<span style="-webkit-text-fill-color:#a78bfa;">اي</span></div>
    <h1>تم تأكيد الدفع بنجاح!</h1>
    <p>شكراً لشرائك. رصيدك الحالي هو:</p>
    <p class="highlight">${creditsTotal.toLocaleString('ar-EG')} نقطة</p>
    <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">الذهاب للوحة التحكم</a>
  </div>
</body>
</html>
`
    return sendEmailWithZeptoMail(email, 'تم تأكيد الدفع بنجاح - إيموتيفاي', htmlBody)
}
