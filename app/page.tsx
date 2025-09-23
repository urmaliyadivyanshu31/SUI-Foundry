'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitHubConnectionCard } from '@/components/ui/github-connection-card'
import { ReputationDashboard } from '@/components/ui/reputation-dashboard'
import { NFTMintingCard, NFTMintingDialog } from '@/components/ui/nft-minting'
import { NFTDisplay, NFTSummary } from '@/components/ui/nft-display'
import { QuestSystem, QuestProgress } from '@/components/ui/quest-system'
import { Achievements, AchievementsSummary } from '@/components/ui/achievements'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wallet, Users, Zap, Trophy, Github, Twitter, Linkedin, Settings, Coins, Shield, Network, Globe as GlobeIcon, Brain, Sparkles } from 'lucide-react'
import { WalletStatus, WalletBadge } from '@/components/ui/wallet-status'
import { TransactionButton } from '@/components/ui/transaction-button'
import { useSuiWallet } from '@/hooks/useSuiWallet'
import { CustomLoader } from '@/components/ui/custom-loader'
import { Globe } from '@/components/ui/globe'

// Custom Logo Component
const LogoIcon = () => (
  <div style={{
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #cbb0ff 0%, #9333ea 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(203, 176, 255, 0.3)'
  }}>
    <div style={{
      width: '16px',
      height: '16px',
      background: 'linear-gradient(45deg, #ffffff 0%, #cbb0ff 100%)',
      borderRadius: '4px',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '2px',
        left: '2px',
        width: '12px',
        height: '12px',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '2px'
      }} />
    </div>
  </div>
)

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
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CustomLoader size={40} color="#cbb0ff" />
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: 'white', position: 'relative' }}>
        {/* Floating Navigation Bar */}
        <nav style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          width: '100%',
          maxWidth: '1200px',
          padding: '0 24px'
        }}>
          <div style={{
            backgroundColor: 'rgba(20, 20, 24, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(203, 176, 255, 0.1)',
            borderRadius: '16px',
            padding: '12px 24px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* Left - Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <LogoIcon />
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #ffffff 0%, #cbb0ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>SuiDentity</span>
              </div>
              
              {/* Center - Navigation Links */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <a 
                  href="#" 
                  style={{
                    color: '#9ca3af',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '8px 12px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af'
                  }}
                >
                  WHY SUIDENTITY
                </a>
                <span style={{ color: '#4b5563', fontSize: '10px' }}>·</span>
                <a 
                  href="#" 
                  style={{
                    color: '#9ca3af',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '8px 12px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af'
                  }}
                >
                  HOW IT WORKS
                </a>
                <span style={{ color: '#4b5563', fontSize: '10px' }}>·</span>
                <a 
                  href="#" 
                  style={{
                    color: '#9ca3af',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '8px 12px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af'
                  }}
                >
                  USE CASES
                </a>
                <span style={{ color: '#4b5563', fontSize: '10px' }}>·</span>
                <a 
                  href="#" 
                  style={{
                    color: '#9ca3af',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '8px 12px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af'
                  }}
                >
                  BUILD
                </a>
              </div>
              
              {/* Right - CTA Button */}
              <div>
                <button 
                  onClick={login}
                  style={{
                    background: 'linear-gradient(135deg, #cbb0ff 0%, #9333ea 100%)',
                    color: 'white',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: '600',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 0 20px rgba(203, 176, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 30px rgba(203, 176, 255, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(203, 176, 255, 0.3)'
                  }}
                >
                  GET STARTED →
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Hero Section with Globe */}
        <div style={{ 
          paddingTop: '120px',
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* Background gradient */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'radial-gradient(ellipse at center top, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          
          {/* Content Container */}
          <div style={{
            maxWidth: '1200px',
            width: '100%',
            padding: '0 24px',
            position: 'relative',
            zIndex: 10
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px',
              alignItems: 'center'
            }}>
              {/* Left - Text Content */}
              <div>
                <h1 style={{
                  fontSize: '56px',
                  fontWeight: '700',
                  lineHeight: '1.1',
                  marginBottom: '24px',
                  background: 'linear-gradient(180deg, #ffffff 0%, #cbb0ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  UNIVERSAL
                  <br />
                  IDENTITY LAYER
                  <br />
                  FOR WEB3
                </h1>
                
                <p style={{
                  fontSize: '18px',
                  color: '#9ca3af',
                  lineHeight: '1.6',
                  marginBottom: '32px',
                  maxWidth: '480px'
                }}>
                  Build your decentralized identity with AI-powered reputation scoring. 
                  Connect social accounts, mint dynamic NFTs, and unlock the future of Web3 identity.
                </p>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <button 
                    onClick={login}
                    style={{
                      background: 'linear-gradient(135deg, #cbb0ff 0%, #9333ea 100%)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '14px 28px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 24px rgba(203, 176, 255, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(203, 176, 255, 0.6)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 24px rgba(203, 176, 255, 0.4)'
                    }}
                  >
                    Launch App →
                  </button>
                  
                  <button 
                    style={{
                      background: 'transparent',
                      color: '#cbb0ff',
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '14px 28px',
                      borderRadius: '10px',
                      border: '1px solid rgba(203, 176, 255, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(203, 176, 255, 0.6)'
                      e.currentTarget.style.background = 'rgba(203, 176, 255, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(203, 176, 255, 0.3)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    Documentation
                  </button>
                </div>
                
                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: '40px',
                  marginTop: '48px',
                  paddingTop: '48px',
                  borderTop: '1px solid rgba(203, 176, 255, 0.1)'
                }}>
                  <div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#cbb0ff',
                      marginBottom: '4px'
                    }}>10K+</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Active Users</div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#cbb0ff',
                      marginBottom: '4px'
                    }}>50M+</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Transactions</div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#cbb0ff',
                      marginBottom: '4px'
                    }}>100+</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Integrations</div>
                  </div>
                </div>
              </div>
              
              {/* Right - Globe */}
              <div style={{ position: 'relative' }}>
                <Globe />
                {/* Glow effect */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '600px',
                  height: '600px',
                  background: 'radial-gradient(circle, rgba(203, 176, 255, 0.2) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  zIndex: -1
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated user dashboard
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <CustomLoader size={40} color="#3b82f6" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Wallet className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-bold">SuiDentity</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <WalletBadge />
              <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{profile?.username || 'User'}</span>
              </div>
              
              <Button 
                onClick={logout}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Banner */}
        {profileCompletion < 100 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-blue-100">
                  {profileCompletion}% complete - Add more connections to improve your reputation score
                </p>
              </div>
              <Button 
                onClick={() => router.push('/profile/setup')}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Continue Setup
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Reputation Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {profile?.reputation_score || 0}
              </div>
              <p className="text-xs text-gray-400">Credit score style (300-850)</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {socialConnections?.length || 0}
              </div>
              <p className="text-xs text-gray-400">Social platforms</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">SUI Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {isLoadingBalance ? (
                  <CustomLoader size={20} color="#3b82f6" />
                ) : (
                  `${balance?.toFixed(4) || '0'} SUI`
                )}
              </div>
              <p className="text-xs text-gray-400">Wallet balance</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">NFTs Owned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-gray-400">Identity NFTs</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="reputation" className="data-[state=active]:bg-gray-700">
              Reputation
            </TabsTrigger>
            <TabsTrigger value="nfts" className="data-[state=active]:bg-gray-700">
              Identity NFTs
            </TabsTrigger>
            <TabsTrigger value="quests" className="data-[state=active]:bg-gray-700">
              Quests
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-gray-700">
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GitHub Connection */}
              <GitHubConnectionCard 
                onConnect={refreshProfile}
                isConnected={socialConnections?.some(conn => conn.platform === 'github')}
              />
              
              {/* Quick Actions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-400">
                    Get started with essential tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => router.push('/profile/setup')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Connect Social Accounts
                  </Button>
                  
                  <NFTMintingDialog>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Mint Identity NFT
                    </Button>
                  </NFTMintingDialog>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    View Achievements
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Achievements Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuestProgress />
              <AchievementsSummary />
            </div>
          </TabsContent>

          <TabsContent value="reputation">
            <ReputationDashboard />
          </TabsContent>

          <TabsContent value="nfts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NFTMintingCard />
              <NFTSummary />
            </div>
            <NFTDisplay />
          </TabsContent>

          <TabsContent value="quests">
            <QuestSystem />
          </TabsContent>

          <TabsContent value="achievements">
            <Achievements />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}