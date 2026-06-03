import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@emotifyai/ui'
import { Mail, MessageCircle, FileText, Clock } from 'lucide-react'
import { Button } from '@emotifyai/ui'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'الدعم - EmotifyAI',
    description: 'احصل على المساعدة مع EmotifyAI — تواصل مع الدعم واطّلع على التوثيق والأسئلة الشائعة',
}

export default function SupportPage() {
    return (
        <div className="flex min-h-dvh flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1">
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <div className="page-container py-16 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                                <MessageCircle className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
                                كيف يمكننا مساعدتك؟
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                احصل على الدعم، ابحث عن إجابات، أو تواصل مع فريقنا مباشرة.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="page-container py-16 md:py-24">
                    <div className="mx-auto max-w-4xl">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="border-primary/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <Mail className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-2">دعم البريد الإلكتروني</h3>
                                            <p className="text-muted-foreground mb-4">
                                                أرسل لنا بريداً وسنرد خلال ٢٤ ساعة.
                                            </p>
                                            <Button asChild>
                                                <a href="mailto:support@emotifyai.com">
                                                    تواصل مع الدعم
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-blue-500/10 p-2">
                                            <FileText className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-2">التوثيق</h3>
                                            <p className="text-muted-foreground mb-4">
                                                أدلة مفصّلة ومعلومات استكشاف الأخطاء.
                                            </p>
                                            <Button variant="outline" asChild>
                                                <Link href="/docs">
                                                    عرض التوثيق
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mt-8">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-green-500/10 p-2">
                                        <Clock className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-4">أوقات الاستجابة</h3>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="text-center p-4 rounded-lg border bg-card">
                                                <div className="text-2xl font-bold text-primary mb-1">
                                                    &lt; ٢٤ س
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    دعم عام
                                                </div>
                                            </div>
                                            <div className="text-center p-4 rounded-lg border bg-card">
                                                <div className="text-2xl font-bold text-primary mb-1">
                                                    &lt; ١٢ س
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    مشاكل الفوترة
                                                </div>
                                            </div>
                                            <div className="text-center p-4 rounded-lg border bg-card">
                                                <div className="text-2xl font-bold text-primary mb-1">
                                                    &lt; ٤ س
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    مشاكل حرجة
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-16">
                            <h2 className="text-2xl font-bold text-center mb-8">أسئلة شائعة</h2>
                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-semibold mb-2">الإضافة لا تعمل على موقع معيّن؟</h4>
                                        <p className="text-muted-foreground text-sm">
                                            بعض المواقع تمنع الإضافات. جرّب تحديث الصفحة أو تحقق من تفعيل الإضافة في إعدادات المتصفح.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-semibold mb-2">الرصيد لا يتحدّث؟</h4>
                                        <p className="text-muted-foreground text-sm">
                                            قد يستغرق المزامنة بضع دقائق. جرّب تسجيل الخروج والدخول مجدداً، أو تواصل مع الدعم إن استمرت المشكلة.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-semibold mb-2">مشاكل في الفوترة أو الاشتراك؟</h4>
                                        <p className="text-muted-foreground text-sm">
                                            لأسئلة الفوترة، راسلنا مع بريد حسابك وسنعالج الأمر بسرعة.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
