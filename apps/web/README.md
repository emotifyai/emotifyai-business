# EmotifyAI Web Application

AI-powered text enhancement platform built with Next.js 16, Supabase, and Claude 3.5 Sonnet.

## Features

- 🔐 **Secure Authentication** - Supabase Auth with OAuth support (Google, GitHub)
- 💳 **Subscription Management** - Lemon Squeezy integration with trial, monthly, and lifetime tiers
- 🤖 **AI Text Enhancement** - Claude 3.5 Sonnet for intelligent text rewriting
- 🌍 **Multi-language Support** - English, Arabic, and French
- 📊 **Usage Tracking** - Real-time usage analytics and limits enforcement
- 🎨 **Modern UI** - Tailwind CSS v4 with custom branding
- 🔒 **Security First** - Row Level Security, API key authentication, webhook verification

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS v4
- **Auth**: Supabase (@supabase/ssr)
- **Database**: PostgreSQL (Supabase)
- **Billing**: Lemon Squeezy
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **Testing**: Vitest + React Testing Library
- **Package Manager**: Bun

## Getting Started

### Prerequisites

- Bun v1.2.21 or later
- Node.js 20+ (for compatibility)
- Supabase account (or local Supabase instance)
- Lemon Squeezy account (for billing)
- Anthropic API key (for Claude)

### Installation

1. **Clone the repository and navigate to the web app**:
   ```bash
   cd apps/web
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and fill in your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `LEMONSQUEEZY_API_KEY` - Your Lemon Squeezy API key
   - `LEMONSQUEEZY_WEBHOOK_SECRET` - Your webhook secret
   - `ANTHROPIC_API_KEY` - Your Anthropic API key

4. **Set up the database**:
   
   Run the migration in your Supabase project:
   ```bash
   # Using Supabase CLI
   supabase db push

   # Or manually run the SQL in Supabase dashboard
   # File: supabase/migrations/001_initial_schema.sql
   ```

5. **Run the development server**:
   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development with Mock Data

For development without API costs, enable mock mode:

```bash
# In .env.local
MOCK_AI_RESPONSES=true
```

This will use mock AI responses instead of calling the Claude API.

## Project Structure

```
apps/web/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   │   ├── enhance/         # Text enhancement endpoint
│   │   └── webhooks/        # Webhook handlers
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard components
│   ├── layout/             # Layout components
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility libraries
│   ├── supabase/          # Supabase clients and middleware
│   ├── lemonsqueezy/      # Lemon Squeezy integration
│   ├── ai/                # AI service layer
│   └── subscription/      # Subscription logic
├── types/                  # TypeScript type definitions
├── supabase/              # Database migrations
└── __tests__/             # Test files
```

## API Endpoints

### POST /api/enhance

Enhance text using AI.

**Authentication**: Required (Supabase session or API key)

**Request**:
```json
{
  "text": "make this better",
  "mode": "enhance",
  "language": "en",
  "tone": "professional"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "enhancedText": "Please improve this text.",
    "tokensUsed": 42,
    "language": "en"
  }
}
```

### POST /api/webhooks/lemonsqueezy

Webhook endpoint for Lemon Squeezy subscription events.

**Authentication**: Signature verification

## Testing

Run tests:
```bash
bun test
```

Run tests with UI:
```bash
bun test:ui
```

Generate coverage report:
```bash
bun test:coverage
```

## Database Schema

The application uses the following main tables:

- **profiles** - User profiles (extends auth.users)
- **subscriptions** - Subscription data synced from Lemon Squeezy
- **usage_logs** - AI enhancement request logs
- **api_keys** - API keys for extension authentication

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

## Environment Variables

See `.env.local.example` for a complete list of environment variables.

### Required Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `LEMONSQUEEZY_API_KEY` - Lemon Squeezy API key
- `LEMONSQUEEZY_WEBHOOK_SECRET` - Webhook signing secret
- `ANTHROPIC_API_KEY` - Anthropic API key

### Optional Variables

- `SUPABASE_SERVICE_ROLE_KEY` - For admin operations
- `MOCK_AI_RESPONSES` - Use mock AI responses (development)
- `DEBUG` - Enable debug logging

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Self-Hosting

1. Build the application:
   ```bash
   bun run build
   ```

2. Start the production server:
   ```bash
   bun start
   ```

## Security

- All API routes require authentication
- Row Level Security (RLS) enabled on all database tables
- Webhook signatures verified
- API keys hashed before storage
- Security headers configured in Next.js config

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions, please open an issue on GitHub.
