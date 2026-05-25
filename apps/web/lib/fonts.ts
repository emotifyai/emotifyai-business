import { Cairo, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";

/** Body/UI — readable, enterprise-safe for product copy and forms. */
export const fontSansAr = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500"],
  variable: "--font-sans-ar",
  display: "swap",
  preload: true,
});

/** Headings — warm, distinctive; playful-friendly without feeling childish. */
export const fontDisplayAr = Cairo({
  subsets: ["arabic"],
  weight: ["600", "700"],
  variable: "--font-display-ar",
  display: "swap",
  preload: true,
});

/** Latin fallback for mixed EN snippets and dir="auto" blocks. */
export const fontLatin = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-latin",
  display: "swap",
});

export const arabicFontClassName = [
  fontSansAr.variable,
  fontDisplayAr.variable,
  fontLatin.variable,
].join(" ");
