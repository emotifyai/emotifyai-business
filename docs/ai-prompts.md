# EmotifyAI Prompt System

## Architecture

1. **Language router** (`apps/web/lib/ai/language-router/`) — Arabic normalization before scoring (`arabic-normalize.ts`: diacritics, alef/ya/hamza forms, tatweel, Arabic-Indic digits → Western, NFKC), script frequency, weighted marker signals (dialect hints are extensible, not exhaustive), lead-token boost, confidence scoring.
2. **Prompt library** (`apps/web/lib/ai/prompts/`) — v10.1 base, dialect overlays, top-10 routes, fallbacks.
3. **Product context** (`product-inference.ts`) — infers domain + subject from any paste; no fixed product catalog. Moment maps in v10.1 are examples only.
4. **Composer** — cached system prompt per route + per-request variable layer (tone, platform, generic input→output bridge).
4. **Claude API** — `cache_control: ephemeral` on system prompts only.

## User controls (four)

| Control | Values |
|---------|--------|
| لغة المخرج | `ar_gulf`, `ar_msa`, `en` |
| النبرة | `emotional`, `marketing`, `exclusive` |
| المنصة | `store`, `whatsapp`, `instagram`, `facebook`, `snap`, `tiktok` |
| المدخل | Any language — router detects; output follows user choice |

## Routes

**Top 10:** `ar-gulf`, `ar-msa`, `ar-egyptian`, `ar-levantine`, `en`, `fr`, `es`, `de`, `tr`, `ur`

**Fallbacks:** `fallback-nigerian`, `fallback-mixed`, `fallback-multilingual`

## Extending dialect / language signals

Marker rules in `dialect-patterns.ts` are **hints**, not a complete list of world dialects. Unmatched Arabic still works via script detection + user output language. To add a regional variety:

1. Add weighted regex rules in `language-router/dialect-patterns.ts`
2. Optional overlay in `prompts/dialects/index.ts`
3. Optional dedicated route in `prompts/languages/registry.ts`

## Human-editable source

[`EmotifyAI_Prompt_v10.1_Final.txt`](../EmotifyAI_Prompt_v10.1_Final.txt) — sync changes into `prompts/base/gulf-v10.1.ts` when updating Gulf rules.

## Database

Run migration in `docs/sql/project.sql` for `usage_logs.platform` and `usage_logs.detected_route`.
