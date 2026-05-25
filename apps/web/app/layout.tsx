import type { Metadata, Viewport } from "next";
import "@emotifyai/ui/styles/globals.css";
import { ThemeProvider } from "next-themes";

import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "@emotifyai/ui";
import React from "react";

export const metadata: Metadata = {
  title: "EmotifyAI - AI-Powered Text Enhancement",
  description: "Enhance your writing with AI-powered text rewriting for English, Arabic, and French",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f121d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh overflow-x-hidden antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster position="top-center" className="safe-area-top" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
