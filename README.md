# SuiDentity

**Next-Generation On-Chain Identity and Reputation Platform**

A comprehensive Web3 identity solution that aggregates cross-platform data, provides AI-driven reputation analysis, and enables dynamic NFT-based digital identity management on the Sui blockchain.

---

## Overview

SuiDentity revolutionizes digital identity by combining blockchain technology, artificial intelligence, and cross-platform data aggregation to create verifiable, dynamic digital identities. Built on Sui blockchain with advanced zkLogin authentication, the platform serves developers, creators, and Web3 professionals seeking to establish and showcase their digital reputation.

**Key Value Propositions:**
- Unified digital identity across multiple platforms
- AI-powered reputation analysis and career insights
- Dynamic NFT identity cards with real-time metadata updates
- Zero-knowledge authentication with OAuth2 integration
- Comprehensive gamification and achievement system

---

## Technical Architecture

### Core Infrastructure

**Blockchain Layer**
- **Network**: Sui Blockchain (Testnet/Mainnet compatible)
- **Smart Contracts**: Move programming language
- **Storage**: Walrus decentralized storage protocol
- **Authentication**: zkLogin with zero-knowledge proofs

**Application Layer**
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **AI Engine**: OpenAI GPT-4o Mini for reputation analysis
- **State Management**: React Query with custom hooks

**Integration Layer**
- **APIs**: GitHub, Twitter, LinkedIn, Discord
- **Blockchain Data**: Direct Sui RPC integration
- **Real-time Updates**: WebSocket connections for live data

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│                 │    │                 │    │                 │
│ • Next.js 15    │────│ • API Routes    │────│ • Sui Network   │
│ • TypeScript    │    │ • Supabase      │    │ • Move Contracts│
│ • Tailwind CSS  │    │ • OpenAI        │    │ • Walrus Storage│
│ • React Query   │    │ • zkLogin       │    │ • zkLogin Auth  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  External APIs  │
                    │                 │
                    │ • GitHub API    │
                    │ • Twitter API   │
                    │ • LinkedIn API  │
                    │ • Discord API   │
                    └─────────────────┘
```

---

## Features & Capabilities

### Authentication System
- **zkLogin Integration**: Combines OAuth2 with zero-knowledge proofs
- **Multi-Provider Support**: Google, GitHub, Twitter authentication
- **Wallet Management**: Automatic Sui wallet address derivation
- **Session Security**: Encrypted session management with JWT tokens

### Reputation Engine
- **Cross-Platform Analysis**: Aggregates data from GitHub, social media, blockchain
- **AI-Powered Insights**: GPT-4o Mini provides detailed career coaching
- **Dynamic Scoring**: 300-850 reputation score with category breakdowns
- **Real-time Updates**: Live blockchain data integration

### NFT Identity System
- **Dynamic Metadata**: NFTs update automatically with reputation changes
- **Multi-format Support**: Images, metadata, and social links
- **Decentralized Storage**: Walrus protocol ensures data permanence
- **Smart Contract Integration**: Move-based contracts for secure operations

### Gamification Platform
- **Quest System**: Progressive challenges with XP rewards
- **Achievement Badges**: Milestone-based recognition system
- **Leaderboards**: Community ranking and competition
- **Social Features**: User tipping and interaction systems

---

## Database Schema

### Core Tables

**users**
```sql
- id (UUID, Primary Key)
- wallet_address (TEXT, Unique)
- username (TEXT, Unique)
- email (TEXT)
- zklogin_sub (TEXT) -- OAuth subject identifier
- oauth_provider (ENUM: 'google', 'github', 'twitter')
- profile_picture (TEXT)
- created_at, updated_at (TIMESTAMP)
```

**social_connections**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key -> users.id)
- platform (ENUM: 'github', 'twitter', 'linkedin', 'discord')
- username (TEXT)
- verified (BOOLEAN)
- profile_data (JSONB)
- verified_at (TIMESTAMP)
```

**reputation_scores**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key -> users.id)
- total_score (INTEGER, 300-850)
- defi_score (INTEGER)
- social_score (INTEGER)
- developer_score (INTEGER)
- ai_analysis (JSONB)
- calculated_at (TIMESTAMP)
```

**identity_nfts**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key -> users.id)
- nft_id (TEXT, Unique)
- object_id (TEXT, Unique)
- metadata_uri (TEXT)
- minted_at (TIMESTAMP)
```

### Extended Schema

**quests & user_quest_progress**
- Progressive challenge system with completion tracking

**badges & user_badges**
- Achievement system with milestone recognition

**tips**
- Social tipping functionality between users

---

## API Documentation

### Authentication Endpoints

**POST /api/auth/exchange-token**
- Exchange OAuth token for zkLogin credentials
- Generates wallet address and session token

**GET /api/auth/github/callback**
- GitHub OAuth callback handler
- Processes authorization codes and user data

### User Management

**POST /api/users/create**
- Creates new user profiles with zkLogin data
- Integrates blockchain data automatically

**GET /api/users/{id}**
- Retrieves complete user profile information
- Includes social connections and reputation data

**GET /api/users/{id}/social-connections**
- Fetches all connected social media accounts
- Returns verification status and profile data

### Reputation Analysis

**POST /api/reputation/analyze**
- Triggers comprehensive reputation analysis
- Includes GitHub activity, blockchain data, and AI insights

**GET /api/blockchain/address/{address}**
- Retrieves live blockchain data for wallet addresses
- Includes balances, NFTs, transaction history, DeFi activity

