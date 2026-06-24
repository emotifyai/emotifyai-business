import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@emotifyai/ui'
import { Sparkles, Target, Zap, Globe, Heart, MessageSquareQuote } from 'lucide-react'

export const metadata: Metadata = {
    title: 'من نحن - EmotifyAI',
    description: 'قصة إيموتيفاي: أداة متخصصة في النص الخليجي العاطفي الذي يبيع، بناها مصطفى راتب لتجار المتاجر الخليجية',
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
                                من أنا
                            </h1>
                            <p className="text-base text-muted-foreground sm:text-xl">
                                أنا مصطفى راتب، مؤسس إيموتيفاي. وهذه قصة الأداة التي بنيتها لتكتب نصاً خليجياً عاطفياً يبيع.
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
                                        <h2 className="text-2xl font-bold mb-4">البداية</h2>
                                        <p className="text-lg text-muted-foreground leading-relaxed">
                                            قبل سنة، لم أكن أحداً في هذا المجال. لا شهادة في البرمجة، ولا خلفية في الذكاء الاصطناعي. مجرد شخص يؤمن بشيء واحد: أن الكلمة، حين تُكتب صح، تحرّك الناس وتدفعهم للشراء.
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
                                        <h2 className="text-2xl font-bold mb-4">الفجوة التي دفعتني</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            أدوات الذكاء الاصطناعي العامة تتقن الإنجليزية، لكنها تتعثّر أمام العربية — النبرة، الإحساس، والطريقة التي يشتري بها الناس في منطقتنا فعلاً. كنت أرى تاجراً عنده منتج ممتاز، لكن وصفه بارد: «صحيح، وغير مقنع». المنتج يستاهل، لكن الكلمة خذلته. فقرّرت أبني الأداة التي تسدّ هذه الفجوة.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-orange-500/10 p-2">
                                        <Sparkles className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">الطريق لم يكن مستقيماً</h2>
                                        <div className="space-y-4">
                                            <p className="text-muted-foreground leading-relaxed">
                                                أخطأت في أول نسخة. بنيتها للديسكتوب، بينما جمهوري — تجار المتاجر الخليجيون — يديرون تجارتهم من جوالهم، وهم واقفون في مستودع أو بين اجتماعين. فرجعت من الصفر وبنيتها للجوال أولاً. وبدأتها كإضافة متصفح، ثم اكتشفت أن الإطار أضيق من الطموح، فأعدت بناءها تطبيق ويب كاملاً.
                                            </p>
                                            <p className="text-muted-foreground leading-relaxed">
                                                كل فشل لسعني، وكل فشل علّمني ما لا يعلّمه أي فصل دراسي. تعلّمت السوق لأني عشت فيه، درست المنافسين والفجوات التي لا يملؤها أحد، وبنيت قلب المنتج بيدي — محرّك يجعل الكلمات تخرج إنسانية، لا مترجمة.
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
                                        <Globe className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">ليش خليجي عاطفي تحديداً</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            لأن النص الذي يبيع في الخليج يحتاج أن يخاطب لهجة عميلك ونفسيّته، لا عربية فصيحة باردة. إيموتيفاي ليس أداة عامة تكتب بأي لغة لأي أحد؛ هو متخصص في شيء واحد ويتقنه: النص الخليجي العاطفي الذي يلمس قرار الشراء — مضبوط على كيف يفكّر العميل الخليجي، وكيف يشعر.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-purple-500/10 p-2">
                                        <Heart className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">ما أؤمن به</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            الكلمة أقدم سلاح نملكه. الحضارات قامت عليها، والصفقات تُغلق بها. وحتى اليوم، بكل تقنياتنا وآلاتنا الذكية، لم يحلّ شيء محلّ جملة تجعل الإنسان يشعر. الذكاء الاصطناعي لم يقتل الكلمة — بل جعل من يتقن استخدامها أثمن من أي وقت مضى.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <MessageSquareQuote className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">وعدي لك</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            ما زلت أبني، وما زلت أتعلّم. وأنا هنا، خلف الأداة، أسمع منك وأطوّرها معك. إذا كنت تبيع أونلاين وحسّيت أن وصف منتجك «صحيح، وغير مقنع» — جرّب إيموتيفاي، وقل لي رأيك.
                                        </p>
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
