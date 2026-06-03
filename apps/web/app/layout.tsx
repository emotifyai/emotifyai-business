import type { Metadata, Viewport } from "next";
import "@emotifyai/ui/styles/globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "next-themes";

import { arabicFontClassName } from "@/lib/fonts";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "@emotifyai/ui";
import React from "react";
import { AuthErrorHandler } from "@/components/auth/auth-error-handler";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: "EmotifyAI — تحسين نصوص المنتجات بالذكاء الاصطناعي",
  description:
    "حوّل أوصاف منتجاتك إلى نصوص تسويقية جذابة بالعربية والإنجليزية. مصمم لسوق الخليج.",
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
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={arabicFontClassName}
      suppressHydrationWarning
    >
      <body className="min-h-dvh overflow-x-hidden font-sans antialiased" suppressHydrationWarning>
        {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster position="top-center" className="safe-area-top" />
            <React.Suspense fallback={null}>
              <AuthErrorHandler />
            </React.Suspense>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
