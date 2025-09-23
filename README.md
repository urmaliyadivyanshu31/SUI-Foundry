# SuiDentity 🔮

**AI-Powered On-Chain Identity & Reputation Platform on Sui Blockchain**

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Sui](https://img.shields.io/badge/Sui-Blockchain-6fbcf0) ![AI](https://img.shields.io/badge/AI-OpenAI-green)

> Built for the Sui Foundry Hacker House hackathon. Aggregate social media data, get AI-calculated reputation scores, and mint dynamic identity NFTs on Sui blockchain.

## ✨ Key Features

- 🔐 **zkLogin Authentication** - Sui native OAuth2 + zero-knowledge proofs
- 🧠 **AI Reputation Analysis** - OpenAI-powered scoring based on real blockchain & social data
- 🎨 **Dynamic Identity NFTs** - Sui Move contracts with updatable metadata
- 📊 **Real Blockchain Data** - Direct Sui RPC integration for live transaction analysis
- 🎮 **Gamification** - Quests, XP, badges, leaderboards, and tipping
- 🌐 **Decentralized Storage** - Walrus for metadata and badge images

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| **Authentication** | Sui zkLogin (OAuth2 + ZK proofs) |
| **Database** | Supabase (PostgreSQL with real-time) |
| **Blockchain** | Sui testnet + Move smart contracts |
| **Storage** | Walrus (decentralized storage) |
| **AI** | OpenAI GPT-4 |
| **APIs** | Sui RPC, GitHub, Twitter |

## 📁 Project Structure

```
suidentity/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # User dashboard
│   └── profile/                  # Profile setup
├── components/                   # React components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── features/                 # Feature-specific components
│   │   ├── auth/                 # Authentication components
│   │   ├── reputation/           # Reputation & scoring
│   │   ├── nft/                  # NFT-related components
│   │   ├── wallet/               # Wallet interactions
│   │   └── gamification/         # Quests, achievements
│   └── layout/                   # Layout components
├── lib/                          # Utilities & services
│   ├── core/                     # Core utilities (sui, supabase, utils)
│   ├── auth/                     # Authentication (zklogin, enoki)
│   ├── ai/                       # AI services (openai, reputation)
│   ├── blockchain/               # Blockchain utils (contracts, walrus)
│   └── db/                       # Database functions
├── hooks/                        # React hooks
├── types/                        # TypeScript types
├── contracts/                    # Sui Move smart contracts
├── supabase/                     # Database migrations
└── scripts/                      # Development & deployment scripts
    ├── dev/                      # Development scripts
    ├── deployment/               # Deployment scripts
    └── migrations/               # Migration utilities
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd suidentity

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
```

### 2. Configure Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# zkLogin OAuth Providers
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
JWT_SECRET=your_jwt_signing_secret_min_32_chars

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=

# Walrus Storage
WALRUS_PUBLISHER_URL=https://walrus-testnet-publisher.natsai.xyz
WALRUS_AGGREGATOR_URL=https://walrus-testnet-aggregator.natsai.xyz

# Optional: BlockVision (Enhanced Sui Indexing)
BLOCKVISION_API_KEY=your_blockvision_api_key
BLOCKVISION_HTTP_URL=https://sui-testnet.blockvision.org/v1/YOUR_API_KEY
BLOCKVISION_WS_URL=wss://sui-testnet.blockvision.org/v1/YOUR_API_KEY
```

### 3. Database Setup

1. Create a Supabase project
2. Run the migration files in `supabase/migrations/` in order:
   - `001_initial_schema.sql`
   - `002_zklogin_support.sql` 
   - `003_fix_user_rls_policies.sql`

### 4. Smart Contract Deployment

```bash
cd contracts
./scripts/deploy.sh testnet
```

### 5. Development

```bash
# Start development server
npm run dev

# Test database connection
npm run db:test

# Check setup status
npm run setup:check

# Run TypeScript checking
npm run type-check

# Build for production
npm run build
```

## 🗄️ Database Schema

### Core Tables

- **`users`** - User profiles with zkLogin integration
- **`social_connections`** - Connected social media accounts
- **`reputation_scores`** - AI-calculated reputation metrics
- **`identity_nfts`** - Minted identity NFT records
- **`zklogin_sessions`** - zkLogin session management
- **`wallet_transactions`** - Real blockchain transaction history
- **`user_nfts`** - NFT ownership tracking
- **`defi_interactions`** - DeFi protocol interaction history
- **`wallet_balances`** - Real-time balance tracking

## 🎯 Core Features

### zkLogin Authentication
- OAuth2 integration with Google, GitHub, Twitter
- Zero-knowledge proof generation
- Sui wallet address derivation
- Session management

### AI Reputation System
- Real-time blockchain data analysis
- Social media activity scoring
- GitHub contribution analysis
- GPT-4 powered insights
- Dynamic score calculation (300-850 range)

### Dynamic NFTs
- Identity NFTs with updatable metadata
- Real-time reputation integration
- Walrus decentralized storage
- Quest-based achievements

### Gamification
- Quest system with XP rewards
- Achievement badges
- Leaderboards
- User tipping functionality

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript checking

# Database
npm run db:test          # Test database connection
npm run setup:check     # Check complete setup status

# Health Checks
curl http://localhost:3000/api/health                    # Overall health
curl http://localhost:3000/api/health?check=database     # Database only  
curl http://localhost:3000/api/health?check=blockchain   # Sui network only
curl http://localhost:3000/api/health?check=oauth        # OAuth providers
curl http://localhost:3000/api/health?check=environment  # Environment vars
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/exchange-token` - Exchange OAuth token for zkLogin
- `GET /api/auth/github/callback` - GitHub OAuth callback

### Reputation
- `POST /api/reputation/analyze` - Analyze user reputation
- `POST /api/reputation/batch` - Batch reputation analysis

### NFTs
- `POST /api/nft` - Mint identity NFT
- `GET /api/nft/compatibility` - Check backend compatibility

### Utilities  
- `GET /api/health` - System health check
- `GET /api/setup/status` - Setup status check

## 🚨 Important Notes

- **Testnet Only**: All blockchain operations use Sui testnet during development
- **Public Storage**: Walrus data is publicly accessible - never store sensitive information
- **Rate Limits**: BlockVision free tier has 30 calls limit - cache aggressively  
- **Environment**: Ensure all required environment variables are set before running

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for the Sui Foundry Hacker House**