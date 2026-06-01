import Link from 'next/link'
import AnimatedELetter from '@/components/AnimatedELetter'
import { Header } from '@/components/layout/header'
import { MobileShell } from '@emotifyai/ui'
import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <MobileShell header={<Header />}>
            <div className="page-container relative flex flex-1 flex-col lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-0 lg:px-0">
                <div className="relative hidden h-full flex-col overflow-hidden border-e border-border p-10 text-foreground lg:flex">
                    {/* Light: soft brand wash; dark: navy panel */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-muted/80 to-background dark:from-[#0f121d] dark:via-[#1a1e2b] dark:to-[#0f121d]" />
                    <div
                        className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-0"
                        aria-hidden
                        style={{
                            background:
                                'radial-gradient(ellipse 70% 60% at 50% 45%, color-mix(in srgb, var(--primary) 18%, transparent), transparent)',
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-55 dark:opacity-40">
                        <AnimatedELetter />
                    </div>
                    <div className="relative z-20 flex items-center text-lg font-medium">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-gradient-brand text-2xl font-bold">إيموتيف<span className="text-primary">اي</span></span>
                        </Link>
                    </div>
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2 rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm dark:border-transparent dark:bg-transparent dark:p-0 dark:backdrop-blur-none">
                            <p className="text-lg leading-relaxed text-foreground/90 dark:text-white">
                                &laquo;غيّرت إيموتيفاي طريقة كتابتي بالكامل. التحسين بالذكاء الاصطناعي دقيق وقوي، ورسائلي ووثائقي أصبحت أكثر احترافية.&raquo;
                            </p>
                            <footer className="text-sm font-medium text-muted-foreground dark:text-white/80">
                                صفاء الدوسري
                            </footer>
                        </blockquote>
                    </div>
                </div>
                <div className="flex flex-1 flex-col justify-center py-8 sm:py-12 lg:p-8">
                    <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6 px-0 sm:w-full">
                        {children}
                    </div>
                </div>
            </div>
        </MobileShell>
    )
}
