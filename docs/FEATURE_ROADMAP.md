# EmotifAI Platform - Feature Roadmap

## Planned Features (Linked to "Unused" Hooks)

### 🔑 API Key Management (`use-api-keys.ts`)
**Status**: Not yet implemented  
**Priority**: Medium  
**Description**: Allow users to bring their own Anthropic API keys for cost control

**Implementation Plan**:
- Backend: `/api/keys` endpoints for CRUD operations
- Frontend: API key management UI in dashboard
- Security: Encrypted storage of API keys
- Validation: Test keys before saving

---

### 🔐 Auth State Management (`use-auth.ts`)
**Status**: Not yet implemented  
**Priority**: HIGH  
**Description**: Real-time auth state synchronization across browser tabs

**Implementation Plan**:
- Use Supabase realtime subscriptions
- Sync logout across all tabs
- Handle session expiration gracefully
- Show auth status in UI

---

### ⚡ Streaming Enhancement (`use-enhancement.ts`) 
**Status**: Not yet implemented  
**Priority**: LOW
**Description**: Stream AI responses for better UX with long texts

**Implementation Plan**:
- Backend: Server-Sent Events (SSE) for streaming
- Frontend: Real-time text updates as AI generates
- UI: Progress indicator showing generation
- Optimization: Chunk-based rendering

---

### 💳 Subscription Management UI (`use-subscription.ts`)
**Status**: Not yet implemented  
**Priority**: High  
**Description**: In-app subscription management and plan upgrades

**Implementation Plan**:
- Dashboard: Current plan display
- Upgrade/downgrade flows
- Payment method management
- Billing history view
- Integration with Lemon Squeezy customer portal

---

### 📊 Usage Analytics Dashboard (`use-usage.ts`)
**Status**: Not yet implemented  
**Priority**: Medium  
**Description**: Detailed usage statistics and insights

**Implementation Plan**:
- Charts: Daily/weekly/monthly usage trends
- Metrics: Tokens used, cost estimates, popular features
- Exports: CSV download of usage data
- Alerts: Notify when approaching limits