'use client'

import { DashboardHeader } from '@/components/layout/dashboard-header'
import { DashboardSidebar } from '@/components/layout/sidebar'
import ProtectedRoute from '@/components/auth/protected-route'
import React from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-dvh bg-background">
        <DashboardSidebar />
        <div className="flex min-h-dvh flex-col md:mr-64">
          <DashboardHeader />
          <main className="page-container flex-1 py-6 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
