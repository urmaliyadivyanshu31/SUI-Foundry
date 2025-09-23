# SuiDentity - AI-Powered On-Chain Identity Platform

## Project Overview
Building an AI-powered on-chain identity and reputation platform on Sui blockchain for the Sui Foundry Hacker House hackathon. Users can aggregate social media data, get AI-calculated reputation scores, and mint dynamic identity NFTs.

## Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Authentication**: Sui zkLogin (OAuth2 + zero-knowledge proofs)
- **Database**: Supabase (PostgreSQL with real-time)
- **Blockchain**: Sui (testnet) + Move smart contracts
- **Storage**: Walrus (decentralized storage for metadata)
- **AI**: OpenAI GPT-4 (reputation analysis)
- **APIs**: Sui RPC (direct blockchain data), GitHub, Twitter

## API Keys & Configuration

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### zkLogin OAuth Providers
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

NEXT_PUBLIC_TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

JWT_SECRET=your_jwt_signing_secret_min_32_chars
```

### OpenAI
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Optional: BlockVision (Enhanced Sui Indexing)
```
BLOCKVISION_API_KEY=your_blockvision_api_key
BLOCKVISION_HTTP_URL=https://sui-testnet.blockvision.org/v1/YOUR_API_KEY
BLOCKVISION_WS_URL=wss://sui-testnet.blockvision.org/v1/YOUR_API_KEY
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

### Users Table (Enhanced for zkLogin)
- id (UUID, PK)
- wallet_address (TEXT, UNIQUE)
- username (TEXT, UNIQUE)
- email (TEXT)
- zklogin_sub (TEXT) - OAuth subject identifier
- oauth_provider ('google' | 'github' | 'twitter')
- salt_value (TEXT) - zkLogin salt for address derivation
- max_epoch (INTEGER) - Maximum epoch for key validity
- ephemeral_public_key (TEXT) - Public key for verification
- jwt_token (TEXT) - Stored JWT token
- profile_picture (TEXT) - OAuth profile picture URL
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

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
1. **zkLogin Authentication**: Sui native OAuth2 + zero-knowledge proofs
2. **Real Blockchain Data**: Direct Sui RPC integration for live data
3. **AI Reputation**: OpenAI analysis of real onchain/offchain behavior  
4. **Dynamic NFTs**: Sui Move contracts with updatable metadata
5. **Gamification**: Quests, XP, badges, leaderboards, tipping
6. **Decentralized Storage**: Walrus for metadata, avatars, badge images

### New Tables (zkLogin Migration)
- **zklogin_sessions** - Session management
- **oauth_provider_data** - OAuth provider information  
- **wallet_transactions** - Real blockchain transaction history
- **user_nfts** - Real NFT ownership tracking
- **defi_interactions** - DeFi protocol interaction history
- **wallet_balances** - Real-time balance tracking

## Development Commands
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # ESLint checking
npm run type-check  # TypeScript checking
npm run db:test     # Test database connection
npm run setup:check # Check complete setup status

# Health Checks
curl http://localhost:3000/api/health                    # Overall health
curl http://localhost:3000/api/health?check=database     # Database only  
curl http://localhost:3000/api/health?check=blockchain   # Sui network only
curl http://localhost:3000/api/health?check=oauth        # OAuth providers
curl http://localhost:3000/api/health?check=environment  # Environment vars
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