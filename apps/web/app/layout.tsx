import type { Metadata } from "next";
import "@ui/globals.css";
import { ThemeProvider } from "next-themes";

import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "@ui/sonner";
import React from "react";

export const metadata: Metadata = {
  title: "EmotifyAI - AI-Powered Text Enhancement",
  description: "Enhance your writing with AI-powered text rewriting for English, Arabic, and French",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
