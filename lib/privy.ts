import { PrivyClientConfig } from '@privy-io/react-auth'

export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  config: {
    // Appearance
    appearance: {
      theme: 'dark' as const,
      accentColor: '#8B5CF6',
      logo: '/logo.png',
      showWalletLoginFirst: false,
    },
    // Login methods
    loginMethods: ['email', 'google', 'twitter', 'github', 'discord'],
    // Embedded wallet configuration for Sui
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      noPromptOnSignature: false,
    },
    // Legal and branding
    legal: {
      termsAndConditionsUrl: '/terms',
      privacyPolicyUrl: '/privacy',
    },
    // Additional UI customization
    mfa: {
      noPromptOnMfaRequired: false,
    },
  },
}

// Sui network configuration for embedded wallets
export const suiChainConfig = {
  id: 'sui:testnet',
  name: 'Sui Testnet',
  network: 'testnet',
  nativeCurrency: {
    decimals: 9,
    name: 'Sui',
    symbol: 'SUI',
  },
  rpcUrls: {
    default: {
      http: ['https://fullnode.testnet.sui.io:443'],
    },
    public: {
      http: ['https://fullnode.testnet.sui.io:443'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SuiVision',
      url: 'https://testnet.suivision.xyz',
    },
  },
  testnet: true,
}