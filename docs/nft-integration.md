# NFT Integration Guide

## Overview

SuiDentity now includes comprehensive NFT minting functionality that works with both the local smart contracts and can be integrated with your existing NFT backend repository.

## Current Implementation

### 🎨 UI Components Created
- **NFTMintingDialog**: Complete minting flow with preview and status tracking
- **NFTDisplay**: Grid view of user's Identity NFTs with detailed stats
- **NFTMintingCard**: Call-to-action card for first-time minting
- **NFTSummary**: Compact display for overview sections

### 🔗 Smart Contract Integration
- **Move Contracts**: Full Identity NFT and Quest system contracts in `/contracts/`
- **TypeScript Client**: Complete smart contract interaction layer
- **Transaction Signing**: Integrated with Privy wallet signing
- **Database Storage**: NFT records stored in Supabase for quick access

### 📊 Features Implemented
- Dynamic NFT metadata based on reputation scores
- Social connection tracking within NFTs
- Badge system for achievements
- Level calculation based on reputation
- Real-time reputation updates
- Explorer integration for viewing NFTs

## Integration with Existing Backend

### Repository Structure Compatibility
```
sui-reputation-NFT/          # Your existing repo
├── backend/                 # Your backend services
├── smart-contracts/         # Your Move contracts
└── api/                     # Your API endpoints

suidentity/                  # This platform
├── contracts/               # Our Move contracts
├── lib/smart-contracts.ts   # Integration layer
├── components/ui/nft-*.tsx  # UI components
└── docs/                    # This guide
```

### Integration Options

#### Option 1: Use Existing Backend (Recommended)
1. **Update Package ID**: Point to your deployed contracts
   ```typescript
   // In .env.local
   NEXT_PUBLIC_PACKAGE_ID=your_deployed_package_id
   ```

2. **Adapt Contract Interface**: Modify `lib/smart-contracts.ts` to match your contract methods
   ```typescript
   // Update function names and parameters to match your contracts
   mintIdentityNFT() // -> your_mint_function()
   updateReputation() // -> your_update_function()
   ```

3. **API Integration**: Connect to your existing API endpoints
   ```typescript
   // Replace direct contract calls with API calls where needed
   const result = await fetch('/api/your-nft-endpoint', {
     method: 'POST',
     body: JSON.stringify(nftData)
   })
   ```

#### Option 2: Hybrid Approach
- Use your backend for complex operations
- Use our UI components and user experience
- Maintain compatibility with both systems

#### Option 3: Merge Implementation
- Combine the best features from both
- Use our contract structure with your optimizations
- Integrate our UI with your backend services

### Key Integration Points

#### 1. Contract Methods Mapping
```typescript
// Your contract -> Our interface
your_mint_nft() -> mintIdentityNFT()
your_update_reputation() -> updateNFTReputation()
your_add_social() -> addSocialConnection()
your_award_badge() -> awardBadge()
```

#### 2. Data Structure Compatibility
```typescript
// Ensure your NFT data matches our interface
interface IdentityNFTData {
  id: string
  owner: string
  name: string
  reputationScore: number
  level: number
  // ... other fields
}
```

#### 3. Event Handling
```typescript
// Map your contract events to our event handlers
NFTMinted -> onNFTMinted()
ReputationUpdated -> onReputationUpdated()
```

## API Endpoints to Implement

### Required Endpoints
```typescript
// NFT Operations
POST /api/nft/mint          # Mint new Identity NFT
PUT  /api/nft/:id/reputation # Update reputation scores
POST /api/nft/:id/social    # Add social connection
POST /api/nft/:id/badge     # Award badge

// Data Retrieval
GET  /api/nft/user/:address # Get user's NFTs
GET  /api/nft/:id          # Get specific NFT data
GET  /api/nft/:id/metadata # Get NFT metadata
```

### Optional Endpoints
```typescript
// Advanced Features
GET  /api/nft/leaderboard   # Top reputation holders
GET  /api/nft/stats         # Platform statistics
POST /api/nft/:id/transfer  # NFT transfers
```

## Environment Configuration

### Step 1: Copy Environment Template
```bash
# Copy the environment template
cp .env.local.example .env.local
```

### Step 2: Configure Your Existing Backend Integration
```bash
# Required - Existing NFT Backend Integration
NEXT_PUBLIC_NFT_BACKEND_URL=https://your-existing-backend.com/api
NFT_BACKEND_API_KEY=your_existing_backend_api_key
NEXT_PUBLIC_EXISTING_PACKAGE_ID=your_existing_contract_package_id

# Required - Supabase for local data caching
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Required - Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Blockchain Configuration
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=your_local_package_id_for_fallback
```

### Step 3: Backend Compatibility Check
The platform will automatically detect and adapt to your existing backend:

```typescript
// Example API endpoint mapping for your backend
GET  /api/nft/owner/{address}     -> Your backend NFT listing
POST /api/nft/mint                -> Your backend minting endpoint
PUT  /api/nft/{id}/reputation     -> Your backend reputation update
GET  /api/health                  -> Your backend health check
```

## Testing Strategy

### 1. Contract Testing
```bash
# Test your contracts with our interface
cd contracts
sui move test

# Test integration
npm run test:nft
```

### 2. UI Testing
```bash
# Test components with mock data
npm run test:components

# Test full integration
npm run test:integration
```

### 3. E2E Testing
```bash
# Test complete NFT flow
npm run test:e2e
```

## Migration Steps

### Phase 1: Assessment
1. Compare contract structures
2. Identify API differences  
3. Plan data migration if needed

### Phase 2: Integration
1. Update package ID configuration
2. Adapt contract interface layer
3. Test basic NFT operations

### Phase 3: Advanced Features
1. Integrate reputation updates
2. Connect social verification
3. Enable badge system

### Phase 4: Production
1. Deploy combined system
2. Migrate existing data
3. Monitor and optimize

## Troubleshooting

### Common Issues
1. **Contract Method Not Found**: Update method names in `smart-contracts.ts`
2. **Data Format Mismatch**: Adjust interfaces to match your data structure
3. **Network Mismatch**: Ensure both systems use same Sui network

### Debug Tools
- Check browser console for detailed error messages
- Use Sui Explorer to verify transactions
- Monitor API calls in Network tab

## Support

For integration assistance:
1. Review your contract structure in the existing repo
2. Compare with our implementation
3. Update configuration accordingly
4. Test incrementally

The implementation is designed to be flexible and can adapt to your existing backend while providing a modern, user-friendly frontend experience.