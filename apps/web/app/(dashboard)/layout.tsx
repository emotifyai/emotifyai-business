'use client'

import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardBottomNav } from '@/components/layout/dashboard-bottom-nav'
import ProtectedRoute from '@/components/auth/protected-route'
import { MobileShell } from '@emotifyai/ui'
import React from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute>
            <MobileShell
                header={<Header showMobileMenu={false} />}
                bottomNav={<DashboardBottomNav />}
            >
                <div className="page-container flex flex-1 flex-col md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
                    <aside className="hidden md:sticky md:top-16 md:block md:h-[calc(100dvh-4rem)] md:overflow-y-auto md:border-e md:pe-2">
                        <Sidebar />
                    </aside>
                    <main className="flex w-full min-w-0 flex-col overflow-x-hidden py-4 pb-2 md:py-6 md:pb-6">
                        {children}
                    </main>
                </div>
            </MobileShell>
        </ProtectedRoute>
    )
}
