import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@emotifyai/ui'
import { Sparkles, Target, Zap, Shield, Globe, Users } from 'lucide-react'

export const metadata: Metadata = {
    title: 'من نحن - EmotifyAI',
    description: 'تعرّف على EmotifyAI ورسالتنا في تحسين الكتابة بالذكاء الاصطناعي',
}

export default function AboutPage() {
    return (
        <div className="flex min-h-dvh flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden">
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <div className="page-container py-12 sm:py-16 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3 sm:mb-6">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:mb-4 sm:text-4xl md:text-5xl">
                                عن EmotifyAI
                            </h1>
                            <p className="text-base text-muted-foreground sm:text-xl">
                                نرفع مستوى كتابتك بقوة الذكاء الاصطناعي، ونجعل التواصل أسهل للجميع.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="page-container py-12 sm:py-16 md:py-24">
                    <div className="mx-auto max-w-4xl space-y-12">
                        <Card className="border-primary/20">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Target className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">رسالتنا</h2>
                                        <p className="text-lg text-muted-foreground leading-relaxed">
                                            نؤمن أن اللغة لا يجب أن تكون حاجزاً أمام التواصل الفعّال. سواء كنت تكتب بريداً مهماً أو وثيقة تقنية أو نصاً إبداعياً، تساعدك EmotifyAI على إيجاد الكلمات المناسبة فوراً — بالعربية أو الإنجليزية أو الفرنسية.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-blue-500/10 p-2">
                                        <Zap className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">كيف يعمل</h2>
                                        <div className="space-y-4">
                                            <p className="text-muted-foreground leading-relaxed">
                                                تعتمد EmotifyAI على ذكاء اصطناعي متقدم يفهم سياق كتابتك ودقائها.
                                            </p>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="rounded-lg border bg-card p-4">
                                                    <h3 className="font-semibold mb-2">إضافة المتصفح</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        تندمج بسلاسة في سير عملك لتُحسّن النص مباشرة حيث تكتب.
                                                    </p>
                                                </div>
                                                <div className="rounded-lg border bg-card p-4">
                                                    <h3 className="font-semibold mb-2">لوحة التحكم</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        أدِر اشتراكك، تتبّع الاستخدام، واطّلع على مفاتيح API من مكان واحد.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-green-500/10 p-2">
                                        <Globe className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">تميّز متعدد اللغات</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            تتخصص EmotifyAI في ثلاث لغات بجودة عالية تناسب خصائص كل لغة:
                                        </p>
                                        <div className="grid gap-3 md:grid-cols-3">
                                            <div className="rounded-lg border bg-card p-4 text-center">
                                                <div className="text-2xl font-bold mb-1">🇬🇧</div>
                                                <div className="font-semibold">الإنجليزية</div>
                                                <div className="text-xs text-muted-foreground">احترافي وإبداعي</div>
                                            </div>
                                            <div className="rounded-lg border bg-card p-4 text-center">
                                                <div className="text-2xl font-bold mb-1">🇸🇦</div>
                                                <div className="font-semibold">العربية</div>
                                                <div className="text-xs text-muted-foreground">يدعم RTL</div>
                                            </div>
                                            <div className="rounded-lg border bg-card p-4 text-center">
                                                <div className="text-2xl font-bold mb-1">🇫🇷</div>
                                                <div className="font-semibold">الفرنسية</div>
                                                <div className="text-xs text-muted-foreground">رسمي وعفوي</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-purple-500/10 p-2">
                                        <Shield className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">الخصوصية أولاً</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            نأخذ خصوصيتك على محمل الجد. صُممت EmotifyAI بمنهج أمان أولاً:
                                        </p>
                                        <ul className="space-y-2">
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    <strong className="text-foreground">لا تخزين للنص:</strong> لا نحفظ النص المحسّن على خوادمنا
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    <strong className="text-foreground">معالجة آمنة:</strong> يُعالَج النص بأمان ولا يُستخدم لتدريب نماذج الذكاء الاصطناعي
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    <strong className="text-foreground">بدون تتبّع:</strong> لا نتتبع سجل تصفحك أو نشاطك
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    <strong className="text-foreground">تشفير:</strong> جميع الاتصالات مشفّرة بمعايير صناعية
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-orange-500/10 p-2">
                                        <Users className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">من نخدم</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            بُنيت EmotifyAI لكل من يكتب:
                                        </p>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-lg border bg-card p-3">
                                                <div className="font-semibold text-sm mb-1">المحترفون</div>
                                                <div className="text-xs text-muted-foreground">رسائل ووثائق مصقولة</div>
                                            </div>
                                            <div className="rounded-lg border bg-card p-3">
                                                <div className="font-semibold text-sm mb-1">الطلاب</div>
                                                <div className="text-xs text-muted-foreground">تحسين المقالات والواجبات</div>
                                            </div>
                                            <div className="rounded-lg border bg-card p-3">
                                                <div className="font-semibold text-sm mb-1">صنّاع المحتوى</div>
                                                <div className="text-xs text-muted-foreground">مقالات ومنشورات أقوى</div>
                                            </div>
                                            <div className="rounded-lg border bg-card p-3">
                                                <div className="font-semibold text-sm mb-1">غير الناطقين الأصليين</div>
                                                <div className="text-xs text-muted-foreground">اكتب بثقة بأي لغة</div>
                                            </div>
                                        </div>
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
