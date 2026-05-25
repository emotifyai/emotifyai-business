import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@emotifyai/ui'
import { Shield, Lock, Eye, Database, FileText, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
    title: 'سياسة الخصوصية - إيموتيفاي',
    description: 'تعرّف على كيف تحمي إيموتيفاي خصوصيتك وتتعامل مع بياناتك',
}

export default function PrivacyPage() {
    return (
        <div className="flex min-h-dvh flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1">
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <div className="page-container py-16 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                                <Shield className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
                                سياسة الخصوصية
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                خصوصيتك أولويتنا. تعرّف على كيف نجمع بياناتك ونستخدمها ونحميها.
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
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">مقدمة</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>
                                                تلتزم إيموتيفاي (&laquo;نحن&raquo; أو &laquo;لنا&raquo;) بحماية خصوصيتك. توضّح هذه السياسة كيف نجمع معلوماتك ونستخدمها ونفصح عنها ونؤمّنها عند استخدام إضافة المتصفح وتطبيق الويب. نؤمن بالشفافية الكاملة في ممارساتنا للبيانات.
                                            </p>
                                            <p>
                                                باستخدام إيموتيفاي، فإنك توافق على جمع المعلومات واستخدامها وفق هذه السياسة.
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
                                        <Database className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">المعلومات التي نجمعها</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>نجمع الحد الأدنى من البيانات اللازمة لتقديم الخدمة.</p>
                                            <h3>معلومات الحساب</h3>
                                            <ul>
                                                <li>البريد الإلكتروني (للتعريف بالحساب والتواصل)</li>
                                                <li>اسم العرض (لتخصيص تجربتك)</li>
                                                <li>معلومات مزوّد OAuth (إن سجّلت الدخول عبر Google)</li>
                                            </ul>
                                            <h3>بيانات الاستخدام</h3>
                                            <ul>
                                                <li>عدد تحسينات النص (لإدارة حدود الاشتراك)</li>
                                                <li>مستوى الاشتراك وحالته</li>
                                                <li>إصدار المتصفح والإضافة (للدعم والتوافق)</li>
                                                <li>سجلات الاستخدام تشمل طلبات التحسين وتفضيلات اللغة وحالة النجاح/الفشل</li>
                                            </ul>
                                            <h3>بيانات النص</h3>
                                            <p>
                                                عند تحسين النص، نعالجه مؤقتاً عبر خدمة الذكاء الاصطناعي. <strong>لا نخزّن ولا نسجّل ولا ندرّب نماذج الذكاء الاصطناعي على محتوى نصوصك.</strong> يُعالَج النص لحظياً ويُحذف فور انتهاء التحسين.
                                            </p>
                                            <h3>تحليلات الاستخدام لتحسين التجربة</h3>
                                            <p>لتحسين تجربتك باستمرار، نجمع سجلات استخدام تتضمن:</p>
                                            <ul>
                                                <li>طوابع زمنية لطلبات التحسين</li>
                                                <li>نتائج كشف اللغة وتفضيلات المستخدم</li>
                                                <li>حالة نجاح/فشل التحسين وأنواع الأخطاء</li>
                                                <li>استخدام الرموز (tokens) وزمن المعالجة</li>
                                                <li>أنماط استخدام الميزات</li>
                                            </ul>
                                            <p>
                                                <strong>مهم:</strong> هذه السجلات تحتوي بيانات وصفية عن الاستخدام ولا تتضمن أبداً محتوى النص الذي تحسّنه.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-green-500/10 p-2">
                                        <UserCheck className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">كيف نستخدم معلوماتك</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>نستخدم المعلومات المجمّعة حصرياً من أجل:</p>
                                            <ul>
                                                <li>تقديم الخدمة وصيانتها</li>
                                                <li>مصادقة المستخدمين والتحقق منهم</li>
                                                <li>معالجة طلبات تحسين النص</li>
                                                <li>إدارة الاشتراكات والفوترة بأمان</li>
                                                <li>مراقبة حدود الاستخدام ومنع إساءة النظام</li>
                                                <li>تحليل أنماط الاستخدام لتحسين الأداء والتجربة</li>
                                                <li>تحديد المشاكل التقنية وحلها</li>
                                                <li>تطوير ميزات جديدة</li>
                                                <li>إرسال تحديثات الخدمة الضرورية (بدون رسائل تسويقية مزعجة)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-purple-500/10 p-2">
                                        <Lock className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">أمان البيانات</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>نطبّق إجراءات أمان معيارية لحماية بياناتك:</p>
                                            <ul>
                                                <li><strong>التشفير:</strong> جميع البيانات مشفّرة أثناء النقل عبر HTTPS/TLS وفي حالة السكون حيث ينطبق.</li>
                                                <li><strong>المصادقة:</strong> OAuth 2.0 وJWT عبر Supabase.</li>
                                                <li><strong>أمان قاعدة البيانات:</strong> سياسات RLS تضمن وصولك لبياناتك فقط.</li>
                                                <li><strong>عدم تخزين النص:</strong> محتوى نصوصك لا يُسجّل في التخزين الدائم.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-orange-500/10 p-2">
                                        <Eye className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">خدمات الطرف الثالث</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>نتعاون مع مزوّدين متخصصين:</p>
                                            <ul>
                                                <li><strong>Supabase:</strong> المصادقة واستضافة قاعدة البيانات.</li>
                                                <li><strong>Anthropic (Claude AI):</strong> معالجة النص بالذكاء الاصطناعي.</li>
                                                <li><strong>Lemon Squeezy:</strong> المدفوعات وإدارة الاشتراكات.</li>
                                            </ul>
                                            <h3 className="mt-6">مشاركة البيانات (مزوّدو الخدمة فقط)</h3>
                                            <p><strong>لا نبيع بيانات المستخدمين.</strong></p>
                                            <p>
                                                نشارك البيانات فقط مع المزوّدين أعلاه لتشغيل إيموتيفاي. لا نشاركها للإعلان أو التتبّع عبر المواقع.
                                            </p>
                                            <h3 className="mt-6">سياسات المزوّدين</h3>
                                            <ul>
                                                <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">سياسة خصوصية Supabase</a></li>
                                                <li><a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">سياسة خصوصية Anthropic</a></li>
                                                <li><a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer">سياسة خصوصية Lemon Squeezy</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">حقوقك</h2>
                                    <p>يحق لك:</p>
                                    <ul>
                                        <li><strong>الوصول:</strong> طلب نسخة من بياناتك الشخصية</li>
                                        <li><strong>التصحيح:</strong> تحديث أو تصحيح معلوماتك</li>
                                        <li><strong>الحذف:</strong> طلب حذف حسابك وبياناتك</li>
                                        <li><strong>قابلية النقل:</strong> تصدير بياناتك بصيغة قابلة للقراءة آلياً</li>
                                        <li><strong>إلغاء الاشتراك:</strong> من رسائل التسويق</li>
                                    </ul>
                                    <p>
                                        لممارسة هذه الحقوق: <a href="mailto:privacy@emotifyai.com">privacy@emotifyai.com</a>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">القانون الحاكم والاختصاص</h2>
                                    <p>
                                        تخضع هذه السياسة لقوانين المملكة الأردنية الهاشمية. تخضع أي نزاعات للاختصاص الحصري لمحاكم الأردن.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-primary/20 bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">تواصل معنا</h2>
                                    <ul>
                                        <li>البريد: <a href="mailto:privacy@emotifyai.com">privacy@emotifyai.com</a></li>
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