### AI Coaching

**POST /api/ai/chat**
- AI-powered career coaching and advice
- Context-aware responses based on user profile data
- GPT-4o Mini integration for cost-effective interactions

### NFT Operations

**POST /api/nft/mint**
- Mints dynamic identity NFTs
- Integrates reputation data and social connections
- Uploads metadata to Walrus decentralized storage

---

## Development Setup

### Prerequisites
- Node.js 18+ (Node.js 20+ recommended)
- npm or yarn package manager
- Supabase project with PostgreSQL database
- OpenAI API key
- OAuth application credentials (Google, GitHub, Twitter)

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/your-org/suidentity
cd suidentity
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. **Database Migration**
```bash
# Run migrations in order:
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/migrations/002_zklogin_support.sql
# 3. supabase/migrations/003_fix_user_rls_policies.sql
```

5. **Smart Contract Deployment**
```bash
cd contracts
sui move build
sui client publish --gas-budget 100000000
```

6. **Development Server**
```bash
npm run dev
```

### Environment Variables

**Required Configuration**
```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
JWT_SECRET=your_jwt_secret_32_chars_minimum

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Blockchain
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=your_deployed_contract_id

# Storage
WALRUS_PUBLISHER_URL=https://walrus-testnet-publisher.natsai.xyz
WALRUS_AGGREGATOR_URL=https://walrus-testnet-aggregator.natsai.xyz
```

---

## Deployment

### Production Deployment

**Vercel (Recommended)**
```bash
npm run build
vercel deploy --prod
```

**Docker Deployment**
```bash
docker build -t suidentity .
docker run -p 3000:3000 suidentity
```

### Smart Contract Deployment

**Testnet Deployment**
```bash
cd contracts
sui client publish --gas-budget 100000000 --network testnet
```

**Mainnet Deployment**
```bash
cd contracts
sui client publish --gas-budget 100000000 --network mainnet
```

---

## Monitoring & Analytics

### Health Checks
```bash
# System health
curl https://your-domain.com/api/health

# Database connectivity
curl https://your-domain.com/api/health?check=database

# Blockchain connectivity
curl https://your-domain.com/api/health?check=blockchain

# OAuth providers
curl https://your-domain.com/api/health?check=oauth
```

### Performance Monitoring
- Real-time database query monitoring via Supabase dashboard
- API response time tracking
- Blockchain interaction success rates
- AI service response analytics

---

## Security Considerations

### Data Protection
- All sensitive data encrypted at rest
- OAuth tokens securely stored with JWT
- Row Level Security (RLS) policies on all database tables
- API rate limiting and request validation

### Blockchain Security
- Smart contracts audited for common vulnerabilities
- Multi-signature wallet support for administrative functions
- Testnet validation before mainnet deployment
- Gas optimization for cost-effective operations

### Privacy Compliance
- GDPR-compliant data handling
- User consent management for data collection
- Right to data deletion and export
- Transparent privacy policy and terms of service

---

## Performance Optimizations

### Frontend Optimizations
- Next.js static site generation where applicable
- Image optimization with next/image
- Code splitting and lazy loading
- React Query caching for API calls

### Backend Optimizations
- Database indexing on frequently queried fields
- Connection pooling for database operations
- Caching layer for blockchain data
- Batch processing for reputation calculations

### Blockchain Optimizations
- Gas-efficient Move smart contracts
- Batch transactions where possible
- Off-chain data processing with on-chain verification
- Intelligent caching of blockchain queries

---

## Troubleshooting

### Common Issues

**Build Errors**
- Ensure Node.js version compatibility (18+)
- Clear Next.js cache: `rm -rf .next`
- Verify environment variables are properly set

**Database Connection Issues**
- Check Supabase URL and keys
- Verify Row Level Security policies
- Test connection with `npm run db:test`

**Authentication Problems**
- Verify OAuth application configurations
- Check JWT secret length (minimum 32 characters)
- Ensure callback URLs match OAuth settings

**Blockchain Integration**
- Verify Sui network configuration
- Check wallet connection and gas balance
- Validate smart contract deployment

---

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and test thoroughly
4. Run linting: `npm run lint`
5. Run type checking: `npm run type-check`
6. Submit pull request with detailed description

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration enforced
- Prettier for code formatting
- Comprehensive error handling
- Unit tests for critical functions

### Pull Request Guidelines
- Clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation as needed
- Follow conventional commit messages

---

## Roadmap

### Phase 1: Foundation (Current)
- Core identity and reputation system
- Basic NFT functionality
- zkLogin authentication
- AI-powered insights

### Phase 2: Enhancement
- Advanced gamification features
- Multi-chain support (Ethereum, Polygon)
- Enhanced AI coaching capabilities
- Mobile application development

### Phase 3: Scaling
- Enterprise API access
- White-label solutions
- Advanced analytics dashboard
- Institutional partnerships

---

## License

MIT License - see [LICENSE](LICENSE) file for complete terms.

---

## Support & Community

**Documentation**: [docs.suidentity.com](https://docs.suidentity.com)  
**Discord Community**: [discord.gg/suidentity](https://discord.gg/suidentity)  
**GitHub Issues**: [github.com/your-org/suidentity/issues](https://github.com/your-org/suidentity/issues)  
**Twitter**: [@SuiDentity](https://twitter.com/SuiDentity)

For technical support and partnership inquiries: support@suidentity.com

---

**Built for the future of Web3 identity and reputation systems.**