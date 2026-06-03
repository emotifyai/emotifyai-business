import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@emotifyai/ui'
import { BookOpen, Download, Key, MousePointerClick, Keyboard, Zap } from 'lucide-react'

export const metadata: Metadata = {
    title: 'التوثيق - EmotifyAI',
    description: 'دليل شامل لاستخدام إضافة EmotifyAI وتطبيق الويب',
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
                                التوثيق
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                كل ما تحتاج معرفته لاستخدام EmotifyAI في تحسين كتابتك.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="page-container py-16 md:py-24">
                    <div className="mx-auto max-w-5xl space-y-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">البدء</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card className="border-primary/20">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2">
                                                <Download className="h-5 w-5 text-primary" />
                                            </div>
                                            <CardTitle>التثبيت</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ol className="space-y-3 text-sm">
                                            <li className="flex gap-3">
                                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">١</span>
                                                <span className="text-muted-foreground">ثبّت إضافة EmotifyAI من <strong className="text-foreground">Chrome Web Store</strong> أو <strong className="text-foreground">Firefox Add-ons</strong></span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">٢</span>
                                                <span className="text-muted-foreground">انقر أيقونة EmotifyAI في شريط أدوات المتصفح لفتح النافذة المنبثقة</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">٣</span>
                                                <span className="text-muted-foreground">سجّل الدخول بحسابك أو أنشئ حساباً جديداً</span>
                                            </li>
                                        </ol>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-blue-500/10 p-2">
                                                <Key className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <CardTitle>المصادقة</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            لاستخدام الإضافة تحتاج تسجيل الدخول. يمكنك:
                                        </p>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">تسجيل الدخول مباشرة من نافذة الإضافة</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">إنشاء مفتاح API من لوحة التحكم وإدخاله في إعدادات الإضافة</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold mb-6">استخدام EmotifyAI</h2>
                            <div className="grid gap-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-green-500/10 p-2">
                                                <MousePointerClick className="h-5 w-5 text-green-500" />
                                            </div>
                                            <CardTitle>تحسين النص</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold mb-2">طريقة القائمة السياقية</h4>
                                                <ol className="space-y-2 text-sm">
                                                    <li className="flex gap-3">
                                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-semibold text-green-500">١</span>
                                                        <span className="text-muted-foreground">حدّد أي نص في صفحة الويب</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-semibold text-green-500">٢</span>
                                                        <span className="text-muted-foreground">انقر بالزر الأيمن لفتح القائمة</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-semibold text-green-500">٣</span>
                                                        <span className="text-muted-foreground">مرّر على &laquo;EmotifyAI&raquo; واختر &laquo;تحسين&raquo;</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-semibold text-green-500">٤</span>
                                                        <span className="text-muted-foreground">يُعاد كتابة النص فوراً بوضوح وأسلوب أفضل</span>
                                                    </li>
                                                </ol>
                                            </div>
                                            <div className="rounded-lg bg-muted/50 p-4 border">
                                                <p className="text-sm text-muted-foreground">
                                                    <strong className="text-foreground">💡 نصيحة:</strong> يستبدل النص المحسّن تحديدك تلقائياً. يمكنك التراجع بـ Ctrl+Z (أو Cmd+Z على Mac).
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-purple-500/10 p-2">
                                                <Keyboard className="h-5 w-5 text-purple-500" />
                                            </div>
                                            <CardTitle>اختصارات لوحة المفاتيح</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                                                <span className="text-sm text-muted-foreground">تحسين النص المحدد</span>
                                                <kbd className="rounded bg-muted px-2 py-1 text-xs font-semibold">Ctrl+Shift+E</kbd>
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                                                <span className="text-sm text-muted-foreground">فتح نافذة EmotifyAI</span>
                                                <kbd className="rounded bg-muted px-2 py-1 text-xs font-semibold">Ctrl+Shift+Y</kbd>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                <strong className="text-foreground">ملاحظة:</strong> على Mac استخدم Cmd بدلاً من Ctrl
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

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
                                        <h4 className="font-semibold text-sm">أفضل الممارسات</h4>
                                        <ul className="space-y-1.5 text-sm">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary">✓</span>
                                                <span className="text-muted-foreground">حدّد جملاً كاملة لنتائج أفضل</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary">✓</span>
                                                <span className="text-muted-foreground">راجع اقتراحات الذكاء الاصطناعي قبل القبول</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary">✓</span>
                                                <span className="text-muted-foreground">استخدم الاختصارات لتسريع العمل</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm">استكشاف الأخطاء</h4>
                                        <ul className="space-y-1.5 text-sm">
                                            <li className="flex items-start gap-2">
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-muted-foreground">إن فشل التحسين، تحقق من اتصال الإنترنت</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-muted-foreground">تأكد أنك لم تتجاوز حد الاستخدام</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-muted-foreground">حدّث الصفحة إن لم تظهر القائمة السياقية</span>
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
