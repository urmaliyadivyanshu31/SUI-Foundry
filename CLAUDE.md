# SuiDentity - AI-Powered On-Chain Identity Platform

## Project Overview
Building an AI-powered on-chain identity and reputation platform on Sui blockchain for the Sui Foundry Hacker House hackathon. Users can aggregate social media data, get AI-calculated reputation scores, and mint dynamic identity NFTs.

## Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Authentication**: Privy (social login + embedded Sui wallets)
- **Database**: Supabase (PostgreSQL with real-time)
- **Blockchain**: Sui (testnet) + Move smart contracts
- **Storage**: Walrus (decentralized storage for metadata)
- **AI**: OpenAI GPT-4 (reputation analysis)
- **APIs**: BlockVision (Sui indexing), GitHub, Twitter

## API Keys & Configuration

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Privy
```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
```

### OpenAI
```
OPENAI_API_KEY=your_openai_api_key_here
```

### BlockVision (Sui Indexing)
```
BLOCKVISION_API_KEY=your_blockvision_api_key
BLOCKVISION_HTTP_URL=https://sui-mainnet.blockvision.org/v1/YOUR_API_KEY
BLOCKVISION_WS_URL=wss://sui-mainnet.blockvision.org/v1/YOUR_API_KEY
```

### Sui Network
```
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=
```

### Walrus Storage
```
WALRUS_PUBLISHER_URL=https://walrus-testnet-publisher.natsai.xyz
WALRUS_AGGREGATOR_URL=https://walrus-testnet-aggregator.natsai.xyz
```

## Database Schema

### Users Table
- id (UUID, PK)
- wallet_address (TEXT, UNIQUE)
- username (TEXT, UNIQUE)
- email (TEXT)
- created_at (TIMESTAMP)

### Social Connections Table
- id (UUID, PK)
- user_id (UUID, FK)
- platform (TEXT) - 'github', 'twitter', 'linkedin'
- username (TEXT)
- verified (BOOLEAN)
- profile_data (JSONB)
- verified_at (TIMESTAMP)

### Reputation Scores Table
- id (UUID, PK)
- user_id (UUID, FK)
- total_score (INTEGER, 300-850)
- defi_score (INTEGER)
- social_score (INTEGER)
- developer_score (INTEGER)
- ai_analysis (JSONB)
- calculated_at (TIMESTAMP)

### Identity NFTs Table
- id (UUID, PK)
- user_id (UUID, FK)
- nft_id (TEXT, UNIQUE)
- metadata_uri (TEXT)
- minted_at (TIMESTAMP)

## Core Features
1. **Social Authentication**: Privy social login + embedded Sui wallets
2. **Social Verification**: GitHub OAuth, Twitter/X API verification
3. **AI Reputation**: OpenAI analysis of social/blockchain behavior
4. **Dynamic NFTs**: Sui Move contracts with updatable metadata
5. **Gamification**: Quests, XP, badges, leaderboards, tipping
6. **Decentralized Storage**: Walrus for metadata, avatars, badge images

## Development Commands
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # ESLint checking
npm run type-check  # TypeScript checking
npm run db:test     # Test database connection
npm run setup:check # Check complete setup status
```

## Quick Setup Guide

1. **Environment Setup:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual values
   ```

2. **Database Setup:**
   - Create Supabase project
   - Run the SQL migration: `supabase/migrations/001_initial_schema.sql`
   - Test connection: `npm run db:test`

3. **Development:**
   ```bash
   npm run dev
   ```

## Setup Status Check

The app now provides clear error messages for setup issues:
- ✅ Hydration mismatches fixed
- ✅ SVG DOM properties corrected  
- ✅ Database connection errors improved
- ✅ Environment variable validation added
- ✅ Database status checker implemented
- ✅ Sui transaction signing implementation completed
- ✅ Move smart contracts created (Identity NFTs + Quest System)

## Smart Contract Deployment

Deploy the contracts to Sui testnet:
```bash
cd contracts
./scripts/deploy.sh testnet
```

The deployment script will:
- Build and deploy the Move contracts
- Update environment variables
- Save deployment info to `deployments/` directory

## Project Structure
```
suidentity/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── api/            # API routes
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── custom/         # Custom components
├── lib/                # Utilities
│   ├── supabase.ts     # Supabase client
│   ├── privy.ts        # Privy configuration
│   ├── openai.ts       # OpenAI client
│   └── sui.ts          # Sui blockchain utils
├── types/              # TypeScript types
├── supabase/           # Database migrations
└── public/             # Static assets
```

## Important Notes
- All Walrus data is publicly accessible - never store sensitive info
- Privy supports embedded wallets for Sui (no external wallet connections)
- BlockVision free tier: 30 calls limit, cache aggressively
- Use testnet for all blockchain operations during development
- Enable MCP servers for enhanced development experience

## GitHub Token
*To be provided later for social verification*