#!/bin/bash

# SuiDentity Smart Contract Deployment Script
# This script deploys the SuiDentity contracts to Sui testnet

set -e

echo "🚀 Starting SuiDentity smart contract deployment..."

# Check if sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo "❌ Error: Sui CLI is not installed"
    echo "Install it from: https://docs.sui.io/guides/developer/getting-started/sui-install"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "Move.toml" ]; then
    echo "❌ Error: Move.toml not found. Run this script from the contracts directory."
    exit 1
fi

# Set network (default to testnet)
NETWORK=${1:-testnet}
echo "🌐 Deploying to: $NETWORK"

# Create deployment directory if it doesn't exist
mkdir -p ../deployments

# Build the contracts
echo "🔨 Building contracts..."
sui move build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Deploy to the network
echo "📦 Deploying contracts to $NETWORK..."
DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 --json)

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Deployment successful!"

# Parse deployment output and save important information
PACKAGE_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
ADMIN_CAP_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.objectType | contains("AdminCap")) | .objectId')
QUEST_ADMIN_CAP_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.objectType | contains("QuestAdminCap")) | .objectId')
REWARD_POOL_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.objectType | contains("RewardPool")) | .objectId')
TX_DIGEST=$(echo $DEPLOY_OUTPUT | jq -r '.digest')

echo "📝 Deployment Information:"
echo "   Package ID: $PACKAGE_ID"
echo "   Admin Cap ID: $ADMIN_CAP_ID"
echo "   Quest Admin Cap ID: $QUEST_ADMIN_CAP_ID"
echo "   Reward Pool ID: $REWARD_POOL_ID"
echo "   Transaction: $TX_DIGEST"

# Save deployment info to file
DEPLOYMENT_FILE="../deployments/${NETWORK}-deployment.json"
cat > $DEPLOYMENT_FILE << EOF
{
  "network": "$NETWORK",
  "packageId": "$PACKAGE_ID",
  "adminCapId": "$ADMIN_CAP_ID",
  "questAdminCapId": "$QUEST_ADMIN_CAP_ID",
  "rewardPoolId": "$REWARD_POOL_ID",
  "transactionDigest": "$TX_DIGEST",
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "modules": {
    "identityNft": "${PACKAGE_ID}::identity_nft",
    "questSystem": "${PACKAGE_ID}::quest_system"
  }
}
EOF

echo "💾 Deployment info saved to: $DEPLOYMENT_FILE"

# Update environment file if it exists
ENV_FILE="../.env.local"
if [ -f "$ENV_FILE" ]; then
    echo "🔧 Updating environment variables..."
    
    # Update or add NEXT_PUBLIC_PACKAGE_ID
    if grep -q "NEXT_PUBLIC_PACKAGE_ID=" "$ENV_FILE"; then
        sed -i.bak "s/NEXT_PUBLIC_PACKAGE_ID=.*/NEXT_PUBLIC_PACKAGE_ID=$PACKAGE_ID/" "$ENV_FILE"
    else
        echo "NEXT_PUBLIC_PACKAGE_ID=$PACKAGE_ID" >> "$ENV_FILE"
    fi
    
    echo "✅ Environment variables updated"
fi

# Display next steps
echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Update your frontend configuration with the package ID: $PACKAGE_ID"
echo "2. Fund the reward pool if you plan to use SUI rewards for quests"
echo "3. Create initial quests and achievements through the admin interface"
echo "4. Test the integration with your frontend"
echo ""
echo "View the transaction: https://suiscan.xyz/$NETWORK/tx/$TX_DIGEST"
echo "View the package: https://suiscan.xyz/$NETWORK/object/$PACKAGE_ID"
echo ""