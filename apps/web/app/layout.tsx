import type { Metadata } from "next";
import "./globals.css";

import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "@/components/ui/sonner";
import React from "react";

export const metadata: Metadata = {
  title: "Verba - AI-Powered Text Enhancement",
  description: "Enhance your writing with AI-powered text rewriting for English, Arabic, and French",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
