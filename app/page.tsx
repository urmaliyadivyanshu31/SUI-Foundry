'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitHubConnectionCard } from '@/components/ui/github-connection-card'
import { ReputationDashboard } from '@/components/ui/reputation-dashboard'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Wallet, Users, Zap, Trophy, Github, Twitter, Linkedin, Settings, Coins } from 'lucide-react'
import { WalletStatus, WalletBadge } from '@/components/ui/wallet-status'
import { TransactionButton } from '@/components/ui/transaction-button'
import { useSuiWallet } from '@/hooks/useSuiWallet'

export default function HomePage() {
  const router = useRouter()
  const { login, logout, user, authenticated, ready } = usePrivy()
  const { profile, needsOnboarding, profileCompletion, socialConnections, isLoading, refreshProfile } = useUserProfile()
  const { address, balance, isLoadingBalance } = useSuiWallet()

  // Redirect to onboarding if needed
  useEffect(() => {
    if (authenticated && profile && needsOnboarding) {
      router.push('/profile/setup')
    }
  }, [authenticated, profile, needsOnboarding, router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <main className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-6">
              SuiDentity
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              AI-Powered On-Chain Identity & Reputation Platform
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Build your Web3 reputation with AI-powered identity scoring, social verification, 
              and dynamic NFTs on Sui blockchain. Connect your social accounts, earn reputation, 
              and mint your digital identity.
            </p>
            
            <Button 
              onClick={login} 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-full mb-16"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect & Build Your Identity
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Social Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Connect GitHub, Twitter, LinkedIn and prove ownership of your social accounts
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>AI Reputation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get AI-calculated reputation scores (300-850) based on your Web3 and social activity
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <Trophy className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Dynamic NFTs</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Mint identity NFTs that evolve with your reputation and achievements
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold mb-6">Powered by Cutting-Edge Tech</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2">Sui Blockchain</Badge>
                <Badge variant="secondary" className="px-4 py-2">OpenAI GPT-4</Badge>
                <Badge variant="secondary" className="px-4 py-2">Walrus Storage</Badge>
                <Badge variant="secondary" className="px-4 py-2">Privy Auth</Badge>
                <Badge variant="secondary" className="px-4 py-2">Supabase</Badge>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show loading state while profile loads
  if (authenticated && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Authenticated user dashboard
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              SuiDentity
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {address && <WalletBadge />}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/profile/setup')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Avatar>
              <AvatarFallback>
                {profile?.username?.[0]?.toUpperCase() || 
                 user?.google?.name?.[0] || 
                 user?.twitter?.name?.[0] || 
                 user?.email?.address?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome, {profile?.username || user?.google?.name || user?.twitter?.name || 'Anonymous'}!
          </h2>
          <p className="text-muted-foreground mb-4">
            Build your Web3 identity and reputation on Sui blockchain
          </p>
          
          {/* Profile Completion Bar */}
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="w-full" />
            {profileCompletion < 100 && (
              <p className="text-xs text-muted-foreground mt-2">
                Complete your profile to improve your reputation score
              </p>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="reputation">Reputation</TabsTrigger>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
            <TabsTrigger value="quests">Quests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingBalance ? '...' : (balance?.sui?.toFixed(4) || '0.0000')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    SUI on {process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">350</div>
                  <p className="text-xs text-muted-foreground">
                    +12 from last calculation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Social Connections</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{socialConnections.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {socialConnections.length === 0 ? 'Connect accounts to build reputation' : 
                     socialConnections.length < 3 ? 'Connect more to increase score' : 
                     'Great social presence!'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">NFTs Minted</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Mint your first identity NFT
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started by connecting your social accounts and minting your identity NFT
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="w-full" variant="outline">
                    <Github className="mr-2 h-4 w-4" />
                    Connect GitHub
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Twitter className="mr-2 h-4 w-4" />
                    Connect Twitter
                  </Button>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Calculate Reputation Score
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WalletStatus showBalance showNetwork />
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your Sui blockchain assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TransactionButton variant="default" className="w-full" />
                  
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Wallet Features</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Wallet className="w-4 h-4 mr-2" />
                        Embedded wallet powered by Privy
                      </div>
                      <div className="flex items-center">
                        <Coins className="w-4 h-4 mr-2" />
                        Ed25519 signature scheme
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        Auto-created on login
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Your recent Sui blockchain transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm mt-2">
                    Send your first SUI transaction to see it here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Social Media Connections</h3>
                <p className="text-muted-foreground">
                  Connect your social media accounts to increase your reputation score
                </p>
              </div>

              {/* GitHub Connection Card */}
              <GitHubConnectionCard
                userId={profile?.id || ''}
                socialConnections={socialConnections}
                onConnectionUpdate={refreshProfile}
              />

              {/* Other Social Connections */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Twitter className="h-8 w-8" />
                    <div>
                      <p className="font-medium">Twitter/X</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.twitter ? `Connected as ${user.twitter.name || 'Twitter User'}` : 'Connect your social presence'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={user?.twitter ? "secondary" : "outline"}>
                    {user?.twitter ? "Connected" : "Available in Privy"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                  <div className="flex items-center space-x-4">
                    <Linkedin className="h-8 w-8" />
                    <div>
                      <p className="font-medium">LinkedIn</p>
                      <p className="text-sm text-muted-foreground">Coming soon in next update</p>
                    </div>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reputation" className="space-y-6">
            <ReputationDashboard userId={profile?.id || ''} />
          </TabsContent>

          <TabsContent value="nfts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identity NFTs</CardTitle>
                <CardDescription>
                  Dynamic NFTs that represent your Web3 identity and evolve with your reputation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-8">
                    You haven&apos;t minted any identity NFTs yet
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Mint Your First Identity NFT
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quests & Achievements</CardTitle>
                <CardDescription>
                  Complete quests to earn XP and badges while building your reputation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">First Steps</h4>
                    <Badge variant="secondary">50 XP</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Complete your profile setup</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Social Butterfly</h4>
                    <Badge variant="secondary">100 XP</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Connect 3 social media accounts</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
