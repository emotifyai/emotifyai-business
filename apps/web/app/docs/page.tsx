import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@emotifyai/ui'
import { BookOpen, Sparkles, SlidersHorizontal, Gauge, Zap } from 'lucide-react'

export const metadata: Metadata = {
    title: 'التوثيق - EmotifyAI',
    description: 'دليل سريع لاستخدام إيموتيفاي: حوّل وصف منتجك إلى نص خليجي عاطفي يبيع في ثوانٍ',
}

export default function DocsPage() {
    return (
        <div className="flex min-h-dvh flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1">
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <div className="page-container py-16 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                                <BookOpen className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
                                دليل الاستخدام
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                ثلاث خطوات، ويطلع لك نص خليجي عاطفي يبيع. بدون تعقيد، وبدون تثبيت أي شيء.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="page-container py-16 md:py-24">
                    <div className="mx-auto max-w-5xl space-y-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">جرّب فوراً — بدون تسجيل</h2>
                            <Card className="border-primary/20">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                        </div>
                                        <CardTitle>التحسين السريع</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ol className="space-y-3 text-sm">
                                        <li className="flex gap-3">
                                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">١</span>
                                            <span className="text-muted-foreground">افتح الصفحة الرئيسية، واكتب أو الصق وصف منتجك في صندوق النص — بأي لغة، حتى لو إنجليزي أو صيني.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">٢</span>
                                            <span className="text-muted-foreground">اضغط أيقونة التحسين جنب النص. تظهر النسخة المحسّنة أسفل مباشرة، كلمة كلمة.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">٣</span>
                                            <span className="text-muted-foreground">اضغط زر النسخ، والصق النص في متجرك أو منشورك.</span>
                                        </li>
                                    </ol>
                                    <div className="rounded-lg bg-muted/50 p-4 border mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            <strong className="text-foreground">💡 ملاحظة:</strong> لك ٥ تحسينات مجانية بدون أي تسجيل. جرّب وشوف الفرق بنفسك قبل أي خطوة.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold mb-6">المحرّر الكامل — تحكّم أدق</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-blue-500/10 p-2">
                                                <SlidersHorizontal className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <CardTitle>تحكّم في المخرجات</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            اضغط زر «افتح المحرّر» تحت النتيجة. يطلب منك بريدك الإلكتروني للدخول، وبعدها تتحكم في:
                                        </p>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                <span className="text-muted-foreground"><strong className="text-foreground">لغة المخرج:</strong> عربي خليجي، عربي فصيح، أو إنجليزي</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                <span className="text-muted-foreground"><strong className="text-foreground">النبرة:</strong> عاطفي، تسويقي، أو حصري</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                <span className="text-muted-foreground"><strong className="text-foreground">المنصة:</strong> واتساب، فيسبوك، تيك توك، سناب، إنستغرام، أو متجر</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-green-500/10 p-2">
                                                <BookOpen className="h-5 w-5 text-green-500" />
                                            </div>
                                            <CardTitle>حفظ نتائجك</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            داخل المحرّر، كل نص تولّده يُحفظ تلقائياً، فترجع له وقت ما تحتاج:
                                        </p>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">سجل بكل نصوصك السابقة في مكان واحد</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">تسجيلك بالبريد يفتح لك ٥ تحسينات إضافية مجاناً</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Gauge className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle>خطة الاستخدام</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-lg border bg-card p-4">
                                        <div className="font-semibold text-sm mb-1">١. تجربة الضيف</div>
                                        <div className="text-xs text-muted-foreground">٥ تحسينات مجانية، بدون أي تسجيل</div>
                                    </div>
                                    <div className="rounded-lg border bg-card p-4">
                                        <div className="font-semibold text-sm mb-1">٢. بعد التسجيل</div>
                                        <div className="text-xs text-muted-foreground">٥ تحسينات إضافية + حفظ السجل + المحرّر الكامل</div>
                                    </div>
                                    <div className="rounded-lg border bg-card p-4">
                                        <div className="font-semibold text-sm mb-1">٣. الاشتراك المدفوع</div>
                                        <div className="text-xs text-muted-foreground">استخدام منتظم بحصة شهرية أوسع</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Zap className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle>نصائح سريعة</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm">للنتيجة الأفضل</h4>
                                        <ul className="space-y-1.5 text-sm">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary">✓</span>
                                                <span className="text-muted-foreground">أدخل مواصفات منتجك كاملة ليطلع النص أدق</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary">✓</span>
                                                <span className="text-muted-foreground">اختر المنصة الصح، لأن نبرة واتساب تختلف عن المتجر</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary">✓</span>
                                                <span className="text-muted-foreground">جرّب أكثر من نبرة وقارن أيها يناسب منتجك</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm">إذا واجهت مشكلة</h4>
                                        <ul className="space-y-1.5 text-sm">
                                            <li className="flex items-start gap-2">
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-muted-foreground">إن لم تظهر النتيجة، تحقق من اتصال الإنترنت</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-muted-foreground">تأكد أنك لم تستهلك تحسيناتك المجانية</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-muted-foreground">للتحكم الكامل والحفظ، تحتاج تسجيل بريدك</span>
                                            </li>
                                        </ul>
                                    </div>
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
