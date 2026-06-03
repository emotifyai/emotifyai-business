import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@emotifyai/ui'
import { FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
    title: 'شروط الخدمة - EmotifyAI',
    description: 'الشروط والأحكام لاستخدام EmotifyAI',
}

export default function TermsPage() {
    return (
        <div className="flex min-h-dvh flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1">
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <div className="page-container py-16 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                                <Scale className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
                                شروط الخدمة
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                يرجى قراءة هذه الشروط بعناية قبل استخدام EmotifyAI.
                            </p>
                            <p className="mt-4 text-sm text-muted-foreground">
                                آخر تحديث: ٣٠ ديسمبر ٢٠٢٥
                            </p>
                        </div>
                    </div>
                </section>

                <section className="page-container py-16 md:py-24">
                    <div className="mx-auto max-w-4xl space-y-8">
                        <Card className="border-primary/20">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">قبول الشروط</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>
                                                بالوصول إلى إضافة المتصفح وتطبيق الويب لEmotifyAI (&laquo;الخدمة&raquo;) أو استخدامهما، فإنك توافق على الالتزام بشروط الخدمة هذه. إن لم توافق، لا تستخدم الخدمة.
                                            </p>
                                            <p>
                                                نحتفظ بحق تعديل هذه الشروط في أي وقت. استمرارك في الاستخدام بعد التعديلات يعني قبول الشروط المعدّلة.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-blue-500/10 p-2">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">وصف الخدمة</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>
                                                EmotifyAI أداة تحسين نصوص بالذكاء الاصطناعي تساعدك على رفع جودة الكتابة ووضوحها ونبرتها. تشمل الخدمة:
                                            </p>
                                            <ul>
                                                <li>إضافة متصفح للتكامل مع مواقعك</li>
                                                <li>لوحة تحكم لإدارة الحساب</li>
                                                <li>معالجة تحسين النص بالذكاء الاصطناعي</li>
                                                <li>تتبّع الاشتراك والاستخدام</li>
                                                <li>تحليلات استخدام لتحسين الخدمة (بيانات وصفية فقط، دون محتوى النص)</li>
                                            </ul>
                                            <p>
                                                نسعى لتقديم خدمة موثوقة، لكن بسبب اعتمادنا على بنية تحتية معقدة وطرف ثالث، لا نضمن تشغيلاً بلا انقطاع أو بلا أخطاء بنسبة ١٠٠٪.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">حسابات المستخدمين</h2>
                                    <h3>إنشاء الحساب</h3>
                                    <p>لاستخدام EmotifyAI يجب إنشاء حساب آمن. أنت توافق على:</p>
                                    <ul>
                                        <li>تقديم معلومات دقيقة (البريد مطلوب لاستعادة الحساب)</li>
                                        <li>الحفاظ على أمان حسابك ومفاتيح API</li>
                                        <li>إبلاغنا فوراً بأي وصول غير مصرّح به</li>
                                        <li>تحمّل مسؤولية النشاط تحت حسابك</li>
                                    </ul>
                                    <h3>خصوصية الحساب</h3>
                                    <p>
                                        تُدار بيانات حسابك عبر Supabase. لا نصل إلى كلمات مرور OAuth (مثل Google). راجع <a href="/privacy">سياسة الخصوصية</a>.
                                    </p>
                                    <h3>إنهاء الحساب</h3>
                                    <p>
                                        نحتفظ بحق تعليق أو إنهاء الحسابات التي تنتهك هذه الشروط أو تسيء استخدام النظام أو تنخرط في أنشطة غير قانونية.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">الاشتراك والفوترة</h2>
                                    <h3>مستويات الاشتراك</h3>
                                    <ul>
                                        <li><strong>مجاني:</strong> ٥ تحويلات للضيف، ثم ٥ إضافية بعد إنشاء الحساب (مرة واحدة لكل مرحلة)</li>
                                        <li><strong>خطط شهرية:</strong> اشتراكات متكررة بعدد تحسينات شهري ثابت</li>
                                        <li><strong>مدى الحياة:</strong> شراء لمرة واحدة برصيد شهري دائم</li>
                                    </ul>
                                    <h3>حدود الاستخدام (الرصيد)</h3>
                                    <ul>
                                        <li>التحسين الواحد يستهلك عادة رصيداً واحداً</li>
                                        <li>يُعاد تعيين الرصيد مع بداية دورة الفوترة الشهرية</li>
                                        <li>الرصيد غير المستخدم لا يُرحّل للشهر التالي</li>
                                        <li>عند بلوغ الحد يمكنك الترقية أو انتظار الدورة التالية</li>
                                    </ul>
                                    <h3>المدفوعات</h3>
                                    <p>تُعالَج المدفوعات عبر Lemon Squeezy. بالاشتراك توافق على:</p>
                                    <ul>
                                        <li>التجديد التلقائي للاشتراكات الشهرية حتى الإلغاء</li>
                                        <li>الخصم من وسيلة الدفع حسب خطتك</li>
                                        <li>أن الوصول يعتمد على نجاح الدفع</li>
                                    </ul>
                                    <h3>الإلغاء والاسترداد</h3>
                                    <p>
                                        يمكنك إلغاء الاشتراك من لوحة التحكم. يبقى الوصول نشطاً حتى نهاية الفترة الحالية.
                                    </p>
                                    <p>
                                        <strong>الاسترداد:</strong> نقدّم استرداداً قصير الأجل &laquo;بدون أسئلة&raquo; لأول دفعة شهرية. تراخيص مدى الحياة غير قابلة للاسترداد بعد ٣٠ يوماً.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">البيانات والخصوصية</h2>
                                    <p>
                                        <strong>لا نخزّن ولا نسجّل محتوى النص الذي تحسّنه.</strong> يُعالَج لحظياً ويُحذف بعد التحسين. تُحفظ بيانات وصفية فقط لتحسين الخدمة.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-orange-500/10 p-2">
                                        <AlertCircle className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">سياسة الاستخدام المقبول</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>توافق على عدم:</p>
                                            <ul>
                                                <li>استخدام الخدمة لأغراض غير قانونية أو غير مصرّح بها</li>
                                                <li>محاولة الوصول غير المصرّح به لأنظمتنا</li>
                                                <li>هندسة عكسية أو تفكيك الخدمة</li>
                                                <li>مشاركة مفاتيح API أو بيانات الحساب</li>
                                                <li>إساءة استخدام الخدمة بطلبات آلية مفرطة</li>
                                                <li>توليد محتوى ضار أو مسيء أو غير قانوني</li>
                                                <li>إعادة بيع الخدمة دون إذن</li>
                                            </ul>
                                            <p className="font-semibold text-destructive">
                                                قد يؤدي انتهاك هذه السياسة إلى إنهاء الحساب فوراً.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">الملكية الفكرية</h2>
                                    <p>EmotifyAI وعلاماتها ومحتواها مملوكة لنا أو لمرخّصينا.</p>
                                    <p>تحتفظ بحقوق النص الذي تدخله. لا ندّعي ملكية محتواك.</p>
                                    <p>النص المُولَّد بالذكاء الاصطناعي يُقدَّم &laquo;كما هو&raquo; — أنت مسؤول عن مراجعته قبل الاستخدام.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">حدود المسؤولية</h2>
                                    <p>في الحد الأقصى الذي يسمح به القانون:</p>
                                    <ul>
                                        <li>تُقدَّم EmotifyAI &laquo;كما هي&raquo; دون ضمانات</li>
                                        <li>لسنا مسؤولين عن أضرار غير مباشرة أو تبعية</li>
                                        <li>مسؤوليتنا الإجمالية محدودة بما دفعته خلال آخر ١٢ شهراً</li>
                                        <li>لسنا مسؤولين عن خدمات أو محتوى طرف ثالث</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">القانون الحاكم والاختصاص</h2>
                                    <p>
                                        تخضع هذه الشروط لقوانين المملكة الأردنية الهاشمية. تخضع النزاعات للاختصاص الحصري لمحاكم الأردن.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-primary/20 bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">تواصل معنا</h2>
                                    <ul>
                                        <li>البريد: <a href="mailto:legal@emotifyai.com">legal@emotifyai.com</a></li>
                                        <li>الدعم: <a href="mailto:support@emotifyai.com">support@emotifyai.com</a></li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
