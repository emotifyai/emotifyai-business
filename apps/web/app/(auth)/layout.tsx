import Link from 'next/link'
import AnimatedELetter from '@/components/AnimatedELetter'
import { Header } from '@/components/layout/header'
import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <div className="container relative flex-1 flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
                <div className="relative hidden h-full flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-10 text-white dark:border-r lg:flex">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />

                    {/* Animated V Letter Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                        <AnimatedELetter />
                    </div>

                    <div className="relative z-20 flex items-center text-lg font-medium">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-gradient-brand text-2xl font-bold">EmotifyAI</span>
                        </Link>
                    </div>
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                &ldquo;EmotifyAI has completely transformed how I write. The AI enhancement is subtle yet powerful, making my emails and documents sound so much more professional.&rdquo;
                            </p>
                            <footer className="text-sm">Sofia Davis</footer>
                        </blockquote>
                    </div>
                </div>
                <div className="lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
