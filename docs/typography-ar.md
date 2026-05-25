# Arabic typography (web app)

**Pairing:** Cairo (headings, 600–700) + IBM Plex Sans Arabic (body/UI, 400–500).

Cairo gives headings a balanced, slightly rounded warmth suited to Gulf e-commerce marketing without looking toy-like. IBM Plex Sans Arabic keeps UI and long product copy crisp and familiar—modern MENA SaaS tone, readable at small sizes.

Latin mixed content uses Inter via `--font-latin` on `html[lang="ar"]` blocks marked `lang="en"` or `dir="ltr"`.

Fonts load through `next/font/google` in `apps/web/app/layout.tsx` (swap + preload). CSS variables live in `packages/ui/styles/globals.css` and apply under `html[lang="ar"]` so the browser extension app (separate styles) is unaffected.
